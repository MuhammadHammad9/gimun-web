# GIMUN & GMC 2027 operations runbook

This runbook applies after the production Supabase, Resend, Upstash, and Vercel environments are configured. Never paste secrets into this repository or into issue comments.

## Before launch

1. Apply `supabase/migrations/0001_public_launch.sql` followed by the additive `supabase/migrations/0002_submission_outbox.sql`; confirm the `registrations`, `contact_messages`, `reference_counters`, and `email_outbox` tables/functions exist.
2. Confirm Supabase backups/PITR and a staff export path. Test a restricted export and store it in the approved institutional location.
3. Verify the Resend sending domain, sender address, Secretariat recipients, and receipt delivery to a test inbox.
4. Verify Upstash rate limiting from a protected staging deployment.
5. Configure Vercel preview and production environments, custom-domain HTTPS, deployment protection, and the previous-deployment rollback path.
6. Submit one staging registration for each mode, one contact inquiry, and one clarification inquiry. Confirm the durable submission row and outbox rows, stable reference IDs, cron delivery, retry/idempotency behavior, and privacy handling.
7. Run `npm run validate:launch` and `npm run qa:full` from the release commit.

## Daily registration monitoring

- Review new Supabase rows and export a daily encrypted operational snapshot according to the approved retention policy.
- Review `email_outbox` pending/retry/failed rows alongside Resend delivery, bounce, and failed-send logs. `emailQueued: true` means the durable outbox row exists; it does not mean the provider has delivered the message.
- Review Vercel function errors/latency and Upstash rate-limit errors.
- Keep `content/site.json` registration flags and deadlines aligned with Secretariat decisions; deploy copy changes through the normal protected branch workflow.

## Operational Architecture & Maintenance

### 1. Atomic Reference ID Counters (`next_submission_reference`)
- Reference IDs are generated sequentially (`REG-GIMUN-2027-0001` and `REG-MOOT-2027-0001`) via the atomic PostgreSQL function `next_submission_reference(p_track)`.
- It employs `SELECT ... FOR UPDATE` row locking on `public.reference_counters` to prevent race conditions during high-volume registration spikes.
- **Pre-Launch Counter Reset**: Before opening public registration, reset counters to `1` so the first applicant receives sequence number `0001`:
  ```sql
  UPDATE public.reference_counters
  SET next_value = 1
  WHERE track IN ('gimun', 'moot-cup');
  ```

### 2. Transactional Email Outbox Queue (`email_outbox`)
- Registrations insert an email outbox record with `status = 'pending'`.
- Request handlers never call Resend. The protected Vercel Cron worker (`/api/cron/email-outbox`, scheduled every 5 minutes) claims rows safely and retries transient failures with exponential backoff for up to 24 hours. Uncertain provider responses are marked `needs_review` rather than resent automatically.
- **Monitoring Outbox Health in Supabase Studio**:
  ```sql
  -- Check counts by delivery status
  SELECT status, count(*) 
  FROM public.email_outbox 
  GROUP BY status;

  -- Inspect failed delivery rows
  SELECT id, message_type, to_addresses, subject, attempts, status, retry_until, last_error, created_at
  FROM public.email_outbox 
  WHERE status IN ('failed', 'needs_review')
  ORDER BY created_at DESC
  LIMIT 20;
  ```
- **Manual Retry Dispatch**: After staff review confirms that a failed message was not delivered, requeue only the selected row:
  ```sql
  UPDATE public.email_outbox 
  SET status = 'pending', attempts = 0, next_attempt_at = now(),
      retry_until = now() + interval '24 hours', locked_at = null, locked_by = null
  WHERE id = '<reviewed-outbox-id>'
    AND status IN ('failed', 'needs_review');
  ```

### 3. Delegate Badging & Bench Roster Exports
- Refer to [`supabase/QUERIES_GUIDE.md`](file:///c:/Users/Khaas%20Laptop's/OneDrive%20-%20Higher%20Education%20Commission/Desktop/Sophep/Main%20Website/supabase/QUERIES_GUIDE.md) and [`supabase/useful_queries.sql`](file:///c:/Users/Khaas%20Laptop's/OneDrive%20-%20Higher%20Education%20Commission/Desktop/Sophep/Main%20Website/supabase/useful_queries.sql) for CSV export queries:
  - `public.view_gimun_roster`: Individualized delegate roster with school, delegation size, and contact for badge printing.
  - `public.view_moot_roster`: Team members flattened by role (Lead Counsel, Co-Counsel, Researcher).
  - `public.view_submission_stats`: Real-time breakdown of total participants, delegations, and institutions.

## Incident response

### Database failure

Do not switch production to the memory backend. Disable the affected registration flag in `content/site.json`, publish a contact-channel notice, preserve the error timestamp/request context without logging form data, and restore service only after Supabase health and a staging submission are verified.

### Email delivery failure

Durable persistence remains authoritative. Check the outbox row, Vercel Cron execution, Resend domain/API status, and provider logs. Allow the worker’s retry window to complete; escalate exhausted or uncertain rows for staff review. Do not ask applicants to resubmit unless the database row is absent.

### Spam or abuse burst

Review Upstash counters and Vercel request logs, preserve only the minimum operational metadata, and adjust the managed rate-limit policy if required. Keep honeypot and fill-time checks enabled.

### Bad deployment

1. Pause public registration flags if submissions could be affected.
2. In Vercel, roll back to the last known-good deployment.
3. Verify `/`, `/register`, `/contact`, `/robots.txt`, `/sitemap.xml`, and both API endpoints with a controlled test.
4. Record the incident, affected deployment, database/email state, and follow-up fix before re-enabling flags.

## Event closeout

Close registration in `content/site.json`, export records through the managed provider, apply the approved retention/deletion schedule, publish verified results and gallery assets, and retain the final content/deployment snapshot with the organizing committee.
