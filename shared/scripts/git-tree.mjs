import { execSync } from 'child_process';

const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';

// ANSI Colors
const CYAN = '\x1b[38;5;51m';
const TEAL = '\x1b[38;5;44m';
const AMBER = '\x1b[38;5;214m';
const GOLD = '\x1b[38;5;220m';
const PURPLE = '\x1b[38;5;177m';
const PINK = '\x1b[38;5;205m';
const GREEN = '\x1b[38;5;48m';
const BLUE = '\x1b[38;5;75m';
const GRAY = '\x1b[38;5;244m';
const WHITE = '\x1b[38;5;255m';

// Background Badges
const BG_GREEN = '\x1b[48;5;28;38;5;255m';
const BG_PURPLE = '\x1b[48;5;97;38;5;255m';
const BG_AMBER = '\x1b[48;5;130;38;5;255m';
const BG_CYAN = '\x1b[48;5;30;38;5;255m';
const BG_GOLD = '\x1b[48;5;178;38;5;16m';

function banner() {
  console.log(`\n${CYAN}  ┌─────────────────────────────────────────────────────────────────────────────┐${RESET}`);
  console.log(`${CYAN}  │${BOLD}${WHITE}   ✦ GIMUN 2027 ARCHITECTURE // MULTI-TRACK GIT REPOSITORY TREE             ${RESET}${CYAN}│${RESET}`);
  console.log(`${CYAN}  │${RESET}${GRAY}   Production Trunk (main) ◈ Feature Tracks ◈ Semantic Release Milestones   ${RESET}${CYAN}│${RESET}`);
  console.log(`${CYAN}  └─────────────────────────────────────────────────────────────────────────────┘${RESET}\n`);

  console.log(`  ${BOLD}${WHITE}TRACK MATRIX:${RESET}`);
  console.log(`  ${GOLD}● main${RESET}                 ${GRAY}Production release trunk (PR-gated)${RESET}`);
  console.log(`  ${CYAN}● feat/frontend-redesign${RESET} ${GRAY}Design System, Satoshi Typography, AA A11y, Layout Engine${RESET}`);
  console.log(`  ${PURPLE}● feat/motion-canvas${RESET}     ${GRAY}Route Curtains, 404 Glitch Engine, WAAPI Motion Bridge${RESET}`);
  console.log(`  ${PINK}● feat/motion-redesign-ui${RESET}${GRAY}Dual Themes, Chapter Tones, Scroll-Told Storytelling${RESET}`);
  console.log(`  ${GREEN}● feat/admin-panel${RESET}       ${GRAY}Supabase CMS, Role-Based Access Control, Ticket Scanner${RESET}`);
  console.log(`  ${AMBER}● feat/submissions-ops${RESET}   ${GRAY}Transactional Outbox, QR Vouchers, Registration Engine${RESET}\n`);
  console.log(`  ${DIM}─────────────────────────────────────────────────────────────────────────────${RESET}\n`);
}

function parseAndRenderTree(limit = 40) {
  // Using git log with custom format to capture graph structure, hashes, refs, messages, and dates
  const format = '%h%x09%d%x09%s%x09%cr%x09%an';
  const gitCmd = `git log --graph --decorate=short --date=relative --pretty=format:"${format}" -n ${limit}`;

  let output;
  try {
    output = execSync(gitCmd, { encoding: 'utf8' });
  } catch (err) {
    console.error('Failed to run git log:', err);
    return;
  }

  const lines = output.split('\n');

  for (const line of lines) {
    if (!line.trim()) continue;

    // Split graph symbols from the commit data
    const parts = line.split('\t');
    if (parts.length < 3) {
      // Just graph symbols
      console.log(colorizeGraph(line));
      continue;
    }

    const [graphAndHash, refNames, subject, relDate, author] = parts;

    // Separate graph characters from the 7-character hash
    const match = graphAndHash.match(/^(.*?)(\b[0-9a-f]{7,8}\b)$/);
    let graphPart = '';
    let hash = '';

    if (match) {
      graphPart = match[1];
      hash = match[2];
    } else {
      graphPart = graphAndHash;
    }

    // Colorize graph characters
    const coloredGraph = colorizeGraph(graphPart);

    // Format commit type badge
    const badge = formatSubjectBadge(subject);

    // Format ref tags (branches, tags)
    const formattedRefs = formatRefs(refNames);

    // Format author and relative date
    const meta = `${DIM}${relDate}${RESET} ${GRAY}<${author}>${RESET}`;

    console.log(`${coloredGraph} ${GOLD}${hash}${RESET} ${formattedRefs}${badge} ${meta}`);
  }

  console.log(`\n  ${DIM}─────────────────────────────────────────────────────────────────────────────${RESET}\n`);
}

function colorizeGraph(graph) {
  return graph
    .replace(/\*/g, `${BOLD}${CYAN}●${RESET}`)
    .replace(/\\/g, `${PURPLE}\\${RESET}`)
    .replace(/\//g, `${TEAL}/${RESET}`)
    .replace(/\|/g, `${BLUE}│${RESET}`)
    .replace(/_/g, `${AMBER}_${RESET}`);
}

function formatRefs(refStr) {
  if (!refStr || !refStr.trim()) return '';

  const clean = refStr.replace(/^\s*\(/, '').replace(/\)\s*$/, '');
  const refs = clean.split(',').map(s => s.trim()).filter(Boolean);

  let out = '';
  for (const ref of refs) {
    if (ref.includes('tag:')) {
      const tagName = ref.replace('tag:', '').trim();
      out += `${BG_GOLD} 🏷 ${tagName} ${RESET} `;
    } else if (ref.includes('HEAD ->') || ref === 'main') {
      out += `${BG_GREEN} ⎇ ${ref.replace('HEAD ->', 'HEAD:').trim()} ${RESET} `;
    } else if (ref.includes('motion-redesign-ui')) {
      out += `${BG_PURPLE} ⎇ ${ref} ${RESET} `;
    } else if (ref.includes('motion-canvas')) {
      out += `${BG_AMBER} ⎇ ${ref} ${RESET} `;
    } else if (ref.includes('frontend-redesign')) {
      out += `${BG_CYAN} ⎇ ${ref} ${RESET} `;
    } else {
      out += `${GRAY}[${ref}]${RESET} `;
    }
  }

  return out;
}

function formatSubjectBadge(subject) {
  if (!subject) return '';

  if (subject.startsWith('Merge pull request')) {
    const prNum = subject.match(/Merge pull request #(\d+)/)?.[1] || '';
    const cleanSub = subject.replace(/Merge pull request #\d+ from /, '');
    return `${BOLD}${WHITE}⇄ PR #${prNum}${RESET} ${CYAN}${cleanSub}${RESET}`;
  }

  if (subject.startsWith('feat(') || subject.startsWith('feat:')) {
    return `${BOLD}${TEAL}feat${RESET} ${subject.slice(4)}`;
  }
  if (subject.startsWith('fix(') || subject.startsWith('fix:')) {
    return `${BOLD}${AMBER}fix${RESET} ${subject.slice(3)}`;
  }
  if (subject.startsWith('perf(') || subject.startsWith('perf:')) {
    return `${BOLD}${GOLD}perf${RESET} ${subject.slice(4)}`;
  }
  if (subject.startsWith('refactor(') || subject.startsWith('refactor:')) {
    return `${BOLD}${PURPLE}refactor${RESET} ${subject.slice(8)}`;
  }
  if (subject.startsWith('chore(') || subject.startsWith('chore:') || subject.startsWith('ci(') || subject.startsWith('ci:')) {
    return `${BOLD}${GRAY}chore${RESET} ${subject.slice(subject.indexOf(':') + 1)}`;
  }

  return `${WHITE}${subject}${RESET}`;
}

banner();
parseAndRenderTree(35);
