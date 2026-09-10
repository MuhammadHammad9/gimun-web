-- ==============================================================================
-- GIMUN & GMC 2027 — Useful Administrative SQL Queries for Supabase
-- ==============================================================================
-- Open in Supabase Dashboard -> SQL Editor
-- Run any query below as needed during registration review and event operations.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. VERIFICATION & HEALTH CHECK
-- Run right after applying the migration to verify sequence generation.
-- ------------------------------------------------------------------------------
-- Test GIMUN reference generation:
select public.next_submission_reference('gimun');

-- Test Moot Cup reference generation:
select public.next_submission_reference('moot-cup');

-- Inspect the current counter state:
select * from public.reference_counters;


-- ------------------------------------------------------------------------------
-- 2. DASHBOARD OVERVIEW & KEY PERFORMANCE METRICS
-- ------------------------------------------------------------------------------
-- Summary statistics (total delegates, institutions, track distribution):
select * from public.view_submission_stats;

-- Breakdown by track and applicant type:
select
  track,
  applicant_type,
  count(*) as total_submissions,
  sum(participant_count) as total_participants
from public.registrations
group by track, applicant_type
order by track, applicant_type;


-- ------------------------------------------------------------------------------
-- 3. REVIEWING RECENT SUBMISSIONS
-- ------------------------------------------------------------------------------
-- 10 most recent registrations:
select
  reference_id,
  track,
  applicant_type,
  applicant_name,
  institution,
  contact_email,
  participant_count,
  status,
  submitted_at
from public.registrations
order by submitted_at desc
limit 10;

-- 10 most recent contact inquiries:
select
  id,
  query_type,
  name,
  email,
  message,
  submitted_at
from public.contact_messages
order by submitted_at desc
limit 10;


-- ------------------------------------------------------------------------------
-- 4. ROSTER EXPORTS (CSV READY)
-- In Supabase Table Editor or SQL Editor, click "Export to CSV" after running.
-- ------------------------------------------------------------------------------
-- All GIMUN Delegates (combines individual delegates and delegation rosters):
select * from public.view_gimun_roster
order by institution, delegate_name;

-- All GIKI Moot Cup Teams & Members:
select * from public.view_moot_roster
order by institution, team_name, member_role;

-- Institution Summary (which universities have the most delegates):
select
  institution,
  count(*) as submissions_count,
  sum(participant_count) as total_participants
from public.registrations
group by institution
order by total_participants desc;


-- ------------------------------------------------------------------------------
-- 5. MANAGING APPLICATION STATUSES
-- ------------------------------------------------------------------------------
-- Accept a specific registration:
update public.registrations
set status = 'accepted'
where reference_id = 'REG-GIMUN-2027-0001';

-- Mark an application under review:
update public.registrations
set status = 'under-review'
where reference_id = 'REG-MOOT-2027-0001';

-- Waitlist an application:
update public.registrations
set status = 'waitlisted'
where reference_id = 'REG-GIMUN-2027-0002';


-- ------------------------------------------------------------------------------
-- 6. PURGE TEST DATA BEFORE GO-LIVE
-- CAUTION: Run ONLY before opening public registration to clear smoke-test rows.
-- ------------------------------------------------------------------------------
-- Purge test registrations:
-- delete from public.registrations where contact_email like '%test%' or applicant_name like '%Test%';

-- Reset counters back to 1:
-- update public.reference_counters set next_value = 1;
