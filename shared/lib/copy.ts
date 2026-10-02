import type { z } from 'zod';
import type { copyPages, registry } from './content/registry';

/**
 * Page copy: the words on each public page, one entry per section, editable
 * in the admin under "copy". Pages ask for a section by id (`home-choice`);
 * a published entry wins, otherwise the bundled default from
 * shared/content/copy.json is used, so a section added in code renders before it is
 * seeded. Structure and order stay in code; editors change words, lists,
 * links, images and whether a section is shown.
 */
export type Copy = z.infer<typeof registry.copy>;
export type CopyPage = (typeof copyPages)[number];
export type CopyReader = (id: string) => Copy;

export function copyReader(page: CopyPage, seed: Copy[], published: Copy[]): CopyReader {
  const sections = new Map<string, Copy>();
  for (const entry of seed) if (entry.page === page) sections.set(entry.id, entry);
  for (const entry of published) if (entry.page === page) sections.set(entry.id, entry);
  return (id) => {
    const found = sections.get(id);
    if (!found) throw new Error(`Page copy "${id}" is missing from shared/content/copy.json.`);
    return found;
  };
}

/** Fills `{token}` placeholders from live data; unknown tokens stay as written. */
export function fill(text: string | undefined, vars: Record<string, string | number> = {}): string {
  if (!text) return '';
  return text.replace(/\{([a-zA-Z][a-zA-Z0-9]*)\}/g, (match, key: string) => (key in vars ? String(vars[key]) : match));
}

/**
 * Chapter numbers in reading order, skipping hidden sections, so hiding one
 * renumbers the rest and the chapter rail with them. Hidden ids map to
 * undefined.
 */
export function chapterNumbers(copy: CopyReader, ids: string[]): Record<string, number | undefined> {
  const numbers: Record<string, number | undefined> = {};
  let next = 1;
  for (const id of ids) numbers[id] = copy(id).hidden ? undefined : next++;
  return numbers;
}

/** The words of an accent phrase, for components that colour whole words. */
export function accentWords(copy: Copy): string[] | undefined {
  return copy.accentPhrase ? copy.accentPhrase.split(/\s+/).filter(Boolean) : undefined;
}

/**
 * A "Where to next" list: each action is a link (checked when saved) and the
 * item in the same position gives its one-line reason.
 */
export function nextSteps(copy: Copy, vars: Record<string, string | number> = {}) {
  return (copy.actions ?? []).map((action, index) => ({
    href: action.href,
    title: fill(action.label, vars),
    body: fill(copy.items?.[index]?.body, vars),
  }));
}
