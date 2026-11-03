import { beforeAll, describe, expect, it } from "vitest";
import { registerAllCharts } from "@/charts/registerAllCharts";
import { compileDocument } from "@/lib/dsl/compile";
import { exportDocument } from "@/lib/dsl/export";

const rows = [
  { x: null, y: null, z: 1, note: "ok" },
  { x: 1, y: 2, z: 3, note: "" },
  { x: 1, y: 2, z: 3, note: "ok" },
];

const compile = (body: string) =>
  compileDocument(
    `chart joint-missingness @gaps fields[]=x,y,z,note {\n${body}\n}`,
    { rows }
  );

describe("joint missingness text", () => {
  beforeAll(() => registerAllCharts());

  it("lowers patterns to the chart's own selection", () => {
    const { settings, diagnostics } = compile(
      "patterns[]=\npatterns.0[]=y,x\npatterns.1[]=note"
    );
    expect(diagnostics).toEqual([]);
    expect(settings.charts[0]!.filters).toEqual([
      {
        type: "missingness-pattern",
        field: "__ID",
        patterns: [["x", "y"], ["note"]],
      },
    ]);
  });

  it("keeps active-empty and all-present apart from no selector", () => {
    expect(compile("").settings.charts[0]!.filters).toEqual([]);
    expect(compile("patterns[]=").settings.charts[0]!.filters).toEqual([
      { type: "missingness-pattern", field: "__ID", patterns: [] },
    ]);
    expect(
      compile("patterns[]=\npatterns.0[]=").settings.charts[0]!.filters
    ).toEqual([{ type: "missingness-pattern", field: "__ID", patterns: [[]] }]);
  });

  it("skips the chart for a pattern outside its fields", () => {
    const { settings, diagnostics } = compile(
      "patterns[]=\npatterns.0[]=x\npatterns.2[]=y"
    );
    expect(settings.charts).toEqual([]);
    expect(diagnostics.map((item) => item.effect)).toContain("chart-skipped");
    expect(compile("patterns[]=\npatterns.0[]=w").settings.charts).toEqual([]);
  });

  it("exports the selection as patterns and reads it back", () => {
    const start = compile("patterns[]=\npatterns.0[]=x,y\npatterns.1[]=");
    const { text, omitted } = exportDocument(start.settings, { rows });
    expect(omitted).toEqual([]);
    expect(text).toContain("patterns.0[]=x,y");
    expect(text).not.toContain("filters.");
    const rebuilt = compileDocument(text, { rows });
    expect(rebuilt.diagnostics).toEqual([]);
    expect(rebuilt.settings.charts[0]!.filters).toEqual(
      start.settings.charts[0]!.filters
    );
  });
});
