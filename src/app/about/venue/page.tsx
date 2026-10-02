import type { Metadata } from 'next';
import { Check } from 'lucide-react';
import { RouteArt } from '@frontend/components/art/LineArt';
import { LiveArt } from '@frontend/components/art/LiveArt';
import { TransitionLink as Link } from '@frontend/components/motion/TransitionLink';
import { ChapterHead } from '@frontend/components/sections/Chapter';
import { ChapterRail } from '@frontend/components/story/ChapterRail';
import { Steps } from '@frontend/components/sections/Steps';
import { MapFacade } from '@frontend/components/ui/MapFacade';
import { PageHero } from '@frontend/components/ui/PageHero';
import { getCopy, getDocuments, getSiteConfig } from '@backend/lib/content';
import { chapterNumbers, fill, nextSteps } from '@shared/lib/copy';
import { constructMetadata } from '@frontend/lib/metadata';
import { formatDateRange } from '@frontend/lib/utils';
import { NextSteps } from '@frontend/components/story/NextSteps';

export async function generateMetadata(): Promise<Metadata> {
  return await constructMetadata({
    title: 'Venue & Travel | GIMUN & GMC',
    path: '/about/venue',
    description:
      'Getting to GIKI in Topi, where each session is held, accommodation, what to bring and who to call during the conference.',
  });
}

const MAPS_QUERY = 'Ghulam Ishaq Khan Institute of Engineering Sciences and Technology, Topi';

export default async function VenuePage() {
  const [site, documents, copy] = await Promise.all([getSiteConfig(), getDocuments(), getCopy('venue')]);
  const hero = copy('venue-hero');
  const travel = copy('venue-travel');
  const places = copy('venue-places');
  const practical = copy('venue-practical');
  const help = copy('venue-help');
  const next = copy('venue-next');
  const chapter = chapterNumbers(copy, ['venue-travel', 'venue-places', 'venue-practical', 'venue-help']);
  const vars = {
    host: site.hostInstitution,
    entry: site.entryRequirement || 'Bring a photo ID and your QR ticket to the main gate.',
    desk: site.checkinDesk || 'The registration desk is staffed throughout the conference.',
  };
  const packing = fill(practical.body, vars).split('\n').map((line) => line.trim()).filter(Boolean);
  const campusMap = documents.find((d) => d.type === 'map');

  return (
    <>
      <ChapterRail />
      <PageHero
        variant="utility"
        breadcrumbs={[{ label: 'About', href: '/about' }, { label: 'Venue & travel' }]}
        meta={[formatDateRange(site.eventDates.start, site.eventDates.end), 'Topi, Swabi District']}
        title={fill(hero.title, vars)}
        accentPhrase={hero.accentPhrase}
        description={fill(hero.lead, vars)}
        actionsSlot={
          campusMap ? (
            <a href={campusMap.fileUrl} className="text-link" data-no-transition="">
              Campus map ({campusMap.fileFormat}, {campusMap.fileSize})
            </a>
          ) : undefined
        }
        art={
          <LiveArt className="mx-auto hidden w-full max-w-[18rem] text-champagne opacity-50 lg:block">
            <RouteArt live className="w-full" />
          </LiveArt>
        }
      />

      {/* Getting there */}
      <section className="handoff__sheet tone-deep chapter chapter--flush-top" aria-labelledby="travel-title">
        <div className="wrap steps-split">
          <div className="steps-split__head">
            <ChapterHead
              id="travel-title"
              chapter={chapter['venue-travel']}
              act={travel.kicker}
              split={false}
              title={fill(travel.title, vars)}
              lead={fill(travel.lead, vars)}
            />
          </div>
          <Steps steps={(travel.items ?? []).map((item) => ({ title: fill(item.title, vars), body: fill(item.body, vars) }))} accent="gmc" />
        </div>
      </section>

      {/* The places the programme uses */}
      {!places.hidden && (
      <section className="chapter" aria-labelledby="where-title">
        <div className="wrap">
          <ChapterHead id="where-title" chapter={chapter['venue-places']} act={places.kicker} title={fill(places.title, vars)} lead={site.venue} />
          <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
            <MapFacade query={MAPS_QUERY} title="Map of the GIKI campus in Topi" address={site.hostInstitution} />
            <div>
              <dl className="border-b border-line">
                {(places.items ?? []).map((place) => (
                  <div key={place.title} className="grid gap-1 border-t border-line py-4 sm:grid-cols-[13rem_1fr] sm:gap-6">
                    <dt className="font-display font-medium text-text">{fill(place.title, vars)}</dt>
                    <dd className="text-sm leading-relaxed text-text-2">{fill(place.body, vars)}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-6 text-sm text-text-3">
                Rooms are confirmed in the{' '}
                <Link href="/schedule" className="text-link">
                  schedule
                </Link>
                ; changes during the event appear on{' '}
                <Link href="/announcements" className="text-link">
                  Announcements
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* Before you travel */}
      {!practical.hidden && (
      <section className="sheet tone-inverse" aria-labelledby="practical-title">
        <div className="sheet__ground" aria-hidden="true" />
        <div className="wrap">
          <ChapterHead id="practical-title" chapter={chapter['venue-practical']} act={practical.kicker} title={fill(practical.title, vars)} lead={fill(practical.lead, vars)} />
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <dl className="space-y-8">
              {(practical.items ?? []).map((item) => (
                <div key={item.title}>
                  <dt className="font-display text-lg font-medium text-text">{fill(item.title, vars)}</dt>
                  <dd className="mt-2 text-sm leading-relaxed text-text-2">{fill(item.body, vars)}</dd>
                </div>
              ))}
            </dl>
            <div>
              <h3 className="text-meta font-mono uppercase text-text-2">{fill(practical.note, vars) || 'What to bring'}</h3>
              <ul className="mt-4 border-b border-line">
                {packing.map((item) => (
                  <li key={item} className="flex items-start gap-3 border-t border-line py-3 text-sm text-text">
                    <Check aria-hidden="true" strokeWidth={1.75} className="mt-0.5 size-4 shrink-0 text-champagne" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* Help during the event */}
      {!help.hidden && (
      <section className="chapter" aria-labelledby="help-title">
        <div className="wrap">
          <ChapterHead
            id="help-title"
            chapter={chapter['venue-help']}
            act={help.kicker}
            title={fill(help.title, vars)}
            lead={fill(help.lead, vars)}
          >
            <div className="flex flex-col gap-2">
              {site.contactPhone && (
                <a href={`tel:${site.contactPhone.replace(/[^\d+]/g, '')}`} className="font-mono text-lg text-text">
                  {site.contactPhone}
                </a>
              )}
              <a href={`mailto:${site.contactEmails.general}`} className="text-link w-fit">
                {site.contactEmails.general}
              </a>
            </div>
          </ChapterHead>
        </div>
      </section>
      )}
      {!next.hidden && <NextSteps steps={nextSteps(next, vars)} />}
    </>
  );
}
