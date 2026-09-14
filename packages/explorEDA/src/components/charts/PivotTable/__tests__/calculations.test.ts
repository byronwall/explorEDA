import { render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it } from "vitest";
import { registerAllCharts } from "@/charts/registerAllCharts";
import { ChartRenderer } from "@/components/charts/ChartRenderer";
import { DataLayerProvider, useDataLayer } from "@/providers/DataLayerProvider";
import { SavedDataStructure } from "@/types/SavedDataStructure";
import { createElement } from "react";
import { calculatePivotData } from "../utils/calculations";
import { pivotTableDefinition, PivotTableSettings } from "../definition";

beforeAll(() => registerAllCharts());

const settings = (overrides: Partial<PivotTableSettings>) =>
  ({
    rowFields: [],
    columnField: "",
    valueFields: [],
    ...overrides,
  }) as PivotTableSettings;

describe("calculatePivotData", () => {
  it("keeps composite row values and types separate", () => {
    const result = calculatePivotData(
      [
        { first: "a:b", second: "c", amount: 1 },
        { first: "a", second: "b:c", amount: 2 },
        { first: 1, second: "same", amount: 3 },
        { first: "1", second: "same", amount: 4 },
      ],
      settings({
        rowFields: ["first", "second"],
        valueFields: [{ field: "amount", aggregation: "sum" }],
      })
    );

    expect(result.rows).toHaveLength(4);
    expect(result.rows.map((row) => row.cells[0]!.value)).toEqual([1, 2, 3, 4]);
  });

  it("ignores invalid numeric values instead of treating them as zero", () => {
    const result = calculatePivotData(
      [
        { group: "all", amount: 10 },
        { group: "all", amount: "bad" },
        { group: "all", amount: 20 },
      ],
      settings({
        rowFields: ["group"],
        valueFields: [{ field: "amount", aggregation: "avg" }],
      })
    );

    expect(result.rows[0]!.cells[0]!.value).toBe(15);
  });
});

describe("pivotTableDefinition.validateSettings", () => {
  it("rejects empty value fields and malformed selections", () => {
    expect(
      pivotTableDefinition.validateSettings(settings({ valueFields: [] }))
    ).toBe(false);
    expect(
      pivotTableDefinition.validateSettings(
        settings({
          rowFields: ["group", "group"],
          valueFields: [{ field: "amount", aggregation: "sum" }],
        })
      )
    ).toBe(false);
    expect(
      pivotTableDefinition.validateSettings(
        settings({
          rowFields: ["group"],
          valueFields: [{ field: "", aggregation: "count" }],
        })
      )
    ).toBe(false);
    expect(
      pivotTableDefinition.validateSettings(
        settings({
          rowFields: ["group"],
          valueFields: [{ field: "amount", aggregation: "sum" }],
        })
      )
    ).toBe(true);
  });
});

function SavedPivotProbe() {
  const chart = useDataLayer((state) => state.charts[0]);

  return chart
    ? createElement(ChartRenderer, { settings: chart, width: 400, height: 300 })
    : null;
}

describe("PivotTable rendering", () => {
  it("shows a recoverable message for a saved field missing from the dataset", () => {
    const chart = pivotTableDefinition.createDefaultSettings({
      x: 0,
      y: 0,
      w: 4,
      h: 4,
    });
    chart.rowFields = ["missing"];
    chart.valueFields = [{ field: "amount", aggregation: "sum" }];

    const savedData = {
      charts: [chart],
      calculations: [],
      gridSettings: {
        columnCount: 12,
        rowHeight: 100,
        containerPadding: 10,
        showBackgroundMarkers: true,
      },
      metadata: {
        name: "Test",
        version: 1,
        createdAt: "2025-01-01T00:00:00.000Z",
        modifiedAt: "2025-01-01T00:00:00.000Z",
      },
      colorScales: [],
    } satisfies SavedDataStructure;

    render(
      createElement(
        DataLayerProvider,
        { data: [{ group: "A", amount: 3 }], savedData },
        createElement(SavedPivotProbe)
      )
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "The current data does not include: missing"
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Update this chart's settings"
    );
  });
});
