import { NextRequest, NextResponse } from 'next/server';
import { validateContactForm } from '@/lib/validation';
import { MIN_FILL_TIME_MS } from '@/lib/honeypot';
import {
  clientIp,
  createContactMessage,
  enforceRateLimit,
  SubmissionServiceError,
} from '@/lib/server/submissions';
import type { ContactFormData } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, queryType, message, _hp, _ts } = body || {};

    if (_hp && String(_hp).trim().length > 0) {
      return NextResponse.json({ success: false, message: 'Automated inquiry blocked by anti-bot honeypot filter.' }, { status: 400 });
    }

    if (_ts && Date.now() - Number(_ts) < MIN_FILL_TIME_MS) {
      return NextResponse.json({ success: false, message: 'Submission velocity too fast. Automated submissions are blocked.' }, { status: 400 });
    }

    const rateLimit = await enforceRateLimit('contact', clientIp(req));
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, message: 'Too many messages sent. Please wait before submitting again.' },
        { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) } },
      );
    }

    const formData: ContactFormData = { name, email, queryType, message };
    const errors = validateContactForm(formData);
    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ success: false, message: 'Please resolve the highlighted issues in the form.', errors }, { status: 422 });
    }

    const delivery = await createContactMessage(formData);
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
