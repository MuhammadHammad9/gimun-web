'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Search } from 'lucide-react';

interface CountryItem {
  country: string;
  status: 'available' | 'assigned' | 'reserved';
}

interface CountryMatrixProps {
  countryList: CountryItem[];
}

export function CountryMatrix({ countryList }: CountryMatrixProps) {
  const [filter, setFilter] = useState<'all' | 'available' | 'assigned' | 'reserved'>('all');
  const [search, setSearch] = useState('');

  const filtered = countryList.filter((item) => {
    const matchesFilter = filter === 'all' || item.status === filter;
    const matchesSearch = item.country.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const counts = {
    all: countryList.length,
    available: countryList.filter((c) => c.status === 'available').length,
    assigned: countryList.filter((c) => c.status === 'assigned').length,
    reserved: countryList.filter((c) => c.status === 'reserved').length,
  };

  return (
    <div className="space-y-4">
      {/* Controls: Search and Filter Pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {(['all', 'available', 'assigned', 'reserved'] as const).map((status) => (
            <button
              key={status}
              type="button"
              aria-pressed={filter === status}
              onClick={() => setFilter(status)}
              className={cn(
                'px-3 py-1 rounded-full text-xs font-mono font-medium transition-colors capitalize',
                filter === status
                  ? 'bg-gradient-to-r from-champagne-hi via-champagne to-champagne-lo text-overlay font-bold shadow-xs'
                  : 'bg-overlay/80 text-champagne/70 hover:bg-champagne/20 hover:text-cream'
              )}
            >
              {status} ({counts[status]})
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-champagne/60" />
          <input
            type="text"
            placeholder="Filter country or portfolio..."
            aria-label="Filter country or portfolio"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-overlay/90 border border-champagne/30 text-xs text-cream placeholder:text-champagne/50 focus:outline-hidden focus:ring-2 focus:ring-champagne/20 focus:border-champagne"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
        {filtered.map((item, idx) => (
          <div
            key={idx}
            className="p-3 rounded-xl bg-overlay/80 border border-champagne/20 flex flex-col justify-between gap-2 shadow-xs hover:border-champagne/60 transition-colors backdrop-blur-md"
          >
            <span className="font-heading font-semibold text-xs text-cream leading-tight">
              {item.country}
            </span>
            <span
              className={cn(
                'self-start px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider',
                item.status === 'available' && 'bg-champagne/20 text-champagne border border-champagne/40',
                item.status === 'assigned' && 'bg-white/10 text-champagne/60 border border-white/15',
                item.status === 'reserved' && 'bg-brand-lit/40 text-champagne-hi border border-brand-lit'
              )}
            >
              {item.status}
            </span>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="p-8 text-center text-xs font-mono text-champagne/60 bg-overlay/60 rounded-xl border border-dashed border-champagne/30">
          No portfolios match your current search or filter.
        </div>
      )}
    </div>
  );
}
