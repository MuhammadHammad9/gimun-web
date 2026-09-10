create table if not exists public.reference_counters (
  track text primary key check (track in ('gimun', 'moot-cup')),
  next_value integer not null default 1
);

insert into public.reference_counters (track, next_value)
values ('gimun', 1), ('moot-cup', 1)
on conflict (track) do nothing;

create or replace function public.next_submission_reference(p_track text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  current_value integer;
  prefix text;
begin
  if p_track not in ('gimun', 'moot-cup') then
    raise exception 'Invalid submission track';
  end if;

  update public.reference_counters
  set next_value = next_value + 1
  where track = p_track
  returning next_value - 1 into current_value;

  prefix := case when p_track = 'gimun' then 'REG-GIMUN-2027' else 'REG-MOOT-2027' end;
  return prefix || '-' || lpad(current_value::text, 4, '0');
end;
$$;

create table if not exists public.registrations (
  reference_id text primary key,
  track text not null check (track in ('gimun', 'moot-cup')),
  applicant_type text not null check (applicant_type in ('individual', 'delegation', 'team')),
  applicant_name text not null,
  institution text not null,
  contact_email text not null,
  participant_count integer not null default 1,
  submitted_at timestamptz not null,
  status text not null default 'received',
  form_data jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.contact_messages (
  id text primary key,
  submitted_at timestamptz not null,
  name text not null,
  email text not null,
  query_type text not null,
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.reference_counters enable row level security;
alter table public.registrations enable row level security;
alter table public.contact_messages enable row level security;

revoke all on public.reference_counters from anon, authenticated;
revoke all on public.registrations from anon, authenticated;
revoke all on public.contact_messages from anon, authenticated;
