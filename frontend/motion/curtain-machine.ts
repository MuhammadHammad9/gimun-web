/**
 * State of the page curtain, as a pure reducer so every edge case is unit
 * tested without a browser.
 *
 *   idle -> covering -> covered -> revealing -> idle
 *
 * - `start` is ignored unless idle: a second click mid-transition does nothing.
 * - `arrived` records that the new page rendered; it can land while the
 *   curtain is still closing (a redirect, a very fast route).
 * - `reveal` needs the curtain closed *and* the page arrived.
 * - `abort` (Back/Forward mid-transition) and `failsafe` (a slow or broken
 *   route) open the curtain whatever else is pending.
 */

export type CurtainPhase = 'idle' | 'covering' | 'covered' | 'revealing';

export interface CurtainState {
  phase: CurtainPhase;
  /** Where the transition is going. */
  href: string | null;
  /** Pathname when it started, to recognise the new page. */
  from: string | null;
  /** The destination page has rendered. */
  arrived: boolean;
  /** Open quickly: the transition was interrupted. */
  fast: boolean;
}

export type CurtainEvent =
  | { type: 'start'; href: string; from: string }
  | { type: 'covered' }
  | { type: 'arrived' }
  | { type: 'reveal' }
  | { type: 'abort' }
  | { type: 'failsafe' }
  | { type: 'revealed' }
  | { type: 'reset' };

export const initialCurtain: CurtainState = { phase: 'idle', href: null, from: null, arrived: false, fast: false };

export function curtainReducer(state: CurtainState, event: CurtainEvent): CurtainState {
  switch (event.type) {
    case 'start':
      return state.phase === 'idle' ? { phase: 'covering', href: event.href, from: event.from, arrived: false, fast: false } : state;
    case 'covered':
      return state.phase === 'covering' ? { ...state, phase: 'covered' } : state;
    case 'arrived':
      return state.phase === 'covering' || state.phase === 'covered' ? { ...state, arrived: true } : state;
    case 'reveal':
      return state.phase === 'covered' && state.arrived ? { ...state, phase: 'revealing' } : state;
    case 'abort':
      return state.phase === 'covering' || state.phase === 'covered' ? { ...state, phase: 'revealing', fast: true } : state;
    case 'failsafe':
      return state.phase === 'covered' ? { ...state, phase: 'revealing' } : state;
    case 'revealed':
      return state.phase === 'revealing' ? initialCurtain : state;
    case 'reset':
      return initialCurtain;
  }
}

export function isBusy(state: CurtainState): boolean {
  return state.phase !== 'idle';
}

export function canReveal(state: CurtainState): boolean {
  return state.phase === 'covered' && state.arrived;
}

/** Panels on screen at a viewport width: 3 on phones, 4 on tablets, 5 on desktop. */
export function panelCount(width: number): number {
  if (width < 640) return 3;
  if (width < 1024) return 4;
  return 5;
}
