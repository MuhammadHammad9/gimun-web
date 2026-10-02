'use client';

import React from 'react';
import { cn } from '@frontend/lib/utils';
import { Search, X } from 'lucide-react';

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search by keyword, topic, committee...',
  className,
}: SearchInputProps) {
  return (
    <div className={cn('relative w-full', className)}>
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-3 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full pl-11 pr-10 py-3 rounded-2xl bg-overlay/90 border border-line-2 text-sm text-text placeholder:text-text-4 shadow-inner backdrop-blur-md transition-all focus:outline-hidden focus:border-champagne focus:ring-2 focus:ring-focus"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search query"
          className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-text-3 hover:text-text hover:bg-champagne/10 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
