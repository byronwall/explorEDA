// Screenshots a demo page at the AGENTS.md widths for PRs and visual checks.
// Starts this checkout's dev server when needed (see scripts/dev.mjs), starts
// from empty localStorage, and saves 2x PNGs under tmp/.
//
// Usage: pnpm shot <path> [options]
//   <path>               page path, such as /examples/shop-operations
//   --name <name>        file prefix; saves tmp/<name>-<width>.png (default: shot)
//   --selector <loc>     element to capture; default is the whole viewport
//   --click <loc>        click before capturing; repeat for several steps.
//                        Prefix `hover:` to hover instead, or `press:` to press a
//                        key such as `press:s`, for controls that show on hover.
//   --wait <loc>         wait for this element before capturing
//   --widths <list>      comma-separated widths (default: 1280,783,390)
//   --height <px>        viewport height (default: 900)
//   --keep-storage       keep saved workspaces instead of clearing localStorage
//   --base <url>         use another server instead of this checkout's
//   --eval <js>          after the steps, run this in the page at each width
//                        and print `<width>: <JSON result>`. An expression,
//                        or a body with `return`; `await` works. Repeatable.
//   --clipped            print text cut off inside --selector (or the page):
//                        elements whose content overflows a box that hides
//                        it, plus any horizontal page overflow
//   --no-shot            skip the screenshot; use with --eval or --clipped
//
// <loc> is a Playwright selector: CSS, `text=Explore the order book`, or
// `role=button[name="Explore the order book"]`. The first match is used.
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { parseArgs } from "node:util";
import { ensureDevServer } from "./dev.mjs";

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    name: { type: "string", default: "shot" },
    selector: { type: "string" },
    click: { type: "string", multiple: true, default: [] },
    wait: { type: "string" },
    widths: { type: "string", default: "1280,783,390" },
    height: { type: "string", default: "900" },
    "keep-storage": { type: "boolean", default: false },
    base: { type: "string" },
    eval: { type: "string", multiple: true, default: [] },
    clipped: { type: "boolean", default: false },
    "no-shot": { type: "boolean", default: false },
  },
});
const path = positionals[0] ?? "/";

/** Runs in the page: leaf text that a box with hidden overflow cuts off. */
function clippedText(selector) {
  const scope = selector ? document.querySelector(selector) : document.body;
  if (!scope) return { error: `No element matches ${selector}` };
  const clipped = [];
  for (const element of scope.querySelectorAll("*")) {
    // Screen-reader-only text sits in a 1 px box on purpose.
    if (
      !element.textContent?.trim() ||
      element.children.length > 0 ||
      element.clientWidth <= 1
    )
      continue;
    const style = getComputedStyle(element);
    const hides = [style.overflowX, style.textOverflow].some((value) =>
      ["hidden", "clip", "ellipsis"].includes(value)
    );
    if (hides && element.scrollWidth > element.clientWidth + 1)
      clipped.push({
        text: element.textContent.trim().slice(0, 60),
        shown: element.clientWidth,
        needs: element.scrollWidth,
      });
  }
  const pageOverflow =
    document.documentElement.scrollWidth - document.documentElement.clientWidth;
  return { pageOverflow, clipped: clipped.slice(0, 20) };
}
const base = values.base ?? (await ensureDevServer());

let browser;
try {
  browser = await chromium.launch();
} catch (error) {
  console.error(
    `${error.message.split("\n")[0]}\nRun: pnpm exec playwright install chromium-headless-shell`
  );
  process.exit(1);
}

mkdirSync("tmp", { recursive: true });
const saved = [];
for (const width of values.widths.split(",").map(Number)) {
  const context = await browser.newContext({
    viewport: { width, height: Number(values.height) },
    deviceScaleFactor: 2,
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  if (!values["keep-storage"]) {
    await page.goto(base);
    await page.evaluate(() => localStorage.clear());
  }
  await page.goto(new URL(path, base).href);
  await page.waitForLoadState("networkidle");
  for (const step of values.click) {
    if (step.startsWith("press:")) await page.keyboard.press(step.slice(6));
    else if (step.startsWith("hover:"))
      await page.locator(step.slice(6)).first().hover({ timeout: 15_000 });
    else await page.locator(step).first().click({ timeout: 15_000 });
    await page.waitForLoadState("networkidle");
  }
  if (values.wait)
    await page.locator(values.wait).first().waitFor({ timeout: 15_000 });
  await page.waitForLoadState("networkidle");
  for (const code of values.eval) {
    const body = /\breturn\b/.test(code) ? code : `return (${code});`;
    const result = await page.evaluate(`(async () => { ${body} })()`);
    console.log(`${width}: ${JSON.stringify(result)}`);
  }
  if (values.clipped) {
    const report = await page.evaluate(clippedText, values.selector ?? null);
    console.log(`${width}: ${JSON.stringify(report)}`);
  }
  if (values["no-shot"]) {
    await context.close();
    continue;
  }
  const file = `tmp/${values.name}-${width}.png`;
  if (values.selector) {
    // The chart grid re-mounts panels after it measures its width, so a
    // located panel can detach mid-capture. Locate it again and retry.
    const target = page.locator(values.selector).first();
    for (let attempt = 1; ; attempt++) {
      try {
        await target.waitFor({ state: "visible", timeout: 15_000 });
        await page.waitForTimeout(300);
        await target.scrollIntoViewIfNeeded({ timeout: 5_000 });
        await target.screenshot({ path: file, timeout: 5_000 });
        break;
      } catch (error) {
        if (attempt === 3) throw error;
      }
    }
  } else {
    await page.screenshot({ path: file });
  }
  saved.push(file);
  await context.close();
}
await browser.close();
if (saved.length) console.log(saved.join("\n"));
