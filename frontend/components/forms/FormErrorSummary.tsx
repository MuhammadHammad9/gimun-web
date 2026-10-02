'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';

/**
 * Moves the visitor to the first invalid control. Tries every error key in
 * order because some keys (e.g. `delegates`) belong to a group rather than a
 * single input.
 */
export function focusFirstError(errors: Record<string, string>) {
  // Wait a frame so newly rendered error text is in the DOM before scrolling.
  requestAnimationFrame(() => {
    for (const key of Object.keys(errors)) {
      const el = document.getElementById(`field-${key}`);
      if (!el) continue;
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (el.matches('input, select, textarea, button')) el.focus({ preventScroll: true });
      return;
    }
    document.getElementById('form-error-summary')?.focus();
  });
}

/**
 * Every validation message in one place above the submit button, so no error
 * is invisible — including ones for fields that are scrolled away or grouped.
 */
export function FormErrorSummary({ errors }: { errors: Record<string, string> }) {
  const entries = Object.entries(errors);
  if (entries.length === 0) return null;

  return (
    <div
      id="form-error-summary"
      role="alert"
      tabIndex={-1}
      className="rounded-xl border border-accent-gimun/40 bg-accent-gimun/8 p-4 text-accent-gimun focus:outline-none"
    >
      <p className="flex items-center gap-2 text-xs font-bold">
        <AlertCircle aria-hidden="true" className="h-4 w-4 shrink-0 text-crimson-hi" />
        {entries.length === 1 ? 'One field needs attention' : `${entries.length} fields need attention`}
      </p>
      <ul className="mt-2 list-disc space-y-1 pl-6 text-xs">
        {entries.map(([key, message]) => (
          <li key={key}>
            <a
              href={`#field-${key}`}
              onClick={(event) => {
                const el = document.getElementById(`field-${key}`);
                if (!el) return;
                event.preventDefault();
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                if (el.matches('input, select, textarea, button')) el.focus({ preventScroll: true });
              }}
              className="underline underline-offset-2 hover:text-text"
            >
              {message}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
