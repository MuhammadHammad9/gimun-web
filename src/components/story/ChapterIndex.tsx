'use client';

import { useEffect, useState } from 'react';
import { chromeHeight, scrollToElement } from '@/lib/motion/bridge';
import { firstIntent } from '@/lib/motion/gates';

interface Chapter {
  number: string;
  label: string;
  target: string;
}

/** Glides to a chapter heading and moves focus there without a jump. */
function goTo(id: string) {
  const heading = document.getElementById(id);
  if (!heading) return;
  const target = heading.closest('section') ?? heading;
  scrollToElement(target);
  // A long glide can cross a pinned section that is still measuring itself,
  // which moves the target. Once the scroll settles, correct it once.
  let last = -1;
  const settle = () => {
    if (Math.abs(window.scrollY - last) >= 1) {
      last = window.scrollY;
      window.setTimeout(settle, 150);
      return;
    }
    const miss = target.getBoundingClientRect().top - (chromeHeight() + 24);
    if (Math.abs(miss) > 8) scrollToElement(target);
  };
  window.setTimeout(settle, 300);
  if (!heading.hasAttribute('tabindex')) heading.setAttribute('tabindex', '-1');
  heading.focus({ preventScroll: true });
  history.replaceState(history.state, '', `#${id}`);
}

/**
 * The page's chapter rail: a fixed index in the left margin on wide screens,
 * built from the ChapterKicker markers the page renders. The chapter in view
 * is marked as the current location, and a hairline beside the numbers fills
 * with the reader's progress (a CSS scroll timeline, off under reduced motion).
 *
 * The rail itself appears after the visitor's first scroll, tap or key, so it
 * costs nothing before then. Chapter links on the page (Bridge) glide from
 * the first click.
 */
export function ChapterIndex() {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [active, setActive] = useState<string | null>(null);
  // The rail steps aside over the hero (before the first chapter arrives) and
  // over the footer, where it would sit on top of their text.
  const [aside, setAside] = useState(true);

  // Bridge links: smooth, focus-moving chapter jumps.
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[data-chapter-link]');
      const id = link?.hash.slice(1);
      if (!id || !document.getElementById(id)) return;
      event.preventDefault();
      goTo(id);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  useEffect(() => {
    let observer: IntersectionObserver | undefined;
    let cancelled = false;
    const wide = window.matchMedia('(min-width: 1280px)');

    const start = () => {
      observer?.disconnect();
      if (cancelled || !wide.matches) {
        setChapters([]);
        return;
      }
      const markers = Array.from(document.querySelectorAll<HTMLElement>('main [data-chapter]'));
      setChapters(
        markers.map((marker) => ({
          number: marker.dataset.chapterNumber ?? '',
          label: marker.dataset.chapter ?? '',
          target: marker.dataset.chapterTarget ?? '',
        })),
      );
      const sections = new Map<Element, string>();
      for (const marker of markers) {
        const section = marker.closest('section');
        if (section && marker.dataset.chapterTarget) sections.set(section, marker.dataset.chapterTarget);
      }
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) setActive(sections.get(entry.target) ?? null);
          }
        },
        // A chapter is current while it crosses the band a little above the middle.
        { rootMargin: '-35% 0px -60% 0px' },
      );
      sections.forEach((_, section) => observer?.observe(section));
      first = markers[0]?.closest('section') ?? null;
      place();
    };

    let first: Element | null = null;
    let frame = 0;
    const place = () => {
      frame = 0;
      const footer = document.querySelector('.site-footer');
      const arrived = first ? first.getBoundingClientRect().top < window.innerHeight * 0.8 : false;
      const ending = footer ? footer.getBoundingClientRect().top < window.innerHeight * 0.85 : false;
      setAside(!arrived || ending);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(place);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    firstIntent().then(start);
    wide.addEventListener('change', start);
    return () => {
      cancelled = true;
      observer?.disconnect();
      wide.removeEventListener('change', start);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  if (chapters.length < 2) return null;

  return (
    <nav className="chapter-index" aria-label="Chapters on this page" data-aside={aside ? '' : undefined}>
      <span className="chapter-index__thread" aria-hidden="true" />
      <ol>
        {chapters.map((chapter) => (
          <li key={chapter.target}>
            <a
              href={`#${chapter.target}`}
              aria-current={active === chapter.target ? 'location' : undefined}
              onClick={(event) => {
                event.preventDefault();
                goTo(chapter.target);
              }}
            >
              <span className="chapter-index__num">{chapter.number}</span>
              <span className="chapter-index__label">{chapter.label}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
