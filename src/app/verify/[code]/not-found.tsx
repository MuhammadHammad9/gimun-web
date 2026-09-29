import { TransitionLink as Link } from '@/components/motion/TransitionLink';
import { ShieldAlert } from 'lucide-react';

export default function CertificateNotFound() {
  return (
    <section className="mx-auto max-w-2xl px-4 py-16 sm:py-24">
      <div className="surface space-y-5 p-8 sm:p-12">
        <p className="inline-flex items-center gap-2 rounded-full border border-line-2 px-3 py-1 font-mono text-xs uppercase tracking-widest text-text-2">
          <ShieldAlert aria-hidden="true" className="h-4 w-4 text-accent-gimun" />
          Not verified
        </p>
        <h1 className="text-h2 font-display font-bold text-text">Certificate not found</h1>
        <p className="text-sm leading-relaxed text-text-2">
          No certificate matches this verification link. Check that the full link or QR code was
          used. If you believe the certificate is genuine, contact the organizing team with its
          serial number.
        </p>
        <Link
          href="/contact"
          className="inline-flex min-h-11 items-center rounded-full border border-line-2 px-6 text-xs font-semibold text-text-2 transition-colors hover:border-line-3 hover:text-text"
        >
          Contact the organizing team
        </Link>
      </div>
    </section>
  );
}
