import { after, NextRequest, NextResponse } from 'next/server';
import { normalizeFormStrings, validateContactForm } from '@/lib/validation';
import {
  dispatchEmailOutbox,
  clientIp,
  createContactMessage,
  enforceRateLimit,
  SubmissionServiceError,
} from '@/lib/server/submissions';
import type { ContactFormData } from '@/lib/types';
import { botCheckResponse, botSignal, JsonBodyError, readJsonBody } from '@/lib/server/request';
import { TURNSTILE_FAILED_MESSAGE, verifyTurnstile } from '@/lib/server/turnstile';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await readJsonBody(req);
    } catch (error) {
      if (error instanceof JsonBodyError) {
        return NextResponse.json({ success: false, message: error.message }, { status: error.status });
      }
      return NextResponse.json({ success: false, message: 'Request body could not be read.' }, { status: 400 });
    }

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ success: false, message: 'Request body must be a JSON object.' }, { status: 400 });
    }

    const { name, email, queryType, message, kind, submission_key, turnstile_token } = body as Record<string, unknown>;
    const submissionKey =
      typeof submission_key === 'string' && /^[0-9a-f-]{36}$/i.test(submission_key) ? submission_key : undefined;

    const signal = botSignal(body as Record<string, unknown>);
    if (signal === 'honeypot') {
      console.warn('[BotCheck] Contact honeypot triggered; message discarded.');
      return NextResponse.json({ success: true, message: 'Thank you for reaching out. The Secretariat has received your message.' }, { status: 201 });
    }
    if (signal) {
      console.warn(`[BotCheck] Contact message refused (${signal}); the visitor was asked to resubmit.`);
      const { status, message: text } = botCheckResponse(signal);
      return NextResponse.json({ success: false, message: text }, { status });
    }

    // Validated before the limit is counted, so correcting a typo never uses up an attempt.
    const formData = normalizeFormStrings({ name, email, queryType, message }) as ContactFormData;
    const errors = validateContactForm(formData);
    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ success: false, message: 'Please resolve the highlighted issues in the form.', errors }, { status: 422 });
    }

    const ip = clientIp(req);
    if (!(await verifyTurnstile(turnstile_token, ip))) {
      return NextResponse.json({ success: false, message: TURNSTILE_FAILED_MESSAGE, turnstile: true }, { status: 403 });
    }

    const rateLimit = await enforceRateLimit('contact', ip);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, message: 'Too many messages sent. Please wait before submitting again.' },
        { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) } },
      );
    }

    const delivery = await createContactMessage({ ...formData, kind: kind === 'clarification' ? 'clarification' : 'contact' }, submissionKey);
    after(async () => { try { await dispatchEmailOutbox(); } catch { console.error('[Outbox] Dispatch deferred to next worker.'); } });
    return NextResponse.json(
      {
        success: true,
        message: delivery.notificationQueued
          ? 'Thank you for reaching out. The Secretariat has received your message.'
          : 'Your message has been recorded. The Secretariat will respond through the published contact channels.',
        notificationQueued: delivery.notificationQueued,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof SubmissionServiceError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.status });
    }
    console.error('[Contact API] Unexpected failure');
    return NextResponse.json({ success: false, message: 'An internal server error occurred. Please try again.' }, { status: 500 });
  }
}
