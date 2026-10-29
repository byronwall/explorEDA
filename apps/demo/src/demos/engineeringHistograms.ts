import type { SavedDataStructure } from "exploreda";
import { histogram } from "./dashboardSettings";

type Chart = SavedDataStructure["charts"][number];

const FIELD = "Diameter (mm)";

const chartBase = {
  colorField: undefined,
  colorScaleId: undefined,
  margin: { top: 16, right: 24, bottom: 44, left: 62 },
  facet: {
    enabled: false,
    type: "wrap" as const,
    rowVariable: "",
    columnCount: 2,
  },
  xAxisLabel: "",
  yAxisLabel: "",
  xGridLines: 5,
  yGridLines: 4,
  filters: [],
};

/**
 * Shaft diameters in 0.01 mm bins from 11.94 to 12.08: the edges are saved,
 * so a refresh or a filter elsewhere never moves them, and two parts past
 * 12.08 count in the upper tail instead of stretching the bins.
 */
export const diameterHistogram: Chart = {
  ...histogram(
    "diameter-bins",
    "Shaft diameter in 0.01 mm bins",
    FIELD,
    { x: 0, y: 0, w: 8, h: 5 },
    "Diameter (mm)"
  ),
  histogram: {
    binning: {
      mode: "width",
      width: 0.01,
      origin: 0,
      firstIndex: 1194,
      lastIndex: 1208,
    },
  },
};

const machineRows: Chart = {
  ...chartBase,
  id: "diameter-machines",
  type: "row",
  title: "Parts by machine",
  field: "Machine",
  layout: { x: 8, y: 0, w: 4, h: 5 },
  minRowHeight: 28,
  maxRowHeight: 40,
  xAxisLabel: "Parts",
  xAxis: { grid: true },
  yAxis: { grid: false },
};

const partRecords: Chart = {
  ...chartBase,
  id: "diameter-records",
  type: "data-table",
  title: "Measured parts",
  field: "",
  layout: { x: 0, y: 5, w: 12, h: 4 },
  xAxis: { grid: false },
  yAxis: { grid: false },
  columns: ["Part", "Machine", "Shift", FIELD].map((field) => ({
    id: field,
    field,
  })),
  sortDirection: "asc",
  globalSearch: "",
};

export const engineeringHistogramsDashboard: SavedDataStructure = {
  charts: [diameterHistogram, machineRows, partRecords],
  calculations: [],
  colorScales: [],
  fieldSettings: { [FIELD]: { type: "numeric" } },
  gridSettings: {
    columnCount: 12,
    rowHeight: 76,
    containerPadding: 0,
    showBackgroundMarkers: false,
  },
  metadata: {
    name: "Shaft diameters in saved bins",
    version: 1,
    createdAt: "2026-10-28T00:00:00Z",
    modifiedAt: "2026-10-28T00:00:00Z",
  },
};
