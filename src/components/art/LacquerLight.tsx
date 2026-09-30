'use client';

import { useRef } from 'react';
import { useEnhance } from '@/components/motion/useEnhance';
import type { LacquerColors } from '@/lib/motion/lacquer';
import { cn } from '@/lib/utils';

type Tint = 'house' | 'gimun' | 'gmc';

/**
 * Ambient light behind a hero: silk folds in the room's colour with a
 * champagne sheen, and a lamp that drifts toward the pointer. Purely
 * decorative. It starts after the visitor's first intent on the full motion
 * tier only (fine pointer, wide screen, motion allowed); everywhere else the
 * hero keeps its plain ground. The shader module loads only then, so it is
 * never part of a page's first load.
 */
export function LacquerLight({ tint = 'house', className }: { tint?: Tint; className?: string }) {
  const root = useRef<HTMLDivElement>(null);

  useEnhance(
    root,
    async (element, signal) => {
      const canvas = element.querySelector('canvas');
      if (!canvas) return;
      const { startLacquer } = await import('@/lib/motion/lacquer');
      if (signal.aborted) return;
      const light = startLacquer(canvas, readColors(element, tint), () => element.setAttribute('data-lit', ''));
      if (!light) return;

      const sized = new ResizeObserver(() => light.resize());
      sized.observe(canvas);
      const themed = new MutationObserver(() => light.setColors(readColors(element, tint)));
      themed.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class'] });
      const scheme = window.matchMedia('(prefers-color-scheme: dark)');
      const onScheme = () => light.setColors(readColors(element, tint));
      scheme.addEventListener('change', onScheme);
      const onPointer = (event: PointerEvent) => {
        if (event.pointerType !== 'mouse') return;
        const rect = canvas.getBoundingClientRect();
        light.aim(event.clientX - rect.left, event.clientY - rect.top);
      };
      window.addEventListener('pointermove', onPointer, { passive: true });

      return () => {
        window.removeEventListener('pointermove', onPointer);
        scheme.removeEventListener('change', onScheme);
        themed.disconnect();
        sized.disconnect();
        light.destroy();
        element.removeAttribute('data-lit');
      };
    },
    { tiers: ['full'], near: '0px' },
  );

  return (
    <div ref={root} className={cn('lacquer', className)} aria-hidden="true">
      <canvas />
    </div>
  );
}

/** Reads a CSS colour (any syntax) as 0–1 RGB through a one-pixel canvas. */
function rgb(color: string, probe: CanvasRenderingContext2D): [number, number, number] {
  probe.clearRect(0, 0, 1, 1);
  probe.fillStyle = '#000';
  probe.fillStyle = color;
  probe.fillRect(0, 0, 1, 1);
  const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;
  return [r / 255, g / 255, b / 255];
}

function readColors(element: Element, tint: Tint): LacquerColors {
  const style = getComputedStyle(element);
  const token = (name: string, fallback: string) => style.getPropertyValue(name).trim() || fallback;
  const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
  if (!probe) return { fold: [0.88, 0.11, 0.28], sheen: [0.93, 0.85, 0.72], strength: 1 };
  const champagne = rgb(token('--color-champagne', '#ecd8b7'), probe);
  const crimson = rgb(token('--color-crimson', '#e11d48'), probe);
  const ground = rgb(token('--color-canvas', '#140302'), probe);
  const light = 0.2126 * ground[0] + 0.7152 * ground[1] + 0.0722 * ground[2] > 0.5;
  // GMC's room is champagne: its folds turn warm and the sheen stays pale.
  const fold = tint === 'gmc' ? champagne : crimson;
  // Champagne folds read brighter than crimson ones on the same ground.
  const strength = (light ? 0.5 : 1) * (tint === 'gmc' ? 0.7 : 1);
  return { fold, sheen: champagne, strength };
}
