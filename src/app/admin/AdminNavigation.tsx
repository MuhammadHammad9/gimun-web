'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  Archive, Award, BookOpenText, CalendarDays, ClipboardCheck, ExternalLink, FileText, Gavel, Globe2, HelpCircle, Image, Images, Inbox,
  LayoutDashboard, LogOut, Mail, Map, Megaphone, Menu, MessageSquareQuote, ScrollText, Settings2, ShieldCheck, Sparkles, Type, UserRound, Users, X, type LucideIcon,
} from 'lucide-react';
import { collections } from '@shared/lib/content/registry';
import { COLLECTION_INFO, CONTENT_GROUPS } from './collection-info';
import { logout } from './auth-actions';

const OPS_LABELS: Record<string, string> = {
  settings: 'Site settings', media: 'Media library', registrations: 'Registrations', allocations: 'Country allocation', 'event-day': 'Check-in',
  inbox: 'Messages', email: 'Email', certificates: 'Certificates', feedback: 'Feedback survey', users: 'Admin accounts', audit: 'Activity log', 'close-out': 'Archive & retention',
};
const ICONS: Record<string, LucideIcon> = {
  copy: Type, navigation: Map, settings: Settings2, announcements: Megaphone, schedule: CalendarDays, results: Award, committees: Globe2,
  'moot-categories': Gavel, clarifications: MessageSquareQuote, team: UserRound, gallery: Images, sponsors: Sparkles, faq: HelpCircle,
  resources: BookOpenText, media: Image, registrations: Users, allocations: Globe2, 'event-day': ClipboardCheck, inbox: Inbox, email: Mail,
  certificates: ScrollText, feedback: FileText, users: ShieldCheck, audit: FileText, 'close-out': Archive,
};
/** The sidebar, in the order people look for things: the website first, then running the event. */
const GROUPS: [string, string[]][] = [
  ...CONTENT_GROUPS.map((group): [string, string[]] => [group, [
    ...(group === 'Pages & text' ? ['settings'] : []),
    ...collections.filter((c) => COLLECTION_INFO[c].group === group),
    ...(group === 'Files' ? ['media'] : []),
  ]]),
  ['Registrations & event day', ['registrations', 'allocations', 'event-day']],
  ['Messages', ['inbox', 'email']],
  ['After the event', ['certificates', 'feedback']],
  ['Administration', ['users', 'audit', 'close-out']],
];
const hrefOf = (section: string) => (collections.includes(section as (typeof collections)[number]) ? `/admin/content/${section}` : `/admin/${section}`);
const labelOf = (section: string) => COLLECTION_INFO[section as keyof typeof COLLECTION_INFO]?.label ?? OPS_LABELS[section] ?? section.replaceAll('-', ' ');

export function AdminNavigation({ name, role, allowed, websiteConnected, websiteReason }: { name: string; role: string; allowed: string[]; websiteConnected?: boolean; websiteReason?: string }) {
  const path = usePathname();
  // The phone menu is open only on the page it was opened on, so navigating closes it.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === path;
  const setOpen = (next: boolean) => setOpenOn(next ? path : null);
  const current = GROUPS.flatMap(([, items]) => items).find((s) => path === hrefOf(s) || path.startsWith(hrefOf(s) + '/'));

  return <>
    <header className="admin-topbar">
      <button type="button" className="admin-menu" aria-expanded={open} aria-controls="admin-sidebar" onClick={() => setOpen(!open)}>
        {open ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}<span className="sr-only">Menu</span>
      </button>
      <p className="admin-topbar-context"><strong>{path === '/admin' ? 'Overview' : current ? labelOf(current) : 'Admin'}</strong></p>
      <div className="admin-topbar-actions">
        <span className={`admin-connection-status ${websiteConnected ? 'is-connected' : 'is-warning'}`} title={websiteConnected ? 'The website shows what you publish here.' : websiteReason || 'The website may not be showing what you publish here.'}>
          <i aria-hidden="true" />{websiteConnected ? 'Website connected' : 'Website not connected'}
        </span>
        <a className="admin-site-link" href="/" target="_blank" rel="noopener" aria-label="View website (opens in a new tab)"><ExternalLink size={15} aria-hidden="true" /> <span>View website</span></a>
      </div>
    </header>
    <div className={`admin-sidebar-backdrop ${open ? 'is-visible' : ''}`} aria-hidden="true" onClick={() => setOpen(false)} />
    <aside id="admin-sidebar" className={`admin-sidebar ${open ? 'is-open' : ''}`}>
      <Link className="admin-brand" href="/admin">
        <span className="admin-brand-mark" aria-hidden="true">G</span>
        <span>GIMUN & GMC<small>Admin · 2027</small></span>
      </Link>
      <nav aria-label="Admin sections">
        <Link className="admin-overview-link" href="/admin" aria-current={path === '/admin' ? 'page' : undefined}><LayoutDashboard size={16} aria-hidden="true" /> Overview</Link>
        {GROUPS.map(([title, items]) => {
          const visible = items.filter((s) => allowed.includes(s));
          return visible.length ? <div className="admin-nav-group" key={title}>
            <p>{title}</p>
            {visible.map((s) => {
              const Icon = ICONS[s] ?? FileText;
              const href = hrefOf(s);
              return <Link key={s} href={href} aria-current={path === href || path.startsWith(href + '/') ? 'page' : undefined}><Icon size={16} aria-hidden="true" /><span>{labelOf(s)}</span></Link>;
            })}
          </div> : null;
        })}
      </nav>
      <div className="admin-account">
        <div className="admin-avatar" aria-hidden="true">{name.slice(0, 1).toUpperCase()}</div>
        <div className="admin-account-copy"><strong>{name}</strong><small>{role.replaceAll('-', ' ')}</small></div>
        <form action={logout}><button className="admin-signout secondary" aria-label="Sign out"><LogOut size={15} aria-hidden="true" /></button></form>
        <div className="admin-account-links"><Link href="/admin/mfa">Two-step sign-in</Link><Link href="/admin/password">Change password</Link></div>
      </div>
    </aside>
  </>;
}
