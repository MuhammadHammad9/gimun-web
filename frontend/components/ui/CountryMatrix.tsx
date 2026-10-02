'use client';

import { useRef, useState } from 'react';
import { Search } from 'lucide-react';
import { useFlip } from '@frontend/components/motion/useFlip';
import { FilterBar } from '@frontend/components/ui/FilterBar';

type Status = 'available' | 'assigned' | 'reserved';

interface CountryItem {
  country: string;
  status: Status;
}

const STATUS_LABEL: Record<Status, string> = {
  available: 'Available',
  assigned: 'Assigned',
  reserved: 'Reserved',
};

/**
 * Every seat in a committee and whether it can still be requested. Status is
 * carried by words and by the marker's shape (filled, hollow, struck), never
 * by colour alone. Cells glide into place when the filter changes.
 */
export function CountryMatrix({ countryList }: { countryList: CountryItem[] }) {
  const [filter, setFilter] = useState<'all' | Status>('all');
  const [search, setSearch] = useState('');
  const grid = useRef<HTMLUListElement>(null);
  const { prime, capture } = useFlip(grid, '.seat');

  const counts = {
    all: countryList.length,
    available: countryList.filter((c) => c.status === 'available').length,
    assigned: countryList.filter((c) => c.status === 'assigned').length,
    reserved: countryList.filter((c) => c.status === 'reserved').length,
  };
  const query = search.trim().toLowerCase();
  const shown = countryList.filter((item) => (filter === 'all' || item.status === filter) && item.country.toLowerCase().includes(query));

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between" onPointerEnter={prime} onFocusCapture={prime}>
        <FilterBar
          label="Filter seats by status"
          options={(['all', 'available', 'assigned', 'reserved'] as const).map((value) => ({
            value,
            label: value === 'all' ? 'All' : STATUS_LABEL[value],
            count: counts[value],
          }))}
          activeValue={filter}
          onChange={(value) => {
            capture();
            setFilter(value);
          }}
        />
        <label className="relative block w-full sm:w-72">
          <span className="sr-only">Find a country or portfolio</span>
          <Search aria-hidden="true" strokeWidth={1.75} className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-text-3" />
          <input
            type="search"
            value={search}
            placeholder="Find a country or portfolio"
            onChange={(event) => {
              capture();
              setSearch(event.target.value);
            }}
            className="w-full rounded-full border border-line-2 bg-raised py-2.5 pl-10 pr-4 text-small text-text placeholder:text-text-4 focus:border-line-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          />
        </label>
      </div>

      <p className="sr-only" aria-live="polite">
        {shown.length} of {countryList.length} seats shown
      </p>

      <ul ref={grid} className="seats">
        {shown.map((item) => (
          <li key={item.country} className="seat" data-status={item.status}>
            <span className="seat__name">{item.country}</span>
            <span className="seat__status">
              <span className="seat__marker" aria-hidden="true" />
              {STATUS_LABEL[item.status]}
            </span>
          </li>
        ))}
      </ul>

      {shown.length === 0 && <p className="mt-6 rounded-2xl border border-dashed border-line-2 p-8 text-center text-small text-text-3">No seats match that search or filter.</p>}
    </div>
  );
}
