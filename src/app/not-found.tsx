import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Home, Calendar, FileText, ArrowRight } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-xl w-full text-center double-bezel">
        <div className="double-bezel-inner p-8 sm:p-12">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase bg-red-100 text-red-700 border border-red-200 mb-6">
            Error 404 — Out of Order
          </div>

          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-[#1A1A2E] tracking-tight mb-4">
            Point of Order: Page Not Found
          </h1>

          <p className="text-sm sm:text-base text-[#5A5A6E] leading-relaxed mb-8 max-w-md mx-auto">
            It appears this draft resolution or court filing has been tabled indefinitely. Return to the main conference floor to find what you need.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8 text-left">
            <Link
              href="/"
              className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-[#1E2A78] hover:bg-[#1E2A78]/5 transition-colors group"
            >
              <div className="p-2 rounded-lg bg-[#1E2A78]/10 text-[#1E2A78]">
                <Home className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#1A1A2E] group-hover:text-[#1E2A78]">
                  Homepage
                </p>
                <p className="text-[11px] text-[#5A5A6E]">Conference overview</p>
              </div>
            </Link>

            <Link
              href="/schedule"
              className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-[#1E2A78] hover:bg-[#1E2A78]/5 transition-colors group"
            >
              <div className="p-2 rounded-lg bg-[#00B4A6]/10 text-[#00B4A6]">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#1A1A2E] group-hover:text-[#00B4A6]">
                  Schedule
                </p>
                <p className="text-[11px] text-[#5A5A6E]">Live session agendas</p>
              </div>
            </Link>

            <Link
              href="/resources"
              className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-[#1E2A78] hover:bg-[#1E2A78]/5 transition-colors group"
            >
              <div className="p-2 rounded-lg bg-[#FF6B35]/10 text-[#FF6B35]">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#1A1A2E] group-hover:text-[#FF6B35]">
                  Resource Hub
                </p>
                <p className="text-[11px] text-[#5A5A6E]">Handbooks &amp; guides</p>
              </div>
            </Link>

            <Link
              href="/register"
              className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-[#FF6B35] hover:bg-[#FF6B35]/5 transition-colors group"
            >
              <div className="p-2 rounded-lg bg-[#FF6B35] text-white">
                <ArrowRight className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#1A1A2E] group-hover:text-[#FF6B35]">
                  Registration
                </p>
                <p className="text-[11px] text-[#5A5A6E]">Form-only submission</p>
              </div>
            </Link>
          </div>

          <Button variant="primary" size="md" href="/" fullWidth>
            Return to Conference Floor
          </Button>
        </div>
      </div>
    </div>
  );
}
