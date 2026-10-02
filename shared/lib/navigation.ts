export type NavigationArea = 'header' | 'footer' | 'mobile' | 'all';
export type FooterGroup = 'gimun' | 'moot' | 'event' | 'about';

export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  area: NavigationArea;
  parentId?: string;
  /** One short line shown under the label in dropdowns and the mobile menu. */
  description?: string;
  /** Footer column for this entry. Defaults by section when unset. */
  footerGroup?: FooterGroup;
}

/**
 * Site navigation.
 *
 * The header is organised around what a visitor is actually trying to do —
 * understand a track, find a date, get a document, ask a question — and is
 * capped at five top-level items so the bar stays scannable.
 *
 * `area` splits the two surfaces on purpose. The header carries the common
 * tasks; the footer carries everything, acting as the site map. Previously
 * both were generated from one list, so the footer was an exact copy of the
 * header and a single "Info" dropdown held eleven unrelated links — Sponsors,
 * Gallery, Results, Contact and Announcements all sat in the same menu as FAQ
 * and Venue, which gave a visitor no way to predict what was behind it.
 */
export const defaultNavigation: NavigationItem[] = [
  // --- GIMUN -------------------------------------------------------------
  { id: 'gimun', label: 'GIMUN', href: '/gimun', area: 'all' },
  {
    id: 'gimun-committees',
    parentId: 'gimun',
    label: 'Committees',
    href: '/gimun/committees',
    area: 'all',
    description: 'Chambers, agendas and country allocation',
  },
  {
    id: 'gimun-rules',
    parentId: 'gimun',
    label: 'Rules of procedure',
    href: '/gimun/rules',
    area: 'all',
    description: 'How debate runs in committee',
  },

  // --- Moot Court --------------------------------------------------------
  { id: 'gmc', label: 'Moot Court', href: '/moot-cup', area: 'all' },
  {
    id: 'gmc-categories',
    parentId: 'gmc',
    label: 'Problem categories',
    href: '/moot-cup/categories',
    area: 'all',
    description: 'The cases you can argue',
  },
  {
    id: 'gmc-rules',
    parentId: 'gmc',
    label: 'Rules & memorials',
    href: '/moot-cup/rules',
    area: 'all',
    description: 'Written argument format and judging',
  },
  {
    id: 'gmc-clarifications',
    parentId: 'gmc',
    label: 'Clarifications',
    href: '/moot-cup/clarifications',
    area: 'all',
    description: 'Bench rulings on the case problem',
  },

  // --- Standalone tasks --------------------------------------------------
  { id: 'register-footer', label: 'Register', href: '/register', area: 'footer', footerGroup: 'event' },
  { id: 'schedule', label: 'Schedule', href: '/schedule', area: 'all', footerGroup: 'event' },
  { id: 'resources', label: 'Resources', href: '/resources', area: 'all', footerGroup: 'event' },

  // --- About -------------------------------------------------------------
  { id: 'about', label: 'About', href: '/about', area: 'all' },
  {
    id: 'about-event',
    parentId: 'about',
    label: 'The event',
    href: '/about',
    area: 'footer',
    description: 'What GIMUN and GMC are',
  },
  {
    id: 'about-faq',
    parentId: 'about',
    label: 'FAQ',
    href: '/about/faq',
    area: 'all',
    description: 'Fees, eligibility and logistics',
  },
  {
    id: 'about-venue',
    parentId: 'about',
    label: 'Venue & travel',
    href: '/about/venue',
    area: 'all',
    description: 'Getting to GIKI and staying there',
    footerGroup: 'event',
  },
  {
    id: 'about-team',
    parentId: 'about',
    label: 'Team',
    href: '/about/team',
    area: 'all',
    description: 'Secretariat and organising committee',
  },
  {
    id: 'about-contact',
    parentId: 'about',
    label: 'Contact',
    href: '/contact',
    area: 'all',
    description: 'Reach the right desk',
  },

  // --- Footer only -------------------------------------------------------
  // Low-frequency or time-boxed pages. They stay one click from the footer
  // and are surfaced in context (the announcement bar, the results page gate)
  // rather than taking a permanent slot in the header.
  { id: 'announcements', parentId: 'about', label: 'Announcements', href: '/announcements', area: 'footer', footerGroup: 'event' },
  { id: 'results', parentId: 'about', label: 'Results', href: '/results', area: 'footer', footerGroup: 'event' },
  { id: 'sponsors', parentId: 'about', label: 'Sponsors', href: '/about/sponsors', area: 'footer' },
  { id: 'gallery', parentId: 'about', label: 'Gallery', href: '/about/gallery', area: 'footer' },
];

export interface NavigationNode extends NavigationItem {
  dropdown: NavigationItem[];
}

/**
 * Builds the tree for one surface.
 *
 * A parent is only rendered as a dropdown when it has children on that
 * surface; otherwise it stays a plain link. Parents never repeat their own
 * href as the first child — that duplicate entry ("GIMUN > Overview &
 * eligibility", both pointing at `/gimun`) is a dead choice that makes a menu
 * look longer than it is.
 */
export function navigationTree(
  items: NavigationItem[] = defaultNavigation,
  area: Exclude<NavigationArea, 'all'>
): NavigationNode[] {
  const source = items?.length ? items : defaultNavigation;
  const visible = source.filter((i) => i.area === 'all' || i.area === area);

  return visible
    .filter((i) => !i.parentId)
    .map((item) => ({
      ...item,
      dropdown: visible.filter((c) => c.parentId === item.id && c.href !== item.href),
    }));
}

export interface FooterColumn {
  title: string;
  links: { label: string; href: string }[];
}

const FOOTER_GROUPS: { id: FooterGroup; title: string }[] = [
  { id: 'gimun', title: 'GIMUN' },
  { id: 'moot', title: 'Moot Court' },
  { id: 'event', title: 'Event' },
  { id: 'about', title: 'About' },
];

// Entries saved before `footerGroup` existed still land in the right column.
const DEFAULT_GROUP_BY_HREF: Record<string, FooterGroup> = {
  '/register': 'event',
  '/schedule': 'event',
  '/resources': 'event',
  '/about/venue': 'event',
  '/announcements': 'event',
  '/results': 'event',
};
const ROOT_GROUPS: Record<string, FooterGroup> = { gimun: 'gimun', gmc: 'moot', about: 'about' };

function footerGroupOf(item: NavigationItem, byId: Map<string, NavigationItem>): FooterGroup {
  if (item.footerGroup) return item.footerGroup;
  const byHref = DEFAULT_GROUP_BY_HREF[item.href];
  if (byHref) return byHref;
  const root = item.parentId ? byId.get(item.parentId) : item;
  if (root?.footerGroup) return root.footerGroup;
  if (root && ROOT_GROUPS[root.id]) return ROOT_GROUPS[root.id];
  if (root?.href.startsWith('/moot-cup')) return 'moot';
  if (root?.href.startsWith('/gimun')) return 'gimun';
  return 'about';
}

/**
 * Footer columns built from the published navigation.
 *
 * The footer is the site map: four fixed columns (GIMUN, Moot Court, Event,
 * About) so a visitor can predict where a page lives. Each entry picks its
 * column through `footerGroup`, which editors set in the admin. A section
 * root opens its column as "Overview" (or as the child that repeats its
 * link), and a page linked twice is listed once.
 */
export function publishedFooterColumns(items: NavigationItem[]): FooterColumn[] {
  const visible = items.filter((i) => i.area === 'all' || i.area === 'footer');
  const byId = new Map(visible.map((i) => [i.id, i]));
  const columns = new Map<FooterGroup, FooterColumn['links']>(FOOTER_GROUPS.map((g) => [g.id, []]));
  const seen = new Set<string>();
  // Roots first so each column opens with its overview.
  const ordered = [...visible.filter((i) => !i.parentId), ...visible.filter((i) => i.parentId)];
  for (const item of ordered) {
    if (seen.has(item.href)) continue;
    seen.add(item.href);
    const group = footerGroupOf(item, byId);
    const isSectionRoot = !item.parentId && visible.some((c) => c.parentId === item.id);
    // A child that repeats the root link names it better ("The event").
    const namesake = visible.find((c) => c.parentId === item.id && c.href === item.href);
    const label = namesake?.label ?? (isSectionRoot ? 'Overview' : item.label);
    columns.get(group)!.push({ label, href: item.href });
  }
  return FOOTER_GROUPS.map((g) => ({ title: g.title, links: columns.get(g.id)! })).filter((c) => c.links.length > 0);
}
