'use client';

import { useState } from 'react';
import { Check, Link2 } from 'lucide-react';

/** Copies a file's public link, and says so. */
export function CopyLink({ url, label }: { url: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className="secondary"
      aria-label={copied ? `Link to ${label} copied` : `Copy link to ${label}`}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 1800);
        } catch {
          window.prompt('Copy this link:', url);
        }
      }}
    >
      {copied ? <Check size={15} aria-hidden="true" /> : <Link2 size={15} aria-hidden="true" />} {copied ? 'Copied' : 'Copy link'}
    </button>
  );
}
