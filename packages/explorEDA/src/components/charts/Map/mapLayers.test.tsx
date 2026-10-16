import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeAll, expect, it } from "vitest";
import { registerAllCharts } from "@/charts/registerAllCharts";
import { DataLayerProvider, useDataLayer } from "@/providers/DataLayerProvider";
import { ChartTraceScope } from "../trace/ChartTraceScope";
import { mapDefinition, type MapSettings } from "./definition";
import { PointMap } from "./PointMap";
import { RegionMap } from "./RegionMap";

beforeAll(registerAllCharts);
const settings: MapSettings = {
  ...mapDefinition.createDefaultSettings({ x: 0, y: 0, w: 8, h: 6 }),
  id: "layers",
  latitudeField: "lat",
  longitudeField: "lon",
  labelField: "name",
};
const rows = [
  { name: "Austin", lat: 30.27, lon: -97.74 },
  { name: "Denver", lat: 39.74, lon: -104.99 },
];

function Workspace() {
  const chart = useDataLayer((state) => state.charts[0]) as MapSettings;
  const wrapper = useDataLayer((state) => state.crossfilterWrapper);
  useDataLayer((state) => state.liveItems);
  return (
    <>
      <output aria-label="Selected IDs">
        {wrapper.getFilteredRowIds().join(",")}
      </output>
      <ChartTraceScope>
        {chart.mode === "region" ? (
          <RegionMap settings={chart} width={800} height={500} />
        ) : (
          <PointMap settings={chart} width={800} height={500} />
        )}
      </ChartTraceScope>
    </>
  );
}
const open = () =>
  fireEvent.click(screen.getByRole("button", { name: "Map layers" }));
const svg = () => screen.getByRole("group", { name: /^(Point|Region) map$/ });

it("hides points without changing the selection, and labels them", async () => {
  render(
    <DataLayerProvider data={rows} charts={[settings]}>
      <Workspace />
    </DataLayerProvider>
  );
  fireEvent.click(screen.getByRole("button", { name: /^Austin;/ }));
  expect(screen.getByLabelText("Selected IDs").textContent).toBe("0");
  open();
  fireEvent.click(screen.getByRole("switch", { name: "Labels" }));
  expect(svg().querySelectorAll("text")).toHaveLength(2);
  fireEvent.click(screen.getByRole("switch", { name: "Points" }));
  expect(screen.queryByRole("button", { name: /^Austin;/ })).toBeNull();
  expect(svg().querySelectorAll("text")).toHaveLength(0);
  expect(screen.getByText(/2 hidden/)).toBeInTheDocument();
  expect(screen.getByLabelText("Selected IDs").textContent).toBe("0");
});

it("draws reference outlines beneath points and can drop the basemap", async () => {
  render(
    <DataLayerProvider data={rows} charts={[settings]}>
      <Workspace />
    </DataLayerProvider>
  );
  const paths = () => svg().querySelectorAll("path").length;
  const before = paths();
  open();
  fireEvent.change(screen.getByLabelText("Outlines"), {
    target: { value: "boundary:us-states" },
  });
  await waitFor(() => expect(paths()).toBe(before + 1));
  const outline = [...svg().querySelectorAll("path")].at(-1)!;
  expect(outline).toHaveClass("pointer-events-none");
  fireEvent.click(screen.getByRole("radio", { name: "No basemap" }));
  await waitFor(() => expect(paths()).toBe(1));
});

it("toggles region labels and the land basemap on region maps", async () => {
  const region: MapSettings = {
    ...settings,
    mode: "region",
    geometryAssetId: "boundary:us-states",
    regionField: "state",
    featureKey: "usps",
    aggregation: "count",
    showRegionLabels: false,
    outlineWidth: 1,
  };
  render(
    <DataLayerProvider
      data={[{ state: "TX" }, { state: "CO" }]}
      charts={[region]}
    >
      <Workspace />
    </DataLayerProvider>
  );
  await screen.findByRole("button", { name: /^TX;/ });
  open();
  expect(screen.queryByRole("switch", { name: "Points" })).toBeNull();
  fireEvent.click(screen.getByRole("switch", { name: "Labels" }));
  expect(svg().querySelectorAll("text").length).toBeGreaterThan(0);
  const before = svg().querySelectorAll("path").length;
  fireEvent.click(screen.getByRole("radio", { name: "No basemap" }));
  expect(svg().querySelectorAll("path").length).toBe(before - 1);
});
