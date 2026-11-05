import { render, screen } from "@testing-library/react";
import { scaleBand } from "d3-scale";
import { describe, expect, it } from "vitest";
import { numericScale } from "./numericScale";
import { findAxisGuide, planAxes, planChartMargin } from "./axisPlan";
import { PlannedAxes } from "./AxisLayer";

const margin = { top: 10, right: 10, bottom: 40, left: 60 };

function crowdedPlan() {
  const scale = numericScale({ scaleType: "symlog" })
    .domain([1, 25000])
    .range([0, 600]);
  return planAxes({
    plotWidth: 600,
    plotHeight: 600,
    margin,
    x: {
      scale,
      scaleType: "symlog",
      format: (value) => Number(value).toLocaleString("en-US"),
    },
    y: {
      scale: numericScale({ scaleType: "symlog" })
        .domain([1, 25000])
        .range([600, 0]),
      format: String,
    },
  });
}

describe("planAxes", () => {
  it("keeps tick labels apart when a symlog scale crowds large values", () => {
    const plan = crowdedPlan();
    const x = plan.x.guides
      .filter((guide) => guide.role === "tick")
      .map((guide) => guide.label!.x);
    expect(x.length).toBeGreaterThan(1);
    expect(x.every((at, index) => !index || at - x[index - 1]! >= 41)).toBe(
      true
    );
    const y = plan.y.guides
      .filter((guide) => guide.role === "tick")
      .map((guide) => guide.label!.y)
      .sort((a, b) => a - b);
    expect(y.every((at, index) => !index || at - y[index - 1]! >= 20)).toBe(
      true
    );
    expect(plan.x.ticks.shown).toEqual(
      plan.x.ticks.candidates.filter(
        (tick) => !plan.x.ticks.omitted.includes(tick)
      )
    );
  });

  it("keeps the lowest tick when a short Y axis drops crowded labels", () => {
    const plan = planAxes({
      plotWidth: 300,
      plotHeight: 48,
      margin,
      x: {
        scale: numericScale({}).domain([0, 10]).range([0, 300]),
        format: String,
      },
      y: {
        scale: numericScale({}).domain([0, 1]).range([48, 0]),
        format: (value) => `${Math.round(Number(value) * 100)}%`,
      },
    });
    expect(plan.y.ticks.shown.length).toBeLessThan(
      plan.y.ticks.candidates.length
    );
    // Shown ticks keep position order, top first; the baseline stays.
    expect(plan.y.ticks.shown).toEqual([0.6, 0]);
  });

  it("labels a symlog axis that lies inside one decade", () => {
    const plan = planAxes({
      plotWidth: 300,
      plotHeight: 200,
      margin,
      x: {
        scale: numericScale({ scaleType: "symlog" })
          .domain([1200, 1900])
          .range([0, 300]),
        scaleType: "symlog",
        format: String,
      },
      y: {
        scale: numericScale({}).domain([0, 10]).range([200, 0]),
        format: String,
      },
    });
    expect(plan.x.ticks.shown.length).toBeGreaterThan(1);
  });

  it("asks for fewer ticks when a format makes neighbours read the same", () => {
    const wholeNumbers = (value: string | number) =>
      Math.round(Number(value)).toString();
    const plan = planAxes({
      plotWidth: 300,
      plotHeight: 300,
      margin,
      x: {
        scale: numericScale({}).domain([0, 2]).range([0, 300]),
        format: wholeNumbers,
      },
      y: {
        scale: numericScale({}).domain([0, 2]).range([300, 0]),
        format: wholeNumbers,
      },
    });
    expect(plan.x.ticks.candidates).toEqual([0, 1, 2]);
    expect(plan.y.ticks.shown.map(wholeNumbers)).toEqual(["2", "1", "0"]);
  });

  it("measures the left margin from the labels the axis draws", () => {
    const format = (value: string | number) =>
      `${Number(value).toLocaleString("en-US")} kg`;
    const plain = planChartMargin({
      margin,
      width: 400,
      yDomain: [0, 1_000_000],
      hasXLabel: false,
      hasYLabel: true,
    });
    const formatted = planChartMargin({
      margin,
      width: 400,
      yDomain: [0, 1_000_000],
      hasXLabel: false,
      hasYLabel: true,
      yFormat: format,
    });
    expect(formatted.margin.left).toBeGreaterThan(plain.margin.left);
    const dollars = (value: string | number) => "$" + Number(value).toFixed(2);
    const symlog = planChartMargin({
      margin,
      width: 400,
      yDomain: [1, 25000],
      hasXLabel: false,
      hasYLabel: true,
      yScaleType: "symlog",
      yFormat: dollars,
    });
    // Symlog labels powers of ten, so $10000 (every tick drops .00) sets
    // the margin.
    expect(symlog.margin.left).toBeGreaterThanOrEqual(
      planChartMargin({
        margin,
        width: 400,
        yDomain: [1, 25000],
        hasXLabel: false,
        hasYLabel: true,
        yLabels: ["$10000"],
      }).margin.left
    );
  });

  it("uses the density setting as the candidate target and draws every shown tick", () => {
    const plan = planAxes({
      plotWidth: 120,
      plotHeight: 100,
      margin,
      x: {
        scale: numericScale({}).domain([0, 100]).range([0, 120]),
        density: 10,
        grid: true,
        format: String,
      },
      y: {
        scale: numericScale({}).domain([0, 10]).range([100, 0]),
        format: String,
        zero: true,
      },
    });
    expect(plan.x.ticks.requested).toBe(10);
    expect(plan.x.ticks.candidates).toHaveLength(11);
    expect(plan.x.grid?.values).toEqual(plan.x.ticks.candidates);
    render(
      <svg>
        <PlannedAxes plan={plan} interactive />
      </svg>
    );
    for (const tick of plan.x.ticks.shown) {
      expect(
        screen.getByRole("button", { name: `Horizontal tick ${tick}` })
      ).toHaveAttribute("data-plan-id", `x:tick:${tick}`);
    }
    expect(
      screen.getByRole("button", { name: "Zero baseline" })
    ).toHaveAttribute("data-plan-id", "y:zero");
    expect(findAxisGuide(plan, "y:zero")?.guide.line?.y1).toBe(100);
  });

  it("thins the labels of a band Y axis with more categories than lines", () => {
    const categories = Array.from({ length: 60 }, (_, i) => `c${i}`);
    const plan = planAxes({
      plotWidth: 300,
      plotHeight: 200,
      margin,
      x: {
        scale: numericScale({}).domain([0, 5]).range([0, 300]),
        format: String,
      },
      y: {
        scale: scaleBand<string>().domain(categories).range([0, 200]),
        format: String,
      },
    });
    expect(plan.y.ticks.shown.length).toBeLessThanOrEqual(20);
    expect(plan.y.ticks.shown[0]).toBe("c0");
  });

  it("lists every band category and has no title on a band Y axis", () => {
    const plan = planAxes({
      plotWidth: 300,
      plotHeight: 200,
      margin,
      x: {
        scale: numericScale({}).domain([0, 5]).range([0, 300]),
        format: String,
      },
      y: {
        scale: scaleBand<string>().domain(["a", "b", "c"]).range([0, 200]),
        format: String,
        label: "Category",
      },
    });
    expect(plan.y.ticks.shown).toEqual(["a", "b", "c"]);
    expect(plan.y.guides.some((guide) => guide.role === "label")).toBe(false);
  });

  it("uses saved tick and axis label font sizes", () => {
    const plan = planAxes({
      plotWidth: 300,
      plotHeight: 200,
      margin,
      x: {
        scale: numericScale({}).domain([0, 10]).range([0, 300]),
        format: String,
        label: "X units",
        tickFontSize: 12,
        labelFontSize: 14,
      },
      y: {
        scale: numericScale({}).domain([0, 10]).range([200, 0]),
        format: String,
        label: "Y units",
        tickFontSize: 8,
        labelFontSize: 9,
      },
    });

    expect(findAxisGuide(plan, "x:tick:0")?.guide.label?.fontSize).toBe(12);
    expect(findAxisGuide(plan, "x:label")?.guide.label?.fontSize).toBe(14);
    expect(findAxisGuide(plan, "y:tick:0")?.guide.label?.fontSize).toBe(8);
    expect(findAxisGuide(plan, "y:label")?.guide.label?.fontSize).toBe(9);
  });
});
