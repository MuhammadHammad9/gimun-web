import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { TransitionLink as Link } from '@/components/motion/TransitionLink';
import { ChapterHead } from '@/components/sections/Chapter';
import { Closing } from '@/components/sections/Closing';
import { ChapterIndex } from '@/components/story/ChapterIndex';
import { COMMITTEE_TYPE, seatsOpen } from '@/components/sections/Placards';
import { Steps } from '@/components/sections/Steps';
import { Button } from '@/components/ui/Button';
import { CountryMatrix } from '@/components/ui/CountryMatrix';
import { PageHero } from '@/components/ui/PageHero';
import { getCommitteeBySlug, getCommittees, getDocuments, getSiteConfig } from '@/lib/content';
import { constructMetadata } from '@/lib/metadata';
import { canRegister } from '@/lib/phase';
import { formatEventDate, getEventYear } from '@/lib/site-config';

interface CommitteePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CommitteePageProps): Promise<Metadata> {
  const { slug } = await params;
  const committee = await getCommitteeBySlug(slug);
  const year = getEventYear(await getSiteConfig());
  if (!committee) {
    return await constructMetadata({ title: `Committee Not Found | GIMUN ${year}`, path: `/gimun/committees/${slug}` });
  }
  return await constructMetadata({
    title: `${committee.name} | GIMUN ${year} Committee`,
    description: committee.shortDescription,
    path: `/gimun/committees/${committee.slug}`,
  });
}

export async function generateStaticParams() {
  const committees = await getCommittees();
  return committees.map((c) => ({ slug: c.slug }));
}

export default async function CommitteeDetailPage({ params }: CommitteePageProps) {
  const { slug } = await params;
  const [committee, committees, site, documents] = await Promise.all([getCommitteeBySlug(slug), getCommittees(), getSiteConfig(), getDocuments()]);
  if (!committee) notFound();
  // Old links may use the internal id (com-unsc); send them to the one canonical URL.
  if (committee.slug !== slug) permanentRedirect(`/gimun/committees/${committee.slug}`);

  const open = canRegister(site, 'gimun');
  // Only a real background guide; never another document type under that label.
  const guide = documents.find((d) => d.id === committee.backgroundGuideDocId && d.type === 'background-guide');
  const total = committee.countryList?.length ?? 0;
  const index = committees.findIndex((c) => c.slug === committee.slug);
  const previous = index > 0 ? committees[index - 1] : undefined;
  const next = index >= 0 && index < committees.length - 1 ? committees[index + 1] : undefined;
  const apply = { label: open ? `Apply for ${committee.slug.toUpperCase()}` : 'Registration status', href: `/register?track=gimun&committee=${committee.slug}` };

  return (
    <>
      <ChapterIndex />
      <PageHero
        variant="gimun"
        breadcrumbs={[
          { label: 'GIMUN', href: '/gimun' },
          { label: 'Committees', href: '/gimun/committees' },
          { label: committee.slug.toUpperCase() },
        ]}
        meta={[COMMITTEE_TYPE[committee.type] ?? 'Committee', total ? `${seatsOpen(committee)} of ${total} seats open` : 'Open seating']}
        title={committee.name}
        description={committee.shortDescription}
        actionsSlot={
          <div className="flex flex-wrap items-center gap-3">
            <Button href={apply.href} variant="track-gimun" size="lg" withArrow>
              {apply.label}
            </Button>
            {guide && (
              <a href={guide.fileUrl} className="text-link" data-no-transition="">
                Background guide ({guide.fileSize}, revised {formatEventDate(guide.versionDate, { month: 'short' })})
              </a>
            )}
          </div>
        }
        art={
          <p className="committee-mark" aria-hidden="true">
            {committee.slug.toUpperCase()}
          </p>
        }
      />

      <section className="handoff__sheet tone-deep chapter" aria-labelledby="agenda-title">
        <div className="wrap steps-split">
          <div className="steps-split__head">
            <ChapterHead
              id="agenda-title"
              chapter={1}
              act="The agenda"
              split={false}
              title="The agenda."
              lead="The topics debated in this committee, in the order the chairs will open them."
            />
          </div>
          <Steps
            accent="gimun"
            steps={committee.topics.map((topic, i) => ({
              title: topic,
              body: committee.topicDescriptions[i] || 'The background guide sets out the questions a resolution should answer.',
            }))}
          />
        </div>
      </section>

      <section className="chapter" aria-labelledby="chairs-title">
        <div className="wrap">
          <ChapterHead id="chairs-title" chapter={2} act="The chairs" title="The chairs." />
          {committee.chairs.length === 0 ? (
            <p className="max-w-2xl text-lead text-text-2">The chairs for this committee will be announced with country allocations.</p>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {committee.chairs.map((chair) => (
                <li key={chair.name} className="glance">
                  <p className="font-display text-[1.375rem] font-medium text-text">{chair.name}</p>
                  <p className="mt-1 font-mono text-[0.8125rem] text-text-3">{chair.role}</p>
                  {chair.bio && <p className="mt-4 text-small text-text-2">{chair.bio}</p>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="chapter chapter--flush-top" aria-labelledby="seats-title">
        <div className="wrap">
          <ChapterHead
            id="seats-title"
            chapter={3}
            act="The seats"
            title="Country allocation."
            lead="Seats marked available can be requested in your registration preferences. The secretariat confirms every allocation after review."
          />
          <CountryMatrix countryList={committee.countryList} />
        </div>
      </section>

      <Closing
        id="seat-title"
        chapter={4}
        act="Take a seat"
        title={`Take a seat in ${committee.slug.toUpperCase()}.`}
        lead="Rank this committee among your three preferences when you apply. The secretariat allocates countries after reviewing every application."
        actions={[
          { ...apply, variant: 'track-gimun' },
          { label: 'All committees', href: '/gimun/committees', variant: 'secondary' },
        ]}
      />

      <nav aria-label="Other committees" className="chapter chapter--flush-top">
        <div className="wrap grid gap-4 border-t border-line pt-10 sm:grid-cols-2">
          {previous ? (
            <Link href={`/gimun/committees/${previous.slug}`} className="committee-step">
              <ArrowLeft aria-hidden="true" strokeWidth={1.75} className="size-4" />
              <span>
                <span className="committee-step__label">Previous committee</span>
                <span className="committee-step__name">{previous.name}</span>
              </span>
            </Link>
          ) : (
            <Link href="/gimun/committees" className="committee-step">
              <ArrowLeft aria-hidden="true" strokeWidth={1.75} className="size-4" />
              <span>
                <span className="committee-step__label">Back to</span>
                <span className="committee-step__name">All committees</span>
              </span>
            </Link>
          )}
          {next && (
            <Link href={`/gimun/committees/${next.slug}`} className="committee-step committee-step--next">
              <span>
                <span className="committee-step__label">Next committee</span>
                <span className="committee-step__name">{next.name}</span>
              </span>
              <ArrowRight aria-hidden="true" strokeWidth={1.75} className="size-4" />
            </Link>
          )}
        </div>
      </nav>
    </>
  );
}
