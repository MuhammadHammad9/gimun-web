import { cn } from '@/lib/utils';

const RING_R = 164;
const RING_TEXT = 'GIKI MODEL UNITED NATIONS · GIKI MOOT COURT · TOPI · MARCH 2027 · ';

/**
 * The event seal: a slowly turning ring of lettering around a split emblem,
 * the globe for GIMUN on the left and the scales for the moot court on the
 * right. The two rooms, in one mark.
 *
 * The turning ring is its own <svg> inside an HTML wrapper so the rotation
 * runs on the compositor (an animated SVG group would repaint every frame).
 * Decorative: hidden from assistive tech. `id` must be unique on the page.
 */
export function Seal({ id, className, spin = true }: { id: string; className?: string; spin?: boolean }) {
  const ringPath = `M200,200 m-${RING_R},0 a${RING_R},${RING_R} 0 1,1 ${RING_R * 2},0 a${RING_R},${RING_R} 0 1,1 -${RING_R * 2},0`;
  const circumference = 2 * Math.PI * RING_R;
  const ticks = Array.from({ length: 72 }, (_, i) => i * 5);

  return (
    <div className={cn('seal', className)} aria-hidden="true">
      <div className={cn('seal__ring', spin && 'seal__ring--spin')}>
        <svg viewBox="0 0 400 400" focusable="false">
          <defs>
            <path id={`${id}-ring`} d={ringPath} />
          </defs>
          <text className="seal__lettering">
            <textPath href={`#${id}-ring`} textLength={circumference - 8} lengthAdjust="spacing">
              {RING_TEXT}
            </textPath>
          </text>
          <g className="seal__ticks">
            {ticks.map((angle) => (
              <line key={angle} x1="200" y1="10" x2="200" y2={angle % 30 === 0 ? 22 : 16} transform={`rotate(${angle} 200 200)`} />
            ))}
          </g>
        </svg>
      </div>

      <svg className="seal__core" viewBox="0 0 400 400" focusable="false">
        <circle cx="200" cy="200" r="194" className="seal__rule" />
        <circle cx="200" cy="200" r="140" className="seal__rule" />
        <circle cx="200" cy="200" r="132" className="seal__rule seal__rule--faint" />
        <line x1="200" y1="68" x2="200" y2="332" className="seal__rule" />

        {/* GIMUN: the globe, left half */}
        <g className="seal__gimun" data-draw="">
          <path d="M200 88a112 112 0 0 0 0 224" pathLength={1} />
          <path d="M200 88c-36 20-54 64-54 112s18 92 54 112" pathLength={1} />
          <path d="M200 88c-72 22-96 70-96 112s24 90 96 112" pathLength={1} />
          <path d="M94 164h106M88 200h112M94 236h106" pathLength={1} />
        </g>

        {/* GMC: the scales, right half */}
        <g className="seal__gmc" data-draw="">
          <path d="M266 120v164M244 284h44M234 146h64" pathLength={1} />
          <path d="M234 146l-16 44h32zM298 146l-16 44h32z" pathLength={1} />
          <path d="M218 190a16 7 0 0 0 32 0M282 190a16 7 0 0 0 32 0" pathLength={1} />
          <circle cx="266" cy="114" r="5" />
        </g>
      </svg>
    </div>
  );
}
