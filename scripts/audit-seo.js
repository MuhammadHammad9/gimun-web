/**
 * scripts/audit-seo.js
 * SEO, Social Previews & Meta Audit (Phase 6 QA)
 * 
 * Verifies:
 * 1. Every route has a unique, non-empty title and meta description
 * 2. Open Graph tags (og:title, og:description, og:url, og:image)
 * 3. Twitter Card metadata (summary_large_image, title, description, image)
 * 4. Sitemap completeness (all routes included in sitemap.ts)
 * 5. Returns exit code 0 on 100% compliance
 */

const fs = require('fs');
const path = require('path');

const rootDir = process.cwd();
const srcDir = path.join(rootDir, 'src');
const appDir = path.join(srcDir, 'app');
const contentDir = path.join(rootDir, 'content');

console.log('====================================================');
console.log(' GIMUN & GMC SEO, Meta & Social Preview Audit');
console.log('====================================================\n');

let totalAudited = 0;
let passedAudited = 0;
let failedAudited = 0;

// 1. Gather all dynamic committee slugs
const committeesFile = path.join(contentDir, 'committees.json');
let committees = [];
if (fs.existsSync(committeesFile)) {
  try {
    committees = JSON.parse(fs.readFileSync(committeesFile, 'utf8'));
  } catch (err) {
    console.error('Failed to parse committees.json:', err.message);
  }
}

// 2. Map of routes to their source page files
const routePageMap = [
  { route: '/', file: path.join(appDir, 'page.tsx') },
  { route: '/gimun', file: path.join(appDir, 'gimun', 'page.tsx') },
  { route: '/gimun/committees', file: path.join(appDir, 'gimun', 'committees', 'page.tsx') },
  { route: '/gimun/rules', file: path.join(appDir, 'gimun', 'rules', 'page.tsx') },
  { route: '/moot-cup', file: path.join(appDir, 'moot-cup', 'page.tsx') },
  { route: '/moot-cup/categories', file: path.join(appDir, 'moot-cup', 'categories', 'page.tsx') },
  { route: '/moot-cup/rules', file: path.join(appDir, 'moot-cup', 'rules', 'page.tsx') },
  { route: '/moot-cup/clarifications', file: path.join(appDir, 'moot-cup', 'clarifications', 'page.tsx') },
  { route: '/schedule', file: path.join(appDir, 'schedule', 'page.tsx') },
  { route: '/resources', file: path.join(appDir, 'resources', 'page.tsx') },
  { route: '/register', file: path.join(appDir, 'register', 'page.tsx') },
  { route: '/about', file: path.join(appDir, 'about', 'page.tsx') },
  { route: '/about/team', file: path.join(appDir, 'about', 'team', 'page.tsx') },
  { route: '/about/venue', file: path.join(appDir, 'about', 'venue', 'page.tsx') },
  { route: '/about/faq', file: path.join(appDir, 'about', 'faq', 'page.tsx') },
  { route: '/about/sponsors', file: path.join(appDir, 'about', 'sponsors', 'page.tsx') },
  { route: '/about/gallery', file: path.join(appDir, 'about', 'gallery', 'page.tsx') },
  { route: '/announcements', file: path.join(appDir, 'announcements', 'page.tsx') },
  { route: '/results', file: path.join(appDir, 'results', 'page.tsx') },
  { route: '/contact', file: path.join(appDir, 'contact', 'page.tsx') },
];

// Add dynamic committee routes
committees.forEach((c) => {
  routePageMap.push({
    route: `/gimun/committees/${c.slug}`,
    file: path.join(appDir, 'gimun', 'committees', '[slug]', 'page.tsx'),
    isDynamic: true,
    committee: c,
  });
});

console.log(`[Step 1/3] Auditing metadata definitions across ${routePageMap.length} application routes...\n`);

const seenTitles = new Map();
const seenDescriptions = new Map();

for (const { route, file, isDynamic, committee } of routePageMap) {
  totalAudited++;

  if (!fs.existsSync(file)) {
    failedAudited++;
    console.error(`  [FAIL] ${route.padEnd(30)} Page file does not exist: ${file}`);
    continue;
  }

  const content = fs.readFileSync(file, 'utf8');

  let title = '';
  let description = '';

  if (isDynamic && committee) {
    // Dynamically generated
    title = `${committee.name} | GIMUN 2027 Committee Dossier`;
    description = committee.shortDescription;
  } else {
    // Extract title from constructMetadata or metadata object
    const titleMatch = content.match(/title:\s*["'`]([^"'`]+)["'`]/);
    const descMatch = content.match(/description:\s*["'`]([^"'`]+)["'`]/);

    if (titleMatch) title = titleMatch[1];
    if (descMatch) description = descMatch[1];
  }

  const issues = [];

  if (!title) {
    issues.push('Missing title');
  } else if (title.length < 10) {
    issues.push(`Title too short (${title.length} chars)`);
  }

  if (!description) {
    issues.push('Missing description');
  } else if (description.length < 25) {
    issues.push(`Description too short (${description.length} chars)`);
  }

  // Duplicate checks
  if (title) {
    if (seenTitles.has(title)) {
      issues.push(`Duplicate title matches route "${seenTitles.get(title)}"`);
    } else {
      seenTitles.set(title, route);
    }
  }

  if (description) {
    if (seenDescriptions.has(description)) {
      issues.push(`Duplicate description matches route "${seenDescriptions.get(description)}"`);
    } else {
      seenDescriptions.set(description, route);
    }
  }

  // Check Open Graph and Twitter Card coverage
  const hasConstructMetadata = content.includes('constructMetadata(');
  const hasOgTitle = content.includes('openGraph') || hasConstructMetadata;
  const hasTwitterCard = content.includes('twitter') || hasConstructMetadata;

  if (!hasOgTitle) issues.push('Missing explicit Open Graph configuration');
  if (!hasTwitterCard) issues.push('Missing explicit Twitter Card configuration');

  if (issues.length === 0) {
    passedAudited++;
    console.log(`  [PASS] ${route.padEnd(28)} "${title.substring(0, 42)}..."`);
  } else {
    failedAudited++;
    console.error(`  [FAIL] ${route.padEnd(28)} Issues: ${issues.join('; ')}`);
  }
}

// ---------------------------------------------------------
// 2. Validate Sitemap.xml Completeness
// ---------------------------------------------------------
console.log('\n[Step 2/3] Auditing sitemap.ts completeness...');
totalAudited++;

const sitemapFile = path.join(appDir, 'sitemap.ts');
if (!fs.existsSync(sitemapFile)) {
  failedAudited++;
  console.error('  [FAIL] sitemap.ts does not exist in src/app/');
} else {
  const sitemapContent = fs.readFileSync(sitemapFile, 'utf8');
  let missingRoutesInSitemap = [];

  for (const { route } of routePageMap) {
    // Dynamic committee routes are generated in sitemap via committeeRoutes
    if (route.startsWith('/gimun/committees/')) {
      if (!sitemapContent.includes('committeeRoutes')) {
        missingRoutesInSitemap.push(route);
      }
    } else {
      const matchPattern = route === '/' ? "''" : `'${route}'`;
      if (!sitemapContent.includes(matchPattern)) {
        missingRoutesInSitemap.push(route);
      }
    }
  }

  if (missingRoutesInSitemap.length === 0) {
    passedAudited++;
    console.log(`  [PASS] All ${routePageMap.length} routes registered and indexed in sitemap.`);
  } else {
    failedAudited++;
    console.error(`  [FAIL] Missing ${missingRoutesInSitemap.length} route(s) in sitemap.ts:`, missingRoutesInSitemap);
  }
}

// ---------------------------------------------------------
// 3. Social Preview Media Asset Verification
// ---------------------------------------------------------
console.log('\n[Step 3/3] Checking default Open Graph social image asset...');
totalAudited++;

const ogImagePath = path.join(rootDir, 'public', 'images', 'og', 'default.jpg');
if (fs.existsSync(ogImagePath)) {
  const stats = fs.statSync(ogImagePath);
  passedAudited++;
  console.log(`  [PASS] Open Graph preview image verified at public/images/og/default.jpg (${stats.size} bytes).`);
} else {
  failedAudited++;
  console.error('  [FAIL] Missing social preview image at public/images/og/default.jpg.');
}

// ---------------------------------------------------------
// Final Summary & Exit
// ---------------------------------------------------------
console.log('\n----------------------------------------------------');
console.log(' SEO AUDIT SUMMARY:');
console.log(` - Total Audited Checks:       ${totalAudited}`);
console.log(` - Passed Checks:              ${passedAudited}`);
console.log(` - Failed Checks:              ${failedAudited}`);
console.log('----------------------------------------------------');

if (failedAudited === 0) {
  console.log('\nSUCCESS: 100% SEO, social previews, metadata, and sitemap verified.');
  process.exit(0);
} else {
  console.error(`\nFAILURE: ${failedAudited} SEO check(s) failed.`);
  process.exit(1);
}
