'use client';

import { useSyncExternalStore, type MouseEvent } from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';
import { readThemeChoice, saveThemeChoice, subscribeTheme, type ThemeChoice } from '@frontend/lib/theme';
import { prefersReducedMotion } from '@frontend/motion/policy';
import { cssEase } from '@frontend/motion/tokens';
import { cn } from '@frontend/lib/utils';

const CHOICES: { value: ThemeChoice; label: string; Icon: typeof Sun }[] = [
  { value: 'system', label: 'System', Icon: Monitor },
  { value: 'light', label: 'Light', Icon: Sun },
  { value: 'dark', label: 'Dark', Icon: Moon },
];

const NEXT: Record<ThemeChoice, ThemeChoice> = { system: 'light', light: 'dark', dark: 'system' };

/** Server and first client render agree on "system"; the real choice follows. */
function useThemeChoice(): ThemeChoice {
  return useSyncExternalStore(subscribeTheme, readThemeChoice, () => 'system');
}

type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => void) => { ready: Promise<void> };
};

/**
 * Switches the theme with a circular reveal from the control that was
 * pressed, where the browser supports view transitions and motion is welcome.
 */
function switchTheme(choice: ThemeChoice, event: MouseEvent<HTMLElement>) {
  const doc = document as ViewTransitionDocument;
  if (!doc.startViewTransition || prefersReducedMotion()) {
    saveThemeChoice(choice);
    return;
  }
  const rect = event.currentTarget.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;
  const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
  const root = document.documentElement;
  root.dataset.themeSwitching = '';
  const transition = doc.startViewTransition(() => saveThemeChoice(choice));
  transition.ready
    .then(() =>
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 560, easing: cssEase('expo'), pseudoElement: '::view-transition-new(root)' },
      ).finished,
    )
    .catch(() => undefined)
    .finally(() => delete root.dataset.themeSwitching);
}

export function ThemeSwitch({ variant = 'icon', className }: { variant?: 'icon' | 'segmented'; className?: string }) {
  const choice = useThemeChoice();

  if (variant === 'segmented') {
    return (
      <div role="group" aria-label="Colour theme" className={cn('theme-segmented', className)}>
        {CHOICES.map(({ value, label, Icon }) => (
          <button
            key={value}
            type="button"
            aria-pressed={choice === value}
            onClick={(event) => switchTheme(value, event)}
            className="theme-segmented__option"
          >
            <Icon aria-hidden="true" strokeWidth={1.5} className="size-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>
    );
  }

  const current = CHOICES.find((c) => c.value === choice) ?? CHOICES[0];
  const next = CHOICES.find((c) => c.value === NEXT[choice]) ?? CHOICES[1];
  const label = `Theme: ${current.label}. Switch to ${next.label.toLowerCase()}`;
  return (
    <button
      type="button"
      aria-label={label}
      data-tip={`${current.label} theme`}
      onClick={(event) => switchTheme(next.value, event)}
      className={cn('theme-icon', className)}
    >
      <current.Icon aria-hidden="true" strokeWidth={1.5} className="size-[1.125rem]" />
    </button>
  );
}
