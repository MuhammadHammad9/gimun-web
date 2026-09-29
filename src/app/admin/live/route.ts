import { requireAdmin } from '@/lib/server/admin/auth';
import { adminRevision } from '@/lib/server/live';
export const dynamic='force-dynamic';
export async function GET(){const user=await requireAdmin();try{return Response.json(await adminRevision(user),{headers:{'Cache-Control':'private, no-store'}});}catch{return Response.json({connected:false},{status:503,headers:{'Cache-Control':'private, no-store'}});}}
