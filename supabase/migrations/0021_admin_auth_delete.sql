-- Auth deletes cascade into public.admin_users and clear actor links in the
-- append-only log. Those triggers must be able to run with the migration
-- owner's table privileges when Supabase Auth initiates the delete.
alter function public.keep_an_owner() security definer;
alter function public.keep_an_owner() set search_path = public, pg_temp;
alter function public.audit_admin_tables() security definer;
alter function public.audit_admin_tables() set search_path = public, pg_temp;
alter function public.fill_audit_context() security definer;
alter function public.fill_audit_context() set search_path = public, pg_temp;
alter function public.protect_audit_log() security definer;
alter function public.protect_audit_log() set search_path = public, pg_temp;

-- DELETE has OLD but no NEW. Preserve the removed account's identifier in
-- the automatic audit row as well as in the owner's explicit removal event.
create or replace function public.audit_admin_tables() returns trigger
language plpgsql security definer set search_path = public, pg_temp as $$
declare v_row jsonb := case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end;
begin
  insert into audit_log(action, section, entity_id)
    values (tg_op, tg_table_name, coalesce(v_row->>'user_id', v_row->>'id'));
  return coalesce(new, old);
end $$;
revoke all on function public.audit_admin_tables() from public, anon, authenticated;
