import type { ReactNode } from 'react';
import { SeatScanner } from '@/components/art/Backdrops';
import { Seal } from '@/components/art/Seal';
import { Magnetic } from '@/components/motion/Magnetic';
import { Button } from '@/components/ui/Button';
import { ChapterKicker } from './Chapter';

export interface ClosingAction {
  label: string;
  href: string;
  variant: 'primary' | 'secondary' | 'track-gimun' | 'track-moot';
}

/**
 * The last chapter of a page: one large line, one short reason, the actions
 * (magnetic on desktop), the no-payment note, and the turning seal.
 */
export function Closing({
  id,
  title,
  lead,
  actions,
  note = 'No online payment is collected at any stage.',
  art,
  chapter,
  act,
  backdrop,
}: {
  id: string;
  title: string;
  lead: ReactNode;
  actions: ClosingAction[];
  note?: string | null;
  art?: ReactNode;
  /** The closing chapter's number and name in the page's story. */
  chapter?: number;
  act?: string;
  /** A decorative layer behind the chapter. Defaults to the seat's scanner on
   *  every page that ends on the seat; pass null for none. */
  backdrop?: ReactNode;
}) {
  return (
    <section className="chapter closing tone-crest" aria-labelledby={id}>
      {backdrop === undefined ? <SeatScanner /> : backdrop}
      <div className="wrap closing__grid">
        <div>
          {chapter !== undefined && act && <ChapterKicker chapter={chapter} act={act} target={id} />}
          <h2 id={id} className="closing__title">
            {title}
          </h2>
          <div className="chapter-lead mt-6">{lead}</div>
          <div className="mt-10 flex flex-wrap gap-3">
            {actions.map((action) => (
              <Magnetic key={action.href + action.label}>
                <Button href={action.href} variant={action.variant} size="lg" withArrow>
                  {action.label}
                </Button>
              </Magnetic>
            ))}
          </div>
          {note && (
            <p className="closing__note">
              <span className="track-dot" aria-hidden="true" style={{ background: 'var(--color-champagne)' }} />
              {note}
            </p>
          )}
        </div>
        {art ?? <Seal id={`${id}-seal`} className="mx-auto max-w-[24rem]" />}
      </div>
    </section>
  );
}
