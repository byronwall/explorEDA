# R001 — Agreement between fitted predictions and reusable equations

**Decision:** retain the standardized polynomial Householder QR solver; propose a narrow linear evaluation and residual-metric repair; preserve the stable basis for reusable equations; make compact labels and trace precision honest. Do not reject valid curves because their expanded coefficients or rounded equations fail.

- **Repository:** https://github.com/byronwall/explorEDA
- **Exact implementation baseline:** `63dfa75851ef57bb3782e6d7c1ef104784cd4064`.
- **Research date:** October 22, 2026, America/Indianapolis. Execution records retain UTC timestamps for reproducibility.
- **Access:** **GO through the authorized selected packet.** All 27 supplied sections reproduce their recorded SHA256. The packet contains 20 complete baseline files, two selected JSON projections, three excerpts, and two explicitly local additions. It is not a runnable checkout. Exact-ref GitHub access failed; the permitted packet fallback supplied the required source.
- **Work performed:** source review, current primary-source research, one frozen 26-case numerical comparison, independent arithmetic review, and these research artifacts. **No application changes, dependency installation, Git operations, commit, or PR.**
- **Decision scope:** GO for the bounded repair/representation **proposals**, subject to Codex/Byron review and the named integration gates. This report does not approve shipment or claim an implemented repair.

## 1. What the evidence earns

The strongest result is a separation of failure mechanisms. Most internal predictions remain accurate even when the corresponding equation cannot be reused. One linear case additionally exposes a real prediction error, so a display-only response would leave a material problem unresolved.

| Executed representation | Cases within the task budget | Meaning |
| --- | --- | --- |
| Baseline internal `predict` | **21 / 22 available fits** | One exactly representable large-timestamp line fails; all 19 included polynomial predictions pass. |
| Returned full expanded coefficients, binary64 Horner evaluation | **15 / 22** | Additional printed digits cannot undo loss introduced by basis conversion or cancellation. |
| Actual `fitEquation` text, parsed and evaluated | **3 / 22** | The compact label is not a generally reusable numerical equation. |
| Actual six-significant-digit trace coefficients | **12 / 22** | The trace is a separate rounded representation, not a full-precision escape hatch. |
| Stable basis with six-digit coefficients; origin/scale retained at 17 digits | **21 / 22** | A +1000 V response offset still defeats fixed six-digit coefficients. |
| Stable basis with 17-digit coefficient/origin/scale serialization | **22 / 22** | A small numerical representation candidate passes the specified probes. UI/copy behavior is unrun. |

All **26 availability outcomes** match the frozen expectations: 22 available fits and four appropriate unavailable outcomes. These are deliberately selected diagnostic cases, not prevalence estimates. The comparison does not establish how often users encounter the issue.

The smallest justified response has four parts:

1. **Keep polynomial fitting.** Its standardized solve and predictor pass the selected independent references. No solver rewrite is earned. [RC01]
2. **Repair linear evaluation and align its residual metrics with that evaluation.** Use the centered form already supported by the computed mean and slope, then compute residual metrics from the same returned predictor. The prediction candidate was executed; a revised production metric loop was not implemented. [RC02]
3. **Preserve the stable polynomial basis for numerical reuse.** State the origin, scale, coefficient order, and field units together. Retain enough digits to reproduce the stored components. Keep any original-coordinate coefficients as a qualified secondary representation if compatibility requires them. [RC03]
4. **Keep compact trend labels useful and identify their approximation role.** Where the expanded summary is grossly wrong, use a sound centered summary or a representation-specific fallback while keeping the valid curve. Adding `≈` alone does not address the demonstrated catastrophic case. No new permanent precision control is needed for this proposal. [RC04]

## 2. Evidence classes and source coverage

This report distinguishes five classes of claims:

- **Observed source:** what the supplied exact-baseline functions and call sites do. These claims are not browser evidence.
- **External fact:** current NIST and official NumPy material retrieved October 22, 2026, with direct URLs below and in the source ledger.
- **Executed check:** actual Node/Python calculations against the frozen fixtures and independent references.
- **Inference:** the engineering and product judgment drawn from those observations.
- **Proposed/unrun check:** work for a runnable checkout or an implementation review, never counted as a present pass.

For source locations, `SP/` denotes `packages/explorEDA/src/components/charts/ScatterPlot/` at the exact baseline above.

| Exact source location | Observed behavior | Implication to test |
| --- | --- | --- |
| `SP/regression.ts:89–140`, `fitLinear` | Means and centered sums determine the slope, but the returned function evaluates `intercept + slope*x`. SSE uses `max(0, syy − slope*sxy)`. | Centering the solve does not preserve centered evaluation; independently recompute residuals from the returned predictions. |
| `SP/regression.ts:155–197,203–277`, `solveLeastSquares`, `fitPolynomial` | X is standardized; Householder QR solves that design; prediction uses Horner in the standardized coordinate. The pivot cutoff is relative to the largest diagonal. | Keep prediction quality separate from the original-X expansion. The cutoff is not a condition-number estimate. |
| `SP/regression.ts:248–254,443–490` | Returned coefficients are expanded into original-X powers; `fitEquation` formats that expansion. | Conversion, evaluation, and text rounding can each introduce disagreement. |
| `SP/FitTraceBody.tsx:39–41,72–103,135–153` | Trace coefficients use `String(Number(value.toPrecision(6)))`; its equation still uses `fitEquation`. | Trace coefficient precision needs a separate reconstruction check. The comment claiming reproducibility is not a numerical guarantee. |
| `SP/fitPlan.ts:296–342,345–363` | Marks sample `outcome.predict` over its observed X range; fit summaries use the expanded equation. | The planned curve and displayed equation do not share the same evaluation representation. Rendering was not executed. |
| `SP/FitLabels.tsx:55–100,109,137–140` | Label placement/truncation changes with available space; compact labels retain equation text. | Long precise equations require real layout/keyboard checks before adoption. |
| `SP/fitPlan.ts:66–88,116–163,203–240`; `SP/useScatterFits.ts:16–42,56–67` | Fit inputs exclude this chart's own brush; plans are cached and other filters can change the population. | Preserve this existing contract; no filter-scope redesign belongs in R001. |
| `SP/definition.ts:11–23`; `SP/regression.test.ts:30–35,229–263` | The supported UI degree range is 2–6. The existing offset test checks slope/R², while polynomial tests cover ordinary exact/noisy examples. | Existing tests are useful source evidence but do not certify prediction or text agreement at arbitrary engineering scales. They were not run here. |

The reading route also covered `AGENTS.md`, `docs/agent-guide.md`, `CODING_STANDARDS.md`, `docs/ui-defaults.md`, both supplied package manifests, `README.md`, the complete R001 brief, catalogue and selected review records, both related intent briefs, `/docs/scatter`, and the regression demo/live-example excerpts. Exact hashes and excerpt offsets are in the standalone source report.

Omitted source includes the full chart/rendering dependency graph, parsing implementation, package entry modules, complete demo registry, export, and persistence code. Their omission does not establish absent capability. Module-level exports do not prove that regression helpers are part of the public package API. The supplied queue's PR status statements remain attributed context; no live PR survey was substituted for this mission. Mosaic, axes, other catalogue missions, LOESS numerics, inference bands, new regressors, and model selection remain outside scope.

## 3. Frozen method and independent references

### Inputs were fixed before the comparison

The fixtures and exact expected values were frozen at **2026-10-22 13:07:47.415769 UTC**. The main source comparison ran at **13:08:53.125 UTC**. This local chronology is recorded, not independently time-attested.

```text
frozen-fixtures.json SHA256
977a61ee606ed9dc0c98fd00fbc406bffe31fe9db02e8e3bd817500a9e9a2c75

executed-results.json SHA256
39382428325ba96a186e427171ba7ef3633328f523abf5d6ab5d67711305329c

analysis-results.json SHA256
ed639bbd251755362c6f179d25c3a8777224d23c2da9e6ac64246f717639e085
```

The proof report embeds the frozen data, observed result payloads, complete runnable research scripts, and normalized NIST numerical transcript. Intermediate JSON files are embedded in that Markdown so the ZIP can contain exactly the four required reports and manifest.

Two independent reference targets are retained for every fit:

1. **Intended-input reference:** exact decimal/rational fixture values, before conversion to binary64.
2. **Stored-input reference:** the exact rational values of the binary64 inputs the JavaScript function receives, including the actual held-out query values.

Python `Fraction` solves exact normal equations after an exact affine change of coordinates. Using normal equations in exact rational arithmetic introduces no floating-point conditioning loss and does not duplicate the tested Householder implementation. Decimal square roots are used only after exact residual/covariance calculations. All evaluated errors are response-space absolute errors; coefficient relative errors are never the sole gate, particularly for near-zero coefficients.

The independent audit used different closed forms for the symmetric linear/quadratic fixtures and Cramer's rule on raw-coordinate moments for Pontius. It reproduced the decisive source outputs with separately typed literal arrays. This limits the risk that the input generator, a shared solver, or one transcription created the result.

### What was actually executed

- **E01:** Extract and SHA256-verify all 27 packet sections; preserve the exact baseline regression and trace bytes.
- **E02:** Retrieve current primary NIST/NumPy sources; verify all 40 Pontius row token pairs against a second official web retrieval; freeze inputs and exact references.
- **E03:** Import the unmodified extracted `regression.ts` in **Node 24.19.0** and run all 26 cases. No application build or dependency graph was needed for this standalone pure module.
- **E04:** Run the actual `fitEquation` formatter, parse its emitted strings, and evaluate the resulting equations. Run the actual source-defined trace coefficient formatter. Five explicit parser controls cover signs, superscripts, separators, exponents, omitted unit multipliers, and exact-zero suppression.
- **E05:** Evaluate full expanded coefficients both with exact arithmetic on their binary64 values and with binary64 Horner and ordinary power sums. Evaluate the stable-basis serialization candidates. The polynomial basis was exposed through metadata-only instrumentation in a separate in-memory copy; assertions required identical coefficients, predictions, and metrics to the original module at every specified point.
- **E06:** Independently sum squared residuals from returned predictions; compare R², residual standard error, and adjusted R² where defined. Independently audit C03/C06, all 13 Pontius certified statistics, and the degree/sample-limit outcomes.

The numeric candidate uses the existing basis. It is not an application patch or a UI prototype. Polynomial `centered17` reproduces the tested original predictor; linear `centered17` changes evaluation to the proposed centered form using the existing means and slope. The metrics of that alternative were computed independently, not through a revised production `fitLinear` implementation.

### Reference case

[NIST Pontius](https://www.itl.nist.gov/div898/strd/lls/data/LINKS/DATA/Pontius.dat) contains 40 observed load/deflection pairs and a quadratic reference. Its original measurement-unit names are unspecified; this report does not invent them. The [certification method](https://www.itl.nist.gov/div898/strd/lls/data/LINKS/c-Pontius.shtml), Methodology section, describes 500-digit computations rounded to 15 significant digits. The raw numerical tokens and certification values are preserved, with retrieval date and a transcription hash in the proof and source reports. Original HTTP bytes could not be downloaded; the official web text was available.

The independent exact oracle reproduces all 13 checked certificate statistics at the published precision. This validates the reference, not 15-digit agreement by explorEDA and not certification of this library. NIST's [testing guidance](https://www.itl.nist.gov/div898/strd/general/howto.html), item 5, does not supply a universal acceptable error threshold.

## 4. Tolerance and pass/fail rules

The synthetic measurement contract assumes **1 mV numerical reuse accuracy**: `T_meas=0.001 V`, or `1 mV` after changing the response unit. This is an explicit plausible calibration task, not customer evidence or a universal product default. The noisy quadratic residuals are ±0.1, −0.4, and +0.6 mV; therefore copying an equation with several millivolts of additional error is materially relevant to this task.

For Pontius, `T_meas=0.000005` source deflection units is a **fidelity budget of half the last supplied response decimal place**. It is neither an instrument accuracy assertion nor a NIST acceptance standard.

Let `V = max(y) − min(y)` be the response variation; `M` the maximum absolute stored response or exact in-range reference prediction; and `ε=2^-52`. The predeclared diagnostic budget is:

```text
T_num = 128 ε M + 10^-12 V
T_material = T_meas + T_num
```

`T_num` is a frozen diagnostic budget, not a universal forward-error theorem. It permits ordinary arithmetic-scale roundoff without using the enormous cancelling expanded terms to excuse bad answers. If `T_num > T_meas/10`, the case must separately report an output-resolution limit instead of silently weakening the task. No available case triggered that condition. Intended-versus-stored reference differences are reported separately; collapsed X values are a distinct input-representation outcome.

For every representation, the maximum error is computed against the **stored-input exact reference**, separately on training rows and held-out in-range points. Their maximum determines the material P/F result. Extrapolation probes are recorded separately and never used to claim in-range acceptance or reject a valid curve.

A visual reading heuristic uses `max(T_meas, 0.005 V)+T_num`, representing half a percent of response variation. It is not a measured pixel or perception threshold. Under it, eight of 22 actual label equations pass, compared with three under the reuse budget. An accurate plotted trend can remain useful when a compact equation is too rounded for a calculation. Conversely, an equation wrong by trillions of response units is not a useful approximation even for coarse reading.

For residual consistency, independently calculate `SSE_direct=Σ(y_i−predict(x_i))²` in exact rational arithmetic on stored values. Compare with the SSE implied by the returned residual standard error, when residual degrees of freedom are positive. The material consistency envelope is:

```text
|ΔSSE| <= 2 T_material Σ|residual_i| + n T_material²
```

This is the algebraic change envelope for per-row prediction perturbations bounded by the task budget. Tiny relative SSE discrepancies on nearly exact fits do not constitute a defect. R² subtraction is not used to reconstruct tiny SSE. At `n=degree+1`, residual standard error and adjusted R² are correctly undefined.

## 5. Complete bounded case results

All errors below are in the row's response units. P/F means pass/fail against `T_material`; availability status has its own expected outcome. Numbers are rounded for reporting only. Full exact references and observed values are embedded in the proof report.

### Inputs, expected outcomes, and budgets

`u` denotes the local fixture coordinate. C03 is a separately interpreted timestamp fixture with the same synthetic response pattern; it does not assert that millimetres can be physically converted to seconds. C13 is an input-distinguishability diagnostic, not a representative instrument or overflow workload.

| Case | Input, units, n and degree | Expected/baseline availability; material budget |
| --- | --- | --- |
| C01 | Linear ordinary; X [-2, 2] mm from local origin; Y V; n=5, d=1 | available / available; 0.001 |
| C02 | Linear translated; X [999999998, 1000000002] mm in translated coordinate; Y V; n=5, d=1 | available / available; 0.001 |
| C03 | Linear representable tiny range; X [1073741823.9999980926513671875, 1073741824.0000019073486328125] s from epoch; sampling interval 2^-20 s; Y V; n=5, d=1 | available / available; 0.001 |
| C04 | Quadratic simple control; X [-2, 2] mm from local origin; Y V; n=5, d=2 | available / available; 0.001 |
| C05 | Quadratic noisy measurement; X [-2, 2] mm from local origin; Y V; n=5, d=2 | available / available; 0.001 |
| C06 | Quadratic translated; X [999999998, 1000000002] mm in translated coordinate; Y V; n=5, d=2 | available / available; 0.001 |
| C07 | Quadratic X unit change; X [-0.002, 0.002] m from local origin; Y V; n=5, d=2 | available / available; 0.001 |
| C08 | Quadratic translate and X units; X [999999.998, 1000000.002] m in translated coordinate; Y V; n=5, d=2 | available / available; 0.001 |
| C09 | Quadratic Y unit change; X [-2, 2] mm from local origin; Y mV; n=5, d=2 | available / available; 1 |
| C10 | Quadratic Y offset; X [-2, 2] mm from local origin; Y V with +1000 reference shift; n=5, d=2 | available / available; 0.001 |
| C11 | Quadratic repeated X; X [-2, 2] mm from local origin; Y V; n=7, d=2 | available / available; 0.001 |
| C12 | Too few distinct X; X [0, 1] mm from local origin; Y V; n=4, d=2 | unavailable / unavailable; 0.001 |
| C13 | Lost distinguishability; X [18014398509481983, 18014398509481985] diagnostic offset units; Y V; n=3, d=2 | unavailable / unavailable; 0.001 |
| C14 | Constant linear X; X [3, 3] mm from local origin; Y V; n=3, d=1 | unavailable / unavailable; 0.001 |
| C15 | Too few polynomial rows; X [0, 1] mm from local origin; Y V; n=2, d=2 | unavailable / unavailable; 0.001 |
| C16 | Degree 2 one residual df; X [-1.5, 1.5] mm from local origin; Y V; n=4, d=2 | available / available; 0.001 |
| C17 | Degree 3 one residual df; X [-2, 2] mm from local origin; Y V; n=5, d=3 | available / available; 0.001 |
| C18 | Degree 4 one residual df; X [-2.5, 2.5] mm from local origin; Y V; n=6, d=4 | available / available; 0.001 |
| C19 | Degree 5 one residual df; X [-3, 3] mm from local origin; Y V; n=7, d=5 | available / available; 0.001 |
| C20 | Degree 6 one residual df; X [-3.5, 3.5] mm from local origin; Y V; n=8, d=6 | available / available; 0.001 |
| C21 | Degree 2 interpolation offset; X [999999, 1000001] mm with 1000000 offset; Y V; n=3, d=2 | available / available; 0.001 |
| C22 | Degree 3 interpolation offset; X [999998.5, 1000001.5] mm with 1000000 offset; Y V; n=4, d=3 | available / available; 0.001 |
| C23 | Degree 4 interpolation offset; X [999998, 1000002] mm with 1000000 offset; Y V; n=5, d=4 | available / available; 0.001 |
| C24 | Degree 5 interpolation offset; X [999997.5, 1000002.5] mm with 1000000 offset; Y V; n=6, d=5 | available / available; 0.001 |
| C25 | Degree 6 interpolation offset; X [999997, 1000003] mm with 1000000 offset; Y V; n=7, d=6 | available / available; 0.001 |
| C26 | NIST Pontius; X [150000, 3000000] NIST source load units (unspecified); Y NIST source deflection units (unspecified); n=40, d=2 | available / available; 5e-06 |

The four unavailable outcomes are correct: C12 has only two distinct X values for degree 2; C13's three intended coordinates become one stored binary64 coordinate; C14 has constant X for a line; C15 has only two rows for a quadratic. C21–C25 fit at the minimum row count while leaving residual standard error and adjusted R² undefined.

### Internal prediction and full expanded reconstruction

The first error pair is **fitted / held-out**. The second is **exact arithmetic on returned binary64 coefficients / binary64 Horner**, each over all in-range probes. This separates conversion loss from subsequent evaluation cancellation. P/F refers to each representation's aggregate in-range error.

| Case | Internal fitted / held error; result | Expanded exact / Horner error; respective results |
| --- | --- | --- |
| C01 | 0 / 1.11022e-16; P | 0 (P) / 1.11022e-16 (P) |
| C02 | 2.68784e-08 / 2.30827e-08; P | 1.36644e-08 (P) / 2.68784e-08 (P) |
| C03 | 0.030866 / 0.0235335; F | 0.015433 (F) / 0.030866 (F) |
| C04 | 2.22045e-16 / 0; P | 1.80411e-16 (P) / 2.22045e-16 (P) |
| C05 | 4.34573e-16 / 3.4972e-16; P | 3.51306e-16 (P) / 3.4972e-16 (P) |
| C06 | 4.34573e-16 / 3.4972e-16; P | 4.61781 (F) / 7.0963 (F) |
| C07 | 3.45755e-16 / 3.4972e-16; P | 3.24079e-16 (P) / 4.34573e-16 (P) |
| C08 | 4.62058e-16 / 3.22683e-16; P | 4.82704 (F) / 5.5037 (F) |
| C09 | 2.37118e-13 / 1.97328e-13; P | 2.93962e-13 (P) / 2.37118e-13 (P) |
| C10 | 9.41977e-14 / 9.66338e-14; P | 8.10386e-14 (P) / 9.66338e-14 (P) |
| C11 | 2.27408e-16 / 1.74579e-16; P | 2.15072e-16 (P) / 2.27408e-16 (P) |
| C16 | 2.22045e-16 / 2.22045e-16; P | 2.60209e-16 (P) / 2.22045e-16 (P) |
| C17 | 4.44089e-16 / 4.44089e-16; P | 5.55112e-16 (P) / 4.44089e-16 (P) |
| C18 | 8.88178e-16 / 4.44089e-16; P | 7.09936e-16 (P) / 4.44089e-16 (P) |
| C19 | 8.88178e-16 / 8.88178e-16; P | 1.30104e-15 (P) / 8.88178e-16 (P) |
| C20 | 7.10543e-15 / 5.32907e-15; P | 5.63473e-15 (P) / 1.42109e-14 (P) |
| C21 | 2.22045e-16 / 2.22045e-16; P | 7.48204e-06 (P) / 7.62939e-06 (P) |
| C22 | 2.22045e-16 / 0; P | 2.8205 (F) / 7.15234 (F) |
| C23 | 4.44089e-16 / 4.44089e-16; P | 3.20424e+06 (F) / 4.1943e+06 (F) |
| C24 | 5.55112e-16 / 5.55112e-16; P | 2.08187e+13 (F) / 2.19902e+13 (F) |
| C25 | 1.77636e-15 / 8.88178e-16; P | 6.21925e+18 (F) / 1.09528e+19 (F) |
| C26 | 5.93206e-16 / 4.42892e-16; P | 6.54889e-16 (P) / 6.60168e-16 (P) |

Binary64 power-sum evaluation has the same 15/22 material-pass count as Horner, though individual errors differ. No conclusion depends on choosing the more favorable evaluator. Exact coefficient reconstruction already fails the decisive translated quadratic, so this is not solely a problem of how a downstream calculator orders operations.

### Actual equation and trace strings

Each pair below is **exact decimal interpretation of emitted coefficient text / binary64 Horner of that text**. Both use the actual rounded values, not unrounded coefficients. The equation parser handles Unicode minus and superscripts, en-US grouping, exponent signs, zero suppression, and a multiplier that rounds to one being omitted.

| Case | Actual `fitEquation` text error; exact / binary64 | Actual trace coefficient error; exact / binary64 |
| --- | --- | --- |
| C01 | 0.005433 (F) / 0.005433 (F) | 3e-06 (P) / 3e-06 (P) |
| C02 | 433000 (F) / 433000 (F) | 1.23457 (F) / 1.23457 (F) |
| C03 | 3.50675e+08 (F) / 3.50675e+08 (F) | 3.87227e+08 (F) / 3.87227e+08 (F) |
| C04 | 0.0002 (P) / 0.0002 (P) | 0 (P) / 0 (P) |
| C05 | 0.005301 (F) / 0.005301 (F) | 3e-06 (P) / 3e-06 (P) |
| C06 | 3.29998e+13 (F) / 3.29998e+13 (F) | 1.7037 (F) / 5.84197 (F) |
| C07 | 0.005433 (F) / 0.005433 (F) | 3e-06 (P) / 3e-06 (P) |
| C08 | 1.3089e+09 (F) / 1.3089e+09 (F) | 1.7037 (F) / 4.9037 (F) |
| C09 | 1.431 (F) / 1.431 (F) | 0.003 (P) / 0.003 (P) |
| C10 | 0.235301 (F) / 0.235301 (F) | 0.004567 (F) / 0.004567 (F) |
| C11 | 0.005301 (F) / 0.005301 (F) | 3e-06 (P) / 3e-06 (P) |
| C16 | 0 (P) / 0 (P) | 0 (P) / 0 (P) |
| C17 | 0.0004 (P) / 0.0004 (P) | 0 (P) / 0 (P) |
| C18 | 0.00175781 (F) / 0.00175781 (F) | 0 (P) / 0 (P) |
| C19 | 0.0027675 (F) / 0.0027675 (F) | 0 (P) / 0 (P) |
| C20 | 0.00397264 (F) / 0.00397264 (F) | 0 (P) / 0 (P) |
| C21 | 125000 (F) / 125000 (F) | 99999.1 (F) / 99999.1 (F) |
| C22 | 4.99377e+13 (F) / 4.99377e+13 (F) | 1e+11 (F) / 1e+11 (F) |
| C23 | 2.49689e+19 (F) / 2.49689e+19 (F) | 2e+11 (F) / 2.00003e+11 (F) |
| C24 | 2.98441e+24 (F) / 2.98441e+24 (F) | 8.00005e+22 (F) / 8.00005e+22 (F) |
| C25 | 3.25787e+30 (F) / 3.25787e+30 (F) | 1e+28 (F) / 1e+28 (F) |
| C26 | 0.000169679 (F) / 0.000169679 (F) | 4.92571e-07 (P) / 4.92571e-07 (P) |

### Executed bounded alternatives

Expanded17 preserves every returned coefficient's binary64 value, so it has the same results as full expanded Horner. Centered6 rounds **only coefficients** to six significant digits and preserves origin/scale at 17; Centered17 preserves all components. Both evaluate the explicit affine variable before Horner. These are numeric prototypes, not rendered equation or clipboard tests.

| Case | Expanded17 error; result | Centered6 / Centered17 error; respective results |
| --- | --- | --- |
| C01 | 1.11022e-16 (P) | 3e-06 (P) / 1.11022e-16 (P) |
| C02 | 2.68784e-08 (P) | 3e-06 (P) / 1.11022e-16 (P) |
| C03 | 0.030866 (F) | 3.62292e-06 (P) / 1.11022e-16 (P) |
| C04 | 2.22045e-16 (P) | 5.52382e-07 (P) / 2.22045e-16 (P) |
| C05 | 3.4972e-16 (P) | 3.23662e-06 (P) / 4.34573e-16 (P) |
| C06 | 7.0963 (F) | 3.23662e-06 (P) / 4.34573e-16 (P) |
| C07 | 4.34573e-16 (P) | 3.23662e-06 (P) / 3.4972e-16 (P) |
| C08 | 5.5037 (F) | 3.23387e-06 (P) / 4.62058e-16 (P) |
| C09 | 2.37118e-13 (P) | 0.00323662 (P) / 2.37118e-13 (P) |
| C10 | 9.66338e-14 (P) | 0.00456724 (F) / 9.66338e-14 (P) |
| C11 | 2.27408e-16 (P) | 3.05241e-06 (P) / 2.27408e-16 (P) |
| C16 | 2.22045e-16 (P) | 3.33523e-07 (P) / 2.22045e-16 (P) |
| C17 | 4.44089e-16 (P) | 2.96146e-07 (P) / 4.44089e-16 (P) |
| C18 | 4.44089e-16 (P) | 1.34185e-06 (P) / 8.88178e-16 (P) |
| C19 | 8.88178e-16 (P) | 0 (P) / 8.88178e-16 (P) |
| C20 | 1.42109e-14 (P) | 6.30303e-06 (P) / 7.10543e-15 (P) |
| C21 | 7.62939e-06 (P) | 1.38936e-07 (P) / 2.22045e-16 (P) |
| C22 | 7.15234 (F) | 3.40009e-07 (P) / 2.22045e-16 (P) |
| C23 | 4.1943e+06 (F) | 2.96146e-07 (P) / 4.44089e-16 (P) |
| C24 | 2.19902e+13 (F) | 7.89498e-07 (P) / 5.55112e-16 (P) |
| C25 | 1.09528e+19 (F) | 0 (P) / 1.77636e-15 (P) |
| C26 | 6.60168e-16 (P) | 4.06967e-06 (P) / 5.93206e-16 (P) |

## 6. Decisive cases and residual meaning

### C03: centered sums do not protect an expanded linear predictor

Use five timestamps `x=2^30+u·2^-20` seconds, `u=[−2,−1,0,1,2]`, with `y=1.234567+0.234567u` V. The fitted and held-out X values are all exactly representable in binary64. The sample spacing is approximately 0.954 microseconds and the total span approximately 3.815 microseconds. These are intentionally demanding synthetic timestamp coordinates, not a named customer workload.

The returned predictions at the five rows are `[0.78125, 1, 1.25, 1.5, 1.71875]` V. Maximum fitted-row error is **0.030866 V**, and held-out error is **0.0235335 V**. The task budget is about 0.001 V. Exact evaluation of the returned intercept and slope already loses **0.015433 V**; ordinary floating evaluation increases the error. This is evidence about forming and evaluating the expanded intercept, not merely label rounding.

The source reports residual SE zero and R² one. Direct residuals from its returned predictions give:

| Measure | Returned fit | Independently recomputed from returned predictions |
| --- | --- | --- |
| SSE, V² | 0, inferred from residual SE | **0.0016675373350000064** |
| Residual SE, V | 0 | **0.02357638179054062** |
| R² | 1 | **0.9969693084415077** |

The inconsistency exceeds the predeclared SSE envelope, approximately `0.00015933000016 V²`. This is not a defect inferred only from cancellation-prone `syy−slope*sxy`: the independently summed residuals are materially nonzero. `my+slope*(x−mx)` reduces the maximum specified-probe error to **1.11e-16 V** using the same computed slope and means; its direct fitted-row SSE is zero for these stored responses. The minimal proposal changes prediction and residual calculation together. Computing direct SSE alone would describe the wrong curve more accurately without repairing it.

C02 is a useful rejection control: with ordinary millimetre spacing near `1e9`, the baseline internal error is `2.69e-8 V`. It misses the very tight numerical diagnostic budget but is far below 1 mV. It does not independently justify hiding the fit or adding a user control.

### C05/C06: the same quadratic, with a translated origin

The transparent noisy calibration fixture uses:

```text
u = [-2, -1, 0, 1, 2] mm
q(u) = 1.234567 + 0.234567u + 0.034567u² V
residuals = [1, -4, 6, -4, 1] / 10000 V
y = [0.903801, 1.034167, 1.235167, 1.503301, 1.842069] V
```

The residual vector is orthogonal to powers 0–2, so the intended exact least-squares coefficients are the stated decimals. Exact intended SSE is `7e-7 V²`. C05 uses `x=u`; C06 uses `x=1,000,000,000+u` mm. The stored X values remain distinct and exact. Internal predictions and residual metrics agree between the two cases and with their independent references to ordinary roundoff.

C06 internal prediction error is **4.35e-16 V**. The returned full expansion, interpreted with exact arithmetic, misses by **4.6178147719 V**, while binary64 Horner misses by **7.096299 V**. That is a representation failure despite a valid predicted curve. The source emits:

```text
y = 0.0346x² − 69,134,000x + 34,566,999,765,432,980
```

Evaluating the actual text misses by approximately **3.2999765565e13 V**. Trace coefficients are `34567000000000000`, `−69134000`, and `0.034567`; their exact-decimal polynomial misses by **1.703701 V**, and binary64 Horner misses by **5.841969 V**. Seventeen digits on the already-expanded coefficients do not recover the converted information.

The successful candidate keeps the already-computed standardized form. One possible serialized calculation is:

```text
t = (x − 1000000000.0000000) / 1.4142135623730951
y = (0.069133999999999973 t + 0.33172783268516975) t
    + 1.2345669999999997
```

Here x, the origin, and the scale use millimetres; t is dimensionless; y uses volts. This is an executed numerical serialization example, not a proposed requirement to display padded 17-digit constants everywhere. An eventual renderer can use shortest round-tripping decimal strings if its actual output passes the same gate. Coefficient order and parentheses must survive reuse. [Source: `SP/regression.ts`, standardized `predict` and expansion; executed E03–E06, C05/C06.]

### Units, response offsets, and lost input detail

- **C07/C08:** mm-to-m changes preserve the intended physical polynomial. In C08, decimal X conversion introduces at most `4.74974513e-11 m` of input rounding and changes the exact reference prediction by at most **1.27691310e-8 V**. Baseline error against the stored-input oracle is only **4.62e-16 V**. Treating the entire intended-versus-actual difference as solver error would misattribute input rounding. Full expanded reconstruction still fails by several volts.
- **C09:** converting V to mV scales the measurement budget to 1 mV. The prediction and centered form retain agreement. The label's integer-rounding threshold changes the representation error; unit conversion must be assessed in physical response units.
- **C10:** adding 1000 V to the response leaves its variation unchanged. Centered6 misses by about **0.00456724 V**, above 1 mV, while Centered17 passes. Therefore centering alone does not justify a fixed six-digit reuse promise. Preserving the existing full-precision basis handles this case without a response-centering API redesign.
- **C13:** `2^54+[-1,0,1]` becomes one binary64 X value before fitting. An unavailable polynomial is correct. No solver can reconstruct the three original positions from those identical stored inputs. This case is labelled a representation diagnostic and is not used as an overflow or ordinary-use repair justification.

### NIST and residual cross-checks

Pontius internal prediction error is **5.93e-16** source deflection units at the specified in-range probes. Full expanded Horner error is **6.60e-16**. Its actual compact equation error is **1.6967857143e-4**, above the `5e-6` fidelity budget; trace coefficient error is **4.9257143e-7**, within it. The NIST case therefore supports the distinction between solving the model and reusing a rounded equation even without a narrow translated X range.

Its exact intended coefficients are `51191/76000000`, `58418321/79800000000000`, and `−1081/342000000000000000`; exact intended SSE is `82865261/53200000000000`. The baseline direct SSE is approximately **1.557617687969993e-6**, and returned residual SE implies the same SSE within `2.18e-23`. C05/C06 likewise agree within `7.29e-23 V²`. All 14 positive-residual-df polynomial fits pass the metric consistency check (19 polynomial fits less five interpolation cases). The two ordinary/translated linear controls pass and C03 fails. The precise counts are recorded in the proof payload.

The independent adjusted-R² discrepancies are at most **9.65e-17**. The test does not interpret a displayed `R²=1.000` as exact zero residual; `formatR2` intentionally rounds near one. The certificate's precision and these bounded fit checks do not establish physical instrument accuracy.

## 7. Alternatives, costs, and gates

Relative costs below are engineering judgments, not measured estimates or delivery commitments.

| Response | Benefit and relative cost | Decision |
| --- | --- | --- |
| Keep everything and add docs | Very low cost; useful for explaining compact labels. | **Insufficient alone.** C03 returns a materially wrong prediction, and C06's expanded text is not a meaningful trend approximation. |
| Add more digits to the expansion | Low code cost; helps ordinary rounded cases. | **Partial only.** Expanded17 still passes only 15/22. It cannot recover lost basis-conversion information. |
| Stable equation with explicit origin and scale | Small-to-moderate integration cost; reuses the polynomial representation already used for drawing. | **GO for proposal.** Centered17 passes 22/22; keep units, coefficient order, and transform precision together. |
| Representation-specific fallback/notice | Small-to-moderate display work; preserves useful curves when a compact expression is unsuitable. | **Conditional GO.** Prefer a sound centered expression; do not hard-code the fixture's 1 mV tolerance into general UI. Any automatic threshold needs its own proof. |
| Center linear prediction and recompute its metrics | Low arithmetic implementation cost plus focused tests/docs. | **GO for proposal.** The exact-X C03 discrepancy is material and the evaluation candidate passes all controls. |
| Reject on offset, absolute spread, coefficient size, or expanded disagreement | May look protective but can remove useful information. | **NO-GO.** Six cases have valid predictions yet fail full expanded Horner; a blanket representation gate would unnecessarily suppress those curves. |
| Rewrite QR, add regressors, or build a benchmark platform | High scope and maintenance cost. | **NO-GO for this evidence.** The demonstrated polynomial failure is conversion/text representation; all included polynomial predictions pass. |

The six valid curves harmed by an expanded-equation availability gate would be C06, C08, C22, C23, C24, and C25. This is a counterfactual classification of the executed outputs, not an implemented safeguard test. At the label gate, 18 otherwise valid curves would be suppressed. These controls make a blanket safeguard unjustified even in this deliberately difficult matrix.

Recommended proof gates before a later repair is accepted:

- Retain all expected available/unavailable outcomes, including repeated X and minimum-row fits.
- Preserve ordinary controls and unit-equivalent physical predictions within the declared task budget. Keep tight numerical diagnostics separate from materiality.
- Prove the returned linear prediction and returned residual measures describe the same function; protect correlation and slope-SE semantics as well.
- Reconstruct the **actual final reusable text**, including origin/scale, coefficient order, Unicode signs, units, rounding, and any zero suppression; test held-out points as well as rows.
- Establish a justified representation error bound if the UI makes an all-range guarantee. A finite probe pass alone is not that bound. A coefficient-delta bound in the retained standardized coordinate is a possible proposed check, not an executed result here.
- Do not turn a representation warning into fit unavailability. Do not remove a valid curve because a user changed units or chose a large origin.
- Verify browser layout, keyboard access, copied-expression use, and affected export behavior only in a runnable implementation, with the required docs/example milestone.

## 8. Product meaning and the docs/example milestone

Visual trend reading and equation reuse have different contracts. A chart can draw the accurate standardized prediction while a short equation gives only a rough mnemonic. A calculation requires a numerical representation whose units and evaluation agree with that curve. The trace currently supplies rounded expanded coefficients, so current docs must not tell users it is an exact reuse route.

The existing route is **`/docs/scatter`**, source `apps/demo/src/docs/pages/scatter.mdx`, Fits section at lines 66–73. The existing example is **`scatter-regression`**: `scatterRegressionDashboard` in `apps/demo/src/demos/dashboardSettings.ts`, live entry at `apps/demo/src/docs/live/examples.ts:500–507`, and catalogue entry at `apps/demo/src/demos/examples.ts:545–554`. It teaches grouped-versus-pooled penguin fits. Preserve that lesson.

Propose a focused companion **`scatter-regression-units`**, in the same visible milestone as any repair. Use C05/C06's five observed rows with local-mm, translated-mm, and optional translated-m fields. Show the same physical relationship using the same rows; expose one named held-out query and its stable trace equation. Keep the current overall/group/facet meaning. Explicitly label field units. Use the existing trace interaction; no precision slider or separate numerical settings panel is earned.

Proposed post-repair user copy, **not a description of current behavior**:

> Chart labels summarize the fitted trend. To reuse a fit in a calculation, use its trace equation with the stated origin, scale and field units. For `t = (x − origin) / scale`, enter x in the displayed X units. Keep the origin, scale and coefficient digits together. The curve covers the X range used in the fit; values outside that range are extrapolations.

Internal evidence, limitations, and implementation gates belong in the owning intent/research documents, not in product copy about open defects. The two related intent briefs support bounded correctness work and retention of delivered fits; neither establishes demand for a new statistical method. `AGENTS.md:8` requires docs and examples in each visible milestone, and `CODING_STANDARDS.md:20` keeps internal caveats in intent/issue material.

## 9. External interpretation and uncertainty

Official [NumPy `Polynomial.fit`](https://numpy.org/doc/stable/reference/generated/numpy.polynomial.polynomial.Polynomial.fit.html), Returns/Parameters, retains a domain/window and explains conversion to unscaled coefficients. Its [`Polynomial.convert`](https://numpy.org/doc/stable/reference/generated/numpy.polynomial.polynomial.Polynomial.convert.html), Notes, warns that representation conversion can be numerically ill-defined. This supports the distinction between evaluation and expansion; it does not establish an explorEDA defect. [`numpy.polyfit`](https://numpy.org/doc/stable/reference/generated/numpy.polyfit.html), Notes, discusses badly centered polynomial designs. Those facts help interpret the executed cases; no NumPy fit or competitor benchmark was run.

The remaining uncertainty is bounded and explicit:

- **Customer meaning:** no named customer or actual reliance on copied coefficients is established. The task tolerance is a test assumption. The numerical discrepancy is reproduced; its user frequency and business priority are unknown.
- **Input domain:** the largest case has 40 rows. Degrees stop at the supported 2–6. No overflow stress, large-data performance claim, exhaustive conditioning survey, or arbitrary-degree guarantee is made.
- **Continuous range:** fitted rows and named interior points are sampled evidence. Extrapolation is separately recorded. Neither these probes nor the diagnostic `T_num` are a proof for every real X in a continuum.
- **Representation:** 17 significant digits are a sufficient round-trip choice for the tested binary64 components. They do not restore rounded source data or guarantee another calculator's parser/evaluation order. Final text, truncation, accessibility, and copy affordance remain implementation choices.
- **Availability:** the present pivot threshold was preserved, not fully characterized. No new rank-warning policy is justified by this experiment.
- **Metrics:** the independent SSE and adjusted-R² checks agree with polynomial prediction. A new production residual loop, slope-SE regression behavior, and browser summaries still need local proof.
- **Scope and provenance:** GitHub exact-ref access failed; the authorized packet was sufficient. Hash verification proves consistency with the supplied sections, not an independent reconstruction of Git history. Local additions and PR claims were not silently treated as baseline files.

## 10. Research completion and handoff

**All four ranked questions are answered:** material disagreement is separated by representation and metric; the smallest justified response is compared with retained behavior and a solver rewrite; explicit material/numerical/rejection gates protect useful fits; and the existing docs/example plus a focused proposed companion are named in the same visible milestone.

- **Access status:** GO via selected, hash-verified packet; no blocker to this bounded research decision.
- **Exact baseline:** `63dfa75851ef57bb3782e6d7c1ef104784cd4064`.
- **Files read:** all 27 packet sections, the attached execution prompt, current NIST/NumPy primary pages, and the research's frozen inputs/results/audit records. The source ledger distinguishes complete files, projections, excerpts, and local additions.
- **Executed checks:** packet integrity; 40/40 NIST token check; exact-rational references; 26 isolated-source cases; actual formatter/trace reconstruction; five parser controls; full coefficient and stable-basis comparisons; direct SSE/R²; independent C03/C06 replay and closed forms; 13 certified NIST statistics; sample-limit and adjusted-R² checks.
- **Unrun checks:** repository Vitest, typecheck, `pnpm check`, demo registration/build/docs gates, browser widths 1280/783/390, pointer/keyboard, actual clipboard or calculator paste, export, filters/refits, restoration, cross-engine execution, and continuous-interval certification. The revised production predictor/metric implementation is unrun because no application change was made.
- **Artifacts:** [R001-report.md](R001-report.md), [R001-sources.md](R001-sources.md), [R001-decisions.md](R001-decisions.md), [R001-proof-and-docs.md](R001-proof-and-docs.md), [R001-manifest.json](R001-manifest.json), and [R001-research.zip](R001-research.zip). The ZIP contains exactly the four reports and manifest. Final download links and manifest/ZIP hashes are supplied outside the archive.
- **Unresolved blockers:** none to delivery of the research. Adoption/shipment remains gated on independent checkout reproduction and a concrete implementation review. The authoritative reuse surface, any public API compatibility choice, final text design, and automatic warning threshold remain proposals; they do not justify a solver rewrite or a new universal control.
