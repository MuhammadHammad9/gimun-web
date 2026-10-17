#!/usr/bin/env node
/**
 * Small copies of the official logos for the header, footer and seal.
 *
 *   node scripts/optimize-brand-logos.mjs
 *
 * The originals in public/images/brand stay the source of truth (and the
 * print-size files). The tallest logo on the site is the seal's, about 88 CSS
 * pixels on desktop (176 device pixels at 2x) and about 49 on phones (148 at
 * 3x), so a 192px-tall lossless WebP stays sharp at a fraction of the bytes.
 * The header loads these on every page at high priority, so every kilobyte
 * sits on the path to the first paint. Every use is an alpha mask (CSS mask, SVG mask-type: alpha), so
 * the colour channels are flattened to black and only the alpha is kept,
 * which is what lets lossless WebP get small. Rerun after replacing an original.
 */
import sharp from 'sharp';

const HEIGHT = 192;

for (const name of ['gimun-logo', 'gmc-logo']) {
  const source = `public/images/brand/${name}.png`;
  const target = `public/images/brand/${name}-${HEIGHT}.webp`;
  const alpha = await sharp(source).resize({ height: HEIGHT }).ensureAlpha().extractChannel('alpha').raw().toBuffer({ resolveWithObject: true });
  const { width, height } = alpha.info;
  const info = await sharp({ create: { width, height, channels: 3, background: '#000' } })
    .joinChannel(alpha.data, { raw: { width, height, channels: 1 } })
    .webp({ lossless: true, effort: 6 })
    .toFile(target);
  console.log(`${source} -> ${target} (${info.width}x${info.height}, ${info.size} bytes)`);
}
