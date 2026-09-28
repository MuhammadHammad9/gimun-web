export type NavigationArea = 'header' | 'footer' | 'mobile' | 'all';

export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  area: NavigationArea;
  parentId?: string;
  /** One short line shown under the label in dropdowns and the mobile menu. */
  description?: string;
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
  { id: 'schedule', label: 'Schedule', href: '/schedule', area: 'all' },
  { id: 'resources', label: 'Resources', href: '/resources', area: 'all' },

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
  { id: 'announcements', parentId: 'about', label: 'Announcements', href: '/announcements', area: 'footer' },
  { id: 'results', parentId: 'about', label: 'Results', href: '/results', area: 'footer' },
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

/**
 * Footer columns.
 *
 * Declared separately from the header tree rather than derived from it. The
 * two surfaces answer different questions: the header is "what do I want to
 * do", the footer is "what exists here". Deriving one from the other produced
 * a footer that was an exact copy of the nav, with single-link columns for
 * Schedule and Resources and a nine-item About column beside them.
 *
 * Unlike the header, each track column opens with its own overview page — in
 * a site map that entry is the point, not a duplicate.
 */
export const footerColumns: FooterColumn[] = [
  {
    title: 'GIMUN',
    links: [
      { label: 'Overview', href: '/gimun' },
      { label: 'Committees', href: '/gimun/committees' },
      { label: 'Rules of procedure', href: '/gimun/rules' },
    ],
  },
  {
    title: 'Moot Court',
    links: [
      { label: 'Overview', href: '/moot-cup' },
      { label: 'Problem categories', href: '/moot-cup/categories' },
      { label: 'Rules & memorials', href: '/moot-cup/rules' },
      { label: 'Clarifications', href: '/moot-cup/clarifications' },
    ],
  },
  {
    title: 'Event',
    links: [
      { label: 'Register', href: '/register' },
      { label: 'Schedule', href: '/schedule' },
      { label: 'Resources', href: '/resources' },
      { label: 'Venue & travel', href: '/about/venue' },
      { label: 'Announcements', href: '/announcements' },
      { label: 'Results', href: '/results' },
    ],
  },
  {
    title: 'About',
    links: [
      { label: 'The event', href: '/about' },
      { label: 'Team', href: '/about/team' },
      { label: 'Sponsors', href: '/about/sponsors' },
      { label: 'Gallery', href: '/about/gallery' },
      { label: 'FAQ', href: '/about/faq' },
      { label: 'Contact', href: '/contact' },
    ],
  },
];
