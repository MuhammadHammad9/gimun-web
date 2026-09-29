import { publicRevision } from '@/lib/server/live';
export const dynamic='force-dynamic';
export async function GET(){return Response.json(await publicRevision(),{headers:{'Cache-Control':'no-store'}});}
