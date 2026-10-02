create function public.retention_cleanup(p_actor uuid,p_before timestamptz,p_policy text,p_legal_basis text,p_privacy_contact text,p_execute boolean,p_expected bigint)
returns jsonb language plpgsql security invoker set search_path=public as $$
declare n bigint; contacts bigint; affected_refs text[]; affected_emails text[];
begin
  if not exists(select 1 from admin_users where user_id=p_actor and role='owner' and active) then raise exception 'Owner required'; end if;
  if length(p_policy)<10 or length(p_legal_basis)<5 or length(p_privacy_contact)<5 or p_before>=now() then raise exception 'Supply approved policy, legal basis, privacy contact and past cutoff'; end if;
  if not exists(select 1 from event_archives) then raise exception 'Archive the event before retention cleanup'; end if;
  if exists(select 1 from site_settings where coalesce((data#>>'{registrationStatus,gimunOpen}')::boolean,true) or coalesce((data#>>'{registrationStatus,mootCupOpen}')::boolean,true)) then raise exception 'Close registration first'; end if;
  lock table registrations,contact_messages,email_outbox in share row exclusive mode;
  select count(*),array_agg(reference_id) into n,affected_refs from registrations where submitted_at<p_before and contact_email<>'anonymized@invalid.example';
  select count(*) into contacts from contact_messages where submitted_at<p_before and email<>'anonymized@invalid.example';
  select array_agg(distinct email) into affected_emails from (select contact_email as email from registrations where reference_id=any(affected_refs) union select email from participants where registration_ref=any(affected_refs) union select email from contact_messages where submitted_at<p_before) addresses;
  if p_execute then
    if n+contacts<>p_expected then raise exception 'Counts changed; run a fresh dry run'; end if;
    if exists(select 1 from email_outbox where status='processing') then raise exception 'Wait for active email workers before cleanup'; end if;
    -- Revoke public certificate and survey links as part of anonymization.
    delete from certificates where participant_id in (select id from participants where registration_ref=any(affected_refs));
    delete from survey_responses where participant_id in (select id from participants where registration_ref=any(affected_refs));
    update participants set name='Anonymized participant',email='anonymized@invalid.example',survey_token=gen_random_uuid(),country_pref=null,committee_pref='{}' where registration_ref=any(affected_refs);
    update registrations set applicant_name='Anonymized',institution='',contact_email='anonymized@invalid.example',form_data='{}',internal_notes='',payment_reference=null,submission_hash=null,checkin_token=gen_random_uuid() where reference_id=any(affected_refs);
    update registration_history set detail='{}' where registration_ref=any(affected_refs);
    delete from email_outbox where reference_id=any(affected_refs) or contact_id in (select id from contact_messages where submitted_at<p_before) or to_addresses && affected_emails or created_at<p_before;
    update contact_messages set name='Anonymized',email='anonymized@invalid.example',message='',reply_note=null where submitted_at<p_before;
    update audit_log set detail='{}' where section in ('registrations','inbox','event-day','email','certificates','feedback','allocations');
    insert into audit_log(actor,action,section,detail) values(p_actor,'retention-anonymize','close-out',jsonb_build_object('before',p_before,'registrations',n,'contacts',contacts,'policy',p_policy,'legal_basis',p_legal_basis,'privacy_contact',p_privacy_contact));
  end if;
  return jsonb_build_object('registrations',n,'contacts',contacts,'total',n+contacts,'executed',p_execute);
end $$;
revoke all on function public.retention_cleanup(uuid,timestamptz,text,text,text,boolean,bigint) from public,anon,authenticated;
grant execute on function public.retention_cleanup(uuid,timestamptz,text,text,text,boolean,bigint) to service_role;

create function public.guarded_counter_reset(p_actor uuid) returns void language plpgsql security invoker set search_path=public as $$
begin
  if not exists(select 1 from admin_users where user_id=p_actor and role='owner' and active) then raise exception 'Owner required'; end if;
  lock table registrations,reference_counters in access exclusive mode;
  if exists(select 1 from registrations) or exists(select 1 from email_outbox where reference_id is not null) then raise exception 'Cannot reset while registrations or associated emails exist'; end if;
  update reference_counters set next_value=1;
  insert into audit_log(actor,action,section) values(p_actor,'counter-reset','close-out');
end $$;
revoke all on function public.guarded_counter_reset(uuid) from public,anon,authenticated;
grant execute on function public.guarded_counter_reset(uuid) to service_role;
