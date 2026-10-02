import type React from 'react';
import { globe, orbit, smoothPath } from './geometry';

/**
 * Line art for chapters, cards and menus. One drawing standard throughout:
 *
 *  - a 240-unit square with a 16-unit safe margin (BracketArt is 240 x 480);
 *  - two weights, 1.5 for the form and 1 at reduced opacity for detail;
 *  - round caps and joins;
 *  - closed shapes filled with the ground (--art-fill, else the canvas) so
 *    whatever sits behind them is hidden, as it would be on paper.
 *
 * Stroke-only in currentColor and decorative (aria-hidden). Paths carry
 * pathLength="1" so .draw-on-scroll can draw them in; at rest they are whole.
 */

/**
 * `live` adds the moving parts of a drawing's idle loop (a traveller on the
 * road, the scales' swing, the gavel's tap...). They only move inside a
 * LiveArt wrapper once it sets data-live; at rest they read as the drawing.
 */
type ArtProps = { className?: string; live?: boolean };

const common = {
  viewBox: '0 0 240 240',
  fill: 'none',
  'aria-hidden': true,
  focusable: false,
} as const;

const stroke = {
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

const detail = { strokeWidth: 1, strokeOpacity: 0.55 };
const ground = { fill: 'var(--art-fill, var(--color-canvas))' };

/* --- Globe ---------------------------------------------------------------- */
const GLOBE = { cx: 120, cy: 120, r: 80, tilt: -16 };
const GLOBE_LINES = globe(GLOBE.cx, GLOBE.cy, GLOBE.r);
const GLOBE_ORBIT = orbit(GLOBE.cx, GLOBE.cy, 104, 26, -12);

/** GIMUN: a globe on a tilted axis, its graticule seen from above, and one orbit. */
export function GlobeArt({ className, live }: ArtProps) {
  return (
    <svg {...common} className={className}>
      <g {...stroke} data-draw="">
        <path d={GLOBE_ORBIT.back} {...detail} pathLength={1} />
        <g transform={`rotate(${GLOBE.tilt} ${GLOBE.cx} ${GLOBE.cy})`}>
          <circle cx={GLOBE.cx} cy={GLOBE.cy} r={GLOBE.r} {...ground} pathLength={1} />
          <path d={GLOBE_LINES.meridians + GLOBE_LINES.parallels} {...detail} pathLength={1} />
          <path d={GLOBE_LINES.equator} pathLength={1} />
          <path d={`M${GLOBE.cx} ${GLOBE.cy - GLOBE.r - 12}V${GLOBE.cy - GLOBE.r}M${GLOBE.cx} ${GLOBE.cy + GLOBE.r}v12`} pathLength={1} />
        </g>
        <path d={GLOBE_ORBIT.front} pathLength={1} />
        {live && <circle r="4" fill="currentColor" stroke="none" className="art-orbiter" style={{ offsetPath: `path('${GLOBE_ORBIT.front}')` }} />}
      </g>
    </svg>
  );
}

/* --- Scales --------------------------------------------------------------- */
/** A pan hanging from a beam end at (x, 74), its rim at y = 146. */
function pan(x: number, live?: boolean) {
  return (
    <g className={live ? `art-pan art-pan--${x < 120 ? 'left' : 'right'}` : undefined}>
      <path d={`M${x} 76L${x - 24} 146M${x} 76L${x + 24} 146`} {...detail} pathLength={1} />
      <path d={`M${x - 28} 146h56a28 14 0 0 1-56 0Z`} {...ground} pathLength={1} />
    </g>
  );
}

/** The balance itself, in the 240-unit box; shared with the seal. */
export function ScalesShape({ live }: { live?: boolean } = {}) {
  return (
    <>
      <path d="M120 56v140" pathLength={1} />
      <circle cx="120" cy="46" r="7" {...ground} pathLength={1} />
      <path d="M112 74l8-10 8 10" pathLength={1} />
      <g className={live ? 'art-beam' : undefined}>
        <path d="M44 74h152" pathLength={1} />
        <circle cx="44" cy="74" r="3" {...ground} pathLength={1} />
        <circle cx="196" cy="74" r="3" {...ground} pathLength={1} />
      </g>
      {pan(44, live)}
      {pan(196, live)}
      <path d="M96 196h48v10H96zM80 206h80v10H80z" {...ground} pathLength={1} />
    </>
  );
}

/** GMC: the balance, level, with its hangers, pans and a stepped base. */
export function ScalesArt({ className, live }: ArtProps) {
  return (
    <svg {...common} className={className}>
      <g {...stroke} data-draw="">
        <ScalesShape live={live} />
      </g>
    </svg>
  );
}

/* --- Documents ------------------------------------------------------------ */
const SHEET = 'M72 48h72l28 28v120H72Z';

/** Resources: two sheets, the back one set askew and hidden where they overlap. */
export function DocumentsArt({ className, live }: ArtProps) {
  return (
    <svg {...common} className={className}>
      <g {...stroke} data-draw="">
        <g className={live ? 'art-sheet-back' : undefined}>
          <path d={SHEET} transform="rotate(-9 122 122) translate(-18 6)" {...ground} pathLength={1} />
        </g>
        <path d={SHEET} {...ground} pathLength={1} />
        <path d="M144 48v28h28" pathLength={1} />
        <path d="M90 100h64M90 118h64M90 136h64" {...detail} pathLength={1} />
        <path d="M90 154h40" {...detail} pathLength={1} className={live ? 'art-writing' : undefined} />
        <path d="M90 76h36" pathLength={1} />
      </g>
    </svg>
  );
}

/* --- Days ----------------------------------------------------------------- */
/** Schedule: a four-day calendar, its binding rings and a few sessions per day. */
export function DaysArt({ className, live }: ArtProps) {
  const sessions: [number, number, number][] = [
    [0, 102, 28], [0, 124, 20], [0, 150, 28],
    [1, 102, 20], [1, 128, 28],
    [2, 102, 28], [2, 124, 28], [2, 146, 20],
    [3, 102, 24], [3, 136, 16],
  ];
  return (
    <svg {...common} className={className}>
      <g {...stroke} data-draw="">
        <rect x="28" y="52" width="184" height="152" rx="12" {...ground} pathLength={1} />
        <path d="M28 86h184" pathLength={1} />
        <path d="M74 86v118M120 86v118M166 86v118" {...detail} pathLength={1} />
        <rect x="68" y="38" width="12" height="28" rx="6" {...ground} pathLength={1} />
        <rect x="160" y="38" width="12" height="28" rx="6" {...ground} pathLength={1} />
        {live ? (
          sessions.map(([day, y, w], index) => (
            <path
              key={index}
              d={`M${38 + day * 46} ${y}h${w}`}
              strokeWidth={5}
              className="art-session"
              style={{ '--i': index } as React.CSSProperties}
            />
          ))
        ) : (
          <path
            d={sessions.map(([day, y, w]) => `M${38 + day * 46} ${y}h${w}`).join('')}
            strokeWidth={5}
            strokeOpacity={0.4}
            pathLength={1}
          />
        )}
      </g>
    </svg>
  );
}

/* --- Route ---------------------------------------------------------------- */
// Schematic, not to scale: Peshawar (west) and Islamabad (east) on the M-1,
// the Swabi interchange between them, and the road south to Topi and GIKI.
const M1 = smoothPath([[28, 76], [70, 70], [118, 84], [168, 72], [212, 58]]);
const TOPI_ROAD = smoothPath([[118, 84], [116, 108], [124, 134], [124, 160]]);
// The traveller's way: in from Peshawar along the M-1, off at Swabi, south to campus.
const JOURNEY = smoothPath([[28, 76], [70, 70], [118, 84], [116, 108], [124, 134], [124, 160]]);

/** Venue: the M-1 between the two cities, the interchange, and the road to campus. */
export function RouteArt({ className, live }: ArtProps) {
  return (
    <svg {...common} className={className}>
      <g {...stroke} data-draw="">
        <path d={M1} strokeWidth={7} pathLength={1} />
        <path d={M1} strokeWidth={4} stroke="var(--art-fill, var(--color-canvas))" />
        <path d={TOPI_ROAD} pathLength={1} />
        <circle cx="28" cy="76" r="6" {...ground} pathLength={1} className="route__stop" />
        <circle cx="212" cy="58" r="6" {...ground} pathLength={1} className="route__stop" />
        <circle cx="118" cy="84" r="5" {...ground} pathLength={1} className="route__stop" />
        <path
          d="M124 208c0 0-22-22-22-38a22 22 0 0 1 44 0c0 16-22 38-22 38Z"
          {...ground}
          pathLength={1}
          className="route__stop"
        />
        <circle cx="124" cy="170" r="7" pathLength={1} />
        {live && <circle r="4.5" fill="currentColor" stroke="none" className="art-traveller" style={{ offsetPath: `path('${JOURNEY}')` }} />}
      </g>
    </svg>
  );
}

/* --- Bracket -------------------------------------------------------------- */
/**
 * GMC: the knockout from eight teams to one. Drawn left to right as it
 * scrolls in (see .draw-on-scroll); complete at rest.
 */
export function BracketArt({ className }: ArtProps) {
  const rounds = [
    // eight teams into four ties
    'M16 32h44v28M16 88h44V60M16 152h44v28M16 208h44v-28M16 272h44v28M16 328h44v-28M16 392h44v28M16 448h44v-28',
    // quarter-finals into semi-finals
    'M60 60h48v60M60 180h48v-60M60 300h48v60M60 420h48v-60',
    // semi-finals into the final
    'M108 120h48v120M108 360h48V240',
    // the final
    'M156 240h56',
  ];
  return (
    <svg viewBox="0 0 240 480" fill="none" aria-hidden="true" focusable="false" className={className}>
      <g {...stroke}>
        {rounds.map((d, index) => (
          <path key={index} d={d} pathLength={1} style={{ '--draw-i': index } as React.CSSProperties} />
        ))}
        <circle cx="220" cy="240" r="8" {...ground} pathLength={1} style={{ '--draw-i': 4 } as React.CSSProperties} />
      </g>
    </svg>
  );
}

/* --- Portico -------------------------------------------------------------- */
/** About: a portico, for the institution that hosts the event. */
export function PorticoArt({ className }: ArtProps) {
  const columns = [64, 98, 142, 176];
  return (
    <svg {...common} className={className}>
      <g {...stroke} data-draw="">
        <path d="M32 84 120 40l88 44Z" {...ground} pathLength={1} />
        <path d="M36 84h168v14H36z" {...ground} pathLength={1} />
        <path d={columns.map((x) => `M${x - 8} 98v84M${x + 8} 98v84`).join('')} pathLength={1} />
        <path d={columns.map((x) => `M${x - 12} 98h24M${x - 12} 182h24`).join('')} {...detail} pathLength={1} />
        <path d="M28 182h184v10H28zM20 192h200v10H20z" {...ground} pathLength={1} />
        <circle cx="120" cy="68" r="7" {...detail} pathLength={1} />
      </g>
    </svg>
  );
}

/* --- Gavel ---------------------------------------------------------------- */
/** Results: a gavel at rest on its block. */
export function GavelArt({ className, live }: ArtProps) {
  return (
    <svg {...common} className={className}>
      <g {...stroke} data-draw="">
        <path d="M44 196h152v12H44zM64 184h112v12H64z" {...ground} pathLength={1} />
        <g className={live ? 'art-gavel' : undefined}>
          <g transform="rotate(-38 120 112)">
            <path d="M120 116v92" strokeWidth={4} pathLength={1} />
            <rect x="84" y="80" width="72" height="36" rx="8" {...ground} pathLength={1} />
            <path d="M96 80v36M144 80v36" {...detail} pathLength={1} />
          </g>
        </g>
        {live && <path d="M52 176q68-14 136 0" {...detail} className="art-ring" />}
      </g>
    </svg>
  );
}
