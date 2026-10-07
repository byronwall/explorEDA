import { beforeAll, describe, expect, it } from "vitest";
import { chartRegistry } from "@/charts/registry";
import { registerAllCharts } from "@/charts/registerAllCharts";
import type { SavedDataStructure } from "@/types/SavedDataStructure";
import type { SavedChartSettings } from "@/types/SavedDataTypes";
import { compileDocument } from "./compile";
import { exportDocument } from "./export";
import {
  CHART_SETTING_KEYS,
  DASHBOARD_COVERAGE,
  FIELD_SETTING_WORDS,
  GRID_SETTING_WORDS,
} from "./settingKeys";

const rows = [
  {
    Region: "East",
    Channel: "Web",
    Revenue: 100,
    Cost: 60,
    Day: "2024-01-02",
    Lat: 40.7,
    Lon: -74,
  },
  {
    Region: "West",
    Channel: "Store",
    Revenue: 50,
    Cost: 20,
    Day: "2024-02-11",
    Lat: 34,
    Lon: -118.2,
  },
  {
    Region: "East",
    Channel: "Store",
    Revenue: 75,
    Cost: 30,
    Day: "2024-03-05",
    Lat: 41.9,
    Lon: -87.6,
  },
];

/** A field each chart type can start from. */
const FIELDS: Record<string, string> = {
  calendar: "Day",
  "metric-card": "Revenue",
};

/** Fields a type needs beyond its defaults before it can draw. */
const COMPLETE: Record<string, Record<string, unknown>> = {
  "3d-scatter": { xField: "Revenue", yField: "Cost", zField: "Lat" },
  pivot: {
    rowFields: ["Region"],
    columnField: "Channel",
    valueFields: [{ field: "Revenue", aggregation: "sum" }],
  },
  "data-table": { columns: [{ id: "Revenue", field: "Revenue" }] },
  line: { xField: "Day", seriesField: ["Revenue", "Cost"] },
  sankey: { stages: ["Region", "Channel"] },
  "parallel-coordinates": {
    axes: [
      { field: "Revenue", inverted: false },
      { field: "Cost", inverted: true },
    ],
  },
  heatmap: { columnField: "Channel" },
  map: { latitudeField: "Lat", longitudeField: "Lon" },
};

beforeAll(() => registerAllCharts());

function defaults(type: string): SavedChartSettings {
  const definition = chartRegistry.get(type as never)!;
  const settings = definition.createDefaultSettings(
    { x: 0, y: 0, w: 6, h: 4 },
    FIELDS[type] ?? "Region"
  );
  // Saved settings are plain JSON, such as the 3D camera as { x, y, z }.
  return JSON.parse(
    JSON.stringify({
      ...settings,
      ...COMPLETE[type],
      id: `c_${type.replace(/\W/g, "_")}`,
    })
  );
}

/** Changes every plain top-level setting, so the text must carry each one. */
function edited(chart: SavedChartSettings): SavedChartSettings {
  const next = structuredClone(chart) as unknown as Record<string, unknown>;
  for (const [key, value] of Object.entries(next)) {
    if (key === "id" || key === "type" || key === "layout") {
      continue;
    }
    if (typeof value === "boolean") {
      next[key] = !value;
    } else if (typeof value === "number") {
      // Halve a fraction such as an opacity, so it stays in range.
      next[key] = value > 0 && value <= 1 ? value / 2 : value + 1;
    }
  }
  next.title = `Edited ${chart.type}`;
  return next as unknown as SavedChartSettings;
}

function dashboard(charts: SavedChartSettings[]): SavedDataStructure {
  return {
    charts,
    calculations: [{ resultColumnName: "margin", expression: "Revenue-Cost" }],
    gridSettings: {
      columnCount: 10,
      rowHeight: 80,
      containerPadding: 4,
      showBackgroundMarkers: false,
    },
    metadata: { name: "Coverage", version: 1, createdAt: "", modifiedAt: "" },
    colorScales: [],
    fieldSettings: {
      Revenue: {
        label: "Rev",
        description: "Order revenue",
        format: "currency",
        precision: 1,
        unit: "k",
        currency: "EUR",
      },
      Day: { type: "datetime", datePreset: "iso", nullTokens: ["n/a", "-"] },
    },
  };
}

function roundTrip(settings: SavedDataStructure) {
  const { text, omitted } = exportDocument(settings, { rows });
  const rebuilt = compileDocument(text, { rows }).settings;
  return { text, omitted, rebuilt };
}

const chartTypes = () => chartRegistry.getAll().map((item) => item.type);

describe("dashboard text coverage", () => {
  it("lists the settings of every registered chart type", () => {
    expect([...chartTypes()].sort()).toEqual(
      Object.keys(CHART_SETTING_KEYS).sort()
    );
    for (const type of chartTypes()) {
      const listed = new Set([
        "id",
        "type",
        ...CHART_SETTING_KEYS[type as keyof typeof CHART_SETTING_KEYS],
      ]);
      // A default the types don't declare would still be lost in text.
      const unlisted = Object.keys(defaults(type)).filter(
        (key) => !listed.has(key)
      );
      expect(unlisted, type).toEqual([]);
    }
  });

  it("maps every part of a saved dashboard", () => {
    expect(Object.keys(DASHBOARD_COVERAGE).sort()).toEqual(
      Object.keys({
        ...dashboard([]),
        rowsSettings: 1,
        aggregates: 1,
        geometryAssets: 1,
      }).sort()
    );
  });

  it.each(
    // Each type on its own, so a failure names the type.
    [
      "row",
      "bar",
      "scatter",
      "3d-scatter",
      "pivot",
      "data-table",
      "summary",
      "markdown",
      "boxplot",
      "color-legend",
      "line",
      "sankey",
      "parallel-coordinates",
      "calendar",
      "heatmap",
      "ecdf",
      "metric-card",
      "map",
    ]
  )("rebuilds a %s chart with every setting edited", (type) => {
    expect(chartTypes()).toContain(type);
    for (const chart of [defaults(type), edited(defaults(type))]) {
      const settings = dashboard([chart]);
      const { text, omitted, rebuilt } = roundTrip(settings);
      expect(omitted, text).toEqual([]);
      expect(rebuilt.charts, text).toEqual(settings.charts);
    }
  });

  it("rebuilds a scatter that plots and selects rows by sequence", () => {
    const chart = {
      ...defaults("scatter"),
      filters: [{ type: "value", field: "__ID", values: [0, 2] }],
    } as SavedChartSettings;
    const settings = dashboard([chart]);
    const { text, omitted, rebuilt } = roundTrip(settings);
    expect(omitted).toEqual([]);
    expect(text).toContain("x=__ID");
    expect(text).toContain("select.__ID=0,2");
    expect(rebuilt.charts).toEqual(settings.charts);
  });

  it("rebuilds grid and field settings through their words", () => {
    const settings = dashboard([defaults("row")]);
    const { text, rebuilt } = roundTrip(settings);
    for (const { word } of Object.values(GRID_SETTING_WORDS)) {
      expect(text).toContain(`${word}=`);
    }
    for (const [key, word] of Object.entries(FIELD_SETTING_WORDS)) {
      // The type converts a source field, written as `as=`.
      expect(text, key).toContain(`${word}=`);
    }
    expect(rebuilt.gridSettings).toEqual(settings.gridSettings);
    expect(rebuilt.fieldSettings).toEqual(settings.fieldSettings);
    expect(rebuilt.metadata.name).toBe("Coverage");
    expect(rebuilt.calculations).toEqual(settings.calculations);
  });
});
