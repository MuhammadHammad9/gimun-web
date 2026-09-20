import { getSiteConfig } from '@/lib/content';
import type { Metadata } from "next";
import { constructMetadata } from "@/lib/metadata";
import { getSponsors } from "@/lib/content";
import { SponsorsClient } from "./SponsorsClient";
import { Briefcase, Download } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getEventYear } from "@/lib/site-config";
import { PageHero } from '@/components/ui/PageHero';

export async function generateMetadata(): Promise<Metadata> { return await constructMetadata({
  title: `Institutional Sponsors & Strategic Patrons | GIMUN & GMC ${getEventYear(await getSiteConfig())}`,
  path: '/about/sponsors',
  description:
    "Our esteemed statutory patrons, government boards, corporate partners, and legal chambers supporting Pakistan’s premier youth diplomatic and legal advocacy championship.",
}); }

export default async function SponsorsPage() {
  const sponsors = (await getSponsors());

  return (
    <div className="space-y-12">
      {/* Modern Atmospheric Sponsors Hero */}
      <PageHero
        variant="utility"
        breadcrumbs={[{ label: 'About', href: '/about' }, { label: 'Sponsors' }]}
        title={'Sponsors & Strategic Partners'}
        accentWords={['Partners']}
        eyebrow={
          <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase bg-white/10 text-text-2 border border-white/15">
                        <Briefcase className="w-3.5 h-3.5 text-champagne" />
                        Strategic Alliances
                      </span>
                      <span className="text-xs font-mono text-text-3 uppercase tracking-widest">
                        Partnerships &amp; Patrons
                      </span>
                    </div>
        }
        actionsSlot={
          <>
            <p className="text-sm sm:text-base text-text-2 max-w-3xl leading-relaxed">
                        Proudly supported by visionary academic councils, public sector technology boards, leading law firms, and media publications. Explore sponsorship tier benefits, recruitment touchpoints, and our active institutional partners.
                      </p>

                      <div className="pt-2 flex flex-wrap items-center gap-4">
                        <Button
                          variant="track-gimun"
                          href="/resources"
                          icon={<Download className="w-4 h-4" />}
                        >
                          Download Sponsorship Deck (PDF)
                        </Button>
                        <Button variant="secondary" href="/contact?type=sponsorship">
                          Inquire Corporate Partnership
                        </Button>
                      </div>
          </>
        }
      />

      {/* Main Interactive Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <SponsorsClient initialSponsors={sponsors} />
      </div>
    </div>
  );
}
