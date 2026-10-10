import { ScaleSequential, ScaleOrdinal } from "d3-scale";
import { datum } from "./ChartTypes";

export interface BaseColorScale {
  id: string;
  name: string;
  /** Source field used to create this scale. Display names may change. */
  sourceField?: string;
}

/** How values are spaced along a numerical scale's ramp. */
export type NumericalScaleTransform = "linear" | "sqrt" | "log";

export interface NumericalColorScale extends BaseColorScale {
  type: "numerical";
  /** Ramp palette id from `RAMP_PALETTES`, sequential or diverging. */
  palette: string;
  min: number;
  max: number;
  /** Run the ramp from its far end to its near end. */
  reverse?: boolean;
  /** Value that takes a diverging ramp's middle color. Defaults to 0 when the
   * domain crosses it, otherwise to the middle of the domain. */
  midpoint?: number;
  transform?: NumericalScaleTransform;
  /** Number of discrete classes. Omitted or 0 draws a smooth ramp. */
  steps?: number;
}

/** The order categories take a palette's colors in. */
export type CategoryColorOrder =
  | "frequency"
  | "alphabetical"
  | "data"
  /** The order the user set by moving categories. */
  | "custom";

export interface CategoricalColorScale extends BaseColorScale {
  type: "categorical";
  palette: string[]; // array of colors
  mapping: Map<string, string>; // value -> color mapping
  /** Palette id the colors were assigned from. Custom edits keep it. */
  paletteId?: string;
  /** Reverse an ordered palette before assigning it. */
  reverse?: boolean;
  order?: CategoryColorOrder;
  /** Categories past the palette's last color repeat it or turn gray. */
  overflow?: "repeat" | "other";
}

export type ColorScaleType = NumericalColorScale | CategoricalColorScale;

export interface UseColorScalesReturn {
  // Scale Management
  addColorScale: (scale: Omit<ColorScaleType, "id">) => ColorScaleType;
  removeColorScale: (id: string) => void;
  updateColorScale: (id: string, updates: Partial<ColorScaleType>) => void;

  // Color Getters
  getColorForValue: (
    scaleId: string | undefined,
    value: datum,
    defaultColor?: string
  ) => string;
  getScaleById: (id: string) => ColorScaleType | undefined;
  // getAvailableScales: () => ColorScaleType[];

  colorScales: ColorScaleType[];

  // Utilities
  createDefaultNumericalScale: (
    name: string,
    min: number,
    max: number,
    sourceField?: string
  ) => ColorScaleType;
  createDefaultCategoricalScale: (
    name: string,
    values: string[],
    sourceField?: string,
    counts?: ReadonlyMap<string, number>
  ) => ColorScaleType;

  // D3 Integration
  getD3Scale: (
    scaleId: string
  ) => ScaleSequential<string> | ScaleOrdinal<string, string>;

  // Field Scale Creation
  getOrCreateScaleForField: (field: string, name?: string) => string;
}
