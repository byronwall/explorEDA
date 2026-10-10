import { describe, expect, it } from "vitest";
import {
  EXPLOREDA_CATEGORICAL,
  MISSING_COLOR,
  OTHER_COLOR,
  findClosestPair,
  getCategoricalPalette,
} from "./colorPalettes";
import { assignCategoryColors } from "./colorScaleMath";
import {
  THEME_PALETTE,
  adoptThemePalette,
  darkStep,
  handPickedCategories,
  normalizeColorScale,
  resolveColorScale,
  themeColors,
} from "./themePalettes";
import type { CategoricalColorScale } from "@/types/ColorScaleTypes";

const newsprint = getCategoricalPalette("Newsprint")!.colors;

function themeScale(labels: string[], hand: Record<string, string> = {}) {
  const { mapping, palette } = assignCategoryColors(labels, {
    paletteId: THEME_PALETTE,
    order: "data",
  });
  Object.entries(hand).forEach(([label, color]) => mapping.set(label, color));
  return {
    id: "s",
    name: "Species",
    type: "categorical",
    paletteId: THEME_PALETTE,
    palette,
    mapping,
  } satisfies CategoricalColorScale;
}

describe("theme palettes", () => {
  it("saves theme scales in the Compact palette", () => {
    const scale = themeScale(["A", "B"]);
    expect([...scale.mapping.values()]).toEqual(
      EXPLOREDA_CATEGORICAL.slice(0, 2)
    );
  });

  it("draws each category in its slot of the current theme", () => {
    const scale = themeScale(["A", "B", "C"]);
    const drawn = resolveColorScale(scale, {
      themeId: "newsprint",
      dark: false,
    });
    expect([...drawn.mapping.values()]).toEqual(
      newsprint.slice(0, 3).map((color) => color.toLowerCase())
    );
    // The saved scale is untouched.
    expect(scale.mapping.get("A")).toBe(EXPLOREDA_CATEGORICAL[0]);
    // Compact in light mode draws the saved colors.
    expect(resolveColorScale(scale, { themeId: "compact", dark: false })).toBe(
      scale
    );
  });

  it("keeps hand-picked colors in every theme", () => {
    const scale = themeScale(["A", "B"], { B: "#123456" });
    const drawn = resolveColorScale(scale, {
      themeId: "report",
      dark: true,
    });
    expect(drawn.mapping.get("B")).toBe("#123456");
    expect(handPickedCategories(scale)).toEqual([["B", "#123456"]]);
  });

  it("lifts palette colors for dark surfaces", () => {
    const lifted = darkStep("#1f5a96");
    expect(lifted).not.toBe("#1f5a96");
    expect(darkStep("#f0f0f0")).toBe("#f0f0f0");
    const drawn = resolveColorScale(themeScale(["A"]), {
      themeId: "compact",
      dark: true,
    });
    expect(drawn.mapping.get("A")).toBe(darkStep(EXPLOREDA_CATEGORICAL[0]));
  });

  it("saves themed colors an editor hands back as their slots", () => {
    const scale = themeScale(["A", "B"], { B: "#123456" });
    const context = { themeId: "newsprint" as const, dark: true };
    const drawn = resolveColorScale(scale, context);
    const saved = normalizeColorScale(drawn, THEME_PALETTE, context);
    expect([...saved.mapping]).toEqual([...scale.mapping]);
  });

  it("adopts the theme palette for untouched default scales only", () => {
    const { mapping, palette } = assignCategoryColors(["A", "B", "(missing)"], {
      paletteId: "explorEDA",
    });
    const legacy = {
      id: "l",
      name: "Legacy",
      type: "categorical",
      paletteId: "explorEDA",
      palette,
      mapping,
    } satisfies CategoricalColorScale;
    expect(adoptThemePalette(legacy).paletteId).toBe(THEME_PALETTE);
    const edited = {
      ...legacy,
      mapping: new Map([...legacy.mapping, ["A", "#123456"]]),
    };
    expect(adoptThemePalette(edited).paletteId).toBe("explorEDA");
    const fixed = { ...legacy, paletteId: "Tableau10" };
    expect(adoptThemePalette(fixed).paletteId).toBe("Tableau10");
    expect([OTHER_COLOR, MISSING_COLOR]).toHaveLength(2);
  });

  it("keeps the Compact fallback colors and themes the others", () => {
    expect(themeColors({ themeId: "compact", dark: false })).toEqual({
      categorical: EXPLOREDA_CATEGORICAL.map((color) => color.toLowerCase()),
      mark: "#3479a8",
    });
    expect(themeColors({ themeId: "newsprint", dark: false }).mark).toBe(
      newsprint[0]
    );
  });

  it("keeps each theme's first three colors distinct for every reader", () => {
    for (const id of ["Newsprint", "Report"]) {
      expect(
        findClosestPair(getCategoricalPalette(id)!.colors.slice(0, 3)),
        id
      ).toBeUndefined();
    }
  });
});
