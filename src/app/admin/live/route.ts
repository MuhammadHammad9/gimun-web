import { requireAdmin } from '@backend/server/admin/auth';
import { adminRevision } from '@backend/server/live';
export const dynamic='force-dynamic';
const headers={'Cache-Control':'private, no-store'};
/** Polled by every open admin tab. Failures answer JSON: the poller cannot follow a redirect to the login page. */
export async function GET(){
  let user;
  try{user=await requireAdmin();}catch{return Response.json({connected:false},{status:401,headers});}
  try{return Response.json(await adminRevision(user),{headers});}catch{return Response.json({connected:false},{status:503,headers});}
}
