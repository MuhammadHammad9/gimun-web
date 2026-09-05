'use client';

import React, { useState } from 'react';
import Link from 'next/link';

import type { SiteConfig } from '@/lib/types';

interface NavbarProps {
  siteConfig?: SiteConfig;
}

export function Navbar({ siteConfig }: NavbarProps = {}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-surface/80 backdrop-blur-md border-b border-whisper-border">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-heading font-bold text-lg text-ink flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-accent inline-block" />
          <span>{siteConfig?.eventNames?.combined || 'GIMUN & Moot Cup'}</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-ink/80">
          <Link href="/gimun" className="hover:text-accent transition-colors">GIMUN</Link>
          <Link href="/moot-cup" className="hover:text-secondary transition-colors">Moot Cup</Link>
          <Link href="/schedule" className="hover:text-primary transition-colors">Schedule</Link>
          <Link href="/resources" className="hover:text-primary transition-colors">Resources</Link>
          <Link href="/about" className="hover:text-primary transition-colors">About</Link>
          <Link
            href="/register"
            className="px-4 py-2 rounded-button bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors shadow-button"
          >
            Register
          </Link>
        </nav>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 rounded-lg text-ink"
          aria-label="Toggle Navigation Menu"
        >
          <span className="font-mono text-xs">MENU</span>
        </button>
      </div>
    </header>
  );
}
