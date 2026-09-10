# Supabase Database Guide & SQL Runbook — GIMUN & GMC 2027

This document provides step-by-step instructions for running database migrations, verifying connection health, managing submissions, and exporting data in Supabase.

---

## 1. Initial Setup: Running the Migration

### Step 1: Open the SQL Editor
1. Log in to your [Supabase Dashboard](https://app.supabase.com).
2. Select your project.
3. In the left navigation bar, click **SQL Editor** (the `>_` icon).
4. Click **New Query** (or the `+` button).

### Step 2: Execute Migration Script
1. Copy the entire contents of [`supabase/migrations/0001_public_launch.sql`](file:///C:/Users/Khaas%20Laptop's/OneDrive%20-%20Higher%20Education%20Commission/Desktop/Sophep/Main%20Website/supabase/migrations/0001_public_launch.sql).
2. Paste it into the query editor.
3. Click **Run** (or press `Ctrl+Enter` / `Cmd+Enter`).
4. You should see `Success. No rows returned`.

---

## 2. What the Migration Creates

| Object Name | Type | Purpose |
|---|---|---|
| `public.reference_counters` | Table | Tracks sequential counters for GIMUN and GMC reference numbers. |
| `public.registrations` | Table | Primary store for delegate, delegation, and moot team submissions. |
| `public.contact_messages` | Table | Primary store for general contact and partnership inquiries. |
| `public.next_submission_reference(p_track)` | Function | Atomically generates sequential references (`REG-GIMUN-2027-0001`, `REG-MOOT-2027-0001`) with row locking. |
| `public.view_gimun_roster` | View | Flattens individual and group delegation rosters into single-delegate rows for badging and committee lists. |
| `public.view_moot_roster` | View | Flattens moot teams into individual oralist/researcher rows for bench evaluation. |
| `public.view_submission_stats` | View | Provides real-time metrics on total delegates, teams, and institution breakdown. |

---

## 3. Verification Queries

After running the migration, run these queries in the SQL Editor to verify everything is operational:

### A. Test Reference Number Generation
```sql
select public.next_submission_reference('gimun');
```
*Expected output: `REG-GIMUN-2027-0001`*

```sql
select public.next_submission_reference('moot-cup');
```
*Expected output: `REG-MOOT-2027-0001`*

### B. Verify Tables and RLS
```sql
select tablename, rowsecurity from pg_tables 
where schemaname = 'public' and tablename in ('reference_counters', 'registrations', 'contact_messages');
```
*All 3 tables must have `rowsecurity = true`.*

---

## 4. Resetting Counters Before Opening Public Registration

Because the verification step increments the counter to `0002`, run this reset query right before you go live with public registrations:

```sql
update public.reference_counters 
set next_value = 1;
```

---

## 5. Daily Administrative & Export Queries

All queries below are also saved in [`supabase/useful_queries.sql`](file:///C:/Users/Khaas%20Laptop's/OneDrive%20-%20Higher%20Education%20Commission/Desktop/Sophep/Main%20Website/supabase/useful_queries.sql).

### A. View Overall Event KPIs
```sql
select * from public.view_submission_stats;
```

### B. Export Full GIMUN Delegate Roster (CSV Ready)
```sql
select * from public.view_gimun_roster
order by institution, delegate_name;
```
*Tip: In Supabase SQL Editor, click **Download CSV** above the results table to export the list directly into Excel or Google Sheets for delegate badge printing.*

### C. Export Full Moot Court Team Roster
```sql
select * from public.view_moot_roster
order by institution, team_name, member_role;
```

### D. Update Application Status
```sql
-- Accept an application
update public.registrations
set status = 'accepted'
where reference_id = 'REG-GIMUN-2027-0001';

-- Waitlist an application
update public.registrations
set status = 'waitlisted'
where reference_id = 'REG-GIMUN-2027-0002';
```

---

## 6. Connecting to Your Next.js Application

In [`.env.local`](file:///C:/Users/Khaas%20Laptop's/OneDrive%20-%20Higher%20Education%20Commission/Desktop/Sophep/Main%20Website/.env.local) (and in Vercel Project Settings for production):

1. Go to **Supabase Dashboard** -> **Project Settings** -> **API**.
2. Copy the **Project URL** and paste it as `SUPABASE_URL`.
3. Copy the **service_role** secret key (under **Project API keys**) and paste it as `SUPABASE_SERVICE_ROLE_KEY`.
4. Set `SUBMISSIONS_BACKEND=supabase`.

> [!IMPORTANT]
> **Always use the `service_role` key, never the `anon` public key** for `SUPABASE_SERVICE_ROLE_KEY`. Because Row Level Security is strictly enabled on `registrations` and `contact_messages`, only the `service_role` key has backend permission to write and read submission rows.
