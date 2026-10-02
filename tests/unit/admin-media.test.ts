import { beforeEach, describe, expect, it, vi } from 'vitest';
const state=vi.hoisted(()=>({asset:null as null|Record<string,unknown>,remove:vi.fn(),info:vi.fn(),createUpload:vi.fn(),insert:vi.fn(),references:[] as Record<string,unknown>[],filters:[] as unknown[][]}));
vi.mock('next/cache',()=>({revalidatePath:vi.fn()}));
vi.mock('@backend/server/admin/auth',()=>({requirePermission:async()=>({user_id:'owner'})}));
vi.mock('@backend/server/admin/read-all',()=>({readAll:async()=>state.references,someRow:async(_t:string,_s:string,_o:string,match:(row:Record<string,unknown>)=>boolean)=>state.references.some(match)}));
vi.mock('@backend/server/supabase',()=>({database:()=>({
 from:()=>{const chain={select:()=>chain,eq:(...args:unknown[])=>{state.filters.push(args);return chain;},single:async()=>({data:state.asset,error:null}),maybeSingle:async()=>({data:state.asset,error:null}),insert:state.insert,delete:()=>chain,update:()=>chain};return chain;},
 storage:{from:()=>({createSignedUploadUrl:state.createUpload,remove:state.remove,info:state.info,getPublicUrl:()=>({data:{publicUrl:'https://media.test/file.png'}})})},
})}));
import { abandonUpload, deleteMedia, finishUpload, startUpload } from '../../src/app/admin/media-actions';
beforeEach(()=>{state.asset=null;state.references=[];state.filters=[];state.remove.mockReset();state.info.mockReset();state.createUpload.mockReset();state.insert.mockReset();state.createUpload.mockResolvedValue({data:{token:'signed-token'},error:null});state.insert.mockResolvedValue({error:null});state.remove.mockResolvedValue({error:null});});
describe('media lifecycle authorization',()=>{
 it('does not contact storage when no owned pending upload exists',async()=>{
  await expect(abandonUpload('another-users-file')).resolves.toEqual({error:expect.stringContaining('Pending upload not found')});
  expect(state.filters).toContainEqual(['uploaded_by','owner']);expect(state.filters).toContainEqual(['state','pending']);
  expect(state.remove).not.toHaveBeenCalled();
 });
 it('makes verification retries harmless for an available asset',async()=>{
  state.asset={state:'available',size:12,mime:'image/png'};
  await expect(finishUpload('file.png')).resolves.toMatchObject({size:12});
  expect(state.remove).not.toHaveBeenCalled();expect(state.info).not.toHaveBeenCalled();
 });
 it('removes the storage object when metadata cannot be recorded',async()=>{
  state.insert.mockResolvedValue({error:{message:'insert failed'}});
  await expect(startUpload({mime:'image/png',size:12,alt:'A test image'})).resolves.toEqual({error:expect.stringContaining('upload was not recorded')});
  expect(state.remove).toHaveBeenCalledWith([expect.stringMatching(/\.png$/)]);
 });
 it('cleans up a mismatched uploaded file and its pending metadata',async()=>{
  state.asset={path:'file.png',state:'pending',size:12,mime:'image/png',alt:'A test image'};
  state.info.mockResolvedValue({data:{size:13,contentType:'image/png'},error:null});
  await expect(finishUpload('file.png')).resolves.toEqual({error:expect.stringContaining('did not match')});
  expect(state.remove).toHaveBeenCalledWith(['file.png']);
 });
 it('reports expected failures as results, never as thrown errors',async()=>{
  // Thrown server-action messages are replaced by a generic text in production.
  await expect(startUpload({mime:'image/png',size:6*1024*1024,alt:'Too big'})).resolves.toEqual({error:expect.stringContaining('too large')});
  await expect(finishUpload('../escape')).resolves.toEqual({error:'Invalid media path.'});
  await expect(deleteMedia('not-a-uuid')).resolves.toEqual({error:'Media not found.'});
  expect(state.createUpload).not.toHaveBeenCalled();
 });
 it('protects media referenced beyond the first thousand entries',async()=>{
  state.asset={path:'file.png'};state.references=Array.from({length:1002},(_,i)=>({data:i===1001?'https://media.test/file.png':'unrelated'}));
  await expect(deleteMedia('11111111-1111-4111-8111-111111111111')).resolves.toMatchObject({error:expect.stringContaining('retained')});
  expect(state.remove).not.toHaveBeenCalled();
 });
});
