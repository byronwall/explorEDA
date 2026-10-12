import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, expect, it } from "vitest";
import { registerAllCharts } from "@/charts/registerAllCharts";
import { DataLayerProvider, useDataLayer } from "@/providers/DataLayerProvider";
import { ChartTraceScope } from "../trace/ChartTraceScope";
import { mapDefinition, type MapSettings } from "./definition";
import { clusterPoints } from "./pointClusters";
import type { MapPoint } from "./pointMapPlan";
import { PointMap } from "./PointMap";

beforeAll(registerAllCharts);

const point = (sourceId: number, x: number, y: number, color = "red") =>
  ({
    sourceId,
    x,
    y,
    color,
    label: `P${sourceId}`,
    matching: false,
  }) as MapPoint;

it("keeps lone points and groups points that share a screen cell", () => {
  const { singles, clusters } = clusterPoints([
    point(3, 10, 10),
    point(1, 12, 14, "blue"),
    point(2, 20, 20, "blue"),
    point(4, 300, 300),
  ]);
  expect(singles.map((item) => item.sourceId)).toEqual([4]);
  expect(clusters).toHaveLength(1);
  expect(clusters[0]).toMatchObject({
    sourceIds: [1, 2, 3],
    color: "blue",
    label: "P1",
  });
});

const settings: MapSettings = {
  ...mapDefinition.createDefaultSettings({ x: 0, y: 0, w: 8, h: 6 }),
  id: "crowd",
  latitudeField: "lat",
  longitudeField: "lon",
  labelField: "name",
};
// 2,100 sites in a 21 × 100 lattice, plus one far away.
const rows = [
  ...Array.from({ length: 2100 }, (_, index) => ({
    name: `Site ${index}`,
    lat: 40 + (index % 21) * 0.01,
    lon: -100 + Math.floor(index / 21) * 0.01,
  })),
  { name: "Remote", lat: -40, lon: 100 },
];
function Workspace() {
  const chart = useDataLayer((state) => state.charts[0]) as MapSettings;
  const wrapper = useDataLayer((state) => state.crossfilterWrapper);
  useDataLayer((state) => state.liveItems);
  return (
    <>
      <output aria-label="Selected count">
        {wrapper.getFilteredRowIds().length}
      </output>
      <ChartTraceScope>
        <PointMap settings={chart} width={800} height={500} />
      </ChartTraceScope>
    </>
  );
}

it("groups crowded maps, selects a group's rows, and can turn grouping off", () => {
  render(
    <DataLayerProvider data={rows} charts={[settings]}>
      <Workspace />
    </DataLayerProvider>
  );
  const group = screen.getByRole("button", {
    name: /^2100 rows grouped near Site 0/,
  });
  expect(group).toHaveAttribute("tabindex", "-1");
  const remote = screen.getByRole("button", { name: /^Remote;/ });
  expect(remote).toHaveAttribute("tabindex", "0");
  fireEvent.keyDown(remote, { key: "ArrowRight" });
  expect(document.activeElement).toBe(group);
  fireEvent.keyDown(group, { key: "Enter" });
  expect(screen.getByLabelText("Selected count").textContent).toBe("2100");
  fireEvent.click(group);
  expect(screen.getByLabelText("Selected count").textContent).toBe("2101");
  fireEvent.click(screen.getByRole("button", { name: "Map layers" }));
  fireEvent.click(screen.getByRole("switch", { name: "Group" }));
  expect(screen.queryByRole("button", { name: /grouped near/ })).toBeNull();
  expect(screen.getAllByRole("button", { name: /^Site / })).toHaveLength(2100);
});
