#!/usr/bin/env node
// Times real clicks in a demo example: the sum of long tasks after each one,
// and with --profile, the functions that took the time.
// See docs/performance-checks.md#script-a-run.
import { createRequire } from "node:module";
import { writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { parseArgs } from "node:util";

const { values: args } = parseArgs({
  options: {
    url: { type: "string" },
    view: { type: "string" },
    click: { type: "string", multiple: true, default: [] },
    rounds: { type: "string", default: "2" },
    wait: { type: "string", default: "2500" },
    width: { type: "string", default: "1280" },
    profile: { type: "boolean", default: false },
    out: { type: "string", default: "tmp/perf" },
    top: { type: "string", default: "25" },
  },
});

if (!args.url || args.click.length === 0) {
  console.error(`Usage: PLAYWRIGHT_DIR=<dir with playwright installed> node scripts/perf-clicks.mjs \\
  --url http://localhost:5291/examples/january-flights --view "When delays happened" \\
  --click '[data-chart-id="flights-days-band"] rect.chart-mark' \\
  --click '[data-chart-id="flights-daily"] circle.cursor-pointer@10' \\
  --click 'view:Delays carry through' [--profile] [--rounds 2] [--wait 2500]

A click is a CSS selector, optionally @index for the nth match, or view:<tab
name> to switch views. Set CHROME_PATH when Playwright's own browser is not
installed.`);
  process.exit(1);
}

const playwrightDir = resolve(process.env.PLAYWRIGHT_DIR ?? ".");
const { chromium } = createRequire(join(playwrightDir, "noop.js"))(
  "playwright"
);

const browser = await chromium.launch(
  process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}
);
const page = await browser.newPage({
  viewport: { width: Number(args.width), height: 900 },
});
const cdp = await page.context().newCDPSession(page);

async function clickView(name) {
  // View tabs re-render while the workspace settles, so click in the page.
  await page.waitForFunction(
    (name) =>
      [...document.querySelectorAll("button")].some(
        (button) => button.textContent.trim() === name
      ),
    name,
    { timeout: 60_000 }
  );
  await page.evaluate((name) => {
    [...document.querySelectorAll("button")]
      .find((button) => button.textContent.trim() === name)
      .click();
  }, name);
}

async function waitForCharts() {
  await page.waitForSelector("[data-chart-id] svg", { timeout: 60_000 });
  await page.waitForTimeout(2000);
}

await page.goto(args.url);
await waitForCharts();
if (args.view) {
  await clickView(args.view);
  await waitForCharts();
}
await page.evaluate(() => {
  window.__perfTasks = [];
  new PerformanceObserver((list) =>
    list
      .getEntries()
      .forEach((entry) => window.__perfTasks.push(entry.duration))
  ).observe({ type: "longtask" });
});

function summarize(profile) {
  const nodes = new Map(profile.nodes.map((node) => [node.id, node]));
  const parents = new Map();
  for (const node of profile.nodes)
    for (const child of node.children ?? []) parents.set(child, node.id);
  const label = ({ callFrame: frame }) =>
    `${frame.functionName || "(anonymous)"} ${frame.url
      .split("?")[0]
      .split("/")
      .slice(-2)
      .join("/")}:${frame.lineNumber + 1}`;
  const self = new Map();
  const total = new Map();
  profile.samples.forEach((id, index) => {
    const ms = (profile.timeDeltas[index + 1] ?? 0) / 1000;
    const leaf = label(nodes.get(id));
    self.set(leaf, (self.get(leaf) ?? 0) + ms);
    const seen = new Set();
    for (let at = id; at != null; at = parents.get(at)) {
      const name = label(nodes.get(at));
      if (seen.has(name)) continue;
      seen.add(name);
      total.set(name, (total.get(name) ?? 0) + ms);
    }
  });
  const skip = /^\((idle|root|program)\)/;
  const print = (title, map) => {
    console.log(`  ${title}`);
    [...map]
      .filter(([name]) => !skip.test(name))
      .sort((a, b) => b[1] - a[1])
      .slice(0, Number(args.top))
      .forEach(([name, ms]) =>
        console.log(`  ${ms.toFixed(0).padStart(7)} ms  ${name}`)
      );
  };
  print("self time", self);
  print("total time", total);
}

let step = 0;
for (let round = 0; round < Number(args.rounds); round++) {
  for (const click of args.click) {
    const name = `${step++}`;
    const view = click.startsWith("view:") ? click.slice(5) : undefined;
    const [selector, index] = view ? [] : click.split(/@(?=\d+$)/);
    let point;
    if (!view) {
      point = await page.evaluate(
        ([selector, index]) => {
          const element = document.querySelectorAll(selector)[index];
          if (!element) return undefined;
          element.scrollIntoView({ block: "center" });
          const box = element.getBoundingClientRect();
          return [box.x + box.width / 2, box.y + box.height / 2];
        },
        [selector, Number(index ?? 0)]
      );
      if (!point) throw new Error(`Nothing matches ${click}`);
    }
    await page.waitForTimeout(600);
    await page.evaluate(() => (window.__perfTasks = []));
    if (args.profile) {
      await cdp.send("Profiler.enable");
      await cdp.send("Profiler.setSamplingInterval", { interval: 200 });
      await cdp.send("Profiler.start");
    }
    if (view) await clickView(view);
    else await page.mouse.click(...point);
    await page.waitForTimeout(Number(args.wait));
    const tasks = await page.evaluate(() => window.__perfTasks.map(Math.round));
    const sum = tasks.reduce((a, b) => a + b, 0);
    console.log(
      `${name.padStart(2)} ${click.padEnd(60)} ${String(sum).padStart(6)} ms  [${tasks.join(", ")}]`
    );
    if (args.profile) {
      const { profile } = await cdp.send("Profiler.stop");
      const file = resolve(args.out, `click-${name}.cpuprofile`);
      writeFileSync(file, JSON.stringify(profile));
      summarize(profile);
      console.log(`  profile: ${file}`);
    }
  }
}

await browser.close();
