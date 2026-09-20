'use client';
export default function GlobalError({ reset }: { reset: () => void }) { return <html lang="en"><body><h1>Unable to load the website</h1><button onClick={reset}>Try again</button></body></html>; }
