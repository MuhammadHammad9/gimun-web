'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

type DeviceLimitState = {
  /** null until the first status check resolves. */
  locked: boolean | null;
  remaining: number | null;
  maxAttempts: number | null;
  /** Seconds left on the lock; counts down while locked. */
  secondsLeft: number;
};

type StatusResponse = {
  maxAttempts?: number;
  remaining?: number;
  locked?: boolean;
  retryAfterSeconds?: number;
};

/**
 * Tracks the per-device registration allowance for the UI. On mount it asks
 * /api/register/status (which also mints the device cookie), then shows how
 * many attempts remain and, once locked, a live countdown to when the visitor
 * may try again. The server enforces the limit regardless; this only informs.
 */
export function useDeviceLimit(enabled = true) {
  const [state, setState] = useState<DeviceLimitState>({ locked: null, remaining: null, maxAttempts: null, secondsLeft: 0 });
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCountdown = useCallback((seconds: number) => {
    if (timer.current) clearInterval(timer.current);
    if (seconds <= 0) return;
    timer.current = setInterval(() => {
      setState((prev) => {
        const next = Math.max(0, prev.secondsLeft - 1);
        if (next === 0 && timer.current) {
          clearInterval(timer.current);
          timer.current = null;
          // The lock has elapsed; the allowance is fresh again.
          return { ...prev, secondsLeft: 0, locked: false, remaining: prev.maxAttempts };
        }
        return { ...prev, secondsLeft: next };
      });
    }, 1000);
  }, []);

  const apply = useCallback(
    (data: StatusResponse) => {
      const locked = Boolean(data.locked);
      const secondsLeft = locked ? Math.max(0, Math.floor(data.retryAfterSeconds ?? 0)) : 0;
      setState({
        locked,
        remaining: typeof data.remaining === 'number' ? data.remaining : null,
        maxAttempts: typeof data.maxAttempts === 'number' ? data.maxAttempts : null,
        secondsLeft,
      });
      startCountdown(secondsLeft);
    },
    [startCountdown],
  );

  /** Called when a submission is refused with a device-limit 429. */
  const applyLockout = useCallback(
    (retryAfterSeconds: number, maxAttempts?: number) => {
      const seconds = Math.max(1, Math.floor(retryAfterSeconds));
      setState((prev) => ({
        locked: true,
        remaining: 0,
        maxAttempts: maxAttempts ?? prev.maxAttempts,
        secondsLeft: seconds,
      }));
      startCountdown(seconds);
    },
    [startCountdown],
  );

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    fetch('/api/register/status', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: StatusResponse | null) => {
        if (!cancelled && data) apply(data);
      })
      .catch(() => {
        /* The server still enforces the limit; the UI simply shows no hint. */
      });
    return () => {
      cancelled = true;
      if (timer.current) clearInterval(timer.current);
    };
  }, [enabled, apply]);

  return { ...state, applyLockout };
}

/** "29:08" style label for a remaining-seconds countdown. */
export function formatCountdown(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
