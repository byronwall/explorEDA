import { categoryLabel } from "./categories";
import type { datum } from "@/types/ChartTypes";
import type { ColorScaleType } from "@/types/ColorScaleTypes";
import { scaleOrdinal, scaleSequential } from "d3-scale";
import type { ScaleOrdinal, ScaleSequential } from "d3-scale";
import {
  interpolateCool,
  interpolateInferno,
  interpolateMagma,
  interpolatePlasma,
  interpolateViridis,
  interpolateWarm,
  schemeCategory10,
} from "d3-scale-chromatic";

const numericalPalettes = {
  Viridis: interpolateViridis,
  Inferno: interpolateInferno,
  Magma: interpolateMagma,
  Plasma: interpolatePlasma,
  Warm: interpolateWarm,
  Cool: interpolateCool,
};

export const defaultCategoricalColors = schemeCategory10;

export function makeD3ColorScale(scale: ColorScaleType) {
  if (scale.type === "numerical") {
    const interpolate =
      numericalPalettes[scale.palette as keyof typeof numericalPalettes] ??
      interpolateViridis;
    return scaleSequential(interpolate).domain([scale.min, scale.max]);
  }
  return scaleOrdinal<string>()
    .domain(Array.from(scale.mapping.keys()))
    .range(scale.palette);
}

export function makeColorScale(scale: ColorScaleType) {
  const d3Scale = makeD3ColorScale(scale);
  return (value: datum) =>
    scale.type === "numerical"
      ? (d3Scale as ScaleSequential<string>)(Number(value))
      : (d3Scale as ScaleOrdinal<string, string>)(categoryLabel(value));
}

export function planNumericalLegend(
  scale: Extract<ColorScaleType, { type: "numerical" }>,
  width: number,
  breakpoints: number,
  formatValue: (value: number) => string,
  getColor: (value: number) => string
) {
  const count =
    scale.min === scale.max
      ? 1
      : Math.max(2, Math.min(Math.round(breakpoints), Math.floor(width / 56)));
  const stops = Array.from({ length: count }, (_, index) => {
    const value =
      scale.min + ((scale.max - scale.min) * index) / Math.max(1, count - 1);
    return { value, label: formatValue(value), color: getColor(value) };
  });
  return {
    width,
    requestedBreakpoints: breakpoints,
    widthPerStop: 56,
    domain: [scale.min, scale.max] as [number, number],
    stops,
    background:
      count === 1
        ? stops[0]!.color
        : `linear-gradient(to right, ${stops.map((stop) => stop.color).join(", ")})`,
  };
}
