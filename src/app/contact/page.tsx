import type { Metadata } from 'next';
import { TransitionLink as Link } from '@frontend/components/motion/TransitionLink';
import { ContactFormFromUrl } from '@frontend/components/forms/ContactForm';
import { CopyButton } from '@frontend/components/ui/CopyButton';
import { PageHero } from '@frontend/components/ui/PageHero';
import { getCopy, getSiteConfig } from '@backend/lib/content';
import { fill } from '@shared/lib/copy';
import { constructMetadata } from '@frontend/lib/metadata';
import { getEventYear } from '@shared/lib/site-config';

export async function generateMetadata(): Promise<Metadata> {
  return await constructMetadata({
    title: `Contact the Organizing Team | GIMUN & GMC ${getEventYear(await getSiteConfig())}`,
    path: '/contact',
    description:
      'Questions about GIMUN committees, the GMC case problem, partnerships or getting to GIKI: write to the organizing team.',
  });
}

export default async function ContactPage() {
  const copy = await getCopy('contact');
  const hero = copy('contact-hero');
  const config = await getSiteConfig();
  const inboxes = [
    { label: 'General questions', email: config.contactEmails.general },
    { label: 'GIMUN secretariat', email: config.contactEmails.gimun },
    { label: 'GMC organizers', email: config.contactEmails.mootCup },
    { label: 'Sponsorship and media', email: config.contactEmails.sponsorship },
  ].filter((inbox): inbox is { label: string; email: string } => Boolean(inbox.email));
  const socials = (
    [
      ['Instagram', config.socialLinks?.instagram],
      ['Facebook', config.socialLinks?.facebook],
      ['LinkedIn', config.socialLinks?.linkedin],
      ['X (Twitter)', config.socialLinks?.twitter],
    ] as const
  ).filter(([, href]) => href);

  return (
    <>
      <PageHero
        variant="utility"
        meta={[config.replyTime || 'Replies from the organizing team', 'GIKI, Topi']}
        title={fill(hero.title)}
        accentPhrase={hero.accentPhrase}
        description={fill(hero.lead)}
        actionsSlot={
          <Link href="/about/faq" className="text-link">
            Check the FAQ first
          </Link>
        }
      />

      <section className="handoff__sheet tone-deep chapter chapter--flush-top" aria-label="Contact">
        <div className="wrap grid items-start gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <ContactFormFromUrl />
          </div>

          <aside className="space-y-12 lg:col-span-5" aria-label="Other ways to reach us">
            <div>
              <h2 className="font-display text-xl font-medium text-text">Who to email</h2>
              <p className="mt-2 text-sm text-text-3">Email the team that owns your question, or use the form.</p>
              <dl className="mt-6 border-b border-line">
                {inboxes.map((inbox) => (
                  <div key={inbox.label} className="border-t border-line py-4">
                    <dt className="text-meta font-mono uppercase text-text-3">{inbox.label}</dt>
                    <dd className="mt-1 flex items-center justify-between gap-3">
                      <a href={`mailto:${inbox.email}`} className="text-link font-mono text-sm">
                        {inbox.email}
                      </a>
                      <CopyButton value={inbox.email} label={`Copy the ${inbox.label.toLowerCase()} address`} />
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            {socials.length > 0 && (
              <div>
                <h2 className="font-display text-xl font-medium text-text">Follow updates</h2>
                <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                  {socials.map(([label, href]) => (
                    <li key={label}>
                      <a href={href} target="_blank" rel="noopener noreferrer" className="text-link">
                        {label}
                        <span className="sr-only"> (opens in a new tab)</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <h2 className="font-display text-xl font-medium text-text">Where we are</h2>
              <p className="mt-4 text-sm leading-relaxed text-text-2">
                {config.hostInstitution}
              </p>
              <Link href="/about/venue" className="text-link mt-4 text-sm">
                Venue and travel
              </Link>
            </div>

            <p className="border-t border-line pt-6 text-xs leading-relaxed text-text-3">
              Messages are handled as described in the{' '}
              <Link href="/privacy" className="text-link">
                privacy notice
              </Link>{' '}
              and used only to answer your question.
            </p>
          </aside>
        </div>
      </section>
    </>
  );
}
