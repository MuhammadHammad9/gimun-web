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
    "Visual archives capturing intense committee debates, judicial advocacy, diplomacy, campus life, and award ceremonies from GIMUN and GMC.",
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
        description={'Photographs from committee sessions, courtroom rounds, ceremonies and campus life at GIKI, published after each edition.'}
        eyebrow={
          <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase bg-text/10 text-text-2 border border-line">
                        <Camera className="w-3.5 h-3.5 text-champagne" />
                        Visual Archives
                      </span>
                      <span className="text-xs font-mono text-text-3 uppercase tracking-widest">
                        Event Memories
                      </span>
                    </div>
        }
        actionsSlot={
          <>
            <div className="pt-2 flex flex-wrap items-center gap-4">
                        <Button variant="track-gimun" href="/gimun">
                          About GIMUN
                        </Button>
                        <Button variant="track-moot" href="/moot-cup">
                          About GMC
                        </Button>
                        <Button variant="secondary" href="/results">
                          Results
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
