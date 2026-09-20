import { randomUUID } from 'node:crypto';
import { after, NextRequest, NextResponse } from 'next/server';
import {
  validateGimunIndividual,
  validateGimunDelegation,
  validateMootCupTeam,
  normalizeFormStrings,
  type ValidationErrors,
} from '@/lib/validation';
import { getCommittees, getProblemCategories, getSiteConfig } from '@/lib/content';
import {
  dispatchEmailOutbox,
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
import { JsonBodyError, readJsonBody } from '@/lib/server/request';

async function isTrackOpen(track: 'gimun' | 'moot-cup') {
  const site = (await getSiteConfig());
  const manuallyOpen = track === 'gimun'
    ? site.registrationStatus?.gimunOpen !== false
    : site.registrationStatus?.mootCupOpen !== false;
  const deadline = track === 'gimun' ? site.registrationDeadlines.gimun : site.registrationDeadlines.mootCup;
  const deadlinePassed = isRegistrationDeadlinePassed(deadline);
  return manuallyOpen && !deadlinePassed;
}

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

    const payload = body as Record<string, unknown>;
    const { track: trackValue, applicantType: applicantTypeValue, formData, _hp, _ts } = payload;

    const loadedAt = Number(_ts);
    if ((_hp && String(_hp).trim()) || (process.env.NODE_ENV === 'production' && !_ts) || (_ts && (!Number.isFinite(loadedAt) || Date.now() - loadedAt < MIN_FILL_TIME_MS))) {
      return NextResponse.json({ success: true, referenceId: `REG-${trackValue === 'moot-cup' ? 'MOOT' : 'GIMUN'}-${new Date().getFullYear()}-0000`, message: 'Application received successfully.' }, { status: 201 });
    }

    if (trackValue !== 'gimun' && trackValue !== 'moot-cup') {
      return NextResponse.json({ success: false, message: 'Invalid track specified.' }, { status: 400 });
    }
    const track = trackValue;
    const submissionKey = payload.submission_key === undefined && process.env.NODE_ENV !== 'production' ? randomUUID() : payload.submission_key;
    if (typeof submissionKey !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(submissionKey)) return NextResponse.json({ success:false, message:'A valid submission key is required.' }, { status:400 });

    if (applicantTypeValue !== 'individual' && applicantTypeValue !== 'delegation' && applicantTypeValue !== 'team') {
      return NextResponse.json({ success: false, message: 'Invalid applicant type specified.' }, { status: 400 });
    }
    const applicantType = applicantTypeValue;

    if (!formData || typeof formData !== 'object' || Array.isArray(formData)) {
      return NextResponse.json({ success: false, message: 'Form data must be a JSON object.' }, { status: 422 });
    }

    const normalizedFormData = normalizeFormStrings(formData) as GimunIndividualData | GimunDelegationData | MootCupTeamData;

    if (!(await isTrackOpen(track))) {
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
    const committeeIds = (await getCommittees()).flatMap((committee) => [committee.id, committee.slug]);
    const categoryIds = (await getProblemCategories()).map((category) => category.id);

    if (track === 'gimun' && applicantType === 'individual') {
      errors = validateGimunIndividual(normalizedFormData as GimunIndividualData, committeeIds);
    } else if (track === 'gimun' && applicantType === 'delegation') {
      errors = validateGimunDelegation(normalizedFormData as GimunDelegationData, committeeIds);
    } else if (track === 'moot-cup' && applicantType === 'team') {
      errors = validateMootCupTeam(normalizedFormData as MootCupTeamData, categoryIds);
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

    const site = (await getSiteConfig());

    if (track === 'gimun' && applicantType === 'individual') {
      const individual = normalizedFormData as GimunIndividualData;
      applicantName = individual.fullName;
      institution = individual.institution;
      email = individual.email;
      phone = individual.phone || '';
      const c1 = (await getCommittees()).find((c) => c.id === individual.committeePreference1 || c.slug === individual.committeePreference1)?.name || individual.committeePreference1;
      summary = `1st Pref: ${c1}`;
      feeAmount = site.fees.gimunIndividual;
    } else if (track === 'gimun') {
      const delegation = normalizedFormData as GimunDelegationData;
      applicantName = `${delegation.delegationHeadName} (Head Delegate)`;
      institution = delegation.institution;
      email = delegation.delegationHeadEmail;
      phone = delegation.delegationHeadPhone || '';
      participantCount = delegation.delegates.length;
      summary = `Institutional Delegation (${participantCount} Delegates)`;
      feeAmount = `${site.fees.gimunDelegationPerDelegate} × ${participantCount} delegates`;
    } else {
      const team = normalizedFormData as MootCupTeamData;
      applicantName = team.teamName;
      institution = team.institution;
      email = team.members[0]?.email || '';
      phone = team.members[0]?.phone || '';
      participantCount = team.members.length;
      const cat = (await getProblemCategories()).find((c) => c.id === team.problemCategoryPreference)?.name || team.problemCategoryPreference;
      summary = `${cat} (${participantCount} Advocates)`;
      feeAmount = site.fees.mootCupTeam;
    }

    const submittedAt = new Date().toISOString();
    const eventDates = `${formatEventDate(site.eventDates.start)}–${formatEventDate(site.eventDates.end, { day: 'numeric' })}`;
    const delivery = await createRegistration({
      submissionKey,
      amountDue: Number((applicantType === 'delegation' ? site.fees.gimunDelegationPerDelegate : feeAmount).replace(/[^0-9.]/g, '')) * (applicantType === 'delegation' ? participantCount : 1),
      track,
      applicantType,
      formData: normalizedFormData,
      applicantName,
      institution,
      email,
      participantCount,
      submittedAt,
      phone,
      feeAmount,
      summary,
    });

    after(async () => { try { await dispatchEmailOutbox(); } catch { console.error('[Outbox] Dispatch deferred to next worker.'); } });
    return NextResponse.json(
      {
        success: true,
        referenceId: delivery.referenceId,
        checkinToken: delivery.checkinToken,
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
