import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, beforeAll, beforeEach, expect, it, vi } from "vitest";
import { registerAllCharts } from "@/charts/registerAllCharts";
import { DataLayerProvider, useDataLayer } from "@/providers/DataLayerProvider";
import { BarChart } from "@/components/charts/BarChart/BarChart";
import {
  barChartDefinition,
  type BarChartSettings,
} from "@/components/charts/BarChart/definition";
import { MetricCard } from "@/components/charts/MetricCard/MetricCard";
import {
  metricCardDefinition,
  type MetricCardSettings,
} from "@/components/charts/MetricCard/definition";
import { DataTable } from "@/components/charts/DataTable/DataTable";
import {
  dataTableDefinition,
  type DataTableSettings,
} from "@/components/charts/DataTable/definition";
import { ChartTraceScope } from "@/components/charts/trace/ChartTraceScope";
import { ChartTracePanel } from "@/components/charts/trace/ChartTracePanel";
import type { SavedDataStructure } from "@/types/SavedDataStructure";
import {
  parseSavedAnalysis,
  stringifySavedAnalysis,
} from "@/utils/saveDataUtils";

// The "local trust" journey from docs/intent/current-analysis-trust: select
// one category in a bar, then check that the bar, metric cards, the table, its
// CSV export, and the traces name the same rows and values, and that a saved
// analysis reopens to the same answer. Undo and redo live in the demo host;
// see apps/demo/src/localTrustJourney.test.tsx.
//
// Tools has three source rows (O-101, O-102, O-103) but only two numeric
// contributors, because O-103 has no revenue: sum 12, mean 6.
const trustRows = [
  { order: "O-101", category: "Tools", revenue: 4 },
  { order: "O-102", category: "Tools", revenue: 8 },
  { order: "O-103", category: "Tools", revenue: null },
  { order: "O-104", category: "Toys", revenue: 5 },
  { order: "O-105", category: "Garden", revenue: 7 },
];

const layout = { x: 0, y: 0, w: 4, h: 3 };
const bar: BarChartSettings = {
  ...barChartDefinition.createDefaultSettings(layout, "category"),
  id: "bar",
  title: "Revenue by category",
  aggregateId: "revenue-by-category",
};
const total: MetricCardSettings = {
  ...metricCardDefinition.createDefaultSettings(layout),
  id: "total",
  aggregation: "sum",
  measureField: "revenue",
};
const mean: MetricCardSettings = {
  ...total,
  id: "mean",
  aggregation: "average",
};
const table: DataTableSettings = {
  ...dataTableDefinition.createDefaultSettings(layout),
  id: "table",
  columns: [
    { id: "order", field: "order" },
    { id: "category", field: "category" },
    { id: "revenue", field: "revenue" },
  ],
};

const trustSettings: SavedDataStructure = {
  charts: [bar, total, mean, table],
  calculations: [],
  colorScales: [],
  aggregates: [
    {
      id: "revenue-by-category",
      name: "Sum of revenue by category",
      groupField: "category",
      measureField: "revenue",
      aggregation: "sum",
    },
  ],
  gridSettings: {
    columnCount: 12,
    rowHeight: 76,
    containerPadding: 0,
    showBackgroundMarkers: false,
  },
  metadata: {
    name: "Local trust",
    version: 1,
    createdAt: "2026-10-22T00:00:00.000Z",
    modifiedAt: "2026-10-22T00:00:00.000Z",
  },
};

const useStateLayer = () => useDataLayer((state) => state);
let state!: ReturnType<typeof useStateLayer>;

function Workspace() {
  state = useStateLayer();
  const chart = <T,>(id: string) =>
    state.charts.find((item) => item.id === id) as T | undefined;
  const barSettings = chart<BarChartSettings>("bar");
  const totalSettings = chart<MetricCardSettings>("total");
  const meanSettings = chart<MetricCardSettings>("mean");
  const tableSettings = chart<DataTableSettings>("table");
  return (
    <ChartTraceScope>
      {barSettings && (
        <BarChart settings={barSettings} width={400} height={240} />
      )}
      {totalSettings && (
        <MetricCard settings={totalSettings} width={350} height={130} />
      )}
      {meanSettings && (
        <MetricCard settings={meanSettings} width={350} height={130} />
      )}
      {tableSettings && (
        <DataTable settings={tableSettings} width={600} height={400} />
      )}
      <ChartTracePanel />
    </ChartTraceScope>
  );
}

let exported: Blob[] = [];
beforeAll(registerAllCharts);
beforeEach(() => {
  exported = [];
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  );
  URL.createObjectURL = (blob: Blob) => {
    exported.push(blob);
    return "blob:trust";
  };
  URL.revokeObjectURL = () => {};
  vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function readBlob(blob: Blob) {
  return new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.readAsText(blob);
  });
}

async function exportCsv() {
  fireEvent.click(screen.getByRole("button", { name: "Export rows as CSV" }));
  return readBlob(exported.at(-1)!);
}

const tableRows = () =>
  within(screen.getByRole("table"))
    .getAllByRole("row")
    .slice(1)
    .map((row) =>
      within(row)
        .getAllByRole("cell")
        .map((cell) =>
          cell.querySelector(".eda-null") ? "Missing" : cell.textContent
        )
    );

const toolsCsv = [
  "order,category,revenue",
  "O-101,Tools,4",
  "O-102,Tools,8",
  "O-103,Tools,",
].join("\n");

/** Every view a reader compares, for the Tools selection. */
async function expectToolsAgreement() {
  // Source membership: three rows, by stable label.
  expect(state.crossfilterWrapper.getFilteredRowIds()).toEqual([0, 1, 2]);
  expect(screen.getByRole("button", { name: "Tools: 12" })).toHaveAttribute(
    "aria-pressed",
    "true"
  );
  expect(tableRows()).toEqual([
    ["O-101", "Tools", "4"],
    ["O-102", "Tools", "8"],
    ["O-103", "Tools", "Missing"],
  ]);
  expect(await exportCsv()).toBe(toolsCsv);

  // Numeric contributors: two of the three rows, sum 12 and mean 6.
  const sum = screen.getByLabelText("Sum of revenue");
  expect(within(sum).getByText("12")).toBeInTheDocument();
  expect(sum).toHaveTextContent("1 excluded");
  expect(sum).toHaveTextContent("3 of 5 rows");
  const average = screen.getByLabelText("Average of revenue");
  expect(within(average).getByText("6")).toBeInTheDocument();
  expect(average).toHaveTextContent("1 excluded");
}

const traceRows = (trace: HTMLElement) =>
  within(within(trace).getByRole("table"))
    .getAllByRole("row")
    .slice(1)
    .map((row) =>
      within(row)
        .getAllByRole("cell")
        .map((cell) => cell.textContent)
    );

async function expectToolsTraces() {
  fireEvent.click(screen.getByRole("button", { name: "Tools: 12" }), {
    altKey: true,
  });
  const barTrace = screen.getByLabelText("Bar trace");
  expect(barTrace).toHaveTextContent("2 of 3 · 1 excluded");
  expect(barTrace).toHaveTextContent("Exact result: 12");
  // Source row ID, input, and whether it was used, per member.
  expect(
    traceRows(barTrace).map((row) => [row[0], row[1], row.at(-1)])
  ).toEqual([
    ["0", "4", "Yes"],
    ["1", "8", "Yes"],
    ["2", "null", "Missing value"],
  ]);

  fireEvent.click(screen.getByLabelText("Sum of revenue"), { altKey: true });
  const cardTrace = screen.getByLabelText("Metric card trace");
  expect(traceRows(cardTrace).map((row) => row[0])).toEqual(["0", "1", "2"]);
}

it("agrees on Tools across bar, cards, table, CSV, traces, and a reopened save", async () => {
  const first = render(
    <DataLayerProvider data={trustRows} savedData={trustSettings}>
      <Workspace />
    </DataLayerProvider>
  );

  // Before the selection, every row is in scope.
  expect(
    within(screen.getByLabelText("Sum of revenue")).getByText("24")
  ).toBeInTheDocument();
  expect(tableRows()).toHaveLength(5);

  fireEvent.click(screen.getByRole("button", { name: "Tools: 12" }));
  expect(state.charts.find((chart) => chart.id === "bar")!.filters).toEqual([
    { type: "value", field: "category", values: ["Tools"] },
  ]);
  await expectToolsAgreement();
  await expectToolsTraces();

  // Save the analysis as a host would, through its JSON text, and reopen it
  // in a fresh workspace that starts with no rows.
  const text = stringifySavedAnalysis(state.saveAnalysisToStructure());
  first.unmount();
  cleanup();
  render(
    <DataLayerProvider data={[]}>
      <Workspace />
    </DataLayerProvider>
  );
  act(() => state.restoreAnalysisFromStructure(parseSavedAnalysis(text)));
  expect(state.data.map((row) => row.order)).toEqual(
    trustRows.map((row) => row.order)
  );
  await expectToolsAgreement();
  await expectToolsTraces();
});
