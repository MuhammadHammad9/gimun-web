 'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { LayoutDashboard,PanelLeftClose,PanelLeftOpen,ArrowUpRight,LogOut } from 'lucide-react';
import { collections } from '@/lib/content/registry';
import { logout } from './auth-actions';
const groups=[['Website',...collections],['Event operations','registrations','allocations','event-day'],['Communications','inbox','email'],['Post-event','certificates','feedback'],['Administration','settings','media','users','audit','close-out']];
const labels:Record<string,string>={'event-day':'Check-in','moot-categories':'Moot categories','close-out':'Archive & retention',faq:'Questions & answers',settings:'Site settings'};
export function AdminNavigation({name,role,allowed}:{name:string;role:string;allowed:string[]}){
 const path=usePathname();const [open,setOpen]=useState(false);
 return <><header className="admin-topbar"><button className="admin-menu secondary" aria-expanded={open} aria-controls="admin-sidebar" onClick={()=>setOpen(!open)}>{open?<PanelLeftClose size={20}/>:<PanelLeftOpen size={20}/>} Menu</button><span>Event administration</span><Link href="/" target="_blank">View website <ArrowUpRight size={14}/></Link></header><aside id="admin-sidebar" className={`admin-sidebar ${open?'is-open':''}`}><Link className="admin-brand" href="/admin"><LayoutDashboard size={23}/><span>Event workspace<small>GIMUN & GMC</small></span></Link><nav aria-label="Admin sections"><Link href="/admin" aria-current={path==='/admin'?'page':undefined} onClick={()=>setOpen(false)}>Overview</Link>{groups.map(([title,...items])=>{const visible=items.filter(s=>allowed.includes(s));return visible.length?<div className="admin-nav-group" key={title}><p>{title}</p>{visible.map(s=>{const href=collections.includes(s as typeof collections[number])?`/admin/content/${s}`:`/admin/${s}`;return <Link key={s} href={href} aria-current={path===href||path.startsWith(href+'/')?'page':undefined} onClick={()=>setOpen(false)}>{labels[s]||s.replaceAll('-',' ')}</Link>;})}</div>:null;})}</nav><div className="admin-account"><strong>{name}</strong><small>{role}</small><div><Link href="/admin/mfa">Two-factor</Link><Link href="/admin/password">Password</Link></div><form action={logout}><button className="secondary"><LogOut size={14}/> Sign out</button></form></div></aside></>;
}
