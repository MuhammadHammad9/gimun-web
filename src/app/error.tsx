'use client';

import Link from 'next/link';

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <section className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 py-16 text-center">
      <div className="surface w-full space-y-5 p-8 sm:p-10">
        <p className="font-mono text-xs uppercase tracking-widest text-text-3">Something went wrong</p>
        <h1 className="text-h2 font-display font-bold text-text">This page could not load</h1>
        <p className="text-sm leading-relaxed text-text-2">
          It is usually temporary. Try again, or go back to the homepage. If you were submitting a
          form, check your email for a confirmation before submitting again.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={reset}
            className="btn-shimmer-gold inline-flex min-h-11 items-center rounded-full px-6 text-xs font-bold uppercase tracking-wider"
          >
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center rounded-full border border-line-2 px-6 text-xs font-semibold text-text-2 transition-colors hover:border-line-3 hover:text-text"
          >
            Homepage
          </Link>
        </div>
      </div>
    </section>
  );
}
