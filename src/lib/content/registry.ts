import { z } from 'zod';

const text = z.string().max(20000);
const required = text.min(1);
const id = z.string().regex(/^[a-zA-Z0-9_-]+$/).max(100);
const date = z.iso.date();
// A local path must stay on this site. Browsers treat "\" like "/" and drop
// tabs and newlines, so "/\evil.com" or "/<tab>/evil.com" would open another
// host: no backslash or whitespace is allowed anywhere in a local path.
export function isLocalPath(v: string): boolean {
  return /^\/(?![/\\])[^\s\\]*$/.test(v);
}
function isHttpsUrl(v: string): boolean {
  if (!/^https:\/\/[^\s\\]+$/.test(v)) return false;
  try {
    return new URL(v).protocol === 'https:';
  } catch {
    return false;
  }
}
const link = z.string().max(2048).refine(v => v === '' || isLocalPath(v) || isHttpsUrl(v), 'Use a local path or HTTPS URL');
// Images render through next/image, which only optimizes bundled files and
// the Supabase media bucket (next.config.ts). An arbitrary external URL would
// throw at render time and break the page, so image fields accept only those.
// A malformed link (or env value) must fail validation, never throw: a throw
// inside safeParse would drop the whole collection on the public pages.
// The link must come from this project's own media bucket: same origin as the
// configured Supabase URL (https in production, http for a local Supabase).
function isMediaBucketLink(v: string): boolean {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return false;
  try {
    const link = new URL(v);
    return link.origin === new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin && link.pathname.startsWith('/storage/v1/object/public/media/');
  } catch {
    return false;
  }
}
const image = z.string().max(2048).refine(
  v => v === '' || isLocalPath(v) || isMediaBucketLink(v),
  'Upload the image in the Media library, or pick one from it'
).meta({ media: 'image' });
const requiredImage = image.refine(v => v !== '', 'An image is required').meta({ media: 'image' });
const track = z.enum(['gimun', 'moot-cup', 'shared']);
const email = z.email();
const personLinks = z.object({ email: email.optional(), linkedin: link.optional() });
export const phases = ['pre-launch', 'registration-open', 'registration-closed', 'event-live', 'results', 'archived'] as const;
export const siteSchema = z.object({
  eventNames: z.object({ gimun: required, mootCup: required, combined: required }),
  hostInstitution: required, eventDates: z.object({ start: date, end: date }),
  registrationDeadlines: z.object({ gimun: date, mootCup: date }), venue: required,
  socialLinks: z.object({ instagram: link.optional(), facebook: link.optional(), linkedin: link.optional(), twitter: link.optional() }),
  contactEmails: z.object({ general: email, gimun: email.optional(), mootCup: email.optional(), sponsorship: email.optional() }),
  fees: z.object({ gimunIndividual: required, gimunDelegationPerDelegate: required, mootCupTeam: required }),
  // Numeric amounts used for invoices and amount due. The text above is only for display.
  feeAmounts: z.object({ gimunIndividual: z.number().min(0), gimunDelegationPerDelegate: z.number().min(0), mootCupTeam: z.number().min(0) }).optional(),
  // Bank transfer instructions printed on invoices and payment emails.
  paymentInstructions: text.optional(),
  registrationStatus: z.object({ gimunOpen: z.boolean(), mootCupOpen: z.boolean() }),
  resultsPublished: z.boolean(), phaseOverride: z.enum(phases).optional(),
  contactPhone: text.optional(), checkinDesk: text.optional(), entryRequirement: text.optional(), replyTime: text.optional(),
  footerBlurb: text.optional(), privacyNotice: text.optional(), memorialDeadline: date.optional(), galaDate: date.optional(),
  stats: z.array(z.object({ label: required, value: required })).optional(),
  mootScoring: z.object({memorialWeight:z.number().min(0).max(100),oralWeight:z.number().min(0).max(100),citationStyle:required}).optional(),
  gimunRubric: z.array(z.object({label:required,weight:z.number().min(0).max(100)})).optional(),
});
/** Public pages whose copy is editable, in site order. */
export const copyPages = ['home', 'gimun', 'committees', 'committee', 'gimun-rules', 'moot-cup', 'categories', 'moot-rules', 'clarifications', 'schedule', 'resources', 'announcements', 'results', 'register', 'about', 'faq', 'venue', 'team', 'sponsors', 'gallery', 'contact', 'privacy'] as const;
const tokens = 'Words in braces, such as {dates}, are filled in from live data. Keep them as written.';
const copy = z.object({
  id,
  page: z.enum(copyPages),
  label: required.meta({ description: 'Where this appears. Shown only in the admin.' }),
  kicker: text.optional().meta({ description: 'Chapter name or small line above the title.' }),
  title: text.optional().meta({ description: tokens }),
  accentPhrase: text.optional().meta({ description: 'Words from the title to set in the accent colour.' }),
  lead: text.optional().meta({ description: tokens }),
  body: text.optional(),
  bridge: text.optional().meta({ description: 'One line leading into the next section.' }),
  note: text.optional(),
  items: z.array(z.object({ title: text, body: text.optional(), meta: text.optional() })).optional(),
  actions: z.array(z.object({ label: required, href: link })).max(3).optional(),
  image: image.optional(),
  hidden: z.boolean().optional().meta({ description: 'Hide this section. Later chapters are renumbered.' }),
}).refine((v) => !v.accentPhrase || (v.title ?? '').includes(v.accentPhrase), { message: 'The accent phrase must appear in the title', path: ['accentPhrase'] });
export const registry = {
  announcements: z.object({ id, title: required, body: required, track: z.enum(['gimun', 'moot-cup', 'shared', 'all', 'general']), timestamp: z.iso.datetime({ offset: true }), pinnedFlag: z.boolean(), badgeLabel: text.optional(), actionUrl: link.optional() }),
  schedule: z.object({ id, day: z.number().int().min(1).max(31), dayLabel: text.optional(), startTime: z.string().regex(/^\d{2}:\d{2}$/), endTime: z.string().regex(/^\d{2}:\d{2}$/), title: required, track, location: required, notes: text, updatedFlag: z.boolean() }),
  committees: z.object({ id, name: required, type: z.enum(['general-assembly', 'specialized-agency', 'crisis', 'regional-body', 'other']), slug: id, topics: z.array(required).min(1), topicDescriptions: z.array(text), chairs: z.array(z.object({ id: id.optional(), name: required, role: required, photo: image.optional(), bio: text.optional(), group: text.optional(), links: personLinks.optional() })), backgroundGuideDocId: text, countryList: z.array(z.object({ country: required, status: z.enum(['available', 'assigned', 'reserved']) })), capacity: z.number().int().positive().nullable(), shortDescription: required }),
  'moot-categories': z.object({ id, name: required, areaOfLaw: required, description: required, propositionDocId: text, lastUpdated: date }),
  resources: z.object({ id, title: required, track, type: z.enum(['handbook', 'background-guide', 'proposition', 'rules', 'form', 'map', 'sponsorship-deck', 'other']), fileUrl: link.meta({ media: 'file' }), fileSize: required, fileFormat: required, versionDate: date }),
  faq: z.object({ id, category: z.enum(['general', 'registration-fees', 'gimun-specific', 'moot-cup-specific', 'logistics']), question: required, answer: required }),
  team: z.object({ id, name: required, role: required, group: z.enum(['secretariat', 'convening-committee', 'organizing-committee']), photo: image, bio: text, links: personLinks.optional() }),
  sponsors: z.object({ id, name: required, tier: z.enum(['title', 'gold', 'silver', 'partner', 'media-partner']), logo: image, url: link, description: text.optional() }),
  gallery: z.object({ id, title: required, category: z.enum(['gimun', 'moot-cup', 'campus', 'ceremonies']), edition: required, caption: text, location: text, aspectRatio: z.enum(['landscape', 'portrait', 'square', 'wide']), image: requiredImage }),
  clarifications: z.object({ id, number: z.number().int().positive(), question: required, answer: required, submittedAt: date }),
  results: z.object({ id, track, categoryOrCommittee: required, awardName: required, winnerName: required, institution: required, photo: image.optional() }),
  copy,
  navigation: z.object({ id, label: required, href: link, area: z.enum(['header', 'footer', 'mobile', 'all']), parentId: id.optional(), description: text.optional(), footerGroup: z.enum(['gimun', 'moot', 'event', 'about']).optional() }),
};
export type Collection = keyof typeof registry;
export const collections = Object.keys(registry) as Collection[];
export function isCollection(value: string): value is Collection { return Object.hasOwn(registry, value); }
export type ContentEntry = { collection: Collection; id: string; status: 'draft' | 'published' | 'archived'; sort_order: number; publish_at: string | null; expire_at: string | null; data: Record<string, unknown>; version: number; updated_at?: string };
export const entrySchema = z.object({ collection: z.enum(collections), id, status: z.enum(['draft', 'published', 'archived']), sort_order: z.number().int(), publish_at: z.iso.datetime({ offset: true }).nullable(), expire_at: z.iso.datetime({ offset: true }).nullable(), data: z.record(z.string(), z.unknown()), version: z.number().int().nonnegative() });
export function validateEntry(input: unknown): ContentEntry {
  const entry = entrySchema.parse(input);
  entry.data = registry[entry.collection].parse(entry.data);
  if (entry.id !== entry.data.id) throw new Error('Entry ID cannot differ from content ID.');
  if (entry.publish_at && entry.expire_at && entry.publish_at >= entry.expire_at) throw new Error('Expiry must be after publication.');
  return entry;
}
