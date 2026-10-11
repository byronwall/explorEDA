import { shopDashboard } from "@/demos/dashboardSettings";
import type { SavedDataStructure } from "exploreda";

/**
 * One scripted step. The docs browser check runs a page's steps against its
 * live example, so a claim tied to a step fails the deploy when it stops
 * being true.
 */
export type LiveStep =
  /** Drag across a chart's numeric X axis from one value to another. */
  | { brush: { chart: string; from: number; to: number } }
  /** The workspace row count after the steps so far. */
  | { expectRows: number }
  /** A filter chip whose text contains this, after the steps so far. */
  | { expectChip: string };

export type LiveExampleSpec = {
  /** The workspace region's accessible name. */
  label: string;
  /** A CSV under `public/`, such as `/datasets/shop-operations.csv`. */
  data: string;
  savedData: SavedDataStructure;
  /** The example to open in full, from `demos/examples.ts`. */
  exampleId: string;
  /** Alt text for the screenshot shown on narrow screens. */
  shotAlt: string;
  steps: readonly LiveStep[];
};

type Placement = readonly [x: number, y: number, w: number, h: number];

/**
 * Below 960px the workspace grid flows charts two to a row, and a chart
 * wider than half the grid takes a whole row. Docs columns are narrower than
 * that, so live examples place charts at most six columns wide.
 */
const MAX_WIDTH = 6;

/**
 * A dashboard narrowed to some of its charts, each placed again. The charts
 * keep every other setting, so the docs show the same views the example does.
 */
function focus(
  source: SavedDataStructure,
  charts: Readonly<Record<string, Placement>>
): SavedDataStructure {
  const picked = Object.entries(charts).map(([id, [x, y, w, h]]) => {
    const chart = source.charts.find((item) => item.id === id);
    if (!chart) {
      throw new Error(`Live example: no chart "${id}" in the source layout`);
    }
    if (w > MAX_WIDTH) {
      throw new Error(`Live example: chart "${id}" is wider than ${MAX_WIDTH}`);
    }
    return { ...chart, layout: { x, y, w, h } };
  });
  return { ...source, charts: picked };
}

export const liveExamples = {
  "bar-histogram": {
    label: "Live delivery-time histogram",
    data: "/datasets/shop-operations.csv",
    savedData: focus(shopDashboard, {
      "shop-delivery": [0, 0, 6, 5],
      "shop-channel": [6, 0, 6, 5],
    }),
    exampleId: "shop-operations",
    shotAlt:
      "A histogram of delivery days beside a bar chart of orders by sales channel.",
    steps: [
      { expectRows: 500 },
      { brush: { chart: "shop-delivery", from: 2, to: 4 } },
      { expectChip: "Delivery Days: 1.5–4.5" },
      { expectRows: 265 },
    ],
  },
} satisfies Record<string, LiveExampleSpec>;

/** Height that fits a layout's grid rows plus the workspace toolbar and count. */
export function liveExampleHeight(spec: LiveExampleSpec) {
  const rows = Math.max(
    ...spec.savedData.charts.map(({ layout }) => layout.y + layout.h)
  );
  const rowHeight = spec.savedData.gridSettings.rowHeight;
  return rows * (rowHeight + 10) + 70;
}

/** A step as an instruction for the reader. */
export function describeStep(spec: LiveExampleSpec, step: LiveStep): string {
  if ("brush" in step) {
    const chart = spec.savedData.charts.find(
      ({ id }) => id === step.brush.chart
    );
    return `Drag across “${chart?.title ?? step.brush.chart}” from ${step.brush.from} to ${step.brush.to}.`;
  }
  if ("expectChip" in step) {
    return `The filter reads “${step.expectChip}”.`;
  }
  return `The workspace shows ${step.expectRows.toLocaleString("en-US")} rows.`;
}

export type LiveExampleId = keyof typeof liveExamples;

export function findLiveExample(id: string): LiveExampleSpec | undefined {
  return (liveExamples as Record<string, LiveExampleSpec>)[id];
}
