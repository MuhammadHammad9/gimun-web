 'use client';
import { useState } from 'react';
import { OperationForm } from './OperationForm';
type Question={id:string;label:string;kind:string;active:boolean;sort_order:number};
export function QuestionManager({questions,newId}:{questions:Question[];newId:string}){const [selected,setSelected]=useState('');const q=questions.find(q=>q.id===selected)||{id:newId,label:'',kind:'rating',active:true,sort_order:0};return <section><label>Survey question<select value={selected} onChange={e=>setSelected(e.target.value)}><option value="">Create a new question</option>{questions.map(q=><option key={q.id} value={q.id}>{q.label}</option>)}</select></label><OperationForm key={q.id} operation="survey-question" title="Survey question" initial={q} schema={{type:'object',properties:{label:{type:'string'},kind:{enum:['rating','comment']},active:{type:'boolean'},sort_order:{type:'integer'}}}}/></section>;}
