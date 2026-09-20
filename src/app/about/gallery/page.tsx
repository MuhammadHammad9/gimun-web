import { getSiteConfig } from '@/lib/content';
import type { Metadata } from "next";
import { constructMetadata } from "@/lib/metadata";
import { getGallery } from "@/lib/content";
import { GalleryClient } from "./GalleryClient";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getEventYear } from "@/lib/site-config";
import { PageHero } from '@/components/ui/PageHero';

export async function generateMetadata(): Promise<Metadata> { return await constructMetadata({
  title: `Media Archive & Gallery | GIMUN & GMC ${getEventYear(await getSiteConfig())}`,
  path: '/about/gallery',
  description:
    "Visual archives capturing intense committee debates, judicial advocacy, diplomacy, campus life, and award ceremonies across 15 years of GIMUN and GMC.",
}); }

export default async function GalleryPage() {
  const items = (await getGallery());

  return (
    <div className="space-y-12">
      {/* Modern Atmospheric Gallery Hero */}
      <PageHero
        variant="utility"
        breadcrumbs={[{ label: 'About', href: '/about' }, { label: 'Gallery' }]}
        title={'Photographic Gallery & Archives'}
        accentWords={['Gallery', '&', 'Archives']}
        description={'A visual retrospective capturing multilateral committee debates, tense appellate court oral pleadings, vibrant cultural social nights, and prestigious gala awards at GIKI Topi.'}
        eyebrow={
          <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase bg-white/10 text-text-2 border border-champagne/20">
                        <Camera className="w-3.5 h-3.5 text-champagne" />
                        Visual Archives
                      </span>
                      <span className="text-xs font-mono text-champagne/70 uppercase tracking-widest">
                        15 Years of Memories
                      </span>
                    </div>
        }
        actionsSlot={
          <>
            <div className="pt-2 flex flex-wrap items-center gap-4">
                        <Button variant="track-gimun" href="/gimun">
                          GIMUN Debates
                        </Button>
                        <Button variant="track-moot" href="/moot-cup">
                          GMC Courtrooms
                        </Button>
                        <Button variant="secondary" href="/results">
                          Hall of Fame Awards
                        </Button>
                      </div>
          </>
        }
      />

      {/* Main Interactive Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <GalleryClient initialItems={items} />
      </div>
    </div>
  );
}
