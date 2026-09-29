'use client';

import { Button } from '@/components/ui/Button';

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <section className="utility-page wrap">
      <div className="utility-card space-y-6 text-center">
        <p className="text-meta font-mono uppercase text-text-3">Something went wrong</p>
        <h1 className="font-display text-4xl font-medium tracking-tight text-text sm:text-5xl">This page could not load</h1>
        <p className="mx-auto max-w-md text-base leading-relaxed text-text-2">
          It is usually temporary. Try again, or go back to the homepage. If you were submitting a form, check your email
          for a confirmation before submitting again.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Button type="button" onClick={reset} variant="primary">
            Try again
          </Button>
          <Button href="/" variant="secondary">
            Homepage
          </Button>
        </div>
      </div>
    </section>
  );
}
