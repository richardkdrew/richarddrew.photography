import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration for E2E Tests
 *
 * Runs E2E tests that require real browser rendering (layout calculations, etc.)
 * These tests complement Vitest unit tests which use JSDOM.
 *
 * Usage:
 * - npm run test:e2e (headless)
 * - npm run test:e2e:headed (with browser UI)
 * - npm run test:e2e:debug (debug mode)
 */

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: '**/*.spec.ts',

  // Run tests in parallel
  fullyParallel: true,

  // Fail build on CI if tests were accidentally committed with .only
  forbidOnly: !!process.env.CI,

  // Retry failed tests once on CI
  retries: process.env.CI ? 1 : 0,

  // Workers: 1 on CI (consistent), default locally
  workers: process.env.CI ? 1 : undefined,

  // Reporter: detailed locally, GitHub Actions format in CI
  reporter: process.env.CI
    ? [['github'], ['html', { open: 'never' }]]
    : [['html'], ['list']],

  // Shared test settings
  use: {
    // Base URL for tests
    baseURL: 'http://localhost:3000',

    // Collect trace on failure for debugging
    trace: 'on-first-retry',

    // Screenshot on failure
    screenshot: 'only-on-failure',

    // Video on failure (helpful for debugging CI issues)
    video: 'retain-on-failure',
  },

  // Configure projects for different browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Uncomment to test in Firefox/Safari:
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    // Mobile viewports
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
  ],

  // Web Server: Start dev server before running tests
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000, // 2 minutes
  },
});
