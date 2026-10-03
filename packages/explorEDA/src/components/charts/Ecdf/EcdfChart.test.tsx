import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, expect, it } from "vitest";
import { registerAllCharts } from "@/charts/registerAllCharts";
import { DataLayerProvider, useDataLayer } from "@/providers/DataLayerProvider";
import { EcdfChart } from "./EcdfChart";
import { ecdfDefinition, type EcdfSettings } from "./definition";

beforeAll(registerAllCharts);

function Live() {
  const settings = useDataLayer((s) => s.charts[0]) as EcdfSettings;
  return (
    <>
      <EcdfChart settings={settings} width={500} height={300} />
      <output data-testid="filters">{JSON.stringify(settings.filters)}</output>
    </>
  );
}

it("steps through observed values with the keyboard and selects a threshold", () => {
  const chart: EcdfSettings = {
    ...ecdfDefinition.createDefaultSettings({ x: 0, y: 0, w: 6, h: 4 }, "Wait"),
    id: "ecdf",
  };
  render(
    <DataLayerProvider
      data={[{ Wait: 1 }, { Wait: 2 }, { Wait: 2 }, { Wait: 5 }]}
      charts={[chart]}
    >
      <Live />
    </DataLayerProvider>
  );
  const filters = () => JSON.parse(screen.getByTestId("filters").textContent!);
  const slider = screen.getByRole("slider", { name: "Wait threshold" });
  fireEvent.focus(slider);
  fireEvent.keyDown(slider, { key: "Home" });
  fireEvent.keyDown(slider, { key: "ArrowRight" });
  expect(slider).toHaveAttribute("aria-valuetext", "≤ 2: Wait 75%");
  // The share reads in the readout and beside the curve.
  expect(screen.getByText("75% (3/4)")).toBeInTheDocument();
  expect(
    screen.getByText("75%", { selector: ".eda-ecdf-value" })
  ).toBeInTheDocument();
  fireEvent.keyDown(slider, { key: "Enter" });
  expect(filters()).toEqual([{ type: "range", field: "Wait", max: 2 }]);
  expect(screen.getByText("≤ 2")).toBeInTheDocument();
  expect(screen.getByText("Selected ≤ 2: 75%")).toBeInTheDocument();
  fireEvent.keyDown(slider, { key: "Delete" });
  expect(filters()).toEqual([]);
});
