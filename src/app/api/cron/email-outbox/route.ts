import { timingSafeEqual } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { drainEmailOutbox, SubmissionServiceError } from '@backend/server/submissions';

export const maxDuration = 60;
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || !constantTimeEquals(request.headers.get('authorization') ?? '', `Bearer ${secret}`)) {
    return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const result = await drainEmailOutbox();
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    if (error instanceof SubmissionServiceError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.status });
    }
    return NextResponse.json({ success: false, message: 'Email dispatch failed.' }, { status: 500 });
  }
}

function constantTimeEquals(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}
