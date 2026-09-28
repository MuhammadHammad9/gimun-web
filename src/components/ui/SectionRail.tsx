'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export interface RailItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

/**
 * Sticky segmented control that tracks which stacked section is in view and
 * jumps to one when clicked.
 *
 * This is img.ly's central navigation idea: rather than a table of contents or
 * a wall of anchors, one pill follows you down the page and tells you where
 * you are. On a site this deep it does real orientation work, not just
 * decoration.
 *
 * Implementation notes:
 *  - Position is tracked with `IntersectionObserver`, never a scroll listener,
 *    so it costs nothing on the main thread while scrolling.
 *  - The moving highlight is a single pseudo-element driven by two CSS custom
 *    properties, so switching sections does not re-render the buttons.
 *  - It is a real tablist: arrow keys move between sections and the active
 *    item is announced.
 */
export function SectionRail({
  items,
  className,
}: {
  items: RailItem[];
  className?: string;
}) {
  const [active, setActive] = useState(items[0]?.id ?? '');
  const listRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  // Move the highlight under the active button.
  const positionPill = useCallback((id: string) => {
    const list = listRef.current;
    const btn = buttonRefs.current[id];
    if (!list || !btn) return;
    list.style.setProperty('--seg-x', `${btn.offsetLeft}px`);
    list.style.setProperty('--seg-w', `${btn.offsetWidth}px`);
  }, []);

  // The pill starts at zero width, so it is invisible until this runs — no
  // "ready" flag needed, and no setState inside an effect.
  useEffect(() => {
    positionPill(active);
  }, [active, positionPill]);

  // Reposition when the control reflows.
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const ro = new ResizeObserver(() => positionPill(active));
    ro.observe(list);
    return () => ro.disconnect();
  }, [active, positionPill]);

  // Track the section currently occupying the middle of the viewport.
  useEffect(() => {
    const sections = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      // A band across the middle of the viewport: a section counts as current
      // once it occupies the reading area, not merely when it peeks in.
      { rootMargin: '-45% 0px -45% 0px', threshold: [0, 0.25, 0.5, 1] }
    );

    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [items]);

  const go = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    setActive(id);
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const onKeyDown = (event: React.KeyboardEvent, index: number) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    event.preventDefault();
    const next =
      event.key === 'ArrowRight'
        ? (index + 1) % items.length
        : (index - 1 + items.length) % items.length;
    const id = items[next].id;
    buttonRefs.current[id]?.focus();
    go(id);
  };

  return (
    <div className={cn('rail', className)}>
      <div
        ref={listRef}
        role="tablist"
        aria-label="Jump to section"
        className="segmented max-w-[92vw] overflow-x-auto no-scrollbar"
      >
        {items.map((item, i) => {
          const isActive = item.id === active;
          return (
            <button
              key={item.id}
              ref={(el) => {
                buttonRefs.current[item.id] = el;
              }}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={item.id}
              tabIndex={isActive ? 0 : -1}
              onClick={() => go(item.id)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={cn(
                'relative z-10 inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium',
                'transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-champagne',
                isActive ? 'text-canvas' : 'text-text-3 hover:text-text'
              )}
            >
              {item.icon}
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default SectionRail;
