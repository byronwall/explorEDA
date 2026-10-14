import { beforeAll, describe, expect, it } from "vitest";
import { registerAllCharts } from "@/charts/registerAllCharts";
import { compileNotebook } from "./compileNotebook";
import { formatNotebook } from "./formatNotebook";
import { parseNotebook } from "./parseNotebook";

const rows = [
  { time: "2021-01-01T00:00:00Z", actual: 5, forecast: 3, region: "North" },
  { time: "2021-01-01T01:00:00Z", actual: 2, forecast: 4, region: "South" },
  { time: "2021-01-01T02:00:00Z", actual: 7, forecast: 6, region: "North" },
];

beforeAll(() => registerAllCharts());

const fence = (text: string) => ["```eda", text, "```"].join("\n");

describe("parseNotebook", () => {
  it("splits prose from eda blocks and keeps the file's line numbers", () => {
    const text = [
      "# Title", // 1
      "", // 2
      "```eda", // 3
      "calc delta = actual - forecast", // 4
      "```", // 5
      "Some prose.", // 6
      "```js", // 7
      "const notEda = 1;", // 8
      "```", // 9
      "~~~~eda", // 10
      "hist actual", // 11
      "~~~~", // 12
    ].join("\n");
    const { segments, blocks } = parseNotebook(text);
    expect(segments.map((segment) => segment.kind)).toEqual([
      "prose",
      "block",
      "prose",
      "block",
    ]);
    expect(blocks[0]).toMatchObject({
      index: 0,
      text: "calc delta = actual - forecast",
      fenceLine: 3,
      startLine: 4,
      endLine: 4,
      closeLine: 5,
    });
    // Other code blocks stay prose, fences and all.
    expect(segments[2]).toMatchObject({
      kind: "prose",
      text: "Some prose.\n```js\nconst notEda = 1;\n```",
      startLine: 6,
      endLine: 9,
    });
    expect(blocks[1]).toMatchObject({ text: "hist actual", startLine: 11 });
  });

  it("runs an unclosed block to the end of the file", () => {
    const { blocks } = parseNotebook("```eda\nhist actual\n");
    expect(blocks[0]).toMatchObject({ text: "hist actual\n", endLine: 3 });
    expect(blocks[0]!.closeLine).toBeUndefined();
  });
});

describe("compileNotebook", () => {
  it("shares definitions across blocks in any order", () => {
    const text = [
      "Delta first, defined below.",
      fence("line @delta x=time y=delta"),
      "",
      fence("calc delta = actual - forecast"),
    ].join("\n");
    const result = compileNotebook(text, { rows });
    expect(result.diagnostics).toEqual([]);
    expect(result.blocks.map((block) => block.charts.map((c) => c.id))).toEqual(
      [["delta"], []]
    );
    expect(result.blocks[1]!.calculations).toEqual(["delta"]);
    expect(result.complete).toBe(true);
  });

  it("stacks several outputs from one block in order", () => {
    const result = compileNotebook(
      fence("hist actual\nscatter x=actual y=forecast\ntable time,actual"),
      { rows }
    );
    expect(result.blocks[0]!.charts.map((chart) => chart.line)).toEqual([
      2, 3, 4,
    ]);
  });

  it("names unnamed charts by block, so edits elsewhere keep them", () => {
    const first = compileNotebook(
      [fence("hist actual"), fence("scatter x=actual y=forecast")].join("\n"),
      { rows }
    );
    const second = compileNotebook(
      [
        fence("hist actual title=Changed\nhist forecast"),
        fence("scatter x=actual y=forecast"),
      ].join("\n"),
      { rows }
    );
    expect(first.blocks[1]!.charts[0]!.id).toBe("block2-1");
    expect(second.blocks[1]!.charts[0]!.id).toBe("block2-1");
    expect(
      second.settings.charts.find((chart) => chart.id === "block2-1")?.type
    ).toBe("scatter");
  });

  it("reports problems at file lines and keeps the other blocks", () => {
    const text = [
      "Prose", // 1
      fence("hist actual"), // 2-4
      fence("scatter x=actual y=nope {"), // 5-7
      fence("hist forecast"), // 8-10
    ].join("\n");
    const result = compileNotebook(text, { rows });
    expect(result.blocks.map((block) => block.status)).toEqual([
      "ok",
      "invalid",
      "ok",
    ]);
    expect(result.blocks[1]!.diagnostics[0]).toMatchObject({
      severity: "error",
      line: 6,
    });
    // The unclosed body never swallows the next block.
    expect(result.blocks[2]!.charts.map((chart) => chart.id)).toEqual([
      "forecast",
    ]);
  });

  it("keeps a broken block's last valid results, frozen", () => {
    const valid = "calc delta = actual - forecast\nline @d x=time y=delta";
    const text = [
      fence("calc delta = actual - forecast {\nline @d x=time y=delta"),
      fence("hist delta"),
    ].join("\n");
    const broken = compileNotebook(text, { rows });
    expect(broken.blocks[0]!.status).toBe("invalid");
    expect(broken.blocks[1]!.charts).toEqual([]);

    const frozen = compileNotebook(text, { rows, lastValid: { 0: valid } });
    expect(frozen.blocks[0]!.status).toBe("frozen");
    expect(frozen.blocks[0]!.charts.map((chart) => chart.id)).toEqual(["d"]);
    // The other block still sees the frozen block's definitions.
    expect(frozen.blocks[1]!.charts.map((chart) => chart.id)).toEqual([
      "delta",
    ]);
    // Problems point at the file's text, never at the stand-in.
    expect(
      frozen.diagnostics.every((item) => item.line <= text.split("\n").length)
    ).toBe(true);
  });

  it("flags a calculation defined twice at both definitions", () => {
    const result = compileNotebook(
      [
        fence("calc delta = actual - forecast"),
        fence("calc delta = forecast - actual"),
      ].join("\n"),
      { rows }
    );
    expect(
      result.diagnostics.map((item) => [item.line, item.severity])
    ).toEqual([
      [2, "warning"],
      [5, "error"],
    ]);
    expect(result.blocks[0]!.status).toBe("ok");
    expect(result.blocks[1]!.status).toBe("invalid");
  });

  it("rejects views, which a notebook places by block", () => {
    const result = compileNotebook(fence('view "A" {\n  hist actual\n}'), {
      rows,
    });
    expect(result.diagnostics[0]!.message).toMatch(/no views/);
    expect(result.blocks[0]!.status).toBe("invalid");
  });

  it("reports a block with no closing fence", () => {
    const result = compileNotebook("```eda\nhist actual\n", { rows });
    expect(result.diagnostics[0]).toMatchObject({
      line: 1,
      message: "This eda block has no closing fence.",
    });
  });
});

describe("formatNotebook", () => {
  it("formats only the text inside eda fences", () => {
    const text = [
      "Prose   with  spacing  stays.",
      "```eda",
      "line @d   x=time y=actual {",
      "series actual    lineColor=#3479a8  # blue",
      "}",
      "```",
      "```js",
      "  const   x = 1;",
      "```",
    ].join("\n");
    expect(formatNotebook(text)).toBe(
      [
        "Prose   with  spacing  stays.",
        "```eda",
        "line @d x=time y=actual {",
        "  series actual lineColor=#3479a8 # blue",
        "}",
        "```",
        "```js",
        "  const   x = 1;",
        "```",
      ].join("\n")
    );
  });
});
