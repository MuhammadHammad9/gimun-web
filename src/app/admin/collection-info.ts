import type { Collection } from '@shared/lib/content/registry';

/**
 * How each content section is described to the people who edit it: its name,
 * one entry's name (for buttons such as "Add team member"), what it controls,
 * where visitors see it, and which fields give an entry its title, summary and
 * picture in lists. Shared by the sidebar, the lists and the editor.
 */
export type CollectionInfo = {
  label: string;
  singular: string;
  description: string;
  /** Public page where this content appears, for "View on website". */
  path: string;
  /** Sidebar group. */
  group: 'Pages & text' | 'Programme' | 'GIMUN' | 'Moot Court' | 'About the event' | 'Files';
  /** Field holding an image or file, shown as a thumbnail in lists. */
  media?: string;
};

export const COLLECTION_INFO: Record<Collection, CollectionInfo> = {
  copy: { label: 'Page text', singular: 'page section', group: 'Pages & text', path: '/', description: 'Headings, paragraphs, lists and links on every public page, one entry per section. Hide a section to take it off its page.' },
  navigation: { label: 'Menu links', singular: 'menu link', group: 'Pages & text', path: '/', description: 'The links in the header, the phone menu and the footer.' },
  announcements: { label: 'Announcements', singular: 'announcement', group: 'Programme', path: '/announcements', description: 'Notices on the Announcements page. A pinned announcement also shows in the bar at the top of every page.' },
  schedule: { label: 'Schedule', singular: 'session', group: 'Programme', path: '/schedule', description: 'Every session of the four days, on the Schedule page and the home page.' },
  results: { label: 'Results & awards', singular: 'award', group: 'Programme', path: '/results', media: 'photo', description: 'Award winners. They appear only after results are released in Site settings.' },
  committees: { label: 'Committees', singular: 'committee', group: 'GIMUN', path: '/gimun/committees', description: 'Each GIMUN committee: agenda, chairs, countries and seats. Each one gets its own page.' },
  'moot-categories': { label: 'Case categories', singular: 'case category', group: 'Moot Court', path: '/moot-cup/categories', description: 'The areas of law for the moot court, on the Case categories page.' },
  clarifications: { label: 'Clarifications', singular: 'clarification', group: 'Moot Court', path: '/moot-cup/clarifications', description: 'Published answers to questions about the case problem.' },
  team: { label: 'Team', singular: 'team member', group: 'About the event', path: '/about/team', media: 'photo', description: 'The organizing team on the Team page, with photos.' },
  gallery: { label: 'Gallery', singular: 'photo', group: 'About the event', path: '/about/gallery', media: 'image', description: 'Photographs on the Gallery page.' },
  sponsors: { label: 'Sponsors', singular: 'sponsor', group: 'About the event', path: '/about/sponsors', media: 'logo', description: 'Sponsors and partners with their logos, on the Sponsors page and in the footer.' },
  faq: { label: 'Questions & answers', singular: 'question', group: 'About the event', path: '/about/faq', description: 'The FAQ page.' },
  resources: { label: 'Documents', singular: 'document', group: 'Files', path: '/resources', media: 'fileUrl', description: 'PDFs in the resource library: guides, rules and forms. Committees and case categories link to these.' },
};

export const CONTENT_GROUPS: CollectionInfo['group'][] = ['Pages & text', 'Programme', 'GIMUN', 'Moot Court', 'About the event', 'Files'];

/** The words an entry is known by in lists and headings. */
export function entryTitle(data: Record<string, unknown>, fallback = 'Untitled'): string {
  for (const key of ['title', 'name', 'label', 'question', 'awardName', 'country']) {
    const value = data[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return fallback;
}

/** One short line under the title in lists. */
export function entrySummary(collection: Collection, data: Record<string, unknown>): string {
  const text = (value: unknown) => (typeof value === 'string' ? value : '');
  switch (collection) {
    case 'schedule':
      return `Day ${data.day ?? '?'} · ${text(data.startTime)}–${text(data.endTime)} · ${text(data.location)}`;
    case 'team':
      return text(data.role);
    case 'results':
      return `${text(data.winnerName)} · ${text(data.institution)}`;
    case 'committees':
      return text(data.shortDescription);
    case 'moot-categories':
      return text(data.areaOfLaw);
    case 'sponsors':
      return text(data.tier).replace('-', ' ');
    case 'gallery':
      return [text(data.category), text(data.edition)].filter(Boolean).join(' · ');
    case 'resources':
      return [text(data.fileFormat), text(data.fileSize), text(data.versionDate)].filter(Boolean).join(' · ');
    case 'announcements':
      return text(data.body).slice(0, 120);
    case 'faq':
      return text(data.answer).slice(0, 120);
    case 'navigation':
      return `${text(data.href)} · ${text(data.area)}`;
    case 'copy':
      return text(data.title) || text(data.body).slice(0, 120);
    case 'clarifications':
      return text(data.answer).slice(0, 120);
  }
}

/** Human names for the field keys in the content schemas. */
export const FIELD_LABELS: Record<string, string> = {
  id: 'Reference',
  title: 'Title',
  body: 'Text',
  name: 'Name',
  label: 'Label',
  role: 'Role',
  group: 'Group',
  photo: 'Photo',
  image: 'Image',
  logo: 'Logo',
  bio: 'Short biography',
  links: 'Links',
  email: 'Email',
  linkedin: 'LinkedIn link',
  track: 'Track',
  timestamp: 'Date and time',
  pinnedFlag: 'Pin to the top of every page',
  badgeLabel: 'Badge text',
  actionUrl: 'Button link',
  day: 'Day number',
  startTime: 'Starts',
  endTime: 'Ends',
  location: 'Location',
  notes: 'Notes',
  updatedFlag: 'Mark as changed',
  type: 'Type',
  slug: 'Web address (short name)',
  topics: 'Agenda topics',
  topicDescriptions: 'Topic descriptions',
  chairs: 'Chairs',
  backgroundGuideDocId: 'Background guide',
  countryList: 'Countries',
  country: 'Country',
  status: 'Status',
  capacity: 'Seats (leave empty for one per country)',
  shortDescription: 'Short description',
  areaOfLaw: 'Area of law',
  description: 'Description',
  propositionDocId: 'Case problem document',
  lastUpdated: 'Last updated',
  fileUrl: 'File',
  fileSize: 'File size',
  fileFormat: 'File format',
  versionDate: 'Revision date',
  category: 'Category',
  question: 'Question',
  answer: 'Answer',
  tier: 'Tier',
  url: 'Website',
  edition: 'Edition',
  caption: 'Caption',
  aspectRatio: 'Shape',
  number: 'Number',
  submittedAt: 'Date submitted',
  categoryOrCommittee: 'Committee or category',
  awardName: 'Award',
  winnerName: 'Winner',
  institution: 'Institution',
  href: 'Link to',
  area: 'Shows in',
  parentId: 'Inside menu',
  footerGroup: 'Footer column',
  page: 'Page',
  kicker: 'Chapter name',
  accentPhrase: 'Words in accent colour',
  lead: 'Introduction',
  bridge: 'Line into the next section',
  note: 'Small print',
  items: 'List items',
  meta: 'Detail',
  actions: 'Buttons',
  hidden: 'Hide this section',
};
