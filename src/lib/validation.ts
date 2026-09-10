import type {
  GimunIndividualData,
  GimunDelegationData,
  MootCupTeamData,
  ContactFormData,
} from './types';

export type ValidationErrors = Record<string, string>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const REFERRAL_SOURCES = new Set([
  'social-media',
  'university-club',
  'friend',
  'faculty-advisor',
  'campus-ambassador',
  'other',
]);
const YEAR_OF_STUDY = new Set([
  'freshman',
  'sophomore',
  'junior',
  'senior',
  'postgraduate',
  'high-school-senior',
]);
const MOOT_ROLES = new Set(['lead-oralist', 'second-oralist', 'researcher', 'advocate']);

function asRecord(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function asText(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

export function normalizeFormStrings<T>(value: T): T {
  if (typeof value === 'string') return value.trim() as T;
  if (Array.isArray(value)) return value.map((item) => normalizeFormStrings(item)) as T;
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, child]) => [key, normalizeFormStrings(child)]),
    ) as T;
  }
  return value;
}

function validateChoice(value: unknown, allowed: Set<string>, label: string, required = true): string | null {
  if (typeof value !== 'string' || (required && !value)) {
    return required ? `Please select ${label}` : null;
  }
  if (value && !allowed.has(value)) return `Invalid ${label}`;
  return null;
}

/** Non-empty, trimmed, 2–100 characters */
export function validateName(value: unknown, fieldLabel: string): string | null {
  const trimmed = asText(value).trim();
  if (!trimmed) {
    return `${fieldLabel} is required`;
  }
  if (trimmed.length < 2) {
    return `${fieldLabel} must be at least 2 characters`;
  }
  if (trimmed.length > 100) {
    return `${fieldLabel} must be 100 characters or less`;
  }
  if (/[\u0000-\u001F\u007F]/.test(trimmed)) {
    return `${fieldLabel} contains unsupported control characters`;
  }
  return null;
}

/** RFC-compliant email validation */
export function validateEmail(value: unknown): string | null {
  const trimmed = asText(value).trim();
  if (!trimmed) {
    return 'Email address is required';
  }
  if (!EMAIL_REGEX.test(trimmed)) {
    return 'Please enter a valid email address';
  }
  if (trimmed.length > 254) {
    return 'Email address is too long';
  }
  return null;
}

/** International or local phone with minimum 8 digits */
export function validatePhone(value: unknown): string | null {
  const trimmed = asText(value).trim();
  if (!trimmed) {
    return 'Phone number is required';
  }
  if (!/^[+()\d\s.-]+$/.test(trimmed)) {
    return 'Phone number contains unsupported characters';
  }
  const digits = trimmed.replace(/\D/g, '');
  if (digits.length < 8) {
    return 'Phone number must have at least 8 digits';
  }
  if (digits.length > 15) {
    return 'Phone number is too long (maximum 15 digits)';
  }
  return null;
}

/** Selection validation against permitted IDs */
export function validateSelection(value: unknown, validIds: string[], fieldLabel: string): string | null {
  const selected = asText(value).trim();
  if (!selected) {
    return `Please select a ${fieldLabel}`;
  }
  if (!validIds.includes(selected)) {
    return `Invalid ${fieldLabel} selection`;
  }
  return null;
}

function validateExperienceFields(input: Record<string, unknown>, errors: ValidationErrors) {
  if (typeof input.hasExperience !== 'boolean') {
    errors.hasExperience = 'Please indicate whether you have prior experience';
  }

  const details = asText(input.experienceDetails).trim();
  if (details.length > 1000) {
    errors.experienceDetails = 'Experience details must be 1000 characters or less';
  } else if (input.hasExperience === true && !details) {
    errors.experienceDetails = 'Please describe your relevant experience';
  }
}

/** Committee preferences validation for individual delegate */
export function validateCommitteePreferences(
  pref1: unknown,
  pref2: unknown,
  pref3: unknown,
  validCommitteeIds: string[]
): ValidationErrors {
  const errors: ValidationErrors = {};

  const err1 = validateSelection(pref1, validCommitteeIds, '1st committee preference');
  if (err1) errors.committeePreference1 = err1;

  const err2 = validateSelection(pref2, validCommitteeIds, '2nd committee preference');
  if (err2) errors.committeePreference2 = err2;

  const err3 = validateSelection(pref3, validCommitteeIds, '3rd committee preference');
  if (err3) errors.committeePreference3 = err3;

  const first = asText(pref1);
  const second = asText(pref2);
  const third = asText(pref3);
  if (first && second && first === second) {
    errors.committeePreference2 = '2nd preference must be different from 1st';
  }
  if (first && third && first === third) {
    errors.committeePreference3 = '3rd preference must be different from 1st';
  }
  if (second && third && second === third) {
    errors.committeePreference3 = '3rd preference must be different from 2nd';
  }

  return errors;
}

/** Delegate count boundary check */
export function validateDelegateCount(count: unknown): string | null {
  if (typeof count !== 'number' || !Number.isInteger(count) || count < 2 || count > 20) {
    return 'Delegation size must be between 2 and 20 delegates';
  }
  return null;
}

/** Team member count boundary check */
export function validateTeamMemberCount(count: unknown): string | null {
  if (typeof count !== 'number' || !Number.isInteger(count) || count < 2 || count > 4) {
    return 'Moot Court teams must consist of 2 to 4 members';
  }
  return null;
}

// === COMPOSITE VALIDATORS ===

export function validateGimunIndividual(
  data: GimunIndividualData,
  validCommitteeIds: string[]
): ValidationErrors {
  const errors: ValidationErrors = {};
  const input = asRecord(data);

  const nameErr = validateName(input.fullName, 'Full Name');
  if (nameErr) errors.fullName = nameErr;

  const emailErr = validateEmail(input.email);
  if (emailErr) errors.email = emailErr;

  const phoneErr = validatePhone(input.phone);
  if (phoneErr) errors.phone = phoneErr;

  const instErr = validateName(input.institution, 'Institution');
  if (instErr) errors.institution = instErr;

  const yearErr = validateChoice(input.yearOfStudy, YEAR_OF_STUDY, 'your year of study');
  if (yearErr) errors.yearOfStudy = yearErr;

  const prefErrors = validateCommitteePreferences(
    input.committeePreference1,
    input.committeePreference2,
    input.committeePreference3,
    validCommitteeIds
  );
  Object.assign(errors, prefErrors);

  if (typeof input.countryPreference !== 'string') {
    errors.countryPreference = 'Country preference must be text';
  } else if (input.countryPreference.length > 100) {
    errors.countryPreference = 'Country preference must be 100 characters or less';
  }

  if (typeof input.dietaryAccessibility !== 'string') {
    errors.dietaryAccessibility = 'Dietary/accessibility notes must be text';
  } else if (input.dietaryAccessibility.length > 1000) {
    errors.dietaryAccessibility = 'Dietary/accessibility notes must be 1000 characters or less';
  }

  const referralErr = validateChoice(input.referralSource, REFERRAL_SOURCES, 'how you heard about GIMUN');
  if (referralErr) errors.referralSource = referralErr;

  validateExperienceFields(input, errors);

  return errors;
}

export function validateGimunDelegation(
  data: GimunDelegationData,
  validCommitteeIds: string[]
): ValidationErrors {
  const errors: ValidationErrors = {};
  const input = asRecord(data);

  const headNameErr = validateName(input.delegationHeadName, 'Head of Delegation Name');
  if (headNameErr) errors.delegationHeadName = headNameErr;

  const headEmailErr = validateEmail(input.delegationHeadEmail);
  if (headEmailErr) errors.delegationHeadEmail = headEmailErr;

  const headPhoneErr = validatePhone(input.delegationHeadPhone);
  if (headPhoneErr) errors.delegationHeadPhone = headPhoneErr;

  const instErr = validateName(input.institution, 'Institution');
  if (instErr) errors.institution = instErr;

  const countErr = validateDelegateCount(input.delegateCount);
  if (countErr) errors.delegateCount = countErr;

  const delegates = Array.isArray(input.delegates) ? input.delegates : [];
  if (delegates.length < 2) {
    errors.delegates = 'At least 2 delegate records are required';
  } else if (delegates.length > 20) {
    errors.delegates = 'A delegation cannot contain more than 20 delegates';
  } else if (typeof input.delegateCount === 'number' && input.delegateCount !== delegates.length) {
    errors.delegateCount = 'Delegate count must match the number of delegate records';
  } else {
    const seenEmails = new Set<string>();
    delegates.forEach((delegate, idx) => {
      const del = asRecord(delegate);
      const delNameErr = validateName(del.name, `Delegate #${idx + 1} Name`);
      if (delNameErr) errors[`delegate_${idx}_name`] = delNameErr;

      const normalizedEmail = asText(del.email).trim().toLowerCase();
      const delEmailErr = validateEmail(del.email);
      if (delEmailErr) {
        errors[`delegate_${idx}_email`] = delEmailErr;
      } else if (seenEmails.has(normalizedEmail)) {
        errors[`delegate_${idx}_email`] = 'Each delegate must have a unique email address';
      } else {
        seenEmails.add(normalizedEmail);
      }

      const pref1Err = validateSelection(
        del.committeePreference1,
        validCommitteeIds,
        `Delegate #${idx + 1} 1st Committee`
      );
      if (pref1Err) errors[`delegate_${idx}_pref1`] = pref1Err;

      const pref2 = asText(del.committeePreference2).trim();
      if (pref2 && !validCommitteeIds.includes(pref2)) {
        errors[`delegate_${idx}_pref2`] = `Invalid Delegate #${idx + 1} 2nd Committee selection`;
      } else if (pref2 && pref2 === asText(del.committeePreference1).trim()) {
        errors[`delegate_${idx}_pref2`] = '2nd committee preference must differ from 1st';
      }

      const country = asText(del.countryPreference).trim();
      if (country.length > 100) {
        errors[`delegate_${idx}_countryPreference`] = 'Country preference must be 100 characters or less';
      }
    });
  }

  if (typeof input.dietaryAccessibility !== 'string') {
    errors.dietaryAccessibility = 'Dietary/accessibility notes must be text';
  } else if (input.dietaryAccessibility.length > 1000) {
    errors.dietaryAccessibility = 'Dietary/accessibility notes must be 1000 characters or less';
  }

  const referralErr = validateChoice(input.referralSource, REFERRAL_SOURCES, 'how your delegation heard about GIMUN');
  if (referralErr) errors.referralSource = referralErr;

  return errors;
}

export function validateMootCupTeam(
  data: MootCupTeamData,
  validCategoryIds: string[]
): ValidationErrors {
  const errors: ValidationErrors = {};
  const input = asRecord(data);

  const teamNameErr = validateName(input.teamName, 'Team Name');
  if (teamNameErr) errors.teamName = teamNameErr;

  const instErr = validateName(input.institution, 'Institution / Law Faculty');
  if (instErr) errors.institution = instErr;

  const catErr = validateSelection(
    input.problemCategoryPreference,
    validCategoryIds,
    'problem category preference'
  );
  if (catErr) errors.problemCategoryPreference = catErr;

  const members = Array.isArray(input.members) ? input.members : [];
  const memberCountErr = validateTeamMemberCount(members.length);
  if (memberCountErr) {
    errors.members = memberCountErr;
  } else {
    const seenEmails = new Set<string>();

    const leadOralists = members.filter((member) => asRecord(member).role === 'lead-oralist');
    const secondOralists = members.filter((member) => asRecord(member).role === 'second-oralist');
    if (leadOralists.length !== 1) {
      errors.members = 'Each team must designate exactly one Lead Oralist';
    } else if (secondOralists.length !== 1) {
      errors.members = 'Each team must designate exactly one Second Oralist';
    }

    members.forEach((member, idx) => {
      const m = asRecord(member);
      const nameErr = validateName(m.fullName, `Member #${idx + 1} Name`);
      if (nameErr) errors[`member_${idx}_fullName`] = nameErr;

      const emailErr = validateEmail(m.email);
      if (emailErr) {
        errors[`member_${idx}_email`] = emailErr;
      } else {
        const normalized = asText(m.email).trim().toLowerCase();
        if (seenEmails.has(normalized)) {
          errors[`member_${idx}_email`] = 'Each team member must have a unique email address';
        } else {
          seenEmails.add(normalized);
        }
      }

      const phoneErr = validatePhone(m.phone);
      if (phoneErr) errors[`member_${idx}_phone`] = phoneErr;

      if (typeof m.role !== 'string' || !MOOT_ROLES.has(m.role)) {
        errors[`member_${idx}_role`] = `Please specify a role for Member #${idx + 1}`;
      }
    });
  }

  if (typeof input.dietaryAccessibility !== 'string') {
    errors.dietaryAccessibility = 'Dietary/accessibility notes must be text';
  } else if (input.dietaryAccessibility.length > 1000) {
    errors.dietaryAccessibility = 'Dietary/accessibility notes must be 1000 characters or less';
  }

  const referralErr = validateChoice(input.referralSource, REFERRAL_SOURCES, 'how your team heard about GMC');
  if (referralErr) errors.referralSource = referralErr;

  validateExperienceFields(input, errors);

  return errors;
}

export function validateContactForm(data: ContactFormData): ValidationErrors {
  const errors: ValidationErrors = {};
  const input = asRecord(data);

  const nameErr = validateName(input.name, 'Your Name');
  if (nameErr) errors.name = nameErr;

  const emailErr = validateEmail(input.email);
  if (emailErr) errors.email = emailErr;

  const validQueryTypes = ['gimun', 'moot-cup', 'sponsorship', 'media', 'other'];
  if (typeof input.queryType !== 'string' || !validQueryTypes.includes(input.queryType)) {
    errors.queryType = 'Please select a valid query category';
  }

  const msg = asText(input.message).trim();
  if (!msg) {
    errors.message = 'Message is required';
  } else if (msg.length < 10) {
    errors.message = 'Message must be at least 10 characters';
  } else if (msg.length > 3000) {
    errors.message = 'Message must be 3000 characters or less';
  }

  return errors;
}
