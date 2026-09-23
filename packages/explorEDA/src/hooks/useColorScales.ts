import { categoryLabel } from "@/lib/categories";
import { detectColumnType } from "@/components/SummaryTable/utils/dataTypeDetection";
import { useDataLayer } from "@/providers/DataLayerProvider";
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
  defaultCategoricalColors,
  makeD3ColorScale,
} from "@/lib/colorScaleMath";

import { useCallback, useMemo } from "react";

export function useColorScales(): UseColorScalesReturn {
  const colorScales = useDataLayer((state) => state.colorScales);
  const addColorScale = useDataLayer((state) => state.addColorScale);
  const removeColorScale = useDataLayer((state) => state.removeColorScale);
  const updateColorScale = useDataLayer((state) => state.updateColorScale);
  const getColumnData = useDataLayer((state) => state.getColumnData);
  const fieldProfiles = useDataLayer((state) => state.fieldProfiles);
  const charts = useDataLayer((state) => state.charts);

  // Memoized d3 scale objects
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
    max: number,
    sourceField?: string
  ): ColorScaleType => {
    const scale: Omit<NumericalColorScale, "id"> = {
      name,
      type: "numerical",
      palette: "Viridis",
      min,
      max,
      sourceField,
    };
    return addColorScale(scale);
  };

  const createDefaultCategoricalScale = (
    name: string,
    values: string[],
    sourceField?: string
  ): ColorScaleType => {
    const defaultPalette = defaultCategoricalColors;
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
      sourceField,
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
      charts
        .filter(
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

    // Filter out null and undefined
    const cleanValues = values.filter((v): v is string | number => v != null);

    // Check if values are numerical
    const profile = fieldProfiles.find((item) => item.name === field);
    const isNumerical =
      (profile?.dataType ?? detectColumnType(getColumnData(field))) ===
        "numeric" &&
      cleanValues.some((value) => Number.isFinite(Number(value)));

    let newScale: ColorScaleType;
    if (isNumerical) {
      const numericValues = cleanValues.map(Number).filter(Number.isFinite);
      const min = Math.min(...numericValues);
      const max = Math.max(...numericValues);
      newScale = createDefaultNumericalScale(name ?? field, min, max, field);
    } else {
      const uniqueValues = Array.from(new Set(values.map(categoryLabel)));
      newScale = createDefaultCategoricalScale(
        name ?? field,
        uniqueValues,
        field
      );
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
