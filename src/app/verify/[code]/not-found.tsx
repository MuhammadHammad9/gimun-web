import { Button } from '@frontend/components/ui/Button';
import '@frontend/styles/pages/utility.css';

export default function CertificateNotFound() {
  return (
    <section className="utility-page wrap">
      <div className="utility-card space-y-6">
        <p className="text-meta font-mono uppercase text-accent-gimun">Not verified</p>
        <h1 className="font-display text-4xl font-medium tracking-tight text-text sm:text-5xl">Certificate not found</h1>
        <p className="text-base leading-relaxed text-text-2">
          No certificate matches this verification link. Check that the full link or QR code was used. If you believe
          the certificate is genuine, contact the organizing team with its serial number.
        </p>
        <Button href="/contact" variant="secondary">
          Contact the organizing team
        </Button>
      </div>
    </section>
  );
}
