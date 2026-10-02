import type { SiteConfig } from './types';

export type FeeKind = 'gimunIndividual' | 'gimunDelegationPerDelegate' | 'mootCupTeam';

/**
 * Reads the first amount from display text such as "PKR 4,500" or
 * "Rs. 4,500.00". Returns null when there is no usable number, instead of
 * guessing: the old strip-everything regex turned "Rs. 4,500" into 0.45.
 */
export function parseFeeText(text: string | undefined): number | null {
  if (!text) return null;
  const match = text.match(/(\d{1,3}(?:,\d{3})+|\d+)(\.\d+)?/);
  if (!match) return null;
  const value = Number(`${match[1].replace(/,/g, '')}${match[2] ?? ''}`);
  return Number.isFinite(value) && value >= 0 ? value : null;
}

/** The numeric fee: the explicit amount from settings, else parsed from the display text. */
export function feeAmount(site: SiteConfig, kind: FeeKind): number | null {
  const explicit = site.feeAmounts?.[kind];
  if (typeof explicit === 'number' && Number.isFinite(explicit) && explicit >= 0) return explicit;
  return parseFeeText(site.fees[kind]);
}

/** Formats an amount in the currency used by the fee's display text (e.g. "PKR 12,000"). */
export function formatFee(amount: number, displayTemplate: string) {
  const prefix = displayTemplate.match(/^[^\d]*/)?.[0].trim() || 'PKR';
  return `${prefix} ${new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(amount)}`;
}
