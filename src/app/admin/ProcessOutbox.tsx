'use client';
import { useState,useTransition } from 'react';
import { processOutbox } from './ops-actions';
export function ProcessOutbox(){
  const [pending,start]=useTransition();const [message,setMessage]=useState('');
  return <div className="admin-card"><h2>Deliver queued emails</h2><p>Each run processes due messages for up to 45 seconds. Run again while pending messages remain. Delayed retries remain scheduled until their next attempt.</p><button disabled={pending} onClick={()=>start(async()=>{const r=await processOutbox();setMessage(r.error||`Claimed ${r.result!.claimed}; sent ${r.result!.sent}; retry ${r.result!.retried}; failed ${r.result!.failed}; review ${r.result!.needsReview}.`);})}>{pending?'Processing…':'Process due messages'}</button><p role="status">{message}</p></div>;
}
