import { NextRequest, NextResponse } from 'next/server';
import {
  validateGimunIndividual,
  validateGimunDelegation,
  validateMootCupTeam,
  type ValidationErrors,
} from '@/lib/validation';
import { getCommittees, getProblemCategories, getSiteConfig } from '@/lib/content';
import {
  clientIp,
  createRegistration,
  enforceRateLimit,
  SubmissionServiceError,
} from '@/lib/server/submissions';
import { MIN_FILL_TIME_MS } from '@/lib/honeypot';
import type {
  GimunIndividualData,
  GimunDelegationData,
  MootCupTeamData,
} from '@/lib/types';

function isTrackOpen(track: 'gimun' | 'moot-cup') {
  const site = getSiteConfig();
  const manuallyOpen = track === 'gimun'
    ? site.registrationStatus?.gimunOpen !== false
    : site.registrationStatus?.mootCupOpen !== false;
  const deadline = track === 'gimun' ? site.registrationDeadlines.gimun : site.registrationDeadlines.mootCup;
  const deadlinePassed = Date.now() > new Date(`${deadline}T23:59:59+05:00`).getTime();
  return manuallyOpen && !deadlinePassed;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { track, applicantType, formData, _hp, _ts } = body || {};

    if (_hp && String(_hp).trim().length > 0) {
      return NextResponse.json(
        { success: false, referenceId: 'REG-BOT-BLOCKED', message: 'Automated submission blocked by anti-bot honeypot filter.' },
        { status: 400 },
      );
    }

    if (_ts && Date.now() - Number(_ts) < MIN_FILL_TIME_MS) {
      return NextResponse.json(
        { success: false, referenceId: 'REG-BOT-SPEED', message: 'Submission velocity too fast. Automated submissions are blocked.' },
        { status: 400 },
      );
    }

    if (!track || !['gimun', 'moot-cup'].includes(track)) {
      return NextResponse.json({ success: false, message: 'Invalid track specified.' }, { status: 400 });
    }

    if (!isTrackOpen(track)) {
      return NextResponse.json(
        { success: false, message: 'Registration for this track is currently closed.' },
        { status: 409 },
      );
    }

    const rateLimit = await enforceRateLimit('registration', clientIp(req));
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, message: 'Too many requests. Please wait before submitting again.' },
        { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) } },
      );
    }

    let errors: ValidationErrors = {};
    const committeeIds = getCommittees().flatMap((committee) => [committee.id, committee.slug]);
    const categoryIds = getProblemCategories().map((category) => category.id);

    if (track === 'gimun' && applicantType === 'individual') {
      errors = validateGimunIndividual(formData as GimunIndividualData, committeeIds);
    } else if (track === 'gimun' && applicantType === 'delegation') {
      errors = validateGimunDelegation(formData as GimunDelegationData, committeeIds);
    } else if (track === 'moot-cup' && applicantType === 'team') {
      errors = validateMootCupTeam(formData as MootCupTeamData, categoryIds);
    } else {
      return NextResponse.json({ success: false, message: 'Invalid applicant type for the selected track.' }, { status: 400 });
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { success: false, message: 'Validation failed. Please review the highlighted fields.', errors },
        { status: 422 },
      );
    }

    let applicantName = '';
    let institution = '';
    let email = '';
    let participantCount = 1;

    if (track === 'gimun' && applicantType === 'individual') {
      const individual = formData as GimunIndividualData;
      applicantName = individual.fullName;
      institution = individual.institution;
      email = individual.email;
    } else if (track === 'gimun') {
      const delegation = formData as GimunDelegationData;
      applicantName = `${delegation.delegationHeadName} (Head Delegate)`;
      institution = delegation.institution;
      email = delegation.delegationHeadEmail;
      participantCount = delegation.delegates.length;
    } else {
      const team = formData as MootCupTeamData;
      applicantName = team.teamName;
      institution = team.institution;
      email = team.members[0]?.email || '';
      participantCount = team.members.length;
    }

    const submittedAt = new Date().toISOString();
    const delivery = await createRegistration({
      track,
      applicantType,
      formData,
      applicantName,
      institution,
      email,
      participantCount,
      submittedAt,
    });

    return NextResponse.json(
      {
        success: true,
        referenceId: delivery.referenceId,
        message: delivery.emailQueued
          ? 'Application received successfully. A receipt has been sent to the contact email.'
          : 'Application received successfully. Preserve your reference number for correspondence.',
        emailQueued: delivery.emailQueued,
        notificationQueued: delivery.notificationQueued,
        receipt: { applicantName, institution, email, track, applicantType, participantCount, submittedAt },
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof SubmissionServiceError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.status });
    }
    console.error('[Registration API] Unexpected failure');
    return NextResponse.json({ success: false, message: 'An internal server error occurred. Please try again.' }, { status: 500 });
  }
}
