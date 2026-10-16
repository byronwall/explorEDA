// Authoring tools for the daily data viz collection (apps/demo/public/daily-viz).
// The workflow is in docs/daily-viz.md.
//
// Usage: pnpm daily <command>
//   coverage                 what the collection already covers, and the gaps:
//                            formats, industries, analyses, chart words, marks
//   family <id> <csv>...     start a project folder over one or more CSV files,
//                            including demo datasets under public/datasets
//   new <kind> <family>/<slug> --title "…" --question "…"
//                            add a notebook, composition, or dashboard from a
//                            template and register it in catalog.json
//   check                    compile every piece and recompute every finding
//   schedule                 give each piece without a date the next free day,
//                            ordered so neighboring days differ; --reseed
//                            reorders everything to end on --end (default today)
//   review <slug>...         screenshot pieces at 1280 px and tile them into
//                            tmp/daily-review.png, to look over a batch at once
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";
import { execFileSync } from "node:child_process";
import {
  buildIndex,
  CHART_WORDS,
  MARKS,
  scheduleCatalog,
} from "../apps/demo/dailyCorpus.mjs";

const corpus = path.resolve("apps/demo/public/daily-viz");
const catalogFile = path.join(corpus, "catalog.json");
const datasetsFile = path.join(corpus, "datasets.json");
const templates = path.resolve("scripts/daily-templates");
const KINDS = { notebook: "eda.md", composition: "eda", dashboard: "eda" };
const COMPANIONS = { composition: "design.md", dashboard: "guide.md" };

const writeJson = (file, value) =>
  writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
const readJson = (file) => JSON.parse(readFileSync(file, "utf8"));

function fail(message) {
  console.error(message);
  process.exit(1);
}

function tally(values) {
  const counts = new Map();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts].sort((a, b) => b[1] - a[1]);
}

function table(title, rows, universe = []) {
  console.log(`\n${title}`);
  for (const [name, count] of rows)
    console.log(`  ${String(count).padStart(3)}  ${name}`);
  const unused = universe.filter((name) => !rows.some(([n]) => n === name));
  if (unused.length) console.log(`  none yet: ${unused.join(", ")}`);
}

async function coverage() {
  const { entries } = await buildIndex(corpus);
  console.log(`${entries.length} pieces`);
  table("Formats", tally(entries.map((e) => e.kind)));
  table("Industries", tally(entries.map((e) => e.industry)));
  table("Analyses", tally(entries.map((e) => e.analysis)));
  table("Families", tally(entries.map((e) => e.family)));
  table("Chart words", tally(entries.flatMap((e) => e.charts)), CHART_WORDS);
  table("Composition marks", tally(entries.flatMap((e) => e.marks)), MARKS);
  table("Features", tally(entries.flatMap((e) => e.features)));
  table(
    "Series",
    tally(entries.filter((e) => e.series).map((e) => e.series.title))
  );
}

/** One CSV line's cells, keeping commas inside quotes. */
const cellsOf = (line) =>
  (line.match(/("([^"]|"")*"|[^,]*)(,|$)/g) ?? [])
    .map((cell) => cell.replace(/,$/, "").replace(/^"|"$/g, "").trim())
    .slice(0, -1);

/** Field lines for a CSV header: number, date, or string from its values. */
function fieldLines(text) {
  const [header, ...lines] = text.trimEnd().split("\n").slice(0, 200);
  const names = cellsOf(header);
  const cells = lines.map(cellsOf);
  return names.map((name, i) => {
    const values = cells.map((row) => row[i]?.trim()).filter(Boolean);
    const type = values.every((v) => /^-?\d*\.?\d+(e[-+]?\d+)?$/i.test(v))
      ? "number"
      : values.every((v) => /^\d{4}-\d{2}-\d{2}/.test(v))
        ? "date"
        : "string";
    // A header that is not a plain word is quoted; the id must match it.
    return /^[A-Za-z_]\w*$/.test(name)
      ? `  field ${name} ${type}`
      : `  field "${name}" ${type}`;
  });
}

function family(id, files) {
  if (!id || !files.length) fail("Usage: pnpm daily family <id> <csv>...");
  const folder = path.join(corpus, "projects", id);
  if (existsSync(path.join(folder, "exploreda.eda")))
    fail(`${id} already has a project file.`);
  mkdirSync(folder, { recursive: true });
  const sources = files.map((file) => {
    const absolute = path.resolve(file);
    const relative = path.relative(folder, absolute).split(path.sep).join("/");
    const source = path
      .basename(file)
      .replace(/\.[^.]+$/, "")
      .replace(/\W+/g, "_");
    const text = readFileSync(absolute, "utf8");
    // A first column with a value on every row and no repeats is the key.
    const rows = text
      .trimEnd()
      .split("\n")
      .slice(1)
      .map((line) => cellsOf(line)[0]);
    const key =
      rows.every(Boolean) && new Set(rows).size === rows.length
        ? cellsOf(text.split("\n")[0])[0]
        : undefined;
    return { source, relative, text, key };
  });
  const project = [
    `project @${id}`,
    "",
    ...sources.flatMap(({ source, relative, text, key }) => [
      `source @${source}${key && /^\w+$/.test(key) ? ` key=${key}` : ""} path=${relative} {`,
      ...fieldLines(text),
      "}",
      "",
    ]),
    ...sources.flatMap(({ source }) => [
      `query @${source} "${source}" glyph=◆ {`,
      `  source ${source}`,
      "}",
      "",
    ]),
  ].join("\n");
  writeFileSync(path.join(folder, "exploreda.eda"), project);
  const datasets = readJson(datasetsFile);
  if (!datasets.some((dataset) => dataset.id === id)) {
    datasets.push({
      id,
      title: "TODO: dataset title",
      publisher: "TODO: who published it",
      url: "TODO: source page",
      license: "TODO: license name",
      license_url: "TODO: license page",
      version: "TODO: version or retrieval date",
      notes: "TODO: one or two sentences on coverage, grain, and gaps.",
    });
    writeJson(datasetsFile, datasets);
  }
  console.log(`Wrote projects/${id}/exploreda.eda and a datasets.json record.`);
  console.log("Next: fill in the dataset record, then pnpm daily new …");
}

function fill(template, values) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => values[key] ?? "");
}

function newPiece(kind, target, options) {
  const [familyId, slug] = (target ?? "").split("/");
  if (!KINDS[kind] || !familyId || !slug)
    fail(
      'Usage: pnpm daily new <notebook|composition|dashboard> <family>/<slug> --title "…" --question "…"'
    );
  const folder = path.join(corpus, "projects", familyId);
  if (!existsSync(path.join(folder, "exploreda.eda")))
    fail(`Start the family first: pnpm daily family ${familyId} <csv>...`);
  const catalog = readJson(catalogFile);
  const fullSlug = `${familyId}-${slug}`;
  if (catalog.some((entry) => entry.slug === fullSlug))
    fail(`${fullSlug} is already in the catalogue.`);
  const query =
    options.query ??
    /^query @(\S+)/m.exec(
      readFileSync(path.join(folder, "exploreda.eda"), "utf8")
    )?.[1];
  const values = {
    title: options.title ?? "TODO title",
    question: options.question ?? "TODO question?",
    query,
    id: `${{ notebook: "nb", composition: "cp", dashboard: "db" }[kind]}-${fullSlug}`,
  };
  const entry = `${slug}.${KINDS[kind]}`;
  const files = [[entry, `${kind}.${KINDS[kind]}`]];
  if (COMPANIONS[kind])
    files.push([`${slug}.${COMPANIONS[kind]}`, `${kind}.${COMPANIONS[kind]}`]);
  for (const [file, template] of files) {
    const target = path.join(folder, file);
    if (existsSync(target)) fail(`${file} exists already.`);
    writeFileSync(
      target,
      fill(readFileSync(path.join(templates, template), "utf8"), values)
    );
  }
  catalog.push({
    id: values.id,
    slug: fullSlug,
    kind,
    title: values.title,
    question: values.question,
    summary: "TODO: two sentences on what the reader learns.",
    family: familyId,
    entry,
    ...(COMPANIONS[kind] && { companion: files[1][0] }),
    query,
    industry: options.industry ?? "TODO",
    analysis: options.analysis ?? "TODO",
    findings: [],
  });
  writeJson(catalogFile, catalog);
  console.log(
    `Wrote ${files.map(([f]) => `projects/${familyId}/${f}`).join(", ")}`
  );
  console.log(
    `Registered ${values.id}. Open http://…/daily/${fullSlug} on pnpm dev:agent.`
  );
}

function schedule({ reseed, end }) {
  const today = new Date().toLocaleDateString("en-CA");
  const catalog = scheduleCatalog(readJson(catalogFile), {
    reseed,
    end: end ?? today,
  });
  catalog.sort((a, b) => a.published.localeCompare(b.published));
  writeJson(catalogFile, catalog);
  const upcoming = catalog.filter((entry) => entry.published > today);
  console.log(
    `${catalog.length} pieces from ${catalog[0].published} to ${catalog.at(-1).published}; ${upcoming.length} after today.`
  );
}

async function review(slugs) {
  if (!slugs.length) fail("Usage: pnpm daily review <slug>...");
  const shots = slugs.map((slug) => {
    execFileSync(
      "node",
      [
        "scripts/shot.mjs",
        `/daily/${slug}`,
        "--name",
        `daily-review/${slug}`,
        "--widths",
        "1280",
        "--height",
        "2400",
      ],
      { stdio: "inherit" }
    );
    return path.resolve(`tmp/daily-review/${slug}-1280.png`);
  });
  const { chromium } = await import("playwright");
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 2400, height: 800 },
  });
  const cells = shots
    .map(
      (file) =>
        `<figure><img src="data:image/png;base64,${readFileSync(file).toString("base64")}"><figcaption>${path.basename(file)}</figcaption></figure>`
    )
    .join("");
  await page.setContent(
    `<style>body{margin:0;display:grid;grid-template-columns:repeat(4,1fr);gap:8px;font:14px sans-serif}img{width:100%;height:1100px;object-fit:cover;object-position:top;border:1px solid #ccc}figure{margin:0}</style>${cells}`
  );
  await page.screenshot({ path: "tmp/daily-review.png", fullPage: true });
  await browser.close();
  console.log("Wrote tmp/daily-review.png");
}

const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: {
    title: { type: "string" },
    question: { type: "string" },
    query: { type: "string" },
    industry: { type: "string" },
    analysis: { type: "string" },
    reseed: { type: "boolean" },
    end: { type: "string" },
  },
});
const [command, ...rest] = positionals;
if (command === "coverage") await coverage();
else if (command === "family") family(rest[0], rest.slice(1));
else if (command === "new") newPiece(rest[0], rest[1], values);
else if (command === "review") await review(rest);
else if (command === "schedule") schedule(values);
else if (command === "check")
  execFileSync(
    "pnpm",
    ["--filter", "demo", "exec", "vitest", "run", "src/daily"],
    { stdio: "inherit" }
  );
else fail(readFileSync(new URL(import.meta.url), "utf8").split("\nimport")[0]);
