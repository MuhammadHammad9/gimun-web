'use client';

import { useContext, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { TransitionContext } from '@/components/motion/TransitionProvider';

const QuickJump = dynamic(() => import('./QuickJump'), { ssr: false });

/**
 * The header's search button and the Ctrl+K / Cmd+K shortcut. The dialog's
 * code loads on first use; pages it opens go through the curtain like any
 * other link.
 */
export function QuickJumpButton() {
  const [open, setOpen] = useState(false);
  const opener = useRef<HTMLElement | null>(null);
  const transition = useContext(TransitionContext);
  const router = useRouter();

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        opener.current = document.activeElement as HTMLElement | null;
        setOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      <button
        type="button"
        className="quick-jump-button"
        aria-label="Jump to a page"
        aria-keyshortcuts="Control+K Meta+K"
        aria-haspopup="dialog"
        data-tip="Search pages · Ctrl K"
        onClick={(event) => {
          opener.current = event.currentTarget;
          setOpen(true);
        }}
      >
        <Search aria-hidden="true" strokeWidth={1.75} className="size-4" />
      </button>
      {open && (
        <QuickJump
          onClose={() => {
            setOpen(false);
            opener.current?.focus({ preventScroll: true });
          }}
          navigate={(href) => (transition ? transition.navigate(href) : router.push(href))}
        />
      )}
    </>
  );
}
