'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { PrivacyStatement } from './PrivacyStatement';

interface GimunRegisterFormProps {
  committees: Committee[];
  onSuccess: (
    refId: string,
    applicantName: string,
    applicantType: 'individual' | 'delegation',
    details?: { email?: string; institution?: string; summary?: string }
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

export function GimunRegisterForm({ committees, onSuccess }: GimunRegisterFormProps) {
  const [applicantType, setApplicantType] = useState<'individual' | 'delegation'>('individual');
  const [individualData, setIndividualData] = useState<GimunIndividualData>(initialIndividual);
  const [delegationData, setDelegationData] = useState<GimunDelegationData>(initialDelegation);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [status, setStatus] = useState<'idle' | 'submitting' | 'error'>('idle');
  const [serverError, setServerError] = useState<string | null>(null);
  const [honeypot, setHoneypot] = useState('');
  const formLoadedAt = useRef(0);

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
      nextDelegates[index] = { ...nextDelegates[index], [field]: value };
      return { ...prev, delegates: nextDelegates };
    });

    const errorKey = `delegate_${index}_${field === 'committeePreference1' ? 'pref1' : field}`;
    if (errors[errorKey]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[errorKey];
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

    let validationResult: ValidationErrors = {};
    if (applicantType === 'individual') {
      validationResult = validateGimunIndividual(individualData, committeeIds);
    } else {
      validationResult = validateGimunDelegation(delegationData, committeeIds);
    }

    if (Object.keys(validationResult).length > 0) {
      setErrors(validationResult);
      const firstErrorKey = Object.keys(validationResult)[0];
      const el = document.getElementById(`field-${firstErrorKey}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setErrors({});
    setStatus('submitting');

    try {
      const payload = {
        track: 'gimun',
        applicantType,
        formData: applicantType === 'individual' ? individualData : delegationData,
        _hp: honeypot,
        _ts: formLoadedAt.current,
      };

      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data: SubmissionResponse = await res.json();

      if (!res.ok || !data.success) {
        setStatus('error');
        if (data.errors) {
          setErrors(data.errors);
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

      const details =
        applicantType === 'individual'
          ? {
              email: individualData.email,
              institution: individualData.institution,
              summary: `1st Pref: ${prefName}`,
            }
          : {
              email: delegationData.delegationHeadEmail,
              institution: delegationData.institution,
              summary: `Institutional Delegation Roster (${delegationData.delegates.length} Delegates)`,
            };

      onSuccess(data.referenceId || 'REG-GIMUN-2027', applicantName, applicantType, details);
    } catch (err) {
      console.error('Submission failed:', err);
      setStatus('error');
      setServerError('Unable to reach registration server. Please check your connection.');
    }
  };
  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="max-w-3xl mx-auto p-6 md:p-10 rounded-section bg-surface-elevated border border-whisper-border shadow-card space-y-8"
    >
      {/* Track Brand Bar & Switcher */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-accent font-bold">
              GIMUN Track Registration
            </span>
            <h2 className="text-xl md:text-2xl font-heading font-bold text-ink">
              Delegate Application Form
            </h2>
          </div>

          {/* Segmented Control */}
          <div className="relative flex p-1 rounded-button bg-slate-100/90 border border-slate-200/80">
            <button
              type="button"
              onClick={() => {
                setApplicantType('individual');
                setErrors({});
              }}
              className={`relative z-10 px-4 py-2 text-xs font-semibold rounded-button transition-colors flex items-center gap-1.5 ${
                applicantType === 'individual' ? 'text-white' : 'text-neutral-gray hover:text-ink'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Individual Delegate</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setApplicantType('delegation');
                setErrors({});
              }}
              className={`relative z-10 px-4 py-2 text-xs font-semibold rounded-button transition-colors flex items-center gap-1.5 ${
                applicantType === 'delegation' ? 'text-white' : 'text-neutral-gray hover:text-ink'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Delegation (Group)</span>
            </button>
            <motion.div
              layoutId="gimun-type-indicator"
              className="absolute top-1 bottom-1 rounded-button bg-accent shadow-xs"
              style={{
                left: applicantType === 'individual' ? '4px' : '50%',
                right: applicantType === 'individual' ? '50%' : '4px',
              }}
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            />
          </div>
        </div>

        <p className="text-xs text-neutral-gray leading-relaxed">
          {applicantType === 'individual'
            ? 'Apply as an independent delegate. You will select committee preferences and receive country allocations from the Secretariat.'
            : 'Register a delegation representing a school, college, or university. The Delegation Head manages all delegate allocations.'}
        </p>
      </div>

      {serverError && (
        <div className="p-4 rounded-card bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <span className="font-bold block">Submission Error</span>
            <span>{serverError}</span>
          </div>
        </div>
      )}

      {/* INDIVIDUAL FORM FIELDS */}
      <AnimatePresence mode="wait">
        {applicantType === 'individual' ? (
          <motion.div
            key="individual-fields"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            {/* Personal Details */}
            <div className="space-y-4">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-gray flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-accent" />
                <span>1. Personal & Institutional Information</span>
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
                    className="w-full px-4 py-3 rounded-card border border-whisper-border bg-white text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
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
                    id="field-email"
                    autoComplete="email"
                    value={individualData.email}
                    onChange={(e) => handleIndividualChange('email', e.target.value)}
                    placeholder="zaid.malik@university.edu.pk"
                    className="w-full px-4 py-3 rounded-card border border-whisper-border bg-white text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
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
                    id="field-phone"
                    autoComplete="tel"
                    value={individualData.phone}
                    onChange={(e) => handleIndividualChange('phone', e.target.value)}
                    placeholder="+92 300 1234567"
                    className="w-full px-4 py-3 rounded-card border border-whisper-border bg-white text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
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
                    className="w-full px-4 py-3 rounded-card border border-whisper-border bg-white text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
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
                    className="w-full px-4 py-3 rounded-card border border-whisper-border bg-white text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
                  >
                    <option value="">Select study level...</option>
                    <option value="freshman">Freshman / 1st Year</option>
                    <option value="sophomore">Sophomore / 2nd Year</option>
                    <option value="junior">Junior / 3rd Year</option>
                    <option value="senior">Senior / 4th Year</option>
                    <option value="postgraduate">Post-Graduate / Masters</option>
                    <option value="high-school-senior">High School / A-Levels Senior</option>
                  </select>
                </FormField>
              </div>
            </div>

            {/* Committee Preferences */}
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <div className="space-y-1">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-gray flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-accent" />
                  <span>2. Committee & Country Preferences</span>
                </h3>
                <p className="text-[11px] text-neutral-gray">
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
                    className="w-full px-4 py-3 rounded-card border border-whisper-border bg-white text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
                  >
                    <option value="">Select 1st choice...</option>
                    {committees.map((c) => (
                      <option key={c.id} value={c.id}>
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
                    className="w-full px-4 py-3 rounded-card border border-whisper-border bg-white text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
                  >
                    <option value="">Select 2nd choice...</option>
                    {committees
                      .filter((c) => c.id !== individualData.committeePreference1)
                      .map((c) => (
                        <option key={c.id} value={c.id}>
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
                    className="w-full px-4 py-3 rounded-card border border-whisper-border bg-white text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
                  >
                    <option value="">Select 3rd choice...</option>
                    {committees
                      .filter(
                        (c) =>
                          c.id !== individualData.committeePreference1 &&
                          c.id !== individualData.committeePreference2
                      )
                      .map((c) => (
                        <option key={c.id} value={c.id}>
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
                  className="w-full px-4 py-3 rounded-card border border-whisper-border bg-white text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
                />
              </FormField>
            </div>

            {/* Prior Experience */}
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-gray flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-accent" />
                <span>3. Prior MUN Experience</span>
              </h3>

              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <span className="text-xs font-semibold text-ink">Have you attended MUN conferences before?</span>
                  <div className="inline-flex rounded-button border border-slate-200 bg-slate-100 p-0.5 text-xs">
                    <button
                      type="button"
                      onClick={() => handleIndividualChange('hasExperience', true)}
                      className={`px-3 py-1.5 rounded-button font-medium transition-colors ${
                        individualData.hasExperience
                          ? 'bg-white text-accent shadow-xs font-bold'
                          : 'text-neutral-gray hover:text-ink'
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
                      className={`px-3 py-1.5 rounded-button font-medium transition-colors ${
                        !individualData.hasExperience
                          ? 'bg-white text-ink shadow-xs font-bold'
                          : 'text-neutral-gray hover:text-ink'
                      }`}
                    >
                      No (First Conference)
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
                      placeholder="e.g. LUMUN 2025 (DISEC - Outstanding Diplomat), HMUN Asia 2024 (UNSC)..."
                      className="w-full px-4 py-3 rounded-card border border-whisper-border bg-white text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
                    />
                  </FormField>
                )}
              </div>
            </div>

            {/* Logistics & Referral */}
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-gray flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-accent" />
                <span>4. Logistics & Referral</span>
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
                  className="w-full px-4 py-3 rounded-card border border-whisper-border bg-white text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
                />
              </FormField>

              <FormField
                label="How did you hear about GIMUN 2026?"
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
                  className="w-full px-4 py-3 rounded-card border border-whisper-border bg-white text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
                >
                  <option value="">Select referral channel...</option>
                  <option value="social-media">Social Media (Instagram / Facebook / LinkedIn)</option>
                  <option value="university-club">University Club / Debating Society</option>
                  <option value="friend">Friend / Colleague Recommendation</option>
                  <option value="faculty-advisor">Faculty Advisor / Teacher</option>
                  <option value="campus-ambassador">Campus Ambassador / On-Campus Poster</option>
                  <option value="other">Other</option>
                </select>
              </FormField>
            </div>
          </motion.div>
        ) : (
          /* DELEGATION FORM FIELDS */
          <motion.div
            key="delegation-fields"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            {/* Delegation Head Details */}
            <div className="space-y-4">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-gray flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-accent" />
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
                    className="w-full px-4 py-3 rounded-card border border-whisper-border bg-white text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
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
                    id="field-delegationHeadEmail"
                    autoComplete="email"
                    value={delegationData.delegationHeadEmail}
                    onChange={(e) => handleDelegationChange('delegationHeadEmail', e.target.value)}
                    placeholder="head.delegate@institution.edu.pk"
                    className="w-full px-4 py-3 rounded-card border border-whisper-border bg-white text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
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
                    id="field-delegationHeadPhone"
                    autoComplete="tel"
                    value={delegationData.delegationHeadPhone}
                    onChange={(e) => handleDelegationChange('delegationHeadPhone', e.target.value)}
                    placeholder="+92 300 9876543"
                    className="w-full px-4 py-3 rounded-card border border-whisper-border bg-white text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
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
                    className="w-full px-4 py-3 rounded-card border border-whisper-border bg-white text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
                  />
                </FormField>
              </div>
            </div>

            {/* Delegation Size & Dynamic Roster */}
            <div id="field-delegates" className="space-y-4 pt-2 border-t border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-gray flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-accent" />
                    <span>2. Delegation Roster ({delegationData.delegates.length} Delegates)</span>
                  </h3>
                  <p className="text-[11px] text-neutral-gray">
                    Minimum 2 delegates; maximum 20 per roster submission.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <label htmlFor="field-delegateCount" className="text-xs font-semibold text-ink">
                    Roster Size:
                  </label>
                  <input
                    type="number"
                    id="field-delegateCount"
                    min={2}
                    max={20}
                    value={delegationData.delegateCount}
                    onChange={(e) => handleDelegateCountChange(parseInt(e.target.value, 10))}
                    className="w-20 px-3 py-1.5 rounded-button border border-whisper-border text-xs text-center font-bold font-mono focus:outline-none focus:ring-2 focus:ring-accent/40"
                  />
                </div>
              </div>

              {errors.delegateCount && (
                <p className="text-xs text-[#E11D48] font-medium">{errors.delegateCount}</p>
              )}

              {/* Repeatable Delegate Cards */}
              <div className="space-y-4">
                {delegationData.delegates.map((del, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-card bg-surface border border-slate-200/80 space-y-4 relative"
                  >
                    <div className="flex items-center justify-between gap-2 border-b border-slate-200/60 pb-2">
                      <span className="text-xs font-mono font-bold uppercase text-accent">
                        Delegate #{idx + 1}
                      </span>
                      {delegationData.delegates.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveDelegate(idx)}
                          className="inline-flex items-center gap-1 text-[11px] text-neutral-gray hover:text-[#E11D48] transition-colors"
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
                          className="w-full px-3.5 py-2.5 rounded-button border border-whisper-border bg-white text-base sm:text-xs focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
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
                          id={`field-delegate_${idx}_email`}
                          autoComplete="email"
                          value={del.email}
                          onChange={(e) => handleDelegateChange(idx, 'email', e.target.value)}
                          placeholder="delegate@institution.edu.pk"
                          className="w-full px-3.5 py-2.5 rounded-button border border-whisper-border bg-white text-base sm:text-xs focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
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
                          className="w-full px-3.5 py-2.5 rounded-button border border-whisper-border bg-white text-base sm:text-xs focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
                        >
                          <option value="">Select 1st choice...</option>
                          {committees.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </FormField>

                      <FormField label="2nd Committee Preference (Optional)">
                        <select
                          value={del.committeePreference2}
                          onChange={(e) => handleDelegateChange(idx, 'committeePreference2', e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-button border border-whisper-border bg-white text-xs focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
                        >
                          <option value="">Select 2nd choice...</option>
                          {committees
                            .filter((c) => c.id !== del.committeePreference1)
                            .map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                        </select>
                      </FormField>

                      <FormField label="Country Preference (Optional)">
                        <input
                          type="text"
                          value={del.countryPreference}
                          onChange={(e) => handleDelegateChange(idx, 'countryPreference', e.target.value)}
                          placeholder="e.g. Germany"
                          className="w-full px-3.5 py-2.5 rounded-button border border-whisper-border bg-white text-xs focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
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
                  className="w-full py-3 rounded-card border-2 border-dashed border-slate-200 hover:border-accent/60 bg-white hover:bg-orange-50/20 text-xs font-semibold text-accent flex items-center justify-center gap-2 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Another Delegate to Roster</span>
                </button>
              )}
            </div>

            {/* Delegation Notes & Referral */}
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-gray flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-accent" />
                <span>3. Delegation Logistics & Referral</span>
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
                  className="w-full px-4 py-3 rounded-card border border-whisper-border bg-white text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
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
                  className="w-full px-4 py-3 rounded-card border border-whisper-border bg-white text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
                >
                  <option value="">Select referral channel...</option>
                  <option value="social-media">Social Media (Instagram / Facebook / LinkedIn)</option>
                  <option value="university-club">University Club / Debating Society</option>
                  <option value="friend">Friend / Colleague Recommendation</option>
                  <option value="faculty-advisor">Faculty Advisor / Teacher</option>
                  <option value="campus-ambassador">Campus Ambassador / On-Campus Poster</option>
                  <option value="other">Other</option>
                </select>
              </FormField>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Honeypot anti-bot trap */}
      <HoneypotField value={honeypot} onChange={setHoneypot} />

      {/* Mandatory Non-Payment Disclosure */}
      <NonPaymentNotice track="gimun" />

      {/* Submit Action Block */}
      <div className="space-y-4 pt-2 border-t border-slate-100">
        <button
          type="submit"
          disabled={status === 'submitting'}
          className={`w-full py-4 px-6 rounded-button font-semibold text-sm text-white flex items-center justify-center gap-2 transition-all shadow-button ${
            status === 'submitting'
              ? 'bg-accent/80 cursor-wait animate-pulse'
              : 'bg-accent hover:bg-accent-hover active:scale-[0.99]'
          }`}
        >
          {status === 'submitting' ? (
            <span>Processing Application & Verifying Dossier…</span>
          ) : (
            <>
              <span>
                {applicantType === 'individual'
                  ? 'Submit Individual Application'
                  : `Submit Delegation Roster (${delegationData.delegates.length} Delegates)`}
              </span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <PrivacyStatement />
      </div>
    </form>
  );
}
