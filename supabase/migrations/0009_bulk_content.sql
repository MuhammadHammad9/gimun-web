create function public.save_content_batch(p_entries jsonb,p_actor uuid) returns void language plpgsql security invoker set search_path=public as $$
declare entry jsonb; begin
  for entry in select value from jsonb_array_elements(p_entries) loop perform save_content(entry,p_actor); end loop;
end $$;
revoke all on function public.save_content_batch(jsonb,uuid) from public,anon,authenticated;
grant execute on function public.save_content_batch(jsonb,uuid) to service_role;
create function public.admin_operation_batch(p_operation text,p_inputs jsonb,p_actor uuid) returns void language plpgsql security invoker set search_path=public as $$
declare input jsonb; begin
  for input in select value from jsonb_array_elements(p_inputs) loop perform admin_operation(p_operation,input,p_actor); end loop;
end $$;
revoke all on function public.admin_operation_batch(text,jsonb,uuid) from public,anon,authenticated;
grant execute on function public.admin_operation_batch(text,jsonb,uuid) to service_role;
