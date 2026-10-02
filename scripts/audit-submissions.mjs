import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const serviceSource = fs.readFileSync(path.join(rootDir, 'src/lib/server/submissions.ts'), 'utf8');
const migrationSource = fs.readFileSync(path.join(rootDir, 'supabase/migrations/0002_submission_outbox.sql'), 'utf8');
// Migration 0004 supersedes the original submission functions with the _v2
// pair, which is what the service now calls. Both are checked so the contract
// holds whichever generation the service targets.
const migrationSourceV2 = fs.readFileSync(path.join(rootDir, 'supabase/migrations/0004_registration_ops.sql'), 'utf8');
const cronSource = fs.readFileSync(path.join(rootDir, 'src/app/api/cron/email-outbox/route.ts'), 'utf8');

const registrationStart = serviceSource.indexOf('export async function createRegistration');
const contactStart = serviceSource.indexOf('export async function createContactMessage');
const registrationBlock = serviceSource.slice(registrationStart, contactStart);
const requestPersistenceBlock = serviceSource.slice(registrationStart, serviceSource.indexOf('async function updateOutbox'));

const checks = [
  ['registration uses transactional RPC', /create_registration_(?:submission|v2)/.test(registrationBlock)],
  ['registration does not POST directly to registrations', !/supabaseRequest\(['"]registrations/.test(registrationBlock)],
  ['registration does not dispatch Resend inline', !/api\.resend\.com/.test(registrationBlock)],
  ['request path has no direct-send or fallback handler', !/sendDirectEmail|fallbackPersist|supabaseRequest\(['"](?:registrations|contact_messages)/.test(requestPersistenceBlock)],
  ['contact uses transactional RPC', /create_contact_(?:submission|v2)/.test(serviceSource.slice(contactStart, serviceSource.indexOf('async function updateOutbox')))],
  ['request path does not invoke the cron worker', !/dispatchEmailOutbox\(\)/.test(requestPersistenceBlock)],
  ['successful registration reports durable email queue state', /emailQueued: true/.test(registrationBlock)],
  ['migration has atomic registration transaction', /create or replace function public\.create_registration_submission/.test(migrationSource) && /create or replace function public\.create_registration_v2/.test(migrationSourceV2)],
  ['migration keeps outbox private with RLS', /alter table public\.email_outbox enable row level security/.test(migrationSource)],
  ['migration grants the worker role outbox access', /grant all on public\.email_outbox to service_role, postgres/.test(migrationSource)],
  ['migration has safe worker claiming', /claim_email_outbox[\s\S]*for update skip locked/.test(migrationSource)],
  ['migration bounds retry window', /retry_until timestamptz/.test(migrationSource) && /retry_until > now\(\)/.test(migrationSource)],
  ['worker uses an outbox-derived idempotency key', /Idempotency-Key['"]:\s*`gimun-outbox\//.test(serviceSource)],
  ['cron route requires bearer secret', /authorization.*Bearer \$\{secret\}/s.test(cronSource)],
  // X-Forwarded-For is read from the right (TRUSTED_PROXY_HOPS, default 1), so prepended entries are ignored.
  ['rate limiting uses the trusted forwarded hop', /forwarded\?\.at\(-hops\)/.test(serviceSource) && /configuredHops > 0 \? configuredHops : 1/.test(serviceSource)],
  // x-real-ip can be sent by anyone; only Vercel's edge overwrites it.
  ['x-real-ip is trusted only on Vercel', /if \(process\.env\.VERCEL === '1'\) \{[^}]*x-real-ip/s.test(serviceSource) && (serviceSource.match(/headers\.get\('x-real-ip'\)/g) || []).length === 1],
];

let failures = 0;
console.log('Submission architecture contract audit');
for (const [label, passed] of checks) {
  if (passed) console.log(`[PASS] ${label}`);
  else {
    failures += 1;
    console.error(`[FAIL] ${label}`);
  }
}

if (failures > 0) {
  console.error(`FAILURE: ${failures} submission contract check(s) failed.`);
  process.exit(1);
}

console.log(`SUCCESS: ${checks.length}/${checks.length} submission contract checks passed.`);
