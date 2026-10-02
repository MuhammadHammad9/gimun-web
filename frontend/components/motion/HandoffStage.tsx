'use client';

import { useEffect, useRef } from 'react';
import { scrollTo } from '@frontend/motion/bridge';

/**
 * Makes a hero hold its place while the next chapter slides over it.
 *
 * The stage is pinned by its bottom edge: a hero taller than the screen
 * first scrolls fully into view, then stays while the sheet covers it, so
 * nothing in the hero is ever hidden before it was seen. Until this runs
 * (and without JavaScript, or with reduced motion) the stage is simply part
 * of the page flow.
 *
 * Also keeps keyboard focus visible: focus landing in the hero while it is
 * covered brings it back into view.
 */
export function HandoffStage() {
  const marker = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const stage = marker.current?.closest<HTMLElement>('.handoff__stage');
    if (!stage) return;

    const measure = () => {
      const top = Math.min(0, window.innerHeight - stage.offsetHeight);
      stage.style.setProperty('--stage-top', `${top}px`);
      stage.dataset.stuck = '';
    };
    measure();
    const resize = new ResizeObserver(measure);
    resize.observe(stage);
    window.addEventListener('resize', measure);

    const onFocus = (event: Event) => {
      const target = event.target as HTMLElement | null;
      if (!target?.matches(':focus-visible')) return;
      const rect = target.getBoundingClientRect();
      const sheet = stage.nextElementSibling?.getBoundingClientRect();
      if (sheet && rect.bottom > sheet.top) scrollTo(Math.max(0, window.scrollY - (rect.bottom - sheet.top) - 48), { immediate: true });
    };
    stage.addEventListener('focusin', onFocus);

    return () => {
      resize.disconnect();
      window.removeEventListener('resize', measure);
      stage.removeEventListener('focusin', onFocus);
      delete stage.dataset.stuck;
    };
  }, []);

  return <span ref={marker} hidden />;
}
