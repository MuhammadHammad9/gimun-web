import { can,sections,type AdminUser } from '@/lib/server/admin/permissions';
import { adminRevision } from '@/lib/server/live';
import { AdminNavigation } from './AdminNavigation';
import { LiveUpdates } from '@/components/LiveUpdates';
export async function AdminNav({user}:{user:AdminUser}){
 const live=await adminRevision(user).catch(()=>({revision:'unavailable',connected:false,websiteConnected:false,reason:'Live status is unavailable. Check the CMS connection.'}));
 return <><AdminNavigation name={user.display_name} role={user.role} allowed={sections.filter(s=>can(user,s))} websiteConnected={live.websiteConnected} websiteReason={live.reason}/><LiveUpdates admin initial={live.revision}/></>;
}
