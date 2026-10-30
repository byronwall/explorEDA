import { describe, expect, it } from "vitest";
import { suggestGroups, type CategoryValue } from "@/lib/calculations/recode";

const values = (
  [
    ["North", 3],
    ["north", 2],
    ["North ", 1],
    ["NORTH", 1],
    ["US", 4],
    ["us", 1],
    [1, 2],
    ["1", 2],
    ["001", 1],
    ["North-East", 1],
    ["North East", 1],
    ["ACME", 1],
    ["АСМE", 1], // Cyrillic А, С, М
    ["Café", 1], // composed é
    ["Café", 1], // e + combining accent
    [null, 2],
  ] as [CategoryValue, number][]
).map(([value, count]) => ({ value, count }));

const members = (trim: boolean, ignoreCase: boolean) =>
  suggestGroups(values, { trim, ignoreCase }).map((group) =>
    group.members.map((member) => member.value)
  );

describe("category suggestions", () => {
  it("groups only by edge spaces, letter case, or both", () => {
    expect(members(true, false)).toEqual([["North", "North "]]);
    expect(members(false, true)).toEqual([
      ["North", "north", "NORTH"],
      ["US", "us"],
    ]);
    expect(members(true, true)).toEqual([
      ["North", "north", "North ", "NORTH"],
      ["US", "us"],
    ]);
  });

  it("proposes the most common spelling, trimmed when trimming", () => {
    const [north] = suggestGroups(
      [
        { value: " North", count: 5 },
        { value: "North", count: 1 },
      ],
      { trim: true, ignoreCase: false }
    );
    expect(north?.target).toBe("North");
  });
});
