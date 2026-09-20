'use client';
import { useState,useTransition } from 'react';
import { SchemaForm,type Schema } from './SchemaForm';
import { runOperation } from './ops-actions';
export function OperationForm({operation,initial,schema,title}:{operation:string;initial:Record<string,unknown>;schema:Schema;title:string}) {
  const [value,setValue]=useState(initial);const [message,setMessage]=useState('');const [pending,start]=useTransition();
  return <form className="admin-card" onSubmit={e=>{e.preventDefault();start(async()=>{const result=await runOperation(operation,value);setMessage(result.error || 'Saved.');});}}><h2>{title}</h2><fieldset disabled={pending}><SchemaForm schema={schema} value={value} onChange={v=>setValue(v as Record<string,unknown>)} /><button disabled={pending}>Save {title.toLowerCase()}</button></fieldset>{message&&<p role="status">{message}</p>}</form>;
}
