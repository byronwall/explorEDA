import { describe, expect, it } from "vitest";
import { buildFieldProfiles } from "./fieldProfiles";

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
});
