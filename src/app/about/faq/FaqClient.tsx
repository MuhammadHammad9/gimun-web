'use client';

import React, { useEffect, useState } from 'react';
import {
  ChevronDown,
  } from 'lucide-react';
import type { FAQItem } from '@/lib/types';
import { SearchInput } from '@/components/ui/SearchInput';
import { EmptyState } from '@/components/ui/EmptyState';
import { FilterBar } from '@/components/ui/FilterBar';
import { HelpCallout } from '@/components/ui/HelpCallout';

interface FaqClientProps {
  initialFaqs: FAQItem[];
}

type FaqCategory = 'all' | 'general' | 'registration-fees' | 'gimun-specific' | 'moot-cup-specific' | 'logistics';

/** Deep-link hashes that select a category, e.g. /about/faq#fees. */
const HASH_CATEGORIES: Record<string, FaqCategory> = {
  fees: 'registration-fees',
  'registration-fees': 'registration-fees',
  general: 'general',
  gimun: 'gimun-specific',
  'moot-cup': 'moot-cup-specific',
  logistics: 'logistics',
};

const CATEGORY_LABELS: Record<FaqCategory, string> = {
  all: 'All Categories',
  general: 'General Overview',
  'registration-fees': 'Registration & Fees',
  'gimun-specific': 'GIMUN Track',
  'moot-cup-specific': 'GMC Track',
  logistics: 'Campus & Logistics',
};

export function FaqClient({ initialFaqs }: FaqClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<FaqCategory>('all');
  const [openIds, setOpenIds] = useState<Set<string>>(() => {
    // Open the first 2 FAQs by default for immediate engagement
    const firstTwo = initialFaqs.slice(0, 2).map((f) => f.id);
    return new Set(firstTwo);
  });

  // Honour category deep links on load and on in-page hash changes.
  useEffect(() => {
    const applyHash = () => {
      const category = HASH_CATEGORIES[window.location.hash.slice(1)];
      if (!category) return;
      setActiveCategory(category);
      document.getElementById('faq-categories')?.scrollIntoView({ block: 'start' });
    };
    applyHash();
    window.addEventListener('hashchange', applyHash);
    return () => window.removeEventListener('hashchange', applyHash);
  }, []);

  const toggleItem = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleExpandAll = () => {
    setOpenIds(new Set(filteredFaqs.map((f) => f.id)));
  };

  const handleCollapseAll = () => {
    setOpenIds(new Set());
  };

  // Category counts
  const counts: Record<FaqCategory, number> = {
    all: initialFaqs.length,
    general: 0,
    'registration-fees': 0,
    'gimun-specific': 0,
    'moot-cup-specific': 0,
    logistics: 0,
  };
  initialFaqs.forEach((item) => {
    if (counts[item.category] !== undefined) {
      counts[item.category] += 1;
    }
  });

  // Filtered FAQs
  const q = searchQuery.trim().toLowerCase();
  const filteredFaqs = initialFaqs.filter((item) => {
    const matchesCat = activeCategory === 'all' || item.category === activeCategory;
    if (!matchesCat) return false;
    if (!q) return true;
    return (
      item.question.toLowerCase().includes(q) ||
      item.answer.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  });

  const getCategoryBadgeClass = (cat: FAQItem['category']) => {
    switch (cat) {
      case 'gimun-specific':
        return 'bg-champagne/20 text-cream border border-champagne/40';
      case 'moot-cup-specific':
        return 'bg-brand text-cream border border-champagne/30';
      case 'registration-fees':
        return 'bg-crest text-champagne border border-champagne/30';
      case 'logistics':
        return 'bg-overlay text-champagne border border-champagne/30';
      default:
        return 'bg-crest text-champagne border border-champagne/30';
    }
  };

  return (
    <div className="space-y-8">
      {/* Search Bar & Category Controls */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="w-full sm:max-w-md">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search question keywords (e.g. OSCOLA, hostel, payment, ROP)..."
            />
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={handleExpandAll}
              className="text-xs font-semibold text-champagne hover:text-cream px-3 py-1.5 rounded-lg bg-overlay hover:bg-crest border border-champagne/30 transition-colors shadow-xs"
            >
              Expand All
            </button>
            <button
              type="button"
              onClick={handleCollapseAll}
              className="text-xs font-semibold text-champagne hover:text-cream px-3 py-1.5 rounded-lg bg-overlay hover:bg-crest border border-champagne/30 transition-colors shadow-xs"
            >
              Collapse All
            </button>
          </div>
        </div>

        {/* Category Pills with Count Chips */}
        <div id="faq-categories" className="scroll-mt-28 pt-1 border-b border-line pb-3">
          {/* Real anchor targets for /about/faq#fees and friends. */}
          {Object.keys(HASH_CATEGORIES).map((hash) => (
            <span key={hash} id={hash} aria-hidden="true" className="block h-0 scroll-mt-28" />
          ))}
          <FilterBar
            label="Filter questions by category"
            activeValue={activeCategory}
            onChange={setActiveCategory}
            options={(Object.keys(CATEGORY_LABELS) as FaqCategory[]).map((cat) => ({
              value: cat,
              label: CATEGORY_LABELS[cat],
              count: counts[cat],
            }))}
          />
        </div>
      </div>

      {/* Accordion FAQ List - Clean minimalist border-b divider architecture */}
      <div className="divide-y divide-champagne/15 border-y border-champagne/15">
        <h2 className="sr-only">Questions, by topic</h2>
        {filteredFaqs.map((faq) => {
          const isOpen = openIds.has(faq.id);
          return (
            <div
              key={faq.id}
              id={faq.id}
              className="py-5 scroll-mt-24 transition-colors duration-150"
            >
              <button
                type="button"
                onClick={() => toggleItem(faq.id)}
                aria-expanded={isOpen}
                aria-controls={`${faq.id}-answer`}
                className="w-full text-left flex items-start justify-between gap-4 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-champagne/40 rounded-lg group"
              >
                <div className="space-y-1.5 pr-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${getCategoryBadgeClass(
                        faq.category
                      )}`}
                    >
                      {CATEGORY_LABELS[faq.category] ?? faq.category.replaceAll('-', ' ')}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-heading font-semibold text-cream group-hover:text-champagne transition-colors leading-snug">
                    {faq.question}
                  </h3>
                </div>

                <div
                  className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all mt-1 ${
                    isOpen
                      ? 'bg-champagne text-crest'
                      : 'bg-overlay text-champagne/80 border border-champagne/20 group-hover:border-champagne/50'
                  }`}
                >
                  <div
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </button>

              {/* Always in the HTML (search engines, find-in-page, no-JS);
                  collapsed answers are hidden rather than unmounted. */}
              <div id={`${faq.id}-answer`} hidden={!isOpen} className="overflow-hidden">
                <div className="pt-3 pb-2 text-sm text-champagne/85 leading-relaxed">
                  {faq.answer}
                </div>
              </div>
            </div>
          );
        })}

        {filteredFaqs.length === 0 && (
          <EmptyState
            title="No Matching Questions Found"
            description={`We couldn't find any questions matching "${searchQuery}". You can try broadening your search or send an inquiry to the Secretariat.`}
            actionLabel="Reset Search & Filters"
            onAction={() => {
              setSearchQuery('');
              setActiveCategory('all');
            }}
          />
        )}
      </div>

      {/* Still Have Questions CTA Banner */}
      <HelpCallout
        question="Still haven't found your answer?"
        actions={[{ label: 'Contact the organizing team', href: '/contact' }]}
      />
    </div>
  );
}
