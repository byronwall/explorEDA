import { CategoricalColorScale, NumericalColorScale } from "./ColorScaleTypes";
import type { ChartSettings } from "./ChartTypes";
import type { ThreeDScatterSettings } from "@/components/charts/ThreeDScatter/types";

export interface GridSettings {
  columnCount: number;
  rowHeight: number;
  containerPadding: number;
  showBackgroundMarkers: boolean;
}

export interface ViewMetadata {
  name: string;
  version: number;
  createdAt: string;
  modifiedAt: string;
}

// Type for serialized categorical color scale
export interface SerializedCategoricalColorScale
  extends Omit<CategoricalColorScale, "mapping"> {
  type: "categorical";
  mapping: [string, string][];
}

// Type for serialized color scale
export type SerializedColorScale =
  | NumericalColorScale
  | SerializedCategoricalColorScale;

export interface SerializedVector3 {
  x: number;
  y: number;
  z: number;
}

export type SerializedThreeDScatterSettings = Omit<
  ThreeDScatterSettings,
  "cameraPosition" | "cameraTarget"
> & {
  cameraPosition: SerializedVector3;
  cameraTarget: SerializedVector3;
};

export type SavedChartSettings =
  | ChartSettings
  | SerializedThreeDScatterSettings;
