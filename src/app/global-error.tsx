'use client';

// Replaces the root layout when it fails, so it cannot rely on the site
// stylesheet or fonts. Inline styles keep it on-brand regardless.
export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="en">
      <head>
        <title>Temporarily unavailable | GIMUN &amp; GMC</title>
      </head>
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          background: '#140302',
          color: '#fffdf9',
          fontFamily: 'system-ui, -apple-system, Segoe UI, sans-serif',
          padding: '16px',
        }}
      >
        <main style={{ maxWidth: 480, textAlign: 'center' }}>
          <h1 style={{ fontSize: 28, margin: '0 0 12px' }}>The website is temporarily unavailable</h1>
          <p style={{ color: 'rgba(236, 216, 183, 0.88)', lineHeight: 1.6, margin: '0 0 24px' }}>
            Please try again in a moment.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              minHeight: 44,
              padding: '0 24px',
              borderRadius: 999,
              border: 0,
              background: '#ecd8b7',
              color: '#140302',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
