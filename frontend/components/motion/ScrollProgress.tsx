/**
 * Reading-progress bar pinned under the site chrome.
 *
 * Driven entirely by CSS scroll-driven animation (`.scroll-progress` in
 * globals.css), so it is a server component with no JavaScript, no scroll
 * listener and no per-frame work. Browsers without `animation-timeline` simply
 * do not show it, which is the correct degradation for a decorative indicator.
 *
 * Hidden from assistive tech: it duplicates what the scrollbar already says.
 */
export function ScrollProgress() {
  return <div aria-hidden="true" className="scroll-progress print:hidden" />;
}

export default ScrollProgress;
