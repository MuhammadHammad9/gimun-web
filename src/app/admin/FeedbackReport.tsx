import { readAll } from '@/lib/server/admin/read-all';
import { requirePermission } from '@/lib/server/admin/auth';
export async function FeedbackReport(){
 await requirePermission('feedback');const [responses,people]=await Promise.all([readAll('survey_responses','answers','participant_id'),readAll('participants','checked_in_at')]);const eligible=people.filter(p=>p.checked_in_at).length;
 const groups=new Map<string,{label:string;kind:string;values:unknown[]}>();
 for(const response of responses)for(const [id,answer] of Object.entries((response.answers??{}) as Record<string,{label:string;kind:string;value:unknown}|null>)){if(!answer||typeof answer!=='object')continue;const key=JSON.stringify([id,answer.label,answer.kind]);const group=groups.get(key)||{label:answer.label,kind:answer.kind,values:[]};group.values.push(answer.value);groups.set(key,group);}
 return <section className="admin-card"><h2>Feedback summary</h2><p>{responses.length} responses · {eligible} checked-in participants · {eligible?Math.round(responses.length/eligible*100):0}% response rate</p>{!groups.size&&<p>No feedback received yet.</p>}{[...groups].map(([key,q])=>{const ratings=q.values.filter((v):v is number=>typeof v==='number');return <div key={key}><h3>{q.label}</h3>{q.kind==='rating'?<p>{ratings.length?`Average ${(ratings.reduce((a,b)=>a+b,0)/ratings.length).toFixed(2)} / 5 (${ratings.length} answers)`:'No ratings yet.'}</p>:<ul>{q.values.map((v,i)=><li key={i}>{String(v)}</li>)}</ul>}</div>;})}</section>;
}
