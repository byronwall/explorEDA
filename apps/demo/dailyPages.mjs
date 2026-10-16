import { readFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import MarkdownIt from "markdown-it";

const markdown = new MarkdownIt({ html: false });
const escape = (text) =>
  String(text).replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ]
  );

/** Full article text and evidence links remain available before the chart app loads. */
export function dailyHtml(template, entry, text) {
  const url = `https://exploreda.dev/daily/${entry.proposed_slug}`;
  const prose = text
    .replace(
      /^```eda\s*\n[\s\S]*?^```\s*$/gm,
      "\n_Interactive chart available when JavaScript loads._\n"
    )
    .replace(/\]\(([^)]+)\)/g, (match, href) => {
      if (/^(?:[a-z]+:|\/|#)/i.test(href)) return match;
      const target = new URL(
        href,
        `https://exploreda.dev/daily-viz/${entry.entry_path}`
      );
      return `](${target.pathname}${target.hash})`;
    });
  const content = `<main style="max-width:880px;margin:40px auto;padding:0 24px;font:16px/1.6 sans-serif"><a href="/daily">Daily data viz</a>${entry.kind === "notebook" ? "" : `<h1>${escape(entry.title)}</h1>`}${markdown.render(prose)}</main>`;
  return template
    .replace(
      /<title>[\s\S]*?<\/title>/,
      `<title>${escape(entry.title)} · explorEDA</title>\n<meta name="description" content="${escape(entry.description)}">\n<link rel="canonical" href="${url}">\n<meta property="og:title" content="${escape(entry.title)}">\n<meta property="og:description" content="${escape(entry.description)}">\n<meta property="og:url" content="${url}">`
    )
    .replace('<div id="root"></div>', `<div id="root">${content}</div>`);
}

/** Static-host pages expose each article to search engines and non-JavaScript readers. */
export function dailyPages() {
  let root, output;
  return {
    name: "daily-article-pages",
    apply: "build",
    configResolved(config) {
      root = config.root;
      output = path.resolve(root, config.build.outDir);
    },
    async closeBundle() {
      const corpus = path.join(root, "public/daily-viz");
      const entries = JSON.parse(
        await readFile(path.join(corpus, "catalog.json"), "utf8")
      );
      const template = await readFile(path.join(output, "index.html"), "utf8");
      for (const entry of entries) {
        const file =
          entry.kind === "notebook" ? entry.entry_path : entry.companion_path;
        const text = await readFile(path.join(corpus, file), "utf8");
        const dir = path.join(output, "daily", entry.proposed_slug);
        await mkdir(dir, { recursive: true });
        await writeFile(
          path.join(dir, "index.html"),
          dailyHtml(template, { ...entry, entry_path: file }, text)
        );
      }
      const links = entries
        .map(
          (entry) =>
            `<li><a href="/daily/${entry.proposed_slug}">${escape(entry.title)}</a> — ${escape(entry.kind)}</li>`
        )
        .join("\n");
      const index = template
        .replace(
          /<title>[\s\S]*?<\/title>/,
          '<title>Daily data viz · explorEDA</title>\n<meta name="description" content="40 notebooks, 25 compositions, and 10 dashboards over real datasets.">\n<link rel="canonical" href="https://exploreda.dev/daily">'
        )
        .replace(
          '<div id="root"></div>',
          `<div id="root"><main style="max-width:1000px;margin:40px auto;padding:0 24px;font:16px/1.6 sans-serif"><a href="/examples">All examples</a><h1>Daily data viz</h1><p>40 notebooks, 25 compositions, and 10 dashboards over 17 real dataset families.</p><ul>${links}</ul></main></div>`
        );
      await mkdir(path.join(output, "daily"), { recursive: true });
      await writeFile(path.join(output, "daily/index.html"), index);
      const urls = [
        "https://exploreda.dev/",
        "https://exploreda.dev/examples",
        "https://exploreda.dev/daily",
        ...entries.map(
          (entry) => `https://exploreda.dev/daily/${entry.proposed_slug}`
        ),
      ];
      await writeFile(
        path.join(output, "daily-sitemap.xml"),
        `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map((url) => `<url><loc>${url}</loc></url>`).join("")}</urlset>`
      );
    },
  };
}
