'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { motionTier } from '@/lib/motion/policy';

type Animatable = { x: (value: number, duration?: number, ease?: unknown) => unknown; y: (value: number, duration?: number, ease?: unknown) => unknown; revert: () => unknown };

/**
 * Leans a call to action toward the pointer (up to `strength` px) and
 * springs it back on leave. The pull is zero at the centre, so the button
 * rests exactly where a click aims. Fine pointers on the full motion tier
 * only; anime.js loads on the first hover.
 */
export function Magnetic({ children, strength = 12, className }: { children: ReactNode; strength?: number; className?: string }) {
  const zone = useRef<HTMLSpanElement>(null);
  const inner = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const area = zone.current;
    const target = inner.current;
    if (!area || !target || motionTier() !== 'full') return;
    let animatable: Animatable | null = null;
    let loading: Promise<void> | null = null;
    let returnEase: unknown;
    let disposed = false;

    const load = () => {
      loading ??= import('@/lib/motion/anime').then(({ createAnimatable, spring }) => {
        if (disposed) return;
        animatable = createAnimatable(target, { x: 360, y: 360, ease: 'out(3)' }) as unknown as Animatable;
        returnEase = spring({ bounce: 0.45, duration: 700 });
      });
      return loading;
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      void load().then(() => {
        if (!animatable) return;
        const rect = area.getBoundingClientRect();
        const dx = (event.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
        const dy = (event.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
        animatable.x(Math.max(-1, Math.min(1, dx)) * strength);
        animatable.y(Math.max(-1, Math.min(1, dy)) * strength * 0.6);
      });
    };
    const onLeave = () => {
      animatable?.x(0, 700, returnEase);
      animatable?.y(0, 700, returnEase);
    };

    area.addEventListener('pointermove', onMove);
    area.addEventListener('pointerleave', onLeave);
    return () => {
      disposed = true;
      area.removeEventListener('pointermove', onMove);
      area.removeEventListener('pointerleave', onLeave);
      animatable?.revert();
    };
  }, [strength]);

  return (
    <span ref={zone} className={className} style={{ display: 'inline-flex' }}>
      <span ref={inner} style={{ display: 'inline-flex' }}>
        {children}
      </span>
    </span>
  );
}
