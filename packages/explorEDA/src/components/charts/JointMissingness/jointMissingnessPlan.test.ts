import { describe, expect, it } from "vitest";
import type { datum } from "@/types/ChartTypes";
import { jointMissingnessDefinition } from "./definition";
import {
  countByGroup,
  defaultMissingnessFields,
  inputTest,
  planGroups,
  patternMatcher,
  planPatterns,
} from "./jointMissingnessPlan";

// The plan's six-field fixture, after its field settings: x converts to a
// number, so "bad" fails and is missing; note treats "NA" as missing.
const FIELDS = ["x", "y", "z", "note", "flag", "w"];
const ROWS: Record<string, datum>[] = [
  { id: "r01", group: "A", x: 0, y: 10, z: 1, note: "ok", flag: false, w: 5 },
  { id: "r02", group: "A", x: null, y: 20, z: 2, note: "ok", flag: true, w: 6 },
  {
    id: "r03",
    group: "A",
    x: null,
    y: 30,
    z: 3,
    note: "ok",
    flag: false,
    w: 7,
  },
  { id: "r04", group: "A", x: 40, y: null, z: 4, note: "ok", flag: true, w: 8 },
  {
    id: "r05",
    group: "A",
    x: null,
    y: null,
    z: 5,
    note: "ok",
    flag: true,
    w: 9,
  },
  {
    id: "r06",
    group: "A",
    x: null,
    y: null,
    z: 6,
    note: "ok",
    flag: true,
    w: 10,
  },
  { id: "r07", group: "A", x: 70, y: 70, z: 7, note: "  ", flag: true, w: 11 },
  {
    id: "r08",
    group: "A",
    x: null,
    y: 80,
    z: 8,
    note: "ok",
    flag: true,
    w: 12,
  },
  {
    id: "r09",
    group: "B",
    x: null,
    y: null,
    z: null,
    note: "ok",
    flag: false,
    w: 13,
  },
  {
    id: "r10",
    group: "B",
    x: 100,
    y: 100,
    z: 10,
    note: null,
    flag: null,
    w: 14,
  },
  { id: "r11", group: "B", x: 110, y: 110, z: 11, note: "ok", flag: true },
  {
    id: "r12",
    group: "B",
    x: 120,
    y: 120,
    z: 12,
    note: "",
    flag: true,
    w: "Infinity",
  },
];
const ids = ROWS.map((_, index) => index);
const column = (field: string) =>
  Object.fromEntries(ROWS.map((row, index) => [index, row[field]]));
const columns = Object.fromEntries(FIELDS.map((f) => [f, column(f)]));
const names = (list: number[]) => list.map((id) => ROWS[id]!.id);

describe("planPatterns", () => {
  it("partitions every row into one exact pattern", () => {
    const plan = planPatterns({ ids, fields: FIELDS, columns });
    const byLabel = Object.fromEntries(
      plan.patterns.map((p) => [p.missing.join("+"), names(p.ids)])
    );
    expect(byLabel).toEqual({
      "": ["r01"],
      x: ["r02", "r03", "r08"],
      y: ["r04"],
      "x+y": ["r05", "r06"],
      note: ["r07", "r12"],
      "x+y+z": ["r09"],
      "note+flag": ["r10"],
      w: ["r11"],
    });
    expect(plan.patterns[0]!.key).toBe("");
    expect(plan.fieldTotals).toEqual([6, 4, 1, 3, 1, 1]);
    expect(plan.fieldTotals.reduce((a, b) => a + b)).toBe(16);
  });

  it("pins all present even when no row has it", () => {
    const plan = planPatterns({ ids: [1, 2], fields: FIELDS, columns });
    expect(plan.patterns.map((p) => p.ids.length)).toEqual([0, 2]);
  });
});

describe("patternMatcher", () => {
  it("unions exact patterns and excludes supersets", () => {
    const xyOrNote = patternMatcher(FIELDS, columns, [["x", "y"], ["note"]]);
    expect(names(ids.filter(xyOrNote))).toEqual(["r05", "r06", "r07", "r12"]);
    const xOrY = patternMatcher(FIELDS, columns, [["x"], ["y"]]);
    expect(names(ids.filter(xOrY))).toEqual(["r02", "r03", "r04", "r08"]);
  });

  it("re-evaluates meaning when a row is corrected", () => {
    const fixed = { ...columns, x: { ...columns.x, 7: 0 } };
    expect(names(ids.filter(patternMatcher(FIELDS, fixed, [["x"]])))).toEqual([
      "r02",
      "r03",
    ]);
  });

  it("matches nothing for a pattern outside the chosen fields", () => {
    expect(ids.filter(patternMatcher(FIELDS, columns, [["group"]]))).toEqual(
      []
    );
  });
});

describe("selection filter", () => {
  it("narrows peers to the chart's local population", () => {
    const settings = {
      ...jointMissingnessDefinition.createDefaultSettings({
        x: 0,
        y: 0,
        w: 4,
        h: 4,
      }),
      fields: FIELDS,
      localFilters: [{ type: "value" as const, field: "group", values: ["A"] }],
      filters: [
        {
          type: "missingness-pattern" as const,
          field: "__ID",
          patterns: [["x", "y"], ["note"]],
        },
      ],
    };
    const test = jointMissingnessDefinition.getFilterFunction(
      settings,
      (field) => column(field)
    );
    expect(names(ids.filter(test))).toEqual(["r05", "r06", "r07"]);
  });
});

describe("defaultMissingnessFields", () => {
  it("picks fields with missing values, most missing first", () => {
    const counts: Record<string, number> = { a: 0, b: 3, c: 9, d: 1 };
    expect(
      defaultMissingnessFields(["a", "b", "c", "d"], (f) => counts[f]!)
    ).toEqual(["c", "b", "d"]);
    expect(defaultMissingnessFields(["a", "b"], () => 0)).toEqual(["a", "b"]);
  });
});

describe("planGroups", () => {
  it("compares a selection's share within each group", () => {
    const groups = planGroups(ids, column("group"));
    expect(groups.columns.map((c) => [c.label, c.total])).toEqual([
      ["A", 8],
      ["B", 4],
    ]);
    const selected = ids.filter(
      patternMatcher(FIELDS, columns, [["x", "y"], ["note"]])
    );
    const counts = countByGroup(selected, groups);
    expect(counts.get(groups.columns[0]!.key)).toBe(3);
    expect(counts.get(groups.columns[1]!.key)).toBe(1);
  });

  it("pools groups past the limit and keeps missing groups together", () => {
    const many = Object.fromEntries(
      Array.from({ length: 12 }, (_, i) => [i, i < 2 ? "" : `g${i}`])
    );
    const groups = planGroups(
      Array.from({ length: 12 }, (_, i) => i),
      many
    );
    expect(groups.columns[0]).toMatchObject({ label: "(missing)", total: 2 });
    expect(groups.columns.at(-1)).toMatchObject({
      label: "3 other groups",
      total: 3,
    });
    expect(groups.columns.reduce((sum, c) => sum + c.total, 0)).toBe(12);
  });
});

describe("inputTest", () => {
  it("separates present values from finite numbers", () => {
    // The plan's fixture keeps w = "Infinity" in r12: present, not finite.
    const cols = { ...columns, w: { ...columns.w, 11: "Infinity" } };
    const rule = { fields: ["x", "y", "w"] };
    const present = inputTest({ ...rule, requirement: "present" }, cols);
    const finite = inputTest({ ...rule, requirement: "finite" }, cols);
    expect(names(ids.filter(present))).toEqual(["r01", "r07", "r10", "r12"]);
    expect(names(ids.filter(finite))).toEqual(["r01", "r07", "r10"]);
  });
});
