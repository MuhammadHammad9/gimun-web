#!/usr/bin/env node
/**
 * Refuses provider credentials in tracked (or staged) files.
 *
 *   node scripts/scan-secrets.mjs            every tracked file (CI)
 *   node scripts/scan-secrets.mjs --staged   the staged version of each changed file (pre-commit)
 *
 * Placeholders such as `<CRON_SECRET>` or `re_xxxx` pass. A line that must
 * contain a match on purpose can end with the comment `secret-scan: allow`.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const staged = process.argv.includes('--staged');
const SKIP = /(^|\/)(package-lock\.json)$|\.(png|jpe?g|webp|gif|ico|avif|woff2?|ttf|otf|pdf|zip|docx|mp4|webm)$/i;
const MAX_BYTES = 1024 * 1024;

const SECRET_NAMES = 'SUPABASE_SECRET_KEY|SUPABASE_SERVICE_ROLE_KEY|RESEND_API_KEY|UPSTASH_REDIS_REST_TOKEN|RATE_LIMIT_HMAC_SECRET|CRON_SECRET|ADMIN_OWNER_TEMP_PASSWORD|TURNSTILE_SECRET_KEY';
const rules = [
  ['Supabase secret key', /\bsb_secret_[A-Za-z0-9_-]{16,}/],
  ['JSON Web Token (Supabase service-role/anon key)', /\beyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/],
  ['Resend API key', /\bre_[A-Za-z0-9]{6,}_[A-Za-z0-9]{12,}/],
  ['Private key', /-----BEGIN [A-Z ]*PRIVATE KEY-----/],
  ['AWS access key', /\bAKIA[0-9A-Z]{16}\b/],
  ['GitHub token', /\bgh[pousr]_[A-Za-z0-9]{36,}/],
  ['Literal value stored in Supabase Vault', /vault\.(?:create|update)_secret\(\s*'(?!<)[^']{12,}'/],
  ['Secret environment value', secretAssignment()],
];

/** `NAME=value` for a credential name, unless the value is plainly a placeholder or test value. */
function secretAssignment() {
  const assignment = new RegExp(`\\b(?:${SECRET_NAMES})['"]?\\s*[=:]\\s*['"]?([A-Za-z0-9+/_=.-]{16,})`, 'g');
  const placeholder = /x{4,}|\*{4,}|example|placeholder|changeme|your[-_]|test|temporary|dummy|sample/i;
  return {
    test(line) {
      for (const match of line.matchAll(assignment)) if (!placeholder.test(match[1])) return true;
      return false;
    },
  };
}

function git(args) {
  return execFileSync('git', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
}
/** The staged (index) version, which is what the commit will contain. */
function readStaged(path) {
  try {
    return execFileSync('git', ['show', `:${path}`], { maxBuffer: MAX_BYTES * 2 });
  } catch {
    return null;
  }
}

const files = (staged ? git(['diff', '--cached', '--name-only', '--diff-filter=ACMR']) : git(['ls-files']))
  .split('\n')
  .filter((f) => f && !SKIP.test(f));

const findings = [];
for (const file of files) {
  // CI scans the working tree too, so a file changed but not yet committed is checked as it is on disk.
  let buffer = staged ? readStaged(file) : null;
  if (!staged) {
    try {
      buffer = readFileSync(file);
    } catch {
      continue;
    }
  }
  if (!buffer || buffer.length > MAX_BYTES || buffer.includes(0)) continue;
  const lines = buffer.toString('utf8').split(/\r?\n/);
  lines.forEach((line, index) => {
    if (/secret-scan:\s*allow/.test(line)) return;
    for (const [name, pattern] of rules) {
      if (pattern.test(line)) findings.push(`${file}:${index + 1}  ${name}`);
    }
  });
}

if (findings.length) {
  console.error(`Possible secrets found (${findings.length}). Move them to environment variables or Supabase Vault:\n`);
  for (const finding of findings) console.error(`  ${finding}`);
  console.error('\nIf a match is a deliberate placeholder, end the line with the comment "secret-scan: allow".');
  process.exit(1);
}
console.log(`Secret scan passed (${files.length} ${staged ? 'staged' : 'tracked'} files).`);
