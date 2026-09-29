import { NextRequest } from 'next/server';
import { handleRegistration } from '@/lib/server/registration-handler';
export const maxDuration=60;
export async function POST(request:NextRequest){if(request.headers.get('origin')!==new URL(request.url).origin)return Response.json({success:false,message:'Invalid request origin.'},{status:403});return handleRegistration(request,true);}
