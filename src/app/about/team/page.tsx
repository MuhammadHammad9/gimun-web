import { getSiteConfig } from '@/lib/content';
import type { Metadata } from "next";
import { constructMetadata } from "@/lib/metadata";
import { getTeamMembers } from "@/lib/content";
import { TeamClient } from "./TeamClient";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getEventYear } from "@/lib/site-config";
import { PageHero } from '@/components/ui/PageHero';

export async function generateMetadata(): Promise<Metadata> { return await constructMetadata({
  title: `Organizing Team, Secretariat & GMC Convenors | GIMUN & GMC ${getEventYear(await getSiteConfig())}`,
  path: '/about/team',
  description:
    "Meet the GIMUN Secretariat, GMC Convening Committee, and Host Directorate student leadership organizing Pakistan’s premier academic symposium at GIKI Topi.",
}); }

export default async function TeamPage() {
  const members = (await getTeamMembers());

  return (
    <div className="space-y-12">
      {/* Modern Atmospheric Leadership Hero */}
      <PageHero
        variant="utility"
        breadcrumbs={[{ label: 'About', href: '/about' }, { label: 'Team' }]}
        title={'Executive Secretariat & Directorate'}
        accentWords={['Directorate']}
        description={'Led by seasoned parliamentary debaters, appellate moot champions, and campus operations directors. Our student leadership is committed to delivering unmatched competitive rigor, impartial adjudication, and warm GIKI hospitality.'}
        eyebrow={
          <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase bg-white/10 text-text-2 border border-champagne/20">
                        <Users className="w-3.5 h-3.5 text-champagne" />
                        Executive Leadership
                      </span>
                      <span className="text-xs font-mono text-champagne/70 uppercase tracking-widest">
                        {getEventYear(await getSiteConfig())} Organizing Directorate
                      </span>
                    </div>
        }
        actionsSlot={
          <>
            <div className="pt-2 flex flex-wrap items-center gap-4">
                        <Button variant="track-gimun" href="/gimun">
                          GIMUN Secretariat
                        </Button>
                        <Button variant="track-moot" href="/moot-cup">
                          GMC Convening Bench
                        </Button>
                        <Button variant="secondary" href="/contact">
                          Contact Secretariat
                        </Button>
                      </div>
          </>
        }
      />

      {/* Main Interactive Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <TeamClient initialMembers={members} />
      </div>
    </div>
  );
}
