import { describe, expect, it } from "vitest";
import { buildFieldProfiles, buildValuesProfile } from "./fieldProfiles";

describe("buildFieldProfiles", () => {
  it("keeps fields in first-seen order and profiles mixed values", () => {
    const profiles = buildFieldProfiles([
      { number: 1, label: "a" },
      { number: "2", label: "b", later: true },
      { number: null, label: "a" },
    ]);

    expect(profiles.map((profile) => profile.name)).toEqual([
      "number",
      "label",
      "later",
    ]);
    expect(profiles[0]).toMatchObject({
      dataType: "numeric",
      totalCount: 3,
      nullCount: 1,
      uniqueCount: 2,
      statistics: { min: 1, max: 2 },
    });
    expect(profiles[1]?.categories?.topValues[0]).toEqual({
      value: "a",
      count: 2,
    });
  });

  it("detects numeric strings, ISO dates, and booleans", () => {
    const profiles = buildFieldProfiles([
      { numeric: "1", date: "2026-01-01", flag: true },
      { numeric: "2", date: "2026-01-02", flag: "false" },
    ]);

    expect(profiles.map((profile) => profile.dataType)).toEqual([
      "numeric",
      "datetime",
      "boolean",
    ]);
  });

  it("handles null-only and empty sources", () => {
    const [profile] = buildFieldProfiles([
      { missing: null },
      { missing: undefined },
    ]);

    expect(profile).toMatchObject({
      dataType: "categorical",
      totalCount: 2,
      nullCount: 2,
      uniqueCount: 0,
    });
    expect(profile?.categories?.topValues).toEqual([]);
    expect(buildFieldProfiles([])).toEqual([]);
  });

  it("measures numeric values the way charts read them", () => {
    const profile = buildValuesProfile(
      "value",
      [4, "1", "", null, Infinity, " 3 ", 2, 4, "n/a"],
      "numeric"
    );

    expect(profile).toMatchObject({
      totalCount: 9,
      // null and the blank string are missing.
      nullCount: 2,
      // Infinity and "n/a" are present but not measurable.
      excludedCount: 2,
      // Every present value counts once, including the blank string.
      uniqueCount: 7,
      statistics: { min: 1, max: 4, median: 3, mean: 2.8, bins: [1, 1, 1, 2] },
    });
    expect(profile.statistics?.stdDev).toBeCloseTo(Math.sqrt(1.36));
  });

  it("matches a sorted reference on larger numeric fields", () => {
    let seed = 7;
    const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const values = Array.from(
      { length: 5001 },
      () => Math.round(random() * 1000) / 10 - 20
    );
    const sorted = [...values].sort((a, b) => a - b);
    const mean = values.reduce((sum, value) => sum + value, 0) / values.length;

    const profile = buildValuesProfile("value", values, "numeric");

    expect(profile.uniqueCount).toBe(new Set(values).size);
    expect(profile.statistics).toMatchObject({
      min: sorted[0],
      max: sorted.at(-1),
      median: sorted[2500],
    });
    expect(profile.statistics?.mean).toBeCloseTo(mean, 10);
    expect(profile.statistics?.bins?.reduce((a, b) => a + b, 0)).toBe(5001);
  });
});
