-- Page copy: every heading, lead and list on the public pages becomes an
-- editable `copy` entry (one per page section), published through the same
-- release pipeline as the other collections.

-- --- Allow the new collection --------------------------------------------------
do $$
declare c text;
begin
  for c in
    select con.conname from pg_constraint con
    where con.conrelid = 'public.content_entries'::regclass and con.contype = 'c'
      and pg_get_constraintdef(con.oid) like '%collection%'
  loop
    execute format('alter table public.content_entries drop constraint %I', c);
  end loop;
end $$;
alter table public.content_entries add constraint content_entries_collection_check
  check (collection in ('announcements','schedule','committees','moot-categories','resources','faq','team','sponsors','gallery','clarifications','results','navigation','copy'));

-- --- Editors may edit page copy -----------------------------------------------
create or replace function public.admin_can(p_actor uuid, p_section text, p_write boolean)
returns boolean language plpgsql stable security invoker set search_path = public as $$
declare u admin_users;
begin
  select * into u from admin_users where user_id = p_actor and active;
  if not found then return false; end if;
  if u.role = 'owner' then return true; end if;
  if p_section in ('users', 'close-out') then return false; end if;
  if p_write and u.role = 'viewer' then return false; end if;
  if cardinality(u.sections) > 0 then return p_section = any(u.sections); end if;
  return case u.role
    when 'admin' then true
    when 'editor' then p_section in ('announcements','schedule','committees','moot-categories','resources','faq','team','sponsors','gallery','clarifications','results','navigation','copy','media')
    when 'registrar' then p_section in ('registrations','inbox','email','event-day','allocations','certificates','feedback')
    when 'checkin' then p_section = 'event-day'
    when 'viewer' then p_section not in ('audit','email')
    else false
  end;
end $$;
revoke all on function public.admin_can(uuid, text, boolean) from public, anon, authenticated;
grant execute on function public.admin_can(uuid, text, boolean) to service_role;
