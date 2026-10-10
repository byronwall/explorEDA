import { scaleLinear } from "d3-scale";
import { describe, expect, it } from "vitest";
import {
  DEFAULT_AXIS_TYPOGRAPHY,
  planAxes,
  planChartMargin,
  type AxisTypography,
} from "./axisPlan";

const margin = { top: 10, right: 10, bottom: 30, left: 40 };

/** A serif face about half again as wide as the old estimate. */
const wide: AxisTypography = {
  tickSize: 11,
  labelSize: 12,
  measure: (text, size) => text.length * size * 0.9,
};

function plan(typography?: AxisTypography) {
  return planAxes({
    plotWidth: 300,
    plotHeight: 200,
    margin,
    x: {
      typography,
      scale: scaleLinear().domain([0, 100000]).range([0, 300]),
      format: (value) => Number(value).toLocaleString("en-US"),
      label: "Revenue per customer in the first quarter",
    },
    y: {
      typography,
      scale: scaleLinear().domain([0, 10]).range([200, 0]),
      format: String,
      label: "Orders",
    },
  });
}

describe("axis typography", () => {
  it("keeps the compact layout when no theme sizes are given", () => {
    const compact = plan();
    const explicit = plan(DEFAULT_AXIS_TYPOGRAPHY);
    expect(explicit).toEqual(compact);
    const tick = compact.x.guides.find((guide) => guide.role === "tick");
    expect(tick?.label).toMatchObject({ fontSize: 10, y: 217 });
    expect(
      planChartMargin({
        margin,
        width: 400,
        yDomain: [0, 6000],
        hasXLabel: true,
        hasYLabel: true,
      }).margin
    ).toEqual({ ...margin, left: 66, bottom: 46 });
  });

  it("uses theme sizes where the chart sets none", () => {
    const themed = plan(wide);
    const tick = themed.x.guides.find((guide) => guide.role === "tick");
    expect(tick?.label?.fontSize).toBe(11);
    const label = themed.x.guides.find((guide) => guide.role === "label");
    expect(label?.label?.fontSize).toBe(12);
  });

  it("drops ticks that wide type would overlap", () => {
    expect(plan(wide).x.ticks.shown.length).toBeLessThan(
      plan().x.ticks.shown.length
    );
  });

  it("widens the margins for wide or larger type", () => {
    const compact = planChartMargin({
      margin,
      width: 400,
      yDomain: [0, 6000],
      hasXLabel: true,
      hasYLabel: true,
    }).margin;
    const themed = planChartMargin({
      margin,
      width: 400,
      yDomain: [0, 6000],
      hasXLabel: true,
      hasYLabel: true,
      typography: wide,
    }).margin;
    expect(themed.left).toBeGreaterThan(compact.left);
    expect(themed.bottom).toBe(compact.bottom + 1 + 1);
  });

  it("never measures text narrower than the old estimate", () => {
    const narrow: AxisTypography = {
      ...DEFAULT_AXIS_TYPOGRAPHY,
      measure: () => 1,
    };
    expect(plan(narrow)).toEqual(plan());
  });
});
