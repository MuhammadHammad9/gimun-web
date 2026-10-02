import { cn } from '@frontend/lib/utils';
import { globe } from './geometry';
import { ScalesShape } from './LineArt';
import { SealMotion } from './SealMotion';

const C = 200;
const RING_R = 164;
const RING_TEXT = 'GIKI MODEL UNITED NATIONS • GIKI MOOT COURT • TOPI • MARCH 2027 • ';

// The ring path starts at the top and runs clockwise, so the lettering begins
// at twelve o'clock and its seam falls on a separator.
const RING_PATH = `M${C} ${C - RING_R}A${RING_R} ${RING_R} 0 0 1 ${C} ${C + RING_R}A${RING_R} ${RING_R} 0 0 1 ${C} ${C - RING_R}`;
const CIRCUMFERENCE = 2 * Math.PI * RING_R;

// The globe half: the same projection as GlobeArt, drawn upright and clipped
// to the left of the centre line.
const GLOBE_R = 104;
const GLOBE_LINES = globe(C, C, GLOBE_R, { elevation: 14, meridians: [-60, -30], parallels: [-45, 45] });

// The scales half: GlobeArt's 240-unit box scaled into the right half.
const SCALES_SCALE = 0.54;
const SCALES_TRANSFORM = `translate(${C + 66 - 120 * SCALES_SCALE} ${C - 126 * SCALES_SCALE}) scale(${SCALES_SCALE})`;

/**
 * The event seal: a slowly turning ring of lettering around a split emblem,
 * the globe for GIMUN on the left and the scales for the moot court on the
 * right. The two rooms, in one mark.
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
          <clipPath id={`${id}-left`}>
            <rect x="0" y="0" width={C} height="400" />
          </clipPath>
        </defs>
        <circle cx={C} cy={C} r="194" className="seal__rule" />
        <circle cx={C} cy={C} r="140" className="seal__rule seal__inner" />
        <circle cx={C} cy={C} r="132" className="seal__rule seal__rule--faint seal__inner" />
        <line x1={C} y1={C - 132} x2={C} y2={C + 132} className="seal__rule seal__divide" />

        {/* GIMUN: the globe, left half */}
        <g data-half="gimun">
          <g className="seal__gimun" clipPath={`url(#${id}-left)`} data-draw="">
            <circle cx={C} cy={C} r={GLOBE_R} pathLength={1} />
            <path d={GLOBE_LINES.meridians + GLOBE_LINES.parallels} className="seal__detail" pathLength={1} />
            <path d={GLOBE_LINES.equator} pathLength={1} />
          </g>
        </g>

        {/* GMC: the scales, right half */}
        <g data-half="gmc">
          <g className="seal__gmc" transform={SCALES_TRANSFORM} data-draw="">
            <ScalesShape />
          </g>
        </g>
      </svg>
      {motion && <SealMotion />}
    </div>
  );
}
