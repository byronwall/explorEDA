import { describe, expect, it } from "vitest";
import { Calculator } from "@/lib/calculations/engine/Calculator";
import { parseExpression } from "@/lib/calculations/parser/semantics";
import {
  readRecode,
  recodeLookup,
  recodeText,
  type CategoryValue,
  type Recode,
} from "@/lib/calculations/recode";
import type { CalculationValue } from "@/lib/calculations/types";

// Every value is its own category: types, case, blanks, and edge spaces.
const values: CalculationValue[] = [
  "North",
  "north",
  "North ",
  "",
  " ",
  1,
  "1",
  true,
  "true",
  null,
  undefined as unknown as null,
];

function run(text: string, inputs: CalculationValue[], traced = false) {
  const expression = parseExpression(text);
  return inputs.map((value) => {
    const result = new Calculator(
      { data: [], variables: new Map([["v", value]]) },
      traced ? [] : undefined
    ).evaluate(expression);
    return result.success ? result.value : `error: ${result.error}`;
  });
}

describe("recode()", () => {
  it("matches each value exactly by type, and keeps the rest", () => {
    const text =
      'recode(["v"], "North", "N", 1, "one", "1", "text one", true, "yes", "", "blank", null, "missing")';
    for (const traced of [false, true]) {
      expect(run(text, values, traced)).toEqual([
        "N",
        "north",
        "North ",
        "blank",
        " ",
        "one",
        "text one",
        "yes",
        "true",
        "missing",
        "missing",
      ]);
    }
  });

  it("replaces in one pass, so chains and swaps apply once", () => {
    expect(run('recode(["v"], "A", "B", "B", "C")', ["A", "B", "C"])).toEqual([
      "B",
      "C",
      "C",
    ]);
    expect(run('recode(["v"], "A", "B", "B", "A")', ["A", "B"])).toEqual([
      "B",
      "A",
    ]);
  });

  it("sends every unmatched value, missing too, to an odd last value", () => {
    expect(
      run('recode(["v"], "North", "N", "Other")', ["North", "x", null])
    ).toEqual(["N", "Other", "Other"]);
    expect(
      run('recode(["v"], "North", "N", null, null, "Other")', ["x", null])
    ).toEqual(["Other", null]);
  });

  it("refuses targets that aren't text or null", () => {
    expect(run('recode(["v"], "a", 2)', ["a"])[0]).toMatch(/text or null/);
    expect(run('recode(["v"], "a", "b", 3)', ["z"])[0]).toMatch(/text or null/);
  });
});

describe("recode text", () => {
  it("writes and reads back every kind of category", () => {
    const recode: Recode = {
      field: "v",
      entries: [
        { source: "North", target: "N" },
        { source: 'say "hi"\\', target: "quoted" },
        { source: -2.5, target: "negative" },
        { source: 1, target: "one" },
        { source: "1", target: "text one" },
        { source: false, target: null },
        { source: null, target: "" },
      ],
      fallback: { value: "Other" },
    };
    const text = recodeText(recode);
    expect(readRecode(text)).toEqual(recode);
    const map = recodeLookup(recode);
    const mapped = run(text, [-2.5, 1, "1", false, null, "x"]);
    expect(mapped).toEqual(
      ([-2.5, 1, "1", false, null, "x"] as CategoryValue[]).map(map)
    );
  });

  it("leaves other formulas to the formula editor", () => {
    expect(readRecode('recode(["v"], "a", 2)')).toBeUndefined();
    expect(readRecode('recode(["v"], "a", ["w"])')).toBeUndefined();
    expect(readRecode('upper(["v"])')).toBeUndefined();
    expect(readRecode("recode(")).toBeUndefined();
  });
});
