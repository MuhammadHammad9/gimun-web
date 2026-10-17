import type { Metadata } from 'next';
import { constructMetadata } from '@/lib/metadata';
import { getCopy, getSiteConfig } from '@/lib/content';
import { fill } from '@/lib/copy';
import { TransitionLink as Link } from '@/components/motion/TransitionLink';
import { PageHero } from '@/components/ui/PageHero';
import { Bezel } from '@/components/ui/Editorial';
import { CurrentTierNote, FeeTiers } from '@/components/registration/FeeTiers';
import { formsFor, RegistrationForms } from '@/components/registration/RegistrationForms';
import { PaymentDetails } from '@/components/registration/PaymentDetails';
import { ContactDirectory, contactsFor } from '@/components/registration/ContactDirectory';
import { StickyStack } from '@/components/motion/StickyStack';
import { canRegister, serverRenderTime, type RegistrationTrack } from '@/lib/phase';
import { formatEventDate, getEventYear } from '@/lib/site-config';
import { formatDateRange } from '@/lib/utils';
import type { SiteConfig } from '@/lib/types';
import type { Copy, CopyReader } from '@/lib/copy';
import bundledSiteData from '../../../content/site.json';
import bundledCopyData from '../../../content/copy.json';

export async function generateMetadata(): Promise<Metadata> {
  return await constructMetadata({
    title: `Register | GIMUN & GMC ${getEventYear(await getSiteConfig())}`,
    description:
      'Register for GIMUN 26 (delegate, delegation or observer) or GMC VII (team or observer), apply as a chair, ambassador or judge, and see the fee tiers and payment details.',
    path: '/register',
  });
}

export default async function RegisterPage() {
  const [publishedSite, copy] = await Promise.all([getSiteConfig(), getCopy('register')]);
  const bundledSite = bundledSiteData as SiteConfig;
  const sameEdition = publishedSite.eventDates.start === bundledSite.eventDates.start
    && publishedSite.eventDates.end === bundledSite.eventDates.end;
  const deadlines = sameEdition
    ? {
        gimun: publishedSite.registrationDeadlines.gimun > publishedSite.eventDates.end
          ? bundledSite.registrationDeadlines.gimun
          : publishedSite.registrationDeadlines.gimun,
        mootCup: publishedSite.registrationDeadlines.mootCup > publishedSite.eventDates.end
          ? bundledSite.registrationDeadlines.mootCup
          : publishedSite.registrationDeadlines.mootCup,
      }
    : publishedSite.registrationDeadlines;
  // Older published settings predate these fields. Keep explicit CMS values (including
  // intentionally empty ones), but restore omitted 2026 details from this edition's bundle.
  const site: SiteConfig = sameEdition
    ? {
        ...publishedSite,
        registrationDeadlines: deadlines,
        registrationForms: publishedSite.registrationForms ?? bundledSite.registrationForms,
        paymentInstructions: publishedSite.paymentInstructions ?? bundledSite.paymentInstructions,
        contacts: publishedSite.contacts ?? bundledSite.contacts,
      }
    : publishedSite;
  const now = serverRenderTime();
  const publishedHero = copy('register-hero');
  const bundledHero = bundledCopyData.find((entry) => entry.id === 'register-hero') as Copy | undefined;
  const legacyHero = /QR ticket|invoice with bank details|pay only if you are accepted/i.test(
    [publishedHero.lead, ...(publishedHero.items ?? []).map((item) => item.body)].join(' '),
  );
  const hero = legacyHero
    ? bundledHero ?? publishedHero
    : publishedHero;
  const payment = copy('register-payment');
  const before = copy('register-before');
  const help = copy('register-contacts');

  return (
    <div className="pb-24">
      <PageHero
        meta={[formatDateRange(site.eventDates.start, site.eventDates.end), 'GIK Institute, Topi', 'Registration via official forms']}
        title={fill(hero.title)}
        accentPhrase={hero.accentPhrase}
        description={fill(hero.lead)}
        aside={
          <ol className="steps" style={{ '--step-accent': 'var(--color-champagne)' } as React.CSSProperties}>
            {(hero.items ?? []).map(({ title, body }, i) => (
              <li key={title} className="step !py-5">
                <span className="step__num !text-[1.75rem]" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <h2 className="step__title !text-[1.125rem]">{title}</h2>
                  <p className="step__body !mt-1 text-small">{body}</p>
                </div>
              </li>
            ))}
          </ol>
        }
      />

      <div className="mx-auto flex max-w-6xl flex-col gap-20 px-4 pt-4 sm:px-6">
        <TrackOverview site={site} now={now} />
        <TrackSection site={site} copy={copy} track="gimun" now={now} />
        <TrackSection site={site} copy={copy} track="mootCup" now={now} />

        <section id="pricing" aria-labelledby="pricing-title" className="scroll-mt-28">
          <h2 id="pricing-title" className="font-display text-h2 font-medium text-text">Registration fees</h2>
          <p className="mt-3 max-w-2xl text-text-2">
            {site.feeTiers
              ? 'GIMUN and GMC each have their own Early Bird, Normal, and Late rates. The highlighted tier applies now.'
              : 'The live pricing settings do not include tier amounts. These bundled 2026 rates are a reference; confirm current fees before paying.'}
          </p>
          <div className="mt-10 space-y-14">
            <section id="pricing-gimun" aria-labelledby="pricing-gimun-title" className="scroll-mt-28">
              <p className="font-mono text-xs uppercase tracking-[0.16em] text-accent-gimun">Model United Nations</p>
              <h3 id="pricing-gimun-title" className="mt-2 font-display text-h3 font-medium text-text">GIMUN fees</h3>
              <FeeTiers className="mt-6" site={site} track="gimun" now={now} />
            </section>
            <section id="pricing-gmc" aria-labelledby="pricing-gmc-title" className="scroll-mt-28">
              <p className="font-mono text-xs uppercase tracking-[0.16em] text-champagne">Moot Court</p>
              <h3 id="pricing-gmc-title" className="mt-2 font-display text-h3 font-medium text-text">GMC fees</h3>
              <FeeTiers className="mt-6" site={site} track="mootCup" now={now} />
            </section>
          </div>
        </section>

        <section id="payment" aria-labelledby="payment-title" className="scroll-mt-28">
          <h2 id="payment-title" className="font-display text-h3 font-medium text-text">{payment.title}</h2>
          {payment.lead && <p className="mt-3 max-w-2xl text-text-2">{payment.lead}</p>}
          {sameEdition && !publishedSite.paymentInstructions && site.paymentInstructions && (
            <p className="mt-3 max-w-2xl text-small text-text-3">These bundled 2026 account details are a reference. Confirm them with the registration team before transferring funds.</p>
          )}
          <PaymentDetails instructions={site.paymentInstructions} className="mt-6 max-w-3xl" />
        </section>

        {!before.hidden && (
          <section id="before" aria-labelledby="before-title" className="scroll-mt-28">
            <h2 id="before-title" className="font-display text-h3 font-medium text-text">{before.title}</h2>
            {before.lead && <p className="mt-3 max-w-2xl text-text-2">{before.lead}</p>}
            <dl className="mt-6 grid gap-6 sm:grid-cols-2">
              {(before.items ?? []).map((item) => (
                <div key={item.title} className="rounded-2xl border border-line-2 p-5">
                  <dt className="font-medium text-text">{item.title}</dt>
                  <dd className="mt-2 whitespace-pre-line text-small text-text-2">{item.body}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {!help.hidden && (
          <section id="registration-contacts" aria-labelledby="contacts-title" className="scroll-mt-28">
            <h2 id="contacts-title" className="font-display text-h3 font-medium text-text">{help.title}</h2>
            {help.lead && <p className="mt-3 max-w-2xl text-text-2">{help.lead}</p>}
            <StickyStack className="director-stack" minWidth={1024}>
              <ContactDirectory track="gimun" stackIndex={0} contacts={contactsFor(site, { track: 'gimun', group: 'registrations' })} />
              <ContactDirectory track="gmc" stackIndex={1} contacts={contactsFor(site, { track: 'moot-cup', group: 'registrations' })} />
            </StickyStack>
            <p className="mt-8 text-sm text-text-3">
              More questions? Read the{' '}
              <Link href="/about/faq" className="text-link">FAQ</Link> or{' '}
              <Link href="/contact" className="text-link">contact the host team</Link>.
            </p>
          </section>
        )}
      </div>
    </div>
  );
}

function TrackOverview({ site, now }: { site: SiteConfig; now: number }) {
  const tracks = [
    {
      id: 'gimun',
      name: 'Model United Nations',
      label: 'Track 01 · GIMUN',
      description: 'Register as an individual delegate, a delegation, or an observer.',
      deadline: site.registrationDeadlines.gimun,
      open: canRegister(site, 'gimun', now),
      links: [{ label: 'Track overview', href: '/gimun' }, { label: 'Committees', href: '/gimun/committees' }],
    },
    {
      id: 'moot-cup',
      name: 'GIKI Moot Court',
      label: 'Track 02 · GMC',
      description: 'Register a competing team or attend the rounds as an observer.',
      deadline: site.registrationDeadlines.mootCup,
      open: canRegister(site, 'mootCup', now),
      links: [{ label: 'Track overview', href: '/moot-cup' }, { label: 'Rules & memorials', href: '/moot-cup/rules' }],
    },
  ] as const;

  return (
    <nav aria-label="Choose a competition" className="grid gap-5 md:grid-cols-2">
      {tracks.map((track) => (
        <Bezel key={track.id} accent={track.id === 'gimun' ? 'gimun' : 'moot'}>
          <div className="flex h-full flex-col p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className={`font-mono text-xs uppercase tracking-[0.16em] ${track.id === 'gimun' ? 'text-accent-gimun' : 'text-champagne'}`}>{track.label}</span>
              <span className="text-xs text-text-3">{track.open ? `Closes ${formatEventDate(track.deadline, { month: 'short' })}` : 'Registration closed'}</span>
            </div>
            <h2 className="mt-5 font-display text-h3 font-medium text-text">{track.name}</h2>
            <p className="mt-2 text-small text-text-2">{track.description}</p>
            <a href={`#${track.id}`} className="mt-7 inline-flex min-h-11 items-center font-semibold text-text underline decoration-line-3 underline-offset-4 hover:decoration-current">
              {track.open ? 'View registration forms' : 'View track details'}
            </a>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-text-3">
              {track.links.map((link) => <Link key={link.href} href={link.href} className="hover:text-text hover:underline">{link.label}</Link>)}
            </div>
          </div>
        </Bezel>
      ))}
    </nav>
  );
}

function TrackSection({ site, copy, track, now }: { site: SiteConfig; copy: CopyReader; track: RegistrationTrack; now: number }) {
  const formTrack = track === 'gimun' ? 'gimun' : 'moot-cup';
  const section = copy(track === 'gimun' ? 'register-gimun' : 'register-moot');
  const open = canRegister(site, track, now);
  const registration = formsFor(site, formTrack, 'registration');
  const applications = formsFor(site, formTrack, 'application');
  const accent = track === 'gimun' ? 'text-accent-gimun' : 'text-champagne';

  return (
    <section id={formTrack} aria-labelledby={`${formTrack}-title`} className="scroll-mt-28">
      <p className={`font-mono text-[0.75rem] uppercase tracking-[0.16em] ${accent}`}>{section.kicker}</p>
      <h2 id={`${formTrack}-title`} className="mt-2 font-display text-h2 font-medium text-text">{section.title}</h2>
      {section.lead && <p className="mt-3 max-w-2xl text-lead text-text-2">{section.lead}</p>}

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div>
          <h3 className="font-medium text-text">Register</h3>
          {open ? (
            <>
              <CurrentTierNote site={site} track={track} now={now} className="mt-2" />
              <RegistrationForms className="mt-4" forms={registration} track={formTrack} primary />
            </>
          ) : (
            <p className="mt-2 text-small text-text-2">
              Registration is closed{isPast(site.registrationDeadlines[track], now) ? ` (the deadline was ${formatEventDate(site.registrationDeadlines[track])})` : ''}.
            </p>
          )}
          {applications.length > 0 && (
            <>
              <h3 className="mt-10 font-medium text-text">{section.note ?? 'Apply to join the team'}</h3>
              <RegistrationForms className="mt-4" forms={applications} track={formTrack} />
            </>
          )}
        </div>
        <div>
          <h3 className="font-medium text-text">Instructions</h3>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-small text-text-2 marker:text-text-4">
            {(section.items ?? []).map((item) => (
              <li key={item.title}>{item.title}</li>
            ))}
          </ul>
        </div>
      </div>

    </section>
  );
}

function isPast(iso: string, now: number) {
  return now > new Date(`${iso}T23:59:59+05:00`).getTime();
}
