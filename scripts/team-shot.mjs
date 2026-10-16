// Screenshots a team server page at the AGENTS.md widths, signed in as one
// of the sample accounts from `exploreda server --seed-dev` (or
// `EXPLOREDA_DATA=<dir> pnpm --filter app dev`). `pnpm shot` waits for the
// network to go quiet, which a project page's event stream never does.
//
// Usage: pnpm team-shot <path> --base <url> [options]
//   <path>               page path, such as /?project=shop
//   --base <url>         the running team server (required)
//   --as <email>         sign in as this sample account; omit to stay signed out
//   --name <name>        file prefix; saves tmp/<name>-<width>.png (default: team)
//   --wait <loc>         wait for this element before capturing
//   --click <loc>        click before capturing; repeat for several steps
//   --fill <loc>=<text>  fill a field before the clicks; repeat as needed
//   --edit <spec>        after the page loads, save a change as another
//                        account: <email>|<file>|<find>|<replace>
//   --widths <list>      comma-separated widths (default: 1280,783,390)
//   --height <px>        viewport height (default: 900)
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { parseArgs } from "node:util";

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    base: { type: "string" },
    as: { type: "string" },
    name: { type: "string", default: "team" },
    wait: { type: "string" },
    click: { type: "string", multiple: true, default: [] },
    fill: { type: "string", multiple: true, default: [] },
    edit: { type: "string" },
    widths: { type: "string", default: "1280,783,390" },
    height: { type: "string", default: "900" },
  },
});
if (!values.base) {
  console.error("Give the team server's address with --base.");
  process.exit(64);
}
const base = values.base;
const origin = new URL(base).origin;
const PASSWORD = process.env.EXPLOREDA_DEV_PASSWORD ?? "exploreda-dev";
const path = positionals[0] ?? "/";

async function signIn(request, email) {
  const response = await request.post(new URL("/api/session", base).href, {
    headers: { origin },
    data: { email, password: PASSWORD },
  });
  if (!response.ok()) {
    throw new Error(`Couldn't sign in as ${email}: ${response.status()}`);
  }
}

/** Saves a change to a project file as another account. */
async function edit(browser, spec, url) {
  const [email, file, find, replace] = spec.split("|");
  const project = new URL(url).searchParams.get("project");
  const context = await browser.newContext();
  await signIn(context.request, email);
  const address = new URL(
    `/api/projects/${project}/file?path=${encodeURIComponent(file)}`,
    base
  ).href;
  const text = await (await context.request.get(address)).text();
  if (!text.includes(find)) {
    throw new Error(`${file} doesn't contain ${find}`);
  }
  const response = await context.request.put(address, {
    headers: { origin },
    data: text.replace(find, replace),
  });
  if (!response.ok()) {
    throw new Error(`Couldn't save ${file}: ${response.status()}`);
  }
  // Put it back for the next width.
  return async () => {
    await context.request.put(address, { headers: { origin }, data: text });
    await context.close();
  };
}

const browser = await chromium.launch();
mkdirSync("tmp", { recursive: true });
const saved = [];
for (const width of values.widths.split(",").map(Number)) {
  const context = await browser.newContext({
    viewport: { width, height: Number(values.height) },
    deviceScaleFactor: 2,
    reducedMotion: "reduce",
  });
  if (values.as) {
    await signIn(context.request, values.as);
  }
  const page = await context.newPage();
  const url = new URL(path, base).href;
  await page.goto(url);
  for (const step of values.fill) {
    const at = step.indexOf("=");
    await page
      .locator(step.slice(0, at))
      .first()
      .fill(step.slice(at + 1), { timeout: 15_000 });
  }
  for (const step of values.click) {
    await page.locator(step).first().click({ timeout: 15_000 });
  }
  if (values.wait) {
    await page.locator(values.wait).first().waitFor({ timeout: 15_000 });
  }
  let restore;
  if (values.edit) {
    restore = await edit(browser, values.edit, url);
    await page.locator(".app-notice").first().waitFor({ timeout: 15_000 });
  }
  await page.waitForTimeout(800);
  const file = `tmp/${values.name}-${width}.png`;
  await page.screenshot({ path: file });
  saved.push(file);
  await restore?.();
  await context.close();
}
await browser.close();
console.log(saved.join("\n"));
