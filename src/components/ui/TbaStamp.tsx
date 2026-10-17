import { cn } from '@/lib/utils';

/** "To be announced", set as an inked rubber stamp. */
export function TbaStamp({ size = 'md', className }: { size?: 'sm' | 'md'; className?: string }) {
  return (
    <span className={cn('tba-stamp', size === 'sm' && 'tba-stamp--sm', className)} title="Time to be announced">
      <span aria-hidden="true">TBA</span>
      <span className="sr-only">Time to be announced</span>
    </span>
  );
}
