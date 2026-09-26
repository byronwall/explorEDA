import { render, screen } from "@testing-library/react";
import { scaleBand } from "d3-scale";
import { describe, expect, it } from "vitest";
import { numericScale } from "./numericScale";
import { findAxisGuide, planAxes } from "./axisPlan";
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
    expect(plan.x.ticks.omitted.length).toBeGreaterThan(0);
    expect(plan.x.ticks.shown).toEqual(
      plan.x.ticks.candidates.filter(
        (tick) => !plan.x.ticks.omitted.includes(tick)
      )
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
    expect(screen.getByRole("button", { name: "Zero baseline" })).toHaveAttribute(
      "data-plan-id",
      "y:zero"
    );
    expect(findAxisGuide(plan, "y:zero")?.guide.line?.y1).toBe(100);
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
        scale: scaleBand<string>()
          .domain(["a", "b", "c"])
          .range([0, 200]),
        format: String,
        label: "Category",
      },
    });
    expect(plan.y.ticks.shown).toEqual(["a", "b", "c"]);
    expect(plan.y.guides.some((guide) => guide.role === "label")).toBe(false);
  });
});
