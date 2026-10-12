import { expect, it } from "vitest";
import { inferRegionField } from "./infer";

it("picks the field and supplied boundaries the values join to", () => {
  expect(
    inferRegionField([
      { field: "name", values: ["Chile", "Peru", "Iran"] },
      { field: "code", values: ["CHL", "PER", "IRN", "CHL", null] },
    ])
  ).toEqual({
    field: "code",
    setId: "world-countries",
    featureKey: "iso_a3",
    share: 1,
  });
  expect(
    inferRegionField([
      { field: "state", values: ["CA", "TX", "NY", "ZZ", "WA"] },
    ])
  ).toMatchObject({ setId: "us-states", featureKey: "usps", share: 0.8 });
  expect(
    inferRegionField([{ field: "county", values: ["06037", "48453", "36061"] }])
  ).toMatchObject({ setId: "us-counties", featureKey: "fips" });
});

it("prefers the boundary set more values match, and skips numeric keys", () => {
  // DE and US are both alpha-2 codes; FR and GB are not postal codes.
  expect(
    inferRegionField([{ field: "iso2", values: ["DE", "US", "FR", "GB"] }])
  ).toMatchObject({ setId: "world-countries", featureKey: "iso_a2" });
  expect(
    inferRegionField([{ field: "fips", values: [6037, 48453, 36061] }])
  ).toBeUndefined();
  expect(
    inferRegionField([{ field: "code", values: ["CHL", "PER"] }], ["us-states"])
  ).toBeUndefined();
});
