'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Cloudflare Turnstile, the human check on the public forms. Every form that
 * sends email or stores an application asks for a token, so a script cannot
 * use the site to email strangers. Without NEXT_PUBLIC_TURNSTILE_SITE_KEY the
 * check is off and the forms behave as before (local development and tests).
 */
export const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '';
const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

type TurnstileApi = {
  render: (element: HTMLElement, options: Record<string, unknown>) => string;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
};
declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

let loading: Promise<TurnstileApi> | null = null;
function loadTurnstile(): Promise<TurnstileApi> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  loading ??= new Promise<TurnstileApi>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => (window.turnstile ? resolve(window.turnstile) : reject(new Error('Turnstile unavailable')));
    script.onerror = () => {
      loading = null;
      script.remove();
      reject(new Error('Turnstile failed to load'));
    };
    document.head.appendChild(script);
  });
  return loading;
}

export const TURNSTILE_PENDING_MESSAGE = 'Please wait for the security check below the form to finish, then submit again.';

/**
 * `enabled` is false for staff-only endpoints (walk-in registration), which
 * are already behind sign-in. Tokens are single-use: call `reset()` after
 * every submission attempt, successful or not.
 */
export function useTurnstile(enabled = true) {
  const active = enabled && Boolean(TURNSTILE_SITE_KEY);
  const container = useRef<HTMLDivElement | null>(null);
  const widgetId = useRef<string | null>(null);
  const token = useRef<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    loadTurnstile()
      .then((api) => {
        if (cancelled || !container.current) return;
        widgetId.current = api.render(container.current, {
          sitekey: TURNSTILE_SITE_KEY,
          action: 'form',
          theme: 'auto',
          'refresh-expired': 'auto',
          callback: (value: string) => {
            token.current = value;
            setFailed(false);
          },
          'expired-callback': () => {
            token.current = null;
          },
          'error-callback': () => {
            token.current = null;
          },
        });
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
      if (widgetId.current && window.turnstile) window.turnstile.remove(widgetId.current);
      widgetId.current = null;
      token.current = null;
    };
  }, [active]);

  const reset = useCallback(() => {
    token.current = null;
    if (widgetId.current && window.turnstile) window.turnstile.reset(widgetId.current);
  }, []);

  const widget = active ? (
    <div className="turnstile-slot">
      <div ref={container} />
      {failed && (
        <p role="alert" className="text-sm text-crimson-hi">
          The security check could not load. Check your connection or pause content blockers for this site, then reload the page.
        </p>
      )}
    </div>
  ) : null;

  return {
    widget,
    /** The token to send, or null. Always null when the check is off. */
    token: () => (active ? token.current : null),
    /** True when the check is on but not finished yet: do not submit. */
    pending: () => active && !token.current,
    reset,
  };
}
