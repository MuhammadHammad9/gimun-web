const http = require('node:http');
const path = require('node:path');
const { spawn } = require('node:child_process');

const rootDir = process.cwd();
const port = process.env.PORT || '3100';
const baseUrl = `http://127.0.0.1:${port}`;
const nextBin = path.join(rootDir, 'node_modules', 'next', 'dist', 'bin', 'next');
const playwrightCli = path.join(rootDir, 'node_modules', '@playwright', 'test', 'cli.js');

function waitForServer(timeoutMs = 120_000) {
  const deadline = Date.now() + timeoutMs;
  return new Promise((resolve, reject) => {
    const check = () => {
      const request = http.get(baseUrl, (response) => {
        response.resume();
        if (response.statusCode && response.statusCode < 500) {
          resolve();
          return;
        }
        retry();
      });
      request.on('error', retry);
      request.setTimeout(1_000, () => {
        request.destroy();
        retry();
      });
    };

    const retry = () => {
      if (Date.now() >= deadline) {
        reject(new Error(`Timed out waiting for ${baseUrl}`));
        return;
      }
      setTimeout(check, 250);
    };

    check();
  });
}

function killProcessTree(child) {
  if (!child?.pid) return Promise.resolve();
  if (process.platform !== 'win32') {
    child.kill('SIGTERM');
    return new Promise((resolve) => {
      const timer = setTimeout(resolve, 5_000);
      timer.unref();
      child.once('exit', () => {
        clearTimeout(timer);
        resolve();
      });
    });
  }

  return new Promise((resolve) => {
    const killer = spawn('taskkill', ['/pid', String(child.pid), '/t', '/f'], { stdio: 'ignore' });
    killer.once('exit', resolve);
    killer.once('error', resolve);
  });
}

let activeServer;
let activeTests;
let interrupted = false;

async function stopActiveProcesses() {
  const tests = activeTests;
  const server = activeServer;
  activeTests = undefined;
  activeServer = undefined;
  if (tests && !tests.killed) await killProcessTree(tests);
  if (server && !server.killed) await killProcessTree(server);
}

async function runShard(testArgs) {
  activeServer = spawn(process.execPath, [nextBin, 'start', '-H', '127.0.0.1', '-p', port], {
    cwd: rootDir,
    env: {
      ...process.env,
      SUBMISSIONS_BACKEND: 'memory',
      ALLOW_IN_MEMORY_SUBMISSIONS: '1',
      SUBMISSIONS_TEST_MODE: '1',
    },
    stdio: 'inherit',
  });

  try {
    await waitForServer();
    if (interrupted) return 130;
    activeTests = spawn(process.execPath, [playwrightCli, 'test', ...testArgs], {
      cwd: rootDir,
      env: { ...process.env, PLAYWRIGHT_MANAGED_SERVER: '1' },
      stdio: 'inherit',
    });

    const testExitCode = await new Promise((resolve, reject) => {
      activeTests.once('error', reject);
      activeTests.once('exit', (code, signal) => resolve(code ?? (signal ? 1 : 0)));
    });
    return testExitCode;
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    return 1;
  } finally {
    await stopActiveProcesses();
  }
}

async function main() {
  const requestedArgs = process.argv.slice(2);
  const shards = requestedArgs.length > 0
    ? [requestedArgs]
    : ['mobile-375', 'mobile-390', 'tablet-768', 'desktop-1024', 'desktop-1440']
        .map((project) => [`--project=${project}`]);

  for (const shard of shards) {
    if (interrupted) return 130;
    const exitCode = await runShard(shard);
    if (exitCode !== 0) return exitCode;
  }
  return 0;
}

async function interrupt(exitCode) {
  if (interrupted) return;
  interrupted = true;
  await stopActiveProcesses();
  process.exit(exitCode);
}

process.on('SIGINT', () => void interrupt(130));
process.on('SIGTERM', () => void interrupt(143));

void main().then((exitCode) => process.exit(exitCode));
