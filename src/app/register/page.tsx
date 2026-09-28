import type { Metadata } from 'next';
import { constructMetadata } from '@/lib/metadata';
import { getCommittees, getProblemCategories, getSiteConfig } from '@/lib/content';
import Link from 'next/link';
import { RegisterPageClient } from './RegisterPageClient';
import { Eyebrow } from '@/components/ui/Editorial';
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
      <section className="border-b border-line px-4 pt-12 pb-14 sm:px-6 md:pt-20 md:pb-16 lg:px-8 print:hidden" data-print-hide="true">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.2fr_1fr] lg:items-end">
          <div className="max-w-2xl">
            <Eyebrow>Registration · {getEventYear(siteConfig)}</Eyebrow>
            <h1 className="mt-7 text-h1 font-display font-medium text-text">
              Apply for GIMUN or the <span className="text-champagne">GIKI Moot Court</span>
            </h1>
            <p className="mt-6 text-lead text-text-3">
              Applying is free and takes about ten minutes. The organizing team reviews every application; you pay only
              if you are accepted.
            </p>
          </div>
          <ol className="grid gap-6 sm:grid-cols-3 lg:grid-cols-1 lg:gap-0">
            {[
              ['Apply', 'Submit the form. You get a reference number and QR ticket by email straight away.'],
              ['Review', 'The organizing team reviews applications and allocates committees or categories.'],
              ['Pay', 'If accepted, you receive an invoice with bank details. Nothing is charged here.'],
            ].map(([title, body], i) => (
              <li key={title} className="flex gap-4 lg:border-t lg:border-line lg:py-4">
                <span className="font-mono text-xs text-champagne tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                <span>
                  <span className="block text-sm font-medium text-text">{title}</span>
                  <span className="mt-1 block text-sm leading-relaxed text-text-3">{body}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 pt-14 sm:px-6 print:m-0 print:max-w-none print:p-0">
        <RegisterPageClient committees={committees} categories={categories} siteConfig={siteConfig} />
        <p className="mt-12 text-center text-sm text-text-3 print:hidden">
          Questions about eligibility or fees? Read the{' '}
          <Link href="/about/faq" className="text-champagne underline underline-offset-4">
            FAQ
          </Link>{' '}
          or{' '}
          <Link href="/contact" className="text-champagne underline underline-offset-4">
            contact the organizing team
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
