-- Section permissions enforced in the database, the operations organizers need
-- to correct records and chase payment, idempotent contact submissions, and a
-- retry window that survives a once-a-day scheduler.

-- --- Permission check mirroring src/lib/server/admin/permissions.ts -----------
-- The app already checks can() before every call. Repeating the rule here means
-- a bug or a missed check in a server action cannot grant a write the role
-- does not have.
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
    when 'editor' then p_section in ('announcements','schedule','committees','moot-categories','resources','faq','team','sponsors','gallery','clarifications','results','navigation','media')
    when 'registrar' then p_section in ('registrations','inbox','email','event-day','allocations','certificates','feedback')
    when 'checkin' then p_section = 'event-day'
    when 'viewer' then p_section not in ('audit','email')
    else false
  end;
end $$;
revoke all on function public.admin_can(uuid, text, boolean) from public, anon, authenticated;
grant execute on function public.admin_can(uuid, text, boolean) to service_role;

-- --- Keep the existing operation body; wrap it with the permission check -----
alter function public.admin_operation(text, jsonb, uuid) rename to admin_operation_core;
revoke all on function public.admin_operation_core(text, jsonb, uuid) from public, anon, authenticated;
grant execute on function public.admin_operation_core(text, jsonb, uuid) to service_role;

alter table public.email_outbox drop constraint email_outbox_message_type_check;
alter table public.email_outbox add constraint email_outbox_message_type_check check (message_type in (
  'applicant-receipt','secretariat-notification','status-change','broadcast','certificate','survey','reply','invoice'));

create function public.admin_operation(p_operation text, p_input jsonb, p_actor uuid)
returns jsonb language plpgsql security invoker set search_path = public as $$
declare
  v_section text;
  r registrations;
  p participants;
  src email_outbox;
  v_override boolean := coalesce((p_input->>'override')::boolean, false);
begin
  v_section := case p_operation
    when 'registration' then 'registrations'
    when 'registration-contact' then 'registrations'
    when 'participant-edit' then 'registrations'
    when 'resend-ticket' then 'registrations'
    when 'invoice' then 'registrations'
    when 'checkin' then 'event-day'
    when 'allocation' then 'allocations'
    when 'reserve' then 'allocations'
    when 'certificate' then 'certificates'
    when 'inbox' then 'inbox'
    when 'reply' then 'inbox'
    when 'promote' then 'clarifications'
    when 'emergency' then 'schedule'
    when 'outbox' then 'email'
    when 'email' then 'email'
    when 'template' then 'email'
    when 'survey-question' then 'feedback'
    when 'archive' then 'close-out'
    else null
  end;
  if v_section is null then raise exception 'Unknown operation'; end if;
  if not admin_can(p_actor, v_section, true) then raise exception 'You do not have permission for this operation'; end if;
  -- Overriding attendance or payment rules is a registrar decision, not a door-staff one.
  if p_operation in ('checkin', 'certificate') and v_override and not admin_can(p_actor, 'registrations', true) then
    raise exception 'Overrides require registration permission';
  end if;
  -- Sending mail as part of an operation also needs email permission.
  if p_operation in ('resend-ticket', 'invoice') and not admin_can(p_actor, 'email', true) then
    raise exception 'Sending email requires email permission';
  end if;

  case p_operation
  when 'registration-contact' then
    select * into strict r from registrations where reference_id = p_input->>'reference' for update;
    if p_input ? 'expected_updated_at' and r.updated_at <> (p_input->>'expected_updated_at')::timestamptz then
      raise exception 'Registration changed; refresh before saving';
    end if;
    if coalesce(p_input->>'contact_email', '') !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then raise exception 'Enter a valid email address'; end if;
    if length(trim(coalesce(p_input->>'applicant_name', ''))) < 2 then raise exception 'Enter the applicant name'; end if;
    update registrations set applicant_name = trim(p_input->>'applicant_name'), contact_email = lower(trim(p_input->>'contact_email')),
      institution = trim(coalesce(p_input->>'institution', r.institution)), updated_at = now()
      where reference_id = r.reference_id;
    insert into registration_history(registration_ref, actor, action, detail) values (r.reference_id, p_actor, 'contact-edit',
      jsonb_build_object('before', jsonb_build_object('applicant_name', r.applicant_name, 'contact_email', r.contact_email, 'institution', r.institution), 'after', p_input - 'expected_updated_at'));
  when 'participant-edit' then
    select * into strict p from participants where id = (p_input->>'participant_id')::uuid for update;
    if coalesce(p_input->>'email', '') !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then raise exception 'Enter a valid email address'; end if;
    if length(trim(coalesce(p_input->>'name', ''))) < 2 then raise exception 'Enter the participant name'; end if;
    -- The name printed on certificates comes from here, so every change is kept.
    update participants set name = trim(p_input->>'name'), email = lower(trim(p_input->>'email')) where id = p.id;
    update registrations set updated_at = now() where reference_id = p.registration_ref;
    insert into registration_history(registration_ref, actor, action, detail) values (p.registration_ref, p_actor, 'participant-edit',
      jsonb_build_object('participant_id', p.id, 'before', jsonb_build_object('name', p.name, 'email', p.email), 'after', jsonb_build_object('name', p_input->>'name', 'email', p_input->>'email')));
  when 'resend-ticket' then
    select * into strict r from registrations where reference_id = p_input->>'reference';
    select * into src from email_outbox where reference_id = r.reference_id and message_type = 'applicant-receipt' order by created_at limit 1;
    if not found then raise exception 'No original receipt is stored for this registration'; end if;
    -- Same receipt and QR attachment, sent to the current contact address.
    insert into email_outbox(message_type, reference_id, to_addresses, subject, html, attachments, from_address, retry_until)
      values ('applicant-receipt', r.reference_id, array[r.contact_email], src.subject, src.html, src.attachments, coalesce(src.from_address, p_input->>'from'), now() + interval '72 hours');
    insert into registration_history(registration_ref, actor, action, detail) values (r.reference_id, p_actor, 'resend-ticket', jsonb_build_object('to', r.contact_email));
  when 'invoice' then
    select * into strict r from registrations where reference_id = p_input->>'reference';
    if r.status in ('rejected', 'withdrawn') then raise exception 'Cannot invoice a rejected or withdrawn registration'; end if;
    insert into email_outbox(message_type, reference_id, to_addresses, subject, html, attachments, from_address, retry_until)
      values ('invoice', r.reference_id, array[r.contact_email], p_input->>'subject', p_input->>'html', coalesce(p_input->'attachments', '[]'), p_input->>'from', now() + interval '72 hours');
    insert into registration_history(registration_ref, actor, action, detail) values (r.reference_id, p_actor, 'invoice',
      jsonb_build_object('to', r.contact_email, 'amount_due', r.amount_due, 'invoice_number', p_input->>'invoice_number'));
  else
    return admin_operation_core(p_operation, p_input, p_actor);
  end case;

  insert into audit_log(actor, action, section, entity_id, detail)
    values (p_actor, p_operation, v_section, coalesce(p_input->>'reference', p_input->>'participant_id'), p_input - 'html' - 'from' - 'attachments');
  return '{}'::jsonb;
end $$;
revoke all on function public.admin_operation(text, jsonb, uuid) from public, anon, authenticated;
grant execute on function public.admin_operation(text, jsonb, uuid) to service_role;

-- --- Exports are personal data: log each one --------------------------------
create or replace function public.log_admin_export(p_actor uuid, p_export text, p_rows integer)
returns void language plpgsql security invoker set search_path = public as $$
begin
  insert into audit_log(actor, action, section, entity_id, detail)
    values (p_actor, 'export', 'export', p_export, jsonb_build_object('rows', p_rows));
end $$;
revoke all on function public.log_admin_export(uuid, text, integer) from public, anon, authenticated;
grant execute on function public.log_admin_export(uuid, text, integer) to service_role;

-- --- Contact submissions are idempotent by id -------------------------------
-- The API derives the id from a client submission key, so a network retry of
-- the same message returns the stored inquiry instead of creating a second one.
create or replace function public.create_contact_v2(
  p_id text,
  p_submitted_at timestamptz,
  p_name text,
  p_email text,
  p_query_type text,
  p_message text,
  p_notification_recipients text[],
  p_notification_subject text,
  p_notification_html text, p_kind text, p_from_address text
)
returns text
language plpgsql
security invoker
set search_path = public
as $$
begin
  perform pg_advisory_xact_lock(hashtextextended('contact:' || p_id, 0));
  if exists (select 1 from public.contact_messages where id = p_id) then
    return p_id;
  end if;

  insert into public.contact_messages (id, submitted_at, name, email, query_type, message, kind)
  values (p_id, p_submitted_at, p_name, p_email, p_query_type, p_message, p_kind);

  if cardinality(p_notification_recipients) > 0 then
    insert into public.email_outbox (message_type, contact_id, to_addresses, reply_to, subject, html, from_address)
    values ('secretariat-notification', p_id, p_notification_recipients, p_email, p_notification_subject, p_notification_html, p_from_address);
  end if;

  return p_id;
end;
$$;
revoke all on function public.create_contact_v2(text,timestamptz,text,text,text,text,text[],text,text,text,text) from public,anon,authenticated;
grant execute on function public.create_contact_v2(text,timestamptz,text,text,text,text,text[],text,text,text,text) to service_role;

-- --- Retry window ------------------------------------------------------------
-- With a daily scheduler, a message that failed just after a run would expire
-- before the next one. 72 hours gives at least two scheduled attempts.
alter table public.email_outbox alter column retry_until set default (now() + interval '72 hours');
