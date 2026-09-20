import { describe, expect, it } from "vitest";
import { applyFilter } from "./applyFilter";

describe("applyFilter", () => {
  it("applies inclusive numeric ranges to numbers and numeric strings", () => {
    const filter = { type: "range" as const, field: "value", min: 2, max: 3 };
    expect(applyFilter(2, filter)).toBe(true);
    expect(applyFilter("3", filter)).toBe(true);
    expect(applyFilter(4, filter)).toBe(false);
  });

  it("matches selected values and treats null as the missing bucket", () => {
    const filter = {
      type: "value" as const,
      field: "value",
      values: ["a", null],
    };
    expect(applyFilter("a", filter)).toBe(true);
    expect(applyFilter(null, filter)).toBe(true);
    expect(applyFilter(undefined, filter)).toBe(true);
    expect(applyFilter("b", filter)).toBe(false);
  });

  it("uses SameValueZero for selected values while keeping missing values grouped", () => {
    const filter = {
      type: "value" as const,
      field: "value",
      values: [NaN, Infinity, 0, null],
    };
    expect(applyFilter(NaN, filter)).toBe(true);
    expect(applyFilter(Infinity, filter)).toBe(true);
    expect(applyFilter(-Infinity, filter)).toBe(false);
    expect(applyFilter(-0, filter)).toBe(true);
    expect(applyFilter(undefined, filter)).toBe(true);
  });

  it("applies text operators", () => {
    const filter = {
      type: "text" as const,
      field: "value",
      operator: "startsWith" as const,
      value: "al",
    };
    expect(applyFilter("ALPHA", filter)).toBe(true);
    expect(applyFilter("beta", filter)).toBe(false);
  });

  it("applies inclusive ISO date ranges", () => {
    const filter = {
      type: "date-range" as const,
      field: "created",
      min: "2026-01-01",
      max: "2026-01-01",
    };
    expect(applyFilter("2026-01-01T12:00:00Z", filter)).toBe(true);
    expect(applyFilter("2025-12-31T23:59:59Z", filter)).toBe(false);
    expect(applyFilter("not a date", filter)).toBe(false);
    expect(applyFilter("2026-01-01T23:30:00", filter)).toBe(true);
    expect(applyFilter("2026-01-02T00:30:00+02:00", filter)).toBe(true);
  });
});
