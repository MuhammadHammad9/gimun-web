# GIMUN & GMC 2027 operations runbook

This runbook applies after the production Supabase, Resend, Upstash, and Vercel environments are configured. Never paste secrets into this repository or into issue comments.

## Before launch

1. Apply `supabase/migrations/0001_public_launch.sql` and confirm the `registrations`, `contact_messages`, and `reference_counters` tables exist.
2. Confirm Supabase backups/PITR and a staff export path. Test a restricted export and store it in the approved institutional location.
3. Verify the Resend sending domain, sender address, Secretariat recipients, and receipt delivery to a test inbox.
4. Verify Upstash rate limiting from a protected staging deployment.
5. Configure Vercel preview and production environments, custom-domain HTTPS, deployment protection, and the previous-deployment rollback path.
6. Submit one staging registration for each mode, one contact inquiry, and one clarification inquiry. Confirm database persistence, stable reference IDs, receipt/notification status, and privacy handling.
7. Run `npm run validate:launch` and `npm run qa:full` from the release commit.

## Daily registration monitoring

- Review new Supabase rows and export a daily encrypted operational snapshot according to the approved retention policy.
- Review Resend delivery, bounce, and failed-send logs. A stored submission with `emailQueued: false` requires a controlled resend from the provider dashboard.
- Review Vercel function errors/latency and Upstash rate-limit errors.
- Keep `content/site.json` registration flags and deadlines aligned with Secretariat decisions; deploy copy changes through the normal protected branch workflow.

## Incident response

### Database failure

Do not switch production to the memory backend. Disable the affected registration flag in `content/site.json`, publish a contact-channel notice, preserve the error timestamp/request context without logging form data, and restore service only after Supabase health and a staging submission are verified.

### Email delivery failure

Durable persistence remains authoritative. Check Resend domain/API status and provider logs, then resend from the managed provider workflow. Do not ask applicants to resubmit unless the database row is absent.

### Spam or abuse burst

Review Upstash counters and Vercel request logs, preserve only the minimum operational metadata, and adjust the managed rate-limit policy if required. Keep honeypot and fill-time checks enabled.

### Bad deployment

1. Pause public registration flags if submissions could be affected.
2. In Vercel, roll back to the last known-good deployment.
3. Verify `/`, `/register`, `/contact`, `/robots.txt`, `/sitemap.xml`, and both API endpoints with a controlled test.
4. Record the incident, affected deployment, database/email state, and follow-up fix before re-enabling flags.

## Event closeout

Close registration in `content/site.json`, export records through the managed provider, apply the approved retention/deletion schedule, publish verified results and gallery assets, and retain the final content/deployment snapshot with the organizing committee.
