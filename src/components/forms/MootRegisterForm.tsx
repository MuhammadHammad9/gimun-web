'use client';

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
  const [formData, setFormData] = useState<MootCupTeamData>(initialMootData);
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
      };
      onSuccess(data.referenceId || 'REG-MOOT-2027', `${formData.teamName} (${formData.institution})`, details);
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
      {/* Header */}
      <div className="space-y-2 pb-2 border-b border-slate-100">
        <span className="text-[11px] font-mono uppercase tracking-wider text-secondary font-bold">
          GMC Track Registration
        </span>
        <h2 className="text-xl md:text-2xl font-heading font-bold text-ink">
          Law Team Registration Form
        </h2>
        <p className="text-xs text-neutral-gray leading-relaxed">
          Register an official university or law faculty team consisting of 2 to 4 members (2 oralists + optional researcher/advocate).
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

      {/* Section 1: Team & Faculty Details */}
      <div className="space-y-4">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-gray flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-secondary" />
          <span>1. Team & Institutional Profile</span>
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
              className="w-full px-4 py-3 rounded-card border border-whisper-border bg-white text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-secondary"
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
              className="w-full px-4 py-3 rounded-card border border-whisper-border bg-white text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-secondary"
            />
          </FormField>
        </div>
      </div>

      {/* Section 2: Team Members (2-4) */}
      <div className="space-y-4 pt-2 border-t border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-gray flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-secondary" />
              <span>2. Team Composition ({formData.members.length} Members)</span>
            </h3>
            <p className="text-[11px] text-neutral-gray">
              Minimum 2 oralists; up to 2 optional researchers or secondary advocates.
            </p>
          </div>
        </div>

        {errors.members && (
          <p className="text-xs text-[#E11D48] font-medium">{errors.members}</p>
        )}

        {/* Member Cards */}
        <div className="space-y-4">
          {formData.members.map((member, idx) => (
            <div
              key={idx}
              className="p-5 rounded-card bg-surface border border-slate-200/80 space-y-4 relative"
            >
              <div className="flex items-center justify-between gap-2 border-b border-slate-200/60 pb-2">
                <span className="text-xs font-mono font-bold uppercase text-secondary">
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
                    className="inline-flex items-center gap-1 text-[11px] text-neutral-gray hover:text-[#E11D48] transition-colors"
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
                    className="w-full px-3.5 py-2.5 rounded-button border border-whisper-border bg-white text-base sm:text-xs focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-secondary"
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
                    id={`field-member_${idx}_email`}
                    autoComplete="email"
                    value={member.email}
                    onChange={(e) => handleMemberChange(idx, 'email', e.target.value)}
                    placeholder="advocate@institution.edu.pk"
                    className="w-full px-3.5 py-2.5 rounded-button border border-whisper-border bg-white text-base sm:text-xs focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-secondary"
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
                    id={`field-member_${idx}_phone`}
                    autoComplete="tel"
                    value={member.phone}
                    onChange={(e) => handleMemberChange(idx, 'phone', e.target.value)}
                    placeholder="+92 3XX XXXXXXX"
                    className="w-full px-3.5 py-2.5 rounded-button border border-whisper-border bg-white text-base sm:text-xs focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-secondary"
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
                    className="w-full px-3.5 py-2.5 rounded-button border border-whisper-border bg-white text-base sm:text-xs focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-secondary"
                  >
                    <option value="lead-oralist">Lead Oralist</option>
                    <option value="second-oralist">Second Oralist</option>
                    <option value="researcher">Legal Researcher</option>
                    <option value="advocate">Of Counsel / Advocate</option>
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
            className="w-full py-3 rounded-card border-2 border-dashed border-slate-200 hover:border-secondary/60 bg-white hover:bg-teal-50/20 text-xs font-semibold text-secondary flex items-center justify-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Member #{formData.members.length + 1} (Researcher / Advocate)</span>
          </button>
        )}
      </div>

      {/* Section 3: Problem Category Preference */}
      <div className="space-y-4 pt-2 border-t border-slate-100">
        <div className="space-y-1">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-gray flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-secondary" />
            <span>3. Problem Category Preference</span>
          </h3>
          <p className="text-[11px] text-neutral-gray">
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
            className="w-full px-4 py-3 rounded-card border border-whisper-border bg-white text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-secondary"
          >
            <option value="">Select problem area...</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name} ({cat.areaOfLaw})
              </option>
            ))}
          </select>
        </FormField>
      </div>

      {/* Section 4: Prior Moot Experience */}
      <div className="space-y-4 pt-2 border-t border-slate-100">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-gray flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-secondary" />
          <span>4. Prior Moot Court Experience</span>
        </h3>

        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold text-ink">Has any member competed in national/international moots?</span>
            <div className="inline-flex rounded-button border border-slate-200 bg-slate-100 p-0.5 text-xs">
              <button
                type="button"
                onClick={() => handleChange('hasExperience', true)}
                className={`px-3 py-1.5 rounded-button font-medium transition-colors ${
                  formData.hasExperience
                    ? 'bg-white text-secondary shadow-xs font-bold'
                    : 'text-neutral-gray hover:text-ink'
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
                className={`px-3 py-1.5 rounded-button font-medium transition-colors ${
                  !formData.hasExperience
                    ? 'bg-white text-ink shadow-xs font-bold'
                    : 'text-neutral-gray hover:text-ink'
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
                className="w-full px-4 py-3 rounded-card border border-whisper-border bg-white text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-secondary"
              />
            </FormField>
          )}
        </div>
      </div>

      {/* Section 5: Logistics & Referral */}
      <div className="space-y-4 pt-2 border-t border-slate-100">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-gray flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-secondary" />
          <span>5. Logistics & Referral</span>
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
            className="w-full px-4 py-3 rounded-card border border-whisper-border bg-white text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-secondary"
          />
        </FormField>

        <FormField
          label="How did your team hear about GMC 2027?"
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
            className="w-full px-4 py-3 rounded-card border border-whisper-border bg-white text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-secondary"
          >
            <option value="">Select referral channel...</option>
            <option value="social-media">Social Media (Instagram / Facebook / LinkedIn)</option>
            <option value="university-club">University Moot Court Society / Law Clinic</option>
            <option value="friend">Peer / Senior Recommendation</option>
            <option value="faculty-advisor">Law Faculty Dean / Professor</option>
            <option value="campus-ambassador">Campus Ambassador / Poster Notice</option>
            <option value="other">Other</option>
          </select>
        </FormField>
      </div>

      {/* Honeypot field */}
      <HoneypotField value={honeypot} onChange={setHoneypot} />

      {/* Mandatory Non-Payment Disclosure */}
      <NonPaymentNotice track="moot-cup" />

      {/* Submit Action Block */}
      <div className="space-y-4 pt-2 border-t border-slate-100">
        <button
          type="submit"
          disabled={status === 'submitting'}
          className={`w-full py-4 px-6 rounded-button font-semibold text-sm text-white flex items-center justify-center gap-2 transition-all shadow-button ${
            status === 'submitting'
              ? 'bg-secondary/80 cursor-wait animate-pulse'
              : 'bg-secondary hover:bg-secondary-hover active:scale-[0.99]'
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
