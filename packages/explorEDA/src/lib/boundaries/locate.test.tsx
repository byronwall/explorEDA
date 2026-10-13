import { render, screen, waitFor } from "@testing-library/react";
import { useEffect } from "react";
import { expect, it } from "vitest";
import { parseExpression } from "@/lib/calculations/parser/semantics";
import { DataLayerProvider, useDataLayer } from "@/providers/DataLayerProvider";
import { buildLocator } from "./locate";
import { loadBoundarySet } from "./registry";

it("finds the country, state, or county containing a point", async () => {
  const countries = buildLocator(await loadBoundarySet("world-countries"));
  expect(countries.locate(-122.42, 37.77)?.iso_a3).toBe("USA");
  expect(countries.locate(2.35, 48.86)?.iso_a3).toBe("FRA");
  expect(countries.locate(178.4, -17.8)?.iso_a3).toBe("FJI");
  expect(countries.locate(-30, 0)).toBeUndefined();
  const counties = buildLocator(await loadBoundarySet("us-counties"));
  expect(counties.locate(-118.24, 34.05)?.fips).toBe("06037");
});

it("locates 50,000 points against US counties quickly", async () => {
  const counties = buildLocator(await loadBoundarySet("us-counties"));
  let seed = 7;
  const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const points = Array.from({ length: 50_000 }, () => [
    -124 + random() * 57,
    25 + random() * 24,
  ]);
  const start = performance.now();
  const found = points.filter(([x, y]) => counties.locate(x!, y!)).length;
  const elapsed = performance.now() - start;
  // Most of the box is land inside a county.
  expect(found).toBeGreaterThan(25_000);
  console.info(`Located 50,000 points in ${Math.round(elapsed)} ms`);
  expect(elapsed).toBeLessThan(2_000);
});

function AddRegionColumn() {
  const add = useDataLayer((state) => state.addCalculation);
  const column = useDataLayer((state) => state.getColumnData("state"));
  useDataLayer((state) => state.nonce);
  useEffect(() => {
    void add({
      resultColumnName: "state",
      expression: parseExpression('region(lat, lon, "us-state")'),
    });
  }, [add]);
  return <output aria-label="States">{Object.values(column).join(",")}</output>;
}
it("fills a region() column once its boundaries load", async () => {
  render(
    <DataLayerProvider
      data={[
        { lat: 34.05, lon: -118.24 },
        { lat: 30.27, lon: -97.74 },
        { lat: 0, lon: -30 },
        { lat: null, lon: null },
      ]}
    >
      <AddRegionColumn />
    </DataLayerProvider>
  );
  await waitFor(() =>
    expect(screen.getByLabelText("States").textContent).toBe("CA,TX,,")
  );
});
