import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

const contentDir = path.join(process.cwd(), 'content');

const VALID_TRACKS = new Set(['gimun', 'moot-cup', 'shared', 'all', 'general']);

const validationRules = [
  {
    file: 'asset-approvals.json',
    validate: (data) => {
      if (!data || typeof data !== 'object' || Array.isArray(data)) return ['Must be an object'];
      if (data.version !== 1) return ['version must be 1'];
      if (!data.assets || typeof data.assets !== 'object' || Array.isArray(data.assets)) return ['assets must be an object'];
      return [];
    },
  },
  {
    file: 'site.json',
    validate: (data) => {
      const errs = [];
      if (!data.eventNames || !data.eventNames.combined) errs.push('Missing eventNames.combined');
      if (!data.eventDates || !data.eventDates.start || !data.eventDates.end) errs.push('Missing eventDates');
      if (!data.venue) errs.push('Missing venue');
      if (!data.contactEmails || !data.contactEmails.general) errs.push('Missing contactEmails.general');
      if (typeof data.resultsPublished !== 'undefined' && typeof data.resultsPublished !== 'boolean') {
        errs.push('resultsPublished must be a boolean');
      }
      return errs;
    },
  },
  {
    file: 'schedule.json',
    validate: (data) => {
      const errs = [];
      if (!Array.isArray(data) || data.length === 0) return ['Must be a non-empty array'];
      const seenIds = new Set();
      data.forEach((item, index) => {
        if (!item.id) errs.push(`Item [${index}] missing id`);
        if (seenIds.has(item.id)) errs.push(`Duplicate schedule id: ${item.id}`);
        seenIds.add(item.id);
        if (!item.title) errs.push(`Schedule [${item.id || index}] missing title`);
        if (typeof item.day !== 'number') errs.push(`Schedule [${item.id || index}] missing day number`);
        if (!item.startTime || !item.endTime) errs.push(`Schedule [${item.id || index}] missing time bounds`);
        if (!VALID_TRACKS.has(item.track)) errs.push(`Schedule [${item.id || index}] invalid track: ${item.track}`);
      });
      return errs;
    },
  },
  {
    file: 'announcements.json',
    validate: (data) => {
      const errs = [];
      if (!Array.isArray(data) || data.length === 0) return ['Must be a non-empty array'];
      const seenIds = new Set();
      data.forEach((item, index) => {
        if (!item.id) errs.push(`Announcement [${index}] missing id`);
        if (seenIds.has(item.id)) errs.push(`Duplicate announcement id: ${item.id}`);
        seenIds.add(item.id);
        if (!item.title) errs.push(`Announcement [${item.id || index}] missing title`);
        if (!item.body) errs.push(`Announcement [${item.id || index}] missing body`);
        if (typeof item.pinnedFlag !== 'boolean') errs.push(`Announcement [${item.id || index}] pinnedFlag must be boolean`);
        if (!VALID_TRACKS.has(item.track)) errs.push(`Announcement [${item.id || index}] invalid track: ${item.track}`);
      });
      return errs;
    },
  },
  {
    file: 'results.json',
    validate: (data) => {
      const errs = [];
      if (!Array.isArray(data)) return ['Must be an array'];
      const seenIds = new Set();
      data.forEach((item, index) => {
        if (!item.id) errs.push(`Result [${index}] missing id`);
        if (seenIds.has(item.id)) errs.push(`Duplicate result id: ${item.id}`);
        seenIds.add(item.id);
        if (!item.awardName) errs.push(`Result [${item.id || index}] missing awardName`);
        if (!VALID_TRACKS.has(item.track)) errs.push(`Result [${item.id || index}] invalid track: ${item.track}`);
      });
      return errs;
    },
  },
  {
    file: 'committees.json',
    validate: (data) => {
      const errs = [];
      if (!Array.isArray(data) || data.length === 0) return ['Must be a non-empty array'];
      data.forEach((item, index) => {
        if (!item.id || !item.name || !item.slug) errs.push(`Committee [${index}] missing core identity`);
        if (!Array.isArray(item.topics) || item.topics.length === 0) errs.push(`Committee [${item.id}] missing topics`);
      });
      return errs;
    },
  },
  {
    file: 'moot-categories.json',
    validate: (data) => {
      const errs = [];
      if (!Array.isArray(data) || data.length === 0) return ['Must be a non-empty array'];
      data.forEach((item, index) => {
        if (!item.id || !item.name || !item.areaOfLaw) errs.push(`Moot category [${index}] missing core identity`);
      });
      return errs;
    },
  },
  {
    file: 'resources.json',
    validate: (data) => {
      const errs = [];
      if (!Array.isArray(data) || data.length === 0) return ['Must be a non-empty array'];
      data.forEach((item, index) => {
        if (!item.id || !item.title || !item.fileUrl) errs.push(`Resource [${index}] missing core fields`);
      });
      return errs;
    },
  },
  {
    file: 'clarifications.json',
    validate: (data) => {
      const errs = [];
      if (!Array.isArray(data)) return ['Must be an array'];
      data.forEach((item, index) => {
        if (!item.id || !item.question || !item.answer) errs.push(`Clarification [${index}] missing fields`);
      });
      return errs;
    },
  },
  {
    file: 'faq.json',
    validate: (data) => {
      const errs = [];
      if (!Array.isArray(data) || data.length === 0) return ['Must be a non-empty array'];
      data.forEach((item, index) => {
        if (!item.id || !item.question || !item.answer) errs.push(`FAQ [${index}] missing fields`);
      });
      return errs;
    },
  },
  {
    file: 'team.json',
    validate: (data) => {
      const errs = [];
      if (!Array.isArray(data) || data.length === 0) return ['Must be a non-empty array'];
      data.forEach((item, index) => {
        if (!item.id || !item.name || !item.role) errs.push(`Team member [${index}] missing fields`);
      });
      return errs;
    },
  },
  {
    file: 'sponsors.json',
    validate: (data) => {
      const errs = [];
      if (!Array.isArray(data)) return ['Must be an array'];
      data.forEach((item, index) => {
        if (!item.id || !item.name || !item.tier) errs.push(`Sponsor [${index}] missing fields`);
      });
      return errs;
    },
  },
  {
    file: 'gallery.json',
    validate: (data) => {
      const errs = [];
      if (!Array.isArray(data) || data.length === 0) return ['Must be a non-empty array'];
      const seenIds = new Set();
      data.forEach((item, index) => {
        if (!item.id || !item.title || !item.caption) errs.push(`Gallery item [${index}] missing core fields`);
        if (seenIds.has(item.id)) errs.push(`Duplicate gallery id: ${item.id}`);
        seenIds.add(item.id);
        if (!['gimun', 'moot-cup', 'campus', 'ceremonies'].includes(item.category)) {
          errs.push(`Gallery item [${item.id || index}] invalid category: ${item.category}`);
        }
      });
      return errs;
    },
  },
];

console.log('==============================================');
console.log(' GIMUN & GMC Content Integrity Validator');
console.log(' Target directory:', contentDir);
console.log('==============================================\n');

let totalErrors = 0;
let passedCount = 0;
const parsedContent = new Map();

for (const rule of validationRules) {
  const filePath = path.join(contentDir, rule.file);

  if (!fs.existsSync(filePath)) {
    console.error(`[FAIL] ${rule.file}: File does not exist.`);
    totalErrors++;
    continue;
  }

  try {
    const rawContent = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(rawContent);
    parsedContent.set(rule.file, parsed);
    const errors = rule.validate(parsed);

    if (errors.length > 0) {
      console.error(`[FAIL] ${rule.file} has ${errors.length} issue(s):`);
      errors.forEach((err) => console.error(`       - ${err}`));
      totalErrors += errors.length;
    } else {
      console.log(`[PASS] ${rule.file.padEnd(22)} Valid schema & entries`);
      passedCount++;
    }
  } catch (err) {
    console.error(`[FAIL] ${rule.file}: JSON syntax parsing error - ${err.message}`);
    totalErrors++;
  }
}

function collectAssetReferences(value, location, references = []) {
  if (typeof value === 'string' && (value.startsWith('/images/') || value.startsWith('/documents/'))) {
    references.push({ value, location });
    return references;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => collectAssetReferences(item, `${location}[${index}]`, references));
  } else if (value && typeof value === 'object') {
    Object.entries(value).forEach(([key, child]) => {
      collectAssetReferences(child, location ? `${location}.${key}` : key, references);
    });
  }

  return references;
}

const assetReferences = collectAssetReferences(Object.fromEntries(parsedContent));
for (const reference of assetReferences) {
  const assetPath = path.join(process.cwd(), 'public', reference.value.slice(1));
  if (!fs.existsSync(assetPath)) {
    totalErrors++;
    console.error(`[FAIL] Missing asset ${reference.value} referenced at ${reference.location}`);
  } else if (fs.statSync(assetPath).size === 0) {
    totalErrors++;
    console.error(`[FAIL] Empty asset ${reference.value} referenced at ${reference.location}`);
  }
}

const documents = parsedContent.get('resources.json') || [];
const documentIds = new Set(documents.map((document) => document.id));
for (const committee of parsedContent.get('committees.json') || []) {
  if (committee.backgroundGuideDocId && !documentIds.has(committee.backgroundGuideDocId)) {
    totalErrors++;
    console.error(`[FAIL] committees.json ${committee.id} references missing document ${committee.backgroundGuideDocId}`);
  }
}
for (const category of parsedContent.get('moot-categories.json') || []) {
  if (category.propositionDocId && !documentIds.has(category.propositionDocId)) {
    totalErrors++;
    console.error(`[FAIL] moot-categories.json ${category.id} references missing document ${category.propositionDocId}`);
  }
}

if (process.env.CONTENT_VALIDATION_STRICT === '1') {
  const launchErrors = [];
  const site = parsedContent.get('site.json');
  const eventYear = site?.eventDates?.start?.slice(0, 4);
  const team = parsedContent.get('team.json') || [];
  const sponsors = parsedContent.get('sponsors.json') || [];
  const gallery = parsedContent.get('gallery.json') || [];
  const resources = parsedContent.get('resources.json') || [];
  const approvals = parsedContent.get('asset-approvals.json')?.assets || {};
  const expectedStart = new Date(`${site?.eventDates?.start}T12:00:00+05:00`);
  const expectedEnd = new Date(`${site?.eventDates?.end}T12:00:00+05:00`);
  const eventDays = Math.floor((expectedEnd.getTime() - expectedStart.getTime()) / 86_400_000) + 1;
  const schedule = parsedContent.get('schedule.json') || [];
  const scheduleDays = new Set(schedule.map((item) => item.day));

  if (!Number.isFinite(expectedStart.getTime()) || !Number.isFinite(expectedEnd.getTime())) {
    launchErrors.push('site.json event dates must be valid ISO dates');
  } else if (eventDays !== 4) {
    launchErrors.push(`site.json event range must cover four days, received ${eventDays}`);
  }

  for (let day = 1; day <= eventDays; day += 1) {
    if (!scheduleDays.has(day)) launchErrors.push(`schedule.json is missing content for Day ${day}`);
  }

  const contentAssetReferences = assetReferences.map((reference) => reference.value);
  const staticReleaseAssets = [
    '/images/og/default.jpg',
    '/images/og/gimun.jpg',
    '/images/og/moot-cup.jpg',
    '/favicon.ico',
    '/favicon-16x16.png',
    '/favicon-32x32.png',
    '/apple-icon.png',
  ];
  const expectedAssets = [...new Set([...contentAssetReferences, ...staticReleaseAssets])];
  const manifestAssets = Object.keys(approvals);

  for (const asset of expectedAssets) {
    const approval = approvals[asset];
    if (!approval) {
      launchErrors.push(`asset-approvals.json is missing approval metadata for ${asset}`);
    } else if (approval.status !== 'approved') {
      launchErrors.push(`${asset} is not approved for production`);
    } else {
      for (const field of ['permissionRef', 'approvedByRole', 'approvedAt', 'source']) {
        if (!approval[field]) launchErrors.push(`${asset} approval metadata is missing ${field}`);
      }
    }
  }

  for (const asset of manifestAssets) {
    if (!expectedAssets.includes(asset)) launchErrors.push(`asset-approvals.json contains an unreferenced asset: ${asset}`);
  }

  team.forEach((member, index) => {
    if (!member.photo) launchErrors.push(`team.json[${index}] is missing a verified photo`);
  });
  sponsors.forEach((sponsor, index) => {
    if (!sponsor.logo) launchErrors.push(`sponsors.json[${index}] is missing a verified logo`);
  });
  gallery.forEach((item, index) => {
    if (!item.image) launchErrors.push(`gallery.json[${index}] is missing a verified image`);
  });
  for (const [index, resource] of resources.entries()) {
    const assetPath = path.join(process.cwd(), 'public', resource.fileUrl.replace(/^\//, ''));
    if (!fs.existsSync(assetPath)) {
      launchErrors.push(`resources.json[${index}] is missing its PDF asset: ${resource.fileUrl}`);
      continue;
    }
    const pdfBuffer = fs.readFileSync(assetPath);
    const pdfText = pdfBuffer.toString('latin1');
    let pageCount = 0;
    try {
      const loadingTask = getDocument({ data: new Uint8Array(pdfBuffer), disableWorker: true });
      const pdf = await loadingTask.promise;
      pageCount = pdf.numPages;
      await loadingTask.destroy();
    } catch {
      pageCount = 0;
    }
    const isGeneratedSeed = pdfText.includes('Official Publication | Page') || pdfText.includes('The Secretariat and Bench Directorate establish binding standards');
    if (pdfBuffer.length < 10_000 || !pdfBuffer.subarray(0, 5).equals(Buffer.from('%PDF-')) || !pdfText.includes('%%EOF') || pageCount < 1 || isGeneratedSeed) {
      launchErrors.push(`resources.json[${index}] points to a seed/sample document: ${resource.fileUrl}`);
    }
  }

  for (const [index, entry] of [...team, ...sponsors, ...gallery].entries()) {
    const asset = entry.photo || entry.logo || entry.image;
    if (!asset) continue;
    const assetPath = path.join(process.cwd(), 'public', asset.replace(/^\//, ''));
    try {
      const metadata = await sharp(assetPath).metadata();
      if (!metadata.width || !metadata.height) launchErrors.push(`Referenced image has no dimensions: ${asset}`);
      if ((metadata.width || 0) < 320 || (metadata.height || 0) < 240) launchErrors.push(`Referenced image is too small for production: ${asset}`);
    } catch {
      launchErrors.push(`Referenced image cannot be parsed: ${asset}`);
    }
  }
  for (const generator of ['scripts/generate-brand-media.mjs', 'scripts/generate-production-pdfs.mjs']) {
    if (fs.existsSync(path.join(process.cwd(), generator))) {
      launchErrors.push(`${generator} is a seed-asset generator; remove it and commit approved human-supplied assets before launch`);
    }
  }
  const allContentText = JSON.stringify(Object.fromEntries(parsedContent));
  const placeholderUrls = ['https://example.com', 'https://linkedin.com'];
  if (placeholderUrls.some((url) => allContentText.includes(`"${url}"`))) {
    launchErrors.push('Content contains a placeholder external URL');
  }
  if (eventYear !== '2027') launchErrors.push(`site.json event year must be 2027, received ${eventYear || 'unknown'}`);

  if (launchErrors.length > 0) {
    totalErrors += launchErrors.length;
    console.error('\n[LAUNCH GATE] Production content is not ready:');
    launchErrors.forEach((error) => console.error(`       - ${error}`));
  }
}

console.log('\n----------------------------------------------');
if (totalErrors === 0) {
  console.log(`SUCCESS: All ${passedCount} content files validated successfully with zero errors.`);
  process.exit(0);
} else {
  console.error(`FAILURE: Detected ${totalErrors} issue(s) across content files.`);
  process.exit(1);
}
