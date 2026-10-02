'use client';

import { useRef } from 'react';
import { useEnhance } from '@frontend/components/motion/useEnhance';
import type { CloudColors } from '@frontend/motion/clouds';
import { isLight, mixRGB, onThemeChange, token } from '@frontend/motion/colors';

/**
 * The sky behind the home hero: two banks of cloud drifting on the wind,
 * lit from the upper left, shifting a little with the pointer. Cream clouds
 * with champagne shade on the light theme; maroon night cloud with
 * champagne-lit edges on the dark one. Decorative.
 *
 * Starts after the visitor's first intent on the full motion tier; the shader
 * loads in its own chunk. Reduced motion, print and phones keep the plain
 * ground.
 */
export function HeroClouds() {
  const root = useRef<HTMLDivElement>(null);

  useEnhance(
    root,
    async (element, signal) => {
      const canvas = element.querySelector('canvas');
      if (!canvas) return;
      const { startClouds } = await import('@frontend/motion/clouds');
      if (signal.aborted) return;
      const clouds = startClouds(canvas, readColors(element), () => element.setAttribute('data-lit', ''));
      if (!clouds) return;

      const sized = new ResizeObserver(() => clouds.resize());
      sized.observe(canvas);
      const stopTheme = onThemeChange(() => clouds.setColors(readColors(element)));
      const onPointer = (event: PointerEvent) => {
        if (event.pointerType !== 'mouse') return;
        const rect = canvas.getBoundingClientRect();
        clouds.aim(event.clientX - rect.left, event.clientY - rect.top);
      };
      window.addEventListener('pointermove', onPointer, { passive: true });

      return () => {
        window.removeEventListener('pointermove', onPointer);
        stopTheme();
        sized.disconnect();
        clouds.destroy();
        element.removeAttribute('data-lit');
      };
    },
    { tiers: ['full'], near: '0px' },
  );

  return (
    <div ref={root} className="hero-clouds" aria-hidden="true">
      <canvas />
    </div>
  );
}

function readColors(element: Element): CloudColors {
  const ground = token(element, '--color-canvas', '#140302');
  const champagne = token(element, '--color-champagne', '#ecd8b7');
  const crimson = token(element, '--color-crimson', '#e11d48');
  if (isLight(ground)) {
    // Day: warm white tops, a sand-and-rose underside, on the cream ground.
    return {
      lit: [1, 1, 0.99],
      shade: mixRGB(mixRGB(ground, champagne, 0.62), crimson, 0.16),
      sky: mixRGB(mixRGB(ground, champagne, 0.42), crimson, 0.2),
      skyAlpha: 1,
      strength: 1,
    };
  }
  // Night: wine-dark bodies whose sun-facing sides catch champagne light.
  return { lit: mixRGB(champagne, ground, 0.35), shade: mixRGB(ground, crimson, 0.22), sky: ground, skyAlpha: 0, strength: 0.9 };
}
