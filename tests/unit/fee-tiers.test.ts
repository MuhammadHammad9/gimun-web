import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { siteSchema } from '@/lib/content/registry';
import { currentFeeTier, headlineFee, rupees } from '@/lib/fee-tiers';
import type { SiteConfig } from '@/lib/types';

const seed = siteSchema.parse(JSON.parse(readFileSync('content/site.json', 'utf8'))) as SiteConfig;
const at = (iso: string) => new Date(iso).getTime();
const dated = (active: 'auto' | 'earlyBird' | 'normal' | 'late'): SiteConfig => ({
  ...seed,
  registrationDeadlines: { gimun: '2026-12-01', mootCup: '2026-12-03' },
  feeTiers: { ...seed.feeTiers!, active, earlyBirdEnds: '2026-10-31', normalEnds: '2026-11-20' },
});

describe('fee tiers', () => {
  it('seeds the package fees', () => {
    expect(seed.feeTiers?.gimun.earlyBird.delegate).toBe(9000);
    expect(seed.feeTiers?.gimun.late.delegationFee).toBe(2500);
    expect(seed.feeTiers?.mootCup.normal.teamFee).toBe(3000);
  });

  it('follows the dates, switching the day after each tier ends (Pakistan time)', () => {
    const site = dated('auto');
    expect(currentFeeTier(site, 'gimun', at('2026-10-31T23:00:00+05:00'))?.key).toBe('earlyBird');
    expect(currentFeeTier(site, 'gimun', at('2026-11-01T00:10:00+05:00'))?.key).toBe('normal');
    expect(currentFeeTier(site, 'gimun', at('2026-11-21T09:00:00+05:00'))?.key).toBe('late');
    expect(currentFeeTier(site, 'gimun', at('2026-11-21T09:00:00+05:00'))?.endsOn).toBe('2026-12-01');
  });

  it('runs an undated Normal tier after Early Bird instead of skipping to Late', () => {
    const site: SiteConfig = { ...dated('auto'), feeTiers: { ...dated('auto').feeTiers!, earlyBirdEnds: '2026-10-19', normalEnds: undefined } };
    expect(currentFeeTier(site, 'gimun', at('2026-10-19T23:58:00+05:00'))?.key).toBe('earlyBird');
    const after = currentFeeTier(site, 'gimun', at('2026-10-20T00:01:00+05:00'));
    expect(after?.key).toBe('normal');
    expect(after?.endsOn).toBeUndefined();
  });

  it('ends Late at each track’s own deadline', () => {
    const site = dated('auto');
    const between = at('2026-12-02T12:00:00+05:00');
    expect(currentFeeTier(site, 'gimun', between)).toBeNull();
    expect(currentFeeTier(site, 'mootCup', between)?.key).toBe('late');
  });

  it('lets the admin pick a tier regardless of the dates', () => {
    const tier = currentFeeTier(dated('normal'), 'mootCup', at('2026-10-01T12:00:00+05:00'));
    expect(tier).toMatchObject({ key: 'normal', label: 'Normal', manual: true });
    expect(tier?.endsOn).toBeUndefined();
  });

  it('quotes the headline fee for the tier in force', () => {
    const now = at('2026-11-05T12:00:00+05:00');
    expect(headlineFee(dated('auto'), 'gimun', now)?.amount).toBe(11000);
    expect(headlineFee(dated('auto'), 'mootCup', now)?.amount).toBe(10500);
    expect(rupees(10500)).toBe('Rs 10,500');
  });

  it('rejects tier dates in the wrong order', () => {
    const bad = { ...seed, feeTiers: { ...seed.feeTiers!, earlyBirdEnds: '2026-11-20', normalEnds: '2026-10-31' } };
    expect(siteSchema.safeParse(bad).success).toBe(false);
  });
});
