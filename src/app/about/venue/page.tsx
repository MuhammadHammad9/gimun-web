import type { Metadata } from 'next';
import { Check } from 'lucide-react';
import { RouteArt } from '@/components/art/LineArt';
import { TransitionLink as Link } from '@/components/motion/TransitionLink';
import { ChapterHead } from '@/components/sections/Chapter';
import { ChapterIndex } from '@/components/story/ChapterIndex';
import { Steps } from '@/components/sections/Steps';
import { MapFacade } from '@/components/ui/MapFacade';
import { PageHero } from '@/components/ui/PageHero';
import { getDocuments, getSiteConfig } from '@/lib/content';
import { constructMetadata } from '@/lib/metadata';
import { formatDateRange } from '@/lib/utils';
import { NextSteps } from '@/components/story/NextSteps';

export async function generateMetadata(): Promise<Metadata> {
  return await constructMetadata({
    title: 'Venue & Travel | GIMUN & GMC',
    path: '/about/venue',
    description:
      'Getting to GIKI in Topi, where each session is held, accommodation, what to bring and who to call during the conference.',
  });
}

const MAPS_QUERY = 'Ghulam Ishaq Khan Institute of Engineering Sciences and Technology, Topi';

// Only places the programme actually uses, described plainly. Capacities and
// equipment are left out until the organizing team confirms them.
const PLACES = [
  {
    name: 'AHA Auditorium',
    use: 'Check-in, opening ceremony, GMC Grand Final, closing ceremony and awards gala',
  },
  {
    name: 'Academic Block, Rooms 201–208',
    use: 'GIMUN committee sessions',
  },
  {
    name: 'Academic Block moot courtrooms',
    use: 'GMC preliminary rounds, quarter-finals and semi-finals',
  },
  {
    name: 'Central dining hall',
    use: 'Lunch and tea on conference days',
  },
  {
    name: 'Student hostels',
    use: 'On-campus accommodation for outstation participants, on request',
  },
];

const ROUTES = [
  {
    title: 'By road',
    body: 'From Islamabad or Peshawar take the M-1 Motorway to the Swabi interchange, then follow signs to Topi and GIKI. Allow about 90 minutes from Islamabad.',
  },
  {
    title: 'By air',
    body: 'Islamabad International Airport is the nearest airport, roughly 110 km away. Continue by road via the M-1.',
  },
  {
    title: 'By coach',
    body: 'Intercity coaches run to Swabi from Islamabad, Rawalpindi, Peshawar and Lahore. Any group transport arranged by the organizers is announced on the Announcements page.',
  },
];

const PACKING = [
  'Photo ID (CNIC, B-Form or student card)',
  'QR ticket from your confirmation email',
  'Formal clothing for sessions and ceremonies',
  'Laptop or notebook, and a charger',
  'Position paper or memorial materials',
  'A warm layer for the evenings',
];

export default async function VenuePage() {
  const [site, documents] = await Promise.all([getSiteConfig(), getDocuments()]);
  const campusMap = documents.find((d) => d.type === 'map');

  return (
    <>
      <ChapterIndex />
      <PageHero
        variant="utility"
        breadcrumbs={[{ label: 'About', href: '/about' }, { label: 'Venue & travel' }]}
        meta={[formatDateRange(site.eventDates.start, site.eventDates.end), 'Topi, Swabi District']}
        title="Getting to Topi."
        accentPhrase="Topi."
        description={`The event is held at ${site.hostInstitution}. How to get there, where each session happens and what to bring.`}
        actionsSlot={
          campusMap ? (
            <a href={campusMap.fileUrl} className="text-link" data-no-transition="">
              Campus map ({campusMap.fileFormat}, {campusMap.fileSize})
            </a>
          ) : undefined
        }
        art={<RouteArt className="mx-auto hidden w-full max-w-[18rem] text-champagne opacity-50 lg:block" />}
      />

      {/* Getting there */}
      <section className="handoff__sheet tone-deep chapter chapter--flush-top" aria-labelledby="travel-title">
        <div className="wrap steps-split">
          <div className="steps-split__head">
            <ChapterHead
              id="travel-title"
              chapter={1}
              act="The road"
              split={false}
              title="Three ways in."
              lead="GIKI sits just off the M-1 between Islamabad and Peshawar. Most participants arrive by road."
            />
          </div>
          <Steps steps={ROUTES} accent="gmc" />
        </div>
      </section>

      {/* The places the programme uses */}
      <section className="chapter" aria-labelledby="where-title">
        <div className="wrap">
          <ChapterHead id="where-title" chapter={2} act="The places" title="Where everything happens." lead={site.venue} />
          <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
            <MapFacade query={MAPS_QUERY} title="Map of the GIKI campus in Topi" address={site.hostInstitution} />
            <div>
              <dl className="border-b border-line">
                {PLACES.map((place) => (
                  <div key={place.name} className="grid gap-1 border-t border-line py-4 sm:grid-cols-[13rem_1fr] sm:gap-6">
                    <dt className="font-display font-medium text-text">{place.name}</dt>
                    <dd className="text-sm leading-relaxed text-text-2">{place.use}</dd>
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

      {/* Before you travel */}
      <section className="sheet tone-inverse" aria-labelledby="practical-title">
        <div className="sheet__ground" aria-hidden="true" />
        <div className="wrap">
          <ChapterHead id="practical-title" chapter={3} act="Before you travel" title="Before you travel." lead="Accommodation, getting through the gate, the weather, and a list to pack against." />
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <dl className="space-y-8">
              <div>
                <dt className="font-display text-lg font-medium text-text">Accommodation</dt>
                <dd className="mt-2 text-sm leading-relaxed text-text-2">
                  On-campus hostel places, with separate wings for male and female participants, are available on request.
                  Ask for accommodation in your application; places and any charge are confirmed when you are accepted.
                </dd>
              </div>
              <div>
                <dt className="font-display text-lg font-medium text-text">Campus entry</dt>
                <dd className="mt-2 text-sm leading-relaxed text-text-2">
                  {site.entryRequirement || 'Bring a photo ID and your QR ticket to the main gate.'} Delegations arriving by
                  bus should send the vehicle number to the organizing team in advance.
                </dd>
              </div>
              <div>
                <dt className="font-display text-lg font-medium text-text">Weather in March</dt>
                <dd className="mt-2 text-sm leading-relaxed text-text-2">
                  Topi is usually mild in the day and cool at night in March, roughly 10–25°C. Pack a warm layer for evening
                  events.
                </dd>
              </div>
            </dl>
            <div>
              <h3 className="text-meta font-mono uppercase text-text-2">What to bring</h3>
              <ul className="mt-4 border-b border-line">
                {PACKING.map((item) => (
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

      {/* Help during the event */}
      <section className="chapter" aria-labelledby="help-title">
        <div className="wrap">
          <ChapterHead
            id="help-title"
            chapter={4}
            act="On the day"
            title="Help during the conference."
            lead={`${site.checkinDesk || 'The registration desk is staffed throughout the conference.'} For anything urgent, contact the organizing team.`}
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
      <NextSteps
        steps={[
          { href: '/schedule', title: 'The schedule', body: 'Which room, at what time, on each day.' },
          { href: '/about/faq', title: 'FAQ', body: 'Accommodation, dress code and refunds.' },
          { href: '/register', title: 'Register', body: 'Apply for GIMUN or the GIKI Moot Court.' },
        ]}
      />
    </>
  );
}
