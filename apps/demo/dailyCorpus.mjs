// The daily data viz corpus: one authored catalogue plus the files each piece
// names. Everything else the site needs (paths, chart types, related pieces,
// table sizes, static pages, the sitemap) is derived here, so an author edits
// `catalog.json` and the piece's own files and nothing else.
import { access, readFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import MarkdownIt from "markdown-it";
import { CORPUS_URL, SITE, corpusLinks } from "./dailyLinks.mjs";

/** Chart words in the dashboard text language (`DSL_CHART_KEYWORDS`). */
export const CHART_WORDS = [
  "scatter",
  "hist",
  "bar",
  "row",
  "metric",
  "table",
  "summary",
  "composition",
  "boxplot",
  "calendar",
  "ecdf",
  "heatmap",
  "line",
  "pivot",
  "parallel",
  "sankey",
  "hierarchy",
  "markdown",
  "map",
];

/** Composition marks (`composition.ts`). */
export const MARKS = [
  "point",
  "path",
  "band",
  "summary",
  "density",
  "strip",
  "stack",
  "waffle",
  "bar",
  "span",
  "horizon",
  "waterfall",
  "donut",
];
const ELEMENTS = ["legend", "note", "callout", "guide", "rule"];
const NOT_CHARTS = new Set(["eda", "dashboard", "grid", "project", "source"]);

const ANNOTATIONS = ["rule", "band", "callout", "label", "region"];

/**
 * Chart words, composition marks, and options a piece's text uses, and how
 * many sheets a notebook has: its `#` headings outside fenced blocks, when
 * there are two or more (one is the title).
 */
export function describeText(text) {
  const charts = new Set();
  const marks = new Set();
  const features = new Set();
  let depth = 0;
  let block = "";
  let fenced = false;
  let headings = 0;
  for (const raw of text.split("\n")) {
    if (/^\s*(```|~~~)/.test(raw)) fenced = !fenced;
    if (!fenced && /^#\s+\S/.test(raw)) headings++;
    const line = raw.trim();
    const head = /^([a-z]+)\b/.exec(line)?.[1];
    if (
      depth === 0 &&
      head &&
      /^[a-z]+ @/.test(line) &&
      !NOT_CHARTS.has(head)
    ) {
      charts.add(head === "histogram" ? "hist" : head);
      block = head;
    }
    if (block !== "composition" && /\bfacet\.(type|enabled)=/.test(line))
      features.add("facet");
    if (depth > 0 && head) {
      if (block !== "composition") {
        if (ANNOTATIONS.includes(head)) features.add("annotation");
      } else if (MARKS.includes(head)) marks.add(head);
      else if (ELEMENTS.includes(head))
        features.add(head === "rule" ? "guide" : head);
      else if (head === "repeat") features.add("repeat");
    }
    depth += (line.match(/\{/g) ?? []).length;
    depth -= (line.match(/\}/g) ?? []).length;
  }
  return {
    charts: [...charts],
    marks: [...marks],
    features: [...features],
    sheets: headings >= 2 ? headings : 0,
  };
}

const DAY = 86_400_000;
const isoDay = (time) => new Date(time).toISOString().slice(0, 10);
const dayTime = (day) => Date.parse(`${day}T00:00:00Z`);

/**
 * How much a piece would repeat what the last few days published: the same
 * dataset within a week, industry within three days, analysis within two, or
 * format the day before. Lower is more varied.
 */
function repetition(entry, recent) {
  let cost = 0;
  recent.forEach((other, index) => {
    const gap = recent.length - index;
    if (gap <= 7 && other.family === entry.family) cost += 8 / gap;
    if (gap <= 3 && other.industry === entry.industry) cost += 4 / gap;
    if (gap <= 2 && other.analysis === entry.analysis) cost += 2 / gap;
    if (gap === 1 && other.kind === entry.kind) cost += 1;
  });
  return cost;
}

/**
 * Orders pieces one per day so neighbors differ and each dataset's pieces
 * spread evenly across the run, keeping series parts in order. Ties go to
 * catalogue order, so the result is deterministic.
 */
export function releaseOrder(entries, history = []) {
  const pending = [...entries];
  const placed = [...history];
  // How far into the run a dataset's or format's next piece would ideally
  // fall, so each spreads evenly instead of bunching at one end.
  const total = new Map();
  const done = new Map();
  const keys = (entry) => [`family:${entry.family}`, `kind:${entry.kind}`];
  const weight = { family: 12, kind: 30 };
  for (const entry of entries)
    for (const key of keys(entry)) total.set(key, (total.get(key) ?? 0) + 1);
  const due = (entry) =>
    keys(entry).map((key) => ((done.get(key) ?? 0) + 0.5) / total.get(key));
  const order = [];
  while (pending.length) {
    const ready = pending.filter(
      (entry) =>
        !entry.series ||
        !pending.some(
          (other) =>
            other.series?.id === entry.series.id &&
            other.series.part < entry.series.part
        )
    );
    const recent = placed.slice(-7);
    const progress = order.length / entries.length;
    const score = (entry) =>
      repetition(entry, recent) +
      due(entry).reduce(
        (sum, at, index) =>
          sum + (index ? weight.kind : weight.family) * (at - progress),
        0
      );
    let best = ready[0];
    for (const entry of ready) if (score(entry) < score(best)) best = entry;
    pending.splice(pending.indexOf(best), 1);
    placed.push(best);
    order.push(best);
    for (const key of keys(best)) done.set(key, (done.get(key) ?? 0) + 1);
  }
  return order;
}

/**
 * Gives each unscheduled piece the next free day after the latest one, in a
 * varied order. With `reseed`, every piece is reordered so the last lands on
 * `end`, which is how the collection was first back-filled.
 */
export function scheduleCatalog(catalog, { reseed = false, end } = {}) {
  const dated = reseed ? [] : catalog.filter((entry) => entry.published);
  const undated = reseed
    ? catalog
    : catalog.filter((entry) => !entry.published);
  const history = [...dated].sort((a, b) =>
    a.published.localeCompare(b.published)
  );
  const order = releaseOrder(undated, history);
  const last = history.at(-1)?.published;
  const first = reseed
    ? dayTime(end) - (order.length - 1) * DAY
    : Math.max(last ? dayTime(last) + DAY : 0, dayTime(end));
  order.forEach((entry, index) => {
    entry.published = isoDay(first + index * DAY);
  });
  return catalog;
}

const sourcePattern = /^source @(\w+)(?: key=\S+)? path=(\S+)/gm;

/** Related pieces: other formats of the same data first, then its series. */
function relatedIds(entry, entries) {
  const score = (other) =>
    (other.series && other.series === entry.series ? 2 : 0) +
    (other.family === entry.family ? 1 : 0) +
    (other.kind !== entry.kind ? 0.5 : 0);
  return entries
    .filter((other) => other.id !== entry.id && score(other) >= 1)
    .sort((a, b) => score(b) - score(a))
    .slice(0, 6)
    .map((other) => other.id);
}

async function readText(file) {
  return readFile(file, "utf8");
}

/** Reads the catalogue and the files it names into the site's index. */
export async function buildIndex(corpusDir) {
  const catalog = JSON.parse(
    await readText(path.join(corpusDir, "catalog.json"))
  );
  const datasets = JSON.parse(
    await readText(path.join(corpusDir, "datasets.json"))
  );
  const tables = {};
  for (const family of new Set(catalog.map((entry) => entry.family))) {
    const folder = path.join(corpusDir, "projects", family);
    const project = await readText(path.join(folder, "exploreda.eda"));
    tables[family] = await Promise.all(
      [...project.matchAll(sourcePattern)].map(async ([, id, file]) => {
        const text = await readText(path.join(folder, file));
        return {
          id,
          path: path.posix.join("projects", family, file),
          rows: text.trimEnd().split("\n").length - 1,
        };
      })
    );
  }
  const entries = await Promise.all(
    catalog.map(async (entry) => {
      const folder = `projects/${entry.family}`;
      const text = await readText(path.join(corpusDir, folder, entry.entry));
      const thumb = `thumbs/${entry.slug}.webp`;
      const hasThumb = await access(path.join(corpusDir, thumb)).then(
        () => true,
        () => false
      );
      return {
        ...entry,
        ...(hasThumb && { thumb }),
        entryPath: `${folder}/${entry.entry}`,
        projectPath: `${folder}/exploreda.eda`,
        ...(entry.companion && {
          companionPath: `${folder}/${entry.companion}`,
        }),
        ...describeText(text),
      };
    })
  );
  for (const entry of entries) entry.related = relatedIds(entry, entries);
  return { entries, datasets, tables };
}

const markdown = new MarkdownIt({ html: false });
const escape = (text) =>
  String(text).replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ]
  );

function head(template, title, description, url) {
  return template.replace(
    /<title>[\s\S]*?<\/title>/,
    `<title>${escape(title)} · explorEDA</title>\n<meta name="description" content="${escape(description)}">\n<link rel="canonical" href="${url}">\n<meta property="og:title" content="${escape(title)}">\n<meta property="og:description" content="${escape(description)}">\n<meta property="og:url" content="${url}">`
  );
}

const shell = (body) =>
  `<main style="max-width:880px;margin:40px auto;padding:0 24px;font:16px/1.6 sans-serif">${body}</main>`;

/** One article's text and links, readable before the chart app loads. */
export function dailyHtml(template, entry, text) {
  const url = `${SITE}/daily/${entry.slug}`;
  const prose = corpusLinks(text, entry.textPath)
    .replace(
      /^```eda\s*\n[\s\S]*?^```\s*$/gm,
      "\n_Interactive chart available when JavaScript loads._\n"
    )
    // Live findings fill in when the notebook loads; their records links
    // need it too.
    .replace(/\{\{\s*[\w-]+\s*\}\}/g, "(live value)")
    .replace(/\[([^\]]*)\]\(#finding:[\w-]+\)/g, "$1");
  // A notebook with one title carries it; a book's headings name its sheets.
  const title =
    entry.kind === "notebook" && /^# /.test(text)
      ? ""
      : `<h1>${escape(entry.title)}</h1>`;
  return head(template, entry.title, entry.summary, url).replace(
    '<div id="root"></div>',
    `<div id="root">${shell(`<a href="/daily">Daily data viz</a>${title}${markdown.render(prose)}`)}</div>`
  );
}

/** Serves the derived index in dev, and writes it with static pages on build. */
export function dailyCorpus() {
  let root;
  let output;
  const corpusDir = () => path.join(root, "public", CORPUS_URL);
  return {
    name: "daily-corpus",
    configResolved(config) {
      root = config.root;
      output = path.resolve(root, config.build.outDir);
    },
    configureServer(server) {
      server.middlewares.use(`${CORPUS_URL}/index.json`, (_req, res, next) => {
        buildIndex(corpusDir())
          .then((index) => {
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(index));
          })
          .catch(next);
      });
    },
    async closeBundle() {
      if (!output) return;
      const index = await buildIndex(corpusDir());
      await writeFile(
        path.join(output, CORPUS_URL, "index.json"),
        JSON.stringify(index)
      );
      // Later pieces ship in the index and appear on their day; only the
      // ones out by build day get static pages and sitemap entries.
      const today = new Date().toLocaleDateString("en-CA");
      index.entries = index.entries
        .filter((entry) => entry.published <= today)
        .sort((a, b) => b.published.localeCompare(a.published));
      const template = await readText(path.join(output, "index.html"));
      for (const entry of index.entries) {
        const textPath =
          entry.kind === "notebook" ? entry.entryPath : entry.companionPath;
        const text = await readText(path.join(corpusDir(), textPath));
        const dir = path.join(output, "daily", entry.slug);
        await mkdir(dir, { recursive: true });
        await writeFile(
          path.join(dir, "index.html"),
          dailyHtml(template, { ...entry, textPath }, text)
        );
      }
      const links = index.entries
        .map(
          (entry) =>
            `<li><a href="/daily/${entry.slug}">${escape(entry.title)}</a> — ${escape(entry.kind)}</li>`
        )
        .join("\n");
      const description = `${index.entries.length} notebooks, compositions, and dashboards over real datasets.`;
      await writeFile(
        path.join(output, "daily/index.html"),
        head(template, "Daily data viz", description, `${SITE}/daily`).replace(
          '<div id="root"></div>',
          `<div id="root">${shell(`<a href="/examples">All examples</a><h1>Daily data viz</h1><p>${escape(description)}</p><ul>${links}</ul>`)}</div>`
        )
      );
      const urls = [
        `${SITE}/`,
        `${SITE}/examples`,
        `${SITE}/daily`,
        ...index.entries.map((entry) => `${SITE}/daily/${entry.slug}`),
      ];
      await writeFile(
        path.join(output, "daily-sitemap.xml"),
        `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map((url) => `<url><loc>${url}</loc></url>`).join("")}</urlset>`
      );
    },
  };
}
