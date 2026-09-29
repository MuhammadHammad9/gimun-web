'use client';
import { useState,useTransition } from 'react';
import { runOperation,sendInvoice } from './ops-actions';
// Invoice and ticket re-send for one registration. Both only queue mail; delivery status is in Email.
export function RegistrationTools({reference,canEmail}:{reference:string;canEmail:boolean}){
  const [pending,start]=useTransition();const [message,setMessage]=useState('');
  if(!canEmail)return <div className="admin-card"><h2>Invoice & ticket</h2><p>Sending invoices or tickets requires email permission.</p></div>;
  return <div className="admin-card"><h2>Invoice & ticket</h2><p>The invoice uses the amount due, amount paid and the payment instructions in Settings. The ticket is the original receipt with its QR code, sent to the current contact email.</p>
    <button disabled={pending} onClick={()=>start(async()=>{const r=await sendInvoice(reference);setMessage(r.error||String(r.result));})}>Send invoice</button>
    <button className="secondary" disabled={pending} onClick={()=>start(async()=>{const r=await runOperation('resend-ticket',{reference});setMessage(r.error||'Ticket queued to the current contact email.');})}>Resend receipt & QR ticket</button>
    {message&&<p role="status">{message}</p>}</div>;
}
