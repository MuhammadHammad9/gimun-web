/**
 * Which links get the page curtain, and what the curtain says.
 *
 * Pure functions only: this module is shared by the chrome, the unit tests
 * and the link component, so it must stay free of browser globals at import.
 */

export type Accent = 'gimun' | 'gmc';

export interface RouteLabel {
  /** Small mono line above the title: the part of the site. */
  section: string;
  /** The page name, set large. */
  title: string;
  /** Tints the curtain's leading hairlines for track pages. */
  accent?: Accent;
}

const LABELS: Record<string, RouteLabel> = {
  '/': { section: 'GIMUN & GMC 2027', title: 'Home' },
  '/gimun': { section: 'Model United Nations', title: 'GIMUN', accent: 'gimun' },
  '/gimun/committees': { section: 'GIMUN', title: 'Committees', accent: 'gimun' },
  '/gimun/rules': { section: 'GIMUN', title: 'Rules of procedure', accent: 'gimun' },
  '/moot-cup': { section: 'Moot court', title: 'GMC', accent: 'gmc' },
  '/moot-cup/categories': { section: 'GMC', title: 'Problem categories', accent: 'gmc' },
  '/moot-cup/rules': { section: 'GMC', title: 'Rules & memorials', accent: 'gmc' },
  '/moot-cup/clarifications': { section: 'GMC', title: 'Clarifications', accent: 'gmc' },
  '/register': { section: 'Apply', title: 'Registration' },
  '/schedule': { section: 'The event', title: 'Schedule' },
  '/resources': { section: 'The event', title: 'Resources' },
  '/announcements': { section: 'The event', title: 'Announcements' },
  '/results': { section: 'The event', title: 'Results' },
  '/about': { section: 'About', title: 'The event' },
  '/about/faq': { section: 'About', title: 'FAQ' },
  '/about/venue': { section: 'About', title: 'Venue & travel' },
  '/about/team': { section: 'About', title: 'Team' },
  '/about/sponsors': { section: 'About', title: 'Sponsors' },
  '/about/gallery': { section: 'About', title: 'Gallery' },
  '/contact': { section: 'Help', title: 'Contact' },
  '/privacy': { section: 'Legal', title: 'Privacy' },
};

/** Temporary redirects from next.config.ts, followed before the curtain opens. */
export const REDIRECTS: Record<string, string> = {
  '/apply': '/register',
  '/go': '/register',
};

const FALLBACK: RouteLabel = { section: 'GIMUN & GMC 2027', title: '' };

export function normalizePath(pathname: string): string {
  const path = pathname.split(/[?#]/)[0] || '/';
  return path.length > 1 ? path.replace(/\/+$/, '') : path;
}

export function routeLabel(pathname: string): RouteLabel {
  const path = REDIRECTS[normalizePath(pathname)] ?? normalizePath(pathname);
  if (LABELS[path]) return LABELS[path];
  const committee = path.match(/^\/gimun\/committees\/([^/]+)$/);
  if (committee) return { section: 'GIMUN committee', title: decodeURIComponent(committee[1]).toUpperCase(), accent: 'gimun' };
  if (path.startsWith('/verify/')) return { section: 'Certificate', title: 'Verification' };
  if (path.startsWith('/survey/')) return { section: 'Feedback', title: 'Survey' };
  return FALLBACK;
}

/** Every static public route, for tests and the screenshot script. */
export const LABELLED_ROUTES = Object.keys(LABELS);

/**
 * Files and endpoints: the browser should load these directly, never through
 * a client-side page transition.
 */
export function isDocumentHref(pathname: string): boolean {
  const path = normalizePath(pathname);
  if (/^\/(documents|images|_next|api)(\/|$)/.test(path)) return true;
  if (/\/pdf$/.test(path)) return true;
  return /\.[a-z0-9]{2,5}$/i.test(path);
}

/**
 * True when a click on `href` (resolved against `current`) should run the
 * curtain: same origin, a page rather than a file, a different pathname, and
 * not the admin.
 */
export function isTransitionable(href: string, current: URL): boolean {
  let target: URL;
  try {
    target = new URL(href, current);
  } catch {
    return false;
  }
  if (target.origin !== current.origin) return false;
  if (!/^https?:$/.test(target.protocol)) return false;
  const path = normalizePath(target.pathname);
  if (path === '/admin' || path.startsWith('/admin/')) return false;
  if (isDocumentHref(path)) return false;
  // Same page with a different hash or query: let the browser or Next handle it.
  return path !== normalizePath(current.pathname);
}
