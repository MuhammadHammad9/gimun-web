import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import seed from '../../content/copy.json';
import { registry } from '@/lib/content/registry';
import { chapterNumbers, copyReader, fill, type Copy } from '@/lib/copy';

const entries = seed as Copy[];

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    return statSync(full).isDirectory() ? sourceFiles(full) : /\.tsx?$/.test(name) ? [full] : [];
  });
}

describe('page copy seed', () => {
  it('is valid content with unique ids', () => {
    expect(() => registry.copy.array().parse(entries)).not.toThrow();
    const ids = entries.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('has every section the pages ask for, on the right page', () => {
    const used = new Map<string, string>();
    for (const file of sourceFiles(path.join(process.cwd(), 'src/app'))) {
      const source = readFileSync(file, 'utf8');
      const page = source.match(/getCopy\('([a-z-]+)'\)/)?.[1];
      for (const [, id] of source.matchAll(/\bcopy\('([a-z0-9-]+)'\)/g)) {
        expect(page, `${file} reads copy without getCopy`).toBeDefined();
        used.set(id, page!);
      }
    }
    expect(used.size).toBeGreaterThan(0);
    for (const [id, page] of used) {
      const entry = entries.find((e) => e.id === id);
      expect(entry, `copy "${id}" missing from content/copy.json`).toBeDefined();
      expect(entry!.page).toBe(page);
    }
  });
});

describe('page copy rules', () => {
  const base = { id: 'x-hero', page: 'home', label: 'Test' } as const;

  it('requires the accent phrase to appear in the title', () => {
    expect(registry.copy.safeParse({ ...base, title: 'Where diplomacy meets', accentPhrase: 'diplomacy' }).success).toBe(true);
    expect(registry.copy.safeParse({ ...base, title: 'Where diplomacy meets', accentPhrase: 'courtroom' }).success).toBe(false);
  });

  it('allows at most three actions with safe links', () => {
    const action = { label: 'Go', href: '/register' };
    expect(registry.copy.safeParse({ ...base, actions: [action, action, action, action] }).success).toBe(false);
    expect(registry.copy.safeParse({ ...base, actions: [{ label: 'Go', href: 'javascript:alert(1)' }] }).success).toBe(false);
  });

  it('fills known tokens and leaves unknown ones as written', () => {
    expect(fill('{committees} committees, {cases} cases, {unknown}.', { committees: 6, cases: 4 })).toBe('6 committees, 4 cases, {unknown}.');
    expect(fill(undefined)).toBe('');
  });

  it('prefers the published entry and falls back to the seed', () => {
    const seedEntries: Copy[] = [{ ...base, title: 'Seed' }, { ...base, id: 'x-two', title: 'Two' }];
    const read = copyReader('home', seedEntries, [{ ...base, title: 'Published' }]);
    expect(read('x-hero').title).toBe('Published');
    expect(read('x-two').title).toBe('Two');
    expect(() => read('x-missing')).toThrow(/missing/);
  });

  it('renumbers chapters when a section is hidden', () => {
    const read = copyReader('home', [{ ...base, id: 'a' }, { ...base, id: 'b', hidden: true }, { ...base, id: 'c' }], []);
    expect(chapterNumbers(read, ['a', 'b', 'c'])).toEqual({ a: 1, b: undefined, c: 2 });
  });
});
