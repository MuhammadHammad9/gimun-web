import { TransitionLink as Link } from '@/components/motion/TransitionLink';

/**
 * Deliberate "not published yet" state for sections waiting on approved
 * material, so an empty collection reads as planned rather than broken.
 */
export function ComingSoon({
  title,
  description,
  links = [],
}: {
  title: string;
  description: string;
  links?: { label: string; href: string }[];
}) {
  return (
    <div className="mx-auto max-w-2xl rounded-2xl border border-line px-8 py-14 text-center sm:px-12">
      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-champagne">Coming soon</p>
      <h2 className="mt-4 text-2xl font-display font-medium text-balance text-text">{title}</h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-pretty text-text-3">{description}</p>
      {links.length > 0 && (
        <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-3">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm font-medium text-champagne underline-offset-4 hover:underline">
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
