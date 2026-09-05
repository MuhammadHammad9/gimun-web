import fs from 'fs';
import path from 'path';

const contentDir = path.join(process.cwd(), 'content');

const checks = [
  {
    file: 'site.json',
    validate: (data) => data.eventNames?.combined && data.venue && data.contactEmails?.general,
  },
  {
    file: 'schedule.json',
    validate: (data) => Array.isArray(data) && data.length > 0 && data.every(i => i.id && i.title && i.day),
  },
  {
    file: 'announcements.json',
    validate: (data) => Array.isArray(data) && data.length > 0 && data.every(i => i.id && i.title),
  },
  {
    file: 'resources.json',
    validate: (data) => Array.isArray(data) && data.length > 0 && data.every(i => i.id && i.title && i.fileUrl),
  },
  {
    file: 'committees.json',
    validate: (data) => Array.isArray(data) && data.length > 0 && data.every(i => i.id && i.slug && i.topics),
  },
  {
    file: 'moot-categories.json',
    validate: (data) => Array.isArray(data) && data.length > 0 && data.every(i => i.id && i.name && i.areaOfLaw),
  },
  {
    file: 'clarifications.json',
    validate: (data) => Array.isArray(data) && data.length > 0 && data.every(i => i.id && i.number && i.question),
  },
  {
    file: 'faq.json',
    validate: (data) => Array.isArray(data) && data.length > 0 && data.every(i => i.id && i.question && i.answer),
  },
  {
    file: 'team.json',
    validate: (data) => Array.isArray(data) && data.length > 0 && data.every(i => i.id && i.name && i.role),
  },
  {
    file: 'sponsors.json',
    validate: (data) => Array.isArray(data) && data.length > 0 && data.every(i => i.id && i.name && i.tier),
  },
  {
    file: 'results.json',
    validate: (data) => Array.isArray(data) && data.length > 0 && data.every(i => i.id && i.awardName),
  },
];

console.log('--- Content Integrity Validation ---');
let allPassed = true;

for (const check of checks) {
  const p = path.join(contentDir, check.file);
  if (!fs.existsSync(p)) {
    console.error(`FAIL: File missing: ${check.file}`);
    allPassed = false;
    continue;
  }
  try {
    const raw = fs.readFileSync(p, 'utf8');
    const parsed = JSON.parse(raw);
    if (!check.validate(parsed)) {
      console.error(`FAIL: Schema validation failed for ${check.file}`);
      allPassed = false;
    } else {
      console.log(`PASS: ${check.file} is valid`);
    }
  } catch (err) {
    console.error(`FAIL: Error parsing JSON in ${check.file}:`, err.message);
    allPassed = false;
  }
}

if (!allPassed) {
  console.error('\nContent validation FAILED.');
  process.exit(1);
} else {
  console.log('\nAll content files PASSED integrity validation.');
}
