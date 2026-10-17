-- The activity log says what a content save changed: the fields, the status
-- it was saved with, and the entry's title. Nothing else changes.

create or replace function public.save_content(p_entry jsonb, p_actor uuid) returns void
language plpgsql security definer set search_path = public, pg_temp as $$
declare c text := p_entry->>'collection'; v_event text; old_data jsonb; changed jsonb;
begin
  if c = 'site' then
    if not admin_covers_both(p_actor) then raise exception 'Site settings cover both events; only an admin with access to both can change them'; end if;
    select data into old_data from site_settings where id = 'site';
  else
    v_event := content_event(c, p_entry->'data');
    select data into old_data from content_entries where collection = c and id = p_entry->>'id';
    -- Both the stored and the new version must be in scope, so an entry cannot be moved out of (or into) another event.
    if not admin_can_event(p_actor, v_event) or (old_data is not null and not admin_can_event(p_actor, content_event(c, old_data))) then
      raise exception 'This entry belongs to an event outside your access';
    end if;
  end if;
  select coalesce(jsonb_agg(key order by key), '[]'::jsonb) into changed
    from (select coalesce(n.key, o.key) as key from jsonb_each(coalesce(p_entry->'data', '{}'::jsonb)) n
          full join jsonb_each(coalesce(old_data, '{}'::jsonb)) o on o.key = n.key
          where n.value is distinct from o.value) diff;
  perform set_config('app.audit_event', coalesce(v_event, ''), true);
  perform set_config('app.audit_detail', jsonb_build_object(
    'status', p_entry->>'status',
    'title', coalesce(p_entry#>>'{data,title}', p_entry#>>'{data,name}', p_entry#>>'{data,label}', p_entry#>>'{data,question}'),
    'changed', changed,
    'new', old_data is null)::text, true);
  perform save_content_unscoped(p_entry, p_actor);
  perform set_config('app.audit_detail', '', true);
end $$;
revoke all on function public.save_content(jsonb, uuid) from public, anon, authenticated;
grant execute on function public.save_content(jsonb, uuid) to service_role;

create or replace function public.fill_audit_context() returns trigger language plpgsql set search_path = public as $$
begin
  if new.actor_label is null and new.actor is not null then
    select coalesce(nullif(display_name, ''), email) into new.actor_label from admin_users where user_id = new.actor;
  end if;
  if new.event is null then new.event := nullif(current_setting('app.audit_event', true), ''); end if;
  if new.event is null and new.entity_id like 'REG-GIMUN-%' then new.event := 'gimun';
  elsif new.event is null and new.entity_id like 'REG-MOOT-%' then new.event := 'moot-cup'; end if;
  if new.action = 'save' and new.detail = '{}'::jsonb and coalesce(current_setting('app.audit_detail', true), '') <> '' then
    new.detail := current_setting('app.audit_detail', true)::jsonb;
  end if;
  return new;
end $$;
