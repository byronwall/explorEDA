import { expect, test } from "@playwright/test";
import { expectImagesLoad, recordErrors, topics } from "./docs";

test("/docs links every page and shows its thumbnails", async ({ page }) => {
  const errors = recordErrors(page);
  await page.goto("/docs");
  await expect(page.locator("h1")).toBeVisible();

  const links = await page
    .locator('main a[href^="/docs/"]')
    .evaluateAll((nodes) =>
      nodes.map((node) => (node.getAttribute("href") ?? "").split("#")[0])
    );
  expect
    .soft([...new Set(links)].sort(), "pages the index links to")
    .toEqual(topics.map((topic) => `/docs/${topic}`));

  await expectImagesLoad(page.locator("main article img"), "/docs thumbnail");
  expect.soft(errors, "console errors on /docs").toEqual([]);
});
