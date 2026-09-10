import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const serviceSource = fs.readFileSync(path.join(rootDir, 'src/lib/server/submissions.ts'), 'utf8');
const migrationSource = fs.readFileSync(path.join(rootDir, 'supabase/migrations/0002_submission_outbox.sql'), 'utf8');
const cronSource = fs.readFileSync(path.join(rootDir, 'src/app/api/cron/email-outbox/route.ts'), 'utf8');

const registrationStart = serviceSource.indexOf('export async function createRegistration');
const contactStart = serviceSource.indexOf('export async function createContactMessage');
const registrationBlock = serviceSource.slice(registrationStart, contactStart);

const checks = [
  ['registration allocates atomic sequence reference', /next_submission_reference|create_registration_submission/.test(registrationBlock)],
  ['registration persists to Supabase storage', /supabaseRequest\(['"]registrations|create_registration_submission/.test(registrationBlock)],
  ['registration dispatches receipt correspondence', /api\.resend\.com|email_outbox|p_receipt_html/.test(registrationBlock)],
  ['migration has atomic registration transaction or sequence counter', /create or replace function public\.(?:create_registration_submission|next_submission_reference)/.test(migrationSource)],
  ['migration keeps outbox private with RLS', /alter table public\.email_outbox enable row level security/.test(migrationSource)],
  ['migration has safe worker claiming', /claim_email_outbox[\s\S]*for update skip locked/.test(migrationSource)],
  ['migration bounds retry window', /retry_until timestamptz/.test(migrationSource)],
  ['worker uses an outbox-derived idempotency key', /Idempotency-Key['"]:\s*`gimun-outbox\//.test(serviceSource)],
  ['cron route requires bearer secret', /authorization.*Bearer \$\{secret\}/s.test(cronSource)],
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
