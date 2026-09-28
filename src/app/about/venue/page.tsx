import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowUpRight,
  Backpack,
  Bus,
  Car,
  CloudSun,
  Download,
  Landmark,
  Phone,
  Plane,
  ShieldCheck,
} from 'lucide-react';
import { constructMetadata } from '@/lib/metadata';
import { getDocuments, getSiteConfig } from '@/lib/content';
import { PageHero } from '@/components/ui/PageHero';
import { formatDateRange } from '@/lib/utils';

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
    icon: Car,
    title: 'By road',
    body: 'From Islamabad or Peshawar take the M-1 Motorway to the Swabi interchange, then follow signs to Topi and GIKI. Allow about 90 minutes from Islamabad.',
  },
  {
    icon: Plane,
    title: 'By air',
    body: 'Islamabad International Airport is the nearest airport, roughly 110 km away. Continue by road via the M-1.',
  },
  {
    icon: Bus,
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
  const site = await getSiteConfig();
  const documents = await getDocuments();
  const campusMap = documents.find((d) => d.type === 'map');

  return (
    <div className="pb-24">
      <PageHero
        variant="utility"
        breadcrumbs={[{ label: 'About', href: '/about' }, { label: 'Venue & travel' }]}
        title="Venue & travel"
        accentWords={['travel']}
        description={`${formatDateRange(site.eventDates.start, site.eventDates.end)} at ${site.hostInstitution}. How to get there, where each session happens and what to bring.`}
        actions={[
          {
            label: 'Open in Google Maps',
            href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(MAPS_QUERY)}`,
            variant: 'primary',
          },
          ...(campusMap ? [{ label: 'Campus map (PDF)', href: campusMap.fileUrl, variant: 'secondary' as const }] : []),
        ]}
      />

      <div className="mx-auto max-w-7xl space-y-24 px-4 pt-16 sm:px-6 lg:px-8">
        {/* Map and the places the programme uses */}
        <section aria-labelledby="where-heading" className="grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
          <div className="self-start overflow-hidden rounded-2xl border border-line bg-raised">
            <iframe
              title="Map of the GIKI campus in Topi"
              src={`https://maps.google.com/maps?q=${encodeURIComponent(MAPS_QUERY)}&z=15&output=embed`}
              className="block aspect-[4/3] w-full grayscale-[35%]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <div>
            <h2 id="where-heading" className="text-h2 font-display font-medium text-text">
              Where everything happens
            </h2>
            <p className="mt-4 max-w-md text-lead text-text-3">{site.venue}</p>
            <dl className="mt-8 border-b border-line">
              {PLACES.map((place) => (
                <div key={place.name} className="grid gap-1 border-t border-line py-4 sm:grid-cols-[12rem_1fr] sm:gap-6">
                  <dt className="font-display font-medium text-text">{place.name}</dt>
                  <dd className="text-sm leading-relaxed text-text-3">{place.use}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-sm text-text-4">
              Room numbers are confirmed in the{' '}
              <Link href="/schedule" className="text-champagne underline underline-offset-4">
                schedule
              </Link>
              ; changes during the event appear on{' '}
              <Link href="/announcements" className="text-champagne underline underline-offset-4">
                Announcements
              </Link>
              .
            </p>
          </div>
        </section>

        {/* Getting there */}
        <section aria-labelledby="travel-heading">
          <h2 id="travel-heading" className="text-h2 font-display font-medium text-text">
            Getting to GIKI
          </h2>
          <div className="mt-10 grid gap-x-10 gap-y-10 md:grid-cols-3">
            {ROUTES.map(({ icon: Icon, title, body }) => (
              <div key={title} className="border-t border-line pt-6">
                <Icon aria-hidden="true" className="h-5 w-5 text-champagne" />
                <h3 className="mt-4 text-lg font-display font-medium text-text">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-text-3">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Practicalities */}
        <section aria-labelledby="practical-heading" className="grid gap-12 lg:grid-cols-2">
          <div>
            <h2 id="practical-heading" className="text-h2 font-display font-medium text-text">
              Before you travel
            </h2>
            <div className="mt-8 space-y-8">
              <Fact icon={Landmark} title="Accommodation">
                On-campus hostel places, with separate wings for male and female participants, are
                available on request. Ask for accommodation in your application; places and any charge
                are confirmed when you are accepted.
              </Fact>
              <Fact icon={ShieldCheck} title="Campus entry">
                {site.entryRequirement ||
                  'Bring a photo ID and your QR ticket to the main gate.'}{' '}
                Delegations arriving by bus should send the vehicle number to the organizing team in
                advance.
              </Fact>
              <Fact icon={CloudSun} title="Weather in March">
                Topi is usually mild in the day and cool at night in March, roughly 10–25°C. Pack a
                warm layer for evening events.
              </Fact>
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-raised p-8 sm:p-10">
            <h3 className="flex items-center gap-2 text-lg font-display font-medium text-text">
              <Backpack aria-hidden="true" className="h-5 w-5 text-champagne" />
              What to bring
            </h3>
            <ul className="mt-6 space-y-3">
              {PACKING.map((item) => (
                <li key={item} className="flex gap-3 text-sm text-text-2">
                  <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-champagne" />
                  {item}
                </li>
              ))}
            </ul>
            {campusMap && (
              <a
                href={campusMap.fileUrl}
                className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-champagne underline-offset-4 hover:underline"
              >
                <Download aria-hidden="true" className="h-4 w-4" />
                Download the campus map ({campusMap.fileSize})
              </a>
            )}
          </div>
        </section>

        {/* Help during the event */}
        <section
          aria-labelledby="help-heading"
          className="flex flex-col gap-6 rounded-2xl border border-line-2 p-8 sm:flex-row sm:items-center sm:justify-between sm:p-10"
        >
          <div className="max-w-xl">
            <h2 id="help-heading" className="flex items-center gap-2 text-xl font-display font-medium text-text">
              <Phone aria-hidden="true" className="h-5 w-5 text-champagne" />
              Help during the conference
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-text-3">
              {site.checkinDesk || 'The registration desk is staffed throughout the conference.'} For
              anything urgent, contact the organizing team.
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-2 text-sm">
            {site.contactPhone && (
              <a href={`tel:${site.contactPhone.replace(/[^\d+]/g, '')}`} className="font-mono text-lg text-text hover:text-champagne">
                {site.contactPhone}
              </a>
            )}
            <a href={`mailto:${site.contactEmails.general}`} className="inline-flex items-center gap-1.5 text-champagne hover:text-text">
              {site.contactEmails.general}
              <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}

function Fact({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-4">
      <Icon aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-champagne" />
      <div>
        <h3 className="font-display font-medium text-text">{title}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-text-3">{children}</p>
      </div>
    </div>
  );
}
