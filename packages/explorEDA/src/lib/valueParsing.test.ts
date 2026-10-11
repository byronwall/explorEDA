import { describe, expect, it } from "vitest";
import { calculateGroupedAggregate } from "./aggregates";
import { buildFieldProfile } from "./fieldProfiles";
import {
  dateBound,
  finiteNumber,
  finiteNumbers,
  isDateText,
  isNumberLike,
  parseBoolean,
  parseDateText,
  parseNumber,
  timestampOf,
} from "./valueParsing";
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
    expect(isNumberLike("0x1A")).toBe(false);
    expect(isNumberLike("0b11")).toBe(false);
    expect(isNumberLike("-0o17")).toBe(false);
    expect(finiteNumber("0x1A")).toBeUndefined();
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

describe("parseDateText", () => {
  it.each([
    ["2025-01-10", Date.UTC(2025, 0, 10)],
    ["2025-01", Date.UTC(2025, 0, 1)],
    ["2025-01-10T08:00", Date.UTC(2025, 0, 10, 8)],
    ["2025-01-10 08:00:00", Date.UTC(2025, 0, 10, 8)],
    ["2025-01-10T08:00:00.250Z", Date.UTC(2025, 0, 10, 8, 0, 0, 250)],
    ["2025-01-10T08:00:00+02:00", Date.UTC(2025, 0, 10, 6)],
    ["2025-01-10T08:00:00-0530", Date.UTC(2025, 0, 10, 13, 30)],
    ["1/15/2025", Date.UTC(2025, 0, 15)],
    ["1-15-2025", Date.UTC(2025, 0, 15)],
    ["1/2/25", Date.UTC(2025, 0, 2)],
    ["1/2/75", Date.UTC(1975, 0, 2)],
    ["1/15/2025 8:30 PM", Date.UTC(2025, 0, 15, 20, 30)],
    ["2025/01/15", Date.UTC(2025, 0, 15)],
    ["Jan 15 2025", Date.UTC(2025, 0, 15)],
    ["January 15, 2025", Date.UTC(2025, 0, 15)],
    ["15 Mar 2025", Date.UTC(2025, 2, 15)],
    ["Sept 3 2025", Date.UTC(2025, 8, 3)],
    ["Wed, 15 Jan 2025 08:00:00 GMT", Date.UTC(2025, 0, 15, 8)],
  ])("reads %s as UTC", (text, expected) => {
    expect(parseDateText(text)).toBe(expected);
  });

  it.each([
    "Depot 2",
    "Route 7",
    "Building 12A",
    "Market 3",
    "May Street",
    "2025-02-30",
    "2/30/2025",
    "Feb 30 2025",
    "15/01/2025",
    "2025-01-10T25:00",
    "1/15/2025 13:00 PM",
    "2025",
    "",
  ])("rejects %j", (text) => {
    expect(parseDateText(text)).toBeNaN();
    expect(isDateText(text)).toBe(false);
  });

  it("reads numeric dates in the preset order and keeps ISO strict", () => {
    expect(parseDateText("15/01/2025", "day-month-year")).toBe(
      Date.UTC(2025, 0, 15)
    );
    expect(parseDateText("01/02/2025", "day-month-year")).toBe(
      Date.UTC(2025, 1, 1)
    );
    expect(parseDateText("01/02/2025", "month-day-year")).toBe(
      Date.UTC(2025, 0, 2)
    );
    expect(parseDateText("1/2/25", "month-day-year")).toBeNaN();
    expect(parseDateText("Jan 15 2025", "month-day-year")).toBeNaN();
    expect(parseDateText("1/15/2025", "iso")).toBeNaN();
    expect(isDateText("2025-01-10T08:00:00Z", "iso")).toBe(true);
  });

  it("closes a date-only upper bound at the end of the day", () => {
    expect(dateBound("2025-01-31")).toBe(Date.UTC(2025, 0, 31));
    expect(dateBound("2025-01-31", true)).toBe(
      Date.UTC(2025, 0, 31, 23, 59, 59, 999)
    );
    expect(dateBound("2025-01-31T12:00Z", true)).toBe(
      Date.UTC(2025, 0, 31, 12)
    );
  });

  it("treats numbers and Dates as timestamps", () => {
    expect(timestampOf(0)).toBe(0);
    expect(timestampOf(new Date(5))).toBe(5);
    expect(timestampOf("2025-01-10")).toBe(Date.UTC(2025, 0, 10));
    expect(timestampOf("Depot 2")).toBeUndefined();
    expect(timestampOf(Number.NaN)).toBeUndefined();
    expect(timestampOf(true)).toBeUndefined();
    expect(timestampOf(null)).toBeUndefined();
  });
});

describe("parseNumber and parseBoolean", () => {
  it("rejects radix prefixes, blanks, and booleans as numbers", () => {
    expect(parseNumber(" 12.5 ")).toBe(12.5);
    expect(parseNumber("1e3")).toBe(1000);
    expect(parseNumber("-Infinity")).toBe(-Infinity);
    expect(parseNumber("0x1A")).toBeNaN();
    expect(parseNumber("0B11")).toBeNaN();
    expect(parseNumber("")).toBeNaN();
    expect(parseNumber(true)).toBeNaN();
    expect(parseNumber(null)).toBeNaN();
  });

  it("reads true and false in any case", () => {
    expect(parseBoolean(true)).toBe(true);
    expect(parseBoolean(" TRUE ")).toBe(true);
    expect(parseBoolean("False")).toBe(false);
    expect(parseBoolean("yes")).toBeUndefined();
    expect(parseBoolean(1)).toBeUndefined();
  });
});
