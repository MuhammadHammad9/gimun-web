'use client';
import { useEffect, useRef, useState, useTransition } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { syncLiveContent } from '@/app/live-actions';

/** Pages where minutes matter: checked every 4 s. Everywhere else every 15 s. */
const FAST_PATHS = ['/schedule', '/announcements', '/register', '/results'];
const EXCLUDED_PUBLIC = ['/admin', '/survey/', '/verify/'];
/**
 * Each admin check runs the sign-in, two-factor and permission checks plus two
 * revision queries, several database round trips in all, so admin tabs poll
 * less often than public pages (which the CDN answers).
 */
const ADMIN_INTERVAL_MS = 10_000;
const MAX_BACKOFF_MS = 120_000;

function onEventDay(start?: string, end?: string) {
  if (!start || !end) return false;
  const now = Date.now();
  return now >= new Date(`${start}T00:00:00+05:00`).getTime() && now <= new Date(`${end}T23:59:59+05:00`).getTime();
}

/**
 * Public forms the visitor has typed into and not yet submitted. Tracked from
 * input events: React keeps a controlled field's value attribute in sync, so
 * comparing value with defaultValue cannot tell typed text from the initial.
 */
const formsInProgress = new Set<HTMLFormElement>();
let formTracking = false;

function trackPublicForms() {
  if (formTracking) return;
  formTracking = true;
  document.addEventListener(
    'input',
    (event) => {
      const form = (event.target as Element | null)?.closest?.('main form');
      if (form instanceof HTMLFormElement && !(event.target as HTMLInputElement).matches?.('[type="search"]')) formsInProgress.add(form);
    },
    true,
  );
  const done = (event: Event) => {
    if (event.target instanceof HTMLFormElement) formsInProgress.delete(event.target);
  };
  document.addEventListener('submit', done, true);
  document.addEventListener('reset', done, true);
}

/** True while a visitor is part-way through a public form, or has the cursor in one. */
function publicFormInProgress() {
  const active = document.activeElement;
  if (active instanceof HTMLElement && active.closest('main form') && active.matches('input, textarea, select')) return true;
  for (const form of formsInProgress) {
    if (form.isConnected) return true;
    formsInProgress.delete(form);
  }
  return false;
}

/** Text of every element that marks itself as live content, by key. */
function snapshot() {
  const map = new Map<string, string>();
  for (const el of document.querySelectorAll<HTMLElement>('[data-live-key]')) map.set(el.dataset.liveKey!, el.textContent ?? '');
  return map;
}

export function LiveUpdates({ initial, admin = false, eventStart, eventEnd }: { initial: string; admin?: boolean; eventStart?: string; eventEnd?: string }) {
  const router = useRouter(), path = usePathname();
  const baseline = useRef(initial);
  const [status, setStatus] = useState('Checking updates');
  const [time, setTime] = useState('');
  const [pending, start] = useTransition();
  const refreshing = useRef(false);
  const before = useRef<Map<string, string> | null>(null);
  // Public: 'waiting' shows the "New updates" chip, 'done' the brief confirmation.
  const [notice, setNotice] = useState<'none' | 'waiting' | 'done'>('none');
  // The revision the server reported just before a public refresh, and the
  // revision the page actually rendered from (the layout's `initial`). A
  // refresh can race the regeneration of a static page and come back one
  // version behind; then it is retried shortly instead of a whole poll later.
  const target = useRef<string | null>(null);
  const rendered = useRef(initial);
  const retries = useRef(0);

  const sync = async () => {
    const live = await syncLiveContent(baseline.current).catch(() => null);
    target.current = typeof live === 'string' && live !== 'unavailable' ? live : null;
    retries.current = 0;
  };

  const refresh = async () => {
    refreshing.current = true;
    if (!admin) await sync();
    before.current = admin ? null : snapshot();
    start(() => router.refresh());
  };

  useEffect(() => {
    baseline.current = initial;
    rendered.current = initial;
    refreshing.current = false;
  }, [initial, path]);

  useEffect(() => {
    if (!admin && EXCLUDED_PUBLIC.some((p) => path.startsWith(p))) return;
    if (!admin) trackPublicForms();
    let inFlight = false;
    let cancelled = false;
    // Consecutive failed checks. Each one doubles the wait (up to two
    // minutes), so an outage is not met with a steady stream of retries from
    // every open page; the first success returns to the normal pace.
    let failures = 0;
    let timer: ReturnType<typeof setTimeout>;
    const controller = new AbortController();
    const interval = () => {
      const base = admin ? ADMIN_INTERVAL_MS : FAST_PATHS.some((p) => path.startsWith(p)) || onEventDay(eventStart, eventEnd) ? 4000 : 15000;
      return Math.min(base * 2 ** failures, MAX_BACKOFF_MS) * (0.9 + Math.random() * 0.2);
    };
    async function check() {
      if (inFlight) return;
      clearTimeout(timer);
      if (document.visibilityState === 'hidden') {
        timer = setTimeout(check, 5000);
        return;
      }
      inFlight = true;
      try {
        const response = await fetch(admin ? '/admin/live' : '/api/public/revision', { cache: 'no-store', signal: AbortSignal.any([controller.signal, AbortSignal.timeout(4000)]) });
        if (!response.ok || response.redirected) throw new Error('Unavailable');
        const result = await response.json();
        if (!result.connected) throw new Error('Unavailable');
        if (cancelled) return;
        failures = 0;
        setTime(new Date().toLocaleTimeString());
        if (result.revision !== baseline.current) {
          if (admin) {
            if (document.querySelector('[data-admin-dirty="true"]')) setStatus('Changes available · your unsaved work is preserved');
            else if (!refreshing.current) {
              setStatus('Updating');
              refreshing.current = true;
              start(() => router.refresh());
            }
          } else if (!refreshing.current) {
            if (publicFormInProgress()) setNotice('waiting');
            else {
              refreshing.current = true;
              // Make sure the cached pages are fresh before asking for this one.
              await sync();
              if (cancelled) return;
              before.current = snapshot();
              start(() => router.refresh());
            }
          }
        } else if (admin) setStatus(result.websiteConnected === false ? 'Admin connected · website in fallback' : 'Live · checks every 10 seconds');
      } catch {
        failures = Math.min(failures + 1, 6);
        if (!cancelled && admin) setStatus(navigator.onLine ? 'Updates delayed · retrying' : 'Offline · changes may be out of date');
      } finally {
        inFlight = false;
        if (!cancelled) timer = setTimeout(check, interval());
      }
    }
    const resume = () => {
      if (!cancelled) void check();
    };
    void check();
    window.addEventListener('online', resume);
    document.addEventListener('visibilitychange', resume);
    return () => {
      cancelled = true;
      clearTimeout(timer);
      controller.abort();
      window.removeEventListener('online', resume);
      document.removeEventListener('visibilitychange', resume);
    };
  }, [admin, path, router, eventStart, eventEnd]);

  // After a public refresh lands: mark what changed, and confirm briefly.
  useEffect(() => {
    if (pending) return;
    const previous = before.current;
    // Still behind what the server reported: try again shortly, keeping the
    // snapshot so the eventual update is marked against the original page.
    if (previous && target.current && rendered.current !== target.current && retries.current < 3) {
      retries.current += 1;
      const retry = setTimeout(() => start(() => router.refresh()), 1000 * retries.current);
      return () => clearTimeout(retry);
    }
    refreshing.current = false;
    target.current = null;
    if (!previous) return;
    before.current = null;
    const changed: HTMLElement[] = [];
    for (const el of document.querySelectorAll<HTMLElement>('[data-live-key]')) {
      const old = previous.get(el.dataset.liveKey!);
      if (old === undefined || old !== (el.textContent ?? '')) changed.push(el);
    }
    for (const el of changed) el.setAttribute('data-live-changed', '');
    // The confirmation is shown after the refresh has committed, from a timer
    // rather than synchronously in this effect.
    const show = setTimeout(() => setNotice('done'), 0);
    const clear = setTimeout(() => {
      for (const el of changed) el.removeAttribute('data-live-changed');
      setNotice('none');
    }, 4000);
    return () => {
      clearTimeout(show);
      clearTimeout(clear);
    };
  }, [pending, router]);

  if (admin)
    return (
      <div className="admin-live">
        <span role="status">
          <i aria-hidden="true" />
          {status}
        </span>
        {time && <small>Last checked {time}</small>}
        <button
          type="button"
          className="secondary"
          disabled={pending}
          onClick={() => {
            if (!document.querySelector('[data-admin-dirty="true"]')) void refresh();
            else setStatus('Save or discard your changes before refreshing');
          }}
        >
          Refresh
        </button>
      </div>
    );

  if (EXCLUDED_PUBLIC.some((p) => path.startsWith(p))) return null;

  return (
    <div className="live-notice" role="status" aria-live="polite" aria-label="Page updates">
      {notice === 'waiting' && (
        <button
          type="button"
          className="live-notice__chip"
          onClick={() => {
            setNotice('none');
            void refresh();
          }}
        >
          <span className="live-dot" aria-hidden="true" />
          This page has updates. Show them
        </button>
      )}
      {notice === 'done' && (
        <p className="live-notice__chip live-notice__chip--quiet">
          <span className="live-dot" aria-hidden="true" />
          Updated just now
        </p>
      )}
    </div>
  );
}
