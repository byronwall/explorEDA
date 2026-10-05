import { presets } from "./fixtures";
import type { FixtureId, Settings } from "./types";

export function defaults(id: FixtureId = "positive"): Settings {
  return {
    format: "exploreda-scatter-lab", version: 1,
    fixture: { id, seed: 20261003, n: 1000, correlation: .85, contamination: .08 },
    fields: id === "penguins" ? { x: "flipper_length_mm", y: "body_mass_g", group: "species" } : { x: "x", y: "y", group: "group" },
    facet: "all", filters: { x: {}, y: {}, group: "all", cohort: "all" },
    analysisScope: "selected", referenceScope: id === "contamination" ? "training" : "analysis", scoreScope: id === "contamination" ? "held-out" : "analysis",
    analysisSpace: "data", display: { x: id === "symlog" ? "symlog" : "linear", y: id === "symlog" ? "symlog" : "linear" }, grouped: false,
    layers: { points: true, hex: false, densityFill: false, densityContours: false, dataEllipse: true, meanRegion: false, distances: false, principalAxes: false, marginals: false, reference: true },
    method: { hexRadius: 14, bandwidth: 20, contourLevels: 5, coverage: .95, histogramBins: 16, pointSize: 2, pointOpacity: .65 },
  };
}
export function exportSettings(settings: Settings): string { return JSON.stringify(settings, null, 2); }
/** Strict, small validator for a lab document, not a public schema framework. */
export function restoreSettings(text: string): Settings {
  if (text.length > 100000) throw new Error("Settings JSON is too large (100 kB maximum).");
  const s: unknown = JSON.parse(text);
  if (!s || typeof s !== "object" || Array.isArray(s)) throw new Error("Expected a scatter-lab settings object.");
  const input = s as Record<string, unknown>;
  if (input.format !== "exploreda-scatter-lab" || input.version !== 1) throw new Error("Expected exploreda-scatter-lab version 1.");
  const obj = (value: unknown, name: string): Record<string, unknown> => { if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${name} must be an object.`); return value as Record<string, unknown>; };
  const number = (v: unknown, name: string, lo: number, hi: number, integer = false): number => {
    if (typeof v !== "number" || !Number.isFinite(v) || v < lo || v > hi || (integer && !Number.isInteger(v))) throw new Error(`${name} must be ${integer ? "an integer " : ""}between ${lo} and ${hi}.`); return v;
  };
  const choice = <T extends string>(v: unknown, name: string, options: readonly T[]): T => { if (typeof v !== "string" || !options.includes(v as T)) throw new Error(`Unknown ${name}.`); return v as T; };
  const str = (v: unknown, name: string): string => { if (typeof v !== "string" || v.length > 256 || !v.length) throw new Error(`${name} must be nonempty text of at most 256 characters.`); return v; };
  const flag = (v: unknown, name: string): boolean => { if (typeof v !== "boolean") throw new Error(`${name} must be true or false.`); return v; };
  const f = obj(input.fixture, "fixture"), fields = obj(input.fields, "fields"), filters = obj(input.filters, "filters"), d = obj(input.display, "display"), method = obj(input.method, "method"), layers = obj(input.layers, "layers");
  const id = choice(f.id, "fixture", presets.map(p => p.id)), result = defaults(id);
  result.fixture = { id, seed: number(f.seed, "seed", 0, 4294967295, true), n: number(f.n, "size", 1, 100000, true), correlation: number(f.correlation, "correlation", -.99, .99), contamination: number(f.contamination, "contamination", 0, .5) };
  result.fields = { x: str(fields.x, "X field"), y: str(fields.y, "Y field"), group: str(fields.group, "group field") };
  result.facet = str(input.facet, "facet");
  for (const axis of ["x", "y"] as const) {
    const range = obj(filters[axis], `${axis} filter`); result.filters[axis] = {};
    for (const edge of ["min", "max"] as const) if (range[edge] !== undefined) result.filters[axis][edge] = number(range[edge], `${axis} ${edge}`, -Number.MAX_VALUE, Number.MAX_VALUE);
    if (result.filters[axis].min !== undefined && result.filters[axis].max !== undefined && result.filters[axis].min! > result.filters[axis].max!) throw new Error(`${axis} minimum exceeds maximum.`);
    result.display[axis] = choice(d[axis], `${axis} display`, ["linear", "symlog"]);
  }
  result.filters.group = str(filters.group, "group filter"); result.filters.cohort = choice(filters.cohort, "cohort", ["all", "training", "held-out"]);
  result.analysisScope = choice(input.analysisScope, "analysis scope", ["selected", "full"]);
  result.referenceScope = choice(input.referenceScope, "reference scope", ["analysis", "full", "training"]);
  result.scoreScope = choice(input.scoreScope, "scoring scope", ["analysis", "full", "held-out"]);
  result.analysisSpace = choice(input.analysisSpace, "analysis space", ["data", "symlog"]);
  result.grouped = flag(input.grouped, "grouped");
  for (const key of Object.keys(result.layers) as (keyof Settings["layers"])[]) result.layers[key] = flag(layers[key], key);
  result.method = {
    hexRadius: number(method.hexRadius, "hex radius", 5, 50), bandwidth: number(method.bandwidth, "bandwidth", 4, 100), contourLevels: number(method.contourLevels, "contour levels", 2, 12, true), coverage: number(method.coverage, "coverage", .5, .999), histogramBins: number(method.histogramBins, "histogram bins", 4, 60, true), pointSize: number(method.pointSize, "point size", 1, 6), pointOpacity: number(method.pointOpacity, "point opacity", .1, 1),
  };
  return result;
}
