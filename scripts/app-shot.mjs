// Screenshots the project app (apps/app) at the AGENTS.md widths. Unlike
// `pnpm shot`, it waits for an element rather than network idle, since an
// open project keeps a change stream open.
//
// Usage: node scripts/app-shot.mjs <url> --name <name> [options]
//   --wait <loc>     element to wait for before capturing
//   --click <loc>    click before capturing (after the wait); repeatable
//   --step <step>    an ordered step, repeatable, run after the clicks:
//                    `click:<loc>`, `fill:<loc>::<text>`,
//                    `select:<loc>::<option label>`, or `wait:<loc>`
//   --after <loc>    element to wait for after the clicks and steps
//   --widths <list>  comma-separated widths (default: 1280,783,390)
//   --height <px>    viewport height (default: 820)
//   --full           capture the whole page, not just the viewport
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { parseArgs } from "node:util";

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    name: { type: "string", default: "app" },
    wait: { type: "string" },
    click: { type: "string", multiple: true, default: [] },
    step: { type: "string", multiple: true, default: [] },
    after: { type: "string" },
    widths: { type: "string", default: "1280,783,390" },
    height: { type: "string", default: "820" },
    full: { type: "boolean", default: false },
  },
});
const url = positionals[0];
if (!url) {
  console.error("Give the app's URL, such as http://127.0.0.1:5173/?token=dev");
  process.exit(64);
}
mkdirSync("tmp", { recursive: true });
const browser = await chromium.launch();
const saved = [];
for (const width of values.widths.split(",").map(Number)) {
  const context = await browser.newContext({
    viewport: { width, height: Number(values.height) },
    deviceScaleFactor: 2,
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await page.goto(url);
  if (values.wait)
    await page.locator(values.wait).first().waitFor({ timeout: 20_000 });
  for (const step of values.click) {
    await page.locator(step).first().click({ timeout: 15_000 });
  }
  for (const step of values.step) {
    const [kind, rest] = [
      step.slice(0, step.indexOf(":")),
      step.slice(step.indexOf(":") + 1),
    ];
    if (kind === "click")
      await page.locator(rest).first().click({ timeout: 15_000 });
    else if (kind === "wait")
      await page.locator(rest).first().waitFor({ timeout: 20_000 });
    else if (kind === "fill") {
      const [locator, text] = rest.split("::");
      await page
        .locator(locator)
        .first()
        .fill(text ?? "", { timeout: 15_000 });
    } else if (kind === "select") {
      const [locator, label] = rest.split("::");
      await page
        .locator(locator)
        .first()
        .selectOption({ label }, { timeout: 15_000 });
    } else throw new Error(`Unknown step ${step}`);
  }
  if (values.after)
    await page.locator(values.after).first().waitFor({ timeout: 20_000 });
  await page.waitForTimeout(800);
  const file = `tmp/${values.name}-${width}.png`;
  await page.screenshot({ path: file, fullPage: values.full });
  saved.push(file);
  await context.close();
}
await browser.close();
console.log(saved.join("\n"));
