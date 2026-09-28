/**
 * Line art for the navigation panels: a globe for GIMUN, the scales for the
 * moot court, a portico for the event itself. Stroke-only, currentColor.
 */
export function SectionArt({ kind, className }: { kind: 'gimun' | 'gmc' | 'about'; className?: string }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" aria-hidden="true" focusable="false" className={className}>
      <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        {kind === 'gimun' && (
          <>
            <circle cx="60" cy="60" r="46" />
            <ellipse cx="60" cy="60" rx="20" ry="46" />
            <ellipse cx="60" cy="60" rx="38" ry="46" />
            <path d="M14 60h92M20 38h80M20 82h80" />
          </>
        )}
        {kind === 'gmc' && (
          <>
            <path d="M60 18v84M40 102h40M26 34h68" />
            <circle cx="60" cy="18" r="4" />
            <path d="M26 34 12 66h28L26 34ZM94 34 80 66h28L94 34Z" />
            <path d="M12 66a14 8 0 0 0 28 0M80 66a14 8 0 0 0 28 0" />
          </>
        )}
        {kind === 'about' && (
          <>
            <path d="M14 44 60 18l46 26H14Z" />
            <path d="M22 50v42M42 50v42M60 50v42M78 50v42M98 50v42" />
            <path d="M12 98h96M16 92h88" />
          </>
        )}
      </g>
    </svg>
  );
}
