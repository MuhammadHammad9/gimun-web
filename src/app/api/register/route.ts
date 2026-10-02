import { NextRequest } from 'next/server';
import { handleRegistration } from '@backend/server/registration-handler';
export const maxDuration=60;
export async function POST(request:NextRequest){return handleRegistration(request);}
