-- Access by job and event. Every admin keeps a job (role) and now also an
-- event scope: GIMUN, GMC or both. Records that belong to one event carry it
-- in an `event` column, and every privileged write checks the actor's scope
-- in the database as well as in the app. Additive: existing admins keep both
-- events, so code written before this migration behaves exactly as before.

-- --- Admin event scope -----------------------------------------------------------
alter table public.admin_users add column events text[] not null default '{gimun,moot-cup}';
alter table public.admin_users add constraint admin_users_events_check
  check (cardinality(events) between 1 and 2 and events <@ array['gimun','moot-cup']::text[]);

create function public.admin_events(p_actor uuid) returns text[]
language sql stable security invoker set search_path = public as $$
  select case when role = 'owner' then array['gimun','moot-cup']::text[] else events end
  from public.admin_users where user_id = p_actor and active
$$;
-- A null event is shared (both events' website content, templates, survey questions).
create function public.admin_can_event(p_actor uuid, p_event text) returns boolean
language sql stable security invoker set search_path = public as $$
  select p_event is null or p_event = any(coalesce(public.admin_events(p_actor), '{}'::text[]))
$$;
create function public.admin_covers_both(p_actor uuid) returns boolean
language sql stable security invoker set search_path = public as $$
  select coalesce(public.admin_events(p_actor) @> array['gimun','moot-cup']::text[], false)
$$;
-- Which event a content entry belongs to: committees are GIMUN, case categories
-- and clarifications are GMC, entries with a track follow it, the rest are shared.
create function public.content_event(p_collection text, p_data jsonb) returns text
language sql immutable security invoker set search_path = public as $$
  select case
    when p_collection = 'committees' then 'gimun'
    when p_collection in ('moot-categories', 'clarifications') then 'moot-cup'
    when p_data->>'track' in ('gimun', 'moot-cup') then p_data->>'track'
  end
$$;

-- --- The event each record belongs to ------------------------------------------
-- References encode their track (REG-GIMUN-…, REG-MOOT-…); inquiries carry it as
-- their category. Generated columns keep these in step with no extra writes.
alter table public.participants add column event text generated always as (
  case when registration_ref like 'REG-GIMUN-%' then 'gimun' when registration_ref like 'REG-MOOT-%' then 'moot-cup' end
) stored;
alter table public.contact_messages add column event text generated always as (
  case query_type when 'gimun' then 'gimun' when 'moot-cup' then 'moot-cup' end
) stored;
alter table public.certificates add column event text;
alter table public.survey_responses add column event text;
alter table public.email_outbox add column event text check (event in ('gimun', 'moot-cup'));
alter table public.audit_log add column event text, add column actor_label text;
create index participants_event_idx on public.participants(event);
create index contact_messages_event_idx on public.contact_messages(event);
create index certificates_event_idx on public.certificates(event);
create index email_outbox_event_idx on public.email_outbox(event);
create index audit_log_event_idx on public.audit_log(event, id desc);

update public.certificates c set event = p.event from public.participants p where p.id = c.participant_id;
update public.survey_responses s set event = p.event from public.participants p where p.id = s.participant_id;
update public.email_outbox o set event = coalesce(
  (select r.track from public.registrations r where r.reference_id = o.reference_id),
  (select m.event from public.contact_messages m where m.id = o.contact_id));
update public.audit_log a set actor_label = coalesce(nullif(u.display_name, ''), u.email) from public.admin_users u where u.user_id = a.actor;
update public.audit_log set event = case when entity_id like 'REG-GIMUN-%' then 'gimun' else 'moot-cup' end
  where entity_id like 'REG-GIMUN-%' or entity_id like 'REG-MOOT-%';
update public.audit_log a set event = p.event from public.participants p where a.event is null and a.entity_id = p.id::text;
update public.audit_log a set event = m.event from public.contact_messages m where a.event is null and a.section = 'inbox' and a.entity_id = m.id;
update public.audit_log set event = 'gimun' where event is null and section in ('committees', 'allocations');
update public.audit_log set event = 'moot-cup' where event is null and section in ('moot-categories', 'clarifications');

create function public.fill_event_from_participant() returns trigger language plpgsql set search_path = public as $$
begin
  if new.event is null then select event into new.event from participants where id = new.participant_id; end if;
  return new;
end $$;
create trigger certificates_event before insert on public.certificates for each row execute function public.fill_event_from_participant();
create trigger survey_responses_event before insert on public.survey_responses for each row execute function public.fill_event_from_participant();

-- Mail about a registration or an inquiry takes its event from that record;
-- broadcasts take the event the guarded operation set for this transaction.
create function public.fill_outbox_event() returns trigger language plpgsql set search_path = public as $$
begin
  if new.event is null and new.reference_id is not null then select track into new.event from registrations where reference_id = new.reference_id; end if;
  if new.event is null and new.contact_id is not null then select event into new.event from contact_messages where id = new.contact_id; end if;
  if new.event is null then new.event := nullif(current_setting('app.outbox_event', true), ''); end if;
  return new;
end $$;
create trigger email_outbox_event before insert on public.email_outbox for each row execute function public.fill_outbox_event();

-- Every audit row names who acted (kept even after the account is removed) and,
-- when known, the event it concerns.
create function public.fill_audit_context() returns trigger language plpgsql set search_path = public as $$
begin
  if new.actor_label is null and new.actor is not null then
    select coalesce(nullif(display_name, ''), email) into new.actor_label from admin_users where user_id = new.actor;
  end if;
  if new.event is null then new.event := nullif(current_setting('app.audit_event', true), ''); end if;
  if new.event is null and new.entity_id like 'REG-GIMUN-%' then new.event := 'gimun';
  elsif new.event is null and new.entity_id like 'REG-MOOT-%' then new.event := 'moot-cup'; end if;
  return new;
end $$;
create trigger audit_log_context before insert on public.audit_log for each row execute function public.fill_audit_context();

-- --- Removable admin accounts ------------------------------------------------------
-- Records keep pointing at the people who made them; when an account is
-- removed those links become empty instead of blocking the removal. The audit
-- log keeps the name in actor_label.
do $$
declare r record;
begin
  for r in
    select c.conname, c.conrelid::regclass as tbl, a.attname as col
    from pg_constraint c join pg_attribute a on a.attrelid = c.conrelid and a.attnum = c.conkey[1]
    where c.contype = 'f' and c.confrelid = 'auth.users'::regclass and c.connamespace = 'public'::regnamespace
  loop
    execute format('alter table %s drop constraint %I', r.tbl, r.conname);
    execute format('alter table %s add constraint %I foreign key (%I) references auth.users(id) on delete %s',
      r.tbl, r.conname, r.col, case when r.tbl = 'public.admin_users'::regclass then 'cascade' else 'set null' end);
  end loop;
end $$;

-- --- An audit log nobody can rewrite -------------------------------------------------
-- Two changes stay possible: retention blanking a row's details, and an account
-- removal clearing the actor link. Nothing can delete or truncate it.
create function public.protect_audit_log() returns trigger language plpgsql set search_path = public as $$
begin
  if tg_op in ('DELETE', 'TRUNCATE') then raise exception 'The audit log cannot be deleted'; end if;
  if (new.id, new.action, new.section, new.entity_id, new.created_at, new.event, new.actor_label)
       is distinct from (old.id, old.action, old.section, old.entity_id, old.created_at, old.event, old.actor_label)
     or (new.actor is distinct from old.actor and new.actor is not null)
     or (new.detail is distinct from old.detail and new.detail <> '{}'::jsonb) then
    raise exception 'The audit log cannot be changed';
  end if;
  return new;
end $$;
create trigger audit_log_append_only before update or delete on public.audit_log for each row execute function public.protect_audit_log();
create trigger audit_log_no_truncate before truncate on public.audit_log for each statement execute function public.protect_audit_log();

-- --- Admin settings: which tools are switched on ------------------------------------
create table public.admin_settings (
  id text primary key check (id = 'admin'),
  data jsonb not null default '{}',
  version integer not null default 1,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);
-- Registration now runs on Google Forms, so the built-in review and payment
-- tools start switched off. Their data stays; the owner can switch them on.
insert into public.admin_settings(id, data) values ('admin', '{"modules":{"registrations":false},"trashDays":30}');
alter table public.admin_settings enable row level security;
revoke all on public.admin_settings from public, anon, authenticated;
grant all on public.admin_settings to service_role;
create trigger live_revision after insert or update or delete on public.admin_settings for each row execute function public.bump_live_revision('users');

-- --- Event checks on every privileged write ----------------------------------------
alter function public.save_content(jsonb, uuid) rename to save_content_unscoped;
revoke execute on function public.save_content_unscoped(jsonb, uuid) from service_role;
create function public.save_content(p_entry jsonb, p_actor uuid) returns void
language plpgsql security definer set search_path = public, pg_temp as $$
declare c text := p_entry->>'collection'; v_event text; old_data jsonb;
begin
  if c = 'site' then
    if not admin_covers_both(p_actor) then raise exception 'Site settings cover both events; only an admin with access to both can change them'; end if;
  else
    v_event := content_event(c, p_entry->'data');
    select data into old_data from content_entries where collection = c and id = p_entry->>'id';
    -- Both the stored and the new version must be in scope, so an entry cannot be moved out of (or into) another event.
    if not admin_can_event(p_actor, v_event) or (old_data is not null and not admin_can_event(p_actor, content_event(c, old_data))) then
      raise exception 'This entry belongs to an event outside your access';
    end if;
  end if;
  perform set_config('app.audit_event', coalesce(v_event, ''), true);
  perform save_content_unscoped(p_entry, p_actor);
end $$;

alter function public.cancel_content_schedule(text, text, integer, uuid) rename to cancel_content_schedule_unscoped;
revoke execute on function public.cancel_content_schedule_unscoped(text, text, integer, uuid) from service_role;
create function public.cancel_content_schedule(p_collection text, p_id text, p_version integer, p_actor uuid) returns void
language plpgsql security definer set search_path = public, pg_temp as $$
declare v_event text;
begin
  select content_event(collection, data) into v_event from content_entries where collection = p_collection and id = p_id;
  if not admin_can_event(p_actor, v_event) then raise exception 'This entry belongs to an event outside your access'; end if;
  perform set_config('app.audit_event', coalesce(v_event, ''), true);
  perform cancel_content_schedule_unscoped(p_collection, p_id, p_version, p_actor);
end $$;

-- The event an operation acts on, read from its target record.
create function public.operation_event(p_operation text, p_input jsonb) returns text
language plpgsql stable security invoker set search_path = public as $$
declare v_event text;
begin
  if p_operation in ('registration', 'registration-contact', 'resend-ticket', 'invoice', 'amount-due') then
    select track into v_event from registrations where reference_id = p_input->>'reference';
  elsif p_operation in ('participant-edit', 'checkin', 'certificate', 'unassign', 'allocation') then
    select event into v_event from participants where id = nullif(p_input->>'participant_id', '')::uuid;
  elsif p_operation = 'reserve' then v_event := 'gimun';
  elsif p_operation in ('inbox', 'reply') then
    select event into v_event from contact_messages where id = p_input->>'id';
  elsif p_operation = 'promote' then v_event := 'moot-cup';
  elsif p_operation = 'outbox' then
    select event into v_event from email_outbox where id = nullif(p_input->>'id', '')::uuid;
  elsif p_operation = 'email' then v_event := nullif(p_input->>'event', '');
  end if;
  -- Everything else is shared (templates, survey questions) or checked per entry by save_content (emergency).
  return v_event;
end $$;

alter function public.admin_operation(text, jsonb, uuid) rename to admin_operation_unscoped;
revoke execute on function public.admin_operation_unscoped(text, jsonb, uuid) from service_role;
create function public.admin_operation(p_operation text, p_input jsonb, p_actor uuid) returns jsonb
language plpgsql security definer set search_path = public, pg_temp as $$
declare v_event text := operation_event(p_operation, p_input);
begin
  if p_operation = 'email' and v_event is not null and v_event not in ('gimun', 'moot-cup') then raise exception 'Unknown event'; end if;
  if p_operation = 'email' and v_event is null and not admin_covers_both(p_actor) then
    raise exception 'Messages to everyone need access to both events';
  end if;
  if not admin_can_event(p_actor, v_event) then raise exception 'This record belongs to an event outside your access'; end if;
  perform set_config('app.audit_event', coalesce(v_event, ''), true);
  perform set_config('app.outbox_event', coalesce(v_event, ''), true);
  return admin_operation_unscoped(p_operation, p_input, p_actor);
end $$;

alter function public.create_walkin_registration(jsonb, uuid) rename to create_walkin_registration_unscoped;
revoke execute on function public.create_walkin_registration_unscoped(jsonb, uuid) from service_role;
create function public.create_walkin_registration(p_payload jsonb, p_actor uuid) returns jsonb
language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if not admin_can_event(p_actor, p_payload->>'p_track') then raise exception 'This registration belongs to an event outside your access'; end if;
  perform set_config('app.audit_event', coalesce(p_payload->>'p_track', ''), true);
  return create_walkin_registration_unscoped(p_payload, p_actor);
end $$;

revoke all on function public.admin_events(uuid), public.admin_can_event(uuid, text), public.admin_covers_both(uuid),
  public.content_event(text, jsonb), public.operation_event(text, jsonb),
  public.save_content(jsonb, uuid), public.cancel_content_schedule(text, text, integer, uuid),
  public.admin_operation(text, jsonb, uuid), public.create_walkin_registration(jsonb, uuid) from public, anon, authenticated;
grant execute on function public.admin_events(uuid), public.admin_can_event(uuid, text), public.admin_covers_both(uuid),
  public.save_content(jsonb, uuid), public.cancel_content_schedule(text, text, integer, uuid),
  public.admin_operation(text, jsonb, uuid), public.create_walkin_registration(jsonb, uuid) to service_role;
revoke all on function public.fill_event_from_participant(), public.fill_outbox_event(), public.fill_audit_context(), public.protect_audit_log() from public, anon, authenticated;
