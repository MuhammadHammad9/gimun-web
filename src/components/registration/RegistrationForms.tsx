import { ExternalLink } from 'lucide-react';
import type { SiteConfig } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export type RegistrationFormLink = NonNullable<SiteConfig['registrationForms']>[number];

export function formsFor(site: SiteConfig, track: RegistrationFormLink['track'], kind?: RegistrationFormLink['kind']) {
  return (site.registrationForms ?? []).filter((form) => form.track === track && (!kind || form.kind === kind) && form.href);
}

/**
 * The official registration forms, each a button carrying the form's own name.
 * They open the external form in a new tab; nothing is submitted on this site.
 */
export function RegistrationForms({
  forms,
  track,
  primary = false,
  className,
}: {
  forms: RegistrationFormLink[];
  track: RegistrationFormLink['track'];
  /** Solid track-coloured buttons for participant registration; outlined otherwise. */
  primary?: boolean;
  className?: string;
}) {
  if (forms.length === 0) return null;
  return (
    <ul className={cn('grid gap-3', className)}>
      {forms.map((form) => (
        <li key={form.href} className="flex flex-col gap-1.5">
          <Button
            href={form.href}
            target="_blank"
            rel="noopener noreferrer"
            variant={primary ? (track === 'gimun' ? 'track-gimun' : 'track-moot') : 'secondary'}
            icon={<ExternalLink aria-hidden="true" strokeWidth={1.75} className="size-4" />}
            className="w-full justify-between whitespace-normal text-left sm:max-w-md"
          >
            {form.label}
            <span className="sr-only"> (opens in a new tab)</span>
          </Button>
          {form.description && <p className="pl-5 text-[0.8125rem] text-text-3">{form.description}</p>}
        </li>
      ))}
    </ul>
  );
}
