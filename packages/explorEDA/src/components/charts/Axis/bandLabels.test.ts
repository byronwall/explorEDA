import { scaleBand, scaleLinear } from "d3-scale";
import { expect, it } from "vitest";
import { planAxes } from "./axisPlan";

function labels(categories: string[], width: number) {
  const plan = planAxes({
    plotWidth: width,
    plotHeight: 200,
    margin: { top: 10, right: 10, bottom: 50, left: 40 },
    x: {
      scale: scaleBand<string>().domain(categories).range([0, width]),
      format: String,
    },
    y: {
      scale: scaleLinear().domain([0, 10]).range([200, 0]),
      format: String,
    },
  });
  return plan.x.guides
    .filter((guide) => guide.role === "tick")
    .map((guide) => guide.label!.text);
}

it("shows every few crowded categories in full instead of cutting each one", () => {
  const years = Array.from({ length: 54 }, (_, index) => `Y${1960 + index}`);
  const shown = labels(years, 600);
  expect(shown.length).toBeLessThan(years.length);
  expect(shown[0]).toBe("Y1960");
  expect(shown.every((text) => !text.includes("…"))).toBe(true);
});

it("keeps every category when each slot holds a readable label", () => {
  const names = ["North America", "South America", "Europe", "Asia", "Oceania"];
  expect(labels(names, 300)).toHaveLength(5);
});
