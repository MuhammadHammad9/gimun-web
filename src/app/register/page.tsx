import type { Metadata } from 'next';
import { constructMetadata } from '@/lib/metadata';
import { getCommittees, getProblemCategories, getSiteConfig } from '@/lib/content';
import { RegisterPageClient } from './RegisterPageClient';
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
    <div className="min-h-screen bg-linear-to-b from-crest via-overlay to-elevated py-12 md:py-16 text-champagne print:bg-white print:text-black print:py-0 print:px-0 print:m-0 print:max-w-none print:space-y-0">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-10 print:px-0 print:m-0 print:max-w-none print:space-y-0">
        {/* Header */}
        <header className="space-y-3 text-center max-w-2xl mx-auto print:hidden hidden-print" data-print-hide="true">
          <span className="inline-block px-3.5 py-1 rounded-full text-xs font-mono uppercase font-semibold tracking-wider bg-champagne/10 text-champagne border border-champagne/20">
            Official Application Portal
          </span>
          <h1 className="text-3xl md:text-5xl font-heading font-extrabold text-cream tracking-tight">
            Delegate &amp; Team Registration
          </h1>
          <p className="text-champagne/80 text-sm md:text-base leading-relaxed">
            Apply for GIMUN (Model UN) or GMC (Moot Court). Zero upfront payment — the organizing team reviews all applications and confirms your seat.
          </p>
          <p className="text-xs text-champagne/60 pt-1">
            Not sure which track to pick, or have eligibility questions?{' '}
            <a href="/about/faq" className="text-champagne font-semibold hover:text-cream underline underline-offset-4">
              Read the FAQ →
            </a>
          </p>
        </header>

        {/* Client Orchestrator */}
        <RegisterPageClient
          committees={committees}
          categories={categories}
          siteConfig={siteConfig}
        />
      </div>
    </div>
  );
}
