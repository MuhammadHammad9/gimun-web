import { accessLabel,can,sections,type AdminUser } from '@/lib/server/admin/permissions';
import { adminSettings } from '@/lib/server/admin/modules';
import { adminRevision } from '@/lib/server/live';
import { AdminNavigation } from './AdminNavigation';
import { LiveUpdates } from '@/components/LiveUpdates';
export async function AdminNav({user}:{user:AdminUser}){
 const settings=await adminSettings();
 const live=await adminRevision(user).catch(()=>({revision:'unavailable',connected:false,websiteConnected:false,reason:'Live status is unavailable. Check the CMS connection.'}));
 return <><AdminNavigation name={user.display_name} role={accessLabel(user)} allowed={sections.filter(s=>can(user,s)&&settings.modules[s as keyof typeof settings.modules]!==false)} owner={user.role==='owner'} websiteConnected={live.websiteConnected} websiteReason={live.reason}/><LiveUpdates admin initial={live.revision}/></>;
}
