'use client';

/**
 * React Bits ProfileCard (reactbits.dev), adapted to the brand:
 * - colours come from the theme tokens, so it follows both themes and tones;
 * - the holographic foil is recoloured from a rainbow to champagne, gold and
 *   rose, and shows only through the shield pattern;
 * - the contact button is a phone link and uses the site's icon set (lucide);
 * - no intro animation (no JS motion before the visitor's first intent), the
 *   tilt answers only the visitor's own pointer, and reduced motion keeps it still;
 * - without a photo, the person's initials sit on the maroon ground.
 */
import { memo, useEffect, useRef, type CSSProperties } from 'react';
import { Phone } from 'lucide-react';
import { telHref } from '@/components/registration/ContactDirectory';
import './ProfileCard.css';

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export interface ProfileCardProps {
  name: string;
  title: string;
  avatarUrl?: string;
  /** Position of the source image inside the portrait tile, e.g. "68% 22%". */
  photoPosition?: string;
  /** Per-portrait scale for cutouts with different subject widths. */
  photoScale?: number;
  /** Zoom anchor: top for full-height cutouts, bottom for lower-framed portraits. */
  photoOrigin?: string;
  /** Tileable pattern the foil shows through. */
  iconUrl?: string;
  /** Small line in the footer, e.g. the group. */
  handle?: string;
  /** Second footer line, e.g. the edition. */
  status?: string;
  /** Track colour: crimson for GIMUN, champagne for GMC, both for shared. */
  accent?: 'gimun' | 'gmc' | 'shared';
  phone?: string;
  contactText?: string;
  radius?: number;
  holo?: number;
  glare?: number;
  enableTilt?: boolean;
  tiltStrength?: number;
  parallax?: number;
  className?: string;
}

function initials(name: string) {
  return name
    .replace(/^(syed|m\.|muhammad)\s+/i, '')
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function ProfileCard({
  name,
  title,
  avatarUrl = '',
  photoPosition = '50% 20%',
  photoScale = 1,
  photoOrigin = '50% 0%',
  iconUrl,
  handle,
  status,
  accent = 'shared',
  phone,
  contactText = 'Call',
  radius = 16,
  holo = 0.45,
  glare = 0.4,
  enableTilt = true,
  tiltStrength = 10,
  parallax = 6,
  className = '',
}: ProfileCardProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef({ enableTilt, tiltStrength, parallax });
  useEffect(() => {
    settingsRef.current = { enableTilt, tiltStrength, parallax };
  }, [enableTilt, tiltStrength, parallax]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const size = { width: root.offsetWidth, height: root.offsetHeight };
    const x = { p: 0, v: 0, target: 0 };
    const y = { p: 0, v: 0, target: 0 };
    const light = { p: 0, target: 0 };
    let raf = 0;
    let last = 0;
    let touchId: number | null = null;

    const write = () => {
      const { enableTilt: tiltOn, tiltStrength: strength, parallax: depth } = settingsRef.current;
      const angle = tiltOn && !reduced ? strength : 0;
      const tilt = Math.min(1, Math.hypot(x.p, y.p));
      const style = root.style;
      style.setProperty('--pc-light-x', `${((x.p + 1) * 0.5 * size.width).toFixed(1)}px`);
      style.setProperty('--pc-light-y', `${((y.p + 1) * 0.5 * size.height).toFixed(1)}px`);
      style.setProperty('--pc-pointer-x', `${((x.p + 1) * 50).toFixed(2)}%`);
      style.setProperty('--pc-pointer-y', `${((y.p + 1) * 50).toFixed(2)}%`);
      style.setProperty('--pc-band-x', `${(50 + x.p * 15).toFixed(2)}%`);
      style.setProperty('--pc-band-y', `${(50 + y.p * 15).toFixed(2)}%`);
      style.setProperty('--pc-rotate-x', `${(y.p * angle).toFixed(3)}deg`);
      style.setProperty('--pc-rotate-y', `${(-x.p * angle).toFixed(3)}deg`);
      style.setProperty('--pc-shift-x', `${(x.p * (reduced ? 0 : depth)).toFixed(2)}px`);
      style.setProperty('--pc-shift-y', `${(y.p * (reduced ? 0 : depth)).toFixed(2)}px`);
      style.setProperty('--pc-tilt', (tilt * light.p).toFixed(4));
      style.setProperty('--pc-active', light.p.toFixed(4));
    };

    // A spring toward the pointer; runs only while something is still moving.
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000 || 0);
      last = now;
      const steps = Math.max(1, Math.ceil(dt / (1 / 120)));
      const h = dt / steps;
      for (let i = 0; i < steps; i++) {
        for (const axis of [x, y]) {
          axis.v += (120 * (axis.target - axis.p) - 16 * axis.v) * h;
          axis.p += axis.v * h;
        }
      }
      const tau = light.target > light.p ? 0.18 : 0.45;
      light.p += (light.target - light.p) * (1 - Math.exp(-dt / tau));
      write();
      const moving =
        Math.abs(x.target - x.p) > 0.0005 || Math.abs(y.target - y.p) > 0.0005 ||
        Math.abs(x.v) > 0.0005 || Math.abs(y.v) > 0.0005 || Math.abs(light.target - light.p) > 0.002;
      if (moving) raf = requestAnimationFrame(frame);
      else {
        x.p = x.target;
        y.p = y.target;
        light.p = light.target;
        write();
        raf = 0;
      }
    };
    const wake = () => {
      if (raf) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };
    const aim = (nx: number, ny: number, on = true) => {
      x.target = clamp(nx, -1, 1);
      y.target = clamp(ny, -1, 1);
      light.target = on ? 1 : 0;
      wake();
    };
    const aimAt = (event: PointerEvent) => {
      const rect = root.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      aim(((event.clientX - rect.left) / rect.width) * 2 - 1, ((event.clientY - rect.top) / rect.height) * 2 - 1);
    };
    const release = () => aim(0, 0, false);
    const onEnter = (e: PointerEvent) => { if (e.pointerType === 'mouse') aimAt(e); };
    const onMove = (e: PointerEvent) => { if (e.pointerType === 'mouse' || e.pointerId === touchId) aimAt(e); };
    const onLeave = (e: PointerEvent) => { if (e.pointerType === 'mouse') release(); };
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') return;
      touchId = e.pointerId;
      aimAt(e);
    };
    const onUp = (e: PointerEvent) => {
      if (e.pointerId !== touchId) return;
      touchId = null;
      release();
    };

    root.addEventListener('pointerenter', onEnter);
    root.addEventListener('pointermove', onMove);
    root.addEventListener('pointerleave', onLeave);
    root.addEventListener('pointerdown', onDown);
    root.addEventListener('pointerup', onUp);
    root.addEventListener('pointercancel', onUp);
    const observer = new ResizeObserver(() => {
      size.width = root.offsetWidth;
      size.height = root.offsetHeight;
      write();
    });
    observer.observe(root);
    write();

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      root.removeEventListener('pointerenter', onEnter);
      root.removeEventListener('pointermove', onMove);
      root.removeEventListener('pointerleave', onLeave);
      root.removeEventListener('pointerdown', onDown);
      root.removeEventListener('pointerup', onUp);
      root.removeEventListener('pointercancel', onUp);
    };
  }, []);

  const style = {
    '--pc-radius': `${Math.max(0, radius)}px`,
    '--pc-holo': clamp(holo, 0, 1),
    '--pc-glare': clamp(glare, 0, 1),
    '--pc-parallax': `${Math.max(0, parallax)}px`,
    '--pc-pattern': iconUrl ? `url("${iconUrl}")` : 'linear-gradient(#000, #000)',
    '--pc-pattern-size': iconUrl ? '96px 96px' : '100% 100%',
    '--pc-photo-position': photoPosition,
    '--pc-photo-scale': Math.max(0.8, photoScale),
    '--pc-photo-origin': photoOrigin,
  } as CSSProperties;

  return (
    <div ref={rootRef} className={`profile-card profile-card--${accent} ${className}`.trim()} style={style}>
      <div className="profile-card__body">
        <div className="profile-card__tile">
          <span className="profile-card__sheen" />
          <span className="profile-card__holo" />
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- the portrait moves with the tilt (parallax), which next/image's fill layout would fight
            <img className="profile-card__photo" src={avatarUrl} alt={`Portrait of ${name}`} loading="lazy" draggable={false} />
          ) : (
            <span className="profile-card__monogram" aria-hidden="true">{initials(name)}</span>
          )}
          <span className="profile-card__scrim" />
          <div className="profile-card__info">
            <h3 className="profile-card__name">{name}</h3>
            <p className="profile-card__title">{title}</p>
          </div>
          <span className="profile-card__tile-rim" />
        </div>

        <div className="profile-card__footer">
          <div className="profile-card__meta">
            {handle && <span className="profile-card__handle">{handle}</span>}
            {status && <span className="profile-card__status">{status}</span>}
          </div>
          {phone && (
            <a className="profile-card__contact" href={telHref(phone)} aria-label={`${contactText} ${name}, ${phone}`}>
              <Phone aria-hidden="true" size={15} strokeWidth={1.75} />
              {contactText}
            </a>
          )}
        </div>

        <span className="profile-card__glare" />
        <span className="profile-card__shade" />
        <span className="profile-card__rim" />
      </div>
    </div>
  );
}

export default memo(ProfileCard);
