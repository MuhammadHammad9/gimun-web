import { SkeletonLoader } from '@/components/ui/SkeletonLoader';

/**
 * Route-level loading state.
 *
 * A skeleton in roughly the shape of a page — masthead, then a card grid —
 * rather than the single centred "Loading…" line this replaced. A placeholder
 * that matches the layout tells a reader the page is arriving and where things
 * will be; a line of text tells them only that something is missing.
 *
 * `role="status"` with `aria-live="polite"` announces the wait once without
 * interrupting, and the decorative blocks are hidden from assistive tech.
 */
export default function Loading() {
  return (
    <div role="status" aria-live="polite" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <span className="sr-only">Loading page</span>

      <div aria-hidden="true" className="space-y-12">
        <div className="max-w-2xl space-y-5">
          <SkeletonLoader variant="badge" />
          <div className="h-12 w-full animate-pulse rounded-lg bg-champagne/15 sm:h-14" />
          <SkeletonLoader variant="text" lines={2} />
          <div className="flex gap-3 pt-2">
            <SkeletonLoader variant="button" />
            <SkeletonLoader variant="button" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          <SkeletonLoader variant="card" />
          <SkeletonLoader variant="card" />
          <SkeletonLoader variant="card" />
        </div>
      </div>
    </div>
  );
}
