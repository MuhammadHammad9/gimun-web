-- Trash and permanent delete. Deleting is two steps: anyone who can edit a
-- section moves an item to Trash, where it can be restored; owners, and admins
-- for their own event, then delete it permanently. Trash empties itself after
-- the days set in Admin settings. A permanent delete leaves one line in the
-- activity log (what, who, when) and none of the content.

do $$ declare t text; begin
  foreach t in array array['content_entries','contact_messages','email_templates','survey_questions','event_archives','media_assets','certificates'] loop
    execute format('alter table public.%I add column deleted_at timestamptz, add column deleted_by uuid references auth.users(id) on delete set null', t);
    execute format('create index %I on public.%I(deleted_at) where deleted_at is not null', t || '_trash_idx', t);
  end loop;
end $$;

-- Permanent deletion: owners, and admins with write access to the section and
-- the record's event. A shared record (no event) needs both events.
create function public.admin_can_purge(p_actor uuid, p_section text, p_event text) returns boolean
language sql stable security invoker set search_path = public as $$
  select exists (select 1 from admin_users where user_id = p_actor and active and role in ('owner', 'admin'))
    and admin_can(p_actor, p_section, true)
    and case when p_event is null then admin_covers_both(p_actor) else admin_can_event(p_actor, p_event) end
$$;

-- What an item in Trash is: its section, event and title. Kinds: content
-- (key: collection, id), inbox, template, survey, archive, media, certificate (key: id).
create function public.trash_target(p_kind text, p_key jsonb, out section text, out event text, out title text, out deleted_at timestamptz)
language plpgsql stable security invoker set search_path = public as $$
begin
  case p_kind
  when 'content' then
    select e.collection, content_event(e.collection, e.data),
      coalesce(e.data->>'title', e.data->>'name', e.data->>'label', e.data->>'question', e.data->>'awardName', e.id), e.deleted_at
      into section, event, title, deleted_at from content_entries e where e.collection = p_key->>'collection' and e.id = p_key->>'id';
  when 'inbox' then select 'inbox', m.event, m.name, m.deleted_at into section, event, title, deleted_at from contact_messages m where m.id = p_key->>'id';
  when 'template' then select 'email', null, t.subject, t.deleted_at into section, event, title, deleted_at from email_templates t where t.id = p_key->>'id';
  when 'survey' then select 'feedback', null, q.label, q.deleted_at into section, event, title, deleted_at from survey_questions q where q.id = (p_key->>'id')::uuid;
  when 'archive' then select 'close-out', null, a.name, a.deleted_at into section, event, title, deleted_at from event_archives a where a.id = (p_key->>'id')::uuid;
  when 'media' then select 'media', null, m.alt, m.deleted_at into section, event, title, deleted_at from media_assets m where m.id = (p_key->>'id')::uuid;
  when 'certificate' then select 'certificates', c.event, c.serial, c.deleted_at into section, event, title, deleted_at from certificates c where c.id = (p_key->>'id')::uuid;
  else raise exception 'Unknown kind of item';
  end case;
  if section is null then raise exception 'This item no longer exists'; end if;
end $$;

create function public.trash_item(p_kind text, p_key jsonb, p_actor uuid) returns void
language plpgsql security definer set search_path = public, pg_temp as $$
declare t record; v integer;
begin
  select * into t from trash_target(p_kind, p_key);
  if not admin_can(p_actor, t.section, true) or not admin_can_event(p_actor, t.event) then raise exception 'You do not have permission for this item'; end if;
  if t.deleted_at is not null then return; end if;
  perform set_config('app.audit_event', coalesce(t.event, ''), true);
  case p_kind
  when 'content' then
    -- Off the website at once: cancel anything scheduled and publish a withdrawal.
    update content_entries set status = 'archived', version = version + 1, updated_at = now(), updated_by = p_actor, deleted_at = now(), deleted_by = p_actor
      where collection = p_key->>'collection' and id = p_key->>'id' returning version into v;
    update content_publications set cancelled_at = now() where collection = p_key->>'collection' and entry_id = p_key->>'id' and effective_at > now() and cancelled_at is null;
    insert into content_publications(collection, entry_id, data, source_version, effective_at, withdrawn, actor)
      select collection, id, data, v, now(), true, p_actor from content_entries where collection = p_key->>'collection' and id = p_key->>'id';
  when 'inbox' then update contact_messages set deleted_at = now(), deleted_by = p_actor where id = p_key->>'id';
  when 'template' then update email_templates set deleted_at = now(), deleted_by = p_actor where id = p_key->>'id';
  when 'survey' then update survey_questions set deleted_at = now(), deleted_by = p_actor, active = false where id = (p_key->>'id')::uuid;
  when 'archive' then update event_archives set deleted_at = now(), deleted_by = p_actor where id = (p_key->>'id')::uuid;
  when 'media' then update media_assets set deleted_at = now(), deleted_by = p_actor where id = (p_key->>'id')::uuid;
  when 'certificate' then update certificates set deleted_at = now(), deleted_by = p_actor where id = (p_key->>'id')::uuid;
  end case;
  insert into audit_log(actor, action, section, entity_id, detail) values (p_actor, case when p_kind = 'certificate' then 'revoke' else 'trash' end, t.section, coalesce(p_key->>'id', ''), jsonb_build_object('kind', p_kind, 'title', t.title));
end $$;

create function public.restore_item(p_kind text, p_key jsonb, p_actor uuid) returns void
language plpgsql security definer set search_path = public, pg_temp as $$
declare t record;
begin
  select * into t from trash_target(p_kind, p_key);
  if not admin_can(p_actor, t.section, true) or not admin_can_event(p_actor, t.event) then raise exception 'You do not have permission for this item'; end if;
  if t.deleted_at is null then return; end if;
  perform set_config('app.audit_event', coalesce(t.event, ''), true);
  case p_kind
  -- Content comes back off the website, to be published again when ready.
  when 'content' then update content_entries set deleted_at = null, deleted_by = null, version = version + 1, updated_at = now() where collection = p_key->>'collection' and id = p_key->>'id';
  when 'inbox' then update contact_messages set deleted_at = null, deleted_by = null where id = p_key->>'id';
  when 'template' then update email_templates set deleted_at = null, deleted_by = null where id = p_key->>'id';
  when 'survey' then update survey_questions set deleted_at = null, deleted_by = null where id = (p_key->>'id')::uuid;
  when 'archive' then update event_archives set deleted_at = null, deleted_by = null where id = (p_key->>'id')::uuid;
  when 'media' then update media_assets set deleted_at = null, deleted_by = null where id = (p_key->>'id')::uuid;
  when 'certificate' then update certificates set deleted_at = null, deleted_by = null where id = (p_key->>'id')::uuid;
  end case;
  insert into audit_log(actor, action, section, entity_id, detail) values (p_actor, case when p_kind = 'certificate' then 'unrevoke' else 'restore' end, t.section, coalesce(p_key->>'id', ''), jsonb_build_object('kind', p_kind, 'title', t.title));
end $$;

-- Deletes one item in Trash for good. No permission check: callers check first.
create function public.purge_item_core(p_kind text, p_key jsonb, p_actor uuid) returns text
language plpgsql security invoker set search_path = public as $$
declare t record; c text := p_key->>'collection'; k text := p_key->>'id'; uses text; slug text; path text;
begin
  select * into t from trash_target(p_kind, p_key);
  if t.deleted_at is null then raise exception 'Move this item to Trash before deleting it permanently'; end if;
  perform set_config('app.audit_event', coalesce(t.event, ''), true);
  case p_kind
  when 'content' then
    -- Refuse while other content still points at it.
    if c = 'resources' then
      select string_agg(coalesce(data->>'name', id), ', ') into uses from content_entries
        where deleted_at is null and ((collection = 'committees' and data->>'backgroundGuideDocId' = k) or (collection = 'moot-categories' and data->>'propositionDocId' = k));
    elsif c = 'navigation' then
      select string_agg(coalesce(data->>'label', id), ', ') into uses from content_entries where collection = 'navigation' and deleted_at is null and data->>'parentId' = k;
    elsif c = 'team-groups' then
      select string_agg(coalesce(data->>'name', id), ', ') into uses from content_entries where collection = 'team' and deleted_at is null and data->>'group' = k;
    elsif c = 'committees' then
      select data->>'slug' into slug from content_entries where collection = c and id = k;
      if exists (select 1 from allocations where committee_slug = slug) or exists (select 1 from country_reservations where committee_slug = slug) then uses := 'country allocations or reservations'; end if;
    end if;
    if uses is not null then raise exception 'Still used by %. Change those first.', uses; end if;
    delete from content_revisions where collection = c and entry_id = k;
    delete from content_publications where collection = c and entry_id = k;
    delete from content_entries where collection = c and id = k;
  when 'inbox' then
    delete from email_outbox where contact_id = k and status <> 'processing';
    delete from contact_messages where id = k;
  when 'template' then delete from email_templates where id = k;
  when 'survey' then delete from survey_questions where id = k::uuid;
  when 'archive' then delete from event_archives where id = k::uuid;
  when 'media' then delete from media_assets where id = k::uuid returning media_assets.path into path;
  when 'certificate' then delete from certificates where id = k::uuid;
  end case;
  -- The tombstone: what was deleted and by whom, without its content.
  insert into audit_log(actor, action, section, entity_id, detail, actor_label)
    values (p_actor, 'delete-permanently', t.section, coalesce(k, ''), jsonb_build_object('kind', p_kind, 'title', t.title), case when p_actor is null then 'Automatic Trash clean-up' end);
  return path;
end $$;

-- Returns the storage path of a deleted media file, for the app to remove.
create function public.purge_item(p_kind text, p_key jsonb, p_actor uuid) returns text
language plpgsql security definer set search_path = public, pg_temp as $$
declare t record;
begin
  select * into t from trash_target(p_kind, p_key);
  if not admin_can_purge(p_actor, t.section, t.event) then raise exception 'Only owners, and admins for their own event, can delete permanently'; end if;
  return purge_item_core(p_kind, p_key, p_actor);
end $$;

-- Items in Trash for longer than p_days, deleted by the scheduler. Items still
-- in use are skipped and stay in Trash. Returns the media paths to remove.
create function public.purge_expired_trash(p_days integer) returns text[]
language plpgsql security definer set search_path = public, pg_temp as $$
declare r record; paths text[] := '{}'; p text; cutoff timestamptz;
begin
  if p_days is null or p_days < 1 then return paths; end if;
  cutoff := now() - make_interval(days => p_days);
  for r in
    select 'content' kind, jsonb_build_object('collection', collection, 'id', id) key from content_entries where deleted_at < cutoff
    union all select 'inbox', jsonb_build_object('id', id) from contact_messages where deleted_at < cutoff
    union all select 'template', jsonb_build_object('id', id) from email_templates where deleted_at < cutoff
    union all select 'survey', jsonb_build_object('id', id) from survey_questions where deleted_at < cutoff
    union all select 'archive', jsonb_build_object('id', id) from event_archives where deleted_at < cutoff
    union all select 'media', jsonb_build_object('id', id) from media_assets where deleted_at < cutoff
    union all select 'certificate', jsonb_build_object('id', id) from certificates where deleted_at < cutoff
  loop
    begin
      p := purge_item_core(r.kind, r.key, null);
      if p is not null then paths := paths || p; end if;
    exception when others then null; -- still in use: it waits in Trash
    end;
  end loop;
  return paths;
end $$;

revoke all on function public.admin_can_purge(uuid, text, text), public.trash_target(text, jsonb), public.purge_item_core(text, jsonb, uuid),
  public.trash_item(text, jsonb, uuid), public.restore_item(text, jsonb, uuid), public.purge_item(text, jsonb, uuid), public.purge_expired_trash(integer)
  from public, anon, authenticated;
revoke execute on function public.purge_item_core(text, jsonb, uuid) from service_role;
grant execute on function public.admin_can_purge(uuid, text, text), public.trash_item(text, jsonb, uuid), public.restore_item(text, jsonb, uuid),
  public.purge_item(text, jsonb, uuid), public.purge_expired_trash(integer) to service_role;

-- Content saved while in Trash would come back through the editor; refuse it.
create function public.refuse_trashed_save() returns trigger language plpgsql set search_path = public as $$
begin
  if old.deleted_at is not null and new.deleted_at is not null and new.data is distinct from old.data then
    raise exception 'This entry is in Trash. Restore it before editing';
  end if;
  return new;
end $$;
create trigger content_entries_trashed before update on public.content_entries for each row execute function public.refuse_trashed_save();
revoke all on function public.refuse_trashed_save() from public, anon, authenticated;
