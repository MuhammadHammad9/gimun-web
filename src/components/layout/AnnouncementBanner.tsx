'use client';

import React, { useState } from 'react';

import type { Announcement } from '@/lib/types';

interface AnnouncementBannerProps {
  announcement?: Announcement;
  message?: string;
  linkText?: string;
  linkHref?: string;
}

export function AnnouncementBanner({
  announcement,
  message,
  linkText = 'View Update',
  linkHref = '/announcements',
}: AnnouncementBannerProps) {
  const displayMessage = announcement ? announcement.title : (message || 'Early Bird Registration now open for delegations and moot court teams.');
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <aside className="bg-primary text-white text-xs py-2 px-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 truncate">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span className="truncate">{displayMessage}</span>
          <a href={linkHref} className="underline font-semibold hover:text-accent ml-2 shrink-0">
            {linkText} →
          </a>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-white/70 hover:text-white shrink-0 font-mono text-xs ml-2"
          aria-label="Dismiss banner"
        >
          ✕
        </button>
      </div>
    </aside>
  );
}
