import { fireEvent, render, renderHook, screen } from "@testing-library/react";
import { beforeAll, expect, it, vi } from "vitest";
import { useState, type ReactNode } from "react";
import { registerAllCharts } from "@/charts/registerAllCharts";
import { DataLayerProvider } from "@/providers/DataLayerProvider";
import { lineChartDefinition, type LineChartSettings } from "./definition";
import { LineDataMode, useTimeSeriesFields } from "./TimeSeriesSettingsPanel";

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

const initial: LineChartSettings = {
  ...lineChartDefinition.createDefaultSettings({ x: 0, y: 0, w: 6, h: 4 }),
  id: "line",
  xField: "age",
  seriesField: ["price"],
};
// Ages and prices are numbers, not timestamps; only the date column is one.
const data = [
  { age: 10, price: 3.5, when: "2024-01-01", note: "x" },
  { age: 30, price: 4, when: "2024-02-01", note: "y" },
];

it("offers only date columns as dates", () => {
  const { result } = renderHook(() => useTimeSeriesFields(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <DataLayerProvider charts={[initial]} data={data}>
        {children}
      </DataLayerProvider>
    ),
  });
  expect(result.current.dates).toEqual(["when"]);
  expect(result.current.measures).toEqual(["age", "price"]);
});

it("switches calendar summaries to the date column, not the first number", () => {
  function Probe() {
    const [settings, setSettings] = useState<LineChartSettings>(initial);
    return (
      <>
        <LineDataMode settings={settings} onSettingsChange={setSettings} />
        <output aria-label="X field">{settings.xField}</output>
      </>
    );
  }
  render(
    <DataLayerProvider charts={[initial]} data={data}>
      <Probe />
    </DataLayerProvider>
  );
  fireEvent.change(screen.getByLabelText("Data mode"), {
    target: { value: "calendar" },
  });
  expect(screen.getByLabelText("X field")).toHaveTextContent("when");
});
