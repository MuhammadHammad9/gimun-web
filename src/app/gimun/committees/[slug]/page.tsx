import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { TrackBadge } from '@/components/ui/TrackBadge';
import { CountryMatrix } from '@/components/ui/CountryMatrix';
import { Download, ArrowLeft } from 'lucide-react';
import { getCommittees, getCommitteeBySlug, getDocuments } from '@/lib/content';

interface CommitteePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const committees = getCommittees();
  return committees.map((c) => ({
    slug: c.slug,
  }));
}

export async function generateMetadata({ params }: CommitteePageProps): Promise<Metadata> {
  const { slug } = await params;
  const committee = getCommitteeBySlug(slug);
  if (!committee) return { title: 'Committee Not Found | GIMUN 2027' };

  return {
    title: `${committee.name} | GIMUN 2027 Committee Dossier`,
    description: committee.shortDescription,
  };
}

export default async function CommitteeDetailPage({ params }: CommitteePageProps) {
  const { slug } = await params;
  const committee = getCommitteeBySlug(slug);

  if (!committee) {
    notFound();
  }

  const documents = getDocuments();
  const backgroundGuide = documents.find((d) => d.id === committee.backgroundGuideDocId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs font-mono text-[#5A5A6E]">
        <Link href="/" className="hover:text-[#1A1A2E]">
          Home
        </Link>
        <span>/</span>
        <Link href="/gimun" className="hover:text-[#1A1A2E]">
          GIMUN
        </Link>
        <span>/</span>
        <Link href="/gimun/committees" className="hover:text-[#1A1A2E]">
          Committees
        </Link>
        <span>/</span>
        <span className="text-[#FF6B35] font-semibold">{committee.slug.toUpperCase()}</span>
      </nav>

      {/* Header Dossier */}
      <header className="space-y-4 max-w-4xl">
        <div className="flex flex-wrap items-center gap-2.5">
          <TrackBadge track="gimun" />
          <span className="px-3 py-0.5 rounded-full text-xs font-mono uppercase font-semibold bg-[#FFF0E8] text-[#FF6B35] border border-[#FF6B35]/20">
            {committee.type.replace('-', ' ')}
          </span>
          <span className="text-xs font-mono text-[#5A5A6E]">
            Allocation Cap: {committee.capacity ? `${committee.capacity} Delegates` : 'Open'}
          </span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-[#1A1A2E] tracking-tight">
          {committee.name}
        </h1>

        <p className="text-base sm:text-lg text-[#5A5A6E] leading-relaxed">
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
        <div className="border-b border-gray-100 pb-3">
          <span className="text-xs font-mono uppercase tracking-widest text-[#FF6B35] font-bold">
            Substantive Agenda
          </span>
          <h2 className="text-2xl font-heading font-bold text-[#1A1A2E] mt-0.5">
            Committee Topics &amp; Dossiers
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {committee.topics.map((topic, i) => (
            <div key={i} className="double-bezel">
              <div className="double-bezel-inner p-6 sm:p-8 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-[#FF6B35]">Agenda Topic {i + 1}</span>
                  <span className="text-[#5A5A6E]">Formal Debate</span>
                </div>
                <h3 className="font-heading font-bold text-lg sm:text-xl text-[#1A1A2E] leading-snug">
                  {topic}
                </h3>
                <p className="text-xs sm:text-sm text-[#5A5A6E] leading-relaxed">
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
        <div className="border-b border-gray-100 pb-3">
          <span className="text-xs font-mono uppercase tracking-widest text-[#1E2A78] font-bold">
            Adjudication &amp; Governance
          </span>
          <h2 className="text-2xl font-heading font-bold text-[#1A1A2E] mt-0.5">
            Dais Leadership
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {committee.chairs.map((chair, idx) => (
            <div key={idx} className="p-6 rounded-2xl bg-[#F8F8FC] border border-gray-200/80 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#1E2A78] text-white flex items-center justify-center font-heading font-bold text-base shadow-xs">
                  {chair.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </div>
                <div>
                  <h3 className="font-heading font-bold text-base text-[#1A1A2E]">{chair.name}</h3>
                  <p className="text-xs font-mono text-[#FF6B35] font-medium">{chair.role}</p>
                </div>
              </div>
              {chair.bio && <p className="text-xs text-[#5A5A6E] leading-relaxed">{chair.bio}</p>}
            </div>
          ))}
        </div>
      </section>

      {/* Country Allocation Matrix */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-gray-100 pb-3">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-[#FF6B35] font-bold">
              Portfolio Allocations
            </span>
            <h2 className="text-2xl font-heading font-bold text-[#1A1A2E] mt-0.5">
              Live Country Allocation Matrix
            </h2>
          </div>
          <p className="text-xs text-[#5A5A6E]">
            Country assignments are confirmed upon Dais review. Portfolios marked Available may be requested in your registration preferences.
          </p>
        </div>

        <CountryMatrix countryList={committee.countryList} />
      </section>

      {/* Bottom Navigation */}
      <div className="pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <Link
          href="/gimun/committees"
          className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-[#1E2A78] hover:text-[#FF6B35] transition-colors"
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
