'use client';
import { useState,useTransition } from 'react';
import { deleteMedia } from './media-actions';
export function DeleteMedia({id}:{id:string}){const [pending,start]=useTransition();const [message,setMessage]=useState('');return <p><button type="button" className="secondary" disabled={pending} onClick={()=>{if(!confirm('Delete this file permanently? This cannot be undone.'))return;start(async()=>{const r=await deleteMedia(id);setMessage(r.error||'Deleted.');});}}>Delete file</button>{message&&<span role="status">{message}</span>}</p>;}
