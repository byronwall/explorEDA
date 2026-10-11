import "exploreda";
// @ts-expect-error The package uses export maps, but this project uses legacy module resolution.
import { chartRegistry as packageRegistry } from "exploreda/core";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { exampleCoverage } from "@/demos/coverage";
import { examples } from "@/demos/examples";
import { catalogue } from "./catalogue";
import { findDocsErrors, type DocsGateInput } from "./gate";
import { PENDING_LIMIT, pendingTargets } from "./pending";
import { allTargets } from "./targets";

const chartRegistry = packageRegistry as {
  getAll: () => Array<{ type: string }>;
};

const docsDir = join(__dirname);

function currentInput(): DocsGateInput {
  const pageFiles = readdirSync(join(docsDir, "pages")).filter((file) =>
    file.endsWith(".mdx")
  );
  return {
    pages: catalogue,
    sources: Object.fromEntries(
      pageFiles.map((file) => [
        file.replace(/\.mdx$/, ""),
        readFileSync(join(docsDir, "pages", file), "utf8"),
      ])
    ),
    assets: readdirSync(join(docsDir, "assets")),
    targets: allTargets(chartRegistry.getAll().map(({ type }) => type)),
    pending: pendingTargets,
    pendingLimit: PENDING_LIMIT,
    exampleIds: examples.map(({ id }) => id),
    exampleFeatures: Object.fromEntries(
      exampleCoverage.map(({ exampleId, features }) => [
        exampleId,
        Object.keys(features),
      ])
    ),
  };
}

describe("docs gate", () => {
  it("finds no missing, broken, or stale docs", () => {
    expect(findDocsErrors(currentInput())).toEqual([]);
  });

  it("fails for a registered chart type without a page", () => {
    const input = currentInput();
    expect(
      findDocsErrors({ ...input, targets: [...input.targets, "chart:waffle"] })
    ).toEqual(['No page covers "chart:waffle"']);
  });

  it("fails for a renamed example or a page link that goes nowhere", () => {
    const input = currentInput();
    const [scatter, ...rest] = input.pages;
    expect(
      findDocsErrors({
        ...input,
        pages: [
          {
            ...scatter!,
            examples: [{ id: "renamed", heading: "", meta: "", label: "" }],
            related: ["nowhere"],
          },
          ...rest,
        ],
      })
    ).toEqual([
      'Page "scatter" links to missing page "nowhere"',
      'Page "scatter" uses unknown example "renamed"',
    ]);
  });

  it("fails for an example that does not show the page's chart", () => {
    const input = currentInput();
    expect(
      findDocsErrors({
        ...input,
        exampleFeatures: { ...input.exampleFeatures, "scatter-trace": [] },
      })
    ).toEqual([
      'Page "scatter" uses example "scatter-trace", which does not show a scatter chart',
    ]);
  });

  it("fails for broken links and images inside a page", () => {
    const input = currentInput();
    expect(
      findDocsErrors({
        ...input,
        sources: {
          ...input.sources,
          bar: `import gone from "../assets/gone.png";\n<DocsLink topic="pie">Pie</DocsLink> [x](/docs/donut) [y](/examples/nope)`,
        },
      })
    ).toEqual([
      'pages/bar.mdx links to missing page "pie"',
      'pages/bar.mdx links to missing page "donut"',
      'pages/bar.mdx links to unknown example "nope"',
      'pages/bar.mdx imports missing image "gone.png"',
    ]);
  });

  it("fails for a page file without a catalogue entry, or the reverse", () => {
    const input = currentInput();
    const { rendering: _rendering, ...sources } = input.sources;
    expect(
      findDocsErrors({ ...input, sources: { ...sources, stray: "" } })
    ).toEqual([
      'Page "rendering" has no pages/rendering.mdx',
      "pages/stray.mdx has no catalogue entry",
    ]);
  });

  it("only lets the pending list shrink", () => {
    const input = currentInput();
    expect(
      findDocsErrors({
        ...input,
        pending: [...input.pending, "chart:scatter"],
        pendingLimit: input.pendingLimit + 1,
      })
    ).toEqual(['"chart:scatter" has a page; remove it from pendingTargets']);
    expect(
      findDocsErrors({ ...input, pending: input.pending.slice(1) })
    ).toEqual([
      `No page covers "${input.pending[0]}"`,
      `pendingTargets has ${input.pending.length - 1} entries; lower PENDING_LIMIT to ${input.pending.length - 1}`,
    ]);
  });
});
