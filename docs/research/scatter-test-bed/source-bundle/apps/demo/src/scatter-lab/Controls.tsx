import type { ReactNode } from "react";
import type { Fixture, Settings } from "./types";
import { ActionTooltip } from "./ActionTooltip";
import { category } from "./statistics";

export function Choice({ label, value, options, onChange, help }: { label: string; value: string; options: { value: string; label: string }[]; onChange: (value: string) => void; help?: string }) {
  const control = <select aria-label={label} value={value} onChange={e => onChange(e.target.value)}>{!options.some(o => o.value === value) && <option value={value}>{value} · unavailable</option>}{options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select>;
  return <label className="sl-control"><span>{label}</span>{help ? <ActionTooltip content={help}>{control}</ActionTooltip> : control}</label>;
}
export function NumberControl({ label, value, min, max, step = 1, onChange, help }: { label: string; value: number; min: number; max: number; step?: number; onChange: (v: number) => void; help?: string }) {
  const input = <input aria-label={label} type="number" min={min} max={max} step={step} value={value} onChange={e => { if (!e.target.value.trim()) return; const v = Number(e.target.value); if (Number.isFinite(v) && v >= min && v <= max) onChange(v); }} />;
  return <label className="sl-control"><span>{label}</span>{help ? <ActionTooltip content={help}>{input}</ActionTooltip> : input}</label>;
}
export function Toggle({ label, checked, onChange, help, disabled = false }: { label: string; checked: boolean; onChange: (v: boolean) => void; help: string; disabled?: boolean }) {
  return <ActionTooltip content={help}><button type="button" className="sl-toggle" aria-pressed={checked} disabled={disabled} onClick={() => onChange(!checked)}><span aria-hidden="true">{checked ? "✓" : "+"}</span>{label}</button></ActionTooltip>;
}
export function Section({ name, children }: { name: string; children: ReactNode }) { return <fieldset className="sl-fieldset"><legend>{name}</legend>{children}</fieldset>; }
const layerLabels: Record<keyof Settings["layers"], [string, string]> = {
  points: ["Points", "Show individual eligible rows, with context points dimmed. Large point renders use the explicitly stated deterministic rendering stride."],
  hex: ["Hexagonal bins", "Count eligible analysis rows in a pointy-top hexagonal pixel grid. Each bin retains exact source IDs. Inspection does not filter."],
  densityFill: ["Density fill", "Show approximate Gaussian kernel count intensity in rows per square plot pixel, not probability per physical unit."],
  densityContours: ["Density contours", "Draw equally spaced count-intensity thresholds on the same full-source scale. These are not probability-mass regions."],
  dataEllipse: ["Data ellipse", "Fit a Mahalanobis contour with Gaussian coverage q=−2 ln(1−coverage). It is not exact finite-sample outlier significance."],
  meanRegion: ["Mean region", "Hotelling confidence region for the unknown bivariate population mean. Requires independent normal observations and n>2."],
  distances: ["Distance diagnostics", "Color scored rows by D² and draw D=1,2,3 reference contours. A distant observation is not automatically an error."],
  principalAxes: ["Principal axes", "Covariance PCA in the chosen analysis units. Lines extend one standard deviation each way; orientation depends on units."],
  marginals: ["Marginal histograms", "Count the same eligible X/Y pairs used by the analysis. Both margins use explicit equal-width bins in analysis coordinates."],
  reference: ["Reference context", "Keep reference rows visible in gray when they are outside the analysis. The reference count and estimator do not follow a selection when a fixed reference is chosen."],
};
export function LayerControls({ settings, set, numeric }: { settings: Settings; set: (s: Settings) => void; numeric: boolean }) {
  return <><div className="sl-layers">{(Object.keys(layerLabels) as (keyof Settings["layers"])[]).map(key => <Toggle key={key} label={layerLabels[key][0]} help={layerLabels[key][1]} checked={settings.layers[key]} disabled={!numeric && key !== "points"} onChange={v => set({ ...settings, layers: { ...settings.layers, [key]: v } })} />)}</div>
    <div className="sl-control-row sl-method-parameters">
      {settings.layers.hex && <NumberControl label="Hex radius (px)" value={settings.method.hexRadius} min={5} max={50} onChange={v => set({ ...settings, method: { ...settings.method, hexRadius: v } })} help="Radius in CSS plot pixels. Origin is the plot's top-left corner. Resizing changes bin membership, not source domains." />}
      {(settings.layers.densityFill || settings.layers.densityContours) && <><NumberControl label="Bandwidth (px)" value={settings.method.bandwidth} min={4} max={100} onChange={v => set({ ...settings, method: { ...settings.method, bandwidth: v } })} help="Gaussian kernel standard deviation in CSS plot pixels. A larger bandwidth smooths more. The grid cell is 4 pixels." /><NumberControl label="Contour levels" value={settings.method.contourLevels} min={2} max={12} onChange={v => set({ ...settings, method: { ...settings.method, contourLevels: Math.round(v) } })} /></>}
      {(settings.layers.dataEllipse || settings.layers.meanRegion) && <Choice label="Coverage / confidence" value={String(settings.method.coverage)} options={[.5,.9,.95,.99].map(v => ({ value: String(v), label: `${v * 100}%` }))} onChange={v => set({ ...settings, method: { ...settings.method, coverage: Number(v) } })} help="The same nominal level has different meanings: fitted Gaussian data coverage versus confidence in an unknown population mean." />}
      {settings.layers.marginals && <NumberControl label="Marginal bins" value={settings.method.histogramBins} min={4} max={60} onChange={v => set({ ...settings, method: { ...settings.method, histogramBins: Math.round(v) } })} />}
    </div></>;
}
export function ScopeControls({ fixture, settings: s, set }: { fixture: Fixture; settings: Settings; set: (s: Settings) => void }) {
  const options = fixture.fields.map(f => ({ value: f.name, label: `${f.name} · ${f.unit}` }));
  const groups = fixture.fields.find(f => f.name === s.fields.group)?.kind === "category" ? [...new Set(fixture.rows.map(row => category(row[s.fields.group])))].sort() : [];
  const groupOptions = [{ value: "all", label: "All groups" }, ...groups.map(g => ({ value: g, label: g }))];
  return <details className="sl-settings"><summary>Fields, populations and coordinates</summary>
    <div className="sl-control-row">
      <Choice label="X field" value={s.fields.x} options={options} onChange={x => set({ ...s, fields: { ...s.fields, x }, filters: { ...s.filters, x: {} } })} />
      <Choice label="Y field" value={s.fields.y} options={options} onChange={y => set({ ...s, fields: { ...s.fields, y }, filters: { ...s.filters, y: {} } })} />
      <Choice label="Grouping field" value={s.fields.group} options={fixture.fields.filter(f => f.kind === "category").map(f => ({ value: f.name, label: f.name }))} onChange={group => set({ ...s, fields: { ...s.fields, group }, facet: "all", filters: { ...s.filters, group: "all" } })} />
      <Choice label="Active facet" value={s.facet} options={groupOptions} onChange={facet => set({ ...s, facet })} help="Focus the analysis on one group while keeping all-source domains. Full-data and training reference models remain source-wide." />
      <Choice label="Analysis rows" value={s.analysisScope} options={[{ value: "selected", label: "Passing all filters in facet" }, { value: "full", label: "Full active facet, ignore filters" }]} onChange={analysisScope => set({ ...s, analysisScope: analysisScope as Settings["analysisScope"] })} />
      <Choice label="Reference fit" value={s.referenceScope} options={[{ value: "analysis", label: "Same as analysis" }, { value: "full", label: "Full source · ignore filters/facet" }, { value: "training", label: "Training cohort · fixed" }]} onChange={referenceScope => set({ ...s, referenceScope: referenceScope as Settings["referenceScope"] })} />
      <Choice label="Score rows" value={s.scoreScope} options={[{ value: "analysis", label: "Analysis rows" }, { value: "full", label: "Full active facet" }, { value: "held-out", label: "Held-out cohort in facet" }]} onChange={scoreScope => set({ ...s, scoreScope: scoreScope as Settings["scoreScope"] })} />
      <Choice label="Analysis coordinates" value={s.analysisSpace} options={[{ value: "data", label: "Prepared data units" }, { value: "symlog", label: "symlog(value / 1 unit)" }]} onChange={analysisSpace => set({ ...s, analysisSpace: analysisSpace as Settings["analysisSpace"] })} help="Covariance and distances are recomputed in this space. A display-only transform does not change statistics." />
      {(["x", "y"] as const).map(axis => <Choice key={axis} label={`${axis.toUpperCase()} display`} value={s.display[axis]} options={[{ value: "linear", label: "Linear" }, { value: "symlog", label: "Symlog · constant 1 unit" }]} onChange={v => set({ ...s, display: { ...s.display, [axis]: v } })} />)}
      <Toggle label="Separate group models" checked={s.grouped} onChange={grouped => set({ ...s, grouped })} help="Estimate a separate covariance for each category. Each summary and its model use exactly that group's eligible pairs; density and bins stay pooled counts." />
    </div>
  </details>;
}
export function FilterControls({ fixture, settings: s, set }: { fixture: Fixture; settings: Settings; set: (s: Settings) => void }) {
  const groups = fixture.fields.find(f => f.name === s.fields.group)?.kind === "category" ? [...new Set(fixture.rows.map(row => category(row[s.fields.group])))].sort() : [];
  return <div className="sl-control-row sl-filters">
    <strong>Filters</strong>
    <Choice label="External group filter" value={s.filters.group} options={[{ value: "all", label: "All groups" }, ...groups.map(g => ({ value: g, label: g }))]} onChange={group => set({ ...s, filters: { ...s.filters, group } })} />
    <Choice label="External cohort filter" value={s.filters.cohort} options={[{ value: "all", label: "All cohorts" }, { value: "training", label: "Training" }, { value: "held-out", label: "Held-out" }]} onChange={cohort => set({ ...s, filters: { ...s.filters, cohort } })} />
    {(["x", "y"] as const).flatMap(axis => (["min", "max"] as const).map(edge => <label className="sl-control sl-bound" key={`${axis}${edge}`}><span>{axis.toUpperCase()} {edge}</span><input aria-label={`${axis.toUpperCase()} ${edge}`} type="number" value={s.filters[axis][edge] ?? ""} placeholder="Unbounded" onChange={e => { const value = e.target.value.trim() ? Number(e.target.value) : undefined; if (value !== undefined && !Number.isFinite(value)) return; set({ ...s, filters: { ...s.filters, [axis]: { ...s.filters[axis], [edge]: value } } }); }} /></label>))}
    <button type="button" className="sl-button" onClick={() => set({ ...s, filters: { x: {}, y: {}, group: "all", cohort: "all" } })}>Clear filters</button>
  </div>;
}
