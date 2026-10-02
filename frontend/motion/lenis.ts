/**
 * Smooth scrolling for the full motion tier (fine pointer, 1024 px and up).
 *
 * Lenis moves the real document scroll position, so sticky elements, print,
 * anchor links and CSS scroll timelines keep working. Imported only through a
 * dynamic import in SmoothScroll; never part of a page's first load.
 */
import Lenis from 'lenis';
import { isScrollLocked, setLenis } from './bridge';

export function startLenis(): () => void {
  const lenis = new Lenis({
    autoRaf: true,
    lerp: 0.1,
    smoothWheel: true,
    syncTouch: false,
    // Next.js and the bridge handle anchors; Lenis must not double-handle them.
    anchors: false,
    allowNestedScroll: true,
    stopInertiaOnNavigate: true,
  });
  setLenis(lenis);
  if (isScrollLocked()) lenis.stop();

  return () => {
    setLenis(null);
    lenis.destroy();
  };
}
