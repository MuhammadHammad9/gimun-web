 'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Committee,ProblemCategory } from '@/lib/types';
import { GimunRegisterForm } from '@/components/forms/GimunRegisterForm';
import { MootRegisterForm } from '@/components/forms/MootRegisterForm';
export function WalkIn({committees,categories}:{committees:Committee[];categories:ProblemCategory[]}){const [track,setTrack]=useState('gimun');const router=useRouter();return <section className="admin-card"><label>Track<select value={track} onChange={e=>setTrack(e.target.value)}><option value="gimun">GIMUN</option><option value="moot">Moot Court</option></select></label>{track==='gimun'?<GimunRegisterForm committees={committees} endpoint="/admin/walk-in/submit" onSuccess={ref=>router.push(`/admin/registrations/${ref}`)}/>:<MootRegisterForm categories={categories} endpoint="/admin/walk-in/submit" onSuccess={ref=>router.push(`/admin/registrations/${ref}`)}/>}</section>;}
