'use client';

import { ArrowLeft, House } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { TransitionLink } from '@/components/motion/TransitionLink';

export function NotFoundActions() {
  const router = useRouter();

  return (
    <nav className="not-found__actions" aria-label="404 recovery options">
      <button type="button" className="not-found__button not-found__button--back" onClick={() => router.back()}>
        <ArrowLeft aria-hidden="true" />
        Go back
      </button>
      <TransitionLink href="/" className="not-found__button not-found__button--home">
        <House aria-hidden="true" />
        Return home
      </TransitionLink>
    </nav>
  );
}
