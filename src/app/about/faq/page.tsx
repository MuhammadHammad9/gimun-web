import { getSiteConfig } from '@/lib/content';
import type { Metadata } from "next";
import { constructMetadata } from "@/lib/metadata";
import { getFAQ } from "@/lib/content";
import { FaqClient } from "./FaqClient";
import { TransitionLink as Link } from "@/components/motion/TransitionLink";
import { getEventYear } from "@/lib/site-config";
import { PageHero } from '@/components/ui/PageHero';

export async function generateMetadata(): Promise<Metadata> { return await constructMetadata({
  title: `Frequently Asked Questions | GIMUN & GMC ${getEventYear(await getSiteConfig())}`,
  path: '/about/faq',
  description:
    "Answers about GIMUN and GMC: fees and refunds, committee allocation, memorial rules, accommodation at GIKI and travel to Topi.",
}); }

export default async function FaqPage() {
  const faqs = (await getFAQ());

  return (
    <>
      <PageHero
        variant="utility"
        breadcrumbs={[{ label: 'About', href: '/about' }, { label: 'FAQ' }]}
        meta={[`${faqs.length} answers`, 'Search or browse by topic']}
        title="Questions, answered."
        accentPhrase="answered."
        description="Fees and refunds, committee procedure, the moot rounds, accommodation at GIKI and getting to Topi."
        actionsSlot={
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link href="/contact" className="text-link">
              Ask the organizing team
            </Link>
            <Link href="/gimun/rules" className="text-link">
              GIMUN rules
            </Link>
            <Link href="/moot-cup/rules" className="text-link">
              GMC rules
            </Link>
          </div>
        }
      />

      <script
        type="application/ld+json"
        // Plain text answers from the CMS; escape "<" so no value can close the tag.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqs.map((faq) => ({
              '@type': 'Question',
              name: faq.question,
              acceptedAnswer: { '@type': 'Answer', text: faq.answer },
            })),
          }).replace(/</g, '\\u003c'),
        }}
      />

      <section className="handoff__sheet tone-deep chapter chapter--flush-top" aria-label="Answers">
        <div className="wrap">
          <FaqClient initialFaqs={faqs} />
        </div>
      </section>
    </>
  );
}
