/**
 * Where the page chrome and the motion libraries meet.
 *
 * The chrome (curtain, menus, forms) never imports Lenis or GSAP. Those load
 * later and register here; every programmatic scroll goes through
 * `scrollTo`, so it behaves the same with or without smooth scrolling.
 * This module must not import a motion library itself.
 */
import { prefersReducedMotion } from './policy';

export interface LenisLike {
  scrollTo(
    target: number | HTMLElement,
    options?: { offset?: number; immediate?: boolean; force?: boolean; lock?: boolean },
  ): void;
  stop(): void;
  start(): void;
  resize(): void;
}

export interface ScrollTriggerLike {
  refresh(safe?: boolean): void;
  clearScrollMemory(scrollRestoration?: string): void;
  getAll(): { trigger?: Element | null; kill(): void }[];
}

let lenis: LenisLike | null = null;
let scrollTrigger: ScrollTriggerLike | null = null;
const scrollLocks = new Set<string>();

export function setLenis(instance: LenisLike | null): void {
  lenis = instance;
  if (instance && scrollLocks.size) instance.stop();
}

export function getLenis(): LenisLike | null {
  return lenis;
}

export function setScrollTrigger(instance: ScrollTriggerLike | null): void {
  scrollTrigger = instance;
}

/**
 * Pauses smooth scrolling while a menu, dialog or the curtain is open.
 * Keyed by owner, so overlapping owners cannot release each other's lock.
 */
export function lockScroll(owner: string): void {
  scrollLocks.add(owner);
  lenis?.stop();
}

export function unlockScroll(owner: string): void {
  scrollLocks.delete(owner);
  if (!scrollLocks.size) lenis?.start();
}

export function isScrollLocked(): boolean {
  return scrollLocks.size > 0;
}

/** Height of the sticky chrome in px, from the --chrome-h custom property. */
export function chromeHeight(): number {
  if (typeof window === 'undefined') return 0;
  const root = document.documentElement;
  const value = getComputedStyle(root).getPropertyValue('--chrome-h').trim();
  const rem = parseFloat(getComputedStyle(root).fontSize) || 16;
  if (value.endsWith('rem')) return parseFloat(value) * rem;
  return parseFloat(value) || 0;
}

interface ScrollOptions {
  /** Pixels added to the target position. */
  offset?: number;
  /** Jump instead of gliding. Always true under reduced motion. */
  immediate?: boolean;
}

export function scrollTo(target: number | HTMLElement, { offset = 0, immediate = false }: ScrollOptions = {}): void {
  const instant = immediate || prefersReducedMotion();
  if (lenis) {
    lenis.scrollTo(target, { offset, immediate: instant, force: true });
    return;
  }
  const top = typeof target === 'number' ? target : target.getBoundingClientRect().top + window.scrollY;
  window.scrollTo({ top: Math.max(0, top + offset), behavior: instant ? 'instant' : 'smooth' });
}

/** Scrolls an element into view below the sticky chrome. */
export function scrollToElement(element: HTMLElement, options: Omit<ScrollOptions, 'offset'> = {}): void {
  scrollTo(element, { ...options, offset: -(chromeHeight() + 24) });
}

let refreshTimer: ReturnType<typeof setTimeout> | undefined;

/** Re-measures scroll-linked animations after content changed height. Debounced. */
export function requestRefresh(): void {
  clearTimeout(refreshTimer);
  refreshTimer = setTimeout(() => {
    lenis?.resize();
    scrollTrigger?.refresh();
  }, 120);
}

/** After a page swap: forget the old page's scroll state and measure the new one. */
export function afterSwap(): void {
  if (scrollTrigger) {
    scrollTrigger.clearScrollMemory();
    for (const trigger of scrollTrigger.getAll()) {
      if (trigger.trigger && !trigger.trigger.isConnected) trigger.kill();
    }
  }
  requestRefresh();
}

export type TransitionPhase = 'idle' | 'covering' | 'covered' | 'revealing';

const transitionListeners = new Set<(phase: TransitionPhase) => void>();
let currentPhase: TransitionPhase = 'idle';

export function transitionPhase(): TransitionPhase {
  return currentPhase;
}

/** Lets enhancers pause work (marquees, scroll triggers) while the curtain is closed. */
export function onTransition(listener: (phase: TransitionPhase) => void): () => void {
  transitionListeners.add(listener);
  return () => transitionListeners.delete(listener);
}

export function emitTransition(phase: TransitionPhase): void {
  currentPhase = phase;
  for (const listener of transitionListeners) listener(phase);
}
