'use client';

import { useSiteConfig } from '@/components/SiteConfigProvider';

import { useSearchParams } from 'next/navigation';
import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, ArrowRight, User, Users, AlertCircle } from 'lucide-react';
import type {
  Committee,
  GimunIndividualData,
  GimunDelegationData,
  DelegateRosterEntry,
  SubmissionResponse,
} from '@/lib/types';
import { validateGimunIndividual, validateGimunDelegation, type ValidationErrors } from '@/lib/validation';
import { FormField } from './FormField';
import { HoneypotField } from './HoneypotField';
import { NonPaymentNotice } from './NonPaymentNotice';
import { FormErrorSummary, focusFirstError } from './FormErrorSummary';
import { PrivacyStatement } from './PrivacyStatement';
import { getEventYear } from '@/lib/site-config';
import { SubmitButton } from './SubmitButton';
import { newSubmissionKey, readSubmissionResponse } from '@/lib/uuid';
import { TURNSTILE_PENDING_MESSAGE, useTurnstile } from './Turnstile';
import { useDeviceLimit } from './useDeviceLimit';
import { DeviceLimitNotice } from './DeviceLimitNotice';

interface GimunRegisterFormProps {
  endpoint?: string;
  committees: Committee[];
  onSuccess: (
    refId: string,
    applicantName: string,
    applicantType: 'individual' | 'delegation',
    details?: {
      email?: string;
      institution?: string;
      phone?: string;
      summary?: string;
      feeAmount?: string;
      eventDates?: string;
      venue?: string;
      participantCount?: number;
      timestamp?: string;
      checkinToken?: string;
    }
  ) => void;
}

const initialIndividual: GimunIndividualData = {
  fullName: '',
  email: '',
  phone: '',
  institution: '',
  yearOfStudy: '',
  hasExperience: false,
  experienceDetails: '',
  committeePreference1: '',
  committeePreference2: '',
  committeePreference3: '',
  countryPreference: '',
  dietaryAccessibility: '',
  referralSource: '',
};

const initialDelegation: GimunDelegationData = {
  delegationHeadName: '',
  delegationHeadEmail: '',
  delegationHeadPhone: '',
  institution: '',
  delegateCount: 3,
  delegates: [
    { name: '', email: '', committeePreference1: '', committeePreference2: '', countryPreference: '' },
    { name: '', email: '', committeePreference1: '', committeePreference2: '', countryPreference: '' },
    { name: '', email: '', committeePreference1: '', committeePreference2: '', countryPreference: '' },
  ],
  dietaryAccessibility: '',
  referralSource: '',
};

export function GimunRegisterForm({ committees, onSuccess, endpoint = '/api/register' }: GimunRegisterFormProps) {
  const searchParams = useSearchParams();
  const committeeQuery = searchParams.get('committee');
  const validCommittee = committees.find(c => c.id === committeeQuery || c.slug === committeeQuery)?.id || '';
  const submissionKey = React.useRef<string | null>(null);
  const eventYear = getEventYear(useSiteConfig());
  const [applicantType, setApplicantType] = useState<'individual' | 'delegation'>(searchParams.get('type') === 'delegation' ? 'delegation' : 'individual');
  const [individualData, setIndividualData] = useState<GimunIndividualData>({ ...initialIndividual, committeePreference1: validCommittee });
  const [rosterCountDraft, setRosterCountDraft] = useState<string | null>(null);
  const [delegationData, setDelegationData] = useState<GimunDelegationData>(initialDelegation);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [status, setStatus] = useState<'idle' | 'submitting' | 'error'>('idle');
  const [serverError, setServerError] = useState<string | null>(null);
  const [honeypot, setHoneypot] = useState('');
  const formLoadedAt = useRef(0);
  // Staff walk-ins post to their own signed-in endpoint and skip the human check.
  const turnstile = useTurnstile(endpoint === '/api/register');
  // Per-device registration allowance (public portal only).
  const deviceLimit = useDeviceLimit(endpoint === '/api/register');

  useEffect(() => {
    formLoadedAt.current = Date.now();
  }, []);

  const committeeIds = committees.flatMap((c) => [c.id, c.slug]);

  const handleIndividualChange = <K extends keyof GimunIndividualData>(
    field: K,
    value: GimunIndividualData[K]
  ) => {
    setIndividualData((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'committeePreference1') {
        if (next.committeePreference2 === value) next.committeePreference2 = '';
        if (next.committeePreference3 === value) next.committeePreference3 = '';
      } else if (field === 'committeePreference2') {
        if (next.committeePreference3 === value) next.committeePreference3 = '';
      }
      return next;
    });

    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleDelegationChange = <K extends keyof GimunDelegationData>(
    field: K,
    value: GimunDelegationData[K]
  ) => {
    setDelegationData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleDelegateChange = (
    index: number,
    field: keyof DelegateRosterEntry,
    value: string
  ) => {
    setDelegationData((prev) => {
      const nextDelegates = [...prev.delegates];
      const updated = { ...nextDelegates[index], [field]: value };
      // The 2nd-choice list hides the 1st choice, so a clashing 2nd choice
      // would be invisible yet still fail validation. Clear it instead.
      if (field === 'committeePreference1' && updated.committeePreference2 === value) {
        updated.committeePreference2 = '';
      }
      nextDelegates[index] = updated;
      return { ...prev, delegates: nextDelegates };
    });

    const fieldKey =
      field === 'committeePreference1' ? 'pref1' : field === 'committeePreference2' ? 'pref2' : field;
    const staleKeys = [`delegate_${index}_${fieldKey}`, 'delegates'];
    if (field === 'committeePreference1') staleKeys.push(`delegate_${index}_pref2`);
    if (staleKeys.some((key) => errors[key])) {
      setErrors((prev) => {
        const next = { ...prev };
        staleKeys.forEach((key) => delete next[key]);
        return next;
      });
    }
  };

  const handleAddDelegate = () => {
    if (delegationData.delegates.length >= 20) return;
    setDelegationData((prev) => ({
      ...prev,
      delegateCount: prev.delegates.length + 1,
      delegates: [
        ...prev.delegates,
        { name: '', email: '', committeePreference1: '', committeePreference2: '', countryPreference: '' },
      ],
    }));
  };

  const handleRemoveDelegate = (index: number) => {
    if (delegationData.delegates.length <= 2) return;
    setDelegationData((prev) => {
      const nextDelegates = prev.delegates.filter((_, i) => i !== index);
      return {
        ...prev,
        delegateCount: nextDelegates.length,
        delegates: nextDelegates,
      };
    });
  };

  const handleDelegateCountChange = (count: number) => {
    const clamped = Math.max(2, Math.min(20, count || 2));
    setDelegationData((prev) => {
      let nextDelegates = [...prev.delegates];
      if (clamped > nextDelegates.length) {
        while (nextDelegates.length < clamped) {
          nextDelegates.push({
            name: '',
            email: '',
            committeePreference1: '',
            committeePreference2: '',
            countryPreference: '',
          });
        }
      } else if (clamped < nextDelegates.length) {
        nextDelegates = nextDelegates.slice(0, clamped);
      }
      return { ...prev, delegateCount: clamped, delegates: nextDelegates };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (deviceLimit.locked) {
      setServerError('This device has reached its registration limit. Please wait for the timer above, then try again.');
      return;
    }

    let validationResult: ValidationErrors = {};
    if (applicantType === 'individual') {
      validationResult = validateGimunIndividual(individualData, committeeIds);
    } else {
      validationResult = validateGimunDelegation(delegationData, committeeIds);
    }

    if (Object.keys(validationResult).length > 0) {
      setErrors(validationResult);
      focusFirstError(validationResult);
      return;
    }

    setErrors({});
    if (turnstile.pending()) {
      setServerError(TURNSTILE_PENDING_MESSAGE);
      return;
    }
    setStatus('submitting');

    try {
      const payload = {
        track: 'gimun',
        applicantType,
        formData: applicantType === 'individual' ? individualData : delegationData,
        _hp: honeypot,
        _ts: formLoadedAt.current,
        // Fill time on the visitor's own clock; the server never compares clocks.
        _elapsed: Date.now() - formLoadedAt.current,
        submission_key: submissionKey.current ?? (submissionKey.current = newSubmissionKey()),
        turnstile_token: turnstile.token(),
      };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await readSubmissionResponse<SubmissionResponse>(res);
      // Tokens are single-use; get a fresh one for any further attempt.
      turnstile.reset();

      if (!res.ok || !data.success) {
        setStatus('error');
        const limited = data as { deviceLimited?: boolean; retryAfterSeconds?: number };
        if (res.status === 429 && limited.deviceLimited) {
          deviceLimit.applyLockout(limited.retryAfterSeconds ?? deviceLimit.secondsLeft, deviceLimit.maxAttempts ?? undefined);
        }
        if (data.errors) {
          setErrors(data.errors);
          focusFirstError(data.errors);
        } else {
          setServerError(data.message || 'An unexpected error occurred. Please try again.');
        }
        return;
      }

      setStatus('idle');
      const applicantName =
        applicantType === 'individual'
          ? individualData.fullName
          : `${delegationData.delegationHeadName} (${delegationData.institution})`;

      const prefName =
        committees.find(
          (c) =>
            c.id === individualData.committeePreference1 ||
            c.slug === individualData.committeePreference1
        )?.name || individualData.committeePreference1;

      const details = {
        email: data.receipt?.email || (applicantType === 'individual' ? individualData.email : delegationData.delegationHeadEmail),
        institution: data.receipt?.institution || (applicantType === 'individual' ? individualData.institution : delegationData.institution),
        phone: data.receipt?.phone || (applicantType === 'individual' ? individualData.phone : delegationData.delegationHeadPhone),
        summary: data.receipt?.summary || (applicantType === 'individual' ? `1st Pref: ${prefName}` : `Entering as a delegation Roster (${delegationData.delegates.length} Delegates)`),
        feeAmount: data.receipt?.feeAmount,
        eventDates: data.receipt?.eventDates,
        venue: data.receipt?.venue,
        participantCount: data.receipt?.participantCount || (applicantType === 'individual' ? 1 : delegationData.delegates.length),
        timestamp: data.receipt?.submittedAt,
        checkinToken: data.checkinToken,
      };

      // A reference ending in zeros is the anti-bot decoy: nothing was stored.
      if (data.referenceId && /-0+$/.test(data.referenceId)) {
        setStatus('error');
        setServerError('Your application could not be confirmed. Reload the page, check your details and submit again, or email the Secretariat.');
        return;
      }
      if (!data.referenceId || !/^REG-GIMUN-\d{4}-\d{4,}$/.test(data.referenceId)) {
        setStatus('error');
        setServerError('The submission was stored but did not return a valid reference number. Please contact the Secretariat before submitting again.');
        return;
      }

      onSuccess(data.referenceId, applicantName, applicantType, details);
    } catch {
      turnstile.reset();
      console.error('Registration request failed.');
      setStatus('error');
      setServerError('Unable to reach registration server. Please check your connection.');
    }
  };
  return (
    <div className="double-bezel mx-auto max-w-3xl">
    <form
      onSubmit={handleSubmit}
      noValidate
      className="double-bezel-inner space-y-10 p-6 text-text-2 sm:p-10"
    >
      {deviceLimit.locked && (
        <DeviceLimitNotice secondsLeft={deviceLimit.secondsLeft} maxAttempts={deviceLimit.maxAttempts} />
      )}
      {/* Track Brand Bar & Switcher */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-line">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-champagne font-bold">
              GIMUN Track Registration
            </span>
            <h2 className="text-2xl md:text-3xl font-display font-medium text-text">
              Delegate Application Form
            </h2>
          </div>

          {/* Segmented Control */}
          <div className="relative flex p-1 rounded-xl bg-canvas border border-line">
            <button
              type="button"
              onClick={() => {
                setApplicantType('individual');
                setErrors({});
              }}
              className={`relative z-10 px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
                applicantType === 'individual' ? 'text-on-accent' : 'text-text-3 hover:text-champagne'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Individual entry</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setApplicantType('delegation');
                setErrors({});
              }}
              className={`relative z-10 px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
                applicantType === 'delegation' ? 'text-on-accent' : 'text-text-3 hover:text-champagne'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Delegation (Group)</span>
            </button>
            <div
              className="absolute top-1 bottom-1 rounded-lg bg-champagne"
              style={{
                left: applicantType === 'individual' ? '4px' : '50%',
                right: applicantType === 'individual' ? '50%' : '4px',
              }}
            />
          </div>
        </div>

        <p className="text-xs text-text-2 leading-relaxed">
          {applicantType === 'individual'
            ? 'Apply as an independent delegate. You will select committee preferences and receive country allocations from the Secretariat.'
            : 'Register a delegation representing a school, college, or university. The Delegation Head manages all delegate allocations.'}
        </p>
      </div>

      {serverError && (
        <div role="alert" className="p-4 rounded-xl bg-accent-gimun/8 border border-accent-gimun/40 text-accent-gimun flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-crimson-hi shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <span className="font-bold block">Submission Error</span>
            <span>{serverError}</span>
          </div>
        </div>
      )}

      {/* INDIVIDUAL FORM FIELDS */}
      <>
        {applicantType === 'individual' ? (
          <div
            key="individual-fields"
            className="space-y-6"
          >
            {/* Personal Details */}
            <div className="space-y-4">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-champagne flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-champagne" />
                <span>1. Personal &amp; Institutional Information</span>
              </h3>

              <div className="grid sm:grid-cols-2 gap-4">
                <FormField
                  label="Full Legal Name"
                  required
                  error={errors.fullName}
                  id="field-fullName"
                >
                  <input
                    type="text"
                    id="field-fullName"
                    autoComplete="name"
                    value={individualData.fullName}
                    onChange={(e) => handleIndividualChange('fullName', e.target.value)}
                    placeholder="e.g. Zaid Malik"
                    className="w-full px-4 py-3 rounded-xl border border-line-2 bg-canvas text-text placeholder-champagne/40 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-focus focus:border-champagne"
                  />
                </FormField>

                <FormField
                  label="Email Address"
                  required
                  description="Primary channel for allocation notices"
                  error={errors.email}
                  id="field-email"
                >
                  <input
                    type="email"
                    inputMode="email"
                    id="field-email"
                    autoComplete="email"
                    value={individualData.email}
                    onChange={(e) => handleIndividualChange('email', e.target.value)}
                    placeholder="zaid.malik@university.edu.pk"
                    className="w-full px-4 py-3 rounded-xl border border-line-2 bg-canvas text-text placeholder-champagne/40 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-focus focus:border-champagne"
                  />
                </FormField>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <FormField
                  label="Phone / WhatsApp"
                  required
                  error={errors.phone}
                  id="field-phone"
                >
                  <input
                    type="tel"
                    inputMode="tel"
                    id="field-phone"
                    autoComplete="tel"
                    value={individualData.phone}
                    onChange={(e) => handleIndividualChange('phone', e.target.value)}
                    placeholder="+92 300 1234567"
                    className="w-full px-4 py-3 rounded-xl border border-line-2 bg-canvas text-text placeholder-champagne/40 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-focus focus:border-champagne"
                  />
                </FormField>

                <FormField
                  label="University / School"
                  required
                  error={errors.institution}
                  id="field-institution"
                >
                  <input
                    type="text"
                    id="field-institution"
                    autoComplete="organization"
                    value={individualData.institution}
                    onChange={(e) => handleIndividualChange('institution', e.target.value)}
                    placeholder="e.g. GIKI, LUMS, NUST"
                    className="w-full px-4 py-3 rounded-xl border border-line-2 bg-canvas text-text placeholder-champagne/40 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-focus focus:border-champagne"
                  />
                </FormField>

                <FormField
                  label="Year of Study"
                  required
                  error={errors.yearOfStudy}
                  id="field-yearOfStudy"
                >
                  <select
                    id="field-yearOfStudy"
                    value={individualData.yearOfStudy}
                    onChange={(e) =>
                      handleIndividualChange(
                        'yearOfStudy',
                        e.target.value as GimunIndividualData['yearOfStudy']
                      )
                    }
                    className="w-full px-4 py-3 rounded-xl border border-line-2 bg-canvas text-text text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-focus focus:border-champagne"
                  >
                    <option value="" className="bg-canvas text-champagne">Select study level...</option>
                    <option value="freshman" className="bg-canvas text-champagne">Freshman / 1st Year</option>
                    <option value="sophomore" className="bg-canvas text-champagne">Sophomore / 2nd Year</option>
                    <option value="junior" className="bg-canvas text-champagne">Junior / 3rd Year</option>
                    <option value="senior" className="bg-canvas text-champagne">Senior / 4th Year</option>
                    <option value="postgraduate" className="bg-canvas text-champagne">Post-Graduate / Masters</option>
                    <option value="high-school-senior" className="bg-canvas text-champagne">High School / A-Levels Senior</option>
                  </select>
                </FormField>
              </div>
            </div>

            {/* Committee Preferences */}
            <div className="space-y-4 pt-3 border-t border-line">
              <div className="space-y-1">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-champagne flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-champagne" />
                  <span>2. Committee &amp; Country Preferences</span>
                </h3>
                <p className="text-[11px] text-text-3">
                  Select 3 distinct committee preferences in order of interest.
                </p>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <FormField
                  label="1st Committee Preference"
                  required
                  error={errors.committeePreference1}
                  id="field-committeePreference1"
                >
                  <select
                    id="field-committeePreference1"
                    value={individualData.committeePreference1}
                    onChange={(e) => handleIndividualChange('committeePreference1', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-line-2 bg-canvas text-text text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-focus focus:border-champagne"
                  >
                    <option value="" className="bg-canvas text-champagne">Select 1st choice...</option>
                    {committees.map((c) => (
                      <option key={c.id} value={c.id} className="bg-canvas text-champagne">
                        {c.name}
                      </option>
                    ))}
                  </select>
                </FormField>

                <FormField
                  label="2nd Committee Preference"
                  required
                  error={errors.committeePreference2}
                  id="field-committeePreference2"
                >
                  <select
                    id="field-committeePreference2"
                    value={individualData.committeePreference2}
                    onChange={(e) => handleIndividualChange('committeePreference2', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-line-2 bg-canvas text-text text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-focus focus:border-champagne"
                  >
                    <option value="" className="bg-canvas text-champagne">Select 2nd choice...</option>
                    {committees
                      .filter((c) => c.id !== individualData.committeePreference1)
                      .map((c) => (
                        <option key={c.id} value={c.id} className="bg-canvas text-champagne">
                          {c.name}
                        </option>
                      ))}
                  </select>
                </FormField>

                <FormField
                  label="3rd Committee Preference"
                  required
                  error={errors.committeePreference3}
                  id="field-committeePreference3"
                >
                  <select
                    id="field-committeePreference3"
                    value={individualData.committeePreference3}
                    onChange={(e) => handleIndividualChange('committeePreference3', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-line-2 bg-canvas text-text text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-focus focus:border-champagne"
                  >
                    <option value="" className="bg-canvas text-champagne">Select 3rd choice...</option>
                    {committees
                      .filter(
                        (c) =>
                          c.id !== individualData.committeePreference1 &&
                          c.id !== individualData.committeePreference2
                      )
                      .map((c) => (
                        <option key={c.id} value={c.id} className="bg-canvas text-champagne">
                          {c.name}
                        </option>
                      ))}
                  </select>
                </FormField>
              </div>

              <FormField
                label="Country / Delegation Preference (Optional)"
                description="List your preferred country assignment (e.g., France, Japan, Brazil)"
                error={errors.countryPreference}
                id="field-countryPreference"
              >
                <input
                  type="text"
                  id="field-countryPreference"
                  value={individualData.countryPreference}
                  onChange={(e) => handleIndividualChange('countryPreference', e.target.value)}
                  placeholder="e.g. United Kingdom, China, South Africa"
                  className="w-full px-4 py-3 rounded-xl border border-line-2 bg-canvas text-text placeholder-champagne/40 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-focus focus:border-champagne"
                />
              </FormField>
            </div>

            {/* Prior Experience */}
            <div className="space-y-4 pt-3 border-t border-line">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-champagne flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-champagne" />
                <span>3. Prior MUN Experience</span>
              </h3>

              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-4">
                  <span className="text-xs font-semibold text-text">Have you attended MUN conferences before?</span>
                  <div className="inline-flex rounded-xl border border-line bg-canvas p-1 text-xs">
                    <button
                      type="button"
                      onClick={() => handleIndividualChange('hasExperience', true)}
                      className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                        individualData.hasExperience
                          ? 'bg-champagne text-on-accent'
                          : 'text-text-3 hover:text-champagne'
                      }`}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleIndividualChange('hasExperience', false);
                        handleIndividualChange('experienceDetails', '');
                      }}
                      className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                        !individualData.hasExperience
                          ? 'bg-champagne text-on-accent'
                          : 'text-text-3 hover:text-champagne'
                      }`}
                    >
                      No (First MUN)
                    </button>
                  </div>
                </div>

                {individualData.hasExperience && (
                  <FormField
                    label="Conference Experience & Awards"
                    description="Briefly list past conferences, committees attended, and distinctions won"
                    error={errors.experienceDetails}
                    id="field-experienceDetails"
                  >
                    <textarea
                      id="field-experienceDetails"
                      rows={3}
                      value={individualData.experienceDetails}
                      onChange={(e) => handleIndividualChange('experienceDetails', e.target.value)}
                      placeholder="e.g. LUMUN 2025 (DISEC, Outstanding Delegate), HMUN Asia 2024 (UNSC)..."
                      className="w-full px-4 py-3 rounded-xl border border-line-2 bg-canvas text-text placeholder-champagne/40 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-focus focus:border-champagne"
                    />
                  </FormField>
                )}
              </div>
            </div>

            {/* Logistics & Referral */}
            <div className="space-y-4 pt-3 border-t border-line">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-champagne flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-champagne" />
                <span>4. Logistics &amp; Referral</span>
              </h3>

              <FormField
                label="Dietary & Accessibility Accommodations (Optional)"
                description="Medical dietary restrictions or campus mobility accommodations"
                error={errors.dietaryAccessibility}
                id="field-dietaryAccessibility"
              >
                <textarea
                  id="field-dietaryAccessibility"
                  rows={2}
                  value={individualData.dietaryAccessibility}
                  onChange={(e) => handleIndividualChange('dietaryAccessibility', e.target.value)}
                  placeholder="Specify any dietary restrictions or wheelchair access requirements..."
                  className="w-full px-4 py-3 rounded-xl border border-line-2 bg-canvas text-text placeholder-champagne/40 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-focus focus:border-champagne"
                />
              </FormField>

              <FormField
                label={`How did you hear about GIMUN ${eventYear}?`}
                required
                error={errors.referralSource}
                id="field-referralSource"
              >
                <select
                  id="field-referralSource"
                  value={individualData.referralSource}
                  onChange={(e) =>
                    handleIndividualChange(
                      'referralSource',
                      e.target.value as GimunIndividualData['referralSource']
                    )
                  }
                  className="w-full px-4 py-3 rounded-xl border border-line-2 bg-canvas text-text text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-focus focus:border-champagne"
                >
                  <option value="" className="bg-canvas text-champagne">Select referral channel...</option>
                  <option value="social-media" className="bg-canvas text-champagne">Social Media (Instagram / Facebook / LinkedIn)</option>
                  <option value="university-club" className="bg-canvas text-champagne">University Club / Debating Society</option>
                  <option value="friend" className="bg-canvas text-champagne">Friend / Colleague Recommendation</option>
                  <option value="faculty-advisor" className="bg-canvas text-champagne">Faculty Advisor / Teacher</option>
                  <option value="campus-ambassador" className="bg-canvas text-champagne">Campus Ambassador / Poster</option>
                  <option value="other" className="bg-canvas text-champagne">Other</option>
                </select>
              </FormField>
            </div>
          </div>
        ) : (
          /* DELEGATION FORM FIELDS */
          <div
            key="delegation-fields"
            className="space-y-6"
          >
            {/* Delegation Head Details */}
            <div className="space-y-4">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-champagne flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-champagne" />
                <span>1. Head Delegate / Faculty Advisor Information</span>
              </h3>

              <div className="grid sm:grid-cols-2 gap-4">
                <FormField
                  label="Head Delegate / Advisor Name"
                  required
                  error={errors.delegationHeadName}
                  id="field-delegationHeadName"
                >
                  <input
                    type="text"
                    id="field-delegationHeadName"
                    autoComplete="name"
                    value={delegationData.delegationHeadName}
                    onChange={(e) => handleDelegationChange('delegationHeadName', e.target.value)}
                    placeholder="e.g. Prof. Tariq Ahmed / Sarah Khan"
                    className="w-full px-4 py-3 rounded-xl border border-line-2 bg-canvas text-text placeholder-champagne/40 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-focus focus:border-champagne"
                  />
                </FormField>

                <FormField
                  label="Official Email Address"
                  required
                  description="Primary channel for delegation invoices & allocations"
                  error={errors.delegationHeadEmail}
                  id="field-delegationHeadEmail"
                >
                  <input
                    type="email"
                    inputMode="email"
                    id="field-delegationHeadEmail"
                    autoComplete="email"
                    value={delegationData.delegationHeadEmail}
                    onChange={(e) => handleDelegationChange('delegationHeadEmail', e.target.value)}
                    placeholder="head.delegate@institution.edu.pk"
                    className="w-full px-4 py-3 rounded-xl border border-line-2 bg-canvas text-text placeholder-champagne/40 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-focus focus:border-champagne"
                  />
                </FormField>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <FormField
                  label="Phone / WhatsApp Contact"
                  required
                  error={errors.delegationHeadPhone}
                  id="field-delegationHeadPhone"
                >
                  <input
                    type="tel"
                    inputMode="tel"
                    id="field-delegationHeadPhone"
                    autoComplete="tel"
                    value={delegationData.delegationHeadPhone}
                    onChange={(e) => handleDelegationChange('delegationHeadPhone', e.target.value)}
                    placeholder="+92 300 9876543"
                    className="w-full px-4 py-3 rounded-xl border border-line-2 bg-canvas text-text placeholder-champagne/40 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-focus focus:border-champagne"
                  />
                </FormField>

                <FormField
                  label="School / College / University Name"
                  required
                  error={errors.institution}
                  id="field-institution"
                >
                  <input
                    type="text"
                    id="field-institution"
                    autoComplete="organization"
                    value={delegationData.institution}
                    onChange={(e) => handleDelegationChange('institution', e.target.value)}
                    placeholder="e.g. Lahore University of Management Sciences"
                    className="w-full px-4 py-3 rounded-xl border border-line-2 bg-canvas text-text placeholder-champagne/40 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-focus focus:border-champagne"
                  />
                </FormField>
              </div>
            </div>

            {/* Delegation Size & Dynamic Roster */}
            <div id="field-delegates" className="space-y-4 pt-3 border-t border-line">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-champagne flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-champagne" />
                    <span>2. Delegation Roster ({delegationData.delegates.length} Delegates)</span>
                  </h3>
                  <p className="text-[11px] text-text-3">
                    Minimum 2 delegates; maximum 20 per roster submission.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <label htmlFor="field-delegateCount" className="text-xs font-semibold text-text">
                    Roster Size:
                  </label>
                  <input
                    type="number"
                    id="field-delegateCount"
                    min={2}
                    max={20}
                    value={rosterCountDraft ?? delegationData.delegateCount}
                    onChange={e => setRosterCountDraft(e.target.value)}
                    onBlur={() => { if (rosterCountDraft !== null && rosterCountDraft !== '') handleDelegateCountChange(Number(rosterCountDraft)); setRosterCountDraft(null); }}
                    className="w-20 px-3 py-1.5 rounded-xl border border-line-2 bg-canvas text-text text-xs text-center font-bold font-mono focus:outline-none focus:ring-2 focus:ring-focus"
                  />
                </div>
              </div>

              {(errors.delegateCount || errors.delegates) && (
                <p role="alert" className="text-xs text-accent-gimun font-medium">{errors.delegateCount || errors.delegates}</p>
              )}

              {/* Repeatable Delegate Cards */}
              <div className="space-y-4">
                {delegationData.delegates.map((del, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-xl bg-raised border border-line hover:border-line-2 transition-colors space-y-4 relative"
                  >
                    <div className="flex items-center justify-between gap-2 border-b border-line pb-2">
                      <span className="text-xs font-mono font-bold uppercase text-text">
                        Delegate #{idx + 1}
                      </span>
                      {delegationData.delegates.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveDelegate(idx)}
                          className="inline-flex items-center gap-1 text-[11px] text-text-3 hover:text-accent-gimun transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3">
                      <FormField
                        label="Full Name"
                        required
                        id={`field-delegate_${idx}_name`}
                        error={errors[`delegate_${idx}_name`]}
                      >
                        <input
                          type="text"
                          id={`field-delegate_${idx}_name`}
                          autoComplete="name"
                          value={del.name}
                          onChange={(e) => handleDelegateChange(idx, 'name', e.target.value)}
                          placeholder="Delegate name"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-line-2 bg-canvas text-text placeholder-champagne/40 text-base sm:text-xs focus:outline-none focus:ring-2 focus:ring-focus focus:border-champagne"
                        />
                      </FormField>

                      <FormField
                        label="Delegate Email"
                        required
                        id={`field-delegate_${idx}_email`}
                        error={errors[`delegate_${idx}_email`]}
                      >
                        <input
                          type="email"
                          inputMode="email"
                          id={`field-delegate_${idx}_email`}
                          autoComplete="email"
                          value={del.email}
                          onChange={(e) => handleDelegateChange(idx, 'email', e.target.value)}
                          placeholder="delegate@institution.edu.pk"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-line-2 bg-canvas text-text placeholder-champagne/40 text-base sm:text-xs focus:outline-none focus:ring-2 focus:ring-focus focus:border-champagne"
                        />
                      </FormField>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-3">
                      <FormField
                        label="1st Committee Preference"
                        required
                        id={`field-delegate_${idx}_pref1`}
                        error={errors[`delegate_${idx}_pref1`]}
                      >
                        <select
                          id={`field-delegate_${idx}_pref1`}
                          value={del.committeePreference1}
                          onChange={(e) => handleDelegateChange(idx, 'committeePreference1', e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-line-2 bg-canvas text-text text-base sm:text-xs focus:outline-none focus:ring-2 focus:ring-focus focus:border-champagne"
                        >
                          <option value="" className="bg-canvas text-champagne">Select 1st choice...</option>
                          {committees.map((c) => (
                            <option key={c.id} value={c.id} className="bg-canvas text-champagne">
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </FormField>

                      <FormField
                        label="2nd Committee Preference (Optional)"
                        id={`field-delegate_${idx}_pref2`}
                        error={errors[`delegate_${idx}_pref2`]}
                      >
                        <select
                          id={`field-delegate_${idx}_pref2`}
                          value={del.committeePreference2}
                          onChange={(e) => handleDelegateChange(idx, 'committeePreference2', e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-line-2 bg-canvas text-text text-xs focus:outline-none focus:ring-2 focus:ring-focus focus:border-champagne"
                        >
                          <option value="" className="bg-canvas text-champagne">Select 2nd choice...</option>
                          {committees
                            .filter((c) => c.id !== del.committeePreference1)
                            .map((c) => (
                              <option key={c.id} value={c.id} className="bg-canvas text-champagne">
                                {c.name}
                              </option>
                            ))}
                        </select>
                      </FormField>

                      <FormField
                        label="Country Preference (Optional)"
                        id={`field-delegate_${idx}_countryPreference`}
                        error={errors[`delegate_${idx}_countryPreference`]}
                      >
                        <input
                          type="text"
                          maxLength={100}
                          id={`field-delegate_${idx}_countryPreference`}
                          value={del.countryPreference}
                          onChange={(e) => handleDelegateChange(idx, 'countryPreference', e.target.value)}
                          placeholder="e.g. Germany"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-line-2 bg-canvas text-text placeholder-champagne/40 text-xs focus:outline-none focus:ring-2 focus:ring-focus focus:border-champagne"
                        />
                      </FormField>
                    </div>
                  </div>
                ))}
              </div>

              {delegationData.delegates.length < 20 && (
                <button
                  type="button"
                  onClick={handleAddDelegate}
                  className="w-full py-3.5 rounded-xl border-2 border-dashed border-line-2 hover:border-line-3 bg-raised/50 hover:bg-raised/80 text-xs font-bold text-champagne flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Another Delegate to Roster</span>
                </button>
              )}
            </div>

            {/* Delegation Notes & Referral */}
            <div className="space-y-4 pt-3 border-t border-line">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-champagne flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-champagne" />
                <span>3. Delegation Logistics &amp; Referral</span>
              </h3>

              <FormField
                label="Delegation Accommodations & Dietary Notes (Optional)"
                description="List any special dietary needs, mobility accommodations, or faculty observer details"
                error={errors.dietaryAccessibility}
                id="field-dietaryAccessibility"
              >
                <textarea
                  id="field-dietaryAccessibility"
                  rows={2}
                  value={delegationData.dietaryAccessibility}
                  onChange={(e) => handleDelegationChange('dietaryAccessibility', e.target.value)}
                  placeholder="Specify accommodations required for any member of the delegation..."
                  className="w-full px-4 py-3 rounded-xl border border-line-2 bg-canvas text-text placeholder-champagne/40 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-focus focus:border-champagne"
                />
              </FormField>

              <FormField
                label="How did your delegation hear about GIMUN?"
                required
                error={errors.referralSource}
                id="field-referralSource"
              >
                <select
                  id="field-referralSource"
                  value={delegationData.referralSource}
                  onChange={(e) =>
                    handleDelegationChange(
                      'referralSource',
                      e.target.value as GimunDelegationData['referralSource']
                    )
                  }
                  className="w-full px-4 py-3 rounded-xl border border-line-2 bg-canvas text-text text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-focus focus:border-champagne"
                >
                  <option value="" className="bg-canvas text-champagne">Select referral channel...</option>
                  <option value="social-media" className="bg-canvas text-champagne">Social Media (Instagram / Facebook / LinkedIn)</option>
                  <option value="university-club" className="bg-canvas text-champagne">University Club / Debating Society</option>
                  <option value="friend" className="bg-canvas text-champagne">Friend / Colleague Recommendation</option>
                  <option value="faculty-advisor" className="bg-canvas text-champagne">Faculty Advisor / Teacher</option>
                  <option value="campus-ambassador" className="bg-canvas text-champagne">Campus Ambassador / Poster</option>
                  <option value="other" className="bg-canvas text-champagne">Other</option>
                </select>
              </FormField>
            </div>
          </div>
        )}
      </>

      {/* Honeypot anti-bot trap */}
      <HoneypotField value={honeypot} onChange={setHoneypot} />

      {/* Mandatory Non-Payment Disclosure */}
      <NonPaymentNotice track="gimun" />

      {/* Submit Action Block */}
      <div className="space-y-4 pt-3 border-t border-line">
        {turnstile.widget}
        <FormErrorSummary errors={errors} />
        <SubmitButton
          pending={status === 'submitting'}
          disabled={deviceLimit.locked === true}
          pendingLabel="Sending your application…"
          className="btn-shimmer-gold w-full py-4 px-6 rounded-xl font-bold text-xs uppercase tracking-wider text-on-accent transition-all hover:brightness-110 active:scale-[0.99]"
        >
          <span>
            {applicantType === 'individual'
              ? 'Submit Individual Application'
              : `Submit Delegation Roster (${delegationData.delegates.length} Delegates)`}
          </span>
          <ArrowRight className="w-4 h-4" />
        </SubmitButton>

        <PrivacyStatement />
      </div>
    </form>
    </div>
  );
}
