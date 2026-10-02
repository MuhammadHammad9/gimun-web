import { describe, expect, it } from 'vitest';
import { defaultNavigation, navigationTree, publishedFooterColumns, type NavigationItem } from '@shared/lib/navigation';

describe('footer columns', () => {
  const columns = publishedFooterColumns(defaultNavigation);

  it('groups the default menu into the four site-map columns', () => {
    expect(columns.map((c) => c.title)).toEqual(['GIMUN', 'Moot Court', 'Event', 'About']);
  });

  it('opens each track column with its overview and never repeats a page', () => {
    expect(columns[0].links[0]).toEqual({ label: 'Overview', href: '/gimun' });
    expect(columns[1].links[0]).toEqual({ label: 'Overview', href: '/moot-cup' });
    const hrefs = columns.flatMap((c) => c.links.map((l) => l.href));
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });

  it('puts the time-boxed pages under Event and names the about root by its child', () => {
    const event = columns.find((c) => c.title === 'Event')!.links.map((l) => l.href);
    expect(event).toEqual(['/register', '/schedule', '/resources', '/about/venue', '/announcements', '/results']);
    expect(columns.find((c) => c.title === 'About')!.links[0]).toEqual({ label: 'The event', href: '/about' });
  });

  it('files entries saved before footerGroup existed by their link', () => {
    const legacy: NavigationItem[] = [
      { id: 'x-root', label: 'Things', href: '/about', area: 'all' },
      { id: 'x-schedule', label: 'Timetable', href: '/schedule', area: 'all' },
      { id: 'x-rules', label: 'Case rules', href: '/moot-cup/rules', area: 'footer' },
    ];
    const result = publishedFooterColumns(legacy);
    expect(result.find((c) => c.title === 'Event')!.links).toEqual([{ label: 'Timetable', href: '/schedule' }]);
    expect(result.find((c) => c.title === 'Moot Court')!.links).toEqual([{ label: 'Case rules', href: '/moot-cup/rules' }]);
  });

  it('respects an editor-chosen column', () => {
    const moved = defaultNavigation.map((i) => (i.id === 'about-faq' ? { ...i, footerGroup: 'event' as const } : i));
    const event = publishedFooterColumns(moved).find((c) => c.title === 'Event')!;
    expect(event.links.map((l) => l.href)).toContain('/about/faq');
  });
});

describe('navigation tree', () => {
  it('falls back to the built-in menu when the published one is empty', () => {
    expect(navigationTree([], 'header').length).toBeGreaterThan(0);
  });
});
