import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BadgeCheck, Download } from 'lucide-react';
import { findCertificate } from '@/lib/server/certificates';

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
    <section className="mx-auto max-w-2xl px-4 py-16 sm:py-24">
      <div className="surface space-y-6 p-8 sm:p-12">
        <p className="inline-flex items-center gap-2 rounded-full border border-line-2 px-3 py-1 font-mono text-xs uppercase tracking-widest text-text-2">
          <BadgeCheck aria-hidden="true" className="h-4 w-4 text-champagne" />
          Verified certificate
        </p>
        <h1 className="text-h2 font-display font-bold text-text">{certificate.name}</h1>
        <dl className="grid gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-xs uppercase tracking-wider text-text-3">Certificate</dt>
            <dd className="mt-1 text-sm font-semibold text-text">{kindLabel(certificate.kind)}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-text-3">Serial</dt>
            <dd className="mt-1 font-mono text-sm text-text">{certificate.serial}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-text-3">Issued</dt>
            <dd className="mt-1 text-sm text-text">{issued}</dd>
          </div>
        </dl>
        <p className="text-sm leading-relaxed text-text-2">
          This certificate was issued by the GIMUN &amp; GMC organizing team and matches our records.
        </p>
        <a
          href={`/verify/${code}/pdf`}
          className="btn-shimmer-gold inline-flex min-h-11 items-center gap-2 rounded-full px-6 text-xs font-bold uppercase tracking-wider"
        >
          <Download aria-hidden="true" className="h-4 w-4" />
          Download certificate PDF
        </a>
      </div>
    </section>
  );
}
