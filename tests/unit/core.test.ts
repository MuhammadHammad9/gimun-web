import { describe,it,expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { registry,collections,siteSchema,validateEntry } from '../../src/lib/content/registry';
import { eventPhase } from '../../src/lib/phase';
import { can,type AdminUser } from '../../src/lib/server/admin/permissions';
import { csv } from '../../src/lib/csv';
import { isValidIsoDate,isRegistrationDeadlinePassed } from '../../src/lib/site-config';
const site=siteSchema.parse(JSON.parse(readFileSync('content/site.json','utf8')));
describe('shared content schemas',()=>{
  for(const collection of collections.filter(c=>c!=='navigation'))it(`accepts seed ${collection}`,()=>{expect(()=>registry[collection].array().parse(JSON.parse(readFileSync(`content/${collection}.json`,'utf8')))).not.toThrow();});
  it('rejects unsafe URLs',()=>{expect(registry.navigation.safeParse({id:'bad',label:'Bad',href:'javascript:alert(1)',area:'all'}).success).toBe(false);});
  it('rejects invalid publication windows',()=>{expect(()=>validateEntry({collection:'navigation',id:'nav',version:0,status:'published',sort_order:0,publish_at:'2027-01-02T00:00:00Z',expire_at:'2027-01-01T00:00:00Z',data:{id:'nav',label:'Home',href:'/',area:'all'}})).toThrow();});
});
describe('dates and phases',()=>{
  it('rejects impossible dates',()=>{expect(isValidIsoDate('2027-02-29')).toBe(false);expect(isValidIsoDate('2028-02-29')).toBe(true);});
  it('closes registration at the end of the date in Pakistan',()=>{expect(isRegistrationDeadlinePassed('2027-02-15',Date.parse('2027-02-15T18:59:58Z'))).toBe(false);expect(isRegistrationDeadlinePassed('2027-02-15',Date.parse('2027-02-15T19:00:00Z'))).toBe(true);});
  it('derives event-live and honors override',()=>{expect(eventPhase(site,Date.parse('2027-03-18T00:00:00Z'))).toBe('event-live');expect(eventPhase({...site,phaseOverride:'archived'},0)).toBe('archived');});
});
describe('permissions',()=>{
  const user:AdminUser={user_id:'x',email:'a@example.test',display_name:'Test',role:'viewer',active:true,sections:[],must_change_password:false};
  it('never allows viewer writes even with explicit grants',()=>{expect(can({...user,sections:['settings']},'settings',true)).toBe(false);});
  it('limits scanner role to check-in',()=>{expect(can({...user,role:'checkin'},'event-day',true)).toBe(true);expect(can({...user,role:'checkin'},'registrations')).toBe(false);});
  it('reserves users and closeout for owners',()=>{expect(can({...user,role:'admin',sections:['users']},'users',true)).toBe(false);expect(can({...user,role:'owner'},'users',true)).toBe(true);});
  it('denies inactive users and unknown sections',()=>{expect(can({...user,role:'owner',active:false},'users')).toBe(false);expect(can({...user,role:'owner'},'bad')).toBe(false);});
});
it('neutralizes spreadsheet formulas and quotes CSV cells',()=>{const result=csv([{name:'=HYPERLINK("bad")',note:'line\n"quoted"'}]);expect(result).toContain("'=HYPERLINK");expect(result).toContain('""quoted""');});
