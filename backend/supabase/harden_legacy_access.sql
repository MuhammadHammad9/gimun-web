-- Standalone protection for a project that has only migration 0001 applied.
-- Run as the migration owner. This does not depend on the outbox migration.
-- The normal full upgrade also applies these protections in migration 0003.
begin;
revoke execute on function public.next_submission_reference(text) from public, anon, authenticated;
grant execute on function public.next_submission_reference(text) to service_role;
alter view public.view_gimun_roster set (security_invoker=true);
alter view public.view_moot_roster set (security_invoker=true);
alter view public.view_submission_stats set (security_invoker=true);
revoke all on public.view_gimun_roster, public.view_moot_roster, public.view_submission_stats from public, anon, authenticated;
alter default privileges in schema public revoke all on tables from anon, authenticated;
alter default privileges in schema public revoke execute on functions from public, anon, authenticated;
commit;
