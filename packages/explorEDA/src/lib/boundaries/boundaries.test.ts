import { expect, it } from "vitest";
import {
  boundaryAssetId,
  boundaryIdOf,
  findBoundarySet,
  loadBoundarySet,
  registerBoundarySet,
} from "./registry";

const props = async (id: string, key: string, value: unknown) =>
  (await loadBoundarySet(id)).features.find(
    (feature) => feature.properties?.[key] === value
  )?.properties;

it("loads world countries with ISO codes for joining", async () => {
  expect(await props("world-countries", "iso_a3", "USA")).toEqual({
    name: "United States of America",
    iso_a2: "US",
    iso_a3: "USA",
    iso_n3: "840",
  });
  expect(await props("world-countries", "name", "Kosovo")).toMatchObject({
    iso_a3: "XKX",
  });
  const countries = await loadBoundarySet("world-countries");
  const coded = countries.features.filter((item) => item.properties?.iso_a3);
  expect(coded.length).toBe(countries.features.length - 2);
});

it("loads US states and counties with FIPS and postal codes", async () => {
  expect(await props("us-states", "usps", "CA")).toEqual({
    name: "California",
    fips: "06",
    usps: "CA",
  });
  expect(await props("us-counties", "fips", "06037")).toMatchObject({
    label: "Los Angeles, CA",
    state: "CA",
  });
  expect(
    (await loadBoundarySet("us-counties")).features.length
  ).toBeGreaterThan(3000);
});

it("reuses loads, and lets a host add or replace a set", async () => {
  expect(loadBoundarySet("world-countries")).toBe(
    loadBoundarySet("world-countries")
  );
  const geometry = await loadBoundarySet("us-states");
  const unregister = registerBoundarySet({
    id: "test-provinces",
    name: "Test provinces",
    source: "Fixture",
    level: "state",
    coverage: "CAN",
    keys: [{ property: "name", label: "Name" }],
    load: async () => geometry,
  });
  expect(findBoundarySet("test-provinces")?.name).toBe("Test provinces");
  expect(boundaryIdOf(boundaryAssetId("test-provinces"))).toBe(
    "test-provinces"
  );
  unregister();
  expect(findBoundarySet("test-provinces")).toBeUndefined();
  await expect(loadBoundarySet("test-provinces")).rejects.toThrow();
});
