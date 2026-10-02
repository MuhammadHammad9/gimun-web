import 'server-only';
import { database } from '../supabase';
const PAGE = 500;
function page(table:string,select:string,order:string,offset:number){let query=database().from(table).select(select).order(order);if(table==='content_entries')query=query.order('collection');return query.range(offset,offset+PAGE-1);}
// Call only after the section's permission check. The stable primary-key order
// avoids Supabase's default row cap silently truncating exports/operations.
export async function readAll(table:string,select='*',order='id') {
  const rows:Record<string,unknown>[]=[];
  for(let offset=0;;offset+=PAGE){const {data,error}=await page(table,select,order,offset);if(error)throw new Error(`Unable to load ${table}`);rows.push(...data as unknown as Record<string,unknown>[]);if(data.length<PAGE)break;}
  return rows;
}
/**
 * Whether any row matches, reading one page at a time and stopping at the
 * first match. Tables such as content_revisions grow with every save, so
 * loading them whole (as readAll does) gets slower and heavier over time.
 */
export async function someRow(table:string,select:string,order:string,match:(row:Record<string,unknown>)=>boolean) {
  for(let offset=0;;offset+=PAGE){const {data,error}=await page(table,select,order,offset);if(error)throw new Error(`Unable to load ${table}`);const rows=data as unknown as Record<string,unknown>[];if(rows.some(match))return true;if(rows.length<PAGE)return false;}
}
