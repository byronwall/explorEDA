import { readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { expect, type Locator, type Page } from "@playwright/test";

const demoDir = resolve(import.meta.dirname, "..");

/** Every docs topic. The docs gate keeps these files and the catalogue equal. */
export const topics = readdirSync(join(demoDir, "src/docs/pages"))
  .filter((file) => file.endsWith(".mdx"))
  .map((file) => file.replace(/\.mdx$/, ""))
  .sort();

export const shotsDir = resolve(
  demoDir,
  process.env.DOCS_SHOTS_DIR ?? "dist/docs-shots"
);

/** Collects console errors and uncaught exceptions from a page. */
export function recordErrors(page: Page) {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") {
      errors.push(message.text());
    }
  });
  page.on("pageerror", (error) => errors.push(error.message));
  return errors;
}

export function liveExample(page: Page, id: string) {
  return page.locator(`[data-docs-live="${id}"]`);
}

/**
 * Waits for a live workspace, or a live surface, to finish loading. Most
 * examples hide the workspace status bar, so wait for a chart panel.
 */
export async function waitForWorkspace(page: Page, id: string) {
  await expect(
    liveExample(page, id)
      .locator(".eda-panel, [data-docs-surface], .eda-notebook-output")
      .first()
  ).toBeVisible();
}

/** Checks that every image under `images` loads. */
export async function expectImagesLoad(images: Locator, where: string) {
  for (const image of await images.all()) {
    const src = await image.getAttribute("src");
    await image.scrollIntoViewIfNeeded();
    await expect.soft
      .poll(
        () =>
          image.evaluate(
            (node: HTMLImageElement) => node.complete && node.naturalWidth > 0
          ),
        { message: `${where}: ${src} loads` }
      )
      .toBe(true);
  }
}
