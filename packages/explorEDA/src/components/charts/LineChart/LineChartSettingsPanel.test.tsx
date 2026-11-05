import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, expect, it, vi } from "vitest";
import { useState } from "react";
import { registerAllCharts } from "@/charts/registerAllCharts";
import { DataLayerProvider } from "@/providers/DataLayerProvider";
import { lineChartDefinition, type LineChartSettings } from "./definition";
import { LineChartSettingsPanel } from "./LineChartSettingsPanel";

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
  Element.prototype.scrollIntoView = () => {};
});

const initial: LineChartSettings = {
  ...lineChartDefinition.createDefaultSettings({ x: 0, y: 0, w: 6, h: 4 }),
  id: "line",
  xField: "day",
  seriesField: ["visitors"],
  filters: [
    { type: "range", field: "day", min: 1, max: 2 },
    { type: "value", field: "site", values: ["a"] },
  ],
};

function Probe() {
  const [settings, setSettings] = useState<LineChartSettings>(initial);
  return (
    <>
      <LineChartSettingsPanel
        settings={settings}
        onSettingsChange={(next) => setSettings(next)}
      />
      <output aria-label="Settings">
        {JSON.stringify({ xField: settings.xField, filters: settings.filters })}
      </output>
    </>
  );
}

it("drops the selection on the previous x field when the x field changes", () => {
  render(
    <DataLayerProvider
      charts={[initial]}
      data={[
        { day: 1, hour: 10, visitors: 4, site: "a" },
        { day: 2, hour: 11, visitors: 5, site: "b" },
      ]}
    >
      <Probe />
    </DataLayerProvider>
  );
  fireEvent.click(screen.getByRole("combobox", { name: "Select field" }));
  fireEvent.click(screen.getByRole("option", { name: /hour/ }));
  expect(JSON.parse(screen.getByLabelText("Settings").textContent!)).toEqual({
    xField: "hour",
    filters: [{ type: "value", field: "site", values: ["a"] }],
  });
});
