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

/** Waits for a live workspace, or a live surface, to finish loading. */
export async function waitForWorkspace(page: Page, id: string) {
  await expect(
    liveExample(page, id)
      .locator(".eda-row-count, [data-docs-surface], .eda-notebook-output")
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

export type DocsStep =
  | { brush: { chart: string; from: number; to: number } }
  | { expectRows: number }
  | { select: { label: string; option: string } }
  | { choose: string }
  | { link: string }
  | { expectPopover: string }
  | { expectText: string }
  | { click: string }
  | { expectMark: string }
  | { expectChip: string };

async function rowCount(page: Page, id: string) {
  const text = await liveExample(page, id)
    .locator(".eda-row-count strong")
    .first()
    .textContent();
  return Number((text ?? "").replace(/,/g, ""));
}

async function brush(
  page: Page,
  id: string,
  { chart, from, to }: { chart: string; from: number; to: number }
) {
  const panel = liveExample(page, id).locator(`[data-chart-id="${chart}"]`);
  const axis = panel.locator('g[data-axis-edit="x"]').first();
  const scaleType = await axis.getAttribute("data-scale-type");
  expect(scaleType, "brush needs a linear X axis").toBe("linear");
  const [d0 = NaN, d1 = NaN] = ((await axis.getAttribute("data-domain")) ?? "")
    .split(",")
    .map(Number);
  const strip = await axis.locator("rect.eda-axis-strip").boundingBox();
  const yStrip = await panel
    .locator('g[data-axis-edit="y"] rect.eda-axis-strip')
    .first()
    .boundingBox();
  if (!strip || !yStrip) {
    throw new Error(`chart "${chart}" has no numeric axes`);
  }
  const x = (value: number) =>
    strip.x + ((value - d0) / (d1 - d0)) * strip.width;
  const y = yStrip.y + yStrip.height / 2;
  await page.mouse.move(x(from), y);
  await page.mouse.down();
  await page.mouse.move(x(to), y, { steps: 8 });
  await page.mouse.up();
}

/** Runs one scripted step from a live example's `data-docs-steps`. */
export async function runStep(page: Page, id: string, step: DocsStep) {
  const region = liveExample(page, id);
  if ("brush" in step) {
    await brush(page, id, step.brush);
  } else if ("expectRows" in step) {
    await expect.soft
      .poll(() => rowCount(page, id), { message: "row count" })
      .toBe(step.expectRows);
  } else if ("select" in step) {
    await region
      .getByLabel(step.select.label, { exact: true })
      .selectOption({ label: step.select.option });
  } else if ("choose" in step) {
    await page
      .getByRole("menuitem", { name: step.choose, exact: true })
      .click();
  } else if ("link" in step) {
    await region.getByRole("link", { name: step.link, exact: true }).click();
  } else if ("expectPopover" in step) {
    await expect
      .soft(page.locator('[data-slot="popover-content"]'))
      .toContainText(step.expectPopover);
  } else if ("expectText" in step) {
    await expect.soft(region).toContainText(step.expectText);
  } else if ("click" in step) {
    const target = region.getByLabel(step.click, { exact: true }).first();
    // Chart header controls sit under the panel header until hovered;
    // focus and Enter reach them as a keyboard user would.
    await target.click({ timeout: 3_000 }).catch(async () => {
      await target.focus();
      await page.keyboard.press("Enter");
    });
  } else if ("expectMark" in step) {
    await expect
      .soft(region.getByLabel(step.expectMark, { exact: true }).first())
      .toBeAttached();
  } else if ("expectChip" in step) {
    await expect
      .soft(region.locator(".eda-filter-chips"))
      .toContainText(step.expectChip);
  } else {
    throw new Error(`unknown step ${JSON.stringify(step)}`);
  }
}
