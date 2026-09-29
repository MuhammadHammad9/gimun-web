'use server';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { requirePermission } from '@/lib/server/admin/auth';
import { readAll } from '@/lib/server/admin/read-all';
import { database } from '@/lib/server/supabase';
const types={'image/jpeg':'jpg','image/png':'png','image/webp':'webp','application/pdf':'pdf'} as const;
export async function startUpload(input:unknown){
  const user=await requirePermission('media',true);
  const parsed=z.object({mime:z.enum(['image/jpeg','image/png','image/webp','application/pdf']),size:z.number().int().positive(),alt:z.string().min(1).max(500)}).parse(input);
  if(parsed.size>(parsed.mime==='application/pdf'?25:5)*1024*1024)throw new Error('File is too large. Images: 5 MB; PDFs: 25 MB.');
  // Random object name only: public URLs must not reveal which admin uploaded the file.
  const path=`${randomUUID()}.${types[parsed.mime]}`;
  const db=database();const {data,error}=await db.storage.from('media').createSignedUploadUrl(path,{upsert:false});
  if(error)throw new Error('Unable to create upload URL. Configure the media bucket.');
  const {error:insertError}=await db.from('media_assets').insert({path,mime:parsed.mime,size:parsed.size,alt:parsed.alt,uploaded_by:user.user_id,state:'pending'});
  if(insertError)throw new Error('Unable to record upload metadata.');
  return {path,token:data.token};
}
export async function finishUpload(path:string){
  const user=await requirePermission('media',true);const db=database();
  const {data:asset,error}=await db.from('media_assets').select('*').eq('path',path).eq('uploaded_by',user.user_id).single();
  if(error||!asset)throw new Error('Upload is not owned by this account.');
  if(asset.state==='available')return {url:db.storage.from('media').getPublicUrl(path).data.publicUrl,size:asset.size,mime:asset.mime};
  if(asset.state!=='pending')throw new Error('This upload cannot be verified in its current state.');
  const {data:info,error:infoError}=await db.storage.from('media').info(path);
  if(infoError||info.size!==asset.size||info.contentType!==asset.mime){
    // Do not leave a metadata row pointing at a missing or mismatched file.
    const removed=await db.storage.from('media').remove([path]);
    if(removed.error)throw new Error('File verification failed and cleanup could not finish. Retry cleanup.');
    const deleted=await db.from('media_assets').delete().eq('path',path).eq('uploaded_by',user.user_id).eq('state','pending');
    if(deleted.error)throw new Error('Invalid file removed, but metadata cleanup failed. Retry cleanup.');
    throw new Error('Uploaded file does not match its declared size/type, so it was discarded. Try again.');
  }
  const verified=await db.from('media_assets').update({state:'available'}).eq('path',path).eq('uploaded_by',user.user_id);
  if(verified.error)throw new Error('File uploaded but verification could not be recorded. Retry verification.');
  revalidatePath('/admin/media');
  return {url:db.storage.from('media').getPublicUrl(path).data.publicUrl,size:asset.size,mime:asset.mime};
}
/** Clears a row whose upload never completed (the browser upload failed or was abandoned). */
export async function abandonUpload(path:string){
  const user=await requirePermission('media',true);const db=database();
  const {data:asset,error}=await db.from('media_assets').select('path,state').eq('path',path).eq('uploaded_by',user.user_id).eq('state','pending').maybeSingle();
  if(error||!asset)throw new Error('Pending upload not found for this account.');
  const removed=await db.storage.from('media').remove([asset.path]);if(removed.error)throw new Error('Upload cleanup failed.');
  const deleted=await db.from('media_assets').delete().eq('path',asset.path).eq('uploaded_by',user.user_id).eq('state','pending');if(deleted.error)throw new Error('Upload metadata cleanup failed.');
}
/** Deletes a file only when no content entry or setting still links to it. */
export async function deleteMedia(id:string){
  await requirePermission('media',true);const db=database();
  const {data:asset,error}=await db.from('media_assets').select('path').eq('id',z.uuid().parse(id)).single();
  if(error||!asset)return {error:'Media not found.'};
  const url=db.storage.from('media').getPublicUrl(asset.path).data.publicUrl;
  let references:Record<string,unknown>[];
  try{references=(await Promise.all([readAll('content_entries','collection,id,data'),readAll('site_settings','data'),readAll('content_revisions','snapshot'),readAll('content_publications','data','release_id'),readAll('event_archives','snapshot')])).flat();}catch{return {error:'Unable to verify file references. No file was deleted.'};}
  if(references.some(row=>JSON.stringify(row).includes(url)))return {error:'This file is retained by content, a revision, a publication, or an archive. Replace it without deleting the original.'};
  const removed=await db.storage.from('media').remove([asset.path]);if(removed.error)return {error:'Unable to delete the file.'};
  const deleted=await db.from('media_assets').delete().eq('id',id);if(deleted.error)return {error:'File removed, but metadata cleanup failed. Retry deletion.'};revalidatePath('/admin/media');return {result:'Deleted.'};
}
