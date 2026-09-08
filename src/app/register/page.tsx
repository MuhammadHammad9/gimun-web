import type { Metadata } from 'next';
import { constructMetadata } from '@/lib/metadata';
import { getCommittees, getProblemCategories, getSiteConfig } from '@/lib/content';
import { RegisterPageClient } from './RegisterPageClient';

export const metadata: Metadata = constructMetadata({
  title: 'Official Registration Portal | GIMUN & GMC 2027',
  description:
    'Official application portal for GIKI Model United Nations (Individual & Delegation) and GMC (GIKI Moot Court). Zero online payment collection.',
  path: '/register',
});

export default function RegisterPage() {
  const committees = getCommittees();
  const categories = getProblemCategories();
  const siteConfig = getSiteConfig();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-16 space-y-10 print:py-0 print:px-0 print:m-0 print:max-w-none print:space-y-0">
      {/* Header */}
      <header className="space-y-3 text-center max-w-2xl mx-auto print:hidden hidden-print" data-print-hide="true">
        <span className="text-xs font-mono uppercase text-accent font-semibold tracking-wider">
          Official Application Portal
        </span>
        <h1 className="text-3xl md:text-5xl font-heading font-bold text-ink tracking-tight">
          Delegate & Team Registration
        </h1>
        <p className="text-neutral-gray text-sm md:text-base leading-relaxed">
          Apply to represent your sovereign nation at GIMUN or argue before appellate benches at the GMC.
          All allocations are issued by the Secretariat and Bench Committee on merit.
        </p>
      </header>

      {/* Client Orchestrator */}
      <RegisterPageClient
        committees={committees}
        categories={categories}
        siteConfig={siteConfig}
      />
    </div>
  );
}
