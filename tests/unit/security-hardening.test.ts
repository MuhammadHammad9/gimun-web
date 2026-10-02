import { createHash } from 'node:crypto';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { isLocalPath, registry } from '../../shared/lib/content/registry';
import { clientIp, rateLimitSubject } from '../../backend/server/submissions';
import { adminCsp, publicCsp } from '../../backend/lib/csp';
import { HEAD_BOOT_SCRIPT, NOTICE_KEY_ATTRIBUTE } from '../../frontend/lib/boot-script';

afterEach(() => vi.unstubAllEnvs());

describe('CMS links stay on this site unless they are plain HTTPS', () => {
  it('accepts ordinary local paths', () => {
    for (const path of ['/', '/register', '/about/faq#fees', '/resources?track=gimun', '/gimun/committees/unsc']) expect(isLocalPath(path)).toBe(true);
  });
  it('refuses paths a browser would send to another host', () => {
    for (const path of ['//evil.example', '/\\evil.example', '/\t/evil.example', '/\n/evil.example', '/ /evil.example', 'evil.example', 'javascript:alert(1)']) {
      expect(isLocalPath(path)).toBe(false);
    }
  });
  it('applies to sponsor links, which are not checked against known pages', () => {
    const sponsor = { id: 's1', name: 'Sponsor', tier: 'gold', logo: '/logo.png', url: '' };
    expect(registry.sponsors.safeParse({ ...sponsor, url: 'https://sponsor.example' }).success).toBe(true);
    expect(registry.sponsors.safeParse({ ...sponsor, url: '/\\evil.example' }).success).toBe(false);
    expect(registry.sponsors.safeParse({ ...sponsor, url: 'http://sponsor.example' }).success).toBe(false);
    expect(registry.sponsors.safeParse({ ...sponsor, url: 'https://sponsor.example/a b' }).success).toBe(false);
  });
});

describe('client address for rate limiting', () => {
  const request = (headers: Record<string, string>) => new Request('http://localhost', { headers });
  it('ignores x-real-ip and prepended forwarding entries off Vercel', () => {
    vi.stubEnv('VERCEL', '');
    expect(clientIp(request({ 'x-real-ip': '6.6.6.6', 'x-forwarded-for': '6.6.6.6, 203.0.113.9' }))).toBe('203.0.113.9');
  });
  it('counts TRUSTED_PROXY_HOPS from the right', () => {
    vi.stubEnv('VERCEL', '');
    vi.stubEnv('TRUSTED_PROXY_HOPS', '2');
    expect(clientIp(request({ 'x-forwarded-for': '6.6.6.6, 203.0.113.9, 10.0.0.2' }))).toBe('203.0.113.9');
  });
  it("uses Vercel's own header on Vercel", () => {
    vi.stubEnv('VERCEL', '1');
    expect(clientIp(request({ 'x-vercel-forwarded-for': '198.51.100.7', 'x-forwarded-for': '6.6.6.6' }))).toBe('198.51.100.7');
  });
  it('groups IPv6 by /64 but leaves emails and composite keys alone', () => {
    expect(rateLimitSubject('2001:db8:1:2:3:4:5:6')).toBe('2001:db8:1:2::/64');
    expect(rateLimitSubject('owner@example.org')).toBe('owner@example.org');
    expect(rateLimitSubject('owner@example.org|2001:db8:1:2::/64')).toBe('owner@example.org|2001:db8:1:2::/64');
  });
});

describe('Content Security Policies', () => {
  it('pins admin scripts to the nonce and the boot script hash, with no inline escape hatch', () => {
    const policy = adminCsp('abc123', 'HASH');
    const scripts = policy.split('; ').find((d) => d.startsWith('script-src'))!;
    expect(scripts).toContain("'nonce-abc123'");
    expect(scripts).toContain("'sha256-HASH'");
    expect(scripts).toContain("'strict-dynamic'");
    expect(scripts).not.toContain('unsafe-inline');
    expect(policy).toContain("frame-ancestors 'none'");
    expect(policy).toContain("object-src 'none'");
  });
  it('lets the public forms load Cloudflare Turnstile', () => {
    const policy = publicCsp();
    expect(policy).toMatch(/script-src[^;]*https:\/\/challenges\.cloudflare\.com/);
    expect(policy).toMatch(/frame-src[^;]*https:\/\/challenges\.cloudflare\.com/);
  });
  it('keeps the head boot script constant, so its hash in the admin policy stays valid', () => {
    // The script must not embed per-page data; the notice key comes from <html>.
    expect(HEAD_BOOT_SCRIPT).toContain(NOTICE_KEY_ATTRIBUTE);
    expect(HEAD_BOOT_SCRIPT).not.toMatch(/gimun_announcement_dismissed_/);
    expect(createHash('sha256').update(HEAD_BOOT_SCRIPT).digest('base64')).toMatch(/^[A-Za-z0-9+/]{43}=$/);
  });
});
