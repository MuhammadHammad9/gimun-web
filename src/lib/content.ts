import 'server-only';
import { readCollection, readSite, readCountryAssignments } from './content/repository';
import { defaultNavigation } from './navigation';
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
import { formatEventDate, formatScheduleDay } from './site-config';

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

export async function getSiteConfig(): Promise<SiteConfig > {
  const [site,navigation] = await Promise.all([readSite(siteConfigData),readCollection('navigation',defaultNavigation)]);
  return {...site,navigation};
}

function resolveCanonicalTokens(value: string, site: SiteConfig) {
  return value
    .replaceAll('{{GIMUN_DEADLINE}}', formatEventDate(site.registrationDeadlines.gimun))
    .replaceAll('{{GMC_DEADLINE}}', formatEventDate(site.registrationDeadlines.mootCup));
}

export async function getAnnouncements(): Promise<Announcement[] > {
  const site = await getSiteConfig();
  return (await readCollection<Announcement>('announcements', announcementsData as Announcement[])).sort((a,b) => b.timestamp.localeCompare(a.timestamp)).map((announcement) => ({
    ...announcement,
    body: resolveCanonicalTokens(announcement.body, site),
  }));
}

export async function getCommittees(): Promise<Committee[] > {
  const committees = await readCollection<Committee>('committees', committeesData as Committee[]);
  const assigned = await readCountryAssignments();
  if (!assigned) return committees;
  return committees.map(c => ({ ...c, countryList: c.countryList.map(country => ({ ...country, status: assigned.allocations.some(a => a.committee_slug === c.slug && a.country === country.country) ? 'assigned' : assigned.reservations.some(a => a.committee_slug === c.slug && a.country === country.country) ? 'reserved' : 'available' })) }));
}

export async function getCommitteeBySlug(slug: string): Promise<Committee | undefined > {
  const committees = await getCommittees();
  return committees.find((c) => c.slug === slug || c.id === slug);
}

export async function getProblemCategories(): Promise<ProblemCategory[] > {
  return await readCollection<ProblemCategory>('moot-categories', mootCategoriesData as ProblemCategory[]);
}

export const getMootCategories = getProblemCategories;

export async function getDocuments(): Promise<Document[] > {
  return await readCollection<Document>('resources', resourcesData as Document[]);
}

export const getResources = getDocuments;

export async function getSchedule(): Promise<ScheduleItem[] > {
  const site = await getSiteConfig();
  const [year, month, day] = site.eventDates.start.split('-').map(Number);

  return (await readCollection<ScheduleItem>('schedule', scheduleData as ScheduleItem[])).map((item) => {
    const date = new Date(Date.UTC(year, month - 1, day + item.day - 1));
    const dateString = date.toISOString().slice(0, 10);
    return { ...item, dayLabel: `Day ${item.day} — ${formatScheduleDay(dateString)}` };
  });
}

export async function getFAQ(): Promise<FAQItem[] > {
  const site = await getSiteConfig();
  return (await readCollection<FAQItem>('faq', faqData as FAQItem[])).map((faq) => ({
    ...faq,
    answer: resolveCanonicalTokens(faq.answer, site),
  }));
}

export async function getTeam(): Promise<TeamMember[] > {
  return await readCollection<TeamMember>('team', teamData as TeamMember[]);
}

export const getTeamMembers = getTeam;

export async function getSponsors(): Promise<Sponsor[] > {
  return await readCollection<Sponsor>('sponsors', sponsorsData as Sponsor[]);
}

export async function getClarifications(): Promise<Clarification[] > {
  return await readCollection<Clarification>('clarifications', clarificationsData as Clarification[]);
}

export async function getResults(): Promise<ResultAward[] > {
  if (!(await getSiteConfig()).resultsPublished) return [];
  return await readCollection<ResultAward>('results', resultsData as ResultAward[]);
}

export async function getGallery(): Promise<GalleryItem[] > {
  return await readCollection<GalleryItem>('gallery', galleryData as GalleryItem[]);
}

export async function getGalleryByCategory(category: GalleryItem['category']): Promise<GalleryItem[] > {
  return (await readCollection<GalleryItem>('gallery', galleryData as GalleryItem[])).filter((item) => item.category === category);
}
