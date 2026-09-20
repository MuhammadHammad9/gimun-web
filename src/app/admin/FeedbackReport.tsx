import { readAll } from '@/lib/server/admin/read-all';
import { requirePermission } from '@/lib/server/admin/auth';
export async function FeedbackReport(){
  await requirePermission('feedback');
  const [questions,responses,people]=await Promise.all([readAll('survey_questions'),readAll('survey_responses','answers','participant_id'),readAll('participants','checked_in_at')]);
  const eligible=people.filter(p=>p.checked_in_at).length;
  return <section className="admin-card"><h2>Feedback summary</h2><p>{responses.length} responses · {eligible} checked-in participants · {eligible?Math.round(responses.length/eligible*100):0}% response rate</p>{questions.map(q=>{const values=responses.map(r=>(r.answers as Record<string,{value:unknown}>)[String(q.id)]?.value).filter(v=>v!==undefined);const ratings=values.filter((v):v is number=>typeof v==='number');return <div key={String(q.id)} className="my-4"><h3>{String(q.label)}</h3>{q.kind==='rating'?<p>{ratings.length?`Average ${(ratings.reduce((a,b)=>a+b,0)/ratings.length).toFixed(2)} / 5 (${ratings.length} answers)`:'No ratings yet.'}</p>:<ul>{values.map((v,i)=><li key={i} className="whitespace-pre-wrap border-b py-2">{String(v)}</li>)}</ul>}</div>;})}</section>;
}
