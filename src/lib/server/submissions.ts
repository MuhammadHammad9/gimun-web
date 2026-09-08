import { createHmac, randomUUID } from 'node:crypto';
import type {
  ContactFormData,
  GimunDelegationData,
  GimunIndividualData,
  MootCupTeamData,
  RegistrationSubmission,
} from '@/lib/types';
import { RATE_LIMIT } from '@/lib/honeypot';
import { getSiteConfig } from '@/lib/content';
import { formatEventDate } from '@/lib/site-config';
import { getMissingProductionConfig, getServerConfig } from '@/lib/server/config';

export class SubmissionServiceError extends Error {
  constructor(message: string, public readonly status = 503) {
    super(message);
    this.name = 'SubmissionServiceError';
  }
}

type Track = RegistrationSubmission['track'];
type RegistrationData = GimunIndividualData | GimunDelegationData | MootCupTeamData;

export type RegistrationRecord = {
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
  referenceId: string;
  emailQueued: boolean;
  notificationQueued: boolean;
};

type OutboxMessage = {
  id: string;
  to_addresses: string[];
  reply_to: string | null;
  subject: string;
  html: string;
  attempts: number;
  locked_by?: string | null;
};

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

const memoryRateLimits = new Map<string, { count: number; resetAt: number }>();
const memoryCounters: Record<Track, number> = { gimun: 0, 'moot-cup': 0 };
const memoryRegistrations: RegistrationSubmission[] = [];
const memoryContacts: Array<{ id: string; submittedAt: string; data: ContactFormData }> = [];

function backendMode() {
  return getServerConfig().backend;
}

function ensureProductionBackend(options: { emailDelivery?: boolean } = {}) {
  if (
    process.env.NODE_ENV === 'production' &&
    backendMode() === 'memory' &&
    process.env.ALLOW_IN_MEMORY_SUBMISSIONS !== '1'
  ) {
    throw new SubmissionServiceError('The in-memory submission backend is disabled in production.');
  }

  const missing = getMissingProductionConfig(options);
  if (missing.length > 0) {
    throw new SubmissionServiceError(`Production submission configuration is missing: ${missing.join(', ')}.`);
  }
}

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new SubmissionServiceError(`Submission service is missing ${name}.`);
  return value;
}

function supabaseHeaders() {
  const key = getRequiredEnv('SUPABASE_SECRET_KEY');
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
  };
}

async function supabaseRequest(path: string, init: RequestInit = {}) {
  const baseUrl = getRequiredEnv('SUPABASE_URL').replace(/\/$/, '');
  const response = await fetch(`${baseUrl}/rest/v1/${path}`, {
    ...init,
    headers: { ...supabaseHeaders(), ...(init.headers || {}) },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new SubmissionServiceError(`Submission storage rejected the request (${response.status}).`);
  }

  return response;
}

async function supabaseRpc<T>(functionName: string, body: Record<string, unknown>) {
  const response = await supabaseRequest(`rpc/${functionName}`, {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify(body),
  });
  return (await response.json()) as T;
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

  if (process.env.NODE_ENV === 'production' && recipients.length === 0) {
    throw new SubmissionServiceError('Submission service is missing NOTIFICATION_EMAIL.');
  }

  return recipients;
}

function buildRegistrationReference(track: Track) {
  memoryCounters[track] += 1;
  const prefix = track === 'gimun' ? 'REG-GIMUN-2027' : 'REG-MOOT-2027';
  return `${prefix}-${String(memoryCounters[track]).padStart(4, '0')}`;
}

export async function enforceRateLimit(bucket: string, ip: string) {
  ensureProductionBackend();
  const usingExplicitMemoryTestBackend =
    backendMode() === 'memory' && process.env.ALLOW_IN_MEMORY_SUBMISSIONS === '1';
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  const hmacSecret = process.env.RATE_LIMIT_HMAC_SECRET;

  if (process.env.NODE_ENV === 'production' && !usingExplicitMemoryTestBackend && !hmacSecret) {
    throw new SubmissionServiceError('Production rate limiting is missing RATE_LIMIT_HMAC_SECRET.');
  }

  const digest = createHmac('sha256', hmacSecret || 'development-rate-limit-secret').update(ip).digest('hex');
  const key = `gimun:${bucket}:${digest}`;

  if (upstashUrl && upstashToken) {
    try {
      const response = await fetch(`${upstashUrl.replace(/\/$/, '')}/eval`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${upstashToken}` },
        body: JSON.stringify([
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
        const count = Number(result.result || 0);

        return { allowed: count <= RATE_LIMIT.maxRequests, retryAfterSeconds: Math.ceil(RATE_LIMIT.windowMs / 1000) };
      }
    } catch {
      if (process.env.NODE_ENV === 'production' && !usingExplicitMemoryTestBackend) {
        throw new SubmissionServiceError('Production rate limiting is temporarily unavailable.');
      }
    }

    if (process.env.NODE_ENV === 'production' && !usingExplicitMemoryTestBackend) {
      throw new SubmissionServiceError('Production rate limiting is temporarily unavailable.');
    }
  }

  if (process.env.NODE_ENV === 'production' && !usingExplicitMemoryTestBackend && (!upstashUrl || !upstashToken)) {
    throw new SubmissionServiceError('Production rate limiting is not configured.');
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
  return request.headers.get('x-real-ip') || request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
}

function buildApplicantReceiptHtml(record: RegistrationRecord, referenceId: string, qrDataUrl?: string | null): string {
  const isMoot = record.track === 'moot-cup';
  const trackNameShort = isMoot ? 'GMC' : 'GIMUN';
  const trackNameLong = isMoot ? 'GIKI Moot Court (GMC)' : 'GIKI Model United Nations (GIMUN)';
  const typeLabel =
    record.applicantType === 'individual'
      ? 'Individual Delegate'
      : record.applicantType === 'delegation'
      ? `Institutional Delegation (${record.participantCount} Delegates)`
      : `Advocacy Team (${record.participantCount} Advocates)`;

  const feeDisplay = record.feeAmount || (isMoot ? 'PKR 12,000' : record.applicantType === 'individual' ? 'PKR 4,500' : 'PKR 4,000 / delegate');

  const site = getSiteConfig();
  const eventDates = `${formatEventDate(site.eventDates.start)}–${formatEventDate(site.eventDates.end, { day: 'numeric' })}`;
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
  <title>SOPHEP Application Received — Ref #${safeReferenceId}</title>
</head>
<body style="margin: 0; padding: 28px 12px; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #1e293b;">
  <div style="max-width: 580px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04); border: 1px solid #e2e8f0;">

    <!-- Dark Card Header (Matching User Reference Image) -->
    <div style="background-color: #111827; padding: 36px 24px 28px; text-align: center;">
      <!-- SOPHEP Golden Badge -->
      <div style="display: inline-block; background-color: #fbbf24; color: #000000; font-size: 15px; font-weight: 900; letter-spacing: 5px; padding: 7px 22px; border-radius: 4px; text-transform: uppercase;">
        SOPHEP
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

      <!-- Event Details Card (Explicitly Included) -->
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #f59e0b; border-radius: 6px; padding: 16px 18px; margin-bottom: 24px;">
        <div style="font-size: 11px; font-family: monospace; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px;">
          Event Details &amp; Venue
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; line-height: 1.5;">
          <tr>
            <td style="padding: 4px 0; color: #64748b; width: 26%; font-weight: 500;">Event Name:</td>
            <td style="padding: 4px 0; color: #0f172a; font-weight: 700;">${trackNameLong} 2027</td>
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
              Registration desk opens at 09:00 AM PKT on Day 1. Please bring your original student ID, CNIC/B-Form, and this confirmation.
            </td>
          </tr>
        </table>
      </div>

      <!-- What Happens Next Notice -->
      <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 14px 18px; margin-bottom: 24px; font-size: 12px; color: #166534; line-height: 1.55;">
        <strong style="display: block; margin-bottom: 4px; font-size: 13px;">What Happens Next:</strong>
        1. <strong>Dossier Evaluation:</strong> Secretariat reviews allocations &amp; credentials within 2–3 business days.<br>
        2. <strong>Bank Transfer Invoice:</strong> Official invoice with university bank account details will be emailed.<br>
        3. <strong>Seat Confirmation:</strong> Upon payment verification, your status will be updated to <strong>Confirmed</strong> and your final badge credentials will be released.
      </div>

      <p style="font-size: 12px; color: #64748b; line-height: 1.5; margin: 0;">
        Zero online payment has been charged yet. For any assistance or queries, please contact <a href="mailto:${escapeHtml(site.contactEmails.general)}" style="color: #4f46e5; text-decoration: none; font-weight: 600;">${escapeHtml(site.contactEmails.general)}</a> citing reference <strong>${safeReferenceId}</strong>.
      </p>
    </div>

    <!-- Branded Footer (Matching User Reference Image) -->
    <div style="background-color: #fafaf9; border-top: 1px solid #f1f5f9; padding: 22px 24px; text-align: center;">
      <div style="font-size: 11px; font-weight: 800; color: #b45309; letter-spacing: 1px; text-transform: uppercase;">
        SOPHEP — GIK Institute of Engineering Sciences &amp; Technology
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
  const trackName = record.track === 'gimun' ? 'GIMUN' : 'GMC';

  if (backendMode() === 'memory') {
    const referenceId = buildRegistrationReference(record.track);
    memoryRegistrations.push({
      id: referenceId,
      track: record.track,
      applicantType: record.applicantType,
      submittedAt: record.submittedAt,
      status: 'received',
      formData: record.formData,
    });
    return { referenceId, emailQueued: false, notificationQueued: false };
  }

  // 1. Generate guaranteed atomic sequence reference ID
  let referenceId: string;
  try {
    const generated = await supabaseRpc<string>('next_submission_reference', {
      p_track: record.track,
    });
    referenceId = generated && typeof generated === 'string' ? generated : buildRegistrationReference(record.track);
  } catch (rpcErr) {
    console.warn('next_submission_reference RPC fallback:', rpcErr);
    referenceId = buildRegistrationReference(record.track);
  }

  // 2. Persist record directly to Supabase registrations table
  await supabaseRequest('registrations', {
    method: 'POST',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({
      reference_id: referenceId,
      track: record.track,
      applicant_type: record.applicantType,
      applicant_name: record.applicantName,
      institution: record.institution,
      contact_email: record.email,
      participant_count: record.participantCount,
      submitted_at: record.submittedAt,
      status: 'received',
      form_data: record.formData,
    }),
  });

  // 3. Dispatch official receipt email via Resend with graceful resilience
  const applicantHtml = buildApplicantReceiptHtml(record, referenceId);
  let emailSent = false;
  try {
    const apiKey = getRequiredEnv('RESEND_API_KEY');
    const from = getRequiredEnv('EMAIL_FROM');
    if (apiKey && from && record.email) {
      const emailRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Idempotency-Key': `gimun-receipt/${referenceId}`,
        },
        body: JSON.stringify({
          from,
          to: [record.email],
          subject: `SOPHEP Application Received — ${trackName} (Ref: ${referenceId})`,
          html: applicantHtml,
        }),
        signal: AbortSignal.timeout(8_000),
        cache: 'no-store',
      });
      emailSent = emailRes.ok;
    }
  } catch (emailErr) {
    console.warn('Direct applicant email dispatch note:', emailErr);
  }

  return { referenceId, emailQueued: emailSent, notificationQueued: recipients.length > 0 };
}

export async function createContactMessage(data: ContactFormData) {
  ensureProductionBackend();
  const id = `INQ-${Date.now().toString(36).toUpperCase()}-${randomUUID().slice(0, 8).toUpperCase()}`;
  const submittedAt = new Date().toISOString();
  const recipients = recipientList();

  if (backendMode() === 'memory') {
    memoryContacts.push({ id, submittedAt, data });
    return { id, notificationQueued: false };
  }

  await supabaseRpc<string>('create_contact_submission', {
    p_id: id,
    p_submitted_at: submittedAt,
    p_name: data.name,
    p_email: data.email,
    p_query_type: data.queryType,
    p_message: data.message,
    p_notification_recipients: recipients,
    p_notification_subject: 'New ' + data.queryType + ' inquiry',
    p_notification_html: '<p><strong>' + escapeHtml(data.name) + '</strong> submitted a ' + escapeHtml(data.queryType) + ' inquiry.</p><p>' + escapeHtml(data.message).replace(/\n/g, '<br />') + '</p>',
  });

  return { id, notificationQueued: recipients.length > 0 };
}

async function updateOutbox(id: string, workerId: string, update: Record<string, unknown>) {
  await supabaseRequest(
    'email_outbox?id=eq.' + encodeURIComponent(id) + '&locked_by=eq.' + encodeURIComponent(workerId),
    {
    method: 'PATCH',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify(update),
    },
  );
}

async function sendOutboxMessage(message: OutboxMessage) {
  const apiKey = getRequiredEnv('RESEND_API_KEY');
  const from = getRequiredEnv('EMAIL_FROM');
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
        ...(message.reply_to ? { reply_to: message.reply_to } : {}),
      }),
      signal: AbortSignal.timeout(10_000),
      cache: 'no-store',
    });
  } catch {
    throw new OutboxDispatchError('Resend request outcome could not be confirmed.', true, true);
  }

  if (!response.ok) {
    const retryable = response.status === 408 || response.status === 429 || response.status >= 500;
    throw new OutboxDispatchError(`Resend returned HTTP ${response.status}.`, retryable);
  }

  let provider: { id?: string };
  try {
    provider = (await response.json()) as { id?: string };
  } catch {
    throw new OutboxDispatchError('Resend returned an unreadable response.', false, true);
  }
  if (!provider.id) {
    throw new OutboxDispatchError('Resend response did not include a message ID.', false, true);
  }
  return provider;
}

export async function dispatchEmailOutbox() {
  ensureProductionBackend({ emailDelivery: true });
  if (backendMode() === 'memory') return { claimed: 0, sent: 0, retried: 0, failed: 0, needsReview: 0 };

  const workerId = `vercel-cron-${randomUUID()}`;
  const claimed = await supabaseRpc<OutboxMessage[]>('claim_email_outbox', {
    p_worker_id: workerId,
    p_limit: 10,
  });
  let sent = 0;
  let retried = 0;
  let failed = 0;
  let needsReview = 0;

  for (const message of claimed || []) {
    try {
      const provider = await sendOutboxMessage(message);
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
      const dispatchError = error instanceof OutboxDispatchError
        ? error
        : new OutboxDispatchError('Unknown provider failure.', false, true);
      const exhausted = message.attempts >= 5;
      const status = dispatchError.uncertain
        ? 'needs_review'
        : dispatchError.retryable && !exhausted
        ? 'retry'
        : 'failed';
      await updateOutbox(message.id, workerId, {
        status,
        next_attempt_at: new Date(Date.now() + Math.min(60 * 60 * 1000, 2 ** message.attempts * 60_000)).toISOString(),
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
