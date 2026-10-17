#!/usr/bin/env node
/**
 * Lighthouse medians for a few key pages, under the release gate's mobile
 * profile and under a slow-3G profile, written as one JSON summary.
 *
 *   node scripts/measure-perf.mjs <base-url> <out.json> [runs]
 *
 * Uses the lighthouse package that @lhci/cli installs. Set CHROME_PATH when
 * no system Chrome is installed (a Playwright Chromium works).
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createRequire } from 'node:module';

const [base, out, runsArg] = process.argv.slice(2);
if (!base || !out) {
  console.error('Usage: node scripts/measure-perf.mjs <base-url> <out.json> [runs]');
  process.exit(1);
}
const runs = Number(runsArg) || 3;
const lighthouse = createRequire(import.meta.url).resolve('lighthouse/cli/index.js');
const pages = ['/', '/register', '/resources', '/gimun'];

// The gate profile matches lighthouserc.json; slow 3G is DevTools' preset with a 4x slower CPU.
const profiles = {
  gate: ['--throttling.rttMs=150', '--throttling.throughputKbps=1600', '--throttling.cpuSlowdownMultiplier=4'],
  slow3g: ['--throttling.rttMs=400', '--throttling.throughputKbps=400', '--throttling.cpuSlowdownMultiplier=4'],
};
const metrics = {
  score: (r) => Math.round(r.categories.performance.score * 100),
  fcp: (r) => r.audits['first-contentful-paint'].numericValue,
  lcp: (r) => r.audits['largest-contentful-paint'].numericValue,
  tbt: (r) => r.audits['total-blocking-time'].numericValue,
  cls: (r) => r.audits['cumulative-layout-shift'].numericValue,
  si: (r) => r.audits['speed-index'].numericValue,
  bytes: (r) => r.audits['total-byte-weight'].numericValue,
  jsBytes: (r) =>
    (r.audits['resource-summary']?.details?.items ?? []).find((i) => i.resourceType === 'script')?.transferSize ?? 0,
};
const median = (values) => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];

const summary = { base, runs, measuredAt: new Date().toISOString(), results: {} };
const dir = mkdtempSync(join(tmpdir(), 'perf-'));
try {
  for (const [profile, flags] of Object.entries(profiles)) {
    for (const page of pages) {
      const samples = [];
      for (let i = 0; i < runs; i += 1) {
        const file = join(dir, 'report.json');
        const result = spawnSync(process.execPath, [
          lighthouse, base + page, '--quiet', '--output=json', `--output-path=${file}`,
          '--only-categories=performance', '--form-factor=mobile', '--throttling-method=simulate',
          '--screenEmulation.mobile', '--screenEmulation.width=390', '--screenEmulation.height=844',
          '--screenEmulation.deviceScaleFactor=1', '--chrome-flags=--headless=new --no-sandbox', ...flags,
        ], { stdio: 'ignore' });
        // On Windows chrome-launcher often fails to delete its temporary
        // profile after the run (EPERM) and exits non-zero although the
        // report was written; a fresh report counts, a missing one does not.
        if (!existsSync(file)) { console.error(`Lighthouse failed for ${page} (${profile}), exit ${result.status}`); continue; }
        const report = JSON.parse(readFileSync(file, 'utf8'));
        rmSync(file);
        if (report.runtimeError) { console.error(`Lighthouse error for ${page} (${profile}): ${report.runtimeError.code}`); continue; }
        samples.push(Object.fromEntries(Object.entries(metrics).map(([k, f]) => [k, f(report)])));
      }
      if (!samples.length) continue;
      const row = Object.fromEntries(Object.keys(metrics).map((k) => [k, median(samples.map((s) => s[k]))]));
      summary.results[`${profile} ${page}`] = row;
      console.log(profile.padEnd(7), page.padEnd(11), JSON.stringify(row));
    }
  }
} finally {
  rmSync(dir, { recursive: true, force: true });
}
writeFileSync(out, JSON.stringify(summary, null, 2) + '\n');
console.log(`Wrote ${out}`);
