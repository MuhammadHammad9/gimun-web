import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { validateContactForm } from '@/lib/validation';
import { MIN_FILL_TIME_MS, RATE_LIMIT } from '@/lib/honeypot';
import type { ContactFormData } from '@/lib/types';

const ipContacts = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = ipContacts.get(ip);

  if (!record || now > record.resetAt) {
    ipContacts.set(ip, { count: 1, resetAt: now + RATE_LIMIT.windowMs });
    return true;
  }

  if (record.count >= RATE_LIMIT.maxRequests) {
    return false;
  }

  record.count += 1;
  return true;
}

function saveContactMessage(record: { id: string; submittedAt: string; data: ContactFormData }) {
  const contactsFile = path.join(process.cwd(), 'data', 'submissions', 'contacts.json');
  const dir = path.dirname(contactsFile);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  let list: Array<{ id: string; submittedAt: string; data: ContactFormData }> = [];

  try {
    if (fs.existsSync(contactsFile)) {
      const raw = fs.readFileSync(contactsFile, 'utf8');
      list = JSON.parse(raw);
    }
  } catch {
    list = [];
  }

  list.push(record);

  try {
    fs.writeFileSync(contactsFile, JSON.stringify(list, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to save contact query:', err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { success: false, message: 'Too many messages sent. Please wait before submitting again.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { name, email, queryType, message, _hp, _ts } = body || {};

    if (_hp && String(_hp).trim().length > 0) {
      return NextResponse.json({
        success: true,
        message: 'Your inquiry has been received.',
      });
    }

    if (_ts && Date.now() - Number(_ts) < MIN_FILL_TIME_MS) {
      return NextResponse.json({
        success: true,
        message: 'Your inquiry has been received.',
      });
    }

    const formData: ContactFormData = { name, email, queryType, message };
    const errors = validateContactForm(formData);

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Please resolve the highlighted issues in the form.',
          errors,
        },
        { status: 422 }
      );
    }

    const contactId = `INQ-${Date.now().toString(36).toUpperCase()}`;
    saveContactMessage({
      id: contactId,
      submittedAt: new Date().toISOString(),
      data: formData,
    });

    console.log(`[Contact Message Received] ID: ${contactId} | Query: ${queryType} | From: ${email}`);

    return NextResponse.json({
      success: true,
      message: 'Thank you for reaching out. Our Secretariat will respond within 24 hours.',
    });
  } catch (err) {
    console.error('API /api/contact error:', err);
    return NextResponse.json(
      { success: false, message: 'An internal server error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
