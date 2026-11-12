import { mkdirSync, renameSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "@playwright/test";
import {
  expectImagesLoad,
  liveExample,
  recordErrors,
  runStep,
  shotsDir,
  topics,
  waitForWorkspace,
  type DocsStep,
} from "./docs";

mkdirSync(shotsDir, { recursive: true });

for (const topic of topics) {
  const path = `/docs/${topic}`;

  test(path, async ({ browser, page }) => {
    const errors = recordErrors(page);
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(path);
    await expect(page.locator("article h2").first()).toBeVisible();

    const examples = await page
      .locator("[data-docs-example]")
      .evaluateAll((nodes) =>
        nodes.map((node) => ({
          id: node.getAttribute("data-docs-example") ?? "",
          steps: JSON.parse(node.getAttribute("data-docs-steps") ?? "[]"),
        }))
      );

    for (const { id, steps } of examples) {
      await test.step(`example "${id}"`, async () => {
        await page
          .locator(`[data-docs-example="${id}"]`)
          .scrollIntoViewIfNeeded();
        await waitForWorkspace(page, id);
        for (const [index, step] of (steps as DocsStep[]).entries()) {
          await test.step(`step ${index + 1}: ${Object.keys(step)[0]}`, () =>
            runStep(page, id, step));
        }
      });
    }
    expect.soft(errors, `console errors on ${path}`).toEqual([]);

    // The screenshot narrow screens show in place of each live example.
    for (const { id } of examples) {
      await test.step(`capture "${id}"`, async () => {
        const capture = await browser.newPage({
          viewport: { width: 1132, height: 900 },
          deviceScaleFactor: 2,
        });
        const captureErrors = recordErrors(capture);
        try {
          await capture.goto(`/docs/_capture/${id}`);
          await waitForWorkspace(capture, id);
          await capture.waitForTimeout(500);
          const image = await liveExample(capture, id).screenshot({
            animations: "disabled",
          });
          // Two pages can show one example; a rename keeps each write whole.
          const file = join(shotsDir, `example-${id}.png`);
          writeFileSync(`${file}.${test.info().workerIndex}`, image);
          renameSync(`${file}.${test.info().workerIndex}`, file);
          expect
            .soft(captureErrors, `console errors capturing ${id}`)
            .toEqual([]);
        } finally {
          await capture.close();
        }
      });
    }

    // The index thumbnail: one chart from the page's example, drawn in a
    // narrow column so it fills its card, without its panel border. A
    // faceted chart stops after its first facet. With no chart to crop (a
    // notebook), it is the whole example.
    const article = page.locator("article.docs-article");
    const thumb = await article.getAttribute("data-docs-thumb");
    if (thumb) {
      const chart = await article.getAttribute("data-docs-thumb-chart");
      await test.step(`thumbnail from "${thumb}"`, async () => {
        const capture = await browser.newPage({
          viewport: { width: 1132, height: 900 },
          deviceScaleFactor: 2,
        });
        try {
          await capture.goto(`/docs/_capture/${thumb}`);
          await capture.addStyleTag({
            content: `main[data-docs-capture] { width: 600px; }
              .eda-panel { border: 0; border-radius: 0; }`,
          });
          await waitForWorkspace(capture, thumb);
          await capture.waitForTimeout(500);
          const target = chart
            ? liveExample(capture, thumb).locator(
                `[data-chart-id="${chart}"] .eda-panel`
              )
            : liveExample(capture, thumb);
          const clip = await target.evaluate((node) => {
            const box = node.getBoundingClientRect();
            const facet = node.querySelector(".grid > .rounded-md");
            const bottom = facet
              ? facet.getBoundingClientRect().bottom + 8
              : box.bottom;
            return {
              x: box.left + window.scrollX,
              y: box.top + window.scrollY,
              width: box.width,
              height: bottom - box.top,
            };
          });
          const image = await capture.screenshot({
            clip,
            fullPage: true,
            animations: "disabled",
          });
          writeFileSync(join(shotsDir, `thumb-${topic}.png`), image);
        } finally {
          await capture.close();
        }
      });
    }

    // Narrow widths: no overflow, and the screenshots load.
    for (const width of [783, 390]) {
      await test.step(`${width}px`, async () => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(path);
        await expect(page.locator("article h2").first()).toBeVisible();
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - window.innerWidth
        );
        expect
          .soft(overflow, `horizontal overflow at ${width}px`)
          .toBeLessThanOrEqual(0);
        await expectImagesLoad(
          page.locator("[data-docs-example] img"),
          `${path} at ${width}px`
        );
      });
    }
  });
}
