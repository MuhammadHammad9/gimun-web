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

async function main() {
  let serverProcess;
  let testProcess;
  let shuttingDown = false;

  const shutdown = async (exitCode) => {
    if (shuttingDown) return;
    shuttingDown = true;
    if (testProcess && !testProcess.killed) await killProcessTree(testProcess);
    if (serverProcess && !serverProcess.killed) await killProcessTree(serverProcess);
    process.exit(exitCode);
  };

  process.on('SIGINT', () => void shutdown(130));
  process.on('SIGTERM', () => void shutdown(143));

  serverProcess = spawn(process.execPath, [nextBin, 'start', '-H', '127.0.0.1', '-p', port], {
    cwd: rootDir,
    env: {
      ...process.env,
      SUBMISSIONS_BACKEND: 'memory',
      ALLOW_IN_MEMORY_SUBMISSIONS: '1',
      SUBMISSIONS_TEST_MODE: '1',
      SITE_URL: baseUrl,
    },
    stdio: 'inherit',
  });

  try {
    await waitForServer();
    testProcess = spawn(process.execPath, [playwrightCli, 'test', ...process.argv.slice(2)], {
      cwd: rootDir,
      env: { ...process.env, PLAYWRIGHT_MANAGED_SERVER: '1', SITE_URL: baseUrl },
      stdio: 'inherit',
    });

    const testExitCode = await new Promise((resolve, reject) => {
      testProcess.once('error', reject);
      testProcess.once('exit', (code, signal) => resolve(code ?? (signal ? 1 : 0)));
    });
    await shutdown(testExitCode);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    await shutdown(1);
  }
}

void main();
