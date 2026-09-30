'use client';

import { useRef } from 'react';
import { useEnhance } from '@/components/motion/useEnhance';
import { isLight, mixRGB, onThemeChange, token } from '@/lib/motion/colors';
import type { MoltenColors } from '@/lib/motion/molten';
import type { ScannerColors } from '@/lib/motion/scanner';
import { cn } from '@/lib/utils';

/**
 * Shader backdrops for two sections, in the design system's colours: the
 * seat (the home closing) gets the scanner, the footer gets molten light.
 * Both start after the visitor's first intent on the full motion tier, load
 * ogl and their shader in their own chunk, and fade in on their first frame;
 * elsewhere the section keeps its plain ground. Decorative.
 */
export function SeatScanner({ className }: { className?: string }) {
  const root = useRef<HTMLDivElement>(null);
  useEnhance(
    root,
    async (element, signal) => {
      const { startScanner } = await import('@/lib/motion/scanner');
      if (signal.aborted) return;
      const scanner = startScanner(element, scannerColors(element), () => element.setAttribute('data-lit', ''));
      if (!scanner) return;
      const stopTheme = onThemeChange(() => scanner.setColors(scannerColors(element)));
      return () => {
        stopTheme();
        scanner.destroy();
        element.removeAttribute('data-lit');
      };
    },
    { tiers: ['full'], near: '25% 0px' },
  );
  return <div ref={root} className={cn('backdrop backdrop--seat', className)} aria-hidden="true" />;
}

export function FooterMolten({ className }: { className?: string }) {
  const root = useRef<HTMLDivElement>(null);
  useEnhance(
    root,
    async (element, signal) => {
      const { startMolten } = await import('@/lib/motion/molten');
      if (signal.aborted) return;
      const molten = startMolten(element, moltenColors(element), () => element.setAttribute('data-lit', ''));
      if (!molten) return;
      const stopTheme = onThemeChange(() => molten.setColors(moltenColors(element)));
      return () => {
        stopTheme();
        molten.destroy();
        element.removeAttribute('data-lit');
      };
    },
    { tiers: ['full'], near: '25% 0px' },
  );
  return <div ref={root} className={cn('backdrop backdrop--footer', className)} aria-hidden="true" />;
}

/** The seat's crest ground: bands in champagne, peaks in the text colour. */
function scannerColors(element: Element): ScannerColors {
  const ground = token(element, '--color-canvas', '#6b0f1f');
  const champagne = token(element, '--color-champagne', '#ecd8b7');
  const text = token(element, '--color-text', '#fff7ea');
  const light = isLight(ground);
  return {
    color1: mixRGB(ground, [0, 0, 0], light ? 0.08 : 0.25),
    color2: champagne,
    color3: text,
    opacity: light ? 0.55 : 0.7,
  };
}

/** The footer's void: crimson glow with champagne cores; on light, the component's light mode. */
function moltenColors(element: Element): MoltenColors {
  const ground = token(element, '--color-void', '#0d0201');
  const crimson = token(element, '--color-crimson', '#e11d48');
  const champagne = token(element, '--color-champagne', '#ecd8b7');
  if (isLight(ground)) {
    return {
      // Blush, rose and warm sand: the light mode darkens its ridges, so the
      // brown champagne ink would turn grey there.
      color1: mixRGB(ground, crimson, 0.1),
      color2: mixRGB(ground, crimson, 0.26),
      color3: mixRGB(mixRGB(ground, champagne, 0.3), crimson, 0.08),
      background: ground,
      light: true,
      opacity: 0.5,
    };
  }
  return {
    color1: mixRGB(ground, crimson, 0.45),
    color2: crimson,
    color3: champagne,
    background: ground,
    light: false,
    opacity: 0.75,
  };
}
