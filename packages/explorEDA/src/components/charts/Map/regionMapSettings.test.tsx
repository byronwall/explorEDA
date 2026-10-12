import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { beforeAll, expect, it } from "vitest";
import { registerAllCharts } from "@/charts/registerAllCharts";
import { DataLayerProvider, useDataLayer } from "@/providers/DataLayerProvider";
import { mapDefinition, type MapSettings } from "./definition";
import { RegionMapSettings } from "./RegionMapSettings";

beforeAll(registerAllCharts);
const settings: MapSettings = {
  ...mapDefinition.createDefaultSettings({ x: 0, y: 0, w: 8, h: 6 }),
  id: "regions",
  mode: "region",
  regionField: "region",
  aggregation: "count",
};
const geometry = JSON.stringify({
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { code: 1 },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [0, 0],
            [1, 0],
            [1, 1],
            [0, 0],
          ],
        ],
      },
    },
  ],
});

function Panel({ onChange }: { onChange: (next: MapSettings) => void }) {
  const assets = useDataLayer((state) => state.geometryAssets);
  return (
    <>
      <output aria-label="Assets">{assets.length}</output>
      <RegionMapSettings settings={settings} onSettingsChange={onChange} />
    </>
  );
}
const paste = (text: string) => {
  fireEvent.click(screen.getByText("Import GeoJSON"));
  fireEvent.change(screen.getByLabelText("Paste GeoJSON"), {
    target: { value: text },
  });
  fireEvent.click(screen.getByRole("button", { name: "Import geometry" }));
};

it("adds nothing when the chart cannot take the imported geometry", () => {
  render(
    <DataLayerProvider data={[{ region: 1 }]} charts={[settings]}>
      <Panel
        onChange={() => {
          throw new Error("read-only preview");
        }}
      />
    </DataLayerProvider>
  );
  paste(geometry);
  expect(screen.getByLabelText("Assets").textContent).toBe("0");
  expect(screen.getByRole("alert")).toHaveTextContent("read-only preview");
});

it("lists located problems and imports nothing for invalid GeoJSON", () => {
  render(
    <DataLayerProvider data={[{ region: 1 }]} charts={[settings]}>
      <Panel onChange={() => {}} />
    </DataLayerProvider>
  );
  paste("{");
  expect(screen.getByRole("alert")).toHaveTextContent("Not valid JSON");
  paste(geometry.replace('"Polygon"', '"LineString"'));
  expect(screen.getByRole("alert")).toHaveTextContent(
    "Feature 0 is a LineString; use Polygon or MultiPolygon"
  );
  expect(screen.getByLabelText("Assets").textContent).toBe("0");
});

function Live() {
  const [current, setCurrent] = useState(settings);
  const assets = useDataLayer((state) => state.geometryAssets);
  return (
    <>
      <output aria-label="Assets">{assets.length}</output>
      <RegionMapSettings settings={current} onSettingsChange={setCurrent} />
    </>
  );
}
it("imports valid geometry, shows its size, and flags keys that differ only in type", () => {
  render(
    <DataLayerProvider
      data={[{ region: "1" }, { region: "2" }, { region: null }]}
      charts={[settings]}
    >
      <Live />
    </DataLayerProvider>
  );
  paste(geometry);
  expect(screen.getByLabelText("Assets").textContent).toBe("1");
  expect(
    screen.getByText(/1 feature · 4 vertices · Pasted GeoJSON/)
  ).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText("Feature key"), {
    target: { value: "code" },
  });
  expect(screen.getByText(/Unmatched row keys:/)).toHaveTextContent(
    `Unmatched row keys: "1" (string), "2" (string), missing`
  );
  expect(
    screen.getByText(/1 row matches a feature key only as text/)
  ).toHaveTextContent(`"1" (string) and 1 (number)`);
});
