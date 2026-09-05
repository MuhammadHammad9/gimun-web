import type { Metadata } from 'next';
import Link from 'next/link';
import { getSiteConfig } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Registration Portal | GIMUN & GIKI Moot Cup 2026',
  description:
    'Register as an individual delegate, delegation, or moot court team for the 2026 edition.',
};

export default function RegisterPage() {
  const config = getSiteConfig();

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-10">
      <header className="space-y-3 text-center">
        <span className="text-xs font-mono uppercase text-accent font-semibold tracking-wider">
          Official Portal
        </span>
        <h1 className="text-3xl md:text-5xl font-heading font-bold text-ink">
          Delegate & Team Registration
        </h1>
        <p className="text-neutral-gray text-base max-w-xl mx-auto">
          Select your competition track below to access the official application form.
        </p>
      </header>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-8 rounded-card bg-surface-elevated border border-orange-200/80 shadow-card flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <span className="px-3 py-1 rounded-full text-xs font-mono uppercase font-bold bg-orange-50 text-accent">
              GIMUN Track
            </span>
            <h2 className="text-2xl font-heading font-bold text-ink">Model United Nations</h2>
            <p className="text-sm text-neutral-gray leading-relaxed">
              Register as an Individual Delegate or submit a multi-delegate Institutional Delegation roster.
            </p>
            <div className="text-xs font-mono text-neutral-gray pt-2">
              Deadline: <span className="font-semibold text-ink">{config.registrationDeadlines.gimun}</span>
            </div>
          </div>
          <Link
            href="/contact?type=gimun-registration"
            className="w-full text-center px-6 py-3 rounded-button bg-accent text-white font-medium hover:bg-accent-hover transition-colors shadow-button"
          >
            Apply for GIMUN
          </Link>
        </div>

        <div className="p-8 rounded-card bg-surface-elevated border border-teal-200/80 shadow-card flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <span className="px-3 py-1 rounded-full text-xs font-mono uppercase font-bold bg-teal-50 text-secondary">
              Moot Cup Track
            </span>
            <h2 className="text-2xl font-heading font-bold text-ink">GIKI Moot Court</h2>
            <p className="text-sm text-neutral-gray leading-relaxed">
              Register an official law team (2 oralists + optional researcher) representing your faculty or university.
            </p>
            <div className="text-xs font-mono text-neutral-gray pt-2">
              Deadline: <span className="font-semibold text-ink">{config.registrationDeadlines.mootCup}</span>
            </div>
          </div>
          <Link
            href="/contact?type=moot-registration"
            className="w-full text-center px-6 py-3 rounded-button bg-secondary text-white font-medium hover:bg-secondary-hover transition-colors"
          >
            Apply for Moot Cup
          </Link>
        </div>
      </div>
    </div>
  );
}
