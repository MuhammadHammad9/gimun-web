'use client';

import { Monitor, Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

type ThemeChoice = 'light' | 'dark' | 'system';

const storageKey = 'gimun-theme';

function applyTheme(choice: ThemeChoice) {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const resolved = choice === 'system' ? (prefersDark ? 'dark' : 'light') : choice;
  document.documentElement.dataset.theme = resolved;
  document.documentElement.dataset.themeChoice = choice;
}

export function ThemeToggle() {
  const [choice, setChoice] = useState<ThemeChoice>(() => {
    if (typeof window === 'undefined') return 'system';
    const stored = window.localStorage.getItem(storageKey);
    return stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';
  });

  useEffect(() => {
    applyTheme(choice);

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      if (choice === 'system') applyTheme('system');
    };
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [choice]);

  const nextChoice: ThemeChoice =
    choice === 'system' ? 'light' : choice === 'light' ? 'dark' : 'system';
  const Icon = choice === 'system' ? Monitor : choice === 'light' ? Sun : Moon;
  const label =
    choice === 'system'
      ? 'Using system theme. Switch to light theme'
      : choice === 'light'
        ? 'Using light theme. Switch to dark theme'
        : 'Using dark theme. Switch to system theme';

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={() => {
        window.localStorage.setItem(storageKey, nextChoice);
        setChoice(nextChoice);
        applyTheme(nextChoice);
      }}
      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line-2 bg-raised/80 text-text-2 shadow-[var(--theme-shadow-sm)] transition-[background-color,border-color,color,transform] duration-200 hover:border-line-3 hover:bg-elevated hover:text-text active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-champagne focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
    >
      <Icon aria-hidden="true" className="h-4 w-4" />
    </button>
  );
}
