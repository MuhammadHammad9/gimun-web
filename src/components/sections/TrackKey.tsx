/** Colour of a schedule session's dot by track. */
export const TRACK_DOT: Record<string, string> = {
  gimun: 'var(--color-accent-gimun)',
  'moot-cup': 'var(--color-accent-gmc)',
};

export function trackDot(track: string): string {
  return TRACK_DOT[track] ?? 'var(--color-line-3)';
}

/** The legend for the coloured session dots. */
export function TrackKey() {
  return (
    <>
      <span>
        <span className="track-dot" aria-hidden="true" style={{ background: TRACK_DOT.gimun }} />
        GIMUN
      </span>
      <span>
        <span className="track-dot" aria-hidden="true" style={{ background: TRACK_DOT['moot-cup'] }} />
        GMC
      </span>
      <span>
        <span className="track-dot" aria-hidden="true" style={{ background: 'var(--color-line-3)' }} />
        Both tracks
      </span>
    </>
  );
}
