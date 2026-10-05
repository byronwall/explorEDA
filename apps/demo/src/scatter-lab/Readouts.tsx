import { useMemo, useState } from "react";
import type { Fixture, Settings, Model } from "./types";
import type { PopulationPlan, GeometryPlan } from "./plan";
import { formatNumber, groupColor } from "./ScatterCanvas";
import { finiteNumber } from "./statistics";
import { principalAxes } from "./related";

export function Legends({ settings: s, population: p, geometry: g }: { settings: Settings; population: PopulationPlan; geometry: GeometryPlan }) {
  const groups = [...p.groupCounts.keys()].sort();
  return <div className="sl-legends" aria-label="Plot legends">
    <div className="sl-group-legend">{groups.map(group => <span key={group}><i style={{ background: groupColor(group, groups) }} />{group} <small>source n={p.groupCounts.get(group)}</small></span>)}<span><i className="sl-context-swatch" />Context / reference outside analysis</span></div>
    {s.layers.hex && <div><span className="sl-ramp sl-hex-ramp" />Hex count: 0 → {g.maxBin} rows per bin. Common full-source maximum; inspection only.</div>}
    {(s.layers.densityFill || s.layers.densityContours) && <div><span className="sl-ramp sl-density-ramp" />Kernel intensity: 0 → {formatNumber(g.densityMaximum)} rows/px². Bandwidth {s.method.bandwidth} px; grid 4 px. Thresholds: {g.levels.map(v => formatNumber(v)).join(" · ")}. No probability-mass claim.</div>}
    {s.layers.dataEllipse && <div><span className="sl-key-line" />Data ellipse: {s.method.coverage * 100}% fitted Gaussian coverage around the reference estimate.</div>}
    {s.layers.meanRegion && <div><span className="sl-key-line sl-mean-line" />Confidence region for the mean: {s.method.coverage * 100}% Hotelling region; independent bivariate normal observations and n&gt;2.</div>}
    {s.layers.distances && <div><span className="sl-ramp sl-distance-ramp" />Squared distance D²: 0 → 16 (values above 16 use the end color). Dotted contours: D=1, 2, 3. Only the declared scoring population receives scores.</div>}
  </div>;
}
function SummaryTable({ models, heading, units, showAxes }: { models: Model[]; heading: string; units: [string, string]; showAxes: boolean }) {
  return <section><h3>{heading}</h3><div className="sl-table-scroll"><table><caption>Paired finite measurements; sample denominator n−1. Correlation is dimensionless.</caption><thead><tr><th>Population</th><th>Pairs / excluded</th><th>Mean X / Y</th><th>Standard deviation X / Y</th><th>Sample covariance matrix</th><th>Pearson r</th></tr></thead><tbody>{models.map(model => <tr key={model.group}>
    <th>{model.group}</th><td>{model.prepared.pairs.length.toLocaleString()} / {model.prepared.excluded.length.toLocaleString()}</td>
    <td>{formatNumber(model.covariance.mean?.[0])} {units[0]}<br />{formatNumber(model.covariance.mean?.[1])} {units[1]}</td>
    <td>{formatNumber(model.covariance.sd?.[0])} {units[0]}<br />{formatNumber(model.covariance.sd?.[1])} {units[1]}</td>
    <td className="sl-matrix">{model.covariance.covariance ? <><span>[ {formatNumber(model.covariance.covariance[0][0])}, {formatNumber(model.covariance.covariance[0][1])} ]</span><span>[ {formatNumber(model.covariance.covariance[1][0])}, {formatNumber(model.covariance.covariance[1][1])} ]</span><small>diagonal {units[0]}², {units[1]}²; cross term {units[0]}·{units[1]}</small></> : "Unavailable"}</td>
    <td>{formatNumber(model.covariance.correlation)}</td>
  </tr>)}</tbody></table></div>{models.filter(m => !m.covariance.available).map(m => <p className="sl-warning" key={m.group}>{m.group}: {m.covariance.reason}</p>)}
  {showAxes && models.map(model => { const axes = principalAxes(model.covariance); return axes && <p key={model.group} className="sl-muted">{model.group} covariance PCA: principal variances {formatNumber(axes.values[0])} and {formatNumber(axes.values[1])} in the chosen numeric coordinate metric; {(axes.fraction[0] * 100).toFixed(1)}% and {(axes.fraction[1] * 100).toFixed(1)}% of total variance. Direction depends on units; this is not standardized-correlation PCA.</p>; })}</section>;
}
export function Summaries({ fixture, settings: s, population: p }: { fixture: Fixture; settings: Settings; population: PopulationPlan }) {
  const units: [string, string] = s.analysisSpace === "symlog" ? ["symlog X", "symlog Y"] : [fixture.fields.find(f => f.name === s.fields.x)?.unit ?? "X unit", fixture.fields.find(f => f.name === s.fields.y)?.unit ?? "Y unit"];
  return <details className="sl-readouts" open><summary>Covariance, correlation and population counts</summary>
    <p className="sl-muted">{s.analysisSpace === "data" ? "Prepared data coordinates." : "Analysis transform: sign(value)·ln(1+|value / 1 field unit|), separately on X and Y; transformed coordinates are dimensionless."} Summaries use {s.analysisScope === "selected" ? "all-filter rows in the active facet" : "the full active facet, ignoring filters"}. Ellipses, principal axes and distances use the {s.referenceScope} reference estimate.</p>
    <SummaryTable heading={s.referenceScope === "analysis" ? "Analysis and reference fit" : "Analysis summary"} models={p.summaries} units={units} showAxes={s.layers.principalAxes && s.referenceScope === "analysis"} />
    {s.referenceScope !== "analysis" && <SummaryTable heading={`Reference fit · ${s.referenceScope} · independent of current selection`} models={p.models} units={units} showAxes={s.layers.principalAxes} />}
  </details>;
}
export function Marginals({ geometry: g, settings: s }: { geometry: GeometryPlan; settings: Settings }) {
  return <section className="sl-marginals" aria-label="Marginal histograms">{(["x", "y"] as const).map(axis => {
    const bins = g.marginals[axis], total = bins.reduce((sum, b) => sum + b.count, 0), max = Math.max(1, ...bins.map(b => b.count));
    return <div key={axis}><h3>{s.fields[axis]} marginal · n={total.toLocaleString()}</h3><svg viewBox="0 0 500 100" role="img" aria-label={`${s.fields[axis]} marginal histogram, ${bins.length} equal-width analysis-coordinate bins; ${total} paired observations`}>
      {bins.map((b, i) => <rect key={i} x={i * 500 / bins.length + 1} y={90 - 80 * b.count / max} width={Math.max(1, 500 / bins.length - 2)} height={80 * b.count / max} className="sl-hist-bar" />)}
      <text x={3} y={12} className="sl-hist-text">max {max} rows/bin</text><text x={3} y={99} className="sl-hist-text">{formatNumber(bins[0]?.lower)}</text><text x={497} y={99} textAnchor="end" className="sl-hist-text">{formatNumber(bins.at(-1)?.upper)}</text>
    </svg><p className="sl-muted">{bins.length} equal-width bins in {s.analysisSpace === "data" ? "data units" : "symlog coordinates"}; same eligible X/Y pairs as the scatter. Last bin includes its maximum.</p></div>;
  })}</section>;
}
export function Inspection({ fixture, settings: s, population: p, geometry: g, selectedId, inspect }: { fixture: Fixture; settings: Settings; population: PopulationPlan; geometry: GeometryPlan; selectedId: string | null; inspect: (id: string) => void }) {
  const [index, setIndex] = useState(0), [binKey, setBinKey] = useState(""), [page, setPage] = useState(0);
  const rowMap = useMemo(() => new Map(fixture.rows.map(row => [row.sourceId, row])), [fixture]);
  const farthest = useMemo(() => p.scores.filter(score => score.d2 !== null).sort((a, b) => b.d2! - a.d2! || a.pair.id.localeCompare(b.pair.id)).slice(0, 20), [p.scores]);
  const selected = selectedId ? rowMap.get(selectedId) : null, scored = selectedId ? p.scores.find(score => score.pair.id === selectedId) : undefined;
  const excluded = selectedId ? p.all.excluded.find(e => e.id === selectedId) : undefined;
  const bin = g.bins.find(b => b.key === binKey) ?? g.bins[0], maxPage = Math.max(0, Math.ceil((bin?.count ?? 0) / 25) - 1), currentPage = Math.min(page, maxPage);
  return <details className="sl-readouts" open><summary>Inspect rows and derived marks</summary>
    <div className="sl-control-row"><label className="sl-control"><span>Source row index (zero-based)</span><input aria-label="Source row index" type="number" min={0} max={Math.max(0, fixture.rows.length - 1)} value={Math.min(index, fixture.rows.length - 1)} onChange={e => setIndex(Math.max(0, Math.min(fixture.rows.length - 1, Math.floor(Number(e.target.value) || 0))))} /></label><button type="button" className="sl-button" onClick={() => { const row = fixture.rows[Math.min(index, fixture.rows.length - 1)]; if (row) inspect(row.sourceId); }}>Inspect source row</button></div>
    {selected && <div className="sl-inspected" role="status" data-inspected-id={selected.sourceId}><strong>{selected.sourceId}</strong><p>{s.fields.x}: {String(selected[s.fields.x])} · {s.fields.y}: {String(selected[s.fields.y])} · {s.fields.group}: {String(selected[s.fields.group])}</p><p>Squared Mahalanobis distance D²: <b>{formatNumber(scored?.d2)}</b> · Mahalanobis distance D: <b>{formatNumber(scored?.d)}</b>.</p><p>{excluded?.reason ?? scored?.reason ?? (!scored ? "This row is outside the declared scoring population." : `Reference: ${s.referenceScope}; ${s.grouped ? "within-group model" : "pooled model"}. Distance is a model diagnostic, not an error label.`)}</p><p>Analysis membership: {p.analysis.pairs.some(pair => pair.id === selected.sourceId) ? "included" : "excluded"}. Reference membership: {p.reference.pairs.some(pair => pair.id === selected.sourceId) ? "included" : "excluded"}.</p></div>}
    {s.layers.hex && <section><h3>Hexagonal-bin inspection · no filtering</h3><label className="sl-control"><span>Bin and exact count</span><select aria-label="Inspect hexagonal bin" value={bin?.key ?? ""} onChange={e => { setBinKey(e.target.value); setPage(0); }}>{g.bins.map(b => <option key={b.key} value={b.key}>{b.key} · {b.count} rows</option>)}</select></label>
      <p>{bin ? `Bin (${bin.key}) contains exactly ${bin.count} source rows. Center (${formatNumber(bin.x)}, ${formatNumber(bin.y)}) px; radius ${s.method.hexRadius} px.` : "No eligible rows to bin."}</p>
      {bin && <><div className="sl-table-scroll"><table><thead><tr><th>Exact source ID</th><th>{s.fields.x}</th><th>{s.fields.y}</th><th>{s.fields.group}</th></tr></thead><tbody>{bin.ids.slice(currentPage * 25, (currentPage + 1) * 25).map(id => { const row = rowMap.get(id)!; return <tr key={id}><td><button type="button" className="sl-link" onClick={() => inspect(id)}>{id}</button></td><td>{String(row[s.fields.x])}</td><td>{String(row[s.fields.y])}</td><td>{String(row[s.fields.group])}</td></tr>; })}</tbody></table></div><div className="sl-control-row"><button type="button" className="sl-button" disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)}>Previous contributors</button><span>Page {currentPage + 1} of {maxPage + 1} · all {bin.count} contributors retained</span><button type="button" className="sl-button" disabled={currentPage === maxPage} onClick={() => setPage(currentPage + 1)}>Next contributors</button></div></>}
    </section>}
    <section><h3>Most distant scored rows</h3><p className="sl-muted">{p.scores.filter(score => score.d2 !== null).length.toLocaleString()} finite distance scores / {p.scoring.pairs.length.toLocaleString()} eligible scoring pairs; reference n={p.reference.pairs.length.toLocaleString()}. Top 20 by D², not classified as errors.</p>
      <div className="sl-table-scroll"><table><thead><tr><th>Source row</th><th>Group</th><th>{s.fields.x}</th><th>{s.fields.y}</th><th>Squared distance D²</th><th>Distance D</th></tr></thead><tbody>{farthest.map(score => <tr key={score.pair.id}><td><button type="button" className="sl-link" onClick={() => inspect(score.pair.id)}>{score.pair.id}</button></td><td>{score.pair.group}</td><td>{formatNumber(finiteNumber(score.pair.row[s.fields.x]))}</td><td>{formatNumber(finiteNumber(score.pair.row[s.fields.y]))}</td><td>{formatNumber(score.d2)}</td><td>{formatNumber(score.d)}</td></tr>)}</tbody></table></div>
      {!farthest.length && <p role="status">No finite distance scores for this population and reference model.</p>}
    </section>
  </details>;
}
