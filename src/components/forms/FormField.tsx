'use client';

import React from 'react';

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

export function FormField({
  label,
  error,
  required,
  description,
  children,
  id,
  className = '',
}: FormFieldProps) {
  return (
    <div
      className={`space-y-1.5 text-left ${className}`}
    >
      <div className="flex items-baseline justify-between gap-2">
        <label
          htmlFor={id}
          className="block text-xs font-semibold uppercase tracking-wider text-champagne"
        >
          {label}{' '}
          {required && (
            <span className="text-champagne font-bold">
              *
            </span>
          )}
        </label>
      </div>

      {description && (
        <p className="text-[11px] text-champagne/70 leading-snug">{description}</p>
      )}

      {children}

      <>
        {error && (
          <p
            key={error}
            className="field-error flex items-center gap-1.5 pt-0.5 text-xs font-medium text-crimson-soft"
          >
            <span aria-hidden="true" className="inline-block h-1 w-1 rounded-full bg-crimson-hi" />
            {error}
          </p>
        )}
      </>
    </div>
  );
}
