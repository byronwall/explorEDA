import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, expect, it, vi } from "vitest";
import { useState } from "react";
import { registerAllCharts } from "@/charts/registerAllCharts";
import { DataLayerProvider } from "@/providers/DataLayerProvider";
import { BoxPlotSettingsPanel } from "./BoxPlotSettingsPanel";
import { boxPlotDefinition, type BoxPlotSettings } from "./definition";

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

const initial: BoxPlotSettings = {
  ...boxPlotDefinition.createDefaultSettings(
    { x: 0, y: 0, w: 6, h: 5 },
    "value"
  ),
  id: "box",
  violinOverlay: true,
  autoBandwidth: false,
  violinBandwidth: 0.5,
};

function Probe() {
  const [settings, setSettings] = useState<BoxPlotSettings>(initial);
  return (
    <>
      <BoxPlotSettingsPanel
        settings={settings}
        onSettingsChange={setSettings}
      />
      <output aria-label="Bandwidth value">{settings.violinBandwidth}</output>
    </>
  );
}

it("keeps the last bandwidth when the input is cleared or zero", () => {
  render(
    <DataLayerProvider charts={[initial]} data={[{ value: 1 }, { value: 2 }]}>
      <Probe />
    </DataLayerProvider>
  );
  const input = screen.getByLabelText("Bandwidth");
  fireEvent.change(input, { target: { value: "" } });
  expect(screen.getByLabelText("Bandwidth value")).toHaveTextContent("0.5");
  fireEvent.change(input, { target: { value: "0" } });
  expect(screen.getByLabelText("Bandwidth value")).toHaveTextContent("0.5");
  fireEvent.change(input, { target: { value: "0.3" } });
  expect(screen.getByLabelText("Bandwidth value")).toHaveTextContent("0.3");
});
