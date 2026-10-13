import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, expect, it } from "vitest";
import { registerAllCharts } from "@/charts/registerAllCharts";
import { DataLayerProvider, useDataLayer } from "@/providers/DataLayerProvider";
import { ChartTraceScope } from "../trace/ChartTraceScope";
import { ChartTracePanel } from "../trace/ChartTracePanel";
import { mapDefinition, type MapSettings } from "./definition";
import {
  registerMapLibre,
  type StreetMapEvent,
  type StreetMapInstance,
} from "./mapEngine";
import { planPointMap, pointMapHeight } from "./pointMapPlan";
import { PointMap } from "./PointMap";
import {
  isStreetView,
  STREET_MIN_ZOOM,
  streetZoom,
  viewZoom,
} from "./streetCamera";

beforeAll(registerAllCharts);

/** A stand-in for maplibre-gl that records options and replays events. */
class FakeMap implements StreetMapInstance {
  static instances: FakeMap[] = [];
  handlers = new Map<string, ((event: StreetMapEvent) => void)[]>();
  center: { lng: number; lat: number };
  zoom: number;
  removed = false;
  style: unknown;
  constructor(public options: Record<string, unknown>) {
    const [lng, lat] = options.center as [number, number];
    this.center = { lng, lat };
    this.zoom = options.zoom as number;
    this.style = options.style;
    FakeMap.instances.push(this);
  }
  on(type: string, listener: (event: StreetMapEvent) => void) {
    this.handlers.set(type, [...(this.handlers.get(type) ?? []), listener]);
  }
  emit(type: string, event: StreetMapEvent = {}) {
    act(() => this.handlers.get(type)?.forEach((listener) => listener(event)));
  }
  remove() {
    this.removed = true;
  }
  resize() {}
  jumpTo(camera: { center: [number, number]; zoom: number }) {
    this.center = { lng: camera.center[0], lat: camera.center[1] };
    this.zoom = camera.zoom;
  }
  getCenter() {
    return this.center;
  }
  getZoom() {
    return this.zoom;
  }
  setStyle(style: string) {
    this.style = style;
  }
}
const fake = { Map: FakeMap };
let unregister: (() => void) | undefined;
afterEach(() => {
  unregister?.();
  unregister = undefined;
  FakeMap.instances = [];
});

const rows = [
  { name: "Ferry", lat: 47.6, lon: -122.34 },
  { name: "Market", lat: 47.61, lon: -122.34 },
  { name: "Pole", lat: 89, lon: 0 },
];
const base: MapSettings = {
  ...mapDefinition.createDefaultSettings({ x: 0, y: 0, w: 8, h: 6 }),
  id: "streets",
  latitudeField: "lat",
  longitudeField: "lon",
  labelField: "name",
};
const height = pointMapHeight(base, 500);
const cityView = {
  center: [-122.34, 47.605] as [number, number],
  zoom: viewZoom(12, base.projection, 800, height),
};

function Workspace() {
  const chart = useDataLayer((state) => state.charts[0]) as MapSettings;
  const wrapper = useDataLayer((state) => state.crossfilterWrapper);
  useDataLayer((state) => state.liveItems);
  return (
    <>
      <output aria-label="Selected IDs">
        {wrapper.getFilteredRowIds().join(",")}
      </output>
      <output aria-label="Saved zoom">{chart.view?.zoom}</output>
      <ChartTraceScope>
        <PointMap settings={chart} width={800} height={500} />
        <ChartTracePanel />
      </ChartTraceScope>
    </>
  );
}
const renderMap = (settings: MapSettings) =>
  render(
    <DataLayerProvider data={rows} charts={[settings]}>
      <Workspace />
    </DataLayerProvider>
  );

it("keeps scale across the handoff and switches at continent scale", () => {
  const view = { center: [10, 20] as [number, number], zoom: 7 };
  const zoom = streetZoom(view, "equal-earth", 800, height);
  expect(viewZoom(zoom, "equal-earth", 800, height)).toBeCloseTo(7);
  const threshold = viewZoom(STREET_MIN_ZOOM, "equal-earth", 800, height);
  expect(
    isStreetView({ ...view, zoom: threshold }, "equal-earth", 800, height)
  ).toBe(true);
  expect(
    isStreetView({ ...view, zoom: threshold * 0.9 }, "equal-earth", 800, height)
  ).toBe(false);
  const plan = planPointMap(
    { ...base, view: cityView },
    {
      revision: "1",
      allIds: [0, 1, 2],
      chartIds: [0, 1, 2],
      filteredIds: [0, 1, 2],
      columns: {
        lat: { 0: 47.6, 1: 47.61, 2: 89 },
        lon: { 0: -122.34, 1: -122.34, 2: 0 },
      },
    },
    800,
    500,
    true
  );
  expect(plan.points.map((point) => point.sourceId).sort()).toEqual([0, 1]);
  expect(plan.offscreen.map((point) => point.sourceId)).toEqual([2]);
  // About 1.1 km of latitude at zoom 12 is tens of pixels.
  const [a, b] = [plan.rows[0]!, plan.rows[1]!];
  expect(a.y! - b.y!).toBeGreaterThan(20);
});

it("draws the outline map without a registered engine", () => {
  renderMap({ ...base, view: cityView });
  expect(document.querySelector("[data-street-basemap]")).toBeNull();
  expect(screen.getByText(/Equal Earth/)).toBeInTheDocument();
});

it("hands a zoomed-in view to the street engine and keeps selection meaning", () => {
  unregister = registerMapLibre(fake);
  renderMap({ ...base, view: cityView });
  const map = FakeMap.instances[0]!;
  expect(map.style).toContain("positron");
  expect(map.zoom).toBeCloseTo(12);
  expect(screen.getByText(/Street map/)).toBeInTheDocument();
  fireEvent.click(
    screen.getByRole("button", {
      name: "Ferry; row 0; latitude 47.6°; longitude -122.34°",
    })
  );
  expect(screen.getByLabelText("Selected IDs").textContent).toBe("0");
  map.emit("click", { originalEvent: { altKey: true } });
  expect(screen.getByLabelText("Selected IDs").textContent).toBe("0");
  map.emit("click", { originalEvent: { altKey: false } });
  expect(screen.getByLabelText("Selected IDs").textContent).toBe("0,1,2");
  map.zoom = 13;
  map.emit("move");
  map.emit("moveend", { originalEvent: {} });
  expect(Number(screen.getByLabelText("Saved zoom").textContent)).toBeCloseTo(
    viewZoom(13, base.projection, 800, height)
  );
  map.zoom = 1;
  map.emit("moveend", { originalEvent: {} });
  expect(map.removed).toBe(true);
  expect(screen.getByText(/Equal Earth/)).toBeInTheDocument();
});

it("falls back to the outline map when the street style cannot load", () => {
  unregister = registerMapLibre(fake);
  renderMap({ ...base, view: cityView });
  FakeMap.instances[0]!.emit("error", { error: new Error("blocked") });
  expect(screen.getByText(/Street map unavailable/)).toBeInTheDocument();
  expect(document.querySelector("[data-street-basemap]")).toBeNull();
  fireEvent.click(
    screen.getByRole("button", {
      name: "Market; row 1; latitude 47.61°; longitude -122.34°",
    })
  );
  expect(screen.getByLabelText("Selected IDs").textContent).toBe("1");
});
