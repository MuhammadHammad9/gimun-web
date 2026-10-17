import type { SiteConfig } from '@/lib/types';
import type { RegistrationTrack } from '@/lib/phase';
import { currentFeeTier, FEE_TIER_LABELS, FEE_TIER_ORDER, rupees, tierEndDates, type FeeTierKey } from '@/lib/fee-tiers';
import { formatEventDate } from '@/lib/site-config';
import { cn } from '@/lib/utils';
import PixelCard from '@/components/reactbits/PixelCard';
import bundledSiteData from '../../../content/site.json';

type Row = { label: string; note: string; amounts: Record<FeeTierKey, number | undefined> };

function rows(site: SiteConfig, track: RegistrationTrack): Row[] {
  const tiers = site.feeTiers;
  if (!tiers) return [];
  const pick = <T,>(get: (tier: FeeTierKey) => T) => Object.fromEntries(FEE_TIER_ORDER.map((tier) => [tier, get(tier)])) as Record<FeeTierKey, T>;
  if (track === 'gimun') {
    const g = tiers.gimun;
    return [
      { label: 'Per delegate', note: 'An individual attending without a delegation', amounts: pick((t) => g[t].delegate) },
      { label: 'Per delegation member', note: 'Paid by each individual in a delegation', amounts: pick((t) => g[t].delegationMember) },
      { label: 'Delegation registration fee', note: 'Once per delegation', amounts: pick((t) => g[t].delegationFee) },
      { label: 'Per observer', note: 'Views sessions without speaking or voting rights', amounts: pick((t) => g[t].observer) },
      { label: 'Per chaperone', note: 'Accompanying faculty, advisor, coach or guardian', amounts: pick((t) => g[t].chaperone) },
    ];
  }
  const m = tiers.mootCup;
  return [
    { label: 'Per team member', note: 'Each speaker or researcher', amounts: pick((t) => m[t].teamMember) },
    { label: 'Team fee', note: 'Once per team', amounts: pick((t) => m[t].teamFee) },
    { label: 'Per observer', note: 'Watches the rounds without competing', amounts: pick((t) => m[t].observer) },
    { label: 'Per coach', note: 'Accompanying the team', amounts: pick((t) => m[t].coach) },
  ];
}

/** One line on the tier in force: "Early Bird fees apply until 20 November". */
export function CurrentTierNote({ site, track, now, className }: { site: SiteConfig; track: RegistrationTrack; now: number; className?: string }) {
  const tier = currentFeeTier(site, track, now);
  if (!tier) return null;
  return (
    <p className={cn('text-small text-text-2', className)}>
      <strong className="font-semibold text-text">{tier.label} fees apply now</strong>
      {tier.endsOn ? <>, until {formatEventDate(tier.endsOn, { year: undefined })}.</> : '.'}
      {tier.endsOn && tier.next ? ` ${FEE_TIER_LABELS[tier.next]} fees apply after that.` : ''}
    </p>
  );
}

/** One track's three tier cards. The other track renders in its own section. */
export function FeeTiers({ site, track, now, className }: { site: SiteConfig; track: RegistrationTrack; now: number; className?: string }) {
  const hasLiveTiers = Boolean(site.feeTiers);
  const pricingSite: SiteConfig = hasLiveTiers
    ? site
    : { ...site, feeTiers: bundledSiteData.feeTiers as SiteConfig['feeTiers'] };
  const fees = rows(pricingSite, track);
  const ends = tierEndDates(site, track);
  const current = hasLiveTiers ? currentFeeTier(site, track, now) : null;
  const gimun = track === 'gimun';

  return (
    <div className={cn('fee-tiers grid gap-5 md:grid-cols-2 lg:grid-cols-3', className)}>
      {FEE_TIER_ORDER.map((key, index) => {
        const isCurrent = current?.key === key;

        return (
          <PixelCard
            key={key}
            className={cn('fee-tier-card', isCurrent && 'fee-tier-card--current')}
            colors={gimun ? ['#e11d48', '#fda4af', '#8e5950'] : ['#ecd8b7', '#cca876', '#8e5950']}
            glowColor={gimun ? '#e11d48' : '#cca876'}
            shape="diamond"
            origin="pointer"
            gap={12}
            pixelSize={3.2}
            speed={0}
            revealDuration={600}
            spotlight={0.45}
            glow={0.25}
            opacity={0.28}
            fade={0.75}
            trigger="auto"
            radius={24}
            introDelay={index * 110}
            noFocus
          >
            <div className="flex h-full flex-col p-5 sm:p-6">
              <header className="border-b border-line-2 pb-5">
                <h4 className="font-display text-[1.75rem] font-medium leading-tight text-text">{FEE_TIER_LABELS[key]}</h4>
                {isCurrent && <p className="mt-1 font-mono text-xs font-semibold text-champagne">Current tier</p>}
                {!hasLiveTiers && <p className="mt-1 font-mono text-xs text-text-3">2026 reference rates</p>}
                {hasLiveTiers && ends[key] && (
                  <p className="mt-1 font-mono text-xs text-text-3">Until {formatEventDate(ends[key]!, { month: 'short', year: undefined })}</p>
                )}
              </header>

              <dl className="space-y-4 py-5">
                {fees.map((row) => (
                  <div key={row.label} className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                    <dt>
                      <span className="block text-sm font-medium leading-snug text-text">{row.label}</span>
                      <span className="mt-0.5 block text-xs leading-snug text-text-3">{row.note}</span>
                    </dt>
                    <dd className="whitespace-nowrap font-mono text-sm font-semibold tabular-nums text-text-2">
                      {row.amounts[key] === undefined ? 'Not listed' : rupees(row.amounts[key]!)}
                    </dd>
                  </div>
                ))}
              </dl>

              <p className="mt-auto border-t border-line pt-4 text-xs leading-relaxed text-text-3">
                {hasLiveTiers
                  ? 'The fee in force when the host team receives payment and documents by mail applies. Registration fees are non-refundable.'
                  : 'These are 2026 reference amounts. Confirm current fees with the registration team before paying.'}
              </p>
            </div>
          </PixelCard>
        );
      })}
    </div>
  );
}
