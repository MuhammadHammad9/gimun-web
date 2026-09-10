const fs = require('fs');
const path = require('path');

function latestMtime(directory, extensions) {
  if (!fs.existsSync(directory)) return 0;
  let latest = 0;
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      latest = Math.max(latest, latestMtime(fullPath, extensions));
    } else if (extensions.some((extension) => entry.name.endsWith(extension))) {
      latest = Math.max(latest, fs.statSync(fullPath).mtimeMs);
    }
  }
  return latest;
}

function assertFreshBuild(rootDir) {
  const buildId = path.join(rootDir, '.next', 'BUILD_ID');
  if (!fs.existsSync(buildId)) {
    console.error('[FAIL] No production build found. Run "npm run build" before auditing.');
    process.exit(1);
  }

  const buildTime = fs.statSync(buildId).mtimeMs;
  const sourceTime = Math.max(
    latestMtime(path.join(rootDir, 'src'), ['.ts', '.tsx', '.css']),
    latestMtime(path.join(rootDir, 'content'), ['.json']),
    fs.existsSync(path.join(rootDir, 'package.json')) ? fs.statSync(path.join(rootDir, 'package.json')).mtimeMs : 0,
    fs.existsSync(path.join(rootDir, 'next.config.ts')) ? fs.statSync(path.join(rootDir, 'next.config.ts')).mtimeMs : 0,
  );

  if (sourceTime > buildTime + 1000) {
    console.error('[FAIL] Production build is stale. Run "npm run build" before auditing.');
    process.exit(1);
  }
}

module.exports = { assertFreshBuild };
