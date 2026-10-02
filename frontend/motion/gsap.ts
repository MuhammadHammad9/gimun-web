/**
 * GSAP, registered once with the plugins this site ships.
 *
 * Only lazily loaded behaviours import this module, so GSAP never lands in a
 * page's first load (frontend/scripts/report-first-load.js fails the build if it does).
 * Plugins registered: ScrollTrigger, SplitText, CustomEase, Flip. Heavier
 * plugins load per feature through the async helpers below (all free since
 * GSAP 3.13), so a page only pays for what it uses. GSAP's dev tools never
 * ship.
 */
import { gsap } from 'gsap';
import { CustomEase } from 'gsap/CustomEase';
import { Flip } from 'gsap/Flip';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { setScrollTrigger } from './bridge';
import { customEasePath, EASE, type EaseName } from './tokens';

let registered = false;

function register() {
  if (registered) return;
  registered = true;
  gsap.registerPlugin(CustomEase, ScrollTrigger, SplitText, Flip);
  for (const name of Object.keys(EASE) as EaseName[]) CustomEase.create(name, customEasePath(name));
  gsap.defaults({ ease: 'brand', duration: 0.8 });
  // Mobile address bars resize the viewport constantly; re-measuring on each
  // one makes pinned sections jump.
  ScrollTrigger.config({ ignoreMobileResize: true });
  setScrollTrigger(ScrollTrigger);
  // Web fonts change line lengths; measure again once they are in.
  document.fonts?.ready.then(() => ScrollTrigger.refresh()).catch(() => undefined);
}

register();

export { gsap, ScrollTrigger, SplitText, Flip };

/** Loaded on the venue page only. */
export async function motionPath() {
  const { MotionPathPlugin } = await import('gsap/MotionPathPlugin');
  gsap.registerPlugin(MotionPathPlugin);
  return MotionPathPlugin;
}

/** Stroke drawing (hero seal, validation ticks). */
export async function drawSVG() {
  const { DrawSVGPlugin } = await import('gsap/DrawSVGPlugin');
  gsap.registerPlugin(DrawSVGPlugin);
  return DrawSVGPlugin;
}

/** Shape morphing between two paths. */
export async function morphSVG() {
  const { MorphSVGPlugin } = await import('gsap/MorphSVGPlugin');
  gsap.registerPlugin(MorphSVGPlugin);
  return MorphSVGPlugin;
}

/** Dragging with momentum (the chambers corridor, the globe). */
export async function draggable() {
  const [{ Draggable }, { InertiaPlugin }] = await Promise.all([import('gsap/Draggable'), import('gsap/InertiaPlugin')]);
  gsap.registerPlugin(Draggable, InertiaPlugin);
  return Draggable;
}

/** Text that resolves character by character (reference numbers). */
export async function scrambleText() {
  const { ScrambleTextPlugin } = await import('gsap/ScrambleTextPlugin');
  gsap.registerPlugin(ScrambleTextPlugin);
  return ScrambleTextPlugin;
}

/** Unified wheel, touch and pointer velocity (scroll-velocity effects). */
export async function observer() {
  const { Observer } = await import('gsap/Observer');
  gsap.registerPlugin(Observer);
  return Observer;
}
