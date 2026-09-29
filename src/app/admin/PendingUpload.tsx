 'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { abandonUpload, finishUpload } from './media-actions';
export function PendingUpload({path}:{path:string}) {
 const [message,setMessage]=useState('');const [pending,start]=useTransition();const router=useRouter();
 function run(verify:boolean){start(async()=>{try{if(verify)await finishUpload(path);else await abandonUpload(path);setMessage(verify?'File verified.':'Incomplete upload removed.');router.refresh();}catch(error){setMessage(error instanceof Error?error.message:'Unable to complete this action.');}});}
 return <div><p>This upload is incomplete and cannot be selected in content yet.</p><button disabled={pending} onClick={()=>run(true)}>Retry verification</button><button disabled={pending} className="secondary" onClick={()=>run(false)}>Remove incomplete upload</button>{message&&<p role="status">{message}</p>}</div>;
}
