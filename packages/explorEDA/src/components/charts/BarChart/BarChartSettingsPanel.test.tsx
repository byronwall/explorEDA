import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { useState } from "react";
import { registerAllCharts } from "@/charts/registerAllCharts";
import { DataLayerProvider, useDataLayer } from "@/providers/DataLayerProvider";
import { barChartDefinition } from "./definition";
import { BarChartSettingsPanel } from "./BarChartSettingsPanel";
import type { BarChartSettings } from "./definition";

beforeAll(() => {
  registerAllCharts();
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  );
});

const savedData = (chart: BarChartSettings) => ({
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
});

function Probe({ initial }: { initial: BarChartSettings }) {
  const updateChart = useDataLayer((state) => state.updateChart);
  const charts = useDataLayer((state) => state.charts);
  const aggregates = useDataLayer((state) => state.aggregates);
  const [settings, setSettings] = useState<BarChartSettings>(initial);

  return (
    <>
      <BarChartSettingsPanel
        settings={settings}
        onSettingsChange={(next) => {
          setSettings(next);
          updateChart(initial.id, next);
        }}
      />
      <output data-testid="chart-types">
        {charts.map((chart) => chart.type).join(",")}
      </output>
      <output data-testid="aggregate">
        {JSON.stringify(aggregates[0] ?? null)}
      </output>
      <output data-testid="chart-title">{settings.title}</output>
      <output data-testid="chart-field">{settings.field}</output>
    </>
  );
}

describe("BarChartSettingsPanel grouped operation", () => {
  it("clears the generated title when returning from sum to count rows", () => {
    const chart = barChartDefinition.createDefaultSettings(
      { x: 0, y: 0, w: 6, h: 4 },
      "region"
    );

    render(
      <DataLayerProvider
        data={[
          { region: "North", value: 10 },
          { region: "South", value: 20 },
        ]}
        savedData={savedData(chart)}
      >
        <Probe initial={chart} />
      </DataLayerProvider>
    );

    act(() => {
      fireEvent.change(screen.getByRole("combobox", { name: "Operation" }), {
        target: { value: "sum" },
      });
    });

    expect(screen.getByTestId("chart-types")).toHaveTextContent("bar");
    expect(screen.getByTestId("aggregate")).toHaveTextContent(
      '"aggregation":"sum"'
    );
    expect(screen.getByTestId("aggregate")).toHaveTextContent(
      '"measureField":"value"'
    );

    fireEvent.change(screen.getByRole("combobox", { name: "Operation" }), {
      target: { value: "average" },
    });
    expect(screen.getByTestId("aggregate")).toHaveTextContent(
      '"aggregation":"average"'
    );
    expect(screen.getByTestId("aggregate")).toHaveTextContent(
      '"name":"Average of value by region"'
    );
    expect(screen.getByTestId("chart-title")).toHaveTextContent(
      "Average of value by region"
    );
    expect(screen.getByTestId("chart-field")).toHaveTextContent("value");

    fireEvent.change(screen.getByRole("combobox", { name: "Operation" }), {
      target: { value: "category" },
    });
    expect(screen.getByTestId("chart-title")).toHaveTextContent(/^$/);
    expect(screen.getByTestId("chart-field")).toHaveTextContent("region");
  });
});
