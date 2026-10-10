import { applyFilter } from "@/hooks/applyFilter";
import { IdType } from "@/providers/DataLayerProvider";
import { BaseChartSettings, ChartDefinition, datum } from "@/types/ChartTypes";
import { DEFAULT_CHART_SETTINGS } from "@/utils/defaultSettings";
import { LayoutGrid } from "lucide-react";
import { ScatterMatrix } from "./ScatterMatrix";
import { ScatterMatrixSettingsPanel } from "./ScatterMatrixSettingsPanel";

/** Cells for a pair of numeric or date fields. */
export type MatrixNumericCell = "points" | "correlation" | "blank";
/** Cells for a numeric or date field against a category. */
export type MatrixMixedCell = "points" | "box" | "blank";
/**
 * Cells for two category fields. Tiles size each pair by its count; shares
 * draw each pair as a bar of the column category's rows.
 */
export type MatrixCategoricalCell = "points" | "tiles" | "shares" | "blank";

/** What one triangle draws, by the types of its two fields. */
export interface MatrixTriangleCells {
  numeric: MatrixNumericCell;
  mixed: MatrixMixedCell;
  categorical: MatrixCategoricalCell;
}

/** What the diagonal draws, by the type of its field. */
export interface MatrixDiagonalCells {
  continuous: "density" | "histogram" | "label";
  categorical: "bars" | "label";
}

export interface ScatterMatrixSettings extends BaseChartSettings {
  type: "scatter-matrix";
  /** Fields in display order: left to right and top to bottom. */
  fields: string[];
  lower: MatrixTriangleCells;
  upper: MatrixTriangleCells;
  diagonal: MatrixDiagonalCells;
  /** Absent uses a size that shrinks as rows grow. */
  pointSize?: number;
  pointOpacity?: number;
  /** Share of a band that jittered points spread across, 0 to 1. Default 0.8. */
  jitter?: number;
}

export const MIN_MATRIX_FIELDS = 2;
export const MAX_MATRIX_FIELDS = 10;

export const DEFAULT_LOWER_CELLS: MatrixTriangleCells = {
  numeric: "points",
  mixed: "points",
  categorical: "shares",
};
export const DEFAULT_UPPER_CELLS: MatrixTriangleCells = {
  numeric: "correlation",
  mixed: "box",
  categorical: "tiles",
};
/** Category fields show this many of their most common values, then Other. */
export const MAX_MATRIX_CATEGORIES = 12;
export const DEFAULT_DIAGONAL_CELLS: MatrixDiagonalCells = {
  continuous: "density",
  categorical: "bars",
};

export const scatterMatrixDefinition: ChartDefinition<ScatterMatrixSettings> = {
  type: "scatter-matrix",
  name: "Scatter Matrix",
  description:
    "Compare every pair of several fields, with each field's distribution",
  icon: LayoutGrid,

  component: ScatterMatrix,
  settingsPanel: ScatterMatrixSettingsPanel,

  createDefaultSettings: (layout, field) => ({
    ...DEFAULT_CHART_SETTINGS,
    id: crypto.randomUUID(),
    type: "scatter-matrix",
    title: "Scatter Matrix",
    field: field ?? "",
    fields: field ? [field] : [],
    lower: { ...DEFAULT_LOWER_CELLS },
    upper: { ...DEFAULT_UPPER_CELLS },
    diagonal: { ...DEFAULT_DIAGONAL_CELLS },
    layout,
    margin: { top: 4, right: 4, bottom: 4, left: 4 },
    filters: [],
  }),

  validateSettings: (settings) =>
    settings.fields.length >= MIN_MATRIX_FIELDS &&
    settings.fields.every(Boolean),

  getFilterFunction: (
    settings: ScatterMatrixSettings,
    fieldGetter: (name: string) => Record<IdType, datum>
  ) => {
    // A brush sets one filter per field; a row must pass all of them.
    const filters = settings.filters.map((filter) => ({
      filter,
      values: filter.field === "__ID" ? undefined : fieldGetter(filter.field),
    }));
    return (id: IdType) =>
      filters.every(({ filter, values }) =>
        applyFilter(values ? values[id] : id, filter)
      );
  },
};
