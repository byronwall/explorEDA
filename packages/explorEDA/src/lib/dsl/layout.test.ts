import { beforeAll, describe, expect, it } from "vitest";
import { registerAllCharts } from "@/charts/registerAllCharts";
import { compileDocument } from "./compile";
import { exportDocument } from "./export";
import {
  layoutLines,
  parseLayout,
  placeLayout,
  type LayoutProblem,
} from "./layout";
import { parseDocument } from "./parse";

beforeAll(() => registerAllCharts());

const rows = [
  { Region: "West", Channel: "Web", Revenue: 10, Units: 2 },
  { Region: "East", Channel: "Store", Revenue: 20, Units: 3 },
];

function place(text: string) {
  const problems: LayoutProblem[] = [];
  const layout = parseDocument(text).declarations[0]!;
  const placed = placeLayout(
    parseLayout(layout, problems),
    12,
    (name) => name,
    problems
  );
  return { placed: Object.fromEntries(placed), problems };
}

describe("layout lines", () => {
  it("splits columns evenly, widens repeated names, and stacks lines", () => {
    const { placed, problems } = place(`layout {
  5: size size species island
  4: bill mass flipper
  3: .  table table
}`);
    expect(problems).toEqual([]);
    expect(placed).toEqual({
      size: { x: 0, y: 0, w: 6, h: 5 },
      species: { x: 6, y: 0, w: 3, h: 5 },
      island: { x: 9, y: 0, w: 3, h: 5 },
      bill: { x: 0, y: 5, w: 4, h: 4 },
      mass: { x: 4, y: 5, w: 4, h: 4 },
      flipper: { x: 8, y: 5, w: 4, h: 4 },
      table: { x: 4, y: 9, w: 8, h: 3 },
    });
  });

  it("takes widths a cell gives, and makes a name on following lines taller", () => {
    const { placed, problems } = place(`layout {
  4: tall:7 a
  4: tall:7 b
}`);
    expect(problems).toEqual([]);
    expect(placed).toEqual({
      tall: { x: 0, y: 0, w: 7, h: 8 },
      a: { x: 7, y: 0, w: 5, h: 4 },
      b: { x: 7, y: 4, w: 5, h: 4 },
    });
  });

  it("reports cells that don't fill the columns and pieces that aren't one rectangle", () => {
    const { placed, problems } = place(`layout {
  4: a:7 b:7
  4: c d
  4: d c
}`);
    expect(problems.map((problem) => problem.message)).toEqual([
      expect.stringContaining("don't fill the 12 columns"),
      expect.stringContaining("don't form one rectangle"),
      expect.stringContaining("don't form one rectangle"),
    ]);
    expect(placed).toEqual({});
  });

  it("writes positions back as the lines that read them", () => {
    const charts = [
      { name: "size", layout: { x: 0, y: 0, w: 6, h: 5 } },
      { name: "species", layout: { x: 6, y: 0, w: 3, h: 5 } },
      { name: "island", layout: { x: 9, y: 0, w: 3, h: 5 } },
      { name: "bill", layout: { x: 0, y: 5, w: 7, h: 6 } },
      { name: "Order band", layout: { x: 7, y: 5, w: 5, h: 6 } },
    ];
    const lines = layoutLines(charts, 12)!;
    expect(lines).toEqual([
      "5: size size species island",
      '6: bill:7 "Order band":5',
    ]);
    const { placed } = place(`layout {\n${lines.join("\n")}\n}`);
    expect(placed).toEqual(
      Object.fromEntries(charts.map((chart) => [chart.name, chart.layout]))
    );
  });

  it("gives up on overlapping charts, which only at= can place", () => {
    expect(
      layoutLines(
        [
          { name: "a", layout: { x: 0, y: 0, w: 6, h: 4 } },
          { name: "b", layout: { x: 3, y: 2, w: 6, h: 4 } },
        ],
        12
      )
    ).toBeUndefined();
  });
});

describe("layout in a dashboard", () => {
  it("places charts by @name or by their field", () => {
    const result = compileDocument(
      `metric @total sum(Revenue)
row Region
hist Revenue
layout {
  2: total Region
  4: Revenue
}`,
      { rows }
    );
    expect(result.diagnostics).toEqual([]);
    expect(
      Object.fromEntries(
        result.settings.charts.map((chart) => [chart.id, chart.layout])
      )
    ).toEqual({
      total: { x: 0, y: 0, w: 6, h: 2 },
      Region: { x: 6, y: 0, w: 6, h: 2 },
      Revenue: { x: 0, y: 2, w: 12, h: 4 },
    });
  });

  it("asks for @name when two charts share a field, and places the rest", () => {
    const result = compileDocument(
      `row Region\nrow Region\nhist Revenue\nlayout {\n  4: Region Revenue\n}`,
      { rows }
    );
    expect(result.diagnostics.map((item) => item.message)).toEqual([
      expect.stringContaining("isn't in the layout"),
      expect.stringContaining("isn't in the layout"),
      expect.stringContaining("names more than one chart"),
    ]);
    expect(result.settings.charts).toHaveLength(3);
  });

  it("round-trips through export as a layout block", () => {
    const start = compileDocument(
      `row Region\nrow Channel\nhist Revenue\nlayout {\n  4: Region:7 Channel\n  3: Revenue\n}`,
      { rows }
    );
    const { text } = exportDocument(start.settings, { rows });
    expect(text).toContain(
      "layout {\n  4: Region:7 Channel:5\n  3: Revenue\n}"
    );
    expect(text).not.toContain("at=");
    const rebuilt = compileDocument(text, { rows });
    expect(rebuilt.diagnostics).toEqual([]);
    expect(rebuilt.settings.charts.map((chart) => chart.layout)).toEqual(
      start.settings.charts.map((chart) => chart.layout)
    );
  });
});

describe("the README example", () => {
  it("builds every chart where its layout says", () => {
    const sales = [
      { Revenue: 100, Cost: 60, Channel: "Web" },
      { Revenue: 50, Cost: 70, Channel: "Store" },
    ];
    const result = compileDocument(
      `revenue:num=Revenue label="Revenue ($)"
calc profit = revenue - Cost
filter Channel=Web,Store
scatter @web x=revenue y=profit where.Channel=Web {
  title="Web orders" x.scale=log
}
metric @gains sum(profit) where.profit=0..
table @orders revenue,profit,Channel
layout {
  5: web web gains
  4: orders
}`,
      { rows: sales }
    );
    expect(result.diagnostics).toEqual([]);
    expect(
      result.settings.charts.map((chart) => [chart.id, chart.layout])
    ).toEqual([
      ["web", { x: 0, y: 0, w: 8, h: 5 }],
      ["gains", { x: 8, y: 0, w: 4, h: 5 }],
      ["orders", { x: 0, y: 5, w: 12, h: 4 }],
    ]);
  });
});
