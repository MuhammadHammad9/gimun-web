/**
 * Renders the link-preview (Open Graph) images in public/images/og: one for
 * the site, one for GIMUN, one for GMC. Drawn in a real browser so they use
 * the site's own fonts and the official logos, in the liaison packages' look
 * (crumpled maroon paper, a fine cream frame).
 *
 *   node scripts/generate-share-images.mjs
 *
 * Output is 1200x630 JPEG, kept well under 300 KB so WhatsApp shows the large
 * preview. When the artwork changes, bump VERSION: the file name changes, so
 * apps that cached the old image by URL fetch the new one.
 */
import { chromium } from 'playwright';
import { mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { pathToFileURL } from 'node:url';
import { join, resolve } from 'node:path';

export const VERSION = '2026';
const root = process.cwd();
// Quotes are escaped so a path such as "Laptop's" cannot end a CSS url('…').
const asset = (path) => pathToFileURL(resolve(root, path)).href.replace(/'/g, '%27').replace(/"/g, '%22');

const MAROON = '#5e1205';
const CREAM = '#ecd8b7';
const DATES = '4 – 6 December 2026';
const VENUE = 'GIK Institute, Topi, Swabi';

// Inlined as data URIs: Chromium treats CSS masks as CORS requests, and a
// file:// page may not mask with another local file.
const logoData = Object.fromEntries(['gimun', 'gmc'].map((name) => [name, `data:image/png;base64,${readFileSync(resolve(root, `public/images/brand/${name}-logo.png`)).toString('base64')}`]));
const logo = (name, size) =>
  `<span class="logo" style="height:${size}px;aspect-ratio:${name === 'gimun' ? '813/696' : '924/761'};-webkit-mask-image:url('${logoData[name]}')"></span>`;

const cards = {
  [`share-${VERSION}`]: `
    <div class="kicker">SOPHEP presents</div>
    <div class="pair">
      <div class="event">
        ${logo('gimun', 150)}
        <div class="name">GIMUN 26</div>
        <div class="sub">GIKI Model United Nations</div>
      </div>
      <div class="rule"></div>
      <div class="event">
        ${logo('gmc', 150)}
        <div class="name">GMC VII</div>
        <div class="sub">GIKI Moot Cup</div>
      </div>
    </div>
    <div class="foot">${DATES}<i></i>${VENUE}</div>`,
  [`share-gimun-${VERSION}`]: `
    <div class="kicker">SOPHEP presents</div>
    <div class="solo">
      ${logo('gimun', 250)}
      <div class="text">
        <div class="name big">GIMUN 26</div>
        <div class="sub">GIKI Model United Nations</div>
        <div class="motto">Debate. Diplomacy. Destiny.</div>
        <div class="chips">UNSC<i></i>UNHRC<i></i>DISEC<i></i>UN Women<i></i>PNA</div>
      </div>
    </div>
    <div class="foot">${DATES}<i></i>${VENUE}</div>`,
  [`share-gmc-${VERSION}`]: `
    <div class="kicker">SOPHEP presents</div>
    <div class="solo">
      ${logo('gmc', 240)}
      <div class="text">
        <div class="name big">GMC VII</div>
        <div class="sub">GIKI Moot Cup · Seventh edition</div>
        <div class="motto">Where conviction commands the courtroom.</div>
        <div class="chips">Memorials<i></i>Oral rounds<i></i>Prelims to the final</div>
      </div>
    </div>
    <div class="foot">${DATES}<i></i>${VENUE}</div>`,
};

const page = (body) => `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: Satoshi; src: url('${asset('src/assets/fonts/Satoshi-Variable.woff2')}') format('woff2'); font-weight: 300 900; }
@font-face { font-family: 'General Sans'; src: url('${asset('src/assets/fonts/GeneralSans-Variable.woff2')}') format('woff2'); font-weight: 200 700; }
* { margin: 0; box-sizing: border-box; }
html, body { width: 1200px; height: 630px; overflow: hidden; }
body { position: relative; background: ${MAROON}; color: ${CREAM}; font-family: 'General Sans', sans-serif; }
/* Crumpled paper: soft lit noise, then a vignette, as on the package covers. */
.paper { position: absolute; inset: 0; }
.vignette { position: absolute; inset: 0; background: radial-gradient(ellipse 75% 70% at 50% 46%, rgb(122 29 14 / 0.55), transparent 60%), radial-gradient(ellipse at center, transparent 45%, rgb(20 3 2 / 0.6) 100%); }
.frame { position: absolute; inset: 22px; border: 1.5px solid rgb(236 216 183 / 0.75); }
.frame::after { content: ''; position: absolute; inset: 7px; border: 1px solid rgb(236 216 183 / 0.28); }
.card { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: space-between; padding: 62px 90px 58px; }
.kicker { font: 600 15px Satoshi, sans-serif; letter-spacing: 0.42em; text-transform: uppercase; color: rgb(236 216 183 / 0.82); }
.logo { display: block; background: ${CREAM}; -webkit-mask-size: contain; -webkit-mask-repeat: no-repeat; -webkit-mask-position: center; filter: drop-shadow(0 6px 18px rgb(10 1 0 / 0.45)); }
.pair { display: flex; align-items: center; gap: 70px; }
.event { display: flex; flex-direction: column; align-items: center; width: 400px; }
.event .name { margin-top: 26px; }
.rule { width: 1px; height: 250px; background: linear-gradient(transparent, rgb(236 216 183 / 0.55), transparent); }
.name { font: 800 62px/1 Satoshi, sans-serif; letter-spacing: 0.02em; color: #fff5e6; }
.name.big { font-size: 104px; letter-spacing: 0.01em; }
.sub { margin-top: 12px; font: 500 21px 'General Sans', sans-serif; letter-spacing: 0.06em; color: rgb(236 216 183 / 0.92); }
.solo { display: flex; align-items: center; gap: 64px; width: 100%; justify-content: center; }
.text .sub { font-size: 25px; margin-top: 16px; }
.motto { margin-top: 26px; font: italic 500 27px 'General Sans', sans-serif; color: #fff5e6; }
.chips, .foot { display: flex; align-items: center; font: 600 15px Satoshi, sans-serif; letter-spacing: 0.24em; text-transform: uppercase; }
.chips { margin-top: 30px; color: rgb(236 216 183 / 0.78); font-size: 14px; }
.foot { color: ${CREAM}; letter-spacing: 0.3em; }
.chips i, .foot i { width: 5px; height: 5px; margin: 0 18px; border-radius: 50%; background: rgb(236 216 183 / 0.6); }
</style></head><body>
<svg class="paper" width="1200" height="630" aria-hidden="true">
  <filter id="crumple" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.0065 0.009" numOctaves="5" seed="7" result="noise"/>
    <feDiffuseLighting in="noise" lighting-color="#ffffff" surfaceScale="2.2" result="lit"><feDistantLight azimuth="235" elevation="48"/></feDiffuseLighting>
    <feColorMatrix in="lit" type="matrix" values="0 0 0 0 0.30  0 0 0 0 0.05  0 0 0 0 0.02  0 0 0 0.85 0"/>
  </filter>
  <rect width="1200" height="630" fill="${MAROON}"/>
  <rect width="1200" height="630" filter="url(#crumple)" style="mix-blend-mode:multiply"/>
  <rect width="1200" height="630" filter="url(#crumple)" opacity="0.5" style="mix-blend-mode:screen"/>
</svg>
<div class="vignette"></div><div class="frame"></div>
<div class="card">${body}</div>
</body></html>`;

// Each card is opened from a file: a page set from a string may not load the
// local fonts and logos it points at.
const work = mkdtempSync(join(tmpdir(), 'share-images-'));
const browser = await chromium.launch();
try {
  const tab = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  for (const [name, body] of Object.entries(cards)) {
    const html = join(work, `${name}.html`);
    writeFileSync(html, page(body));
    await tab.goto(pathToFileURL(html).href, { waitUntil: 'load' });
    const loaded = await tab.evaluate(async () => {
      await Promise.all([document.fonts.load('800 62px Satoshi'), document.fonts.load("500 21px 'General Sans'")]);
      const fonts = [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family.replace(/['"]/g, ''));
      // The logos are CSS masks; load each URL to prove it resolves.
      const images = [...document.querySelectorAll('.logo')].map((el) => { const r = el.getBoundingClientRect(); return r.width > 50 && r.height > 50 && getComputedStyle(el).webkitMaskImage.startsWith('url("data:image/png'); });
      return { fonts, images };
    });
    if (!['Satoshi', 'General Sans'].every((f) => loaded.fonts.includes(f))) throw new Error(`Brand fonts did not load (${loaded.fonts.join(', ') || 'none'}).`);
    if (!loaded.images.length || !loaded.images.every(Boolean)) throw new Error('A logo did not load.');
    const file = resolve(root, `public/images/og/${name}.jpg`);
    await tab.screenshot({ path: file, type: 'jpeg', quality: 90 });
    const kb = Math.round(statSync(file).size / 1024);
    if (kb > 290) throw new Error(`${name}.jpg is ${kb} KB; WhatsApp needs under 300 KB.`);
    console.log(`public/images/og/${name}.jpg  ${kb} KB`);
  }
} finally {
  await browser.close();
  rmSync(work, { recursive: true, force: true });
}
