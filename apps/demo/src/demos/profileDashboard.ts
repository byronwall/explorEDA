import type { SavedDataStructure } from "exploreda";

type Chart = SavedDataStructure["charts"][number];

// Frame 1 is always handleRequest, so the levels start under it.
const frames = ["Frame 2", "Frame 3", "Frame 4", "Frame 5"];

const shared = {
  field: "",
  xAxis: { scaleType: "linear" as const, grid: false, min: 0, max: 100 },
  yAxis: { scaleType: "linear" as const, grid: false, min: 0, max: 100 },
  margin: { top: 4, right: 4, bottom: 4, left: 4 },
  colorScaleId: undefined,
  colorField: undefined,
  facet: {
    enabled: false,
    type: "wrap" as const,
    rowVariable: "",
    columnCount: 2,
  },
  xAxisLabel: "",
  yAxisLabel: "",
  xGridLines: 5,
  yGridLines: 5,
  filters: [],
};

const hierarchy = (
  id: string,
  title: string,
  arrangement: "icicle" | "treemap",
  layout: Chart["layout"]
): Chart => ({
  ...shared,
  id,
  type: "hierarchy",
  title,
  layout,
  levels: frames,
  aggregation: "sum",
  measureField: "Self ms",
  missingLevels: "omit",
  colorBy: "branch",
  arrangement,
});

// One request's sampled call stacks. An icicle keeps each stack depth in
// its own column, so every frame's label reads and callers sit beside
// their callees; a treemap of four levels squeezes the deepest labels.
export const requestProfileDashboard: SavedDataStructure = {
  charts: [
    hierarchy(
      "profile-icicle",
      "Where does one request spend its 684 ms?",
      "icicle",
      { x: 0, y: 0, w: 12, h: 7 }
    ),
    hierarchy("profile-treemap", "The same stacks as a treemap", "treemap", {
      x: 0,
      y: 7,
      w: 6,
      h: 5,
    }),
    {
      ...shared,
      id: "profile-frames",
      type: "data-table",
      title: "Stacks by time",
      layout: { x: 6, y: 7, w: 6, h: 5 },
      columns: [...frames, "Self ms"].map((field) => ({
        id: field,
        field,
      })),
      sortBy: "Self ms",
      sortDirection: "desc",
      globalSearch: "",
    },
  ],
  calculations: [],
  colorScales: [],
  gridSettings: {
    columnCount: 12,
    rowHeight: 76,
    containerPadding: 0,
    showBackgroundMarkers: false,
  },
  metadata: {
    name: "Request profile",
    version: 1,
    createdAt: "2026-11-11T00:00:00Z",
    modifiedAt: "2026-11-11T00:00:00Z",
  },
};
