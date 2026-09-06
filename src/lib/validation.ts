import type {
  GimunIndividualData,
  GimunDelegationData,
  MootCupTeamData,
  ContactFormData,
} from './types';

export type ValidationErrors = Record<string, string>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Non-empty, trimmed, 2–100 characters */
export function validateName(value: string, fieldLabel: string): string | null {
  const trimmed = (value || '').trim();
  if (!trimmed) {
    return `${fieldLabel} is required`;
  }
  if (trimmed.length < 2) {
    return `${fieldLabel} must be at least 2 characters`;
  }
  if (trimmed.length > 100) {
    return `${fieldLabel} must be 100 characters or less`;
  }
  return null;
}

/** RFC-compliant email validation */
export function validateEmail(value: string): string | null {
  const trimmed = (value || '').trim();
  if (!trimmed) {
    return 'Email address is required';
  }
  if (!EMAIL_REGEX.test(trimmed)) {
    return 'Please enter a valid email address';
  }
  return null;
}

/** International or local phone with minimum 8 digits */
export function validatePhone(value: string): string | null {
  const trimmed = (value || '').trim();
  if (!trimmed) {
    return 'Phone number is required';
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
export function validateSelection(value: string, validIds: string[], fieldLabel: string): string | null {
  if (!value || !value.trim()) {
    return `Please select a ${fieldLabel}`;
  }
  if (validIds.length > 0 && !validIds.includes(value)) {
    return `Invalid ${fieldLabel} selection`;
  }
  return null;
}

/** Committee preferences validation for individual delegate */
export function validateCommitteePreferences(
  pref1: string,
  pref2: string,
  pref3: string,
  validCommitteeIds: string[]
): ValidationErrors {
  const errors: ValidationErrors = {};

  const err1 = validateSelection(pref1, validCommitteeIds, '1st committee preference');
  if (err1) errors.committeePreference1 = err1;

  const err2 = validateSelection(pref2, validCommitteeIds, '2nd committee preference');
  if (err2) errors.committeePreference2 = err2;

  const err3 = validateSelection(pref3, validCommitteeIds, '3rd committee preference');
  if (err3) errors.committeePreference3 = err3;

  if (pref1 && pref2 && pref1 === pref2) {
    errors.committeePreference2 = '2nd preference must be different from 1st';
  }
  if (pref1 && pref3 && pref1 === pref3) {
    errors.committeePreference3 = '3rd preference must be different from 1st';
  }
  if (pref2 && pref3 && pref2 === pref3) {
    errors.committeePreference3 = '3rd preference must be different from 2nd';
  }

  return errors;
}

/** Delegate count boundary check */
export function validateDelegateCount(count: number): string | null {
  if (isNaN(count) || count < 2 || count > 20) {
    return 'Delegation size must be between 2 and 20 delegates';
  }
  return null;
}

/** Team member count boundary check */
export function validateTeamMemberCount(count: number): string | null {
  if (isNaN(count) || count < 2 || count > 4) {
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

  const nameErr = validateName(data.fullName, 'Full Name');
  if (nameErr) errors.fullName = nameErr;

  const emailErr = validateEmail(data.email);
  if (emailErr) errors.email = emailErr;

  const phoneErr = validatePhone(data.phone);
  if (phoneErr) errors.phone = phoneErr;

  const instErr = validateName(data.institution, 'Institution');
  if (instErr) errors.institution = instErr;

  if (!data.yearOfStudy) {
    errors.yearOfStudy = 'Please select your year of study';
  }

  const prefErrors = validateCommitteePreferences(
    data.committeePreference1,
    data.committeePreference2,
    data.committeePreference3,
    validCommitteeIds
  );
  Object.assign(errors, prefErrors);

  if (data.countryPreference && data.countryPreference.length > 100) {
    errors.countryPreference = 'Country preference must be 100 characters or less';
  }

  if (data.dietaryAccessibility && data.dietaryAccessibility.length > 1000) {
    errors.dietaryAccessibility = 'Dietary/accessibility notes must be 1000 characters or less';
  }

  if (!data.referralSource) {
    errors.referralSource = 'Please tell us how you heard about GIMUN';
  }

  return errors;
}

export function validateGimunDelegation(
  data: GimunDelegationData,
  validCommitteeIds: string[]
): ValidationErrors {
  const errors: ValidationErrors = {};

  const headNameErr = validateName(data.delegationHeadName, 'Head of Delegation Name');
  if (headNameErr) errors.delegationHeadName = headNameErr;

  const headEmailErr = validateEmail(data.delegationHeadEmail);
  if (headEmailErr) errors.delegationHeadEmail = headEmailErr;

  const headPhoneErr = validatePhone(data.delegationHeadPhone);
  if (headPhoneErr) errors.delegationHeadPhone = headPhoneErr;

  const instErr = validateName(data.institution, 'Institution');
  if (instErr) errors.institution = instErr;

  const countErr = validateDelegateCount(data.delegateCount);
  if (countErr) errors.delegateCount = countErr;

  if (!data.delegates || data.delegates.length < 2) {
    errors.delegates = 'At least 2 delegate records are required';
  } else {
    data.delegates.forEach((del, idx) => {
      const delNameErr = validateName(del.name, `Delegate #${idx + 1} Name`);
      if (delNameErr) errors[`delegate_${idx}_name`] = delNameErr;

      const delEmailErr = validateEmail(del.email);
      if (delEmailErr) errors[`delegate_${idx}_email`] = delEmailErr;

      const pref1Err = validateSelection(
        del.committeePreference1,
        validCommitteeIds,
        `Delegate #${idx + 1} 1st Committee`
      );
      if (pref1Err) errors[`delegate_${idx}_pref1`] = pref1Err;
    });
  }

  if (data.dietaryAccessibility && data.dietaryAccessibility.length > 1000) {
    errors.dietaryAccessibility = 'Dietary/accessibility notes must be 1000 characters or less';
  }

  if (!data.referralSource) {
    errors.referralSource = 'Please tell us how your delegation heard about GIMUN';
  }

  return errors;
}

export function validateMootCupTeam(
  data: MootCupTeamData,
  validCategoryIds: string[]
): ValidationErrors {
  const errors: ValidationErrors = {};

  const teamNameErr = validateName(data.teamName, 'Team Name');
  if (teamNameErr) errors.teamName = teamNameErr;

  const instErr = validateName(data.institution, 'Institution / Law Faculty');
  if (instErr) errors.institution = instErr;

  const catErr = validateSelection(
    data.problemCategoryPreference,
    validCategoryIds,
    'problem category preference'
  );
  if (catErr) errors.problemCategoryPreference = catErr;

  const memberCountErr = validateTeamMemberCount(data.members?.length || 0);
  if (memberCountErr) {
    errors.members = memberCountErr;
  } else {
    const seenEmails = new Set<string>();

    const leadOralists = data.members.filter((m) => m.role === 'lead-oralist');
    const secondOralists = data.members.filter((m) => m.role === 'second-oralist');
    if (leadOralists.length !== 1) {
      errors.members = 'Each team must designate exactly one Lead Oralist';
    } else if (secondOralists.length !== 1) {
      errors.members = 'Each team must designate exactly one Second Oralist';
    }

    data.members.forEach((m, idx) => {
      const nameErr = validateName(m.fullName, `Member #${idx + 1} Name`);
      if (nameErr) errors[`member_${idx}_fullName`] = nameErr;

      const emailErr = validateEmail(m.email);
      if (emailErr) {
        errors[`member_${idx}_email`] = emailErr;
      } else {
        const normalized = m.email.trim().toLowerCase();
        if (seenEmails.has(normalized)) {
          errors[`member_${idx}_email`] = 'Each team member must have a unique email address';
        } else {
          seenEmails.add(normalized);
        }
      }

      const phoneErr = validatePhone(m.phone);
      if (phoneErr) errors[`member_${idx}_phone`] = phoneErr;

      if (!m.role) {
        errors[`member_${idx}_role`] = `Please specify a role for Member #${idx + 1}`;
      }
    });
  }

  if (data.dietaryAccessibility && data.dietaryAccessibility.length > 1000) {
    errors.dietaryAccessibility = 'Dietary/accessibility notes must be 1000 characters or less';
  }

  if (!data.referralSource) {
    errors.referralSource = 'Please tell us how your team heard about GMC';
  }

  return errors;
}

export function validateContactForm(data: ContactFormData): ValidationErrors {
  const errors: ValidationErrors = {};

  const nameErr = validateName(data.name, 'Your Name');
  if (nameErr) errors.name = nameErr;

  const emailErr = validateEmail(data.email);
  if (emailErr) errors.email = emailErr;

  const validQueryTypes = ['gimun', 'moot-cup', 'sponsorship', 'media', 'other'];
  if (!data.queryType || !validQueryTypes.includes(data.queryType)) {
    errors.queryType = 'Please select a valid query category';
  }

  const msg = (data.message || '').trim();
  if (!msg) {
    errors.message = 'Message is required';
  } else if (msg.length < 10) {
    errors.message = 'Message must be at least 10 characters';
  } else if (msg.length > 3000) {
    errors.message = 'Message must be 3000 characters or less';
  }

  return errors;
}
