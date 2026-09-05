import type { Metadata } from 'next';
import { getResources } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Resource Hub | Official Documents & Downloads',
  description: 'Download official handbooks, background guides, propositions, and campus guides.',
};

export default function ResourcesPage() {
  const resources = getResources();

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-8">
      <header className="space-y-3">
        <span className="text-xs font-mono uppercase text-primary font-semibold">Document Repository</span>
        <h1 className="text-3xl md:text-5xl font-heading font-bold text-ink">
          Resource Hub
        </h1>
        <p className="text-neutral-gray text-base max-w-2xl">
          Direct downloads for handbooks, background guides, moot propositions, and campus logistical packs.
        </p>
      </header>

      <div className="grid md:grid-cols-2 gap-6">
        {resources.map((doc) => (
          <div
            key={doc.id}
            className="p-6 rounded-card bg-surface-elevated border border-whisper-border shadow-card flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-neutral-gray">
                <span className="uppercase font-semibold text-primary">{doc.type.replace('-', ' ')}</span>
                <span>{doc.fileSize} • {doc.fileFormat}</span>
              </div>
              <h2 className="text-lg font-heading font-bold text-ink">{doc.title}</h2>
              <p className="text-xs text-neutral-gray">Version Date: {doc.versionDate}</p>
            </div>
            <a
              href={doc.fileUrl}
              download
              className="inline-block text-center px-4 py-2.5 rounded-button bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Download Document
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
