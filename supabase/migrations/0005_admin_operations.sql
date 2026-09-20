-- All operational mutations include their audit entry in the same transaction.
create function public.admin_operation(p_operation text,p_input jsonb,p_actor uuid) returns jsonb language plpgsql security invoker set search_path=public as $$
declare r registrations; p participants; c content_entries; v_id uuid; result jsonb := '{}'; section text; q jsonb; current_count integer; cap integer;
begin
  if not exists(select 1 from admin_users where user_id=p_actor and active) then raise exception 'Inactive admin'; end if;
  case p_operation
  when 'registration' then
    section := 'registrations';
    select * into strict r from registrations where reference_id=p_input->>'reference' for update;
    if p_input ? 'expected_updated_at' and r.updated_at<>(p_input->>'expected_updated_at')::timestamptz then raise exception 'Registration changed; refresh before saving'; end if;
    update registrations set status=p_input->>'status',payment_status=p_input->>'payment_status',payment_reference=p_input->>'payment_reference',amount_paid=(p_input->>'amount_paid')::numeric,internal_notes=p_input->>'notes',updated_at=now() where reference_id=r.reference_id;
    insert into registration_history(registration_ref,actor,action,detail) values(r.reference_id,p_actor,'status/payment',jsonb_build_object('before',jsonb_build_object('status',r.status,'payment_status',r.payment_status,'amount_paid',r.amount_paid),'after',p_input));
    if coalesce((p_input->>'notify')::boolean,false) then
      insert into email_outbox(message_type,reference_id,to_addresses,subject,html,from_address) values('status-change',r.reference_id,array[r.contact_email],p_input->>'subject',p_input->>'html',p_input->>'from');
    end if;
  when 'checkin' then
    section := 'event-day';
    select * into strict p from participants where id=(p_input->>'participant_id')::uuid for update;
    select * into strict r from registrations where reference_id=p.registration_ref for update;
    if (r.status <> 'accepted' or r.payment_status not in ('paid','waived')) and not coalesce((p_input->>'override')::boolean,false) then raise exception 'Check-in requires acceptance and verified payment'; end if;
    if coalesce((p_input->>'override')::boolean,false) and length(coalesce(p_input->>'reason','')) < 5 then raise exception 'Override requires a reason'; end if;
    update participants set checked_in_at=case when (p_input->>'checked')::boolean then coalesce(checked_in_at,now()) else null end,checked_in_by=p_actor where id=p.id;
    insert into registration_history(registration_ref,actor,action,detail) values(r.reference_id,p_actor,'checkin',p_input);
  when 'allocation' then
    section := 'allocations';
    perform pg_advisory_xact_lock(hashtextextended('allocation:' || (p_input->>'committee_slug'),0));
    select * into strict p from participants where id=(p_input->>'participant_id')::uuid for update;
    select * into strict r from registrations where reference_id=p.registration_ref;
    if r.track <> 'gimun' or r.status <> 'accepted' then raise exception 'Allocate accepted GIMUN delegates only'; end if;
    select * into strict c from content_entries where collection='committees' and data->>'slug'=p_input->>'committee_slug' and status='published';
    if not exists(select 1 from jsonb_array_elements(c.data->'countryList') x where x->>'country'=p_input->>'country') then raise exception 'Country is not in the committee matrix'; end if;
    if exists(select 1 from country_reservations where committee_slug=p_input->>'committee_slug' and country=p_input->>'country') then raise exception 'Country is reserved'; end if;
    select count(*) into current_count from allocations where committee_slug=p_input->>'committee_slug' and participant_id<>p.id;
    cap := (c.data->>'capacity')::integer;
    if cap is not null and current_count >= cap then raise exception 'Committee capacity reached'; end if;
    insert into allocations(participant_id,committee_slug,country) values(p.id,p_input->>'committee_slug',p_input->>'country') on conflict(participant_id) do update set committee_slug=excluded.committee_slug,country=excluded.country;
    insert into registration_history(registration_ref,actor,action,detail) values(p.registration_ref,p_actor,'allocation',p_input);
  when 'reserve' then
    section := 'allocations';
    perform pg_advisory_xact_lock(hashtextextended('allocation:' || (p_input->>'committee_slug'),0));
    if exists(select 1 from allocations where committee_slug=p_input->>'committee_slug' and country=p_input->>'country') then raise exception 'Country is already allocated'; end if;
    if (p_input->>'reserved')::boolean then insert into country_reservations values(p_input->>'committee_slug',p_input->>'country',p_input->>'note') on conflict(committee_slug,country) do update set note=excluded.note;
    else delete from country_reservations where committee_slug=p_input->>'committee_slug' and country=p_input->>'country'; end if;
  when 'certificate' then
    section := 'certificates';
    select * into strict p from participants where id=(p_input->>'participant_id')::uuid;
    if p.checked_in_at is null and not coalesce((p_input->>'override')::boolean,false) then raise exception 'Attendance is required'; end if;
    if coalesce((p_input->>'override')::boolean,false) and length(coalesce(p_input->>'reason','')) < 5 then raise exception 'Override requires a reason'; end if;
    insert into certificates(participant_id,kind,serial) values(p.id,p_input->>'kind','CERT-' || gen_random_uuid()::text) on conflict(participant_id,kind) do nothing;
    select to_jsonb(t) into result from certificates t where participant_id=p.id and kind=p_input->>'kind';
  when 'inbox' then
    section := 'inbox';
    update contact_messages set handled_status=p_input->>'status',reply_note=p_input->>'note',assignee=nullif(p_input->>'assignee','')::uuid where id=p_input->>'id';
    if not found then raise exception 'Inquiry unavailable'; end if;
  when 'reply' then
    section := 'inbox';
    perform 1 from contact_messages where id=p_input->>'id' for update;
    if not found then raise exception 'Inquiry unavailable'; end if;
    insert into email_outbox(message_type,contact_id,to_addresses,subject,html,from_address)
    select 'reply',id,array[email],'Re: Your event inquiry',p_input->>'html',p_input->>'from' from contact_messages where id=p_input->>'id';
    update contact_messages set handled_status='replied',reply_note=p_input->>'body',assignee=p_actor where id=p_input->>'id';
  when 'promote' then
    section := 'clarifications';
    perform 1 from contact_messages where id=p_input->>'contact_id' and kind='clarification' for update;
    if not found then raise exception 'Not a clarification inquiry'; end if;
    perform save_content(p_input->'entry',p_actor);
    update contact_messages set handled_status='replied' where id=p_input->>'contact_id';
  when 'emergency' then
    section := 'schedule';
    perform save_content(p_input->'session',p_actor);
    perform save_content(p_input->'announcement',p_actor);
  when 'outbox' then
    section := 'email';
    if p_input->>'action'='retry' then
      update email_outbox set status='retry',next_attempt_at=now(),last_error=null where id=(p_input->>'id')::uuid and status in ('retry','failed','needs_review') and retry_until>now() and attempts<20;
    else
      update email_outbox set status='cancelled' where id=(p_input->>'id')::uuid and status in ('pending','retry','failed','needs_review');
    end if;
    if not found then raise exception 'Message cannot be retried or cancelled in its current state/window'; end if;
  when 'email' then
    section := 'email';
    for q in select value from jsonb_array_elements(p_input->'messages') loop
      insert into email_outbox(message_type,to_addresses,subject,html,from_address,attachments) values(q->>'type',array[q->>'to'],q->>'subject',q->>'html',p_input->>'from',coalesce(q->'attachments','[]'));
    end loop;
  when 'template' then
    section := 'email';
    insert into email_templates(id,subject,body) values(p_input->>'id',p_input->>'subject',p_input->>'body') on conflict(id) do update set subject=excluded.subject,body=excluded.body,updated_at=now();
  when 'survey-question' then
    section := 'feedback';
    insert into survey_questions(id,label,kind,active,sort_order) values((p_input->>'id')::uuid,p_input->>'label',p_input->>'kind',(p_input->>'active')::boolean,(p_input->>'sort_order')::integer) on conflict(id) do update set label=excluded.label,kind=excluded.kind,active=excluded.active,sort_order=excluded.sort_order;
  when 'archive' then
    section := 'close-out';
    perform 1 from site_settings where id='site' for update;
    update site_settings set data=jsonb_set(jsonb_set(jsonb_set(data,'{registrationStatus,gimunOpen}','false'),'{registrationStatus,mootCupOpen}','false'),'{phaseOverride}','"archived"'),version=version+1,updated_at=now() where id='site';
    insert into event_archives(name,snapshot,created_by) values(p_input->>'name',jsonb_build_object('settings',(select data from site_settings where id='site'),'content',(select coalesce(jsonb_agg(to_jsonb(e)),'[]') from content_entries e)),p_actor) returning id into v_id;
    result := jsonb_build_object('archive_id',v_id);
  else raise exception 'Unknown operation';
  end case;
  insert into audit_log(actor,action,section,entity_id,detail) values(p_actor,p_operation,section,coalesce(p_input->>'reference',p_input->>'id',p_input->>'participant_id'),case when p_operation in ('email','template') then '{}' else p_input - 'html' - 'from' end);
  return result;
end $$;
revoke all on function public.admin_operation(text,jsonb,uuid) from public,anon,authenticated;
grant execute on function public.admin_operation(text,jsonb,uuid) to service_role;

-- Record changes to users/media/templates even when made by provisioning scripts.
create function public.audit_admin_tables() returns trigger language plpgsql set search_path=public as $$
begin
  insert into audit_log(action,section,entity_id) values(TG_OP,TG_TABLE_NAME,coalesce(to_jsonb(new)->>'user_id',to_jsonb(new)->>'id',to_jsonb(old)->>'id'));
  return coalesce(new,old);
end $$;
create trigger admin_users_audit after insert or update or delete on public.admin_users for each row execute function public.audit_admin_tables();
create trigger media_audit after insert or update or delete on public.media_assets for each row execute function public.audit_admin_tables();
