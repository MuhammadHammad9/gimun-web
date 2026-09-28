/**
 * When motion code may load, and when it may touch the page.
 *
 * The rule the whole site follows: nothing animates through JavaScript before
 * the visitor shows intent (scrolls, touches, clicks or presses a key). Until
 * then the page is exactly its server HTML plus CSS, which keeps LCP and TBT
 * honest and makes every automated check deterministic.
 *
 * Abortable gates never settle once their signal aborts, so code after an
 * `await` simply does not run for an unmounted component.
 */

const INTENT_EVENTS = ['wheel', 'touchstart', 'pointerdown', 'keydown'] as const;
const SCROLL_INTENT_PX = 64;

let intentSeen = false;
let intentPromise: Promise<void> | null = null;

export function hasIntent(): boolean {
  return intentSeen;
}

/** Resolves on the first wheel, touch, pointer press, key press or a scroll past 64 px. */
export function firstIntent(): Promise<void> {
  if (typeof window === 'undefined') return new Promise(() => {});
  if (intentPromise) return intentPromise;
  intentPromise = new Promise((resolve) => {
    const done = () => {
      intentSeen = true;
      for (const type of INTENT_EVENTS) window.removeEventListener(type, done, true);
      window.removeEventListener('scroll', onScroll);
      resolve();
    };
    const onScroll = () => {
      if (window.scrollY > SCROLL_INTENT_PX) done();
    };
    // A restored scroll position (Back, reload mid-page) already counts.
    if (window.scrollY > SCROLL_INTENT_PX) return done();
    for (const type of INTENT_EVENTS) window.addEventListener(type, done, { capture: true, passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
  });
  return intentPromise;
}

export function afterLoad(): Promise<void> {
  if (typeof window === 'undefined') return new Promise(() => {});
  if (document.readyState === 'complete') return Promise.resolve();
  return new Promise((resolve) => window.addEventListener('load', () => resolve(), { once: true }));
}

/** Waits `delay` ms, then for an idle period (Safari has no requestIdleCallback). */
export function whenIdle(delay = 0, timeout = 1500): Promise<void> {
  if (typeof window === 'undefined') return new Promise(() => {});
  return new Promise((resolve) => {
    const idle = () => {
      if (typeof window.requestIdleCallback === 'function') window.requestIdleCallback(() => resolve(), { timeout });
      else setTimeout(resolve, 1);
    };
    if (delay > 0) setTimeout(idle, delay);
    else idle();
  });
}

/** Resolves once `element` comes within `rootMargin` of the viewport. */
export function whenNear(element: Element, rootMargin = '50% 0px', signal?: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    if (signal?.aborted) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        if (!signal?.aborted) resolve();
      },
      { rootMargin },
    );
    observer.observe(element);
    signal?.addEventListener('abort', () => observer.disconnect(), { once: true });
  });
}

/** Resolves with `promise` unless `signal` aborts first, in which case it never settles. */
export function unlessAborted<T>(promise: Promise<T>, signal?: AbortSignal): Promise<T> {
  if (!signal) return promise;
  return new Promise((resolve) => {
    if (signal.aborted) return;
    promise.then((value) => {
      if (!signal.aborted) resolve(value);
    });
  });
}

/** Gives the browser a chance to handle input between setup steps. */
export function yieldToMain(): Promise<void> {
  const scheduler = (globalThis as { scheduler?: { yield?: () => Promise<void> } }).scheduler;
  if (typeof scheduler?.yield === 'function') return scheduler.yield();
  return new Promise((resolve) => setTimeout(resolve, 0));
}
