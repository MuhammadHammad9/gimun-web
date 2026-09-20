import { getSiteConfig } from '@/lib/content';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { TrackBadge } from '@/components/ui/TrackBadge';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { CountryMatrix } from '@/components/ui/CountryMatrix';
import { Download, ArrowLeft } from 'lucide-react';
import { getCommittees, getCommitteeBySlug, getDocuments } from '@/lib/content';

import { constructMetadata } from '@/lib/metadata';
import { getEventYear } from '@/lib/site-config';

interface CommitteePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const committees = (await getCommittees());
  return committees.map((c) => ({
    slug: c.slug,
  }));
}

export async function generateMetadata({ params }: CommitteePageProps): Promise<Metadata> {
  const { slug } = await params;
  const committee = (await getCommitteeBySlug(slug));
  if (!committee) {
    return (await constructMetadata({
      title: `Committee Not Found | GIMUN ${getEventYear(await getSiteConfig())}`,
      path: `/gimun/committees/${slug}`,
    }));
  }

  return (await constructMetadata({
    title: `${committee.name} | GIMUN ${getEventYear(await getSiteConfig())} Committee Dossier`,
    description: committee.shortDescription,
    path: `/gimun/committees/${slug}`,
  }));
}

export default async function CommitteeDetailPage({ params }: CommitteePageProps) {
  const { slug } = await params;
  const committee = (await getCommitteeBySlug(slug));

  if (!committee) {
    notFound();
  }

  const documents = (await getDocuments());
  const backgroundGuide = documents.find((d) => d.id === committee.backgroundGuideDocId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'GIMUN', href: '/gimun' },
          { label: 'Committees', href: '/gimun/committees' },
          { label: committee.slug.toUpperCase() },
        ]}
      />

      {/* Header Dossier */}
      <header className="space-y-4 max-w-4xl">
        <div className="flex flex-wrap items-center gap-2.5">
          <TrackBadge track="gimun" />
          <span className="px-3 py-0.5 rounded-full text-xs font-mono uppercase font-semibold bg-champagne/20 text-cream border border-champagne/30">
            {committee.type.replace('-', ' ')}
          </span>
          <span className="text-xs font-mono text-champagne/70">
            Allocation Cap: {committee.capacity ? `${committee.capacity} Delegates` : 'Open'}
          </span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-cream tracking-tight">
          {committee.name}
        </h1>

        <p className="text-base sm:text-lg text-champagne/80 leading-relaxed">
          {committee.shortDescription}
        </p>

        <div className="pt-2 flex flex-wrap items-center gap-4">
          <Button
            variant="track-gimun"
            href={`/register?track=gimun&committee=${committee.slug}`}
          >
            Apply for this Committee
          </Button>
          {backgroundGuide && (
            <Button
              variant="secondary"
              href={backgroundGuide.fileUrl}
              icon={<Download className="w-4 h-4" />}
            >
              Background Guide ({backgroundGuide.fileSize})
            </Button>
          )}
        </div>
      </header>

      {/* Agenda Topics Detailed Breakdown */}
      <section className="space-y-6">
        <div className="border-b border-champagne/20 pb-3">
          <span className="text-xs font-mono uppercase tracking-widest text-champagne/80 font-bold">
            Substantive Agenda
          </span>
          <h2 className="text-2xl font-heading font-bold text-cream mt-0.5">
            Committee Topics &amp; Dossiers
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {committee.topics.map((topic, i) => (
            <div key={i} className="double-bezel">
              <div className="double-bezel-inner p-6 sm:p-8 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-champagne">Agenda Topic {i + 1}</span>
                  <span className="text-champagne/70">Formal Debate</span>
                </div>
                <h3 className="font-heading font-bold text-lg sm:text-xl text-cream leading-snug">
                  {topic}
                </h3>
                <p className="text-xs sm:text-sm text-champagne/80 leading-relaxed">
                  {committee.topicDescriptions[i] ||
                    'Detailed background guide and clause drafting guidelines are published in the official committee dossier.'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Dais Leadership */}
      <section className="space-y-6">
        <div className="border-b border-champagne/20 pb-3">
          <span className="text-xs font-mono uppercase tracking-widest text-champagne/80 font-bold">
            Adjudication &amp; Governance
          </span>
          <h2 className="text-2xl font-heading font-bold text-cream mt-0.5">
            Dais Leadership
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {committee.chairs.map((chair, idx) => (
            <div key={idx} className="p-6 rounded-2xl bg-overlay/85 border border-champagne/25 shadow-xl space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-brand text-champagne border border-champagne/30 flex items-center justify-center font-heading font-bold text-base shadow-xs">
                  {chair.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </div>
                <div>
                  <h3 className="font-heading font-bold text-base text-cream">{chair.name}</h3>
                  <p className="text-xs font-mono text-champagne font-medium">{chair.role}</p>
                </div>
              </div>
              {chair.bio && <p className="text-xs text-champagne/80 leading-relaxed">{chair.bio}</p>}
            </div>
          ))}
        </div>
      </section>

      {/* Country Allocation Matrix */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-champagne/20 pb-3">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-champagne/80 font-bold">
              Portfolio Allocations
            </span>
            <h2 className="text-2xl font-heading font-bold text-cream mt-0.5">
              Live Country Allocation Matrix
            </h2>
          </div>
          <p className="text-xs text-champagne/70">
            Country assignments are confirmed upon Dais review. Portfolios marked Available may be requested in your registration preferences.
          </p>
        </div>

        <CountryMatrix countryList={committee.countryList} />
      </section>

      {/* Bottom Navigation */}
      <div className="pt-8 border-t border-champagne/20 flex flex-col sm:flex-row items-center justify-between gap-4">
        <Link
          href="/gimun/committees"
          className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-champagne hover:text-cream transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Committees</span>
        </Link>

        <Button
          variant="track-gimun"
          href={`/register?track=gimun&committee=${committee.slug}`}
        >
          Proceed to Registration
        </Button>
      </div>
    </div>
  );
}
