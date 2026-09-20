'use server';
import { z } from 'zod';
import { headers } from 'next/headers';
import { database } from '@/lib/server/supabase';
import { enforceRateLimit,clientIp } from '@/lib/server/submissions';
export async function submitSurvey(token:string,answers:Record<string,unknown>){
  if(!z.uuid().safeParse(token).success)return {error:'Invalid survey link.'};
  if(!(await enforceRateLimit('survey',clientIp(new Request('http://localhost',{headers:await headers()})))).allowed)return {error:'Too many attempts. Try again later.'};
  const db=database();const {data:p,error}=await db.from('participants').select('id').eq('survey_token',token).maybeSingle();if(error||!p)return {error:'Invalid survey link.'};
  const {data:questions,error:questionsError}=await db.from('survey_questions').select('*').eq('active',true);if(questionsError||!questions?.length)return {error:'Survey is not available.'};
  const clean:Record<string,unknown>={};for(const q of questions){const v=q.kind==='rating'?z.number().int().min(1).max(5).safeParse(Number(answers[q.id])):z.string().min(1).max(5000).safeParse(answers[q.id]);if(!v.success)return {error:'Please answer every question. Ratings range from 1 to 5.'};clean[q.id]={label:q.label,kind:q.kind,value:v.data};}
  const {error:insertError}=await db.from('survey_responses').insert({participant_id:p.id,answers:clean});if(insertError)return {error:insertError.code==='23505'?'A response has already been recorded for this link.':'Could not save. Please try again.'};return {success:true};
}
