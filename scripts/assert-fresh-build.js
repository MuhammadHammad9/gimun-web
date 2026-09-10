const fs = require('fs');
const path = require('path');

function latestMtime(directory, extensions = null) {
  if (!fs.existsSync(directory)) return 0;
  let latest = 0;
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      latest = Math.max(latest, latestMtime(fullPath, extensions));
    } else if (!extensions || extensions.some((extension) => entry.name.endsWith(extension))) {
      latest = Math.max(latest, fs.statSync(fullPath).mtimeMs);
    }
  }
  return latest;
}

function fileMtime(filePath) {
  return fs.existsSync(filePath) ? fs.statSync(filePath).mtimeMs : 0;
}

function assertFreshBuild(rootDir) {
  const buildId = path.join(rootDir, '.next', 'BUILD_ID');
  if (!fs.existsSync(buildId)) {
    console.error('[FAIL] No production build found. Run "npm run build" before auditing.');
    process.exit(1);
  }

  const buildTime = fs.statSync(buildId).mtimeMs;
  const sourceTime = Math.max(
    // Include vendored fonts and any source-side media because Next embeds them
    // in the production output even though they are not text source files.
    latestMtime(path.join(rootDir, 'src')),
    latestMtime(path.join(rootDir, 'content'), ['.json']),
    latestMtime(path.join(rootDir, 'public')),
    fileMtime(path.join(rootDir, 'package.json')),
    fileMtime(path.join(rootDir, 'package-lock.json')),
    fileMtime(path.join(rootDir, 'next.config.ts')),
    fileMtime(path.join(rootDir, 'postcss.config.mjs')),
    fileMtime(path.join(rootDir, 'tailwind.config.ts')),
    fileMtime(path.join(rootDir, 'tsconfig.json')),
    // Metadata and server configuration are evaluated during the build too.
    ...['.env', '.env.local', '.env.production', '.env.production.local'].map((file) =>
      fileMtime(path.join(rootDir, file)),
    ),
  );

  if (sourceTime > buildTime + 1000) {
    console.error('[FAIL] Production build is stale. Run "npm run build" before auditing.');
    process.exit(1);
  }
}

module.exports = { assertFreshBuild };
