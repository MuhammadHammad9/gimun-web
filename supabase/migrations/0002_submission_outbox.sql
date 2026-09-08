create table if not exists public.email_outbox (
  id uuid primary key default gen_random_uuid(),
  message_type text not null check (message_type in ('applicant-receipt', 'secretariat-notification')),
  reference_id text,
  contact_id text,
  to_addresses text[] not null check (cardinality(to_addresses) > 0),
  reply_to text,
  subject text not null,
  html text not null,
  status text not null default 'pending' check (status in ('pending', 'processing', 'sent', 'retry', 'failed', 'needs_review')),
  attempts integer not null default 0,
  next_attempt_at timestamptz not null default now(),
  locked_at timestamptz,
  locked_by text,
  provider_message_id text,
  last_error text,
  created_at timestamptz not null default now(),
  sent_at timestamptz
);

create index if not exists email_outbox_dispatch_idx
  on public.email_outbox (status, next_attempt_at);

alter table public.email_outbox enable row level security;
revoke all on public.email_outbox from anon, authenticated;

-- Keep the migration additive when the table already exists from an earlier
-- version of this migration, while allowing uncertain provider responses to be
-- escalated without being picked up by the automatic worker again.
alter table public.email_outbox drop constraint if exists email_outbox_status_check;
alter table public.email_outbox
  add constraint email_outbox_status_check
  check (status in ('pending', 'processing', 'sent', 'retry', 'failed', 'needs_review'));

-- Replace the legacy SECURITY DEFINER allocator with an invoker-safe function.
-- The server role owns the counter tables and is the only role granted execution.
create or replace function public.next_submission_reference(p_track text)
returns text
language plpgsql
security invoker
set search_path = public
as $$
declare
  current_value integer;
  prefix text;
begin
  if p_track not in ('gimun', 'moot-cup') then
    raise exception 'Invalid submission track: %', p_track;
  end if;

  update public.reference_counters
  set next_value = next_value + 1
  where track = p_track
  returning next_value - 1 into current_value;

  if current_value is null then
    raise exception 'No reference counter exists for track: %', p_track;
  end if;

  prefix := case when p_track = 'gimun' then 'REG-GIMUN-2027' else 'REG-MOOT-2027' end;
  return prefix || '-' || lpad(current_value::text, 4, '0');
end;
$$;

create or replace function public.create_registration_submission(
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
  p_notification_html text
)
returns text
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_reference_id text;
begin
  v_reference_id := public.next_submission_reference(p_track);

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

  return v_reference_id;
end;
$$;

create or replace function public.create_contact_submission(
  p_id text,
  p_submitted_at timestamptz,
  p_name text,
  p_email text,
  p_query_type text,
  p_message text,
  p_notification_recipients text[],
  p_notification_subject text,
  p_notification_html text
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

  return p_id;
end;
$$;

create or replace function public.claim_email_outbox(p_worker_id text, p_limit integer default 10)
returns setof public.email_outbox
language sql
security invoker
set search_path = public
as $$
  update public.email_outbox
  set status = 'processing', locked_at = now(), locked_by = p_worker_id, attempts = attempts + 1
  where id in (
    select id
    from public.email_outbox
    where (
      status in ('pending', 'retry')
      and next_attempt_at <= now()
    ) or (
      status = 'processing'
      and locked_at < now() - interval '10 minutes'
    )
    order by created_at
    for update skip locked
    limit greatest(1, least(p_limit, 50))
  )
  returning *;
$$;

revoke all on function public.create_registration_submission(text, text, text, text, text, integer, timestamptz, text, jsonb, text, text, text[], text, text[]) from public, anon, authenticated;
revoke all on function public.create_contact_submission(text, timestamptz, text, text, text, text, text[], text, text) from public, anon, authenticated;
revoke all on function public.claim_email_outbox(text, integer) from public, anon, authenticated;
revoke all on function public.next_submission_reference(text) from public, anon, authenticated;
grant execute on function public.create_registration_submission(text, text, text, text, text, integer, timestamptz, text, jsonb, text, text, text[], text, text[]) to service_role;
grant execute on function public.create_contact_submission(text, timestamptz, text, text, text, text, text[], text, text) to service_role;
grant execute on function public.claim_email_outbox(text, integer) to service_role;
grant execute on function public.next_submission_reference(text) to service_role;
