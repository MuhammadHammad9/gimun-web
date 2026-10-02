import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { siteSchema } from '../../shared/lib/content/registry';
import { feeAmount, formatFee, parseFeeText } from '../../shared/lib/fees';
import { canRegister } from '../../shared/lib/phase';
import { getCanonicalEventDateRange } from '../../shared/lib/site-config';
import { pickGimunDelegation } from '../../backend/lib/registration-data';

const site = siteSchema.parse(JSON.parse(readFileSync('shared/content/site.json', 'utf8')));

describe('fees', () => {
  it('reads amounts from display text without mangling separators', () => {
    expect(parseFeeText('Rs. 4,500')).toBe(4500);
    expect(parseFeeText('PKR 4,500.50')).toBe(4500.5);
    expect(parseFeeText('PKR 12000')).toBe(12000);
    expect(parseFeeText('Free')).toBeNull();
    expect(parseFeeText(undefined)).toBeNull();
  });
  it('prefers the explicit numeric amount from settings', () => {
    expect(feeAmount({ ...site, fees: { ...site.fees, mootCupTeam: 'Contact us' }, feeAmounts: { gimunIndividual: 1, gimunDelegationPerDelegate: 2, mootCupTeam: 3 } }, 'mootCupTeam')).toBe(3);
    expect(feeAmount({ ...site, feeAmounts: undefined }, 'gimunIndividual')).toBe(4500);
  });
  it('formats totals in the display currency', () => {
    expect(formatFee(12000, 'PKR 4,000')).toBe('PKR 12,000');
  });
});

describe('registration state', () => {
  const open = { ...site, phaseOverride: undefined, registrationStatus: { gimunOpen: true, mootCupOpen: true } };
  it('honours each track deadline separately', () => {
    const betweenDeadlines = Date.parse('2027-02-20T00:00:00Z');
    expect(canRegister(open, 'gimun', betweenDeadlines)).toBe(false);
    expect(canRegister(open, 'mootCup', betweenDeadlines)).toBe(true);
  });
  it('honours the manual switch and the phase override', () => {
    const early = Date.parse('2026-12-01T00:00:00Z');
    expect(canRegister({ ...open, registrationStatus: { gimunOpen: false, mootCupOpen: true } }, 'gimun', early)).toBe(false);
    expect(canRegister({ ...open, phaseOverride: 'registration-closed' }, 'mootCup', early)).toBe(false);
  });
});

describe('dates', () => {
  it('formats the event range compactly', () => {
    expect(getCanonicalEventDateRange({ ...site, eventDates: { start: '2027-03-18', end: '2027-03-21' } })).toBe('March 18–21, 2027');
    expect(getCanonicalEventDateRange({ ...site, eventDates: { start: '2027-03-30', end: '2027-04-02' } })).toBe('March 30 – April 2, 2027');
  });
});

describe('stored registration data', () => {
  it('drops fields the form does not collect', () => {
    const picked = pickGimunDelegation({ delegationHeadName: 'A', extra: 'x'.repeat(1000), delegates: [{ name: 'B', email: 'b@x.test', injected: true }] });
    expect(picked).not.toHaveProperty('extra');
    expect(picked.delegates[0]).not.toHaveProperty('injected');
    expect(picked.delegateCount).toBe(1);
  });
});

import { rateLimitSubject } from '../../backend/server/submissions';
describe('rate limit subjects', () => {
  it('groups IPv6 addresses by /64 and keeps IPv4 exact', () => {
    expect(rateLimitSubject('203.0.113.7')).toBe('203.0.113.7');
    expect(rateLimitSubject('2001:db8:abcd:12::1')).toBe('2001:db8:abcd:12::/64');
    expect(rateLimitSubject('2001:0db8:abcd:0012:ffff:1:2:3')).toBe(rateLimitSubject('2001:db8:abcd:12::99'));
  });
});
