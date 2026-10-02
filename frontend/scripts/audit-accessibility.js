/**
 * frontend/scripts/audit-accessibility.js
 * Accessibility & Contrast Audit (WCAG 2.1 AA Compliance)
 * 
 * Verifies:
 * 1. Mathematical contrast ratios for core brand color pairs against WCAG 2.1 AA
 * 2. Image accessibility: alt attributes on all img/Image elements
 * 3. Button accessibility: visible text or aria-label on all button elements
 * 4. Semantic heading hierarchy: unique <h1> per page and logical <h2>/<h3> structure
 * 5. Keyboard accessibility: focus-visible rings on interactive inputs and buttons
 * 6. Motion accessibility: prefers-reduced-motion media query support in CSS
 */

const fs = require('fs');
const path = require('path');
const { assertFreshBuild } = require('./assert-fresh-build');

const rootDir = process.cwd();
assertFreshBuild(rootDir);
const srcDir = path.join(rootDir, 'src');
// Application source: the Next.js routes in src/ plus the code folders that
// used to live under src/ before the frontend/backend/shared split.
const sourceDirs = ['src', 'frontend/components', 'frontend/styles', 'frontend/motion', 'frontend/lib', 'backend/server', 'backend/lib', 'shared/lib', 'shared/assets'].map((dir) => path.join(rootDir, dir));
const appDir = path.join(srcDir, 'app');
const globalsCssPath = path.join(appDir, 'globals.css');

console.log('====================================================');
console.log(' GIMUN & GMC Accessibility Audit (WCAG 2.1 AA)');
console.log('====================================================\n');

let totalChecks = 0;
let passedChecks = 0;
let failedChecks = 0;

// ---------------------------------------------------------
// 1. Color Contrast Mathematical Calculations (WCAG 2.1)
// ---------------------------------------------------------
console.log('[Component 1/5] Mathematical Color Contrast Audit (WCAG 2.1 AA)...');

function hexToRgb(hex) {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  return { r, g, b };
}

function getRelativeLuminance({ r, g, b }) {
  const sRgb = [r, g, b].map((val) => {
    const s = val / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * sRgb[0] + 0.7152 * sRgb[1] + 0.0722 * sRgb[2];
}

function getContrastRatio(hex1, hex2) {
  const lum1 = getRelativeLuminance(hexToRgb(hex1));
  const lum2 = getRelativeLuminance(hexToRgb(hex2));
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Read the actual installed theme, rather than auditing an obsolete palette.
const theme = fs.readFileSync(globalsCssPath, 'utf8');
const token = name => {
  const value=theme.match(new RegExp(`--color-${name}:\\s*([^;]+)`))?.[1].trim();
  if(/^#[0-9a-fA-F]{6}$/.test(value||''))return value;
  const rgba=value?.match(/^rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)$/);
  if(rgba){const bg=hexToRgb(token('canvas'));return '#'+[bg.r,bg.g,bg.b].map((v,i)=>Math.round(Number(rgba[i+1])*Number(rgba[4])+v*(1-Number(rgba[4]))).toString(16).padStart(2,'0')).join('');}
  throw new Error(`Missing or unsupported theme color: ${name}`);
};
const colorAuditPairs = ['text','text-2','text-3','champagne','cream'].map(name => ({name:`${name} on canvas`,fg:token(name),bg:token('canvas'),target:4.5,context:'Theme token; rendered axe tests check actual combinations.',mandatoryPass:true}));

for (const pair of colorAuditPairs) {
  totalChecks++;
  const ratio = getContrastRatio(pair.fg, pair.bg);
  const formatted = `${ratio.toFixed(2)}:1`;
  const isPass = ratio >= pair.target;

  if (isPass) {
    passedChecks++;
    console.log(`  [PASS] ${pair.name.padEnd(36)} Ratio: ${formatted.padEnd(8)} (Target >= ${pair.target}:1) | ${pair.context}`);
  } else if (!pair.mandatoryPass) {
    passedChecks++;
    console.log(`  [INFO] ${pair.name.padEnd(36)} Ratio: ${formatted.padEnd(8)} (Brand token paired with accessible alternative) | ${pair.context}`);
  } else {
    failedChecks++;
    console.warn(`  [FAIL] ${pair.name.padEnd(36)} Ratio: ${formatted.padEnd(8)} (Target >= ${pair.target}:1) | ${pair.context}`);
  }
}

// ---------------------------------------------------------
// 2. Component Recursion Helper
// ---------------------------------------------------------
function getFilesRecursively(dir, extensions = ['.tsx', '.ts', '.jsx', '.js']) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of list) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(getFilesRecursively(fullPath, extensions));
    } else if (extensions.some((ext) => entry.name.endsWith(ext))) {
      results.push(fullPath);
    }
  }
  return results;
}

const allComponentFiles = sourceDirs.flatMap((dir) => getFilesRecursively(dir));

// ---------------------------------------------------------
// 3. Image Alt Attributes Verification
// ---------------------------------------------------------
console.log('\n[Component 2/5] Inspecting <img> and <Image> alt attributes...');
let totalImages = 0;
let missingAltImages = [];

const imageTagRegex = /<(?:img|Image)\b([^>]*)\/?>/g;

for (const file of allComponentFiles) {
  const content = fs.readFileSync(file, 'utf8');
  let match;

  while ((match = imageTagRegex.exec(content)) !== null) {
    totalImages++;
    const attrs = match[1];
    const hasAlt = /alt=(?:["'][^"']*["']|{[^}]+})/.test(attrs);
    // alt="" is correct for a decorative image, but only when marked aria-hidden, which states the intent.
    const hasEmptyAlt = /alt=["']\s*["']/.test(attrs) && !/aria-hidden=["']true["']/.test(attrs);

    if (!hasAlt || hasEmptyAlt) {
      missingAltImages.push({
        file: path.relative(rootDir, file),
        snippet: match[0],
      });
    }
  }
}

totalChecks++;
if (missingAltImages.length === 0) {
  passedChecks++;
  console.log(`  [PASS] All ${totalImages} image instances have non-empty alt text.`);
} else {
  failedChecks++;
  console.error(`  [FAIL] ${missingAltImages.length} image instance(s) missing alt text:`);
  missingAltImages.forEach((item) => console.error(`    - in ${item.file}: ${item.snippet}`));
}

// ---------------------------------------------------------
// 4. Action / Icon Buttons Accessibility
// ---------------------------------------------------------
console.log('\n[Component 3/5] Inspecting <button> elements for visible text or aria-label...');
let totalButtons = 0;
let missingLabelButtons = [];

// Match full button elements or opening tags
const buttonRegex = /<button\b([^>]*)>([\s\S]*?)<\/button>/g;

for (const file of allComponentFiles) {
  const content = fs.readFileSync(file, 'utf8');
  let match;

  while ((match = buttonRegex.exec(content)) !== null) {
    totalButtons++;
    const attrs = match[1];
    const innerContent = match[2].trim();

    const hasAriaLabel = /aria-label=["'][^"']+["']/.test(attrs) || /aria-label=\{[^}]+\}/.test(attrs);
    const hasAriaLabelledBy = /aria-labelledby=/.test(attrs);
    
    // Check if innerContent has text (excluding pure JSX tags or whitespace)
    const strippedText = innerContent.replace(/<[^>]+>/g, '').trim();
    const hasVisibleText = strippedText.length > 0 && !strippedText.startsWith('{/*');
    const hasDynamicExpression = /\{[^}]+\}/.test(innerContent) && !innerContent.startsWith('{/*');

    if (!hasAriaLabel && !hasAriaLabelledBy && !hasVisibleText && !hasDynamicExpression) {
      missingLabelButtons.push({
        file: path.relative(rootDir, file),
        attrs,
      });
    }
  }
}

totalChecks++;
if (missingLabelButtons.length === 0) {
  passedChecks++;
  console.log(`  [PASS] All ${totalButtons} button instances provide visible text or aria-label.`);
} else {
  failedChecks++;
  console.error(`  [FAIL] ${missingLabelButtons.length} button(s) lack visible text or accessible label:`);
  missingLabelButtons.forEach((b) => console.error(`    - in ${b.file}: <button ${b.attrs.trim()}>`));
}

// ---------------------------------------------------------
// 5. Semantic Heading Structure (Unique <h1> per page & Logical <h2>/<h3> hierarchy)
// ---------------------------------------------------------
console.log('\n[Component 4/5] Auditing semantic heading structure across App Router pages & built HTML...');

const pageFiles = allComponentFiles.filter((f) => {
  const rel = path.relative(appDir, f).replace(/\\/g, '/');
  // Authenticated conditional/composed pages are checked in test:admin.
  return !rel.startsWith('admin/') && (rel.endsWith('page.tsx') || rel.endsWith('page.ts'));
});

let headingErrors = [];
let hierarchyErrors = [];

for (const pageFile of pageFiles) {
  let content = fs.readFileSync(pageFile, 'utf8');
  const relPath = path.relative(rootDir, pageFile);

  // If the page delegates rendering to a client component in the same folder, concatenate it
  const pageDir = path.dirname(pageFile);
  if (fs.existsSync(pageDir)) {
    const dirFiles = fs.readdirSync(pageDir);
    for (const f of dirFiles) {
      if (f.endsWith('Client.tsx') || f.endsWith('Client.jsx')) {
        content += '\n' + fs.readFileSync(path.join(pageDir, f), 'utf8');
      }
    }
  }

  // Check direct <h1> tags
  const directH1Matches = content.match(/<h1\b[^>]*>/g) || [];
  
  // Components that render the page <h1> internally. PageHero replaced the
  // former HeroSection in the 2027 redesign; both names are accepted.
  const heroMatches = content.match(/<(?:PageHero|HeroSection)[\s/>]/g) || [];

  const totalH1Count = directH1Matches.length + heroMatches.length;

  if (totalH1Count === 0) {
    headingErrors.push({ file: relPath, issue: 'No <h1> or PageHero heading found' });
  } else if (totalH1Count > 1) {
    headingErrors.push({ file: relPath, issue: `Multiple (${totalH1Count}) <h1> headings detected` });
  }
}

// Inspect actual rendered HTML in .next/server/app if available for logical h2/h3 hierarchy
const nextAppBuildDir = path.join(rootDir, '.next', 'server', 'app');
if (fs.existsSync(nextAppBuildDir)) {
  const buildHtmlFiles = getFilesRecursively(nextAppBuildDir, ['.html']).filter(
    (f) => !f.includes('_global-error')
  );

  for (const bFile of buildHtmlFiles) {
    const relHtmlPath = path.relative(rootDir, bFile);
    const html = fs.readFileSync(bFile, 'utf8');

    // Extract all heading tags in DOM order
    const headingMatches = [...html.matchAll(/<h([1-6])\b[^>]*>(.*?)<\/h\1>/gi)].map((m) => ({
      level: parseInt(m[1], 10),
      text: m[2].replace(/<[^>]+>/g, '').trim(),
    }));

    const h1Count = headingMatches.filter((h) => h.level === 1).length;
    if (h1Count !== 1) {
      headingErrors.push({ file: relHtmlPath, issue: `Rendered HTML has ${h1Count} <h1> headings (expected exactly 1)` });
    }

    // Verify logical hierarchy: no skipped levels (e.g. h1 -> h3 or h2 -> h4)
    let previousLevel = 0;
    for (const h of headingMatches) {
      if (previousLevel > 0 && h.level > previousLevel + 1) {
        hierarchyErrors.push({
          file: relHtmlPath,
          issue: `Skipped heading level: <h${previousLevel}> to <h${h.level}> ("${h.text.substring(0, 35)}...")`,
        });
      }
      previousLevel = h.level;
    }
  }
}

totalChecks++;
if (headingErrors.length === 0) {
  passedChecks++;
  console.log(`  [PASS] All ${pageFiles.length} pages maintain exactly one unique <h1> heading.`);
} else {
  failedChecks++;
  console.error(`  [FAIL] Found ${headingErrors.length} heading structure issue(s):`);
  headingErrors.forEach((h) => console.error(`    - ${h.file}: ${h.issue}`));
}

totalChecks++;
if (hierarchyErrors.length === 0) {
  passedChecks++;
  console.log(`  [PASS] Logical heading hierarchy verified: zero skipped levels across all pages.`);
} else {
  failedChecks++;
  console.error(`  [FAIL] Found ${hierarchyErrors.length} heading hierarchy jump(s):`);
  hierarchyErrors.forEach((h) => console.error(`    - ${h.file}: ${h.issue}`));
}

// ---------------------------------------------------------
// 6. Keyboard Focus Rings & Reduced Motion Support
// ---------------------------------------------------------
console.log('\n[Component 5/5] Verifying keyboard focus rings & prefers-reduced-motion...');

let hasGlobalFocusVisible = false;
let hasReducedMotionMedia = false;

if (fs.existsSync(globalsCssPath)) {
  const css = fs.readFileSync(globalsCssPath, 'utf8');
  hasGlobalFocusVisible = css.includes(':focus-visible') || css.includes('focus-visible');
  hasReducedMotionMedia = css.includes('@media (prefers-reduced-motion: reduce)');
}

totalChecks++;
if (hasGlobalFocusVisible) {
  passedChecks++;
  console.log('  [PASS] Global :focus-visible ring styles defined in globals.css.');
} else {
  failedChecks++;
  console.error('  [FAIL] Missing :focus-visible rules in globals.css.');
}

totalChecks++;
if (hasReducedMotionMedia) {
  passedChecks++;
  console.log('  [PASS] @media (prefers-reduced-motion: reduce) media query defined in globals.css.');
} else {
  failedChecks++;
  console.error('  [FAIL] Missing @media (prefers-reduced-motion: reduce) query in globals.css.');
}

// ---------------------------------------------------------
// Final Summary & Exit
// ---------------------------------------------------------
console.log('\n----------------------------------------------------');
console.log(' ACCESSIBILITY AUDIT SUMMARY:');
console.log(` - Total Compliance Checks:    ${totalChecks}`);
console.log(` - Passed Checks:              ${passedChecks}`);
console.log(` - Failed Checks:              ${failedChecks}`);
console.log('----------------------------------------------------');

if (failedChecks === 0) {
  console.log('\nSUCCESS: Static accessibility checks passed. Rendered axe and manual interaction checks are separate; this is not a WCAG conformance certification.');
  process.exit(0);
} else {
  console.error(`\nFAILURE: ${failedChecks} accessibility requirement(s) failed.`);
  process.exit(1);
}
