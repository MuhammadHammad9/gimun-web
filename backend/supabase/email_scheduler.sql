-- ==============================================================================
-- Frequent email-outbox delivery (run once per environment, in the SQL editor)
-- ==============================================================================
-- Vercel Hobby cron runs once a day (vercel.json). Receipts are normally sent
-- straight after each request, but retries and large broadcasts need a worker
-- that runs every few minutes. Supabase can call the protected endpoint itself.
--
-- This is not a migration: it needs the pg_cron and pg_net extensions and the
-- environment's own URL and secret, which must never be committed.
--
-- 1. Dashboard → Database → Extensions: enable pg_cron and pg_net.
-- 2. Replace the two placeholders below, then run this file.
--    <SITE_URL>     e.g. https://gimungiki.org  (no trailing slash)
--    <CRON_SECRET>  the same value as the CRON_SECRET environment variable
-- ==============================================================================

-- Secrets live in Vault, not in the job definition.
select vault.create_secret('<SITE_URL>', 'outbox_site_url');
select vault.create_secret('<CRON_SECRET>', 'outbox_cron_secret');

select cron.schedule(
  'drain-email-outbox',
  '*/2 * * * *',
  $$
  select net.http_get(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'outbox_site_url') || '/api/cron/email-outbox',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'outbox_cron_secret')
    ),
    timeout_milliseconds := 55000
  );
  $$
);

-- Check it is running (status should be 200 after a couple of minutes):
--   select * from cron.job_run_details order by start_time desc limit 5;
--   select status_code, created from net._http_response order by created desc limit 5;
-- Stop it:
--   select cron.unschedule('drain-email-outbox');
