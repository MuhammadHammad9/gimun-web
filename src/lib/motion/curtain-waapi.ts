/**
 * Runs the page curtain on the server-rendered overlay with the Web
 * Animations API: no library, composited transforms only.
 *
 * Panels rise from below to close (left to right, 60 ms apart), then keep
 * rising to open, so the whole transition reads as one upward sweep. The
 * label lines slide up out of their masks while the panels close.
 */
import { panelCount, type CurtainPhase } from './curtain-machine';
import type { RouteLabel } from './routes';
import { CURTAIN, cssEase } from './tokens';

export interface CurtainDom {
  root: HTMLElement;
  panels: HTMLElement[];
  lines: HTMLElement[];
  section: HTMLElement | null;
  title: HTMLElement | null;
}

export function findCurtain(): CurtainDom | null {
  if (typeof document === 'undefined') return null;
  const root = document.querySelector<HTMLElement>('[data-curtain]');
  if (!root || typeof root.animate !== 'function') return null;
  return {
    root,
    panels: [...root.querySelectorAll<HTMLElement>('[data-curtain-panel]')],
    lines: [...root.querySelectorAll<HTMLElement>('[data-curtain-line]')],
    section: root.querySelector<HTMLElement>('[data-curtain-section]'),
    title: root.querySelector<HTMLElement>('[data-curtain-title]'),
  };
}

export function setPhase(dom: CurtainDom, phase: CurtainPhase): void {
  dom.root.dataset.curtain = phase;
}

export function setLabel(dom: CurtainDom, label: RouteLabel): void {
  if (dom.section) dom.section.textContent = label.section;
  if (dom.title) dom.title.textContent = label.title;
  if (label.accent) dom.root.dataset.accent = label.accent;
  else delete dom.root.dataset.accent;
}

function activePanels(dom: CurtainDom): HTMLElement[] {
  return dom.panels.slice(0, panelCount(window.innerWidth));
}

function finished(animations: Animation[]): Promise<void> {
  return Promise.all(animations.map((animation) => animation.finished.catch(() => undefined))).then(() => undefined);
}

/** Closes the curtain. Resolves when every panel covers the page. */
export function cover(dom: CurtainDom): Promise<void> {
  settle(dom);
  const panels = activePanels(dom);
  const easing = cssEase('curtain');
  const closing = panels.map((panel, index) =>
    panel.animate([{ transform: 'translateY(100%)' }, { transform: 'translateY(0)' }], {
      duration: CURTAIN.cover,
      delay: index * CURTAIN.stagger,
      easing,
      fill: 'forwards',
    }),
  );
  const total = CURTAIN.cover + (panels.length - 1) * CURTAIN.stagger;
  dom.lines.forEach((line, index) =>
    line.animate([{ transform: 'translateY(110%)' }, { transform: 'translateY(0)' }], {
      duration: CURTAIN.labelIn,
      delay: total * CURTAIN.labelAt + index * 40,
      easing: cssEase('lift'),
      fill: 'forwards',
    }),
  );
  return finished(closing);
}

/** Lifts the label away before the panels open. */
export function hideLabel(dom: CurtainDom): Promise<void> {
  return finished(
    dom.lines.map((line) =>
      line.animate([{ transform: 'translateY(-110%)' }], {
        duration: CURTAIN.labelOut,
        easing: cssEase('brand'),
        fill: 'forwards',
      }),
    ),
  );
}

/**
 * Opens the curtain from wherever the panels are. `fast` is the interrupted
 * case: all panels together, in 250 ms.
 */
export function reveal(dom: CurtainDom, fast = false): Promise<void> {
  const panels = activePanels(dom);
  // Freeze any closing animation so the opening starts from its current frame.
  for (const panel of panels) for (const animation of panel.getAnimations()) animation.pause();
  const opening = panels.map((panel, index) =>
    panel.animate([{ transform: 'translateY(-100%)' }], {
      duration: fast ? CURTAIN.abortReveal : CURTAIN.reveal,
      delay: fast ? 0 : index * CURTAIN.stagger,
      easing: cssEase('curtain'),
      fill: 'forwards',
    }),
  );
  return finished(opening);
}

/** Drops every curtain animation, returning the overlay to its hidden rest state. */
export function settle(dom: CurtainDom): void {
  for (const element of [...dom.panels, ...dom.lines]) {
    for (const animation of element.getAnimations()) animation.cancel();
  }
}
