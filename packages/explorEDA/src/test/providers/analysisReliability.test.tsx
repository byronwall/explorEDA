import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { beforeAll, expect, it } from "vitest";
import { registerAllCharts } from "@/charts/registerAllCharts";
import { DataLayerProvider, useDataLayer } from "@/providers/DataLayerProvider";
import { parseExpression } from "@/lib/calculations/parser/semantics";
import { CalculationManager } from "@/lib/calculations/CalculationState";
import { DataTable } from "@/components/charts/DataTable/DataTable";
import { dataTableDefinition } from "@/components/charts/DataTable/definition";
import { toTableCsv } from "@/components/charts/DataTable/DataTableToolbar";
import { ActiveFilterStatus } from "@/components/ActiveFilterStatus";
import { getFilteredRows } from "@/components/charts/DataTable/filteredRows";

beforeAll(registerAllCharts);
const calculation = (expression: string, resultColumnName = "double") => ({
  resultColumnName,
  expression: parseExpression(expression),
});
const useStateLayer = () => useDataLayer((state) => state);

it("keeps the table, active derived filter, edited formula, CSV, and restored analysis in agreement", async () => {
  const table = {
    ...dataTableDefinition.createDefaultSettings({ x: 0, y: 0, w: 6, h: 4 }),
    columns: [{ id: "double", field: "double" }],
    sortBy: "double",
    sortDirection: "desc" as const,
  };
  let state!: ReturnType<typeof useStateLayer>;
  function Workspace() {
    state = useStateLayer();
    const settings = state.charts[0];
    return (
      <>
        <ActiveFilterStatus />
        {settings?.type === "data-table" && (
          <DataTable settings={settings} width={500} height={400} />
        )}
      </>
    );
  }
  render(
    <DataLayerProvider data={[{ x: 1 }, { x: 2 }, { x: 3 }]} charts={[table]}>
      <Workspace />
    </DataLayerProvider>
  );
  await act(() => state.addCalculation(calculation("x * 2")));
  expect(screen.getAllByRole("cell").map((cell) => cell.textContent)).toEqual([
    "6",
    "4",
    "2",
  ]);
  act(() =>
    state.updateChart(table.id, {
      filters: [{ type: "range", field: "double", min: 4 }],
    })
  );
  expect(state.crossfilterWrapper.getFilteredRowIds()).toEqual([1, 2]);
  const saved = state.saveToStructure();
  act(() => state.updateCalculation("double", calculation("x * 3")));
  expect(screen.getAllByRole("cell").map((cell) => cell.textContent)).toEqual([
    "9",
    "6",
  ]);
  act(() => state.updateCalculation("double", calculation("x")));
  expect(state.crossfilterWrapper.getFilteredRowCount()).toBe(0);
  expect(screen.getByRole("status")).toHaveTextContent("Showing 0 of 3 rows");
  act(() => state.restoreFromStructure(saved));
  expect(state.crossfilterWrapper.getFilteredRowIds()).toEqual([1, 2]);
  expect(screen.getAllByRole("cell").map((cell) => cell.textContent)).toEqual([
    "6",
    "4",
  ]);
  const settings = state.charts[0];
  if (settings?.type !== "data-table") throw new Error("Missing table");
  const rows = state.data.map((row) => ({
    ...row,
    double: state.getColumnData("double")[row.__ID],
    "label,name": 'a,"b"',
  }));
  const visible = getFilteredRows(rows, state.getLiveItems(settings), settings);
  expect(toTableCsv(visible, ["double", "label,name"])).toBe(
    'double,"label,name"\n6,"a,""b"""\n4,"a,""b"""'
  );
  fireEvent.change(screen.getByRole("textbox", { name: "Search table" }), {
    target: { value: "6" },
  });
  expect(screen.getAllByRole("cell")).toHaveLength(1);
  fireEvent.click(screen.getByRole("button", { name: "Clear all filters" }));
  expect(screen.getByRole("textbox", { name: "Search table" })).toHaveValue("");
  expect(within(screen.getByRole("table")).getAllByRole("cell")).toHaveLength(
    3
  );
});

it("keeps valid rows, records row failures, and rejects invalid replacements without losing the old calculation", () => {
  const manager = new CalculationManager(
    [
      { __ID: 0, x: 2 },
      { __ID: 1, x: 0 },
      { __ID: 2, x: undefined },
    ],
    [calculation("10 / x")]
  );
  expect([
    ...manager.executeCalculation(manager.getCalculations()[0]!).values(),
  ]).toEqual([5, undefined, undefined]);
  expect([...manager.getErrors("double").values()]).toEqual([
    "Division by zero",
    "Missing numeric value",
  ]);
  for (const expression of ["double + 1", "unknown(x)", "absent + 1"]) {
    expect(() =>
      manager.updateCalculation("double", calculation(expression))
    ).toThrow();
    expect(manager.getCalculations()[0]!.expression.rawInput).toBe("10 / x");
    expect(
      manager.executeCalculation(manager.getCalculations()[0]!).get(0)
    ).toBe(5);
  }
  expect(() => manager.addCalculation(calculation("x + 1", "x"))).toThrow(
    "Field already exists"
  );
});
