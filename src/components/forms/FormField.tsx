'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  description?: string;
  track?: 'gimun' | 'moot-cup';
  children: React.ReactNode;
  id?: string;
  className?: string;
}

const shakeVariants = {
  idle: { x: 0 },
  shake: {
    x: [0, -6, 6, -4, 4, -2, 2, 0],
    transition: { duration: 0.4, ease: 'easeInOut' as const },
  },
};

export function FormField({
  label,
  error,
  required,
  description,
  track,
  children,
  id,
  className = '',
}: FormFieldProps) {
  return (
    <motion.div
      variants={shakeVariants}
      animate={error ? 'shake' : 'idle'}
      className={`space-y-1.5 text-left ${className}`}
    >
      <div className="flex items-baseline justify-between gap-2">
        <label
          htmlFor={id}
          className="block text-xs font-semibold uppercase tracking-wider text-ink/80"
        >
          {label}{' '}
          {required && (
            <span
              className={
                track === 'moot-cup' ? 'text-secondary font-bold' : 'text-accent font-bold'
              }
            >
              *
            </span>
          )}
        </label>
      </div>

      {description && (
        <p className="text-[11px] text-neutral-gray leading-snug">{description}</p>
      )}

      {children}

      <AnimatePresence mode="wait">
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="text-xs text-[#E11D48] font-medium flex items-center gap-1.5 pt-0.5"
          >
            <span className="inline-block w-1 h-1 rounded-full bg-[#E11D48]" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
