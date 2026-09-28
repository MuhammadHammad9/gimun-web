#!/usr/bin/env node
/**
 * Deployment configuration check, run before `next build` on Vercel.
 *
 * A production deployment with a missing or mismatched variable fails its
 * build here, so the live site is never replaced by one that cannot accept
 * registrations. Preview builds only warn. Run locally with
 * `npm run check:env -- --strict` to test a production-style environment.
 */
import nextEnv from '@next/env';

// Same .env files Next uses locally; on Vercel the variables are already set.
nextEnv.loadEnvConfig(process.cwd());
const env = process.env;
const strict = env.VERCEL_ENV === 'production' || process.argv.includes('--strict');
const errors = [];
const warnings = [];

const has = (name) => Boolean(env[name] && env[name].trim());
const url = (name) => {
  try {
    return new URL(env[name]);
  } catch {
    return null;
  }
};
const require = (name, why) => {
  if (!has(name)) errors.push(`${name} is not set${why ? ` (${why})` : ''}.`);
};

// Site and submission backend
const siteUrlName = has('SITE_URL') ? 'SITE_URL' : 'NEXT_PUBLIC_SITE_URL';
require(siteUrlName, 'canonical links, email links and certificate verification');
const site = url(siteUrlName);
if (has(siteUrlName) && (!site || site.protocol !== 'https:' || ['localhost', '127.0.0.1'].includes(site.hostname))) {
  errors.push(`${siteUrlName} must be the public https:// address of the site.`);
}
if (has('SUBMISSIONS_BACKEND') && env.SUBMISSIONS_BACKEND !== 'supabase') {
  errors.push('SUBMISSIONS_BACKEND must be "supabase" (or unset) in production.');
}
for (const name of ['ALLOW_IN_MEMORY_SUBMISSIONS', 'SUBMISSIONS_TEST_MODE']) {
  if (env[name] === '1') errors.push(`${name} must not be enabled in production.`);
}

// Supabase: server and browser must point at the same project.
require('NEXT_PUBLIC_SUPABASE_URL', 'read at build time by the admin and image config');
require('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'admin sign-in');
if (!has('SUPABASE_SECRET_KEY') && !has('SUPABASE_SERVICE_ROLE_KEY')) {
  errors.push('SUPABASE_SECRET_KEY is not set (server database access).');
}
const serverDb = url(has('SUPABASE_URL') ? 'SUPABASE_URL' : 'NEXT_PUBLIC_SUPABASE_URL');
const browserDb = url('NEXT_PUBLIC_SUPABASE_URL');
if (serverDb && browserDb && serverDb.host !== browserDb.host) {
  errors.push('SUPABASE_URL and NEXT_PUBLIC_SUPABASE_URL point at different Supabase projects.');
}
const secret = env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY || '';
if (secret && secret === env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
  errors.push('The Supabase secret key is the same as the publishable key.');
}
if ((env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '').startsWith('sb_secret_')) {
  errors.push('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY holds a secret key. It would be shipped to every browser.');
}

// Email
require('RESEND_API_KEY', 'receipts, invoices and certificates');
require('EMAIL_FROM', 'sender on your verified Resend domain');
if (has('EMAIL_FROM') && !/@[^@\s>]+\.[^@\s>]+/.test(env.EMAIL_FROM)) errors.push('EMAIL_FROM is not an email address.');
require('NOTIFICATION_EMAIL', 'organizer inbox for new registrations');
for (const address of (env.NOTIFICATION_EMAIL || '').split(',').map((a) => a.trim()).filter(Boolean)) {
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(address)) errors.push(`NOTIFICATION_EMAIL contains an invalid address: ${address}`);
}

// Abuse protection and cron
require('UPSTASH_REDIS_REST_URL');
require('UPSTASH_REDIS_REST_TOKEN');
for (const name of ['RATE_LIMIT_HMAC_SECRET', 'CRON_SECRET']) {
  require(name);
  if (has(name) && env[name].length < 32) errors.push(`${name} must be at least 32 characters (use: openssl rand -hex 32).`);
}
if (has('RATE_LIMIT_HMAC_SECRET') && env.RATE_LIMIT_HMAC_SECRET === env.CRON_SECRET) {
  errors.push('RATE_LIMIT_HMAC_SECRET and CRON_SECRET must be different values.');
}

if (env.ADMIN_REQUIRE_MFA !== '1') warnings.push('ADMIN_REQUIRE_MFA is not 1: admin two-factor sign-in is optional.');

const label = strict ? 'production' : `non-production (${env.VERCEL_ENV || 'local'})`;
for (const w of warnings) console.warn(`[check-env] warning: ${w}`);
if (errors.length) {
  const report = errors.map((e) => `  - ${e}`).join('\n');
  if (strict) {
    console.error(`[check-env] ${errors.length} configuration problem(s) for a ${label} build:\n${report}\nSee GO_LIVE.md, step 4.`);
    process.exit(1);
  }
  console.warn(`[check-env] ${errors.length} configuration gap(s) in a ${label} build (not blocking):\n${report}`);
} else {
  console.log(`[check-env] Configuration looks complete for a ${label} build.`);
}
