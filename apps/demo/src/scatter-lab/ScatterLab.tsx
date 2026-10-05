import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import type { Fixture, Settings } from "./types";
import { defaults, exportSettings, restoreSettings } from "./settings";
import { makeFixture, parsePenguins, presets } from "./fixtures";
import { geometryPlan, populationPlan } from "./plan";
import { Choice, FilterControls, LayerControls, NumberControl, ScopeControls } from "./Controls";
import { ScatterCanvas } from "./ScatterCanvas";
import { Inspection, Legends, Marginals, Summaries } from "./Readouts";
import { MethodHelp } from "./MethodHelp";
import "./lab.css";

const ExistingScatter = lazy(() => import("./ExistingScatter").then(module => ({ default: module.ExistingScatter })));
export default function ScatterLab({ initialSettings }: { initialSettings?: Settings } = {}) {
  const [settings, setSettings] = useState<Settings>(() => initialSettings ?? defaults());
  const [penguins, setPenguins] = useState<Fixture | null>(null), [loadError, setLoadError] = useState("");
  const [theme, setTheme] = useState<"light" | "dark">(() => document.documentElement.classList.contains("dark") ? "dark" : "light");
  const [narrowView, setNarrowView] = useState<"Baseline" | "Experiment">("Experiment"), [nativeOpen, setNativeOpen] = useState(false);
  const [selectedId, inspect] = useState<string | null>(null), [json, setJson] = useState(""), [jsonError, setJsonError] = useState("");
  const [containerWidth, setContainerWidth] = useState(1100), container = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const wasDark = document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", theme === "dark");
    return () => { document.documentElement.classList.toggle("dark", wasDark); };
  }, [theme]);
  useEffect(() => {
    if (settings.fixture.id !== "penguins" || penguins) return;
    const controller = new AbortController(); setLoadError("");
    fetch("/datasets/palmer-penguins.csv", { signal: controller.signal }).then(response => { if (!response.ok) throw new Error(`Dataset request failed (${response.status}).`); return response.text(); }).then(text => setPenguins(parsePenguins(text))).catch(error => { if (error instanceof Error && error.name !== "AbortError") setLoadError(error.message); });
    return () => controller.abort();
  }, [settings.fixture.id, penguins]);
  useEffect(() => {
    const node = container.current; if (!node) return;
    const observer = new ResizeObserver(entries => { const width = entries[0]?.contentRect.width; if (width && width > 0) setContainerWidth(Math.floor(width)); });
    observer.observe(node); return () => observer.disconnect();
  }, []);
  const fixture = useMemo(() => settings.fixture.id === "penguins" ? penguins : makeFixture(settings.fixture), [settings.fixture, penguins]);
  const emptyFixture: Fixture = useMemo(() => ({ id: "loading", label: "Loading", rows: [], fields: [], synthetic: false, groupField: "species", note: "Loading the attributed real dataset." }), []);
  const source = fixture ?? emptyFixture;
  const wide = containerWidth >= 1000;
  const panelWidth = wide ? Math.floor((containerWidth - 18) / 2) : containerWidth;
  const plotWidth = Math.max(180, panelWidth - 80), plotHeight = containerWidth < 450 ? 280 : 320;
  const populationResult = useMemo(() => { const started = performance.now(); const plan = populationPlan(source, settings); return { plan, ms: performance.now() - started }; }, [source, settings.fields, settings.filters, settings.facet, settings.analysisScope, settings.referenceScope, settings.scoreScope, settings.analysisSpace, settings.grouped]);
  const p = populationResult.plan;
  const geometryResult = useMemo(() => { const started = performance.now(); const plan = geometryPlan(source, settings, p, plotWidth, plotHeight); return { plan, ms: performance.now() - started }; }, [source, settings, p, plotWidth, plotHeight]);
  const g = geometryResult.plan;
  const update = (next: Settings) => { setSettings(next); setJsonError(""); };
  const choosePreset = (id: string) => { update(defaults(id as Settings["fixture"]["id"])); inspect(null); };
  const download = () => {
    const text = exportSettings(settings); setJson(text);
    const url = URL.createObjectURL(new Blob([text], { type: "application/json" }));
    const a = document.createElement("a"); a.href = url; a.download = `scatter-lab-${settings.fixture.id}-${settings.fixture.seed}.json`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 0);
  };
  return <main className={`scatter-lab sl-${theme}`} ref={container} data-analysis-count={p.analysis.pairs.length} data-reference-count={p.reference.pairs.length} data-scored-count={p.scores.filter(score => score.d2 !== null).length} data-computation-ms={populationResult.ms + geometryResult.ms} data-fixture={settings.fixture.id}>
    <header className="sl-page-header"><div><a className="sl-brand" href="/">explorEDA <span aria-hidden="true">/</span> Methods</a><h1>Scatter laboratory<span className="sl-experimental">Experimental</span></h1><p>Compare what the data shows—and what the model assumes.</p></div><div className="sl-header-actions"><button type="button" className="sl-button" aria-pressed={theme === "dark"} onClick={() => setTheme(theme === "light" ? "dark" : "light")}>{theme === "light" ? "Dark theme" : "Light theme"}</button><button type="button" className="sl-button" onClick={() => { update(defaults(settings.fixture.id)); inspect(null); setJson(""); }}>Reset preset</button><button type="button" className="sl-button sl-primary" onClick={download}>Export settings</button></div></header>
    <section className="sl-fixture-bar" aria-label="Reproducible fixture controls"><div className="sl-control-row">
      <Choice label="Reproducible preset" value={settings.fixture.id} options={presets.map(preset => ({ value: preset.id, label: preset.label }))} onChange={choosePreset} />
      {settings.fixture.id !== "penguins" && <><NumberControl label="Seed" value={settings.fixture.seed} min={0} max={4294967295} onChange={seed => update({ ...settings, fixture: { ...settings.fixture, seed: Math.round(seed) } })} /><Choice label="Synthetic rows" value={String(settings.fixture.n)} options={[2,20,1000,10000,100000].map(n => ({ value: String(n), label: n.toLocaleString() }))} onChange={n => update({ ...settings, fixture: { ...settings.fixture, n: Number(n) } })} /><NumberControl label="Generator correlation" value={settings.fixture.correlation} min={-.99} max={.99} step={.01} onChange={correlation => update({ ...settings, fixture: { ...settings.fixture, correlation } })} help="Used by the Gaussian presets; independent, nonlinear and degenerate fixtures have their own stated construction." />{settings.fixture.id === "contamination" && <NumberControl label="Held-out contamination" value={settings.fixture.contamination} min={0} max={.5} step={.01} onChange={contamination => update({ ...settings, fixture: { ...settings.fixture, contamination } })} />}</>}
      <div className="sl-fixture-kind"><b>{source.synthetic ? "Synthetic" : "Real dataset"}</b><span>{source.rows.length.toLocaleString()} source rows</span></div>
    </div><p>{source.note}</p>{settings.fixture.id === "penguins" && <p className="sl-muted">Source and attribution: <a href="https://allisonhorst.github.io/palmerpenguins/" target="_blank" rel="noreferrer">palmerpenguins</a> · <a href="https://allisonhorst.github.io/palmerpenguins/LICENSE.html" target="_blank" rel="noreferrer">CC0</a>. Retains the repository's dataset; no synthetic substitution.</p>}</section>
    {loadError && <p role="alert" className="sl-error">Could not load Palmer Penguins: {loadError}</p>}
    {!fixture && !loadError && <p role="status">Loading Palmer Penguins measurements…</p>}
    <ScopeControls fixture={source} settings={settings} set={update} />
    <FilterControls fixture={source} settings={settings} set={update} />
    <section className="sl-population-bar" aria-label="Analysis population counts"><div><strong>{p.analysis.pairs.length.toLocaleString()}</strong><span>analysis pairs</span></div><div><strong>{p.analysis.excluded.length.toLocaleString()}</strong><span>excluded pairs in scope</span></div><div><strong>{p.reference.pairs.length.toLocaleString()}</strong><span>reference pairs · {settings.referenceScope}</span></div><div><strong>{p.scoring.pairs.length.toLocaleString()}</strong><span>eligible scoring pairs</span></div><div className="sl-scope-statement"><b>{settings.grouped ? "Within-group models" : "Pooled model"} · {settings.analysisSpace === "data" ? "data units" : "symlog analysis"}</b><span>{p.selectedRows.length.toLocaleString()} rows pass all filters in facet “{settings.facet}”. {p.contextRows.length.toLocaleString()} pass external filters.</span></div></section>
    <section className="sl-methods" aria-label="Experimental scatter layers"><h2>Compare layers</h2><LayerControls settings={settings} set={update} numeric={p.numeric} /><p className="sl-muted">Ellipses use the reference fit; bins, density and marginals use analysis rows. Gaussian data coverage is descriptive. Mean-region inference requires independent bivariate normal observations.</p></section>
    {!wide && <div className="sl-view-switch" role="group" aria-label="Narrow comparison view">{(["Baseline", "Experiment"] as const).map(view => <button type="button" key={view} aria-pressed={narrowView === view} onClick={() => setNarrowView(view)}>{view}</button>)}</div>}
    <div className={`sl-comparison ${wide ? "sl-wide" : "sl-narrow"}`}>
      {(["Baseline", "Experiment"] as const).filter(view => wide || narrowView === view).map(variant => <ScatterCanvas key={variant} variant={variant} fixture={source} settings={settings} population={p} geometry={g} theme={theme} onInspect={inspect} onBrush={(x, y) => update({ ...settings, filters: { ...settings.filters, x, y } })} />)}
    </div>
    <Legends settings={settings} population={p} geometry={g} />
    {settings.layers.marginals && <Marginals settings={settings} geometry={g} />}
    <Summaries fixture={source} settings={settings} population={p} />
    <Inspection fixture={source} settings={settings} population={p} geometry={g} selectedId={selectedId} inspect={inspect} />
    <section className="sl-native-toggle"><div><h2>Compare with the existing chart</h2><p>The original canvas/SVG scatter, linked filters and trace inspector—not an approximation of them.</p></div><button type="button" className="sl-button" aria-expanded={nativeOpen} onClick={() => setNativeOpen(!nativeOpen)}>{nativeOpen ? "Close existing scatter" : "Open existing scatter"}</button></section>
    {nativeOpen && fixture && p.validFields && <Suspense fallback={<p role="status">Loading the existing explorEDA workspace…</p>}><ExistingScatter fixture={fixture} settings={settings} set={update} /></Suspense>}
    {nativeOpen && !p.validFields && <p role="status">Choose available fields before opening the existing scatter comparison.</p>}
    <details className="sl-readouts"><summary>Restore or edit reproducible settings</summary><p>The document contains the fixture ID, seed, generator parameters, fields, populations, transforms and method controls. No workspace schema or remote storage is changed.</p><label className="sl-control"><span>Scatter lab settings JSON</span><textarea aria-label="Scatter lab settings JSON" value={json} onChange={e => { setJson(e.target.value); setJsonError(""); }} spellCheck={false} /></label><div className="sl-control-row"><button type="button" className="sl-button" onClick={() => setJson(exportSettings(settings))}>Show current JSON</button><button type="button" className="sl-button sl-primary" disabled={!json.trim()} onClick={() => { try { update(restoreSettings(json)); inspect(null); } catch (e) { setJsonError(e instanceof Error ? e.message : "Invalid lab settings."); } }}>Restore settings</button></div>{jsonError && <p role="alert" className="sl-error">{jsonError}</p>}</details>
    <MethodHelp />
    <footer className="sl-page-footer"><span>Scatter laboratory · experimental methods, explicit populations</span><a href="/?example=scatter-trace">Existing trace example</a><a href="/?example=palmer-penguins">Penguin workspace</a><a href="/?view=docs&topic=scatter">Scatter guide</a></footer>
  </main>;
}
