import { categoryLabel } from "./categories";
import { finiteNumber } from "./numeric";
import {
  DEFAULT_CATEGORICAL_PALETTE,
  DEFAULT_SEQUENTIAL_PALETTE,
  EXPLOREDA_CATEGORICAL,
  MISSING_COLOR,
  OTHER_COLOR,
  CATEGORICAL_PALETTES,
  getCategoricalPalette,
  getRampPalette,
  sampleOrderedColors,
  type RampPalette,
} from "./colorPalettes";
import type { datum } from "@/types/ChartTypes";
import type {
  CategoricalColorScale,
  CategoryColorOrder,
  ColorScaleType,
  NumericalColorScale,
} from "@/types/ColorScaleTypes";
import { scaleOrdinal, scaleSequential } from "d3-scale";

export const defaultCategoricalColors: readonly string[] =
  EXPLOREDA_CATEGORICAL;

/** The label `categoryLabel` gives a missing value. */
export const MISSING_CATEGORY = categoryLabel(null);

function rampFor(scale: Pick<NumericalColorScale, "palette">): RampPalette {
  return (
    getRampPalette(scale.palette) ?? getRampPalette(DEFAULT_SEQUENTIAL_PALETTE)!
  );
}

export function isDivergingScale(scale: Pick<NumericalColorScale, "palette">) {
  return rampFor(scale).kind === "diverging";
}

/** The value a diverging scale centers on, kept inside the domain. */
export function scaleMidpoint(
  scale: Pick<NumericalColorScale, "min" | "max" | "midpoint">
) {
  const { min, max } = scale;
  const fallback = min < 0 && max > 0 ? 0 : (min + max) / 2;
  const midpoint = Number.isFinite(scale.midpoint) ? scale.midpoint! : fallback;
  return Math.min(Math.max(midpoint, Math.min(min, max)), Math.max(min, max));
}

function transformPair(scale: NumericalColorScale) {
  const transform = scale.transform ?? "linear";
  if (transform === "sqrt") {
    return {
      forward: (value: number) => Math.sign(value) * Math.sqrt(Math.abs(value)),
      inverse: (value: number) => Math.sign(value) * value * value,
    };
  }
  if (transform === "log") {
    if (scale.min > 0) {
      return { forward: Math.log, inverse: Math.exp };
    }
    // A domain that reaches zero or below uses a symmetric log.
    return {
      forward: (value: number) =>
        Math.sign(value) * Math.log1p(Math.abs(value)),
      inverse: (value: number) =>
        Math.sign(value) * Math.expm1(Math.abs(value)),
    };
  }
  return {
    forward: (value: number) => value,
    inverse: (value: number) => value,
  };
}

/**
 * Maps values to positions on a scale's ramp and back. Positions run 0 to 1
 * before any steps apply; a diverging scale puts its midpoint at 0.5.
 */
export function numericalGeometry(scale: NumericalColorScale) {
  const low = Math.min(scale.min, scale.max);
  const high = Math.max(scale.min, scale.max);
  const { forward, inverse } = transformPair({ ...scale, min: low, max: high });
  const diverging = isDivergingScale(scale);
  const midpoint = scaleMidpoint(scale);
  const f0 = forward(low);
  const f1 = forward(high);
  const fm = forward(midpoint);
  const ratio = (value: number, from: number, to: number) =>
    to === from ? 0.5 : (value - from) / (to - from);

  const valueToT = (value: number) => {
    if (low === high) {
      return 0.5;
    }
    const fv = forward(Math.min(Math.max(value, low), high));
    if (!diverging) {
      return ratio(fv, f0, f1);
    }
    if (fv <= fm) {
      return fm === f0 ? 0.5 : 0.5 * ratio(fv, f0, fm);
    }
    return fm === f1 ? 0.5 : 0.5 + 0.5 * ratio(fv, fm, f1);
  };
  const tToValue = (t: number) => {
    if (low === high) {
      return low;
    }
    if (!diverging) {
      return inverse(f0 + (f1 - f0) * t);
    }
    if (t <= 0.5) {
      return inverse(f0 + (fm - f0) * (t / 0.5));
    }
    return inverse(fm + (f1 - fm) * ((t - 0.5) / 0.5));
  };
  return { low, high, midpoint, diverging, valueToT, tToValue };
}

/** Snaps a ramp position to the middle color of its step. */
export function stepPosition(t: number, steps: number | undefined) {
  if (!steps || steps < 2) {
    return t;
  }
  const index = Math.min(steps - 1, Math.max(0, Math.floor(t * steps)));
  return index / (steps - 1);
}

export function makeNumericalColor(scale: NumericalColorScale) {
  const palette = rampFor(scale);
  const { valueToT } = numericalGeometry(scale);
  const reverse = Boolean(scale.reverse);
  return (value: number) => {
    if (!Number.isFinite(value)) {
      return MISSING_COLOR;
    }
    const t = stepPosition(valueToT(value), scale.steps);
    return palette.interpolate(reverse ? 1 - t : t);
  };
}

/** A CSS gradient of a ramp palette, optionally reversed or stepped. */
export function rampGradient(
  paletteId: string,
  { reverse = false, steps = 0 }: { reverse?: boolean; steps?: number } = {}
) {
  const palette =
    getRampPalette(paletteId) ?? getRampPalette(DEFAULT_SEQUENTIAL_PALETTE)!;
  const color = (t: number) => palette.interpolate(reverse ? 1 - t : t);
  if (steps >= 2) {
    return hardStops(
      Array.from({ length: steps }, (_, index) => color(index / (steps - 1)))
    );
  }
  return `linear-gradient(to right, ${Array.from({ length: 12 }, (_, index) =>
    color(index / 11)
  ).join(", ")})`;
}

/** A CSS gradient of solid, equal bands. */
export function hardStops(colors: readonly string[]) {
  if (colors.length === 0) {
    return "transparent";
  }
  if (colors.length === 1) {
    return colors[0]!;
  }
  const width = 100 / colors.length;
  return `linear-gradient(to right, ${colors
    .map(
      (color, index) =>
        `${color} ${(index * width).toFixed(2)}% ${((index + 1) * width).toFixed(2)}%`
    )
    .join(", ")})`;
}

/** A gradient that previews a whole scale as charts draw it. */
export function scaleGradient(scale: ColorScaleType) {
  if (scale.type === "categorical") {
    const colors = [...new Set(scale.mapping.values())].slice(0, 12);
    return hardStops(colors.length ? colors : scale.palette.slice(0, 12));
  }
  const color = makeNumericalColor(scale);
  const { tToValue } = numericalGeometry(scale);
  if (scale.steps && scale.steps >= 2) {
    return hardStops(
      Array.from({ length: scale.steps }, (_, index) =>
        color(tToValue((index + 0.5) / scale.steps!))
      )
    );
  }
  return `linear-gradient(to right, ${Array.from({ length: 16 }, (_, index) =>
    color(tToValue(index / 15))
  ).join(", ")})`;
}

/** The base colors a palette offers for `count` categories. */
export function paletteColors(
  paletteId: string | undefined,
  count: number,
  reverse = false
) {
  const ramp = getRampPalette(paletteId);
  if (ramp) {
    return sampleOrderedColors(ramp, Math.max(1, count), reverse);
  }
  const colors = [
    ...(
      getCategoricalPalette(paletteId) ??
      getCategoricalPalette(DEFAULT_CATEGORICAL_PALETTE)!
    ).colors,
  ];
  return reverse ? colors.reverse() : colors;
}

/** Orders category labels before they take palette colors. */
export function orderCategories(
  categories: readonly string[],
  order: CategoryColorOrder,
  counts?: ReadonlyMap<string, number>
) {
  const indexed = categories.map((label, index) => ({ label, index }));
  if (order === "frequency" && counts) {
    indexed.sort(
      (a, b) =>
        (counts.get(b.label) ?? 0) - (counts.get(a.label) ?? 0) ||
        a.index - b.index
    );
  } else if (order === "alphabetical") {
    indexed.sort((a, b) =>
      a.label.localeCompare(b.label, undefined, {
        numeric: true,
        sensitivity: "base",
      })
    );
  }
  return indexed.map(({ label }) => label);
}

/**
 * The palette a categorical scale's colors came from. Scales saved before
 * palettes had ids are matched by their colors.
 */
export function categoricalPaletteId(scale: CategoricalColorScale) {
  if (scale.paletteId) {
    return scale.paletteId;
  }
  const colors = [...scale.mapping.values()].map((color) =>
    color.toLowerCase()
  );
  if (colors.length === 0) {
    return undefined;
  }
  return CATEGORICAL_PALETTES.find((palette) =>
    colors.every(
      (color, index) =>
        color === palette.colors[index % palette.colors.length]?.toLowerCase()
    )
  )?.id;
}

export interface CategoryAssignment {
  paletteId?: string;
  reverse?: boolean;
  order?: CategoryColorOrder;
  overflow?: "repeat" | "other";
}

/**
 * Gives each category a palette color in a fixed order. Missing values take a
 * neutral color and never use up a palette slot. Categories past the last
 * color repeat the palette or turn gray.
 */
export function assignCategoryColors(
  categories: readonly string[],
  {
    paletteId = DEFAULT_CATEGORICAL_PALETTE,
    reverse = false,
    order = "data",
    overflow = "other",
  }: CategoryAssignment,
  counts?: ReadonlyMap<string, number>
) {
  const ordered = orderCategories(
    categories.filter((label) => label !== MISSING_CATEGORY),
    order,
    counts
  );
  const colors = paletteColors(paletteId, ordered.length, reverse);
  const mapping = new Map<string, string>();
  ordered.forEach((label, index) => {
    mapping.set(
      label,
      index < colors.length
        ? colors[index]!
        : overflow === "repeat"
          ? colors[index % colors.length]!
          : OTHER_COLOR
    );
  });
  if (categories.includes(MISSING_CATEGORY)) {
    mapping.set(MISSING_CATEGORY, MISSING_COLOR);
  }
  return { mapping, palette: colors };
}

function makeCategoricalColor(scale: CategoricalColorScale) {
  // Values outside the mapping keep the previous ordinal behavior unless the
  // scale grays the overflow.
  const fallback = scaleOrdinal<string>()
    .domain(Array.from(scale.mapping.keys()))
    .range(scale.palette.length ? scale.palette : [OTHER_COLOR]);
  return (value: datum) => {
    const label = categoryLabel(value);
    const mapped = scale.mapping.get(label);
    if (mapped) {
      return mapped;
    }
    if (label === MISSING_CATEGORY) {
      return MISSING_COLOR;
    }
    if (scale.overflow === "other") {
      return OTHER_COLOR;
    }
    return fallback(label);
  };
}

export function makeColorScale(scale: ColorScaleType) {
  if (scale.type === "numerical") {
    const color = makeNumericalColor(scale);
    return (value: datum) => {
      const number = finiteNumber(value);
      return number === undefined ? MISSING_COLOR : color(number);
    };
  }
  return makeCategoricalColor(scale);
}

/** A d3 scale for callers that need one. Colors match `makeColorScale`. */
export function makeD3ColorScale(scale: ColorScaleType) {
  if (scale.type === "numerical") {
    const color = makeNumericalColor(scale);
    const { low, high } = numericalGeometry(scale);
    return scaleSequential((t: number) => color(low + (high - low) * t)).domain(
      [low, high]
    );
  }
  return scaleOrdinal<string>()
    .domain(Array.from(scale.mapping.keys()))
    .range(Array.from(scale.mapping.values()));
}

const GRADIENT_SAMPLES = 12;

export function planNumericalLegend(
  scale: Extract<ColorScaleType, { type: "numerical" }>,
  width: number,
  breakpoints: number,
  formatValue: (value: number) => string,
  getColor: (value: number) => string
) {
  const { tToValue, diverging } = numericalGeometry(scale);
  let count =
    scale.min === scale.max
      ? 1
      : Math.max(2, Math.min(Math.round(breakpoints), Math.floor(width / 56)));
  // A diverging legend labels its midpoint.
  if (diverging && count > 2 && count % 2 === 0) {
    count -= 1;
  }
  const stops = Array.from({ length: count }, (_, index) => {
    const value = count === 1 ? scale.min : tToValue(index / (count - 1));
    return { value, label: formatValue(value), color: getColor(value) };
  });
  const steps = scale.steps && scale.steps >= 2 ? scale.steps : 0;
  const background =
    count === 1
      ? stops[0]!.color
      : steps
        ? hardStops(
            Array.from({ length: steps }, (_, index) =>
              getColor(tToValue((index + 0.5) / steps))
            )
          )
        : `linear-gradient(to right, ${Array.from(
            { length: GRADIENT_SAMPLES },
            (_, index) => getColor(tToValue(index / (GRADIENT_SAMPLES - 1)))
          ).join(", ")})`;
  return {
    width,
    requestedBreakpoints: breakpoints,
    widthPerStop: 56,
    domain: [scale.min, scale.max] as [number, number],
    stops,
    background,
  };
}
