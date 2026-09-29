import type { Metadata } from 'next';
import { TransitionLink as Link } from '@/components/motion/TransitionLink';
import { PageHero } from '@/components/ui/PageHero';
import { getCopy, getSiteConfig } from '@/lib/content';
import { fill } from '@/lib/copy';
import { constructMetadata } from '@/lib/metadata';
import { getEventYear } from '@/lib/site-config';
import { AnalyticsChoiceButton } from './AnalyticsChoiceButton';
import '@/styles/pages/privacy.css';

export async function generateMetadata(): Promise<Metadata> {
  return await constructMetadata({
    title: `Privacy & Data Handling | GIMUN & GMC ${getEventYear(await getSiteConfig())}`,
    description: 'How GIMUN & GMC handles registration, contact, accessibility, and event-operations data.',
    path: '/privacy',
  });
}

const CONTENTS = [
  { id: 'collect', label: 'What we collect' },
  { id: 'use', label: 'How it is used' },
  { id: 'services', label: 'Services that process your data' },
  { id: 'analytics', label: 'Analytics and browser storage' },
  { id: 'retention', label: 'Retention and requests' },
];

export default async function PrivacyPage() {
  const copy = await getCopy('privacy');
  const hero = copy('privacy-hero');
  const collectCopy = copy('privacy-collect');
  const useCopy = copy('privacy-use');
  const servicesCopy = copy('privacy-services');
  // The on-page contents follow any edited section titles.
  const edited: Record<string, string | undefined> = { collect: collectCopy.title, use: useCopy.title, services: servicesCopy.title };
  const contents = CONTENTS.map((item) => ({ ...item, label: fill(edited[item.id]) || item.label }));
  const site = await getSiteConfig();

  return (
    <>
      <PageHero
        variant="utility"
        meta={['Public data notice', site.privacyNotice ? 'Approved notice' : 'Draft notice']}
        title={fill(hero.title)}
        accentPhrase={hero.accentPhrase}
        description={fill(hero.lead)}
        footnote={
          site.privacyNotice
            ? undefined
            : 'This is a draft. Institutional retention and legal-contact terms are pending approval.'
        }
      />

      <section className="handoff__sheet tone-deep chapter chapter--flush-top" aria-label="Privacy notice">
        <div className="wrap grid gap-12 lg:grid-cols-[14rem_minmax(0,44rem)] lg:gap-20">
          <nav aria-label="On this page" className="lg:sticky lg:top-32 lg:self-start">
            <p className="text-meta font-mono uppercase text-text-3">On this page</p>
            <ol className="mt-4 space-y-2.5 text-sm">
              {contents.map((item) => (
                <li key={item.id}>
                  <a href={`#${item.id}`} className="text-text-2 transition-colors hover:text-text">
                    {item.label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="prose-notice space-y-14">
            {site.privacyNotice && <p className="whitespace-pre-wrap text-base leading-relaxed text-text-2">{site.privacyNotice}</p>}

            <section id="collect" className="scroll-mt-28 space-y-3">
              <h2 className="font-display text-2xl font-medium text-text">{fill(collectCopy.title)}</h2>
              <p>{fill(collectCopy.body)}</p>
            </section>

            <section id="use" className="scroll-mt-28 space-y-3">
              <h2 className="font-display text-2xl font-medium text-text">{fill(useCopy.title)}</h2>
              <p>{fill(useCopy.body)}</p>
            </section>

            <section id="services" className="scroll-mt-28 space-y-3">
              <h2 className="font-display text-2xl font-medium text-text">{fill(servicesCopy.title)}</h2>
              <dl className="divide-y divide-line border-y border-line">
                {(servicesCopy.items ?? []).map((item) => (
                  <div key={item.title} className="grid gap-1 py-4 sm:grid-cols-[8rem_1fr] sm:gap-6">
                    <dt className="font-medium text-text">{fill(item.title)}</dt>
                    <dd>{fill(item.body)}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <section id="analytics" className="scroll-mt-28 space-y-3">
              <h2 className="font-display text-2xl font-medium text-text">Analytics and browser storage</h2>
              <p>
                Google Analytics runs only if you choose Allow in the analytics prompt; it then sets cookies to count
                visits, with IP anonymisation. Without your consent no analytics script is loaded. The site also keeps a
                few small preferences in your browser: whether you dismissed the announcement bar, your light or dark
                theme, and your analytics choice. <AnalyticsChoiceButton />.
              </p>
            </section>

            <section id="retention" className="scroll-mt-28 space-y-3">
              <h2 className="font-display text-2xl font-medium text-text">Retention and requests</h2>
              <p>
                Event staff keep records only for as long as administration, audit and required institutional reporting
                need them. To ask for a record to be corrected or deleted, write to the organizing team through the{' '}
                <Link className="text-link" href="/contact">
                  contact page
                </Link>
                .
              </p>
            </section>
          </div>
        </div>
      </section>
    </>
  );
}
