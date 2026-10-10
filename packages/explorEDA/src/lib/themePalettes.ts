import {
  DEFAULT_CATEGORICAL_PALETTE,
  MISSING_COLOR,
  OTHER_COLOR,
  getCategoricalPalette,
  parseColor,
  toHex,
} from "./colorPalettes";
import type { WorkspaceThemeId } from "./themes";
import type {
  CategoricalColorScale,
  ColorScaleType,
} from "@/types/ColorScaleTypes";

/**
 * A categorical scale whose palette is "theme" takes the workspace theme's
 * palette. Its saved colors are the Compact palette's; each one names a slot
 * that the current theme and light or dark mode color in.
 */
export const THEME_PALETTE = "theme";

/** The palette each theme gives categories. */
const THEME_PALETTES: Record<WorkspaceThemeId, string> = {
  compact: DEFAULT_CATEGORICAL_PALETTE,
  newsprint: "Newsprint",
  report: "Report",
};

export interface ColorContext {
  themeId: WorkspaceThemeId;
  dark: boolean;
}

export const LIGHT_COMPACT: ColorContext = { themeId: "compact", dark: false };

export function themePaletteId(themeId: WorkspaceThemeId) {
  return THEME_PALETTES[themeId];
}

/** The colors a scale saves: the Compact palette for a theme scale. */
export function basePaletteColors(paletteId: string | undefined) {
  return (
    getCategoricalPalette(
      paletteId === THEME_PALETTE ? DEFAULT_CATEGORICAL_PALETTE : paletteId
    )?.colors ?? []
  ).map((color) => color.toLowerCase());
}

/** The colors a scale draws with in a theme, before dark mode. */
function contextPaletteColors(
  paletteId: string | undefined,
  context: ColorContext
) {
  return (
    getCategoricalPalette(
      paletteId === THEME_PALETTE ? themePaletteId(context.themeId) : paletteId
    )?.colors ?? []
  ).map((color) => color.toLowerCase());
}

// OKLab, for lifting a color's lightness on dark surfaces.
type Vec = [number, number, number];
const toLinear = (value: number) => {
  const c = value / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
};
const fromLinear = (value: number) => {
  const c = Math.max(0, Math.min(1, value));
  return (
    255 * (c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055)
  );
};
function rgbToOklab([r, g, b]: Vec): Vec {
  const [lr, lg, lb] = [r, g, b].map(toLinear) as Vec;
  const l = Math.cbrt(
    0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb
  );
  const m = Math.cbrt(
    0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb
  );
  const s = Math.cbrt(
    0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb
  );
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}
function oklabToRgb([L, a, b]: Vec): Vec {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ].map(fromLinear) as Vec;
}

const DARK_MIN_LIGHTNESS = 0.7;

/**
 * The step of a palette color for dark surfaces: the same hue, lifted to a
 * lightness that reads on a near-black background. Light colors keep theirs.
 */
export function darkStep(color: string) {
  const rgb = parseColor(color);
  if (!rgb) return color;
  const [L, a, b] = rgbToOklab(rgb);
  if (L >= DARK_MIN_LIGHTNESS) return toHex(color);
  // Lift lightness and ease chroma a little so lifted colors stay in gamut.
  const lifted = oklabToRgb([
    DARK_MIN_LIGHTNESS + (L - 0.4) * 0.2,
    a * 0.92,
    b * 0.92,
  ]);
  return `#${lifted.map((v) => Math.round(v).toString(16).padStart(2, "0")).join("")}`;
}

/**
 * The slot a saved color fills in its palette, or undefined when the color
 * was picked by hand. Hand-picked colors stay as they are in every theme.
 */
export function paletteSlot(paletteId: string | undefined, color: string) {
  const index = basePaletteColors(paletteId).indexOf(color.toLowerCase());
  return index < 0 ? undefined : index;
}

/** The color to draw a saved color with in a theme and mode. */
export function resolvePaletteColor(
  paletteId: string | undefined,
  color: string,
  context: ColorContext
) {
  const slot = paletteSlot(paletteId, color);
  if (slot === undefined) return color;
  const colors = contextPaletteColors(paletteId, context);
  const resolved = colors[slot % Math.max(1, colors.length)] ?? color;
  return context.dark ? darkStep(resolved) : resolved;
}

/** A scale with the colors to draw in a theme and mode. Saved colors stay. */
export function resolveColorScale<T extends ColorScaleType>(
  scale: T,
  context: ColorContext
): T {
  if (scale.type !== "categorical") return scale;
  const paletteId = scale.paletteId;
  if (
    !context.dark &&
    (paletteId !== THEME_PALETTE || context.themeId === "compact")
  )
    return scale;
  const mapping = new Map(
    [...scale.mapping].map(([label, color]) => [
      label,
      resolvePaletteColor(paletteId, color, context),
    ])
  );
  const palette = scale.palette.map((color) =>
    resolvePaletteColor(paletteId, color, context)
  );
  return { ...scale, mapping, palette } as T;
}

const NEUTRALS = [OTHER_COLOR, MISSING_COLOR].map((color) =>
  color.toLowerCase()
);

/**
 * Saved scales from before themes carry the default palette. They follow the
 * workspace theme from now on, but only when every color still fills a
 * palette slot, so no visible color changes. Hand-edited scales stay put.
 */
export function adoptThemePalette<T extends ColorScaleType>(scale: T): T {
  if (scale.type !== "categorical") return scale;
  const categorical = scale as CategoricalColorScale;
  if (
    categorical.paletteId !== undefined &&
    categorical.paletteId !== DEFAULT_CATEGORICAL_PALETTE
  )
    return scale;
  const base = basePaletteColors(DEFAULT_CATEGORICAL_PALETTE);
  const colors = [...categorical.mapping.values()].map((color) =>
    color.toLowerCase()
  );
  const exact =
    colors.some((color) => base.includes(color)) &&
    colors.every((color) => base.includes(color) || NEUTRALS.includes(color));
  return exact ? ({ ...scale, paletteId: THEME_PALETTE } as T) : scale;
}

/** Categories whose colors were picked by hand rather than from the palette. */
export function handPickedCategories(scale: CategoricalColorScale) {
  return [...scale.mapping].filter(
    ([, color]) =>
      paletteSlot(scale.paletteId, color) === undefined &&
      !NEUTRALS.includes(color.toLowerCase())
  );
}

/**
 * The saved form of a color drawn in a theme and mode: a themed palette color
 * goes back to its slot's saved color, and anything else stays as given.
 */
export function unresolvePaletteColor(
  paletteId: string | undefined,
  color: string,
  context: ColorContext
) {
  const lower = color.toLowerCase();
  const base = basePaletteColors(paletteId);
  if (base.includes(lower)) return lower;
  return (
    base.find(
      (saved) => resolvePaletteColor(paletteId, saved, context) === lower
    ) ?? color
  );
}

/**
 * The saved form of a scale an editor hands back. Editors show themed
 * colors, so their colors return to saved slots instead of becoming
 * hand-picked overrides.
 */
export function normalizeColorScale<T extends object>(
  scale: T,
  paletteId: string | undefined,
  context: ColorContext
): T {
  if ((scale as { type?: string }).type === "numerical") return scale;
  const categorical = scale as Partial<CategoricalColorScale>;
  return {
    ...scale,
    ...(categorical.mapping
      ? {
          mapping: new Map(
            [...categorical.mapping].map(([label, color]) => [
              label,
              unresolvePaletteColor(paletteId, color, context),
            ])
          ),
        }
      : {}),
    ...(categorical.palette
      ? {
          palette: categorical.palette.map((color) =>
            unresolvePaletteColor(paletteId, color, context)
          ),
        }
      : {}),
  };
}

/** The single-color mark the charts draw when nothing colors them. */
export const COMPACT_MARK_COLOR = "#3479a8";

/** Colors charts fall back to when no scale colors them. */
export interface ThemeColors {
  /** Category colors, in slot order. */
  categorical: readonly string[];
  /** One color for uncolored marks. */
  mark: string;
}

export function themeColors(context: ColorContext): ThemeColors {
  const categorical = basePaletteColors(THEME_PALETTE).map((color) =>
    resolvePaletteColor(THEME_PALETTE, color, context)
  );
  const mark =
    context.themeId === "compact"
      ? COMPACT_MARK_COLOR
      : (getCategoricalPalette(themePaletteId(context.themeId))?.colors[0] ??
        COMPACT_MARK_COLOR);
  return {
    categorical,
    mark: context.dark && context.themeId !== "compact" ? darkStep(mark) : mark,
  };
}
