import { can,sections,type AdminUser } from '@/lib/server/admin/permissions';
import { adminRevision } from '@/lib/server/live';
import { AdminNavigation } from './AdminNavigation';
import { LiveUpdates } from '@/components/LiveUpdates';
export async function AdminNav({user}:{user:AdminUser}){
 const live=await adminRevision(user).catch(()=>({revision:'unavailable'}));
 return <><AdminNavigation name={user.display_name} role={user.role} allowed={sections.filter(s=>can(user,s))}/><LiveUpdates admin initial={live.revision}/></>;
}
