import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
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

  it("keeps source contributors and numeric exclusions with the aggregate", () => {
    const result = calculatePivotData(
      [
        { __ID: 4, group: "all", amount: 10 },
        { __ID: 8, group: "all", amount: "bad" },
        { __ID: 12, group: "all", amount: 5 },
      ],
      settings({
        rowFields: ["group"],
        valueFields: [{ field: "amount", aggregation: "sum" }],
      })
    );

    const cell = result.rows[0]!.cells[0]!;
    expect(cell.value).toBe(15);
    expect(
      cell.contributors.map((contributor) => contributor.sourceId)
    ).toEqual([4, 8, 12]);
    expect(
      cell.contributors.map((contributor) => contributor.included)
    ).toEqual([true, false, true]);
    expect(cell.numericExclusions).toEqual([
      { sourceId: 8, value: "bad", reason: "Not a finite number" },
    ]);
  });

  it("contains singleValue conflicts and labels empty groups without throwing", () => {
    const result = calculatePivotData(
      [
        { __ID: 1, group: "a", column: "x", amount: 1 },
        { __ID: 2, group: "a", column: "x", amount: 2 },
        { __ID: 3, group: "b", column: "y", amount: 3 },
      ],
      settings({
        rowFields: ["group"],
        columnField: "column",
        valueFields: [{ field: "amount", aggregation: "singleValue" }],
      })
    );

    const rowA = result.rows.find((row) => row.keys[0]!.value === "a")!;
    const rowB = result.rows.find((row) => row.keys[0]!.value === "b")!;
    expect(
      rowA.cells.find((cell) => cell.key.columnValue === "x")!.status
    ).toBe("error");
    expect(rowA.cells.find((cell) => cell.key.columnValue === "x")!.error).toBe(
      "Multiple values found when single value expected"
    );
    expect(
      rowB.cells.find((cell) => cell.key.columnValue === "x")!.status
    ).toBe("empty");
    expect(
      rowB.cells.find((cell) => cell.key.columnValue === "x")!.contributors
    ).toEqual([]);
  });

  it("keeps a real total field distinct from the synthetic total cell", () => {
    const result = calculatePivotData(
      [
        { group: "a", total: "x", amount: 1 },
        { group: "a", total: "y", amount: 2 },
      ],
      settings({
        rowFields: ["group"],
        columnField: "total",
        valueFields: [{ field: "amount", aggregation: "sum" }],
      })
    );

    expect(result.rows[0]!.cells.map((cell) => cell.value)).toEqual([1, 2]);
    expect(result.rows[0]!.cells.every((cell) => !cell.key.isTotal)).toBe(true);
  });

  it("keeps typed nonfinite grouping values separate", () => {
    const result = calculatePivotData(
      [
        { group: NaN, amount: 1 },
        { group: NaN, amount: 2 },
        { group: Infinity, amount: 3 },
        { group: -Infinity, amount: 4 },
        { group: "NaN", amount: 5 },
      ],
      settings({
        rowFields: ["group"],
        valueFields: [{ field: "amount", aggregation: "sum" }],
      })
    );

    expect(result.rows).toHaveLength(4);
    expect(
      result.rows.find((row) => Number.isNaN(row.keys[0]!.value))!.cells[0]!
        .value
    ).toBe(3);
    expect(
      result.rows.find((row) => row.keys[0]!.value === Infinity)!.cells[0]!
        .value
    ).toBe(3);
    expect(
      result.rows.find((row) => row.keys[0]!.value === -Infinity)!.cells[0]!
        .value
    ).toBe(4);
    expect(
      result.rows.find((row) => row.keys[0]!.value === "NaN")!.cells[0]!.value
    ).toBe(5);
  });

  it("marks every equal singleValue input as used", () => {
    const result = calculatePivotData(
      [
        { __ID: 2, group: "a", amount: 7 },
        { __ID: 5, group: "a", amount: 7 },
      ],
      settings({
        rowFields: ["group"],
        valueFields: [{ field: "amount", aggregation: "singleValue" }],
      })
    );

    expect(
      result.rows[0]!.cells[0]!.contributors.map((item) => item.included)
    ).toEqual([true, true]);
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

  it("opens a contributor inspector and returns focus on Escape", async () => {
    const chart = pivotTableDefinition.createDefaultSettings({
      x: 0,
      y: 0,
      w: 4,
      h: 4,
    });
    chart.rowFields = ["group"];
    chart.valueFields = [{ field: "amount", aggregation: "sum" }];

    render(
      createElement(
        DataLayerProvider,
        {
          data: [
            { group: "A", amount: 1.23456789 },
            { group: "A", amount: 2 },
            { group: "A", amount: "" },
          ],
          charts: [chart],
        },
        createElement(SavedPivotProbe)
      )
    );

    const inspectButton = screen.getByRole("button", { name: /Inspect A/ });
    fireEvent.click(inspectButton);
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText("3.23456789")).toBeInTheDocument();
    expect(
      within(dialog).getByText("Source row ID (zero-based)")
    ).toBeInTheDocument();
    expect(within(dialog).getByText('""')).toBeInTheDocument();
    expect(within(dialog).getAllByText("Yes")).toHaveLength(2);

    fireEvent.keyDown(dialog, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await waitFor(() => expect(document.activeElement).toBe(inspectButton));
  });
});
