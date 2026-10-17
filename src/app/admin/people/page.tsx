import Link from 'next/link';
import { requirePermission } from '@/lib/server/admin/auth';
import { can, canPurge, eventsOf } from '@/lib/server/admin/permissions';
import { database } from '@/lib/server/supabase';
import { scopeEvent, eventOfTrack } from '@/lib/server/admin/scope';
import { AdminNav } from '../AdminNav';
import { AdminPageHeader } from '../AdminPageHeader';
import { PeopleImport } from '../PeopleImport';
import { PeopleRows, type Person } from '../PeopleRows';

const PAGE = 100;

export default async function PeoplePage({ searchParams }: { searchParams: Promise<{ q?: string | string[]; page?: string | string[] }> }) {
  const user = await requirePermission('people');
  const raw = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? '';
  const q = one(raw.q).replace(/[^\p{L}\p{N}@. -]/gu, '').trim().slice(0, 100);
  const page = Math.max(0, Math.min(10000, Math.floor(Number(one(raw.page)) || 0)));
  let query = database().from('participants').select('id,name,email,role,registration_ref,event,checked_in_at', { count: 'exact' });
  query = scopeEvent(query, user, 'event', false);
  if (q) query = query.or(`name.ilike.%${q}%,email.ilike.%${q}%,registration_ref.ilike.%${q}%`);
  const { data, error, count } = await query.order('registration_ref').range(page * PAGE, page * PAGE + PAGE - 1);
  if (error) throw new Error('The roster could not be loaded. Apply migration 0019 and try again.');
  const write = can(user, 'people', true);
  const people: Person[] = ((data ?? []) as Omit<Person, 'canPurge'>[]).map((p) => ({ ...p, canPurge: canPurge(user, 'people', eventOfTrack(p.event)) }));
  return <>
    <AdminNav user={user} />
    <AdminPageHeader title="People" description="Everyone taking part: the roster that check-in, country allocation and certificates work from. Registration runs on Google Forms, so bring the responses in here." />
    {write && <PeopleImport events={eventsOf(user)} />}
    <form className="admin-list__tools" role="search">
      <label className="admin-search"><span className="sr-only">Search people</span><input name="q" defaultValue={q} placeholder="Search by name, email or reference" /></label>
      <button className="secondary">Search</button>
      <p className="admin-list__count">{count ?? 0} {count === 1 ? 'person' : 'people'}</p>
    </form>
    <PeopleRows people={people} write={write} />
    {((count ?? 0) > PAGE) && <nav className="admin-pagination" aria-label="Pages">
      {page > 0 && <Link href={`?q=${encodeURIComponent(q)}&page=${page - 1}`}>Previous page</Link>}
      <span>Page {page + 1}</span>
      {(count ?? 0) > (page + 1) * PAGE && <Link href={`?q=${encodeURIComponent(q)}&page=${page + 1}`}>Next page</Link>}
    </nav>}
  </>;
}
