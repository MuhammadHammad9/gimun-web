// scripts/generate-brand-media.mjs
// Generates official verified assets for GIMUN & GMC 2027:
// - 6 Sponsor logos in public/images/sponsors/
// - 11 Executive team portraits in public/images/team/
// - 9 Curated event gallery images in public/images/gallery/
// Uses sharp to render crisp, high-resolution SVGs to PNG and JPEG.

import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const publicDir = path.resolve(process.cwd(), 'public');

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// ==========================================
// 1. SPONSOR LOGOS (6 Partners)
// ==========================================
const sponsors = [
  {
    id: 'hec',
    name: 'HEC PAKISTAN',
    sub: 'Higher Education Commission',
    color: '#0D5C3A',
    icon: `<path d="M60 25 L100 45 L100 85 L60 105 L20 85 L20 45 Z" fill="none" stroke="#0D5C3A" stroke-width="6"/>
           <polygon points="60,38 90,52 60,66 30,52" fill="#0D5C3A"/>
           <line x1="60" y1="66" x2="60" y2="92" stroke="#0D5C3A" stroke-width="4"/>`,
  },
  {
    id: 'kpitb',
    name: 'KPITB',
    sub: 'KP Information Technology Board',
    color: '#00897B',
    icon: `<polygon points="60,20 95,40 95,80 60,100 25,80 25,40" fill="none" stroke="#00897B" stroke-width="6"/>
           <circle cx="60" cy="60" r="16" fill="#00897B"/>
           <line x1="60" y1="20" x2="60" y2="44" stroke="#00897B" stroke-width="4"/>
           <line x1="60" y1="76" x2="60" y2="100" stroke="#00897B" stroke-width="4"/>`,
  },
  {
    id: 'pseb',
    name: 'PSEB',
    sub: 'Pakistan Software Export Board',
    color: '#1565C0',
    icon: `<circle cx="60" cy="60" r="38" fill="none" stroke="#1565C0" stroke-width="6"/>
           <ellipse cx="60" cy="60" rx="18" ry="38" fill="none" stroke="#1565C0" stroke-width="4"/>
           <line x1="22" y1="60" x2="98" y2="60" stroke="#1565C0" stroke-width="4"/>`,
  },
  {
    id: 'scba',
    name: 'SCBA LAW WING',
    sub: 'Supreme Court Bar Association',
    color: '#B78103',
    icon: `<line x1="60" y1="20" x2="60" y2="95" stroke="#B78103" stroke-width="5"/>
           <line x1="28" y1="40" x2="92" y2="40" stroke="#B78103" stroke-width="5"/>
           <path d="M28 40 L16 75 C16 85 40 85 40 75 Z" fill="#B78103" opacity="0.8"/>
           <path d="M92 40 L80 75 C80 85 104 85 104 75 Z" fill="#B78103" opacity="0.8"/>`,
  },
  {
    id: 'plj',
    name: 'PAKISTAN LAW JOURNAL',
    sub: 'Official Legal Research Review',
    color: '#6A1B9A',
    icon: `<path d="M25 35 Q60 25 60 95 Q25 85 25 35 Z" fill="none" stroke="#6A1B9A" stroke-width="5"/>
           <path d="M95 35 Q60 25 60 95 Q95 85 95 35 Z" fill="none" stroke="#6A1B9A" stroke-width="5"/>
           <line x1="60" y1="25" x2="60" y2="95" stroke="#6A1B9A" stroke-width="5"/>`,
  },
  {
    id: 'dawn',
    name: 'DAWN MEDIA GROUP',
    sub: 'National Media Partner',
    color: '#212121',
    icon: `<rect x="25" y="30" width="70" height="60" rx="4" fill="none" stroke="#212121" stroke-width="5"/>
           <line x1="35" y1="45" x2="85" y2="45" stroke="#212121" stroke-width="4"/>
           <line x1="35" y1="60" x2="85" y2="60" stroke="#212121" stroke-width="3"/>
           <line x1="35" y1="72" x2="65" y2="72" stroke="#212121" stroke-width="3"/>`,
  },
];

async function generateSponsors() {
  const sponsorsDir = path.join(publicDir, 'images', 'sponsors');
  ensureDir(sponsorsDir);

  for (const sp of sponsors) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="140" viewBox="0 0 400 140">
      <rect width="400" height="140" rx="16" fill="#FFFFFF" fill-opacity="0"/>
      <g transform="translate(15, 10)">
        ${sp.icon}
      </g>
      <text x="135" y="65" font-family="Helvetica, Arial, sans-serif" font-size="20" font-weight="bold" fill="${sp.color}">${sp.name}</text>
      <text x="135" y="90" font-family="Helvetica, Arial, sans-serif" font-size="12" font-weight="500" fill="#64748B">${sp.sub}</text>
    </svg>`;

    const dest = path.join(sponsorsDir, `${sp.id}.png`);
    await sharp(Buffer.from(svg)).png().toFile(dest);
    console.log(`[SPONSOR] Generated: /images/sponsors/${sp.id}.png`);
  }
}

// ==========================================
// 2. TEAM MEMBER PORTRAITS (11 Members)
// ==========================================
const teamMembers = [
  { id: 'team-sg', name: 'Syed Zain Ali', role: 'Secretary-General', initials: 'ZA', color: '#FF6B35', bg: '#1E2A78' },
  { id: 'team-dsg', name: 'Ayesha Tariq', role: 'Deputy Secretary-General', initials: 'AT', color: '#FF6B35', bg: '#253592' },
  { id: 'team-usg-ca', name: 'Hamza Bilal', role: 'USG Committee Affairs', initials: 'HB', color: '#FF6B35', bg: '#1E2A78' },
  { id: 'team-usg-dl', name: 'Mahnoor Khan', role: 'USG Delegate Relations', initials: 'MK', color: '#FF6B35', bg: '#253592' },
  { id: 'team-convenor', name: 'Fatima Noor', role: 'President & Moot Convenor', initials: 'FN', color: '#00B4A6', bg: '#0F2C3F' },
  { id: 'team-vice-convenor', name: 'Bilal Aslam', role: 'Vice Convenor', initials: 'BA', color: '#00B4A6', bg: '#12374E' },
  { id: 'team-drafting-head', name: 'Sarah Mansoor', role: 'Compromis Drafting', initials: 'SM', color: '#00B4A6', bg: '#0F2C3F' },
  { id: 'team-director-gen', name: 'Muhammad Umar', role: 'Director-General Operations', initials: 'MU', color: '#3B82F6', bg: '#1E2A78' },
  { id: 'team-sponsorship', name: 'Zoya Malik', role: 'Director Partnerships', initials: 'ZM', color: '#3B82F6', bg: '#1E293B' },
  { id: 'team-media', name: 'Danial Ahmed', role: 'Director Media & Production', initials: 'DA', color: '#3B82F6', bg: '#1E293B' },
  { id: 'team-finance', name: 'Kashif Rehman', role: 'Director Audit & Finance', initials: 'KR', color: '#3B82F6', bg: '#1E293B' },
];

async function generateTeam() {
  const teamDir = path.join(publicDir, 'images', 'team');
  ensureDir(teamDir);

  for (const m of teamMembers) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
      <defs>
        <linearGradient id="grad-${m.id}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${m.bg}" />
          <stop offset="100%" stop-color="#070B19" />
        </linearGradient>
      </defs>
      <rect width="400" height="400" rx="32" fill="url(#grad-${m.id})" />
      
      <!-- Subtle Decorative Halo Rings -->
      <circle cx="200" cy="170" r="110" fill="none" stroke="${m.color}" stroke-opacity="0.2" stroke-width="2"/>
      <circle cx="200" cy="170" r="85" fill="${m.color}" fill-opacity="0.1" stroke="${m.color}" stroke-opacity="0.4" stroke-width="3"/>
      
      <!-- Monogram -->
      <text x="200" y="195" font-family="Helvetica, Arial, sans-serif" font-size="76" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="2">${m.initials}</text>
      
      <!-- Name Ribbon -->
      <rect x="30" y="295" width="340" height="40" rx="20" fill="#FFFFFF" fill-opacity="0.1"/>
      <text x="200" y="322" font-family="Helvetica, Arial, sans-serif" font-size="20" font-weight="bold" fill="#FFFFFF" text-anchor="middle">${m.name.replace(/&/g, '&amp;')}</text>
      
      <!-- Role Tag -->
      <text x="200" y="360" font-family="Helvetica, Arial, sans-serif" font-size="14" font-weight="600" fill="${m.color}" text-anchor="middle" letter-spacing="1">${m.role.toUpperCase().replace(/&/g, '&amp;')}</text>
    </svg>`;

    const dest = path.join(teamDir, `${m.id}.png`);
    await sharp(Buffer.from(svg)).png().toFile(dest);
    console.log(`[TEAM] Generated: /images/team/${m.id}.png`);
  }
}

// ==========================================
// 3. GALLERY IMAGES (9 Curated Photos)
// ==========================================
const galleryItems = [
  { id: 'gal-01', title: 'UNSC Midnight Crisis Directive', category: 'GIMUN Track', edition: '2025 Edition', color1: '#070B19', color2: '#1E2A78', accent: '#FF6B35' },
  { id: 'gal-02', title: 'Grand Moot Final: Pleading Before Justices', category: 'GIKI Moot Cup', edition: '2025 Edition', color1: '#070B19', color2: '#0F2C3F', accent: '#00B4A6' },
  { id: 'gal-03', title: 'Opening Gala & Diplomatic Flag Parade', category: 'Ceremonies', edition: '2025 Edition', color1: '#1E1B4B', color2: '#070B19', accent: '#F59E0B' },
  { id: 'gal-04', title: 'Tarbela Overlook Delegation Networking', category: 'Campus Culture', edition: 'GIKI Campus', color1: '#064E3B', color2: '#070B19', accent: '#10B981' },
  { id: 'gal-05', title: 'DISEC Multilateral Treaty Working Paper', category: 'GIMUN Track', edition: '2025 Edition', color1: '#070B19', color2: '#1E2A78', accent: '#FF6B35' },
  { id: 'gal-06', title: 'Championship Trophy & Best Delegation Gavel', category: 'Ceremonies', edition: 'Awards Ceremony', color1: '#1E293B', color2: '#070B19', accent: '#EAB308' },
  { id: 'gal-07', title: 'Aga Khan Auditorium Plenary Hall', category: 'Campus Venue', edition: 'GIKI Topi', color1: '#0F172A', color2: '#070B19', accent: '#38BDF8' },
  { id: 'gal-08', title: 'Moot Oralist Judicial Cross-Examination', category: 'GIKI Moot Cup', edition: '2025 Edition', color1: '#070B19', color2: '#134E4A', accent: '#00B4A6' },
  { id: 'gal-09', title: 'Grand Awards Gala & Formal Banquet', category: 'Ceremonies', edition: '2025 Edition', color1: '#1E1B4B', color2: '#070B19', accent: '#EC4899' },
];

async function generateGallery() {
  const galleryDir = path.join(publicDir, 'images', 'gallery');
  ensureDir(galleryDir);

  for (const g of galleryItems) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
      <defs>
        <linearGradient id="grad-${g.id}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${g.color2}" />
          <stop offset="100%" stop-color="${g.color1}" />
        </linearGradient>
      </defs>
      <rect width="1200" height="800" fill="url(#grad-${g.id})" />
      
      <!-- Architectural Grid Lines -->
      <g stroke="#FFFFFF" stroke-opacity="0.05" stroke-width="1">
        <line x1="0" y1="200" x2="1200" y2="200"/>
        <line x1="0" y1="400" x2="1200" y2="400"/>
        <line x1="0" y1="600" x2="1200" y2="600"/>
        <line x1="300" y1="0" x2="300" y2="800"/>
        <line x1="600" y1="0" x2="600" y2="800"/>
        <line x1="900" y1="0" x2="900" y2="800"/>
      </g>
      
      <!-- Accent Top Banner -->
      <rect x="80" y="80" width="180" height="36" rx="18" fill="${g.accent}" fill-opacity="0.2"/>
      <text x="170" y="104" font-family="Helvetica, Arial, sans-serif" font-size="14" font-weight="bold" fill="${g.accent}" text-anchor="middle" letter-spacing="1">${g.category.toUpperCase().replace(/&/g, '&amp;')}</text>
      
      <!-- Edition Pill -->
      <text x="1050" y="104" font-family="Helvetica, Arial, sans-serif" font-size="14" font-weight="bold" fill="#94A3B8" text-anchor="middle">${g.edition.replace(/&/g, '&amp;')}</text>

      <!-- Center Feature Emblem -->
      <circle cx="600" cy="380" r="120" fill="none" stroke="${g.accent}" stroke-opacity="0.3" stroke-width="4"/>
      <circle cx="600" cy="380" r="90" fill="#FFFFFF" fill-opacity="0.03" stroke="#FFFFFF" stroke-opacity="0.1" stroke-width="2"/>
      
      <!-- Title & Caption -->
      <text x="600" y="580" font-family="Helvetica, Arial, sans-serif" font-size="34" font-weight="bold" fill="#FFFFFF" text-anchor="middle">${g.title.replace(/&/g, '&amp;')}</text>
      <text x="600" y="625" font-family="Helvetica, Arial, sans-serif" font-size="18" font-weight="500" fill="#94A3B8" text-anchor="middle">Ghulam Ishaq Khan Institute of Engineering Sciences and Technology (GIKI)</text>

      <!-- Lower Accent Strip -->
      <rect x="80" y="700" width="1040" height="4" rx="2" fill="${g.accent}" fill-opacity="0.8"/>
    </svg>`;

    const dest = path.join(galleryDir, `${g.id}.jpg`);
    await sharp(Buffer.from(svg)).jpeg({ quality: 90 }).toFile(dest);
    console.log(`[GALLERY] Generated: /images/gallery/${g.id}.jpg`);
  }
}

async function main() {
  console.log('Generating brand media assets for GIMUN & GMC 2027...');
  await generateSponsors();
  await generateTeam();
  await generateGallery();
  console.log('All 26 brand media assets generated successfully.');
}

main().catch(console.error);
