'use client';

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react';
import { useEnhance } from '@/components/motion/useEnhance';
import { firstIntent } from '@/lib/motion/gates';
import { formatEventDate } from '@/lib/site-config';
import { DateLedger, type LedgerDate } from './DateLedger';

export interface ClockDate extends LedgerDate {
  /** A deadline counts down to 23:59 Pakistan time on its day; events do not. */
  deadline?: boolean;
}

const DAY = 86_400_000;
/** The end of a deadline's day in Pakistan time (UTC+5, no daylight saving). */
const deadlineAt = (iso: string) => new Date(`${iso}T23:59:59+05:00`).getTime();
const startOf = (iso: string) => new Date(`${iso}T00:00:00+05:00`).getTime();

/**
 * The clock chapter: the whole cycle on one rail, today placed on it, and a
 * countdown to the next deadline whose digits roll as the minutes pass.
 *
 * The rail is spaced by step, not by calendar: the dates cluster in the last
 * weeks, so a linear scale would pile them on top of each other. A long lead
 * segment stands for the wait before the first deadline and is labelled with
 * its length; today sits in proportion inside whichever segment it falls.
 * The stretch from today to the next deadline is highlighted, the distance
 * the countdown measures, and draws itself in when the chapter arrives.
 *
 * The rail and the rolling digits are visual; the dated list below them is
 * the accessible record, and the countdown carries a plain-text equivalent.
 * Before the first intent (and under reduced motion) nothing moves: the
 * digits are already correct and the rail already drawn.
 */
export function DeadlineClock({ dates, now: renderedAt }: { dates: ClockDate[]; now: number }) {
  // The page HTML is cached, so the server's "now" can be an hour old; the
  // browser takes over after mounting and every minute after that.
  const [now, setNow] = useState(renderedAt);
  const [active, setActive] = useState<number | null>(null);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    let interval: ReturnType<typeof setInterval> | undefined;
    // Tick on the minute, so the minutes digit turns when the clock does.
    const align = setTimeout(() => {
      tick();
      interval = setInterval(tick, 60_000);
    }, 60_000 - (Date.now() % 60_000));
    return () => {
      clearTimeout(align);
      if (interval) clearInterval(interval);
    };
  }, []);

  // Digits change without rolling until the visitor has shown intent.
  useEffect(() => {
    let live = true;
    void firstIntent().then(() => {
      if (live) root.current?.setAttribute('data-rolling', '');
    });
    return () => {
      live = false;
    };
  }, []);

  // Arm the rail just before it scrolls in, then draw it once it shows.
  useEnhance(
    root,
    (element, signal) => {
      const rail = element.querySelector<HTMLElement>('.rail');
      if (!rail || isVisible(rail)) return;
      rail.dataset.state = 'armed';
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          observer.disconnect();
          rail.dataset.state = 'drawn';
        },
        { threshold: 0.6 },
      );
      observer.observe(rail);
      signal.addEventListener('abort', () => observer.disconnect(), { once: true });
      return () => {
        observer.disconnect();
        delete rail.dataset.state;
      };
    },
    { near: '40% 0px' },
  );

  const points = dates.filter((d): d is ClockDate & { iso: string } => Boolean(d.iso)).sort((a, b) => a.iso.localeCompare(b.iso));
  if (points.length === 0) return <DateLedger dates={dates} now={now} />;

  // Layout units: a lead segment twice the width of a step while today is
  // before the first date, then one unit between consecutive dates.
  const lead = now < startOf(points[0].iso);
  const units = (lead ? 2 : 0) + Math.max(1, points.length - 1);
  const tickAt = (index: number) => ((lead ? 2 : 0) + index) / units;
  const todayAt = (() => {
    if (lead) return 0;
    const next = points.findIndex((p) => startOf(p.iso) > now);
    if (next === -1) return 1;
    const from = startOf(points[next - 1].iso);
    const to = startOf(points[next].iso);
    return tickAt(next - 1) + ((now - from) / (to - from)) * (tickAt(next) - tickAt(next - 1));
  })();

  const nextIndex = points.findIndex((p) => startOf(p.iso) + DAY > now);
  const nextDeadline = points.find((p) => p.deadline && deadlineAt(p.iso) > now);
  const leadDays = lead ? Math.ceil((startOf(points[0].iso) - now) / DAY) : 0;
  const stretchEnd = nextIndex === -1 ? todayAt : tickAt(nextIndex);

  const onRowHover = (event: PointerEvent<HTMLDivElement>) => {
    const row = (event.target as Element).closest('.date-row');
    const time = row?.querySelector('time')?.getAttribute('datetime');
    setActive(time ? points.findIndex((p) => p.iso === time) : null);
  };

  return (
    <div ref={root} className="clock">
      <div className="clock__top">
        {nextDeadline ? <Countdown deadline={nextDeadline} now={now} /> : <p className="clock__done">Every deadline has passed. See you in Topi.</p>}
      </div>

      <div
        className="rail"
        aria-hidden="true"
        style={{ '--today': todayAt, '--stretch-end': stretchEnd } as CSSProperties}
      >
        <span className="rail__track" />
        <span className="rail__stretch" />
        {lead && (
          <span className="rail__lead" style={{ '--at': tickAt(0) / 2 } as CSSProperties}>
            {leadDays} {leadDays === 1 ? 'day' : 'days'}
          </span>
        )}
        {points.map((point, index) => {
          const state = startOf(point.iso) + DAY <= now ? 'past' : index === nextIndex ? 'next' : 'later';
          return (
            <span
              key={`${point.iso}-${point.what}`}
              className="rail__tick"
              data-state={state}
              data-kind={point.deadline ? 'deadline' : 'event'}
              data-active={active === index ? '' : undefined}
              data-side={index % 2 ? 'below' : 'above'}
              style={{ '--at': tickAt(index), '--i': index } as CSSProperties}
            >
              <span className="rail__date">{formatEventDate(point.iso, { month: 'short', year: undefined })}</span>
            </span>
          );
        })}
        <span className="rail__today">
          <span className="rail__today-label">Today</span>
        </span>
      </div>

      <div onPointerOver={onRowHover} onPointerLeave={() => setActive(null)}>
        <DateLedger dates={dates} now={now} />
      </div>
    </div>
  );
}

function isVisible(element: Element) {
  const box = element.getBoundingClientRect();
  return box.top < window.innerHeight && box.bottom > 0;
}

/** Days, hours and minutes to a deadline, each digit rolling in its own slot. */
function Countdown({ deadline, now }: { deadline: ClockDate & { iso: string }; now: number }) {
  const left = Math.max(0, deadlineAt(deadline.iso) - now);
  const days = Math.floor(left / DAY);
  const hours = Math.floor((left % DAY) / 3_600_000);
  const minutes = Math.floor((left % 3_600_000) / 60_000);
  const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;
  const spoken = `${plural(days, 'day')}, ${plural(hours, 'hour')} and ${plural(minutes, 'minute')} until ${deadline.what}, ${formatEventDate(deadline.iso)} at 23:59 Pakistan time.`;

  return (
    <div className="countdown" role="timer" aria-live="off">
      <p className="countdown__what">
        <span className="countdown__next">Next</span>
        {deadline.what}
        <time dateTime={`${deadline.iso}T23:59:59+05:00`}>{formatEventDate(deadline.iso, { month: 'short' })}</time>
      </p>
      <p className="countdown__digits" aria-hidden="true">
        <Unit value={days} width={Math.max(2, String(days).length)} label="days" />
        <Unit value={hours} width={2} label="hrs" />
        <Unit value={minutes} width={2} label="min" />
      </p>
      <p className="sr-only">{spoken}</p>
    </div>
  );
}

function Unit({ value, width, label }: { value: number; width: number; label: string }) {
  const digits = String(value).padStart(width, '0').split('');
  return (
    <span className="countdown__unit">
      <span className="odo">
        {digits.map((digit, index) => (
          <span key={`${digits.length}-${index}`} className="odo__slot">
            <span className="odo__strip" style={{ '--d': Number(digit) } as CSSProperties}>
              {'0123456789'.split('').map((n) => (
                <span key={n}>{n}</span>
              ))}
            </span>
          </span>
        ))}
      </span>
      <span className="countdown__label">{label}</span>
    </span>
  );
}
