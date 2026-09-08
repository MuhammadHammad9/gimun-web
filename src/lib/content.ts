import type {
  SiteConfig,
  Announcement,
  Committee,
  ProblemCategory,
  Document,
  ScheduleItem,
  FAQItem,
  TeamMember,
  Sponsor,
  Clarification,
  ResultAward,
  GalleryItem,
} from './types';
import { formatScheduleDay } from './site-config';

import siteConfigData from '../../content/site.json';
import announcementsData from '../../content/announcements.json';
import committeesData from '../../content/committees.json';
import mootCategoriesData from '../../content/moot-categories.json';
import resourcesData from '../../content/resources.json';
import scheduleData from '../../content/schedule.json';
import faqData from '../../content/faq.json';
import teamData from '../../content/team.json';
import sponsorsData from '../../content/sponsors.json';
import clarificationsData from '../../content/clarifications.json';
import resultsData from '../../content/results.json';
import galleryData from '../../content/gallery.json';

export function getSiteConfig(): SiteConfig {
  return siteConfigData as SiteConfig;
}

export function getAnnouncements(): Announcement[] {
  return announcementsData as Announcement[];
}

export function getCommittees(): Committee[] {
  return committeesData as Committee[];
}

export function getCommitteeBySlug(slug: string): Committee | undefined {
  const committees = committeesData as Committee[];
  return committees.find((c) => c.slug === slug || c.id === slug);
}

export function getProblemCategories(): ProblemCategory[] {
  return mootCategoriesData as ProblemCategory[];
}

export const getMootCategories = getProblemCategories;

export function getDocuments(): Document[] {
  return resourcesData as Document[];
}

export const getResources = getDocuments;

export function getSchedule(): ScheduleItem[] {
  const site = siteConfigData as SiteConfig;
  const [year, month, day] = site.eventDates.start.split('-').map(Number);

  return (scheduleData as ScheduleItem[]).map((item) => {
    const date = new Date(Date.UTC(year, month - 1, day + item.day - 1));
    const dateString = date.toISOString().slice(0, 10);
    return { ...item, dayLabel: `Day ${item.day} — ${formatScheduleDay(dateString)}` };
  });
}

export function getFAQ(): FAQItem[] {
  return faqData as FAQItem[];
}

export function getTeam(): TeamMember[] {
  return teamData as TeamMember[];
}

export const getTeamMembers = getTeam;

export function getSponsors(): Sponsor[] {
  return sponsorsData as Sponsor[];
}

export function getClarifications(): Clarification[] {
  return clarificationsData as Clarification[];
}

export function getResults(): ResultAward[] {
  return resultsData as ResultAward[];
}

export function getGallery(): GalleryItem[] {
  return galleryData as GalleryItem[];
}

export function getGalleryByCategory(category: GalleryItem['category']): GalleryItem[] {
  return (galleryData as GalleryItem[]).filter((item) => item.category === category);
}
