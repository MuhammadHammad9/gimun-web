import 'server-only';
import QRCode from 'qrcode';
import { database } from './supabase';
import { createHash, createHmac, randomUUID } from 'node:crypto';
import type {
  ContactFormData,
  GimunDelegationData,
  GimunIndividualData,
  MootCupTeamData,
  RegistrationSubmission,
} from '@/lib/types';
import { RATE_LIMITS, type RateLimitBucket } from '@/lib/honeypot';
import { getCommittees, getProblemCategories, getSiteConfig } from '@/lib/content';
import { getCanonicalEventDateRange, getEventYear } from '@/lib/site-config';
import { getMissingProductionConfig, getServerConfig, isExplicitMemoryTestBackend } from '@/lib/server/config';

export class SubmissionServiceError extends Error {
  constructor(message: string, public readonly status = 503) {
    super(message);
    this.name = 'SubmissionServiceError';
  }
}

type Track = RegistrationSubmission['track'];
type RegistrationData = GimunIndividualData | GimunDelegationData | MootCupTeamData;

export type RegistrationRecord = {
  actor?:string;
  submissionKey: string;
  amountDue: number;
  track: Track;
  applicantType: RegistrationSubmission['applicantType'];
  formData: RegistrationData;
  applicantName: string;
  institution: string;
  email: string;
  participantCount: number;
  submittedAt: string;
  phone?: string;
  feeAmount?: string;
  summary?: string;
};

type DeliveryResult = {
  checkinToken: string;
  referenceId: string;
  emailQueued: boolean;
  notificationQueued: boolean;
};

type OutboxMessage = {
  attachments: unknown[];
  from_address?: string;
  id: string;
  to_addresses: string[];
  reply_to: string | null;
  subject: string;
  html: string;
  attempts: number;
  retry_until: string;
  locked_by?: string | null;
};

const UNAVAILABLE = 'Submissions are temporarily unavailable. Please try again shortly or email the organizing team.';

class OutboxDispatchError extends Error {
  constructor(
    message: string,
    public readonly retryable: boolean,
    public readonly uncertain = false,
  ) {
    super(message);
    this.name = 'OutboxDispatchError';
  }
}

const memoryReceipts = new Map<string, { hash: string; delivery: DeliveryResult }>();
const memoryRateLimits = new Map<string, { count: number; resetAt: number }>();
const memoryCounters: Record<Track, number> = { gimun: 0, 'moot-cup': 0 };
const memoryRegistrations: RegistrationSubmission[] = [];
const memoryContacts: Array<{ id: string; submittedAt: string; data: ContactFormData }> = [];

function backendMode() {
  const backend = getServerConfig().backend;
  if (backend !== 'memory' && backend !== 'supabase') {
    console.error(`[Configuration] SUBMISSIONS_BACKEND has an invalid value: ${backend}.`);
    throw new SubmissionServiceError(UNAVAILABLE);
  }
  return backend;
}

// isExplicitMemoryTestBackend is imported from config.ts — do not redefine locally.

function ensureProductionBackend(options: { emailDelivery?: boolean } = {}) {
  if (
    process.env.NODE_ENV === 'production' &&
    backendMode() === 'memory' &&
    !isExplicitMemoryTestBackend()
  ) {
    console.error('[Configuration] SUBMISSIONS_BACKEND=memory is not allowed in production.');
    throw new SubmissionServiceError(UNAVAILABLE);
  }

  const missing = getMissingProductionConfig(options);
  if (missing.length > 0) {
    // Variable names go to the logs, not to the visitor.
    console.error(`[Configuration] Submission service is missing: ${missing.join(', ')}.`);
    throw new SubmissionServiceError(UNAVAILABLE);
  }
}

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(`[Configuration] Submission service is missing ${name}.`);
    throw new SubmissionServiceError(UNAVAILABLE);
  }
  return value;
}

async function supabaseRpc<T>(functionName: string, body: Record<string, unknown>): Promise<T> {
  const { data, error } = await database().rpc(functionName, body);
  if (error) {
    if (error.message.includes('payload mismatch')) {
      throw new SubmissionServiceError('Submission key was already used for different details. Reload the form.', 409);
    }
    console.error(`[Submissions] ${functionName} failed: ${error.message}`);
    throw new SubmissionServiceError(UNAVAILABLE, 503);
  }
  return data as T;
}

function escapeHtml(value: string) {
  return String(value || '').replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  })[character] || character);
}

function recipientList() {
  const recipients = (getServerConfig().notificationEmail || '')
    .split(',')
    .map((recipient) => recipient.trim())
    .filter(Boolean);

  if (process.env.NODE_ENV === 'production' && recipients.length === 0 && !isExplicitMemoryTestBackend()) {
    console.error('[Configuration] Submission service is missing NOTIFICATION_EMAIL.');
    throw new SubmissionServiceError(UNAVAILABLE);
  }

  return recipients;
}

function buildRegistrationReference(track: Track, year: string) {
  memoryCounters[track] += 1;
  const prefix = `REG-${track === 'gimun' ? 'GIMUN' : 'MOOT'}-${year}`;
  return `${prefix}-${String(memoryCounters[track]).padStart(4, '0')}`;
}

/**
 * IPv6 clients usually control a whole /64, so limiting single addresses lets
 * one host rotate freely. Keys use the /64 prefix; IPv4 is used as-is.
 */
export function rateLimitSubject(ip: string) {
  if (!ip.includes(':')) return ip;
  const [head, tail = ''] = ip.toLowerCase().split('::');
  const left = head ? head.split(':') : [];
  const right = tail ? tail.split(':') : [];
  const groups = ip.includes('::') ? [...left, ...Array(Math.max(0, 8 - left.length - right.length)).fill('0'), ...right] : left;
  return `${groups.slice(0, 4).map((g) => g.replace(/^0+(?=.)/, '')).join(':')}::/64`;
}

// Deliberately independent of the submission/email configuration: admin
// sign-in must keep working when, say, NOTIFICATION_EMAIL is missing.
export async function enforceRateLimit(bucket: RateLimitBucket, ip: string) {
  const RATE_LIMIT = RATE_LIMITS[bucket];
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  const hmacSecret = process.env.RATE_LIMIT_HMAC_SECRET;
  const production = process.env.NODE_ENV === 'production' && !isExplicitMemoryTestBackend();

  // A rate-limit outage must never take registration down with it. Missing or
  // failing infrastructure degrades to a per-instance limit and is logged
  // loudly; the build-time check (scripts/check-env.mjs) keeps it configured.
  if (production && !hmacSecret) {
    console.error('[RateLimit] RATE_LIMIT_HMAC_SECRET is missing; using per-instance limits.');
  }
  if (production && (!upstashUrl || !upstashToken)) {
    console.error('[RateLimit] Upstash is not configured; using per-instance limits.');
  }

  const digest = createHmac('sha256', hmacSecret || 'development-rate-limit-secret').update(rateLimitSubject(ip)).digest('hex');
  const key = `gimun:${bucket}:${digest}`;

  // Only send keyed hashes to the shared store; never a key made with the
  // public fallback secret.
  if (upstashUrl && upstashToken && (hmacSecret || !production)) {
    try {
      const response = await fetch(upstashUrl.replace(/\/$/, ''), {
        method: 'POST',
        headers: { Authorization: `Bearer ${upstashToken}` },
        body: JSON.stringify([
          'EVAL',
          "local count = redis.call('INCR', KEYS[1]); if count == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]); end; return count",
          1,
          key,
          Math.ceil(RATE_LIMIT.windowMs / 1000),
        ]),
        cache: 'no-store',
        signal: AbortSignal.timeout(3000),
      });
      if (response.ok) {
        const result = (await response.json()) as { result?: number };
        const count = Number(result.result);
        if (!Number.isInteger(count) || count < 1) throw new Error('Invalid rate-limit response');

        return { allowed: count <= RATE_LIMIT.maxRequests, retryAfterSeconds: Math.ceil(RATE_LIMIT.windowMs / 1000) };
      }
      console.error(`[RateLimit] Upstash returned HTTP ${response.status}; using per-instance limits.`);
    } catch {
      console.error('[RateLimit] Upstash is unreachable; using per-instance limits.');
    }
  }

  const now = Date.now();
  const current = memoryRateLimits.get(key);
  if (!current || now >= current.resetAt) {
    memoryRateLimits.set(key, { count: 1, resetAt: now + RATE_LIMIT.windowMs });
    return { allowed: true, retryAfterSeconds: Math.ceil(RATE_LIMIT.windowMs / 1000) };
  }

  current.count += 1;
  return {
    allowed: current.count <= RATE_LIMIT.maxRequests,
    retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
  };
}

export function clientIp(request: Request) {
  const trustedVercelIp = request.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim();
  const realIp = request.headers.get('x-real-ip')?.trim();
  const forwarded = request.headers.get('x-forwarded-for')
    ?.split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  // Vercel's edge header is authoritative in production. For generic reverse
  // proxies, use the last appended X-Forwarded-For hop so a caller cannot
  // bypass the limiter by prepending a forged address.
  return trustedVercelIp || realIp || forwarded?.at(-1) || 'unknown';
}

/**
 * What the applicant actually submitted, in readable form: preferences for
 * individuals, the roster for delegations and teams. Used by both the
 * applicant receipt and the organizer notification so neither has to be
 * cross-checked against the admin panel.
 */
async function submittedDetails(record: RegistrationRecord) {
  const committees = await getCommittees();
  const categories = await getProblemCategories();
  const committeeName = (id: string) =>
    id ? committees.find((c) => c.id === id || c.slug === id)?.name || id : '';
  const rows: { label: string; value: string }[] = [];
  let roster: { heading: string[]; rows: string[][] } | null = null;

  if (record.applicantType === 'individual') {
    const d = record.formData as GimunIndividualData;
    const prefs = [d.committeePreference1, d.committeePreference2, d.committeePreference3].map(committeeName).filter(Boolean);
    rows.push({ label: 'Committee preferences', value: prefs.join(' → ') });
    if (d.countryPreference) rows.push({ label: 'Country preference', value: d.countryPreference });
  } else if (record.applicantType === 'delegation') {
    const d = record.formData as GimunDelegationData;
    roster = {
      heading: ['Delegate', 'Email', 'Preferences'],
      rows: d.delegates.map((del) => [
        del.name,
        del.email,
        [del.committeePreference1, del.committeePreference2].map(committeeName).filter(Boolean).join(' → ') +
          (del.countryPreference ? ` (${del.countryPreference})` : ''),
      ]),
    };
  } else {
    const d = record.formData as MootCupTeamData;
    const category = categories.find((c) => c.id === d.problemCategoryPreference)?.name || d.problemCategoryPreference;
    rows.push({ label: 'Team name', value: d.teamName }, { label: 'Problem category', value: category });
    roster = {
      heading: ['Member', 'Email', 'Role'],
      rows: d.members.map((m) => [m.fullName, m.email, m.role.replace(/-/g, ' ')]),
    };
  }
  return { rows, roster };
}

function detailsHtml(details: Awaited<ReturnType<typeof submittedDetails>>) {
  const cell = 'padding: 8px 12px; border-bottom: 1px solid #f1f5f9; font-size: 13px; vertical-align: top;';
  const rows = details.rows
    .map((r) => `<tr><td style="${cell} color: #64748b; width: 34%;">${escapeHtml(r.label)}</td><td style="${cell} color: #0f172a;">${escapeHtml(r.value)}</td></tr>`)
    .join('');
  const roster = details.roster
    ? `<table style="width: 100%; border-collapse: collapse; margin-top: 8px;"><thead><tr>${details.roster.heading
        .map((h) => `<th style="${cell} text-align: left; color: #64748b; font-weight: 600;">${escapeHtml(h)}</th>`)
        .join('')}</tr></thead><tbody>${details.roster.rows
        .map((r) => `<tr>${r.map((v) => `<td style="${cell} color: #0f172a;">${escapeHtml(v)}</td>`).join('')}</tr>`)
        .join('')}</tbody></table>`
    : '';
  if (!rows && !roster) return '';
  return `<div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 4px; margin-bottom: 24px;">
        <div style="font-size: 11px; font-family: monospace; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 1px; padding: 0 12px 6px;">What you submitted</div>
        ${rows ? `<table style="width: 100%; border-collapse: collapse;">${rows}</table>` : ''}${roster}
      </div>`;
}

async function buildApplicantReceiptHtml(record: RegistrationRecord, referenceId: string, qrDataUrl?: string | null): Promise<string> {
  const isMoot = record.track === 'moot-cup';
  const trackNameShort = isMoot ? 'GMC' : 'GIMUN';
  const trackNameLong = isMoot ? 'GIKI Moot Court (GMC)' : 'GIKI Model United Nations (GIMUN)';
  const typeLabel =
    record.applicantType === 'individual'
      ? 'Individual Delegate'
      : record.applicantType === 'delegation'
      ? `Institutional Delegation (${record.participantCount} Delegates)`
      : `Advocacy Team (${record.participantCount} Advocates)`;

  const feeDisplay = record.feeAmount || 'Fee pending confirmation';

  const site = (await getSiteConfig());
  const eventDates = getCanonicalEventDateRange(site);
  const submitted = detailsHtml(await submittedDetails(record));
  const venueTitle = site.hostInstitution;
  const venueLocation = site.venue;
  const safeReferenceId = escapeHtml(referenceId);
  const safeTypeLabel = escapeHtml(typeLabel);
  const safeFeeDisplay = escapeHtml(feeDisplay);
  const safeEventDates = escapeHtml(eventDates);
  const safeVenueTitle = escapeHtml(venueTitle);
  const safeVenueLocation = escapeHtml(venueLocation);
  const safeQrDataUrl = qrDataUrl ? escapeHtml(qrDataUrl) : null;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${trackNameShort} application received — Ref #${safeReferenceId}</title>
</head>
<body style="margin: 0; padding: 28px 12px; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #1e293b;">
  <div style="max-width: 580px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04); border: 1px solid #e2e8f0;">

    <!-- Dark Card Header (Matching User Reference Image) -->
    <div style="background-color: #111827; padding: 36px 24px 28px; text-align: center;">
      <!-- GIMUN Golden Badge -->
      <div style="display: inline-block; background-color: #fbbf24; color: #000000; font-size: 15px; font-weight: 900; letter-spacing: 5px; padding: 7px 22px; border-radius: 4px; text-transform: uppercase;">
        ${trackNameShort}
      </div>
      <div style="margin-top: 14px;">
        <span style="display: inline-block; background-color: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.18); border-radius: 9999px; padding: 4px 14px; color: #e0e7ff; font-size: 10px; font-family: -apple-system, BlinkMacSystemFont, monospace; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;">
          / APPLICATION RECEIVED
        </span>
      </div>
    </div>

    <!-- Main Body Container -->
    <div style="padding: 32px 28px 28px;">
      <h2 style="font-size: 21px; font-weight: 800; color: #0f172a; margin: 0 0 10px 0; letter-spacing: -0.3px;">
        Welcome, ${escapeHtml(record.applicantName)}
      </h2>
      <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 24px 0;">
        Your registration for <strong>${trackNameShort}</strong> has been successfully submitted. Our administration team is reviewing your application dossier and verifying your details.
      </p>

      ${
          safeQrDataUrl
          ? `<!-- QR Ticket Box (Matching User Reference Image 1) -->
      <div style="margin-bottom: 24px; padding: 18px 20px; border: 1px solid #e0e7ff; background-color: #f8faff; border-radius: 10px; text-align: center;">
        <div style="font-size: 10px; font-family: monospace; font-weight: 800; letter-spacing: 1.5px; color: #4f46e5; text-transform: uppercase; margin-bottom: 12px;">
          YOUR CHECK-IN QR TICKET
        </div>
        <div style="display: inline-block; background: #ffffff; padding: 10px; border: 1px solid #c7d2fe; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.04);">
           <img src="${safeQrDataUrl}" width="140" height="140" alt="Check-In QR Code" style="display: block; margin: 0 auto;" />
        </div>
        <div style="font-family: monospace; font-size: 13px; font-weight: 800; color: #4338ca; margin-top: 10px; letter-spacing: 0.5px;">
          ${safeReferenceId}
        </div>
        <div style="font-size: 11px; color: #64748b; margin-top: 4px;">
          Present at the registration desk on arrival
        </div>
      </div>`
          : ''
      }

      <!-- Application Summary Table (Exact Match to User Reference Image 2) -->
      <div style="border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; margin-bottom: 24px; background-color: #ffffff;">
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <tbody>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 12px 16px; color: #64748b; width: 34%; font-weight: 500;">Reference ID</td>
              <td style="padding: 12px 16px; font-family: monospace; font-weight: 800; color: #4f46e5;">
                ${safeReferenceId}
              </td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 12px 16px; color: #64748b; font-weight: 500;">Event</td>
              <td style="padding: 12px 16px; color: #0f172a; font-weight: 700;">
                ${trackNameShort} (${trackNameLong})
              </td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 12px 16px; color: #64748b; font-weight: 500;">Category</td>
              <td style="padding: 12px 16px; color: #0f172a;">
                ${safeTypeLabel}
              </td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 12px 16px; color: #64748b; font-weight: 500;">Institution</td>
              <td style="padding: 12px 16px; color: #0f172a;">
                ${escapeHtml(record.institution)}
              </td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 12px 16px; color: #64748b; font-weight: 500;">Amount</td>
              <td style="padding: 12px 16px; color: #0f172a; font-weight: 700;">
                ${safeFeeDisplay}
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 16px; color: #64748b; font-weight: 500;">Status</td>
              <td style="padding: 12px 16px;">
                <span style="display: inline-block; background-color: #fef3c7; color: #92400e; padding: 3px 10px; border-radius: 9999px; font-size: 11px; font-weight: 700;">
                  Under Review
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      ${submitted}

      <!-- Event Details Card (Explicitly Included) -->
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #f59e0b; border-radius: 6px; padding: 16px 18px; margin-bottom: 24px;">
        <div style="font-size: 11px; font-family: monospace; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px;">
          Event Details &amp; Venue
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; line-height: 1.5;">
          <tr>
            <td style="padding: 4px 0; color: #64748b; width: 26%; font-weight: 500;">Event Name:</td>
            <td style="padding: 4px 0; color: #0f172a; font-weight: 700;">${trackNameLong} ${escapeHtml(getEventYear(site))}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #64748b; font-weight: 500;">Event Dates:</td>
            <td style="padding: 4px 0; color: #0f172a; font-weight: 700;">${safeEventDates}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #64748b; font-weight: 500;">Venue:</td>
            <td style="padding: 4px 0; color: #0f172a;">${safeVenueTitle}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #64748b; font-weight: 500;">Location:</td>
            <td style="padding: 4px 0; color: #64748b;">${safeVenueLocation}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #64748b; font-weight: 500;">Check-in:</td>
            <td style="padding: 4px 0; color: #475569;">
              ${escapeHtml(site.checkinDesk || 'Check-in details will be announced.')} ${escapeHtml(site.entryRequirement || '')}
            </td>
          </tr>
        </table>
      </div>

      <!-- What Happens Next Notice -->
      <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 14px 18px; margin-bottom: 24px; font-size: 12px; color: #166534; line-height: 1.55;">
        <strong style="display: block; margin-bottom: 4px; font-size: 13px;">What Happens Next:</strong>
        1. <strong>Dossier Evaluation:</strong> ${escapeHtml(site.replyTime || 'The Secretariat will review your application.')}<br>
        2. <strong>Payment:</strong> ${site.paymentInstructions ? escapeHtml(site.paymentInstructions).replace(/\n/g, '<br>') : 'Once your application is accepted, an invoice with bank transfer details will be emailed to you.'}<br>
        3. <strong>Seat Confirmation:</strong> Upon payment verification, your status will be updated to <strong>Confirmed</strong> and your final badge credentials will be released.
      </div>

      <p style="font-size: 12px; color: #64748b; line-height: 1.5; margin: 0;">
        Zero online payment has been charged yet. For any assistance or queries, please contact <a href="mailto:${escapeHtml(site.contactEmails.general)}" style="color: #4f46e5; text-decoration: none; font-weight: 600;">${escapeHtml(site.contactEmails.general)}</a> citing reference <strong>${safeReferenceId}</strong>.
      </p>
    </div>

    <!-- Branded Footer (Matching User Reference Image) -->
    <div style="background-color: #fafaf9; border-top: 1px solid #f1f5f9; padding: 22px 24px; text-align: center;">
      <div style="font-size: 11px; font-weight: 800; color: #b45309; letter-spacing: 1px; text-transform: uppercase;">
        ${escapeHtml(site.eventNames.combined)} — ${escapeHtml(site.hostInstitution)}
      </div>
      <div style="font-size: 10px; color: #94a3b8; margin-top: 5px;">
        This is an automated message. Please do not reply directly to this email.
      </div>
    </div>
  </div>
</body>
</html>`;
}


export async function createRegistration(record: RegistrationRecord): Promise<DeliveryResult> {
  ensureProductionBackend();
  const recipients = recipientList();
  const site = await getSiteConfig();
  const checkinToken = randomUUID();
  const hash = createHash('sha256').update(JSON.stringify({ track: record.track, applicantType: record.applicantType, formData: record.formData })).digest('hex');
  const trackName = record.track === 'gimun' ? 'GIMUN' : 'GMC';

  if (backendMode() === 'memory') {
    const existing = memoryReceipts.get(record.submissionKey);
    if (existing) {
      if (existing.hash !== hash) throw new SubmissionServiceError('Submission key was already used for different details.', 409);
      return existing.delivery;
    }
    const referenceId = buildRegistrationReference(record.track, getEventYear(site));
    memoryRegistrations.push({
      id: referenceId,
      track: record.track,
      applicantType: record.applicantType,
      submittedAt: record.submittedAt,
      status: 'received',
      formData: record.formData,
    });
    const delivery = { referenceId, checkinToken, emailQueued: false, notificationQueued: false };
    memoryReceipts.set(record.submissionKey, { hash, delivery });
    return delivery;
  }

  // Allocate the reference, persist the submission, and create both private
  // outbox rows in one database transaction. The reference placeholder is
  // replaced inside the transaction once the atomic counter is allocated.
  const receiptHtml = await buildApplicantReceiptHtml(record, '{{REFERENCE_ID}}', 'cid:ticket');
  const png = await QRCode.toBuffer(checkinToken, { width: 280, margin: 2 });
  const notificationHtml = `<!DOCTYPE html>
<html lang="en">
<body style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.5;">
  <h2>New ${escapeHtml(trackName)} registration received</h2>
  <p><strong>Reference:</strong> {{REFERENCE_ID}}</p>
  <p><strong>Applicant:</strong> ${escapeHtml(record.applicantName)}</p>
  <p><strong>Institution:</strong> ${escapeHtml(record.institution)}</p>
  <p><strong>Email:</strong> ${escapeHtml(record.email)}</p>
  <p><strong>Applicant type:</strong> ${escapeHtml(record.applicantType)}</p>
  <p><strong>Participants:</strong> ${record.participantCount}</p>
  <p><strong>Amount:</strong> ${escapeHtml(record.feeAmount || 'Not set')}</p>
  ${detailsHtml(await submittedDetails(record))}
</body>
</html>`;

  const rpcInput = {
    p_year: Number(getEventYear(site)), p_submission_key: record.submissionKey, p_submission_hash: hash, p_checkin_token: checkinToken,
    p_attachments: [{ filename: 'ticket.png', content: png.toString('base64'), content_id: 'ticket' }],
    p_fee_display: record.feeAmount, p_amount_due: record.amountDue, p_from_address: getServerConfig().emailFrom,
    p_track: record.track,
    p_applicant_type: record.applicantType,
    p_applicant_name: record.applicantName,
    p_institution: record.institution,
    p_email: record.email,
    p_participant_count: record.participantCount,
    p_submitted_at: record.submittedAt,
    p_status: 'received',
    p_form_data: record.formData,
    p_receipt_subject: `${trackName} application received`,
    p_receipt_html: receiptHtml,
    p_notification_recipients: recipients,
    p_notification_subject: `New ${trackName} registration received`,
    p_notification_html: notificationHtml,
  };

  const persisted=await supabaseRpc<{referenceId:string;checkinToken:string}>(record.actor?'create_walkin_registration':'create_registration_v2',record.actor?{p_payload:rpcInput,p_actor:record.actor}:rpcInput);

  const { referenceId, checkinToken: persistedToken } = persisted;
  if (!referenceId || typeof referenceId !== 'string') {
    throw new SubmissionServiceError('Submission storage returned an invalid reference.', 503);
  }

  // The transaction created both outbox rows. Delivery is intentionally left
  // to the protected cron worker so the request never sends mail directly.
  return { referenceId, checkinToken: persistedToken, emailQueued: true, notificationQueued: recipients.length > 0 };
}

export async function createContactMessage(data: ContactFormData, submissionKey?: string) {
  ensureProductionBackend();
  // A client key makes the id deterministic, so a retried request returns the
  // stored inquiry instead of creating a duplicate (see create_contact_v2).
  const id = submissionKey
    ? `INQ-${createHash('sha256').update(submissionKey).digest('hex').slice(0, 16).toUpperCase()}`
    : `INQ-${Date.now().toString(36).toUpperCase()}-${randomUUID().slice(0, 8).toUpperCase()}`;
  const submittedAt = new Date().toISOString();
  const recipients = recipientList();

  if (backendMode() === 'memory') {
    if (memoryContacts.some((c) => c.id === id)) return { id, notificationQueued: false };
    memoryContacts.push({ id, submittedAt, data });
    return { id, notificationQueued: false };
  }

  const notificationSubject = 'New ' + data.queryType + ' inquiry';
  const notificationHtml = '<p><strong>' + escapeHtml(data.name) + '</strong> submitted a ' + escapeHtml(data.queryType) + ' inquiry.</p><p>' + escapeHtml(data.message).replace(/\n/g, '<br />') + '</p>';

  const persistedId = await supabaseRpc<string>('create_contact_v2', {
    p_kind: data.kind || 'contact', p_from_address: getServerConfig().emailFrom,
    p_id: id,
    p_submitted_at: submittedAt,
    p_name: data.name,
    p_email: data.email,
    p_query_type: data.queryType,
    p_message: data.message,
    p_notification_recipients: recipients,
    p_notification_subject: notificationSubject,
    p_notification_html: notificationHtml,
  });

  if (!persistedId || typeof persistedId !== 'string') {
    throw new SubmissionServiceError('Submission storage returned an invalid inquiry identifier.', 503);
  }

  return { id: persistedId, notificationQueued: recipients.length > 0 };
}

async function updateOutbox(id: string, workerId: string, update: Record<string, unknown>) {
  const { error } = await database().from('email_outbox').update(update).eq('id',id).eq('locked_by',workerId);
  if (error) throw new Error('Unable to update outbox lease');
}

async function sendOutboxMessage(message: OutboxMessage) {
  const apiKey = getRequiredEnv('RESEND_API_KEY');
  const from = message.from_address || getRequiredEnv('EMAIL_FROM');
  let response: Response;
  try {
    response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': `gimun-outbox/${message.id}`,
      },
      body: JSON.stringify({
        from,
        to: message.to_addresses,
        subject: message.subject,
        html: message.html,
        attachments: message.attachments || [],
        ...(message.reply_to ? { reply_to: message.reply_to } : {}),
      }),
      signal: AbortSignal.timeout(10_000),
      cache: 'no-store',
    });
  } catch {
    throw new OutboxDispatchError('Resend request outcome could not be confirmed.', true, true);
  }

  if (!response.ok) {
    const detail = await response.json().catch(() => null) as { name?: string } | null;
    const retryable = response.status === 408 || response.status === 429 || response.status >= 500 ||
      (response.status === 409 && detail?.name === 'concurrent_idempotent_requests');
    throw new OutboxDispatchError(`Resend returned HTTP ${response.status}.`, retryable);
  }

  let provider: { id?: string };
  try {
    provider = (await response.json()) as { id?: string };
  } catch {
    throw new OutboxDispatchError('Resend returned an unreadable response.', true, true);
  }
  if (!provider.id) {
    throw new OutboxDispatchError('Resend response did not include a message ID.', true, true);
  }
  return provider;
}

export async function dispatchEmailOutbox(limit = 4) {
  ensureProductionBackend({ emailDelivery: true });
  if (backendMode() === 'memory') return { claimed: 0, sent: 0, retried: 0, failed: 0, needsReview: 0 };

  const workerId = `vercel-cron-${randomUUID()}`;
  const claimed = await supabaseRpc<OutboxMessage[]>('claim_email_outbox', {
    p_worker_id: workerId,
    p_limit: Math.max(1, Math.min(4, limit)),
  });
  let sent = 0;
  let retried = 0;
  let failed = 0;
  let needsReview = 0;

  for (const [index, message] of (claimed || []).entries()) {
    // Resend allows about two requests a second per account; pace the batch
    // so a burst of registrations does not turn into a burst of 429 retries.
    if (index > 0) await new Promise((resolve) => setTimeout(resolve, 550));
    let providerAccepted = false;
    try {
      if (!message.from_address) {
        // Old rows did not snapshot their sender. Never guess the original
        // payload after an attempt: Resend requires identical retry payloads.
        if(message.attempts>1){
          await updateOutbox(message.id,workerId,{status:'needs_review',locked_at:null,locked_by:null,last_error:'Legacy message has no recorded sender; verify provider delivery before recovery.'});
          needsReview+=1;continue;
        }
        message.from_address=getRequiredEnv('EMAIL_FROM');
        await updateOutbox(message.id,workerId,{from_address:message.from_address});
      }
      const provider = await sendOutboxMessage(message);
      providerAccepted = true;
      await updateOutbox(message.id, workerId, {
        status: 'sent',
        provider_message_id: provider.id || null,
        sent_at: new Date().toISOString(),
        locked_at: null,
        locked_by: null,
        last_error: null,
      });
      sent += 1;
    } catch (error) {
      // Preserve the lease if delivery succeeded but recording it failed. The
      // next worker retries the immutable payload under the same provider key.
      if (providerAccepted) { needsReview += 1; continue; }
      const dispatchError = error instanceof OutboxDispatchError
        ? error
        : new OutboxDispatchError('Unknown provider failure.', false, true);
      const retryUntil = message.retry_until
        ? new Date(message.retry_until).getTime()
        : 0;
      const exhausted = message.attempts >= 20 || !Number.isFinite(retryUntil) || Date.now() >= retryUntil;
      const status = !exhausted && (dispatchError.retryable || dispatchError.uncertain) ? 'retry' : dispatchError.uncertain ? 'needs_review' : 'failed';
      await updateOutbox(message.id, workerId, {
        status,
        next_attempt_at: new Date(Date.now() + Math.min(60 * 60 * 1000, 2 ** Math.min(message.attempts, 10) * 60_000)).toISOString(),
        locked_at: null,
        locked_by: null,
        last_error: dispatchError.message.slice(0, 240),
      });
      if (status === 'needs_review') needsReview += 1;
      else if (status === 'failed') failed += 1;
      else retried += 1;
    }
  }

  return { claimed: claimed?.length || 0, sent, retried, failed, needsReview };
}

// Claim one message at a time so a slow provider cannot strand a large batch
// when the hosting function reaches its duration limit. Pending rows stay durable.
export async function drainEmailOutbox() {
  const deadline = Date.now() + 35_000;
  const total = { claimed: 0, sent: 0, retried: 0, failed: 0, needsReview: 0 };
  do {
    const result = await dispatchEmailOutbox(1);
    for (const key of Object.keys(total) as (keyof typeof total)[]) total[key] += result[key];
    if (!result.claimed) break;
    await new Promise(resolve => setTimeout(resolve, 600));
  } while (Date.now() < deadline);
  return total;
}
