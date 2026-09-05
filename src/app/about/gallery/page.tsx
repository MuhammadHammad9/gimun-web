import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Media & Gallery | Past Editions',
  description: 'Photographic highlights and press coverage from previous editions of GIMUN and GIKI Moot Cup.',
};

export default function GalleryPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-8">
      <header className="space-y-3">
        <span className="text-xs font-mono uppercase text-primary font-semibold">Memories & Press</span>
        <h1 className="text-3xl md:text-5xl font-heading font-bold text-ink">
          Conference Gallery
        </h1>
        <p className="text-neutral-gray text-base max-w-2xl">
          Visual archives capturing intense debate, judicial advocacy, diplomacy, and the camaraderie of past delegates.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="aspect-video rounded-card bg-slate-100 border border-whisper-border shadow-card flex items-center justify-center text-xs font-mono text-neutral-gray"
          >
            Archive Photo #{i}
          </div>
        ))}
      </div>
    </div>
  );
}
