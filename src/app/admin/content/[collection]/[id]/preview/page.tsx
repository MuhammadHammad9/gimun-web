import Link from 'next/link';
import { notFound } from 'next/navigation';
import { isCollection } from '@shared/lib/content/registry';
import { requirePermission } from '@backend/server/admin/auth';
import { database } from '@backend/server/supabase';
import { RecordDetails } from '@/app/admin/RecordDetails';
export const dynamic='force-dynamic';
export default async function Preview({params}:{params:Promise<{collection:string;id:string}>}){const {collection,id}=await params;if(!isCollection(collection))notFound();await requirePermission(collection);const {data,error}=await database().from('content_entries').select('data,version').eq('collection',collection).eq('id',id).single();if(error||!data)notFound();return <section className="admin-card"><span className="admin-status">Private saved draft · version {data.version}</span><h1>{data.data.title||data.data.name||'Content preview'}</h1><p>This is the saved draft content, visible only to authorized staff.</p><RecordDetails data={data.data}/><Link href={`/admin/content/${collection}/${id}`}>Back to editor</Link></section>;}
