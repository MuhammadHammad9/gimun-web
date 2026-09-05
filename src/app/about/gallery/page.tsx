import type { Metadata } from "next";
import { constructMetadata } from "@/lib/metadata";
import { getGallery } from "@/lib/content";
import { GalleryClient } from "./GalleryClient";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = constructMetadata({
  title: "Media Archive & Gallery | GIMUN & GMC 2027",
  description:
    "Visual archives capturing intense committee debates, judicial advocacy, diplomacy, campus life, and award ceremonies across 15 years of GIMUN and GMC.",
  path: "/about/gallery",
});

export default function GalleryPage() {
  const items = getGallery();

  return (
    <div className="space-y-12">
      {/* Modern Atmospheric Gallery Hero */}
      <section className="relative overflow-hidden bg-[#070B19] text-white py-14 sm:py-20 border-b border-white/10">
        <div className="absolute inset-0 bg-radial-glow-dual opacity-40 pointer-events-none" />
        <div className="absolute inset-0 bg-tech-grid opacity-20 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase bg-white/10 text-gray-200 border border-white/15">
              <Camera className="w-3.5 h-3.5 text-[#FF6B35]" />
              Visual Archives
            </span>
            <span className="text-xs font-mono text-gray-400 uppercase tracking-widest">
              15 Years of Memories
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-heading font-extrabold text-white tracking-tight leading-tight max-w-4xl">
            Photographic <span className="text-gradient-silver">Gallery &amp; Archives</span>
          </h1>

          <p className="text-sm sm:text-base text-gray-300 max-w-3xl leading-relaxed">
            A visual retrospective capturing multilateral committee debates, tense appellate court oral pleadings, vibrant cultural social nights, and prestigious gala awards at GIKI Topi.
          </p>

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
        </div>
      </section>

      {/* Main Interactive Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <GalleryClient initialItems={items} />
      </main>
    </div>
  );
}
