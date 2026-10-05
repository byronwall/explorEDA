/** High-value acceptance checks shared by Vitest and the dependency-free runner.
 * Constants for the five-pair fixture come from numpy.cov(ddof=1), not this code.
 * Quantile references come from scipy.stats.f.ppf; see reference.json. */
import { covariance, prepare, distanceSquared, dataThreshold, meanThreshold, ellipseBoundary, finiteNumber, symlog, symexp } from "./statistics";
import { hexbins, density, hexCell } from "./geometry";
import { defaults, restoreSettings, exportSettings } from "./settings";
import { makeFixture } from "./fixtures";
import { populationPlan, geometryPlan } from "./plan";
import { histogram, principalAxes } from "./related";
import type { Fixture, Row } from "./types";
export interface Check { name: string; passed: boolean; error?: number; tolerance?: number; detail: string }
export function numericalChecks(): Check[] {
  const checks: Check[] = [];
  const check = (name: string, passed: boolean, detail: string, error?: number, tolerance?: number) => checks.push({ name, passed, detail, error, tolerance });
  const rows: Row[] = [
    { x: 1, y: 2, group: "A", cohort: "training" }, { x: 2, y: 1, group: "B", cohort: "training" }, { x: 4, y: 5, group: "A", cohort: "training" }, { x: 7, y: 4, group: "B", cohort: "held-out" }, { x: "8", y: "9", group: "A", cohort: "held-out" }, { x: null, y: 4, group: "A", cohort: "training" }, { x: true, y: 3, group: "B", cohort: "held-out" }, { x: Infinity, y: 4, group: "B", cohort: "held-out" },
  ].map((row, i) => ({ ...row, sourceId: `reference:${i}` }));
  const prepared = prepare(rows, "x", "y", "group"), model = covariance(prepared.pairs);
  check("paired finite eligibility", prepared.pairs.length === 5 && prepared.excluded.length === 3, "5 finite pairs, 3 exclusions; numeric strings included.");
  check("finite-number semantics", [null, undefined, "", "  ", true, false, NaN, Infinity, -Infinity, "NaN"].every(v => finiteNumber(v) === undefined) && finiteNumber(" -2.5 ") === -2.5, "Blank, boolean and nonfinite values are not measurements.");
  const covError = Math.max(...model.covariance!.flat().map((v, i) => Math.abs(v - [9.3, 7.9, 7.9, 9.7][i]!)));
  check("independent sample covariance", covError <= 1e-12 && model.mean![0] === 4.4 && model.mean![1] === 4.2, "NumPy ddof=1: mean [4.4,4.2], S=[[9.3,7.9],[7.9,9.7]].", covError, 1e-12);
  const fixture = makeFixture({ ...defaults().fixture, n: 1000 }), points = prepare(fixture.rows, "x", "y", "group").pairs, c = covariance(points);
  const affine = points.map(p => ({ ...p, x: p.x * 1000 + 17, y: p.y * .001 - 20 })), ac = covariance(affine), swapped = points.map(p => ({ ...p, x: p.y, y: p.x })), sc = covariance(swapped);
  const affineError = Math.max(...points.map((p, i) => Math.abs(distanceSquared(p, c)! - distanceSquared(affine[i]!, ac)!)));
  check("positive affine distance invariance", affineError < 1e-9, "X′=1000X+17; Y′=.001Y−20; covariance re-estimated consistently.", affineError, 1e-9);
  const swapError = Math.max(...points.map((p, i) => Math.abs(distanceSquared(p, c)! - distanceSquared(swapped[i]!, sc)!)));
  check("X/Y swap invariance", swapError < 1e-10 && sc.covariance![0][0] === c.covariance![1][1], "Swapped covariance entries preserve D².", swapError, 1e-10);
  const reversed = covariance([...points].reverse()), reorderError = Math.max(...reversed.covariance!.flat().map((v, i) => Math.abs(v - c.covariance!.flat()[i]!)));
  check("statistical row-order stability", reorderError < 1e-10, "Reverse all source rows; moments remain within tolerance.", reorderError, 1e-10);
  for (const [name, q] of [["fitted data", dataThreshold(.95)], ["Hotelling mean", meanThreshold(points.length, .95)!]] as const) {
    const error = Math.max(...ellipseBoundary(c, q).map(([x, y]) => Math.abs(distanceSquared({ x, y }, c)! - q)));
    check(`${name} boundary equation`, error < 1e-10, "180 sampled vertices satisfy the stated reference quadratic form.", error, 1e-10);
  }
  check("distinct ellipse thresholds", Math.abs(dataThreshold(.95) - 5.99146454710798) < 1e-12 && meanThreshold(1000, .95)! < meanThreshold(30, .95)! && meanThreshold(2, .95) === null, "Data threshold stays fixed; mean-region threshold shrinks with n; n≤2 is unavailable.");
  const pixels = points.map((p, i) => ({ ...p, px: 20 + i * 43 % 480, py: 10 + i * 67 % 280 }));
  for (const radius of [5, 14, 50]) {
    const bins = hexbins(pixels, radius), reverseBins = hexbins([...pixels].reverse(), radius);
    const memberships = (b: typeof bins) => JSON.stringify(b.map(v => [v.key, [...v.ids].sort()]));
    check(`exact hex partition r=${radius}`, bins.reduce((sum, b) => sum + b.count, 0) === pixels.length && new Set(bins.flatMap(b => b.ids)).size === pixels.length && bins.every(b => b.ids.length === b.count) && memberships(bins) === memberships(reverseBins), "Every eligible ID occurs in exactly one inspected bin, including after row reversal.");
  }
  const cell = hexCell(0, 0, 14), right = hexCell(14 * Math.sqrt(3), 0, 14);
  const boundary = 14 * Math.sqrt(3) / 2;
  check("hex grid reference centers and boundary assignment", cell.q === 0 && cell.r === 0 && right.q === 1 && right.r === 0 && hexCell(boundary, 0, 14).q === 0 && hexCell(boundary + 1e-8, 0, 14).q === 1 && hexCell(boundary - 1e-8, 0, 14).q === 0, "Analytic centers; exact midpoint chooses smaller q; points on either side choose their nearest center.");
  const a = density(pixels, 520, 320, 20), b = density(pixels, 520, 320, 40), integralError = Math.abs(a.integral - pixels.length);
  check("finite nonnegative density", a.values.every(v => Number.isFinite(v) && v >= 0) && b.maximum < a.maximum, "Doubling bandwidth lowers the peak on this deterministic fixture.");
  check("count-intensity normalization", integralError < 1e-8, "Padded-grid intensity integrates to n, not one; no probability-density mode.", integralError, 1e-8);
  const single = density([{ px: 100, py: 100 }], 200, 200, 20), truePeak = 1 / (2 * Math.PI * 20 ** 2), peakError = Math.abs(single.maximum - truePeak) / truePeak;
  check("independent Gaussian peak", peakError < 2e-4, "One grid-aligned point: compare with 1/(2πh²). Discrete ±4h truncation tolerance.", peakError, 2e-4);
  for (const id of ["tiny", "identical", "zero-variance", "collinear", "near-collinear"] as const) {
    const pp = prepare(makeFixture({ ...defaults().fixture, id, n: 20 }).rows, "x", "y", "group"), cc = covariance(pp.pairs);
    check(`unavailable ${id}`, !cc.available && !!cc.reason && ellipseBoundary(cc, 5.99).length === 0 && distanceSquared(pp.pairs[0]!, cc) === null, "Explicit data reason; no fabricated inverse, ridge or NaN geometry.");
  }
  const referenceFixture: Fixture = { ...fixture, rows }, s = defaults();
  s.filters = { x: { min: 2, max: 7 }, y: {}, group: "A", cohort: "all" }; s.referenceScope = "training"; s.scoreScope = "full";
  const p = populationPlan(referenceFixture, s), g = geometryPlan(referenceFixture, s, p, 520, 320);
  check("filter / fit / scoring counts", p.analysis.pairs.length === 1 && p.analysis.pairs[0]!.id === "reference:2" && p.reference.pairs.length === 3 && p.reference.excluded.length === 1 && p.scoring.pairs.length === 5, "Own X brush intersects external group filter. Training reference remains fixed; full facet scores five finite pairs.");
  const faceted = populationPlan(referenceFixture, { ...s, facet: "A", analysisScope: "full", scoreScope: "held-out" });
  check("facet / group populations", faceted.analysis.pairs.length === 3 && faceted.analysis.excluded.length === 1 && faceted.reference.pairs.length === 3 && faceted.scoring.pairs.length === 1, "Full active facet ignores filters; training reference is source-wide; held-out scoring stays inside the facet.");
  const fullS = defaults(), full = populationPlan(referenceFixture, fullS), fullG = geometryPlan(referenceFixture, fullS, full, 520, 320);
  check("common source domains", JSON.stringify(g.domains) === JSON.stringify(fullG.domains), "Filters do not recompute numeric domains.");
  const cat = populationPlan(referenceFixture, { ...s, fields: { ...s.fields, x: "group" } }), invalid = populationPlan(referenceFixture, { ...s, fields: { ...s.fields, x: "absent" } });
  const badGroup = populationPlan(referenceFixture, { ...s, grouped: true, fields: { ...s.fields, group: "x" } });
  check("categorical / invalid guards", !cat.numeric && !!cat.reason && !invalid.validFields && !!invalid.reason && !badGroup.validFields && badGroup.models.length === 1 && badGroup.groupCounts.size === 0, "Statistics never consume category positions, absent fields, or a numeric grouping field; invalid JSON cannot create one group per numeric value.");
  const histogramCount = histogram(prepared.pairs.map(p => p.x), [0, 8], 4).reduce((sum, bin) => sum + bin.count, 0);
  check("paired marginal counts", histogramCount === 5, "Upper endpoint is included; invalid X/Y pairs were excluded before marginal counting.");
  const axes = principalAxes(model)!, eigenError = Math.max(Math.abs(axes.values[0] - 17.40253124005214), Math.abs(axes.values[1] - 1.59746875994786));
  check("independent principal variances", eigenError < 1e-10, "NumPy eigvalsh on the hand-sized sample covariance.", eigenError, 1e-10);
  const nonlinearError = Math.max(...ellipseBoundary(c, dataThreshold(.95)).flatMap(point => point.map(v => Math.abs(symexp(symlog(v)) - v))));
  check("symlog vertex round trip", nonlinearError < 1e-10, "Each data-space boundary vertex is transformed separately; no untransformed SVG ellipse.", nonlinearError, 1e-10);
  const configuration = { ...defaults("contamination"), grouped: true, facet: "A" };
  check("settings round trip", JSON.stringify(restoreSettings(exportSettings(configuration))) === JSON.stringify(configuration), "Fixture ID, seed, parameters, fields, scopes, transforms and method controls survive JSON.");
  let rejected = 0;
  for (const invalid of [{ ...configuration, version: 99 }, { ...configuration, fixture: { ...configuration.fixture, n: 1e9 } }, { ...configuration, method: { ...configuration.method, bandwidth: -1 } }]) { try { restoreSettings(JSON.stringify(invalid)); } catch { ++rejected; } }
  check("invalid settings rejection", rejected === 3, "Unknown versions and out-of-range computational parameters fail before rendering.");
  return checks;
}
