import { cn } from '@/lib/utils';
import { SealMotion } from './SealMotion';

const C = 200;
const RING_R = 164;
const RING_TEXT = 'GIKI MODEL UNITED NATIONS • GIKI MOOT CUP • TOPI • DECEMBER 2026 • ';

// The ring path starts at the top and runs clockwise, so the lettering begins
// at twelve o'clock and its seam falls on a separator.
const RING_PATH = `M${C} ${C - RING_R}A${RING_R} ${RING_R} 0 0 1 ${C} ${C + RING_R}A${RING_R} ${RING_R} 0 0 1 ${C} ${C - RING_R}`;
const CIRCUMFERENCE = 2 * Math.PI * RING_R;

// The official logos, side by side inside the inner rule (r 132), with the
// centre line in the gap between them. Sizes keep each PNG's proportions.
const LOGO_H = 92;
const LOGOS = {
  gimun: { href: '/images/brand/gimun-logo.png', x: 87.5, width: LOGO_H * (813 / 696) },
  gmc: { href: '/images/brand/gmc-logo.png', x: 205, width: LOGO_H * (924 / 761) },
} as const;
const LOGO_Y = C - LOGO_H / 2;

/**
 * The event seal: a slowly turning ring of lettering around the two official
 * logos, GIMUN on the left and GMC on the right. Each logo is an alpha mask
 * filled with --color-logo, so it follows the ground it sits on.
 *
 * The turning ring is its own <svg> inside an HTML wrapper so the rotation
 * runs on the compositor (an animated SVG group would repaint every frame).
 * Decorative: hidden from assistive tech. `id` must be unique on the page.
 * `motion` adds the hero signature (see SealMotion); use it once per page.
 */
export function Seal({ id, className, spin = true, motion = false }: { id: string; className?: string; spin?: boolean; motion?: boolean }) {
  const ticks = Array.from({ length: 72 }, (_, i) => i * 5);

  return (
    <div className={cn('seal', className)} aria-hidden="true">
      {/* A solid face in the ground's colour: the seal sits above any moving
          background (clouds, scanner) instead of letting it show through. */}
      <span className="seal__face" />
      <div className={cn('seal__ring', spin && 'seal__ring--spin')}>
        <svg viewBox="0 0 400 400" focusable="false">
          <defs>
            <path id={`${id}-ring`} d={RING_PATH} />
          </defs>
          <text className="seal__lettering">
            <textPath href={`#${id}-ring`} textLength={CIRCUMFERENCE - 10} lengthAdjust="spacing">
              {RING_TEXT}
            </textPath>
          </text>
          <g className="seal__ticks">
            {ticks.map((angle) => (
              <line key={angle} x1={C} y1="10" x2={C} y2={angle % 30 === 0 ? 22 : 16} transform={`rotate(${angle} ${C} ${C})`} />
            ))}
          </g>
        </svg>
      </div>

      <svg className="seal__core" viewBox="0 0 400 400" focusable="false">
        <defs>
          {(Object.keys(LOGOS) as (keyof typeof LOGOS)[]).map((key) => (
            <mask key={key} id={`${id}-${key}-logo`} maskUnits="userSpaceOnUse" style={{ maskType: 'alpha' }}>
              <image href={LOGOS[key].href} x={LOGOS[key].x} y={LOGO_Y} width={LOGOS[key].width} height={LOGO_H} />
            </mask>
          ))}
        </defs>
        <circle cx={C} cy={C} r="194" className="seal__rule" />
        <circle cx={C} cy={C} r="140" className="seal__rule seal__inner" />
        <circle cx={C} cy={C} r="132" className="seal__rule seal__rule--faint seal__inner" />
        <line x1={C} y1={C - 132} x2={C} y2={C + 132} className="seal__rule seal__divide" />

        {(Object.keys(LOGOS) as (keyof typeof LOGOS)[]).map((key) => (
          <g key={key} data-half={key}>
            <rect
              x={LOGOS[key].x}
              y={LOGO_Y}
              width={LOGOS[key].width}
              height={LOGO_H}
              className="seal__logo"
              mask={`url(#${id}-${key}-logo)`}
            />
          </g>
        ))}
      </svg>
      {motion && <SealMotion />}
    </div>
  );
}
