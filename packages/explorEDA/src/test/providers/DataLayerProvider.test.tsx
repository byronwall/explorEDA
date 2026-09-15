import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeAll, describe, expect, it } from "vitest";
import { getChartDefinition } from "../../charts/registry";
import { registerAllCharts } from "../../charts/registerAllCharts";
import { parseExpression } from "../../lib/calculations/parser/semantics";
import { SummaryTable } from "../../components/charts/SummaryTable/SummaryTable";
import type { SummaryTableSettings } from "../../components/charts/SummaryTable/definition";
import {
  DataLayerProvider,
  useDataLayer,
} from "../../providers/DataLayerProvider";
import { SavedDataStructure } from "../../types/SavedDataStructure";

const data = [
  { name: "A", value: 2 },
  { name: "B", value: 3 },
];

const dataWithLateField = [
  { name: "A", value: 2 },
  { name: "B", value: 3, late: true },
];

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
            columns: chart.type === "data-table" ? chart.columns : undefined,
          }))
        )}
      </output>
      <button onClick={() => setData([{ replacement: 1 }])}>replace</button>
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
      expression: parseExpression("value * 2"),
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
      expression: parseExpression("value * 2"),
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
});
