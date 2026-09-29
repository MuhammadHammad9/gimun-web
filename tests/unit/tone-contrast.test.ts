import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Every text token must clear WCAG AA (4.5:1) on every ground it can sit on,
 * in both themes and inside every chapter tone. Values are read from the
 * stylesheets themselves, so a palette edit cannot drift past this check.
 */
const globals = readFileSync(resolve(process.cwd(), 'src/app/globals.css'), 'utf8');
const theme = readFileSync(resolve(process.cwd(), 'src/styles/theme.css'), 'utf8');

/** The rule whose full selector is `selector` (not a member of a longer list). */
function block(css: string, selector: string): string {
  let start = -1;
  for (let at = css.indexOf(`${selector} {`); at >= 0; at = css.indexOf(`${selector} {`, at + 1)) {
    if (!css.slice(0, at).trimEnd().endsWith(',')) {
      start = at;
      break;
    }
  }
  if (start < 0) throw new Error(`Missing CSS block: ${selector}`);
  const open = css.indexOf('{', start);
  let depth = 0;
  for (let i = open; i < css.length; i++) {
    if (css[i] === '{') depth++;
    if (css[i] === '}' && --depth === 0) return css.slice(open + 1, i);
  }
  throw new Error(`Unclosed CSS block: ${selector}`);
}

function vars(body: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [, name, value] of body.matchAll(/(--[\w-]+):\s*([^;]+);/g)) out[name] = value.trim();
  return out;
}

type Rgba = [number, number, number, number];

function parse(color: string): Rgba {
  const hex = color.match(/^#([0-9a-f]{6})$/i);
  if (hex) return [0, 2, 4].map((i) => parseInt(hex[1].slice(i, i + 2), 16)).concat(1) as Rgba;
  const rgba = color.match(/^rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)$/);
  if (rgba) return [Number(rgba[1]), Number(rgba[2]), Number(rgba[3]), Number(rgba[4])];
  throw new Error(`Unsupported colour: ${color}`);
}

function luminance([r, g, b]: number[]): number {
  const channel = (v: number) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrast(foreground: string, background: string): number {
  const [r, g, b, a] = parse(foreground);
  const bg = parse(background);
  const mixed = [r * a + bg[0] * (1 - a), g * a + bg[1] * (1 - a), b * a + bg[2] * (1 - a)];
  const [hi, lo] = [luminance(mixed), luminance(bg)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const TEXT = ['--color-text', '--color-text-2', '--color-text-3', '--color-text-4', '--color-accent-gimun', '--color-accent-gmc'];

const darkBase = { ...vars(block(globals, '@theme')), ...vars(block(theme, '@theme')) };
const root = vars(block(theme, ':root'));
const light = { ...darkBase, ...vars(block(theme, 'html[data-theme="light"]')) };
const lightInk = vars(block(theme, '.tone-crest,\nhtml[data-theme="light"] .tone-inverse'));
const paperInk = vars(block(theme, 'html:not([data-theme="light"]) .tone-inverse'));
const inkOnLightInverse = vars(block(theme, 'html[data-theme="light"] .tone-inverse'));

const contexts: { name: string; ink: Record<string, string>; grounds: string[] }[] = [
  {
    name: 'dark theme',
    ink: darkBase,
    grounds: ['--color-void', '--color-canvas', '--color-raised', '--color-elevated', '--color-overlay'].map((k) => darkBase[k]),
  },
  { name: 'dark theme, deep tone', ink: darkBase, grounds: [root['--tone-deep']] },
  { name: 'dark theme, crest tone', ink: { ...darkBase, ...lightInk }, grounds: [root['--tone-crest']] },
  { name: 'dark theme, inverse (paper) tone', ink: { ...darkBase, ...paperInk }, grounds: [root['--tone-inverse'], paperInk['--color-raised'], paperInk['--color-elevated']] },
  {
    name: 'light theme',
    ink: light,
    grounds: ['--color-void', '--color-canvas', '--color-raised', '--color-elevated'].map((k) => light[k]),
  },
  { name: 'light theme, deep tone', ink: light, grounds: [light['--tone-deep']] },
  { name: 'light theme, crest tone', ink: { ...light, ...lightInk }, grounds: [light['--tone-crest']] },
  {
    name: 'light theme, inverse (ink) tone',
    ink: { ...light, ...lightInk },
    grounds: [light['--tone-inverse'], inkOnLightInverse['--color-raised'], inkOnLightInverse['--color-elevated']],
  },
];

describe('theme and tone contrast', () => {
  for (const context of contexts) {
    it(`${context.name}: every text token clears 4.5:1`, () => {
      const failures: string[] = [];
      for (const token of TEXT) {
        for (const ground of context.grounds) {
          const ratio = contrast(context.ink[token], ground);
          if (ratio < 4.5) failures.push(`${token} ${context.ink[token]} on ${ground}: ${ratio.toFixed(2)}`);
        }
      }
      expect(failures).toEqual([]);
    });
  }

  it('keeps the focus ring visible on every ground', () => {
    expect(contrast(darkBase['--color-focus'], darkBase['--color-canvas'])).toBeGreaterThanOrEqual(3);
    expect(contrast(light['--color-focus'], light['--color-canvas'])).toBeGreaterThanOrEqual(3);
    expect(contrast(paperInk['--color-focus'], root['--tone-inverse'])).toBeGreaterThanOrEqual(3);
    expect(contrast(lightInk['--color-focus'], light['--tone-crest'])).toBeGreaterThanOrEqual(3);
  });
});
