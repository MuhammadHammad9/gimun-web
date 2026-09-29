'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Copy } from 'lucide-react';

/**
 * Copies a value (an email address) to the clipboard. The icon turns into a
 * tick for two seconds and a polite live region says so, so the confirmation
 * reaches screen readers as well as eyes.
 */
export function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard refused (permissions or an insecure context): the address stays selectable.
    }
  };

  return (
    <>
      <button type="button" onClick={copy} className="copy-button" data-copied={copied ? '' : undefined} aria-label={label}>
        <Copy aria-hidden="true" strokeWidth={1.75} className="copy-button__idle size-3.5" />
        <Check aria-hidden="true" strokeWidth={2} className="copy-button__done size-3.5" />
      </button>
      <span className="sr-only" role="status" aria-live="polite">
        {copied ? `${value} copied` : ''}
      </span>
    </>
  );
}
