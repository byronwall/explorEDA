import { expect, it } from "vitest";
import { fitLinear, fitPolynomial, fitEquation } from "./regression";

const u = [-2, -1, 0, 1, 2];
const held = [-1.5, -0.5, 0.5, 1.5];
const line = (x: number) => 1.234567 + 0.234567 * x;
const ys = [0.903801, 1.034167, 1.235167, 1.503301, 1.842069];
// Residuals [1,-4,6,-4,1]/10000 are orthogonal to 1,u,u².
const quad = (x: number) => 1.234567 + 0.234567 * x + 0.034567 * x * x;
const horner = (cs: number[], x: number) =>
  cs.reduceRight((v, c) => v * x + c, 0);

it("separates exact-X linear evaluation from its reported residuals", () => {
  const xs = u.map((x) => 2 ** 30 + x * 2 ** -20);
  const actual = fitLinear(xs, u.map(line));
  expect(actual.ok).toBe(true);
  if (!actual.ok) return;
  const predictions = xs.map(actual.predict);
  const sse = predictions.reduce(
    (sum, y, i) => sum + (y - line(u[i]!)) ** 2,
    0
  );
  const centered = (x: number) => 1.234567 + actual.slope * (x - 2 ** 30);
  const heldError = Math.max(
    ...held.map((x) =>
      Math.abs(actual.predict(2 ** 30 + x * 2 ** -20) - line(x))
    )
  );
  const centeredError = Math.max(
    ...[...u, ...held].map((x) =>
      Math.abs(centered(2 ** 30 + x * 2 ** -20) - line(x))
    )
  );
  expect(predictions).toEqual([0.78125, 1, 1.25, 1.5, 1.71875]);
  expect(sse).toBeCloseTo(0.001667537335, 14);
  expect(actual.residualSe).toBe(0);
  expect(actual.r2).toBe(1);
  expect(heldError).toBeGreaterThan(0.02);
  expect(centeredError).toBeLessThan(1e-14);
  const control = fitLinear(u, u.map(line));
  expect(
    control.ok &&
      Math.max(...u.map((x) => Math.abs(control.predict(x) - line(x))))
  ).toBeLessThan(1e-14);
  console.log(
    "R001 linear",
    JSON.stringify({
      predictions,
      sse,
      directResidualSe: Math.sqrt(sse / 3),
      reportedResidualSe: actual.residualSe,
      heldError,
      centeredError,
    })
  );
});

it("keeps accurate polynomial predictions separate from expanded and formatted equations", () => {
  const translated = fitPolynomial(
    u.map((x) => 1e9 + x),
    ys,
    2
  );
  const control = fitPolynomial(u, ys, 2);
  const metres = fitPolynomial(
    u.map((x) => (1e9 + x) / 1000),
    ys,
    2
  );
  expect(translated.ok && control.ok && metres.ok).toBe(true);
  if (!translated.ok || !control.ok || !metres.ok) return;
  const probes = [...u, ...held];
  const internalError = Math.max(
    ...probes.map((x) => Math.abs(translated.predict(1e9 + x) - quad(x)))
  );
  const expandedError = Math.max(
    ...probes.map((x) =>
      Math.abs(horner(translated.coefficients, 1e9 + x) - quad(x))
    )
  );
  const equation = fitEquation(translated)!;
  // Parse this actual quadratic output, not unrounded source coefficients.
  const tokens = equation
    .replaceAll(",", "")
    .match(/^y = ([\d.e+-]+)x² − ([\d.e+-]+)x \+ ([\d.e+-]+)$/);
  expect(tokens).not.toBeNull();
  const rounded = [Number(tokens![3]), -Number(tokens![2]), Number(tokens![1])];
  const equationError = Math.max(
    ...probes.map((x) => Math.abs(horner(rounded, 1e9 + x) - quad(x)))
  );
  const sse = u.reduce(
    (sum, x, i) => sum + (ys[i]! - translated.predict(1e9 + x)) ** 2,
    0
  );
  expect(internalError).toBeLessThan(1e-14);
  expect(expandedError).toBeGreaterThan(7);
  expect(equationError).toBeGreaterThan(3e13);
  expect(sse).toBeCloseTo(7e-7, 16);
  expect(translated.residualSe! ** 2 * 2).toBeCloseTo(sse, 18);
  expect(
    Math.max(...probes.map((x) => Math.abs(control.predict(x) - quad(x))))
  ).toBeLessThan(1e-14);
  expect(
    Math.max(
      ...probes.map((x) => Math.abs(metres.predict((1e9 + x) / 1000) - quad(x)))
    )
  ).toBeLessThan(1e-6);
  console.log(
    "R001 polynomial",
    JSON.stringify({
      internalError,
      expandedError,
      equation,
      equationError,
      sse,
      heldExpected: quad(0.5),
      heldActual: translated.predict(1e9 + 0.5),
    })
  );
});

it("preserves repeated-X and minimum-row availability with invalid-input controls", () => {
  expect(
    fitPolynomial([-2, -1, 0, 1, 2, 0, 1], [-2, -1, 0, 1, 2, 0, 1].map(quad), 2)
      .ok
  ).toBe(true);
  for (let d = 2; d <= 6; d++) {
    const xs = Array.from({ length: d + 1 }, (_, i) => i - d / 2);
    const fit = fitPolynomial(xs, xs.map(quad), d);
    expect(fit.ok).toBe(true);
    if (fit.ok) {
      expect(fit.residualSe).toBeUndefined();
      expect(fit.adjustedR2).toBeUndefined();
    }
  }
  expect(fitPolynomial([0, 0, 1, 1], [1, 2, 3, 4], 2).ok).toBe(false);
  expect(
    fitPolynomial(
      [-1, 0, 1].map((x) => 2 ** 54 + x),
      [1, 2, 3],
      2
    ).ok
  ).toBe(false);
  expect(fitPolynomial([0, 1], [1, 2], 2).ok).toBe(false);
  expect(fitLinear([3, 3, 3], [1, 2, 3]).ok).toBe(false);
});
