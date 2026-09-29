'use client';
import { useEffect,useRef,useState,useTransition } from 'react';
import { usePathname,useRouter } from 'next/navigation';
export function LiveUpdates({initial,admin=false}:{initial:string;admin?:boolean}){
  const router=useRouter(),path=usePathname();const baseline=useRef(initial);const [status,setStatus]=useState('Checking updates');const [time,setTime]=useState('');const [pending,start]=useTransition();const refreshing=useRef(false);
  useEffect(()=>{baseline.current=initial;refreshing.current=false;},[initial,path]);
  useEffect(()=>{
    if(!admin&&(path.startsWith('/admin')||path.startsWith('/survey/')||path.startsWith('/verify/')))return;
    let inFlight=false;let cancelled=false,timer:ReturnType<typeof setTimeout>;const controller=new AbortController();
    async function check(){
      if(inFlight)return;
      clearTimeout(timer);
      if(document.visibilityState==='hidden'){timer=setTimeout(check,5000);return;}
      inFlight=true;
      try{
        const response=await fetch(admin?'/admin/live':'/api/public/revision',{cache:'no-store',signal:AbortSignal.any([controller.signal,AbortSignal.timeout(4000)])});
        if(!response.ok||response.redirected)throw new Error('Unavailable');
        const result=await response.json();if(!result.connected)throw new Error('Unavailable');
        if(cancelled)return;
        setTime(new Date().toLocaleTimeString());
        const dirty=document.querySelector('[data-admin-dirty="true"]');
        if(result.revision!==baseline.current){
          if(dirty){setStatus('Changes available · your unsaved work is preserved');}
          else if(!refreshing.current){refreshing.current=true;setStatus('Updating');start(()=>router.refresh());}
        }else setStatus(result.websiteConnected===false?'Admin connected · website in fallback':'Live · checks every 5 seconds');
      }catch{if(!cancelled)setStatus(navigator.onLine?'Updates delayed · retrying':'Offline · changes may be out of date');}
      finally{inFlight=false;if(!cancelled)timer=setTimeout(check,5000);}
    }
    const resume=()=>{if(!cancelled)void check();};
    void check();window.addEventListener('online',resume);document.addEventListener('visibilitychange',resume);
    return()=>{cancelled=true;clearTimeout(timer);controller.abort();window.removeEventListener('online',resume);document.removeEventListener('visibilitychange',resume);};
  },[admin,path,router]);
  useEffect(()=>{if(!pending)refreshing.current=false;},[pending]);
  if(!admin)return null;
  return <div className="admin-live"><span role="status"><i aria-hidden="true"/>{status}</span>{time&&<small>Last checked {time}</small>}<button type="button" className="secondary" disabled={pending} onClick={()=>{if(!document.querySelector('[data-admin-dirty="true"]'))start(()=>router.refresh());else setStatus('Save or discard your changes before refreshing');}}>Refresh</button></div>;
}
