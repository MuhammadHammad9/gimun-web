-- Working documents and immutable public releases. No browser table grants.
create table public.content_publications (
  release_id bigint generated always as identity primary key,
  collection text not null, entry_id text not null, data jsonb not null,
  source_version integer not null, sort_order integer not null default 0,
  effective_at timestamptz not null default now(), expire_at timestamptz,
  withdrawn boolean not null default false, cancelled_at timestamptz,
  actor uuid references auth.users(id), created_at timestamptz not null default now(),
  unique(collection,entry_id,source_version),
  check(expire_at is null or expire_at > effective_at)
);
create index publication_lookup on public.content_publications(collection,entry_id,effective_at desc,release_id desc) where cancelled_at is null;
insert into public.content_publications(collection,entry_id,data,source_version,sort_order,effective_at,expire_at,actor)
select collection,id,data,version,sort_order,least(coalesce(publish_at,updated_at),coalesce(expire_at-interval '1 microsecond','infinity'::timestamptz)),expire_at,updated_by from public.content_entries where status='published';
drop index public.one_pinned_announcement;

-- Pick the latest release before applying expiry: an expired replacement must
-- never resurrect an older publication. Only the most recent effective pin wins.
create view public.effective_content with (security_invoker=true) as
with latest as (
 select distinct on(collection,entry_id) * from public.content_publications
 where cancelled_at is null and effective_at<=now()
 order by collection,entry_id,effective_at desc,release_id desc
), visible as (
 select * from latest where not withdrawn and (expire_at is null or expire_at>now())
), pinned as (
 select release_id from latest where collection='announcements' and data->>'pinnedFlag'='true'
 order by effective_at desc,release_id desc limit 1
)
select collection,entry_id as id,
 case when collection='announcements' and data->>'pinnedFlag'='true' and release_id not in(select release_id from pinned)
 then jsonb_set(data,'{pinnedFlag}','false') else data end as data,
 source_version as version,sort_order,release_id,effective_at,expire_at from visible;

alter function public.save_content(jsonb,uuid) rename to save_content_core;
create function public.save_content(p_entry jsonb,p_actor uuid) returns void language plpgsql security invoker set search_path=public as $$
declare c text:=p_entry->>'collection'; k text:=p_entry->>'id'; old content_entries; start_at timestamptz;
begin
 if not admin_can(p_actor,case when c='site' then 'settings' else c end,true) then raise exception 'You do not have permission for this operation'; end if;
 perform pg_advisory_xact_lock(hashtextextended(c||':'||k,0));
 if c='committees' then
  perform pg_advisory_xact_lock(hashtextextended('committee-slugs',0));
  select * into old from content_entries where collection=c and id=k;
  if old.id is not null and old.data->>'slug'<>p_entry#>>'{data,slug}' and (exists(select 1 from allocations where committee_slug=old.data->>'slug') or exists(select 1 from country_reservations where committee_slug=old.data->>'slug')) then raise exception 'Release allocations and reservations before changing this committee URL'; end if;
  if exists(select 1 from content_entries where collection=c and id<>k and data->>'slug'=p_entry#>>'{data,slug}') then raise exception 'This committee URL is already in use'; end if;
  if exists(select 1 from allocations a where a.committee_slug=p_entry#>>'{data,slug}' and not exists(select 1 from jsonb_array_elements(p_entry#>'{data,countryList}') x where x->>'country'=a.country)) or exists(select 1 from country_reservations a where a.committee_slug=p_entry#>>'{data,slug}' and not exists(select 1 from jsonb_array_elements(p_entry#>'{data,countryList}') x where x->>'country'=a.country)) then raise exception 'Release assigned and reserved countries before removing them'; end if;
 end if;
 perform save_content_core(p_entry,p_actor);
 if c='site' then return; end if;
 if p_entry->>'status' in ('published','archived') then
  update content_publications set cancelled_at=now() where collection=c and entry_id=k and effective_at>now() and cancelled_at is null and source_version<>(p_entry->>'version')::integer+1;
  start_at:=case when p_entry->>'status'='archived' then now() else coalesce((p_entry->>'publish_at')::timestamptz,now()) end;
  insert into content_publications(collection,entry_id,data,source_version,sort_order,effective_at,expire_at,withdrawn,actor)
  values(c,k,p_entry->'data',(p_entry->>'version')::integer+1,coalesce((p_entry->>'sort_order')::integer,0),start_at,case when p_entry->>'status'='published' then (p_entry->>'expire_at')::timestamptz end,p_entry->>'status'='archived',p_actor) on conflict(collection,entry_id,source_version) do nothing;
 end if;
end $$;

create function public.cancel_content_schedule(p_collection text,p_id text,p_version integer,p_actor uuid) returns void language plpgsql security invoker set search_path=public as $$
begin
 if not admin_can(p_actor,p_collection,true) then raise exception 'Permission denied'; end if;
 perform 1 from content_entries where collection=p_collection and id=p_id and version=p_version for update;
 if not found then raise exception 'This entry changed. Reload before saving.'; end if;
 update content_publications set cancelled_at=now() where collection=p_collection and entry_id=p_id and effective_at>now() and cancelled_at is null;
 update content_entries set version=version+1,updated_at=now() where collection=p_collection and id=p_id;
 insert into audit_log(actor,action,section,entity_id) values(p_actor,'cancel-schedule',p_collection,p_id);
end $$;

-- Every write increments its section's revision in the same transaction.
create table public.live_revisions(section text primary key, revision bigint not null default 0);
create function public.bump_live_revision() returns trigger language plpgsql set search_path=public as $$
declare s text:=TG_ARGV[0];
begin
 if s='content' then s:=coalesce(to_jsonb(new)->>'collection',to_jsonb(old)->>'collection'); end if;
 insert into live_revisions values(s,1) on conflict(section) do update set revision=live_revisions.revision+1;
 return coalesce(new,old);
end $$;
do $$ declare pair text[]; begin
 foreach pair slice 1 in array array[['content_entries','content'],['content_publications','content'],['site_settings','settings'],['registrations','registrations'],['participants','event-day'],['allocations','allocations'],['country_reservations','allocations'],['contact_messages','inbox'],['email_outbox','email'],['certificates','certificates'],['survey_questions','feedback'],['survey_responses','feedback'],['admin_users','users'],['media_assets','media'],['event_archives','close-out'],['audit_log','audit']] loop
 execute format('create trigger live_revision after insert or update or delete on public.%I for each row execute function public.bump_live_revision(%L)',pair[1],pair[2]);
 end loop;
end $$;
create function public.public_revision() returns text language sql stable security invoker set search_path=public as $$
 select md5(coalesce((select string_agg(collection||':'||id||':'||release_id,',' order by collection,id) from effective_content),'')||coalesce((select string_agg(section||':'||revision,',' order by section) from live_revisions where section in ('settings','allocations')),'')||(now() at time zone 'Asia/Karachi')::date::text);
$$;

-- Validate reservations and composite operations at the database boundary.
alter function public.admin_operation(text,jsonb,uuid) rename to admin_operation_guarded;
create function public.admin_operation(p_operation text,p_input jsonb,p_actor uuid) returns jsonb language plpgsql security invoker set search_path=public as $$
declare result jsonb; r registrations;
begin
 if p_operation in ('registration','registration-contact','participant-edit','amount-due') then
  if not admin_can(p_actor,'registrations',true) then raise exception 'Registration permission required'; end if;
  select * into strict r from registrations where reference_id=coalesce(p_input->>'reference',(select registration_ref from participants where id=nullif(p_input->>'participant_id','')::uuid)) for update;
  if nullif(p_input->>'expected_updated_at','') is null or r.updated_at is distinct from (p_input->>'expected_updated_at')::timestamptz then raise exception 'Registration changed; refresh before saving'; end if;
 end if;
 if p_operation='emergency' and not admin_can(p_actor,'announcements',true) then raise exception 'Announcement permission required'; end if;
 if p_operation='promote' and not admin_can(p_actor,'inbox',true) then raise exception 'Inbox permission required'; end if;
 if (p_operation='reply' or (p_operation='registration' and coalesce((p_input->>'notify')::boolean,false))) and not admin_can(p_actor,'email',true) then raise exception 'Email permission required'; end if;
 if p_operation='reserve' and not exists(select 1 from effective_content c,jsonb_array_elements(c.data->'countryList') x where c.collection='committees' and c.data->>'slug'=p_input->>'committee_slug' and x->>'country'=p_input->>'country') then raise exception 'Choose a published committee and one of its countries'; end if;
 if p_operation='unassign' then
  if not admin_can(p_actor,'allocations',true) then raise exception 'Permission denied'; end if;
  delete from allocations where participant_id=(p_input->>'participant_id')::uuid;
  insert into audit_log(actor,action,section,entity_id) values(p_actor,'unassign','allocations',p_input->>'participant_id');
  return '{}';
 end if;
 if p_operation='amount-due' then
  if not admin_can(p_actor,'registrations',true) then raise exception 'Permission denied'; end if;
  select * into strict r from registrations where reference_id=p_input->>'reference' for update;
  if r.updated_at<>(p_input->>'expected_updated_at')::timestamptz then raise exception 'Registration changed; refresh before saving'; end if;
  if length(trim(p_input->>'reason'))<5 or (p_input->>'amount_due')::numeric<0 then raise exception 'Enter an amount and correction reason'; end if;
  update registrations set amount_due=(p_input->>'amount_due')::numeric,updated_at=now() where reference_id=r.reference_id;
  insert into registration_history(registration_ref,actor,action,detail) values(r.reference_id,p_actor,'amount-due',jsonb_build_object('before',r.amount_due,'after',p_input->'amount_due','reason',p_input->>'reason'));
  insert into audit_log(actor,action,section,entity_id) values(p_actor,'amount-due','registrations',r.reference_id);
  return '{}';
 end if;
 result:=admin_operation_guarded(p_operation,p_input,p_actor);
 return result;
end $$;

alter table public.media_assets add column state text not null default 'available' check(state in ('pending','available'));
do $$ declare t text; begin
 foreach t in array array['content_publications','live_revisions'] loop
 execute format('alter table public.%I enable row level security',t);
 execute format('revoke all on public.%I from public,anon,authenticated',t);
 execute format('grant all on public.%I to service_role',t);
 end loop;
end $$;
revoke all on public.effective_content from public,anon,authenticated;
grant select on public.effective_content to service_role;
grant usage,select on all sequences in schema public to service_role;
revoke all on function public.save_content(jsonb,uuid),public.cancel_content_schedule(text,text,integer,uuid),public.public_revision(),public.admin_operation(text,jsonb,uuid) from public,anon,authenticated;
grant execute on function public.save_content(jsonb,uuid),public.cancel_content_schedule(text,text,integer,uuid),public.public_revision(),public.admin_operation(text,jsonb,uuid) to service_role;

-- Initial imports remain compatible with the existing seed tool. Later updates
-- must use save_content so working drafts cannot change the live snapshot.
create function public.seed_publication() returns trigger language plpgsql set search_path=public as $$
begin
 if new.status='published' then
 insert into content_publications(collection,entry_id,data,source_version,sort_order,effective_at,expire_at,actor)
 values(new.collection,new.id,new.data,new.version,new.sort_order,coalesce(new.publish_at,now()),new.expire_at,new.updated_by)
 on conflict(collection,entry_id,source_version) do nothing;
 end if;return new;
end $$;
create trigger seed_publication after insert on public.content_entries for each row execute function public.seed_publication();

create function public.create_walkin_registration(p_payload jsonb,p_actor uuid) returns jsonb language plpgsql security invoker set search_path=public as $$
declare declarations text; arguments text; result jsonb;
begin
 if not admin_can(p_actor,'registrations',true) then raise exception 'Registration permission required'; end if;
 select string_agg(format('%I %s',name,typ::regtype),',' order by ord),string_agg(format('%I => x.%I',name,name),',' order by ord)
 into declarations,arguments
 from pg_proc p, unnest(p.proargnames,p.proargtypes::oid[]) with ordinality as a(name,typ,ord)
 where p.oid='public.create_registration_v2'::regproc;
 execute format('select public.create_registration_v2(%s) from jsonb_to_record($1) as x(%s)',arguments,declarations) into result using p_payload;
 insert into audit_log(actor,action,section,entity_id) values(p_actor,'walk-in-registration','registrations',result->>'referenceId');
 return result;
end $$;
revoke all on function public.create_walkin_registration(jsonb,uuid) from public,anon,authenticated;
grant execute on function public.create_walkin_registration(jsonb,uuid) to service_role;

-- Privileged entry points authorize the actor before calling private helpers.
alter function public.save_content(jsonb,uuid) security definer;
alter function public.admin_operation(text,jsonb,uuid) security definer;
revoke execute on function public.save_content_core(jsonb,uuid),public.admin_operation_core(text,jsonb,uuid),public.admin_operation_guarded(text,jsonb,uuid) from service_role;

create or replace function public.admin_operation_core(p_operation text,p_input jsonb,p_actor uuid) returns jsonb language plpgsql security invoker set search_path=public as $$
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
    select (jsonb_populate_record(null::content_entries,to_jsonb(e)||jsonb_build_object('status','published'))).* into strict c from effective_content e where e.collection='committees' and e.data->>'slug'=p_input->>'committee_slug';
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

create function public.retention_review(p_actor uuid,p_before timestamptz,p_policy text,p_legal_basis text,p_privacy_contact text,p_execute boolean,p_expected bigint,p_token text)
returns jsonb language plpgsql security invoker set search_path=public as $$
declare base jsonb; refs text[]; emails text[]; impact jsonb; token text; identities text;
begin
 -- Match and lock the full destructive scope before calculating the preview.
 if not admin_can(p_actor,'close-out',true) then raise exception 'Owner required'; end if;
 lock table registrations,contact_messages,email_outbox,participants,certificates,survey_responses,registration_history,audit_log in share row exclusive mode;
 base:=retention_cleanup(p_actor,p_before,p_policy,p_legal_basis,p_privacy_contact,false,0);
 select coalesce(array_agg(reference_id),'{}') into refs from registrations where submitted_at<p_before and contact_email<>'anonymized@invalid.example';
 select array_agg(distinct email) into emails from (select contact_email email from registrations where reference_id=any(refs) union select email from participants where registration_ref=any(refs) union select email from contact_messages where submitted_at<p_before) a;
 impact:=jsonb_build_object(
 'participants',(select count(*) from participants where registration_ref=any(refs)),
 'certificates',(select count(*) from certificates where participant_id in(select id from participants where registration_ref=any(refs))),
 'survey_responses',(select count(*) from survey_responses where participant_id in(select id from participants where registration_ref=any(refs))),
 'emails',(select count(*) from email_outbox where reference_id=any(refs) or contact_id in(select id from contact_messages where submitted_at<p_before) or to_addresses&&emails or created_at<p_before),
 'history',(select count(*) from registration_history where registration_ref=any(refs)),
 'audit_details',(select count(*) from audit_log where section in ('registrations','inbox','event-day','email','certificates','feedback','allocations')));
 select string_agg(value,',' order by value) into identities from (
 select 'r:'||reference_id||':'||updated_at as value from registrations where reference_id=any(refs)
 union all select 'c:'||id from contact_messages where submitted_at<p_before
 union all select 'p:'||id from participants where registration_ref=any(refs)
 union all select 'e:'||id from email_outbox where reference_id=any(refs) or contact_id in(select id from contact_messages where submitted_at<p_before) or to_addresses&&emails or created_at<p_before
 union all select 'cert:'||id from certificates where participant_id in(select id from participants where registration_ref=any(refs))
 union all select 'survey:'||participant_id from survey_responses where participant_id in(select id from participants where registration_ref=any(refs))
 ) items;
 token:=md5(coalesce(identities,'')||impact::text||p_actor::text||p_before::text||p_policy||p_legal_basis||p_privacy_contact);
 if p_execute then
  if p_token is distinct from token then raise exception 'Affected records changed. Run a fresh preview.'; end if;
  base:=retention_cleanup(p_actor,p_before,p_policy,p_legal_basis,p_privacy_contact,true,p_expected);
 end if;
 return base||jsonb_build_object('impact',impact,'token',token);
end $$;
revoke all on function public.retention_review(uuid,timestamptz,text,text,text,boolean,bigint,text) from public,anon,authenticated;
grant execute on function public.retention_review(uuid,timestamptz,text,text,text,boolean,bigint,text) to service_role;

-- Slugs are route keys; enforce uniqueness even for privileged direct writes.
create unique index content_committee_slug_unique on public.content_entries ((data->>'slug')) where collection='committees';

-- Keep reservation validity at the database boundary, including imports.
create function public.validate_country_reservation() returns trigger language plpgsql set search_path=public as $$
begin
 if not exists(select 1 from effective_content c,jsonb_array_elements(c.data->'countryList') x where c.collection='committees' and c.data->>'slug'=new.committee_slug and x->>'country'=new.country) then
  raise exception 'Choose a published committee and one of its countries';
 end if;
 return new;
end $$;
create trigger validate_country_reservation before insert or update on public.country_reservations for each row execute function public.validate_country_reservation();
