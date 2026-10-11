import "exploreda";
// @ts-expect-error The package uses export maps, but this project uses legacy module resolution.
import { chartRegistry as packageRegistry } from "exploreda/core";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { exampleCoverage } from "@/demos/coverage";
import { examples } from "@/demos/examples";
import { catalogue } from "./catalogue";
import { findDocsErrors, type DocsGateInput } from "./gate";
import { PENDING_LIMIT, pendingTargets } from "./pending";
import { allTargets } from "./targets";
import { CHART_SETTING_KEYS } from "exploreda/docs-kit";
import { liveExamples, type LiveExampleSpec } from "./live/examples";
import {
  CHART_SETTINGS,
  COMMON_SETTINGS,
} from "./reference/settingDescriptions";

const chartRegistry = packageRegistry as {
  getAll: () => Array<{ type: string }>;
};

const docsDir = join(__dirname);
const publicDir = join(docsDir, "../../public");

/** Every file under `public/`, as the URL path the site serves it at. */
function publicFiles(dir = publicDir, prefix = ""): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory()
      ? publicFiles(join(dir, entry.name), `${prefix}/${entry.name}`)
      : [`${prefix}/${entry.name}`]
  );
}

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
    assets: existsSync(join(docsDir, "assets"))
      ? readdirSync(join(docsDir, "assets"))
      : [],
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
    liveExamples: Object.fromEntries(
      Object.entries(liveExamples as Record<string, LiveExampleSpec>).map(
        ([id, spec]) => [
          id,
          {
            exampleId: spec.exampleId,
            data: spec.data,
            charts: spec.savedData.charts.map((chart) => chart.id),
            stepCharts: [
              ...spec.steps.flatMap((step) =>
                "brush" in step ? [step.brush.chart] : []
              ),
              ...(spec.surface ? [spec.surface.chart] : []),
            ],
          },
        ]
      )
    ),
    publicFiles: publicFiles(),
    settingKeys: CHART_SETTING_KEYS,
    commonDescriptions: COMMON_SETTINGS,
    chartDescriptions: CHART_SETTINGS,
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
            examples: ["renamed"],
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
    ).toContain(
      'Page "scatter" uses example "scatter-trace", which does not show a scatter chart'
    );
  });

  it("fails for broken links and images inside a page", () => {
    const input = currentInput();
    expect(
      findDocsErrors({
        ...input,
        sources: {
          ...input.sources,
          bar: `import gone from "../assets/gone.png";\n${input.sources.bar}\n<DocsLink topic="pie">Pie</DocsLink> [x](/docs/donut) [y](/examples/nope)`,
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
    const sources = { ...input.sources };
    delete sources.rendering;
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

  it("fails for a missing live example, data file, or step chart", () => {
    const input = currentInput();
    expect(
      findDocsErrors({
        ...input,
        sources: {
          ...input.sources,
          scatter: `${input.sources.scatter}\n<LiveExample id="ghost" />`,
        },
        liveExamples: {
          ...input.liveExamples,
          broken: {
            exampleId: "nope",
            data: "/datasets/gone.csv",
            charts: ["a"],
            stepCharts: ["b"],
          },
        },
      })
    ).toEqual([
      'pages/scatter.mdx uses missing live example "ghost"',
      'Live example "broken" opens unknown example "nope"',
      'Live example "broken" loads missing data "/datasets/gone.csv"',
      'Live example "broken" has a step on missing chart "b"',
    ]);
  });

  it("fails when a chart page has no settings reference", () => {
    const input = currentInput();
    expect(
      findDocsErrors({
        ...input,
        sources: {
          ...input.sources,
          bar: input.sources.bar!.replace("<SettingsReference", "<Removed"),
        },
      })
    ).toContain('Page "bar" has no <SettingsReference type="bar" />');
  });

  it("fails for a new setting without a description, or a stale one", () => {
    const input = currentInput();
    expect(
      findDocsErrors({
        ...input,
        settingKeys: {
          ...input.settingKeys,
          bar: [...input.settingKeys.bar!, "barWidth"],
        },
        chartDescriptions: {
          ...input.chartDescriptions,
          bar: { ...input.chartDescriptions.bar, oldKnob: "Gone." },
        },
      })
    ).toEqual([
      'Setting "bar.barWidth" has no description',
      'Description for "bar.oldKnob", which is not a setting',
    ]);
  });
});
