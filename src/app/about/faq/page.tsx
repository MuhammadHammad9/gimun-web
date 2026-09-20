import { getSiteConfig } from '@/lib/content';
import type { Metadata } from "next";
import { constructMetadata } from "@/lib/metadata";
import { getFAQ } from "@/lib/content";
import { FaqClient } from "./FaqClient";
import { HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getEventYear } from "@/lib/site-config";
import { PageHero } from '@/components/ui/PageHero';

export async function generateMetadata(): Promise<Metadata> { return await constructMetadata({
  title: `Frequently Asked Questions | GIMUN & GMC ${getEventYear(await getSiteConfig())}`,
  path: '/about/faq',
  description:
    "Official answers to inquiries regarding delegation allocations, OSCOLA memorial standards, zero-payment registration policy, transport shuttles, and GIKI campus hostels.",
}); }

export default async function FaqPage() {
  const faqs = (await getFAQ());

  return (
    <div className="space-y-12">
      {/* Modern Atmospheric FAQ Hero */}
      <PageHero
        variant="utility"
        breadcrumbs={[{ label: 'About', href: '/about' }, { label: 'FAQ' }]}
        title={'Frequently Asked Questions'}
        accentWords={['Questions']}
        description={'Find answers to common questions about GIMUN committee procedures, GMC courtroom advocacy, registration fees, on-campus accommodation at GIKI, and logistics.'}
        eyebrow={
          <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase bg-champagne/20 text-champagne border border-champagne/40">
                        <HelpCircle className="w-3.5 h-3.5 text-champagne" />
                        Official Knowledge Base
                      </span>
                      <span className="text-xs font-mono text-champagne/70 uppercase tracking-widest">
                        Help &amp; Guidelines
                      </span>
                    </div>
        }
        actionsSlot={
          <>
            <div className="pt-2 flex flex-wrap items-center gap-4">
                        <Button variant="secondary" href="/contact">
                          Contact Organizing Team
                        </Button>
                        <Button variant="track-gimun" href="/gimun/rules">
                          GIMUN Rules of Procedure
                        </Button>
                        <Button variant="track-moot" href="/moot-cup/rules">
                          GMC Rules &amp; Guidelines
                        </Button>
                      </div>
          </>
        }
      />

      {/* Main Interactive Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <FaqClient initialFaqs={faqs} />
      </div>
    </div>
  );
}
