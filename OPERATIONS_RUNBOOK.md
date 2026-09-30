# Operations runbook

## Configure a staging environment first

1. Use Node 24 and install with `npm ci`. Copy `.env.example`; supply the public site origin, Supabase URL/publishable key, server secret key, Upstash credentials, independent HMAC/cron secrets and verified Resend sender/key. Legacy environment aliases are supported; prefer the names in the example.
2. Back up the target project. Apply all `supabase/migrations/*.sql` in numeric order using your controlled Supabase migration workflow. Migration 0002's invalid function signature is corrected. If a project already has migrations, inspect its applied history before changing anything. Do not replay destructive SQL blindly.
For a legacy project with only migration 0001 applied, `supabase/harden_legacy_access.sql` can revoke public allocator/view access independently of migration 0002. Run it as the migration owner before continuing the full upgrade.

3. Disable unsolicited Auth signups for the admin-only login use case. Configure the project's allowed website URLs. Apply the private grants/RLS and media bucket migration before exposing the browser publishable key.
4. Run `npm run content:seed`. This inserts missing settings/entries and preserves existing CMS edits. Review seed facts and replace placeholder assets before launch.
5. Set `ADMIN_OWNER_EMAIL` and `ADMIN_OWNER_TEMP_PASSWORD` in your shell and run `npm run admin:owner`. Use a 12+ character temporary password, transmit it through your approved channel and clear the shell variables. The script refuses to create another owner if an active owner exists. A partially created Auth account must be repaired explicitly using the reported user ID.
6. Sign in at `/admin`, change the password, then create appropriately scoped team accounts. Owner-only user management supports temporary password resets; existing email changes must first follow the provider's Auth workflow. Deactivation is checked by the server on every protected operation.
7. Configure the Vercel environment and verified domain, deploy through your normal review process, and perform a staging registration, inbox, Auth, upload, QR-camera and email smoke test. No live deployment or provider setup is implied by local tests.

Never print or commit credentials. This workspace is inside OneDrive: confirm that local environment files, CSV exports and backups are not shared or synchronized to an unauthorized account. `.gitignore` does not control cloud sync.

## Email delivery

Registration/contact storage and their outbox rows commit atomically. Registration retries use a stable request key; reuse with different payload is rejected. Applicant QR is a server-generated PNG attachment with `content_id=ticket`, matching the token returned to the browser.

Public routes schedule a bounded dispatcher with Next `after()`. Admin broadcasts/post-event sends and cron use a bounded drain. Cron is `0 3 * * *` UTC for Vercel Hobby compatibility. Daily cron is only a safety net: it cannot provide timely retries or drain an arbitrarily large campaign. Use **Email → Process due messages** and check pending/retry/failed/review counts, especially during the event. For unattended delivery, run `supabase/email_scheduler.sql` once per environment: it uses pg_cron and pg_net to call the protected endpoint every two minutes with secrets held in Vault. Messages now stay retryable for 72 hours (migration 0011), so even the daily cron gets at least two attempts.

Registration pages offer **Send invoice** (PDF built from amount due, amount paid and **Settings → paymentInstructions**) and **Resend receipt & QR ticket** (the original receipt, sent to the current contact email). Set **Settings → feeAmounts** to the numeric fees; the display text in `fees` is not used for arithmetic.

## Admin security

- Enable TOTP MFA in Supabase Auth. Admins enrol from **Two-factor** in the admin header; set `ADMIN_REQUIRE_MFA=1` to make enrolment mandatory before any admin page loads.
- Changing a password requires the current password and signs out the account's other sessions.
- The database enforces section permissions itself (`admin_can`, migration 0011), and every CSV export writes an audit-log row. Read-only viewers cannot export.
- `/api/health` returns 200 when configuration is complete, the CMS is reachable and the database has migration 0011 (`schema: "outdated"` means migrations are behind the code); point an uptime monitor at it. `outbox: "delayed"` means an email has waited more than 30 minutes past its due time: no worker is draining the queue, so run `supabase/email_scheduler.sql` (GO_LIVE.md) or check its job in `cron.job_run_details`. The answer is reused for 10 seconds.

## How the backend degrades

- **Supabase slow or down:** public pages keep serving the last good content from cache; a cold cache serves the bundled content. Forms answer "temporarily unavailable" (503) and the visitor's draft and submission key are kept, so retrying later cannot double-register.
- **Upstash down:** rate limiting falls back to per-server limits and logs `[RateLimit]`; registration keeps working.
- **Resend down or rate-limited:** messages stay in the outbox and retry with backoff for 72 hours. Check **Email** for failed or needs-review rows.
- **A malformed CMS entry:** that entry is skipped and logged `[CMS] Skipping invalid …`; the rest of the collection still shows. Invalid saved settings fall back field by field to the bundled defaults.
- **Missing configuration at runtime:** logged as `[Configuration]`, never shown to visitors; `/api/health` reports it. Production builds refuse to deploy with it (see `scripts/check-env.mjs`).
- **Certificate batches:** a participant whose name the certificate font cannot print, or who has no valid email, is skipped and named in the result; everyone else's certificate is still sent.

Provider requests use the outbox ID as the idempotency key. Stored payloads must not be edited during retry. Timeout/uncertain responses and concurrent-key HTTP 409 responses can retry within the bounded window; a different-payload conflict fails. If the provider accepted mail but the database acknowledgement failed, the lease remains for safe recovery. A legacy attempted row without a recorded sender requires manual review. Never reset a key/window just to force a resend: first verify the provider outcome.

References: [Next after](https://nextjs.org/docs/app/api-reference/functions/after), [Resend idempotency](https://resend.com/changelog/idempotency-keys), [Resend CID attachments](https://resend.com/changelog/embed-images-using-cid), [Vercel cron limits](https://vercel.com/docs/cron-jobs/usage-and-pricing). Use the installed Next docs for version-specific APIs.

## Monitor and recover

Check the dashboard for database fallback and outbox failures. Database errors never become successful admin saves. Server logs report configuration key names, not secret values. Confirm server and browser Supabase URLs point to the same project. The public cache normally refreshes every 60 seconds; admin saves invalidate the relevant tags immediately. Export CMS content regularly with `npm run content:export` and retain provider database/storage backups under the institution's policy. Exported published arrays include publication state in a companion file; review scheduling before adopting a snapshot as seed data.

For a bad public edit, restore a revision. For a bad deployment, roll back the application deployment while preserving the database; use tested forward migrations for schema repair. During a provider outage, public seed content can be shown, but it may be older than the CMS. Keep emergency fallback seed content current through reviewed exports.

A failed registration response after an uncertain network result should be retried with the original submission key. Do not manually allocate another reference. Do not reset counters while records exist; `guarded_counter_reset` refuses that state. Identify test records by an explicit reviewed list of references, never by broad name/email substring matches.

## Close-out and retention

Export registrations/payments, participant roster and inbox; archive content/settings; close registration. Run the owner retention dry run using an approved cutoff/policy/legal basis/privacy contact. Review counts and backup scope before confirmation. The cleanup revokes affected certificate/survey links, anonymizes records, removes related email content and strips sensitive operational audit details while preserving action/actor/time. It does not remove public award/gallery content or media assets. Review public content and provider backups separately under the approved policy.

## Local verification boundaries

`npm run test:migrations` executes PostgreSQL SQL in PGlite with local stubs for Supabase-owned schemas. `npm run test:admin` uses that database behind a local PostgREST/Auth protocol fixture and disables Resend. This verifies application behavior, not real Supabase Auth/Storage, network concurrency across multiple database connections, Resend inbox delivery or physical camera scanning. Those checks remain staging acceptance work. See [VERIFICATION.md](VERIFICATION.md).
