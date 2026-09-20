'use server';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { requirePermission } from '@/lib/server/admin/auth';
import { database } from '@/lib/server/supabase';
const types={'image/jpeg':'jpg','image/png':'png','image/webp':'webp','application/pdf':'pdf'} as const;
export async function startUpload(input:unknown){
  const user=await requirePermission('media',true);
  const parsed=z.object({mime:z.enum(['image/jpeg','image/png','image/webp','application/pdf']),size:z.number().int().positive(),alt:z.string().min(1).max(500)}).parse(input);
  if(parsed.size>(parsed.mime==='application/pdf'?25:5)*1024*1024)throw new Error('File is too large. Images: 5 MB; PDFs: 25 MB.');
  const path=`${user.user_id}/${randomUUID()}.${types[parsed.mime]}`;
  const db=database();const {data,error}=await db.storage.from('media').createSignedUploadUrl(path,{upsert:false});
  if(error)throw new Error('Unable to create upload URL. Configure the media bucket.');
  const {error:insertError}=await db.from('media_assets').insert({path,mime:parsed.mime,size:parsed.size,alt:parsed.alt,uploaded_by:user.user_id});
  if(insertError)throw new Error('Unable to record upload metadata.');
  return {path,token:data.token};
}
export async function finishUpload(path:string){
  const user=await requirePermission('media',true);const db=database();
  const {data:asset,error}=await db.from('media_assets').select('*').eq('path',path).eq('uploaded_by',user.user_id).single();
  if(error||!asset)throw new Error('Upload is not owned by this account.');
  const {data:info,error:infoError}=await db.storage.from('media').info(path);
  if(infoError||info.size!==asset.size||info.contentType!==asset.mime)throw new Error('Uploaded file does not match its declared size/type.');
  revalidatePath('/admin/media');
  return {url:db.storage.from('media').getPublicUrl(path).data.publicUrl,size:asset.size,mime:asset.mime};
}
