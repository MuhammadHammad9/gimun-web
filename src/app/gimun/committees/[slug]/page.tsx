import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCommittees, getCommitteeBySlug } from '@/lib/content';

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
  if (!committee) return { title: 'Committee Not Found' };

  return {
    title: `${committee.name} | GIMUN 2026`,
    description: committee.shortDescription,
  };
}

export default async function CommitteeDetailPage({ params }: CommitteePageProps) {
  const { slug } = await params;
  const committee = getCommitteeBySlug(slug);

  if (!committee) {
    notFound();
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-10">
      <nav className="text-xs font-mono text-neutral-gray flex items-center gap-2">
        <Link href="/gimun" className="hover:text-ink">GIMUN</Link>
        <span>/</span>
        <Link href="/gimun/committees" className="hover:text-ink">Committees</Link>
        <span>/</span>
        <span className="text-ink font-semibold">{committee.name}</span>
      </nav>

      <header className="space-y-4">
        <span className="px-3 py-1 text-xs font-mono uppercase bg-orange-50 text-accent border border-orange-200 rounded-full">
          {committee.type.replace('-', ' ')}
        </span>
        <h1 className="text-3xl md:text-5xl font-heading font-bold text-ink">
          {committee.name}
        </h1>
        <p className="text-lg text-neutral-gray leading-relaxed">
          {committee.shortDescription}
        </p>
      </header>

      <section className="space-y-6">
        <h2 className="text-2xl font-heading font-bold text-ink">Agenda Topics</h2>
        <div className="space-y-4">
          {committee.topics.map((topic, i) => (
            <div key={i} className="p-6 rounded-card bg-surface-elevated border border-whisper-border shadow-card space-y-2">
              <span className="text-xs font-mono text-accent font-semibold uppercase">Topic {i + 1}</span>
              <h3 className="text-xl font-heading font-semibold text-ink">{topic}</h3>
              <p className="text-sm text-neutral-gray">{committee.topicDescriptions[i] || ''}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-heading font-bold text-ink">Country Matrix & Availability</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {committee.countryList.map((c, idx) => (
            <div
              key={idx}
              className="p-3 rounded-button bg-surface-elevated border border-whisper-border flex items-center justify-between text-xs"
            >
              <span className="font-medium text-ink">{c.country}</span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] uppercase font-mono font-semibold ${
                  c.status === 'available'
                    ? 'bg-emerald-50 text-emerald-700'
                    : c.status === 'assigned'
                    ? 'bg-slate-100 text-slate-500'
                    : 'bg-amber-50 text-amber-700'
                }`}
              >
                {c.status}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
