#!/usr/bin/env node
/**
 * Small copies of the single-colour mask images: the official logos (header,
 * footer, seal) and the committee emblems (home placards, committee pages).
 *
 *   node scripts/optimize-mask-images.mjs
 *
 * The PNGs stay the source of truth (and the print-size files). Every use is
 * an alpha mask (CSS mask, SVG mask-type: alpha) painted in a theme colour,
 * so the colour channels are flattened to black and only the alpha is kept,
 * which is what lets lossless WebP get small. Rerun after replacing a PNG.
 *
 * Sizes follow the largest use:
 * - logos: the seal's, about 88 CSS px on desktop (176 at 2x) and 49 on
 *   phones (148 at 3x), so 192px tall. The header loads them on every page
 *   at high priority, so every kilobyte sits on the path to the first paint;
 * - emblems on placards: 76 CSS px (228 at 3x), so 256px tall;
 * - emblems in a committee page's hero: up to 208 CSS px, so full size.
 */
import sharp from 'sharp';

const jobs = [
  ...['gimun-logo', 'gmc-logo'].map((name) => ({ source: `public/images/brand/${name}.png`, target: `public/images/brand/${name}-192.webp`, height: 192 })),
  ...['unsc', 'unhrc', 'disec', 'unw', 'pna'].flatMap((slug) => [
    { source: `public/images/committees/${slug}.png`, target: `public/images/committees/${slug}-256.webp`, height: 256 },
    { source: `public/images/committees/${slug}.png`, target: `public/images/committees/${slug}.webp` },
  ]),
];

for (const { source, target, height } of jobs) {
  const alpha = await sharp(source).resize(height ? { height } : undefined).ensureAlpha().extractChannel('alpha').raw().toBuffer({ resolveWithObject: true });
  const { width, height: h } = alpha.info;
  const info = await sharp({ create: { width, height: h, channels: 3, background: '#000' } })
    .joinChannel(alpha.data, { raw: { width, height: h, channels: 1 } })
    .webp({ lossless: true, effort: 6 })
    .toFile(target);
  console.log(`${source} -> ${target} (${info.width}x${info.height}, ${info.size} bytes)`);
}
