'use client';

import { X } from 'lucide-react';
import { useEffect } from 'react';

/** Hides the notice now and on later visits (see noticeBootScript). */
export function DismissNotice({ storageKey }: { storageKey: string }) {
  useEffect(() => {
    try {
      if (localStorage.getItem(storageKey) === 'true') document.documentElement.dataset.bannerDismissed = '1';
      else delete document.documentElement.dataset.bannerDismissed;
    } catch {
      delete document.documentElement.dataset.bannerDismissed;
    }
  }, [storageKey]);

  return (
    <button
      type="button"
      className="notice-bar__dismiss"
      aria-label="Dismiss notice"
      onClick={() => {
        try {
          localStorage.setItem(storageKey, 'true');
        } catch {
          // Storage blocked: the notice still hides for this page view.
        }
        document.documentElement.dataset.bannerDismissed = '1';
      }}
    >
      <X aria-hidden="true" strokeWidth={1.75} className="size-4" />
    </button>
  );
}
