import type { Fixture, Settings, Row, Range, Prepared, Pair, PixelPair, Model, Score } from "./types";
import { category, covariance, distanceSquared, finiteNumber, prepare, fromAnalysis, toAnalysis } from "./statistics";
import { density, hexbins, paddedDomain, scale, contourSegments } from "./geometry";
import { histogram } from "./related";

export function passesRange(value: unknown, range: Range): boolean {
  if (range.min === undefined && range.max === undefined) return true;
  const n = finiteNumber(value as Row[string]);
  return n !== undefined && (range.min === undefined || n >= range.min) && (range.max === undefined || n <= range.max);
}
export function populationPlan(fixture: Fixture, settings: Settings) {
  const s = settings, { rows } = fixture;
  const fieldsPresent = [s.fields.x, s.fields.y, s.fields.group].every(name => fixture.fields.some(f => f.name === name));
  const categoricalGroup = fixture.fields.find(f => f.name === s.fields.group)?.kind === "category";
  const validFields = fieldsPresent && categoricalGroup;
  const numeric = validFields && [s.fields.x, s.fields.y].every(name => fixture.fields.find(f => f.name === name)?.kind === "numeric");
  const reason = !fieldsPresent ? "A selected field is not present in this fixture. Choose an available field." : !categoricalGroup ? "The grouping field must be categorical. Choose a categorical grouping field." : !numeric ? "Numeric layers require two numeric fields. The existing explorEDA comparison retains categorical axes and brushing." : undefined;
  const facetRows = s.facet === "all" ? rows : rows.filter(r => category(r[s.fields.group]) === s.facet);
  const contextRows = facetRows.filter(r => (s.filters.group === "all" || category(r[s.fields.group]) === s.filters.group) && (s.filters.cohort === "all" || r.cohort === s.filters.cohort));
  const selectedRows = contextRows.filter(r => passesRange(r[s.fields.x], s.filters.x) && passesRange(r[s.fields.y], s.filters.y));
  const analysisRows = s.analysisScope === "full" ? facetRows : selectedRows;
  // A full or training reference is deliberately independent of active facet and filters.
  const referenceRows = s.referenceScope === "analysis" ? analysisRows : s.referenceScope === "training" ? rows.filter(r => r.cohort === "training") : rows;
  const scoreRows = s.scoreScope === "analysis" ? analysisRows : s.scoreScope === "held-out" ? facetRows.filter(r => r.cohort === "held-out") : facetRows;
  const prep = (r: Row[]): Prepared => numeric ? prepare(r, s.fields.x, s.fields.y, s.fields.group, s.analysisSpace) : { total: r.length, pairs: [], excluded: r.map(row => ({ id: row.sourceId, reason: reason! })) };
  const all = prep(rows), context = prep(contextRows), selected = prep(selectedRows), analysis = prep(analysisRows), reference = prep(referenceRows), scoring = prep(scoreRows);
  const modelsFor = (r: Row[]): Model[] => {
    if (!numeric || !s.grouped) { const prepared = prep(r); return [{ group: "Pooled", prepared, covariance: covariance(prepared.pairs) }]; }
    const byGroup = new Map<string, Row[]>();
    for (const row of r) { const key = category(row[s.fields.group]); let members = byGroup.get(key); if (!members) { members = []; byGroup.set(key, members); } members.push(row); }
    return [...byGroup].sort(([a], [b]) => a.localeCompare(b)).map(([group, rows]) => { const prepared = prep(rows); return { group, prepared, covariance: covariance(prepared.pairs) }; });
  };
  const summaries = modelsFor(analysisRows), models = modelsFor(referenceRows);
  const modelMap = new Map(models.map(model => [model.group, model]));
  const scores: Score[] = scoring.pairs.map(pair => {
    const model = modelMap.get(s.grouped ? pair.group : "Pooled");
    const d2 = model ? distanceSquared(pair, model.covariance) : null;
    return { pair, d2, d: d2 === null ? null : Math.sqrt(d2), reason: d2 === null ? model?.covariance.reason ?? "No reference model for this group." : undefined };
  });
  const groupCounts = new Map<string, number>();
  if (categoricalGroup) for (const row of rows) { const group = category(row[s.fields.group]); groupCounts.set(group, (groupCounts.get(group) ?? 0) + 1); }
  return { validFields, numeric, reason, all, context, selected, analysis, reference, scoring, summaries, models, scores, facetRows, contextRows, selectedRows, analysisRows, referenceRows, scoreRows, groupCounts };
}
export type PopulationPlan = ReturnType<typeof populationPlan>;
export function geometryPlan(fixture: Fixture, settings: Settings, population: PopulationPlan, width: number, height: number) {
  const s = settings;
  const domains = {
    x: paddedDomain(fixture.rows.map(row => row[s.fields.x]), s.display.x),
    y: paddedDomain(fixture.rows.map(row => row[s.fields.y]), s.display.y),
  };
  const sx = scale(domains.x, [0, width], s.display.x), sy = scale(domains.y, [height, 0], s.display.y);
  const domainsFinite = domains.x.every(Number.isFinite) && domains.y.every(Number.isFinite);
  const toPixels = (pairs: Pair[]): PixelPair[] => pairs.map(pair => ({ ...pair, px: sx.at(fromAnalysis(pair.x, s.analysisSpace)), py: sy.at(fromAnalysis(pair.y, s.analysisSpace)) }));
  const enabled = population.numeric && domainsFinite;
  const all = enabled ? toPixels(population.all.pairs) : [], analysis = enabled ? toPixels(population.analysis.pairs) : [], context = enabled ? toPixels(population.context.pairs) : [], reference = enabled ? toPixels(population.reference.pairs) : [], scoring = enabled ? toPixels(population.scoring.pairs) : [];
  const bins = s.layers.hex && enabled ? hexbins(analysis, s.method.hexRadius) : [];
  const densityEnabled = enabled && (s.layers.densityFill || s.layers.densityContours);
  const grid = densityEnabled ? density(analysis, width, height, s.method.bandwidth) : null;
  // One color/threshold scale is based on full-source intensity. Filtering does not re-normalize groups to their own mass.
  const fullGrid = densityEnabled ? (population.analysisRows.length === fixture.rows.length ? grid : density(all, width, height, s.method.bandwidth)) : null;
  const densityMaximum = fullGrid?.maximum ?? 0;
  const levels = Array.from({ length: s.method.contourLevels }, (_, i) => densityMaximum * (i + 1) / (s.method.contourLevels + 1));
  const contours = s.layers.densityContours && grid ? levels.map(level => ({ level, segments: contourSegments(grid, level) })) : [];
  const fullBins = s.layers.hex && enabled ? hexbins(all, s.method.hexRadius) : [];
  const maxBin = Math.max(1, ...fullBins.map(b => b.count));
  const dataToPixel = ([x, y]: [number, number]): [number, number] => [sx.at(fromAnalysis(x, s.analysisSpace)), sy.at(fromAnalysis(y, s.analysisSpace))];
  const analysisDomains = { x: domains.x.map(v => toAnalysis(v, s.analysisSpace)) as [number, number], y: domains.y.map(v => toAnalysis(v, s.analysisSpace)) as [number, number] };
  const marginals = { x: s.layers.marginals && enabled ? histogram(population.analysis.pairs.map(p => p.x), analysisDomains.x, s.method.histogramBins) : [], y: s.layers.marginals && enabled ? histogram(population.analysis.pairs.map(p => p.y), analysisDomains.y, s.method.histogramBins) : [] };
  return { enabled, reason: population.reason ?? (!domainsFinite ? "The padded display domain exceeds finite numeric range." : undefined), domains, sx, sy, all, analysis, context, reference, scoring, bins, maxBin, grid, densityMaximum, levels, contours, dataToPixel, marginals, width, height };
}
export type GeometryPlan = ReturnType<typeof geometryPlan>;
