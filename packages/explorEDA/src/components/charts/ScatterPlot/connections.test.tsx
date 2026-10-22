import { render, screen } from "@testing-library/react";
import { beforeAll, expect, it } from "vitest";
import { registerAllCharts } from "@/charts/registerAllCharts";
import { DataLayerProvider } from "@/providers/DataLayerProvider";
import { ScatterPlot } from "./ScatterPlot";
import { scatterPlotDefinition, type ScatterPlotSettings } from "./definition";

beforeAll(() => {
  registerAllCharts();
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
});

it("draws one labeled path per group and none when off", () => {
  const settings: ScatterPlotSettings = {
    ...scatterPlotDefinition.createDefaultSettings({ x: 0, y: 0, w: 6, h: 5 }),
    id: "slope",
    xField: "Year",
    yField: "Tax",
    connect: { orderField: "Year", groupField: "Country", labels: "both" },
  };
  const data = [
    { Country: "Chile", Year: 2023, Tax: 18 },
    { Country: "Austria", Year: 2000, Tax: 26 },
    { Country: "Chile", Year: 2000, Tax: 15 },
    { Country: "Austria", Year: 2023, Tax: 25 },
  ];
  const { unmount } = render(
    <DataLayerProvider data={data} charts={[settings]}>
      <ScatterPlot settings={settings} width={600} height={360} />
    </DataLayerProvider>
  );
  expect(
    screen
      .getAllByRole("img", { name: /^Path · / })
      .map((path) => path.getAttribute("aria-label"))
  ).toEqual(["Path · Austria: 1 segment", "Path · Chile: 1 segment"]);
  expect(screen.getAllByText("Chile")).toHaveLength(2);
  unmount();

  const plain = { ...settings, connect: undefined };
  render(
    <DataLayerProvider data={data} charts={[plain]}>
      <ScatterPlot settings={plain} width={600} height={360} />
    </DataLayerProvider>
  );
  expect(screen.queryAllByRole("img", { name: /^Path · / })).toHaveLength(0);
});
