/**
 * GSAP, registered once with the plugins this site ships.
 *
 * Only lazily loaded behaviours import this module, so GSAP never lands in a
 * page's first load (scripts/report-first-load.js fails the build if it does).
 * Plugins registered: ScrollTrigger, SplitText, CustomEase, Flip. The venue
 * page adds MotionPathPlugin through motionPath(). Scramble and SVG drawing
 * use anime.js instead, and GSAP's dev tools never ship.
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
