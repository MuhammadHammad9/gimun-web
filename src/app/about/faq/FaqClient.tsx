'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  HelpCircle,
  MessageSquare,
  ArrowRight,
} from 'lucide-react';
import type { FAQItem } from '@/lib/types';
import { SearchInput } from '@/components/ui/SearchInput';
import { EmptyState } from '@/components/ui/EmptyState';
import { CtaBanner } from '@/components/ui/CtaBanner';
import { FilterBar } from '@/components/ui/FilterBar';

interface FaqClientProps {
  initialFaqs: FAQItem[];
}

type FaqCategory = 'all' | 'general' | 'registration-fees' | 'gimun-specific' | 'moot-cup-specific' | 'logistics';

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
        <div className="pt-1 border-b border-line pb-3">
          <FilterBar
            label="Filter questions by category"
            activeValue={activeCategory}
            onChange={setActiveCategory}
            options={(Object.keys(CATEGORY_LABELS) as FaqCategory[]).map((cat) => ({
              value: cat,
              id: cat,
              anchorId: cat === 'registration-fees' ? 'fees' : undefined,
              label: CATEGORY_LABELS[cat],
              count: counts[cat],
            }))}
          />
        </div>
      </div>

      {/* Accordion FAQ List - Clean minimalist border-b divider architecture */}
      <div className="divide-y divide-champagne/15 border-y border-champagne/15">
        <h2 className="sr-only">Frequently Asked Questions Directory</h2>
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
                className="w-full text-left flex items-start justify-between gap-4 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-champagne/40 rounded-lg group"
              >
                <div className="space-y-1.5 pr-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${getCategoryBadgeClass(
                        faq.category
                      )}`}
                    >
                      {faq.category.replace('-', ' ')}
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
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </motion.div>
                </div>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key="content"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="pt-3 pb-2 text-sm text-champagne/85 leading-relaxed">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
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
      <CtaBanner variant="slab">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">

        <div className="space-y-1.5 text-center md:text-left">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-champagne">
            <HelpCircle className="w-4 h-4 text-champagne" />
            <span>Unanswered Inquiries?</span>
          </div>
          <h3 className="text-lg font-heading font-bold text-cream">
            Can&apos;t find what you&apos;re looking for?
          </h3>
          <p className="text-xs text-champagne/80 max-w-xl">
            Our Secretariat and Moot Court Bench are available to clarify delegation accommodations,
            observer passes, or specialized committee rules.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link
            href="/contact?type=other"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-linear-to-r from-champagne via-champagne-hi to-champagne-lo text-crest text-xs font-bold hover:brightness-110 transition-all shadow-md"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Contact Secretariat</span>
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-crest border border-champagne/40 text-xs font-semibold text-champagne hover:bg-brand transition-colors"
          >
            <span>Register Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        </div>
      </CtaBanner>
    </div>
  );
}
