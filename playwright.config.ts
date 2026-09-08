import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/browser',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : 1,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: 'http://127.0.0.1:3100',
    channel: process.platform === 'win32' ? 'chrome' : undefined,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'mobile-375', use: { ...devices['iPhone SE'], browserName: 'chromium' } },
    { name: 'mobile-390', use: { ...devices['iPhone 13'], browserName: 'chromium' } },
    { name: 'tablet-768', use: { viewport: { width: 768, height: 1024 } } },
    { name: 'desktop-1024', use: { viewport: { width: 1024, height: 900 } } },
    { name: 'desktop-1440', use: { viewport: { width: 1440, height: 900 } } },
  ],
  webServer: {
    command: `"${process.execPath}" node_modules/next/dist/bin/next start -p 3100`,
    url: 'http://127.0.0.1:3100',
    reuseExistingServer: false,
    gracefulShutdown: { signal: 'SIGINT', timeout: 1000 },
    timeout: 120_000,
    env: {
      SUBMISSIONS_BACKEND: 'memory',
      ALLOW_IN_MEMORY_SUBMISSIONS: '1',
      SITE_URL: 'http://127.0.0.1:3100',
    },
  },
});
