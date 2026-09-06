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
              onClick={() => setFilter(status)}
              className={cn(
                'px-3 py-1 rounded-full text-xs font-mono font-medium transition-colors capitalize',
                filter === status
                  ? 'bg-[#1E2A78] text-white'
                  : 'bg-gray-100 text-[#5A5A6E] hover:bg-gray-200'
              )}
            >
              {status} ({counts[status]})
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Filter country or portfolio..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-[#FF6B35]/20 focus:border-[#FF6B35]"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
        {filtered.map((item, idx) => (
          <div
            key={idx}
            className="p-3 rounded-xl bg-white border border-gray-200/70 flex flex-col justify-between gap-2 shadow-2xs hover:border-gray-300 transition-colors"
          >
            <span className="font-heading font-semibold text-xs text-[#1A1A2E] leading-tight">
              {item.country}
            </span>
            <span
              className={cn(
                'self-start px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider',
                item.status === 'available' && 'bg-emerald-50 text-emerald-700 border border-emerald-200',
                item.status === 'assigned' && 'bg-gray-100 text-gray-600 border border-gray-200',
                item.status === 'reserved' && 'bg-amber-50 text-amber-700 border border-amber-200'
              )}
            >
              {item.status}
            </span>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="p-8 text-center text-xs font-mono text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          No portfolios match your current search or filter.
        </div>
      )}
    </div>
  );
}
