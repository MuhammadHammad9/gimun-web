import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Home, Calendar, FileText, ArrowRight } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-xl w-full text-center rounded-2xl border border-champagne/30 bg-overlay/95 shadow-2xl p-8 sm:p-12">
        {/* Eyebrow badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-mono font-bold uppercase bg-champagne/20 text-cream border border-champagne/30 mb-6">
          Error 404 — Out of Order
        </div>

        <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-cream tracking-tight mb-4">
          Point of Order: Page Not Found
        </h1>

        <p className="text-sm sm:text-base text-champagne/80 leading-relaxed mb-8 max-w-md mx-auto">
          It appears this draft resolution or court filing has been tabled indefinitely. Return to the main conference floor to find what you need.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8 text-left">
          <Link
            href="/"
            className="flex items-center gap-3 p-3.5 rounded-xl border border-champagne/25 bg-crest/70 hover:border-champagne/50 hover:bg-crest transition-colors group"
          >
            <div className="p-2 rounded-lg bg-overlay text-champagne border border-champagne/20">
              <Home className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-cream group-hover:text-champagne">
                Homepage
              </p>
              <p className="text-[11px] text-champagne/70">Conference overview</p>
            </div>
          </Link>

          <Link
            href="/schedule"
            className="flex items-center gap-3 p-3.5 rounded-xl border border-champagne/25 bg-crest/70 hover:border-champagne/50 hover:bg-crest transition-colors group"
          >
            <div className="p-2 rounded-lg bg-overlay text-champagne border border-champagne/20">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-cream group-hover:text-champagne">
                Schedule
              </p>
              <p className="text-[11px] text-champagne/70">Live session agendas</p>
            </div>
          </Link>

          <Link
            href="/resources"
            className="flex items-center gap-3 p-3.5 rounded-xl border border-champagne/25 bg-crest/70 hover:border-champagne/50 hover:bg-crest transition-colors group"
          >
            <div className="p-2 rounded-lg bg-overlay text-champagne border border-champagne/20">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-cream group-hover:text-champagne">
                Resource Hub
              </p>
              <p className="text-[11px] text-champagne/70">Handbooks &amp; guides</p>
            </div>
          </Link>

          <Link
            href="/register"
            className="flex items-center gap-3 p-3.5 rounded-xl border border-champagne/25 bg-crest/70 hover:border-champagne/50 hover:bg-crest transition-colors group"
          >
            <div className="p-2 rounded-lg bg-overlay text-champagne border border-champagne/20">
              <ArrowRight className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-cream group-hover:text-champagne">
                Registration
              </p>
              <p className="text-[11px] text-champagne/70">Form-only submission</p>
            </div>
          </Link>
        </div>

        <Button variant="primary" size="md" href="/" fullWidth>
          Return to Conference Floor
        </Button>
      </div>
    </div>
  );
}
