import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { createServer, type Plugin } from "vite";
import { head } from "./dailyCorpus.mjs";
import { SITE } from "./dailyLinks.mjs";

type Prerender = {
  render: (url: string) => Promise<string>;
  catalogue: readonly { topic: string; title: string; lede: string }[];
  examples: readonly { id: string; title: string; description: string }[];
};

const INDEX_DESCRIPTION =
  "Charts that filter each other, on your own rows. Learn what each view computes and which rows it reads.";

const EXAMPLES_DESCRIPTION =
  "Every example, grouped by kind, each opening as a live workspace you can filter, inspect, and change.";

/**
 * Writes each docs page and the examples index as static HTML, so fetch tools and search engines get
 * the page's text with a 200. The app replaces it when it boots.
 *
 * GitHub Pages serves `docs/bar.html` at `/docs/bar` and redirects a folder
 * to its trailing slash, so each page is a `.html` file. `/docs` gets both
 * `docs.html` and `docs/index.html`, because a `docs/` folder exists too.
 * Each example also gets a `.html` file, so direct links return HTTP 200.
 */
export function docsPrerender(): Plugin {
  let root = "";
  let outDir = "";
  let configFile: string | undefined;
  return {
    name: "docs-prerender",
    apply: "build",
    configResolved(config) {
      root = config.root;
      outDir = path.resolve(root, config.build.outDir);
      configFile = config.configFile;
    },
    async closeBundle() {
      const server = await createServer({
        root,
        configFile,
        // The build runs React in production, so compile JSX for it too.
        mode: "production",
        logLevel: "warn",
        appType: "custom",
        server: { middlewareMode: true, hmr: false, ws: false },
        optimizeDeps: { noDiscovery: true, include: [] },
        // react-router's "node" export is CommonJS; bundle its ESM build.
        ssr: {
          noExternal: [/react-router/],
          resolve: { conditions: ["module", "development|production"] },
        },
      });
      try {
        const { render, catalogue, examples } = (await server.ssrLoadModule(
          "/src/docs/prerender.tsx"
        )) as Prerender;
        const template = await readFile(
          path.join(outDir, "index.html"),
          "utf8"
        );
        const page = async (url: string, title: string, lede: string) =>
          head(template, title, lede, `${SITE}${url}`).replace(
            '<div id="root"></div>',
            `<div id="root">${await render(url)}</div>`
          );
        await mkdir(path.join(outDir, "docs"), { recursive: true });
        const index = await page("/docs", "Docs", INDEX_DESCRIPTION);
        await writeFile(path.join(outDir, "docs.html"), index);
        await writeFile(path.join(outDir, "docs/index.html"), index);
        for (const { topic, title, lede } of catalogue) {
          await writeFile(
            path.join(outDir, "docs", `${topic}.html`),
            await page(`/docs/${topic}`, title, lede)
          );
        }
        await mkdir(path.join(outDir, "examples"), { recursive: true });
        for (const { id, title, description } of examples) {
          await writeFile(
            path.join(outDir, "examples", `${id}.html`),
            await page(`/examples/${id}`, title, description)
          );
        }
        const exampleIndex = await page(
          "/examples",
          "All examples",
          EXAMPLES_DESCRIPTION
        );
        await writeFile(path.join(outDir, "examples.html"), exampleIndex);
        await writeFile(path.join(outDir, "examples/index.html"), exampleIndex);
      } finally {
        await server.close();
      }
    },
  };
}
