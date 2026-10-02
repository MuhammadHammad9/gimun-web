-- Populate normalized rosters for registrations made before migration 0004.
insert into public.participants(registration_ref,name,email,role,committee_pref,country_pref)
select r.reference_id,r.form_data->>'fullName',r.form_data->>'email','delegate',
  array[r.form_data->>'committeePreference1',r.form_data->>'committeePreference2',r.form_data->>'committeePreference3'],r.form_data->>'countryPreference'
from public.registrations r where r.applicant_type='individual' and r.form_data ? 'fullName'
and not exists(select 1 from public.participants p where p.registration_ref=r.reference_id);
insert into public.participants(registration_ref,name,email,role,committee_pref,country_pref)
select r.reference_id,coalesce(member->>'name',member->>'fullName'),member->>'email',coalesce(member->>'role','delegate'),
  array[member->>'committeePreference1',member->>'committeePreference2'],member->>'countryPreference'
from public.registrations r cross join lateral jsonb_array_elements(case when r.applicant_type='delegation' then r.form_data->'delegates' else r.form_data->'members' end) member
where r.applicant_type in ('delegation','team') and not exists(select 1 from public.participants p where p.registration_ref=r.reference_id);
create unique index unique_committee_slug on public.content_entries((data->>'slug')) where collection='committees';
-- Stop historical APIs from bypassing the new idempotent submission transaction.
revoke execute on function public.create_registration_submission(text,text,text,text,text,integer,timestamptz,text,jsonb,text,text,text[],text,text) from service_role;
revoke execute on function public.create_contact_submission(text,timestamptz,text,text,text,text,text[],text,text) from service_role;
