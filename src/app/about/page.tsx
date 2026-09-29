import type { Metadata } from 'next';
import { PageHero } from '@/components/ui/PageHero';
import { CtaBanner } from '@/components/ui/CtaBanner';
import { PublishedStats } from '@/components/ui/PublishedStats';
import { Bezel, Eyebrow, FactList, Ledger, PageSection, SectionHeading, TextLink } from '@/components/ui/Editorial';
import { getCommittees, getMootCategories, getSchedule, getSiteConfig } from '@/lib/content';
import { constructMetadata } from '@/lib/metadata';
import { canRegister } from '@/lib/phase';
import { formatEventDate, getEventYear } from '@/lib/site-config';
import { formatDateRange } from '@/lib/utils';

export async function generateMetadata(): Promise<Metadata> {
  return await constructMetadata({
    title: `About GIMUN & GMC ${getEventYear(await getSiteConfig())}`,
    path: '/about',
    description:
      'What GIMUN and the GIKI Moot Court are, how the four days fit together, and who runs them at GIK Institute in Topi.',
  });
}

export default async function AboutOverviewPage() {
  const [site, committees, categories, schedule] = await Promise.all([
    getSiteConfig(),
    getCommittees(),
    getMootCategories(),
    getSchedule(),
  ]);
  const gimunOpen = canRegister(site, 'gimun');
  const mootOpen = canRegister(site, 'mootCup');
  const anyOpen = gimunOpen || mootOpen;

  // One line per conference day, taken from the published schedule.
  const days = Array.from(new Set(schedule.map((s) => s.day)))
    .sort((a, b) => a - b)
    .map((day) => {
      const sessions = schedule.filter((s) => s.day === day);
      const label = sessions[0]?.dayLabel ?? `Day ${day}`;
      const highlights = sessions
        .filter((s) => !/lunch|check-out|press/i.test(s.title))
        .slice(0, 3)
        .map((s) => s.title);
      return { day, label, highlights };
    });

  return (
    <div className="pb-24">
      <PageHero
        variant="utility"
        eyebrow={<Eyebrow>About the event</Eyebrow>}
        title="Two competitions, one campus, four days"
        accentWords={['one', 'campus,']}
        description={`GIMUN and the GIKI Moot Court run side by side at ${site.hostInstitution.split(',')[0]}, ${formatDateRange(site.eventDates.start, site.eventDates.end)}. Delegates debate in committee; law students argue before a bench. Both share the ceremonies, meals and evenings.`}
        actions={[
          { label: 'Explore GIMUN', href: '/gimun', variant: 'track-gimun' },
          { label: 'Explore GMC', href: '/moot-cup', variant: 'track-moot' },
        ]}
      />

      <div className="space-y-28 pt-24 md:space-y-36">
        {site.stats?.length ? (
          <PageSection labelledBy="stats-heading">
            <SectionHeading id="stats-heading" eyebrow="At a glance" title="In numbers" className="mb-10" />
            <PublishedStats stats={site.stats} />
          </PageSection>
        ) : null}

        <PageSection labelledBy="tracks-heading">
          <SectionHeading
            id="tracks-heading"
            eyebrow="The two tracks"
            title="Pick the one you want to be tested in"
            lead="They share dates and a campus, but the preparation, the rules and the judging are entirely different."
            className="mb-12"
          />
          <div className="grid gap-5 lg:grid-cols-2">
            <Bezel accent="gimun">
              <div className="flex h-full flex-col p-8 sm:p-10">
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent-gimun">Model United Nations</p>
                <h3 className="mt-4 text-2xl font-display font-medium text-text">{site.eventNames.gimun}</h3>
                <p className="mt-3 text-sm leading-relaxed text-text-3">
                  Delegates represent countries across {committees.length} committees, negotiate in caucus and vote
                  resolutions through. Enter on your own or with your institution.
                </p>
                <FactList
                  className="mt-8"
                  items={[
                    { term: 'Committees', value: committees.map((c) => c.slug.toUpperCase()).join(' · ') },
                    { term: 'Awards', value: 'Best Delegate, Outstanding Delegate, Best Delegation' },
                    { term: 'Closes', value: formatEventDate(site.registrationDeadlines.gimun) },
                  ]}
                />
                <TextLink href="/gimun" className="mt-auto pt-8">
                  GIMUN track
                </TextLink>
              </div>
            </Bezel>
            <Bezel>
              <div className="flex h-full flex-col p-8 sm:p-10">
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-champagne">Moot court</p>
                <h3 className="mt-4 text-2xl font-display font-medium text-text">{site.eventNames.mootCup}</h3>
                <p className="mt-3 text-sm leading-relaxed text-text-3">
                  Teams of law students write memorials for both sides of one problem, then argue oral rounds before
                  benches of practitioners, through to a Grand Final.
                </p>
                <FactList
                  className="mt-8"
                  items={[
                    { term: 'Categories', value: `${categories.length} areas of law` },
                    { term: 'Awards', value: 'Champions, Best Memorial, Best Oralist' },
                    { term: 'Closes', value: formatEventDate(site.registrationDeadlines.mootCup) },
                  ]}
                />
                <TextLink href="/moot-cup" className="mt-auto pt-8">
                  GMC track
                </TextLink>
              </div>
            </Bezel>
          </div>
        </PageSection>

        <PageSection labelledBy="days-heading" className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <SectionHeading
              stacked
              id="days-heading"
              eyebrow="The four days"
              title="How the week fits together"
              lead="Committees and courtrooms run in parallel; ceremonies, meals and evenings are shared."
              action={{ label: 'Full schedule', href: '/schedule' }}
            />
          </div>
          <ol className="rise-stagger border-b border-line">
            {days.map((d, i) => (
              <li
                key={d.day}
                style={{ '--i': i } as React.CSSProperties}
                className="grid gap-2 border-t border-line py-6 sm:grid-cols-[10rem_1fr] sm:gap-6"
              >
                <p className="font-display font-medium text-text">{d.label.split('—')[0].trim()}</p>
                <div>
                  <p className="text-sm text-text-4">{d.label.split('—')[1]?.trim()}</p>
                  <ul className="mt-2 space-y-1 text-sm text-text-2">
                    {d.highlights.map((h) => (
                      <li key={h}>{h}</li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ol>
        </PageSection>

        <PageSection labelledBy="more-heading" className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <SectionHeading
              stacked
              id="more-heading"
              eyebrow="Run by students"
              title="Organized at GIKI"
              lead="The secretariat, the moot convening committee and the logistics team are GIKI students. Registration is free to submit; accepted participants pay by bank transfer, never on this site."
            />
          </div>
          <Ledger
            rows={[
              { key: 'team', href: '/about/team', title: 'Organizing team', description: 'Who runs each track, and how to reach them.', meta: ['People'] },
              { key: 'venue', href: '/about/venue', title: 'Venue & travel', description: 'Getting to Topi, where each session happens, and what to bring.', meta: ['Logistics'] },
              { key: 'faq', href: '/about/faq', title: 'Frequently asked questions', description: 'Fees, refunds, accommodation, dress code and more.', meta: ['Help'] },
              { key: 'sponsors', href: '/about/sponsors', title: 'Sponsors & partners', description: 'Supporting organizations and the sponsorship deck.', meta: ['Partners'] },
              { key: 'contact', href: '/contact', title: 'Contact', description: site.replyTime || 'Questions to the organizing team.', meta: ['Support'] },
            ]}
          />
        </PageSection>

        <PageSection>
          <CtaBanner
            eyebrow={anyOpen ? 'Applications open' : undefined}
            title="Represent your institution at GIKI"
            description="Choose a track to see its fees, format and deadlines. Applying is free; you pay only once accepted."
            footnote="No payment is taken online"
            actions={[
              { label: gimunOpen ? 'Apply for GIMUN' : 'GIMUN registration status', href: '/register?track=gimun', variant: 'track-gimun' },
              { label: mootOpen ? 'Register a GMC team' : 'GMC registration status', href: '/register?track=moot-cup', variant: 'track-moot' },
            ]}
          />
        </PageSection>
      </div>
    </div>
  );
}
