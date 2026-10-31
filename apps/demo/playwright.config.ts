import { defineConfig } from "@playwright/test";
import { testTiming } from "@repo/test-config";

// The docs browser check: every docs page, its live examples and their
// scripted steps, the screenshots narrow screens show, and overflow at narrow
// widths. It serves the built demo, so build first:
//
//   pnpm --filter demo build && pnpm --filter demo docs:verify
//
// DOCS_SHOTS_DIR moves the screenshots (default dist/docs-shots).
// DOCS_CHROMIUM_PATH uses an installed Chromium instead of Playwright's.
const port = Number(process.env.DOCS_VERIFY_PORT ?? 5399);
const baseURL = `http://localhost:${port}`;
const onCI = Boolean(process.env.CI);

export default defineConfig({
  testDir: "./e2e",
  testMatch: /\.e2e\.ts$/,
  outputDir: "./test-results",
  timeout: testTiming.browserTestMs,
  globalTimeout: testTiming.browserRunMs,
  expect: { timeout: testTiming.waitMs },
  retries: testTiming.browserRetries,
  fullyParallel: true,
  forbidOnly: onCI,
  reporter: onCI ? [["list"], ["github"]] : [["list"]],
  use: {
    baseURL,
    actionTimeout: testTiming.browserActionMs,
    navigationTimeout: testTiming.browserActionMs,
    deviceScaleFactor: 2,
    trace: "retain-on-failure",
    launchOptions: {
      executablePath: process.env.DOCS_CHROMIUM_PATH || undefined,
    },
  },
  webServer: {
    command: `vite preview --port ${port} --strictPort`,
    url: `${baseURL}/docs`,
    reuseExistingServer: !onCI,
    timeout: testTiming.browserActionMs * 3,
  },
  projects: [
    // Each page writes its examples' screenshots, so the index, which shows
    // them as thumbnails, runs after every page.
    { name: "pages", testMatch: /pages\.e2e\.ts$/ },
    { name: "index", testMatch: /index\.e2e\.ts$/, dependencies: ["pages"] },
    // Opening a project folder, the same files `npx exploreda` writes.
    { name: "folder", testMatch: /folder\.e2e\.ts$/ },
    // One category selection through bar, cards, table, CSV, undo, and a
    // reopened save (docs/intent/current-analysis-trust).
    { name: "trust", testMatch: /trust\.e2e\.ts$/ },
    { name: "daily", testMatch: /daily-findings\.e2e\.ts$/ },
  ],
});
