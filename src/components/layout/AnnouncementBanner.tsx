'use client';

import React, { useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import type { Announcement } from '@/lib/types';
import { X, Sparkles } from 'lucide-react';

const emptySubscribe = () => () => {};

interface AnnouncementBannerProps {
  announcement?: Announcement;
  message?: string;
  linkText?: string;
  linkHref?: string;
}

export function AnnouncementBanner({
  announcement,
  message,
  linkText = 'Read Announcement',
  linkHref = '/announcements',
}: AnnouncementBannerProps) {
  const displayMessage =
    announcement?.title ||
    message ||
    'Early Bird Registration now open for delegations and moot court teams.';
  const targetHref =
    announcement?.actionUrl ||
    (announcement?.id ? `/announcements#${announcement.id}` : linkHref);
  const storageKey = `gimun_announcement_dismissed_${announcement?.id || 'default'}`;
  

  const [manuallyDismissed, setManuallyDismissed] = useState(false);

  const isDismissedInStorage = useSyncExternalStore(
    emptySubscribe,
    () => {
      try {
        return localStorage.getItem(storageKey) === 'true';
      } catch {
        return false;
      }
    },
    () => false
  );

  const handleDismiss = () => {
    setManuallyDismissed(true);
    try {
      localStorage.setItem(storageKey, 'true');
    } catch {
      // Ignore local storage error
    }
  };

  const dismissed = isDismissedInStorage || manuallyDismissed;

  // Dismissal is a one-way collapse, so it does not need an exit animation
  // framework: the element unmounts and CSS handles the rest. Keeping
  // framer-motion out of the site chrome keeps it out of every page's bundle.
  if (dismissed || (!announcement && !message)) return null;

  return (
    <aside
      aria-label="Site announcement"
      className="banner-collapse overflow-hidden border-b border-line bg-elevated text-white"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2.5 text-xs font-medium sm:px-6 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand/60 text-champagne">
            <Sparkles aria-hidden="true" className="h-3 w-3" />
          </span>
          <span className="min-w-0 flex-1 truncate text-white/90" title={displayMessage}>{displayMessage}</span>
          <Link
            href={targetHref}
            className="ml-1 shrink-0 font-semibold text-champagne underline underline-offset-2 transition-colors hover:text-white"
          >
            {linkText}
          </Link>
        </div>

        <button
          onClick={handleDismiss}
          type="button"
          className="ml-2 shrink-0 rounded p-1 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Dismiss notice"
        >
          <X aria-hidden="true" className="h-3.5 w-3.5" />
        </button>
      </div>
    </aside>
  );
}
