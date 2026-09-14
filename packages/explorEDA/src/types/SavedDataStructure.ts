import { CalculationDefinition } from "@/lib/calculations/CalculationState";
import {
  GridSettings,
  ViewMetadata,
  SerializedColorScale,
  SavedChartSettings,
} from "./SavedDataTypes";

export interface SavedDataStructure {
  // Existing types from ChartSettings will be used
  charts: SavedChartSettings[];

  // Existing types from CalculationDefinition will be used
  calculations: CalculationDefinition[];

  // New types for grid and metadata
  gridSettings: GridSettings;
  metadata: ViewMetadata;

  // Color scales with serialized mapping
  colorScales: SerializedColorScale[];
}
