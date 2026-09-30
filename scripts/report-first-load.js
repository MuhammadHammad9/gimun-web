#!/usr/bin/env node
/**
 * First-load guard for the public site.
 *
 * Reads the prerendered HTML of key pages, collects every script, stylesheet
 * and preloaded font the browser fetches before the page can respond, and
 * fails when
 *  - a motion library (GSAP, Lenis, anime.js, Motion) is part of that first load.
 *    They must arrive later through dynamic imports, after the page is
 *    visible, or LCP and TBT pay for them; or
 *  - a page's gzipped JavaScript grew more than 10 KB over the recorded
 *    baseline, so every increase is a decision rather than an accident.
 *
 * Run after `npm run build`. `--update-baseline` records the current sizes.
 */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { assertFreshBuild } = require('./assert-fresh-build');

const root = path.resolve(__dirname, '..');
const appDir = path.join(root, '.next', 'server', 'app');
const baselineFile = path.join(__dirname, 'first-load-baseline.json');
const updateBaseline = process.argv.includes('--update-baseline');
const GROWTH_LIMIT = 10 * 1024;

const PAGES = ['/', '/register', '/resources', '/gimun', '/moot-cup', '/about', '/schedule', '/contact'];

// Runtime literals that survive minification (checked against the installed
// packages): a match means that library's code ships in the first load.
const SIGNATURES = [
  ['GSAP', /GreenSockGlobals|not found\. https:\/\/gsap\.com/],
  ['GSAP ScrollTrigger', /gsap-marker-scroller-start/],
  ['GSAP Flip', /data-flip-id/],
  ['Lenis', /lenisVersion/],
  ['anime.js', /AnimeJS/],
  // Motion (Framer Motion), used by the React Bits toast: an object key.
  ['Motion', /framerAppearId/],
];

assertFreshBuild(root);

const kb = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;
const gzip = (buffer) => zlib.gzipSync(buffer, { level: 9 }).length;

function htmlFor(route) {
  const file = route === '/' ? 'index.html' : `${route.slice(1)}.html`;
  const full = path.join(appDir, file);
  return fs.existsSync(full) ? fs.readFileSync(full, 'utf8') : null;
}

function assetsIn(html) {
  // Script tags, stylesheet links, font preloads and the client chunks named
  // in the inline flight data: together, what loads before hydration ends.
  const urls = new Set(html.match(/\/_next\/static\/[^"'\\\s)]+/g) || []);
  const pick = (pattern) => [...urls].filter((url) => pattern.test(url));
  return { js: pick(/\.js$/), css: pick(/\.css$/), fonts: pick(/\.woff2$/) };
}

function measure(urls, compress) {
  let bytes = 0;
  const found = new Set();
  for (const url of urls) {
    const file = path.join(root, '.next', url.replace(/^\/_next\//, ''));
    if (!fs.existsSync(file)) continue;
    const buffer = fs.readFileSync(file);
    bytes += compress ? gzip(buffer) : buffer.length;
    if (url.endsWith('.js')) {
      const source = buffer.toString('utf8');
      for (const [name, pattern] of SIGNATURES) if (pattern.test(source)) found.add(name);
    }
  }
  return { bytes, found };
}

const baseline = fs.existsSync(baselineFile) ? JSON.parse(fs.readFileSync(baselineFile, 'utf8')) : {};
const current = {};
const failures = [];
const rows = [];

for (const route of PAGES) {
  const html = htmlFor(route);
  if (!html) {
    failures.push(`${route}: no prerendered HTML found. Is the page still static?`);
    continue;
  }
  const assets = assetsIn(html);
  const js = measure(assets.js, true);
  const css = measure(assets.css, true);
  const fonts = measure(assets.fonts, false);
  current[route] = { jsGzip: js.bytes, cssGzip: css.bytes, fontBytes: fonts.bytes };

  const before = baseline[route];
  const delta = before ? js.bytes - before.jsGzip : 0;
  rows.push([route, assets.js.length, kb(js.bytes), before ? `${delta >= 0 ? '+' : ''}${kb(delta)}` : 'new', kb(css.bytes), kb(fonts.bytes)]);

  if (js.found.size) failures.push(`${route}: first load includes ${[...js.found].join(', ')}. Load it with a dynamic import instead.`);
  if (before && delta > GROWTH_LIMIT && !updateBaseline) {
    failures.push(`${route}: first-load JavaScript grew ${kb(delta)} (limit ${kb(GROWTH_LIMIT)}). Trim it, or run with --update-baseline if the growth is intended.`);
  }
}

const header = ['Page', 'JS files', 'JS (gzip)', 'vs baseline', 'CSS (gzip)', 'Fonts'];
const widths = header.map((title, i) => Math.max(title.length, ...rows.map((row) => String(row[i]).length)));
const line = (cells) => cells.map((cell, i) => String(cell).padEnd(widths[i])).join('  ');
console.log(line(header));
for (const row of rows) console.log(line(row));

if (updateBaseline) {
  fs.writeFileSync(baselineFile, `${JSON.stringify(current, null, 2)}\n`);
  console.log(`\n[OK] Baseline written to ${path.relative(root, baselineFile)}.`);
}

if (failures.length) {
  console.error(`\n[FAIL] First-load guard:\n${failures.map((f) => `  - ${f}`).join('\n')}`);
  process.exit(1);
}
console.log('\n[OK] No motion library in any first load; sizes within budget.');
