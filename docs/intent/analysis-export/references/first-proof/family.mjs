// node tmp/proof/family.mjs <base> <example> <panel-title-substring> <name> [--dark] [--plex] [--setup]
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";
const [base, example, title, name, ...flags] = process.argv.slice(2);
const has = (f) => flags.includes(f);
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2, reducedMotion: "reduce" });
const page = await ctx.newPage();
const errors = [];
if (has("--preserve")) await page.addInitScript(() => {
  const orig = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (type, attrs) {
    if (/webgl/.test(type)) attrs = { ...(attrs || {}), preserveDrawingBuffer: true };
    return orig.call(this, type, attrs);
  };
});
page.on("console", (m) => m.type() === "error" && errors.push(m.text().slice(0, 160)));
await page.goto(base); await page.evaluate(() => localStorage.clear());
await page.goto(`${base}/examples/${example}`); await page.waitForLoadState("networkidle");
if (has("--dark")) await page.evaluate(() => document.documentElement.classList.add("dark"));
if (has("--plex")) await page.addStyleTag({ content: `.eda-panel, .eda-panel * { font-family: "IBM Plex Sans", sans-serif !important; }` });
const panel = page.locator(`.eda-panel:has-text("${title}")`).first();
await panel.waitFor({ timeout: 20000 });
await panel.scrollIntoViewIfNeeded();
await page.mouse.move(2, 2);
await page.waitForTimeout(1200);
await page.evaluate(() => document.fonts.ready);
await panel.screenshot({ path: `tmp/proof/${name}-screen.png` });
await page.addScriptTag({ path: "tmp/proof/rasterize.js" });
const result = {};
for (const embedFonts of has("--plex") ? [true, false] : [true]) {
  try {
    const r = await panel.evaluate((el, o) => window.__rasterize(el, o), { embedFonts, expand: has("--expand") });
    writeFileSync(`tmp/proof/${name}-raster${embedFonts ? "" : "-nofonts"}.png`, Buffer.from(r.dataUrl.split(",")[1], "base64"));
    result[embedFonts ? "fonts" : "nofonts"] = { w: r.width, h: r.height, ms: r.ms, svgKB: Math.round(r.svgBytes / 1024) };
  } catch (e) { result.error = String(e).slice(0, 200); }
}
result.dom = await panel.evaluate((el) => {
  const scrollers = [...el.querySelectorAll("*")].filter((n) => n.scrollHeight > n.clientHeight + 4 && /auto|scroll/.test(getComputedStyle(n).overflowY));
  return { canvases: [...el.querySelectorAll("canvas")].map((c) => c.getContext ? (c.dataset.engine || "") + c.width + "x" + c.height : ""), svgs: el.querySelectorAll("svg").length, scrollers: scrollers.map((n) => `${n.className.toString().slice(0, 40)} ${n.clientHeight}/${n.scrollHeight}`) };
});
result.errors = errors;
console.log(name, JSON.stringify(result));
await browser.close();
