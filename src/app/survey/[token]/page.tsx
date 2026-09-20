import { notFound } from 'next/navigation';
import { z } from 'zod';
import { database } from '@/lib/server/supabase';
import { SurveyForm } from './SurveyForm';
export const dynamic='force-dynamic';
export const metadata={title:'Event feedback',robots:{index:false,follow:false}};
export default async function SurveyPage({params}:{params:Promise<{token:string}>}){const {token}=await params;if(!z.uuid().safeParse(token).success)notFound();const db=database();const {data:p}=await db.from('participants').select('id').eq('survey_token',token).maybeSingle();if(!p)notFound();const {data:questions,error}=await db.from('survey_questions').select('id,label,kind').eq('active',true).order('sort_order');if(error)throw new Error('Survey unavailable');return <section className="max-w-xl mx-auto p-8 space-y-6"><h1 className="text-3xl">Event feedback</h1>{questions.length?<SurveyForm token={token} questions={questions}/>:<p>The survey is not open yet.</p>}</section>;}
