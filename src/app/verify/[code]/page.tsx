import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Download } from 'lucide-react';
import { Seal } from '@frontend/components/art/Seal';
import { Button } from '@frontend/components/ui/Button';
import { findCertificate } from '@backend/server/certificates';
import '@frontend/styles/pages/utility.css';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: { absolute: 'Certificate verification | GIMUN & GMC' },
  robots: { index: false, follow: false },
  alternates: { canonical: null },
};

const kindLabel = (kind: string) => kind.charAt(0).toUpperCase() + kind.slice(1).replaceAll('-', ' ');

export default async function VerifyPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const certificate = await findCertificate(code);
  if (!certificate) notFound();

  // Issue date in Pakistan time; a UTC slice could show the previous or next day.
  const issued = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'long',
    timeZone: 'Asia/Karachi',
  }).format(new Date(certificate.issuedAt));

  return (
    <section className="utility-page wrap">
      <div className="utility-card space-y-8">
        <Seal id="verify-seal" className="utility-card__seal" spin={false} />
        <p className="text-meta font-mono uppercase text-champagne">Verified certificate</p>
        <h1 className="font-display text-4xl font-medium tracking-tight text-text sm:text-5xl">{certificate.name}</h1>
        <dl className="grid gap-6 border-y border-line py-6 sm:grid-cols-3">
          <div>
            <dt className="text-meta font-mono uppercase text-text-3">Certificate</dt>
            <dd className="mt-1.5 text-sm font-medium text-text">{kindLabel(certificate.kind)}</dd>
          </div>
          <div>
            <dt className="text-meta font-mono uppercase text-text-3">Serial</dt>
            <dd className="mt-1.5 font-mono text-sm text-text">{certificate.serial}</dd>
          </div>
          <div>
            <dt className="text-meta font-mono uppercase text-text-3">Issued</dt>
            <dd className="mt-1.5 text-sm text-text">{issued}</dd>
          </div>
        </dl>
        <p className="text-base leading-relaxed text-text-2">
          This certificate was issued by the GIMUN &amp; GMC organizing team and matches our records.
        </p>
        <Button href={`/verify/${code}/pdf`} variant="primary" icon={<Download aria-hidden="true" className="size-4" />}>
          Download certificate PDF
        </Button>
      </div>
    </section>
  );
}
