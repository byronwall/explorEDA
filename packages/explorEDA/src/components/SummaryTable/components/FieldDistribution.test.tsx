import { describe, expect, it } from "vitest";
import { buildFieldProfile } from "@/lib/fieldProfiles";
import type { datum } from "@/types/ChartTypes";
import { binValues } from "../utils/statisticsCalculator";
import { labelBins, summarizeField } from "./FieldDistribution";

const column = (values: datum[]) =>
  Object.fromEntries(values.map((value, index) => [index, value])) as Record<
    number,
    datum
  >;
const format = (value: unknown) => String(value);

describe("binValues", () => {
  it("gives small integer ranges one bin per value", () => {
    expect(binValues([1, 1, 2, 4], 1, 4)).toEqual([2, 1, 0, 1]);
  });

  it("uses equal-width bins and keeps the maximum in the last bin", () => {
    const bins = binValues([0, 0.5, 1], 0, 1, 4);
    expect(bins).toEqual([1, 0, 1, 1]);
  });

  it("ignores values that cannot be placed", () => {
    expect(binValues([0, Infinity], 0, Infinity)).toEqual([]);
  });
});

describe("labelBins", () => {
  it("names one-value bins by their value and wider bins by their range", () => {
    expect(labelBins([2, 0, 1], 1, 3, String)).toEqual([
      { label: "1", count: 2 },
      { label: "2", count: 0 },
      { label: "3", count: 1 },
    ]);
    const wide = labelBins(new Array(24).fill(1), 0, 24, String);
    expect(wide[0]!.label).toBe("0 – 1");
    expect(wide[23]!.label).toBe("23 – 24");
  });
});

describe("summarizeField", () => {
  it("reads a numeric range with its median", () => {
    const profile = buildFieldProfile("units", column([1, 2, 3, null]));
    expect(summarizeField(profile, format)).toMatchObject({
      low: "1",
      high: "3",
      statLabel: "median",
      stat: "2",
    });
  });

  it("reads a date field as its first and last date", () => {
    const profile = buildFieldProfile(
      "ordered",
      column(["2024-03-01", "2024-01-01", "2024-02-01"]),
      "datetime"
    );
    expect(summarizeField(profile, format)).toMatchObject({
      low: "2024-01-01",
      high: "2024-03-01",
    });
  });

  it("reads a category field as its most common value and share", () => {
    const profile = buildFieldProfile(
      "region",
      column(["North", "North", "South", null])
    );
    expect(summarizeField(profile, format)).toMatchObject({
      label: "North",
      statLabel: "share",
      stat: "67%",
      bars: [
        { label: "North", count: 2 },
        { label: "South", count: 1 },
      ],
    });
  });

  it("says when every value is unique", () => {
    const profile = buildFieldProfile("id", column(["a", "b", "c"]));
    expect(summarizeField(profile, format)?.label).toBe("All values unique");
  });

  it("has no reading when every value is missing", () => {
    const profile = buildFieldProfile(
      "empty",
      column([null, null]),
      "categorical"
    );
    expect(summarizeField(profile, format)).toBeUndefined();
  });
});
