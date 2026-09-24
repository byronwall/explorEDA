import {
  GridSettings,
  ViewMetadata,
  SerializedColorScale,
  SavedChartSettings,
  SavedRowsSettings,
} from "./SavedDataTypes";
import type { FieldSettingsMap } from "@/lib/fieldSettings";
import type { AggregateSpec } from "@/lib/aggregates";

export interface SavedCalculation {
  resultColumnName: string;
  expression: string;
}

export type SavedDatum = string | number | boolean | null | undefined;
export type SavedRow = Record<string, SavedDatum>;
export type SavedSpecialValue = "undefined" | "NaN" | "Infinity" | "-Infinity";

export interface SavedDataStructure {
  // Existing types from ChartSettings will be used
  charts: SavedChartSettings[];

  // Formulas stay human-readable and editable at the persistence boundary.
  calculations: SavedCalculation[];

  // New types for grid and metadata
  gridSettings: GridSettings;
  metadata: ViewMetadata;

  // Color scales with serialized mapping
  colorScales: SerializedColorScale[];

  // Rows has independent filters, search, sort, order, and widths.
  rowsSettings?: SavedRowsSettings;

  // Source field labels, type overrides, and display settings.
  fieldSettings?: FieldSettingsMap;

  // Bar chart aggregates. Charts store only an aggregateId reference.
  aggregates?: AggregateSpec[];
}

export interface SavedAnalysisStructure {
  format: "exploreda-analysis";
  version: 1;
  data: SavedRow[];
  settings: SavedDataStructure;
  specialValues?: Record<string, SavedSpecialValue>;
}
