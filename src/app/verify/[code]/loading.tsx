export default function Loading() {
  return (
    <section aria-busy="true" aria-live="polite" className="mx-auto max-w-2xl px-4 py-16 sm:py-24">
      <div className="surface space-y-5 p-8 sm:p-12">
        <div className="h-6 w-40 animate-pulse rounded-full bg-line" />
        <div className="h-10 w-3/4 animate-pulse rounded-lg bg-line" />
        <div className="h-4 w-full animate-pulse rounded bg-line" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-line" />
        <span className="sr-only">Loading…</span>
      </div>
    </section>
  );
}
