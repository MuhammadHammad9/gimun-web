'use client';

import { useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { useEnhance } from './useEnhance';

const MAX_BOOST = 4;

/**
 * A band of names drifting sideways, for the delegations in session.
 *
 * The drift is a CSS animation (transform only, on the compositor); after
 * the first intent it speeds up with the scroll and eases back. It has a
 * pause button (moving content that lasts more than five seconds must be
 * stoppable) and does not move at all under reduced motion. The list is read
 * once by assistive technology; the repeat that makes the loop seamless is
 * hidden from it.
 */
export function Marquee({ items, label }: { items: string[]; label: string }) {
  const root = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);

  useEnhance(
    root,
    async (element, signal) => {
      const track = element.querySelector<HTMLElement>('.marquee__track');
      const animation = track?.getAnimations()[0];
      if (!track || !animation) return;
      const { gsap, ScrollTrigger } = await import('@frontend/motion/gsap');
      if (signal.aborted) return;
      const speed = { rate: 1 };
      const apply = () => animation.updatePlaybackRate(speed.rate);
      const trigger = ScrollTrigger.create({
        trigger: element,
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: (self) => {
          const boost = Math.min(MAX_BOOST, 1 + Math.abs(self.getVelocity()) / 600);
          gsap.to(speed, { rate: boost, duration: 0.2, overwrite: true, onUpdate: apply });
          gsap.to(speed, { rate: 1, duration: 1.2, delay: 0.2, ease: 'brand', onUpdate: apply });
        },
      });
      return () => {
        trigger.kill();
        gsap.killTweensOf(speed);
        animation.updatePlaybackRate(1);
      };
    },
    { tiers: ['lite', 'full'] },
  );

  if (items.length === 0) return null;

  return (
    <div
      ref={root}
      className="marquee"
      data-paused={paused ? '' : undefined}
      style={{ '--marquee-duration': `${Math.max(20, items.length * 2.5)}s` } as React.CSSProperties}
    >
      <div className="marquee__viewport">
        <div className="marquee__track">
          <ul className="marquee__list" aria-label={label}>
            {items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <ul className="marquee__list" aria-hidden="true">
            {items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
      <button type="button" className="marquee__toggle" onClick={() => setPaused((value) => !value)} aria-pressed={paused}>
        {paused ? <Play aria-hidden="true" strokeWidth={1.75} className="size-3.5" /> : <Pause aria-hidden="true" strokeWidth={1.75} className="size-3.5" />}
        <span className="sr-only">{paused ? 'Play the moving list' : 'Pause the moving list'}</span>
      </button>
    </div>
  );
}
