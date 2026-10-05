import { describe, expect, it } from "vitest";
import { numericalChecks } from "./numerical-checks";
import { f2Quantile, meanThreshold } from "./statistics";
import { coverageSimulation } from "./coverageSimulation";

describe("scatter lab numerical acceptance", () => {
  // These checks use independent constants and invariants, not renderer structure.
  for (const check of numericalChecks()) it(check.name, () => expect(check.passed, `${check.detail}; error=${check.error}; tolerance=${check.tolerance}`).toBe(true));
  it("matches independent SciPy F quantiles", () => {
    const references = [
      { n: 3, a: .95, f: 199.49999999999972 },
      { n: 5, a: .95, f: 9.552094495921155 },
      { n: 30, a: .95, f: 3.340385558237759 },
      { n: 1000, a: .95, f: 3.0047426924419445 },
    ];
    for (const row of references) {
      expect(f2Quantile(row.a, row.n - 2)).toBeCloseTo(row.f, 9);
      expect(meanThreshold(row.n, row.a)).toBeCloseTo(2 * (row.n - 1) / (row.n - 2) * row.f / row.n, 10);
    }
  });
  it("has Gaussian mean coverage in a seeded secondary simulation", () => {
    const result = coverageSimulation(2000, 30, 2601003, 30);
    expect(result.unavailable).toBe(0);
    expect(Math.abs(result.meanRegionCoverage - .95)).toBeLessThan(.025);
    expect(Math.abs(result.knownGaussianDataCoverage - .95)).toBeLessThan(.01);
    // Deliberately no .95 acceptance target for fitted held-out data contours.
  });
});
