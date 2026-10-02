'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

const KEY = 'gimun_analytics_consent';
/** Pages whose address is private (tokens, codes, staff records): never measured. */
const isPrivatePath = (path: string) => /^\/(admin|survey|verify)(\/|$)/.test(path);
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
  const pathname = usePathname();
  const [choice, setChoice] = useState<Choice | 'unknown'>('unknown');

  useEffect(() => {
    const sync = () => setChoice(readChoice());
    sync();
    window.addEventListener('analytics-consent-reset', sync);
    return () => window.removeEventListener('analytics-consent-reset', sync);
  }, []);

  // Page views are sent here, not by Google's automatic history tracking, so
  // a private address (a survey token, a certificate code, an admin record)
  // never reaches Google after the script has loaded on a public page.
  // GA4's "Page changes based on browser history events" must stay off
  // (docs/OPERATIONS_RUNBOOK.md); Google's own opt-out flag covers everything else.
  const loadedFor = useRef<string | null>(null);
  useEffect(() => {
    if (choice !== 'granted' || !measurementId) return;
    const privatePage = isPrivatePath(pathname);
    (window as unknown as Record<string, unknown>)[`ga-disable-${measurementId}`] = privatePage;
    if (privatePage) return;
    // The first public page is counted by the config call in the script below.
    if (loadedFor.current === null) {
      loadedFor.current = pathname;
      return;
    }
    if (loadedFor.current === pathname) return;
    loadedFor.current = pathname;
    // Defined by the config script below, which has run by the time a second page is shown.
    const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
    gtag?.('event', 'page_view', { page_location: `${location.origin}${pathname}`, page_title: document.title });
  }, [choice, measurementId, pathname]);

  if (isPrivatePath(pathname) || !measurementId || choice === 'unknown') return null;

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
            // Address without the query string, and no automatic page views after this one.
            __html: `window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', ${id}, { anonymize_ip: true, page_location: location.origin + location.pathname });`,
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
