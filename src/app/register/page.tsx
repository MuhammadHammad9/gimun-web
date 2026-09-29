import type { Metadata } from 'next';
import { constructMetadata } from '@/lib/metadata';
import { getCommittees, getProblemCategories, getSiteConfig } from '@/lib/content';
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
  const committees = (await getCommittees());
  const categories = (await getProblemCategories());
  const siteConfig = (await getSiteConfig());

  return (
    <div className="pb-24 print:pb-0">
      <PageHero
        className="print:hidden"
        meta={[`Registration ${getEventYear(siteConfig)}`, 'Free to apply', 'About ten minutes']}
        title="Apply for GIMUN or the GIKI Moot Court"
        accentPhrase="GIKI Moot Court"
        description="The organizing team reviews every application. You pay only if you are accepted, by bank transfer against an invoice."
        aside={
          <ol className="steps" style={{ '--step-accent': 'var(--color-champagne)' } as React.CSSProperties}>
            {[
              ['Apply', 'Submit the form. You get a reference number and QR ticket by email straight away.'],
              ['Review', 'The organizing team reviews applications and allocates committees or categories.'],
              ['Pay', 'If accepted, you receive an invoice with bank details. Nothing is charged here.'],
            ].map(([title, body], i) => (
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
