// Checks chart image export against the screen. For each case it opens a demo
// example, screenshots one chart panel, presses Shift+E on the focused chart,
// and compares the downloaded PNG with the screenshot pixel by pixel. Also
// checks that E puts a PNG on the clipboard.
//
// Usage: pnpm export-proof [--only <name>] [--engine chromium|webkit|firefox]
//   Saves tmp/export-proof/<name>-{screen,export,diff}.png and exits non-zero
//   when a case differs by more than its limit.
//
// Runs one browser and one page at a time; the larger cases build multi-MB
// SVGs, so do not run several engines in parallel.
import * as playwright from "playwright";
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { parseArgs } from "node:util";
import { ensureDevServer } from "./dev.mjs";

const { values } = parseArgs({
  options: {
    only: { type: "string" },
    engine: { type: "string", default: "chromium" },
  },
});

// limit: the share of pixels that may differ, in percent. Antialiasing and
// the omitted header controls account for a few tenths of a percent.
// taller: the export shows the whole chart, so it must be taller than the
// screen; only the part in view is compared. own: the export has its own
// size (a composition artboard), so it is checked for content only.
export const CASES = [
  {
    name: "scatter-dark",
    example: "bubble-scatter",
    title: "Speed, conversion, and trial volume",
    dark: true,
    limit: 1,
    copy: true,
  },
  {
    name: "parallel-coordinates",
    example: "palmer-penguins",
    title: "Four measurements, one line per penguin",
    limit: 1,
  },
  {
    name: "region-map",
    example: "region-map",
    title: "Requests by service district",
    limit: 1,
  },
  {
    name: "row-chart",
    example: "shop-operations",
    title: "Orders by category",
    limit: 1,
    contextMenu: true,
  },
  {
    name: "pivot-full-extent",
    example: "categorical-charts",
    title: "How do category counts vary by subcategory and rating?",
    taller: true,
    // The screen's sticky Total row covers rows the export shows in place.
    limit: 6,
  },
  {
    name: "3d-facets",
    example: "lorenz-3d",
    title: "How do runs trace the attractor?",
    dark: true,
    limit: 1,
  },
  {
    name: "composition",
    example: "covid-compare",
    title: "The last nine months, against three years",
    own: true,
  },
  {
    // Limit guides and the tints past them must come through the export.
    name: "engineering-histogram",
    example: "engineering-histograms",
    title: "Shaft diameter in 0.01 mm bins",
    dark: true,
    limit: 1,
  },
  {
    name: "data-table-scrolled",
    example: "palmer-penguins",
    title: "Selected observations",
    scroll: { selector: ".eda-table-scroll", top: 600 },
    limit: 1,
  },
];

const base = await ensureDevServer({ quiet: true });
const out = "tmp/export-proof";
mkdirSync(out, { recursive: true });

const browser = await playwright[values.engine].launch();
const context = await browser.newContext({
  viewport: { width: 1280, height: 900 },
  deviceScaleFactor: 2,
  reducedMotion: "reduce",
  acceptDownloads: true,
});
if (values.engine === "chromium")
  await context.grantPermissions(["clipboard-read", "clipboard-write"], {
    origin: base,
  });
const page = await context.newPage();
await page.goto(base);
await page.evaluate(() => localStorage.clear());

async function compare(a, b) {
  return page.evaluate(
    async ([a, b]) => {
      const load = (src) =>
        new Promise((resolve, reject) => {
          const image = new Image();
          image.onload = () => resolve(image);
          image.onerror = reject;
          image.src = src;
        });
      const [ia, ib] = await Promise.all([load(a), load(b)]);
      const width = Math.min(ia.width, ib.width);
      const height = Math.min(ia.height, ib.height);
      const pixels = (image) => {
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext("2d");
        context.drawImage(image, 0, 0);
        return context.getImageData(0, 0, width, height);
      };
      const pa = pixels(ia);
      const pb = pixels(ib);
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      const diff = context.createImageData(width, height);
      let bad = 0;
      let plain = 0;
      for (let i = 0; i < pa.data.length; i += 4) {
        const delta =
          Math.abs(pa.data[i] - pb.data[i]) +
          Math.abs(pa.data[i + 1] - pb.data[i + 1]) +
          Math.abs(pa.data[i + 2] - pb.data[i + 2]);
        if (
          pb.data[i] === pb.data[0] &&
          pb.data[i + 1] === pb.data[1] &&
          pb.data[i + 2] === pb.data[2]
        )
          plain++;
        if (delta > 48) {
          bad++;
          diff.data[i] = 255;
        } else {
          diff.data[i] = diff.data[i + 1] = diff.data[i + 2] = pa.data[i] / 4;
        }
        diff.data[i + 3] = 255;
      }
      context.putImageData(diff, 0, 0);
      return {
        sizes: [ia.width, ia.height, ib.width, ib.height],
        mismatch: (100 * bad) / (width * height),
        // Share of the export that is its corner color: near 1 is blank.
        blank: plain / (width * height),
        diff: canvas.toDataURL("image/png"),
      };
    },
    [a, b]
  );
}

const dataUrl = (file) =>
  `data:image/png;base64,${readFileSync(file).toString("base64")}`;

let failed = 0;
for (const item of CASES) {
  if (values.only && item.name !== values.only) continue;
  await page.goto(`${base}/examples/${item.example}`);
  await page.waitForLoadState("networkidle");
  if (item.dark)
    await page.evaluate(() => document.documentElement.classList.add("dark"));
  const panel = page.locator(`.eda-panel:has-text("${item.title}")`).first();
  await panel.waitFor({ timeout: 20_000 });
  // Center it: the workspace status bar sticks over the viewport's bottom.
  await panel.evaluate((node) => node.scrollIntoView({ block: "center" }));
  if (item.scroll)
    await panel
      .locator(item.scroll.selector)
      .first()
      .evaluate((node, top) => (node.scrollTop = top), item.scroll.top);
  await page.mouse.move(2, 2);
  await page.waitForTimeout(800);
  const screen = `${out}/${item.name}-screen.png`;
  await panel.screenshot({ path: screen });

  // Focus the chart without hovering it, as a keyboard user would.
  await panel.evaluate((node) =>
    node.closest("[data-chart-id]")?.focus({ preventScroll: true })
  );
  const download = page.waitForEvent("download", { timeout: 20_000 });
  await page.keyboard.press("Shift+E");
  const file = `${out}/${item.name}-export.png`;
  const saved = await download;
  await saved.saveAs(file);

  const result = await compare(dataUrl(screen), dataUrl(file));
  writeFileSync(
    `${out}/${item.name}-diff.png`,
    Buffer.from(result.diff.split(",")[1], "base64")
  );
  const [sw, sh, ew, eh] = result.sizes;
  const sameSize = sw === ew && sh === eh;
  const ok = item.own
    ? ew > 0 && eh > 0 && result.blank < 0.98
    : item.taller
      ? sw === ew && eh > sh && result.mismatch <= item.limit
      : sameSize && result.mismatch <= item.limit;
  if (!ok) failed++;
  let copied = "";
  if (item.copy && values.engine === "chromium") {
    await page.keyboard.press("e");
    await page.waitForTimeout(1500);
    const bytes = await page.evaluate(async () => {
      const [entry] = await navigator.clipboard.read();
      return (await entry.getType("image/png")).size;
    });
    copied = ` · clipboard PNG ${Math.round(bytes / 1024)} KB`;
    if (!bytes) failed++;
  }
  if (item.contextMenu) {
    // Right-click the plot, then download from the menu that opens there.
    const box = await panel.boundingBox();
    await page.mouse.click(box.x + box.width / 2, box.y + box.height * 0.6, {
      button: "right",
    });
    const fromMenu = page.waitForEvent("download", { timeout: 20_000 });
    await page.getByRole("menuitem", { name: /Download image/ }).click();
    const menuFile = await fromMenu;
    copied += ` · right-click download ${menuFile.suggestedFilename()}`;
  }
  const measure = item.own
    ? `${Math.round(result.blank * 100)}% background`
    : `${result.mismatch.toFixed(2)}% differs (limit ${item.limit}%)`;
  console.log(
    `${ok ? "ok  " : "FAIL"} ${item.name}: ${measure}, ${ew}x${eh}` +
      (sameSize ? "" : ` vs screen ${sw}x${sh}`) +
      ` · ${saved.suggestedFilename()}${copied}`
  );
}
await browser.close();
process.exit(failed ? 1 : 0);
