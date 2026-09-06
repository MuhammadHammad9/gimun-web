import fs from 'node:fs';
import path from 'node:path';

const contentDir = path.join(process.cwd(), 'content');

const VALID_TRACKS = new Set(['gimun', 'moot-cup', 'shared', 'all', 'general']);

const validationRules = [
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
];

console.log('==============================================');
console.log(' GIMUN & GMC Content Integrity Validator');
console.log(' Target directory:', contentDir);
console.log('==============================================\n');

let totalErrors = 0;
let passedCount = 0;

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

console.log('\n----------------------------------------------');
if (totalErrors === 0) {
  console.log(`SUCCESS: All ${passedCount} content files validated successfully with zero errors.`);
  process.exit(0);
} else {
  console.error(`FAILURE: Detected ${totalErrors} issue(s) across content files.`);
  process.exit(1);
}
