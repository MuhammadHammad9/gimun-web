-- ==============================================================================
-- GIMUN & GMC 2027 — Production Database Schema & Migration
-- ==============================================================================
-- Target: Supabase / PostgreSQL 15+
-- Run this in the Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- ==============================================================================

-- 1. REFERENCE NUMBER COUNTERS TABLE
-- Stores atomic serial counters for GIMUN and GMC registration references.
create table if not exists public.reference_counters (
  track text primary key check (track in ('gimun', 'moot-cup')),
  next_value integer not null default 1
);

insert into public.reference_counters (track, next_value)
values ('gimun', 1), ('moot-cup', 1)
on conflict (track) do nothing;

-- 2. ATOMIC REGISTRATION REFERENCE SEQUENCE FUNCTION
-- Generates formatted reference numbers (REG-GIMUN-2027-0001, REG-MOOT-2027-0001)
-- with row locking to ensure zero race conditions across concurrent submissions.
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
    raise exception 'Invalid submission track: %', p_track;
  end if;

  update public.reference_counters
  set next_value = next_value + 1
  where track = p_track
  returning next_value - 1 into current_value;

  prefix := case when p_track = 'gimun' then 'REG-GIMUN-2027' else 'REG-MOOT-2027' end;
  return prefix || '-' || lpad(current_value::text, 4, '0');
end;
$$;

-- 3. REGISTRATIONS TABLE
-- Stores individual delegates, delegation rosters, and Moot Cup team submissions.
create table if not exists public.registrations (
  reference_id text primary key,
  track text not null check (track in ('gimun', 'moot-cup')),
  applicant_type text not null check (applicant_type in ('individual', 'delegation', 'team')),
  applicant_name text not null,
  institution text not null,
  contact_email text not null,
  participant_count integer not null default 1,
  submitted_at timestamptz not null,
  status text not null default 'received' check (status in ('received', 'under-review', 'accepted', 'waitlisted', 'rejected')),
  form_data jsonb not null,
  created_at timestamptz not null default now()
);

-- 4. CONTACT INQUIRIES TABLE
-- Stores general contact form inquiries, sponsorship questions, and press queries.
create table if not exists public.contact_messages (
  id text primary key,
  submitted_at timestamptz not null,
  name text not null,
  email text not null,
  query_type text not null check (query_type in ('gimun', 'moot-cup', 'sponsorship', 'media', 'other')),
  message text not null,
  created_at timestamptz not null default now()
);

-- 5. PERFORMANCE INDEXES
create index if not exists idx_registrations_track on public.registrations(track);
create index if not exists idx_registrations_status on public.registrations(status);
create index if not exists idx_registrations_submitted_at on public.registrations(submitted_at desc);
create index if not exists idx_registrations_institution on public.registrations(institution);
create index if not exists idx_contact_messages_submitted_at on public.contact_messages(submitted_at desc);
create index if not exists idx_contact_messages_query_type on public.contact_messages(query_type);

-- 6. ROW LEVEL SECURITY (RLS) & ACCESS CONTROL
-- Public clients (anon / authenticated) have zero direct access.
-- Server operations run securely using the service_role key.
alter table public.reference_counters enable row level security;
alter table public.registrations enable row level security;
alter table public.contact_messages enable row level security;

revoke all on public.reference_counters from anon, authenticated;
revoke all on public.registrations from anon, authenticated;
revoke all on public.contact_messages from anon, authenticated;

grant all on public.reference_counters to service_role, postgres;
grant all on public.registrations to service_role, postgres;
grant all on public.contact_messages to service_role, postgres;
grant execute on function public.next_submission_reference(text) to service_role, postgres;

-- ==============================================================================
-- 7. HELPER VIEWS FOR SECRETARIAT & CONVENING BENCH (CSV EXPORTS & DASHBOARD)
-- ==============================================================================

-- A. Unified GIMUN Delegate Roster View
-- Combines individual delegates and expanded delegation rosters into one table.
create or replace view public.view_gimun_roster as
select
  r.reference_id,
  'individual'::text as registration_type,
  r.institution,
  r.form_data->>'fullName' as delegate_name,
  r.contact_email as delegate_email,
  r.form_data->>'phone' as delegate_phone,
  r.form_data->>'committeePreference1' as pref_committee_1,
  r.form_data->>'committeePreference2' as pref_committee_2,
  r.form_data->>'committeePreference3' as pref_committee_3,
  r.form_data->>'countryPreference' as pref_country,
  r.form_data->>'dietaryAccessibility' as special_needs,
  r.status,
  r.submitted_at
from public.registrations r
where r.track = 'gimun' and r.applicant_type = 'individual'
union all
select
  r.reference_id,
  'delegation'::text as registration_type,
  r.institution,
  d->>'name' as delegate_name,
  d->>'email' as delegate_email,
  r.form_data->>'delegationHeadPhone' as delegate_phone,
  d->>'committeePreference1' as pref_committee_1,
  d->>'committeePreference2' as pref_committee_2,
  null as pref_committee_3,
  d->>'countryPreference' as pref_country,
  r.form_data->>'dietaryAccessibility' as special_needs,
  r.status,
  r.submitted_at
from public.registrations r,
jsonb_array_elements(case when jsonb_typeof(r.form_data->'delegates') = 'array' then r.form_data->'delegates' else '[]'::jsonb end) as d
where r.track = 'gimun' and r.applicant_type = 'delegation';

-- B. Unified GMC Moot Team Roster View
-- Unrolls team members with their advocacy role, oralist designation, and contact details.
create or replace view public.view_moot_roster as
select
  r.reference_id,
  r.institution,
  r.form_data->>'teamName' as team_name,
  m->>'fullName' as member_name,
  m->>'role' as member_role,
  m->>'email' as member_email,
  m->>'phone' as member_phone,
  r.form_data->>'problemCategoryPreference' as problem_preference,
  r.form_data->>'dietaryAccessibility' as special_needs,
  r.status,
  r.submitted_at
from public.registrations r,
jsonb_array_elements(case when jsonb_typeof(r.form_data->'members') = 'array' then r.form_data->'members' else '[]'::jsonb end) as m
where r.track = 'moot-cup';

-- C. Real-Time Registration Statistics View
-- Instant KPI overview for the organizing committee.
create or replace view public.view_submission_stats as
select
  count(*) as total_registrations,
  count(*) filter (where track = 'gimun') as gimun_registrations,
  count(*) filter (where track = 'moot-cup') as moot_registrations,
  coalesce(sum(participant_count), 0) as total_delegates_and_oralists,
  count(*) filter (where status = 'received') as status_received,
  count(*) filter (where status = 'under-review') as status_under_review,
  count(*) filter (where status = 'accepted') as status_accepted,
  count(distinct institution) as distinct_institutions
from public.registrations;

grant select on public.view_gimun_roster to service_role, postgres;
grant select on public.view_moot_roster to service_role, postgres;
grant select on public.view_submission_stats to service_role, postgres;
