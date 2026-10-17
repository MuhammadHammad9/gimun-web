#!/usr/bin/env node
/**
 * Small copies of the official logos for the header, footer and seal.
 *
 *   node scripts/optimize-brand-logos.mjs
 *
 * The originals in public/images/brand stay the source of truth (and the
 * print-size files). The site never shows a logo taller than about 90 CSS
 * pixels, so a 288px-tall lossless WebP covers 3x screens at a fraction of
 * the bytes. Every use is an alpha mask (CSS mask, SVG mask-type: alpha), so
 * the colour channels are flattened to black and only the alpha is kept,
 * which is what lets lossless WebP get small. Rerun after replacing an original.
 */
import sharp from 'sharp';

for (const name of ['gimun-logo', 'gmc-logo']) {
  const source = `public/images/brand/${name}.png`;
  const target = `public/images/brand/${name}-288.webp`;
  const alpha = await sharp(source).resize({ height: 288 }).ensureAlpha().extractChannel('alpha').raw().toBuffer({ resolveWithObject: true });
  const { width, height } = alpha.info;
  const info = await sharp({ create: { width, height, channels: 3, background: '#000' } })
    .joinChannel(alpha.data, { raw: { width, height, channels: 1 } })
    .webp({ lossless: true, effort: 6 })
    .toFile(target);
  console.log(`${source} -> ${target} (${info.width}x${info.height}, ${info.size} bytes)`);
}
