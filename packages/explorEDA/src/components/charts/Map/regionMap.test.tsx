import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, expect, it } from "vitest";
import type { GeometryAsset, RegionGeometry } from "@/lib/geometryAssets";
import { isRegionGeometry } from "@/lib/geometryAssets";
import { registerAllCharts } from "@/charts/registerAllCharts";
import { DataLayerProvider, useDataLayer } from "@/providers/DataLayerProvider";
import { stringifySavedData, validateSavedData } from "@/utils/saveDataUtils";
import { ChartTraceScope } from "../trace/ChartTraceScope";
import { ChartTracePanel } from "../trace/ChartTracePanel";
import { mapDefinition, type MapSettings } from "./definition";
import { planRegionMap, regionFilters } from "./regionMapPlan";
import { fitRegionGeometry, regionGeometry } from "./regionGeometry";
import { RegionMap } from "./RegionMap";
import type { MapSnapshot } from "./pointMapPlan";

beforeAll(registerAllCharts);
const box = (west: number, south: number, east: number, north: number) => [
  [west, south],
  [east, south],
  [east, north],
  [west, north],
  [west, south],
];
const geometry: RegionGeometry = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      id: "a-main",
      properties: { key: "A" },
      geometry: {
        type: "Polygon",
        coordinates: [box(0, 0, 10, 10), box(2, 2, 4, 4)],
      },
    },
    {
      type: "Feature",
      id: "a-island",
      properties: { key: "A" },
      geometry: { type: "Polygon", coordinates: [box(12, 0, 14, 2)] },
    },
    {
      type: "Feature",
      properties: { key: "Zero" },
      geometry: { type: "Polygon", coordinates: [box(15, 0, 25, 10)] },
    },
    {
      type: "Feature",
      properties: { key: "Invalid" },
      geometry: { type: "Polygon", coordinates: [box(30, 0, 40, 10)] },
    },
    {
      type: "Feature",
      properties: { key: "Empty" },
      geometry: { type: "Polygon", coordinates: [box(45, 0, 55, 10)] },
    },
    {
      type: "Feature",
      properties: { key: 1 },
      geometry: { type: "Polygon", coordinates: [box(60, 0, 70, 10)] },
    },
    {
      type: "Feature",
      properties: { key: "Date line" },
      geometry: {
        type: "MultiPolygon",
        coordinates: [[box(175, -10, 180, 0)], [box(-180, -10, -175, 0)]],
      },
    },
  ],
};
const asset: GeometryAsset = {
  id: "regions",
  name: "Regions",
  source: "Fixture GeoJSON",
  geometry,
};
const settings: MapSettings = {
  ...mapDefinition.createDefaultSettings({ x: 0, y: 0, w: 8, h: 6 }),
  id: "regions-map",
  mode: "region",
  geometryAssetId: asset.id,
  regionField: "region",
  featureKey: "key",
  aggregation: "sum",
  measureField: "value",
  outlineWidth: 1,
  showRegionLabels: false,
};
const rows = [
  { region: "A", value: 10 },
  { region: "A", value: -6 },
  { region: "Zero", value: 0 },
  { region: "Invalid", value: "bad" },
  { region: "Unknown", value: 5 },
  { region: null, value: 9 },
  { region: "1", value: 7 },
  { region: 1, value: 3 },
  { region: "Date line", value: 2 },
];
const ids = rows.map((_, id) => id);
const snapshot: MapSnapshot = {
  revision: "1",
  allIds: ids,
  chartIds: ids,
  filteredIds: ids,
  columns: Object.fromEntries(
    ["region", "value"].map((field) => [
      field,
      Object.fromEntries(
        rows.map((row, id) => [id, row[field as keyof typeof row]])
      ),
    ])
  ),
};

it("joins typed keys once, preserves metric states and holes, and fits date-line polygons", () => {
  expect(isRegionGeometry(geometry)).toBe(true);
  expect(
    isRegionGeometry({
      ...geometry,
      features: [
        {
          ...geometry.features[0],
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [0, 0],
                [1, 0],
                [1, 91],
                [0, 0],
              ],
            ],
          },
        },
      ],
    })
  ).toBe(false);
  const plan = planRegionMap(settings, snapshot, asset, 800, 500);
  const a = plan.regions.find((region) => region.key === "A")!;
  expect(a.features).toEqual([0, 1]);
  expect(a.value).toBe(4);
  expect(a.contributors.map((row) => row.sourceId)).toEqual([0, 1]);
  expect(a.area).toBeGreaterThan(0);
  expect(a.area).toBeLessThan((800 * 500) / 20);
  const solid = structuredClone(asset);
  solid.geometry.features[0]!.geometry = {
    type: "Polygon",
    coordinates: [box(0, 0, 10, 10)],
  };
  expect(a.area).toBeLessThan(
    planRegionMap(settings, snapshot, solid, 800, 500).regions[0]!.area
  );
  expect(plan.unmatched.map((row) => row.sourceId)).toEqual([4, 5, 6]);
  expect(plan.regions.find((region) => region.key === 1)?.sourceIds).toEqual([
    7,
  ]);
  expect(plan.regions.find((region) => region.key === "Zero")?.state).toBe(
    "value"
  );
  expect(plan.regions.find((region) => region.key === "Invalid")?.state).toBe(
    "invalid"
  );
  expect(plan.regions.find((region) => region.key === "Empty")?.state).toBe(
    "empty"
  );
  const filtered = planRegionMap(
    settings,
    { ...snapshot, chartIds: [0], filteredIds: [0], facetIds: [0] },
    asset,
    800,
    500
  );
  expect(filtered.regions[0]!.value).toBe(10);
  expect(filtered.domain).toEqual(plan.domain);
  expect(plan.domain).toEqual([-10, 10]);
  expect(regionFilters(settings, filtered.regions[0]!, [0])).toEqual([
    { type: "value", field: "region", values: ["A"] },
    { type: "value", field: "__ID", values: [0] },
  ]);
  const selected = {
    ...settings,
    filters: regionFilters(settings, filtered.regions[0]!, [0]),
  };
  expect(
    planRegionMap(selected, { ...snapshot, facetIds: [1] }, asset, 800, 500)
      .regions[0]!.selected
  ).toBe(false);
  expect(
    planRegionMap(
      { ...settings, aggregation: "average" },
      snapshot,
      asset,
      800,
      500
    ).regions[0]!.value
  ).toBe(2);
  const dateLine = regionGeometry({
    type: "FeatureCollection",
    features: [geometry.features[6]!],
  });
  const view = fitRegionGeometry(dateLine, settings.projection, 800, 400);
  expect(Math.abs(view.center[0])).toBeGreaterThan(175);
  expect(view.zoom).toBeGreaterThan(1);
  const dateAsset = { ...asset, geometry: dateLine };
  expect(
    planRegionMap({ ...settings, view }, snapshot, dateAsset, 390, 500)
      .regions[0]!.path
  ).not.toBe("");
});

function Workspace() {
  const settings = useDataLayer((state) => state.charts[0]) as MapSettings;
  const wrapper = useDataLayer((state) => state.crossfilterWrapper);
  const nonce = useDataLayer((state) => state.nonce);
  const save = useDataLayer((state) => state.saveToStructure);
  const restore = useDataLayer((state) => state.restoreFromStructure);
  const add = useDataLayer((state) => state.addGeometryAsset);
  void nonce;
  return (
    <>
      <output aria-label="Selected rows">
        {wrapper.getFilteredRowIds().join(",")}
      </output>
      <button onClick={() => add(asset)}>Load geometry</button>
      <button
        onClick={() => {
          const saved = JSON.parse(stringifySavedData(save()));
          expect(validateSavedData(saved)).toBe(true);
          expect(saved.geometryAssets).toHaveLength(1);
          expect(saved.charts[0].geometry).toBeUndefined();
          restore(saved);
        }}
      >
        Round trip
      </button>
      <ChartTraceScope>
        <RegionMap settings={settings} width={800} height={500} />
        <ChartTracePanel />
      </ChartTraceScope>
    </>
  );
}
it("selects exact joined rows, traces unmatched inputs, and restores shared geometry", () => {
  render(
    <DataLayerProvider data={rows} charts={[settings]}>
      <Workspace />
    </DataLayerProvider>
  );
  fireEvent.click(screen.getByText("Load geometry"));
  const a = screen.getByRole("button", { name: "A; Sum of value: 4; 2 rows" });
  fireEvent.click(a);
  expect(screen.getByLabelText("Selected rows")).toHaveTextContent("0,1");
  fireEvent.click(screen.getByText("Round trip"));
  expect(screen.getByLabelText("Selected rows")).toHaveTextContent("0,1");
  fireEvent.keyDown(a, { key: "Enter", altKey: true });
  expect(screen.getByLabelText("Region map trace")).toHaveTextContent(
    '"a-main", "a-island"'
  );
  expect(
    screen.getByRole("table", { name: "Aggregate source contributors" })
  ).toHaveTextContent("10");
  fireEvent.keyDown(a, { key: "Escape" });
  fireEvent.click(
    screen.getByRole("button", { name: "Empty; No rows; 0 rows" })
  );
  expect(screen.getByLabelText("Selected rows")).toHaveTextContent(
    ids.join(",")
  );
  expect(screen.getByLabelText("Region map trace")).toHaveTextContent(
    "No rows"
  );
  fireEvent.change(screen.getByRole("spinbutton", { name: "Source row ID" }), {
    target: { value: "6" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Find row" }));
  expect(screen.getByLabelText("Region map trace")).toHaveTextContent(
    "No matching feature key"
  );
});
