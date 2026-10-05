import { useEffect, useMemo, useState } from "react";
import { ExplorEda, type SavedDataStructure } from "exploreda";
import type { Fixture, Settings, Value } from "./types";
import { category } from "./statistics";

/** Public integration only. No package source imports and no alias rewrites. */
export function nativeSettings(fixture: Fixture, s: Settings): SavedDataStructure {
  type Chart = SavedDataStructure["charts"][number];
  type Filter = Chart["filters"][number];
  const base = {
    field: "", colorField: undefined, colorScaleId: undefined,
    xAxis: { grid: false, scaleType: s.display.x }, yAxis: { grid: true, scaleType: s.display.y },
    margin: { top: 20, right: 20, bottom: 45, left: 62 },
    facet: { enabled: false, type: "wrap" as const, rowVariable: s.fields.group, columnCount: 1 },
    xAxisLabel: "", yAxisLabel: "", xGridLines: 5, yGridLines: 5, filters: [] as Filter[],
  };
  const activeFilters = s.analysisScope === "selected";
  const scatterFilters: Filter[] = [];
  for (const axis of ["x", "y"] as const) if (activeFilters && (s.filters[axis].min !== undefined || s.filters[axis].max !== undefined)) scatterFilters.push({ type: "range", field: s.fields[axis], ...s.filters[axis] });
  const groups = [...new Set(fixture.rows.map(row => category(row[s.fields.group])))].sort();
  const rawCategory = (label: string): Value => fixture.rows.find(row => category(row[s.fields.group]) === label)?.[s.fields.group] ?? null;
  const categoryKey = (value: Value) => value == null ? JSON.stringify(["missing"]) : JSON.stringify([typeof value, value]);
  const facet = s.facet === "all" ? base.facet : { ...base.facet, enabled: true, visibleFacetIds: [JSON.stringify([categoryKey(rawCategory(s.facet)), null])] };
  const groupFilter: Filter[] = activeFilters && s.filters.group !== "all" ? [{ type: "value", field: s.fields.group, values: [rawCategory(s.filters.group)] }] : [];
  const cohortFilter: Filter[] = activeFilters && s.filters.cohort !== "all" ? [{ type: "value", field: "cohort", values: [s.filters.cohort] }] : [];
  const palette = ["#167b9a", "#d16d29", "#388566", "#a84988", "#626bd2"];
  const xLabel = fixture.fields.find(f => f.name === s.fields.x), yLabel = fixture.fields.find(f => f.name === s.fields.y);
  return {
    charts: [
      { ...base, id: "lab-existing-scatter", type: "scatter", title: "Existing explorEDA scatter", xField: s.fields.x, yField: s.fields.y, xAxisLabel: `${s.fields.x} (${xLabel?.unit ?? ""})`, yAxisLabel: `${s.fields.y} (${yLabel?.unit ?? ""})`, colorField: s.fields.group, colorScaleId: "lab-groups", layout: { x: 0, y: 0, w: 8, h: 5 }, pointSize: s.method.pointSize, pointOpacity: s.method.pointOpacity, facet, filters: scatterFilters },
      { ...base, id: "lab-existing-groups", type: "row", title: "External group filter", field: s.fields.group, colorField: s.fields.group, colorScaleId: "lab-groups", minRowHeight: 22, maxRowHeight: 36, layout: { x: 8, y: 0, w: 2, h: 5 }, filters: groupFilter },
      { ...base, id: "lab-existing-cohort", type: "row", title: "External cohort filter", field: "cohort", minRowHeight: 22, maxRowHeight: 36, layout: { x: 10, y: 0, w: 2, h: 5 }, filters: cohortFilter },
    ],
    calculations: [],
    gridSettings: { columnCount: 12, rowHeight: 76, containerPadding: 0, showBackgroundMarkers: false },
    metadata: { name: "Scatter lab compatibility comparison", version: 1, createdAt: "2026-10-03T00:00:00.000Z", modifiedAt: "2026-10-03T00:00:00.000Z" },
    colorScales: [{ id: "lab-groups", name: s.fields.group, sourceField: s.fields.group, type: "categorical", palette, mapping: groups.map((g, i): [string, string] => [g, palette[i % palette.length]!]) }],
    fieldSettings: Object.fromEntries(fixture.fields.filter(f => f.kind === "numeric").map(f => [f.name, { type: "numeric" }])),
  };
}

export function importNativeSelection(state: SavedDataStructure, current: Settings): Settings {
  const scatter = state.charts.find(c => c.id === "lab-existing-scatter"), group = state.charts.find(c => c.id === "lab-existing-groups"), cohort = state.charts.find(c => c.id === "lab-existing-cohort");
  if (state.charts.length !== 3 || scatter?.type !== "scatter" || group?.type !== "row" || cohort?.type !== "row" || state.calculations.length || state.rowsSettings?.filters?.length || state.rowsSettings?.globalSearch) throw new Error("Transfer requires the original three comparison charts with no calculated fields or Rows filters.");
  if (scatter.xField !== current.fields.x || scatter.yField !== current.fields.y || scatter.colorField !== current.fields.group || group.field !== current.fields.group || cohort.field !== "cohort") throw new Error("Restore the lab fields before transferring this selection.");
  const next: Settings = { ...current, analysisScope: "selected", filters: { x: {}, y: {}, group: "all", cohort: "all" } };
  for (const filter of scatter.filters) {
    const axis = filter.field === current.fields.x ? "x" : filter.field === current.fields.y ? "y" : null;
    if (!axis || filter.type !== "range") throw new Error("Transfer accepts numeric X/Y ranges. Categorical brushing remains available in the existing scatter comparison.");
    next.filters[axis] = { min: filter.min, max: filter.max };
  }
  for (const [chart, field, key] of [[group, current.fields.group, "group"], [cohort, "cohort", "cohort"]] as const) {
    if (!chart.filters.length) continue;
    const filter = chart.filters[0]!;
    if (chart.filters.length !== 1 || filter.type !== "value" || filter.field !== field || filter.values.length !== 1) throw new Error("Choose one group and one cohort, or clear their filters, before transferring.");
    next.filters[key] = category(filter.values[0]);
  }
  return next;
}
export function ExistingScatter({ fixture, settings: s, set }: { fixture: Fixture; settings: Settings; set: (s: Settings) => void }) {
  const [captured, capture] = useState<SavedDataStructure | null>(null), [error, setError] = useState("");
  // Only explicit host controls replace savedData. Native onStateChange NEVER
  // feeds straight back to savedData; the public restore contract is not controlled.
  const savedData = useMemo(() => nativeSettings(fixture, s), [fixture, s.fields, s.filters, s.facet, s.display, s.analysisScope, s.method.pointSize, s.method.pointOpacity]);
  useEffect(() => { capture(null); setError(""); }, [savedData]);
  return <section className="sl-native" aria-label="Actual existing explorEDA comparison">
    <div className="sl-native-heading"><div><h2>Existing explorEDA scatter</h2><p>The same source rows and fields, through the public <code>ExplorEda</code> component. Native brushing, external filters and trace inspection remain available.</p></div><button type="button" className="sl-button" disabled={!captured} onClick={() => { try { set(importNativeSelection(captured!, s)); setError(""); } catch (e) { setError(e instanceof Error ? e.message : "The selection cannot be transferred."); } }}>Use native selection in lab</button></div>
    <p className="sl-muted">{captured ? "The native workspace has changed. Transfer its selection for a matching experimental comparison, or change a lab field/filter to restore it." : "Comparison matches the current lab analysis scope and filters."} At narrow widths, scroll this desktop workspace horizontally; this does not extend the workspace's mobile support.</p>
    {error && <p role="alert" className="sl-error">{error}</p>}
    <div className="sl-native-scroll" tabIndex={0} aria-label="Scrollable desktop explorEDA workspace"><div className="sl-native-inner"><ExplorEda data={fixture.rows} savedData={savedData} onStateChange={capture} /></div></div>
  </section>;
}
