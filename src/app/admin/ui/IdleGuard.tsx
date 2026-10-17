'use client';
import { useEffect, useRef, useState } from 'react';

const PING_EVERY = 4 * 60_000;
const WARN_BEFORE = 2 * 60_000;

/**
 * The server signs an admin out after a stretch without requests. Typing a
 * long form makes no requests, so while someone is actually working this
 * pings the server at most every few minutes. With no activity at all it
 * warns two minutes before the sign-out, then goes to the sign-in page.
 */
export function IdleGuard({ idleMinutes }: { idleMinutes: number }) {
  const idleMs = idleMinutes * 60_000;
  const lastActive = useRef(0);
  const lastPing = useRef(0);
  const [warning, setWarning] = useState(false);

  useEffect(() => {
    const now = Date.now();
    lastActive.current = now;
    lastPing.current = now;
    const ping = () => {
      lastPing.current = Date.now();
      void fetch('/admin/live?active=1', { cache: 'no-store', credentials: 'same-origin' }).catch(() => undefined);
    };
    const active = () => {
      lastActive.current = Date.now();
      setWarning(false);
      if (Date.now() - lastPing.current > PING_EVERY) ping();
    };
    const events = ['keydown', 'pointerdown', 'wheel', 'touchstart'] as const;
    events.forEach((e) => window.addEventListener(e, active, { passive: true }));
    const timer = window.setInterval(() => {
      const quiet = Date.now() - Math.max(lastActive.current, lastPing.current);
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- a full load drops every bit of the signed-out session's page state
      if (quiet >= idleMs) window.location.assign('/admin/login?reason=idle');
      else setWarning(quiet >= idleMs - WARN_BEFORE);
    }, 15_000);
    return () => { events.forEach((e) => window.removeEventListener(e, active)); window.clearInterval(timer); };
  }, [idleMs]);

  if (!warning) return null;
  return <div className="admin-notices" role="alert">
    <div className="admin-notice">
      <span>You will be signed out in about two minutes because nothing has happened here.</span>
      <button type="button" className="admin-link-button" onClick={() => { lastActive.current = Date.now(); lastPing.current = Date.now(); setWarning(false); void fetch('/admin/live?active=1', { cache: 'no-store' }); }}>Stay signed in</button>
    </div>
  </div>;
}
