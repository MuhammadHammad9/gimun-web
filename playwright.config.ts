import { defineConfig, devices } from '@playwright/test';

const managedServer = process.env.PLAYWRIGHT_MANAGED_SERVER === '1';
// PORT lets two checkouts run the suite side by side without sharing a server.
const port = process.env.PORT || '3100';

export default defineConfig({
  testDir: './tests/browser',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : 1,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://127.0.0.1:${port}`,
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
    // The other projects run in the default light scheme; this one covers the dark theme.
    { name: 'desktop-1440-dark', use: { viewport: { width: 1440, height: 900 }, colorScheme: 'dark' } },
  ],
  webServer: managedServer ? undefined : {
    command: `"${process.execPath}" scripts/playwright-server.cjs`,
    url: `http://127.0.0.1:${port}`,
    reuseExistingServer: true,
    timeout: 120_000,
    env: {
      SUBMISSIONS_BACKEND: 'memory',
      ALLOW_IN_MEMORY_SUBMISSIONS: '1',
      SUBMISSIONS_TEST_MODE: '1',
    },
  },
});
