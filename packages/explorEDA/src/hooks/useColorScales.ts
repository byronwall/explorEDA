import { finiteNumber } from "@/lib/valueParsing";
import { detectColumnType } from "@/components/SummaryTable/utils/dataTypeDetection";
import {
  useDataLayer,
  useDataLayerSnapshot,
} from "@/providers/DataLayerProvider";
import {
  CategoricalColorScale,
  ColorScaleType,
  NumericalColorScale,
  UseColorScalesReturn,
} from "@/types/ColorScaleTypes";
import type { datum } from "@/types/ChartTypes";
import { interpolateViridis } from "d3-scale-chromatic";
import { scaleSequential } from "d3-scale";
import type { ScaleOrdinal, ScaleSequential } from "d3-scale";
import {
  assignCategoryColors,
  defaultColorScaleForField,
  makeColorScale,
  makeD3ColorScale,
} from "@/lib/colorScaleMath";
import { DEFAULT_SEQUENTIAL_PALETTE } from "@/lib/colorPalettes";

import { useCallback, useMemo } from "react";
import { useDisplayColorScales } from "./useDisplayColorScales";
import { THEME_PALETTE } from "@/lib/themePalettes";

export function useColorScales(): UseColorScalesReturn {
  // Charts and editors see colors as drawn in the current theme and mode.
  const colorScales = useDisplayColorScales();
  const addColorScale = useDataLayer((state) => state.addColorScale);
  const removeColorScale = useDataLayer((state) => state.removeColorScale);
  const updateColorScale = useDataLayer((state) => state.updateColorScale);
  const getColumnData = useDataLayer((state) => state.getColumnData);
  const fieldProfiles = useDataLayer((state) => state.fieldProfiles);
  // Read when a scale is chosen; a subscription would re-render every chart.
  const getState = useDataLayerSnapshot();

  // One color function per scale, shared with the chart plans.
  const colorFunctions = useMemo(
    () =>
      new Map(colorScales.map((scale) => [scale.id, makeColorScale(scale)])),
    [colorScales]
  );
  const d3Scales = useMemo(() => {
    const scales = new Map<
      string,
      ScaleSequential<string> | ScaleOrdinal<string, string>
    >();

    colorScales.forEach((scale) =>
      scales.set(scale.id, makeD3ColorScale(scale))
    );

    return scales;
  }, [colorScales]);

  const getColorForValue = useCallback(
    (
      scaleId: string | undefined,
      value: datum,
      defaultColor: string = "#000000"
    ): string => {
      if (!scaleId) {
        return defaultColor;
      }

      const color = colorFunctions.get(scaleId);
      if (!color) {
        return "#000000";
      }

      try {
        return color(value);
      } catch {
        return "#000000";
      }
    },
    [colorFunctions]
  );

  const getScaleById = (id: string): ColorScaleType | undefined => {
    return colorScales.find((s) => s.id === id);
  };

  const createDefaultNumericalScale = (
    name: string,
    min: number,
    max: number,
    sourceField?: string
  ): ColorScaleType => {
    const scale: Omit<NumericalColorScale, "id"> = {
      name,
      type: "numerical",
      palette: DEFAULT_SEQUENTIAL_PALETTE,
      min,
      max,
      sourceField,
    };
    return addColorScale(scale);
  };

  const createDefaultCategoricalScale = (
    name: string,
    values: string[],
    sourceField?: string,
    counts?: ReadonlyMap<string, number>
  ): ColorScaleType => {
    // The largest groups take the most distinct colors; the smallest past the
    // palette's end share a neutral gray.
    const assignment = {
      paletteId: THEME_PALETTE,
      order: counts ? ("frequency" as const) : ("data" as const),
      overflow: "other" as const,
    };
    const { mapping, palette } = assignCategoryColors(
      values,
      assignment,
      counts
    );

    const scale: Omit<CategoricalColorScale, "id"> = {
      name,
      type: "categorical",
      palette,
      mapping,
      sourceField,
      ...assignment,
    };
    return addColorScale(scale);
  };

  const getD3Scale = (scaleId: string) => {
    return (
      d3Scales.get(scaleId) ??
      scaleSequential(interpolateViridis).domain([0, 1])
    );
  };

  const getOrCreateScaleForField = (field: string, name?: string): string => {
    // Existing chart bindings are authoritative. Keep the exact ID instead of
    // matching display names.
    const boundScaleIds = new Set(
      getState()
        .charts.filter(
          (chart) =>
            chart.colorField === field && typeof chart.colorScaleId === "string"
        )
        .map((chart) => chart.colorScaleId as string)
    );
    if (boundScaleIds.size === 1) {
      const [boundScaleId] = boundScaleIds;
      if (
        boundScaleId &&
        colorScales.some((scale) => scale.id === boundScaleId)
      ) {
        return boundScaleId;
      }
    }

    // Otherwise reuse the explicitly bound source scale before creating one.
    const existingScale = colorScales.find((s) => s.sourceField === field);
    if (existingScale) {
      return existingScale.id;
    }

    // Get all values for the field
    const values = Object.values(getColumnData(field));
    const cleanValues = values.filter((v): v is string | number => v != null);

    // Check if values are numerical
    const profile = fieldProfiles.find((item) => item.name === field);
    const isNumerical =
      (profile?.dataType ?? detectColumnType(getColumnData(field))) ===
        "numeric" &&
      cleanValues.some((value) => finiteNumber(value) !== undefined);

    const newScale = addColorScale(
      defaultColorScaleForField(
        field,
        isNumerical ? cleanValues : values,
        isNumerical,
        name
      )
    );

    return newScale.id;
  };

  return {
    addColorScale,
    removeColorScale,
    updateColorScale,
    getColorForValue,
    getScaleById,
    colorScales,
    createDefaultNumericalScale,
    createDefaultCategoricalScale,
    getD3Scale,
    getOrCreateScaleForField,
  };
}
