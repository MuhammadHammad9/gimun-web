'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Calendar,
  Camera,
  Layers,
  ZoomIn,
} from 'lucide-react';
import type { GalleryItem } from '@/lib/types';

interface GalleryClientProps {
  initialItems: GalleryItem[];
}

type CategoryTab = 'all' | 'gimun' | 'moot-cup' | 'campus' | 'ceremonies';

const CATEGORY_TABS: { id: CategoryTab; label: string }[] = [
  { id: 'all', label: 'All Archives' },
  { id: 'gimun', label: 'GIMUN Debates' },
  { id: 'moot-cup', label: 'GMC Courtroom' },
  { id: 'campus', label: 'Campus & Culture' },
  { id: 'ceremonies', label: 'Ceremonies & Awards' },
];

export function GalleryClient({ initialItems }: GalleryClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<CategoryTab>('all');
  const [activeLightboxIndex, setActiveLightboxIndex] = useState<number | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const lastTriggerRef = useRef<HTMLElement | null>(null);

  const closeLightbox = useCallback(() => {
    setActiveLightboxIndex(null);
    requestAnimationFrame(() => lastTriggerRef.current?.focus());
  }, []);

  const openLightbox = useCallback((index: number, trigger: HTMLElement) => {
    lastTriggerRef.current = trigger;
    setActiveLightboxIndex(index);
  }, []);

  // Filtered list based on active tab
  const filteredItems = selectedCategory === 'all'
    ? initialItems
    : initialItems.filter((item) => item.category === selectedCategory);

  // Keyboard navigation for Lightbox
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (activeLightboxIndex === null) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        closeLightbox();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setActiveLightboxIndex((prev) =>
          prev !== null ? (prev + 1) % filteredItems.length : null
        );
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setActiveLightboxIndex((prev) =>
          prev !== null ? (prev - 1 + filteredItems.length) % filteredItems.length : null
        );
      } else if (e.key === 'Tab') {
        const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable || focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    [activeLightboxIndex, closeLightbox, filteredItems.length]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Lock body scroll when Lightbox is active
  useEffect(() => {
    if (activeLightboxIndex !== null) {
      document.body.style.overflow = 'hidden';
      closeButtonRef.current?.focus();
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [activeLightboxIndex]);

  const activeItem = activeLightboxIndex !== null ? filteredItems[activeLightboxIndex] : null;

  return (
    <div className="space-y-10">
      {/* Category Filter Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-4">
        {CATEGORY_TABS.map((tab) => {
          const count = tab.id === 'all'
            ? initialItems.length
            : initialItems.filter((i) => i.category === tab.id).length;
          const isActive = selectedCategory === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => {
                setSelectedCategory(tab.id);
                setActiveLightboxIndex(null);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-primary text-white shadow-sm ring-2 ring-primary/20'
                  : 'bg-white text-ink-light hover:bg-slate-100 border border-slate-200/80 hover:text-ink'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-neutral-gray'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Asymmetric Bento Media Grid */}
      <h2 className="sr-only">Visual Archive Albums and Curated Sessions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item, index) => {
          const isWide = item.aspectRatio === 'wide';

          return (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.3 }}
              className={`group relative overflow-hidden rounded-2xl border border-whisper-border bg-surface-elevated shadow-card hover:shadow-card-hover transition-all duration-300 cursor-pointer ${
                isWide ? 'sm:col-span-2' : 'col-span-1'
              }`}
              role="button"
              tabIndex={0}
              aria-haspopup="dialog"
              aria-label={`Open gallery image: ${item.title}`}
              onClick={(event) => openLightbox(index, event.currentTarget)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  openLightbox(index, event.currentTarget);
                }
              }}
            >
              <div className="relative w-full h-64 sm:h-72 overflow-hidden bg-slate-900 flex flex-col justify-between p-5 text-white">
                {item.image && (
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover"
                  />
                )}
                {/* Decorative Grid Pattern Overlay */}
                <div
                  className="absolute inset-0 opacity-10 pointer-events-none"
                  style={{
                    backgroundImage:
                      'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
                    backgroundSize: '24px 24px',
                  }}
                />

                {/* Top Badges */}
                <div className="relative z-10 flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider bg-black/60 text-white border border-white/20">
                    <Calendar className="w-3 h-3 text-accent" />
                    <span>{item.edition}</span>
                  </span>

                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono uppercase bg-black/50 text-white/90 border border-white/20">
                    <Layers className="w-3 h-3" />
                    <span>{item.category.replace('-', ' ')}</span>
                  </span>
                </div>

                {/* Zoom Hint Icon in Center (Hover State) */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                  <div className="w-12 h-12 rounded-full bg-black/50 border border-white/30 flex items-center justify-center text-white transform group-hover:scale-110 transition-transform">
                    <ZoomIn className="w-6 h-6" />
                  </div>
                </div>

                {/* Bottom Canvas Tag */}
                <div className="relative z-10 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-white/80 font-mono">
                    <MapPin className="w-3.5 h-3.5 text-accent shrink-0" />
                    <span className="truncate">{item.location}</span>
                  </div>
                </div>
              </div>

              {/* Information Panel Below Media */}
              <div className="p-5 space-y-2 bg-surface-elevated">
                <h3 className="text-base font-heading font-bold text-ink group-hover:text-primary transition-colors leading-snug">
                  {item.title}
                </h3>
                <p className="text-xs text-neutral-gray line-clamp-2 leading-relaxed">
                  {item.caption}
                </p>
                <div className="pt-2 flex items-center justify-between text-[11px] font-mono text-neutral-gray border-t border-slate-100">
                  <span className="capitalize">{item.aspectRatio} format</span>
                  <span className="text-primary font-semibold group-hover:underline">
                    View in High Resolution &rarr;
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {activeItem && activeLightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 bg-black/85 backdrop-blur-md"
              role="presentation"
              onClick={closeLightbox}
            >
            {/* Modal Container */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="gallery-lightbox-title"
              className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-2xl bg-surface-elevated border border-slate-700/50 shadow-2xl flex flex-col text-white"
            >
              {/* Modal Top Control Bar */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90 sticky top-0 z-20">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold uppercase bg-primary/30 text-accent border border-accent/30">
                    {activeItem.edition}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    {activeLightboxIndex + 1} of {filteredItems.length}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setActiveLightboxIndex((prev) =>
                        prev !== null ? (prev - 1 + filteredItems.length) % filteredItems.length : null
                      )
                    }
                    className="p-2 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() =>
                      setActiveLightboxIndex((prev) =>
                        prev !== null ? (prev + 1) % filteredItems.length : null
                      )
                    }
                    className="p-2 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>

                  <button
                    ref={closeButtonRef}
                    onClick={closeLightbox}
                    className="p-2 ml-2 rounded-full hover:bg-rose-500/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
                    aria-label="Close modal"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Full Art Canvas Display */}
              <div
                className="relative w-full h-80 sm:h-96 md:h-[420px] bg-slate-900 flex flex-col justify-end p-6 sm:p-8"
              >
                {activeItem.image && (
                  <Image
                    src={activeItem.image}
                    alt={activeItem.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 896px"
                    className="object-cover"
                  />
                )}
                <div
                  className="absolute inset-0 opacity-15 pointer-events-none"
                  style={{
                    backgroundImage:
                      'radial-gradient(circle at 1px 1px, white 1.5px, transparent 0)',
                    backgroundSize: '28px 28px',
                  }}
                />

                <div className="relative z-10 space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-black/70 text-xs font-mono text-white/90 border border-white/20">
                    <Camera className="w-3.5 h-3.5 text-accent" />
                    <span>Official Symposium Photographic Archive</span>
                  </div>
                  <h2 id="gallery-lightbox-title" className="text-xl sm:text-3xl font-heading font-extrabold text-white tracking-tight">
                    {activeItem.title}
                  </h2>
                </div>
              </div>

              {/* Detailed Captions & Metadata Drawer */}
              <div className="p-6 sm:p-8 bg-slate-900 space-y-4">
                <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-accent" />
                    <span className="text-white font-medium">{activeItem.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-accent" />
                    <span className="text-white font-medium">{activeItem.edition}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-accent" />
                    <span className="capitalize">{activeItem.category.replace('-', ' ')}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800">
                  <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                    {activeItem.caption}
                  </p>
                </div>

                <div className="pt-4 flex items-center justify-between text-xs font-mono text-slate-500">
                  <span>Use &larr; / &rarr; keys to cycle through records &bull; ESC to exit</span>
                  <button
                    onClick={closeLightbox}
                    className="text-accent hover:underline font-semibold"
                  >
                    Close Preview
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
