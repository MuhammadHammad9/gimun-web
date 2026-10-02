'use client';

import { useState } from 'react';
import { MapPin } from 'lucide-react';
import '@frontend/styles/pages/venue.css';

/**
 * A Google Maps embed that loads only when asked. Until then nothing is
 * requested from Google: the visitor sees the address, a button to load the
 * map, and a plain link that opens Maps in a new tab.
 */
export function MapFacade({ query, title, address }: { query: string; title: string; address: string }) {
  const [loaded, setLoaded] = useState(false);
  const q = encodeURIComponent(query);

  if (loaded) {
    return (
      <div className="overflow-hidden rounded-2xl border border-line bg-raised">
        <iframe
          title={title}
          src={`https://maps.google.com/maps?q=${q}&z=15&output=embed`}
          className="block aspect-[4/3] w-full"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    );
  }

  return (
    <div className="map-facade">
      <MapPin aria-hidden="true" strokeWidth={1.5} className="size-6 text-champagne" />
      <p className="max-w-xs text-sm leading-relaxed text-text-2">{address}</p>
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
        <button type="button" className="text-link" onClick={() => setLoaded(true)}>
          Load the map here
        </button>
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${q}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-link"
        >
          Open in Google Maps<span className="sr-only"> (opens in a new tab)</span>
        </a>
      </div>
      <p className="text-xs text-text-3">Loading the map shares your visit with Google.</p>
    </div>
  );
}
