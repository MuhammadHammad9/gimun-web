import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { LABELLED_ROUTES, REDIRECTS, isTransitionable, routeLabel } from '../../src/lib/motion/routes';
import { isCurrentPath } from '../../src/components/chrome/nav-utils';
import committees from '../../content/committees.json';

describe('curtain routing', () => {
  it('mirrors the redirects in next.config.ts', () => {
    const config = readFileSync(resolve(process.cwd(), 'next.config.ts'), 'utf8');
    const configured = Object.fromEntries(
      [...config.matchAll(/source:\s*'([^']+)',\s*destination:\s*'([^']+)'/g)].map(([, source, destination]) => [source, destination]),
    );
    expect(REDIRECTS).toEqual(configured);
  });

  it('does not run the curtain for a redirect back to the current page', () => {
    const register = new URL('https://gimun.test/register');
    expect(isTransitionable('/apply', register)).toBe(false);
    expect(isTransitionable('/go?utm=poster', register)).toBe(false);
    expect(isTransitionable('/apply', new URL('https://gimun.test/'))).toBe(true);
  });

  it('gives every public page a curtain title', () => {
    for (const route of LABELLED_ROUTES) expect(routeLabel(route).title, route).not.toBe('');
    for (const committee of committees) {
      expect(routeLabel(`/gimun/committees/${committee.slug}`).title).toBe(committee.slug.toUpperCase());
    }
  });
});

describe('curtain labels for malformed links', () => {
  it('never throws on a broken percent escape (it froze the page mid-transition)', () => {
    expect(() => routeLabel('/gimun/committees/%E0%A4')).not.toThrow();
    expect(routeLabel('/gimun/committees/50%off').title).toBe('50%OFF');
    expect(routeLabel('/gimun/committees/un%20sc').title).toBe('UN SC');
  });
});

describe('navigation state', () => {
  it('marks a section current on its own pages only', () => {
    expect(isCurrentPath('/gimun', '/gimun/committees/unsc')).toBe(true);
    expect(isCurrentPath('/gimun', '/gimunx')).toBe(false);
    expect(isCurrentPath('/', '/about')).toBe(false);
    expect(isCurrentPath('/register?track=gimun', '/register')).toBe(true);
  });
});
