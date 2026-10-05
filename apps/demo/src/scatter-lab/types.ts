/** Lab-only contracts. These are deliberately not saved-workspace settings. */
export type Value = string | number | boolean | null | undefined;
export type Row = Record<string, Value> & { sourceId: string };
export type Space = "data" | "symlog";
export type Display = "linear" | "symlog";
export interface Field { name: string; kind: "numeric" | "category"; unit: string }
export interface Fixture { id: string; label: string; rows: Row[]; fields: Field[]; groupField: string; synthetic: boolean; note: string }
export type FixtureId = "positive" | "negative" | "independent" | "overlap" | "mixture" | "ring" | "unequal" | "contamination" | "tiny" | "duplicates" | "identical" | "zero-variance" | "collinear" | "near-collinear" | "invalid" | "offset" | "symlog" | "penguins";
export interface FixtureParameters { id: FixtureId; seed: number; n: number; correlation: number; contamination: number }
export interface Range { min?: number; max?: number }
export interface Filters { x: Range; y: Range; group: string; cohort: string }
export interface Settings {
  format: "exploreda-scatter-lab"; version: 1;
  fixture: FixtureParameters;
  fields: { x: string; y: string; group: string };
  facet: string;
  filters: Filters;
  analysisScope: "selected" | "full";
  referenceScope: "analysis" | "full" | "training";
  scoreScope: "analysis" | "full" | "held-out";
  analysisSpace: Space;
  display: { x: Display; y: Display };
  grouped: boolean;
  layers: { points: boolean; hex: boolean; densityFill: boolean; densityContours: boolean; dataEllipse: boolean; meanRegion: boolean; distances: boolean; principalAxes: boolean; marginals: boolean; reference: boolean };
  method: { hexRadius: number; bandwidth: number; contourLevels: number; coverage: number; histogramBins: number; pointSize: number; pointOpacity: number };
}
export interface Pair { id: string; row: Row; x: number; y: number; group: string }
export interface Prepared { pairs: Pair[]; excluded: { id: string; reason: string }[]; total: number }
export interface Covariance {
  n: number; mean: [number, number] | null;
  covariance: [[number, number], [number, number]] | null;
  sd: [number, number] | null; correlation: number | null;
  /** Matrix inversion is checked in standardized coordinates, independent of units. */
  available: boolean; reason?: string;
}
export interface PixelPair extends Pair { px: number; py: number }
export interface Bin { key: string; q: number; r: number; x: number; y: number; ids: string[]; count: number }
export interface DensityGrid { values: Float64Array; nx: number; ny: number; cell: number; pad: number; width: number; height: number; maximum: number; integral: number; n: number; bandwidth: number }
export interface Model { group: string; prepared: Prepared; covariance: Covariance }
export interface Score { pair: Pair; d2: number | null; d: number | null; reason?: string }
