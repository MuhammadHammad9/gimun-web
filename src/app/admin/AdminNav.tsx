import Link from 'next/link';
import { can, sections, type AdminUser } from '@/lib/server/admin/permissions';
import { collections } from '@/lib/content/registry';
import { logout } from './auth-actions';
export function AdminNav({ user }: { user: AdminUser }) { return <><header className="flex flex-wrap items-center justify-between gap-4 mb-5"><Link href="/admin">Event operations</Link><span>{user.display_name} · {user.role}</span><form action={logout}><button>Sign out</button></form></header><nav aria-label="Admin sections">{sections.filter(s => can(user,s)).map(s => <Link key={s} href={collections.includes(s as typeof collections[number]) ? `/admin/content/${s}` : `/admin/${s}`}>{s.replace(/-/g,' ')}</Link>)}</nav></>; }
