#!/usr/bin/env node
// The docs browser check. Serves the built demo, then for every docs page:
// loads it without errors, mounts each live example and runs its scripted
// steps, screenshots each example for narrow screens, and checks that the
// page has no horizontal overflow at 783 and 390 px. Any failure exits 1,
// which stops the Pages deploy before upload.
//
//   pnpm --filter demo build && pnpm --filter demo docs:verify
//
// Options: --out <dir> (screenshots; default dist/docs-shots), --port <n>.
// DOCS_VERIFY=warn reports failures without failing. DOCS_CHROMIUM_PATH uses
// an installed Chromium instead of Playwright's download.
import { mkdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { parseArgs } from "node:util";
import { chromium } from "playwright";
import { preview } from "vite";

const demoDir = resolve(import.meta.dirname, "..");
const { values: args } = parseArgs({
  options: {
    out: { type: "string", default: join(demoDir, "dist/docs-shots") },
    port: { type: "string", default: "5399" },
  },
});
const shotsDir = resolve(demoDir, args.out);
mkdirSync(shotsDir, { recursive: true });

const failures = [];
const fail = (where, message) => failures.push(`${where}: ${message}`);

const server = await preview({
  root: demoDir,
  logLevel: "warn",
  preview: { port: Number(args.port), strictPort: true },
});
const base = `http://localhost:${args.port}`;
const browser = await chromium.launch({
  executablePath: process.env.DOCS_CHROMIUM_PATH || undefined,
});

/** A page that records console errors and uncaught exceptions. */
async function openPage(width, height) {
  const page = await browser.newPage({
    viewport: { width, height },
    deviceScaleFactor: 2,
  });
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  return { page, errors };
}

/** Waits for a live workspace, or a live surface, to finish loading. */
async function waitForWorkspace(page, id) {
  await page
    .locator(
      `[data-docs-live="${id}"] .eda-row-count, [data-docs-live="${id}"] [data-docs-surface]`
    )
    .first()
    .waitFor({ timeout: 30_000 });
}

async function rowCount(page, id) {
  const text = await page
    .locator(`[data-docs-live="${id}"] .eda-row-count strong`)
    .first()
    .textContent();
  return Number((text ?? "").replace(/,/g, ""));
}

/** Retries a check briefly, since a filter settles over a frame or two. */
async function settle(check) {
  let last;
  for (let attempt = 0; attempt < 20; attempt += 1) {
    last = await check();
    if (last === true) return true;
    await new Promise((done) => setTimeout(done, 150));
  }
  return last;
}

async function brush(page, id, { chart, from, to }) {
  const panel = page.locator(
    `[data-docs-live="${id}"] [data-chart-id="${chart}"]`
  );
  const axis = panel.locator('g[data-axis-edit="x"]').first();
  const scaleType = await axis.getAttribute("data-scale-type");
  if (scaleType !== "linear") {
    throw new Error(`brush needs a linear X axis, found ${scaleType}`);
  }
  const [d0, d1] = (await axis.getAttribute("data-domain"))
    .split(",")
    .map(Number);
  const strip = await axis.locator("rect.eda-axis-strip").boundingBox();
  const yStrip = await panel
    .locator('g[data-axis-edit="y"] rect.eda-axis-strip')
    .first()
    .boundingBox();
  if (!strip || !yStrip)
    throw new Error(`chart "${chart}" has no numeric axes`);
  const x = (value) => strip.x + ((value - d0) / (d1 - d0)) * strip.width;
  const y = yStrip.y + yStrip.height / 2;
  await page.mouse.move(x(from), y);
  await page.mouse.down();
  await page.mouse.move(x(to), y, { steps: 8 });
  await page.mouse.up();
}

async function runSteps(page, where, id, steps) {
  for (const [index, step] of steps.entries()) {
    const at = `${where} step ${index + 1}`;
    try {
      if ("brush" in step) {
        await brush(page, id, step.brush);
      } else if ("expectRows" in step) {
        const ok = await settle(
          async () => (await rowCount(page, id)) === step.expectRows
        );
        if (ok !== true) {
          fail(
            at,
            `expected ${step.expectRows} rows, saw ${await rowCount(page, id)}`
          );
        }
      } else if ("select" in step) {
        await page
          .locator(`[data-docs-live="${id}"]`)
          .getByLabel(step.select.label, { exact: true })
          .selectOption({ label: step.select.option });
      } else if ("expectText" in step) {
        const region = page.locator(`[data-docs-live="${id}"]`);
        const ok = await settle(async () =>
          ((await region.textContent()) ?? "").includes(step.expectText)
        );
        if (ok !== true) fail(at, `no text "${step.expectText}" in the example`);
      } else if ("click" in step) {
        await page
          .locator(`[data-docs-live="${id}"]`)
          .getByLabel(step.click, { exact: true })
          .first()
          .click();
      } else if ("expectMark" in step) {
        const mark = page
          .locator(`[data-docs-live="${id}"]`)
          .getByLabel(step.expectMark, { exact: true });
        const ok = await settle(async () => (await mark.count()) > 0);
        if (ok !== true) fail(at, `no mark named "${step.expectMark}"`);
      } else if ("expectChip" in step) {
        const chips = page.locator(
          `[data-docs-live="${id}"] .eda-filter-chips`
        );
        const ok = await settle(async () =>
          ((await chips.textContent().catch(() => "")) ?? "").includes(
            step.expectChip
          )
        );
        if (ok !== true) {
          const seen = (await chips.textContent().catch(() => "")) || "none";
          fail(
            at,
            `no filter chip containing "${step.expectChip}"; chips: ${seen}`
          );
        }
      } else {
        fail(at, `unknown step ${JSON.stringify(step)}`);
      }
    } catch (error) {
      fail(at, error.message);
    }
  }
}

// Every page the index links to.
const { page: indexPage, errors: indexErrors } = await openPage(1280, 900);
await indexPage.goto(`${base}/docs`);
await indexPage.locator("h1").waitFor();
const topics = [
  ...new Set(
    await indexPage
      .locator('main a[href^="/docs/"]')
      .evaluateAll((links) => links.map((link) => link.getAttribute("href")))
  ),
];
for (const error of indexErrors) fail("/docs", `console error: ${error}`);
await indexPage.close();
if (topics.length === 0) fail("/docs", "the index links to no pages");

const exampleIds = new Set();
for (const path of topics) {
  const { page, errors } = await openPage(1280, 900);
  await page.goto(`${base}${path}`);
  await page.locator("article h2").first().waitFor({ timeout: 15_000 });
  const examples = await page
    .locator("[data-docs-example]")
    .evaluateAll((nodes) =>
      nodes.map((node) => ({
        id: node.getAttribute("data-docs-example"),
        steps: JSON.parse(node.getAttribute("data-docs-steps") ?? "[]"),
      }))
    );
  for (const { id, steps } of examples) {
    exampleIds.add(id);
    const where = `${path} example "${id}"`;
    await page.locator(`[data-docs-example="${id}"]`).scrollIntoViewIfNeeded();
    try {
      await waitForWorkspace(page, id);
    } catch {
      fail(where, "the live workspace did not load");
      continue;
    }
    await runSteps(page, where, id, steps);
  }
  for (const error of errors) fail(path, `console error: ${error}`);
  await page.close();
}

// Screenshots of each example, which narrow screens show instead.
for (const id of exampleIds) {
  const { page, errors } = await openPage(1132, 900);
  await page.goto(`${base}/docs/_capture/${id}`);
  try {
    await waitForWorkspace(page, id);
    await page.waitForTimeout(500);
    await page
      .locator(`[data-docs-live="${id}"]`)
      .screenshot({ path: join(shotsDir, `example-${id}.png`) });
  } catch (error) {
    fail(`capture "${id}"`, error.message);
  }
  for (const error of errors)
    fail(`capture "${id}"`, `console error: ${error}`);
  await page.close();
}

// The index shows each page's live example screenshot.
{
  const { page } = await openPage(1280, 900);
  await page.goto(`${base}/docs`);
  await page.locator("h1").waitFor();
  const broken = await page.locator("main article img").evaluateAll((images) =>
    Promise.all(
      images.map(async (image) => {
        await image.decode().catch(() => undefined);
        return image.naturalWidth === 0 ? image.getAttribute("src") : null;
      })
    ).then((sources) => sources.filter(Boolean))
  );
  for (const src of broken) fail("/docs", `thumbnail ${src} did not load`);
  await page.close();
}

// Narrow widths: no overflow, and screenshots in place of live examples.
for (const width of [783, 390]) {
  for (const path of topics) {
    const { page } = await openPage(width, 900);
    await page.goto(`${base}${path}`);
    await page.locator("article h2").first().waitFor({ timeout: 15_000 });
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth
    );
    if (overflow > 0)
      fail(`${path} at ${width}px`, `${overflow}px horizontal overflow`);
    const broken = await page
      .locator("[data-docs-example] img")
      .evaluateAll((images) =>
        Promise.all(
          images.map(async (image) => {
            image.scrollIntoView();
            await image.decode().catch(() => undefined);
            return image.naturalWidth === 0 ? image.getAttribute("src") : null;
          })
        ).then((sources) => sources.filter(Boolean))
      );
    for (const src of broken)
      fail(`${path} at ${width}px`, `screenshot ${src} did not load`);
    await page.close();
  }
}

await browser.close();
await new Promise((done) => server.httpServer.close(done));

const checked = `${topics.length} pages, ${exampleIds.size} live examples`;
if (failures.length === 0) {
  console.log(`Docs check passed: ${checked}.`);
} else {
  console.error(`Docs check failed (${checked}):\n- ${failures.join("\n- ")}`);
  if (process.env.DOCS_VERIFY === "warn") {
    console.error("DOCS_VERIFY=warn: reporting only.");
  } else {
    process.exit(1);
  }
}
