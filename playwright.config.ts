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
    browserName: 'chromium',
    // Playwright's Windows trace recorder can lose its temporary recording
    // file while closing a failed Chrome context. CI still retains the
    // required traces/screenshots; local runs stay deterministic and quiet.
    trace: process.env.CI ? 'retain-on-failure' : 'off',
    screenshot: process.env.CI ? 'only-on-failure' : 'off',
  },
  projects: [
    { name: 'mobile-375', use: { ...devices['iPhone SE'], browserName: 'chromium' } },
    { name: 'mobile-390', use: { ...devices['iPhone 13'], browserName: 'chromium' } },
    { name: 'tablet-768', use: { viewport: { width: 768, height: 1024 } } },
    { name: 'desktop-1024', use: { viewport: { width: 1024, height: 900 } } },
    { name: 'desktop-1440', use: { viewport: { width: 1440, height: 900 } } },
  ],
  webServer: {
    command: `"${process.execPath}" scripts/playwright-server.cjs`,
    url: 'http://127.0.0.1:3100',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      SUBMISSIONS_BACKEND: 'memory',
      ALLOW_IN_MEMORY_SUBMISSIONS: '1',
      SUBMISSIONS_TEST_MODE: '1',
      SITE_URL: 'http://127.0.0.1:3100',
    },
  },
});
