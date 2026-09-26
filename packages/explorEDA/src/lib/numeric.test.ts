import { describe, expect, it } from "vitest";
import { calculateGroupedAggregate } from "./aggregates";
import { buildFieldProfile } from "./fieldProfiles";
import { finiteNumber, finiteNumbers, isNumberLike } from "./numeric";
import { numericBins } from "@/components/charts/BarChart/bins";
import { calculateBoxPlotStats } from "@/components/charts/BoxPlot/boxPlotCalculations";
import type { datum } from "@/types/ChartTypes";

// One group of mixed inputs. Only 10 and 20 are measurements.
const values: datum[] = [
  10,
  "20",
  " ",
  "",
  null,
  undefined,
  Infinity,
  -Infinity,
  NaN,
  "Infinity",
];
const eligibleIds = [0, 1];

describe("numeric eligibility", () => {
  it("keeps only finite numbers and numeric strings", () => {
    expect(values.map(finiteNumber)).toEqual([
      10,
      20,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
    ]);
    expect(finiteNumber(true)).toBeUndefined();
    expect(finiteNumber(" 7 ")).toBe(7);
    expect(isNumberLike("Infinity")).toBe(true);
    expect(isNumberLike("NaN")).toBe(true);
    expect(isNumberLike(" ")).toBe(false);
    expect(isNumberLike("abc")).toBe(false);
  });

  it("gives the same measurements to profiles, bins, boxes, and grouped results", () => {
    const columnData = Object.fromEntries(values.map((v, i) => [i, v]));
    const profile = buildFieldProfile("revenue", columnData);
    expect(profile.dataType).toBe("numeric");
    expect(profile.statistics).toMatchObject({ min: 10, max: 20, mean: 15 });
    expect(profile.nullCount).toBe(4);
    expect(profile.excludedCount).toBe(4);

    const measurements = finiteNumbers(values);
    const bins = numericBins(measurements, measurements, 2);
    expect(bins.reduce((sum, bin) => sum + bin.value, 0)).toBe(2);

    const box = calculateBoxPlotStats(measurements, "tukey");
    expect(box).toMatchObject({ median: 15, totalCount: 2 });

    const grouped = calculateGroupedAggregate(
      values.map((revenue, __ID) => ({ __ID, region: "North", revenue })),
      {
        id: "avg",
        name: "Average revenue",
        groupField: "region",
        measureField: "revenue",
        aggregation: "average",
      }
    );
    const row = grouped.rows[0];
    expect(row?.value).toBe(15);
    expect(
      row?.contributors
        .filter((item) => item.included)
        .map((item) => item.sourceId)
    ).toEqual(eligibleIds);
    expect(profile.statistics?.mean).toBe(row?.value);
  });

  it("reports a numeric field with no finite values as all excluded", () => {
    const profile = buildFieldProfile("ratio", {
      0: "NaN",
      1: Infinity,
      2: " ",
    });
    expect(profile.dataType).toBe("numeric");
    expect(profile.statistics).toBeUndefined();
    expect(profile.nullCount).toBe(1);
    expect(profile.excludedCount).toBe(2);
    expect(finiteNumbers(["NaN", Infinity, " "])).toEqual([]);
  });

  it("does not infer a numeric type from blanks alone", () => {
    expect(buildFieldProfile("empty", { 0: " ", 1: null }).dataType).toBe(
      "categorical"
    );
  });

  it("keeps an explicit categorical field's raw values", () => {
    const profile = buildFieldProfile(
      "code",
      { 0: "10", 1: " ", 2: Infinity },
      "categorical"
    );
    expect(profile.statistics).toBeUndefined();
    expect(profile.excludedCount).toBeUndefined();
    expect(profile.categories?.distribution.map((item) => item.value)).toEqual([
      "10",
      " ",
      Infinity,
    ]);
  });
});
