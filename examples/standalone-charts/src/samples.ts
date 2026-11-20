import type { ChartConfig } from "exploreda/chart";

const REGIONS = ["West", "East", "North", "South"];
const PRODUCTS = ["Lamp", "Desk", "Chair"];
const EVENTS = ["visit", "cart", "buy"];

/** A repeatable number in [0, 1) for each seed. */
function random(seed: number) {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * Small fixed rows with a category, numbers, dates, places, and events.
 * The tests and the docs gallery draw every chart type from them.
 */
export const SAMPLE_ROWS = Array.from({ length: 48 }, (_, i) => {
  const noise = random(i);
  const price = Math.round((6 + random(i + 100) * 24) * 100) / 100;
  return {
    // Uneven on purpose, so bars and cells differ.
    Region: REGIONS[Math.floor(random(i + 500) ** 1.6 * 4)]!,
    Product: PRODUCTS[Math.floor(random(i + 600) ** 1.3 * 3)]!,
    Price: price,
    Rating: Math.round((2 + price / 12 + noise * 1.4) * 10) / 10,
    Units: 1 + Math.floor(random(i + 200) * 12),
    Date: `2026-0${1 + (i % 6)}-${String(1 + ((i * 7) % 27)).padStart(2, "0")}`,
    End: `2026-0${1 + (i % 6)}-28`,
    Lat: Math.round((32 + random(i + 300) * 12) * 100) / 100,
    Lon: Math.round((-122 + random(i + 400) * 30) * 100) / 100,
    User: `u${i % 12}`,
    Event: EVENTS[i % 3]!,
  };
});

/** A short config for each registered chart type, over `SAMPLE_ROWS`. */
export const SAMPLE_CONFIGS: Record<string, ChartConfig> = {
  row: { type: "row", field: "Region" },
  bar: { type: "bar", field: "Region" },
  scatter: { type: "scatter", xField: "Price", yField: "Rating" },
  "3d-scatter": {
    type: "3d-scatter",
    xField: "Price",
    yField: "Rating",
    zField: "Units",
  },
  pivot: {
    type: "pivot",
    rowFields: ["Region"],
    columnField: "Product",
    valueFields: [{ field: "Units", aggregation: "sum" }],
  },
  "data-table": {
    type: "data-table",
    columns: [
      { id: "region", field: "Region" },
      { id: "price", field: "Price" },
    ],
  },
  summary: { type: "summary" },
  markdown: {
    type: "markdown",
    content:
      "<p><strong>Notes</strong> sit beside charts. Content is HTML.</p>",
  },
  boxplot: { type: "boxplot", field: "Price", colorField: "Region" },
  "color-legend": { type: "color-legend", fields: ["Region"] },
  line: { type: "line", xField: "Date", seriesField: ["Units"] },
  sankey: { type: "sankey", stages: ["Region", "Product"] },
  hierarchy: { type: "hierarchy", levels: ["Region", "Product"] },
  "parallel-coordinates": {
    type: "parallel-coordinates",
    axes: [
      { field: "Price", inverted: false },
      { field: "Rating", inverted: false },
      { field: "Units", inverted: false },
    ],
  },
  "scatter-matrix": {
    type: "scatter-matrix",
    fields: ["Price", "Rating", "Units"],
  },
  calendar: { type: "calendar", field: "Date" },
  heatmap: { type: "heatmap", field: "Region", columnField: "Product" },
  ecdf: { type: "ecdf", field: "Price" },
  "metric-card": { type: "metric-card", aggregation: "count" },
  map: {
    type: "map",
    mode: "point",
    latitudeField: "Lat",
    longitudeField: "Lon",
  },
  composition: { type: "composition" },
  waterfall: {
    type: "waterfall",
    field: "Product",
    mode: "accumulate",
    measureField: "Units",
  },
  donut: { type: "donut", field: "Region" },
  funnel: {
    type: "funnel",
    field: "Event",
    entityField: "User",
    timeField: "Date",
    steps: ["visit", "cart", "buy"],
  },
  retention: { type: "retention", entityField: "User", timeField: "Date" },
  timeline: {
    type: "timeline",
    field: "Product",
    startField: "Date",
    endField: "End",
  },
  "joint-missingness": {
    type: "joint-missingness",
    fields: ["Price", "Rating"],
  },
};
