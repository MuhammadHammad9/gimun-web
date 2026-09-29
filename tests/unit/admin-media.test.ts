import { beforeEach, describe, expect, it, vi } from 'vitest';
const state=vi.hoisted(()=>({asset:null as null|Record<string,unknown>,remove:vi.fn(),info:vi.fn(),references:[] as Record<string,unknown>[],filters:[] as unknown[][]}));
vi.mock('next/cache',()=>({revalidatePath:vi.fn()}));
vi.mock('@/lib/server/admin/auth',()=>({requirePermission:async()=>({user_id:'owner'})}));
vi.mock('@/lib/server/admin/read-all',()=>({readAll:async()=>state.references}));
vi.mock('@/lib/server/supabase',()=>({database:()=>({
 from:()=>{const chain={select:()=>chain,eq:(...args:unknown[])=>{state.filters.push(args);return chain;},single:async()=>({data:state.asset,error:null}),maybeSingle:async()=>({data:state.asset,error:null})};return chain;},
 storage:{from:()=>({remove:state.remove,info:state.info,getPublicUrl:()=>({data:{publicUrl:'https://media.test/file.png'}})})},
})}));
import { abandonUpload, deleteMedia, finishUpload } from '../../src/app/admin/media-actions';
beforeEach(()=>{state.asset=null;state.references=[];state.filters=[];state.remove.mockReset();state.info.mockReset();});
describe('media lifecycle authorization',()=>{
 it('does not contact storage when no owned pending upload exists',async()=>{
  await expect(abandonUpload('another-users-file')).rejects.toThrow('Pending upload not found');
  expect(state.filters).toContainEqual(['uploaded_by','owner']);expect(state.filters).toContainEqual(['state','pending']);
  expect(state.remove).not.toHaveBeenCalled();
 });
 it('makes verification retries harmless for an available asset',async()=>{
  state.asset={state:'available',size:12,mime:'image/png'};
  await expect(finishUpload('file.png')).resolves.toMatchObject({size:12});
  expect(state.remove).not.toHaveBeenCalled();expect(state.info).not.toHaveBeenCalled();
 });
 it('protects media referenced beyond the first thousand entries',async()=>{
  state.asset={path:'file.png'};state.references=Array.from({length:1002},(_,i)=>({data:i===1001?'https://media.test/file.png':'unrelated'}));
  await expect(deleteMedia('11111111-1111-4111-8111-111111111111')).resolves.toMatchObject({error:expect.stringContaining('retained')});
  expect(state.remove).not.toHaveBeenCalled();
 });
});
