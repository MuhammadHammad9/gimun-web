-- People: the roster check-in, allocations and certificates work from. With
-- registration on Google Forms, staff import the responses here; each person
-- becomes an accepted individual registration with a reference (REG-GIMUN-…
-- or REG-MOOT-…) that check-in accepts.

-- Registrars and admins manage people by default.
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
    when 'editor' then p_section in ('announcements','schedule','committees','moot-categories','resources','faq','team','team-groups','sponsors','gallery','clarifications','results','navigation','copy','media')
    when 'registrar' then p_section in ('registrations','people','inbox','email','event-day','allocations','certificates','feedback')
    when 'checkin' then p_section = 'event-day'
    when 'viewer' then p_section not in ('audit','email')
    else false
  end;
end $$;
revoke all on function public.admin_can(uuid, text, boolean) from public, anon, authenticated;
grant execute on function public.admin_can(uuid, text, boolean) to service_role;

-- Rows: [{name, email, institution, role, committees: [..], country}]. A person
-- already on the roster for this event (same email) is updated, not duplicated.
create function public.import_people(p_event text, p_rows jsonb, p_payment text, p_actor uuid) returns jsonb
language plpgsql security definer set search_path = public, pg_temp as $$
declare r jsonb; v_email text; v_name text; existing participants; v_ref text; v_year integer; created integer := 0; updated integer := 0; prefs text[];
begin
  if p_event not in ('gimun', 'moot-cup') then raise exception 'Choose GIMUN or GMC'; end if;
  if not admin_can(p_actor, 'people', true) or not admin_can_event(p_actor, p_event) then raise exception 'You do not have permission to add people to this event'; end if;
  if p_payment not in ('unpaid', 'pending_verification', 'paid', 'waived') then raise exception 'Choose a payment status'; end if;
  if jsonb_typeof(p_rows) <> 'array' or jsonb_array_length(p_rows) = 0 or jsonb_array_length(p_rows) > 1000 then raise exception 'Import between 1 and 1000 people at a time'; end if;
  perform set_config('app.audit_event', p_event, true);
  select coalesce(extract(year from (data #>> '{eventDates,start}')::date)::integer, extract(year from now())::integer) into v_year from site_settings where id = 'site';
  v_year := coalesce(v_year, extract(year from now())::integer);
  perform pg_advisory_xact_lock(hashtextextended('import-people:' || p_event, 0));
  for r in select value from jsonb_array_elements(p_rows) loop
    v_name := trim(coalesce(r->>'name', ''));
    v_email := lower(trim(coalesce(r->>'email', '')));
    if length(v_name) < 2 or v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then raise exception 'Every person needs a name and a valid email (check %)', coalesce(nullif(v_name, ''), v_email); end if;
    prefs := coalesce(array(select jsonb_array_elements_text(coalesce(r->'committees', '[]'::jsonb))), '{}');
    select * into existing from participants where event = p_event and lower(email) = v_email limit 1;
    if found then
      update participants set name = v_name, role = coalesce(nullif(r->>'role', ''), role), committee_pref = case when cardinality(prefs) > 0 then prefs else committee_pref end,
        country_pref = coalesce(nullif(r->>'country', ''), country_pref) where id = existing.id;
      update registrations set applicant_name = v_name, institution = coalesce(nullif(trim(r->>'institution'), ''), institution), updated_at = now() where reference_id = existing.registration_ref and applicant_type = 'individual';
      updated := updated + 1;
    else
      v_ref := next_submission_reference(p_event, v_year);
      insert into registrations(reference_id, track, applicant_type, applicant_name, institution, contact_email, participant_count, submitted_at, status, payment_status, form_data)
        values (v_ref, p_event, 'individual', v_name, coalesce(trim(r->>'institution'), ''), v_email, 1, now(), 'accepted', p_payment,
          jsonb_build_object('fullName', v_name, 'email', v_email, 'source', 'import', 'committeePreference1', prefs[1], 'committeePreference2', prefs[2], 'committeePreference3', prefs[3], 'countryPreference', nullif(r->>'country', '')));
      -- The roster trigger made the participant; set the role it could not know.
      update participants set role = coalesce(nullif(r->>'role', ''), case when p_event = 'gimun' then 'delegate' else 'team-member' end) where registration_ref = v_ref;
      insert into registration_history(registration_ref, actor, action, detail) values (v_ref, p_actor, 'import', jsonb_build_object('source', 'csv'));
      created := created + 1;
    end if;
  end loop;
  insert into audit_log(actor, action, section, entity_id, detail) values (p_actor, 'import-people', 'people', p_event, jsonb_build_object('created', created, 'updated', updated));
  return jsonb_build_object('created', created, 'updated', updated);
end $$;

create function public.update_person(p_id uuid, p_name text, p_email text, p_role text, p_actor uuid) returns void
language plpgsql security definer set search_path = public, pg_temp as $$
declare p participants;
begin
  select * into strict p from participants where id = p_id for update;
  if not admin_can(p_actor, 'people', true) or not admin_can_event(p_actor, p.event) then raise exception 'You do not have permission for this person'; end if;
  if length(trim(coalesce(p_name, ''))) < 2 or coalesce(p_email, '') !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then raise exception 'Enter a name and a valid email'; end if;
  perform set_config('app.audit_event', coalesce(p.event, ''), true);
  -- The name printed on certificates comes from here, so every change is kept.
  update participants set name = trim(p_name), email = lower(trim(p_email)), role = coalesce(nullif(trim(p_role), ''), role) where id = p.id;
  update registrations set updated_at = now() where reference_id = p.registration_ref;
  insert into registration_history(registration_ref, actor, action, detail) values (p.registration_ref, p_actor, 'participant-edit',
    jsonb_build_object('participant_id', p.id, 'before', jsonb_build_object('name', p.name, 'email', p.email, 'role', p.role), 'after', jsonb_build_object('name', p_name, 'email', p_email, 'role', p_role)));
  insert into audit_log(actor, action, section, entity_id) values (p_actor, 'person-edit', 'people', p.id::text);
end $$;

-- What deleting a person takes with it, for the confirmation.
create function public.person_impact(p_id uuid) returns jsonb
language sql stable security invoker set search_path = public as $$
  select jsonb_build_object(
    'allocation', (select count(*) from allocations where participant_id = p_id),
    'certificates', (select count(*) from certificates where participant_id = p_id),
    'survey', (select count(*) from survey_responses where participant_id = p_id),
    'checked_in', (select checked_in_at is not null from participants where id = p_id))
$$;

-- Deletes a person for good (owners, and admins for their event), with their
-- allocation, certificates and survey answer. Their registration goes too when
-- no one else is on it, with the emails sent about it.
create function public.purge_participant(p_id uuid, p_actor uuid) returns void
language plpgsql security definer set search_path = public, pg_temp as $$
declare p participants; remaining integer;
begin
  select * into strict p from participants where id = p_id for update;
  if not admin_can_purge(p_actor, 'people', p.event) then raise exception 'Only owners, and admins for their own event, can delete permanently'; end if;
  perform set_config('app.audit_event', coalesce(p.event, ''), true);
  delete from participants where id = p.id;
  select count(*) into remaining from participants where registration_ref = p.registration_ref;
  if remaining = 0 then
    delete from email_outbox where reference_id = p.registration_ref and status <> 'processing';
    update registrations set duplicate_of = null where duplicate_of = p.registration_ref;
    delete from registrations where reference_id = p.registration_ref;
  end if;
  insert into audit_log(actor, action, section, entity_id, detail) values (p_actor, 'delete-permanently', 'people', p.id::text, jsonb_build_object('kind', 'person', 'title', p.name, 'reference', p.registration_ref));
end $$;

revoke all on function public.import_people(text, jsonb, text, uuid), public.update_person(uuid, text, text, text, uuid), public.person_impact(uuid), public.purge_participant(uuid, uuid) from public, anon, authenticated;
grant execute on function public.import_people(text, jsonb, text, uuid), public.update_person(uuid, text, text, text, uuid), public.person_impact(uuid), public.purge_participant(uuid, uuid) to service_role;
