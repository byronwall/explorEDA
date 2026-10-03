import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, expect, it } from "vitest";
import { registerAllCharts } from "@/charts/registerAllCharts";
import { DataLayerProvider, useDataLayer } from "@/providers/DataLayerProvider";
import { stringifySavedData, validateSavedData } from "@/utils/saveDataUtils";
import { ChartTraceScope } from "../trace/ChartTraceScope";
import { ChartTracePanel } from "../trace/ChartTracePanel";
import { mapDefinition, type MapSettings } from "./definition";
import { fitMapCoordinates, WORLD_VIEW } from "./mapGeometry";
import { planPointMap, type MapSnapshot } from "./pointMapPlan";
import { PointMap } from "./PointMap";

beforeAll(registerAllCharts);
const settings: MapSettings = {
  ...mapDefinition.createDefaultSettings({ x: 0, y: 0, w: 8, h: 6 }),
  id: "map",
  latitudeField: "lat",
  longitudeField: "lon",
  labelField: "name",
  sizeField: "size",
  pointRadius: 16,
};
const rows = [
  { name: "East", lat: 10, lon: 179, size: 100 },
  { name: "West", lat: 11, lon: -179, size: 25 },
  { name: "Overlap", lat: 10, lon: 179, size: 0 },
  { name: "Missing", lat: null, lon: 12, size: 5 },
  { name: "Invalid", lat: "bad", lon: 12, size: 5 },
  { name: "Beyond north", lat: 91, lon: 12, size: 5 },
  { name: "Beyond east", lat: 10, lon: 181, size: 5 },
  { name: "Negative size", lat: 10, lon: 15, size: -1 },
  { name: "Pole", lat: 90, lon: 180, size: 4 },
];
const ids = rows.map((_, id) => id);
const snapshot: MapSnapshot = {
  revision: "1",
  allIds: ids,
  chartIds: ids,
  filteredIds: ids,
  columns: Object.fromEntries(
    ["lat", "lon", "name", "size"].map((field) => [
      field,
      Object.fromEntries(
        rows.map((row, id) => [id, row[field as keyof typeof row]])
      ),
    ])
  ),
};
it("keeps coordinate validity, area scaling, antimeridian fitting, and facet membership exact", () => {
  const plan = planPointMap(settings, snapshot, 800, 500);
  expect(plan.excluded.map((row) => row.sourceId)).toEqual([3, 4, 5, 6, 7]);
  expect(plan.points.map((row) => row.sourceId).sort()).toEqual([0, 1, 2, 8]);
  expect(plan.rows[0]!.radius / plan.rows[1]!.radius).toBe(2);
  expect(plan.rows[2]!.radius).toBe(2);
  const view = fitMapCoordinates(
    [
      [179, 10],
      [-179, 11],
    ],
    settings.projection,
    800,
    plan.mapHeight
  );
  expect(Math.abs(view.center[0])).toBeGreaterThan(178);
  expect(view.zoom).toBeGreaterThan(1);
  const fitted = planPointMap({ ...settings, view }, snapshot, 800, 500);
  expect(fitted.points.map((row) => row.sourceId).sort()).toEqual([0, 1, 2]);
  const resized = planPointMap({ ...settings, view }, snapshot, 390, 500);
  expect(resized.points.map((row) => row.sourceId).sort()).toEqual([0, 1, 2]);
  const facet = planPointMap(
    settings,
    { ...snapshot, facetIds: [0, 2, 3], chartIds: [0, 3], filteredIds: [0] },
    800,
    500
  );
  expect(facet.points.map((row) => row.sourceId)).toEqual([0]);
  expect(facet.excluded.map((row) => row.sourceId)).toEqual([3]);
  expect(facet.maxSize).toBe(100);
  expect(facet.coordinates).toEqual(plan.coordinates);
});
function Workspace() {
  const chart = useDataLayer((state) => state.charts[0]) as MapSettings;
  const wrapper = useDataLayer((state) => state.crossfilterWrapper);
  const live = useDataLayer((state) => state.liveItems);
  const save = useDataLayer((state) => state.saveToStructure);
  void live;
  return (
    <>
      <output aria-label="Selected IDs">
        {wrapper.getFilteredRowIds().join(",")}
      </output>
      <button
        onClick={() => {
          const saved = JSON.parse(stringifySavedData(save()));
          expect(validateSavedData(saved)).toBe(true);
          expect(saved.charts[0]).toMatchObject({
            type: "map",
            mode: "point",
            latitudeField: "lat",
            longitudeField: "lon",
            view: WORLD_VIEW,
          });
          saved.charts[0].view.center = [181, 0];
          expect(validateSavedData(saved)).toBe(false);
        }}
      >
        Check saved map
      </button>
      <ChartTraceScope>
        <PointMap settings={chart} width={800} height={500} />
        <ChartTracePanel />
      </ChartTraceScope>
    </>
  );
}
it("selects exact overlapping rows, traces exclusions, and keeps selection through view changes and save", () => {
  render(
    <DataLayerProvider data={rows} charts={[settings]}>
      <Workspace />
    </DataLayerProvider>
  );
  const point = screen.getByRole("button", {
    name: "East; row 0; latitude 10°; longitude 179°",
  });
  fireEvent.click(point);
  expect(screen.getByLabelText("Selected IDs").textContent).toBe("0");
  fireEvent.keyDown(point, { key: "ArrowRight" });
  fireEvent.keyDown(document.activeElement!, { key: "Enter" });
  expect(screen.getByLabelText("Selected IDs").textContent).toBe("1");
  fireEvent.keyDown(document.activeElement!, { key: "Enter", altKey: true });
  expect(screen.getByLabelText("Map trace")).toHaveTextContent("Source row 1");
  expect(screen.getByLabelText("Map trace")).toHaveTextContent(
    "Size domain: 0 to 100"
  );
  fireEvent.click(screen.getByRole("button", { name: "Fit data" }));
  expect(screen.getByLabelText("Selected IDs").textContent).toBe("1");
  fireEvent.click(screen.getByRole("button", { name: "Reset view" }));
  expect(screen.getByLabelText("Selected IDs").textContent).toBe("1");
  fireEvent.click(screen.getByRole("button", { name: "5 omitted rows" }));
  fireEvent.click(screen.getByRole("button", { name: "4" }));
  expect(screen.getByLabelText("Map trace")).toHaveTextContent(
    "Latitude is missing or not finite"
  );
  expect(screen.getByLabelText("Map trace")).toHaveTextContent("bad");
  fireEvent.click(screen.getByRole("button", { name: "Check saved map" }));
  fireEvent.keyDown(point, { key: "Escape" });
  expect(screen.getByLabelText("Selected IDs").textContent).toBe(ids.join(","));
});
