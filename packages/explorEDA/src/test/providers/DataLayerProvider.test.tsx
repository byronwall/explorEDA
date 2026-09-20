import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { getChartDefinition } from "../../charts/registry";
import { registerAllCharts } from "../../charts/registerAllCharts";
import { SummaryTable } from "../../components/charts/SummaryTable/SummaryTable";
import type { SummaryTableSettings } from "../../components/charts/SummaryTable/definition";
import {
  DataLayerProvider,
  useDataLayer,
} from "../../providers/DataLayerProvider";
import { SavedDataStructure } from "../../types/SavedDataStructure";
import { useGetLiveIds } from "../../components/charts/useGetLiveData";
import { RowsView } from "../../components/RowsView";
import {
  parseSavedAnalysis,
  stringifySavedAnalysis,
} from "../../utils/saveDataUtils";

const data = [
  { name: "A", value: 2 },
  { name: "B", value: 3 },
];

const dataWithLateField = [
  { name: "A", value: 2 },
  { name: "B", value: 3, late: true },
];

const filteredSummaryData = [
  { region: "North", units: 10 },
  { region: "North", units: 20 },
  { region: "South", units: 30 },
];

function LiveIdsProbe() {
  const charts = useDataLayer((state) => state.charts);
  const updateChart = useDataLayer((state) => state.updateChart);
  const clearAllFilters = useDataLayer((state) => state.clearAllFilters);
  const table = charts.find((chart) => chart.type === "data-table")!;
  const summary = charts.find((chart) => chart.type === "summary")!;
  const ids = useGetLiveIds(summary);
  return (
    <>
      <output data-testid="live-count">{ids.length}</output>
      <button
        onClick={() =>
          updateChart(table.id, {
            filters: [{ type: "range", field: "units", min: 15 }],
          })
        }
      >
        Filter rows
      </button>
      <button onClick={clearAllFilters}>Clear rows</button>
    </>
  );
}

function Probe() {
  const rows = useDataLayer((state) => state.data);
  const calculations = useDataLayer((state) => state.calculations);
  const getColumnNames = useDataLayer((state) => state.getColumnNames);
  const getColumnData = useDataLayer((state) => state.getColumnData);

  return (
    <>
      <output data-testid="rows">{rows.length}</output>
      <output data-testid="calculations">{calculations.length}</output>
      <output data-testid="columns">{JSON.stringify(getColumnNames())}</output>
      <output data-testid="values">
        {JSON.stringify(getColumnData("double"))}
      </output>
      <output data-testid="missing">
        {Object.keys(getColumnData("missing")).join(",")}
      </output>
    </>
  );
}

function LayoutProbe() {
  const charts = useDataLayer((state) => state.charts);
  const updateChartLayouts = useDataLayer((state) => state.updateChartLayouts);

  return (
    <>
      <output data-testid="layout-count">{charts.length}</output>
      <button
        onClick={() =>
          updateChartLayouts({
            first: { x: 2, y: 3, w: 4, h: 5 },
            second: { x: 6, y: 7, w: 8, h: 9 },
          })
        }
      >
        update layouts
      </button>
      <output data-testid="layouts">
        {JSON.stringify(charts.map(({ id, layout }) => ({ id, layout })))}
      </output>
    </>
  );
}

function WorkspaceProbe() {
  const charts = useDataLayer((state) => state.charts);
  const setData = useDataLayer((state) => state.setData);

  return (
    <>
      <output data-testid="workspace">
        {JSON.stringify(
          charts.map((chart) => ({
            type: chart.type,
            title: chart.title,
            xAxisLabel: chart.xAxisLabel,
            yAxisLabel: chart.yAxisLabel,
            columns: chart.type === "data-table" ? chart.columns : undefined,
          }))
        )}
      </output>
      <button onClick={() => setData([{ replacement: 1 }])}>replace</button>
    </>
  );
}

function StateChangeProbe() {
  const charts = useDataLayer((state) => state.charts);
  const updateChart = useDataLayer((state) => state.updateChart);
  const getColumnData = useDataLayer((state) => state.getColumnData);
  const table =
    charts.find((chart) => chart.type === "data-table") ?? charts[0];

  return (
    <>
      <button
        onClick={() => table && updateChart(table.id, { title: "Changed" })}
      >
        change chart
      </button>
      <button
        onClick={() =>
          table &&
          updateChart(table.id, {
            filters: [{ type: "value", field: "name", values: ["A"] }],
          })
        }
      >
        change filter
      </button>
      <button onClick={() => getColumnData("name")}>read column</button>
    </>
  );
}

function FilteredSummaryProbe() {
  const charts = useDataLayer((state) => state.charts);
  const updateChart = useDataLayer((state) => state.updateChart);
  const summary = charts.find((chart) => chart.type === "summary");
  const table = charts.find((chart) => chart.type === "data-table");
  if (!summary || !table || table.type !== "data-table") {
    return null;
  }

  return (
    <>
      <SummaryTable
        settings={summary as SummaryTableSettings}
        width={400}
        height={400}
      />
      <button
        onClick={() =>
          updateChart(table.id, {
            filters: [{ type: "range", field: "units", min: 10, max: 20 }],
          })
        }
      >
        filter summary
      </button>
      <button
        onClick={() =>
          updateChart(table.id, {
            filters: [{ type: "range", field: "units", min: 100, max: 200 }],
          })
        }
      >
        empty summary
      </button>
    </>
  );
}

function savedData(calculations: SavedDataStructure["calculations"] = []) {
  return {
    charts: [],
    calculations,
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
}

describe("DataLayerProvider", () => {
  it("refreshes live row ids when another chart changes or clears filters", () => {
    render(
      <DataLayerProvider data={filteredSummaryData}>
        <LiveIdsProbe />
      </DataLayerProvider>
    );
    expect(screen.getByTestId("live-count")).toHaveTextContent("3");
    fireEvent.click(screen.getByRole("button", { name: "Filter rows" }));
    expect(screen.getByTestId("live-count")).toHaveTextContent("2");
    fireEvent.click(screen.getByRole("button", { name: "Clear rows" }));
    expect(screen.getByTestId("live-count")).toHaveTextContent("3");
  });
  beforeAll(() => registerAllCharts());

  it("exposes source columns without the internal row id", () => {
    render(
      <DataLayerProvider data={data}>
        <Probe />
      </DataLayerProvider>
    );

    expect(screen.getByTestId("rows")).toHaveTextContent("2");
    expect(screen.getByTestId("columns")).toHaveTextContent("name");
    expect(screen.getByTestId("columns")).toHaveTextContent("value");
    expect(screen.getByTestId("columns")).not.toHaveTextContent("__ID");
  });

  it("creates a summary and table from the union of source fields", () => {
    render(
      <DataLayerProvider data={dataWithLateField}>
        <WorkspaceProbe />
      </DataLayerProvider>
    );

    expect(screen.getByTestId("workspace")).toHaveTextContent(
      '"type":"summary"'
    );
    expect(screen.getByTestId("workspace")).toHaveTextContent(
      '"type":"data-table"'
    );
    expect(screen.getByTestId("workspace")).toHaveTextContent('"field":"late"');
    expect(screen.getByTestId("workspace")).toHaveTextContent(
      '"title":"Distribution of value"'
    );
    expect(screen.getByTestId("workspace")).toHaveTextContent(
      '"xAxisLabel":"value"'
    );
    expect(screen.getByTestId("workspace")).toHaveTextContent(
      '"yAxisLabel":"Rows (count)"'
    );
  });

  it("does not create defaults when saved data is supplied", () => {
    render(
      <DataLayerProvider data={data} savedData={savedData()}>
        <WorkspaceProbe />
      </DataLayerProvider>
    );

    expect(screen.getByTestId("workspace")).toHaveTextContent("[]");
  });

  it("keeps saved state precedence when the source rows change", async () => {
    const view = render(
      <DataLayerProvider data={data}>
        <WorkspaceProbe />
      </DataLayerProvider>
    );

    view.rerender(
      <DataLayerProvider data={dataWithLateField} savedData={savedData()}>
        <WorkspaceProbe />
      </DataLayerProvider>
    );

    await waitFor(() =>
      expect(screen.getByTestId("workspace")).toHaveTextContent("[]")
    );
  });

  it("does not expose the internal row id when saved state is removed", async () => {
    const view = render(
      <DataLayerProvider data={data} savedData={savedData()}>
        <WorkspaceProbe />
      </DataLayerProvider>
    );

    view.rerender(
      <DataLayerProvider data={data}>
        <WorkspaceProbe />
      </DataLayerProvider>
    );

    await waitFor(() =>
      expect(screen.getByTestId("workspace")).toHaveTextContent(
        '"field":"value"'
      )
    );
    expect(screen.getByTestId("workspace")).not.toHaveTextContent("__ID");
  });

  it("adds calculated fields to the shared summary profiles", () => {
    const calculation = {
      expression: "value * 2",
      resultColumnName: "double",
    };
    const settings = getChartDefinition("summary").createDefaultSettings({
      x: 0,
      y: 0,
      w: 1,
      h: 1,
    }) as SummaryTableSettings;

    render(
      <DataLayerProvider data={data} savedData={savedData([calculation])}>
        <SummaryTable settings={settings} width={400} height={400} />
      </DataLayerProvider>
    );

    expect(screen.getByText("double")).toBeInTheDocument();
  });

  it("profiles only rows surviving chart filters and keeps fields when empty", () => {
    render(
      <DataLayerProvider data={filteredSummaryData}>
        <FilteredSummaryProbe />
      </DataLayerProvider>
    );

    expect(screen.getByText("3 rows")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "filter summary" }));
    expect(screen.getByText("2 rows")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("20")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "empty summary" }));
    expect(screen.getByText("0 rows")).toBeInTheDocument();
    expect(screen.getByText("units")).toBeInTheDocument();
  });

  it("creates no defaults for empty rows and reuses the builder on setData", async () => {
    const view = render(
      <DataLayerProvider data={[]}>
        <WorkspaceProbe />
      </DataLayerProvider>
    );

    expect(screen.getByTestId("workspace")).toHaveTextContent("[]");
    fireEvent.click(screen.getByRole("button", { name: "replace" }));

    await waitFor(() =>
      expect(screen.getByTestId("workspace")).toHaveTextContent(
        '"field":"replacement"'
      )
    );
    view.unmount();
  });

  it("replaces data when the input prop changes", async () => {
    const view = render(
      <DataLayerProvider data={data}>
        <Probe />
      </DataLayerProvider>
    );

    view.rerender(
      <DataLayerProvider data={[{ name: "C", value: 7 }]}>
        <Probe />
      </DataLayerProvider>
    );

    await waitFor(() =>
      expect(screen.getByTestId("rows")).toHaveTextContent("1")
    );
    expect(screen.getByTestId("columns")).toHaveTextContent("name");
    expect(screen.getByTestId("missing")).toHaveTextContent("0");
    expect(screen.getByTestId("missing")).not.toHaveTextContent("1");
  });

  it("restores saved calculations when the input prop changes", async () => {
    const view = render(
      <DataLayerProvider data={data}>
        <Probe />
      </DataLayerProvider>
    );
    const calculation = {
      expression: "value * 2",
      resultColumnName: "double",
    };

    view.rerender(
      <DataLayerProvider data={data} savedData={savedData([calculation])}>
        <Probe />
      </DataLayerProvider>
    );

    await waitFor(() =>
      expect(screen.getByTestId("calculations")).toHaveTextContent("1")
    );
    expect(screen.getByTestId("columns")).toHaveTextContent("double");
    expect(screen.getByTestId("values")).toHaveTextContent("4");
  });

  it("updates chart layouts together", async () => {
    const createSummary = (id: string, y: number) => ({
      ...getChartDefinition("summary").createDefaultSettings({
        x: 0,
        y,
        w: 1,
        h: 1,
      }),
      id,
    });

    render(
      <DataLayerProvider
        data={data}
        charts={[createSummary("first", 0), createSummary("second", 1)]}
      >
        <LayoutProbe />
      </DataLayerProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: "update layouts" }));

    await waitFor(() => {
      expect(screen.getByTestId("layouts")).toHaveTextContent('"x":2');
    });
    expect(screen.getByTestId("layouts")).toHaveTextContent('"x":6');
  });

  it("does not emit on mount or prop-driven replacements", async () => {
    const onStateChange = vi.fn();
    const saved = savedData();
    const view = render(
      <DataLayerProvider
        data={data}
        savedData={saved}
        onStateChange={onStateChange}
      >
        <Probe />
      </DataLayerProvider>
    );

    expect(onStateChange).not.toHaveBeenCalled();

    view.rerender(
      <DataLayerProvider
        data={[{ name: "C", value: 7 }]}
        savedData={savedData()}
        onStateChange={onStateChange}
      >
        <Probe />
      </DataLayerProvider>
    );

    await waitFor(() =>
      expect(screen.getByTestId("rows")).toHaveTextContent("1")
    );
    expect(onStateChange).not.toHaveBeenCalled();
  });

  it("emits one serializable snapshot for chart and filter edits", () => {
    const onStateChange = vi.fn();
    render(
      <DataLayerProvider data={data} onStateChange={onStateChange}>
        <StateChangeProbe />
      </DataLayerProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: "change chart" }));
    expect(onStateChange).toHaveBeenCalledTimes(1);
    const snapshot = onStateChange.mock.calls[0]![0] as SavedDataStructure;
    expect(snapshot.charts).toHaveLength(3);
    expect(snapshot.gridSettings).toBeDefined();
    expect(snapshot.calculations).toEqual([]);
    expect(snapshot.colorScales).toEqual([]);
    expect(() => JSON.stringify(snapshot)).not.toThrow();
    const roundTrip = JSON.parse(
      JSON.stringify(snapshot)
    ) as SavedDataStructure;
    expect(roundTrip.metadata).toEqual(snapshot.metadata);
    expect(roundTrip.gridSettings).toEqual(snapshot.gridSettings);

    fireEvent.click(screen.getByRole("button", { name: "change filter" }));
    expect(onStateChange).toHaveBeenCalledTimes(2);
    expect(
      (onStateChange.mock.calls[1]![0] as SavedDataStructure).charts
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          filters: [{ type: "value", field: "name", values: ["A"] }],
        }),
      ])
    );
  });

  it("does not emit for derived column cache updates", async () => {
    const onStateChange = vi.fn();
    render(
      <DataLayerProvider data={data} onStateChange={onStateChange}>
        <StateChangeProbe />
      </DataLayerProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: "read column" }));
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    expect(onStateChange).not.toHaveBeenCalled();
  });

  it("serializes 3D camera vectors in callback state", () => {
    const chart = getChartDefinition("3d-scatter").createDefaultSettings({
      x: 0,
      y: 0,
      w: 1,
      h: 1,
    });
    const onStateChange = vi.fn();
    render(
      <DataLayerProvider
        data={[{ x: 1, y: 2, z: 3 }]}
        savedData={{
          ...savedData(),
          charts: [chart as unknown as SavedDataStructure["charts"][number]],
        }}
        onStateChange={onStateChange}
      >
        <StateChangeProbe />
      </DataLayerProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: "change chart" }));
    const emittedChart = (onStateChange.mock.calls[0]![0] as SavedDataStructure)
      .charts[0]!;
    expect(emittedChart.type).toBe("3d-scatter");
    if (emittedChart.type === "3d-scatter") {
      expect(emittedChart.cameraPosition).toEqual({ x: 10, y: 10, z: 10 });
      expect(emittedChart.cameraTarget).toEqual({ x: 0, y: 0, z: 0 });
    }
  });

  it("restores edited formula text and independent rows settings", async () => {
    const useStateLayer = () => useDataLayer((current) => current);
    let state!: ReturnType<typeof useStateLayer>;
    const onStateChange = vi.fn();
    function StateProbe() {
      state = useStateLayer();
      return null;
    }

    render(
      <DataLayerProvider
        data={[{ value: 2 }, { value: 3, missing: undefined }]}
        savedData={{
          ...savedData(),
          metadata: {
            name: "Named analysis",
            version: 1,
            createdAt: "2025-01-01T00:00:00.000Z",
            modifiedAt: "2025-01-02T00:00:00.000Z",
          },
          calculations: [
            { resultColumnName: "double", expression: "value * 2" },
          ],
        }}
        onStateChange={onStateChange}
      >
        <StateProbe />
      </DataLayerProvider>
    );

    expect(state.getColumnData("double")[1]).toBe(6);
    onStateChange.mockClear();
    act(() =>
      state.restoreFromStructure({
        ...state.saveToStructure(),
        calculations: [{ resultColumnName: "double", expression: "value * 3" }],
      })
    );
    expect(state.getColumnData("double")[1]).toBe(9);
    expect(onStateChange).toHaveBeenCalledTimes(1);
    expect(onStateChange.mock.calls[0]?.[0]).toMatchObject({
      calculations: [{ resultColumnName: "double", expression: "value * 3" }],
    });

    act(() =>
      state.updateRowsSettings({
        columns: [
          { id: "value", field: "value", width: 240 },
          { id: "missing", field: "missing", width: 180 },
        ],
        sortBy: "value",
        sortDirection: "desc",
        filters: [
          { type: "text", field: "missing", operator: "equals", value: "x" },
        ],
        globalSearch: "needle",
      })
    );
    const snapshot = state.saveToStructure();
    expect(snapshot.metadata.name).toBe("Named analysis");
    expect(snapshot.calculations).toEqual([
      { resultColumnName: "double", expression: "value * 3" },
    ]);
    expect(snapshot.rowsSettings?.columns[0]?.width).toBe(240);

    const analysis = parseSavedAnalysis(
      stringifySavedAnalysis(state.saveAnalysisToStructure())
    );
    expect(analysis.data[1]).toEqual({ value: 3, missing: undefined });
    act(() => state.updateRowsSettings({ globalSearch: "changed" }));
    onStateChange.mockClear();
    act(() => state.restoreAnalysisFromStructure(analysis));
    expect(onStateChange).toHaveBeenCalledTimes(1);
    expect(state.rowsSettings.sortDirection).toBe("desc");
    expect(state.rowsSettings.columns[0]?.width).toBe(240);
    expect(state.data[1]?.missing).toBeUndefined();

    const beforeInvalidRestore = state.data.map((row) => ({ ...row }));
    expect(() =>
      state.restoreAnalysisFromStructure({
        ...analysis,
        settings: {
          ...analysis.settings,
          calculations: [{ resultColumnName: "double", expression: "value *" }],
        },
      })
    ).toThrow();
    expect(state.data).toEqual(beforeInvalidRestore);
  });

  it("keeps RowsView selections across mount and clears only on clear-all", () => {
    function RowsProbe() {
      const rowsSettings = useDataLayer((state) => state.rowsSettings);
      const updateRowsSettings = useDataLayer(
        (state) => state.updateRowsSettings
      );
      const clearAllFilters = useDataLayer((state) => state.clearAllFilters);
      return (
        <>
          <output data-testid="rows-settings">
            {JSON.stringify(rowsSettings)}
          </output>
          <button
            onClick={() =>
              updateRowsSettings({
                columns: [{ id: "value", field: "value", width: 240 }],
                globalSearch: "needle",
                filters: [
                  {
                    type: "text",
                    field: "value",
                    operator: "contains",
                    value: "2",
                  },
                ],
              })
            }
          >
            hide name
          </button>
          <button onClick={clearAllFilters}>clear all</button>
          <RowsView width={800} active={false} toolbarTarget={null} />
        </>
      );
    }

    render(
      <DataLayerProvider data={[{ name: "A", value: 2 }]}>
        <RowsProbe />
      </DataLayerProvider>
    );
    expect(
      screen.getByRole("columnheader", { name: /name/i })
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "hide name" }));
    expect(
      screen.queryByRole("columnheader", { name: /name/i })
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: /value/i })
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "clear all" }));
    expect(screen.getByTestId("rows-settings")).toHaveTextContent(
      '"globalSearch":""'
    );
    expect(screen.getByTestId("rows-settings")).toHaveTextContent(
      '"filters":[]'
    );
    expect(
      screen.queryByRole("columnheader", { name: /name/i })
    ).not.toBeInTheDocument();
  });

  it("keeps a newly restored calculated column hidden when RowsView mounts", () => {
    const useStateLayer = () => useDataLayer((current) => current);
    let state!: ReturnType<typeof useStateLayer>;
    function RowsProbe() {
      state = useStateLayer();
      return <RowsView width={800} active={false} toolbarTarget={null} />;
    }

    render(
      <DataLayerProvider data={data}>
        <RowsProbe />
      </DataLayerProvider>
    );

    const analysis = state.saveAnalysisToStructure();
    analysis.settings.calculations = [
      { resultColumnName: "double", expression: "value * 2" },
    ];
    analysis.settings.rowsSettings = {
      columns: [{ id: "value", field: "value" }],
      sortDirection: "asc",
      filters: [],
      globalSearch: "",
    };
    act(() => state.restoreAnalysisFromStructure(analysis));

    expect(
      screen.getByRole("columnheader", { name: /value/i })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("columnheader", { name: /double/i })
    ).not.toBeInTheDocument();
  });
});
