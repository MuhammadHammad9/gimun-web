/**
 * The link-preview images (Open Graph / Twitter cards), drawn by
 * scripts/generate-share-images.mjs. The year is in the file name so that
 * apps which cache a preview by URL (WhatsApp, Facebook, LinkedIn) fetch new
 * artwork when it changes: regenerate with a new VERSION and update here.
 */
export type ShareImage = { url: string; alt: string };

export const SHARE_IMAGES = {
  site: {
    url: '/images/og/share-2026.jpg',
    alt: 'GIMUN 26 and GMC VII, hosted by SOPHEP: 4 to 6 December 2026 at GIK Institute, Topi, Swabi',
  },
  gimun: {
    url: '/images/og/share-gimun-2026.jpg',
    alt: 'GIMUN 26, GIKI Model United Nations: Debate. Diplomacy. Destiny. 4 to 6 December 2026 at GIK Institute, Topi',
  },
  mootCup: {
    url: '/images/og/share-gmc-2026.jpg',
    alt: 'GMC VII, the seventh GIKI Moot Cup: where conviction commands the courtroom. 4 to 6 December 2026 at GIK Institute, Topi',
  },
} as const satisfies Record<string, ShareImage>;
