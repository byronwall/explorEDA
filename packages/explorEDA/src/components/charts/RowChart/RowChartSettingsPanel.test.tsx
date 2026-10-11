import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, expect, it, vi } from "vitest";
import { useState } from "react";
import { registerAllCharts } from "@/charts/registerAllCharts";
import { DataLayerProvider, useDataLayer } from "@/providers/DataLayerProvider";
import type { RowChartSettings } from "@/types/ChartTypes";
import { rowChartDefinition } from "./definition";
import { RowChartSettingsPanel } from "./RowChartSettingsPanel";

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

const initial: RowChartSettings = {
  ...rowChartDefinition.createDefaultSettings(
    { x: 0, y: 0, w: 6, h: 4 },
    "Region"
  ),
  id: "ranking",
};

function Probe() {
  const updateChart = useDataLayer((state) => state.updateChart);
  const aggregates = useDataLayer((state) => state.aggregates);
  const [settings, setSettings] = useState<RowChartSettings>(initial);
  return (
    <>
      <RowChartSettingsPanel
        settings={settings}
        onSettingsChange={(next) => {
          setSettings(next);
          updateChart(initial.id, next);
        }}
      />
      <output aria-label="Settings">
        {JSON.stringify({
          aggregateId: settings.aggregateId ?? null,
          title: settings.title,
          field: settings.field,
          topN: settings.topN ?? null,
        })}
      </output>
      <output aria-label="Summaries">{JSON.stringify(aggregates)}</output>
    </>
  );
}

const read = (label: string) =>
  JSON.parse(screen.getByLabelText(label).textContent!);

it("creates a summary, edits it, and sets Top N", () => {
  render(
    <DataLayerProvider
      charts={[initial]}
      data={[
        { Region: "North", Channel: "Web", Revenue: 10 },
        { Region: "South", Channel: "Store", Revenue: 4 },
      ]}
    >
      <Probe />
    </DataLayerProvider>
  );
  fireEvent.change(screen.getByLabelText("Measure"), {
    target: { value: "new:sum" },
  });
  const [summary] = read("Summaries");
  expect(summary).toMatchObject({
    name: "Sum of Revenue by Region",
    groupField: "Region",
    measureField: "Revenue",
    aggregation: "sum",
  });
  expect(read("Settings")).toMatchObject({
    aggregateId: summary.id,
    title: "Sum of Revenue by Region",
  });

  fireEvent.change(screen.getByLabelText("Operation"), {
    target: { value: "average" },
  });
  expect(read("Summaries")[0].name).toBe("Average of Revenue by Region");
  expect(read("Settings").title).toBe("Average of Revenue by Region");

  const topN = screen.getByLabelText("Top N");
  fireEvent.change(topN, { target: { value: "3" } });
  expect(read("Settings").topN).toBeNull();
  fireEvent.keyDown(topN, { key: "Enter" });
  expect(read("Settings").topN).toBe(3);
  fireEvent.change(topN, { target: { value: "" } });
  fireEvent.blur(topN);
  expect(read("Settings").topN).toBeNull();
});
