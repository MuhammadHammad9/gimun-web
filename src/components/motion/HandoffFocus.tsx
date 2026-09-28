'use client';

import { useEffect, useRef } from 'react';
import { scrollTo } from '@/lib/motion/bridge';

/**
 * The home hero stays pinned while the next chapter slides over it. If
 * keyboard focus lands inside the hero while it is covered, bring it back
 * into view, so focus is never hidden behind the chapter above it.
 */
export function HandoffFocus() {
  const marker = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const stage = marker.current?.closest('.handoff__stage');
    if (!stage) return;
    const onFocus = (event: Event) => {
      const target = event.target as Element | null;
      if (window.scrollY > 4 && target?.matches(':focus-visible')) scrollTo(0, { immediate: true });
    };
    stage.addEventListener('focusin', onFocus);
    return () => stage.removeEventListener('focusin', onFocus);
  }, []);

  return <span ref={marker} hidden />;
}
