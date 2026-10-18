import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // CI runs one worker at a time. Locally the default is half the logical
  // cores, which on a 16-thread machine is eight Chromium instances next to a
  // Vite preview server — enough to starve a page that has to fetch a lazily
  // imported chunk, which is how the search dialog ends up showing its empty
  // state and three tests fail for reasons that have nothing to do with search.
  // Capping at four makes a local run take a little longer and pass.
  workers: process.env.CI ? 1 : 4,
  reporter: 'html',
  use: {
    // The app is deployed under /Cosmere-Archive/ (vite base), so the test
    // baseURL has to carry that prefix or every page.goto('/') 404s against the
    // preview server.
    baseURL: 'http://localhost:4173/Cosmere-Archive/',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
  ],
  webServer: {
    command: 'pnpm preview',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
  },
})
