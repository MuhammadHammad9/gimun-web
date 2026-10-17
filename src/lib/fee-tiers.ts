import type { SiteConfig } from './types';
import type { feeTierKeys } from './content/registry';
import type { RegistrationTrack } from './phase';
import { isRegistrationDeadlinePassed } from './site-config';

export type FeeTierKey = typeof feeTierKeys[number];
export type FeeTiers = NonNullable<SiteConfig['feeTiers']>;
export type GimunTierFees = FeeTiers['gimun']['earlyBird'];
export type MootTierFees = FeeTiers['mootCup']['earlyBird'];

export const FEE_TIER_ORDER: readonly FeeTierKey[] = ['earlyBird', 'normal', 'late'];
export const FEE_TIER_LABELS: Record<FeeTierKey, string> = { earlyBird: 'Early Bird', normal: 'Normal', late: 'Late' };

export type CurrentTier = {
  key: FeeTierKey;
  label: string;
  /** Set by hand in the admin rather than worked out from the dates. */
  manual: boolean;
  /** Last day of this tier (Pakistan time), when the dates say so. */
  endsOn?: string;
  /** The tier that follows, when there is one. */
  next?: FeeTierKey;
};

/** The last day of each tier for one track: Late always ends at the track's registration deadline. */
export function tierEndDates(site: SiteConfig, track: RegistrationTrack): Record<FeeTierKey, string | undefined> {
  const tiers = site.feeTiers;
  return { earlyBird: tiers?.earlyBirdEnds, normal: tiers?.normalEnds, late: site.registrationDeadlines[track] };
}

/**
 * The fee tier in force for a track. A tier picked in the admin wins; otherwise
 * the first tier whose end date has not passed. Returns null when no tiers are
 * configured, or every window (including the registration deadline) is over.
 */
export function currentFeeTier(site: SiteConfig, track: RegistrationTrack, now = Date.now()): CurrentTier | null {
  const tiers = site.feeTiers;
  if (!tiers) return null;
  const ends = tierEndDates(site, track);
  const describe = (key: FeeTierKey, manual: boolean): CurrentTier => {
    const index = FEE_TIER_ORDER.indexOf(key);
    return { key, label: FEE_TIER_LABELS[key], manual, endsOn: manual ? undefined : ends[key], next: FEE_TIER_ORDER[index + 1] };
  };
  if (tiers.active !== 'auto') return describe(tiers.active, true);
  // A tier without an end date runs until the next tier's end date, so an
  // undated Normal tier follows Early Bird rather than being skipped.
  const open = (end: string | undefined) => Boolean(end) && !isRegistrationDeadlinePassed(end!, now);
  const key = FEE_TIER_ORDER.find((tier, index) =>
    ends[tier] ? open(ends[tier]) : FEE_TIER_ORDER.slice(index + 1).some((later) => open(ends[later])),
  );
  return key ? describe(key, false) : null;
}

export function gimunFees(site: SiteConfig, tier: FeeTierKey): GimunTierFees | null {
  return site.feeTiers?.gimun[tier] ?? null;
}

export function mootFees(site: SiteConfig, tier: FeeTierKey): MootTierFees | null {
  return site.feeTiers?.mootCup[tier] ?? null;
}

/**
 * The one fee to quote in a summary: per delegate for GIMUN, per team member
 * for GMC, at the tier in force. Null when no tier applies.
 */
export function headlineFee(site: SiteConfig, track: RegistrationTrack, now = Date.now()): { tier: CurrentTier; amount: number } | null {
  const tier = currentFeeTier(site, track, now);
  if (!tier) return null;
  const amount = track === 'gimun' ? gimunFees(site, tier.key)?.delegate : mootFees(site, tier.key)?.teamMember;
  return amount === undefined ? null : { tier, amount };
}

export function rupees(amount: number) {
  return `Rs ${new Intl.NumberFormat('en-US').format(amount)}`;
}
