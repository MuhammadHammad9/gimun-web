'use client';

import { useSiteConfig } from '@/components/SiteConfigProvider';

import { useSearchParams } from 'next/navigation';
import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, ArrowRight, AlertCircle } from 'lucide-react';
import type {
  ProblemCategory,
  MootCupTeamData,
  MootTeamMember,
  SubmissionResponse,
} from '@/lib/types';
import { validateMootCupTeam, type ValidationErrors } from '@/lib/validation';
import { FormField } from './FormField';
import { HoneypotField } from './HoneypotField';
import { NonPaymentNotice } from './NonPaymentNotice';
import { PrivacyStatement } from './PrivacyStatement';
import { getEventYear } from '@/lib/site-config';

interface MootRegisterFormProps {
  categories: ProblemCategory[];
  onSuccess: (
    refId: string,
    teamName: string,
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

const initialMootData: MootCupTeamData = {
  teamName: '',
  institution: '',
  members: [
    { fullName: '', email: '', phone: '', role: 'lead-oralist' },
    { fullName: '', email: '', phone: '', role: 'second-oralist' },
  ],
  problemCategoryPreference: '',
  hasExperience: false,
  experienceDetails: '',
  dietaryAccessibility: '',
  referralSource: '',
};

export function MootRegisterForm({ categories, onSuccess }: MootRegisterFormProps) {
  const searchParams = useSearchParams();
  const categoryQuery = searchParams.get('category');
  const validCategory = categories.find(c => c.id === categoryQuery)?.id || '';
  const submissionKey = React.useRef<string | null>(null);
  const eventYear = getEventYear(useSiteConfig());
  const [formData, setFormData] = useState<MootCupTeamData>({ ...initialMootData, problemCategoryPreference: validCategory });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [status, setStatus] = useState<'idle' | 'submitting' | 'error'>('idle');
  const [serverError, setServerError] = useState<string | null>(null);
  const [honeypot, setHoneypot] = useState('');
  const formLoadedAt = useRef(0);

  useEffect(() => {
    formLoadedAt.current = Date.now();
  }, []);

  const categoryIds = categories.map((c) => c.id);

  const handleChange = <K extends keyof MootCupTeamData>(
    field: K,
    value: MootCupTeamData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleMemberChange = (
    index: number,
    field: keyof MootTeamMember,
    value: string
  ) => {
    setFormData((prev) => {
      const nextMembers = [...prev.members];
      nextMembers[index] = { ...nextMembers[index], [field]: value };
      return { ...prev, members: nextMembers };
    });

    const errorKey = `member_${index}_${field}`;
    if (errors[errorKey]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[errorKey];
        return next;
      });
    }
  };

  const handleAddMember = () => {
    if (formData.members.length >= 4) return;
    setFormData((prev) => ({
      ...prev,
      members: [
        ...prev.members,
        {
          fullName: '',
          email: '',
          phone: '',
          role: prev.members.length === 2 ? 'researcher' : 'advocate',
        },
      ],
    }));
  };

  const handleRemoveMember = (index: number) => {
    if (formData.members.length <= 2) return;
    setFormData((prev) => ({
      ...prev,
      members: prev.members.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    const validationResult = validateMootCupTeam(formData, categoryIds);

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
        track: 'moot-cup',
        applicantType: 'team',
        formData,
        _hp: honeypot,
        _ts: formLoadedAt.current,
        submission_key: submissionKey.current ?? (submissionKey.current = crypto.randomUUID()),
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
      const catName =
        categories.find((c) => c.id === formData.problemCategoryPreference)?.name ||
        formData.problemCategoryPreference;
      const details = {
        email: data.receipt?.email || formData.members[0]?.email,
        institution: data.receipt?.institution || formData.institution,
        phone: data.receipt?.phone || formData.members[0]?.phone,
        summary: data.receipt?.summary || `${catName} · ${formData.members.length} Team Advocates`,
        feeAmount: data.receipt?.feeAmount,
        eventDates: data.receipt?.eventDates,
        venue: data.receipt?.venue,
        participantCount: data.receipt?.participantCount || formData.members.length,
        timestamp: data.receipt?.submittedAt,
        checkinToken: data.checkinToken,
      };
      if (!data.referenceId || !/^REG-MOOT-\d{4}-\d{4,}$/.test(data.referenceId)) {
        setStatus('error');
        setServerError('The submission was stored but did not return a valid reference number. Please contact the Secretariat before submitting again.');
        return;
      }

      onSuccess(data.referenceId, `${formData.teamName} (${formData.institution})`, details);
    } catch {
      console.error('Registration request failed.');
      setStatus('error');
      setServerError('Unable to reach registration server. Please check your connection.');
    }
  };
  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="card-glass-luxury max-w-3xl mx-auto p-6 md:p-10 rounded-2xl border border-champagne/30 shadow-2xl backdrop-blur-md space-y-8 text-champagne"
    >
      {/* Header */}
      <div className="space-y-2 pb-3 border-b border-champagne/15">
        <span className="text-[11px] font-mono uppercase tracking-wider text-champagne font-bold">
          GMC Track Registration
        </span>
        <h2 className="text-xl md:text-2xl font-heading font-extrabold text-text">
          Law Team Registration Form
        </h2>
        <p className="text-xs text-champagne/80 leading-relaxed">
          Register an official university or law faculty team consisting of 2 to 4 members (2 oralists + optional researcher/advocate).
        </p>
      </div>

      {serverError && (
        <div className="p-4 rounded-xl bg-brand-deep/80 border border-brand text-crimson-soft flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-crimson-hi shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <span className="font-bold block">Submission Error</span>
            <span>{serverError}</span>
          </div>
        </div>
      )}

      {/* Section 1: Team & Faculty Details */}
      <div className="space-y-4">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-champagne flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-champagne" />
          <span>1. Team &amp; Institutional Profile</span>
        </h3>

        <div className="grid sm:grid-cols-2 gap-4">
          <FormField
            label="Official Team Name / Code Designation"
            required
            track="moot-cup"
            error={errors.teamName}
            id="field-teamName"
          >
            <input
              type="text"
              id="field-teamName"
              autoComplete="off"
              value={formData.teamName}
              onChange={(e) => handleChange('teamName', e.target.value)}
              placeholder="e.g. Quaid-e-Azam Law Society Team A"
              className="w-full px-4 py-3 rounded-xl border border-champagne/30 bg-canvas/90 text-text placeholder-champagne/40 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-champagne/50 focus:border-champagne"
            />
          </FormField>

          <FormField
            label="Institution / Law Faculty"
            required
            track="moot-cup"
            error={errors.institution}
            id="field-institution"
          >
            <input
              type="text"
              id="field-institution"
              autoComplete="organization"
              value={formData.institution}
              onChange={(e) => handleChange('institution', e.target.value)}
              placeholder="e.g. LUMS School of Law, Punjab University"
              className="w-full px-4 py-3 rounded-xl border border-champagne/30 bg-canvas/90 text-text placeholder-champagne/40 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-champagne/50 focus:border-champagne"
            />
          </FormField>
        </div>
      </div>

      {/* Section 2: Team Members (2-4) */}
      <div className="space-y-4 pt-3 border-t border-champagne/15">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-champagne flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-champagne" />
              <span>2. Team Composition ({formData.members.length} Members)</span>
            </h3>
            <p className="text-[11px] text-champagne/70">
              Minimum 2 oralists; up to 2 optional researchers or secondary advocates.
            </p>
          </div>
        </div>

        {errors.members && (
          <p className="text-xs text-crimson-soft font-medium">{errors.members}</p>
        )}

        {/* Member Cards */}
        <div className="space-y-4">
          {formData.members.map((member, idx) => (
            <div
              key={idx}
              className="p-5 rounded-xl bg-raised/90 border border-champagne/25 hover:border-champagne/40 transition-colors space-y-4 relative shadow-md"
            >
              <div className="flex items-center justify-between gap-2 border-b border-champagne/15 pb-2">
                <span className="text-xs font-mono font-bold uppercase text-text">
                  {idx === 0
                    ? 'Member #1 (Lead Oralist / Primary Contact)'
                    : idx === 1
                    ? 'Member #2 (Second Oralist)'
                    : `Member #${idx + 1} (Advocate / Researcher)`}
                </span>
                {formData.members.length > 2 && idx >= 2 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveMember(idx)}
                    className="inline-flex items-center gap-1 text-[11px] text-champagne/70 hover:text-crimson-soft transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove Member</span>
                  </button>
                )}
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <FormField
                  label="Full Name"
                  required
                  track="moot-cup"
                  id={`field-member_${idx}_fullName`}
                  error={errors[`member_${idx}_fullName`]}
                >
                  <input
                    type="text"
                    id={`field-member_${idx}_fullName`}
                    autoComplete="name"
                    value={member.fullName}
                    onChange={(e) => handleMemberChange(idx, 'fullName', e.target.value)}
                    placeholder="Advocate's full name"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-champagne/30 bg-canvas/90 text-text placeholder-champagne/40 text-base sm:text-xs focus:outline-none focus:ring-2 focus:ring-champagne/50 focus:border-champagne"
                  />
                </FormField>

                <FormField
                  label="Email Address"
                  required
                  track="moot-cup"
                  id={`field-member_${idx}_email`}
                  error={errors[`member_${idx}_email`]}
                >
                  <input
                    type="email"
                    inputMode="email"
                    id={`field-member_${idx}_email`}
                    autoComplete="email"
                    value={member.email}
                    onChange={(e) => handleMemberChange(idx, 'email', e.target.value)}
                    placeholder="advocate@institution.edu.pk"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-champagne/30 bg-canvas/90 text-text placeholder-champagne/40 text-base sm:text-xs focus:outline-none focus:ring-2 focus:ring-champagne/50 focus:border-champagne"
                  />
                </FormField>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <FormField
                  label="Phone Number"
                  required
                  track="moot-cup"
                  id={`field-member_${idx}_phone`}
                  error={errors[`member_${idx}_phone`]}
                >
                  <input
                    type="tel"
                    inputMode="tel"
                    id={`field-member_${idx}_phone`}
                    autoComplete="tel"
                    value={member.phone}
                    onChange={(e) => handleMemberChange(idx, 'phone', e.target.value)}
                    placeholder="+92 3XX XXXXXXX"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-champagne/30 bg-canvas/90 text-text placeholder-champagne/40 text-base sm:text-xs focus:outline-none focus:ring-2 focus:ring-champagne/50 focus:border-champagne"
                  />
                </FormField>

                <FormField
                  label="Role in Team"
                  required
                  track="moot-cup"
                  id={`field-member_${idx}_role`}
                  error={errors[`member_${idx}_role`]}
                >
                  <select
                    id={`field-member_${idx}_role`}
                    value={member.role}
                    onChange={(e) =>
                      handleMemberChange(idx, 'role', e.target.value as MootTeamMember['role'])
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-champagne/30 bg-canvas text-text text-base sm:text-xs focus:outline-none focus:ring-2 focus:ring-champagne/50 focus:border-champagne"
                  >
                    <option value="lead-oralist" className="bg-canvas text-champagne">Lead Oralist</option>
                    <option value="second-oralist" className="bg-canvas text-champagne">Second Oralist</option>
                    <option value="researcher" className="bg-canvas text-champagne">Legal Researcher</option>
                    <option value="advocate" className="bg-canvas text-champagne">Of Counsel / Advocate</option>
                  </select>
                </FormField>
              </div>
            </div>
          ))}
        </div>

        {formData.members.length < 4 && (
          <button
            type="button"
            onClick={handleAddMember}
            className="w-full py-3.5 rounded-xl border-2 border-dashed border-champagne/30 hover:border-champagne/60 bg-raised/50 hover:bg-raised/80 text-xs font-bold text-champagne flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Member #{formData.members.length + 1} (Researcher / Advocate)</span>
          </button>
        )}
      </div>

      {/* Section 3: Problem Category Preference */}
      <div className="space-y-4 pt-3 border-t border-champagne/15">
        <div className="space-y-1">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-champagne flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-champagne" />
            <span>3. Problem Category Preference</span>
          </h3>
          <p className="text-[11px] text-champagne/70">
            Select the moot compromise area of law your team is applying to argue.
          </p>
        </div>

        <FormField
          label="Preferred Moot Category / Compromis"
          required
          track="moot-cup"
          error={errors.problemCategoryPreference}
          id="field-problemCategoryPreference"
        >
          <select
            id="field-problemCategoryPreference"
            value={formData.problemCategoryPreference}
            onChange={(e) => handleChange('problemCategoryPreference', e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-champagne/30 bg-canvas text-text text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-champagne/50 focus:border-champagne"
          >
            <option value="" className="bg-canvas text-champagne">Select problem area...</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id} className="bg-canvas text-champagne">
                {cat.name} ({cat.areaOfLaw})
              </option>
            ))}
          </select>
        </FormField>
      </div>

      {/* Section 4: Prior Moot Experience */}
      <div className="space-y-4 pt-3 border-t border-champagne/15">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-champagne flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-champagne" />
          <span>4. Prior Moot Court Experience</span>
        </h3>

        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-xs font-semibold text-text">Has any member competed in national/international moots?</span>
            <div className="inline-flex rounded-xl border border-champagne/25 bg-canvas p-1 text-xs">
              <button
                type="button"
                onClick={() => handleChange('hasExperience', true)}
                className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  formData.hasExperience
                    ? 'bg-linear-to-r from-champagne via-champagne-hi to-champagne-lo text-canvas shadow-xs'
                    : 'text-champagne/70 hover:text-champagne'
                }`}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => {
                  handleChange('hasExperience', false);
                  handleChange('experienceDetails', '');
                }}
                className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  !formData.hasExperience
                    ? 'bg-linear-to-r from-champagne via-champagne-hi to-champagne-lo text-canvas shadow-xs'
                    : 'text-champagne/70 hover:text-champagne'
                }`}
              >
                No (First Moot Competition)
              </button>
            </div>
          </div>

          {formData.hasExperience && (
            <FormField
              label="Competition Track Record"
              description="Mention recent moot court competitions (Jessup, Price Media, Red Cross, etc.)"
              track="moot-cup"
              error={errors.experienceDetails}
              id="field-experienceDetails"
            >
              <textarea
                id="field-experienceDetails"
                rows={3}
                value={formData.experienceDetails}
                onChange={(e) => handleChange('experienceDetails', e.target.value)}
                placeholder="e.g. National Rounds Jessup 2025 (Quarter-finalist), LUMS Moot 2024 (Best Memorial)..."
                className="w-full px-4 py-3 rounded-xl border border-champagne/30 bg-canvas/90 text-text placeholder-champagne/40 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-champagne/50 focus:border-champagne"
              />
            </FormField>
          )}
        </div>
      </div>

      {/* Section 5: Logistics & Referral */}
      <div className="space-y-4 pt-3 border-t border-champagne/15">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-champagne flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-champagne" />
          <span>5. Logistics &amp; Referral</span>
        </h3>

        <FormField
          label="Team Dietary & Accessibility Accommodations (Optional)"
          description="Specify dietary restrictions or courtroom accessibility needs for team members"
          track="moot-cup"
          error={errors.dietaryAccessibility}
          id="field-dietaryAccessibility"
        >
          <textarea
            id="field-dietaryAccessibility"
            rows={2}
            value={formData.dietaryAccessibility}
            onChange={(e) => handleChange('dietaryAccessibility', e.target.value)}
            placeholder="State any dietary requirements (halal, celiac, vegetarian) or campus access needs..."
            className="w-full px-4 py-3 rounded-xl border border-champagne/30 bg-canvas/90 text-text placeholder-champagne/40 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-champagne/50 focus:border-champagne"
          />
        </FormField>

        <FormField
          label={`How did your team hear about GMC ${eventYear}?`}
          required
          track="moot-cup"
          error={errors.referralSource}
          id="field-referralSource"
        >
          <select
            id="field-referralSource"
            value={formData.referralSource}
            onChange={(e) =>
              handleChange(
                'referralSource',
                e.target.value as MootCupTeamData['referralSource']
              )
            }
            className="w-full px-4 py-3 rounded-xl border border-champagne/30 bg-canvas text-text text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-champagne/50 focus:border-champagne"
          >
            <option value="" className="bg-canvas text-champagne">Select referral channel...</option>
            <option value="social-media" className="bg-canvas text-champagne">Social Media (Instagram / Facebook / LinkedIn)</option>
            <option value="university-club" className="bg-canvas text-champagne">University Moot Court Society / Law Clinic</option>
            <option value="friend" className="bg-canvas text-champagne">Peer / Senior Recommendation</option>
            <option value="faculty-advisor" className="bg-canvas text-champagne">Law Faculty Dean / Professor</option>
            <option value="campus-ambassador" className="bg-canvas text-champagne">Campus Ambassador / Poster Notice</option>
            <option value="other" className="bg-canvas text-champagne">Other</option>
          </select>
        </FormField>
      </div>

      {/* Honeypot field */}
      <HoneypotField value={honeypot} onChange={setHoneypot} />

      {/* Mandatory Non-Payment Disclosure */}
      <NonPaymentNotice track="moot-cup" />

      {/* Submit Action Block */}
      <div className="space-y-4 pt-3 border-t border-champagne/15">
        <button
          type="submit"
          disabled={status === 'submitting'}
          className={`btn-shimmer-gold w-full py-4 px-6 rounded-xl font-bold text-xs uppercase tracking-wider text-canvas flex items-center justify-center gap-2 transition-all shadow-xl cursor-pointer ${
            status === 'submitting'
              ? 'opacity-70 cursor-wait animate-pulse'
              : 'hover:brightness-110 active:scale-[0.99]'
          }`}
        >
          {status === 'submitting' ? (
            <span>Processing Team Registration…</span>
          ) : (
            <>
              <span>Submit Law Team Registration ({formData.members.length} Members)</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <PrivacyStatement />
      </div>
    </form>
  );
}
