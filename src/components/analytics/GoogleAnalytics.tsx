'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';

const KEY = 'gimun_analytics_consent';
type Choice = 'granted' | 'denied' | null;

function readChoice(): Choice {
  try {
    const value = localStorage.getItem(KEY);
    return value === 'granted' || value === 'denied' ? value : null;
  } catch {
    return null;
  }
}

/** Lets the privacy page reopen the choice. */
export function resetAnalyticsChoice() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* storage unavailable: the banner simply shows again */
  }
  window.dispatchEvent(new Event('analytics-consent-reset'));
}

/**
 * Google Analytics loads only after the visitor agrees. Declining, or never
 * answering, means no Google script and no analytics cookies at all.
 */
export function GoogleAnalytics({ measurementId }: { measurementId?: string }) {
  const [choice, setChoice] = useState<Choice | 'unknown'>('unknown');

  useEffect(() => {
    const sync = () => setChoice(readChoice());
    sync();
    window.addEventListener('analytics-consent-reset', sync);
    return () => window.removeEventListener('analytics-consent-reset', sync);
  }, []);

  if (!measurementId || choice === 'unknown') return null;

  const decide = (value: 'granted' | 'denied') => {
    try {
      localStorage.setItem(KEY, value);
    } catch {
      /* choice lasts for this page view only */
    }
    setChoice(value);
  };

  if (choice === 'granted') {
    const id = JSON.stringify(measurementId);
    return (
      <>
        <Script async src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`} />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', ${id}, { anonymize_ip: true });`,
          }}
        />
      </>
    );
  }

  if (choice === 'denied') return null;

  return (
    <div
      role="region"
      aria-label="Analytics choice"
      className="fixed inset-x-3 bottom-3 z-50 mx-auto flex max-w-2xl flex-col gap-3 rounded-2xl border border-line-2 bg-raised/95 p-4 text-sm text-text-2 shadow-2xl backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between print:hidden"
    >
      <p>
        May we use Google Analytics to count visits? It sets cookies. Forms work either way.{' '}
        <a href="/privacy#analytics" className="text-champagne underline underline-offset-2">
          Details
        </a>
      </p>
      <div className="flex shrink-0 gap-2">
        <button
          type="button"
          onClick={() => decide('denied')}
          className="min-h-10 rounded-full border border-line-2 px-4 text-xs font-semibold text-text-2 hover:text-text"
        >
          No thanks
        </button>
        <button
          type="button"
          onClick={() => decide('granted')}
          className="btn-shimmer-gold min-h-10 rounded-full px-4 text-xs font-bold"
        >
          Allow
        </button>
      </div>
    </div>
  );
}
