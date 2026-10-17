import { NextRequest } from 'next/server';
import { handleRegistration } from '@/lib/server/registration-handler';
export const maxDuration=60;
// Registration now happens on the official external forms. The handler stays
// for staff tools and a possible return, but the public endpoint answers like
// a missing route unless REGISTRATION_API_ENABLED=1.
export async function POST(request:NextRequest){
  if(process.env.REGISTRATION_API_ENABLED!=='1')return new Response('Not Found',{status:404});
  return handleRegistration(request);
}
