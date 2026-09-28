'use client';

import { useEffect, useState } from 'react';

const RESTING_CODE = '404';
const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%?<>/\\*+';

function randomUnit() {
  const values = new Uint32Array(1);
  crypto.getRandomValues(values);
  return values[0] / 0xffffffff;
}

function randomBetween(min: number, max: number) {
  return Math.round(min + randomUnit() * (max - min));
}

function randomCode() {
  const code = Array.from({ length: RESTING_CODE.length }, () => (
    GLYPHS[randomBetween(0, GLYPHS.length - 1)]
  )).join('');

  return code === RESTING_CODE ? '#?%' : code;
}

export function GlitchCode() {
  const [code, setCode] = useState(RESTING_CODE);
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reducedMotion.matches) return;

    const timers = new Set<ReturnType<typeof setTimeout>>();
    let cancelled = false;

    const schedule = (callback: () => void, delay: number) => {
      const timer = setTimeout(() => {
        timers.delete(timer);
        if (!cancelled) callback();
      }, delay);
      timers.add(timer);
    };

    const scheduleBurst = () => {
      schedule(runBurst, randomBetween(850, 2100));
    };

    const runBurst = () => {
      const frameCount = randomBetween(7, 11);
      let frame = 0;
      setIsGlitching(true);

      const scramble = () => {
        setCode(randomCode());
        frame += 1;

        if (frame < frameCount) {
          schedule(scramble, randomBetween(38, 68));
          return;
        }

        schedule(() => {
          setCode(RESTING_CODE);
          setIsGlitching(false);
          scheduleBurst();
        }, randomBetween(55, 110));
      };

      scramble();
    };

    schedule(runBurst, randomBetween(350, 900));

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <p
      className={`not-found__code${isGlitching ? ' not-found__code--glitching' : ''}`}
      data-text={code}
      aria-hidden="true"
    >
      {code}
    </p>
  );
}
