import { NextRequest } from 'next/server';
import { handleRegistration } from '@/lib/server/registration-handler';
import { routePermission } from '@/lib/server/admin/auth';
export const maxDuration=60;
export async function POST(request:NextRequest){
  if(request.headers.get('origin')!==new URL(request.url).origin)return Response.json({success:false,message:'Invalid request origin.'},{status:403});
  // The form reads JSON; an expired session used to answer with a 500 or a login page it could not parse.
  const actor=await routePermission('registrations',true,'json');
  if(actor instanceof Response)return actor;
  return handleRegistration(request,actor);
}
