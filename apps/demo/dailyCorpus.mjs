// The daily data viz corpus: one authored catalogue plus the files each piece
// names. Everything else the site needs (paths, chart types, related pieces,
// table sizes, static pages, the sitemap) is derived here, so an author edits
// `catalog.json` and the piece's own files and nothing else.
import { readFile, mkdir, writeFile } from "node:fs/promises";
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

/** Chart words, composition marks, and options a piece's text uses. */
export function describeText(text) {
  const charts = new Set();
  const marks = new Set();
  const features = new Set();
  let depth = 0;
  let block = "";
  for (const raw of text.split("\n")) {
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
  return { charts: [...charts], marks: [...marks], features: [...features] };
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
      return {
        ...entry,
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
  const prose = corpusLinks(text, entry.textPath).replace(
    /^```eda\s*\n[\s\S]*?^```\s*$/gm,
    "\n_Interactive chart available when JavaScript loads._\n"
  );
  const title =
    entry.kind === "notebook" ? "" : `<h1>${escape(entry.title)}</h1>`;
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
