const path = require('node:path');
const { spawn } = require('node:child_process');

const nextBin = path.join(process.cwd(), 'node_modules', 'next', 'dist', 'bin', 'next');
const port = process.env.PORT || '3100';
const nextProcess = spawn(process.execPath, [nextBin, 'start', '-H', '127.0.0.1', '-p', port], {
  cwd: process.cwd(),
  env: process.env,
  stdio: 'inherit',
});

let shuttingDown = false;

function shutdown(exitCode = 0) {
  if (shuttingDown) return;
  shuttingDown = true;

  if (!nextProcess.pid) {
    process.exit(exitCode);
  }

  if (process.platform === 'win32') {
    const killer = spawn('taskkill', ['/pid', String(nextProcess.pid), '/t', '/f'], {
      stdio: 'ignore',
    });
    killer.once('exit', () => process.exit(exitCode));
    killer.once('error', () => process.exit(exitCode));
    return;
  }

  nextProcess.kill('SIGTERM');
  const forceExit = setTimeout(() => process.exit(exitCode), 5_000);
  forceExit.unref();
  nextProcess.once('exit', () => process.exit(exitCode));
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
process.on('SIGHUP', () => shutdown(0));

nextProcess.once('error', () => shutdown(1));
nextProcess.once('exit', (code, signal) => {
  if (!shuttingDown) shutdown(code ?? (signal ? 1 : 0));
});
