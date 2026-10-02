-- Private CMS. Apply with the migration owner; browsers never access these tables.
alter default privileges in schema public revoke all on tables from anon, authenticated;
alter default privileges in schema public revoke execute on functions from public, anon, authenticated;
revoke execute on function public.next_submission_reference(text) from public, anon, authenticated;
do $$ declare v record; begin
  for v in select viewname from pg_views where schemaname='public' and viewname like 'view_%' loop
    execute format('alter view public.%I set (security_invoker=true)', v.viewname);
    execute format('revoke all on public.%I from anon, authenticated', v.viewname);
  end loop;
end $$;

create table public.admin_users (
  user_id uuid primary key references auth.users(id), email text not null, display_name text not null,
  role text not null check(role in ('owner','admin','editor','registrar','checkin','viewer')),
  sections text[] not null default '{}', active boolean not null default true,
  must_change_password boolean not null default true, created_at timestamptz not null default now()
);
create table public.site_settings (id text primary key check(id='site'), data jsonb not null, version integer not null default 1, updated_at timestamptz not null default now());
create table public.content_entries (
  collection text not null check(collection in ('announcements','schedule','committees','moot-categories','resources','faq','team','sponsors','gallery','clarifications','results','navigation')),
  id text not null, status text not null check(status in ('draft','published','archived')), sort_order integer not null default 0,
  publish_at timestamptz, expire_at timestamptz, data jsonb not null, updated_by uuid references auth.users(id),
  updated_at timestamptz not null default now(), version integer not null default 1,
  primary key(collection,id), check(expire_at is null or publish_at is null or expire_at > publish_at)
);
create unique index one_pinned_announcement on public.content_entries ((data->>'pinnedFlag')) where collection='announcements' and status='published' and data->>'pinnedFlag'='true';
create index content_public_idx on public.content_entries(collection,status,sort_order);
create table public.content_revisions (id bigint generated always as identity primary key, collection text not null, entry_id text not null, snapshot jsonb not null, actor uuid references auth.users(id), created_at timestamptz not null default now());
create table public.audit_log (id bigint generated always as identity primary key, actor uuid references auth.users(id), action text not null, section text not null, entity_id text, detail jsonb not null default '{}', created_at timestamptz not null default now());
create table public.media_assets (id uuid primary key default gen_random_uuid(), path text unique not null, mime text not null, size bigint not null, alt text not null, uploaded_by uuid references auth.users(id), created_at timestamptz not null default now());
create table public.email_templates (id text primary key, subject text not null, body text not null, updated_at timestamptz not null default now());

-- Version check, revision, content and audit are one transaction.
create function public.save_content(p_entry jsonb, p_actor uuid) returns void language plpgsql security invoker set search_path=public as $$
declare previous jsonb; c text := p_entry->>'collection'; k text := p_entry->>'id'; expected integer := (p_entry->>'version')::integer;
begin
  perform pg_advisory_xact_lock(hashtextextended(c || ':' || k, 0));
  if c='site' then
    select to_jsonb(s) into previous from site_settings s where id='site' for update;
  else
    select to_jsonb(e) into previous from content_entries e where collection=c and id=k for update;
  end if;
  if coalesce((previous->>'version')::integer,0) <> expected then raise exception 'This entry changed. Reload before saving.'; end if;
  if previous is not null then insert into content_revisions(collection,entry_id,snapshot,actor) values(c,k,previous,p_actor); end if;
  if c='site' then
    insert into site_settings(id,data,version) values('site',p_entry->'data',expected+1)
    on conflict(id) do update set data=excluded.data,version=excluded.version,updated_at=now();
  else
    insert into content_entries(collection,id,status,sort_order,publish_at,expire_at,data,updated_by,version)
    values(c,k,p_entry->>'status',(p_entry->>'sort_order')::integer,(p_entry->>'publish_at')::timestamptz,(p_entry->>'expire_at')::timestamptz,p_entry->'data',p_actor,expected+1)
    on conflict(collection,id) do update set status=excluded.status,sort_order=excluded.sort_order,publish_at=excluded.publish_at,expire_at=excluded.expire_at,data=excluded.data,updated_by=p_actor,updated_at=now(),version=excluded.version;
  end if;
  insert into audit_log(actor,action,section,entity_id) values(p_actor,'save',c,k);
end $$;

do $$ declare t text; begin
  foreach t in array array['admin_users','site_settings','content_entries','content_revisions','audit_log','media_assets','email_templates'] loop
    execute format('alter table public.%I enable row level security',t);
    execute format('revoke all on public.%I from public, anon, authenticated',t);
    execute format('grant all on public.%I to service_role',t);
  end loop;
end $$;
grant usage, select on all sequences in schema public to service_role;
revoke all on function public.save_content(jsonb,uuid) from public,anon,authenticated;
grant execute on function public.save_content(jsonb,uuid) to service_role;
