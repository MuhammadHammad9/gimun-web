// === CORE ENTITIES (PRD §21) ===

export type Track = 'gimun' | 'moot-cup' | 'shared';

export interface SiteConfig {
  eventNames: {
    gimun: string;
    mootCup: string;
    combined: string;
  };
  hostInstitution: string;
  eventDates: {
    start: string; // ISO date string, e.g. "2027-03-15"
    end: string;
  };
  registrationDeadlines: {
    gimun: string;
    mootCup: string;
  };
  venue: string;
  socialLinks: {
    instagram?: string;
    facebook?: string;
    linkedin?: string;
  };
  contactEmails: {
    general: string;
    gimun?: string;
    mootCup?: string;
    sponsorship?: string;
  };
  fees: {
    gimunIndividual: string;
    gimunDelegationPerDelegate: string;
    mootCupTeam: string;
  };
  registrationStatus?: {
    gimunOpen: boolean;
    mootCupOpen: boolean;
  };
  resultsPublished?: boolean;
}

export interface Committee {
  id: string;
  name: string;
  type: 'general-assembly' | 'specialized-agency' | 'crisis' | 'regional-body' | 'other';
  slug: string;
  topics: string[];
  topicDescriptions: string[];
  chairs: {
    name: string;
    role: string;
    photo?: string;
    bio?: string;
  }[];
  backgroundGuideDocId: string;
  countryList: {
    country: string;
    status: 'available' | 'assigned' | 'reserved';
  }[];
  capacity: number | null;
  shortDescription: string;
}

export interface ProblemCategory {
  id: string;
  name: string;
  areaOfLaw: string;
  description: string;
  propositionDocId: string;
  lastUpdated: string;
}

export interface Document {
  id: string;
  title: string;
  track: Track;
  type: 'handbook' | 'background-guide' | 'proposition' | 'rules' | 'form' | 'map' | 'sponsorship-deck' | 'other';
  fileUrl: string;
  fileSize: string;
  fileFormat: string;
  versionDate: string;
}

export interface ScheduleItem {
  id: string;
  day: number;
  dayLabel: string;
  startTime: string;
  endTime: string;
  title: string;
  track: Track;
  location: string;
  notes: string;
  updatedFlag: boolean;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  track: Track | 'all';
  timestamp: string;
  pinnedFlag: boolean;
  badgeLabel?: string;
  actionUrl?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  group: 'secretariat' | 'convening-committee' | 'organizing-committee';
  photo: string;
  bio: string;
  links?: {
    email?: string;
    linkedin?: string;
  };
}

export interface Sponsor {
  id: string;
  name: string;
  tier: 'title' | 'gold' | 'silver' | 'partner' | 'media-partner';
  logo: string;
  url: string;
  description?: string;
}

export interface FAQItem {
  id: string;
  category: 'general' | 'registration-fees' | 'gimun-specific' | 'moot-cup-specific' | 'logistics';
  question: string;
  answer: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: 'gimun' | 'moot-cup' | 'campus' | 'ceremonies';
  edition: string;
  caption: string;
  location: string;
  aspectRatio: 'landscape' | 'portrait' | 'square' | 'wide';
  image: string;
}

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
  status: 'received' | 'under-review' | 'accepted' | 'rejected';
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
