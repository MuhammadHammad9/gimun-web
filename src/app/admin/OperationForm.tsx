 'use client';
import { useState,useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { SchemaForm,type Schema } from './SchemaForm';
import { runOperation } from './ops-actions';
import { useDirtyGuard } from './useDirtyGuard';
export function OperationForm({operation,initial,schema,title}:{operation:string;initial:Record<string,unknown>;schema:Schema;title:string}){
 const [value,setValue]=useState(initial),[source,setSource]=useState(JSON.stringify(initial)),[dirty,setDirty]=useState(false),[message,setMessage]=useState('');const [pending,start]=useTransition();const router=useRouter();useDirtyGuard(dirty);
 if(source!==JSON.stringify(initial)){setSource(JSON.stringify(initial));if(!dirty)setValue(initial);}
 const conflict=dirty&&initial.expected_updated_at!==undefined&&initial.expected_updated_at!==value.expected_updated_at;
 return <form className="admin-card" data-admin-dirty={dirty?'true':undefined} onSubmit={e=>{e.preventDefault();start(async()=>{try{const result=await runOperation(operation,value);setMessage(result.error||'Saved.');if(!result.error){setDirty(false);if(result.record)setValue({...value,...result.record});router.refresh();}}catch{setMessage('Unable to save. Your changes are preserved.');}});}}><h2>{title}</h2>{conflict&&<p role="alert">This record changed. Discard these changes and review the latest record.</p>}{dirty&&<button type="button" className="secondary" onClick={()=>{setValue(initial);setDirty(false);}}>Discard changes</button>}<fieldset disabled={pending}><SchemaForm schema={schema} value={value} onChange={v=>{setValue(v as Record<string,unknown>);setDirty(true);}}/><button disabled={pending||conflict}>{pending?'Saving…':`Save ${title.toLowerCase()}`}</button></fieldset>{message&&<p role="status">{message}</p>}</form>;
}
