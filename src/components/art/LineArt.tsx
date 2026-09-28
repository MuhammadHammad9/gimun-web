/**
 * Line art for chapters and cards. Stroke-only, currentColor, decorative
 * (aria-hidden). Paths carry pathLength="1" and data-draw so anime.js can
 * draw them in after the visitor's first intent; at rest they are complete.
 */

type ArtProps = { className?: string };

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

/** GIMUN: a globe with its meridians and one orbit. */
export function GlobeArt({ className }: ArtProps) {
  return (
    <svg {...common} className={className}>
      <g {...stroke} data-draw="">
        <circle cx="120" cy="120" r="92" pathLength={1} />
        <ellipse cx="120" cy="120" rx="40" ry="92" pathLength={1} />
        <ellipse cx="120" cy="120" rx="74" ry="92" pathLength={1} />
        <path d="M28 120h184M40 76h160M40 164h160M120 28v184" pathLength={1} />
        <ellipse cx="120" cy="120" rx="112" ry="34" transform="rotate(-18 120 120)" pathLength={1} />
      </g>
    </svg>
  );
}

/** GMC: the balance, level. */
export function ScalesArt({ className }: ArtProps) {
  return (
    <svg {...common} className={className}>
      <g {...stroke} data-draw="">
        <path d="M120 44v152M90 196h60M52 72h136" pathLength={1} />
        <circle cx="120" cy="38" r="6" pathLength={1} />
        <path d="M52 72 30 132h44L52 72ZM188 72l-22 60h44l-22-60Z" pathLength={1} />
        <path d="M30 132a22 10 0 0 0 44 0M166 132a22 10 0 0 0 44 0" pathLength={1} />
      </g>
    </svg>
  );
}

/** Resources: a fanned stack of documents. */
export function DocumentsArt({ className }: ArtProps) {
  return (
    <svg {...common} className={className}>
      <g {...stroke} data-draw="">
        <path d="M58 56h88l30 30v110H58z" transform="rotate(-8 120 126)" pathLength={1} />
        <path d="M64 50h88l30 30v110H64z" pathLength={1} />
        <path d="M152 50v30h30M84 104h76M84 124h76M84 144h52M84 164h64" pathLength={1} />
      </g>
    </svg>
  );
}

/** Schedule: four days, one column each. */
export function DaysArt({ className }: ArtProps) {
  return (
    <svg {...common} className={className}>
      <g {...stroke} data-draw="">
        <rect x="36" y="52" width="168" height="140" rx="10" pathLength={1} />
        <path d="M36 84h168M78 52v140M120 52v140M162 52v140M78 40v20M162 40v20" pathLength={1} />
        <path d="M46 104h22M46 122h16M88 104h22M88 140h14M130 104h22M130 122h22M172 104h20" pathLength={1} />
      </g>
    </svg>
  );
}

/** Venue: the road from the motorway to the campus, with its two ends marked. */
export function RouteArt({ className }: ArtProps) {
  return (
    <svg {...common} className={className}>
      <g {...stroke} data-draw="">
        <path d="M40 196c30-8 22-54 58-62s58 18 76-12 4-52 26-70" pathLength={1} />
        <circle cx="40" cy="196" r="7" pathLength={1} />
        <path d="M200 30c-12 0-20 9-20 20 0 15 20 34 20 34s20-19 20-34c0-11-8-20-20-20Z" pathLength={1} />
        <circle cx="200" cy="50" r="6" pathLength={1} />
      </g>
    </svg>
  );
}
