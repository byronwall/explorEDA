import { describe, expect, it } from "vitest";
import {
  MISSING_CATEGORY,
  assignCategoryColors,
  makeColorScale,
  numericalGeometry,
  planNumericalLegend,
} from "./colorScaleMath";
import {
  EXPLOREDA_CATEGORICAL,
  MISSING_COLOR,
  OTHER_COLOR,
  findClosestPair,
  simulateColor,
} from "./colorPalettes";
import type { NumericalColorScale } from "@/types/ColorScaleTypes";

const numeric = (
  overrides: Partial<NumericalColorScale> = {}
): NumericalColorScale => ({
  id: "n",
  name: "Amount",
  type: "numerical",
  palette: "Viridis",
  min: 0,
  max: 100,
  ...overrides,
});

describe("numerical color scales", () => {
  it("maps the domain onto the ramp and clamps outside it", () => {
    const { valueToT, tToValue } = numericalGeometry(numeric());
    expect(valueToT(0)).toBe(0);
    expect(valueToT(50)).toBe(0.5);
    expect(valueToT(150)).toBe(1);
    expect(tToValue(0.25)).toBe(25);
  });

  it("centers a diverging scale on zero when the domain crosses it", () => {
    const { valueToT, tToValue, midpoint } = numericalGeometry(
      numeric({ palette: "RdBu", min: -10, max: 30 })
    );
    expect(midpoint).toBe(0);
    expect(valueToT(0)).toBe(0.5);
    expect(valueToT(-10)).toBe(0);
    expect(valueToT(15)).toBe(0.75);
    expect(tToValue(0.5)).toBe(0);
  });

  it("spaces a log scale by orders of magnitude", () => {
    const { valueToT } = numericalGeometry(
      numeric({ min: 1, max: 1000, transform: "log" })
    );
    expect(valueToT(10)).toBeCloseTo(1 / 3);
    expect(valueToT(100)).toBeCloseTo(2 / 3);
  });

  it("draws steps as solid classes and reverses the ramp", () => {
    const stepped = makeColorScale(numeric({ steps: 5 }));
    expect(stepped(1)).toBe(stepped(19));
    expect(stepped(1)).not.toBe(stepped(21));
    const forward = makeColorScale(numeric());
    const reversed = makeColorScale(numeric({ reverse: true }));
    expect(reversed(0)).toBe(forward(100));
  });

  it("gives missing and non-numeric values a neutral color", () => {
    const color = makeColorScale(numeric());
    expect(color(null)).toBe(MISSING_COLOR);
    expect(color("n/a")).toBe(MISSING_COLOR);
  });

  it("labels a diverging legend's midpoint", () => {
    const plan = planNumericalLegend(
      numeric({ palette: "RdBu", min: -50, max: 50 }),
      400,
      4,
      String,
      () => "#000"
    );
    expect(plan.stops.map((stop) => stop.value)).toEqual([-50, 0, 50]);
  });
});

describe("categorical color assignment", () => {
  const counts = new Map([
    ["small", 1],
    ["large", 30],
    ["medium", 10],
  ]);

  it("gives the largest categories the first colors", () => {
    const { mapping } = assignCategoryColors(
      ["small", "large", "medium"],
      { order: "frequency" },
      counts
    );
    expect([...mapping]).toEqual([
      ["large", EXPLOREDA_CATEGORICAL[0]],
      ["medium", EXPLOREDA_CATEGORICAL[1]],
      ["small", EXPLOREDA_CATEGORICAL[2]],
    ]);
  });

  it("keeps missing values neutral without using a palette slot", () => {
    const { mapping } = assignCategoryColors(["a", MISSING_CATEGORY, "b"], {});
    expect(mapping.get(MISSING_CATEGORY)).toBe(MISSING_COLOR);
    expect(mapping.get("b")).toBe(EXPLOREDA_CATEGORICAL[1]);
  });

  it("grays or repeats categories past the palette's end", () => {
    const labels = Array.from({ length: 10 }, (_, index) => `c${index}`);
    const gray = assignCategoryColors(labels, { overflow: "other" }).mapping;
    expect(gray.get("c8")).toBe(OTHER_COLOR);
    const repeat = assignCategoryColors(labels, { overflow: "repeat" }).mapping;
    expect(repeat.get("c8")).toBe(EXPLOREDA_CATEGORICAL[0]);
  });

  it("samples an ordered ramp once per category", () => {
    const { mapping } = assignCategoryColors(["S", "M", "L"], {
      paletteId: "Blues",
      order: "data",
    });
    expect(new Set(mapping.values()).size).toBe(3);
  });
});

describe("color checks", () => {
  it("passes the default palette's neighbors and flags near twins", () => {
    expect(findClosestPair(EXPLOREDA_CATEGORICAL.slice(0, 3))).toBeUndefined();
    expect(findClosestPair(["#3479a8", "#3a7fae"])).toMatchObject({
      first: 0,
      second: 1,
      mode: "normal",
    });
  });

  it("simulates color vision deficiency", () => {
    expect(simulateColor("#ff0000", "normal")).toBe("#ff0000");
    expect(simulateColor("#ff0000", "deuteranopia")).not.toBe("#ff0000");
    const gray = simulateColor("#2a78d6", "grayscale");
    expect(gray.slice(1, 3)).toBe(gray.slice(3, 5));
  });
});
