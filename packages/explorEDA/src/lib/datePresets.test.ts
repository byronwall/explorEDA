import { describe, expect, it } from "vitest";
import { datePresets } from "./datePresets";

const time = (date: string) => Date.parse(`${date}T00:00:00Z`);
const labels = (first: string, last: string) =>
  Object.fromEntries(
    datePresets(time(first), time(last)).map((group) => [
      group.label,
      group.presets.map((preset) => preset.label),
    ])
  );

describe("datePresets", () => {
  it("offers recent spans, quarters, and months within one year", () => {
    expect(labels("2024-01-01", "2024-12-31")).toEqual({
      Latest: ["Last 7 days", "Last 30 days", "Last 90 days"],
      Quarter: ["Q1", "Q2", "Q3", "Q4"],
      Month: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
    });
    const groups = datePresets(time("2024-01-01"), time("2024-12-31"));
    expect(groups[0]!.presets[1]).toEqual({
      label: "Last 30 days",
      min: "2024-12-02",
      max: "2024-12-31",
    });
    expect(groups[2]!.presets[1]).toEqual({
      label: "Feb",
      min: "2024-02-01",
      max: "2024-02-29",
    });
  });

  it("offers whole years for a multi-year span and names the year", () => {
    const result = labels("2021-03-15", "2024-06-01");
    expect(result.Year).toEqual(["2021", "2022", "2023", "2024"]);
    expect(result.Quarter).toBeUndefined();
    expect(result.Month).toBeUndefined();
    expect(labels("2023-11-01", "2024-02-10").Month).toEqual([
      "Nov 2023",
      "Dec 2023",
      "Jan 2024",
      "Feb 2024",
    ]);
  });

  it("offers nothing for a single day or invalid bounds", () => {
    expect(datePresets(time("2024-01-01"), time("2024-01-01"))).toEqual([]);
    expect(datePresets(NaN, time("2024-01-01"))).toEqual([]);
  });
});
