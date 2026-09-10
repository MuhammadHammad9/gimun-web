import type {
  ContactFormData,
  GimunDelegationData,
  GimunIndividualData,
  MootCupTeamData,
  RegistrationSubmission,
} from '@/lib/types';
import { RATE_LIMIT } from '@/lib/honeypot';

export class SubmissionServiceError extends Error {
  constructor(
    message: string,
    public readonly status = 503,
  ) {
    super(message);
    this.name = 'SubmissionServiceError';
  }
}

type Track = RegistrationSubmission['track'];
type RegistrationData = GimunIndividualData | GimunDelegationData | MootCupTeamData;

type RegistrationRecord = {
  track: Track;
  applicantType: RegistrationSubmission['applicantType'];
  formData: RegistrationData;
  applicantName: string;
  institution: string;
  email: string;
  participantCount: number;
  submittedAt: string;
};

type DeliveryResult = {
  referenceId?: string;
  emailQueued: boolean;
  notificationQueued: boolean;
};

const memoryRateLimits = new Map<string, { count: number; resetAt: number }>();
const memoryCounters: Record<Track, number> = { gimun: 0, 'moot-cup': 0 };
const memoryRegistrations: RegistrationSubmission[] = [];
const memoryContacts: Array<{ id: string; submittedAt: string; data: ContactFormData }> = [];

function backendMode() {
  return process.env.SUBMISSIONS_BACKEND || (process.env.NODE_ENV === 'production' ? 'supabase' : 'memory');
}

function getRequiredEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new SubmissionServiceError(`Submission service is missing ${name}.`);
  return value;
}

function supabaseHeaders() {
  const key = getRequiredEnv('SUPABASE_SERVICE_ROLE_KEY');
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

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  })[character] || character);
}

async function sendEmail({
  to,
  subject,
  html,
  replyTo,
}: {
  to: string[];
  subject: string;
  html: string;
  replyTo?: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from || to.length === 0) return false;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to,
      subject,
      html,
      ...(replyTo ? { reply_to: replyTo } : {}),
    }),
    cache: 'no-store',
  });

  if (!response.ok) {
    console.error(`[Email delivery failed] Provider status ${response.status}`);
    return false;
  }

  return true;
}

function recipientList() {
  return (process.env.NOTIFICATION_EMAIL || '')
    .split(',')
    .map((recipient) => recipient.trim())
    .filter(Boolean);
}

function buildRegistrationReference(track: Track) {
  memoryCounters[track] += 1;
  const prefix = track === 'gimun' ? 'REG-GIMUN-2027' : 'REG-MOOT-2027';
  return `${prefix}-${String(memoryCounters[track]).padStart(4, '0')}`;
}

async function getRegistrationReference(track: Track) {
  if (backendMode() === 'memory') return buildRegistrationReference(track);

  const response = await supabaseRequest('rpc/next_submission_reference', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({ p_track: track }),
  });
  const referenceId = await response.json();
  if (typeof referenceId !== 'string' || !referenceId) {
    throw new SubmissionServiceError('Submission storage returned an invalid reference ID.');
  }
  return referenceId;
}

async function persistRegistration(record: RegistrationSubmission & { applicantName: string; institution: string; email: string; participantCount: number }) {
  if (backendMode() === 'memory') {
    memoryRegistrations.push(record);
    return;
  }

  await supabaseRequest('registrations', {
    method: 'POST',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({
      reference_id: record.id,
      track: record.track,
      applicant_type: record.applicantType,
      applicant_name: record.applicantName,
      institution: record.institution,
      contact_email: record.email,
      participant_count: record.participantCount,
      submitted_at: record.submittedAt,
      status: record.status,
      form_data: record.formData,
    }),
  });
}

export async function enforceRateLimit(bucket: string, ip: string) {
  const key = `gimun:${bucket}:${ip}`;
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (upstashUrl && upstashToken) {
    const encodedKey = encodeURIComponent(key);
    const response = await fetch(`${upstashUrl.replace(/\/$/, '')}/incr/${encodedKey}`, {
      headers: { Authorization: `Bearer ${upstashToken}` },
      cache: 'no-store',
    });
    if (!response.ok) throw new SubmissionServiceError('Rate-limit service is unavailable.');
    const result = (await response.json()) as { result?: number };
    const count = Number(result.result || 0);

    if (count === 1) {
      await fetch(`${upstashUrl.replace(/\/$/, '')}/expire/${encodedKey}/${Math.ceil(RATE_LIMIT.windowMs / 1000)}`, {
        headers: { Authorization: `Bearer ${upstashToken}` },
        cache: 'no-store',
      });
    }

    return { allowed: count <= RATE_LIMIT.maxRequests, retryAfterSeconds: Math.ceil(RATE_LIMIT.windowMs / 1000) };
  }

  if (process.env.NODE_ENV === 'production' && backendMode() !== 'memory') {
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

export async function createRegistration(record: RegistrationRecord): Promise<DeliveryResult> {
  const referenceId = await getRegistrationReference(record.track);
  const submission: RegistrationSubmission = {
    id: referenceId,
    track: record.track,
    applicantType: record.applicantType,
    submittedAt: record.submittedAt,
    status: 'received',
    formData: record.formData,
  };

  await persistRegistration({ ...submission, ...record });

  const emailQueued = await sendEmail({
    to: [record.email],
    subject: `${referenceId} — application received`,
    html: `<p>Your ${escapeHtml(record.track === 'gimun' ? 'GIMUN' : 'GMC')} application has been received.</p><p>Your reference number is <strong>${referenceId}</strong>.</p><p>The Organizing Committee will contact you after review.</p>`,
  });
  const notificationQueued = await sendEmail({
    to: recipientList(),
    subject: `New ${record.track === 'gimun' ? 'GIMUN' : 'GMC'} registration: ${referenceId}`,
    replyTo: record.email,
    html: `<p>New registration received: <strong>${referenceId}</strong>.</p><p>Track: ${escapeHtml(record.track)}<br />Applicant: ${escapeHtml(record.applicantName)}<br />Institution: ${escapeHtml(record.institution)}</p>`,
  });

  return { referenceId, emailQueued, notificationQueued };
}

export async function createContactMessage(data: ContactFormData) {
  const id = `INQ-${Date.now().toString(36).toUpperCase()}`;
  const submittedAt = new Date().toISOString();

  if (backendMode() === 'memory') {
    memoryContacts.push({ id, submittedAt, data });
  } else {
    await supabaseRequest('contact_messages', {
      method: 'POST',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({ id, submitted_at: submittedAt, name: data.name, email: data.email, query_type: data.queryType, message: data.message }),
    });
  }

  const notificationQueued = await sendEmail({
    to: recipientList(),
    subject: `New ${data.queryType} inquiry: ${id}`,
    replyTo: data.email,
    html: `<p><strong>${escapeHtml(data.name)}</strong> submitted a ${escapeHtml(data.queryType)} inquiry.</p><p>${escapeHtml(data.message).replace(/\n/g, '<br />')}</p>`,
  });

  return { id, notificationQueued };
}
