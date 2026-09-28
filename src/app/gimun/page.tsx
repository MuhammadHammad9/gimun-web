import type { Metadata } from 'next';
import { PageHero } from '@/components/ui/PageHero';
import { Button } from '@/components/ui/Button';
import { CtaBanner } from '@/components/ui/CtaBanner';
import { KeyDates } from '@/components/ui/KeyDates';
import { Bezel, Eyebrow, FactList, Ledger, PageSection, SectionHeading, Steps, TextLink } from '@/components/ui/Editorial';
import { getCommittees, getDocuments, getSiteConfig } from '@/lib/content';
import { constructMetadata } from '@/lib/metadata';
import { canRegister } from '@/lib/phase';
import { formatEventDate, getEventYear } from '@/lib/site-config';
import { formatDateRange } from '@/lib/utils';

export async function generateMetadata(): Promise<Metadata> {
  return await constructMetadata({
    title: `GIMUN ${getEventYear(await getSiteConfig())} | GIKI Model United Nations`,
    description: `Committees, format, fees and key dates for GIKI Model United Nations ${getEventYear(await getSiteConfig())}. Register on your own or as a delegation.`,
    path: '/gimun',
    image: '/images/og/gimun.jpg',
  });
}

const HOW_IT_WORKS = [
  {
    title: 'Receive a country',
    body: 'The secretariat assigns you a country and a committee. You research its foreign policy and represent it, whatever your own view.',
  },
  {
    title: 'Speak and caucus',
    body: 'Formal speeches from the speakers’ list, then moderated caucuses on specific sub-issues under tight time limits.',
  },
  {
    title: 'Build a bloc',
    body: 'In unmoderated time you negotiate with allies and rivals to assemble the votes a resolution needs.',
  },
  {
    title: 'Pass a resolution',
    body: 'Sponsor a draft, defend its operative clauses through amendments, and carry it to a final vote.',
  },
];

export default async function GimunOverviewPage() {
  const [committees, siteConfig, documents] = await Promise.all([getCommittees(), getSiteConfig(), getDocuments()]);
  const open = canRegister(siteConfig, 'gimun');
  const guides = documents.filter((d) => d.track === 'gimun' && d.type === 'background-guide');
  const rules = documents.find((d) => d.track === 'gimun' && d.type === 'rules');

  return (
    <div className="pb-24">
      <PageHero
        variant="gimun"
        eyebrow={<Eyebrow tone="crimson">Track 01 · Model United Nations</Eyebrow>}
        title="Represent a nation. Win the room."
        accentWords={['Win', 'the', 'room.']}
        description={`GIKI Model United Nations brings student delegates to Topi for ${committees.length} committees of debate, negotiation and crisis, ${formatDateRange(siteConfig.eventDates.start, siteConfig.eventDates.end)}.`}
        actions={[
          { label: open ? 'Register for GIMUN' : 'Registration status', href: '/register?track=gimun', variant: 'track-gimun' },
          { label: 'Browse committees', href: '/gimun/committees', variant: 'secondary' },
        ]}
        aside={
          <Bezel accent="gimun">
            <div className="p-7 sm:p-8">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-crimson-soft">At a glance</p>
              <FactList
                className="mt-4"
                items={[
                  { term: 'Committees', value: committees.map((c) => c.slug.toUpperCase()).join(' · ') },
                  { term: 'Format', value: 'Parliamentary debate and live crisis' },
                  { term: 'Enter as', value: 'An individual, or a delegation of 2–20' },
                  { term: 'Awards', value: 'Best Delegate, Outstanding Delegate, Best Delegation' },
                  { term: 'Registration closes', value: formatEventDate(siteConfig.registrationDeadlines.gimun) },
                ]}
              />
              {rules && (
                <TextLink href="/gimun/rules" className="mt-6">
                  Rules of procedure
                </TextLink>
              )}
            </div>
          </Bezel>
        }
      />

      <div className="space-y-28 pt-24 md:space-y-36">
        <PageSection labelledBy="how-heading">
          <SectionHeading
            id="how-heading"
            eyebrow="How it works"
            tone="crimson"
            title="Four days, one resolution"
            lead="First conference or fifteenth, the format is the same: represent your country, find allies, and get your text passed."
            className="mb-14"
          />
          <Steps steps={HOW_IT_WORKS} tone="crimson" />
        </PageSection>

        {/* Two ways in, each with its own price, so fees are read in context. */}
        <PageSection labelledBy="entry-heading">
          <SectionHeading
            id="entry-heading"
            eyebrow="Ways to enter"
            tone="crimson"
            title="On your own, or with your institution"
            className="mb-12"
          />
          <div className="grid gap-5 lg:grid-cols-2">
            <EntryPath
              label="Individual delegate"
              price={siteConfig.fees.gimunIndividual}
              priceNote="per delegate"
              body="For students applying on their own. Rank three committees; the secretariat allocates your country."
              points={['Three committee preferences', 'Eligible for individual awards', 'Delegate kit, meals and socials included']}
              action={{ label: open ? 'Register as an individual' : 'Registration status', href: '/register?track=gimun&type=individual', variant: 'track-gimun' }}
            />
            <EntryPath
              label="Institutional delegation"
              price={siteConfig.fees.gimunDelegationPerDelegate}
              priceNote="per delegate"
              body="A head delegate or faculty advisor registers the whole team, 2 to 20 delegates, in one form."
              points={['One form for the full roster', 'Contends for Best Delegation', 'One invoice for the institution']}
              action={{ label: open ? 'Register a delegation' : 'Registration status', href: '/register?track=gimun&type=delegation', variant: 'secondary' }}
            />
          </div>
          <p className="mt-6 max-w-3xl text-sm leading-relaxed text-text-3">
            Nothing is charged when you apply. If your application is accepted, the organizing team emails an invoice
            with bank transfer details. On-campus accommodation is available on request.{' '}
            <TextLink href="/about/faq#fees" className="inline-flex">
              Fees and refunds
            </TextLink>
          </p>
        </PageSection>

        <KeyDates
          title="GIMUN key dates"
          dates={[
            { label: 'Registration closes', date: siteConfig.registrationDeadlines.gimun, note: '23:59 Pakistan time' },
            { label: 'Position papers due', note: 'At least 7 days before Day 1' },
            { label: 'Conference opens', date: siteConfig.eventDates.start, note: 'Check-in from 09:00' },
            { label: 'Awards gala', date: siteConfig.galaDate },
          ]}
        />

        <PageSection labelledBy="committees-heading" className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <SectionHeading
              stacked
              id="committees-heading"
              eyebrow="Committees"
              tone="crimson"
              title={`${committees.length} chambers for ${getEventYear(siteConfig)}`}
              lead="Each committee page has its agenda, background guide and the countries still open for allocation."
              action={{ label: 'All committees', href: '/gimun/committees' }}
            />
            {guides.length > 0 && (
              <p className="mt-8 text-sm text-text-3">
                {guides.length} background guides are in the{' '}
                <TextLink href="/resources" className="inline-flex">
                  Resource Hub
                </TextLink>
              </p>
            )}
          </div>
          <Ledger
            tone="crimson"
            rows={committees.map((com) => ({
              key: com.id,
              href: `/gimun/committees/${com.slug}`,
              title: com.name,
              description: com.shortDescription,
              meta: [com.capacity ? `${com.capacity} delegates` : 'Open seating', com.type.replace(/-/g, ' ')],
            }))}
          />
        </PageSection>

        <PageSection>
          <CtaBanner
            eyebrow={open ? 'Registration open' : undefined}
            title="Ready to take a seat?"
            description="Applications are reviewed on a rolling basis, so earlier applicants have more committees and countries to choose from."
            footnote="No payment is taken online"
            actions={[
              { label: open ? 'Register for GIMUN' : 'Registration status', href: '/register?track=gimun', variant: 'track-gimun' },
              { label: 'Rules of procedure', href: '/gimun/rules', variant: 'secondary' },
            ]}
          />
        </PageSection>
      </div>
    </div>
  );
}

function EntryPath({
  label,
  price,
  priceNote,
  body,
  points,
  action,
}: {
  label: string;
  price: string;
  priceNote: string;
  body: string;
  points: string[];
  action: { label: string; href: string; variant: 'track-gimun' | 'secondary' };
}) {
  return (
    <Bezel accent="gimun">
      <div className="flex h-full flex-col p-8 sm:p-10">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-crimson-soft">{label}</p>
        <p className="mt-6 flex items-baseline gap-2">
          <span className="text-4xl font-display font-medium tracking-tight text-text tabular-nums">{price}</span>
          <span className="text-sm text-text-4">{priceNote}</span>
        </p>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-text-3">{body}</p>
        <ul className="mt-6 space-y-2.5">
          {points.map((point) => (
            <li key={point} className="flex gap-3 text-sm text-text-2">
              <span aria-hidden="true" className="mt-2 h-1 w-3 shrink-0 rounded-full bg-crimson-soft" />
              {point}
            </li>
          ))}
        </ul>
        <div className="mt-auto pt-8">
          <Button variant={action.variant} href={action.href} withArrow>
            {action.label}
          </Button>
        </div>
      </div>
    </Bezel>
  );
}
