import 'server-only';
import { database } from '../supabase';
import { requirePermission } from './auth';
export async function operate(section: string, operation: string, input: Record<string, unknown>) {
  const user = await requirePermission(section, true);
  const { data,error } = await database().rpc('admin_operation',{ p_operation:operation,p_input:input,p_actor:user.user_id });
  if(error) throw new Error(error.message);
  return data;
}
export const escapeHtml = (s: string) => s.replace(/[&<>"']/g,c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
export function emailHtml(body: string) { return `<div style="font-family:Arial,sans-serif;line-height:1.6">${escapeHtml(body).replace(/\n/g,'<br />')}</div>`; }
export function renderTemplate(template: string, variables: Record<string,string>) {
  return template.replace(/\{\{([a-z_]+)\}\}/g,(_,key:string) => {
    if (!['name','reference','status','payment_status','event_name','survey_url','certificate_url'].includes(key) || !(key in variables)) throw new Error(`Unknown template variable: ${key}`);
    return variables[key];
  });
}
