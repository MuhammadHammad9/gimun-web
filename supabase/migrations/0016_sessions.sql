-- Admin accounts: end every session of an account, and never lose the last owner.

-- Owners can sign any admin out everywhere; anyone can sign themselves out.
-- Deleting the sessions also revokes their refresh tokens, and the admin
-- pages check the session with the auth server on every request.
create function public.admin_end_sessions(p_actor uuid, p_user uuid) returns integer
language plpgsql security definer set search_path = public, pg_temp as $$
declare n integer;
begin
  if p_actor is distinct from p_user and not admin_can(p_actor, 'users', true) then raise exception 'Only an owner can sign other admins out'; end if;
  delete from auth.sessions where user_id = p_user;
  get diagnostics n = row_count;
  insert into audit_log(actor, action, section, entity_id, detail) values (p_actor, 'sign-out-everywhere', 'security', p_user::text, jsonb_build_object('sessions', n));
  return n;
end $$;
revoke all on function public.admin_end_sessions(uuid, uuid) from public, anon, authenticated;
grant execute on function public.admin_end_sessions(uuid, uuid) to service_role;

-- However an account is changed or removed (the app, a script, the dashboard),
-- at least one active owner remains to manage the others.
create function public.keep_an_owner() returns trigger language plpgsql set search_path = public as $$
begin
  if old.role = 'owner' and old.active and (tg_op = 'DELETE' or new.role <> 'owner' or not new.active)
     and not exists (select 1 from admin_users where role = 'owner' and active and user_id <> old.user_id) then
    raise exception 'Keep at least one active owner';
  end if;
  return coalesce(new, old);
end $$;
create trigger admin_users_keep_owner before update or delete on public.admin_users for each row execute function public.keep_an_owner();
revoke all on function public.keep_an_owner() from public, anon, authenticated;
