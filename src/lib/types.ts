// === CORE ENTITIES (PRD §21) ===

export type Track = 'gimun' | 'moot-cup' | 'shared';

import type { z } from 'zod';
import type { registry, siteSchema } from './content/registry';
export type SiteConfig = z.infer<typeof siteSchema> & { navigation?: import('./navigation').NavigationItem[] };
export type Committee = z.infer<typeof registry.committees>;
export type ProblemCategory = z.infer<typeof registry['moot-categories']>;
export type Document = z.infer<typeof registry.resources>;
export type ScheduleItem = z.infer<typeof registry.schedule>;
export type Announcement = z.infer<typeof registry.announcements>;
export type TeamMember = z.infer<typeof registry.team>;
export type Sponsor = z.infer<typeof registry.sponsors>;
export type FAQItem = z.infer<typeof registry.faq>;
export type GalleryItem = z.infer<typeof registry.gallery>;

// === FORM DATA TYPES (PRD §17.2) ===

export interface GimunIndividualData {
  fullName: string;
  email: string;
  phone: string;
  institution: string;
  yearOfStudy: 'freshman' | 'sophomore' | 'junior' | 'senior' | 'postgraduate' | 'high-school-senior' | '';
  hasExperience: boolean;
  experienceDetails: string;
  committeePreference1: string;
  committeePreference2: string;
  committeePreference3: string;
  countryPreference: string;
  dietaryAccessibility: string;
  referralSource: 'social-media' | 'university-club' | 'friend' | 'faculty-advisor' | 'campus-ambassador' | 'other' | '';
}

export interface DelegateRosterEntry {
  name: string;
  email: string;
  committeePreference1: string;
  committeePreference2: string;
  countryPreference: string;
}

export interface GimunDelegationData {
  delegationHeadName: string;
  delegationHeadEmail: string;
  delegationHeadPhone: string;
  institution: string;
  delegateCount: number;
  delegates: DelegateRosterEntry[];
  dietaryAccessibility: string;
  referralSource: 'social-media' | 'university-club' | 'friend' | 'faculty-advisor' | 'campus-ambassador' | 'other' | '';
}

export interface MootTeamMember {
  fullName: string;
  email: string;
  phone: string;
  role: 'lead-oralist' | 'second-oralist' | 'researcher' | 'advocate';
}

export interface MootCupTeamData {
  teamName: string;
  institution: string;
  members: MootTeamMember[];
  problemCategoryPreference: string;
  hasExperience: boolean;
  experienceDetails: string;
  dietaryAccessibility: string;
  referralSource: 'social-media' | 'university-club' | 'friend' | 'faculty-advisor' | 'campus-ambassador' | 'other' | '';
}

export interface ContactFormData {
  kind?: 'contact' | 'clarification';
  name: string;
  email: string;
  queryType: 'gimun' | 'moot-cup' | 'sponsorship' | 'media' | 'other';
  message: string;
}

export interface RegistrationSubmission {
  id: string;
  track: 'gimun' | 'moot-cup';
  applicantType: 'individual' | 'delegation' | 'team';
  submittedAt: string;
  status: 'received' | 'under-review' | 'accepted' | 'waitlisted' | 'rejected' | 'withdrawn';
  formData: GimunIndividualData | GimunDelegationData | MootCupTeamData;
}

export interface SubmissionReceiptDetails {
  applicantName: string;
  institution: string;
  email: string;
  phone?: string;
  track: 'gimun' | 'moot-cup';
  applicantType: 'individual' | 'delegation' | 'team';
  participantCount?: number;
  feeAmount?: string;
  summary?: string;
  eventDates?: string;
  venue?: string;
  submittedAt: string;
}

export interface SubmissionResponse {
  success: boolean;
  referenceId?: string;
  checkinToken?: string;
  message: string;
  receipt?: SubmissionReceiptDetails;
  emailQueued?: boolean;
  notificationQueued?: boolean;
  errors?: Record<string, string>;
}

export interface ResultAward {
  id: string;
  track: Track;
  categoryOrCommittee: string;
  awardName: string;
  winnerName: string;
  institution: string;
  photo?: string;
}

export interface Clarification {
  id: string;
  number: number;
  question: string;
  answer: string;
  submittedAt: string;
}
