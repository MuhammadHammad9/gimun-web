import type { Metadata } from 'next';
import { getGallery } from '@/lib/content';
import { GalleryClient } from './GalleryClient';

export const metadata: Metadata = {
  title: 'Media Archive & Gallery | GIMUN & GIKI Moot Cup 2026',
  description: 'Visual archives capturing intense committee debates, judicial advocacy, diplomacy, campus life, and award ceremonies across 15 years of GIMUN and GIKI Moot Cup.',
};

export default function GalleryPage() {
  const items = getGallery();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      {/* Header */}
      <header className="space-y-4 max-w-3xl">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-bold uppercase bg-slate-100 text-primary border border-slate-200">
            Historical Archives
          </span>
          <span className="text-xs font-mono text-neutral-gray uppercase tracking-wider">
            PRD §18.3
          </span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-ink tracking-tight">
          Visual Archives & Memories
        </h1>
        <p className="text-sm sm:text-base text-neutral-gray leading-relaxed">
          Explore over a decade of diplomatic excellence, judicial advocacy, and vibrant campus life
          at the Ghulam Ishaq Khan Institute of Engineering Sciences and Technology.
        </p>
      </header>

      {/* Interactive Bento Gallery & Lightbox */}
      <GalleryClient initialItems={items} />
    </div>
  );
}

