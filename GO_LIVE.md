# Go-live guide

Steps to take the site from this repository to a live, working deployment. Each step needs an account owner; nothing here is automated from the repo. Do everything first for a **staging** environment, test it (section 8), then repeat for **production**.

Time needed: about half a day, plus DNS propagation.

## 1. Supabase (database, admin sign-in, file storage)

1. Create a project at supabase.com. Use a paid plan for production: the free tier pauses when idle and has no point-in-time recovery.
2. **SQL editor:** run `supabase/migrations/0001_public_launch.sql`, then `supabase/harden_legacy_access.sql`, then the remaining migrations in order (`0002` … `0011`). This is the order the migration tests use.
3. **Authentication → Providers:** turn off public sign-ups. **Authentication → Multi-factor:** enable TOTP.
4. **Authentication → URL configuration:** Site URL = your domain; add `https://<domain>/admin/**` as a redirect URL.
5. **Project settings → API:** copy the project URL, the publishable key and the secret key (for step 4).
6. Seed content and create the first owner (from your machine, with the env vars from step 4 set):
   ```bash
   npm run content:seed
   ADMIN_OWNER_EMAIL=you@example.org ADMIN_OWNER_TEMP_PASSWORD='a-long-temporary-password' npm run admin:owner
   ```
7. Check that the public cannot read private tables. This should return an error or `[]`:
   ```bash
   curl "https://<project>.supabase.co/rest/v1/registrations?select=*" -H "apikey: <publishable key>"
   ```

## 2. Resend (email)

1. Add and verify your sending domain (SPF, DKIM and a DMARC record at your DNS host).
2. Create an API key. Choose a plan whose daily limit covers receipts plus your largest broadcast.

## 3. Upstash (rate limiting)

Create a Redis database and copy its REST URL and REST token.

## 4. Vercel (hosting)

1. Import the repository. Framework: Next.js (from `vercel.json`). Use a Pro team for the event: Vercel's Hobby plan is for non-commercial use and has lower limits.
2. **Settings → Environment Variables.** Set these separately for Production and for Preview, and point Preview at the **staging** Supabase project so preview deployments never touch real data:

| Variable | Value |
|---|---|
| `SITE_URL` | `https://<your domain>` |
| `SUBMISSIONS_BACKEND` | `supabase` |
| `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_URL` | Supabase project URL (both the same) |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable key |
| `SUPABASE_SECRET_KEY` | Supabase secret key |
| `RESEND_API_KEY` | Resend key |
| `EMAIL_FROM` | e.g. `GIMUN & GMC <registrations@yourdomain>` on the verified domain |
| `NOTIFICATION_EMAIL` | Organizer inbox(es), comma-separated |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | From Upstash |
| `RATE_LIMIT_HMAC_SECRET`, `CRON_SECRET` | Two different random values: `openssl rand -hex 32` |
| `ADMIN_REQUIRE_MFA` | `1` (every admin must set up two-factor sign-in) |
| `ANALYTICS_MEASUREMENT_ID` | Optional GA4 ID; loads only after visitor consent |

   `scripts/check-env.mjs` runs before every Vercel build. A **production** build with a missing, malformed or mismatched variable fails and lists the problems, so the live site is never replaced by one that cannot take registrations. Preview builds only warn. To test a set of values locally: `npm run check:env -- --strict`.
3. **Settings → Domains:** add the domain and follow the DNS instructions. HTTPS is automatic.

## 5. Email delivery schedule

Vercel's free cron runs once a day. For timely retries and large broadcasts, open the Supabase SQL editor, enable the `pg_cron` and `pg_net` extensions, fill in the two placeholders in `supabase/email_scheduler.sql` and run it. It calls the protected delivery endpoint every two minutes.

## 6. Settings to fill in (Admin → Settings)

- `feeAmounts` (numbers used on invoices) and `paymentInstructions` (bank details).
- `contactPhone`, `socialLinks`, `stats` and `privacyNotice` (the institution's approved text).
- Confirm or correct every item in `CONTENT_SIGNOFF.md`.
- Upload approved media and PDFs (Admin → Media), then link them from the content entries.

## 7. Staff accounts

Sign in as the owner, change the temporary password and set up two-factor. Then create one account per person under **Users**, with the narrowest role: `registrar` for application review, `checkin` for door staff, `editor` for content.

## 8. Staging test (do not skip)

- [ ] Register once on each track: individual, delegation and moot team. The receipt with the QR ticket arrives, and the organizer notification lists the roster.
- [ ] Send a contact message and a clarification question. The question shows **Publish clarification** in the admin inbox.
- [ ] Accept a registration, send an invoice, mark it paid.
- [ ] Scan the QR ticket on a phone at **Event day**, check the attendee in.
- [ ] Allocate a country, issue and email a certificate, open its `/verify` link and PDF.
- [ ] Send the survey to one participant and submit it.
- [ ] Export each CSV and confirm the export appears in **Audit**.
- [ ] Broadcast to the test audience only.
- [ ] Post an emergency schedule change and restore a previous content revision.
- [ ] `https://<domain>/api/health` returns `{"ok":true}`; add it to an uptime monitor. For the breakdown, send `Authorization: Bearer <CRON_SECRET>`.

## 9. Launch

1. `npm run validate:launch` passes (real documents and media approved).
2. Merge to `main`; CI runs the full QA suite and the Lighthouse release gate.
3. Open registration in **Settings → registrationStatus** when ready.

## During the event

Check **Email** daily for failed or needs-review messages, keep an eye on `/api/health`, and export data regularly. After the event, follow "Close-out and retention" in `OPERATIONS_RUNBOOK.md`.
