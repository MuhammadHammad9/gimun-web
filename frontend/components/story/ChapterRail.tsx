'use client';

import dynamic from 'next/dynamic';

/**
 * The page's chapter rail, loaded after hydration in its own chunk: it shows
 * nothing before the visitor's first scroll anyway, so its code stays off the
 * critical path. Until it arrives, bridge links are ordinary anchors.
 */
export const ChapterRail = dynamic(() => import('./ChapterIndex').then((m) => m.ChapterIndex), { ssr: false });
