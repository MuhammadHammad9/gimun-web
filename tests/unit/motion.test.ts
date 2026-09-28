import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { canReveal, curtainReducer, initialCurtain, isBusy, panelCount } from '../../src/lib/motion/curtain-machine';
import { EASE, EASE_CSS_VAR, DURATION } from '../../src/lib/motion/tokens';
import { isDocumentHref, isTransitionable, normalizePath, routeLabel } from '../../src/lib/motion/routes';

describe('page transition routes', () => {
  const current = new URL('https://gimun.test/gimun');

  it('normalizes trailing slashes, queries and fragments', () => {
    expect(normalizePath('/about/?from=nav#team')).toBe('/about');
    expect(normalizePath('/')).toBe('/');
  });

  it('labels static, redirected and dynamic routes', () => {
    expect(routeLabel('/go')).toMatchObject({ title: 'Registration' });
    expect(routeLabel('/moot-cup/categories')).toMatchObject({ section: 'GMC', accent: 'gmc' });
    expect(routeLabel('/gimun/committees/unsc')).toMatchObject({ title: 'UNSC', accent: 'gimun' });
  });

  it('transitions only ordinary internal page navigation', () => {
    expect(isTransitionable('/about', current)).toBe(true);
    expect(isTransitionable('/gimun?tab=one', current)).toBe(false);
    expect(isTransitionable('https://other.test/about', current)).toBe(false);
    expect(isTransitionable('/admin', current)).toBe(false);
    expect(isTransitionable('/documents/guide.pdf', current)).toBe(false);
    expect(isDocumentHref('/verify/ABC/pdf')).toBe(true);
  });
});

describe('curtain state machine', () => {
  it('runs the complete state sequence and ignores a second start', () => {
    const covering = curtainReducer(initialCurtain, { type: 'start', href: '/about', from: '/' });
    expect(isBusy(covering)).toBe(true);
    expect(curtainReducer(covering, { type: 'start', href: '/gimun', from: '/' })).toBe(covering);
    const covered = curtainReducer(covering, { type: 'covered' });
    expect(canReveal(covered)).toBe(false);
    const arrived = curtainReducer(covered, { type: 'arrived' });
    expect(canReveal(arrived)).toBe(true);
    const revealing = curtainReducer(arrived, { type: 'reveal' });
    expect(curtainReducer(revealing, { type: 'revealed' })).toEqual(initialCurtain);
  });

  it('uses fewer panels on smaller displays', () => {
    expect(panelCount(375)).toBe(3);
    expect(panelCount(768)).toBe(4);
    expect(panelCount(1440)).toBe(5);
  });
});

describe('motion tokens', () => {
  it('keeps TypeScript timing and easing values mirrored in CSS', () => {
    const css = readFileSync(resolve(process.cwd(), 'src/app/globals.css'), 'utf8');
    for (const [name, points] of Object.entries(EASE)) {
      expect(css).toContain(`${EASE_CSS_VAR[name as keyof typeof EASE]}: cubic-bezier(${points.join(', ')})`);
    }
    for (const [name, milliseconds] of Object.entries(DURATION)) {
      expect(css).toContain(`--dur-${name}: ${milliseconds}ms`);
    }
  });
});

