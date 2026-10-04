import {
  interpolateBlues,
  interpolateBrBG,
  interpolateBuPu,
  interpolateCividis,
  interpolateCool,
  interpolateGnBu,
  interpolateGreens,
  interpolateGreys,
  interpolateInferno,
  interpolateMagma,
  interpolateOranges,
  interpolatePiYG,
  interpolatePlasma,
  interpolatePRGn,
  interpolatePuOr,
  interpolatePurples,
  interpolateRdBu,
  interpolateRdYlBu,
  interpolateRdYlGn,
  interpolateReds,
  interpolateSpectral,
  interpolateViridis,
  interpolateWarm,
  interpolateYlGnBu,
  interpolateYlOrRd,
  schemeCategory10,
  schemeDark2,
  schemeObservable10,
  schemePaired,
  schemeSet2,
  schemeSet3,
  schemeTableau10,
} from "d3-scale-chromatic";

/**
 * What a palette's colors encode. Sequential shows magnitude, diverging shows
 * which side of a midpoint a value falls on, and categorical shows identity.
 */
export type PaletteKind = "sequential" | "diverging" | "categorical";

interface PaletteBase {
  /** Stable id stored in saved scales. Never rename one. */
  id: string;
  name: string;
  kind: PaletteKind;
  /** Subgroup shown in the palette picker. */
  group: string;
  /** One line on when to pick it. */
  description: string;
  /** Neighboring colors stay distinct under common color vision deficiencies. */
  colorblindSafe: boolean;
}

export interface RampPalette extends PaletteBase {
  kind: "sequential" | "diverging";
  interpolate: (t: number) => string;
}

export interface CategoricalPalette extends PaletteBase {
  kind: "categorical";
  colors: readonly string[];
}

export type Palette = RampPalette | CategoricalPalette;

/** Neutral for values beyond a palette's colors when the rest are grayed. */
export const OTHER_COLOR = "#9c9c98";
/** Neutral for missing or non-numeric values on any scale. */
export const MISSING_COLOR = "#c9c8c3";

/**
 * The default categorical order. Its adjacent pairs clear a CVD Delta E of 8
 * and a normal-vision Delta E of 15, and the first three colors stay distinct
 * from one another for every reader.
 */
export const EXPLOREDA_CATEGORICAL = [
  "#2a78d6",
  "#eb6834",
  "#1baf7a",
  "#eda100",
  "#e87ba4",
  "#008300",
  "#4a3aa7",
  "#e34948",
] as const;

// Okabe and Ito's set without its yellow, which is too pale for marks, and in
// an order whose neighbors pass the same checks as the default.
const OKABE_ITO = [
  "#0072b2",
  "#e69f00",
  "#009e73",
  "#d55e00",
  "#56b4e9",
  "#cc79a7",
] as const;

const ramp = (
  id: string,
  name: string,
  kind: RampPalette["kind"],
  group: string,
  interpolate: (t: number) => string,
  colorblindSafe: boolean,
  description: string
): RampPalette => ({
  id,
  name,
  kind,
  group,
  interpolate,
  colorblindSafe,
  description,
});

const categorical = (
  id: string,
  name: string,
  colors: readonly string[],
  colorblindSafe: boolean,
  description: string
): CategoricalPalette => ({
  id,
  name,
  kind: "categorical",
  group: "Categorical",
  colors,
  colorblindSafe,
  description,
});

export const RAMP_PALETTES: readonly RampPalette[] = [
  ramp(
    "Viridis",
    "Viridis",
    "sequential",
    "Perceptual",
    interpolateViridis,
    true,
    "Even steps in lightness from dark blue to yellow. A safe default."
  ),
  ramp(
    "Cividis",
    "Cividis",
    "sequential",
    "Perceptual",
    interpolateCividis,
    true,
    "Viridis tuned so readers with red-green color blindness see the same ramp."
  ),
  ramp(
    "Magma",
    "Magma",
    "sequential",
    "Perceptual",
    interpolateMagma,
    true,
    "Black through purple to pale yellow. Strong contrast at the high end."
  ),
  ramp(
    "Inferno",
    "Inferno",
    "sequential",
    "Perceptual",
    interpolateInferno,
    true,
    "Black through red to yellow. Hot values stand out."
  ),
  ramp(
    "Plasma",
    "Plasma",
    "sequential",
    "Perceptual",
    interpolatePlasma,
    true,
    "Blue through magenta to yellow, with no near-black end."
  ),
  ramp(
    "Blues",
    "Blues",
    "sequential",
    "Single hue",
    interpolateBlues,
    true,
    "One hue from pale to dark. Quiet, and reads as more is darker."
  ),
  ramp(
    "Greens",
    "Greens",
    "sequential",
    "Single hue",
    interpolateGreens,
    true,
    "One hue from pale to dark green."
  ),
  ramp(
    "Oranges",
    "Oranges",
    "sequential",
    "Single hue",
    interpolateOranges,
    true,
    "One hue from pale to dark orange."
  ),
  ramp(
    "Purples",
    "Purples",
    "sequential",
    "Single hue",
    interpolatePurples,
    true,
    "One hue from pale to dark purple."
  ),
  ramp(
    "Reds",
    "Reds",
    "sequential",
    "Single hue",
    interpolateReds,
    true,
    "One hue from pale to dark red. Suits risk or cost."
  ),
  ramp(
    "Greys",
    "Greys",
    "sequential",
    "Single hue",
    interpolateGreys,
    true,
    "Neutral ramp that leaves color free for highlights."
  ),
  ramp(
    "YlGnBu",
    "Yellow Green Blue",
    "sequential",
    "Multi-hue",
    interpolateYlGnBu,
    true,
    "Pale yellow to deep blue. Wide range with clear steps."
  ),
  ramp(
    "YlOrRd",
    "Yellow Orange Red",
    "sequential",
    "Multi-hue",
    interpolateYlOrRd,
    true,
    "Pale yellow to deep red. Reads as heat or intensity."
  ),
  ramp(
    "GnBu",
    "Green Blue",
    "sequential",
    "Multi-hue",
    interpolateGnBu,
    true,
    "Pale green to deep blue."
  ),
  ramp(
    "BuPu",
    "Blue Purple",
    "sequential",
    "Multi-hue",
    interpolateBuPu,
    true,
    "Pale blue to deep purple."
  ),
  ramp(
    "Warm",
    "Warm",
    "sequential",
    "Multi-hue",
    interpolateWarm,
    false,
    "Purple through pink to yellow. Bright, but lightness is uneven."
  ),
  ramp(
    "Cool",
    "Cool",
    "sequential",
    "Multi-hue",
    interpolateCool,
    false,
    "Purple through blue to green. Bright, but lightness is uneven."
  ),
  ramp(
    "RdBu",
    "Red Blue",
    "diverging",
    "Diverging",
    interpolateRdBu,
    true,
    "Red below the midpoint, blue above, near white at the midpoint."
  ),
  ramp(
    "PuOr",
    "Purple Orange",
    "diverging",
    "Diverging",
    interpolatePuOr,
    true,
    "Orange below the midpoint, purple above. Avoids red and green."
  ),
  ramp(
    "BrBG",
    "Brown Teal",
    "diverging",
    "Diverging",
    interpolateBrBG,
    true,
    "Brown below the midpoint, teal above. Earthy and calm."
  ),
  ramp(
    "PiYG",
    "Pink Green",
    "diverging",
    "Diverging",
    interpolatePiYG,
    true,
    "Pink below the midpoint, green above."
  ),
  ramp(
    "PRGn",
    "Purple Green",
    "diverging",
    "Diverging",
    interpolatePRGn,
    true,
    "Purple below the midpoint, green above."
  ),
  ramp(
    "RdYlBu",
    "Red Yellow Blue",
    "diverging",
    "Diverging",
    interpolateRdYlBu,
    true,
    "Red to blue through a pale yellow midpoint. More steps to tell apart."
  ),
  ramp(
    "Spectral",
    "Spectral",
    "diverging",
    "Diverging",
    interpolateSpectral,
    false,
    "Red through yellow to blue. Vivid, but hard for red-green color blindness."
  ),
  ramp(
    "RdYlGn",
    "Red Yellow Green",
    "diverging",
    "Diverging",
    interpolateRdYlGn,
    false,
    "Red is bad and green is good. Hard for red-green color blindness."
  ),
];

export const CATEGORICAL_PALETTES: readonly CategoricalPalette[] = [
  categorical(
    "explorEDA",
    "explorEDA",
    EXPLOREDA_CATEGORICAL,
    true,
    "Eight hues ordered so neighbors stay distinct, including for color-blind readers."
  ),
  categorical(
    "OkabeIto",
    "Okabe Ito",
    OKABE_ITO,
    true,
    "Six colors designed to be told apart under every common color vision deficiency."
  ),
  categorical(
    "Tableau10",
    "Tableau 10",
    schemeTableau10,
    false,
    "Ten balanced, muted hues."
  ),
  categorical(
    "Observable10",
    "Observable 10",
    schemeObservable10,
    false,
    "Ten bright hues with even weight."
  ),
  categorical(
    "Category10",
    "Category 10",
    schemeCategory10,
    false,
    "The classic d3 set of ten saturated hues."
  ),
  categorical(
    "Dark2",
    "Dark 2",
    schemeDark2,
    false,
    "Eight deep hues that hold up on light backgrounds."
  ),
  categorical(
    "Set2",
    "Set 2",
    schemeSet2,
    false,
    "Eight soft hues for large filled areas."
  ),
  categorical(
    "Paired",
    "Paired",
    schemePaired,
    false,
    "Six light and dark pairs. Suits categories that come in twos."
  ),
  categorical(
    "Set3",
    "Set 3",
    schemeSet3,
    false,
    "Twelve pale hues for many categories."
  ),
];

export const DEFAULT_SEQUENTIAL_PALETTE = "Viridis";
export const DEFAULT_DIVERGING_PALETTE = "RdBu";
export const DEFAULT_CATEGORICAL_PALETTE = "explorEDA";

export function getRampPalette(id: string | undefined) {
  return RAMP_PALETTES.find((palette) => palette.id === id);
}

export function getCategoricalPalette(id: string | undefined) {
  return CATEGORICAL_PALETTES.find((palette) => palette.id === id);
}

export function getPalette(id: string | undefined): Palette | undefined {
  return getRampPalette(id) ?? getCategoricalPalette(id);
}

/** Even samples across a ramp, ends included. */
export function sampleRamp(
  interpolate: (t: number) => string,
  count: number,
  reverse = false
) {
  if (count <= 1) {
    return [toHex(interpolate(0.5))];
  }
  return Array.from({ length: count }, (_, index) => {
    const t = index / (count - 1);
    return toHex(interpolate(reverse ? 1 - t : t));
  });
}

/**
 * Colors for categories that have an order, sampled from a ramp. The pale end
 * is trimmed so the lightest category still reads against the surface.
 */
export function sampleOrderedColors(
  palette: RampPalette,
  count: number,
  reverse = false
) {
  if (count <= 0) {
    return [];
  }
  const [low, high] =
    palette.kind === "diverging"
      ? [0.04, 0.96]
      : palette.group === "Perceptual"
        ? [0, 0.92]
        : [0.28, 1];
  return Array.from({ length: count }, (_, index) => {
    const t = count === 1 ? 0.5 : index / (count - 1);
    const position = low + (high - low) * (reverse ? 1 - t : t);
    return toHex(palette.interpolate(position));
  });
}

// Color math: sRGB, OKLab, and color vision deficiency simulation.

type Rgb = [number, number, number];

export function parseColor(color: string): Rgb | undefined {
  const value = color.trim().toLowerCase();
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/.exec(value)?.[1];
  if (hex) {
    const full =
      hex.length === 3
        ? hex
            .split("")
            .map((digit) => digit + digit)
            .join("")
        : hex;
    return [0, 2, 4].map((offset) =>
      parseInt(full.slice(offset, offset + 2), 16)
    ) as Rgb;
  }
  const rgb = /^rgba?\(([^)]+)\)$/.exec(value)?.[1];
  if (rgb) {
    const parts = rgb
      .split(/[\s,/]+/)
      .filter(Boolean)
      .slice(0, 3)
      .map(Number);
    if (parts.length === 3 && parts.every(Number.isFinite)) {
      return parts as Rgb;
    }
  }
  return undefined;
}

export function isValidColor(color: string) {
  return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(color.trim());
}

const channelHex = (value: number) =>
  Math.round(Math.max(0, Math.min(255, value)))
    .toString(16)
    .padStart(2, "0");

export function toHex(color: string) {
  const rgb = parseColor(color);
  return rgb ? `#${rgb.map(channelHex).join("")}` : color;
}

const toLinear = (value: number) => {
  const channel = value / 255;
  return channel <= 0.04045
    ? channel / 12.92
    : Math.pow((channel + 0.055) / 1.055, 2.4);
};
const fromLinear = (value: number) => {
  const channel = Math.max(0, Math.min(1, value));
  return (
    255 *
    (channel <= 0.0031308
      ? channel * 12.92
      : 1.055 * Math.pow(channel, 1 / 2.4) - 0.055)
  );
};

/** Vision types the color editor can preview. */
export type VisionMode =
  | "normal"
  | "deuteranopia"
  | "protanopia"
  | "tritanopia"
  | "grayscale";

export const VISION_MODES: readonly {
  value: VisionMode;
  label: string;
  description: string;
}[] = [
  { value: "normal", label: "Full color", description: "Colors as drawn." },
  {
    value: "deuteranopia",
    label: "Deuteranopia",
    description: "No green-sensitive cones. The most common color blindness.",
  },
  {
    value: "protanopia",
    label: "Protanopia",
    description: "No red-sensitive cones. Reds look dark.",
  },
  {
    value: "tritanopia",
    label: "Tritanopia",
    description: "No blue-sensitive cones. Rare.",
  },
  {
    value: "grayscale",
    label: "Grayscale",
    description: "Lightness only, as in print or for full color blindness.",
  },
];

// Machado, Oliveira, and Fernandes (2009) at severity 1, on linear RGB.
const CVD_MATRICES: Record<
  Exclude<VisionMode, "normal" | "grayscale">,
  number[]
> = {
  protanopia: [
    0.152286, 1.052583, -0.204868, 0.114503, 0.786281, 0.099216, -0.003882,
    -0.048116, 1.051998,
  ],
  deuteranopia: [
    0.367322, 0.860646, -0.227968, 0.280085, 0.672501, 0.047413, -0.01182,
    0.04294, 0.968881,
  ],
  tritanopia: [
    1.255528, -0.076749, -0.178779, -0.078411, 0.930809, 0.147602, 0.004733,
    0.691367, 0.3039,
  ],
};

function simulateLinear(rgb: Rgb, mode: VisionMode): Rgb {
  const linear = rgb.map(toLinear) as Rgb;
  if (mode === "normal") {
    return linear;
  }
  if (mode === "grayscale") {
    const y = 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
    return [y, y, y];
  }
  const m = CVD_MATRICES[mode];
  return [
    m[0]! * linear[0] + m[1]! * linear[1] + m[2]! * linear[2],
    m[3]! * linear[0] + m[4]! * linear[1] + m[5]! * linear[2],
    m[6]! * linear[0] + m[7]! * linear[1] + m[8]! * linear[2],
  ];
}

/** How a color looks to a reader with the given vision. */
export function simulateColor(color: string, mode: VisionMode) {
  if (mode === "normal") {
    return color;
  }
  const rgb = parseColor(color);
  if (!rgb) {
    return color;
  }
  return `#${simulateLinear(rgb, mode).map(fromLinear).map(channelHex).join("")}`;
}

function oklab(linear: Rgb): Rgb {
  const [r, g, b] = linear;
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

/** Perceptual distance between two colors in OKLab, scaled by 100. */
export function colorDistance(
  a: string,
  b: string,
  mode: VisionMode = "normal"
) {
  const left = parseColor(a);
  const right = parseColor(b);
  if (!left || !right) {
    return Infinity;
  }
  const [l1, a1, b1] = oklab(simulateLinear(left, mode));
  const [l2, a2, b2] = oklab(simulateLinear(right, mode));
  return 100 * Math.hypot(l1 - l2, a1 - a2, b1 - b2);
}

/** Below these, two marks are hard to tell apart. */
export const DISTINCT_NORMAL = 15;
export const DISTINCT_CVD = 8;

export interface ClosestPair {
  first: number;
  second: number;
  distance: number;
  mode: VisionMode;
}

/**
 * The closest pair among colors that can appear side by side, judged for full
 * color vision and for the two common red-green deficiencies.
 */
export function findClosestPair(colors: readonly string[]) {
  const unique = colors.map((color) => toHex(color));
  let worst: ClosestPair | undefined;
  let worstRatio = Infinity;
  for (let first = 0; first < unique.length; first += 1) {
    for (let second = first + 1; second < unique.length; second += 1) {
      if (unique[first] === unique[second]) {
        continue;
      }
      for (const mode of ["normal", "deuteranopia", "protanopia"] as const) {
        const distance = colorDistance(unique[first]!, unique[second]!, mode);
        const ratio =
          distance / (mode === "normal" ? DISTINCT_NORMAL : DISTINCT_CVD);
        if (ratio < worstRatio) {
          worstRatio = ratio;
          worst = { first, second, distance, mode };
        }
      }
    }
  }
  return worst && worstRatio < 1 ? worst : undefined;
}
