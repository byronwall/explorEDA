import { describe, expect, it } from "vitest";
import { barChartDefinition } from "@/components/charts/BarChart/definition";
import type { ChartSettings } from "@/types/ChartTypes";
import {
  chartStyleOverrides,
  listScaleOverrides,
  listStyleOverrides,
  resetChartStyle,
  resetScaleToTheme,
} from "./styleOverrides";

function chart(patch: Partial<ChartSettings> = {}) {
  return {
    ...barChartDefinition.createDefaultSettings(
      { x: 0, y: 0, w: 4, h: 4 },
      "value"
    ),
    ...patch,
  } as ChartSettings;
}

describe("style overrides", () => {
  it("lists nothing for a chart that follows the theme", () => {
    expect(chartStyleOverrides(chart())).toEqual([]);
    expect(listStyleOverrides([chart(), chart()])).toEqual([]);
  });

  it("lists title type and explicit axis sizes", () => {
    const overridden = chart({
      style: { titleSize: 28, titleWeight: 700 },
      xAxis: { tickFontSize: 12 },
    });
    expect(
      chartStyleOverrides(overridden).map(({ key, label, value }) => [
        key,
        label,
        value,
      ])
    ).toEqual([
      ["style.titleSize", "Title size", 28],
      ["style.titleWeight", "Title weight", 700],
      ["xAxis.tickFontSize", "X tick text", 12],
    ]);
  });

  it("resets one property and keeps the rest", () => {
    const overridden = chart({
      style: { titleSize: 28, subtitleSize: 14 },
      xAxis: { tickFontSize: 12, title: "Kept" },
    });
    const [size, , tick] = chartStyleOverrides(overridden);
    expect(size!.reset).toEqual({ style: { subtitleSize: 14 } });
    expect(tick!.reset).toEqual({
      xAxis: { tickFontSize: undefined, title: "Kept" },
    });
  });

  it("resets a whole chart without touching its analysis settings", () => {
    const overridden = chart({
      style: { titleSize: 28 },
      xAxis: { tickFontSize: 12, title: "Kept" },
      yAxis: { labelFontSize: 14, min: 0 },
      filters: [{ type: "range", field: "value", min: 1 }],
    });
    const patch = resetChartStyle(overridden);
    expect(patch).toEqual({
      style: undefined,
      xAxis: { tickFontSize: undefined, title: "Kept" },
      yAxis: { labelFontSize: undefined, min: 0 },
    });
    expect(
      chartStyleOverrides({ ...overridden, ...patch } as ChartSettings)
    ).toEqual([]);
  });

  it("lists scales with a fixed palette or hand-picked colors", () => {
    const base = {
      id: "s",
      name: "Species",
      type: "categorical" as const,
      palette: ["#2a78d6", "#eb6834"],
    };
    const theme = {
      ...base,
      paletteId: "theme",
      mapping: new Map([
        ["A", "#2a78d6"],
        ["B", "#eb6834"],
      ]),
    };
    expect(listScaleOverrides([theme])).toEqual([]);
    const hand = {
      ...theme,
      mapping: new Map([...theme.mapping, ["B", "#123456"]]),
    };
    expect(listScaleOverrides([hand])[0]).toMatchObject({ handPicked: 1 });
    const fixed = {
      ...theme,
      paletteId: "OkabeIto",
      mapping: new Map([["A", "#0072b2"]]),
    };
    expect(listScaleOverrides([fixed])[0]).toMatchObject({
      paletteName: "Okabe Ito",
      handPicked: 0,
    });
    const reset = resetScaleToTheme(hand);
    expect(reset.paletteId).toBe("theme");
    expect([...reset.mapping!]).toEqual([
      ["A", "#2a78d6"],
      ["B", "#eb6834"],
    ]);
  });
});
