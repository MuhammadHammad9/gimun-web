'use client';

import React, { useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
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
  const displayMessage = announcement?.title || message || 'Early Bird Registration now open for delegations and moot court teams.';
  const storageKey = `gimun_announcement_dismissed_${announcement?.id || 'default'}`;
  
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

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
    () => true
  );

  const handleDismiss = () => {
    setManuallyDismissed(true);
    try {
      localStorage.setItem(storageKey, 'true');
    } catch {
      // Ignore local storage error
    }
  };

  if (!isClient) return null;
  const dismissed = isDismissedInStorage || manuallyDismissed;

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.aside
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
          className="overflow-hidden bg-[#141D54] text-white border-b border-white/10"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between text-xs font-medium gap-3">
            <div className="flex items-center gap-2.5 truncate">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#FF6B35]/20 text-[#FF6B35] shrink-0">
                <Sparkles className="w-3 h-3 animate-pulse" />
              </span>
              <span className="truncate text-white/90">
                {displayMessage}
              </span>
              <Link
                href={linkHref}
                className="underline underline-offset-2 font-semibold text-[#FF6B35] hover:text-[#E55A28] shrink-0 ml-1 transition-colors"
              >
                {linkText} →
              </Link>
            </div>

            <button
              onClick={handleDismiss}
              type="button"
              className="p-1 rounded hover:bg-white/10 text-white/60 hover:text-white transition-colors shrink-0 ml-2"
              aria-label="Dismiss notice"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
