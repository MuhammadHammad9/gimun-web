import type { GlobeMarker } from '@/components/art/LiveGlobe';
import type { Committee } from '@/lib/types';
import { centroidOf } from './centroids';

// A country seated in several committees shows its most open seat.
const RANK: Record<GlobeMarker['status'], number> = { available: 3, assigned: 2, reserved: 1 };

/**
 * One globe marker per country across every committee's country list, using
 * the seat status getCommittees() derives from live allocations and
 * reservations. Names the globe cannot place are skipped (see
 * unplacedCountries); they still count as seats everywhere else.
 */
export function globeMarkers(committees: Pick<Committee, 'countryList'>[]): GlobeMarker[] {
  const byCountry = new Map<string, { name: string; status: GlobeMarker['status']; centre: readonly [number, number] }>();
  for (const { country, status } of committees.flatMap((c) => c.countryList ?? [])) {
    const centre = centroidOf(country);
    if (!centre) continue;
    // Keyed by position, so "USA" and "United States" are one marker.
    const key = centre.join(',');
    const current = byCountry.get(key);
    if (!current || RANK[status] > RANK[current.status]) byCountry.set(key, { name: country.trim(), status, centre });
  }
  return [...byCountry.values()].map(({ name, status, centre }) => ({ country: name, lat: centre[0], lon: centre[1], status }));
}
