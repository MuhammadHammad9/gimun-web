'use client';
import { useState,useTransition } from 'react';
import type { Collection } from '@/lib/content/registry';
import { SchemaForm,emptyValue,type Schema } from './SchemaForm';
import { saveContentBatch } from './content-actions';
import { MediaUpload } from './MediaUpload';
export function BulkContentEditor({collection,schema}:{collection:Collection;schema:Schema}){
  const [items,setItems]=useState<Record<string,unknown>[]>([]);const [status,setStatus]=useState('draft');const [message,setMessage]=useState('');const [pending,start]=useTransition();
  return <details className="admin-card"><summary className="font-bold cursor-pointer">{collection==='results'?'Bulk results entry':'Bulk gallery upload & publish'}</summary>{collection==='gallery'&&<MediaUpload onUploaded={assets=>setItems(old=>[...old,...assets.map(a=>({...emptyValue(schema) as Record<string,unknown>,id:`gallery-${crypto.randomUUID()}`,image:a.url,title:a.alt,caption:a.alt,edition:'',category:'campus',aspectRatio:'landscape',location:''}))])}/>}<form onSubmit={e=>{e.preventDefault();start(async()=>{const result=await saveContentBatch(items.map((data,index)=>({collection,id:data.id,data,status,sort_order:index,version:0,publish_at:null,expire_at:null})));setMessage(result.error||'Batch saved.');if(result.success)setItems([]);});}}><SchemaForm schema={{type:'array',items:schema}} value={items} onChange={v=>setItems((v as Record<string,unknown>[]).map(item=>({...item,id:item.id||`${collection}-${crypto.randomUUID()}`})))} label="Entries"/><label>Publication state<select value={status} onChange={e=>setStatus(e.target.value)}><option>draft</option><option>published</option></select></label><button disabled={pending||!items.length}>Save batch</button><p role="status">{message}</p>{collection==='results'&&<p>Publishing entries does not release winners until Settings → Results published is enabled.</p>}</form></details>;
}
