alter table public.registrations drop constraint registrations_status_check;
alter table public.registrations add constraint registrations_status_check check(status in ('received','under-review','accepted','waitlisted','rejected','withdrawn'));
alter table public.registrations
  add column payment_status text not null default 'unpaid' check(payment_status in ('unpaid','pending_verification','paid','waived','refunded')),
  add column payment_reference text,
  add column amount_due numeric(12,2) not null default 0 check(amount_due >= 0),
  add column amount_paid numeric(12,2) not null default 0 check(amount_paid >= 0),
  add column fee_display text,
  add column internal_notes text not null default '',
  add column checkin_token uuid not null default gen_random_uuid() unique,
  add column submission_key uuid unique,
  add column submission_hash text,
  add column duplicate_of text references public.registrations(reference_id),
  add column updated_at timestamptz not null default now();
alter table public.contact_messages
  add column kind text not null default 'contact' check(kind in ('contact','clarification')),
  add column handled_status text not null default 'new' check(handled_status in ('new','read','replied','archived')),
  add column assignee uuid references auth.users(id), add column reply_note text;
alter table public.email_outbox add column attachments jsonb not null default '[]', add column template_key text, add column from_address text;
alter table public.email_outbox drop constraint email_outbox_message_type_check;
alter table public.email_outbox add constraint email_outbox_message_type_check check(message_type in ('applicant-receipt','secretariat-notification','status-change','broadcast','certificate','survey','reply'));
alter table public.email_outbox drop constraint email_outbox_status_check;
alter table public.email_outbox add constraint email_outbox_status_check check(status in ('pending','processing','sent','retry','failed','needs_review','cancelled'));
create index registrations_email_idx on public.registrations(lower(contact_email));
create index outbox_reference_idx on public.email_outbox(reference_id);
create index outbox_contact_idx on public.email_outbox(contact_id);
create index outbox_retry_idx on public.email_outbox(status,retry_until) where status in ('pending','retry','processing');
create table public.participants (
  id uuid primary key default gen_random_uuid(), registration_ref text not null references public.registrations(reference_id) on delete cascade,
  name text not null, email text not null, role text not null, committee_pref text[] not null default '{}', country_pref text,
  checked_in_at timestamptz, checked_in_by uuid references auth.users(id), survey_token uuid not null default gen_random_uuid() unique
);
create index participants_registration_idx on public.participants(registration_ref);
create table public.allocations (participant_id uuid primary key references public.participants(id) on delete cascade, committee_slug text not null, country text not null, unique(committee_slug,country));
create table public.country_reservations (committee_slug text not null, country text not null, note text not null default '', primary key(committee_slug,country));
create table public.registration_history (id bigint generated always as identity primary key, registration_ref text references public.registrations(reference_id) on delete cascade, actor uuid references auth.users(id), action text not null, detail jsonb not null default '{}', created_at timestamptz not null default now());
create table public.certificates (id uuid primary key default gen_random_uuid(), participant_id uuid not null references public.participants(id) on delete cascade, kind text not null check(kind in ('participation','award','chair')), serial text not null unique, verify_code uuid not null default gen_random_uuid() unique, issued_at timestamptz not null default now(), unique(participant_id,kind));
create table public.survey_questions (id uuid primary key default gen_random_uuid(), label text not null, kind text not null check(kind in ('rating','comment')), active boolean not null default true, sort_order integer not null default 0);
create table public.survey_responses (participant_id uuid primary key references public.participants(id) on delete cascade, answers jsonb not null, submitted_at timestamptz not null default now());
create table public.event_archives (id uuid primary key default gen_random_uuid(), name text not null, snapshot jsonb not null, created_by uuid references auth.users(id), created_at timestamptz not null default now());

create function public.next_submission_reference(p_track text,p_year integer) returns text language plpgsql security invoker set search_path=public as $$
declare n integer; begin
  if p_year < 2000 or p_year > 9999 then raise exception 'Invalid event year'; end if;
  update reference_counters set next_value=next_value+1 where track=p_track returning next_value-1 into n;
  if n is null then raise exception 'Invalid track'; end if;
  return 'REG-' || case when p_track='gimun' then 'GIMUN' else 'MOOT' end || '-' || p_year::text || '-' || lpad(n::text,greatest(4,length(n::text)),'0');
end $$;

-- All normalized roster rows are created in the registration transaction.
create function public.normalize_participants() returns trigger language plpgsql set search_path=public as $$
declare p jsonb; begin
  if new.applicant_type='individual' then
    insert into participants(registration_ref,name,email,role,committee_pref,country_pref)
    values(new.reference_id,new.form_data->>'fullName',new.form_data->>'email','delegate',array[new.form_data->>'committeePreference1',new.form_data->>'committeePreference2',new.form_data->>'committeePreference3'],new.form_data->>'countryPreference');
  else
    for p in select value from jsonb_array_elements(case when new.applicant_type='delegation' then new.form_data->'delegates' else new.form_data->'members' end) loop
      insert into participants(registration_ref,name,email,role,committee_pref,country_pref)
      values(new.reference_id,coalesce(p->>'name',p->>'fullName'),p->>'email',coalesce(p->>'role','delegate'),array[p->>'committeePreference1',p->>'committeePreference2'],p->>'countryPreference');
    end loop;
  end if;
  return new;
end $$;
create trigger registration_roster after insert on public.registrations for each row execute function public.normalize_participants();

do $$ declare t text; begin
  foreach t in array array['participants','allocations','country_reservations','registration_history','certificates','survey_questions','survey_responses','event_archives'] loop
    execute format('alter table public.%I enable row level security',t);
    execute format('revoke all on public.%I from public,anon,authenticated',t);
    execute format('grant all on public.%I to service_role',t);
  end loop;
end $$;
grant usage,select on all sequences in schema public to service_role;
revoke all on function public.next_submission_reference(text,integer) from public,anon,authenticated;
grant execute on function public.next_submission_reference(text,integer) to service_role;

create or replace function public.create_registration_v2(
  p_track text,
  p_applicant_type text,
  p_applicant_name text,
  p_institution text,
  p_email text,
  p_participant_count integer,
  p_submitted_at timestamptz,
  p_status text,
  p_form_data jsonb,
  p_receipt_subject text,
  p_receipt_html text,
  p_notification_recipients text[],
  p_notification_subject text,
  p_notification_html text,
  p_year integer, p_submission_key uuid, p_submission_hash text, p_checkin_token uuid,
  p_attachments jsonb, p_fee_display text, p_amount_due numeric, p_from_address text
)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_reference_id text;
  existing registrations;
begin
  perform pg_advisory_xact_lock(hashtextextended(p_submission_key::text,0));
  select * into existing from registrations where submission_key=p_submission_key;
  if found then
    if existing.submission_hash <> p_submission_hash then raise exception 'Idempotency key payload mismatch'; end if;
    return jsonb_build_object('referenceId',existing.reference_id,'checkinToken',existing.checkin_token);
  end if;
  v_reference_id := public.next_submission_reference(p_track,p_year);

  insert into public.registrations (
    reference_id,
    track,
    applicant_type,
    applicant_name,
    institution,
    contact_email,
    participant_count,
    submitted_at,
    status,
    form_data
  ) values (
    v_reference_id,
    p_track,
    p_applicant_type,
    p_applicant_name,
    p_institution,
    p_email,
    p_participant_count,
    p_submitted_at,
    p_status,
    p_form_data
  );

  update registrations set submission_key=p_submission_key,submission_hash=p_submission_hash,checkin_token=p_checkin_token,
    fee_display=p_fee_display,amount_due=p_amount_due,
    duplicate_of=(select reference_id from registrations where track=p_track and lower(contact_email)=lower(p_email) and reference_id<>v_reference_id order by created_at limit 1)
    where reference_id=v_reference_id;

  insert into public.email_outbox (
    message_type,
    reference_id,
    to_addresses,
    subject,
    html
  ) values (
    'applicant-receipt',
    v_reference_id,
    array[p_email],
    p_receipt_subject,
    replace(p_receipt_html, '{{REFERENCE_ID}}', v_reference_id)
  );

  if cardinality(p_notification_recipients) > 0 then
    insert into public.email_outbox (
      message_type,
      reference_id,
      to_addresses,
      reply_to,
      subject,
      html
    ) values (
      'secretariat-notification',
      v_reference_id,
      p_notification_recipients,
      p_email,
      p_notification_subject,
      replace(p_notification_html, '{{REFERENCE_ID}}', v_reference_id)
    );
  end if;

  update email_outbox set attachments=p_attachments,from_address=p_from_address where reference_id=v_reference_id and message_type='applicant-receipt';
  update email_outbox set from_address=p_from_address where reference_id=v_reference_id;
  return jsonb_build_object('referenceId',v_reference_id,'checkinToken',p_checkin_token);
end;
$$;


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
  insert into public.contact_messages (id, submitted_at, name, email, query_type, message)
  values (p_id, p_submitted_at, p_name, p_email, p_query_type, p_message);

  if cardinality(p_notification_recipients) > 0 then
    insert into public.email_outbox (
      message_type,
      contact_id,
      to_addresses,
      reply_to,
      subject,
      html
    ) values (
      'secretariat-notification',
      p_id,
      p_notification_recipients,
      p_email,
      p_notification_subject,
      p_notification_html
    );
  end if;

  update contact_messages set kind=p_kind where id=p_id;
  update email_outbox set from_address=p_from_address where contact_id=p_id;
  return p_id;
end;
$$;


revoke all on function public.create_registration_v2(text,text,text,text,text,integer,timestamptz,text,jsonb,text,text,text[],text,text,integer,uuid,text,uuid,jsonb,text,numeric,text) from public,anon,authenticated;
grant execute on function public.create_registration_v2(text,text,text,text,text,integer,timestamptz,text,jsonb,text,text,text[],text,text,integer,uuid,text,uuid,jsonb,text,numeric,text) to service_role;
revoke all on function public.create_contact_v2(text,timestamptz,text,text,text,text,text[],text,text,text,text) from public,anon,authenticated;
grant execute on function public.create_contact_v2(text,timestamptz,text,text,text,text,text[],text,text,text,text) to service_role;
