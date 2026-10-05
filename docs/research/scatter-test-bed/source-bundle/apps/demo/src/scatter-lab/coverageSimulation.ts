import { normalGenerator } from "./fixtures";
import { covariance, dataThreshold, distanceSquared, meanThreshold } from "./statistics";
/** Secondary validation, not an application dependency. All fits use the same
 * shipped numerical functions. Held-out fractions are averaged by replicate;
 * their MC error does not pretend observations sharing a fit are independent. */
export function coverageSimulation(repetitions = 3000, n = 30, seed = 2601003, heldOutPerSample = 100) {
  const normal = normalGenerator(seed), rho = .65, residual = Math.sqrt(1 - rho * rho);
  let meanCovered = 0, knownCovered = 0, inSample = 0, unavailable = 0;
  const fittedFractions: number[] = [], q = dataThreshold(.95), meanQ = meanThreshold(n, .95)!;
  for (let r = 0; r < repetitions; ++r) {
    const sample = Array.from({ length: n }, () => { const u = normal(), v = normal(); return { x: 10 + 2 * u, y: 20 + 6 * (rho * u + residual * v) }; });
    const c = covariance(sample);
    if (!c.available) { ++unavailable; continue; }
    if (distanceSquared({ x: 10, y: 20 }, c)! <= meanQ) ++meanCovered;
    inSample += sample.filter(p => distanceSquared(p, c)! <= q).length;
    let covered = 0;
    for (let k = 0; k < heldOutPerSample; ++k) {
      const u = normal(), v = normal(), point = { x: 10 + 2 * u, y: 20 + 6 * (rho * u + residual * v) };
      if (u * u + v * v <= q) ++knownCovered;
      if (distanceSquared(point, c)! <= q) ++covered;
    }
    fittedFractions.push(covered / heldOutPerSample);
  }
  const valid = repetitions - unavailable, fittedCoverage = fittedFractions.reduce((sum, v) => sum + v, 0) / valid;
  const fittedVariance = fittedFractions.reduce((sum, v) => sum + (v - fittedCoverage) ** 2, 0) / (valid - 1);
  return { seed, repetitions, n, heldOutPerSample, unavailable, meanRegionCoverage: meanCovered / valid, meanRegionMCSE: Math.sqrt(.95 * .05 / valid), knownGaussianDataCoverage: knownCovered / (valid * heldOutPerSample), fittedHeldOutDataCoverage: fittedCoverage, fittedCoverageMCSE: Math.sqrt(fittedVariance / valid), fittedInSampleDataFraction: inSample / (valid * n), interpretation: "Mean-region and known-Gaussian coverage target .95. A fitted data ellipse is not an exact finite-sample predictive region; held-out fitted coverage is reported without treating .95 as an exact target." };
}
