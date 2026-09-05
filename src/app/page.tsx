'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  HeroSection,
} from '@/components/ui/HeroSection';
import { Button } from '@/components/ui/Button';
import { TrackBadge } from '@/components/ui/TrackBadge';
import { ContentCard } from '@/components/ui/ContentCard';
import { Accordion } from '@/components/ui/Accordion';
import { FilterBar } from '@/components/ui/FilterBar';
import { SearchInput } from '@/components/ui/SearchInput';
import { SponsorStrip } from '@/components/ui/SponsorStrip';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { Lightbox } from '@/components/ui/Lightbox';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import {
  Scale,
  Globe2,
  Calendar,
  FileText,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { getSponsors, getFAQ, getCommittees, getProblemCategories } from '@/lib/content';

export default function Home() {
  const sponsors = getSponsors();
  const faqItems = getFAQ().slice(0, 4);
  const committees = getCommittees();
  const mootCategories = getProblemCategories();

  // State for interactive FilterBar
  const [activeTrack, setActiveTrack] = useState<'all' | 'gimun' | 'moot-cup'>('all');
  
  // State for SearchInput
  const [searchQuery, setSearchQuery] = useState('');

  // State for Lightbox test
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const sampleGalleryImages = [
    {
      src: '/images/gallery/1.jpg',
      alt: 'General Assembly Plenary Session in GIKI Main Auditorium',
      caption: 'Over 200 delegates debating multilateral crisis response.',
    },
    {
      src: '/images/gallery/2.jpg',
      alt: 'GIKI Moot Cup Grand Final Before Full Judicial Bench',
      caption: 'Oral submissions on international cyber operations under IHL.',
    },
    {
      src: '/images/gallery/3.jpg',
      alt: 'Closing Ceremony and Diplomatic Gala Night',
      caption: 'Celebrating outstanding delegate and advocate achievements.',
    },
  ];

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      {/* 1. HERO SECTION (PRD §15.1 - Asymmetric, Fluid Typography, Dual CTAs) */}
      <HeroSection
        eyebrow={
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-semibold bg-white border border-gray-200/80 shadow-xs text-[#1E2A78]">
            <span className="w-2 h-2 rounded-full bg-[#FF6B35] animate-pulse" />
            <span>March 18–21, 2027 • GIKI, Topi, Pakistan</span>
          </div>
        }
        title={
          <>
            Where <span className="text-[#FF6B35]">Diplomacy</span> Meets the{' '}
            <span className="text-[#00B4A6]">Courtroom</span>.
          </>
        }
        description="Two concurrent flagship student competitions hosted under one unified digital platform at the Ghulam Ishaq Khan Institute. Engage in multilateral negotiation across UN-style bodies, or make your legal case before a bench of senior jurists."
        primaryAction={{
          label: 'Register for GIMUN',
          href: '/register?track=gimun',
          variant: 'track-gimun',
        }}
        secondaryAction={{
          label: 'Explore Moot Cup',
          href: '/moot-cup',
        }}
        sideContent={
          <div className="space-y-4">
            {/* Dual Track Summary Cards (PRD §15.1 - Equal Visual Weight) */}
            <div className="double-bezel">
              <div className="double-bezel-inner p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <TrackBadge track="gimun" />
                  <span className="text-xs font-mono text-[#5A5A6E]">3 Committees</span>
                </div>
                <h3 className="font-heading font-bold text-lg text-[#1A1A2E]">
                  Model United Nations (MUN)
                </h3>
                <p className="text-xs text-[#5A5A6E] leading-relaxed">
                  Represent sovereign states, build multilateral alliances, draft working papers, and pass resolutions on vital global issues.
                </p>
                <div className="pt-2 flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-[#FF6B35]">Individual &amp; Delegations</span>
                  <Link href="/gimun" className="text-xs font-semibold text-[#1E2A78] hover:text-[#FF6B35] inline-flex items-center gap-1">
                    Learn more <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            <div className="double-bezel">
              <div className="double-bezel-inner p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <TrackBadge track="moot-cup" />
                  <span className="text-xs font-mono text-[#5A5A6E]">Teams of 2–4</span>
                </div>
                <h3 className="font-heading font-bold text-lg text-[#1A1A2E]">
                  GIKI Moot Court Competition
                </h3>
                <p className="text-xs text-[#5A5A6E] leading-relaxed">
                  Analyze complex compromises, draft rigorous legal memorials, and argue appellate cases before senior legal scholars and judges.
                </p>
                <div className="pt-2 flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-[#00B4A6]">Memorials &amp; Oral Rounds</span>
                  <Link href="/moot-cup" className="text-xs font-semibold text-[#1E2A78] hover:text-[#00B4A6] inline-flex items-center gap-1">
                    Learn more <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        }
      />

      {/* 2. SPONSORS CONTINUOUS MARQUEE (PRD §15.1, §18.3) */}
      <SponsorStrip sponsors={sponsors} />

      {/* 3. KEY DATES & COUNTDOWN SHOWCASE (PRD §13, §15.1) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="double-bezel">
            <div className="double-bezel-inner p-8 sm:p-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-gray-100">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-[#FF6B35]" />
                    <span className="text-xs font-mono uppercase tracking-widest text-[#5A5A6E] font-semibold">
                      Synchronized Timeline
                    </span>
                  </div>
                  <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-[#1A1A2E] tracking-tight">
                    Key Conference Milestones
                  </h2>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="secondary" size="sm" href="/schedule">
                    Full Schedule Agenda
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-8">
                <div className="space-y-1 p-4 rounded-xl bg-[#F8F8FC] border border-gray-200/60">
                  <span className="text-xs font-mono font-bold text-[#FF6B35]">FEB 15, 2027</span>
                  <h4 className="font-heading font-bold text-sm text-[#1A1A2E]">Priority Registration Closes</h4>
                  <p className="text-xs text-[#5A5A6E]">Priority country &amp; committee matrix allocation cutoff.</p>
                </div>

                <div className="space-y-1 p-4 rounded-xl bg-[#F8F8FC] border border-gray-200/60">
                  <span className="text-xs font-mono font-bold text-[#00B4A6]">FEB 28, 2027</span>
                  <h4 className="font-heading font-bold text-sm text-[#1A1A2E]">Final Registration Deadline</h4>
                  <p className="text-xs text-[#5A5A6E]">Submission portal closes for individual delegates &amp; teams.</p>
                </div>

                <div className="space-y-1 p-4 rounded-xl bg-[#F8F8FC] border border-gray-200/60">
                  <span className="text-xs font-mono font-bold text-[#1E2A78]">MAR 05, 2027</span>
                  <h4 className="font-heading font-bold text-sm text-[#1A1A2E]">Memorial Submission</h4>
                  <p className="text-xs text-[#5A5A6E]">Moot Cup written memorial filing deadline via Resource Hub.</p>
                </div>

                <div className="space-y-1 p-4 rounded-xl bg-[#FFF0E8] border border-[#FF6B35]/30">
                  <span className="text-xs font-mono font-bold text-[#C84815]">MAR 18–21, 2027</span>
                  <h4 className="font-heading font-bold text-sm text-[#1A1A2E]">Conference Days</h4>
                  <p className="text-xs text-[#5A5A6E]">Opening Ceremony, Committee Sessions &amp; Grand Finals.</p>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* 4. INTERACTIVE FILTER & DOUBLE-BEZEL CARDS SHOWCASE (PRD §16.1, §16.2) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-[#00B4A6]" />
              <span className="text-xs font-mono uppercase tracking-widest text-[#5A5A6E] font-semibold">
                Curated Academic Tracks
              </span>
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-[#1A1A2E] tracking-tight">
              Committees &amp; Problem Categories
            </h2>
          </div>

          {/* Interactive FilterBar component */}
          <FilterBar
            options={[
              { label: 'All Arenas', value: 'all' },
              { label: 'GIMUN Committees', value: 'gimun' },
              { label: 'Moot Cup Categories', value: 'moot-cup' },
            ]}
            activeValue={activeTrack}
            onChange={(val) => setActiveTrack(val)}
          />
        </div>

        {/* Filtered Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(activeTrack === 'all' || activeTrack === 'gimun') &&
            committees.map((c) => (
              <ScrollReveal key={c.id}>
                <ContentCard
                  title={c.name}
                  description={c.shortDescription}
                  track="gimun"
                  eyebrow={c.type.replace('-', ' ')}
                  meta={`Capacity: ${c.capacity} Delegates`}
                  actionHref={`/gimun/committees/${c.slug}`}
                  actionLabel="View Matrix & Topics"
                  icon={<Globe2 className="w-5 h-5" />}
                />
              </ScrollReveal>
            ))}

          {(activeTrack === 'all' || activeTrack === 'moot-cup') &&
            mootCategories.map((m) => (
              <ScrollReveal key={m.id}>
                <ContentCard
                  title={m.name}
                  description={m.description}
                  track="moot-cup"
                  eyebrow={m.areaOfLaw}
                  meta={`Updated: ${m.lastUpdated}`}
                  actionHref="/moot-cup/rules"
                  actionLabel="Download Proposition"
                  updatedFlag={true}
                  icon={<Scale className="w-5 h-5" />}
                />
              </ScrollReveal>
            ))}
        </div>
      </section>

      {/* 5. SEARCH & RESOURCE PREVIEW (PRD §17.1 - Filter & Search components) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-[2rem] bg-[#1E2A78] text-white">
          <div className="max-w-2xl mx-auto text-center space-y-4 mb-8">
            <TrackBadge track="shared" size="md" />
            <h2 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight">
              Instant Document &amp; Resource Hub
            </h2>
            <p className="text-sm sm:text-base text-white/80 leading-relaxed">
              No more digging through email threads. Every background guide, parliamentary rule, compromise, and campus logistics guide is organized and downloadable in one place.
            </p>

            <div className="pt-2 max-w-lg mx-auto">
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search background guides, RoP, proposition..."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-white/10 text-left">
            <Link
              href="/resources"
              className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors group"
            >
              <FileText className="w-5 h-5 text-[#FF6B35] mb-2" />
              <h4 className="font-heading font-bold text-sm text-white group-hover:text-[#FF6B35]">
                Delegate Handbook 2027
              </h4>
              <p className="text-xs text-white/60">Full campus guide, security, and protocols (PDF 3.8 MB)</p>
            </Link>

            <Link
              href="/resources"
              className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors group"
            >
              <Globe2 className="w-5 h-5 text-[#FF6B35] mb-2" />
              <h4 className="font-heading font-bold text-sm text-white group-hover:text-[#FF6B35]">
                Rules of Procedure (RoP)
              </h4>
              <p className="text-xs text-white/60">Standard parliamentary debate mechanics (PDF 1.2 MB)</p>
            </Link>

            <Link
              href="/resources"
              className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors group"
            >
              <Scale className="w-5 h-5 text-[#00B4A6] mb-2" />
              <h4 className="font-heading font-bold text-sm text-white group-hover:text-[#00B4A6]">
                Moot Proposition &amp; OSCOLA
              </h4>
              <p className="text-xs text-white/60">Official compromise and citation handbook (PDF 2.4 MB)</p>
            </Link>
          </div>
        </div>
      </section>

      {/* 6. FAQ ACCORDION PREVIEW (PRD §18.1) */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center space-y-3 mb-8">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#5A5A6E] font-semibold">
            <ShieldCheck className="w-4 h-4 text-[#FF6B35]" />
            <span>Essential Answers</span>
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-[#1A1A2E] tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-[#5A5A6E]">
            Have inquiries regarding eligibility, registration, or on-campus accommodation?
          </p>
        </div>

        <Accordion items={faqItems} />

        <div className="mt-8 text-center">
          <Link
            href="/about/faq"
            className="text-xs font-semibold text-[#1E2A78] hover:text-[#FF6B35] inline-flex items-center gap-1 transition-colors"
          >
            Explore all FAQ categories (Registration, Rules, Logistics) <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* 7. DESIGN SYSTEM HARNESS: BUTTON & SKELETON COMPONENT SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="p-6 sm:p-8 rounded-2xl bg-gray-100/70 border border-gray-200/80 space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4 border-b border-gray-200/80 pb-4">
            <div>
              <span className="text-[11px] font-mono uppercase font-bold text-[#5A5A6E]">
                Phase 1 Component Verification Suite
              </span>
              <h3 className="font-heading font-bold text-lg text-[#1A1A2E]">
                UI Primitives &amp; Interactive Micro-States
              </h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setLightboxIndex(0);
                setLightboxOpen(true);
              }}
              icon={<ExternalLink className="w-3.5 h-3.5" />}
            >
              Test Lightbox Viewer
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Button Variants */}
            <div className="p-4 bg-white rounded-xl border border-gray-200 space-y-3">
              <span className="text-xs font-mono text-[#5A5A6E] block font-semibold">
                Button Primitive Variants:
              </span>
              <div className="flex flex-wrap gap-2">
                <Button variant="primary" size="sm">Primary</Button>
                <Button variant="secondary" size="sm">Secondary</Button>
                <Button variant="track-moot" size="sm">Teal Track</Button>
                <Button variant="ghost" size="sm">Ghost</Button>
              </div>
            </div>

            {/* Badges */}
            <div className="p-4 bg-white rounded-xl border border-gray-200 space-y-3">
              <span className="text-xs font-mono text-[#5A5A6E] block font-semibold">
                Track Badge Semantics:
              </span>
              <div className="flex flex-wrap gap-2 items-center">
                <TrackBadge track="gimun" />
                <TrackBadge track="moot-cup" />
                <TrackBadge track="shared" />
                <TrackBadge track="all" />
              </div>
            </div>

            {/* Skeleton Shimmer Preview */}
            <div className="p-4 bg-white rounded-xl border border-gray-200 space-y-2">
              <span className="text-xs font-mono text-[#5A5A6E] block font-semibold">
                Anti-Spinner Shimmer Placeholder:
              </span>
              <SkeletonLoader variant="text" lines={2} />
            </div>
          </div>
        </div>
      </section>

      {/* Lightbox Modal Instance */}
      <Lightbox
        isOpen={lightboxOpen}
        images={sampleGalleryImages}
        currentIndex={lightboxIndex}
        onClose={() => setLightboxOpen(false)}
        onNavigate={setLightboxIndex}
      />
    </div>
  );
}
