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

interface FaqClientProps {
  initialFaqs: FAQItem[];
}

type FaqCategory = 'all' | 'general' | 'registration-fees' | 'gimun-specific' | 'moot-cup-specific' | 'logistics';

const CATEGORY_LABELS: Record<FaqCategory, string> = {
  all: 'All Categories',
  general: 'General Overview',
  'registration-fees': 'Registration & Fees',
  'gimun-specific': 'GIMUN Track',
  'moot-cup-specific': 'GIKI Moot Cup',
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
        return 'bg-orange-50 text-accent border border-orange-200/80';
      case 'moot-cup-specific':
        return 'bg-teal-50 text-secondary border border-teal-200/80';
      case 'registration-fees':
        return 'bg-emerald-50 text-emerald-800 border border-emerald-200/80';
      case 'logistics':
        return 'bg-indigo-50 text-indigo-800 border border-indigo-200/80';
      default:
        return 'bg-slate-100 text-neutral-gray border border-slate-200';
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
              className="text-xs font-semibold text-neutral-gray hover:text-ink px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200/70 transition-colors"
            >
              Expand All
            </button>
            <button
              type="button"
              onClick={handleCollapseAll}
              className="text-xs font-semibold text-neutral-gray hover:text-ink px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200/70 transition-colors"
            >
              Collapse All
            </button>
          </div>
        </div>

        {/* Category Pills with Count Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-b border-slate-100 pb-3">
          {(Object.keys(CATEGORY_LABELS) as FaqCategory[]).map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-button text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-primary text-white shadow-xs'
                    : 'bg-white text-neutral-gray hover:text-ink border border-whisper-border hover:border-slate-300'
                }`}
              >
                <span>{CATEGORY_LABELS[cat]}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-neutral-gray'
                  }`}
                >
                  {counts[cat]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Accordion FAQ List */}
      <div className="space-y-3">
        {filteredFaqs.map((faq) => {
          const isOpen = openIds.has(faq.id);
          return (
            <div
              key={faq.id}
              className={`rounded-card border transition-all duration-200 ${
                isOpen
                  ? 'bg-surface-elevated border-slate-300/80 shadow-card'
                  : 'bg-white border-whisper-border hover:border-slate-300'
              }`}
            >
              <button
                type="button"
                onClick={() => toggleItem(faq.id)}
                aria-expanded={isOpen}
                className="w-full p-5 text-left flex items-start justify-between gap-4 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-card"
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
                  <h3 className="text-sm sm:text-base font-heading font-bold text-ink leading-snug">
                    {faq.question}
                  </h3>
                </div>

                <div
                  className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                    isOpen ? 'bg-primary text-white' : 'bg-slate-100 text-neutral-gray'
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
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-neutral-gray leading-relaxed border-t border-slate-100/80">
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
      <div className="p-6 md:p-8 rounded-card bg-surface border border-whisper-border shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1.5 text-center md:text-left">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-primary">
            <HelpCircle className="w-4 h-4 text-primary" />
            <span>Unanswered Inquiries?</span>
          </div>
          <h3 className="text-lg font-heading font-bold text-ink">
            Can&apos;t find what you&apos;re looking for?
          </h3>
          <p className="text-xs text-neutral-gray max-w-xl">
            Our Secretariat and Moot Court Bench are available to clarify delegation accommodations,
            observer passes, or specialized committee rules.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link
            href="/contact?type=other"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-button bg-primary text-white text-xs font-semibold hover:bg-primary-light transition-colors shadow-button"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Contact Secretariat</span>
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-button bg-white border border-slate-200 text-xs font-semibold text-ink hover:bg-slate-50 transition-colors shadow-xs"
          >
            <span>Register Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
