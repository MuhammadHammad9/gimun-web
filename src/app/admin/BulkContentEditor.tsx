'use client';
import { useState,useTransition } from 'react';
import { useDirtyGuard } from './useDirtyGuard';
import { useRouter } from 'next/navigation';
import type { Collection } from '@shared/lib/content/registry';
import { SchemaForm,emptyValue,type Schema } from './SchemaForm';
import { saveContentBatch } from './content-actions';
import { MediaUpload } from './MediaUpload';
import { newSubmissionKey } from '@frontend/lib/uuid';
export function BulkContentEditor({collection,schema}:{collection:Collection;schema:Schema}){
  const [items,setItems]=useState<Record<string,unknown>[]>([]);const [status,setStatus]=useState('draft');const [message,setMessage]=useState('');const [pending,start]=useTransition();
  useDirtyGuard(items.length>0);const router=useRouter();
  return <details data-admin-dirty={items.length?'true':undefined} className="admin-card"><summary className="font-bold cursor-pointer">{collection==='results'?'Bulk results entry':'Bulk gallery upload & publish'}</summary>{collection==='gallery'&&<MediaUpload onUploaded={assets=>setItems(old=>[...old,...assets.map(a=>({...emptyValue(schema) as Record<string,unknown>,id:`gallery-${newSubmissionKey()}`,image:a.url,title:a.alt,caption:a.alt,edition:'',category:'campus',aspectRatio:'landscape',location:''}))])}/>}<form onSubmit={e=>{e.preventDefault();start(async()=>{const result=await saveContentBatch(items.map((data,index)=>({collection,id:data.id,data,status,sort_order:index,version:0,publish_at:null,expire_at:null})));setMessage(result.error||'Batch saved.');if(result.success){setItems([]);router.refresh();};});}}><SchemaForm schema={{type:'array',items:schema}} value={items} onChange={v=>setItems((v as Record<string,unknown>[]).map(item=>({...item,id:item.id||`${collection}-${newSubmissionKey()}`})))} label="Entries"/><label>Publication state<select value={status} onChange={e=>setStatus(e.target.value)}><option>draft</option><option>published</option></select></label><button disabled={pending||!items.length}>Save batch</button><p role="status" aria-label="Bulk publish status">{message}</p>{collection==='results'&&<p>Publishing entries does not release winners until Settings → Results published is enabled.</p>}</form></details>;
}
