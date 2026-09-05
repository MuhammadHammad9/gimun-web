import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import {
  validateGimunIndividual,
  validateGimunDelegation,
  validateMootCupTeam,
  type ValidationErrors,
} from '@/lib/validation';
import { getCommittees, getProblemCategories } from '@/lib/content';
import { MIN_FILL_TIME_MS, RATE_LIMIT } from '@/lib/honeypot';
import type {
  GimunIndividualData,
  GimunDelegationData,
  MootCupTeamData,
  RegistrationSubmission,
} from '@/lib/types';

// In-memory rate limiting map
const ipSubmissions = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = ipSubmissions.get(ip);

  if (!record || now > record.resetAt) {
    ipSubmissions.set(ip, { count: 1, resetAt: now + RATE_LIMIT.windowMs });
    return true;
  }

  if (record.count >= RATE_LIMIT.maxRequests) {
    return false;
  }

  record.count += 1;
  return true;
}

function getNextReferenceId(track: 'gimun' | 'moot-cup'): string {
  const counterPath = path.join(process.cwd(), 'data', 'submission-counter.json');
  let counter = { gimun: 0, mootCup: 0, contact: 0 };

  try {
    if (fs.existsSync(counterPath)) {
      const raw = fs.readFileSync(counterPath, 'utf8');
      counter = JSON.parse(raw);
    }
  } catch {
    // fallback
  }

  const key = track === 'gimun' ? 'gimun' : 'mootCup';
  counter[key] = (counter[key] || 0) + 1;

  try {
    const dir = path.dirname(counterPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(counterPath, JSON.stringify(counter, null, 2), 'utf8');
  } catch {
    // fallback
  }

  const prefix = track === 'gimun' ? 'REG-GIMUN-2027' : 'REG-MOOT-2027';
  const numStr = String(counter[key]).padStart(4, '0');
  return `${prefix}-${numStr}`;
}

function saveSubmission(submission: RegistrationSubmission) {
  const submissionsFile = path.join(process.cwd(), 'data', 'submissions', 'registrations.json');
  const dir = path.dirname(submissionsFile);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  let list: RegistrationSubmission[] = [];

  try {
    if (fs.existsSync(submissionsFile)) {
      const raw = fs.readFileSync(submissionsFile, 'utf8');
      list = JSON.parse(raw);
    }
  } catch {
    list = [];
  }

  list.push(submission);

  try {
    fs.writeFileSync(submissionsFile, JSON.stringify(list, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to persist submission to disk:', err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';

    // 1. Rate Limit Check
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { success: false, message: 'Too many requests. Please wait a few minutes before trying again.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { track, applicantType, formData, _hp, _ts } = body || {};

    // 2. Honeypot check (Silent success to not alert bots)
    if (_hp && String(_hp).trim().length > 0) {
      return NextResponse.json({
        success: true,
        referenceId: 'REG-BOT-BLOCKED',
        message: 'Application received successfully.',
      });
    }

    // 3. Form fill time check (Reject ultra-fast bot submissions silently)
    if (_ts && Date.now() - Number(_ts) < MIN_FILL_TIME_MS) {
      return NextResponse.json({
        success: true,
        referenceId: 'REG-BOT-SPEED',
        message: 'Application received successfully.',
      });
    }

    if (!track || !['gimun', 'moot-cup'].includes(track)) {
      return NextResponse.json(
        { success: false, message: 'Invalid track specified.' },
        { status: 400 }
      );
    }

    // 4. Server-Side Validation
    let errors: ValidationErrors = {};

    if (track === 'gimun') {
      const committeeIds = getCommittees().flatMap((c) => [c.id, c.slug]);
      if (applicantType === 'individual') {
        errors = validateGimunIndividual(formData as GimunIndividualData, committeeIds);
      } else if (applicantType === 'delegation') {
        errors = validateGimunDelegation(formData as GimunDelegationData, committeeIds);
      } else {
        return NextResponse.json(
          { success: false, message: 'Invalid applicant type for GIMUN.' },
          { status: 400 }
        );
      }
    } else {
      const categoryIds = getProblemCategories().map((c) => c.id);
      errors = validateMootCupTeam(formData as MootCupTeamData, categoryIds);
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed. Please review the highlighted fields.',
          errors,
        },
        { status: 422 }
      );
    }

    // 5. Generate Reference ID & Save
    const referenceId = getNextReferenceId(track);
    const submittedAt = new Date().toISOString();

    let applicantName = '';
    let institution = '';
    let email = '';
    let participantCount = 1;

    if (track === 'gimun') {
      if (applicantType === 'individual') {
        const ind = formData as GimunIndividualData;
        applicantName = ind.fullName || '';
        institution = ind.institution || '';
        email = ind.email || '';
        participantCount = 1;
      } else {
        const del = formData as GimunDelegationData;
        applicantName = del.delegationHeadName ? `${del.delegationHeadName} (Head Delegate)` : 'Delegation Head';
        institution = del.institution || '';
        email = del.delegationHeadEmail || '';
        participantCount = del.delegates?.length || del.delegateCount || 1;
      }
    } else {
      const moot = formData as MootCupTeamData;
      applicantName = moot.teamName || 'Moot Court Team';
      institution = moot.institution || '';
      email = moot.members?.[0]?.email || '';
      participantCount = moot.members?.length || 2;
    }

    const submissionRecord: RegistrationSubmission = {
      id: referenceId,
      track,
      applicantType: applicantType || 'individual',
      submittedAt,
      status: 'received',
      formData,
    };

    saveSubmission(submissionRecord);

    console.log(`[Registration Registered] ID: ${referenceId} | Track: ${track} | Type: ${applicantType}`);

    return NextResponse.json({
      success: true,
      referenceId,
      message: 'Application received successfully.',
      receipt: {
        applicantName,
        institution,
        email,
        track,
        applicantType: applicantType || 'individual',
        participantCount,
        submittedAt,
      },
    });
  } catch (err) {
    console.error('API /api/register error:', err);
    return NextResponse.json(
      { success: false, message: 'An internal server error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
