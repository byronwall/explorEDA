import { describe, expect, it } from "vitest";
import {
  addSourceFromRows,
  singleTableProject,
  sourceFromRows,
} from "@/lib/analysis/sources";
import { evaluateAnalysisQuery } from "@/lib/analysis/evaluateProject";
import { incompatibleSettingsFields } from "@/components/project/settingsCompatibility";
import type { SavedDataStructure } from "@/types/SavedDataStructure";

const rows = [
  { route: "A", service: "Air", hours: 4 },
  { route: "B", service: "Ground", hours: 30 },
  { route: "A", service: "Ground", hours: 26 },
];

const settings = {
  charts: [
    {
      id: "hist",
      type: "bar",
      title: "hours",
      field: "hours",
      seriesField: "service",
      filters: [
        { type: "value", field: "route", values: ["A"] },
        { type: "value", field: "__ID", values: [2] },
      ],
      layout: { x: 0, y: 0, w: 6, h: 4 },
    },
  ],
  calculations: [{ resultColumnName: "days", expression: '["hours"] / 24' }],
  gridSettings: { columnCount: 12, rowHeight: 30 },
  metadata: {},
  colorScales: [],
  rowsSettings: {
    columns: [{ field: "route" }, { field: "days" }],
    filters: [],
  },
  fieldSettings: { hours: { label: "Delivery time", unit: "h" } },
} as unknown as SavedDataStructure;

describe("sourceFromRows", () => {
  it("keys rows by a distinct column, or adds a row number", () => {
    const keyed = sourceFromRows("t", "T", [{ id: 1 }, { id: 2 }]);
    expect(keyed.source.entityKey).toBe("id");
    const numbered = sourceFromRows("t", "T", rows);
    expect(numbered.source.entityKey).toBe("row_number");
    expect(numbered.rows[1]).toMatchObject({ row_number: 2, route: "B" });
    expect(
      numbered.source.fields.find((field) => field.id === "hours")?.type
    ).toBe("number");
  });
});

describe("singleTableProject", () => {
  const promoted = singleTableProject({
    name: "Delivery times",
    sourceName: "Deliveries.csv",
    rows,
    settings,
  });
  const saved = promoted.view.settings!;
  const chart = saved.charts[0] as unknown as Record<string, unknown> & {
    filters: { field: string; values: unknown[] }[];
  };

  it("keeps the charts, layout, and titles", () => {
    expect(saved.charts).toHaveLength(1);
    expect(chart.title).toBe("hours");
    expect(chart.layout).toEqual({ x: 0, y: 0, w: 6, h: 4 });
  });

  it("moves field references to the project's names", () => {
    expect(chart.field).toBe("deliveries.hours");
    expect(chart.seriesField).toBe("deliveries.service");
    expect(chart.filters[0]!.field).toBe("deliveries.route");
    expect(saved.calculations[0]!.expression).toBe('["deliveries.hours"] / 24');
    expect(saved.rowsSettings!.columns.map((column) => column.field)).toEqual([
      "deliveries.route",
      "days",
    ]);
    expect(saved.fieldSettings).toEqual({
      "deliveries.hours": { label: "Delivery time", unit: "h" },
    });
  });

  it("resolves every field the settings read in the new query", () => {
    const evaluation = evaluateAnalysisQuery(
      promoted.project,
      promoted.tables,
      promoted.view.queryId
    );
    expect(
      incompatibleSettingsFields(
        saved,
        new Set(evaluation.fields.map((field) => field.id))
      )
    ).toEqual([]);
  });

  it("keeps a row selection on the same row", () => {
    const evaluation = evaluateAnalysisQuery(
      promoted.project,
      promoted.tables,
      promoted.view.queryId
    );
    expect(chart.filters[1]!.values).toEqual([evaluation.rows[2]!.key]);
  });

  it("adds a second table with a unique ID", () => {
    const next = addSourceFromRows(
      promoted.project,
      promoted.tables,
      "Deliveries",
      [{ route: "A", region: "North" }]
    );
    expect(next.sourceId).toBe("deliveries_2");
    expect(next.project.sources).toHaveLength(2);
    expect(next.tables.deliveries_2).toHaveLength(1);
  });
});
