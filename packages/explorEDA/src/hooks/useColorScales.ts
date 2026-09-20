import { categoryLabel } from "@/lib/categories";
import { useDataLayer } from "@/providers/DataLayerProvider";
import {
  CategoricalColorScale,
  ColorScaleType,
  NumericalColorScale,
  UseColorScalesReturn,
} from "@/types/ColorScaleTypes";
import type { datum } from "@/types/ChartTypes";
import {
  interpolateCool,
  interpolateInferno,
  interpolateMagma,
  interpolatePlasma,
  interpolateViridis,
  interpolateWarm,
  schemeCategory10,
  schemeSet3,
} from "d3-scale-chromatic";
import { scaleOrdinal, scaleSequential } from "d3-scale";
import type { ScaleOrdinal, ScaleSequential } from "d3-scale";

import { useCallback, useMemo } from "react";

const DEFAULT_NUMERICAL_PALETTES = [
  { name: "Viridis", interpolator: interpolateViridis },
  { name: "Inferno", interpolator: interpolateInferno },
  { name: "Magma", interpolator: interpolateMagma },
  { name: "Plasma", interpolator: interpolatePlasma },
  { name: "Warm", interpolator: interpolateWarm },
  { name: "Cool", interpolator: interpolateCool },
];

const DEFAULT_CATEGORICAL_PALETTES = [
  { name: "Category10", colors: schemeCategory10 },
  { name: "Set3", colors: schemeSet3 },
];

export function useColorScales(): UseColorScalesReturn {
  const colorScales = useDataLayer((state) => state.colorScales);
  const addColorScale = useDataLayer((state) => state.addColorScale);
  const removeColorScale = useDataLayer((state) => state.removeColorScale);
  const updateColorScale = useDataLayer((state) => state.updateColorScale);
  const getColumnData = useDataLayer((state) => state.getColumnData);

  // Memoized d3 scale objects
  const d3Scales = useMemo(() => {
    const scales = new Map<
      string,
      ScaleSequential<string> | ScaleOrdinal<string, string>
    >();

    colorScales.forEach((scale) => {
      if (scale.type === "numerical") {
        const numericalScale = scale as NumericalColorScale;
        const interpolator =
          DEFAULT_NUMERICAL_PALETTES.find(
            (p) => p.name === numericalScale.palette
          )?.interpolator || interpolateViridis;

        scales.set(
          scale.id,
          scaleSequential(interpolator).domain([
            numericalScale.min,
            numericalScale.max,
          ])
        );
      } else {
        const categoricalScale = scale as CategoricalColorScale;
        scales.set(
          scale.id,
          scaleOrdinal<string>()
            .domain(Array.from(categoricalScale.mapping.keys()))
            .range(categoricalScale.palette)
        );
      }
    });

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

      const scale = colorScales.find((s) => s.id === scaleId);
      if (!scale) {
        // console.warn(`Color scale ${scaleId} not found`);
        return "#000000";
      }

      const d3Scale = d3Scales.get(scaleId);
      if (!d3Scale) {
        return "#000000";
      }

      try {
        if (scale.type === "numerical") {
          return (d3Scale as ScaleSequential<string>)(Number(value));
        }
        return (d3Scale as ScaleOrdinal<string, string>)(categoryLabel(value));
      } catch {
        return "#000000";
      }
    },
    [colorScales, d3Scales]
  );

  const getScaleById = (id: string): ColorScaleType | undefined => {
    return colorScales.find((s) => s.id === id);
  };

  const createDefaultNumericalScale = (
    name: string,
    min: number,
    max: number
  ): ColorScaleType => {
    const scale: Omit<NumericalColorScale, "id"> = {
      name,
      type: "numerical",
      palette: "Viridis",
      min,
      max,
    };
    return addColorScale(scale);
  };

  const createDefaultCategoricalScale = (
    name: string,
    values: string[]
  ): ColorScaleType => {
    const defaultPalette = DEFAULT_CATEGORICAL_PALETTES[0]?.colors ?? [];
    const mapping = new Map<string, string>();
    values.forEach((value, i) => {
      mapping.set(
        value,
        defaultPalette[i % defaultPalette.length] ?? "#000000"
      );
    });

    const scale: Omit<CategoricalColorScale, "id"> = {
      name,
      type: "categorical",
      palette: Array.from(mapping.values()),
      mapping,
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
    // First check if a scale already exists for this field
    const existingScale = colorScales.find((s) => s.name === (name ?? field));
    if (existingScale) {
      return existingScale.id;
    }

    // Get all values for the field
    const values = Object.values(getColumnData(field));

    // Filter out null and undefined
    const cleanValues = values.filter((v): v is string | number => v != null);

    // Check if values are numerical
    const isNumerical =
      cleanValues.length > 0 &&
      cleanValues.every((v) => typeof v === "number" && Number.isFinite(v));

    let newScale: ColorScaleType;
    if (isNumerical) {
      const numericValues = cleanValues.map(Number);
      const min = Math.min(...numericValues);
      const max = Math.max(...numericValues);
      newScale = createDefaultNumericalScale(name ?? field, min, max);
    } else {
      const uniqueValues = Array.from(new Set(values.map(categoryLabel)));
      newScale = createDefaultCategoricalScale(name ?? field, uniqueValues);
    }

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
