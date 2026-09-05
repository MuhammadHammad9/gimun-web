'use client';

import React from 'react';
import { cn } from '@/lib/utils';
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
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5A5A6E] pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full pl-11 pr-10 py-3 rounded-2xl bg-white border border-gray-200 text-sm text-[#1A1A2E] placeholder:text-[#5A5A6E] shadow-sm transition-all focus:outline-none focus:border-[#FF6B35] focus:ring-2 focus:ring-[#FF6B35]/20"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search query"
          className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
