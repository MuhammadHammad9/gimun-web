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
import { formatEventDate, isRegistrationDeadlinePassed } from '@/lib/site-config';

function isTrackOpen(track: 'gimun' | 'moot-cup') {
  const site = getSiteConfig();
  const manuallyOpen = track === 'gimun'
    ? site.registrationStatus?.gimunOpen !== false
    : site.registrationStatus?.mootCupOpen !== false;
  const deadline = track === 'gimun' ? site.registrationDeadlines.gimun : site.registrationDeadlines.mootCup;
  const deadlinePassed = isRegistrationDeadlinePassed(deadline);
  return manuallyOpen && !deadlinePassed;
}

export async function POST(req: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ success: false, message: 'Request body must be valid JSON.' }, { status: 400 });
    }

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ success: false, message: 'Request body must be a JSON object.' }, { status: 400 });
    }

    const payload = body as Record<string, unknown>;
    const { track: trackValue, applicantType: applicantTypeValue, formData, _hp, _ts } = payload;

    if (_hp && String(_hp).trim().length > 0) {
      return NextResponse.json(
        { success: false, referenceId: 'REG-BOT-BLOCKED', message: 'Automated submission blocked by anti-bot honeypot filter.' },
        { status: 400 },
      );
    }

    const formLoadedAt = _ts === undefined || _ts === null || _ts === '' ? null : Number(_ts);
    if (formLoadedAt !== null && (!Number.isFinite(formLoadedAt) || Date.now() - formLoadedAt < MIN_FILL_TIME_MS)) {
      return NextResponse.json(
        { success: false, referenceId: 'REG-BOT-SPEED', message: 'Submission velocity too fast. Automated submissions are blocked.' },
        { status: 400 },
      );
    }

    if (trackValue !== 'gimun' && trackValue !== 'moot-cup') {
      return NextResponse.json({ success: false, message: 'Invalid track specified.' }, { status: 400 });
    }
    const track = trackValue;

    if (applicantTypeValue !== 'individual' && applicantTypeValue !== 'delegation' && applicantTypeValue !== 'team') {
      return NextResponse.json({ success: false, message: 'Invalid applicant type specified.' }, { status: 400 });
    }
    const applicantType = applicantTypeValue;

    if (!formData || typeof formData !== 'object' || Array.isArray(formData)) {
      return NextResponse.json({ success: false, message: 'Form data must be a JSON object.' }, { status: 422 });
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
    let phone = '';
    let summary = '';
    let feeAmount = '';
    let participantCount = 1;

    const site = getSiteConfig();

    if (track === 'gimun' && applicantType === 'individual') {
      const individual = formData as GimunIndividualData;
      applicantName = individual.fullName;
      institution = individual.institution;
      email = individual.email;
      phone = individual.phone || '';
      const c1 = getCommittees().find((c) => c.id === individual.committeePreference1 || c.slug === individual.committeePreference1)?.name || individual.committeePreference1;
      summary = `1st Pref: ${c1}`;
      feeAmount = site.fees.gimunIndividual;
    } else if (track === 'gimun') {
      const delegation = formData as GimunDelegationData;
      applicantName = `${delegation.delegationHeadName} (Head Delegate)`;
      institution = delegation.institution;
      email = delegation.delegationHeadEmail;
      phone = delegation.delegationHeadPhone || '';
      participantCount = delegation.delegates.length;
      summary = `Institutional Delegation (${participantCount} Delegates)`;
      feeAmount = `${site.fees.gimunDelegationPerDelegate} × ${participantCount} delegates`;
    } else {
      const team = formData as MootCupTeamData;
      applicantName = team.teamName;
      institution = team.institution;
      email = team.members[0]?.email || '';
      phone = team.members[0]?.phone || '';
      participantCount = team.members.length;
      const cat = getProblemCategories().find((c) => c.id === team.problemCategoryPreference)?.name || team.problemCategoryPreference;
      summary = `${cat} (${participantCount} Advocates)`;
      feeAmount = site.fees.mootCupTeam;
    }

    const submittedAt = new Date().toISOString();
    const eventDates = `${formatEventDate(site.eventDates.start)}–${formatEventDate(site.eventDates.end, { day: 'numeric' })}`;
    const delivery = await createRegistration({
      track,
      applicantType,
      formData: formData as GimunIndividualData | GimunDelegationData | MootCupTeamData,
      applicantName,
      institution,
      email,
      participantCount,
      submittedAt,
      phone,
      feeAmount,
      summary,
    });

    return NextResponse.json(
      {
        success: true,
        referenceId: delivery.referenceId,
        message: delivery.emailQueued
          ? 'Application received successfully. An official receipt has been dispatched to your email.'
          : 'Application received successfully. Preserve your reference number for correspondence.',
        emailQueued: delivery.emailQueued,
        notificationQueued: delivery.notificationQueued,
        receipt: {
          applicantName,
          institution,
          email,
          phone,
          track,
          applicantType,
          participantCount,
          feeAmount,
          summary,
          eventDates,
          venue: site.venue,
          submittedAt,
        },
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
