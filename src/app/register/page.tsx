import type { Metadata } from 'next';
import { constructMetadata } from '@/lib/metadata';
import { getCopy, getCommittees, getProblemCategories, getSiteConfig } from '@/lib/content';
import { fill } from '@/lib/copy';
import { TransitionLink as Link } from '@/components/motion/TransitionLink';
import { RegisterPageClient } from './RegisterPageClient';
import { PageHero } from '@/components/ui/PageHero';
import { getEventYear } from '@/lib/site-config';

export async function generateMetadata(): Promise<Metadata> { return await constructMetadata({
  title: `Official Registration Portal | GIMUN & GMC ${getEventYear(await getSiteConfig())}`,
  description:
    'Official application portal for GIKI Model United Nations (Individual & Delegation) and GMC (GIKI Moot Court). Zero online payment collection.',
  path: '/register',
}); }

export default async function RegisterPage() {
  const [committees, categories, siteConfig, copy] = await Promise.all([getCommittees(), getProblemCategories(), getSiteConfig(), getCopy('register')]);
  const hero = copy('register-hero');

  return (
    <div className="pb-24 print:pb-0">
      <PageHero
        className="print:hidden"
        meta={[`Registration ${getEventYear(siteConfig)}`, 'Free to apply', 'About ten minutes']}
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

      <div className="mx-auto max-w-6xl px-4 pt-4 sm:px-6 print:m-0 print:max-w-none print:p-0">
        <RegisterPageClient committees={committees} categories={categories} siteConfig={siteConfig} />
        <p className="mt-12 text-center text-sm text-text-3 print:hidden">
          Questions about eligibility or fees? Read the{' '}
          <Link href="/about/faq" className="text-link">
            FAQ
          </Link>{' '}
          or{' '}
          <Link href="/contact" className="text-link">
            contact the organizing team
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
