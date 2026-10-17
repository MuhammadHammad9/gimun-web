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

### Who sees what

- Each admin has a **job** (owner, admin, content editor, registrar, check-in staff, viewer) and **events** (GIMUN, GMC or both), set in **Admin accounts**. An admin of one event sees only that event's records, messages, emails, exports and dashboard counts; shared website content (team, FAQ, page text…) is open to editors of either event. Site settings need both events. Records outside an admin's events answer as if they did not exist, and the database refuses writes to them (migration 0015).
- Owners manage **Admin accounts** and **Admin settings**: which tools are switched on (Registrations & payments is off while registration runs on Google Forms; its data is kept) and how long Trash keeps items.
- The database always keeps at least one active owner (migration 0016).

### Deleting

- Anyone who can edit a section moves items to **Trash** (with Undo) and can restore them. Website content in Trash is off the website at once.
- **Delete permanently** (in Trash) is for owners, and for admins on records of their own event; a shared record needs both events. It asks for a fresh authenticator code and the item's name typed. The activity log keeps one line (what, who, when) and none of the content.
- Trash empties itself after the days in Admin settings (default 30; 0 = never), on the email scheduler's run. Items still used elsewhere (a document a committee links to, a team category with members, a committee with allocations) are never deleted; change those first.
- Revoking a certificate (Certificates › Revoke) makes its verification page say so and stops its PDF download; un-revoke from Trash.
- Archive snapshots (Archive & retention) contain copies of content as it was; deleting an entry does not change snapshots taken before.

### Sessions and two-step sign-in

- Admin sessions end after `ADMIN_IDLE_MINUTES` without activity (default 30) and `ADMIN_SESSION_HOURS` after sign-in (default 12). The page warns two minutes before an idle sign-out; typing counts as activity. Session cookies are httpOnly.
- Risky actions (permanent delete, emptying Trash, admin accounts, admin settings) ask for a code from an authenticator app made within the last 15 minutes. **Every owner and admin who deletes must enrol first** at **My account › Two-step sign-in**. Normal sign-in still works without it (see below).
- A lost phone: an owner opens **Admin accounts › Manage › Reset two-step sign-in**; the admin enrols again after signing in.
- **Sign out everywhere** (My account, or Admin accounts for an owner) ends every session of that account.
- Sign-ins, failed sign-ins, sign-outs, password and two-step changes appear in the **Activity log** under "Sign-in & security". Owners can export the log as CSV.

### Settings outside the code

- Enable TOTP MFA in Supabase Auth. Admins enrol from **Two-factor** in the admin header; `ADMIN_REQUIRE_MFA=1` makes enrolment mandatory before any admin page loads. It is currently off by decision (2026-10-02): enrolment is optional and builds only warn. Turn it on once every admin has enrolled; before that, confirm TOTP is enabled under Authentication → Multi-Factor, or admins without an authenticator are locked out.
- Supabase Auth settings the code cannot enforce (Dashboard → Authentication): turn **off** "Allow new users to sign up" (admins are created from **Admin accounts**), turn **on** leaked-password protection, set the minimum password length to 12, and (if your plan offers them) a session time-box and inactivity timeout no longer than the admin's own limits above.
- Google Analytics: in the GA4 data stream's enhanced measurement, turn **off** "Page changes based on browser history events". The site sends its own page views and never for `/admin`, `/survey/…` or `/verify/…`, whose addresses carry private tokens; the automatic setting would report them.
- Hosting outside Vercel: rate limits read the visitor's address from `X-Forwarded-For`, counting `TRUSTED_PROXY_HOPS` entries from the right (default 1, for one reverse proxy that appends the address it saw). `X-Real-IP` is trusted only on Vercel.
- Changing a password requires the current password and signs out the account's other sessions.
- The database enforces section permissions (`admin_can`, migration 0011) and event scope (migration 0015) itself, and every CSV export writes an audit-log row. Read-only viewers cannot export. The audit log cannot be edited or deleted, even with the service key.
- `/api/health` returns 200 when configuration is complete, the CMS is reachable, the database has migration 0012 and the shared rate limiter (Upstash) answers; otherwise 503. Point an uptime monitor at it. Anonymous callers see only `{"ok":…}`; send `Authorization: Bearer $CRON_SECRET` to see each part: `schema: "outdated"` means migrations are behind the code, `rateLimit: "degraded"` means Upstash is unreachable and each server instance is limiting on its own (almost no protection). `outbox: "delayed"` means an email has waited more than 30 minutes past its due time: no worker is draining the queue, so run `supabase/email_scheduler.sql` (GO_LIVE.md) or check its job in `cron.job_run_details`. The answer is reused for 10 seconds.

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
