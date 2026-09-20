import { notFound } from 'next/navigation';
import { requirePermission } from '@/lib/server/admin/auth';
import { can } from '@/lib/server/admin/permissions';
import { database } from '@/lib/server/supabase';
import { AdminNav } from '../../AdminNav';
import { InquiryActions } from '../../InquiryActions';
export default async function InquiryPage({params}:{params:Promise<{id:string}>}){const user=await requirePermission('inbox');const {id}=await params;const {data,error}=await database().from('contact_messages').select('*').eq('id',id).maybeSingle();if(error||!data)notFound();return <><AdminNav user={user}/><h1>Inquiry {id}</h1><div className="admin-card"><p>{data.name} · {data.email} · {data.kind}</p><p className="whitespace-pre-wrap">{data.message}</p></div>{can(user,'inbox',true)&&<InquiryActions inquiry={data} canPromote={can(user,'clarifications',true)}/>}</>;}
