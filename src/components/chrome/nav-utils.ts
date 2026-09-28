/** True when `href` is the current page or a page inside its section. */
export function isCurrentPath(href: string, pathname: string): boolean {
  const path = href.split(/[?#]/)[0];
  return path === '/' ? pathname === '/' : pathname === path || pathname.startsWith(`${path}/`);
}
