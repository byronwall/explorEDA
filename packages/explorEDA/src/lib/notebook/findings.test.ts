import { beforeAll, describe, expect, it } from "vitest";
import { registerAllCharts } from "@/charts/registerAllCharts";
import type { datum } from "@/types/ChartTypes";
import { compileNotebook } from "./compileNotebook";
import {
  evaluateFinding,
  evaluateFindings,
  type FindingContext,
  type FindingDefinition,
  type MetricFinding,
} from "./findings";

// The acceptance fixture: one row per key, and the owner chart shows only
// active rows.
const FIXTURE = [
  { key: "r01", group: "A", region: "East", score: 90, active: true },
  { key: "r02", group: "A", region: "West", score: 10, active: true },
  { key: "r03", group: "A", region: "West", score: 20, active: true },
  { key: "r04", group: "A", region: "West", score: 0, active: true },
  { key: "r05", group: "A", region: "West", score: null, active: true },
  { key: "r06", group: "B", region: "East", score: 80, active: true },
  { key: "r07", group: "B", region: "East", score: 70, active: true },
  { key: "r08", group: "B", region: "West", score: 5, active: true },
  { key: "r09", group: "B", region: "West", score: 0, active: true },
  { key: "r10", group: "B", region: "East", score: "bad", active: true },
  { key: "r11", group: "A", region: "East", score: 100, active: false },
  { key: "r12", group: "B", region: "West", score: 100, active: false },
];

type Row = (typeof FIXTURE)[number];

/** The fixture's workspace, with one selection on the owner chart. */
function context(
  selected: (row: Row) => boolean = () => true,
  other: (row: Row) => boolean = () => true
): FindingContext {
  const ids = FIXTURE.map((_, id) => id);
  const tests: Record<string, (row: Row) => boolean> = {
    regions: selected,
    other,
  };
  return {
    allIds: ids,
    eligible: (chart) =>
      chart in tests ? ids.filter((id) => FIXTURE[id]!.active) : undefined,
    selection: (chart) => (id) => tests[chart]!(FIXTURE[id]!),
    column: (field) =>
      Object.fromEntries(
        FIXTURE.map((row, id) => [id, row[field as keyof Row] as datum])
      ),
    label: (field) => field,
    format: (_field, value) => String(value),
    revision: "1",
  };
}

const keys = (ids: number[]) => ids.map((id) => FIXTURE[id]!.key);

const count: MetricFinding = {
  id: "n",
  aggregation: "count",
  chart: "regions",
};
const mean: MetricFinding = {
  id: "mean",
  aggregation: "average",
  field: "score",
  chart: "regions",
};
const groupMean = (group: string): MetricFinding => ({
  ...mean,
  id: `${group}-mean`,
  filters: [{ type: "value", field: "group", values: [group] }],
});

const SELECTIONS: [string, (row: Row) => boolean][] = [
  ["Cleared", () => true],
  ["East", (row) => row.region === "East"],
  ["West", (row) => row.region === "West"],
  ["Score zero", (row) => row.score === 0],
];

describe("evaluateFinding", () => {
  it.each([
    // selected, contributors, sum, average, A mean, B mean
    ["Cleared", 10, 8, 275, 34.375, 30, 38.75],
    ["East", 4, 3, 240, 80, 90, 75],
    ["West", 6, 5, 35, 7, 10, 2.5],
    ["Score zero", 2, 2, 0, 0, 0, 0],
  ])(
    "%s selects the fixture's rows and values",
    (name, selected, contributors, sum, average, a, b) => {
      const at = context(SELECTIONS.find(([label]) => label === name)![1]);
      expect(evaluateFinding(count, at).value).toBe(selected);
      const result = evaluateFinding(mean, at);
      expect(result.value).toBe(average);
      expect(result.plan!.includedCount).toBe(contributors);
      expect(evaluateFinding({ ...mean, aggregation: "sum" }, at).value).toBe(
        sum
      );
      expect(evaluateFinding(groupMean("A"), at).value).toBe(a);
      expect(evaluateFinding(groupMean("B"), at).value).toBe(b);
    }
  );

  it("reads East's four rows and leaves r10 out of the average", () => {
    const result = evaluateFinding(
      mean,
      context((row) => row.region === "East")
    );
    expect(keys(result.ids)).toEqual(["r01", "r06", "r07", "r10"]);
    const used = result.plan!.contributors.filter((item) => item.included);
    expect(keys(used.map((item) => item.sourceId))).toEqual([
      "r01",
      "r06",
      "r07",
    ]);
  });

  it("keeps a count and tells empty input from invalid input", () => {
    const invalid = context((row) => ["r05", "r10"].includes(row.key));
    expect(evaluateFinding(count, invalid).value).toBe(2);
    expect(evaluateFinding(mean, invalid).unavailable).toBe("invalid");

    const none = context((row) => row.region === "North");
    expect(evaluateFinding(count, none)).toMatchObject({ value: 0, text: "0" });
    expect(evaluateFinding(mean, none).unavailable).toBe("empty");
    expect(evaluateFinding({ ...mean, chart: "gone" }, none).unavailable).toBe(
      "missing"
    );
  });

  it("follows only its own chart", () => {
    const east = (row: Row) => row.region === "East";
    expect(evaluateFinding(count, context(undefined, east)).value).toBe(10);
    expect(
      evaluateFinding({ ...count, population: "eligible" }, context(east)).value
    ).toBe(10);
    // Without a chart, a finding reads every source row.
    expect(
      evaluateFinding({ id: "all", aggregation: "count" }, context(east)).value
    ).toBe(12);
  });
});

describe("comparisons", () => {
  beforeAll(registerAllCharts);
  const east = context((row) => row.region === "East");
  const eastCount: MetricFinding = { ...count, id: "east-n" };
  const eligible: MetricFinding = {
    ...count,
    id: "eligible",
    population: "eligible",
  };
  const all: MetricFinding = { id: "all", aggregation: "count" };
  const definitions: FindingDefinition[] = [
    { id: "gap", kind: "difference", of: ["A-mean", "B-mean"], digits: 2 },
    { id: "of-eligible", kind: "share", of: ["east-n", "eligible"] },
    { id: "of-all", kind: "share", of: ["east-n", "all"], digits: 1 },
    { id: "outside", kind: "share", of: ["all", "eligible"] },
    groupMean("A"),
    groupMean("B"),
    eastCount,
    eligible,
    all,
  ];
  const at = (workspace: FindingContext) =>
    evaluateFindings(definitions, workspace);

  it("turns A minus B from −8.75 to +15 when East is selected", () => {
    expect(at(context()).get("gap")).toMatchObject({
      value: -8.75,
      text: "\u22128.75",
    });
    const gap = at(east).get("gap")!;
    expect(gap).toMatchObject({ value: 15, text: "+15.00" });
    // Each side keeps its own records.
    expect(gap.operands!.map((side) => keys(side.ids))).toEqual([
      ["r01"],
      ["r06", "r07", "r10"],
    ]);
  });

  it("divides by the whole it names", () => {
    const results = at(east);
    expect(results.get("of-eligible")).toMatchObject({
      value: 0.4,
      text: "40%",
    });
    expect(results.get("of-all")).toMatchObject({ text: "33.3%" });
    expect(results.get("of-all")!.value).toBeCloseTo(1 / 3);
    expect(results.get("outside")!.unavailable).toBe("outside");

    const none = at(context((row) => row.region === "North"));
    expect(none.get("of-eligible")).toMatchObject({ value: 0, text: "0%" });
    const empty = compareFindingsOver(
      { ...eligible, id: "nothing", population: undefined },
      context((row) => row.region === "North")
    );
    expect(empty.unavailable).toBe("empty");
  });

  it("has no value when an operand has none", () => {
    const invalid = at(context((row) => ["r05", "r10"].includes(row.key)));
    expect(invalid.get("gap")).toMatchObject({ unavailable: "invalid" });
  });

  it("checks operands in any order and rejects ones that don't compare", () => {
    const text = (line: string) =>
      [
        "```eda",
        line,
        "finding @a average score chart=@regions where.group=A digits=2",
        "finding @b average score chart=@regions where.group=B",
        "finding @n count chart=@regions",
        "row region @regions where.active=true",
        "```",
      ].join("\n");
    const compiled = compileNotebook(text("finding @gap difference a b"), {
      rows: FIXTURE,
    });
    expect(compiled.diagnostics).toEqual([]);
    // The difference takes its first side's digits.
    expect(compiled.settings.findings).toContainEqual({
      id: "gap",
      kind: "difference",
      of: ["a", "b"],
      digits: 2,
    });
    const mixed = compileNotebook(text("finding @gap difference a n"), {
      rows: FIXTURE,
    });
    expect(mixed.diagnostics.map((item) => item.message)).toEqual([
      expect.stringContaining("A difference compares one summary"),
    ]);
    const missing = compileNotebook(text("finding @gap share n nope"), {
      rows: FIXTURE,
    });
    expect(missing.diagnostics[0]!.message).toContain("nope is not a finding");
  });
});

/** A share of a count over a whole that counts no rows. */
function compareFindingsOver(whole: MetricFinding, workspace: FindingContext) {
  return evaluateFindings(
    [whole, { id: "part", kind: "share", of: [whole.id, whole.id] }],
    workspace
  ).get("part")!;
}
