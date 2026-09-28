import type {
  DelegateRosterEntry,
  GimunDelegationData,
  GimunIndividualData,
  MootCupTeamData,
  MootTeamMember,
} from './types';

// Only the fields the forms collect are stored. Anything else a client sends
// (up to the body limit) used to be persisted verbatim alongside them.

const str = (value: unknown) => (typeof value === 'string' ? value : '');
const bool = (value: unknown) => value === true;
const rec = (value: unknown) =>
  value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};

export function pickGimunIndividual(input: unknown): GimunIndividualData {
  const d = rec(input);
  return {
    fullName: str(d.fullName),
    email: str(d.email),
    phone: str(d.phone),
    institution: str(d.institution),
    yearOfStudy: str(d.yearOfStudy) as GimunIndividualData['yearOfStudy'],
    hasExperience: bool(d.hasExperience),
    experienceDetails: str(d.experienceDetails),
    committeePreference1: str(d.committeePreference1),
    committeePreference2: str(d.committeePreference2),
    committeePreference3: str(d.committeePreference3),
    countryPreference: str(d.countryPreference),
    dietaryAccessibility: str(d.dietaryAccessibility),
    referralSource: str(d.referralSource) as GimunIndividualData['referralSource'],
  };
}

function pickDelegate(input: unknown): DelegateRosterEntry {
  const d = rec(input);
  return {
    name: str(d.name),
    email: str(d.email),
    committeePreference1: str(d.committeePreference1),
    committeePreference2: str(d.committeePreference2),
    countryPreference: str(d.countryPreference),
  };
}

export function pickGimunDelegation(input: unknown): GimunDelegationData {
  const d = rec(input);
  const delegates = Array.isArray(d.delegates) ? d.delegates.map(pickDelegate) : [];
  return {
    delegationHeadName: str(d.delegationHeadName),
    delegationHeadEmail: str(d.delegationHeadEmail),
    delegationHeadPhone: str(d.delegationHeadPhone),
    institution: str(d.institution),
    delegateCount: typeof d.delegateCount === 'number' ? d.delegateCount : delegates.length,
    delegates,
    dietaryAccessibility: str(d.dietaryAccessibility),
    referralSource: str(d.referralSource) as GimunDelegationData['referralSource'],
  };
}

function pickMember(input: unknown): MootTeamMember {
  const d = rec(input);
  return {
    fullName: str(d.fullName),
    email: str(d.email),
    phone: str(d.phone),
    role: str(d.role) as MootTeamMember['role'],
  };
}

export function pickMootTeam(input: unknown): MootCupTeamData {
  const d = rec(input);
  return {
    teamName: str(d.teamName),
    institution: str(d.institution),
    members: Array.isArray(d.members) ? d.members.map(pickMember) : [],
    problemCategoryPreference: str(d.problemCategoryPreference),
    hasExperience: bool(d.hasExperience),
    experienceDetails: str(d.experienceDetails),
    dietaryAccessibility: str(d.dietaryAccessibility),
    referralSource: str(d.referralSource) as MootCupTeamData['referralSource'],
  };
}
