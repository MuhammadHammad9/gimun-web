'use client';

import { useRef, type ReactNode } from 'react';
import { useEnhance } from '@/components/motion/useEnhance';
import { cn } from '@/lib/utils';

/**
 * Wraps a line drawing drawn with `live` and lets its idle loop run: after
 * the visitor's first intent, and only while the drawing is on screen. The
 * loops themselves are CSS (motion.css, `.live-art[data-live]`), transform
 * and opacity only; under reduced motion nothing here runs and the drawing
 * stays still.
 */
export function LiveArt({ children, className }: { children: ReactNode; className?: string }) {
  const root = useRef<HTMLDivElement>(null);

  useEnhance(root, (element) => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) element.setAttribute('data-live', '');
      else element.removeAttribute('data-live');
    });
    observer.observe(element);
    return () => {
      observer.disconnect();
      element.removeAttribute('data-live');
    };
  }, { near: '0px' });

  return (
    <div ref={root} className={cn('live-art', className)} aria-hidden="true">
      {children}
    </div>
  );
}
