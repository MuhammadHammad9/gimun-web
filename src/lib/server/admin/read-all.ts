import 'server-only';
import { database } from '../supabase';
// Call only after the section's permission check. The stable primary-key order
// avoids Supabase's default row cap silently truncating exports/operations.
export async function readAll(table:string,select='*',order='id') {
  const rows:Record<string,unknown>[]=[];
  for(let offset=0;;offset+=500){const {data,error}=await database().from(table).select(select).order(order).range(offset,offset+499);if(error)throw new Error(`Unable to load ${table}`);rows.push(...data as unknown as Record<string,unknown>[]);if(data.length<500)break;}
  return rows;
}
