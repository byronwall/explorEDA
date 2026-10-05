import { useEffect, useMemo, useRef, useState, useId } from "react";
import type { Fixture, PixelPair, Settings } from "./types";
import type { GeometryPlan, PopulationPlan } from "./plan";
import { dataThreshold, ellipseBoundary, meanThreshold } from "./statistics";
import { hexVertices } from "./geometry";
import { principalAxes } from "./related";

const palette = ["#167b9a", "#d16d29", "#388566", "#a84988", "#626bd2"];
export function formatNumber(v: number | null | undefined): string { return v == null || !Number.isFinite(v) ? "Unavailable" : Math.abs(v) >= 1e7 || (Math.abs(v) > 0 && Math.abs(v) < .0001) ? v.toExponential(3) : Number(v.toPrecision(6)).toLocaleString("en-US", { maximumFractionDigits: 6 }); }
export function groupColor(group: string, groups: string[]): string { return palette[Math.max(0, groups.indexOf(group)) % palette.length]!; }
const POINT_LIMIT = 10000;
export function renderedPoints(points: PixelPair[]): PixelPair[] { const stride = Math.max(1, Math.ceil(points.length / POINT_LIMIT)); return points.filter((_, i) => i % stride === 0); }
export function ScatterCanvas({ variant, settings: s, fixture, population: p, geometry: g, theme, onBrush, onInspect }: {
  variant: "Baseline" | "Experiment"; settings: Settings; fixture: Fixture; population: PopulationPlan; geometry: GeometryPlan; theme: "light" | "dark";
  onBrush: (x: { min?: number; max?: number }, y: { min?: number; max?: number }) => void;
  onInspect: (id: string) => void;
}) {
  const canvas = useRef<HTMLCanvasElement>(null), overlay = useRef<SVGSVGElement>(null), drag = useRef<[number, number] | null>(null);
  const [hover, setHover] = useState<PixelPair | null>(null), [brush, setBrush] = useState<[[number, number], [number, number]] | null>(null);
  const id = useId(), left = 62, top = 20, right = 16, bottom = 50;
  const width = g.width + left + right, height = g.height + top + bottom;
  const groups = useMemo(() => [...p.groupCounts.keys()].sort(), [p.groupCounts]);
  const analysisIds = useMemo(() => new Set(p.analysis.pairs.map(pair => pair.id)), [p.analysis]);
  const drawn = useMemo(() => {
    const union = new Map<string, PixelPair>();
    if (s.layers.reference) g.reference.forEach(point => union.set(point.id, point));
    g.context.forEach(point => union.set(point.id, point)); g.analysis.forEach(point => union.set(point.id, point));
    return [...union.values()];
  }, [g, s.layers.reference]);
  const displayPoints = useMemo(() => renderedPoints(drawn), [drawn]);
  const scoreMap = useMemo(() => new Map(p.scores.map(score => [score.pair.id, score])), [p.scores]);
  const hoverScore = hover ? scoreMap.get(hover.id) : undefined;
  const experimental = variant === "Experiment";
  useEffect(() => { setHover(null); }, [g]);
  useEffect(() => {
    const node = canvas.current, ctx = node?.getContext("2d"); if (!node || !ctx) return;
    const dpr = window.devicePixelRatio || 1;
    node.width = Math.round(width * dpr); node.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, width, height);
    ctx.save(); ctx.translate(left, top); ctx.beginPath(); ctx.rect(0, 0, g.width, g.height); ctx.clip();
    const strokePath = (points: [number, number][], color: string, dash: number[] = [], lineWidth = 1.6) => {
      if (!points.length) return;
      ctx.beginPath(); points.forEach(([x, y], i) => { if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); });
      ctx.strokeStyle = color; ctx.lineWidth = lineWidth; ctx.setLineDash(dash); ctx.stroke(); ctx.setLineDash([]);
    };
    if (experimental && s.layers.densityFill && g.grid && g.densityMaximum > 0) {
      const grid = g.grid;
      for (let iy = 0; iy < grid.ny; ++iy) for (let ix = 0; ix < grid.nx; ++ix) {
        const x = ix * grid.cell - grid.pad, y = iy * grid.cell - grid.pad;
        if (x < -grid.cell || y < -grid.cell || x > g.width || y > g.height) continue;
        const t = Math.min(1, grid.values[iy * grid.nx + ix]! / g.densityMaximum);
        if (t < .006) continue;
        ctx.fillStyle = theme === "dark" ? `rgba(194,141,238,${t * .72})` : `rgba(116,62,153,${t * .65})`;
        ctx.fillRect(x - grid.cell / 2, y - grid.cell / 2, grid.cell, grid.cell);
      }
    }
    if (experimental && s.layers.hex) for (const bin of g.bins) {
      ctx.beginPath(); hexVertices(bin.x, bin.y, s.method.hexRadius).forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath();
      ctx.fillStyle = `rgba(24,134,143,${.1 + .8 * bin.count / g.maxBin})`; ctx.fill();
    }
    if (experimental && s.layers.densityContours) for (const contour of g.contours) {
      ctx.beginPath(); contour.segments.forEach(([a, b]) => { ctx.moveTo(...a); ctx.lineTo(...b); });
      ctx.strokeStyle = theme === "dark" ? "#d9b3f0" : "#8137a2"; ctx.globalAlpha = .8; ctx.lineWidth = 1; ctx.stroke(); ctx.globalAlpha = 1;
    }
    if (!experimental || s.layers.points) {
      for (const point of displayPoints) {
        const active = analysisIds.has(point.id), score = scoreMap.get(point.id);
        ctx.globalAlpha = active ? s.method.pointOpacity : .16;
        ctx.fillStyle = active ? (experimental && s.layers.distances && score?.d2 !== null && score?.d2 !== undefined ? `hsl(${210 - Math.min(1, score.d2 / 16) * 185},65%,${theme === "dark" ? 65 : 42}%)` : groupColor(point.group, groups)) : (theme === "dark" ? "#bcc3cb" : "#64717c");
        ctx.beginPath(); ctx.arc(point.px, point.py, active ? s.method.pointSize : 1.5, 0, 2 * Math.PI); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    if (experimental) for (const model of p.models) {
      const c = model.covariance, color = s.grouped ? groupColor(model.group, groups) : (theme === "dark" ? "#7bd7b2" : "#227252");
      if (s.layers.dataEllipse) strokePath(ellipseBoundary(c, dataThreshold(s.method.coverage)).map(g.dataToPixel), color, [], 2.2);
      const meanQ = meanThreshold(c.n, s.method.coverage);
      if (s.layers.meanRegion && meanQ !== null) strokePath(ellipseBoundary(c, meanQ).map(g.dataToPixel), theme === "dark" ? "#ffd090" : "#ad5b0c", [5, 3], 2.2);
      if (s.layers.distances) for (const radius of [1, 2, 3]) strokePath(ellipseBoundary(c, radius * radius).map(g.dataToPixel), theme === "dark" ? "#c1c8d2" : "#526779", [2, 4], 1);
      if (s.layers.principalAxes && c.mean) {
        const axes = principalAxes(c);
        if (axes) axes.values.forEach((value, i) => {
          const angle = axes.angle + i * Math.PI / 2, dx = Math.sqrt(value) * Math.cos(angle), dy = Math.sqrt(value) * Math.sin(angle);
          const vertices: [number, number][] = Array.from({ length: 41 }, (_, step) => { const t = step / 20 - 1; return [c.mean![0] + t * dx, c.mean![1] + t * dy]; });
          strokePath(vertices.map(g.dataToPixel), color, i === 0 ? [] : [5, 2], 2);
        });
      }
    }
    ctx.restore();
  }, [g, p.models, s, width, height, theme, experimental, displayPoints, analysisIds, scoreMap, groups]);
  const nearest = (x: number, y: number) => {
    let result: PixelPair | null = null, squared = 100;
    for (const point of displayPoints) { const d = (point.px - x) ** 2 + (point.py - y) ** 2; if (d < squared) { squared = d; result = point; } }
    return result;
  };
  const coordinates = (event: { clientX: number; clientY: number }): [number, number] => {
    const bounds = overlay.current!.getBoundingClientRect();
    return [Math.max(0, Math.min(g.width, (event.clientX - bounds.left) * width / bounds.width - left)), Math.max(0, Math.min(g.height, (event.clientY - bounds.top) * height / bounds.height - top))];
  };
  const currentExtent = (() => {
    const { x, y } = s.filters;
    if (x.min === undefined && x.max === undefined && y.min === undefined && y.max === undefined) return null;
    return [[g.sx.at(x.min ?? g.domains.x[0]), g.sy.at(y.max ?? g.domains.y[1])], [g.sx.at(x.max ?? g.domains.x[1]), g.sy.at(y.min ?? g.domains.y[0])]] as [[number, number], [number, number]];
  })();
  const extent = brush ?? currentExtent;
  const xField = fixture.fields.find(f => f.name === s.fields.x), yField = fixture.fields.find(f => f.name === s.fields.y);
  return <section className="sl-chart-card" aria-label={`${variant} scatter comparison`}>
    <header className="sl-chart-header"><div><h2>{variant}</h2><span>{s.fields.x} × {s.fields.y}</span></div><output className="sl-hover" data-hover-id={hover?.id ?? ""} aria-live="polite">{hover ? `${hover.id} · ${formatNumber(Number(hover.row[s.fields.x]))}, ${formatNumber(Number(hover.row[s.fields.y]))}${hoverScore ? ` · D² ${formatNumber(hoverScore.d2)} · D ${formatNumber(hoverScore.d)}` : ""}` : "Drag to brush · inspect rows below"}</output></header>
    {!g.enabled ? <div className="sl-empty" role="status">{g.reason}</div> : <div className="sl-chart-surface" style={{ width, height }}>
      <canvas ref={canvas} style={{ width, height }} aria-hidden="true" />
      <svg ref={overlay} width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="group" aria-label={`${variant} scatter plot. Drag a rectangle to filter; use the numeric range controls for keyboard filtering.`} aria-describedby={`${id}-description`} tabIndex={0}
        onKeyDown={e => { if (e.key === "Escape") { drag.current = null; setBrush(null); onBrush({}, {}); } }}
        onPointerDown={e => { if (e.button !== 0) return; const b = e.currentTarget.getBoundingClientRect(), x = e.clientX - b.left, y = e.clientY - b.top; if (x < left || x > left + g.width || y < top || y > top + g.height) return; drag.current = coordinates(e); setHover(null); e.currentTarget.setPointerCapture(e.pointerId); }}
        onPointerMove={e => { const point = coordinates(e); if (drag.current) setBrush([drag.current, point]); else setHover(nearest(...point)); }}
        onPointerUp={e => { const first = drag.current; if (!first) return; const last = coordinates(e); drag.current = null; setBrush(null); if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId); if (Math.hypot(last[0] - first[0], last[1] - first[1]) < 4) { if (e.altKey) { const point = nearest(...last); if (point) onInspect(point.id); } else onBrush({}, {}); return; } const xs = [g.sx.invert(first[0]), g.sx.invert(last[0])], ys = [g.sy.invert(first[1]), g.sy.invert(last[1])]; onBrush({ min: Math.min(...xs), max: Math.max(...xs) }, { min: Math.min(...ys), max: Math.max(...ys) }); }}
        onPointerCancel={() => { drag.current = null; setBrush(null); }} onLostPointerCapture={() => { drag.current = null; setBrush(null); }} onPointerLeave={() => setHover(null)}>
        <desc id={`${id}-description`}>{p.analysis.pairs.length} eligible analysis pairs. {p.analysis.excluded.length} excluded pairs. Common domains use all source rows. Press Escape to clear numeric brushing.</desc>
        <defs><clipPath id={`${id}-clip`}><rect x={left} y={top} width={g.width} height={g.height} /></clipPath></defs>
        <g className="sl-grid" pointerEvents="none">
          {g.sx.ticks(4).map((v, i) => <g key={`x${i}`}><line x1={left + g.sx.at(v)} x2={left + g.sx.at(v)} y1={top} y2={top + g.height} /><text x={left + g.sx.at(v)} y={top + g.height + 17} textAnchor={i === 0 ? "start" : i === 4 ? "end" : "middle"}>{formatNumber(v)}</text></g>)}
          {g.sy.ticks(4).map((v, i) => <g key={`y${i}`}><line x1={left} x2={left + g.width} y1={top + g.sy.at(v)} y2={top + g.sy.at(v)} /><text x={left - 7} y={top + g.sy.at(v) + 4} textAnchor="end">{formatNumber(v)}</text></g>)}
        </g>
        <g pointerEvents="none" className="sl-axis-label"><text x={left + g.width / 2} y={height - 9} textAnchor="middle">{s.fields.x} ({xField?.unit}) · {s.display.x}</text><text transform={`translate(14,${top + g.height / 2}) rotate(-90)`} textAnchor="middle">{s.fields.y} ({yField?.unit}) · {s.display.y}</text></g>
        <g pointerEvents="none" clipPath={`url(#${id}-clip)`}>
          {extent && <rect className="sl-brush" x={left + Math.min(extent[0][0], extent[1][0])} y={top + Math.min(extent[0][1], extent[1][1])} width={Math.abs(extent[1][0] - extent[0][0])} height={Math.abs(extent[1][1] - extent[0][1])} />}
          {hover && <circle cx={left + hover.px} cy={top + hover.py} r={6} fill="none" stroke="currentColor" strokeWidth={1.5} />}
        </g>
      </svg>
    </div>}
    <footer className="sl-chart-footer"><span>{p.analysis.pairs.length.toLocaleString()} analysis pairs · {p.reference.pairs.length.toLocaleString()} reference pairs</span><span>Full-source domains · {Math.round(g.width)} × {Math.round(g.height)} plot px</span></footer>
    {drawn.length > POINT_LIMIT && <p className="sl-sample-note">Points: every {Math.ceil(drawn.length / POINT_LIMIT)}th row in stable source-derived order ({displayPoints.length.toLocaleString()} of {drawn.length.toLocaleString()}). Bins, density, summaries and distances use every eligible row.</p>}
  </section>;
}
