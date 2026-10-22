# R001 — Frozen proof, executed checks, and proposed docs/example work

**Repository:** https://github.com/byronwall/explorEDA  
**Exact baseline:** `63dfa75851ef57bb3782e6d7c1ef104784cd4064`  
**Research date:** October 22, 2026 (America/Indianapolis). UTC is used for reproducibility records.  
**Access:** GO through the authorized, hash-verified selected packet.  
**Scope:** one bounded numerical comparison and research artifacts; no application changes or Git operations.

## 1. Decision and execution boundary

The evidence supports a narrow linear centered-prediction/residual proposal and a stable-basis reusable-equation proposal. Retain polynomial Householder QR and useful curves. Do not introduce a global offset/spread rejection rule, precision control, solver replacement, or broader statistical feature.

- **Executed:** original isolated regression functions, actual equation and trace formatting, independent exact references, fitted and held-out probes, reconstruction candidates, direct residual metrics, and independent arithmetic audits.
- **Proposed:** changes to production prediction/metric code, final reusable-equation rendering, public API decisions, warnings, docs and a live example.
- **Unrun:** repository tests/build/typecheck, integrated browser/filter/clipboard/export flows, final text layout/accessibility, cross-engine execution and a whole-continuous-interval guarantee.

The appendix embeds a self-contained **research replay kit**, including the unmodified relevant baseline sources, exact frozen expected values, observed results and the scripts that produced the main comparison. It does not embed a runnable application checkout. A reader can reconstruct and run the proof without separately fetching NIST or installing npm dependencies. Existing source remains unchanged.

## 2. Frozen fixtures and provenance

The exact intended and stored-input references were frozen **before** the candidate comparison. The receipt records `2026-10-22T13:07:47.415769+00:00`; the recorded Node run is `2026-10-22T13:08:53.125Z`. These are local records, not externally signed chronology.

| Record | SHA256 |
| --- | --- |
| Supplied selected source packet | `96a5c73689957c37fba380cf79cec32d60990fb02b645758e549c79130c98a1a` |
| Frozen inputs and exact expected outputs | `977a61ee606ed9dc0c98fd00fbc406bffe31fe9db02e8e3bd817500a9e9a2c75` |
| Main executed outputs | `39382428325ba96a186e427171ba7ef3633328f523abf5d6ab5d67711305329c` |
| Independent analysis of those outputs | `ed639bbd251755362c6f179d25c3a8777224d23c2da9e6ac64246f717639e085` |
| Normalized Pontius reference transcription | `255dfc23825a7d1ec7e30577344989d0d6dc79cebabb0d7da27db21ff29fcddd` |

`frozen-fixtures.json` contains all input decimal strings; all held and extrapolation queries; input rounding; expected stored-input availability; exact intended and stored-input fitted/held predictions; exact rational coefficients, SSE, SST and R²; and the predeclared budgets/candidates. It is embedded byte-for-byte. Each appended payload also has its own hash. Published Markdown tables round numbers for reading; acceptance was calculated from the exact values in the payloads.

### Transparent synthetic measurement

The principal five observations are defined without a random generator:

```text
u = [-2, -1, 0, 1, 2] mm
q(u) = 1.234567 + 0.234567u + 0.034567u² V
e = [1, -4, 6, -4, 1]/10000 V
y = q(u) + e
  = [0.903801, 1.034167, 1.235167, 1.503301, 1.842069] V
held u = [-1.5, -0.5, 0.5, 1.5]
```

The residual vector is orthogonal to the constant, linear and quadratic columns. Intended least-squares coefficients are therefore exactly the three stated decimal numbers; intended SSE is `7/10000000 V²`. The expected held prediction at `u=0.5` is exactly **1.36049225 V**. C06 translates X by `10^9 mm`; C07 changes mm to m; C08 does both; C09 changes V to mV; C10 shifts the response reference by +1000 V.

The linear family uses `1.234567 + 0.234567u`. C03 interprets X as timestamps `2^30 + u·2^-20 seconds` while preserving that synthetic response pattern. This is a separate timestamp interpretation, not a physical conversion of length units to time. All its fitted and held X coordinates are exactly binary64 representable.

### Exact case recipes

For C16–C25, the selected polynomial is `1 + Σ[(-1)^k u^k / 2^(k+2)]` for k=1…degree. Held queries are every adjacent-node midpoint. Ordinary controls use `n=d+2`, `u_i=i−(n−1)/2`; translated minimum-row controls use `n=d+1`, `u_i=i−d/2`, `x=1000000+u`. The matrix has 26 cases total, with at most 40 observations per case.

| Case | Frozen recipe | n, degree; expected stored-input availability |
| --- | --- | --- |
| C01 | u=-2,-1,0,1,2; y=1.234567+0.234567u | 5, 1; available |
| C02 | C01 with x=1000000000+u | 5, 1; available |
| C03 | C01 with x=2^30+u*2^-20; X and held X exactly binary64 representable | 5, 1; available |
| C04 | u=-2..2; y=1+u/4+u^2/32 | 5, 2; available |
| C05 | q(u)=1.234567+.234567u+.034567u^2; residuals=[1,-4,6,-4,1]/10000 | 5, 2; available |
| C06 | C05 with x=1000000000+u | 5, 2; available |
| C07 | C05 with x=u/1000 | 5, 2; available |
| C08 | C05 with x=(1000000000+u)/1000 | 5, 2; available |
| C09 | C05 with response multiplied by 1000 | 5, 2; available |
| C10 | C05 with response increased by 1000 | 5, 2; available |
| C11 | Repeated rows, but five distinct X values | 7, 2; available |
| C12 | Four rows, two distinct X; expected unavailable | 4, 2; unavailable |
| C13 | x=2^54+[-1,0,1] becomes one binary64 X; not solver error | 3, 2; unavailable |
| C14 | Constant X; expected unavailable | 3, 1; unavailable |
| C15 | Two rows for degree 2; expected unavailable | 2, 2; unavailable |
| C16 | n=d+2; u_i=i-(n-1)/2; y=1+sum((-1)^k*u^k/2^(k+2),k=1..2) | 4, 2; available |
| C17 | n=d+2; u_i=i-(n-1)/2; y=1+sum((-1)^k*u^k/2^(k+2),k=1..3) | 5, 3; available |
| C18 | n=d+2; u_i=i-(n-1)/2; y=1+sum((-1)^k*u^k/2^(k+2),k=1..4) | 6, 4; available |
| C19 | n=d+2; u_i=i-(n-1)/2; y=1+sum((-1)^k*u^k/2^(k+2),k=1..5) | 7, 5; available |
| C20 | n=d+2; u_i=i-(n-1)/2; y=1+sum((-1)^k*u^k/2^(k+2),k=1..6) | 8, 6; available |
| C21 | n=d+1; u_i=i-d/2; x=1000000+u; y=1+sum((-1)^k*u^k/2^(k+2),k=1..2); expected available with residual SE/adjusted R2 undefined | 3, 2; available |
| C22 | n=d+1; u_i=i-d/2; x=1000000+u; y=1+sum((-1)^k*u^k/2^(k+2),k=1..3); expected available with residual SE/adjusted R2 undefined | 4, 3; available |
| C23 | n=d+1; u_i=i-d/2; x=1000000+u; y=1+sum((-1)^k*u^k/2^(k+2),k=1..4); expected available with residual SE/adjusted R2 undefined | 5, 4; available |
| C24 | n=d+1; u_i=i-d/2; x=1000000+u; y=1+sum((-1)^k*u^k/2^(k+2),k=1..5); expected available with residual SE/adjusted R2 undefined | 6, 5; available |
| C25 | n=d+1; u_i=i-d/2; x=1000000+u; y=1+sum((-1)^k*u^k/2^(k+2),k=1..6); expected available with residual SE/adjusted R2 undefined | 7, 6; available |
| C26 | Exact NIST decimal tokens; 5e-6 fidelity budget = half last supplied Y decimal place, not asserted instrument accuracy | 40, 2; available |

C11 has repeated X but five distinct positions, so it remains available. C12 lacks the distinct positions required for a quadratic. C13 has three distinct intended positions around `2^54` that collapse to one binary64 position; it tests input distinguishability, not a solver defect or overflow workload. C14 is a constant-X line. C15 lacks rows. C21–C25 remain available at `n=d+1`, while residual SE and adjusted R² are undefined. None of those undefined statistics should suppress the valid interpolation curve.

## 3. Independent references and representation-specific error

### Intended values versus stored values

The reference builder first treats each finite decimal input as an exact rational. A second oracle converts the same decimal string to binary64, then recovers that binary64 value exactly as a `Fraction`. Queries are treated in the same way. The difference between the two oracles measures input/query representation effects. Baseline algorithm error is measured against the stored-input oracle, not against inaccessible decimal detail.

The exact solver shifts/scales X with rational arithmetic, forms normal equations, and solves them by exact Gauss–Jordan elimination. Since every operation is rational, the floating-point instability of normal equations is not present in this oracle. It is independent of the baseline binary64 Householder QR. No NumPy fit or second copy of the same binary64 solver supplies the expected values.

Independent audit formulas strengthen the decisive references:

```text
For u = [-2,-1,0,1,2]:
Linear: a = mean(y); b = sum(u*y)/10; predict = a + b*u.
Quadratic orthogonal basis: 1, u, u²−2.
  c2 = sum((u²−2)*y)/14
  c1 = sum(u*y)/10
  c0 = mean(y)−2*c2
```

Those closed forms exactly match the stored-input frozen references for C03/C06. Separately typed literal inputs replayed the original source and reproduced the recorded predictions and label equations. The oracle and replay were reviewed independently of the main harness.

### Exact numerical anchors

| Case/reference | Exact values or observed consequence |
| --- | --- |
| C03 intended expansion | Intercept `−264098963448352549241/1000000`; slope `3843145728/15625`. Acceptance uses the stored-input oracle, not coefficient-relative error. |
| C03 baseline maximum internal error | `69504053049209/2251799813685248 V` = approximately `0.03086600000000006 V`. |
| C03 exact evaluation of returned binary64 coefficients | Maximum error approximately `0.01543300000000003 V`, before additional binary64 evaluation error. |
| C03 direct SSE from returned predictions | `33821675257851842484514175967/20282409603651670423947251286016 V²` = approximately `0.0016675373350000064 V²`; returned residual SE is zero. |
| C05/C06 intended local polynomial | `[1234567/1000000, 234567/1000000, 34567/1000000]`; intended SSE `7/10000000 V²`. |
| C06 intended original-X expansion | `[34566999765433001234567/1000000, −69133999765433/1000000, 34567/1000000]`. It is illustrative exact decimal algebra; returned binary64 coefficients are a distinct representation. |
| C06 baseline maximum internal error | `137/315251973915934720 V` = approximately `4.345730124961327e-16 V`. |
| C06 exact returned-coefficient error | `5823100888104562277/1261007895663738880 V` = approximately `4.617814771920631 V`. |
| Pontius intended coefficient vector | `[51191/76000000, 58418321/79800000000000, −1081/342000000000000000]`. |
| Pontius intended SSE | `82865261/53200000000000` source-deflection-units². |

### What each reconstruction means

- **Internal:** the unmodified returned `predict` function.
- **Expanded exact:** exact rational evaluation of the returned binary64 expanded coefficients at stored X. This isolates loss already present in the converted coefficient representation.
- **Expanded Horner / sum:** binary64 evaluation of those coefficients; extra cancellation can differ with operation order.
- **Equation exact / Horner / sum:** first call actual `fitEquation`, then parse its emitted rounded text; evaluate its decimal mathematical meaning or its binary64 parse. Full coefficients are never substituted for the displayed equation.
- **Trace exact / Horner:** use the actual source `precise` function, `String(Number(value.toPrecision(6)))`, and evaluate those resulting coefficient strings.
- **Expanded17:** serialize the returned expanded coefficients to 17 significant digits, parse them back, and verify exact binary64 identity. Its failure shows why extra digits alone are insufficient.
- **Centered6:** keep baseline polynomial origin/scale at 17 digits, but coefficient strings at six. For a line, use the existing mean/slope in centered evaluation. This does not test rounding a large origin to six digits.
- **Centered17:** keep all basis components at 17 digits. No refitting or alternate solver is introduced for polynomials; the existing standardized basis is preserved. Linear evaluation uses the proposed centered form with the same fitted slope/means.

The polynomial candidate exposes existing internal basis metadata through a separate, in-memory source copy. The baseline itself imports the hash-verified unmodified `.ts` file. Assertions require identical coefficients, measures and predictions for the original and metadata-instrumented versions at every specified point. The trace formatter is extracted verbatim from its hash-verified source; React components are not rendered.

### Formatter/parser contract

Source locations are `packages/explorEDA/src/components/charts/ScatterPlot/regression.ts:443–493` and `FitTraceBody.tsx:39–41`.

1. Exactly zero coefficients are omitted as polynomial terms, except that an entirely zero expression prints `y = 0`.
2. Magnitudes ≥1000 use integer rounding and `en-US` grouping separators.
3. Magnitudes below 0.001 use exponential notation from `toExponential(2)` with normalized mantissa text.
4. Other magnitudes use `Number(value.toPrecision(3))`.
5. Signs use Unicode U+2212 minus; powers use Unicode superscripts; exponent minus signs remain ASCII.
6. A nonconstant multiplier whose formatted magnitude is `1` is omitted, including values that merely round to one.
7. Trace coefficients use six significant digits independently; `formatR2` has its own two-/three-decimal rounding.

Five executed parser controls cover these rules, including grouping, negative tiny values, sixth powers, rounded unit multipliers and all-zero coefficients. Parsing is mathematical reconstruction, not a browser clipboard or downstream expression-language test.

## 4. Predeclared budgets and rejection controls

The synthetic task assumes numerical reuse within **0.001 V**; the V→mV case scales that to **1 mV**. This is a plausible measurement-task assumption and not an inferred customer requirement. The Pontius budget is **5e-6 source deflection units**, half the final supplied decimal place, not NIST instrument accuracy or a NIST acceptance criterion.

```text
ε = 2^-52
V = max(intended observed Y) − min(intended observed Y)
M = max(abs(stored Y), abs(stored-input reference in-range predictions))
T_num = 128 ε M + 10^-12 V
T = T_measurement + T_num
Visual discussion heuristic = max(T_measurement, 0.005 V) + T_num
```

The numeric allowance is a fixed diagnostic budget, not a universal rigorous forward-error theorem. The response variation and measurement tolerance prevent a large output offset or cancelling expanded terms from excusing large response error. If `T_num > T_measurement/10`, report a separate representation limit; none of these available cases triggered it. Do not infer a general UI tolerance from these constants.

Availability, input rounding, prediction, coefficient conversion, text approximation and residual consistency have separate checks. `PASS` means maximum error over fitted plus specified held-out **in-range probes** is ≤T. Extrapolation queries are recorded separately and do not determine the in-range verdict. Undefined metrics at the sample limit are expected. Product workflows that could not be executed are **UNKNOWN/UNRUN**, not passing cases.

For residual metrics, exact arithmetic independently sums `SSE=Σ(y_i−predict(x_i))²`. With positive residual df, compare to `residualSe²·df`, and independently calculate R²/adjusted R² from direct SSE and stored-response SST. The material SSE envelope is `2TΣ|r_i|+nT²`. This avoids claiming a defect based only on cancellation-prone subtraction or a huge relative error in an essentially zero SSE.

Reject a safeguard if it suppresses valid C04/C05, repeated-X C11, or available C16–C25 merely because original-coordinate coefficients are large. A gate that rejects every full-expanded failure would unnecessarily remove six valid-predictor cases: C06, C08, C22, C23, C24 and C25. A label-failure gate would remove 18 otherwise valid predictors. These are counterfactual classifications of executed outputs, not an implemented warning test.

### Proposed continuous-interval representation gate — UNRUN

The finite probes do not prove a maximum error over every real X in the interval. If a future UI promises whole-range equation agreement, an additional justified bound is needed. One scoped candidate is to retain identical origin/scale and bound coefficient serialization in the standardized variable:

```text
T_bound = max(|(xmin−origin)/scale|, |(xmax−origin)/scale|)
exact-polynomial serialization discrepancy <= Σ |b_k − serialized_b_k| T_bound^k
```

This exact-polynomial bound still needs justified floating-point evaluation allowances and careful treatment of any changed origin/scale. It does not bound solver error relative to the unknown physical process. No such automatic bound, root-search policy, or UI warning threshold was implemented or executed here. Round-tripping 17-digit components preserve the tested binary64 values, but final parser/evaluation behavior must still be specified.

## 5. Executed case matrix

The following tables include inputs/ranges/units, expected availability, material budgets, fitted/held errors, separate full-expanded/actual-text/trace reconstruction, and the bounded candidates. They are generated from the frozen fixture/result records, not manually estimated.

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


### Direct residual metrics, independently recomputed

Values are in each case's response units (squared for SSE). “Undefined” is expected when residual df is zero. A consistency PASS is about reported measures describing the returned predictor; it does not imply the predictor is a physically valid model. C03 fails both prediction and residual consistency. Polynomial metrics pass their applicable consistency gates.

| Case | Exact direct SSE / reported-SE-implied SSE | Returned R² / direct R²; SSE consistency |
| --- | --- | --- |
| C01 | 0 / 0 | 1 / 1; PASS |
| C02 | 1.28137977e-15 / 0 | 1 / 1; PASS |
| C03 | 0.00166753734 / 0 | 1 / 0.996969308; FAIL |
| C04 | 4.93038066e-32 / 4.93038066e-32 | 1 / 1; PASS |
| C05 | 7e-07 / 7e-07 | 0.999998765 / 0.999998765; PASS |
| C06 | 7e-07 / 7e-07 | 0.999998765 / 0.999998765; PASS |
| C07 | 7e-07 / 7e-07 | 0.999998765 / 0.999998765; PASS |
| C08 | 7.00006439e-07 / 7.00006439e-07 | 0.999998765 / 0.999998765; PASS |
| C09 | 0.7 / 0.7 | 0.999998765 / 0.999998765; PASS |
| C10 | 7e-07 / 7e-07 | 0.999998765 / 0.999998765; PASS |
| C11 | 1.97215226e-31 / 1.97215226e-31 | 1 / 1; PASS |
| C16 | 4.93038066e-32 / 4.93038066e-32 | 1 / 1; PASS |
| C17 | 5.42341872e-31 / 5.42341872e-31 | 1 / 1; PASS |
| C18 | 1.06003184e-30 / 1.06003184e-30 | 1 / 1; PASS |
| C19 | 3.61150383e-30 / 3.61150383e-30 | 1 / 1; PASS |
| C20 | 1.20449199e-28 / 1.20449199e-28 | 1 / 1; PASS |
| C21 | 9.86076132e-32 / undefined | 1 / 1; undefined as expected |
| C22 | 4.93038066e-32 / undefined | 1 / 1; undefined as expected |
| C23 | 9.86076132e-31 / undefined | 1 / 1; undefined as expected |
| C24 | 8.2583876e-31 / undefined | 1 / 1; undefined as expected |
| C25 | 4.58525401e-30 / undefined | 1 / 1; undefined as expected |
| C26 | 1.55761769e-06 / 1.55761769e-06 | 0.9999999 / 0.9999999; PASS |

The separate audit recomputed adjusted R² for 14 positive-residual-df polynomial cases; maximum difference was `9.641995160333973e-17`. All C21–C25 residual SE and adjusted R² values were undefined as expected. Linear slope SE, Pearson r and existing constant-Y conventions need preservation tests in a later implementation; no altered production metric code was run here.

### Extrapolation probes — recorded separately

These were evaluated numerically but are outside the in-range acceptance contract. The source planner draws only across the observed X range; these evaluations do not establish a rendered extrapolation feature or endorse extrapolated physical predictions.

| Case and X queries | Internal error | Actual equation-text Horner error |
| --- | --- | --- |
| C01: -3, 3 mm from local origin | 0 | 0.005866 |
| C04: -3, 3 mm from local origin | 2.22044605e-16 | 0.00045 |
| C05: -3, 3 mm from local origin | 8.21565038e-16 | 0.005569 |
| C26: 0, 3150000 NIST source load units (unspecified) | 6.43174597e-16 | 0.000177797368 |

## 6. NIST certificate and preserved numerical source

Primary URLs, retrieved **2026-10-22**:

- Numerical data/certificate: https://www.itl.nist.gov/div898/strd/lls/data/LINKS/DATA/Pontius.dat
- Certification method, Methodology: https://www.itl.nist.gov/div898/strd/lls/data/LINKS/c-Pontius.shtml
- Data meaning: https://www.itl.nist.gov/div898/strd/lls/data/LINKS/i-Pontius.shtml
- Interpretation/acceptance limits, item 5: https://www.itl.nist.gov/div898/strd/general/howto.html

NIST reports 500-digit computations rounded to 15 significant digits. The 40-row numerical transcription in the appendix preserves raw reference tokens, with normalized headings/whitespace. A direct HTTP fetch was blocked by the sandbox and an approved retry returned server HTTP 403; official web retrieval succeeded. The local hash is therefore a **transcription hash**, not an original-server-byte hash. A second official retrieval confirmed 40/40 row token pairs. Original physical unit names are unspecified.

The independent audit used a raw-coordinate 3×3 moment system and Cramer's rule, plus 100-digit decimal square roots after exact variance calculations. All 13 statistics below round to the published 15 digits. This validates the oracle/transcription; it does not certify explorEDA or imply all baseline coefficients reproduce 15 digits.

| Statistic | Raw certificate token | Independent reference rounded to 15 digits |
| --- | --- | --- |
| B0 | `0.673565789473684E-03` | `0.000673565789473684` — PASS |
| B1 | `0.732059160401003E-06` | `7.32059160401003E-7` — PASS |
| B2 | `-0.316081871345029E-14` | `-3.16081871345029E-15` — PASS |
| SE_B0 | `0.107938612033077E-03` | `0.000107938612033077` — PASS |
| SE_B1 | `0.157817399981659E-09` | `1.57817399981659E-10` — PASS |
| SE_B2 | `0.486652849992036E-16` | `4.86652849992036E-17` — PASS |
| RSE | `0.205177424076185E-03` | `0.000205177424076185` — PASS |
| R2 | `0.999999900178537` | `0.999999900178537` — PASS |
| Regression_SS | `15.6040343244198` | `15.6040343244198` — PASS |
| Residual_SS | `0.155761768796992E-05` | `0.00000155761768796992` — PASS |
| Regression_MS | `7.80201716220991` | `7.80201716220991` — PASS |
| Residual_MS | `0.420977753505385E-07` | `4.20977753505385E-8` — PASS |
| F | `185330865.995752` | `185330865.995752` — PASS |

Residual degrees of freedom are 37. The baseline original-X intercept is approximately `7.26e-16` source units away from its stored-input exact reference, so a claim of universal agreement with every certificate digit would be false. The baseline predictor nevertheless passes the declared fidelity budget at the specified probes. The actual rounded label does not.

Official numerical-library comparison, documentation only: [NumPy Polynomial.fit](https://numpy.org/doc/stable/reference/generated/numpy.polynomial.polynomial.Polynomial.fit.html) retains domain/window information, while [Polynomial.convert](https://numpy.org/doc/stable/reference/generated/numpy.polynomial.polynomial.Polynomial.convert.html) warns about potentially ill-defined converted representations. No comparator package was executed or substituted as the oracle.

## 7. Runnable self-contained proof recipe

**Status:** the embedded source, fixture builder, main Node comparison, and Python analysis were executed in this research. The packaging replay is validated before delivery and recorded in the manifest. This run sheet reconstructs scratch research files only; it does not install, edit, build, or test the application.

Prerequisites: Python 3.12 and Node 24. The recorded versions were Python 3.12.14, Node 24.19.0, V8 13.6.233.17-node.51 and ICU 78.3. A different runtime may deserve numerical review rather than silent replacement of the frozen expectations.

Place this Markdown file in the current directory or set `R001_PROOF_REPORT`. The extractor verifies every embedded payload hash before writing, preserves the original observed results under `research/observed/`, and executes the exact baseline source from separate scratch copies. The final step regenerates the frozen references in a temporary directory and requires the same frozen-fixture hash.

<!-- R001_RUN_SHEET -->
```bash
# Reconstruct all embedded source, scripts, inputs, and observed evidence.
R001_PROOF_REPORT="${R001_PROOF_REPORT:-$PWD/R001-proof-and-docs.md}"
R001_RUN_DIR="${R001_RUN_DIR:-$PWD/r001-proof-replay}"
python3 - "$R001_PROOF_REPORT" "$R001_RUN_DIR" <<'PY'
from pathlib import Path
import hashlib,re,sys
report=Path(sys.argv[1]).read_text()
root=Path(sys.argv[2]).resolve()
pattern=r'<!-- R001_FILE: (\S+) SHA256: ([0-9a-f]{64}) -->\n```[^\n]*\n(.*?)\n```'
items=re.findall(pattern,report,re.S)
assert items, 'No embedded proof files found'
for name,expected,body in items:
    data=(body+'\n').encode()
    assert hashlib.sha256(data).hexdigest()==expected, name
    path=(root/name).resolve()
    assert root in path.parents, 'Unsafe embedded path'
    path.parent.mkdir(parents=True,exist_ok=True)
    path.write_bytes(data)
print(f'[R001] Extracted and SHA256-verified {len(items)} proof files')
PY

# Run pure original-source functions and independent exact arithmetic.
node "$R001_RUN_DIR/research/run_check.mjs"
python3 "$R001_RUN_DIR/research/analyze.py"

# Check numerical replay against observed cases and rebuild the frozen oracle.
python3 - "$R001_RUN_DIR/research" <<'PY'
from pathlib import Path
import hashlib,json,shutil,subprocess,sys,tempfile
root=Path(sys.argv[1])
original=json.loads((root/'observed/executed-results.json').read_text())
replay=json.loads((root/'executed-results.json').read_text())
assert original['cases']==replay['cases'], 'Runtime changed observed numerical cases'
assert original['parser_fixtures_passed']==replay['parser_fixtures_passed']==5
old_analysis=json.loads((root/'observed/analysis-results.json').read_text())
new_analysis=json.loads((root/'analysis-results.json').read_text())
assert old_analysis['cases']==new_analysis['cases'], 'Analysis cases differ'
assert old_analysis['summary']==new_analysis['summary'], 'Analysis summary differs'
expected=json.loads((root/'freeze-receipt.json').read_text())['sha256']
with tempfile.TemporaryDirectory(dir=root) as temporary:
    target=Path(temporary)
    (target/'external').mkdir()
    shutil.copyfile(root/'freeze_fixtures.py',target/'freeze_fixtures.py')
    shutil.copyfile(root/'external/Pontius.web-transcribed.dat',target/'external/Pontius.web-transcribed.dat')
    subprocess.run([sys.executable,str(target/'freeze_fixtures.py')],check=True)
    assert hashlib.sha256((target/'frozen-fixtures.json').read_bytes()).hexdigest()==expected
print('[R001] Numerical replay matches all 26 cases; frozen references reproduce exactly')
PY
```

The embedded `executed-results.json` timestamp identifies the original run. A replay has a new timestamp and therefore a different whole-file hash; comparison intentionally checks numerical cases and summaries, not a timestamp-dependent byte hash. The frozen fixture bytes must reproduce exactly. The independent audit payload records the separately executed closed-form, literal-replay and certificate checks; this run sheet reproduces the principal matrix, not the entire separate human review process.

## 8. Proposed checkout proof gates — ALL UNRUN

These commands belong in a verified exact-baseline or reviewed implementation checkout. They were **not** run in the selected snapshot. The first numerical tests should cover C03/C06 plus ordinary, unit, repeated-X, sample-limit and input-distinguishability controls. Do not merely assert that new code returns values calculated by itself.

```bash
# UNRUN: targeted regression tests and library types after a proposed change.
pnpm --filter exploreda exec vitest run src/components/charts/ScatterPlot/regression.test.ts
pnpm --filter exploreda check-types

# UNRUN: only when the proposed focused demo example is added.
pnpm --filter demo exec vitest run src/demos/coverage.test.ts src/dashboardText.test.ts
pnpm --filter demo docs:check
pnpm --filter demo build
pnpm --filter demo docs:verify -g '/docs/scatter$'

# UNRUN: browser proof at repository-default wide/intermediate/narrow widths.
pnpm shot /docs/scatter --name r001-scatter

# UNRUN: run once before a review PR, as required by repository guidance.
pnpm check
```

The screenshot command is not a substitute for real input. The later reviewer must open the fit trace by pointer and keyboard, inspect unit/origin/scale text at 1280, 783 and 390 px, and check that long equations remain readable. Reconstruct the actual rendered reusable expression independently; test any intended copy/paste target and affected chart export before claiming those workflows. Preserve own-brush/no-refit and peer-filter/refit behavior. Saved-state/public API compatibility must be inspected if the adopted representation touches those surfaces.

## 9. Proposed intent, docs, and focused example edits

Everything in this section is a **proposal**. None was applied to the application or existing documentation.

### Intent addition

Suggested owning locations: `docs/intent/research-ideas-100/ideas/R001-regression-conditioning.md`, with the bounded research under `docs/research/regression-conditioning-2026-10-22/`; link the conclusion from `docs/intent/scientific-multivariate-analysis/intent-brief.md` and `docs/intent/current-analysis-trust/intent-brief.md` without reopening delivered fits or broader missions.

Proposed intent text:

> The exact-baseline R001 investigation reproduced a material linear evaluation discrepancy and a separate loss of accuracy when a valid polynomial is expanded or its equation is rounded. Retain the standardized polynomial solver. Propose centered linear evaluation with residual measures computed from that same predictor, and preserve a stable equation representation with explicit origin, scale, units and sufficient precision for reuse. Keep valid curves when only a representation is unsuitable. Require the frozen ordinary and transformed controls before adoption. Any visible milestone includes `/docs/scatter` and a focused runnable unit/offset example. Repository and browser proof remain required; no new precision control or solver rewrite is committed.

### Current docs surface and exact example

- Existing page/route: **`/docs/scatter`**, source `apps/demo/src/docs/pages/scatter.mdx`, Fits section lines 66–73.
- Existing example: **`scatter-regression`**, based on `scatterRegressionDashboard` in `apps/demo/src/demos/dashboardSettings.ts` (supplied excerpt from 1432 onward), live entry `apps/demo/src/docs/live/examples.ts:500–507`, catalogue entry `apps/demo/src/demos/examples.ts:545–554`.
- Its current penguin example teaches grouped versus pooled slopes. Preserve that purpose. Its supplied live step checks row count, not numerical equation agreement.
- Proposed focused companion: **`scatter-regression-units`**. Add/identify its dataset and registry/live-example entries, inspect the omitted coverage/gate source before editing, and embed it immediately after the Fits discussion in the same visible milestone as the repair.

### Proposed copy before versus after a repair

Current-behavior clarification, if shipped alone, must not promise an exact trace equation:

> Chart equations and coefficient readouts are rounded summaries. For a calculation, check that the equation agrees with the fitted relationship at the required precision and uses the same field units. The curve covers the X range used in the fit.

This wording is honest but **insufficient by itself** for the demonstrated linear prediction defect or catastrophic expanded label. It does not earn retaining a grossly misleading expression.

Proposed post-repair wording, conditional on a proven reusable trace representation:

> Chart labels summarize the fitted trend. To reuse a fit in a calculation, use its trace equation with the stated origin, scale and field units. For `t = (x − origin) / scale`, enter x in the displayed X units; t has no units. Keep the origin, scale and coefficient digits together. The curve covers the X range used in the fit; values outside that range are extrapolations.

Keep QR, open PRs, implementation defects and research limitations in intent/research material. Product copy should explain what users can do and what the equation means.

### Focused example definition — proposed, not created

Use one transparent five-row dataset, with explicit field units and no new unit-control panel:

```csv
distance_mm,translated_mm,translated_m,response_V
-2,999999998,999999.998,0.903801
-1,999999999,999999.999,1.034167
0,1000000000,1000000,1.235167
1,1000000001,1000000.001,1.503301
2,1000000002,1000000.002,1.842069
```

Display the local and translated degree-two fits with the same rows; the metre field can provide a focused unit variant. Include a source-row table and one named interior query: `distance_mm=0.5`, `translated_mm=1000000000.5`, `translated_m=1000000.0005`, expected intended fit response `1.36049225 V` (allow separately recorded binary64 input rounding). The observed response rows include noise; do not falsely expect every fitted value to equal its observation.

Acceptance steps, **unrun**:

1. Confirm the same five contributing rows and explicit units in both fits.
2. Compare internal predictions and the final serialized trace expression at the held query and original rows against the independent reference within 1 mV.
3. Verify that the origin/scale and coefficient order travel with the reusable expression; t must not be silently treated as original X.
4. Keep the curve available if compact original-X text is unsuitable; use a sound centered summary or a representation-specific fallback. An approximation symbol alone is inadequate for C06.
5. Open and read the existing trace via pointer/keyboard at all three required widths. Preserve current grouped/overall/facet and filter semantics.
6. Run docs/example registration, dashboard round-trip, package and affected export/copy gates. Public exposure of new fit fields remains conditional on inspecting the omitted package entry points.

## 10. Exact embedded proof payloads

Each payload is tagged with a relative reconstruction path and SHA256. Original expected/observed files are kept distinct from future replay outputs. The three embedded baseline files are unmodified selected-source copies. The large JSON blocks make the exact frozen expected values and observed data available inside the required five-member ZIP, without adding undeclared archive members.

| Embedded path | Bytes | SHA256 |
| --- | ---: | --- |
| `research/freeze_fixtures.py` | 9536 | `f369b491683baf180df9161d8f31d9b78bb11f54da1eb79b09b2c029c805e259` |
| `research/run_check.mjs` | 7934 | `2dca5d90de894978ea066e163b5d490a9cc16479002d6adb8ff44f322730e7b1` |
| `research/analyze.py` | 7271 | `5310d2406cce49d53f9ec9155621f9e7d9c8930e0ae4017c3fffdedf42711831` |
| `research/frozen-fixtures.json` | 70361 | `977a61ee606ed9dc0c98fd00fbc406bffe31fe9db02e8e3bd817500a9e9a2c75` |
| `research/freeze-receipt.json` | 368 | `06cc3bb77ee4f008087e168ba0ac57a94a4f729b7b220eb1e2b2c66d82715d39` |
| `research/external/Pontius.web-transcribed.dat` | 1378 | `255dfc23825a7d1ec7e30577344989d0d6dc79cebabb0d7da27db21ff29fcddd` |
| `research/observed/executed-results.json` | 97839 | `39382428325ba96a186e427171ba7ef3633328f523abf5d6ab5d67711305329c` |
| `research/observed/analysis-results.json` | 156626 | `ed639bbd251755362c6f179d25c3a8777224d23c2da9e6ac64246f717639e085` |
| `research/observed/independent-audit-results.json` | 5813 | `db7cdc43f96e495d05813aa6b87807f19c133b5c74c40e30530ff5caeaec51dc` |
| `research/observed/packet-ledger.json` | 13656 | `b2d1ef163657fd5ca35a409e614990cfff0ece490bbfbb90c5f98b40f231c85e` |
| `research/snapshot/packages/explorEDA/src/components/charts/ScatterPlot/regression.ts` | 15060 | `f29ed8bb097eb49f4be4906cbac257b040588f89a51fab41a5353b33b74fda96` |
| `research/snapshot/packages/explorEDA/src/components/charts/ScatterPlot/FitTraceBody.tsx` | 8722 | `873c9069d754b4a93a27f1c56a96e30c5148b3027d151d7e698e282660795d27` |
| `research/snapshot/packages/explorEDA/package.json` | 6082 | `17a71fd8852bcfbfb92cf76a9faf03766e934d0a5f0afcdcc9a5d0fd563b452a` |

<details>
<summary>research/freeze_fixtures.py</summary>

<!-- R001_FILE: research/freeze_fixtures.py SHA256: f369b491683baf180df9161d8f31d9b78bb11f54da1eb79b09b2c029c805e259 -->
```python
"""Freeze R001 inputs and independent exact-rational OLS before candidate runs."""
from pathlib import Path
from fractions import Fraction as F
from decimal import Decimal, localcontext
from math import comb
from datetime import datetime, timezone
import hashlib, json

ROOT = Path(__file__).resolve().parent

def decimal(q):
    q = F(q)
    with localcontext() as ctx:
        ctx.prec = 500
        return format(Decimal(q.numerator) / Decimal(q.denominator), 'f')

def ratio(q):
    return str(q.numerator) + '/' + str(q.denominator)

def horner(c, x):
    y = F(0)
    for v in reversed(c):
        y = y * x + v
    return y

def solve(a, b):
    a = [list(r) + [v] for r, v in zip(a, b)]
    for k in range(len(b)):
        pivot = next(i for i in range(k, len(b)) if a[i][k])
        a[k], a[pivot] = a[pivot], a[k]
        v = a[k][k]
        a[k] = [t / v for t in a[k]]
        for i in range(len(b)):
            if i == k:
                continue
            v = a[i][k]
            a[i] = [t - v * z for t, z in zip(a[i], a[k])]
    return [r[-1] for r in a]

def oracle(xs, ys, degree, at):
    if len(xs) < degree + 1 or len(set(xs)) < degree + 1:
        return {'available': False}
    origin = (min(xs) + max(xs)) / 2
    scale = (max(xs) - min(xs)) / 2
    ts = [(x-origin)/scale for x in xs]
    powers = [[t**k for k in range(degree+1)] for t in ts]
    a = [[sum((r[j]*r[k] for r in powers), F(0)) for k in range(degree+1)] for j in range(degree+1)]
    b = [sum((r[j]*y for r,y in zip(powers,ys)), F(0)) for j in range(degree+1)]
    c = solve(a,b)
    expanded = [sum((c[k] * F(comb(k,j)) * (-origin)**(k-j) / scale**k for k in range(j,degree+1)),F(0)) for j in range(degree+1)]
    predictions = [horner(c,(x-origin)/scale) for x in at]
    fitpred = predictions[:len(xs)]
    sse = sum(((y-p)**2 for y,p in zip(ys,fitpred)), F(0))
    my = sum(ys,F(0))/len(ys)
    sst = sum(((y-my)**2 for y in ys),F(0))
    return {'available':True,'origin':ratio(origin),'scale':ratio(scale),'centered_coefficients':[ratio(v) for v in c], 'expanded_coefficients':[ratio(v) for v in expanded], 'predictions':[ratio(v) for v in predictions], 'sse':ratio(sse),'sst':ratio(sst),'r2':ratio(1-sse/sst) if sst else None,'residual_df':len(xs)-degree-1}

cases=[]
def add(id, label, xs, ys, degree, hold, units, tolerance, family, recipe, outside=None):
    xs,ys,hold = [list(map(F,v)) for v in (xs,ys,hold)]
    outside=list(map(F,outside or []))
    cases.append({'id':id,'label':label,'method':'linear' if degree==1 else 'polynomial','degree':degree,'n':len(xs), 'x':[decimal(v) for v in xs], 'y':[decimal(v) for v in ys], 'held':[decimal(v) for v in hold], 'extrapolation':[decimal(v) for v in outside], 'units':units,'measurement_tolerance':str(tolerance),'family':family,'recipe':recipe})

u=list(map(F,[-2,-1,0,1,2]))
held=list(map(F,['-1.5','-.5','.5','1.5']))
line=lambda x:F('1.234567')+F('.234567')*x
q=lambda x:F('1.234567')+F('.234567')*x+F('.034567')*x*x
noise=[F(v,10000) for v in [1,-4,6,-4,1]]
qy=[q(x)+e for x,e in zip(u,noise)]
unit={'x':'mm from local origin','y':'V'}
add('C01','Linear ordinary',u,[line(x) for x in u],1,held,unit,'.001','linear','u=-2,-1,0,1,2; y=1.234567+0.234567u',[-3,3])
add('C02','Linear translated',[10**9+x for x in u],[line(x) for x in u],1,[10**9+x for x in held],{'x':'mm in translated coordinate','y':'V'},'.001','linear','C01 with x=1000000000+u')
add('C03','Linear representable tiny range',[2**30+x*F(1,2**20) for x in u],[line(x) for x in u],1,[2**30+x*F(1,2**20) for x in held],{'x':'s from epoch; sampling interval 2^-20 s','y':'V'},'.001','linear','C01 with x=2^30+u*2^-20; X and held X exactly binary64 representable')
add('C04','Quadratic simple control',u,[1+x/4+x*x/32 for x in u],2,held,unit,'.001','measurement','u=-2..2; y=1+u/4+u^2/32',[-3,3])
add('C05','Quadratic noisy measurement',u,qy,2,held,unit,'.001','measurement','q(u)=1.234567+.234567u+.034567u^2; residuals=[1,-4,6,-4,1]/10000',[-3,3])
add('C06','Quadratic translated',[10**9+x for x in u],qy,2,[10**9+x for x in held],{'x':'mm in translated coordinate','y':'V'},'.001','measurement','C05 with x=1000000000+u')
add('C07','Quadratic X unit change',[x/1000 for x in u],qy,2,[x/1000 for x in held],{'x':'m from local origin','y':'V'},'.001','measurement','C05 with x=u/1000')
add('C08','Quadratic translate and X units',[(10**9+x)/1000 for x in u],qy,2,[(10**9+x)/1000 for x in held],{'x':'m in translated coordinate','y':'V'},'.001','measurement','C05 with x=(1000000000+u)/1000')
add('C09','Quadratic Y unit change',u,[y*1000 for y in qy],2,held,{'x':'mm from local origin','y':'mV'},'1','measurement','C05 with response multiplied by 1000')
add('C10','Quadratic Y offset',u,[y+1000 for y in qy],2,held,{'x':'mm from local origin','y':'V with +1000 reference shift'},'.001','measurement','C05 with response increased by 1000')
repeat=list(map(F,[-2,-2,-1,0,1,2,2]))
add('C11','Quadratic repeated X',repeat,[q(x) for x in repeat],2,held,unit,'.001','availability','Repeated rows, but five distinct X values')
add('C12','Too few distinct X',[0,0,1,1],[1,2,3,4],2,[],unit,'.001','availability','Four rows, two distinct X; expected unavailable')
add('C13','Lost distinguishability',[F(2**54)+x for x in [-1,0,1]],[1,2,3],2,[],{'x':'diagnostic offset units','y':'V'},'.001','availability','x=2^54+[-1,0,1] becomes one binary64 X; not solver error')
add('C14','Constant linear X',[3,3,3],[1,2,3],1,[],unit,'.001','availability','Constant X; expected unavailable')
add('C15','Too few polynomial rows',[0,1],[1,2],2,[],unit,'.001','availability','Two rows for degree 2; expected unavailable')
for d in range(2,7):
    cs=[F(1)]+[F((-1)**k,2**(k+2)) for k in range(1,d+1)]
    n=d+2
    us=[F(i)-F(n-1,2) for i in range(n)]
    hs=[(a+b)/2 for a,b in zip(us,us[1:])]
    add(f'C{14+d:02d}',f'Degree {d} one residual df',us,[horner(cs,x) for x in us],d,hs,unit,'.001','degree-controls',f'n=d+2; u_i=i-(n-1)/2; y=1+sum((-1)^k*u^k/2^(k+2),k=1..{d})')
for d in range(2,7):
    cs=[F(1)]+[F((-1)**k,2**(k+2)) for k in range(1,d+1)]
    n=d+1
    us=[F(i)-F(n-1,2) for i in range(n)]
    hs=[(a+b)/2 for a,b in zip(us,us[1:])]
    add(f'C{19+d:02d}',f'Degree {d} interpolation offset',[10**6+x for x in us],[horner(cs,x) for x in us],d,[10**6+x for x in hs],{'x':'mm with 1000000 offset','y':'V'},'.001','degree-controls',f'n=d+1; u_i=i-d/2; x=1000000+u; y=1+sum((-1)^k*u^k/2^(k+2),k=1..{d}); expected available with residual SE/adjusted R2 undefined')
raw=(ROOT/'external/Pontius.web-transcribed.dat').read_text()
rows=[list(map(F,line.split())) for line in raw.split('Data: y x\n')[1].splitlines() if line.strip()]
add('C26','NIST Pontius',[x for y,x in rows],[y for y,x in rows],2,[225000,1125000,2175000,2925000],{'x':'NIST source load units (unspecified)','y':'NIST source deflection units (unspecified)'},'.000005','NIST','Exact NIST decimal tokens; 5e-6 fidelity budget = half last supplied Y decimal place, not asserted instrument accuracy',[0,3150000])

for c in cases:
    intended_x=list(map(F,c['x']))
    intended_y=list(map(F,c['y']))
    at=list(map(F,c['x']+c['held']+c['extrapolation']))
    stored_x=[F(float(v)) for v in c['x']]
    stored_y=[F(float(v)) for v in c['y']]
    stored_at=[F(float(v)) for v in c['x']+c['held']+c['extrapolation']]
    c['oracle_intended']=oracle(intended_x,intended_y,c['degree'],at)
    c['oracle_stored']=oracle(stored_x,stored_y,c['degree'],stored_at)
    c['expected_available']=c['oracle_stored']['available']
    c['stored_x_distinct']=len(set(stored_x))
    c['input_max_abs_x_rounding']=ratio(max(abs(a-b) for a,b in zip(intended_x,stored_x)))
    c['input_max_abs_y_rounding']=ratio(max(abs(a-b) for a,b in zip(intended_y,stored_y)))
    c['variation']=decimal(max(intended_y)-min(intended_y))

payload={'schema':'R001-frozen-fixtures-v1','baseline':'63dfa75851ef57bb3782e6d7c1ef104784cd4064','numeric_environment':'Node binary64 inputs from exact decimal strings; independent Python Fraction exact normal equations in affine coordinates','gate':{'eps':'2^-52','numeric_budget':'128*eps*max(abs(stored_y),abs(reference_in_range))+1e-12*response_range','material_budget':'measurement_tolerance + numeric_budget','visual_heuristic':'max(measurement_tolerance,0.005*response_range)+numeric_budget; no pixels measured','resolution_limit':'If numeric_budget > measurement_tolerance/10, report representation-limited separately; do not silently relax','residual_budget':'2*T*sum(abs(y-predict(x)))+n*T^2 for T=material_budget'},'candidates':['unaltered baseline predictions','returned coefficients round-tripped with 17 significant digits','existing standardized polynomial basis serialized with 6-digit coefficients and 17-digit origin/scale','same standardized basis with 17-digit coefficients/origin/scale','linear centered evaluation my+slope*(x-mx), same baseline means and slope'],'cases':cases}
blob=(json.dumps(payload,indent=2,ensure_ascii=False)+'\n').encode()
dest=ROOT/'frozen-fixtures.json'
if dest.exists():
    raise SystemExit('Frozen file already exists; refusing to overwrite.')
dest.write_bytes(blob)
receipt={'frozen_at_utc':datetime.now(timezone.utc).isoformat(),'fixture_file':dest.name,'bytes':len(blob),'sha256':hashlib.sha256(blob).hexdigest(),'cases':len(cases),'baseline_or_candidate_runs_before_freeze':False,'pontius_transcription_sha256':hashlib.sha256((ROOT/'external/Pontius.web-transcribed.dat').read_bytes()).hexdigest()}
(ROOT/'freeze-receipt.json').write_text(json.dumps(receipt,indent=2)+'\n')
print(json.dumps(receipt,indent=2))
```

</details>

<details>
<summary>research/run_check.mjs</summary>

<!-- R001_FILE: research/run_check.mjs SHA256: 2dca5d90de894978ea066e163b5d490a9cc16479002d6adb8ff44f322730e7b1 -->
```javascript
// Isolated-source experiment only: no application or repository test execution.
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { stripTypeScriptTypes } from 'node:module';
import { createHash } from 'node:crypto';

const root = dirname(fileURLToPath(import.meta.url));
const sourcePath = resolve(root, 'snapshot/packages/explorEDA/src/components/charts/ScatterPlot/regression.ts');
const tracePath = resolve(root, 'snapshot/packages/explorEDA/src/components/charts/ScatterPlot/FitTraceBody.tsx');
const source = readFileSync(sourcePath, 'utf8');
const sha = value => createHash('sha256').update(value).digest('hex');
if (sha(source) !== 'f29ed8bb097eb49f4be4906cbac257b040588f89a51fab41a5353b33b74fda96') throw new Error('Baseline source hash mismatch');
const fixtureBytes = readFileSync(resolve(root, 'frozen-fixtures.json'));
const receipt = JSON.parse(readFileSync(resolve(root, 'freeze-receipt.json')));
if (sha(fixtureBytes) !== receipt.sha256) throw new Error('Frozen fixture hash mismatch');
const fixtures = JSON.parse(fixtureBytes);
const baseline = await import(pathToFileURL(sourcePath));

// Metadata-only instrumentation in memory exposes the basis already used by predict.
// Baseline is always run from the unmodified, hash-verified .ts file above.
const marker = '    coefficients,\n    r2,\n    adjustedR2:';
if (source.split(marker).length !== 2) throw new Error('Ambiguous metadata injection point');
const instrumented = source.replace(marker, '    __basis: { origin: mx, scale: sx, coefficients: standardized },\n' + marker);
const js = stripTypeScriptTypes(instrumented);
const instrument = await import('data:text/javascript;base64,' + Buffer.from(js).toString('base64'));
const traceSource = readFileSync(tracePath,'utf8');
if (sha(traceSource) !== '873c9069d754b4a93a27f1c56a96e30c5148b3027d151d7e698e282660795d27') throw new Error('Trace source hash mismatch');
const preciseStart = traceSource.indexOf('const precise =');
const preciseEnd = traceSource.indexOf('\n\nconst METHOD_HELP', preciseStart);
if (preciseStart < 0 || preciseEnd < 0) throw new Error('Missing actual trace formatter');
const preciseModule = stripTypeScriptTypes('export '+traceSource.slice(preciseStart,preciseEnd));
const {precise} = await import('data:text/javascript;base64,'+Buffer.from(preciseModule).toString('base64'));

const horner = (c,x) => {let y=0;for(let k=c.length-1;k>=0;k--) y=y*x+c[k];return y;};
const powerSum = (c,x) => c.reduce((a,v,k)=>a+v*x**k,0);
const superDigits='⁰¹²³⁴⁵⁶⁷⁸⁹';
function parseEquation(equation,degree) {
  const terms = equation.slice('y = '.length).split(/ (\+|−) /);
  const tokens = Array(degree+1).fill('0');
  let nextSign=1;
  for(let i=0;i<terms.length;i++){
    if(i%2){ nextSign=terms[i]==='−'?-1:1;continue; }
    const match=terms[i].match(/^([−-]?)(?:(\d[\d,]*(?:\.\d*)?(?:e[+-]?\d+)?))?(x([⁰¹²³⁴⁵⁶⁷⁸⁹]*))?$/);
    if(!match || (!match[2]&&!match[3])) throw new Error('Cannot parse actual equation: '+equation);
    const sign=nextSign*(match[1]?-1:1);
    const p=match[3]?(match[4]?Number([...match[4]].map(d=>superDigits.indexOf(d)).join('')):1):0;
    if(p>degree)throw new Error('Unexpected displayed degree');
    tokens[p]=(sign<0?'-':'')+(match[2]||'1').replaceAll(',','');
  }
  return {tokens,coefficients:tokens.map(Number)};
}
// Parser coverage includes grouping, Unicode signs/powers, exponents, exact zeros,
// and magnitude=1 suppression after rounding. These are harness checks, not Vitest.
const parserFixtures = [
  {coefficients:[-5781.4,49.69],text:'y = 49.7x − 5,781',expected:[-5781,49.7]},
  {coefficients:[3,-.5,2.1],text:'y = 2.1x² − 0.5x + 3',expected:[3,-.5,2.1]},
  {coefficients:[0,.000123,0,1.0002],text:'y = x³ + 1.23e-4x',expected:[0,.000123,0,1]},
  {coefficients:[0,0],text:'y = 0',expected:[0,0]},
  {coefficients:[-.000123,0,0,0,0,0,-1],text:'y = −x⁶ − 1.23e-4',expected:[-.000123,0,0,0,0,0,-1]}
];
for(const f of parserFixtures){
  const text=baseline.formatPolynomial(f.coefficients);
  if(text!==f.text)throw new Error('Formatter expectation mismatch: '+text);
  const parsed=parseEquation(text,f.coefficients.length-1);
  if(JSON.stringify(parsed.coefficients)!==JSON.stringify(f.expected))throw new Error('Parser mismatch');
}
const cases=[];
for(const c of fixtures.cases){
  const xs=c.x.map(Number),ys=c.y.map(Number);
  const at=[...c.x,...c.held,...c.extrapolation].map(Number);
  const fit=baseline.fitRegression(c.method,xs,ys,{degree:c.degree});
  const row={id:c.id,ok:fit.ok,n:fit.n};
  if(!fit.ok){row.reason=fit.reason;cases.push(row);continue;}
  const equation=baseline.fitEquation(fit);
  const display=parseEquation(equation,c.degree);
  const traceTokens=fit.coefficients.map(precise);
  const trace=traceTokens.map(Number);
  const roundtripTokens=fit.coefficients.map(x=>x.toPrecision(17));
  const expanded17=roundtripTokens.map(Number);
  if(!expanded17.every((v,i)=>Object.is(v,fit.coefficients[i])))throw new Error('17-digit round-trip mismatch');
  let basis;
  if(c.method==='polynomial'){
    const instrumentFit=instrument.fitRegression(c.method,xs,ys,{degree:c.degree});
    if(!instrumentFit.ok)throw new Error('Metadata fit status differs');
    if(!fit.coefficients.every((v,i)=>Object.is(v,instrumentFit.coefficients[i])))throw new Error('Instrumentation changed coefficients');
    if(!at.every(x=>Object.is(fit.predict(x),instrumentFit.predict(x))))throw new Error('Instrumentation changed predictions');
    for(const key of ['r2','adjustedR2','residualSe'])if(!Object.is(fit[key],instrumentFit[key]))throw new Error('Instrumentation changed measures');
    basis=instrumentFit.__basis;
  }else{
    const mx=xs.reduce((a,b)=>a+b,0)/xs.length;
    const my=ys.reduce((a,b)=>a+b,0)/ys.length;
    basis={origin:mx,scale:1,coefficients:[my,fit.slope]};
  }
  const makeCentered=(digits)=>{
    const origin=basis.origin.toPrecision(17), scale=basis.scale.toPrecision(17);
    const coefficientTokens=basis.coefficients.map(v=>v.toPrecision(digits));
    const coefficients=coefficientTokens.map(Number);
    return {origin,scale,coefficientTokens, predictions:at.map(x=>horner(coefficients,(x-Number(origin))/Number(scale)))};
  };
  Object.assign(row,{
    coefficients:fit.coefficients,equation,display_tokens:display.tokens,trace_tokens:traceTokens,roundtrip_tokens:roundtripTokens,
    reported:{r2:fit.r2??null,adjustedR2:fit.adjustedR2??null,residualSe:fit.residualSe??null,slopeSe:fit.slopeSe??null,r:fit.r??null},
    predictions:{internal:at.map(fit.predict),expanded_horner:at.map(x=>horner(fit.coefficients,x)),expanded_sum:at.map(x=>powerSum(fit.coefficients,x)),display_horner:at.map(x=>horner(display.coefficients,x)),display_sum:at.map(x=>powerSum(display.coefficients,x)),trace_horner:at.map(x=>horner(trace,x)),expanded17:at.map(x=>horner(expanded17,x))},
    centered6:makeCentered(6),centered17:makeCentered(17),
    r2_text:baseline.formatR2(fit.r2)
  });
  cases.push(row);
}
const result={schema:'R001-isolated-source-results-v1',executed_at_utc:new Date().toISOString(),node:process.version,v8:process.versions.v8,icu:process.versions.icu,baseline_sha256:sha(source),trace_sha256:sha(traceSource),frozen_sha256:sha(fixtureBytes),script_sha256:sha(readFileSync(fileURLToPath(import.meta.url))),parser_fixtures_passed:parserFixtures.length,metadata_instrumentation_assertions:'all available polynomial cases: identical coefficients, measures, predictions at every specified point',cases};
const out=resolve(root,'executed-results.json');
writeFileSync(out,JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({executed:cases.length,available:cases.filter(c=>c.ok).length,unavailable:cases.filter(c=>!c.ok).length,parser_checks:parserFixtures.length,output:out,sha256:sha(readFileSync(out))},null,2));
```

</details>

<details>
<summary>research/analyze.py</summary>

<!-- R001_FILE: research/analyze.py SHA256: 5310d2406cce49d53f9ec9155621f9e7d9c8930e0ae4017c3fffdedf42711831 -->
```python
"""Analyze frozen R001 source execution with exact arithmetic on binary64 values."""
from pathlib import Path
from fractions import Fraction as F
from decimal import Decimal, localcontext
import json, hashlib, sys

ROOT=Path(__file__).resolve().parent
fixtures=json.loads((ROOT/'frozen-fixtures.json').read_text())
raw=json.loads((ROOT/'executed-results.json').read_text())
if hashlib.sha256((ROOT/'frozen-fixtures.json').read_bytes()).hexdigest()!=raw['frozen_sha256']:
    raise SystemExit('Frozen fixture integrity failed')
def b64(v): return F(float(v))
def horner(c,x):
    y=F(0)
    for v in reversed(c): y=y*x+v
    return y
def dec(q):
    with localcontext() as ctx:
        ctx.prec=60
        return str(Decimal(q.numerator)/Decimal(q.denominator))
def sqrt(q):
    with localcontext() as ctx:
        ctx.prec=80
        return (Decimal(q.numerator)/Decimal(q.denominator)).sqrt()
def errors(pred,ref,n,h):
    e=[abs(p-q) for p,q in zip(pred,ref)]
    peak=max(e[:n+h],default=F(0))
    return {'fitted':float(max(e[:n],default=F(0))),'held':float(max(e[n:n+h],default=F(0))),'in_range':float(peak),'extrapolation':float(max(e[n+h:],default=F(0))),'peak_ratio':str(peak)}

out=[]
for c,r in zip(fixtures['cases'],raw['cases']):
    assert c['id']==r['id']
    row={'id':c['id'],'label':c['label'],'n':c['n'],'degree':c['degree'],'expected_available':c['expected_available'],'baseline_available':r['ok'],'availability_pass':c['expected_available']==r['ok'],'x_min':min(map(float,c['x'])),'x_max':max(map(float,c['x'])),'units':c['units'],'input_max_abs_x_rounding':float(F(c['input_max_abs_x_rounding'])),'input_max_abs_y_rounding':float(F(c['input_max_abs_y_rounding'])),'distinct_stored_x':c['stored_x_distinct']}
    if not r['ok']:
        row['reason']=r['reason'];out.append(row);continue
    n=c['n'];h=len(c['held']);d=c['degree']
    xs=list(map(b64,c['x']))
    ys=list(map(b64,c['y']))
    at=list(map(b64,c['x']+c['held']+c['extrapolation']))
    ref=list(map(F,c['oracle_stored']['predictions']))
    ref_intended=list(map(F,c['oracle_intended']['predictions']))
    variation=F(c['variation'])
    scale=max(map(abs,ys+ref[:n+h]))
    numeric=128*F(1,2**52)*scale+F(1,10**12)*variation
    measurement=F(c['measurement_tolerance'])
    tol=measurement+numeric
    visual=max(measurement,variation/F(200))+numeric
    representations={key:list(map(b64,values)) for key,values in r['predictions'].items()}
    representations['centered6']=list(map(b64,r['centered6']['predictions']))
    representations['centered17']=list(map(b64,r['centered17']['predictions']))
    representations['expanded_exact']=[horner(list(map(b64,r['coefficients'])),x) for x in at]
    representations['display_exact']=[horner(list(map(F,r['display_tokens'])),x) for x in at]
    representations['trace_exact']=[horner(list(map(F,r['trace_tokens'])),x) for x in at]
    metrics={}
    for name,pred in representations.items():
        e=errors(pred,ref,n,h)
        e['vs_baseline']=errors(pred,representations['internal'],n,h)['in_range']
        e['material_pass']=F(e['peak_ratio'])<=tol
        e['numeric_pass']=F(e['peak_ratio'])<=numeric
        e['visual_heuristic_pass']=F(e['peak_ratio'])<=visual
        metrics[name]=e
    residual=[y-p for y,p in zip(ys,representations['internal'][:n])]
    sse=sum((v*v for v in residual),F(0))
    sst=F(c['oracle_stored']['sst'])
    sse_ref=F(c['oracle_stored']['sse'])
    df=n-d-1
    reported_sse=b64(r['reported']['residualSe'])**2*df if df>0 and r['reported']['residualSe'] is not None else None
    sse_budget=2*tol*sum(map(abs,residual),F(0))+n*tol*tol
    direct_r2=1-sse/sst if sst else None
    measures={'oracle_sse':float(sse_ref),'direct_sse':float(sse),'reported_rse_implied_sse':float(reported_sse) if reported_sse is not None else None,'sse_budget':float(sse_budget),'sse_metric_abs_difference':float(abs(reported_sse-sse)) if reported_sse is not None else None,'sse_consistency_material_pass':abs(reported_sse-sse)<=sse_budget if reported_sse is not None else None,'direct_r2':float(direct_r2) if direct_r2 is not None else None,'reported_r2':r['reported']['r2'],'r2_abs_difference':float(abs(b64(r['reported']['r2'])-direct_r2)) if direct_r2 is not None else None,'reported_residual_se':r['reported']['residualSe'],'direct_residual_se':str(sqrt(sse/df)) if df>0 else None,'oracle_residual_se':str(sqrt(sse_ref/df)) if df>0 else None,'reported_adjusted_r2':r['reported']['adjustedR2'],'expected_undefined_residual_se':df==0,'expected_undefined_adjusted_r2':d>1 and df==0}
    if df>0:
        measures['rse_abs_difference']=str(abs(sqrt(sse/df)-Decimal(str(r['reported']['residualSe']))))
    centered_residual=[y-p for y,p in zip(ys,representations['centered17'][:n])]
    measures['centered17_direct_sse']=float(sum((v*v for v in centered_residual),F(0)))
    e_input=errors(ref,ref_intended,n,h)['in_range']
    coeff_ref=list(map(F,c['oracle_stored']['expanded_coefficients']))
    row.update({'tolerance':float(tol),'measurement_tolerance':float(measurement),'numeric_budget':float(numeric),'visual_heuristic_budget':float(visual),'response_range':float(variation),'representation_limited':numeric>measurement/10,'input_effect_in_range':e_input,'input_effect_exceeds_tolerance':e_input>float(tol),'metrics':metrics,'measures':measures,'equation':r['equation'],'trace_tokens':r['trace_tokens'],'coefficient_absolute_errors':[float(abs(b64(v)-q)) for v,q in zip(r['coefficients'],coeff_ref)],'basis_conversion_vs_baseline':metrics['expanded_exact']['vs_baseline'],'expanded_horner_vs_exact':errors(representations['expanded_horner'],representations['expanded_exact'],n,h)['in_range'],'display_binary_vs_exact':errors(representations['display_horner'],representations['display_exact'],n,h)['in_range']})
    out.append(row)

names=list(out[0]['metrics'])
available=[r for r in out if r['baseline_available']]
summary={'cases':len(out),'available':len(available),'unavailable':len(out)-len(available),'availability_passes':sum(r['availability_pass'] for r in out),'representation_material_passes':{name:sum(r['metrics'][name]['material_pass'] for r in available) for name in names},'metric_sse_consistency_failures':[r['id'] for r in available if r['measures']['sse_consistency_material_pass'] is False],'input_effect_failures':[r['id'] for r in available if r['input_effect_exceeds_tolerance']],'representation_limited':[r['id'] for r in available if r['representation_limited']]}
result={'schema':'R001-analysis-v1','source_run_sha256':hashlib.sha256((ROOT/'executed-results.json').read_bytes()).hexdigest(),'script_sha256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),'summary':summary,'cases':out}
(ROOT/'analysis-results.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps(summary,indent=2))
print('\nCase | predict | expanded exact | expanded Horner | equation Horner | trace Horner | centered 6 | centered 17 | tolerance')
for r in out:
    if not r['baseline_available']:
        print(r['id']+' UNAVAILABLE '+r['reason']);continue
    vals=[r['metrics'][k]['in_range'] for k in ['internal','expanded_exact','expanded_horner','display_horner','trace_horner','centered6','centered17']]+[r['tolerance']]
    print(r['id']+' | '+' | '.join(f'{v:.6g}' for v in vals))
```

</details>

<details>
<summary>research/frozen-fixtures.json</summary>

<!-- R001_FILE: research/frozen-fixtures.json SHA256: 977a61ee606ed9dc0c98fd00fbc406bffe31fe9db02e8e3bd817500a9e9a2c75 -->
```json
{
  "schema": "R001-frozen-fixtures-v1",
  "baseline": "63dfa75851ef57bb3782e6d7c1ef104784cd4064",
  "numeric_environment": "Node binary64 inputs from exact decimal strings; independent Python Fraction exact normal equations in affine coordinates",
  "gate": {
    "eps": "2^-52",
    "numeric_budget": "128*eps*max(abs(stored_y),abs(reference_in_range))+1e-12*response_range",
    "material_budget": "measurement_tolerance + numeric_budget",
    "visual_heuristic": "max(measurement_tolerance,0.005*response_range)+numeric_budget; no pixels measured",
    "resolution_limit": "If numeric_budget > measurement_tolerance/10, report representation-limited separately; do not silently relax",
    "residual_budget": "2*T*sum(abs(y-predict(x)))+n*T^2 for T=material_budget"
  },
  "candidates": [
    "unaltered baseline predictions",
    "returned coefficients round-tripped with 17 significant digits",
    "existing standardized polynomial basis serialized with 6-digit coefficients and 17-digit origin/scale",
    "same standardized basis with 17-digit coefficients/origin/scale",
    "linear centered evaluation my+slope*(x-mx), same baseline means and slope"
  ],
  "cases": [
    {
      "id": "C01",
      "label": "Linear ordinary",
      "method": "linear",
      "degree": 1,
      "n": 5,
      "x": [
        "-2",
        "-1",
        "0",
        "1",
        "2"
      ],
      "y": [
        "0.765433",
        "1",
        "1.234567",
        "1.469134",
        "1.703701"
      ],
      "held": [
        "-1.5",
        "-0.5",
        "0.5",
        "1.5"
      ],
      "extrapolation": [
        "-3",
        "3"
      ],
      "units": {
        "x": "mm from local origin",
        "y": "V"
      },
      "measurement_tolerance": ".001",
      "family": "linear",
      "recipe": "u=-2,-1,0,1,2; y=1.234567+0.234567u",
      "oracle_intended": {
        "available": true,
        "origin": "0/1",
        "scale": "2/1",
        "centered_coefficients": [
          "1234567/1000000",
          "234567/500000"
        ],
        "expanded_coefficients": [
          "1234567/1000000",
          "234567/1000000"
        ],
        "predictions": [
          "765433/1000000",
          "1/1",
          "1234567/1000000",
          "734567/500000",
          "1703701/1000000",
          "1765433/2000000",
          "2234567/2000000",
          "2703701/2000000",
          "634567/400000",
          "265433/500000",
          "484567/250000"
        ],
        "sse": "0/1",
        "sst": "55021677489/100000000000",
        "r2": "1/1",
        "residual_df": 3
      },
      "oracle_stored": {
        "available": true,
        "origin": "0/1",
        "scale": "2/1",
        "centered_coefficients": [
          "5559995481163911/4503599627370496",
          "1056395853793415/2251799813685248"
        ],
        "expanded_coefficients": [
          "5559995481163911/4503599627370496",
          "1056395853793415/4503599627370496"
        ],
        "predictions": [
          "3447203773577081/4503599627370496",
          "1/1",
          "5559995481163911/4503599627370496",
          "3308195667478663/2251799813685248",
          "7672787188750741/4503599627370496",
          "7950803400947577/9007199254740992",
          "10063595108534407/9007199254740992",
          "12176386816121237/9007199254740992",
          "14289178523708067/9007199254740992",
          "1195403959891833/2251799813685248",
          "2182295760636039/1125899906842624"
        ],
        "sse": "0/1",
        "sst": "5579860999559591205227486811125/10141204801825835211973625643008",
        "r2": "1/1",
        "residual_df": 3
      },
      "expected_available": true,
      "stored_x_distinct": 5,
      "input_max_abs_x_rounding": "0/1",
      "input_max_abs_y_rounding": "6339/70368744177664000000",
      "variation": "0.938268"
    },
    {
      "id": "C02",
      "label": "Linear translated",
      "method": "linear",
      "degree": 1,
      "n": 5,
      "x": [
        "999999998",
        "999999999",
        "1000000000",
        "1000000001",
        "1000000002"
      ],
      "y": [
        "0.765433",
        "1",
        "1.234567",
        "1.469134",
        "1.703701"
      ],
      "held": [
        "999999998.5",
        "999999999.5",
        "1000000000.5",
        "1000000001.5"
      ],
      "extrapolation": [],
      "units": {
        "x": "mm in translated coordinate",
        "y": "V"
      },
      "measurement_tolerance": ".001",
      "family": "linear",
      "recipe": "C01 with x=1000000000+u",
      "oracle_intended": {
        "available": true,
        "origin": "1000000000/1",
        "scale": "2/1",
        "centered_coefficients": [
          "1234567/1000000",
          "234567/500000"
        ],
        "expanded_coefficients": [
          "-234566998765433/1000000",
          "234567/1000000"
        ],
        "predictions": [
          "765433/1000000",
          "1/1",
          "1234567/1000000",
          "734567/500000",
          "1703701/1000000",
          "1765433/2000000",
          "2234567/2000000",
          "2703701/2000000",
          "634567/400000"
        ],
        "sse": "0/1",
        "sst": "55021677489/100000000000",
        "r2": "1/1",
        "residual_df": 3
      },
      "oracle_stored": {
        "available": true,
        "origin": "1000000000/1",
        "scale": "2/1",
        "centered_coefficients": [
          "5559995481163911/4503599627370496",
          "1056395853793415/2251799813685248"
        ],
        "expanded_coefficients": [
          "-1056395848233419518836089/4503599627370496",
          "1056395853793415/4503599627370496"
        ],
        "predictions": [
          "3447203773577081/4503599627370496",
          "1/1",
          "5559995481163911/4503599627370496",
          "3308195667478663/2251799813685248",
          "7672787188750741/4503599627370496",
          "7950803400947577/9007199254740992",
          "10063595108534407/9007199254740992",
          "12176386816121237/9007199254740992",
          "14289178523708067/9007199254740992"
        ],
        "sse": "0/1",
        "sst": "5579860999559591205227486811125/10141204801825835211973625643008",
        "r2": "1/1",
        "residual_df": 3
      },
      "expected_available": true,
      "stored_x_distinct": 5,
      "input_max_abs_x_rounding": "0/1",
      "input_max_abs_y_rounding": "6339/70368744177664000000",
      "variation": "0.938268"
    },
    {
      "id": "C03",
      "label": "Linear representable tiny range",
      "method": "linear",
      "degree": 1,
      "n": 5,
      "x": [
        "1073741823.9999980926513671875",
        "1073741823.99999904632568359375",
        "1073741824",
        "1073741824.00000095367431640625",
        "1073741824.0000019073486328125"
      ],
      "y": [
        "0.765433",
        "1",
        "1.234567",
        "1.469134",
        "1.703701"
      ],
      "held": [
        "1073741823.999998569488525390625",
        "1073741823.999999523162841796875",
        "1073741824.000000476837158203125",
        "1073741824.000001430511474609375"
      ],
      "extrapolation": [],
      "units": {
        "x": "s from epoch; sampling interval 2^-20 s",
        "y": "V"
      },
      "measurement_tolerance": ".001",
      "family": "linear",
      "recipe": "C01 with x=2^30+u*2^-20; X and held X exactly binary64 representable",
      "oracle_intended": {
        "available": true,
        "origin": "1073741824/1",
        "scale": "1/524288",
        "centered_coefficients": [
          "1234567/1000000",
          "234567/500000"
        ],
        "expanded_coefficients": [
          "-264098963448352549241/1000000",
          "3843145728/15625"
        ],
        "predictions": [
          "765433/1000000",
          "1/1",
          "1234567/1000000",
          "734567/500000",
          "1703701/1000000",
          "1765433/2000000",
          "2234567/2000000",
          "2703701/2000000",
          "634567/400000"
        ],
        "sse": "0/1",
        "sst": "55021677489/100000000000",
        "r2": "1/1",
        "residual_df": 3
      },
      "oracle_stored": {
        "available": true,
        "origin": "1073741824/1",
        "scale": "1/524288",
        "centered_coefficients": [
          "5559995481163911/4503599627370496",
          "1056395853793415/2251799813685248"
        ],
        "expanded_coefficients": [
          "-1189395993374934631830331357049/4503599627370496",
          "1056395853793415/4294967296"
        ],
        "predictions": [
          "3447203773577081/4503599627370496",
          "1/1",
          "5559995481163911/4503599627370496",
          "3308195667478663/2251799813685248",
          "7672787188750741/4503599627370496",
          "7950803400947577/9007199254740992",
          "10063595108534407/9007199254740992",
          "12176386816121237/9007199254740992",
          "14289178523708067/9007199254740992"
        ],
        "sse": "0/1",
        "sst": "5579860999559591205227486811125/10141204801825835211973625643008",
        "r2": "1/1",
        "residual_df": 3
      },
      "expected_available": true,
      "stored_x_distinct": 5,
      "input_max_abs_x_rounding": "0/1",
      "input_max_abs_y_rounding": "6339/70368744177664000000",
      "variation": "0.938268"
    },
    {
      "id": "C04",
      "label": "Quadratic simple control",
      "method": "polynomial",
      "degree": 2,
      "n": 5,
      "x": [
        "-2",
        "-1",
        "0",
        "1",
        "2"
      ],
      "y": [
        "0.625",
        "0.78125",
        "1",
        "1.28125",
        "1.625"
      ],
      "held": [
        "-1.5",
        "-0.5",
        "0.5",
        "1.5"
      ],
      "extrapolation": [
        "-3",
        "3"
      ],
      "units": {
        "x": "mm from local origin",
        "y": "V"
      },
      "measurement_tolerance": ".001",
      "family": "measurement",
      "recipe": "u=-2..2; y=1+u/4+u^2/32",
      "oracle_intended": {
        "available": true,
        "origin": "0/1",
        "scale": "2/1",
        "centered_coefficients": [
          "1/1",
          "1/2",
          "1/8"
        ],
        "expanded_coefficients": [
          "1/1",
          "1/4",
          "1/32"
        ],
        "predictions": [
          "5/8",
          "25/32",
          "1/1",
          "41/32",
          "13/8",
          "89/128",
          "113/128",
          "145/128",
          "185/128",
          "17/32",
          "65/32"
        ],
        "sse": "0/1",
        "sst": "327/512",
        "r2": "1/1",
        "residual_df": 2
      },
      "oracle_stored": {
        "available": true,
        "origin": "0/1",
        "scale": "2/1",
        "centered_coefficients": [
          "1/1",
          "1/2",
          "1/8"
        ],
        "expanded_coefficients": [
          "1/1",
          "1/4",
          "1/32"
        ],
        "predictions": [
          "5/8",
          "25/32",
          "1/1",
          "41/32",
          "13/8",
          "89/128",
          "113/128",
          "145/128",
          "185/128",
          "17/32",
          "65/32"
        ],
        "sse": "0/1",
        "sst": "327/512",
        "r2": "1/1",
        "residual_df": 2
      },
      "expected_available": true,
      "stored_x_distinct": 5,
      "input_max_abs_x_rounding": "0/1",
      "input_max_abs_y_rounding": "0/1",
      "variation": "1"
    },
    {
      "id": "C05",
      "label": "Quadratic noisy measurement",
      "method": "polynomial",
      "degree": 2,
      "n": 5,
      "x": [
        "-2",
        "-1",
        "0",
        "1",
        "2"
      ],
      "y": [
        "0.903801",
        "1.034167",
        "1.235167",
        "1.503301",
        "1.842069"
      ],
      "held": [
        "-1.5",
        "-0.5",
        "0.5",
        "1.5"
      ],
      "extrapolation": [
        "-3",
        "3"
      ],
      "units": {
        "x": "mm from local origin",
        "y": "V"
      },
      "measurement_tolerance": ".001",
      "family": "measurement",
      "recipe": "q(u)=1.234567+.234567u+.034567u^2; residuals=[1,-4,6,-4,1]/10000",
      "oracle_intended": {
        "available": true,
        "origin": "0/1",
        "scale": "2/1",
        "centered_coefficients": [
          "1234567/1000000",
          "234567/500000",
          "34567/250000"
        ],
        "expanded_coefficients": [
          "1234567/1000000",
          "234567/1000000",
          "34567/1000000"
        ],
        "predictions": [
          "903701/1000000",
          "1034567/1000000",
          "1234567/1000000",
          "1503701/1000000",
          "1841969/1000000",
          "3841969/4000000",
          "4503701/4000000",
          "5441969/4000000",
          "6656773/4000000",
          "841969/1000000",
          "2249371/1000000"
        ],
        "sse": "7/10000000",
        "sst": "70868219967/125000000000",
        "r2": "70868132467/70868219967",
        "residual_df": 2
      },
      "oracle_stored": {
        "available": true,
        "origin": "0/1",
        "scale": "2/1",
        "centered_coefficients": [
          "389199683681473773/315251973915934720",
          "10563958537934151/22517998136852480",
          "2179462996470423/15762598695796736"
        ],
        "expanded_coefficients": [
          "389199683681473773/315251973915934720",
          "10563958537934151/45035996273704960",
          "2179462996470423/63050394783186944"
        ],
        "predictions": [
          "284893524079804119/315251973915934720",
          "326149288898286831/315251973915934720",
          "389199683681473773/315251973915934720",
          "94808941685872989/63050394783186944",
          "580684363141960347/315251973915934720",
          "242237662194765957/252201579132747776",
          "202828661453881299/180143985094819840",
          "245084495605617903/180143985094819840",
          "2098560828160298469/1261007895663738880",
          "37918912746575091/45035996273704960",
          "101302663974179997/45035996273704960"
        ],
        "sse": "15528719852791897103208383/22183885503994014526192306094080",
        "sst": "28747565305047595378552209248813/50706024009129176059868128215040",
        "r2": "201232708675815522979511813407563/201232957135333167649865464741691",
        "residual_df": 2
      },
      "expected_available": true,
      "stored_x_distinct": 5,
      "input_max_abs_x_rounding": "0/1",
      "input_max_abs_y_rounding": "6763/70368744177664000000",
      "variation": "0.938268"
    },
    {
      "id": "C06",
      "label": "Quadratic translated",
      "method": "polynomial",
      "degree": 2,
      "n": 5,
      "x": [
        "999999998",
        "999999999",
        "1000000000",
        "1000000001",
        "1000000002"
      ],
      "y": [
        "0.903801",
        "1.034167",
        "1.235167",
        "1.503301",
        "1.842069"
      ],
      "held": [
        "999999998.5",
        "999999999.5",
        "1000000000.5",
        "1000000001.5"
      ],
      "extrapolation": [],
      "units": {
        "x": "mm in translated coordinate",
        "y": "V"
      },
      "measurement_tolerance": ".001",
      "family": "measurement",
      "recipe": "C05 with x=1000000000+u",
      "oracle_intended": {
        "available": true,
        "origin": "1000000000/1",
        "scale": "2/1",
        "centered_coefficients": [
          "1234567/1000000",
          "234567/500000",
          "34567/250000"
        ],
        "expanded_coefficients": [
          "34566999765433001234567/1000000",
          "-69133999765433/1000000",
          "34567/1000000"
        ],
        "predictions": [
          "903701/1000000",
          "1034567/1000000",
          "1234567/1000000",
          "1503701/1000000",
          "1841969/1000000",
          "3841969/4000000",
          "4503701/4000000",
          "5441969/4000000",
          "6656773/4000000"
        ],
        "sse": "7/10000000",
        "sst": "70868219967/125000000000",
        "r2": "70868132467/70868219967",
        "residual_df": 2
      },
      "oracle_stored": {
        "available": true,
        "origin": "1000000000/1",
        "scale": "2/1",
        "centered_coefficients": [
          "389199683681473773/315251973915934720",
          "10563958537934151/22517998136852480",
          "2179462996470423/15762598695796736"
        ],
        "expanded_coefficients": [
          "10897314908404405623660626681473773/315251973915934720",
          "-21794629890756520234460943/315251973915934720",
          "2179462996470423/63050394783186944"
        ],
        "predictions": [
          "284893524079804119/315251973915934720",
          "326149288898286831/315251973915934720",
          "389199683681473773/315251973915934720",
          "94808941685872989/63050394783186944",
          "580684363141960347/315251973915934720",
          "242237662194765957/252201579132747776",
          "202828661453881299/180143985094819840",
          "245084495605617903/180143985094819840",
          "2098560828160298469/1261007895663738880"
        ],
        "sse": "15528719852791897103208383/22183885503994014526192306094080",
        "sst": "28747565305047595378552209248813/50706024009129176059868128215040",
        "r2": "201232708675815522979511813407563/201232957135333167649865464741691",
        "residual_df": 2
      },
      "expected_available": true,
      "stored_x_distinct": 5,
      "input_max_abs_x_rounding": "0/1",
      "input_max_abs_y_rounding": "6763/70368744177664000000",
      "variation": "0.938268"
    },
    {
      "id": "C07",
      "label": "Quadratic X unit change",
      "method": "polynomial",
      "degree": 2,
      "n": 5,
      "x": [
        "-0.002",
        "-0.001",
        "0",
        "0.001",
        "0.002"
      ],
      "y": [
        "0.903801",
        "1.034167",
        "1.235167",
        "1.503301",
        "1.842069"
      ],
      "held": [
        "-0.0015",
        "-0.0005",
        "0.0005",
        "0.0015"
      ],
      "extrapolation": [],
      "units": {
        "x": "m from local origin",
        "y": "V"
      },
      "measurement_tolerance": ".001",
      "family": "measurement",
      "recipe": "C05 with x=u/1000",
      "oracle_intended": {
        "available": true,
        "origin": "0/1",
        "scale": "1/500",
        "centered_coefficients": [
          "1234567/1000000",
          "234567/500000",
          "34567/250000"
        ],
        "expanded_coefficients": [
          "1234567/1000000",
          "234567/1000",
          "34567/1"
        ],
        "predictions": [
          "903701/1000000",
          "1034567/1000000",
          "1234567/1000000",
          "1503701/1000000",
          "1841969/1000000",
          "3841969/4000000",
          "4503701/4000000",
          "5441969/4000000",
          "6656773/4000000"
        ],
        "sse": "7/10000000",
        "sst": "70868219967/125000000000",
        "r2": "70868132467/70868219967",
        "residual_df": 2
      },
      "oracle_stored": {
        "available": true,
        "origin": "0/1",
        "scale": "1152921504606847/576460752303423488",
        "centered_coefficients": [
          "389199683681473773/315251973915934720",
          "10563958537934151/22517998136852480",
          "2179462996470423/15762598695796736"
        ],
        "expanded_coefficients": [
          "389199683681473773/315251973915934720",
          "1352186692855571328/5764607523034235",
          "321631968912080295089685359486828544/9304595970494411497708274969863"
        ],
        "predictions": [
          "284893524079804119/315251973915934720",
          "326149288898286831/315251973915934720",
          "389199683681473773/315251973915934720",
          "94808941685872989/63050394783186944",
          "580684363141960347/315251973915934720",
          "242237662194765957/252201579132747776",
          "202828661453881299/180143985094819840",
          "245084495605617903/180143985094819840",
          "2098560828160298469/1261007895663738880"
        ],
        "sse": "15528719852791897103208383/22183885503994014526192306094080",
        "sst": "28747565305047595378552209248813/50706024009129176059868128215040",
        "r2": "201232708675815522979511813407563/201232957135333167649865464741691",
        "residual_df": 2
      },
      "expected_available": true,
      "stored_x_distinct": 5,
      "input_max_abs_x_rounding": "3/72057594037927936000",
      "input_max_abs_y_rounding": "6763/70368744177664000000",
      "variation": "0.938268"
    },
    {
      "id": "C08",
      "label": "Quadratic translate and X units",
      "method": "polynomial",
      "degree": 2,
      "n": 5,
      "x": [
        "999999.998",
        "999999.999",
        "1000000",
        "1000000.001",
        "1000000.002"
      ],
      "y": [
        "0.903801",
        "1.034167",
        "1.235167",
        "1.503301",
        "1.842069"
      ],
      "held": [
        "999999.9985",
        "999999.9995",
        "1000000.0005",
        "1000000.0015"
      ],
      "extrapolation": [],
      "units": {
        "x": "m in translated coordinate",
        "y": "V"
      },
      "measurement_tolerance": ".001",
      "family": "measurement",
      "recipe": "C05 with x=(1000000000+u)/1000",
      "oracle_intended": {
        "available": true,
        "origin": "1000000/1",
        "scale": "1/500",
        "centered_coefficients": [
          "1234567/1000000",
          "234567/500000",
          "34567/250000"
        ],
        "expanded_coefficients": [
          "34566999765433001234567/1000000",
          "-69133999765433/1000",
          "34567/1"
        ],
        "predictions": [
          "903701/1000000",
          "1034567/1000000",
          "1234567/1000000",
          "1503701/1000000",
          "1841969/1000000",
          "3841969/4000000",
          "4503701/4000000",
          "5441969/4000000",
          "6656773/4000000"
        ],
        "sse": "7/10000000",
        "sst": "70868219967/125000000000",
        "r2": "70868132467/70868219967",
        "residual_df": 2
      },
      "oracle_stored": {
        "available": true,
        "origin": "1000000/1",
        "scale": "17179869/8589934592",
        "centered_coefficients": [
          "529751116778390944667043906119833343429611543/429098718787022508216279689305928910476673024",
          "3117930202382915955026818330581/6646139991303983366017147469824",
          "158214993665438378901672317029392202849439889/1144263250098726688576745838149143761271128064"
        ],
        "expanded_coefficients": [
          "912047357786827593384063006202825280742269827731850834563202578649787746433/26384914208548643005046598694012009737571094834701920108544",
          "-5096461777843586971087976933010364450070368361850816279349919/73718598695142128518912751304019269731560055635968",
          "3293511235703884347720130144557056/95279055486901522313010135369"
        ],
        "predictions": [
          "286128881841524828507875545548825315892270829236809580692117/316618970502583716060559184328144116850853138016423041302528",
          "3412120162313703136750349297433617089353403461997495006821/3298114276068580375630824836751501217196386854337740013568",
          "529751116778390944667043906119833343429611543/429098718787022508216279689305928910476673024",
          "158700088868884911436734700462152326427242563930796571396517/105539656834194572020186394776048038950284379338807680434176",
          "291601163299326385426603427881436041140276597599669491555753/158309485251291858030279592164072058425426569008211520651264",
          "101370022332343583827865382636263076420280065343704144595069/105539656834194572020186394776048038950284379338807680434176",
          "29707441247386569179130979447956956046248958408603811968691/26384914208548643005046598694012009737571094834701920108544",
          "143585883944977728243717374688697328799076068054731782688873/105539656834194572020186394776048038950284379338807680434176",
          "175638384962621446415782362477409160602293952910897410587423/105539656834194572020186394776048038950284379338807680434176"
        ],
        "sse": "1996313471434855708780587404043999667259428828434491028760321510354159/2851850155147732176563867016834454051617173379438632025813606732134954827776",
        "sst": "28747565305047595378552209248813/50706024009129176059868128215040",
        "r2": "8084211782749944730267739567556645608384026158787179976417523640093339251941/8084221764317301904546283470493665828382362455931322148872667441700891022736",
        "residual_df": 2
      },
      "expected_available": true,
      "stored_x_distinct": 5,
      "input_max_abs_x_rounding": "51/1073741824000",
      "input_max_abs_y_rounding": "6763/70368744177664000000",
      "variation": "0.938268"
    },
    {
      "id": "C09",
      "label": "Quadratic Y unit change",
      "method": "polynomial",
      "degree": 2,
      "n": 5,
      "x": [
        "-2",
        "-1",
        "0",
        "1",
        "2"
      ],
      "y": [
        "903.801",
        "1034.167",
        "1235.167",
        "1503.301",
        "1842.069"
      ],
      "held": [
        "-1.5",
        "-0.5",
        "0.5",
        "1.5"
      ],
      "extrapolation": [],
      "units": {
        "x": "mm from local origin",
        "y": "mV"
      },
      "measurement_tolerance": "1",
      "family": "measurement",
      "recipe": "C05 with response multiplied by 1000",
      "oracle_intended": {
        "available": true,
        "origin": "0/1",
        "scale": "2/1",
        "centered_coefficients": [
          "1234567/1000",
          "234567/500",
          "34567/250"
        ],
        "expanded_coefficients": [
          "1234567/1000",
          "234567/1000",
          "34567/1000"
        ],
        "predictions": [
          "903701/1000",
          "1034567/1000",
          "1234567/1000",
          "1503701/1000",
          "1841969/1000",
          "3841969/4000",
          "4503701/4000",
          "5441969/4000",
          "6656773/4000"
        ],
        "sse": "7/10",
        "sst": "70868219967/125000",
        "r2": "70868132467/70868219967",
        "residual_df": 2
      },
      "oracle_stored": {
        "available": true,
        "origin": "0/1",
        "scale": "2/1",
        "centered_coefficients": [
          "380077816095189209/307863255777280",
          "10316365759701319/21990232555520",
          "2128381832490649/15393162788864"
        ],
        "expanded_coefficients": [
          "380077816095189209/307863255777280",
          "10316365759701319/43980465111040",
          "2128381832490649/61572651155456"
        ],
        "predictions": [
          "278216332109183723/307863255777280",
          "318505164939733221/307863255777280",
          "380077816095189209/307863255777280",
          "462934285575551687/307863255777280",
          "113414914676164131/61572651155456",
          "1182801084935380643/1231453023109120",
          "39614972940211189/35184372088832",
          "239340327739861221/175921860444160",
          "2049375808750291439/1231453023109120"
        ],
        "sse": "473898921288950029647609857/676998458984192337835458560",
        "sst": "54831629381270589443921520700289/96714065569170333976494080",
        "r2": "383820931769972837157420997292166/383821405668894126107450644902023",
        "residual_df": 2
      },
      "expected_available": true,
      "stored_x_distinct": 5,
      "input_max_abs_x_rounding": "0/1",
      "input_max_abs_y_rounding": "23/274877906944000",
      "variation": "938.268"
    },
    {
      "id": "C10",
      "label": "Quadratic Y offset",
      "method": "polynomial",
      "degree": 2,
      "n": 5,
      "x": [
        "-2",
        "-1",
        "0",
        "1",
        "2"
      ],
      "y": [
        "1000.903801",
        "1001.034167",
        "1001.235167",
        "1001.503301",
        "1001.842069"
      ],
      "held": [
        "-1.5",
        "-0.5",
        "0.5",
        "1.5"
      ],
      "extrapolation": [],
      "units": {
        "x": "mm from local origin",
        "y": "V with +1000 reference shift"
      },
      "measurement_tolerance": ".001",
      "family": "measurement",
      "recipe": "C05 with response increased by 1000",
      "oracle_intended": {
        "available": true,
        "origin": "0/1",
        "scale": "2/1",
        "centered_coefficients": [
          "1001234567/1000000",
          "234567/500000",
          "34567/250000"
        ],
        "expanded_coefficients": [
          "1001234567/1000000",
          "234567/1000000",
          "34567/1000000"
        ],
        "predictions": [
          "1000903701/1000000",
          "1001034567/1000000",
          "1001234567/1000000",
          "1001503701/1000000",
          "1001841969/1000000",
          "4003841969/4000000",
          "4004503701/4000000",
          "4005441969/4000000",
          "4006656773/4000000"
        ],
        "sse": "7/10000000",
        "sst": "70868219967/125000000000",
        "r2": "70868132467/70868219967",
        "residual_df": 2
      },
      "oracle_stored": {
        "available": true,
        "origin": "0/1",
        "scale": "2/1",
        "centered_coefficients": [
          "308243333593375193/307863255777280",
          "10316365759701/21990232555520",
          "2128381832491/15393162788864"
        ],
        "expanded_coefficients": [
          "308243333593375193/307863255777280",
          "10316365759701/43980465111040",
          "2128381832491/61572651155456"
        ],
        "predictions": [
          "308141472109389199/307863255777280",
          "308181760942219741/307863255777280",
          "308243333593375193/307863255777280",
          "61665238012571111/61572651155456",
          "308430330350660827/307863255777280",
          "246527164838811085/246290604621824",
          "176119935308861059/175921860444160",
          "176161200771899863/175921860444160",
          "1233502398917870309/1231453023109120"
        ],
        "sse": "473898921343488005411/676998458984192337835458560",
        "sst": "54831629381267839930114431/96714065569170333976494080",
        "r2": "383820931769953536022795606/383821405668874879510801017",
        "residual_df": 2
      },
      "expected_available": true,
      "stored_x_distinct": 5,
      "input_max_abs_x_rounding": "0/1",
      "input_max_abs_y_rounding": "3213/68719476736000000",
      "variation": "0.938268"
    },
    {
      "id": "C11",
      "label": "Quadratic repeated X",
      "method": "polynomial",
      "degree": 2,
      "n": 7,
      "x": [
        "-2",
        "-2",
        "-1",
        "0",
        "1",
        "2",
        "2"
      ],
      "y": [
        "0.903701",
        "0.903701",
        "1.034567",
        "1.234567",
        "1.503701",
        "1.841969",
        "1.841969"
      ],
      "held": [
        "-1.5",
        "-0.5",
        "0.5",
        "1.5"
      ],
      "extrapolation": [],
      "units": {
        "x": "mm from local origin",
        "y": "V"
      },
      "measurement_tolerance": ".001",
      "family": "availability",
      "recipe": "Repeated rows, but five distinct X values",
      "oracle_intended": {
        "available": true,
        "origin": "0/1",
        "scale": "2/1",
        "centered_coefficients": [
          "1234567/1000000",
          "234567/500000",
          "34567/250000"
        ],
        "expanded_coefficients": [
          "1234567/1000000",
          "234567/1000000",
          "34567/1000000"
        ],
        "predictions": [
          "903701/1000000",
          "903701/1000000",
          "1034567/1000000",
          "1234567/1000000",
          "1503701/1000000",
          "1841969/1000000",
          "1841969/1000000",
          "3841969/4000000",
          "4503701/4000000",
          "5441969/4000000",
          "6656773/4000000"
        ],
        "sse": "0/1",
        "sst": "887203057137/875000000000",
        "r2": "1/1",
        "residual_df": 4
      },
      "oracle_stored": {
        "available": true,
        "origin": "0/1",
        "scale": "2/1",
        "centered_coefficients": [
          "63939948033384977/51791395714760704",
          "148555666939699/316659348799488",
          "10741639054032799/77687093572141056"
        ],
        "expanded_coefficients": [
          "63939948033384977/51791395714760704",
          "148555666939699/633318697598976",
          "10741639054032799/310748374288564224"
        ],
        "predictions": [
          "421235424889424659/466122561432846336",
          "421235424889424659/466122561432846336",
          "964470040027791055/932245122865692672",
          "63939948033384977/51791395714760704",
          "1401817923498264911/932245122865692672",
          "858583308359898515/466122561432846336",
          "858583308359898515/466122561432846336",
          "1193885620817060783/1242993497154256896",
          "4198553292095342885/3728980491462770688",
          "5073249059036290597/3728980491462770688",
          "2068581387758008495/1242993497154256896"
        ],
        "sse": "13/8396917575911791555514162032410624",
        "sst": "287913852903433754159874618307561/283953734451123385935261518004224",
        "r2": "59598167551010787111094045989665036/59598167551010787111094045989665127",
        "residual_df": 4
      },
      "expected_available": true,
      "stored_x_distinct": 5,
      "input_max_abs_x_rounding": "0/1",
      "input_max_abs_y_rounding": "1607/35184372088832000000",
      "variation": "0.938268"
    },
    {
      "id": "C12",
      "label": "Too few distinct X",
      "method": "polynomial",
      "degree": 2,
      "n": 4,
      "x": [
        "0",
        "0",
        "1",
        "1"
      ],
      "y": [
        "1",
        "2",
        "3",
        "4"
      ],
      "held": [],
      "extrapolation": [],
      "units": {
        "x": "mm from local origin",
        "y": "V"
      },
      "measurement_tolerance": ".001",
      "family": "availability",
      "recipe": "Four rows, two distinct X; expected unavailable",
      "oracle_intended": {
        "available": false
      },
      "oracle_stored": {
        "available": false
      },
      "expected_available": false,
      "stored_x_distinct": 2,
      "input_max_abs_x_rounding": "0/1",
      "input_max_abs_y_rounding": "0/1",
      "variation": "3"
    },
    {
      "id": "C13",
      "label": "Lost distinguishability",
      "method": "polynomial",
      "degree": 2,
      "n": 3,
      "x": [
        "18014398509481983",
        "18014398509481984",
        "18014398509481985"
      ],
      "y": [
        "1",
        "2",
        "3"
      ],
      "held": [],
      "extrapolation": [],
      "units": {
        "x": "diagnostic offset units",
        "y": "V"
      },
      "measurement_tolerance": ".001",
      "family": "availability",
      "recipe": "x=2^54+[-1,0,1] becomes one binary64 X; not solver error",
      "oracle_intended": {
        "available": true,
        "origin": "18014398509481984/1",
        "scale": "1/1",
        "centered_coefficients": [
          "2/1",
          "1/1",
          "0/1"
        ],
        "expanded_coefficients": [
          "-18014398509481982/1",
          "1/1",
          "0/1"
        ],
        "predictions": [
          "1/1",
          "2/1",
          "3/1"
        ],
        "sse": "0/1",
        "sst": "2/1",
        "r2": "1/1",
        "residual_df": 0
      },
      "oracle_stored": {
        "available": false
      },
      "expected_available": false,
      "stored_x_distinct": 1,
      "input_max_abs_x_rounding": "1/1",
      "input_max_abs_y_rounding": "0/1",
      "variation": "2"
    },
    {
      "id": "C14",
      "label": "Constant linear X",
      "method": "linear",
      "degree": 1,
      "n": 3,
      "x": [
        "3",
        "3",
        "3"
      ],
      "y": [
        "1",
        "2",
        "3"
      ],
      "held": [],
      "extrapolation": [],
      "units": {
        "x": "mm from local origin",
        "y": "V"
      },
      "measurement_tolerance": ".001",
      "family": "availability",
      "recipe": "Constant X; expected unavailable",
      "oracle_intended": {
        "available": false
      },
      "oracle_stored": {
        "available": false
      },
      "expected_available": false,
      "stored_x_distinct": 1,
      "input_max_abs_x_rounding": "0/1",
      "input_max_abs_y_rounding": "0/1",
      "variation": "2"
    },
    {
      "id": "C15",
      "label": "Too few polynomial rows",
      "method": "polynomial",
      "degree": 2,
      "n": 2,
      "x": [
        "0",
        "1"
      ],
      "y": [
        "1",
        "2"
      ],
      "held": [],
      "extrapolation": [],
      "units": {
        "x": "mm from local origin",
        "y": "V"
      },
      "measurement_tolerance": ".001",
      "family": "availability",
      "recipe": "Two rows for degree 2; expected unavailable",
      "oracle_intended": {
        "available": false
      },
      "oracle_stored": {
        "available": false
      },
      "expected_available": false,
      "stored_x_distinct": 2,
      "input_max_abs_x_rounding": "0/1",
      "input_max_abs_y_rounding": "0/1",
      "variation": "1"
    },
    {
      "id": "C16",
      "label": "Degree 2 one residual df",
      "method": "polynomial",
      "degree": 2,
      "n": 4,
      "x": [
        "-1.5",
        "-0.5",
        "0.5",
        "1.5"
      ],
      "y": [
        "1.328125",
        "1.078125",
        "0.953125",
        "0.953125"
      ],
      "held": [
        "-1",
        "0",
        "1"
      ],
      "extrapolation": [],
      "units": {
        "x": "mm from local origin",
        "y": "V"
      },
      "measurement_tolerance": ".001",
      "family": "degree-controls",
      "recipe": "n=d+2; u_i=i-(n-1)/2; y=1+sum((-1)^k*u^k/2^(k+2),k=1..2)",
      "oracle_intended": {
        "available": true,
        "origin": "0/1",
        "scale": "3/2",
        "centered_coefficients": [
          "1/1",
          "-3/16",
          "9/64"
        ],
        "expanded_coefficients": [
          "1/1",
          "-1/8",
          "1/16"
        ],
        "predictions": [
          "85/64",
          "69/64",
          "61/64",
          "61/64",
          "19/16",
          "1/1",
          "15/16"
        ],
        "sse": "0/1",
        "sst": "3/32",
        "r2": "1/1",
        "residual_df": 1
      },
      "oracle_stored": {
        "available": true,
        "origin": "0/1",
        "scale": "3/2",
        "centered_coefficients": [
          "1/1",
          "-3/16",
          "9/64"
        ],
        "expanded_coefficients": [
          "1/1",
          "-1/8",
          "1/16"
        ],
        "predictions": [
          "85/64",
          "69/64",
          "61/64",
          "61/64",
          "19/16",
          "1/1",
          "15/16"
        ],
        "sse": "0/1",
        "sst": "3/32",
        "r2": "1/1",
        "residual_df": 1
      },
      "expected_available": true,
      "stored_x_distinct": 4,
      "input_max_abs_x_rounding": "0/1",
      "input_max_abs_y_rounding": "0/1",
      "variation": "0.375"
    },
    {
      "id": "C17",
      "label": "Degree 3 one residual df",
      "method": "polynomial",
      "degree": 3,
      "n": 5,
      "x": [
        "-2",
        "-1",
        "0",
        "1",
        "2"
      ],
      "y": [
        "1.75",
        "1.21875",
        "1",
        "0.90625",
        "0.75"
      ],
      "held": [
        "-1.5",
        "-0.5",
        "0.5",
        "1.5"
      ],
      "extrapolation": [],
      "units": {
        "x": "mm from local origin",
        "y": "V"
      },
      "measurement_tolerance": ".001",
      "family": "degree-controls",
      "recipe": "n=d+2; u_i=i-(n-1)/2; y=1+sum((-1)^k*u^k/2^(k+2),k=1..3)",
      "oracle_intended": {
        "available": true,
        "origin": "0/1",
        "scale": "2/1",
        "centered_coefficients": [
          "1/1",
          "-1/4",
          "1/4",
          "-1/4"
        ],
        "expanded_coefficients": [
          "1/1",
          "-1/8",
          "1/16",
          "-1/32"
        ],
        "predictions": [
          "7/4",
          "39/32",
          "1/1",
          "29/32",
          "3/4",
          "367/256",
          "277/256",
          "243/256",
          "217/256"
        ],
        "sse": "0/1",
        "sst": "309/512",
        "r2": "1/1",
        "residual_df": 1
      },
      "oracle_stored": {
        "available": true,
        "origin": "0/1",
        "scale": "2/1",
        "centered_coefficients": [
          "1/1",
          "-1/4",
          "1/4",
          "-1/4"
        ],
        "expanded_coefficients": [
          "1/1",
          "-1/8",
          "1/16",
          "-1/32"
        ],
        "predictions": [
          "7/4",
          "39/32",
          "1/1",
          "29/32",
          "3/4",
          "367/256",
          "277/256",
          "243/256",
          "217/256"
        ],
        "sse": "0/1",
        "sst": "309/512",
        "r2": "1/1",
        "residual_df": 1
      },
      "expected_available": true,
      "stored_x_distinct": 5,
      "input_max_abs_x_rounding": "0/1",
      "input_max_abs_y_rounding": "0/1",
      "variation": "1"
    },
    {
      "id": "C18",
      "label": "Degree 4 one residual df",
      "method": "polynomial",
      "degree": 4,
      "n": 6,
      "x": [
        "-2.5",
        "-1.5",
        "-0.5",
        "0.5",
        "1.5",
        "2.5"
      ],
      "y": [
        "2.8017578125",
        "1.5126953125",
        "1.0830078125",
        "0.9501953125",
        "0.9267578125",
        "1.2001953125"
      ],
      "held": [
        "-2",
        "-1",
        "0",
        "1",
        "2"
      ],
      "extrapolation": [],
      "units": {
        "x": "mm from local origin",
        "y": "V"
      },
      "measurement_tolerance": ".001",
      "family": "degree-controls",
      "recipe": "n=d+2; u_i=i-(n-1)/2; y=1+sum((-1)^k*u^k/2^(k+2),k=1..4)",
      "oracle_intended": {
        "available": true,
        "origin": "0/1",
        "scale": "5/2",
        "centered_coefficients": [
          "1/1",
          "-5/16",
          "25/64",
          "-125/256",
          "625/1024"
        ],
        "expanded_coefficients": [
          "1/1",
          "-1/8",
          "1/16",
          "-1/32",
          "1/64"
        ],
        "predictions": [
          "2869/1024",
          "1549/1024",
          "1109/1024",
          "973/1024",
          "949/1024",
          "1229/1024",
          "2/1",
          "79/64",
          "1/1",
          "59/64",
          "1/1"
        ],
        "sse": "0/1",
        "sst": "250025/98304",
        "r2": "1/1",
        "residual_df": 1
      },
      "oracle_stored": {
        "available": true,
        "origin": "0/1",
        "scale": "5/2",
        "centered_coefficients": [
          "1/1",
          "-5/16",
          "25/64",
          "-125/256",
          "625/1024"
        ],
        "expanded_coefficients": [
          "1/1",
          "-1/8",
          "1/16",
          "-1/32",
          "1/64"
        ],
        "predictions": [
          "2869/1024",
          "1549/1024",
          "1109/1024",
          "973/1024",
          "949/1024",
          "1229/1024",
          "2/1",
          "79/64",
          "1/1",
          "59/64",
          "1/1"
        ],
        "sse": "0/1",
        "sst": "250025/98304",
        "r2": "1/1",
        "residual_df": 1
      },
      "expected_available": true,
      "stored_x_distinct": 6,
      "input_max_abs_x_rounding": "0/1",
      "input_max_abs_y_rounding": "0/1",
      "variation": "1.875"
    },
    {
      "id": "C19",
      "label": "Degree 5 one residual df",
      "method": "polynomial",
      "degree": 5,
      "n": 7,
      "x": [
        "-3",
        "-2",
        "-1",
        "0",
        "1",
        "2",
        "3"
      ],
      "y": [
        "5.9453125",
        "2.25",
        "1.2421875",
        "1",
        "0.9140625",
        "0.75",
        "-0.2890625"
      ],
      "held": [
        "-2.5",
        "-1.5",
        "-0.5",
        "0.5",
        "1.5",
        "2.5"
      ],
      "extrapolation": [],
      "units": {
        "x": "mm from local origin",
        "y": "V"
      },
      "measurement_tolerance": ".001",
      "family": "degree-controls",
      "recipe": "n=d+2; u_i=i-(n-1)/2; y=1+sum((-1)^k*u^k/2^(k+2),k=1..5)",
      "oracle_intended": {
        "available": true,
        "origin": "0/1",
        "scale": "3/1",
        "centered_coefficients": [
          "1/1",
          "-3/8",
          "9/16",
          "-27/32",
          "81/64",
          "-243/128"
        ],
        "expanded_coefficients": [
          "1/1",
          "-1/8",
          "1/16",
          "-1/32",
          "1/64",
          "-1/128"
        ],
        "predictions": [
          "761/128",
          "9/4",
          "159/128",
          "1/1",
          "117/128",
          "3/4",
          "-37/128",
          "14601/4096",
          "6439/4096",
          "4437/4096",
          "3891/4096",
          "3553/4096",
          "1791/4096"
        ],
        "sse": "0/1",
        "sst": "100353/4096",
        "r2": "1/1",
        "residual_df": 1
      },
      "oracle_stored": {
        "available": true,
        "origin": "0/1",
        "scale": "3/1",
        "centered_coefficients": [
          "1/1",
          "-3/8",
          "9/16",
          "-27/32",
          "81/64",
          "-243/128"
        ],
        "expanded_coefficients": [
          "1/1",
          "-1/8",
          "1/16",
          "-1/32",
          "1/64",
          "-1/128"
        ],
        "predictions": [
          "761/128",
          "9/4",
          "159/128",
          "1/1",
          "117/128",
          "3/4",
          "-37/128",
          "14601/4096",
          "6439/4096",
          "4437/4096",
          "3891/4096",
          "3553/4096",
          "1791/4096"
        ],
        "sse": "0/1",
        "sst": "100353/4096",
        "r2": "1/1",
        "residual_df": 1
      },
      "expected_available": true,
      "stored_x_distinct": 7,
      "input_max_abs_x_rounding": "0/1",
      "input_max_abs_y_rounding": "0/1",
      "variation": "6.234375"
    },
    {
      "id": "C20",
      "label": "Degree 6 one residual df",
      "method": "polynomial",
      "degree": 6,
      "n": 8,
      "x": [
        "-3.5",
        "-2.5",
        "-1.5",
        "-0.5",
        "0.5",
        "1.5",
        "2.5",
        "3.5"
      ],
      "y": [
        "17.17169189453125",
        "4.51837158203125",
        "1.61651611328125",
        "1.08331298828125",
        "0.95001220703125",
        "0.91192626953125",
        "1.39093017578125",
        "5.41046142578125"
      ],
      "held": [
        "-3",
        "-2",
        "-1",
        "0",
        "1",
        "2",
        "3"
      ],
      "extrapolation": [],
      "units": {
        "x": "mm from local origin",
        "y": "V"
      },
      "measurement_tolerance": ".001",
      "family": "degree-controls",
      "recipe": "n=d+2; u_i=i-(n-1)/2; y=1+sum((-1)^k*u^k/2^(k+2),k=1..6)",
      "oracle_intended": {
        "available": true,
        "origin": "0/1",
        "scale": "7/2",
        "centered_coefficients": [
          "1/1",
          "-7/16",
          "49/64",
          "-343/256",
          "2401/1024",
          "-16807/4096",
          "117649/16384"
        ],
        "expanded_coefficients": [
          "1/1",
          "-1/8",
          "1/16",
          "-1/32",
          "1/64",
          "-1/128",
          "1/256"
        ],
        "predictions": [
          "281341/16384",
          "74029/16384",
          "26485/16384",
          "17749/16384",
          "15565/16384",
          "14941/16384",
          "22789/16384",
          "88645/16384",
          "2251/256",
          "5/2",
          "319/256",
          "1/1",
          "235/256",
          "1/1",
          "655/256"
        ],
        "sse": "0/1",
        "sst": "225912393/1048576",
        "r2": "1/1",
        "residual_df": 1
      },
      "oracle_stored": {
        "available": true,
        "origin": "0/1",
        "scale": "7/2",
        "centered_coefficients": [
          "1/1",
          "-7/16",
          "49/64",
          "-343/256",
          "2401/1024",
          "-16807/4096",
          "117649/16384"
        ],
        "expanded_coefficients": [
          "1/1",
          "-1/8",
          "1/16",
          "-1/32",
          "1/64",
          "-1/128",
          "1/256"
        ],
        "predictions": [
          "281341/16384",
          "74029/16384",
          "26485/16384",
          "17749/16384",
          "15565/16384",
          "14941/16384",
          "22789/16384",
          "88645/16384",
          "2251/256",
          "5/2",
          "319/256",
          "1/1",
          "235/256",
          "1/1",
          "655/256"
        ],
        "sse": "0/1",
        "sst": "225912393/1048576",
        "r2": "1/1",
        "residual_df": 1
      },
      "expected_available": true,
      "stored_x_distinct": 8,
      "input_max_abs_x_rounding": "0/1",
      "input_max_abs_y_rounding": "0/1",
      "variation": "16.259765625"
    },
    {
      "id": "C21",
      "label": "Degree 2 interpolation offset",
      "method": "polynomial",
      "degree": 2,
      "n": 3,
      "x": [
        "999999",
        "1000000",
        "1000001"
      ],
      "y": [
        "1.1875",
        "1",
        "0.9375"
      ],
      "held": [
        "999999.5",
        "1000000.5"
      ],
      "extrapolation": [],
      "units": {
        "x": "mm with 1000000 offset",
        "y": "V"
      },
      "measurement_tolerance": ".001",
      "family": "degree-controls",
      "recipe": "n=d+1; u_i=i-d/2; x=1000000+u; y=1+sum((-1)^k*u^k/2^(k+2),k=1..2); expected available with residual SE/adjusted R2 undefined",
      "oracle_intended": {
        "available": true,
        "origin": "1000000/1",
        "scale": "1/1",
        "centered_coefficients": [
          "1/1",
          "-1/8",
          "1/16"
        ],
        "expanded_coefficients": [
          "62500125001/1",
          "-1000001/8",
          "1/16"
        ],
        "predictions": [
          "19/16",
          "1/1",
          "15/16",
          "69/64",
          "61/64"
        ],
        "sse": "0/1",
        "sst": "13/384",
        "r2": "1/1",
        "residual_df": 0
      },
      "oracle_stored": {
        "available": true,
        "origin": "1000000/1",
        "scale": "1/1",
        "centered_coefficients": [
          "1/1",
          "-1/8",
          "1/16"
        ],
        "expanded_coefficients": [
          "62500125001/1",
          "-1000001/8",
          "1/16"
        ],
        "predictions": [
          "19/16",
          "1/1",
          "15/16",
          "69/64",
          "61/64"
        ],
        "sse": "0/1",
        "sst": "13/384",
        "r2": "1/1",
        "residual_df": 0
      },
      "expected_available": true,
      "stored_x_distinct": 3,
      "input_max_abs_x_rounding": "0/1",
      "input_max_abs_y_rounding": "0/1",
      "variation": "0.25"
    },
    {
      "id": "C22",
      "label": "Degree 3 interpolation offset",
      "method": "polynomial",
      "degree": 3,
      "n": 4,
      "x": [
        "999998.5",
        "999999.5",
        "1000000.5",
        "1000001.5"
      ],
      "y": [
        "1.43359375",
        "1.08203125",
        "0.94921875",
        "0.84765625"
      ],
      "held": [
        "999999",
        "1000000",
        "1000001"
      ],
      "extrapolation": [],
      "units": {
        "x": "mm with 1000000 offset",
        "y": "V"
      },
      "measurement_tolerance": ".001",
      "family": "degree-controls",
      "recipe": "n=d+1; u_i=i-d/2; x=1000000+u; y=1+sum((-1)^k*u^k/2^(k+2),k=1..3); expected available with residual SE/adjusted R2 undefined",
      "oracle_intended": {
        "available": true,
        "origin": "1000000/1",
        "scale": "3/2",
        "centered_coefficients": [
          "1/1",
          "-3/16",
          "9/64",
          "-27/256"
        ],
        "expanded_coefficients": [
          "31250062500125001/1",
          "-750001000001/8",
          "1500001/16",
          "-1/32"
        ],
        "predictions": [
          "367/256",
          "277/256",
          "243/256",
          "217/256",
          "39/32",
          "1/1",
          "29/32"
        ],
        "sse": "0/1",
        "sst": "3213/16384",
        "r2": "1/1",
        "residual_df": 0
      },
      "oracle_stored": {
        "available": true,
        "origin": "1000000/1",
        "scale": "3/2",
        "centered_coefficients": [
          "1/1",
          "-3/16",
          "9/64",
          "-27/256"
        ],
        "expanded_coefficients": [
          "31250062500125001/1",
          "-750001000001/8",
          "1500001/16",
          "-1/32"
        ],
        "predictions": [
          "367/256",
          "277/256",
          "243/256",
          "217/256",
          "39/32",
          "1/1",
          "29/32"
        ],
        "sse": "0/1",
        "sst": "3213/16384",
        "r2": "1/1",
        "residual_df": 0
      },
      "expected_available": true,
      "stored_x_distinct": 4,
      "input_max_abs_x_rounding": "0/1",
      "input_max_abs_y_rounding": "0/1",
      "variation": "0.5859375"
    },
    {
      "id": "C23",
      "label": "Degree 4 interpolation offset",
      "method": "polynomial",
      "degree": 4,
      "n": 5,
      "x": [
        "999998",
        "999999",
        "1000000",
        "1000001",
        "1000002"
      ],
      "y": [
        "2",
        "1.234375",
        "1",
        "0.921875",
        "1"
      ],
      "held": [
        "999998.5",
        "999999.5",
        "1000000.5",
        "1000001.5"
      ],
      "extrapolation": [],
      "units": {
        "x": "mm with 1000000 offset",
        "y": "V"
      },
      "measurement_tolerance": ".001",
      "family": "degree-controls",
      "recipe": "n=d+1; u_i=i-d/2; x=1000000+u; y=1+sum((-1)^k*u^k/2^(k+2),k=1..4); expected available with residual SE/adjusted R2 undefined",
      "oracle_intended": {
        "available": true,
        "origin": "1000000/1",
        "scale": "2/1",
        "centered_coefficients": [
          "1/1",
          "-1/4",
          "1/4",
          "-1/4",
          "1/4"
        ],
        "expanded_coefficients": [
          "15625031250062500125001/1",
          "-500000750001000001/8",
          "1500001500001/16",
          "-2000001/32",
          "1/64"
        ],
        "predictions": [
          "2/1",
          "79/64",
          "1/1",
          "59/64",
          "1/1",
          "1549/1024",
          "1109/1024",
          "973/1024",
          "949/1024"
        ],
        "sse": "0/1",
        "sst": "8127/10240",
        "r2": "1/1",
        "residual_df": 0
      },
      "oracle_stored": {
        "available": true,
        "origin": "1000000/1",
        "scale": "2/1",
        "centered_coefficients": [
          "1/1",
          "-1/4",
          "1/4",
          "-1/4",
          "1/4"
        ],
        "expanded_coefficients": [
          "15625031250062500125001/1",
          "-500000750001000001/8",
          "1500001500001/16",
          "-2000001/32",
          "1/64"
        ],
        "predictions": [
          "2/1",
          "79/64",
          "1/1",
          "59/64",
          "1/1",
          "1549/1024",
          "1109/1024",
          "973/1024",
          "949/1024"
        ],
        "sse": "0/1",
        "sst": "8127/10240",
        "r2": "1/1",
        "residual_df": 0
      },
      "expected_available": true,
      "stored_x_distinct": 5,
      "input_max_abs_x_rounding": "0/1",
      "input_max_abs_y_rounding": "0/1",
      "variation": "1.078125"
    },
    {
      "id": "C24",
      "label": "Degree 5 interpolation offset",
      "method": "polynomial",
      "degree": 5,
      "n": 6,
      "x": [
        "999997.5",
        "999998.5",
        "999999.5",
        "1000000.5",
        "1000001.5",
        "1000002.5"
      ],
      "y": [
        "3.564697265625",
        "1.572021484375",
        "1.083251953125",
        "0.949951171875",
        "0.867431640625",
        "0.437255859375"
      ],
      "held": [
        "999998",
        "999999",
        "1000000",
        "1000001",
        "1000002"
      ],
      "extrapolation": [],
      "units": {
        "x": "mm with 1000000 offset",
        "y": "V"
      },
      "measurement_tolerance": ".001",
      "family": "degree-controls",
      "recipe": "n=d+1; u_i=i-d/2; x=1000000+u; y=1+sum((-1)^k*u^k/2^(k+2),k=1..5); expected available with residual SE/adjusted R2 undefined",
      "oracle_intended": {
        "available": true,
        "origin": "1000000/1",
        "scale": "5/2",
        "centered_coefficients": [
          "1/1",
          "-5/16",
          "25/64",
          "-125/256",
          "625/1024",
          "-3125/4096"
        ],
        "expanded_coefficients": [
          "7812515625031250062500125001/1",
          "-312500500000750001000001/8",
          "1250001500001500001/16",
          "-2500002000001/32",
          "2500001/64",
          "-1/128"
        ],
        "predictions": [
          "14601/4096",
          "6439/4096",
          "4437/4096",
          "3891/4096",
          "3553/4096",
          "1791/4096",
          "9/4",
          "159/128",
          "1/1",
          "117/128",
          "3/4"
        ],
        "sse": "0/1",
        "sst": "156731657/25165824",
        "r2": "1/1",
        "residual_df": 0
      },
      "oracle_stored": {
        "available": true,
        "origin": "1000000/1",
        "scale": "5/2",
        "centered_coefficients": [
          "1/1",
          "-5/16",
          "25/64",
          "-125/256",
          "625/1024",
          "-3125/4096"
        ],
        "expanded_coefficients": [
          "7812515625031250062500125001/1",
          "-312500500000750001000001/8",
          "1250001500001500001/16",
          "-2500002000001/32",
          "2500001/64",
          "-1/128"
        ],
        "predictions": [
          "14601/4096",
          "6439/4096",
          "4437/4096",
          "3891/4096",
          "3553/4096",
          "1791/4096",
          "9/4",
          "159/128",
          "1/1",
          "117/128",
          "3/4"
        ],
        "sse": "0/1",
        "sst": "156731657/25165824",
        "r2": "1/1",
        "residual_df": 0
      },
      "expected_available": true,
      "stored_x_distinct": 6,
      "input_max_abs_x_rounding": "0/1",
      "input_max_abs_y_rounding": "0/1",
      "variation": "3.12744140625"
    },
    {
      "id": "C25",
      "label": "Degree 6 interpolation offset",
      "method": "polynomial",
      "degree": 6,
      "n": 7,
      "x": [
        "999997",
        "999998",
        "999999",
        "1000000",
        "1000001",
        "1000002",
        "1000003"
      ],
      "y": [
        "8.79296875",
        "2.5",
        "1.24609375",
        "1",
        "0.91796875",
        "1",
        "2.55859375"
      ],
      "held": [
        "999997.5",
        "999998.5",
        "999999.5",
        "1000000.5",
        "1000001.5",
        "1000002.5"
      ],
      "extrapolation": [],
      "units": {
        "x": "mm with 1000000 offset",
        "y": "V"
      },
      "measurement_tolerance": ".001",
      "family": "degree-controls",
      "recipe": "n=d+1; u_i=i-d/2; x=1000000+u; y=1+sum((-1)^k*u^k/2^(k+2),k=1..6); expected available with residual SE/adjusted R2 undefined",
      "oracle_intended": {
        "available": true,
        "origin": "1000000/1",
        "scale": "3/1",
        "centered_coefficients": [
          "1/1",
          "-3/8",
          "9/16",
          "-27/32",
          "81/64",
          "-243/128",
          "729/256"
        ],
        "expanded_coefficients": [
          "3906257812515625031250062500125001/1",
          "-187500312500500000750001000001/8",
          "937501250001500001500001/16",
          "-2500002500002000001/32",
          "3750002500001/64",
          "-3000001/128",
          "1/256"
        ],
        "predictions": [
          "2251/256",
          "5/2",
          "319/256",
          "1/1",
          "235/256",
          "1/1",
          "655/256",
          "74029/16384",
          "26485/16384",
          "17749/16384",
          "15565/16384",
          "14941/16384",
          "22789/16384"
        ],
        "sse": "0/1",
        "sst": "5521311/114688",
        "r2": "1/1",
        "residual_df": 0
      },
      "oracle_stored": {
        "available": true,
        "origin": "1000000/1",
        "scale": "3/1",
        "centered_coefficients": [
          "1/1",
          "-3/8",
          "9/16",
          "-27/32",
          "81/64",
          "-243/128",
          "729/256"
        ],
        "expanded_coefficients": [
          "3906257812515625031250062500125001/1",
          "-187500312500500000750001000001/8",
          "937501250001500001500001/16",
          "-2500002500002000001/32",
          "3750002500001/64",
          "-3000001/128",
          "1/256"
        ],
        "predictions": [
          "2251/256",
          "5/2",
          "319/256",
          "1/1",
          "235/256",
          "1/1",
          "655/256",
          "74029/16384",
          "26485/16384",
          "17749/16384",
          "15565/16384",
          "14941/16384",
          "22789/16384"
        ],
        "sse": "0/1",
        "sst": "5521311/114688",
        "r2": "1/1",
        "residual_df": 0
      },
      "expected_available": true,
      "stored_x_distinct": 7,
      "input_max_abs_x_rounding": "0/1",
      "input_max_abs_y_rounding": "0/1",
      "variation": "7.875"
    },
    {
      "id": "C26",
      "label": "NIST Pontius",
      "method": "polynomial",
      "degree": 2,
      "n": 40,
      "x": [
        "150000",
        "300000",
        "450000",
        "600000",
        "750000",
        "900000",
        "1050000",
        "1200000",
        "1350000",
        "1500000",
        "1650000",
        "1800000",
        "1950000",
        "2100000",
        "2250000",
        "2400000",
        "2550000",
        "2700000",
        "2850000",
        "3000000",
        "150000",
        "300000",
        "450000",
        "600000",
        "750000",
        "900000",
        "1050000",
        "1200000",
        "1350000",
        "1500000",
        "1650000",
        "1800000",
        "1950000",
        "2100000",
        "2250000",
        "2400000",
        "2550000",
        "2700000",
        "2850000",
        "3000000"
      ],
      "y": [
        "0.11019",
        "0.21956",
        "0.32949",
        "0.43899",
        "0.54803",
        "0.65694",
        "0.76562",
        "0.87487",
        "0.98292",
        "1.09146",
        "1.20001",
        "1.30822",
        "1.41599",
        "1.52399",
        "1.63194",
        "1.73947",
        "1.84646",
        "1.95392",
        "2.06128",
        "2.16844",
        "0.11052",
        "0.22018",
        "0.32939",
        "0.43886",
        "0.54798",
        "0.65739",
        "0.76596",
        "0.87474",
        "0.983",
        "1.0915",
        "1.20004",
        "1.30818",
        "1.41613",
        "1.52408",
        "1.63159",
        "1.73965",
        "1.84696",
        "1.95445",
        "2.06177",
        "2.16829"
      ],
      "held": [
        "225000",
        "1125000",
        "2175000",
        "2925000"
      ],
      "extrapolation": [
        "0",
        "3150000"
      ],
      "units": {
        "x": "NIST source load units (unspecified)",
        "y": "NIST source deflection units (unspecified)"
      },
      "measurement_tolerance": ".000005",
      "family": "NIST",
      "recipe": "Exact NIST decimal tokens; 5e-6 fidelity budget = half last supplied Y decimal place, not asserted instrument accuracy",
      "oracle_intended": {
        "available": true,
        "origin": "1575000/1",
        "scale": "1425000/1",
        "centered_coefficients": [
          "3666643/3200000",
          "28811893/28000000",
          "-20539/3200000"
        ],
        "expanded_coefficients": [
          "51191/76000000",
          "58418321/79800000000000",
          "-1081/342000000000000000"
        ],
        "predictions": [
          "3091517/28000000",
          "117043639/532000000",
          "35054557/106400000",
          "233426261/532000000",
          "291504067/532000000",
          "349506203/532000000",
          "58204667/76000000",
          "93056693/106400000",
          "523058591/532000000",
          "30566213/28000000",
          "638381833/532000000",
          "695929949/532000000",
          "150680479/106400000",
          "115828453/76000000",
          "868120277/532000000",
          "925365713/532000000",
          "982535479/532000000",
          "41585183/21280000",
          "1096648001/532000000",
          "60715303/28000000",
          "3091517/28000000",
          "117043639/532000000",
          "35054557/106400000",
          "233426261/532000000",
          "291504067/532000000",
          "349506203/532000000",
          "58204667/76000000",
          "93056693/106400000",
          "523058591/532000000",
          "30566213/28000000",
          "638381833/532000000",
          "695929949/532000000",
          "150680479/106400000",
          "115828453/76000000",
          "868120277/532000000",
          "925365713/532000000",
          "982535479/532000000",
          "41585183/21280000",
          "1096648001/532000000",
          "60715303/28000000",
          "351602759/2128000000",
          "1745470103/2128000000",
          "3357876731/2128000000",
          "236869229/112000000",
          "51191/76000000",
          "172922549/76000000"
        ],
        "sse": "82865261/53200000000000",
        "sst": "1248322870563/80000000000",
        "r2": "830134626059134/830134708924395",
        "residual_df": 37
      },
      "oracle_stored": {
        "available": true,
        "origin": "1575000/1",
        "scale": "1425000/1",
        "centered_coefficients": [
          "27246601880026052213/23779006032516218880",
          "1297572305786386019/1261007895663738880",
          "-106836844822280267/16645304222761353216"
        ],
        "expanded_coefficients": [
          "27665252222965903/41072828601618923520",
          "190396053655217789/260082878480646144000000",
          "-5622991832751593/1778966888807619624960000000000"
        ],
        "predictions": [
          "6126100116052202771/55484347409204510720",
          "33133111879150600663/150600371539269386240",
          "1041953152962729542459/3162607802324657111040",
          "92510741141111756237/210840520154977140736",
          "577639747308001005737/1054202600774885703680",
          "2077727527384709563427/3162607802324657111040",
          "115337427309466475343/150600371539269386240",
          "921998193422087424513/1054202600774885703680",
          "88841524219631669641/90360222923561631744",
          "104620068962464681027/95836600070444154880",
          "115000647408755769179/95836600070444154880",
          "4137130613869926164483/3162607802324657111040",
          "1492930007968097272873/1054202600774885703680",
          "45904758043733689003/30120074307853877248",
          "5160759325933162744571/3162607802324657111040",
          "261955677044174667447/150600371539269386240",
          "1946976423525184386921/1054202600774885703680",
          "325281025467200956721/166453042227613532160",
          "434619990522097537813/210840520154977140736",
          "120312463025254172443/55484347409204510720",
          "6126100116052202771/55484347409204510720",
          "33133111879150600663/150600371539269386240",
          "1041953152962729542459/3162607802324657111040",
          "92510741141111756237/210840520154977140736",
          "577639747308001005737/1054202600774885703680",
          "2077727527384709563427/3162607802324657111040",
          "115337427309466475343/150600371539269386240",
          "921998193422087424513/1054202600774885703680",
          "88841524219631669641/90360222923561631744",
          "104620068962464681027/95836600070444154880",
          "115000647408755769179/95836600070444154880",
          "4137130613869926164483/3162607802324657111040",
          "1492930007968097272873/1054202600774885703680",
          "45904758043733689003/30120074307853877248",
          "5160759325933162744571/3162607802324657111040",
          "261955677044174667447/150600371539269386240",
          "1946976423525184386921/1054202600774885703680",
          "325281025467200956721/166453042227613532160",
          "434619990522097537813/210840520154977140736",
          "120312463025254172443/55484347409204510720",
          "104509551591379320373/632521560464931422208",
          "2594096506800856643801/3162607802324657111040",
          "1663478563393642520291/1054202600774885703680",
          "955515907864828994879/451801114617808158720",
          "27665252222965903/41072828601618923520",
          "93452871268842759271/41072828601618923520"
        ],
        "sse": "2335298377347786009214166066171/1499275717901931477738180815062302720",
        "sst": "101275983113460048926230870313094037/6490371073168534535663120411525120",
        "r2": "23394749763910893954173321828158656376/23394752099209271301959331042324722547",
        "residual_df": 37
      },
      "expected_available": true,
      "stored_x_distinct": 20,
      "input_max_abs_x_rounding": "0/1",
      "input_max_abs_y_rounding": "603/3518437208883200000",
      "variation": "2.05825"
    }
  ]
}
```

</details>

<details>
<summary>research/freeze-receipt.json</summary>

<!-- R001_FILE: research/freeze-receipt.json SHA256: 06cc3bb77ee4f008087e168ba0ac57a94a4f729b7b220eb1e2b2c66d82715d39 -->
```json
{
  "frozen_at_utc": "2026-10-22T13:07:47.415769+00:00",
  "fixture_file": "frozen-fixtures.json",
  "bytes": 70361,
  "sha256": "977a61ee606ed9dc0c98fd00fbc406bffe31fe9db02e8e3bd817500a9e9a2c75",
  "cases": 26,
  "baseline_or_candidate_runs_before_freeze": false,
  "pontius_transcription_sha256": "255dfc23825a7d1ec7e30577344989d0d6dc79cebabb0d7da27db21ff29fcddd"
}
```

</details>

<details>
<summary>research/external/Pontius.web-transcribed.dat</summary>

<!-- R001_FILE: research/external/Pontius.web-transcribed.dat SHA256: 255dfc23825a7d1ec7e30577344989d0d6dc79cebabb0d7da27db21ff29fcddd -->
```text
NIST/ITL StRD
Dataset Name: Pontius
Procedure: Linear Least Squares Regression
Reference: Pontius, P., NIST. Load Cell Calibration.
Data: 1 Response Variable (y), 1 Predictor Variable (x), 40 Observations
Model: y = B0 + B1*x + B2*(x**2)
Certified Regression Statistics
Parameter Estimate Standard Deviation of Estimate
B0 0.673565789473684E-03 0.107938612033077E-03
B1 0.732059160401003E-06 0.157817399981659E-09
B2 -0.316081871345029E-14 0.486652849992036E-16
Residual Standard Deviation 0.205177424076185E-03
R-Squared 0.999999900178537
Certified Analysis of Variance Table
Source DegreesOfFreedom SumsOfSquares MeanSquares FStatistic
Regression 2 15.6040343244198 7.80201716220991 185330865.995752
Residual 37 0.155761768796992E-05 0.420977753505385E-07
Data: y x
.11019 150000
.21956 300000
.32949 450000
.43899 600000
.54803 750000
.65694 900000
.76562 1050000
.87487 1200000
.98292 1350000
1.09146 1500000
1.20001 1650000
1.30822 1800000
1.41599 1950000
1.52399 2100000
1.63194 2250000
1.73947 2400000
1.84646 2550000
1.95392 2700000
2.06128 2850000
2.16844 3000000
.11052 150000
.22018 300000
.32939 450000
.43886 600000
.54798 750000
.65739 900000
.76596 1050000
.87474 1200000
.98300 1350000
1.09150 1500000
1.20004 1650000
1.30818 1800000
1.41613 1950000
1.52408 2100000
1.63159 2250000
1.73965 2400000
1.84696 2550000
1.95445 2700000
2.06177 2850000
2.16829 3000000
```

</details>

<details>
<summary>research/observed/executed-results.json</summary>

<!-- R001_FILE: research/observed/executed-results.json SHA256: 39382428325ba96a186e427171ba7ef3633328f523abf5d6ab5d67711305329c -->
```json
{
  "schema": "R001-isolated-source-results-v1",
  "executed_at_utc": "2026-10-22T13:08:53.125Z",
  "node": "v24.19.0",
  "v8": "13.6.233.17-node.51",
  "icu": "78.3",
  "baseline_sha256": "f29ed8bb097eb49f4be4906cbac257b040588f89a51fab41a5353b33b74fda96",
  "trace_sha256": "873c9069d754b4a93a27f1c56a96e30c5148b3027d151d7e698e282660795d27",
  "frozen_sha256": "977a61ee606ed9dc0c98fd00fbc406bffe31fe9db02e8e3bd817500a9e9a2c75",
  "script_sha256": "2dca5d90de894978ea066e163b5d490a9cc16479002d6adb8ff44f322730e7b1",
  "parser_fixtures_passed": 5,
  "metadata_instrumentation_assertions": "all available polynomial cases: identical coefficients, measures, predictions at every specified point",
  "cases": [
    {
      "id": "C01",
      "ok": true,
      "n": 5,
      "coefficients": [
        1.234567,
        0.23456699999999997
      ],
      "equation": "y = 0.235x + 1.23",
      "display_tokens": [
        "1.23",
        "0.235"
      ],
      "trace_tokens": [
        "1.23457",
        "0.234567"
      ],
      "roundtrip_tokens": [
        "1.2345670000000000",
        "0.23456699999999997"
      ],
      "reported": {
        "r2": 1,
        "adjustedR2": null,
        "residualSe": 0,
        "slopeSe": 0,
        "r": 1
      },
      "predictions": {
        "internal": [
          0.765433,
          1,
          1.234567,
          1.469134,
          1.703701,
          0.8827165,
          1.1172835,
          1.3518504999999998,
          1.5864175,
          0.5308660000000001,
          1.9382679999999999
        ],
        "expanded_horner": [
          0.765433,
          1,
          1.234567,
          1.469134,
          1.703701,
          0.8827165,
          1.1172835,
          1.3518504999999998,
          1.5864175,
          0.5308660000000001,
          1.9382679999999999
        ],
        "expanded_sum": [
          0.765433,
          1,
          1.234567,
          1.469134,
          1.703701,
          0.8827165,
          1.1172835,
          1.3518504999999998,
          1.5864175,
          0.5308660000000001,
          1.9382679999999999
        ],
        "display_horner": [
          0.76,
          0.995,
          1.23,
          1.4649999999999999,
          1.7,
          0.8775,
          1.1125,
          1.3475,
          1.5825,
          0.525,
          1.935
        ],
        "display_sum": [
          0.76,
          0.995,
          1.23,
          1.4649999999999999,
          1.7,
          0.8775,
          1.1125,
          1.3475,
          1.5825,
          0.525,
          1.935
        ],
        "trace_horner": [
          0.765436,
          1.000003,
          1.23457,
          1.469137,
          1.7037039999999999,
          0.8827194999999999,
          1.1172864999999998,
          1.3518535,
          1.5864205,
          0.5308689999999999,
          1.9382709999999999
        ],
        "expanded17": [
          0.765433,
          1,
          1.234567,
          1.469134,
          1.703701,
          0.8827165,
          1.1172835,
          1.3518504999999998,
          1.5864175,
          0.5308660000000001,
          1.9382679999999999
        ]
      },
      "centered6": {
        "origin": "0.0000000000000000",
        "scale": "1.0000000000000000",
        "coefficientTokens": [
          "1.23457",
          "0.234567"
        ],
        "predictions": [
          0.765436,
          1.000003,
          1.23457,
          1.469137,
          1.7037039999999999,
          0.8827194999999999,
          1.1172864999999998,
          1.3518535,
          1.5864205,
          0.5308689999999999,
          1.9382709999999999
        ]
      },
      "centered17": {
        "origin": "0.0000000000000000",
        "scale": "1.0000000000000000",
        "coefficientTokens": [
          "1.2345670000000000",
          "0.23456699999999997"
        ],
        "predictions": [
          0.765433,
          1,
          1.234567,
          1.469134,
          1.703701,
          0.8827165,
          1.1172835,
          1.3518504999999998,
          1.5864175,
          0.5308660000000001,
          1.9382679999999999
        ]
      },
      "r2_text": "1.000"
    },
    {
      "id": "C02",
      "ok": true,
      "n": 5,
      "coefficients": [
        -234566998.76543298,
        0.23456699999999997
      ],
      "equation": "y = 0.235x − 234,566,999",
      "display_tokens": [
        "-234566999",
        "0.235"
      ],
      "trace_tokens": [
        "-234567000",
        "0.234567"
      ],
      "roundtrip_tokens": [
        "-234566998.76543298",
        "0.23456699999999997"
      ],
      "reported": {
        "r2": 1,
        "adjustedR2": null,
        "residualSe": 0,
        "slopeSe": 0,
        "r": 1
      },
      "predictions": {
        "internal": [
          0.7654329836368561,
          1,
          1.2345669865608215,
          1.469133973121643,
          1.703700989484787,
          0.8827164769172668,
          1.1172834932804108,
          1.3518504798412323,
          1.5864174962043762
        ],
        "expanded_horner": [
          0.7654329836368561,
          1,
          1.2345669865608215,
          1.469133973121643,
          1.703700989484787,
          0.8827164769172668,
          1.1172834932804108,
          1.3518504798412323,
          1.5864174962043762
        ],
        "expanded_sum": [
          0.7654329836368561,
          1,
          1.2345669865608215,
          1.469133973121643,
          1.703700989484787,
          0.8827164769172668,
          1.1172834932804108,
          1.3518504798412323,
          1.5864174962043762
        ],
        "display_horner": [
          433000.5300000012,
          433000.7649999857,
          433001,
          433001.2349999845,
          433001.4699999988,
          433000.64749997854,
          433000.88249999285,
          433001.11749997735,
          433001.35249999166
        ],
        "display_sum": [
          433000.5300000012,
          433000.7649999857,
          433001,
          433001.2349999845,
          433001.4699999988,
          433000.64749997854,
          433000.88249999285,
          433001.11749997735,
          433001.35249999166
        ],
        "trace_horner": [
          -0.46913400292396545,
          -0.23456701636314392,
          0,
          0.23456698656082153,
          0.46913400292396545,
          -0.3518505096435547,
          -0.11728349328041077,
          0.11728349328041077,
          0.3518505096435547
        ],
        "expanded17": [
          0.7654329836368561,
          1,
          1.2345669865608215,
          1.469133973121643,
          1.703700989484787,
          0.8827164769172668,
          1.1172834932804108,
          1.3518504798412323,
          1.5864174962043762
        ]
      },
      "centered6": {
        "origin": "1000000000.0000000",
        "scale": "1.0000000000000000",
        "coefficientTokens": [
          "1.23457",
          "0.234567"
        ],
        "predictions": [
          0.765436,
          1.000003,
          1.23457,
          1.469137,
          1.7037039999999999,
          0.8827194999999999,
          1.1172864999999998,
          1.3518535,
          1.5864205
        ]
      },
      "centered17": {
        "origin": "1000000000.0000000",
        "scale": "1.0000000000000000",
        "coefficientTokens": [
          "1.2345670000000000",
          "0.23456699999999997"
        ],
        "predictions": [
          0.765433,
          1,
          1.234567,
          1.469134,
          1.703701,
          0.8827165,
          1.1172835,
          1.3518504999999998,
          1.5864175
        ]
      },
      "r2_text": "1.000"
    },
    {
      "id": "C03",
      "ok": true,
      "n": 5,
      "coefficients": [
        -264098963448352.5,
        245961.32659199997
      ],
      "equation": "y = 245,961x − 264,098,963,448,353",
      "display_tokens": [
        "-264098963448353",
        "245961"
      ],
      "trace_tokens": [
        "-264099000000000",
        "245961"
      ],
      "roundtrip_tokens": [
        "-264098963448352.50",
        "245961.32659199997"
      ],
      "reported": {
        "r2": 1,
        "adjustedR2": null,
        "residualSe": 0,
        "slopeSe": 0,
        "r": 1
      },
      "predictions": {
        "internal": [
          0.78125,
          1,
          1.25,
          1.5,
          1.71875,
          0.90625,
          1.125,
          1.375,
          1.59375
        ],
        "expanded_horner": [
          0.78125,
          1,
          1.25,
          1.5,
          1.71875,
          0.90625,
          1.125,
          1.375,
          1.59375
        ],
        "expanded_sum": [
          0.78125,
          1,
          1.25,
          1.5,
          1.71875,
          0.90625,
          1.125,
          1.375,
          1.59375
        ],
        "display_horner": [
          -350675489.46875,
          -350675489.25,
          -350675489,
          -350675488.75,
          -350675488.53125,
          -350675489.34375,
          -350675489.125,
          -350675488.875,
          -350675488.65625
        ],
        "display_sum": [
          -350675489.46875,
          -350675489.25,
          -350675489,
          -350675488.75,
          -350675488.53125,
          -350675489.34375,
          -350675489.125,
          -350675488.875,
          -350675488.65625
        ],
        "trace_horner": [
          -387227136.46875,
          -387227136.25,
          -387227136,
          -387227135.75,
          -387227135.53125,
          -387227136.34375,
          -387227136.125,
          -387227135.875,
          -387227135.65625
        ],
        "expanded17": [
          0.78125,
          1,
          1.25,
          1.5,
          1.71875,
          0.90625,
          1.125,
          1.375,
          1.59375
        ]
      },
      "centered6": {
        "origin": "1073741824.0000000",
        "scale": "1.0000000000000000",
        "coefficientTokens": [
          "1.23457",
          "245961"
        ],
        "predictions": [
          0.7654366229248046,
          1.0000033114624023,
          1.23457,
          1.4691366885375976,
          1.7037033770751953,
          0.8827199671936035,
          1.1172866557312011,
          1.3518533442687988,
          1.5864200328063964
        ]
      },
      "centered17": {
        "origin": "1073741824.0000000",
        "scale": "1.0000000000000000",
        "coefficientTokens": [
          "1.2345670000000000",
          "245961.32659199997"
        ],
        "predictions": [
          0.765433,
          1,
          1.234567,
          1.469134,
          1.703701,
          0.8827165,
          1.1172835,
          1.3518504999999998,
          1.5864175
        ]
      },
      "r2_text": "1.000"
    },
    {
      "id": "C04",
      "ok": true,
      "n": 5,
      "coefficients": [
        1,
        0.25000000000000006,
        0.031249999999999983
      ],
      "equation": "y = 0.0312x² + 0.25x + 1",
      "display_tokens": [
        "1",
        "0.25",
        "0.0312"
      ],
      "trace_tokens": [
        "1",
        "0.25",
        "0.03125"
      ],
      "roundtrip_tokens": [
        "1.0000000000000000",
        "0.25000000000000006",
        "0.031249999999999983"
      ],
      "reported": {
        "r2": 1,
        "adjustedR2": 1,
        "residualSe": 1.5700924586837752e-16,
        "slopeSe": null,
        "r": null
      },
      "predictions": {
        "internal": [
          0.6249999999999998,
          0.78125,
          1,
          1.28125,
          1.625,
          0.6953125,
          0.8828125,
          1.1328125,
          1.4453125,
          0.5312499999999998,
          2.03125
        ],
        "expanded_horner": [
          0.6249999999999998,
          0.7812499999999999,
          1,
          1.28125,
          1.625,
          0.6953124999999999,
          0.8828125,
          1.1328125,
          1.4453125,
          0.5312499999999997,
          2.03125
        ],
        "expanded_sum": [
          0.6249999999999998,
          0.78125,
          1,
          1.28125,
          1.625,
          0.6953124999999999,
          0.8828125,
          1.1328125,
          1.4453125,
          0.5312499999999996,
          2.03125
        ],
        "display_horner": [
          0.6248,
          0.7812,
          1,
          1.2812000000000001,
          1.6248,
          0.6952,
          0.8828,
          1.1328,
          1.4452,
          0.5307999999999999,
          2.0308
        ],
        "display_sum": [
          0.6248,
          0.7812,
          1,
          1.2812,
          1.6248,
          0.6952,
          0.8828,
          1.1328,
          1.4452,
          0.5307999999999999,
          2.0308
        ],
        "trace_horner": [
          0.625,
          0.78125,
          1,
          1.28125,
          1.625,
          0.6953125,
          0.8828125,
          1.1328125,
          1.4453125,
          0.53125,
          2.03125
        ],
        "expanded17": [
          0.6249999999999998,
          0.7812499999999999,
          1,
          1.28125,
          1.625,
          0.6953124999999999,
          0.8828125,
          1.1328125,
          1.4453125,
          0.5312499999999997,
          2.03125
        ]
      },
      "centered6": {
        "origin": "0.0000000000000000",
        "scale": "1.4142135623730951",
        "coefficientTokens": [
          "1.00000",
          "0.353553",
          "0.0625000"
        ],
        "predictions": [
          0.6250005523823051,
          0.7812502761911526,
          1,
          1.2812497238088474,
          1.6249994476176948,
          0.6953129142867289,
          0.8828126380955763,
          1.1328123619044237,
          1.445312085713271,
          0.5312508285734576,
          2.031249171426542
        ]
      },
      "centered17": {
        "origin": "0.0000000000000000",
        "scale": "1.4142135623730951",
        "coefficientTokens": [
          "1.0000000000000000",
          "0.35355339059327384",
          "0.062499999999999979"
        ],
        "predictions": [
          0.6249999999999998,
          0.78125,
          1,
          1.28125,
          1.625,
          0.6953125,
          0.8828125,
          1.1328125,
          1.4453125,
          0.5312499999999998,
          2.03125
        ]
      },
      "r2_text": "1.000"
    },
    {
      "id": "C05",
      "ok": true,
      "n": 5,
      "coefficients": [
        1.2345669999999997,
        0.23456699999999997,
        0.03456699999999998
      ],
      "equation": "y = 0.0346x² + 0.235x + 1.23",
      "display_tokens": [
        "1.23",
        "0.235",
        "0.0346"
      ],
      "trace_tokens": [
        "1.23457",
        "0.234567",
        "0.034567"
      ],
      "roundtrip_tokens": [
        "1.2345669999999997",
        "0.23456699999999997",
        "0.034566999999999980"
      ],
      "reported": {
        "r2": 0.9999987653139865,
        "adjustedR2": 0.9999975306279729,
        "residualSe": 0.0005916079783099152,
        "slopeSe": null,
        "r": null
      },
      "predictions": {
        "internal": [
          0.9037009999999998,
          1.0345669999999998,
          1.2345669999999997,
          1.5037009999999997,
          1.8419689999999995,
          0.9604922499999997,
          1.1259252499999999,
          1.3604922499999996,
          1.6641932499999996,
          0.8419689999999997,
          2.249370999999999
        ],
        "expanded_horner": [
          0.9037009999999998,
          1.0345669999999998,
          1.2345669999999997,
          1.5037009999999997,
          1.8419689999999997,
          0.9604922499999997,
          1.1259252499999997,
          1.3604922499999996,
          1.6641932499999996,
          0.8419689999999996,
          2.2493709999999996
        ],
        "expanded_sum": [
          0.9037009999999998,
          1.0345669999999998,
          1.2345669999999997,
          1.5037009999999997,
          1.8419689999999995,
          0.9604922499999997,
          1.1259252499999997,
          1.3604922499999998,
          1.6641932499999996,
          0.8419689999999996,
          2.2493709999999996
        ],
        "display_horner": [
          0.8984,
          1.0296,
          1.23,
          1.4996,
          1.8384,
          0.95535,
          1.12115,
          1.35615,
          1.66035,
          0.8364,
          2.2464
        ],
        "display_sum": [
          0.8984,
          1.0296,
          1.23,
          1.4995999999999998,
          1.8384,
          0.9553499999999999,
          1.12115,
          1.35615,
          1.66035,
          0.8364,
          2.2464
        ],
        "trace_horner": [
          0.903704,
          1.03457,
          1.23457,
          1.503704,
          1.841972,
          0.9604952499999999,
          1.1259282499999999,
          1.36049525,
          1.6641962499999998,
          0.8419719999999999,
          2.249374
        ],
        "expanded17": [
          0.9037009999999998,
          1.0345669999999998,
          1.2345669999999997,
          1.5037009999999997,
          1.8419689999999997,
          0.9604922499999997,
          1.1259252499999997,
          1.3604922499999996,
          1.6641932499999996,
          0.8419689999999996,
          2.2493709999999996
        ]
      },
      "centered6": {
        "origin": "0.0000000000000000",
        "scale": "1.4142135623730951",
        "coefficientTokens": [
          "1.23457",
          "0.331728",
          "0.0691340"
        ],
        "predictions": [
          0.9037037633810978,
          1.0345698816905489,
          1.23457,
          1.503704118309451,
          1.841972236618902,
          0.9604950725358234,
          1.1259281908452745,
          1.3604953091547254,
          1.6641964274641765,
          0.8419716450716468,
          2.249374354928353
        ]
      },
      "centered17": {
        "origin": "0.0000000000000000",
        "scale": "1.4142135623730951",
        "coefficientTokens": [
          "1.2345669999999997",
          "0.33172783268516975",
          "0.069133999999999973"
        ],
        "predictions": [
          0.9037009999999998,
          1.0345669999999998,
          1.2345669999999997,
          1.5037009999999997,
          1.8419689999999995,
          0.9604922499999997,
          1.1259252499999999,
          1.3604922499999996,
          1.6641932499999996,
          0.8419689999999997,
          2.249370999999999
        ]
      },
      "r2_text": "1.000"
    },
    {
      "id": "C06",
      "ok": true,
      "n": 5,
      "coefficients": [
        34566999765432980,
        -69133999.76543295,
        0.03456699999999998
      ],
      "equation": "y = 0.0346x² − 69,134,000x + 34,566,999,765,432,980",
      "display_tokens": [
        "34566999765432980",
        "-69134000",
        "0.0346"
      ],
      "trace_tokens": [
        "34567000000000000",
        "-69134000",
        "0.034567"
      ],
      "roundtrip_tokens": [
        "34566999765432980",
        "-69133999.765432954",
        "0.034566999999999980"
      ],
      "reported": {
        "r2": 0.9999987653139865,
        "adjustedR2": 0.9999975306279729,
        "residualSe": 0.0005916079783099152,
        "slopeSe": null,
        "r": null
      },
      "predictions": {
        "internal": [
          0.9037009999999998,
          1.0345669999999998,
          1.2345669999999997,
          1.5037009999999997,
          1.8419689999999995,
          0.9604922499999997,
          1.1259252499999999,
          1.3604922499999996,
          1.6641932499999996
        ],
        "expanded_horner": [
          8,
          4,
          4,
          4,
          8,
          4,
          4,
          4,
          8
        ],
        "expanded_sum": [
          8,
          8,
          8,
          8,
          8,
          8,
          8,
          8,
          8
        ],
        "display_horner": [
          32999765300980,
          32999765366976,
          32999765432980,
          32999765498976,
          32999765564980,
          32999765333980,
          32999765399976,
          32999765465984,
          32999765531980
        ],
        "display_sum": [
          32999765300980,
          32999765366980,
          32999765432980,
          32999765498980,
          32999765564980,
          32999765333980,
          32999765399980,
          32999765465980,
          32999765531980
        ],
        "trace_horner": [
          4,
          0,
          0,
          0,
          -4,
          4,
          0,
          0,
          -4
        ],
        "expanded17": [
          8,
          4,
          4,
          4,
          8,
          4,
          4,
          4,
          8
        ]
      },
      "centered6": {
        "origin": "1000000000.0000000",
        "scale": "1.4142135623730951",
        "coefficientTokens": [
          "1.23457",
          "0.331728",
          "0.0691340"
        ],
        "predictions": [
          0.9037037633810978,
          1.0345698816905489,
          1.23457,
          1.503704118309451,
          1.841972236618902,
          0.9604950725358234,
          1.1259281908452745,
          1.3604953091547254,
          1.6641964274641765
        ]
      },
      "centered17": {
        "origin": "1000000000.0000000",
        "scale": "1.4142135623730951",
        "coefficientTokens": [
          "1.2345669999999997",
          "0.33172783268516975",
          "0.069133999999999973"
        ],
        "predictions": [
          0.9037009999999998,
          1.0345669999999998,
          1.2345669999999997,
          1.5037009999999997,
          1.8419689999999995,
          0.9604922499999997,
          1.1259252499999999,
          1.3604922499999996,
          1.6641932499999996
        ]
      },
      "r2_text": "1.000"
    },
    {
      "id": "C07",
      "ok": true,
      "n": 5,
      "coefficients": [
        1.2345669999999997,
        234.56699999999998,
        34566.99999999998
      ],
      "equation": "y = 34,567x² + 235x + 1.23",
      "display_tokens": [
        "1.23",
        "235",
        "34567"
      ],
      "trace_tokens": [
        "1.23457",
        "234.567",
        "34567"
      ],
      "roundtrip_tokens": [
        "1.2345669999999997",
        "234.56699999999998",
        "34566.999999999978"
      ],
      "reported": {
        "r2": 0.9999987653139865,
        "adjustedR2": 0.9999975306279729,
        "residualSe": 0.0005916079783099058,
        "slopeSe": null,
        "r": null
      },
      "predictions": {
        "internal": [
          0.9037009999999996,
          1.0345669999999998,
          1.2345669999999997,
          1.5037009999999997,
          1.8419689999999997,
          0.9604922499999997,
          1.1259252499999997,
          1.3604922499999996,
          1.6641932499999998
        ],
        "expanded_horner": [
          0.9037009999999996,
          1.0345669999999998,
          1.2345669999999997,
          1.5037009999999997,
          1.8419689999999995,
          0.9604922499999997,
          1.1259252499999997,
          1.3604922499999996,
          1.6641932499999996
        ],
        "expanded_sum": [
          0.9037009999999998,
          1.0345669999999998,
          1.2345669999999997,
          1.5037009999999997,
          1.8419689999999995,
          0.9604922499999997,
          1.1259252499999997,
          1.3604922499999998,
          1.6641932499999996
        ],
        "display_horner": [
          0.8982680000000001,
          1.029567,
          1.23,
          1.4995669999999999,
          1.838268,
          0.95527575,
          1.12114175,
          1.35614175,
          1.66027575
        ],
        "display_sum": [
          0.8982680000000001,
          1.029567,
          1.23,
          1.499567,
          1.838268,
          0.95527575,
          1.12114175,
          1.35614175,
          1.66027575
        ],
        "trace_horner": [
          0.903704,
          1.03457,
          1.23457,
          1.503704,
          1.8419720000000002,
          0.9604952499999999,
          1.1259282499999999,
          1.36049525,
          1.66419625
        ],
        "expanded17": [
          0.9037009999999996,
          1.0345669999999998,
          1.2345669999999997,
          1.5037009999999997,
          1.8419689999999995,
          0.9604922499999997,
          1.1259252499999997,
          1.3604922499999996,
          1.6641932499999996
        ]
      },
      "centered6": {
        "origin": "0.0000000000000000",
        "scale": "0.0014142135623730950",
        "coefficientTokens": [
          "1.23457",
          "0.331728",
          "0.0691340"
        ],
        "predictions": [
          0.9037037633810978,
          1.0345698816905489,
          1.23457,
          1.503704118309451,
          1.841972236618902,
          0.9604950725358233,
          1.1259281908452745,
          1.3604953091547256,
          1.6641964274641765
        ]
      },
      "centered17": {
        "origin": "0.0000000000000000",
        "scale": "0.0014142135623730950",
        "coefficientTokens": [
          "1.2345669999999997",
          "0.33172783268516975",
          "0.069133999999999959"
        ],
        "predictions": [
          0.9037009999999996,
          1.0345669999999998,
          1.2345669999999997,
          1.5037009999999997,
          1.8419689999999997,
          0.9604922499999997,
          1.1259252499999997,
          1.3604922499999996,
          1.6641932499999998
        ]
      },
      "r2_text": "1.000"
    },
    {
      "id": "C08",
      "ok": true,
      "n": 5,
      "coefficients": [
        34567001074095816,
        -69134002382.75864,
        34567.00130866282
      ],
      "equation": "y = 34,567x² − 69,134,002,383x + 34,567,001,074,095,816",
      "display_tokens": [
        "34567001074095816",
        "-69134002383",
        "34567"
      ],
      "trace_tokens": [
        "34567000000000000",
        "-69134000000",
        "34567"
      ],
      "roundtrip_tokens": [
        "34567001074095816",
        "-69134002382.758636",
        "34567.001308662817"
      ],
      "reported": {
        "r2": 0.9999987653026292,
        "adjustedR2": 0.9999975306052584,
        "residualSe": 0.000591610699243522,
        "slopeSe": null,
        "r": null
      },
      "predictions": {
        "internal": [
          0.9037010049882332,
          1.0345669909233768,
          1.234566997253902,
          1.5037010127691308,
          1.8419689940653559,
          0.9604922488197813,
          1.1259252545820835,
          1.3604922381977678,
          1.6641932542812197
        ],
        "expanded_horner": [
          -4,
          0,
          0,
          -4,
          0,
          0,
          -4,
          0,
          0
        ],
        "expanded_sum": [
          -4,
          -4,
          -8,
          0,
          0,
          -4,
          -4,
          -4,
          -4
        ],
        "display_horner": [
          -1308904184,
          -1308904180,
          -1308904184,
          -1308904188,
          -1308904184,
          -1308904180,
          -1308904184,
          -1308904184,
          -1308904184
        ],
        "display_sum": [
          -1308904184,
          -1308904180,
          -1308904184,
          -1308904188,
          -1308904184,
          -1308904176,
          -1308904180,
          -1308904188,
          -1308904192
        ],
        "trace_horner": [
          -4,
          0,
          0,
          0,
          4,
          0,
          0,
          0,
          0
        ],
        "expanded17": [
          -4,
          0,
          0,
          -4,
          0,
          0,
          -4,
          0,
          0
        ]
      },
      "centered6": {
        "origin": "1000000.0000000000",
        "scale": "0.0014142135636901845",
        "coefficientTokens": [
          "1.23457",
          "0.331728",
          "0.0691340"
        ],
        "predictions": [
          0.9037037656232365,
          1.034569873986969,
          1.23457,
          1.5037041324516363,
          1.8419722279381578,
          0.9604950710123413,
          1.1259281978301978,
          1.360495299755325,
          1.6641964314021356
        ]
      },
      "centered17": {
        "origin": "1000000.0000000000",
        "scale": "0.0014142135636901845",
        "coefficientTokens": [
          "1.2345669972539020",
          "0.33172783268516975",
          "0.069134002746097795"
        ],
        "predictions": [
          0.9037010049882332,
          1.0345669909233768,
          1.234566997253902,
          1.5037010127691308,
          1.8419689940653559,
          0.9604922488197813,
          1.1259252545820835,
          1.3604922381977678,
          1.6641932542812197
        ]
      },
      "r2_text": "1.000"
    },
    {
      "id": "C09",
      "ok": true,
      "n": 5,
      "coefficients": [
        1234.5669999999998,
        234.56700000000004,
        34.56700000000001
      ],
      "equation": "y = 34.6x² + 235x + 1,235",
      "display_tokens": [
        "1235",
        "235",
        "34.6"
      ],
      "trace_tokens": [
        "1234.57",
        "234.567",
        "34.567"
      ],
      "roundtrip_tokens": [
        "1234.5669999999998",
        "234.56700000000004",
        "34.567000000000007"
      ],
      "reported": {
        "r2": 0.9999987653139865,
        "adjustedR2": 0.9999975306279729,
        "residualSe": 0.591607978309952,
        "slopeSe": null,
        "r": null
      },
      "predictions": {
        "internal": [
          903.7009999999998,
          1034.5669999999998,
          1234.5669999999998,
          1503.7009999999998,
          1841.969,
          960.4922499999998,
          1125.9252499999998,
          1360.4922499999998,
          1664.1932499999998
        ],
        "expanded_horner": [
          903.7009999999998,
          1034.5669999999998,
          1234.5669999999998,
          1503.7009999999998,
          1841.9689999999998,
          960.4922499999998,
          1125.9252499999998,
          1360.4922499999998,
          1664.1932499999998
        ],
        "expanded_sum": [
          903.7009999999998,
          1034.5669999999998,
          1234.5669999999998,
          1503.7009999999998,
          1841.9689999999998,
          960.4922499999998,
          1125.9252499999998,
          1360.4922499999998,
          1664.1932499999998
        ],
        "display_horner": [
          903.4,
          1034.6,
          1235,
          1504.6,
          1843.4,
          960.35,
          1126.15,
          1361.15,
          1665.35
        ],
        "display_sum": [
          903.4,
          1034.6,
          1235,
          1504.6,
          1843.4,
          960.35,
          1126.15,
          1361.15,
          1665.35
        ],
        "trace_horner": [
          903.704,
          1034.57,
          1234.57,
          1503.704,
          1841.972,
          960.4952499999999,
          1125.92825,
          1360.49525,
          1664.19625
        ],
        "expanded17": [
          903.7009999999998,
          1034.5669999999998,
          1234.5669999999998,
          1503.7009999999998,
          1841.9689999999998,
          960.4922499999998,
          1125.9252499999998,
          1360.4922499999998,
          1664.1932499999998
        ]
      },
      "centered6": {
        "origin": "0.0000000000000000",
        "scale": "1.4142135623730951",
        "coefficientTokens": [
          "1234.57",
          "331.728",
          "69.1340"
        ],
        "predictions": [
          903.7037633810978,
          1034.569881690549,
          1234.57,
          1503.704118309451,
          1841.9722366189021,
          960.4950725358234,
          1125.9281908452745,
          1360.4953091547254,
          1664.1964274641764
        ]
      },
      "centered17": {
        "origin": "0.0000000000000000",
        "scale": "1.4142135623730951",
        "coefficientTokens": [
          "1234.5669999999998",
          "331.72783268516986",
          "69.134000000000029"
        ],
        "predictions": [
          903.7009999999998,
          1034.5669999999998,
          1234.5669999999998,
          1503.7009999999998,
          1841.969,
          960.4922499999998,
          1125.9252499999998,
          1360.4922499999998,
          1664.1932499999998
        ]
      },
      "r2_text": "1.000"
    },
    {
      "id": "C10",
      "ok": true,
      "n": 5,
      "coefficients": [
        1001.2345670000001,
        0.23456700000002254,
        0.03456699999998443
      ],
      "equation": "y = 0.0346x² + 0.235x + 1,001",
      "display_tokens": [
        "1001",
        "0.235",
        "0.0346"
      ],
      "trace_tokens": [
        "1001.23",
        "0.234567",
        "0.034567"
      ],
      "roundtrip_tokens": [
        "1001.2345670000001",
        "0.23456700000002254",
        "0.034566999999984430"
      ],
      "reported": {
        "r2": 0.9999987653139862,
        "adjustedR2": 0.9999975306279725,
        "residualSe": 0.0005916079783440134,
        "slopeSe": null,
        "r": null
      },
      "predictions": {
        "internal": [
          1000.903701,
          1001.034567,
          1001.2345670000001,
          1001.5037010000001,
          1001.8419690000001,
          1000.96049225,
          1001.12592525,
          1001.3604922500001,
          1001.66419325
        ],
        "expanded_horner": [
          1000.903701,
          1001.034567,
          1001.2345670000001,
          1001.5037010000001,
          1001.8419690000001,
          1000.96049225,
          1001.12592525,
          1001.3604922500001,
          1001.66419325
        ],
        "expanded_sum": [
          1000.903701,
          1001.0345670000002,
          1001.2345670000001,
          1001.5037010000001,
          1001.8419690000001,
          1000.96049225,
          1001.1259252500001,
          1001.3604922500001,
          1001.6641932500002
        ],
        "display_horner": [
          1000.6684,
          1000.7996,
          1001,
          1001.2696,
          1001.6084,
          1000.72535,
          1000.89115,
          1001.12615,
          1001.43035
        ],
        "display_sum": [
          1000.6684,
          1000.7995999999999,
          1001,
          1001.2696,
          1001.6084000000001,
          1000.72535,
          1000.89115,
          1001.1261499999999,
          1001.43035
        ],
        "trace_horner": [
          1000.899134,
          1001.03,
          1001.23,
          1001.499134,
          1001.837402,
          1000.9559252500001,
          1001.1213582500001,
          1001.35592525,
          1001.65962625
        ],
        "expanded17": [
          1000.903701,
          1001.034567,
          1001.2345670000001,
          1001.5037010000001,
          1001.8419690000001,
          1000.96049225,
          1001.12592525,
          1001.3604922500001,
          1001.66419325
        ]
      },
      "centered6": {
        "origin": "0.0000000000000000",
        "scale": "1.4142135623730951",
        "coefficientTokens": [
          "1001.23",
          "0.331728",
          "0.0691340"
        ],
        "predictions": [
          1000.8991337633811,
          1001.0299998816905,
          1001.23,
          1001.4991341183095,
          1001.8374022366189,
          1000.9559250725358,
          1001.1213581908453,
          1001.3559253091547,
          1001.6596264274642
        ]
      },
      "centered17": {
        "origin": "0.0000000000000000",
        "scale": "1.4142135623730951",
        "coefficientTokens": [
          "1001.2345670000001",
          "0.33172783268520167",
          "0.069133999999968873"
        ],
        "predictions": [
          1000.903701,
          1001.034567,
          1001.2345670000001,
          1001.5037010000001,
          1001.8419690000001,
          1000.96049225,
          1001.12592525,
          1001.3604922500001,
          1001.66419325
        ]
      },
      "r2_text": "1.000"
    },
    {
      "id": "C11",
      "ok": true,
      "n": 7,
      "coefficients": [
        1.234567,
        0.23456699999999997,
        0.03456700000000004
      ],
      "equation": "y = 0.0346x² + 0.235x + 1.23",
      "display_tokens": [
        "1.23",
        "0.235",
        "0.0346"
      ],
      "trace_tokens": [
        "1.23457",
        "0.234567",
        "0.034567"
      ],
      "roundtrip_tokens": [
        "1.2345670000000000",
        "0.23456699999999997",
        "0.034567000000000042"
      ],
      "reported": {
        "r2": 1,
        "adjustedR2": 1,
        "residualSe": 2.220446049250313e-16,
        "slopeSe": null,
        "r": null
      },
      "predictions": {
        "internal": [
          0.9037010000000002,
          0.9037010000000002,
          1.034567,
          1.234567,
          1.503701,
          1.8419690000000002,
          1.8419690000000002,
          0.9604922500000002,
          1.12592525,
          1.36049225,
          1.66419325
        ],
        "expanded_horner": [
          0.9037010000000002,
          0.9037010000000002,
          1.034567,
          1.234567,
          1.503701,
          1.8419690000000002,
          1.8419690000000002,
          0.9604922500000002,
          1.1259252499999999,
          1.36049225,
          1.66419325
        ],
        "expanded_sum": [
          0.9037010000000002,
          0.9037010000000002,
          1.034567,
          1.234567,
          1.503701,
          1.8419690000000002,
          1.8419690000000002,
          0.9604922500000002,
          1.12592525,
          1.3604922499999998,
          1.66419325
        ],
        "display_horner": [
          0.8984,
          0.8984,
          1.0296,
          1.23,
          1.4996,
          1.8384,
          1.8384,
          0.95535,
          1.12115,
          1.35615,
          1.66035
        ],
        "display_sum": [
          0.8984,
          0.8984,
          1.0296,
          1.23,
          1.4995999999999998,
          1.8384,
          1.8384,
          0.9553499999999999,
          1.12115,
          1.35615,
          1.66035
        ],
        "trace_horner": [
          0.903704,
          0.903704,
          1.03457,
          1.23457,
          1.503704,
          1.841972,
          1.841972,
          0.9604952499999999,
          1.1259282499999999,
          1.36049525,
          1.6641962499999998
        ],
        "expanded17": [
          0.9037010000000002,
          0.9037010000000002,
          1.034567,
          1.234567,
          1.503701,
          1.8419690000000002,
          1.8419690000000002,
          0.9604922500000002,
          1.1259252499999999,
          1.36049225,
          1.66419325
        ]
      },
      "centered6": {
        "origin": "0.0000000000000000",
        "scale": "1.6035674514745464",
        "coefficientTokens": [
          "1.23457",
          "0.376144",
          "0.0888866"
        ],
        "predictions": [
          0.9037040524142119,
          0.9037040524142119,
          1.0345700150959949,
          1.23457,
          1.5037040071262273,
          1.8419720364746768,
          1.8419720364746768,
          0.9604952809773256,
          1.1259282547702196,
          1.3604952507853358,
          1.6641962690226744
        ]
      },
      "centered17": {
        "origin": "0.0000000000000000",
        "scale": "1.6035674514745464",
        "coefficientTokens": [
          "1.2345670000000000",
          "0.37614400639002987",
          "0.088886571428571537"
        ],
        "predictions": [
          0.9037010000000002,
          0.9037010000000002,
          1.034567,
          1.234567,
          1.503701,
          1.8419690000000002,
          1.8419690000000002,
          0.9604922500000002,
          1.12592525,
          1.36049225,
          1.66419325
        ]
      },
      "r2_text": "1.000"
    },
    {
      "id": "C12",
      "ok": false,
      "n": 4,
      "reason": "A degree 2 polynomial needs at least 3 distinct X values. This group has 2."
    },
    {
      "id": "C13",
      "ok": false,
      "n": 3,
      "reason": "A degree 2 polynomial needs at least 3 distinct X values. This group has 1."
    },
    {
      "id": "C14",
      "ok": false,
      "n": 3,
      "reason": "Every X value is 3, so the slope is undefined."
    },
    {
      "id": "C15",
      "ok": false,
      "n": 2,
      "reason": "A degree 2 polynomial needs at least 3 rows with numeric X and Y. This group has 2."
    },
    {
      "id": "C16",
      "ok": true,
      "n": 4,
      "coefficients": [
        1,
        -0.12499999999999993,
        0.06249999999999993
      ],
      "equation": "y = 0.0625x² − 0.125x + 1",
      "display_tokens": [
        "1",
        "-0.125",
        "0.0625"
      ],
      "trace_tokens": [
        "1",
        "-0.125",
        "0.0625"
      ],
      "roundtrip_tokens": [
        "1.0000000000000000",
        "-0.12499999999999993",
        "0.062499999999999931"
      ],
      "reported": {
        "r2": 1,
        "adjustedR2": 1,
        "residualSe": 2.220446049250313e-16,
        "slopeSe": null,
        "r": null
      },
      "predictions": {
        "internal": [
          1.3281249999999998,
          1.078125,
          0.953125,
          0.953125,
          1.1874999999999998,
          1,
          0.9375
        ],
        "expanded_horner": [
          1.3281249999999998,
          1.078125,
          0.953125,
          0.9531249999999999,
          1.1874999999999998,
          1,
          0.9375
        ],
        "expanded_sum": [
          1.3281249999999998,
          1.078125,
          0.953125,
          0.953125,
          1.1875,
          1,
          0.9375
        ],
        "display_horner": [
          1.328125,
          1.078125,
          0.953125,
          0.953125,
          1.1875,
          1,
          0.9375
        ],
        "display_sum": [
          1.328125,
          1.078125,
          0.953125,
          0.953125,
          1.1875,
          1,
          0.9375
        ],
        "trace_horner": [
          1.328125,
          1.078125,
          0.953125,
          0.953125,
          1.1875,
          1,
          0.9375
        ],
        "expanded17": [
          1.3281249999999998,
          1.078125,
          0.953125,
          0.9531249999999999,
          1.1874999999999998,
          1,
          0.9375
        ]
      },
      "centered6": {
        "origin": "0.0000000000000000",
        "scale": "1.1180339887498949",
        "coefficientTokens": [
          "1.00000",
          "-0.139754",
          "0.0781250"
        ],
        "predictions": [
          1.3281246664765034,
          1.078124888825501,
          0.9531251111744989,
          0.9531253335234966,
          1.1874997776510021,
          1,
          0.9375002223489978
        ]
      },
      "centered17": {
        "origin": "0.0000000000000000",
        "scale": "1.1180339887498949",
        "coefficientTokens": [
          "1.0000000000000000",
          "-0.13975424859373678",
          "0.078124999999999931"
        ],
        "predictions": [
          1.3281249999999998,
          1.078125,
          0.953125,
          0.953125,
          1.1874999999999998,
          1,
          0.9375
        ]
      },
      "r2_text": "1.000"
    },
    {
      "id": "C17",
      "ok": true,
      "n": 5,
      "coefficients": [
        1.0000000000000002,
        -0.12500000000000003,
        0.06250000000000004,
        -0.031250000000000014
      ],
      "equation": "y = −0.0313x³ + 0.0625x² − 0.125x + 1",
      "display_tokens": [
        "1",
        "-0.125",
        "0.0625",
        "-0.0313"
      ],
      "trace_tokens": [
        "1",
        "-0.125",
        "0.0625",
        "-0.03125"
      ],
      "roundtrip_tokens": [
        "1.0000000000000002",
        "-0.12500000000000003",
        "0.062500000000000042",
        "-0.031250000000000014"
      ],
      "reported": {
        "r2": 1,
        "adjustedR2": 1,
        "residualSe": 7.364386412590295e-16,
        "slopeSe": null,
        "r": null
      },
      "predictions": {
        "internal": [
          1.7500000000000004,
          1.2187500000000004,
          1.0000000000000002,
          0.9062500000000002,
          0.7500000000000002,
          1.4335937500000004,
          1.0820312500000002,
          0.9492187500000002,
          0.8476562500000002
        ],
        "expanded_horner": [
          1.7500000000000004,
          1.2187500000000002,
          1.0000000000000002,
          0.9062500000000002,
          0.7500000000000002,
          1.4335937500000004,
          1.0820312500000002,
          0.9492187500000002,
          0.8476562500000002
        ],
        "expanded_sum": [
          1.7500000000000004,
          1.2187500000000002,
          1.0000000000000002,
          0.9062500000000002,
          0.7500000000000003,
          1.4335937500000002,
          1.0820312500000002,
          0.9492187500000002,
          0.8476562500000003
        ],
        "display_horner": [
          1.7504,
          1.2187999999999999,
          1,
          0.9062,
          0.7496,
          1.4337625,
          1.0820375,
          0.9492125,
          0.8474875
        ],
        "display_sum": [
          1.7504,
          1.2188,
          1,
          0.9062,
          0.7496,
          1.4337625,
          1.0820375,
          0.9492125,
          0.8474875
        ],
        "trace_horner": [
          1.75,
          1.21875,
          1,
          0.90625,
          0.75,
          1.43359375,
          1.08203125,
          0.94921875,
          0.84765625
        ],
        "expanded17": [
          1.7500000000000004,
          1.2187500000000002,
          1.0000000000000002,
          0.9062500000000002,
          0.7500000000000002,
          1.4335937500000004,
          1.0820312500000002,
          0.9492187500000002,
          0.8476562500000002
        ]
      },
      "centered6": {
        "origin": "0.0000000000000000",
        "scale": "1.4142135623730951",
        "coefficientTokens": [
          "1.00000",
          "-0.176777",
          "0.125000",
          "-0.0883883"
        ],
        "predictions": [
          1.7500002961458323,
          1.2187501986115896,
          1,
          0.9062498013884103,
          0.7499997038541677,
          1.4335940163307135,
          1.0820313556231291,
          0.9492186443768709,
          0.8476559836692864
        ]
      },
      "centered17": {
        "origin": "0.0000000000000000",
        "scale": "1.4142135623730951",
        "coefficientTokens": [
          "1.0000000000000002",
          "-0.17677669529663692",
          "0.12500000000000011",
          "-0.088388347648318502"
        ],
        "predictions": [
          1.7500000000000004,
          1.2187500000000004,
          1.0000000000000002,
          0.9062500000000002,
          0.7500000000000002,
          1.4335937500000004,
          1.0820312500000002,
          0.9492187500000002,
          0.8476562500000002
        ]
      },
      "r2_text": "1.000"
    },
    {
      "id": "C18",
      "ok": true,
      "n": 6,
      "coefficients": [
        0.9999999999999997,
        -0.12500000000000008,
        0.06250000000000006,
        -0.031250000000000014,
        0.015625000000000007
      ],
      "equation": "y = 0.0156x⁴ − 0.0313x³ + 0.0625x² − 0.125x + 1",
      "display_tokens": [
        "1",
        "-0.125",
        "0.0625",
        "-0.0313",
        "0.0156"
      ],
      "trace_tokens": [
        "1",
        "-0.125",
        "0.0625",
        "-0.03125",
        "0.015625"
      ],
      "roundtrip_tokens": [
        "0.99999999999999967",
        "-0.12500000000000008",
        "0.062500000000000056",
        "-0.031250000000000014",
        "0.015625000000000007"
      ],
      "reported": {
        "r2": 1,
        "adjustedR2": 1,
        "residualSe": 1.0295784775289034e-15,
        "slopeSe": null,
        "r": null
      },
      "predictions": {
        "internal": [
          2.801757812500001,
          1.5126953125,
          1.0830078124999998,
          0.9501953124999997,
          0.9267578124999997,
          1.2001953125,
          2.0000000000000004,
          1.2343749999999998,
          0.9999999999999997,
          0.9218749999999997,
          0.9999999999999998
        ],
        "expanded_horner": [
          2.8017578125000004,
          1.5126953125,
          1.0830078124999998,
          0.9501953124999997,
          0.9267578124999997,
          1.2001953124999998,
          2.0000000000000004,
          1.2343749999999998,
          0.9999999999999997,
          0.9218749999999997,
          0.9999999999999998
        ],
        "expanded_sum": [
          2.801757812500001,
          1.5126953125,
          1.0830078124999998,
          0.9501953124999997,
          0.9267578124999997,
          1.2001953124999998,
          2,
          1.2343749999999998,
          0.9999999999999997,
          0.9218749999999996,
          0.9999999999999998
        ],
        "display_horner": [
          2.8015625,
          1.5127375,
          1.0830125,
          0.9501875,
          0.9264625,
          1.1984374999999998,
          2,
          1.2344,
          1,
          0.9218,
          0.9992
        ],
        "display_sum": [
          2.8015625,
          1.5127375,
          1.0830125,
          0.9501875,
          0.9264625,
          1.1984375,
          2,
          1.2344000000000002,
          1,
          0.9218,
          0.9992000000000001
        ],
        "trace_horner": [
          2.8017578125,
          1.5126953125,
          1.0830078125,
          0.9501953125,
          0.9267578125,
          1.2001953125,
          2,
          1.234375,
          1,
          0.921875,
          1
        ],
        "expanded17": [
          2.8017578125000004,
          1.5126953125,
          1.0830078124999998,
          0.9501953124999997,
          0.9267578124999997,
          1.2001953124999998,
          2.0000000000000004,
          1.2343749999999998,
          0.9999999999999997,
          0.9218749999999997,
          0.9999999999999998
        ]
      },
      "centered6": {
        "origin": "0.0000000000000000",
        "scale": "1.7078251276599330",
        "coefficientTokens": [
          "1.00000",
          "-0.213478",
          "0.182292",
          "-0.155661",
          "0.132921"
        ],
        "predictions": [
          2.801757835449168,
          1.5126953438344595,
          1.083007796127415,
          0.9501953859134012,
          0.9267582871859487,
          1.2001966543467508,
          2.0000000470177475,
          1.2343750019342101,
          1,
          0.9218752250045653,
          1.0000008411455181
        ]
      },
      "centered17": {
        "origin": "0.0000000000000000",
        "scale": "1.7078251276599330",
        "coefficientTokens": [
          "0.99999999999999967",
          "-0.21347814095749176",
          "0.18229166666666682",
          "-0.15566114444817103",
          "0.13292100694444448"
        ],
        "predictions": [
          2.801757812500001,
          1.5126953125,
          1.0830078124999998,
          0.9501953124999997,
          0.9267578124999997,
          1.2001953125,
          2.0000000000000004,
          1.2343749999999998,
          0.9999999999999997,
          0.9218749999999997,
          0.9999999999999998
        ]
      },
      "r2_text": "1.000"
    },
    {
      "id": "C19",
      "ok": true,
      "n": 7,
      "coefficients": [
        1.0000000000000007,
        -0.12500000000000006,
        0.06250000000000004,
        -0.031250000000000014,
        0.015624999999999997,
        -0.0078125
      ],
      "equation": "y = −0.00781x⁵ + 0.0156x⁴ − 0.0313x³ + 0.0625x² − 0.125x + 1",
      "display_tokens": [
        "1",
        "-0.125",
        "0.0625",
        "-0.0313",
        "0.0156",
        "-0.00781"
      ],
      "trace_tokens": [
        "1",
        "-0.125",
        "0.0625",
        "-0.03125",
        "0.015625",
        "-0.0078125"
      ],
      "roundtrip_tokens": [
        "1.0000000000000007",
        "-0.12500000000000006",
        "0.062500000000000042",
        "-0.031250000000000014",
        "0.015624999999999997",
        "-0.0078125000000000000"
      ],
      "reported": {
        "r2": 1,
        "adjustedR2": 1,
        "residualSe": 1.900395703982448e-15,
        "slopeSe": null,
        "r": null
      },
      "predictions": {
        "internal": [
          5.945312500000001,
          2.250000000000001,
          1.2421875000000009,
          1.0000000000000007,
          0.9140625000000007,
          0.7500000000000006,
          -0.2890624999999998,
          3.564697265625001,
          1.5720214843750009,
          1.0832519531250007,
          0.9499511718750007,
          0.8674316406250007,
          0.43725585937500044
        ],
        "expanded_horner": [
          5.945312500000001,
          2.250000000000001,
          1.2421875000000009,
          1.0000000000000007,
          0.9140625000000007,
          0.7500000000000006,
          -0.2890624999999998,
          3.564697265625001,
          1.5720214843750009,
          1.0832519531250007,
          0.9499511718750007,
          0.8674316406250007,
          0.43725585937500044
        ],
        "expanded_sum": [
          5.945312500000002,
          2.2500000000000013,
          1.2421875000000007,
          1.0000000000000007,
          0.9140625000000007,
          0.7500000000000004,
          -0.28906249999999956,
          3.5646972656250013,
          1.5720214843750007,
          1.0832519531250007,
          0.9499511718750007,
          0.8674316406250007,
          0.43725585937500044
        ],
        "display_horner": [
          5.94403,
          2.24992,
          1.24221,
          1,
          0.91399,
          0.74928,
          -0.29183000000000003,
          3.5642578124999997,
          1.5720446875,
          1.0832565625,
          0.9499434375,
          0.8671553125,
          0.43574218750000004
        ],
        "display_sum": [
          5.94403,
          2.24992,
          1.2422100000000003,
          1,
          0.91399,
          0.7492800000000001,
          -0.29183000000000026,
          3.5642578125,
          1.5720446875,
          1.0832565625,
          0.9499434375,
          0.8671553125,
          0.43574218750000004
        ],
        "trace_horner": [
          5.9453125,
          2.25,
          1.2421875,
          1,
          0.9140625,
          0.75,
          -0.2890625,
          3.564697265625,
          1.572021484375,
          1.083251953125,
          0.949951171875,
          0.867431640625,
          0.437255859375
        ],
        "expanded17": [
          5.945312500000001,
          2.250000000000001,
          1.2421875000000009,
          1.0000000000000007,
          0.9140625000000007,
          0.7500000000000006,
          -0.2890624999999998,
          3.564697265625001,
          1.5720214843750009,
          1.0832519531250007,
          0.9499511718750007,
          0.8674316406250007,
          0.43725585937500044
        ]
      },
      "centered6": {
        "origin": "0.0000000000000000",
        "scale": "2.0000000000000000",
        "coefficientTokens": [
          "1.00000",
          "-0.250000",
          "0.250000",
          "-0.250000",
          "0.250000",
          "-0.250000"
        ],
        "predictions": [
          5.9453125,
          2.25,
          1.2421875,
          1,
          0.9140625,
          0.75,
          -0.2890625,
          3.564697265625,
          1.572021484375,
          1.083251953125,
          0.949951171875,
          0.867431640625,
          0.437255859375
        ]
      },
      "centered17": {
        "origin": "0.0000000000000000",
        "scale": "2.0000000000000000",
        "coefficientTokens": [
          "1.0000000000000007",
          "-0.25000000000000011",
          "0.25000000000000017",
          "-0.25000000000000011",
          "0.24999999999999994",
          "-0.25000000000000000"
        ],
        "predictions": [
          5.945312500000001,
          2.250000000000001,
          1.2421875000000009,
          1.0000000000000007,
          0.9140625000000007,
          0.7500000000000006,
          -0.2890624999999998,
          3.564697265625001,
          1.5720214843750009,
          1.0832519531250007,
          0.9499511718750007,
          0.8674316406250007,
          0.43725585937500044
        ]
      },
      "r2_text": "1.000"
    },
    {
      "id": "C20",
      "ok": true,
      "n": 8,
      "coefficients": [
        0.9999999999999978,
        -0.12499999999999918,
        0.06249999999999854,
        -0.03125000000000013,
        0.01562500000000028,
        -0.0078124999999999905,
        0.003906249999999986
      ],
      "equation": "y = 0.00391x⁶ − 0.00781x⁵ + 0.0156x⁴ − 0.0313x³ + 0.0625x² − 0.125x + 1",
      "display_tokens": [
        "1",
        "-0.125",
        "0.0625",
        "-0.0313",
        "0.0156",
        "-0.00781",
        "0.00391"
      ],
      "trace_tokens": [
        "1",
        "-0.125",
        "0.0625",
        "-0.03125",
        "0.015625",
        "-0.0078125",
        "0.00390625"
      ],
      "roundtrip_tokens": [
        "0.99999999999999778",
        "-0.12499999999999918",
        "0.062499999999998543",
        "-0.031250000000000132",
        "0.015625000000000281",
        "-0.0078124999999999905",
        "0.0039062499999999861"
      ],
      "reported": {
        "r2": 1,
        "adjustedR2": 1,
        "residualSe": 1.0974935055203436e-14,
        "slopeSe": null,
        "r": null
      },
      "predictions": {
        "internal": [
          17.171691894531243,
          4.5183715820312464,
          1.6165161132812451,
          1.0833129882812471,
          0.9500122070312478,
          0.9119262695312467,
          1.3909301757812476,
          5.410461425781248,
          8.792968749999998,
          2.4999999999999947,
          1.246093749999996,
          0.9999999999999978,
          0.9179687499999973,
          0.9999999999999964,
          2.558593749999999
        ],
        "expanded_horner": [
          17.171691894531236,
          4.518371582031245,
          1.616516113281245,
          1.0833129882812471,
          0.9500122070312478,
          0.9119262695312467,
          1.3909301757812473,
          5.410461425781248,
          8.792968749999996,
          2.4999999999999947,
          1.246093749999996,
          0.9999999999999978,
          0.9179687499999973,
          0.9999999999999964,
          2.5585937499999987
        ],
        "expanded_sum": [
          17.171691894531243,
          4.518371582031246,
          1.6165161132812447,
          1.083312988281247,
          0.9500122070312479,
          0.9119262695312468,
          1.390930175781247,
          5.410461425781249,
          8.792968749999996,
          2.4999999999999947,
          1.2460937499999958,
          0.9999999999999978,
          0.9179687499999973,
          0.9999999999999963,
          2.5585937499999982
        ],
        "display_horner": [
          17.17566453125,
          4.518847656249999,
          1.61658203125,
          1.08331765625,
          0.95000453125,
          0.91169265625,
          1.3903320312500003,
          5.4127726562500005,
          8.79442,
          2.50016,
          1.24612,
          1,
          0.9178999999999999,
          0.99952,
          2.5585600000000004
        ],
        "display_sum": [
          17.17566453125,
          4.51884765625,
          1.61658203125,
          1.08331765625,
          0.95000453125,
          0.91169265625,
          1.3903320312500003,
          5.4127726562500005,
          8.79442,
          2.50016,
          1.2461200000000003,
          1,
          0.9178999999999999,
          0.9995200000000001,
          2.55856
        ],
        "trace_horner": [
          17.17169189453125,
          4.51837158203125,
          1.61651611328125,
          1.08331298828125,
          0.95001220703125,
          0.91192626953125,
          1.39093017578125,
          5.41046142578125,
          8.79296875,
          2.5,
          1.24609375,
          1,
          0.91796875,
          1,
          2.55859375
        ],
        "expanded17": [
          17.171691894531236,
          4.518371582031245,
          1.616516113281245,
          1.0833129882812471,
          0.9500122070312478,
          0.9119262695312467,
          1.3909301757812473,
          5.410461425781248,
          8.792968749999996,
          2.4999999999999947,
          1.246093749999996,
          0.9999999999999978,
          0.9179687499999973,
          0.9999999999999964,
          2.5585937499999987
        ]
      },
      "centered6": {
        "origin": "0.0000000000000000",
        "scale": "2.2912878474779199",
        "coefficientTokens": [
          "1.00000",
          "-0.286411",
          "0.328125",
          "-0.375914",
          "0.430664",
          "-0.493388",
          "0.565247"
        ],
        "predictions": [
          17.17169819756071,
          4.518372199565512,
          1.6165160715730145,
          1.083312988223943,
          0.9500122068953746,
          0.9119263540829623,
          1.3909307914721756,
          5.410465061698561,
          8.79297105486432,
          2.500000059953596,
          1.2460937299349266,
          1,
          0.91796877130684,
          1.0000002372065386,
          2.5585952891590082
        ]
      },
      "centered17": {
        "origin": "0.0000000000000000",
        "scale": "2.2912878474779199",
        "coefficientTokens": [
          "0.99999999999999778",
          "-0.28641098093473810",
          "0.32812499999999234",
          "-0.37591441247684781",
          "0.43066406250000766",
          "-0.49338766637586001",
          "0.56524658203124789"
        ],
        "predictions": [
          17.171691894531243,
          4.5183715820312464,
          1.6165161132812451,
          1.0833129882812471,
          0.9500122070312478,
          0.9119262695312467,
          1.3909301757812476,
          5.410461425781248,
          8.792968749999998,
          2.4999999999999947,
          1.246093749999996,
          0.9999999999999978,
          0.9179687499999973,
          0.9999999999999964,
          2.558593749999999
        ]
      },
      "r2_text": "1.000"
    },
    {
      "id": "C21",
      "ok": true,
      "n": 3,
      "coefficients": [
        62500125000.99994,
        -125000.12499999987,
        0.06249999999999994
      ],
      "equation": "y = 0.0625x² − 125,000x + 62,500,125,001",
      "display_tokens": [
        "62500125001",
        "-125000",
        "0.0625"
      ],
      "trace_tokens": [
        "62500100000",
        "-125000",
        "0.0625"
      ],
      "roundtrip_tokens": [
        "62500125000.999939",
        "-125000.12499999987",
        "0.062499999999999938"
      ],
      "reported": {
        "r2": 1,
        "adjustedR2": null,
        "residualSe": null,
        "slopeSe": null,
        "r": null
      },
      "predictions": {
        "internal": [
          1.1875,
          1.0000000000000002,
          0.9375000000000002,
          1.0781250000000002,
          0.9531250000000002
        ],
        "expanded_horner": [
          1.1875076293945312,
          1.0000076293945312,
          0.9375076293945312,
          1.0781326293945312,
          0.9531326293945312
        ],
        "expanded_sum": [
          1.1875152587890625,
          1.0000152587890625,
          0.9375152587890625,
          1.0781402587890625,
          0.9531402587890625
        ],
        "display_horner": [
          125001.0625,
          125001,
          125001.0625,
          125001.015625,
          125001.015625
        ],
        "display_sum": [
          125001.0625,
          125001,
          125001.0625,
          125001.015625,
          125001.015625
        ],
        "trace_horner": [
          100000.0625,
          100000,
          100000.0625,
          100000.015625,
          100000.015625
        ],
        "expanded17": [
          1.1875076293945312,
          1.0000076293945312,
          0.9375076293945312,
          1.0781326293945312,
          0.9531326293945312
        ]
      },
      "centered6": {
        "origin": "1000000.0000000000",
        "scale": "0.81649658092772603",
        "coefficientTokens": [
          "1.00000",
          "-0.102062",
          "0.0416667"
        ],
        "predictions": [
          1.1874999610639683,
          1,
          0.9375001389360317,
          1.0781249680319842,
          0.9531250569680159
        ]
      },
      "centered17": {
        "origin": "1000000.0000000000",
        "scale": "0.81649658092772603",
        "coefficientTokens": [
          "1.0000000000000002",
          "-0.10206207261596574",
          "0.041666666666666623"
        ],
        "predictions": [
          1.1875,
          1.0000000000000002,
          0.9375000000000002,
          1.0781250000000002,
          0.9531250000000002
        ]
      },
      "r2_text": "1.000"
    },
    {
      "id": "C22",
      "ok": true,
      "n": 4,
      "coefficients": [
        31250062500124976,
        -93750125000.12492,
        93750.06249999993,
        -0.031249999999999976
      ],
      "equation": "y = −0.0312x³ + 93,750x² − 93,750,125,000x + 31,250,062,500,124,976",
      "display_tokens": [
        "31250062500124976",
        "-93750125000",
        "93750",
        "-0.0312"
      ],
      "trace_tokens": [
        "31250100000000000",
        "-93750100000",
        "93750.1",
        "-0.03125"
      ],
      "roundtrip_tokens": [
        "31250062500124976",
        "-93750125000.124924",
        "93750.062499999927",
        "-0.031249999999999976"
      ],
      "reported": {
        "r2": 1,
        "adjustedR2": null,
        "residualSe": null,
        "slopeSe": null,
        "r": null
      },
      "predictions": {
        "internal": [
          1.4335937499999998,
          1.08203125,
          0.94921875,
          0.84765625,
          1.21875,
          1,
          0.90625
        ],
        "expanded_horner": [
          8,
          8,
          8,
          8,
          8,
          8,
          8
        ],
        "expanded_sum": [
          0,
          12,
          12,
          16,
          4,
          -8,
          0
        ],
        "display_horner": [
          49937275312808,
          49937425187508,
          49937575062516,
          49937724937816,
          49937350250120,
          49937500124976,
          49937650000128
        ],
        "display_sum": [
          49937275312828,
          49937425187516,
          49937575062524,
          49937724937820,
          49937350250116,
          49937500124976,
          49937650000128
        ],
        "trace_horner": [
          99999850008,
          99999950004,
          100000050004,
          100000150008,
          99999900008,
          100000000008,
          100000100008
        ],
        "expanded17": [
          8,
          8,
          8,
          8,
          8,
          8,
          8
        ]
      },
      "centered6": {
        "origin": "1000000.0000000000",
        "scale": "1.1180339887498949",
        "coefficientTokens": [
          "1.00000",
          "-0.139754",
          "0.0781250",
          "-0.0436732"
        ],
        "predictions": [
          1.4335934099910428,
          1.082031138585299,
          0.9492188614147011,
          0.8476565900089573,
          1.2187497757293841,
          1,
          0.9062502242706157
        ]
      },
      "centered17": {
        "origin": "1000000.0000000000",
        "scale": "1.1180339887498949",
        "coefficientTokens": [
          "1.0000000000000000",
          "-0.13975424859373681",
          "0.078124999999999958",
          "-0.043673202685542742"
        ],
        "predictions": [
          1.4335937499999998,
          1.08203125,
          0.94921875,
          0.84765625,
          1.21875,
          1,
          0.90625
        ]
      },
      "r2_text": "1.000"
    },
    {
      "id": "C23",
      "ok": true,
      "n": 5,
      "coefficients": [
        1.562503125006252e+22,
        -62500093750125080,
        93750093750.06262,
        -62500.03125000008,
        0.01562500000000002
      ],
      "equation": "y = 0.0156x⁴ − 62,500x³ + 93,750,093,750x² − 62,500,093,750,125,080x + 15,625,031,250,062,520,000,000",
      "display_tokens": [
        "15625031250062520000000",
        "-62500093750125080",
        "93750093750",
        "-62500",
        "0.0156"
      ],
      "trace_tokens": [
        "1.5625e+22",
        "-62500100000000000",
        "93750100000",
        "-62500",
        "0.015625"
      ],
      "roundtrip_tokens": [
        "1.5625031250062520e+22",
        "-62500093750125080",
        "93750093750.062622",
        "-62500.031250000080",
        "0.015625000000000021"
      ],
      "reported": {
        "r2": 1,
        "adjustedR2": null,
        "residualSe": null,
        "slopeSe": null,
        "r": null
      },
      "predictions": {
        "internal": [
          2.0000000000000004,
          1.2343750000000004,
          1.0000000000000004,
          0.9218750000000004,
          1.0000000000000004,
          1.5126953125000004,
          1.0830078125000004,
          0.9501953125000004,
          0.9267578125000003
        ],
        "expanded_horner": [
          0,
          4194304,
          0,
          0,
          0,
          0,
          4194304,
          2097152,
          2097152
        ],
        "expanded_sum": [
          8388608,
          12582912,
          -4194304,
          10485760,
          8388608,
          6291456,
          8388608,
          8388608,
          14680064
        ],
        "display_horner": [
          -24968550250654466000,
          -24968650156457066000,
          -24968750062559560000,
          -24968849968953557000,
          -24968949875655836000,
          -24968600203514870000,
          -24968700109472660000,
          -24968800015719860000,
          -24968899922275336000
        ],
        "display_sum": [
          -24968550250664950000,
          -24968650156459164000,
          -24968750062557463000,
          -24968849968959850000,
          -24968949875668420000,
          -24968600203512775000,
          -24968700109474760000,
          -24968800015724052000,
          -24968899922250170000
        ],
        "trace_horner": [
          -200003289088,
          -99998498816,
          0,
          100000595968,
          200003289088,
          -150002991104,
          -49998200832,
          50002395136,
          149996699648
        ],
        "expanded17": [
          0,
          4194304,
          0,
          0,
          0,
          0,
          4194304,
          2097152,
          2097152
        ]
      },
      "centered6": {
        "origin": "1000000.0000000000",
        "scale": "1.4142135623730951",
        "coefficientTokens": [
          "1.00000",
          "-0.176777",
          "0.125000",
          "-0.0883883",
          "0.0625000"
        ],
        "predictions": [
          2.0000002961458323,
          1.2343751986115898,
          1,
          0.9218748013884103,
          0.9999997038541677,
          1.5126955788307135,
          1.0830079181231291,
          0.9501952068768709,
          0.9267575461692863
        ]
      },
      "centered17": {
        "origin": "1000000.0000000000",
        "scale": "1.4142135623730951",
        "coefficientTokens": [
          "1.0000000000000004",
          "-0.17677669529663684",
          "0.12499999999999986",
          "-0.088388347648318502",
          "0.062500000000000097"
        ],
        "predictions": [
          2.0000000000000004,
          1.2343750000000004,
          1.0000000000000004,
          0.9218750000000004,
          1.0000000000000004,
          1.5126953125000004,
          1.0830078125000004,
          0.9501953125000004,
          0.9267578125000003
        ]
      },
      "r2_text": "1.000"
    },
    {
      "id": "C24",
      "ok": true,
      "n": 6,
      "coefficients": [
        7.812515625031257e+27,
        -3.906256250009379e+22,
        78125093750093810,
        -78125062500.03133,
        39062.51562500004,
        -0.007812500000000007
      ],
      "equation": "y = −0.00781x⁵ + 39,063x⁴ − 78,125,062,500x³ + 78,125,093,750,093,810x² − 39,062,562,500,093,790,000,000x + 7,812,515,625,031,257,000,000,000,000",
      "display_tokens": [
        "7812515625031257000000000000",
        "-39062562500093790000000",
        "78125093750093810",
        "-78125062500",
        "39063",
        "-0.00781"
      ],
      "trace_tokens": [
        "7.81252e+27",
        "-3.90626e+22",
        "78125100000000000",
        "-78125100000",
        "39062.5",
        "-0.0078125"
      ],
      "roundtrip_tokens": [
        "7.8125156250312568e+27",
        "-3.9062562500093789e+22",
        "78125093750093808",
        "-78125062500.031326",
        "39062.515625000036",
        "-0.0078125000000000069"
      ],
      "reported": {
        "r2": 1,
        "adjustedR2": null,
        "residualSe": null,
        "slopeSe": null,
        "r": null
      },
      "predictions": {
        "internal": [
          3.5646972656250004,
          1.572021484375,
          1.0832519531249996,
          0.9499511718749994,
          0.8674316406249997,
          0.4372558593749999,
          2.25,
          1.2421874999999998,
          0.9999999999999994,
          0.9140624999999994,
          0.7499999999999998
        ],
        "expanded_horner": [
          -18691697672192,
          -18691697672192,
          -21990232555520,
          -20890720927744,
          -21990232555520,
          -20890720927744,
          -19791209299968,
          -21990232555520,
          -17592186044416,
          -17592186044416,
          -19791209299968
        ],
        "expanded_sum": [
          -19791209299968,
          -15393162788864,
          -27487790694400,
          -23089744183296,
          -15393162788864,
          -17592186044416,
          -17592186044416,
          -24189255811072,
          -30786325577728,
          -24189255811072,
          -15393162788864
        ],
        "display_horner": [
          2.98433893770242e+24,
          2.984353375093836e+24,
          2.9843678125347295e+24,
          2.9843822500294993e+24,
          2.9843966875814437e+24,
          2.9844111252004583e+24,
          2.984346156384384e+24,
          2.9843605937988895e+24,
          2.9843750312749676e+24,
          2.9843894688005237e+24,
          2.9844039063920505e+24
        ],
        "display_sum": [
          2.984338937695823e+24,
          2.9843533750894377e+24,
          2.98436781253363e+24,
          2.9843822500360963e+24,
          2.9843966875913393e+24,
          2.9844111252092544e+24,
          2.984346156386583e+24,
          2.984360593806586e+24,
          2.9843750312639724e+24,
          2.9843894688027227e+24,
          2.984403906388752e+24
        ],
        "trace_horner": [
          -7.999950000386657e+22,
          -7.99996999995341e+22,
          -7.999990000619676e+22,
          -8.000010000406332e+22,
          -8.000029999973085e+22,
          -8.000050000419448e+22,
          -7.999959999895156e+22,
          -7.999980000341519e+22,
          -8.000000000348077e+22,
          -8.000020000244684e+22,
          -8.000040000910949e+22
        ],
        "expanded17": [
          -18691697672192,
          -18691697672192,
          -21990232555520,
          -20890720927744,
          -21990232555520,
          -20890720927744,
          -19791209299968,
          -21990232555520,
          -17592186044416,
          -17592186044416,
          -19791209299968
        ]
      },
      "centered6": {
        "origin": "1000000.0000000000",
        "scale": "1.7078251276599330",
        "coefficientTokens": [
          "1.00000",
          "-0.213478",
          "0.182292",
          "-0.155661",
          "0.132921",
          "-0.113503"
        ],
        "predictions": [
          3.564697840922813,
          1.5720215586600903,
          1.0832519369291667,
          0.9499512451116497,
          0.8674320723603179,
          0.43725664887310556,
          2.2500002280113516,
          1.2421875075902604,
          1,
          0.9140627193485151,
          0.750000660151914
        ]
      },
      "centered17": {
        "origin": "1000000.0000000000",
        "scale": "1.7078251276599330",
        "coefficientTokens": [
          "0.99999999999999944",
          "-0.21347814095749190",
          "0.18229166666666713",
          "-0.15566114444817067",
          "0.13292100694444434",
          "-0.11350291782679142"
        ],
        "predictions": [
          3.5646972656250004,
          1.572021484375,
          1.0832519531249996,
          0.9499511718749994,
          0.8674316406249997,
          0.4372558593749999,
          2.25,
          1.2421874999999998,
          0.9999999999999994,
          0.9140624999999994,
          0.7499999999999998
        ]
      },
      "r2_text": "1.000"
    },
    {
      "id": "C25",
      "ok": true,
      "n": 7,
      "coefficients": [
        3.906257812515633e+33,
        -2.343753906256255e+28,
        5.859382812509387e+22,
        -78125078125062660,
        58593789062.51574,
        -23437.507812500047,
        0.003906250000000008
      ],
      "equation": "y = 0.00391x⁶ − 23,438x⁵ + 58,593,789,063x⁴ − 78,125,078,125,062,660x³ + 58,593,828,125,093,870,000,000x² − 23,437,539,062,562,550,000,000,000,000x + 3,906,257,812,515,633,000,000,000,000,000,000",
      "display_tokens": [
        "3906257812515633000000000000000000",
        "-23437539062562550000000000000",
        "58593828125093870000000",
        "-78125078125062660",
        "58593789063",
        "-23438",
        "0.00391"
      ],
      "trace_tokens": [
        "3.90626e+33",
        "-2.34375e+28",
        "5.85938e+22",
        "-78125100000000000",
        "58593800000",
        "-23437.5",
        "0.00390625"
      ],
      "roundtrip_tokens": [
        "3.9062578125156332e+33",
        "-2.3437539062562552e+28",
        "5.8593828125093868e+22",
        "-78125078125062656",
        "58593789062.515739",
        "-23437.507812500047",
        "0.0039062500000000078"
      ],
      "reported": {
        "r2": 1,
        "adjustedR2": null,
        "residualSe": null,
        "slopeSe": null,
        "r": null
      },
      "predictions": {
        "internal": [
          8.792968750000002,
          2.5000000000000004,
          1.2460937500000004,
          0.9999999999999998,
          0.91796875,
          1.0000000000000004,
          2.558593750000001,
          4.518371582031251,
          1.6165161132812507,
          1.08331298828125,
          0.9500122070312498,
          0.9119262695312503,
          1.3909301757812504
        ],
        "expanded_horner": [
          -2305843009213694000,
          -1729382256910270500,
          -9223372036854776000,
          1152921504606847000,
          3458764513820541000,
          -2882303761517117400,
          -8070450532247929000,
          -8646911284551352000,
          -8070450532247929000,
          3458764513820541000,
          -3458764513820541000,
          -10952754293765046000,
          576460752303423500
        ],
        "expanded_sum": [
          6917529027641082000,
          -14411518807585587000,
          9223372036854776000,
          -8646911284551352000,
          -4035225266123964400,
          -3458764513820541000,
          -10952754293765046000,
          -12105675798371893000,
          -4035225266123964400,
          3458764513820541000,
          1152921504606847000,
          3458764513820541000,
          6917529027641082000
        ],
        "display_horner": [
          3.257752867558793e+30,
          3.2577729063687135e+30,
          3.2577929452714443e+30,
          3.2578129842946555e+30,
          3.257833023403183e+30,
          3.2578530626333433e+30,
          3.25787310194882e+30,
          3.257762886962024e+30,
          3.257782925811144e+30,
          3.2578029647772853e+30,
          3.257823003831049e+30,
          3.25784304300414e+30,
          3.2578630822734997e+30
        ],
        "display_sum": [
          3.2577528675760867e+30,
          3.257772906357761e+30,
          3.2577929452927734e+30,
          3.257812984294079e+30,
          3.257833023415865e+30,
          3.257853062628155e+30,
          3.257873101944785e+30,
          3.2577628869493417e+30,
          3.2577829258122967e+30,
          3.257802964787085e+30,
          3.257823003841425e+30,
          3.2578430430127867e+30,
          3.257863082289064e+30
        ],
        "trace_horner": [
          9.999999994945551e+27,
          1.0000000003592463e+28,
          9.999999997827855e+27,
          9.999999998404316e+27,
          9.999999992063247e+27,
          1.0000000004168923e+28,
          9.999999998404316e+27,
          9.999999997827855e+27,
          9.999999998404316e+27,
          1.0000000000133698e+28,
          1.000000000186308e+28,
          9.999999995522012e+27,
          9.999999997827855e+27
        ],
        "expanded17": [
          -2305843009213694000,
          -1729382256910270500,
          -9223372036854776000,
          1152921504606847000,
          3458764513820541000,
          -2882303761517117400,
          -8070450532247929000,
          -8646911284551352000,
          -8070450532247929000,
          3458764513820541000,
          -3458764513820541000,
          -10952754293765046000,
          576460752303423500
        ]
      },
      "centered6": {
        "origin": "1000000.0000000000",
        "scale": "2.0000000000000000",
        "coefficientTokens": [
          "1.00000",
          "-0.250000",
          "0.250000",
          "-0.250000",
          "0.250000",
          "-0.250000",
          "0.250000"
        ],
        "predictions": [
          8.79296875,
          2.5,
          1.24609375,
          1,
          0.91796875,
          1,
          2.55859375,
          4.51837158203125,
          1.61651611328125,
          1.08331298828125,
          0.95001220703125,
          0.91192626953125,
          1.39093017578125
        ]
      },
      "centered17": {
        "origin": "1000000.0000000000",
        "scale": "2.0000000000000000",
        "coefficientTokens": [
          "0.99999999999999978",
          "-0.25000000000000067",
          "0.25000000000000222",
          "-0.24999999999999917",
          "0.24999999999999803",
          "-0.25000000000000022",
          "0.25000000000000050"
        ],
        "predictions": [
          8.792968750000002,
          2.5000000000000004,
          1.2460937500000004,
          0.9999999999999998,
          0.91796875,
          1.0000000000000004,
          2.558593750000001,
          4.518371582031251,
          1.6165161132812507,
          1.08331298828125,
          0.9500122070312498,
          0.9119262695312503,
          1.3909301757812504
        ]
      },
      "r2_text": "1.000"
    },
    {
      "id": "C26",
      "ok": true,
      "n": 40,
      "coefficients": [
        0.0006735657894743896,
        7.32059160401002e-7,
        -3.1608187134501686e-15
      ],
      "equation": "y = −3.16e-15x² + 7.32e-7x + 6.74e-4",
      "display_tokens": [
        "6.74e-4",
        "7.32e-7",
        "-3.16e-15"
      ],
      "trace_tokens": [
        "0.000673566",
        "7.32059e-7",
        "-3.16082e-15"
      ],
      "roundtrip_tokens": [
        "0.00067356578947438961",
        "7.3205916040100205e-7",
        "-3.1608187134501686e-15"
      ],
      "reported": {
        "r2": 0.9999999001785371,
        "adjustedR2": 0.9999998947827824,
        "residualSe": 0.0002051774240761891,
        "slopeSe": null,
        "r": null
      },
      "predictions": {
        "internal": [
          0.1104113214285718,
          0.2200068402255645,
          0.3294601221804515,
          0.4387711672932334,
          0.54793997556391,
          0.6569665469924815,
          0.7658508815789477,
          0.8745929793233085,
          0.9831928402255641,
          1.0916504642857146,
          1.1999658515037597,
          1.3081390018796994,
          1.416169915413534,
          1.5240585921052632,
          1.6318050319548874,
          1.7394092349624062,
          1.8468712011278199,
          1.954190930451128,
          2.0613684229323312,
          2.168403678571429,
          0.1104113214285718,
          0.2200068402255645,
          0.3294601221804515,
          0.4387711672932334,
          0.54793997556391,
          0.6569665469924815,
          0.7658508815789477,
          0.8745929793233085,
          0.9831928402255641,
          1.0916504642857146,
          1.1999658515037597,
          1.3081390018796994,
          1.416169915413534,
          1.5240585921052632,
          1.6318050319548874,
          1.7394092349624062,
          1.8468712011278199,
          1.954190930451128,
          2.0613684229323312,
          2.168403678571429,
          0.16522686043233126,
          0.8202397100563912,
          1.5779495916353385,
          2.114903830357143,
          0.0006735657894743063,
          2.2752966973684217
        ],
        "expanded_horner": [
          0.11041132142857207,
          0.22000684022556447,
          0.3294601221804516,
          0.4387711672932335,
          0.5479399755639103,
          0.6569665469924816,
          0.7658508815789478,
          0.8745929793233087,
          0.9831928402255643,
          1.0916504642857146,
          1.1999658515037597,
          1.3081390018796994,
          1.416169915413534,
          1.5240585921052634,
          1.6318050319548874,
          1.7394092349624064,
          1.8468712011278197,
          1.954190930451128,
          2.0613684229323312,
          2.168403678571429,
          0.11041132142857207,
          0.22000684022556447,
          0.3294601221804516,
          0.4387711672932335,
          0.5479399755639103,
          0.6569665469924816,
          0.7658508815789478,
          0.8745929793233087,
          0.9831928402255643,
          1.0916504642857146,
          1.1999658515037597,
          1.3081390018796994,
          1.416169915413534,
          1.5240585921052634,
          1.6318050319548874,
          1.7394092349624064,
          1.8468712011278197,
          1.954190930451128,
          2.0613684229323312,
          2.168403678571429,
          0.16522686043233142,
          0.8202397100563913,
          1.5779495916353385,
          2.114903830357143,
          0.0006735657894743896,
          2.275296697368421
        ],
        "expanded_sum": [
          0.11041132142857206,
          0.22000684022556447,
          0.3294601221804517,
          0.43877116729323357,
          0.5479399755639102,
          0.6569665469924817,
          0.7658508815789478,
          0.8745929793233086,
          0.9831928402255643,
          1.0916504642857143,
          1.1999658515037597,
          1.3081390018796994,
          1.4161699154135339,
          1.5240585921052634,
          1.6318050319548876,
          1.7394092349624062,
          1.8468712011278199,
          1.9541909304511282,
          2.0613684229323312,
          2.168403678571429,
          0.11041132142857206,
          0.22000684022556447,
          0.3294601221804517,
          0.43877116729323357,
          0.5479399755639102,
          0.6569665469924817,
          0.7658508815789478,
          0.8745929793233086,
          0.9831928402255643,
          1.0916504642857143,
          1.1999658515037597,
          1.3081390018796994,
          1.4161699154135339,
          1.5240585921052634,
          1.6318050319548876,
          1.7394092349624062,
          1.8468712011278199,
          1.9541909304511282,
          2.0613684229323312,
          2.168403678571429,
          0.16522686043233145,
          0.8202397100563914,
          1.5779495916353385,
          2.1149038303571435,
          0.0006735657894743896,
          2.2752966973684217
        ],
        "display_horner": [
          0.11040290000000001,
          0.2199896,
          0.32943410000000006,
          0.4387364,
          0.5478965,
          0.6569143999999999,
          0.7657901,
          0.8745236000000001,
          0.9831149,
          1.0915640000000002,
          1.1998709,
          1.3080356000000002,
          1.4160581,
          1.5239384000000002,
          1.6316765000000002,
          1.7392724000000002,
          1.8467261000000001,
          1.9540376000000002,
          2.0612069,
          2.1682340000000004,
          0.11040290000000001,
          0.2199896,
          0.32943410000000006,
          0.4387364,
          0.5478965,
          0.6569143999999999,
          0.7657901,
          0.8745236000000001,
          0.9831149,
          1.0915640000000002,
          1.1998709,
          1.3080356000000002,
          1.4160581,
          1.5239384000000002,
          1.6316765000000002,
          1.7392724000000002,
          1.8467261000000001,
          1.9540376000000002,
          2.0612069,
          2.1682340000000004,
          0.16521402500000001,
          0.820174625,
          1.5778252250000002,
          2.1147382250000004,
          0.000674,
          2.2751189000000003
        ],
        "display_sum": [
          0.1104029,
          0.21998960000000004,
          0.3294341,
          0.4387364,
          0.5478965,
          0.6569144,
          0.7657901,
          0.8745236000000001,
          0.9831149,
          1.0915640000000002,
          1.1998709,
          1.3080356000000002,
          1.4160581,
          1.5239384000000002,
          1.6316765,
          1.7392724000000002,
          1.8467261000000001,
          1.9540376000000002,
          2.0612069,
          2.1682340000000004,
          0.1104029,
          0.21998960000000004,
          0.3294341,
          0.4387364,
          0.5478965,
          0.6569144,
          0.7657901,
          0.8745236000000001,
          0.9831149,
          1.0915640000000002,
          1.1998709,
          1.3080356000000002,
          1.4160581,
          1.5239384000000002,
          1.6316765,
          1.7392724000000002,
          1.8467261000000001,
          1.9540376000000002,
          2.0612069,
          2.1682340000000004,
          0.16521402500000001,
          0.8201746249999999,
          1.5778252250000002,
          2.1147382250000004,
          0.000674,
          2.2751189000000003
        ],
        "trace_horner": [
          0.11041129755,
          0.2200067922,
          0.32946004995,
          0.4387710708,
          0.54793985475,
          0.6569664018,
          0.7658507119500001,
          0.8745927852,
          0.98319262155,
          1.0916502209999999,
          1.1999655835499998,
          1.3081387091999999,
          1.4161695979499997,
          1.5240582498,
          1.63180466475,
          1.7394088427999999,
          1.8468707839499998,
          1.9541904881999999,
          2.06136795555,
          2.168403186,
          0.11041129755,
          0.2200067922,
          0.32946004995,
          0.4387710708,
          0.54793985475,
          0.6569664018,
          0.7658507119500001,
          0.8745927852,
          0.98319262155,
          1.0916502209999999,
          1.1999655835499998,
          1.3081387091999999,
          1.4161695979499997,
          1.5240582498,
          1.63180466475,
          1.7394088427999999,
          1.8468707839499998,
          1.9541904881999999,
          2.06136795555,
          2.168403186,
          0.16522682448749998,
          0.8202395281875,
          1.5779492368874997,
          2.1149033503875,
          0.000673566,
          2.27529617955
        ],
        "expanded17": [
          0.11041132142857207,
          0.22000684022556447,
          0.3294601221804516,
          0.4387711672932335,
          0.5479399755639103,
          0.6569665469924816,
          0.7658508815789478,
          0.8745929793233087,
          0.9831928402255643,
          1.0916504642857146,
          1.1999658515037597,
          1.3081390018796994,
          1.416169915413534,
          1.5240585921052634,
          1.6318050319548874,
          1.7394092349624064,
          1.8468712011278197,
          1.954190930451128,
          2.0613684229323312,
          2.168403678571429,
          0.11041132142857207,
          0.22000684022556447,
          0.3294601221804516,
          0.4387711672932335,
          0.5479399755639103,
          0.6569665469924816,
          0.7658508815789478,
          0.8745929793233087,
          0.9831928402255643,
          1.0916504642857146,
          1.1999658515037597,
          1.3081390018796994,
          1.416169915413534,
          1.5240585921052634,
          1.6318050319548874,
          1.7394092349624064,
          1.8468712011278197,
          1.954190930451128,
          2.0613684229323312,
          2.168403678571429,
          0.16522686043233142,
          0.8202397100563913,
          1.5779495916353385,
          2.114903830357143,
          0.0006735657894743896,
          2.275296697368421
        ]
      },
      "centered6": {
        "origin": "1575000.0000000000",
        "scale": "864942.19460030971",
        "coefficientTokens": [
          "1.14583",
          "0.624577",
          "-0.00236469"
        ],
        "predictions": [
          0.1104153631868996,
          0.2200108848063237,
          0.3294641694332666,
          0.43877521706772826,
          0.5479440277097088,
          0.656970601359208,
          0.7658549380162261,
          0.874597037680763,
          0.9831969003528187,
          1.091654526032393,
          1.1999699147194864,
          1.3081430664140985,
          1.4161739811162293,
          1.524062658825879,
          1.6318090995430474,
          1.7394133032677348,
          1.846875269999941,
          1.9541949997396655,
          2.061372492486909,
          2.1684077482416715,
          0.1104153631868996,
          0.2200108848063237,
          0.3294641694332666,
          0.43877521706772826,
          0.5479440277097088,
          0.656970601359208,
          0.7658549380162261,
          0.874597037680763,
          0.9831969003528187,
          1.091654526032393,
          1.1999699147194864,
          1.3081430664140985,
          1.4161739811162293,
          1.524062658825879,
          1.6318090995430474,
          1.7394133032677348,
          1.846875269999941,
          1.9541949997396655,
          2.061372492486909,
          2.1684077482416715,
          0.16523090362067183,
          0.8202437674725547,
          1.5779536588085232,
          2.1149078999883506,
          0.0006776045749943282,
          2.275300767003953
        ]
      },
      "centered17": {
        "origin": "1575000.0000000000",
        "scale": "864942.19460030971",
        "coefficientTokens": [
          "1.1458259375000002",
          "0.62457699152905510",
          "-0.0023646874999999072"
        ],
        "predictions": [
          0.1104113214285718,
          0.2200068402255645,
          0.3294601221804515,
          0.4387711672932334,
          0.54793997556391,
          0.6569665469924815,
          0.7658508815789477,
          0.8745929793233085,
          0.9831928402255641,
          1.0916504642857146,
          1.1999658515037597,
          1.3081390018796994,
          1.416169915413534,
          1.5240585921052632,
          1.6318050319548874,
          1.7394092349624062,
          1.8468712011278199,
          1.954190930451128,
          2.0613684229323312,
          2.168403678571429,
          0.1104113214285718,
          0.2200068402255645,
          0.3294601221804515,
          0.4387711672932334,
          0.54793997556391,
          0.6569665469924815,
          0.7658508815789477,
          0.8745929793233085,
          0.9831928402255641,
          1.0916504642857146,
          1.1999658515037597,
          1.3081390018796994,
          1.416169915413534,
          1.5240585921052632,
          1.6318050319548874,
          1.7394092349624062,
          1.8468712011278199,
          1.954190930451128,
          2.0613684229323312,
          2.168403678571429,
          0.16522686043233126,
          0.8202397100563912,
          1.5779495916353385,
          2.114903830357143,
          0.0006735657894743063,
          2.2752966973684217
        ]
      },
      "r2_text": "1.000"
    }
  ]
}
```

</details>

<details>
<summary>research/observed/analysis-results.json</summary>

<!-- R001_FILE: research/observed/analysis-results.json SHA256: ed639bbd251755362c6f179d25c3a8777224d23c2da9e6ac64246f717639e085 -->
```json
{
  "schema": "R001-analysis-v1",
  "source_run_sha256": "39382428325ba96a186e427171ba7ef3633328f523abf5d6ab5d67711305329c",
  "script_sha256": "5310d2406cce49d53f9ec9155621f9e7d9c8930e0ae4017c3fffdedf42711831",
  "summary": {
    "cases": 26,
    "available": 22,
    "unavailable": 4,
    "availability_passes": 26,
    "representation_material_passes": {
      "internal": 21,
      "expanded_horner": 15,
      "expanded_sum": 15,
      "display_horner": 3,
      "display_sum": 3,
      "trace_horner": 12,
      "expanded17": 15,
      "centered6": 21,
      "centered17": 22,
      "expanded_exact": 15,
      "display_exact": 3,
      "trace_exact": 12
    },
    "metric_sse_consistency_failures": [
      "C03"
    ],
    "input_effect_failures": [],
    "representation_limited": []
  },
  "cases": [
    {
      "id": "C01",
      "label": "Linear ordinary",
      "n": 5,
      "degree": 1,
      "expected_available": true,
      "baseline_available": true,
      "availability_pass": true,
      "x_min": -2.0,
      "x_max": 2.0,
      "units": {
        "x": "mm from local origin",
        "y": "V"
      },
      "input_max_abs_x_rounding": 0.0,
      "input_max_abs_y_rounding": 9.00826080396655e-17,
      "distinct_stored_x": 5,
      "tolerance": 0.0010000000009866901,
      "measurement_tolerance": 0.001,
      "numeric_budget": 9.866900947782887e-13,
      "visual_heuristic_budget": 0.00469134000098669,
      "response_range": 0.938268,
      "representation_limited": false,
      "input_effect_in_range": 9.00826080396655e-17,
      "input_effect_exceeds_tolerance": false,
      "metrics": {
        "internal": {
          "fitted": 0.0,
          "held": 1.1102230246251565e-16,
          "in_range": 1.1102230246251565e-16,
          "extrapolation": 0.0,
          "peak_ratio": "1/9007199254740992",
          "vs_baseline": 0.0,
          "material_pass": true,
          "numeric_pass": true,
          "visual_heuristic_pass": true
        },
        "expanded_horner": {
          "fitted": 0.0,
          "held": 1.1102230246251565e-16,
          "in_range": 1.1102230246251565e-16,
          "extrapolation": 0.0,
          "peak_ratio": "1/9007199254740992",
          "vs_baseline": 0.0,
          "material_pass": true,
          "numeric_pass": true,
          "visual_heuristic_pass": true
        },
        "expanded_sum": {
          "fitted": 0.0,
          "held": 1.1102230246251565e-16,
          "in_range": 1.1102230246251565e-16,
          "extrapolation": 0.0,
          "peak_ratio": "1/9007199254740992",
          "vs_baseline": 0.0,
          "material_pass": true,
          "numeric_pass": true,
          "visual_heuristic_pass": true
        },
        "display_horner": {
          "fitted": 0.005433000000000021,
          "held": 0.005216500000000068,
          "in_range": 0.005433000000000021,
          "extrapolation": 0.005866000000000038,
          "peak_ratio": "1529253548469/281474976710656",
          "vs_baseline": 0.005433000000000021,
          "material_pass": false,
          "numeric_pass": false,
          "visual_heuristic_pass": false
        },
        "display_sum": {
          "fitted": 0.005433000000000021,
          "held": 0.005216500000000068,
          "in_range": 0.005433000000000021,
          "extrapolation": 0.005866000000000038,
          "peak_ratio": "1529253548469/281474976710656",
          "vs_baseline": 0.005433000000000021,
          "material_pass": false,
          "numeric_pass": false,
          "visual_heuristic_pass": false
        },
        "trace_horner": {
          "fitted": 2.9999999999752447e-06,
          "held": 3.000000000086267e-06,
          "in_range": 3.000000000086267e-06,
          "extrapolation": 2.9999999999752447e-06,
          "peak_ratio": "27021597765/9007199254740992",
          "vs_baseline": 3.0000000001972893e-06,
          "material_pass": true,
          "numeric_pass": false,
          "visual_heuristic_pass": true
        },
        "expanded17": {
          "fitted": 0.0,
          "held": 1.1102230246251565e-16,
          "in_range": 1.1102230246251565e-16,
          "extrapolation": 0.0,
          "peak_ratio": "1/9007199254740992",
          "vs_baseline": 0.0,
          "material_pass": true,
          "numeric_pass": true,
          "visual_heuristic_pass": true
        },
        "centered6": {
          "fitted": 2.9999999999752447e-06,
          "held": 3.000000000086267e-06,
          "in_range": 3.000000000086267e-06,
          "extrapolation": 2.9999999999752447e-06,
          "peak_ratio": "27021597765/9007199254740992",
          "vs_baseline": 3.0000000001972893e-06,
          "material_pass": true,
          "numeric_pass": false,
          "visual_heuristic_pass": true
        },
        "centered17": {
          "fitted": 0.0,
          "held": 1.1102230246251565e-16,
          "in_range": 1.1102230246251565e-16,
          "extrapolation": 0.0,
          "peak_ratio": "1/9007199254740992",
          "vs_baseline": 0.0,
          "material_pass": true,
          "numeric_pass": true,
          "visual_heuristic_pass": true
        },
        "expanded_exact": {
          "fitted": 0.0,
          "held": 0.0,
          "in_range": 0.0,
          "extrapolation": 0.0,
          "peak_ratio": "0",
          "vs_baseline": 1.1102230246251565e-16,
          "material_pass": true,
          "numeric_pass": true,
          "visual_heuristic_pass": true
        },
        "display_exact": {
          "fitted": 0.00543300000000003,
          "held": 0.005216500000000015,
          "in_range": 0.00543300000000003,
          "extrapolation": 0.00586600000000006,
          "peak_ratio": "611701419387601/112589990684262400",
          "vs_baseline": 0.00543300000000003,
          "material_pass": false,
          "numeric_pass": false,
          "visual_heuristic_pass": false
        },
        "trace_exact": {
          "fitted": 3.0000000000900825e-06,
          "held": 3.000000000075069e-06,
          "in_range": 3.0000000000900825e-06,
          "extrapolation": 3.00000000012011e-06,
          "peak_ratio": "211106232539331/70368744177664000000",
          "vs_baseline": 3.0000000001560638e-06,
          "material_pass": true,
          "numeric_pass": false,
          "visual_heuristic_pass": true
        }
      },
      "measures": {
        "oracle_sse": 0.0,
        "direct_sse": 0.0,
        "reported_rse_implied_sse": 0.0,
        "sse_budget": 5.000000009866901e-06,
        "sse_metric_abs_difference": 0.0,
        "sse_consistency_material_pass": true,
        "direct_r2": 1.0,
        "reported_r2": 1,
        "r2_abs_difference": 0.0,
        "reported_residual_se": 0,
        "direct_residual_se": "0",
        "oracle_residual_se": "0",
        "reported_adjusted_r2": null,
        "expected_undefined_residual_se": false,
        "expected_undefined_adjusted_r2": false,
        "rse_abs_difference": "0",
        "centered17_direct_sse": 0.0
      },
      "equation": "y = 0.235x + 1.23",
      "trace_tokens": [
        "1.23457",
        "0.234567"
      ],
      "coefficient_absolute_errors": [
        0.0,
        0.0
      ],
      "basis_conversion_vs_baseline": 1.1102230246251565e-16,
      "expanded_horner_vs_exact": 1.1102230246251565e-16,
      "display_binary_vs_exact": 1.4210854715202004e-16
    },
    {
      "id": "C02",
      "label": "Linear translated",
      "n": 5,
      "degree": 1,
      "expected_available": true,
      "baseline_available": true,
      "availability_pass": true,
      "x_min": 999999998.0,
      "x_max": 1000000002.0,
      "units": {
        "x": "mm in translated coordinate",
        "y": "V"
      },
      "input_max_abs_x_rounding": 0.0,
      "input_max_abs_y_rounding": 9.00826080396655e-17,
      "distinct_stored_x": 5,
      "tolerance": 0.0010000000009866901,
      "measurement_tolerance": 0.001,
      "numeric_budget": 9.866900947782887e-13,
      "visual_heuristic_budget": 0.00469134000098669,
      "response_range": 0.938268,
      "representation_limited": false,
      "input_effect_in_range": 9.00826080396655e-17,
      "input_effect_exceeds_tolerance": false,
      "metrics": {
        "internal": {
          "fitted": 2.6878356873538678e-08,
          "held": 2.3082733169310643e-08,
          "in_range": 2.6878356873538678e-08,
          "extrapolation": 0.0,
          "peak_ratio": "60524679/2251799813685248",
          "vs_baseline": 0.0,
          "material_pass": true,
          "numeric_pass": false,
          "visual_heuristic_pass": true
        },
        "expanded_horner": {
          "fitted": 2.6878356873538678e-08,
          "held": 2.3082733169310643e-08,
          "in_range": 2.6878356873538678e-08,
          "extrapolation": 0.0,
          "peak_ratio": "60524679/2251799813685248",
          "vs_baseline": 0.0,
          "material_pass": true,
          "numeric_pass": false,
          "visual_heuristic_pass": true
        },
        "expanded_sum": {
          "fitted": 2.6878356873538678e-08,
          "held": 2.3082733169310643e-08,
          "in_range": 2.6878356873538678e-08,
          "extrapolation": 0.0,
          "peak_ratio": "60524679/2251799813685248",
          "vs_baseline": 0.0,
          "material_pass": true,
          "numeric_pass": false,
          "visual_heuristic_pass": true
        },
        "display_horner": {
          "fitted": 432999.7662989988,
          "held": 432999.76608249167,
          "in_range": 432999.7662989988,
          "extrapolation": 0.0,
          "peak_ratio": "1950057586155682883179/4503599627370496",
          "vs_baseline": 432999.7662990093,
          "material_pass": false,
          "numeric_pass": false,
          "visual_heuristic_pass": false
        },
        "display_sum": {
          "fitted": 432999.7662989988,
          "held": 432999.76608249167,
          "in_range": 432999.7662989988,
          "extrapolation": 0.0,
          "peak_ratio": "1950057586155682883179/4503599627370496",
          "vs_baseline": 432999.7662990093,
          "material_pass": false,
          "numeric_pass": false,
          "visual_heuristic_pass": false
        },
        "trace_horner": {
          "fitted": 1.234567016363144,
          "held": 1.2345670096435546,
          "in_range": 1.234567016363144,
          "extrapolation": 0.0,
          "peak_ratio": "41425195/33554432",
          "vs_baseline": 1.234567016363144,
          "material_pass": false,
          "numeric_pass": false,
          "visual_heuristic_pass": false
        },
        "expanded17": {
          "fitted": 2.6878356873538678e-08,
          "held": 2.3082733169310643e-08,
          "in_range": 2.6878356873538678e-08,
          "extrapolation": 0.0,
          "peak_ratio": "60524679/2251799813685248",
          "vs_baseline": 0.0,
          "material_pass": true,
          "numeric_pass": false,
          "visual_heuristic_pass": true
        },
        "centered6": {
          "fitted": 2.9999999999752447e-06,
          "held": 3.000000000086267e-06,
          "in_range": 3.000000000086267e-06,
          "extrapolation": 0.0,
          "peak_ratio": "27021597765/9007199254740992",
          "vs_baseline": 3.0268783568487834e-06,
          "material_pass": true,
          "numeric_pass": false,
          "visual_heuristic_pass": true
        },
        "centered17": {
          "fitted": 0.0,
          "held": 1.1102230246251565e-16,
          "in_range": 1.1102230246251565e-16,
          "extrapolation": 0.0,
          "peak_ratio": "1/9007199254740992",
          "vs_baseline": 2.6878356873538678e-08,
          "material_pass": true,
          "numeric_pass": true,
          "visual_heuristic_pass": true
        },
        "expanded_exact": {
          "fitted": 1.366439206229586e-08,
          "held": 1.366439206229586e-08,
          "in_range": 1.366439206229586e-08,
          "extrapolation": 0.0,
          "peak_ratio": "61538951/4503599627370496",
          "vs_baseline": 1.366439206229586e-08,
          "material_pass": true,
          "numeric_pass": false,
          "visual_heuristic_pass": true
        },
        "display_exact": {
          "fitted": 432999.766299,
          "held": 432999.7660825,
          "in_range": 432999.766299,
          "extrapolation": 0.0,
          "peak_ratio": "48751439653892206297203/112589990684262400",
          "vs_baseline": 432999.7662990105,
          "material_pass": false,
          "numeric_pass": false,
          "visual_heuristic_pass": false
        },
        "trace_exact": {
          "fitted": 1.234567,
          "held": 1.234567,
          "in_range": 1.234567,
          "extrapolation": 0.0,
          "peak_ratio": "86874929393186113601/70368744177664000000",
          "vs_baseline": 1.234567,
          "material_pass": false,
          "numeric_pass": false,
          "visual_heuristic_pass": false
        }
      },
      "measures": {
        "oracle_sse": 0.0,
        "direct_sse": 1.2813797680432364e-15,
        "reported_rse_implied_sse": 0.0,
        "sse_budget": 5.000134401651401e-06,
        "sse_metric_abs_difference": 1.2813797680432364e-15,
        "sse_consistency_material_pass": true,
        "direct_r2": 0.9999999999999977,
        "reported_r2": 1,
        "r2_abs_difference": 2.328863507113922e-15,
        "reported_residual_se": 0,
        "direct_residual_se": "2.0667041136741017623854423084160880090861102466562780598967216485190792074755715E-8",
        "oracle_residual_se": "0",
        "reported_adjusted_r2": null,
        "expected_undefined_residual_se": false,
        "expected_undefined_adjusted_r2": false,
        "rse_abs_difference": "2.066704113674101762385442308E-8",
        "centered17_direct_sse": 0.0
      },
      "equation": "y = 0.235x \u2212 234,566,999",
      "trace_tokens": [
        "-234567000",
        "0.234567"
      ],
      "coefficient_absolute_errors": [
        1.366439206229586e-08,
        0.0
      ],
      "basis_conversion_vs_baseline": 1.366439206229586e-08,
      "expanded_horner_vs_exact": 1.366439206229586e-08,
      "display_binary_vs_exact": 2.2649765014648438e-08
    },
    {
      "id": "C03",
      "label": "Linear representable tiny range",
      "n": 5,
      "degree": 1,
      "expected_available": true,
      "baseline_available": true,
      "availability_pass": true,
      "x_min": 1073741823.9999981,
      "x_max": 1073741824.000002,
      "units": {
        "x": "s from epoch; sampling interval 2^-20 s",
        "y": "V"
      },
      "input_max_abs_x_rounding": 0.0,
      "input_max_abs_y_rounding": 9.00826080396655e-17,
      "distinct_stored_x": 5,
      "tolerance": 0.0010000000009866901,
      "measurement_tolerance": 0.001,
      "numeric_budget": 9.866900947782887e-13,
      "visual_heuristic_budget": 0.00469134000098669,
      "response_range": 0.938268,
      "representation_limited": false,
      "input_effect_in_range": 9.00826080396655e-17,
      "input_effect_exceeds_tolerance": false,
      "metrics": {
        "internal": {
          "fitted": 0.03086600000000006,
          "held": 0.023533499999999985,
          "in_range": 0.03086600000000006,
          "extrapolation": 0.0,
          "peak_ratio": "69504053049209/2251799813685248",
          "vs_baseline": 0.0,
          "material_pass": false,
          "numeric_pass": false,
          "visual_heuristic_pass": false
        },
        "expanded_horner": {
          "fitted": 0.03086600000000006,
          "held": 0.023533499999999985,
          "in_range": 0.03086600000000006,
          "extrapolation": 0.0,
          "peak_ratio": "69504053049209/2251799813685248",
          "vs_baseline": 0.0,
          "material_pass": false,
          "numeric_pass": false,
          "visual_heuristic_pass": false
        },
        "expanded_sum": {
          "fitted": 0.03086600000000006,
          "held": 0.023533499999999985,
          "in_range": 0.03086600000000006,
          "extrapolation": 0.0,
          "peak_ratio": "69504053049209/2251799813685248",
          "vs_baseline": 0.0,
          "material_pass": false,
          "numeric_pass": false,
          "visual_heuristic_pass": false
        },
        "display_horner": {
          "fitted": 350675490.25,
          "held": 350675490.2426675,
          "in_range": 350675490.25,
          "extrapolation": 0.0,
          "peak_ratio": "1402701961/4",
          "vs_baseline": 350675490.25,
          "material_pass": false,
          "numeric_pass": false,
          "visual_heuristic_pass": false
        },
        "display_sum": {
          "fitted": 350675490.25,
          "held": 350675490.2426675,
          "in_range": 350675490.25,
          "extrapolation": 0.0,
          "peak_ratio": "1402701961/4",
          "vs_baseline": 350675490.25,
          "material_pass": false,
          "numeric_pass": false,
          "visual_heuristic_pass": false
        },
        "trace_horner": {
          "fitted": 387227137.25,
          "held": 387227137.2426675,
          "in_range": 387227137.25,
          "extrapolation": 0.0,
          "peak_ratio": "1548908549/4",
          "vs_baseline": 387227137.25,
          "material_pass": false,
          "numeric_pass": false,
          "visual_heuristic_pass": false
        },
        "expanded17": {
          "fitted": 0.03086600000000006,
          "held": 0.023533499999999985,
          "in_range": 0.03086600000000006,
          "extrapolation": 0.0,
          "peak_ratio": "69504053049209/2251799813685248",
          "vs_baseline": 0.0,
          "material_pass": false,
          "numeric_pass": false,
          "visual_heuristic_pass": false
        },
        "centered6": {
          "fitted": 3.6229248046026896e-06,
          "held": 3.4671936034458284e-06,
          "in_range": 3.6229248046026896e-06,
          "extrapolation": 0.0,
          "peak_ratio": "1019762675/281474976710656",
          "vs_baseline": 0.0308633114624024,
          "material_pass": true,
          "numeric_pass": false,
          "visual_heuristic_pass": true
        },
        "centered17": {
          "fitted": 0.0,
          "held": 1.1102230246251565e-16,
          "in_range": 1.1102230246251565e-16,
          "extrapolation": 0.0,
          "peak_ratio": "1/9007199254740992",
          "vs_baseline": 0.03086600000000006,
          "material_pass": true,
          "numeric_pass": true,
          "visual_heuristic_pass": true
        },
        "expanded_exact": {
          "fitted": 0.01543300000000003,
          "held": 0.01543300000000003,
          "in_range": 0.01543300000000003,
          "extrapolation": 0.0,
          "peak_ratio": "69504053049209/4503599627370496",
          "vs_baseline": 0.01543300000000003,
          "material_pass": false,
          "numeric_pass": false,
          "visual_heuristic_pass": false
        },
        "display_exact": {
          "fitted": 350675490.23456764,
          "held": 350675490.23456746,
          "in_range": 350675490.23456764,
          "extrapolation": 0.0,
          "peak_ratio": "1579302007148364755540373/4503599627370496",
          "vs_baseline": 350675490.2654333,
          "material_pass": false,
          "numeric_pass": false,
          "visual_heuristic_pass": false
        },
        "trace_exact": {
          "fitted": 387227137.23456764,
          "held": 387227137.23456746,
          "in_range": 387227137.23456764,
          "extrapolation": 0.0,
          "peak_ratio": "1743915990957342663547285/4503599627370496",
          "vs_baseline": 387227137.2654333,
          "material_pass": false,
          "numeric_pass": false,
          "visual_heuristic_pass": false
        }
      },
      "measures": {
        "oracle_sse": 0.0,
        "direct_sse": 0.0016675373350000064,
        "reported_rse_implied_sse": 0.0,
        "sse_budget": 0.0001593300001621431,
        "sse_metric_abs_difference": 0.0016675373350000064,
        "sse_consistency_material_pass": false,
        "direct_r2": 0.9969693084415077,
        "reported_r2": 1,
        "r2_abs_difference": 0.003030691558492347,
        "reported_residual_se": 0,
        "direct_residual_se": "0.023576381790540622842704784098239945597904734786639687444965423633174080398428667",
        "oracle_residual_se": "0",
        "reported_adjusted_r2": null,
        "expected_undefined_residual_se": false,
        "expected_undefined_adjusted_r2": false,
        "rse_abs_difference": "0.02357638179054062284270478410",
        "centered17_direct_sse": 0.0
      },
      "equation": "y = 245,961x \u2212 264,098,963,448,353",
      "trace_tokens": [
        "-264099000000000",
        "245961"
      ],
      "coefficient_absolute_errors": [
        0.01543300000000003,
        0.0
      ],
      "basis_conversion_vs_baseline": 0.01543300000000003,
      "expanded_horner_vs_exact": 0.01543300000000003,
      "display_binary_vs_exact": 0.015433311462402344
    },
    {
      "id": "C04",
      "label": "Quadratic simple control",
      "n": 5,
      "degree": 2,
      "expected_available": true,
      "baseline_available": true,
      "availability_pass": true,
      "x_min": -2.0,
      "x_max": 2.0,
      "units": {
        "x": "mm from local origin",
        "y": "V"
      },
      "input_max_abs_x_rounding": 0.0,
      "input_max_abs_y_rounding": 0.0,
      "distinct_stored_x": 5,
      "tolerance": 0.0010000000010461853,
      "measurement_tolerance": 0.001,
      "numeric_budget": 1.0461852778244065e-12,
      "visual_heuristic_budget": 0.005000000001046185,
      "response_range": 1.0,
      "representation_limited": false,
      "input_effect_in_range": 0.0,
      "input_effect_exceeds_tolerance": false,
      "metrics": {
        "internal": {
          "fitted": 2.220446049250313e-16,
          "held": 0.0,
          "in_range": 2.220446049250313e-16,
          "extrapolation": 2.220446049250313e-16,
          "peak_ratio": "1/4503599627370496",
          "vs_baseline": 0.0,
          "material_pass": true,
          "numeric_pass": true,
          "visual_heuristic_pass": true
        },
        "expanded_horner": {
          "fitted": 2.220446049250313e-16,
          "held": 1.1102230246251565e-16,
          "in_range": 2.220446049250313e-16,
          "extrapolation": 3.3306690738754696e-16,
          "peak_ratio": "1/4503599627370496",
          "vs_baseline": 1.1102230246251565e-16,
          "material_pass": true,
          "numeric_pass": true,
          "visual_heuristic_pass": true
        },
        "expanded_sum": {
          "fitted": 2.220446049250313e-16,
          "held": 1.1102230246251565e-16,
          "in_range": 2.220446049250313e-16,
          "extrapolation": 4.440892098500626e-16,
          "peak_ratio": "1/4503599627370496",
          "vs_baseline": 1.1102230246251565e-16,
          "material_pass": true,
          "numeric_pass": true,
          "visual_heuristic_pass": true
        },
        "display_horner": {
          "fitted": 0.00019999999999997797,
          "held": 0.00011249999999995985,
          "in_range": 0.00019999999999997797,
          "extrapolation": 0.00045000000000006146,
          "peak_ratio": "450359962737/2251799813685248",
          "vs_baseline": 0.00019999999999997797,
          "material_pass": true,
          "numeric_pass": false,
          "visual_heuristic_pass": true
        },
        "display_sum": {
          "fitted": 0.00019999999999997797,
          "held": 0.00011249999999995985,
          "in_range": 0.00019999999999997797,
          "extrapolation": 0.00045000000000006146,
          "peak_ratio": "450359962737/2251799813685248",
          "vs_baseline": 0.00019999999999997797,
          "material_pass": true,
          "numeric_pass": false,
          "visual_heuristic_pass": true
        },
        "trace_horner": {
          "fitted": 0.0,
          "held": 0.0,
          "in_range": 0.0,
          "extrapolation": 0.0,
          "peak_ratio": "0",
          "vs_baseline": 2.220446049250313e-16,
          "material_pass": true,
          "numeric_pass": true,
          "visual_heuristic_pass": true
        },
        "expanded17": {
          "fitted": 2.220446049250313e-16,
          "held": 1.1102230246251565e-16,
          "in_range": 2.220446049250313e-16,
          "extrapolation": 3.3306690738754696e-16,
          "peak_ratio": "1/4503599627370496",
          "vs_baseline": 1.1102230246251565e-16,
          "material_pass": true,
          "numeric_pass": true,
          "visual_heuristic_pass": true
        },
        "centered6": {
          "fitted": 5.523823052300258e-07,
          "held": 4.142867289225194e-07,
          "in_range": 5.523823052300258e-07,
          "extrapolation": 8.285734578450388e-07,
          "peak_ratio": "310963593/562949953421312",
          "vs_baseline": 5.523823053410482e-07,
          "material_pass": true,
          "numeric_pass": false,
          "visual_heuristic_pass": true
        },
        "centered17": {
          "fitted": 2.220446049250313e-16,
          "held": 0.0,
          "in_range": 2.220446049250313e-16,
          "extrapolation": 2.220446049250313e-16,
          "peak_ratio": "1/4503599627370496",
          "vs_baseline": 0.0,
          "material_pass": true,
          "numeric_pass": true,
          "visual_heuristic_pass": true
        },
        "expanded_exact": {
          "fitted": 1.8041124150158794e-16,
          "held": 1.222980050563649e-16,
          "in_range": 1.8041124150158794e-16,
          "extrapolation": 3.226585665316861e-16,
          "peak_ratio": "13/72057594037927936",
          "vs_baseline": 1.222980050563649e-16,
          "material_pass": true,
          "numeric_pass": true,
          "visual_heuristic_pass": true
        },
        "display_exact": {
          "fitted": 0.0002,
          "held": 0.0001125,
          "in_range": 0.0002,
          "extrapolation": 0.00045,
          "peak_ratio": "1/5000",
          "vs_baseline": 0.0002,
          "material_pass": true,
          "numeric_pass": false,
          "visual_heuristic_pass": true
        },
        "trace_exact": {
          "fitted": 0.0,
          "held": 0.0,
          "in_range": 0.0,
          "extrapolation": 0.0,
          "peak_ratio": "0",
          "vs_baseline": 2.220446049250313e-16,
          "material_pass": true,
          "numeric_pass": true,
          "visual_heuristic_pass": true
        }
      },
      "measures": {
        "oracle_sse": 0.0,
        "direct_sse": 4.930380657631324e-32,
        "reported_rse_implied_sse": 4.930380657631325e-32,
        "sse_budget": 5.000000010462297e-06,
        "sse_metric_abs_difference": 6.740627757001018e-48,
        "sse_consistency_material_pass": true,
        "direct_r2": 1.0,
        "reported_r2": 1,
        "r2_abs_difference": 7.719739745282073e-32,
        "reported_residual_se": 1.5700924586837752e-16,
        "direct_residual_se": "1.5700924586837750593933823719635634914234233187901291475004669639833704036370266E-16",
        "oracle_residual_se": "0",
        "reported_adjusted_r2": 1,
        "expected_undefined_residual_se": false,
        "expected_undefined_adjusted_r2": false,
        "rse_abs_difference": "1.406066176280364365085765767E-32",
        "centered17_direct_sse": 4.930380657631324e-32
      },
      "equation": "y = 0.0312x\u00b2 + 0.25x + 1",
      "trace_tokens": [
        "1",
        "0.25",
        "0.03125"
      ],
      "coefficient_absolute_errors": [
        0.0,
        5.551115123125783e-17,
        1.734723475976807e-17
      ],
      "basis_conversion_vs_baseline": 1.222980050563649e-16,
      "expanded_horner_vs_exact": 4.423544863740858e-17,
      "display_binary_vs_exact": 1.1652900866465644e-16
    },
    {
      "id": "C05",
      "label": "Quadratic noisy measurement",
      "n": 5,
      "degree": 2,
      "expected_available": true,
      "baseline_available": true,
      "availability_pass": true,
      "x_min": -2.0,
      "x_max": 2.0,
      "units": {
        "x": "mm from local origin",
        "y": "V"
      },
      "input_max_abs_x_rounding": 0.0,
      "input_max_abs_y_rounding": 9.610801043891115e-17,
      "distinct_stored_x": 5,
      "tolerance": 0.0010000000009906228,
      "measurement_tolerance": 0.001,
      "numeric_budget": 9.906227498687548e-13,
      "visual_heuristic_budget": 0.004691340000990623,
      "response_range": 0.938268,
      "representation_limited": false,
      "input_effect_in_range": 4.20732655064577e-17,
      "input_effect_exceeds_tolerance": false,
      "metrics": {
        "internal": {
          "fitted": 4.345730124961327e-16,
          "held": 3.497202527569243e-16,
          "in_range": 4.345730124961327e-16,
          "extrapolation": 8.215650382226159e-16,
          "peak_ratio": "137/315251973915934720",
          "vs_baseline": 0.0,
          "material_pass": true,
          "numeric_pass": true,
          "visual_heuristic_pass": true
        },
        "expanded_horner": {
          "fitted": 2.379049338482478e-16,
          "held": 3.497202527569243e-16,
          "in_range": 3.497202527569243e-16,
          "extrapolation": 3.774758283725532e-16,
          "peak_ratio": "63/180143985094819840",
          "vs_baseline": 2.220446049250313e-16,
          "material_pass": true,
          "numeric_pass": true,
          "visual_heuristic_pass": true
        },
        "expanded_sum": {
          "fitted": 4.345730124961327e-16,
          "held": 3.402040554029944e-16,
          "in_range": 4.345730124961327e-16,
          "extrapolation": 3.774758283725532e-16,
          "peak_ratio": "137/315251973915934720",
          "vs_baseline": 2.220446049250313e-16,
          "material_pass": true,
          "numeric_pass": true,
          "visual_heuristic_pass": true
        },
        "display_horner": {
          "fitted": 0.005301000000000013,
          "held": 0.005142249999999955,
          "in_range": 0.005301000000000013,
          "extrapolation": 0.005568999999999958,
          "peak_ratio": "835575356864187/157625986957967360",
          "vs_baseline": 0.005300999999999778,
          "material_pass": false,
          "numeric_pass": false,
          "visual_heuristic_pass": false
        },
        "display_sum": {
          "fitted": 0.005301000000000013,
          "held": 0.005142250000000066,
          "in_range": 0.005301000000000013,
          "extrapolation": 0.005568999999999958,
          "peak_ratio": "835575356864187/157625986957967360",
          "vs_baseline": 0.005300999999999778,
          "material_pass": false,
          "numeric_pass": false,
          "visual_heuristic_pass": false
        },
        "trace_horner": {
          "fitted": 3.000000000003793e-06,
          "held": 3.0000000000696135e-06,
          "in_range": 3.0000000000696135e-06,
          "extrapolation": 3.000000000041858e-06,
          "peak_ratio": "540431955297/180143985094819840",
          "vs_baseline": 3.000000000419334e-06,
          "material_pass": true,
          "numeric_pass": false,
          "visual_heuristic_pass": true
        },
        "expanded17": {
          "fitted": 2.379049338482478e-16,
          "held": 3.497202527569243e-16,
          "in_range": 3.497202527569243e-16,
          "extrapolation": 3.774758283725532e-16,
          "peak_ratio": "63/180143985094819840",
          "vs_baseline": 2.220446049250313e-16,
          "material_pass": true,
          "numeric_pass": true,
          "visual_heuristic_pass": true
        },
        "centered6": {
          "fitted": 3.2366189020122907e-06,
          "held": 3.1774641765442662e-06,
          "in_range": 3.2366189020122907e-06,
          "extrapolation": 3.3549283529721306e-06,
          "peak_ratio": "1020350497673/315251973915934720",
          "vs_baseline": 3.236618902446864e-06,
          "material_pass": true,
          "numeric_pass": false,
          "visual_heuristic_pass": true
        },
        "centered17": {
          "fitted": 4.345730124961327e-16,
          "held": 3.497202527569243e-16,
          "in_range": 4.345730124961327e-16,
          "extrapolation": 8.215650382226159e-16,
          "peak_ratio": "137/315251973915934720",
          "vs_baseline": 0.0,
          "material_pass": true,
          "numeric_pass": true,
          "visual_heuristic_pass": true
        },
        "expanded_exact": {
          "fitted": 3.5130628564924595e-16,
          "held": 3.072443093594351e-16,
          "in_range": 3.5130628564924595e-16,
          "extrapolation": 4.676814491233472e-16,
          "peak_ratio": "443/1261007895663738880",
          "vs_baseline": 1.196959198423997e-16,
          "material_pass": true,
          "numeric_pass": true,
          "visual_heuristic_pass": true
        },
        "display_exact": {
          "fitted": 0.005300999999999989,
          "held": 0.005142249999999988,
          "in_range": 0.005300999999999989,
          "extrapolation": 0.00556899999999999,
          "peak_ratio": "208893839216045819/39406496739491840000",
          "vs_baseline": 0.005300999999999755,
          "material_pass": false,
          "numeric_pass": false,
          "visual_heuristic_pass": false
        },
        "trace_exact": {
          "fitted": 3.0000000000420735e-06,
          "held": 3.0000000000355738e-06,
          "in_range": 3.0000000000420735e-06,
          "extrapolation": 3.0000000000572913e-06,
          "peak_ratio": "2955487255503337/985162418487296000000",
          "vs_baseline": 3.0000000004766463e-06,
          "material_pass": true,
          "numeric_pass": false,
          "visual_heuristic_pass": true
        }
      },
      "measures": {
        "oracle_sse": 6.999999999998236e-07,
        "direct_sse": 6.999999999998902e-07,
        "reported_rse_implied_sse": 6.999999999998903e-07,
        "sse_budget": 8.200000013076757e-06,
        "sse_metric_abs_difference": 7.284289935825775e-23,
        "sse_consistency_material_pass": true,
        "direct_r2": 0.9999987653139865,
        "reported_r2": 0.9999987653139865,
        "r2_abs_difference": 3.1446890148505694e-17,
        "reported_residual_se": 0.0005916079783099152,
        "direct_residual_se": "0.00059160797830991521422452427717928782510832005851375653640133600615650384362488419",
        "oracle_residual_se": "0.00059160797830988706493313532590999293579927099124720189142859149625416925670163061",
        "reported_adjusted_r2": 0.9999975306279729,
        "expected_undefined_residual_se": false,
        "expected_undefined_adjusted_r2": false,
        "rse_abs_difference": "1.422452427717928782510832006E-20",
        "centered17_direct_sse": 6.999999999998902e-07
      },
      "equation": "y = 0.0346x\u00b2 + 0.235x + 1.23",
      "trace_tokens": [
        "1.23457",
        "0.234567",
        "0.034567"
      ],
      "coefficient_absolute_errors": [
        2.3156080227896124e-16,
        2.2204460492503132e-17,
        1.883414059631962e-17
      ],
      "basis_conversion_vs_baseline": 1.196959198423997e-16,
      "expanded_horner_vs_exact": 1.3877787807814457e-16,
      "display_binary_vs_exact": 9.094947017729283e-17
    },
    {
      "id": "C06",
      "label": "Quadratic translated",
      "n": 5,
      "degree": 2,
      "expected_available": true,
      "baseline_available": true,
      "availability_pass": true,
      "x_min": 999999998.0,
      "x_max": 1000000002.0,
      "units": {
        "x": "mm in translated coordinate",
        "y": "V"
      },
      "input_max_abs_x_rounding": 0.0,
      "input_max_abs_y_rounding": 9.610801043891115e-17,
      "distinct_stored_x": 5,
      "tolerance": 0.0010000000009906228,
      "measurement_tolerance": 0.001,
      "numeric_budget": 9.906227498687548e-13,
      "visual_heuristic_budget": 0.004691340000990623,
      "response_range": 0.938268,
      "representation_limited": false,
      "input_effect_in_range": 4.20732655064577e-17,
      "input_effect_exceeds_tolerance": false,
      "metrics": {
        "internal": {
          "fitted": 4.345730124961327e-16,
          "held": 3.497202527569243e-16,
          "in_range": 4.345730124961327e-16,
          "extrapolation": 0.0,
          "peak_ratio": "137/315251973915934720",
          "vs_baseline": 0.0,
          "material_pass": true,
          "numeric_pass": true,
          "visual_heuristic_pass": true
        },
        "expanded_horner": {
          "fitted": 7.096299,
          "held": 6.33580675,
          "in_range": 7.096299,
          "extrapolation": 0.0,
          "peak_ratio": "2237122267247673641/315251973915934720",
          "vs_baseline": 7.096299,
          "material_pass": false,
          "numeric_pass": false,
          "visual_heuristic_pass": false
        },
        "expanded_sum": {
          "fitted": 7.096299,
          "held": 7.03950775,
          "in_range": 7.096299,
          "extrapolation": 0.0,
          "peak_ratio": "2237122267247673641/315251973915934720",
          "vs_baseline": 7.096299,
          "material_pass": false,
          "numeric_pass": false,
          "visual_heuristic_pass": false
        },
        "display_horner": {
          "fitted": 32999765564978.156,
          "held": 32999765531978.336,
          "in_range": 32999765564978.156,
          "extrapolation": 0.0,
          "peak_ratio": "10403241233122455054002456145253/315251973915934720",
          "vs_baseline": 32999765564978.156,
          "material_pass": false,
          "numeric_pass": false,
          "visual_heuristic_pass": false
        },
        "display_sum": {
          "fitted": 32999765564978.156,
          "held": 32999765531978.336,
          "in_range": 32999765564978.156,
          "extrapolation": 0.0,
          "peak_ratio": "10403241233122455054002456145253/315251973915934720",
          "vs_baseline": 32999765564978.156,
          "material_pass": false,
          "numeric_pass": false,
          "visual_heuristic_pass": false
        },
        "trace_horner": {
          "fitted": 5.841969,
          "held": 5.66419325,
          "in_range": 5.841969,
          "extrapolation": 0.0,
          "peak_ratio": "1841692258805699227/315251973915934720",
          "vs_baseline": 5.841969,
          "material_pass": false,
          "numeric_pass": false,
          "visual_heuristic_pass": false
        },
        "expanded17": {
          "fitted": 7.096299,
          "held": 6.33580675,
          "in_range": 7.096299,
          "extrapolation": 0.0,
          "peak_ratio": "2237122267247673641/315251973915934720",
          "vs_baseline": 7.096299,
          "material_pass": false,
          "numeric_pass": false,
          "visual_heuristic_pass": false
        },
        "centered6": {
          "fitted": 3.2366189020122907e-06,
          "held": 3.1774641765442662e-06,
          "in_range": 3.2366189020122907e-06,
          "extrapolation": 0.0,
          "peak_ratio": "1020350497673/315251973915934720",
          "vs_baseline": 3.236618902446864e-06,
          "material_pass": true,
          "numeric_pass": false,
          "visual_heuristic_pass": true
        },
        "centered17": {
          "fitted": 4.345730124961327e-16,
          "held": 3.497202527569243e-16,
          "in_range": 4.345730124961327e-16,
          "extrapolation": 0.0,
          "peak_ratio": "137/315251973915934720",
          "vs_baseline": 0.0,
          "material_pass": true,
          "numeric_pass": true,
          "visual_heuristic_pass": true
        },
        "expanded_exact": {
          "fitted": 4.617814771920631,
          "held": 4.617814769150982,
          "in_range": 4.617814771920631,
          "extrapolation": 0.0,
          "peak_ratio": "5823100888104562277/1261007895663738880",
          "vs_baseline": 4.617814771920631,
          "material_pass": false,
          "numeric_pass": false,
          "visual_heuristic_pass": false
        },
        "display_exact": {
          "fitted": 32999765564978.297,
          "held": 32999765531978.414,
          "in_range": 32999765564978.297,
          "extrapolation": 0.0,
          "peak_ratio": "1300405154140312335609455763827281/39406496739491840000",
          "vs_baseline": 32999765564978.297,
          "material_pass": false,
          "numeric_pass": false,
          "visual_heuristic_pass": false
        },
        "trace_exact": {
          "fitted": 1.703701,
          "held": 1.5864175,
          "in_range": 1.703701,
          "extrapolation": 0.0,
          "peak_ratio": "1678422197539224641047/985162418487296000000",
          "vs_baseline": 1.7037009999999995,
          "material_pass": false,
          "numeric_pass": false,
          "visual_heuristic_pass": false
        }
      },
      "measures": {
        "oracle_sse": 6.999999999998236e-07,
        "direct_sse": 6.999999999998902e-07,
        "reported_rse_implied_sse": 6.999999999998903e-07,
        "sse_budget": 8.200000013076757e-06,
        "sse_metric_abs_difference": 7.284289935825775e-23,
        "sse_consistency_material_pass": true,
        "direct_r2": 0.9999987653139865,
        "reported_r2": 0.9999987653139865,
        "r2_abs_difference": 3.1446890148505694e-17,
        "reported_residual_se": 0.0005916079783099152,
        "direct_residual_se": "0.00059160797830991521422452427717928782510832005851375653640133600615650384362488419",
        "oracle_residual_se": "0.00059160797830988706493313532590999293579927099124720189142859149625416925670163061",
        "reported_adjusted_r2": 0.9999975306279729,
        "expected_undefined_residual_se": false,
        "expected_undefined_adjusted_r2": false,
        "rse_abs_difference": "1.422452427717928782510832006E-20",
        "centered17_direct_sse": 6.999999999998902e-07
      },
      "equation": "y = 0.0346x\u00b2 \u2212 69,134,000x + 34,566,999,765,432,980",
      "trace_tokens": [
        "34567000000000000",
        "-69134000",
        "0.034567"
      ],
      "coefficient_absolute_errors": [
        19.75562305639098,
        4.3207578413552636e-08,
        1.883414059631962e-17
      ],
      "basis_conversion_vs_baseline": 4.617814771920631,
      "expanded_horner_vs_exact": 2.4784842502365585,
      "display_binary_vs_exact": 4.0346
    },
    {
      "id": "C07",
      "label": "Quadratic X unit change",
      "n": 5,
      "degree": 2,
      "expected_available": true,
      "baseline_available": true,
      "availability_pass": true,
      "x_min": -0.002,
      "x_max": 0.002,
      "units": {
        "x": "m from local origin",
        "y": "V"
      },
      "input_max_abs_x_rounding": 4.163336342344337e-20,
      "input_max_abs_y_rounding": 9.610801043891115e-17,
      "distinct_stored_x": 5,
      "tolerance": 0.0010000000009906228,
      "measurement_tolerance": 0.001,
      "numeric_budget": 9.906227498687548e-13,
      "visual_heuristic_budget": 0.004691340000990623,
      "response_range": 0.938268,
      "representation_limited": false,
      "input_effect_in_range": 4.20732655064577e-17,
      "input_effect_exceeds_tolerance": false,
      "metrics": {
        "internal": {
          "fitted": 3.457551705261202e-16,
          "held": 3.497202527569243e-16,
          "in_range": 3.497202527569243e-16,
          "extrapolation": 0.0,
          "peak_ratio": "63/180143985094819840",
          "vs_baseline": 0.0,
          "material_pass": true,
          "numeric_pass": true,
          "visual_heuristic_pass": true
        },
        "expanded_horner": {
          "fitted": 4.345730124961327e-16,
          "held": 3.497202527569243e-16,
          "in_range": 4.345730124961327e-16,
          "extrapolation": 0.0,
          "peak_ratio": "137/315251973915934720",
          "vs_baseline": 2.220446049250313e-16,
          "material_pass": true,
          "numeric_pass": true,
          "visual_heuristic_pass": true
        },
        "expanded_sum": {
          "fitted": 4.345730124961327e-16,
          "held": 3.402040554029944e-16,
          "in_range": 4.345730124961327e-16,
          "extrapolation": 0.0,
          "peak_ratio": "137/315251973915934720",
          "vs_baseline": 2.220446049250313e-16,
          "material_pass": true,
          "numeric_pass": true,
          "visual_heuristic_pass": true
        },
        "display_horner": {
          "fitted": 0.005432999999999923,
          "held": 0.0052165000000000085,
          "in_range": 0.005432999999999923,
          "extrapolation": 0.0,
          "peak_ratio": "1712763974285249/315251973915934720",
          "vs_baseline": 0.005432999999999577,
          "material_pass": false,
          "numeric_pass": false,
          "visual_heuristic_pass": false
        },
        "display_sum": {
          "fitted": 0.005432999999999923,
          "held": 0.0052165000000000085,
          "in_range": 0.005432999999999923,
          "extrapolation": 0.0,
          "peak_ratio": "1712763974285249/315251973915934720",
          "vs_baseline": 0.005432999999999577,
          "material_pass": false,
          "numeric_pass": false,
          "visual_heuristic_pass": false
        },
        "trace_horner": {
          "fitted": 3.0000000002068053e-06,
          "held": 3.00000000007913e-06,
          "in_range": 3.0000000002068053e-06,
          "extrapolation": 0.0,
          "peak_ratio": "945755921813/315251973915934720",
          "vs_baseline": 3.000000000419334e-06,
          "material_pass": true,
          "numeric_pass": false,
          "visual_heuristic_pass": true
        },
        "expanded17": {
          "fitted": 4.345730124961327e-16,
          "held": 3.497202527569243e-16,
          "in_range": 4.345730124961327e-16,
          "extrapolation": 0.0,
          "peak_ratio": "137/315251973915934720",
          "vs_baseline": 2.220446049250313e-16,
          "material_pass": true,
          "numeric_pass": true,
          "visual_heuristic_pass": true
        },
        "centered6": {
          "fitted": 3.2366189020122907e-06,
          "held": 3.1774641765442662e-06,
          "in_range": 3.2366189020122907e-06,
          "extrapolation": 0.0,
          "peak_ratio": "1020350497673/315251973915934720",
          "vs_baseline": 3.2366189022248193e-06,
          "material_pass": true,
          "numeric_pass": false,
          "visual_heuristic_pass": true
        },
        "centered17": {
          "fitted": 3.457551705261202e-16,
          "held": 3.497202527569243e-16,
          "in_range": 3.497202527569243e-16,
          "extrapolation": 0.0,
          "peak_ratio": "63/180143985094819840",
          "vs_baseline": 0.0,
          "material_pass": true,
          "numeric_pass": true,
          "visual_heuristic_pass": true
        },
        "expanded_exact": {
          "fitted": 3.2407949538245823e-16,
          "held": 2.8676748079333896e-16,
          "in_range": 3.2407949538245823e-16,
          "extrapolation": 0.0,
          "peak_ratio": "518046717482476286868378425549673/1598517415830675066785280285783434552748676218880",
          "vs_baseline": 1.6860803031537587e-16,
          "material_pass": true,
          "numeric_pass": true,
          "visual_heuristic_pass": true
        },
        "display_exact": {
          "fitted": 0.005432999999999993,
          "held": 0.005216499999999992,
          "in_range": 0.005432999999999993,
          "extrapolation": 0.0,
          "peak_ratio": "315949186923100454513095373075230519/58153724815590069439541558887265075200",
          "vs_baseline": 0.005432999999999647,
          "material_pass": false,
          "numeric_pass": false,
          "visual_heuristic_pass": false
        },
        "trace_exact": {
          "fitted": 3.0000000000575958e-06,
          "held": 3.000000000046136e-06,
          "in_range": 3.0000000000575958e-06,
          "extrapolation": 0.0,
          "peak_ratio": "21807646806264951168779709085610533/7269215601948758679942694860908134400000",
          "vs_baseline": 3.0000000003773143e-06,
          "material_pass": true,
          "numeric_pass": false,
          "visual_heuristic_pass": true
        }
      },
      "measures": {
        "oracle_sse": 6.999999999998236e-07,
        "direct_sse": 6.99999999999868e-07,
        "reported_rse_implied_sse": 6.999999999998679e-07,
        "sse_budget": 8.200000013076535e-06,
        "sse_metric_abs_difference": 4.420501400377915e-23,
        "sse_consistency_material_pass": true,
        "direct_r2": 0.9999987653139865,
        "reported_r2": 0.9999987653139865,
        "r2_abs_difference": 3.140772509592125e-17,
        "reported_residual_se": 0.0005916079783099058,
        "direct_residual_se": "0.00059160797830990583112739464580502239829058230121005965501728052660505550667419881",
        "oracle_residual_se": "0.00059160797830988706493313532590999293579927099124720189142859149625416925670163061",
        "reported_adjusted_r2": 0.9999975306279729,
        "expected_undefined_residual_se": false,
        "expected_undefined_adjusted_r2": false,
        "rse_abs_difference": "3.112739464580502239829058230E-20",
        "centered17_direct_sse": 6.99999999999868e-07
      },
      "equation": "y = 34,567x\u00b2 + 235x + 1.23",
      "trace_tokens": [
        "1.23457",
        "234.567",
        "34567"
      ],
      "coefficient_absolute_errors": [
        2.3156080227896124e-16,
        8.439769716428458e-15,
        1.8909788417660015e-11
      ],
      "basis_conversion_vs_baseline": 1.6860803031537587e-16,
      "expanded_horner_vs_exact": 1.1049351711367449e-16,
      "display_binary_vs_exact": 1.3405822285594837e-16
    },
    {
      "id": "C08",
      "label": "Quadratic translate and X units",
      "n": 5,
      "degree": 2,
      "expected_available": true,
      "baseline_available": true,
      "availability_pass": true,
      "x_min": 999999.998,
      "x_max": 1000000.002,
      "units": {
        "x": "m in translated coordinate",
        "y": "V"
      },
      "input_max_abs_x_rounding": 4.74974513053894e-11,
      "input_max_abs_y_rounding": 9.610801043891115e-17,
      "distinct_stored_x": 5,
      "tolerance": 0.0010000000009906228,
      "measurement_tolerance": 0.001,
      "numeric_budget": 9.906227498687548e-13,
      "visual_heuristic_budget": 0.004691340000990623,
      "response_range": 0.938268,
      "representation_limited": false,
      "input_effect_in_range": 1.2769130957215443e-08,
      "input_effect_exceeds_tolerance": false,
      "metrics": {
        "internal": {
          "fitted": 4.620579870469868e-16,
          "held": 3.226829348603202e-16,
          "in_range": 4.620579870469868e-16,
          "extrapolation": 0.0,
          "peak_ratio": "146296324171313107204005186594516524510796317/316618970502583716060559184328144116850853138016423041302528",
          "vs_baseline": 0.0,
          "material_pass": true,
          "numeric_pass": true,
          "visual_heuristic_pass": true
        },
        "expanded_horner": {
          "fitted": 5.503701012769131,
          "held": 5.125925254582084,
          "in_range": 5.503701012769131,
          "extrapolation": 0.0,
          "peak_ratio": "580858716205663199517480279566344482228380081286027293133221/105539656834194572020186394776048038950284379338807680434176",
          "vs_baseline": 5.503701012769131,
          "material_pass": false,
          "numeric_pass": false,
          "visual_heuristic_pass": false
        },
        "expanded_sum": {
          "fitted": 9.234566997253902,
          "held": 5.66419325428122,
          "in_range": 9.234566997253902,
          "extrapolation": 0.0,
          "peak_ratio": "3962540867074571010397281420567264627242995735/429098718787022508216279689305928910476673024",
          "vs_baseline": 9.234566997253902,
          "material_pass": false,
          "numeric_pass": false,
          "visual_heuristic_pass": false
        },
        "display_horner": {
          "fitted": 1308904189.503701,
          "held": 1308904185.6641932,
          "in_range": 1308904189.503701,
          "extrapolation": 0.0,
          "peak_ratio": "138141298989060185792974504099725300733366674334788607777655196125605/105539656834194572020186394776048038950284379338807680434176",
          "vs_baseline": 1308904189.503701,
          "material_pass": false,
          "numeric_pass": false,
          "visual_heuristic_pass": false
        },
        "display_sum": {
          "fitted": 1308904189.503701,
          "held": 1308904193.6641932,
          "in_range": 1308904193.6641932,
          "extrapolation": 0.0,
          "peak_ratio": "138141299428157109223489327159518541852815664310977514112986757053215/105539656834194572020186394776048038950284379338807680434176",
          "vs_baseline": 1308904193.6641932,
          "material_pass": false,
          "numeric_pass": false,
          "visual_heuristic_pass": false
        },
        "trace_horner": {
          "fitted": 4.903701004988234,
          "held": 1.66419325428122,
          "in_range": 4.903701004988234,
          "extrapolation": 0.0,
          "peak_ratio": "1552604763851859692750112282861401783295683381302501745902229/316618970502583716060559184328144116850853138016423041302528",
          "vs_baseline": 4.903701004988234,
          "material_pass": false,
          "numeric_pass": false,
          "visual_heuristic_pass": false
        },
        "expanded17": {
          "fitted": 5.503701012769131,
          "held": 5.125925254582084,
          "in_range": 5.503701012769131,
          "extrapolation": 0.0,
          "peak_ratio": "580858716205663199517480279566344482228380081286027293133221/105539656834194572020186394776048038950284379338807680434176",
          "vs_baseline": 5.503701012769131,
          "material_pass": false,
          "numeric_pass": false,
          "visual_heuristic_pass": false
        },
        "centered6": {
          "fitted": 3.233872801784966e-06,
          "held": 3.177120915760166e-06,
          "in_range": 3.233872801784966e-06,
          "extrapolation": 0.0,
          "peak_ratio": "511952738618730972060697356388782668894071194923119307/158309485251291858030279592164072058425426569008211520651264",
          "vs_baseline": 3.233872801988724e-06,
          "material_pass": true,
          "numeric_pass": false,
          "visual_heuristic_pass": true
        },
        "centered17": {
          "fitted": 4.620579870469868e-16,
          "held": 3.226829348603202e-16,
          "in_range": 4.620579870469868e-16,
          "extrapolation": 0.0,
          "peak_ratio": "146296324171313107204005186594516524510796317/316618970502583716060559184328144116850853138016423041302528",
          "vs_baseline": 0.0,
          "material_pass": true,
          "numeric_pass": true,
          "visual_heuristic_pass": true
        },
        "expanded_exact": {
          "fitted": 4.827042893350953,
          "held": 4.827042892105011,
          "in_range": 4.827042893350953,
          "extrapolation": 0.0,
          "peak_ratio": "3360840582106365487528187073233368341522367339338499399966710800712145837/696252479284114300918912845906849133695598969589509771927150081087635456",
          "vs_baseline": 4.827042893350953,
          "material_pass": false,
          "numeric_pass": false,
          "visual_heuristic_pass": false
        },
        "display_exact": {
          "fitted": 1308904190.469701,
          "held": 1308904189.1609175,
          "in_range": 1308904190.469701,
          "extrapolation": 0.0,
          "peak_ratio": "1697480283230349155280599680390487936008062223647896014122570127661585117/1296871303178582900984050419008078302621094453315268777175154688",
          "vs_baseline": 1308904190.469701,
          "material_pass": false,
          "numeric_pass": false,
          "visual_heuristic_pass": false
        },
        "trace_exact": {
          "fitted": 1.7037009970271146,
          "held": 1.5864175029291128,
          "in_range": 1.7037009970271146,
          "extrapolation": 0.0,
          "peak_ratio": "2209480932241205065245300820849962287013331338977433727613784797/1296871303178582900984050419008078302621094453315268777175154688",
          "vs_baseline": 1.7037009970271144,
          "material_pass": false,
          "numeric_pass": false,
          "visual_heuristic_pass": false
        }
      },
      "measures": {
        "oracle_sse": 7.000064389187524e-07,
        "direct_sse": 7.000064389188181e-07,
        "reported_rse_implied_sse": 7.000064389188182e-07,
        "sse_budget": 8.200014783108857e-06,
        "sse_metric_abs_difference": 1.4726252721412584e-22,
        "sse_consistency_material_pass": true,
        "direct_r2": 0.9999987653026292,
        "reported_r2": 0.9999987653026292,
        "r2_abs_difference": 1.2538580649144762e-17,
        "reported_residual_se": 0.000591610699243522,
        "direct_residual_se": "0.00059161069924352197220280707413788440068519999116756841665801527898856911122210002",
        "oracle_residual_se": "0.00059161069924349426841286323498133049027785792464591207015408998879209130164060615",
        "reported_adjusted_r2": 0.9999975306052584,
        "expected_undefined_residual_se": false,
        "expected_undefined_adjusted_r2": false,
        "rse_abs_difference": "2.779719292586211559931480001E-20",
        "centered17_direct_sse": 7.000064389188181e-07
      },
      "equation": "y = 34,567x\u00b2 \u2212 69,134,002,383x + 34,567,001,074,095,816",
      "trace_tokens": [
        "34567000000000000",
        "-69134000000",
        "34567"
      ],
      "coefficient_absolute_errors": [
        26.291825808559548,
        4.5421450570472816e-05,
        2.395666765028045e-11
      ],
      "basis_conversion_vs_baseline": 4.827042893350953,
      "expanded_horner_vs_exact": 3.8665506358095745,
      "display_binary_vs_exact": 4.904267945993382
    },
    {
      "id": "C09",
      "label": "Quadratic Y unit change",
      "n": 5,
      "degree": 2,
      "expected_available": true,
      "baseline_available": true,
      "availability_pass": true,
      "x_min": -2.0,
      "x_max": 2.0,
      "units": {
        "x": "mm from local origin",
        "y": "mV"
      },
      "input_max_abs_x_rounding": 0.0,
      "input_max_abs_y_rounding": 8.36735125631094e-14,
      "distinct_stored_x": 5,
      "tolerance": 1.0000000009906227,
      "measurement_tolerance": 1.0,
      "numeric_budget": 9.906227498687549e-10,
      "visual_heuristic_budget": 4.691340000990623,
      "response_range": 938.268,
      "representation_limited": false,
      "input_effect_in_range": 9.526957001071423e-14,
      "input_effect_exceeds_tolerance": false,
      "metrics": {
        "internal": {
          "fitted": 2.371182615336563e-13,
          "held": 1.9732786833109069e-13,
          "in_range": 2.371182615336563e-13,
          "extrapolation": 0.0,
          "peak_ratio": "73/307863255777280",
          "vs_baseline": 0.0,
          "material_pass": true,
          "numeric_pass": true,
          "visual_heuristic_pass": true
        },
        "expanded_horner": {
          "fitted": 2.371182615336563e-13,
          "held": 1.9732786833109069e-13,
          "in_range": 2.371182615336563e-13,
          "extrapolation": 0.0,
          "peak_ratio": "73/307863255777280",
          "vs_baseline": 2.2737367544323206e-13,
          "material_pass": true,
          "numeric_pass": true,
          "visual_heuristic_pass": true
        },
        "expanded_sum": {
          "fitted": 2.371182615336563e-13,
          "held": 1.9732786833109069e-13,
          "in_range": 2.371182615336563e-13,
          "extrapolation": 0.0,
          "peak_ratio": "73/307863255777280",
          "vs_baseline": 2.2737367544323206e-13,
          "material_pass": true,
          "numeric_pass": true,
          "visual_heuristic_pass": true
        },
        "display_horner": {
          "fitted": 1.4310000000001213,
          "held": 1.1567499999999729,
          "in_range": 1.4310000000001213,
          "extrapolation": 0.0,
          "peak_ratio": "88110463803465/61572651155456",
          "vs_baseline": 1.43100000000004,
          "material_pass": false,
          "numeric_pass": false,
          "visual_heuristic_pass": true
        },
        "display_sum": {
          "fitted": 1.4310000000001213,
          "held": 1.1567499999999729,
          "in_range": 1.4310000000001213,
          "extrapolation": 0.0,
          "peak_ratio": "88110463803465/61572651155456",
          "vs_baseline": 1.43100000000004,
          "material_pass": false,
          "numeric_pass": false,
          "visual_heuristic_pass": true
        },
        "trace_horner": {
          "fitted": 0.0030000000000362497,
          "held": 0.003000000000037062,
          "in_range": 0.003000000000037062,
          "extrapolation": 0.0,
          "peak_ratio": "527765581339/175921860444160",
          "vs_baseline": 0.003000000000156433,
          "material_pass": true,
          "numeric_pass": false,
          "visual_heuristic_pass": true
        },
        "expanded17": {
          "fitted": 2.371182615336563e-13,
          "held": 1.9732786833109069e-13,
          "in_range": 2.371182615336563e-13,
          "extrapolation": 0.0,
          "peak_ratio": "73/307863255777280",
          "vs_baseline": 2.2737367544323206e-13,
          "material_pass": true,
          "numeric_pass": true,
          "visual_heuristic_pass": true
        },
        "centered6": {
          "fitted": 0.003236618902146152,
          "held": 0.0031774641764587028,
          "in_range": 0.003236618902146152,
          "extrapolation": 0.0,
          "peak_ratio": "199287206585/61572651155456",
          "vs_baseline": 0.003236618902064947,
          "material_pass": true,
          "numeric_pass": false,
          "visual_heuristic_pass": true
        },
        "centered17": {
          "fitted": 2.371182615336563e-13,
          "held": 1.9732786833109069e-13,
          "in_range": 2.371182615336563e-13,
          "extrapolation": 0.0,
          "peak_ratio": "73/307863255777280",
          "vs_baseline": 0.0,
          "material_pass": true,
          "numeric_pass": true,
          "visual_heuristic_pass": true
        },
        "expanded_exact": {
          "fitted": 2.939616803944643e-13,
          "held": 2.399604324766967e-13,
          "in_range": 2.939616803944643e-13,
          "extrapolation": 0.0,
          "peak_ratio": "181/615726511554560",
          "vs_baseline": 1.7053025658242404e-13,
          "material_pass": true,
          "numeric_pass": true,
          "visual_heuristic_pass": true
        },
        "display_exact": {
          "fitted": 1.4310000000000302,
          "held": 1.1567500000000637,
          "in_range": 1.4310000000000302,
          "extrapolation": 0.0,
          "peak_ratio": "440552319017297/307863255777280",
          "vs_baseline": 1.430999999999949,
          "material_pass": false,
          "numeric_pass": false,
          "visual_heuristic_pass": true
        },
        "trace_exact": {
          "fitted": 0.003000000000093418,
          "held": 0.0030000000000952698,
          "in_range": 0.0030000000000952698,
          "extrapolation": 0.0,
          "peak_ratio": "13194139533731/4398046511104000",
          "vs_baseline": 0.0030000000002219167,
          "material_pass": true,
          "numeric_pass": false,
          "visual_heuristic_pass": true
        }
      },
      "measures": {
        "oracle_sse": 0.7000000000000227,
        "direct_sse": 0.6999999999999773,
        "reported_rse_implied_sse": 0.6999999999999774,
        "sse_budget": 8.200000013076266,
        "sse_metric_abs_difference": 1.1089745843560518e-16,
        "sse_consistency_material_pass": true,
        "direct_r2": 0.9999987653139865,
        "reported_r2": 0.9999987653139865,
        "r2_abs_difference": 3.160044207281623e-17,
        "reported_residual_se": 0.591607978309952,
        "direct_residual_se": "0.59160797830995199596527217718249365004314982335159138453853442106036322132097359",
        "oracle_residual_se": "0.59160797830997121254819353512245120792957015045006387663024761436239797074254413",
        "reported_adjusted_r2": 0.9999975306279729,
        "expected_undefined_residual_se": false,
        "expected_undefined_adjusted_r2": false,
        "rse_abs_difference": "4.034727822817506349956850177E-18",
        "centered17_direct_sse": 0.6999999999999773
      },
      "equation": "y = 34.6x\u00b2 + 235x + 1,235",
      "trace_tokens": [
        "1234.57",
        "234.567",
        "34.567"
      ],
      "coefficient_absolute_errors": [
        1.26679619175515e-13,
        5.1159076974727215e-14,
        1.6240976817373718e-14
      ],
      "basis_conversion_vs_baseline": 1.7053025658242404e-13,
      "expanded_horner_vs_exact": 5.684341886080802e-14,
      "display_binary_vs_exact": 9.094947017729283e-14
    },
    {
      "id": "C10",
      "label": "Quadratic Y offset",
      "n": 5,
      "degree": 2,
      "expected_available": true,
      "baseline_available": true,
      "availability_pass": true,
      "x_min": -2.0,
      "x_max": 2.0,
      "units": {
        "x": "mm from local origin",
        "y": "V with +1000 reference shift"
      },
      "input_max_abs_x_rounding": 0.0,
      "input_max_abs_y_rounding": 4.67553036287427e-14,
      "distinct_stored_x": 5,
      "tolerance": 0.0010000000294123322,
      "measurement_tolerance": 0.001,
      "numeric_budget": 2.9412332180272764e-11,
      "visual_heuristic_budget": 0.004691340029412332,
      "response_range": 0.938268,
      "representation_limited": false,
      "input_effect_in_range": 4.9654253026736635e-14,
      "input_effect_exceeds_tolerance": false,
      "metrics": {
        "internal": {
          "fitted": 9.419766554076757e-14,
          "held": 9.663381206337362e-14,
          "in_range": 9.663381206337362e-14,
          "extrapolation": 0.0,
          "peak_ratio": "17/175921860444160",
          "vs_baseline": 0.0,
          "material_pass": true,
          "numeric_pass": true,
          "visual_heuristic_pass": true
        },
        "expanded_horner": {
          "fitted": 9.419766554076757e-14,
          "held": 9.663381206337362e-14,
          "in_range": 9.663381206337362e-14,
          "extrapolation": 0.0,
          "peak_ratio": "17/175921860444160",
          "vs_baseline": 0.0,
          "material_pass": true,
          "numeric_pass": true,
          "visual_heuristic_pass": true
        },
        "expanded_sum": {
          "fitted": 1.26679619175515e-13,
          "held": 1.388603517885453e-13,
          "in_range": 1.388603517885453e-13,
          "extrapolation": 0.0,
          "peak_ratio": "171/1231453023109120",
          "vs_baseline": 1.1368683772161603e-13,
          "material_pass": true,
          "numeric_pass": true,
          "visual_heuristic_pass": true
        },
        "display_horner": {
          "fitted": 0.23530100000003001,
          "held": 0.23514224999998742,
          "in_range": 0.23530100000003001,
          "extrapolation": 0.0,
          "peak_ratio": "72440531947659/307863255777280",
          "vs_baseline": 0.2353009999999358,
          "material_pass": false,
          "numeric_pass": false,
          "visual_heuristic_pass": false
        },
        "display_sum": {
          "fitted": 0.23530100000003001,
          "held": 0.23514224999998742,
          "in_range": 0.23530100000003001,
          "extrapolation": 0.0,
          "peak_ratio": "72440531947659/307863255777280",
          "vs_baseline": 0.2353009999999358,
          "material_pass": false,
          "numeric_pass": false,
          "visual_heuristic_pass": false
        },
        "trace_horner": {
          "fitted": 0.004567000000052498,
          "held": 0.0045670000000403175,
          "in_range": 0.004567000000052498,
          "extrapolation": 0.0,
          "peak_ratio": "1406011489151/307863255777280",
          "vs_baseline": 0.004567000000065491,
          "material_pass": false,
          "numeric_pass": false,
          "visual_heuristic_pass": true
        },
        "expanded17": {
          "fitted": 9.419766554076757e-14,
          "held": 9.663381206337362e-14,
          "in_range": 9.663381206337362e-14,
          "extrapolation": 0.0,
          "peak_ratio": "17/175921860444160",
          "vs_baseline": 0.0,
          "material_pass": true,
          "numeric_pass": true,
          "visual_heuristic_pass": true
        },
        "centered6": {
          "fitted": 0.004567236618962463,
          "held": 0.004567177464216294,
          "in_range": 0.004567236618962463,
          "extrapolation": 0.0,
          "peak_ratio": "1406084335419/307863255777280",
          "vs_baseline": 0.0045672366188682645,
          "material_pass": false,
          "numeric_pass": false,
          "visual_heuristic_pass": true
        },
        "centered17": {
          "fitted": 9.419766554076757e-14,
          "held": 9.663381206337362e-14,
          "in_range": 9.663381206337362e-14,
          "extrapolation": 0.0,
          "peak_ratio": "17/175921860444160",
          "vs_baseline": 0.0,
          "material_pass": true,
          "numeric_pass": true,
          "visual_heuristic_pass": true
        },
        "expanded_exact": {
          "fitted": 7.996976097197311e-14,
          "held": 8.103864801434213e-14,
          "in_range": 8.103864801434213e-14,
          "extrapolation": 0.0,
          "peak_ratio": "116789/1441151880758558720",
          "vs_baseline": 4.5550369032199e-14,
          "material_pass": true,
          "numeric_pass": true,
          "visual_heuristic_pass": true
        },
        "display_exact": {
          "fitted": 0.23530100000004966,
          "held": 0.235142250000036,
          "in_range": 0.23530100000004966,
          "extrapolation": 0.0,
          "peak_ratio": "9055066493458131/38482906972160000",
          "vs_baseline": 0.23530099999995546,
          "material_pass": false,
          "numeric_pass": false,
          "visual_heuristic_pass": false
        },
        "trace_exact": {
          "fitted": 0.004567000000049655,
          "held": 0.004567000000036002,
          "in_range": 0.004567000000049655,
          "extrapolation": 0.0,
          "peak_ratio": "4393785903594139/962072674304000000",
          "vs_baseline": 0.004567000000106651,
          "material_pass": false,
          "numeric_pass": false,
          "visual_heuristic_pass": true
        }
      },
      "measures": {
        "oracle_sse": 7.000000000805813e-07,
        "direct_sse": 7.000000000805813e-07,
        "reported_rse_implied_sse": 7.000000000805813e-07,
        "sse_budget": 8.200000388576391e-06,
        "sse_metric_abs_difference": 3.3431526934940604e-23,
        "sse_consistency_material_pass": true,
        "direct_r2": 0.9999987653139862,
        "reported_r2": 0.9999987653139862,
        "r2_abs_difference": 4.8209975801669865e-17,
        "reported_residual_se": 0.0005916079783440134,
        "direct_residual_se": "0.00059160797834401338920353793657268588952709301197525948272017068790530693619915550",
        "oracle_residual_se": "0.00059160797834401338919401900620229269826258799048145553496343756320144711218502801",
        "reported_adjusted_r2": 0.9999975306279725,
        "expected_undefined_residual_se": false,
        "expected_undefined_adjusted_r2": false,
        "rse_abs_difference": "1.079646206342731411047290699E-20",
        "centered17_direct_sse": 7.000000000805813e-07
      },
      "equation": "y = 0.0346x\u00b2 + 0.235x + 1,001",
      "trace_tokens": [
        "1001.23",
        "0.234567",
        "0.034567"
      ],
      "coefficient_absolute_errors": [
        7.146029799644436e-14,
        2.9803937096062326e-14,
        2.129447412053358e-14
      ],
      "basis_conversion_vs_baseline": 4.5550369032199e-14,
      "expanded_horner_vs_exact": 4.5550369032199e-14,
      "display_binary_vs_exact": 5.493347998708487e-14
    },
    {
      "id": "C11",
      "label": "Quadratic repeated X",
      "n": 7,
      "degree": 2,
      "expected_available": true,
      "baseline_available": true,
      "availability_pass": true,
      "x_min": -2.0,
      "x_max": 2.0,
      "units": {
        "x": "mm from local origin",
        "y": "V"
      },
      "input_max_abs_x_rounding": 0.0,
      "input_max_abs_y_rounding": 4.567368705465924e-17,
      "distinct_stored_x": 5,
      "tolerance": 0.00100000000099062,
      "measurement_tolerance": 0.001,
      "numeric_budget": 9.906199076978119e-13,
      "visual_heuristic_budget": 0.0046913400009906195,
      "response_range": 0.938268,
      "representation_limited": false,
      "input_effect_in_range": 3.79204644067556e-17,
      "input_effect_exceeds_tolerance": false,
      "metrics": {
        "internal": {
          "fitted": 2.2740800117925914e-16,
          "held": 1.745785480751152e-16,
          "in_range": 2.2740800117925914e-16,
          "extrapolation": 0.0,
          "peak_ratio": "53/233061280716423168",
          "vs_baseline": 0.0,
          "material_pass": true,
          "numeric_pass": true,
          "visual_heuristic_pass": true
        },
        "expanded_horner": {
          "fitted": 2.2740800117925914e-16,
          "held": 1.745785480751152e-16,
          "in_range": 2.2740800117925914e-16,
          "extrapolation": 0.0,
          "peak_ratio": "53/233061280716423168",
          "vs_baseline": 2.220446049250313e-16,
          "material_pass": true,
          "numeric_pass": true,
          "visual_heuristic_pass": true
        },
        "expanded_sum": {
          "fitted": 2.2740800117925914e-16,
          "held": 1.745785480751152e-16,
          "in_range": 2.2740800117925914e-16,
          "extrapolation": 0.0,
          "peak_ratio": "53/233061280716423168",
          "vs_baseline": 2.220446049250313e-16,
          "material_pass": true,
          "numeric_pass": true,
          "visual_heuristic_pass": true
        },
        "display_horner": {
          "fitted": 0.005301000000000007,
          "held": 0.0051422499999999515,
          "in_range": 0.005301000000000007,
          "extrapolation": 0.0,
          "peak_ratio": "9883662792622087/1864490245731385344",
          "vs_baseline": 0.005301000000000222,
          "material_pass": false,
          "numeric_pass": false,
          "visual_heuristic_pass": false
        },
        "display_sum": {
          "fitted": 0.005301000000000007,
          "held": 0.005142250000000063,
          "in_range": 0.005301000000000007,
          "extrapolation": 0.0,
          "peak_ratio": "9883662792622087/1864490245731385344",
          "vs_baseline": 0.005301000000000222,
          "material_pass": false,
          "numeric_pass": false,
          "visual_heuristic_pass": false
        },
        "trace_horner": {
          "fitted": 3.0000000000063524e-06,
          "held": 3.0000000000682997e-06,
          "in_range": 3.0000000000682997e-06,
          "extrapolation": 0.0,
          "peak_ratio": "11186941474643/3728980491462770688",
          "vs_baseline": 2.9999999999752447e-06,
          "material_pass": true,
          "numeric_pass": false,
          "visual_heuristic_pass": true
        },
        "expanded17": {
          "fitted": 2.2740800117925914e-16,
          "held": 1.745785480751152e-16,
          "in_range": 2.2740800117925914e-16,
          "extrapolation": 0.0,
          "peak_ratio": "53/233061280716423168",
          "vs_baseline": 2.220446049250313e-16,
          "material_pass": true,
          "numeric_pass": true,
          "visual_heuristic_pass": true
        },
        "centered6": {
          "fitted": 3.052414211938936e-06,
          "held": 3.0309773256323407e-06,
          "in_range": 3.052414211938936e-06,
          "extrapolation": 0.0,
          "peak_ratio": "1422799131023/466122561432846336",
          "vs_baseline": 3.052414211723864e-06,
          "material_pass": true,
          "numeric_pass": false,
          "visual_heuristic_pass": true
        },
        "centered17": {
          "fitted": 2.2740800117925914e-16,
          "held": 1.745785480751152e-16,
          "in_range": 2.2740800117925914e-16,
          "extrapolation": 0.0,
          "peak_ratio": "53/233061280716423168",
          "vs_baseline": 0.0,
          "material_pass": true,
          "numeric_pass": true,
          "visual_heuristic_pass": true
        },
        "expanded_exact": {
          "fitted": 2.1507218979453515e-16,
          "held": 1.260062907477646e-16,
          "in_range": 2.1507218979453515e-16,
          "extrapolation": 0.0,
          "peak_ratio": "401/1864490245731385344",
          "vs_baseline": 1.1102230246251565e-16,
          "material_pass": true,
          "numeric_pass": true,
          "visual_heuristic_pass": true
        },
        "display_exact": {
          "fitted": 0.005300999999999984,
          "held": 0.005142249999999984,
          "in_range": 0.005300999999999984,
          "extrapolation": 0.0,
          "peak_ratio": "1544322311347194211/291326600895528960000",
          "vs_baseline": 0.005301000000000199,
          "material_pass": false,
          "numeric_pass": false,
          "visual_heuristic_pass": false
        },
        "trace_exact": {
          "fitted": 3.0000000000379205e-06,
          "held": 3.000000000032252e-06,
          "in_range": 3.0000000000379205e-06,
          "extrapolation": 0.0,
          "peak_ratio": "21849495067440853/7283165022388224000000",
          "vs_baseline": 3.0000000000456738e-06,
          "material_pass": true,
          "numeric_pass": false,
          "visual_heuristic_pass": true
        }
      },
      "measures": {
        "oracle_sse": 1.5481871630243288e-33,
        "direct_sse": 1.9721522630525295e-31,
        "reported_rse_implied_sse": 1.9721522630525295e-31,
        "sse_budget": 7.000000013870455e-06,
        "sse_metric_abs_difference": 0.0,
        "sse_consistency_material_pass": true,
        "direct_r2": 1.0,
        "reported_r2": 1,
        "r2_abs_difference": 1.9450262443183792e-31,
        "reported_residual_se": 2.220446049250313e-16,
        "direct_residual_se": "2.220446049250313080847263336181640625E-16",
        "oracle_residual_se": "1.9673504790862307894771820083627609503721495712386243244014976419592800511385427E-17",
        "reported_adjusted_r2": 1,
        "expected_undefined_residual_se": false,
        "expected_undefined_adjusted_r2": false,
        "rse_abs_difference": "8.0847263336181640625E-33",
        "centered17_direct_sse": 1.9721522630525295e-31
      },
      "equation": "y = 0.0346x\u00b2 + 0.235x + 1.23",
      "trace_tokens": [
        "1.23457",
        "0.234567",
        "0.034567"
      ],
      "coefficient_absolute_errors": [
        9.654113257610057e-18,
        2.4671622769447922e-17,
        4.384576437831234e-17
      ],
      "basis_conversion_vs_baseline": 1.1102230246251565e-16,
      "expanded_horner_vs_exact": 1.1796119636642288e-16,
      "display_binary_vs_exact": 9.094947017729283e-17
    },
    {
      "id": "C12",
      "label": "Too few distinct X",
      "n": 4,
      "degree": 2,
      "expected_available": false,
      "baseline_available": false,
      "availability_pass": true,
      "x_min": 0.0,
      "x_max": 1.0,
      "units": {
        "x": "mm from local origin",
        "y": "V"
      },
      "input_max_abs_x_rounding": 0.0,
      "input_max_abs_y_rounding": 0.0,
      "distinct_stored_x": 2,
      "reason": "A degree 2 polynomial needs at least 3 distinct X values. This group has 2."
    },
    {
      "id": "C13",
      "label": "Lost distinguishability",
      "n": 3,
      "degree": 2,
      "expected_available": false,
      "baseline_available": false,
      "availability_pass": true,
      "x_min": 1.8014398509481984e+16,
      "x_max": 1.8014398509481984e+16,
      "units": {
        "x": "diagnostic offset units",
        "y": "V"
      },
      "input_max_abs_x_rounding": 1.0,
      "input_max_abs_y_rounding": 0.0,
      "distinct_stored_x": 1,
      "reason": "A degree 2 polynomial needs at least 3 distinct X values. This group has 1."
    },
    {
      "id": "C14",
      "label": "Constant linear X",
      "n": 3,
      "degree": 1,
      "expected_available": false,
      "baseline_available": false,
      "availability_pass": true,
      "x_min": 3.0,
      "x_max": 3.0,
      "units": {
        "x": "mm from local origin",
        "y": "V"
      },
      "input_max_abs_x_rounding": 0.0,
      "input_max_abs_y_rounding": 0.0,
      "distinct_stored_x": 1,
      "reason": "Every X value is 3, so the slope is undefined."
    },
    {
      "id": "C15",
      "label": "Too few polynomial rows",
      "n": 2,
      "degree": 2,
      "expected_available": false,
      "baseline_available": false,
      "availability_pass": true,
      "x_min": 0.0,
      "x_max": 1.0,
      "units": {
        "x": "mm from local origin",
        "y": "V"
      },
      "input_max_abs_x_rounding": 0.0,
      "input_max_abs_y_rounding": 0.0,
      "distinct_stored_x": 2,
      "reason": "A degree 2 polynomial needs at least 3 rows with numeric X and Y. This group has 2."
    },
    {
      "id": "C16",
      "label": "Degree 2 one residual df",
      "n": 4,
      "degree": 2,
      "expected_available": true,
      "baseline_available": true,
      "availability_pass": true,
      "x_min": -1.5,
      "x_max": 1.5,
      "units": {
        "x": "mm from local origin",
        "y": "V"
      },
      "input_max_abs_x_rounding": 0.0,
      "input_max_abs_y_rounding": 0.0,
      "distinct_stored_x": 4,
      "tolerance": 0.0010000000004127475,
      "measurement_tolerance": 0.001,
      "numeric_budget": 4.1274758283725534e-13,
      "visual_heuristic_budget": 0.0018750000004127477,
      "response_range": 0.375,
      "representation_limited": false,
      "input_effect_in_range": 0.0,
      "input_effect_exceeds_tolerance": false,
      "metrics": {
        "internal": {
          "fitted": 2.220446049250313e-16,
          "held": 2.220446049250313e-16,
          "in_range": 2.220446049250313e-16,
          "extrapolation": 0.0,
          "peak_ratio": "1/4503599627370496",
          "vs_baseline": 0.0,
          "material_pass": true,
          "numeric_pass": true,
          "visual_heuristic_pass": true
        },
        "expanded_horner": {
          "fitted": 2.220446049250313e-16,
          "held": 2.220446049250313e-16,
          "in_range": 2.220446049250313e-16,
          "extrapolation": 0.0,
          "peak_ratio": "1/4503599627370496",
          "vs_baseline": 1.1102230246251565e-16,
          "material_pass": true,
          "numeric_pass": true,
          "visual_heuristic_pass": true
        },
        "expanded_sum": {
          "fitted": 2.220446049250313e-16,
          "held": 0.0,
          "in_range": 2.220446049250313e-16,
          "extrapolation": 0.0,
          "peak_ratio": "1/4503599627370496",
          "vs_baseline": 2.220446049250313e-16,
          "material_pass": true,
          "numeric_pass": true,
          "visual_heuristic_pass": true
        },
        "display_horner": {
          "fitted": 0.0,
          "held": 0.0,
          "in_range": 0.0,
          "extrapolation": 0.0,
          "peak_ratio": "0",
          "vs_baseline": 2.220446049250313e-16,
          "material_pass": true,
          "numeric_pass": true,
          "visual_heuristic_pass": true
        },
        "display_sum": {
          "fitted": 0.0,
          "held": 0.0,
          "in_range": 0.0,
          "extrapolation": 0.0,
          "peak_ratio": "0",
          "vs_baseline": 2.220446049250313e-16,
          "material_pass": true,
          "numeric_pass": true,
          "visual_heuristic_pass": true
        },
        "trace_horner": {
          "fitted": 0.0,
          "held": 0.0,
          "in_range": 0.0,
          "extrapolation": 0.0,
          "peak_ratio": "0",
          "vs_baseline": 2.220446049250313e-16,
          "material_pass": true,
          "numeric_pass": true,
          "visual_heuristic_pass": true
        },
        "expanded17": {
          "fitted": 2.220446049250313e-16,
          "held": 2.220446049250313e-16,
          "in_range": 2.220446049250313e-16,
          "extrapolation": 0.0,
          "peak_ratio": "1/4503599627370496",
          "vs_baseline": 1.1102230246251565e-16,
          "material_pass": true,
          "numeric_pass": true,
          "visual_heuristic_pass": true
        },
        "centered6": {
          "fitted": 3.335234965984313e-07,
          "held": 2.2234899788031726e-07,
          "in_range": 3.335234965984313e-07,
          "extrapolation": 0.0,
          "peak_ratio": "1502056295/4503599627370496",
          "vs_baseline": 3.335234965984313e-07,
          "material_pass": true,
          "numeric_pass": false,
          "visual_heuristic_pass": true
        },
        "centered17": {
          "fitted": 2.220446049250313e-16,
          "held": 2.220446049250313e-16,
          "in_range": 2.220446049250313e-16,
          "extrapolation": 0.0,
          "peak_ratio": "1/4503599627370496",
          "vs_baseline": 0.0,
          "material_pass": true,
          "numeric_pass": true,
          "visual_heuristic_pass": true
        },
        "expanded_exact": {
          "fitted": 2.6020852139652106e-16,
          "held": 1.3877787807814457e-16,
          "in_range": 2.6020852139652106e-16,
          "extrapolation": 0.0,
          "peak_ratio": "75/288230376151711744",
          "vs_baseline": 8.326672684688674e-17,
          "material_pass": true,
          "numeric_pass": true,
          "visual_heuristic_pass": true
        },
        "display_exact": {
          "fitted": 0.0,
          "held": 0.0,
          "in_range": 0.0,
          "extrapolation": 0.0,
          "peak_ratio": "0",
          "vs_baseline": 2.220446049250313e-16,
          "material_pass": true,
          "numeric_pass": true,
          "visual_heuristic_pass": true
        },
        "trace_exact": {
          "fitted": 0.0,
          "held": 0.0,
          "in_range": 0.0,
          "extrapolation": 0.0,
          "peak_ratio": "0",
          "vs_baseline": 2.220446049250313e-16,
          "material_pass": true,
          "numeric_pass": true,
          "visual_heuristic_pass": true
        }
      },
      "measures": {
        "oracle_sse": 0.0,
        "direct_sse": 4.930380657631324e-32,
        "reported_rse_implied_sse": 4.930380657631324e-32,
        "sse_budget": 4.000000003302425e-06,
        "sse_metric_abs_difference": 0.0,
        "sse_consistency_material_pass": true,
        "direct_r2": 1.0,
        "reported_r2": 1,
        "r2_abs_difference": 5.259072701473412e-31,
        "reported_residual_se": 2.220446049250313e-16,
        "direct_residual_se": "2.220446049250313080847263336181640625E-16",
        "oracle_residual_se": "0",
        "reported_adjusted_r2": 1,
        "expected_undefined_residual_se": false,
        "expected_undefined_adjusted_r2": false,
        "rse_abs_difference": "8.0847263336181640625E-33",
        "centered17_direct_sse": 4.930380657631324e-32
      },
      "equation": "y = 0.0625x\u00b2 \u2212 0.125x + 1",
      "trace_tokens": [
        "1",
        "-0.125",
        "0.0625"
      ],
      "coefficient_absolute_errors": [
        0.0,
        6.938893903907228e-17,
        6.938893903907228e-17
      ],
      "basis_conversion_vs_baseline": 8.326672684688674e-17,
      "expanded_horner_vs_exact": 8.326672684688674e-17,
      "display_binary_vs_exact": 0.0
    },
    {
      "id": "C17",
      "label": "Degree 3 one residual df",
      "n": 5,
      "degree": 3,
      "expected_available": true,
      "baseline_available": true,
      "availability_pass": true,
      "x_min": -2.0,
      "x_max": 2.0,
      "units": {
        "x": "mm from local origin",
        "y": "V"
      },
      "input_max_abs_x_rounding": 0.0,
      "input_max_abs_y_rounding": 0.0,
      "distinct_stored_x": 5,
      "tolerance": 0.001000000001049738,
      "measurement_tolerance": 0.001,
      "numeric_budget": 1.049737991503207e-12,
      "visual_heuristic_budget": 0.005000000001049738,
      "response_range": 1.0,
      "representation_limited": false,
      "input_effect_in_range": 0.0,
      "input_effect_exceeds_tolerance": false,
      "metrics": {
        "internal": {
          "fitted": 4.440892098500626e-16,
          "held": 4.440892098500626e-16,
          "in_range": 4.440892098500626e-16,
          "extrapolation": 0.0,
          "peak_ratio": "1/2251799813685248",
          "vs_baseline": 0.0,
          "material_pass": true,
          "numeric_pass": true,
          "visual_heuristic_pass": true
        },
        "expanded_horner": {
          "fitted": 4.440892098500626e-16,
          "held": 4.440892098500626e-16,
          "in_range": 4.440892098500626e-16,
          "extrapolation": 0.0,
          "peak_ratio": "1/2251799813685248",
          "vs_baseline": 2.220446049250313e-16,
          "material_pass": true,
          "numeric_pass": true,
          "visual_heuristic_pass": true
        },
        "expanded_sum": {
          "fitted": 4.440892098500626e-16,
          "held": 3.3306690738754696e-16,
          "in_range": 4.440892098500626e-16,
          "extrapolation": 0.0,
          "peak_ratio": "1/2251799813685248",
          "vs_baseline": 2.220446049250313e-16,
          "material_pass": true,
          "numeric_pass": true,
          "visual_heuristic_pass": true
        },
        "display_horner": {
          "fitted": 0.00039999999999995595,
          "held": 0.0001687500000000508,
          "in_range": 0.00039999999999995595,
          "extrapolation": 0.0,
          "peak_ratio": "450359962737/1125899906842624",
          "vs_baseline": 0.000400000000000178,
          "material_pass": true,
          "numeric_pass": false,
          "visual_heuristic_pass": true
        },
        "display_sum": {
          "fitted": 0.00039999999999995595,
          "held": 0.0001687500000000508,
          "in_range": 0.00039999999999995595,
          "extrapolation": 0.0,
          "peak_ratio": "450359962737/1125899906842624",
          "vs_baseline": 0.000400000000000178,
          "material_pass": true,
          "numeric_pass": false,
          "visual_heuristic_pass": true
        },
        "trace_horner": {
          "fitted": 0.0,
          "held": 0.0,
          "in_range": 0.0,
          "extrapolation": 0.0,
          "peak_ratio": "0",
          "vs_baseline": 4.440892098500626e-16,
          "material_pass": true,
          "numeric_pass": true,
          "visual_heuristic_pass": true
        },
        "expanded17": {
          "fitted": 4.440892098500626e-16,
          "held": 4.440892098500626e-16,
          "in_range": 4.440892098500626e-16,
          "extrapolation": 0.0,
          "peak_ratio": "1/2251799813685248",
          "vs_baseline": 2.220446049250313e-16,
          "material_pass": true,
          "numeric_pass": true,
          "visual_heuristic_pass": true
        },
        "centered6": {
          "fitted": 2.961458323014199e-07,
          "held": 2.6633071359416505e-07,
          "in_range": 2.961458323014199e-07,
          "extrapolation": 0.0,
          "peak_ratio": "333430565/1125899906842624",
          "vs_baseline": 2.961458325234645e-07,
          "material_pass": true,
          "numeric_pass": false,
          "visual_heuristic_pass": true
        },
        "centered17": {
          "fitted": 4.440892098500626e-16,
          "held": 4.440892098500626e-16,
          "in_range": 4.440892098500626e-16,
          "extrapolation": 0.0,
          "peak_ratio": "1/2251799813685248",
          "vs_baseline": 0.0,
          "material_pass": true,
          "numeric_pass": true,
          "visual_heuristic_pass": true
        },
        "expanded_exact": {
          "fitted": 5.551115123125783e-16,
          "held": 4.0419056990259605e-16,
          "in_range": 5.551115123125783e-16,
          "extrapolation": 0.0,
          "peak_ratio": "5/9007199254740992",
          "vs_baseline": 1.3877787807814457e-16,
          "material_pass": true,
          "numeric_pass": true,
          "visual_heuristic_pass": true
        },
        "display_exact": {
          "fitted": 0.0004,
          "held": 0.00016875,
          "in_range": 0.0004,
          "extrapolation": 0.0,
          "peak_ratio": "1/2500",
          "vs_baseline": 0.00040000000000022206,
          "material_pass": true,
          "numeric_pass": false,
          "visual_heuristic_pass": true
        },
        "trace_exact": {
          "fitted": 0.0,
          "held": 0.0,
          "in_range": 0.0,
          "extrapolation": 0.0,
          "peak_ratio": "0",
          "vs_baseline": 4.440892098500626e-16,
          "material_pass": true,
          "numeric_pass": true,
          "visual_heuristic_pass": true
        }
      },
      "measures": {
        "oracle_sse": 0.0,
        "direct_sse": 5.423418723394456e-31,
        "reported_rse_implied_sse": 5.423418723394456e-31,
        "sse_budget": 5.000000010500488e-06,
        "sse_metric_abs_difference": 1.2798086653682567e-47,
        "sse_consistency_material_pass": true,
        "direct_r2": 1.0,
        "reported_r2": 1,
        "r2_abs_difference": 8.98637665494486e-31,
        "reported_residual_se": 7.364386412590295e-16,
        "direct_residual_se": "7.3643864125902954700707175576439282503373474533011702126887468769311443197645858E-16",
        "oracle_residual_se": "0",
        "reported_adjusted_r2": 1,
        "expected_undefined_residual_se": false,
        "expected_undefined_adjusted_r2": false,
        "rse_abs_difference": "4.700707175576439282503373475E-32",
        "centered17_direct_sse": 5.423418723394456e-31
      },
      "equation": "y = \u22120.0313x\u00b3 + 0.0625x\u00b2 \u2212 0.125x + 1",
      "trace_tokens": [
        "1",
        "-0.125",
        "0.0625",
        "-0.03125"
      ],
      "coefficient_absolute_errors": [
        2.220446049250313e-16,
        2.7755575615628914e-17,
        4.163336342344337e-17,
        1.3877787807814457e-17
      ],
      "basis_conversion_vs_baseline": 1.3877787807814457e-16,
      "expanded_horner_vs_exact": 1.1102230246251565e-16,
      "display_binary_vs_exact": 1.1652900866465644e-16
    },
    {
      "id": "C18",
      "label": "Degree 4 one residual df",
      "n": 6,
      "degree": 4,
      "expected_available": true,
      "baseline_available": true,
      "availability_pass": true,
      "x_min": -2.5,
      "x_max": 2.5,
      "units": {
        "x": "mm from local origin",
        "y": "V"
      },
      "input_max_abs_x_rounding": 0.0,
      "input_max_abs_y_rounding": 0.0,
      "distinct_stored_x": 6,
      "tolerance": 0.0010000000019546307,
      "measurement_tolerance": 0.001,
      "numeric_budget": 1.9546307464412393e-12,
      "visual_heuristic_budget": 0.00937500000195463,
      "response_range": 1.875,
      "representation_limited": false,
      "input_effect_in_range": 0.0,
      "input_effect_exceeds_tolerance": false,
      "metrics": {
        "internal": {
          "fitted": 8.881784197001252e-16,
          "held": 4.440892098500626e-16,
          "in_range": 8.881784197001252e-16,
          "extrapolation": 0.0,
          "peak_ratio": "1/1125899906842624",
          "vs_baseline": 0.0,
          "material_pass": true,
          "numeric_pass": true,
          "visual_heuristic_pass": true
        },
        "expanded_horner": {
          "fitted": 4.440892098500626e-16,
          "held": 4.440892098500626e-16,
          "in_range": 4.440892098500626e-16,
          "extrapolation": 0.0,
          "peak_ratio": "1/2251799813685248",
          "vs_baseline": 4.440892098500626e-16,
          "material_pass": true,
          "numeric_pass": true,
          "visual_heuristic_pass": true
        },
        "expanded_sum": {
          "fitted": 8.881784197001252e-16,
          "held": 4.440892098500626e-16,
          "in_range": 8.881784197001252e-16,
          "extrapolation": 0.0,
          "peak_ratio": "1/1125899906842624",
          "vs_baseline": 4.440892098500626e-16,
          "material_pass": true,
          "numeric_pass": true,
          "visual_heuristic_pass": true
        },
        "display_horner": {
          "fitted": 0.0017578125000001776,
          "held": 0.0008000000000000229,
          "in_range": 0.0017578125000001776,
          "extrapolation": 0.0,
          "peak_ratio": "1979120929997/1125899906842624",
          "vs_baseline": 0.0017578125000001776,
          "material_pass": false,
          "numeric_pass": false,
          "visual_heuristic_pass": true
        },
        "display_sum": {
          "fitted": 0.0017578124999999556,
          "held": 0.0007999999999999119,
          "in_range": 0.0017578124999999556,
          "extrapolation": 0.0,
          "peak_ratio": "7916483719987/4503599627370496",
          "vs_baseline": 0.0017578124999999556,
          "material_pass": false,
          "numeric_pass": false,
          "visual_heuristic_pass": true
        },
        "trace_horner": {
          "fitted": 0.0,
          "held": 0.0,
          "in_range": 0.0,
          "extrapolation": 0.0,
          "peak_ratio": "0",
          "vs_baseline": 8.881784197001252e-16,
          "material_pass": true,
          "numeric_pass": true,
          "visual_heuristic_pass": true
        },
        "expanded17": {
          "fitted": 4.440892098500626e-16,
          "held": 4.440892098500626e-16,
          "in_range": 4.440892098500626e-16,
          "extrapolation": 0.0,
          "peak_ratio": "1/2251799813685248",
          "vs_baseline": 4.440892098500626e-16,
          "material_pass": true,
          "numeric_pass": true,
          "visual_heuristic_pass": true
        },
        "centered6": {
          "fitted": 1.3418467508241605e-06,
          "held": 8.411455181267513e-07,
          "in_range": 1.3418467508241605e-06,
          "extrapolation": 0.0,
          "peak_ratio": "6043140527/4503599627370496",
          "vs_baseline": 1.3418467508241605e-06,
          "material_pass": true,
          "numeric_pass": false,
          "visual_heuristic_pass": true
        },
        "centered17": {
          "fitted": 8.881784197001252e-16,
          "held": 4.440892098500626e-16,
          "in_range": 8.881784197001252e-16,
          "extrapolation": 0.0,
          "peak_ratio": "1/1125899906842624",
          "vs_baseline": 0.0,
          "material_pass": true,
          "numeric_pass": true,
          "visual_heuristic_pass": true
        },
        "expanded_exact": {
          "fitted": 7.099355825435083e-16,
          "held": 3.677613769070831e-16,
          "in_range": 7.099355825435083e-16,
          "extrapolation": 0.0,
          "peak_ratio": "1637/2305843009213693952",
          "vs_baseline": 1.7824283715661693e-16,
          "material_pass": true,
          "numeric_pass": true,
          "visual_heuristic_pass": true
        },
        "display_exact": {
          "fitted": 0.0017578125,
          "held": 0.0008,
          "in_range": 0.0017578125,
          "extrapolation": 0.0,
          "peak_ratio": "9/5120",
          "vs_baseline": 0.0017578125,
          "material_pass": false,
          "numeric_pass": false,
          "visual_heuristic_pass": true
        },
        "trace_exact": {
          "fitted": 0.0,
          "held": 0.0,
          "in_range": 0.0,
          "extrapolation": 0.0,
          "peak_ratio": "0",
          "vs_baseline": 8.881784197001252e-16,
          "material_pass": true,
          "numeric_pass": true,
          "visual_heuristic_pass": true
        }
      },
      "measures": {
        "oracle_sse": 0.0,
        "direct_sse": 1.0600318413907346e-30,
        "reported_rse_implied_sse": 1.0600318413907346e-30,
        "sse_budget": 6.000000023459121e-06,
        "sse_metric_abs_difference": 4.273955741648237e-47,
        "sse_consistency_material_pass": true,
        "direct_r2": 1.0,
        "reported_r2": 1,
        "r2_abs_difference": 4.167798025640427e-31,
        "reported_residual_se": 1.0295784775289034e-15,
        "direct_residual_se": "1.0295784775289033854979621278580486783153468035663433936403950539704418117263710E-15",
        "oracle_residual_se": "0",
        "reported_adjusted_r2": 1,
        "expected_undefined_residual_se": false,
        "expected_undefined_adjusted_r2": false,
        "rse_abs_difference": "1.450203787214195132168465320E-32",
        "centered17_direct_sse": 1.0600318413907346e-30
      },
      "equation": "y = 0.0156x\u2074 \u2212 0.0313x\u00b3 + 0.0625x\u00b2 \u2212 0.125x + 1",
      "trace_tokens": [
        "1",
        "-0.125",
        "0.0625",
        "-0.03125",
        "0.015625"
      ],
      "coefficient_absolute_errors": [
        3.3306690738754696e-16,
        8.326672684688674e-17,
        5.551115123125783e-17,
        1.3877787807814457e-17,
        6.938893903907228e-18
      ],
      "basis_conversion_vs_baseline": 1.7824283715661693e-16,
      "expanded_horner_vs_exact": 2.658463726934457e-16,
      "display_binary_vs_exact": 1.7763568394002506e-16
    },
    {
      "id": "C19",
      "label": "Degree 5 one residual df",
      "n": 7,
      "degree": 5,
      "expected_available": true,
      "baseline_available": true,
      "availability_pass": true,
      "x_min": -3.0,
      "x_max": 3.0,
      "units": {
        "x": "mm from local origin",
        "y": "V"
      },
      "input_max_abs_x_rounding": 0.0,
      "input_max_abs_y_rounding": 0.0,
      "distinct_stored_x": 7,
      "tolerance": 0.001000000006403351,
      "measurement_tolerance": 0.001,
      "numeric_budget": 6.403350944347949e-12,
      "visual_heuristic_budget": 0.031171875006403352,
      "response_range": 6.234375,
      "representation_limited": false,
      "input_effect_in_range": 0.0,
      "input_effect_exceeds_tolerance": false,
      "metrics": {
        "internal": {
          "fitted": 8.881784197001252e-16,
          "held": 8.881784197001252e-16,
          "in_range": 8.881784197001252e-16,
          "extrapolation": 0.0,
          "peak_ratio": "1/1125899906842624",
          "vs_baseline": 0.0,
          "material_pass": true,
          "numeric_pass": true,
          "visual_heuristic_pass": true
        },
        "expanded_horner": {
          "fitted": 8.881784197001252e-16,
          "held": 8.881784197001252e-16,
          "in_range": 8.881784197001252e-16,
          "extrapolation": 0.0,
          "peak_ratio": "1/1125899906842624",
          "vs_baseline": 0.0,
          "material_pass": true,
          "numeric_pass": true,
          "visual_heuristic_pass": true
        },
        "expanded_sum": {
          "fitted": 1.7763568394002505e-15,
          "held": 1.3322676295501878e-15,
          "in_range": 1.7763568394002505e-15,
          "extrapolation": 0.0,
          "peak_ratio": "1/562949953421312",
          "vs_baseline": 8.881784197001252e-16,
          "material_pass": true,
          "numeric_pass": true,
          "visual_heuristic_pass": true
        },
        "display_horner": {
          "fitted": 0.002767500000000034,
          "held": 0.0015136718749999556,
          "in_range": 0.002767500000000034,
          "extrapolation": 0.0,
          "peak_ratio": "3115927992187/1125899906842624",
          "vs_baseline": 0.002767500000000256,
          "material_pass": false,
          "numeric_pass": false,
          "visual_heuristic_pass": true
        },
        "display_sum": {
          "fitted": 0.002767500000000256,
          "held": 0.0015136718749999556,
          "in_range": 0.002767500000000256,
          "extrapolation": 0.0,
          "peak_ratio": "12463711968749/4503599627370496",
          "vs_baseline": 0.002767500000000478,
          "material_pass": false,
          "numeric_pass": false,
          "visual_heuristic_pass": true
        },
        "trace_horner": {
          "fitted": 0.0,
          "held": 0.0,
          "in_range": 0.0,
          "extrapolation": 0.0,
          "peak_ratio": "0",
          "vs_baseline": 8.881784197001252e-16,
          "material_pass": true,
          "numeric_pass": true,
          "visual_heuristic_pass": true
        },
        "expanded17": {
          "fitted": 8.881784197001252e-16,
          "held": 8.881784197001252e-16,
          "in_range": 8.881784197001252e-16,
          "extrapolation": 0.0,
          "peak_ratio": "1/1125899906842624",
          "vs_baseline": 0.0,
          "material_pass": true,
          "numeric_pass": true,
          "visual_heuristic_pass": true
        },
        "centered6": {
          "fitted": 0.0,
          "held": 0.0,
          "in_range": 0.0,
          "extrapolation": 0.0,
          "peak_ratio": "0",
          "vs_baseline": 8.881784197001252e-16,
          "material_pass": true,
          "numeric_pass": true,
          "visual_heuristic_pass": true
        },
        "centered17": {
          "fitted": 8.881784197001252e-16,
          "held": 8.881784197001252e-16,
          "in_range": 8.881784197001252e-16,
          "extrapolation": 0.0,
          "peak_ratio": "1/1125899906842624",
          "vs_baseline": 0.0,
          "material_pass": true,
          "numeric_pass": true,
          "visual_heuristic_pass": true
        },
        "expanded_exact": {
          "fitted": 1.3010426069826053e-15,
          "held": 1.1464353771861724e-15,
          "in_range": 1.3010426069826053e-15,
          "extrapolation": 0.0,
          "peak_ratio": "375/288230376151711744",
          "vs_baseline": 4.128641872824801e-16,
          "material_pass": true,
          "numeric_pass": true,
          "visual_heuristic_pass": true
        },
        "display_exact": {
          "fitted": 0.0027675,
          "held": 0.001513671875,
          "in_range": 0.0027675,
          "extrapolation": 0.0,
          "peak_ratio": "1107/400000",
          "vs_baseline": 0.002767500000000222,
          "material_pass": false,
          "numeric_pass": false,
          "visual_heuristic_pass": true
        },
        "trace_exact": {
          "fitted": 0.0,
          "held": 0.0,
          "in_range": 0.0,
          "extrapolation": 0.0,
          "peak_ratio": "0",
          "vs_baseline": 8.881784197001252e-16,
          "material_pass": true,
          "numeric_pass": true,
          "visual_heuristic_pass": true
        }
      },
      "measures": {
        "oracle_sse": 0.0,
        "direct_sse": 3.611503831714945e-30,
        "reported_rse_implied_sse": 3.611503831714945e-30,
        "sse_budget": 7.000000089656461e-06,
        "sse_metric_abs_difference": 1.4077904064011854e-46,
        "sse_consistency_material_pass": true,
        "direct_r2": 1.0,
        "reported_r2": 1,
        "r2_abs_difference": 1.4740685076384776e-31,
        "reported_residual_se": 1.900395703982448e-15,
        "direct_residual_se": "1.9003957039824481437709727032402750746811314595286029353776675874063756923322080E-15",
        "oracle_residual_se": "0",
        "reported_adjusted_r2": 1,
        "expected_undefined_residual_se": false,
        "expected_undefined_adjusted_r2": false,
        "rse_abs_difference": "1.437709727032402750746811315E-31",
        "centered17_direct_sse": 3.611503831714945e-30
      },
      "equation": "y = \u22120.00781x\u2075 + 0.0156x\u2074 \u2212 0.0313x\u00b3 + 0.0625x\u00b2 \u2212 0.125x + 1",
      "trace_tokens": [
        "1",
        "-0.125",
        "0.0625",
        "-0.03125",
        "0.015625",
        "-0.0078125"
      ],
      "coefficient_absolute_errors": [
        6.661338147750939e-16,
        5.551115123125783e-17,
        4.163336342344337e-17,
        1.3877787807814457e-17,
        3.469446951953614e-18,
        0.0
      ],
      "basis_conversion_vs_baseline": 4.128641872824801e-16,
      "expanded_horner_vs_exact": 4.128641872824801e-16,
      "display_binary_vs_exact": 2.9729108064202593e-16
    },
    {
      "id": "C20",
      "label": "Degree 6 one residual df",
      "n": 8,
      "degree": 6,
      "expected_available": true,
      "baseline_available": true,
      "availability_pass": true,
      "x_min": -3.5,
      "x_max": 3.5,
      "units": {
        "x": "mm from local origin",
        "y": "V"
      },
      "input_max_abs_x_rounding": 0.0,
      "input_max_abs_y_rounding": 0.0,
      "distinct_stored_x": 8,
      "tolerance": 0.0010000000167478145,
      "measurement_tolerance": 0.001,
      "numeric_budget": 1.674781446245479e-11,
      "visual_heuristic_budget": 0.08129882814174781,
      "response_range": 16.259765625,
      "representation_limited": false,
      "input_effect_in_range": 0.0,
      "input_effect_exceeds_tolerance": false,
      "metrics": {
        "internal": {
          "fitted": 7.105427357601002e-15,
          "held": 5.329070518200751e-15,
          "in_range": 7.105427357601002e-15,
          "extrapolation": 0.0,
          "peak_ratio": "1/140737488355328",
          "vs_baseline": 0.0,
          "material_pass": true,
          "numeric_pass": true,
          "visual_heuristic_pass": true
        },
        "expanded_horner": {
          "fitted": 1.4210854715202004e-14,
          "held": 5.329070518200751e-15,
          "in_range": 1.4210854715202004e-14,
          "extrapolation": 0.0,
          "peak_ratio": "1/70368744177664",
          "vs_baseline": 7.105427357601002e-15,
          "material_pass": true,
          "numeric_pass": true,
          "visual_heuristic_pass": true
        },
        "expanded_sum": {
          "fitted": 7.105427357601002e-15,
          "held": 5.329070518200751e-15,
          "in_range": 7.105427357601002e-15,
          "extrapolation": 0.0,
          "peak_ratio": "1/140737488355328",
          "vs_baseline": 1.7763568394002505e-15,
          "material_pass": true,
          "numeric_pass": true,
          "visual_heuristic_pass": true
        },
        "display_horner": {
          "fitted": 0.003972636718749811,
          "held": 0.0014512500000005701,
          "in_range": 0.003972636718749811,
          "extrapolation": 0.0,
          "peak_ratio": "559098913945/140737488355328",
          "vs_baseline": 0.003972636718756917,
          "material_pass": false,
          "numeric_pass": false,
          "visual_heuristic_pass": true
        },
        "display_sum": {
          "fitted": 0.003972636718749811,
          "held": 0.0014512500000005701,
          "in_range": 0.003972636718749811,
          "extrapolation": 0.0,
          "peak_ratio": "559098913945/140737488355328",
          "vs_baseline": 0.003972636718756917,
          "material_pass": false,
          "numeric_pass": false,
          "visual_heuristic_pass": true
        },
        "trace_horner": {
          "fitted": 0.0,
          "held": 0.0,
          "in_range": 0.0,
          "extrapolation": 0.0,
          "peak_ratio": "0",
          "vs_baseline": 7.105427357601002e-15,
          "material_pass": true,
          "numeric_pass": true,
          "visual_heuristic_pass": true
        },
        "expanded17": {
          "fitted": 1.4210854715202004e-14,
          "held": 5.329070518200751e-15,
          "in_range": 1.4210854715202004e-14,
          "extrapolation": 0.0,
          "peak_ratio": "1/70368744177664",
          "vs_baseline": 7.105427357601002e-15,
          "material_pass": true,
          "numeric_pass": true,
          "visual_heuristic_pass": true
        },
        "centered6": {
          "fitted": 6.303029458365472e-06,
          "held": 2.304864320734623e-06,
          "in_range": 6.303029458365472e-06,
          "extrapolation": 0.0,
          "peak_ratio": "887072535/140737488355328",
          "vs_baseline": 6.3030294654709e-06,
          "material_pass": true,
          "numeric_pass": false,
          "visual_heuristic_pass": true
        },
        "centered17": {
          "fitted": 7.105427357601002e-15,
          "held": 5.329070518200751e-15,
          "in_range": 7.105427357601002e-15,
          "extrapolation": 0.0,
          "peak_ratio": "1/140737488355328",
          "vs_baseline": 0.0,
          "material_pass": true,
          "numeric_pass": true,
          "visual_heuristic_pass": true
        },
        "expanded_exact": {
          "fitted": 5.634734215678727e-15,
          "held": 5.329070518200751e-15,
          "in_range": 5.634734215678727e-15,
          "extrapolation": 0.0,
          "peak_ratio": "207885/36893488147419103232",
          "vs_baseline": 2.127638343285554e-15,
          "material_pass": true,
          "numeric_pass": true,
          "visual_heuristic_pass": true
        },
        "display_exact": {
          "fitted": 0.00397263671875,
          "held": 0.00145125,
          "in_range": 0.00397263671875,
          "extrapolation": 0.0,
          "peak_ratio": "203399/51200000",
          "vs_baseline": 0.003972636718757106,
          "material_pass": false,
          "numeric_pass": false,
          "visual_heuristic_pass": true
        },
        "trace_exact": {
          "fitted": 0.0,
          "held": 0.0,
          "in_range": 0.0,
          "extrapolation": 0.0,
          "peak_ratio": "0",
          "vs_baseline": 7.105427357601002e-15,
          "material_pass": true,
          "numeric_pass": true,
          "visual_heuristic_pass": true
        }
      },
      "measures": {
        "oracle_sse": 0.0,
        "direct_sse": 1.2044919946593324e-28,
        "reported_rse_implied_sse": 1.2044919946593326e-28,
        "sse_budget": 8.000000268021433e-06,
        "sse_metric_abs_difference": 1.322792217449177e-44,
        "sse_consistency_material_pass": true,
        "direct_r2": 1.0,
        "reported_r2": 1,
        "r2_abs_difference": 5.590668935952992e-31,
        "reported_residual_se": 1.0974935055203436e-14,
        "direct_residual_se": "1.0974935055203435691937309565740360115642368061614533056043668292228188918249300E-14",
        "oracle_residual_se": "0",
        "reported_adjusted_r2": 1,
        "expected_undefined_residual_se": false,
        "expected_undefined_adjusted_r2": false,
        "rse_abs_difference": "3.080626904342596398843576319E-31",
        "centered17_direct_sse": 1.2044919946593324e-28
      },
      "equation": "y = 0.00391x\u2076 \u2212 0.00781x\u2075 + 0.0156x\u2074 \u2212 0.0313x\u00b3 + 0.0625x\u00b2 \u2212 0.125x + 1",
      "trace_tokens": [
        "1",
        "-0.125",
        "0.0625",
        "-0.03125",
        "0.015625",
        "-0.0078125",
        "0.00390625"
      ],
      "coefficient_absolute_errors": [
        2.220446049250313e-15,
        8.187894806610529e-16,
        1.457167719820518e-15,
        1.3183898417423734e-16,
        2.8102520310824275e-16,
        9.540979117872439e-18,
        1.3877787807814457e-17
      ],
      "basis_conversion_vs_baseline": 2.127638343285554e-15,
      "expanded_horner_vs_exact": 8.576120499523276e-15,
      "display_binary_vs_exact": 7.105427357601002e-16
    },
    {
      "id": "C21",
      "label": "Degree 2 interpolation offset",
      "n": 3,
      "degree": 2,
      "expected_available": true,
      "baseline_available": true,
      "availability_pass": true,
      "x_min": 999999.0,
      "x_max": 1000001.0,
      "units": {
        "x": "mm with 1000000 offset",
        "y": "V"
      },
      "input_max_abs_x_rounding": 0.0,
      "input_max_abs_y_rounding": 0.0,
      "distinct_stored_x": 3,
      "tolerance": 0.0010000000002837507,
      "measurement_tolerance": 0.001,
      "numeric_budget": 2.8375077994860475e-13,
      "visual_heuristic_budget": 0.0012500000002837507,
      "response_range": 0.25,
      "representation_limited": false,
      "input_effect_in_range": 0.0,
      "input_effect_exceeds_tolerance": false,
      "metrics": {
        "internal": {
          "fitted": 2.220446049250313e-16,
          "held": 2.220446049250313e-16,
          "in_range": 2.220446049250313e-16,
          "extrapolation": 0.0,
          "peak_ratio": "1/4503599627370496",
          "vs_baseline": 0.0,
          "material_pass": true,
          "numeric_pass": true,
          "visual_heuristic_pass": true
        },
        "expanded_horner": {
          "fitted": 7.62939453125e-06,
          "held": 7.62939453125e-06,
          "in_range": 7.62939453125e-06,
          "extrapolation": 0.0,
          "peak_ratio": "1/131072",
          "vs_baseline": 7.62939453125e-06,
          "material_pass": true,
          "numeric_pass": false,
          "visual_heuristic_pass": true
        },
        "expanded_sum": {
          "fitted": 1.52587890625e-05,
          "held": 1.52587890625e-05,
          "in_range": 1.52587890625e-05,
          "extrapolation": 0.0,
          "peak_ratio": "1/65536",
          "vs_baseline": 1.52587890625e-05,
          "material_pass": true,
          "numeric_pass": false,
          "visual_heuristic_pass": true
        },
        "display_horner": {
          "fitted": 125000.125,
          "held": 125000.0625,
          "in_range": 125000.125,
          "extrapolation": 0.0,
          "peak_ratio": "1000001/8",
          "vs_baseline": 125000.125,
          "material_pass": false,
          "numeric_pass": false,
          "visual_heuristic_pass": false
        },
        "display_sum": {
          "fitted": 125000.125,
          "held": 125000.0625,
          "in_range": 125000.125,
          "extrapolation": 0.0,
          "peak_ratio": "1000001/8",
          "vs_baseline": 125000.125,
          "material_pass": false,
          "numeric_pass": false,
          "visual_heuristic_pass": false
        },
        "trace_horner": {
          "fitted": 99999.125,
          "held": 99999.0625,
          "in_range": 99999.125,
          "extrapolation": 0.0,
          "peak_ratio": "799993/8",
          "vs_baseline": 99999.125,
          "material_pass": false,
          "numeric_pass": false,
          "visual_heuristic_pass": false
        },
        "expanded17": {
          "fitted": 7.62939453125e-06,
          "held": 7.62939453125e-06,
          "in_range": 7.62939453125e-06,
          "extrapolation": 0.0,
          "peak_ratio": "1/131072",
          "vs_baseline": 7.62939453125e-06,
          "material_pass": true,
          "numeric_pass": false,
          "visual_heuristic_pass": true
        },
        "centered6": {
          "fitted": 1.3893603167947077e-07,
          "held": 5.696801586019262e-08,
          "in_range": 1.3893603167947077e-07,
          "extrapolation": 0.0,
          "peak_ratio": "1251424521/9007199254740992",
          "vs_baseline": 1.3893603145742617e-07,
          "material_pass": true,
          "numeric_pass": false,
          "visual_heuristic_pass": true
        },
        "centered17": {
          "fitted": 2.220446049250313e-16,
          "held": 2.220446049250313e-16,
          "in_range": 2.220446049250313e-16,
          "extrapolation": 0.0,
          "peak_ratio": "1/4503599627370496",
          "vs_baseline": 0.0,
          "material_pass": true,
          "numeric_pass": true,
          "visual_heuristic_pass": true
        },
        "expanded_exact": {
          "fitted": 7.482041737220946e-06,
          "held": 7.482038703694391e-06,
          "in_range": 7.482041737220946e-06,
          "extrapolation": 0.0,
          "peak_ratio": "1078275852151/144115188075855872",
          "vs_baseline": 7.482041736998901e-06,
          "material_pass": true,
          "numeric_pass": false,
          "visual_heuristic_pass": true
        },
        "display_exact": {
          "fitted": 125000.125,
          "held": 125000.0625,
          "in_range": 125000.125,
          "extrapolation": 0.0,
          "peak_ratio": "1000001/8",
          "vs_baseline": 125000.125,
          "material_pass": false,
          "numeric_pass": false,
          "visual_heuristic_pass": false
        },
        "trace_exact": {
          "fitted": 99999.125,
          "held": 99999.0625,
          "in_range": 99999.125,
          "extrapolation": 0.0,
          "peak_ratio": "799993/8",
          "vs_baseline": 99999.125,
          "material_pass": false,
          "numeric_pass": false,
          "visual_heuristic_pass": false
        }
      },
      "measures": {
        "oracle_sse": 0.0,
        "direct_sse": 9.860761315262648e-32,
        "reported_rse_implied_sse": null,
        "sse_budget": 3.0000000017033927e-06,
        "sse_metric_abs_difference": null,
        "sse_consistency_material_pass": null,
        "direct_r2": 1.0,
        "reported_r2": 1,
        "r2_abs_difference": 2.9127171885083514e-30,
        "reported_residual_se": null,
        "direct_residual_se": null,
        "oracle_residual_se": null,
        "reported_adjusted_r2": null,
        "expected_undefined_residual_se": true,
        "expected_undefined_adjusted_r2": true,
        "centered17_direct_sse": 9.860761315262648e-32
      },
      "equation": "y = 0.0625x\u00b2 \u2212 125,000x + 62,500,125,001",
      "trace_tokens": [
        "62500100000",
        "-125000",
        "0.0625"
      ],
      "coefficient_absolute_errors": [
        6.103515625e-05,
        1.3096723705530167e-10,
        6.245004513516506e-17
      ],
      "basis_conversion_vs_baseline": 7.482041736998901e-06,
      "expanded_horner_vs_exact": 1.4736492832262416e-07,
      "display_binary_vs_exact": 0.0
    },
    {
      "id": "C22",
      "label": "Degree 3 interpolation offset",
      "n": 4,
      "degree": 3,
      "expected_available": true,
      "baseline_available": true,
      "availability_pass": true,
      "x_min": 999998.5,
      "x_max": 1000001.5,
      "units": {
        "x": "mm with 1000000 offset",
        "y": "V"
      },
      "input_max_abs_x_rounding": 0.0,
      "input_max_abs_y_rounding": 0.0,
      "distinct_stored_x": 4,
      "tolerance": 0.0010000000006266828,
      "measurement_tolerance": 0.001,
      "numeric_budget": 6.266826850037432e-13,
      "visual_heuristic_budget": 0.0029296875006266827,
      "response_range": 0.5859375,
      "representation_limited": false,
      "input_effect_in_range": 0.0,
      "input_effect_exceeds_tolerance": false,
      "metrics": {
        "internal": {
          "fitted": 2.220446049250313e-16,
          "held": 0.0,
          "in_range": 2.220446049250313e-16,
          "extrapolation": 0.0,
          "peak_ratio": "1/4503599627370496",
          "vs_baseline": 0.0,
          "material_pass": true,
          "numeric_pass": true,
          "visual_heuristic_pass": true
        },
        "expanded_horner": {
          "fitted": 7.15234375,
          "held": 7.09375,
          "in_range": 7.15234375,
          "extrapolation": 0.0,
          "peak_ratio": "1831/256",
          "vs_baseline": 7.15234375,
          "material_pass": false,
          "numeric_pass": false,
          "visual_heuristic_pass": false
        },
        "expanded_sum": {
          "fitted": 15.15234375,
          "held": 9.0,
          "in_range": 15.15234375,
          "extrapolation": 0.0,
          "peak_ratio": "3879/256",
          "vs_baseline": 15.15234375,
          "material_pass": false,
          "numeric_pass": false,
          "visual_heuristic_pass": false
        },
        "display_horner": {
          "fitted": 49937724937815.16,
          "held": 49937650000127.09,
          "in_range": 49937724937815.16,
          "extrapolation": 0.0,
          "peak_ratio": "12784057584080679/256",
          "vs_baseline": 49937724937815.16,
          "material_pass": false,
          "numeric_pass": false,
          "visual_heuristic_pass": false
        },
        "display_sum": {
          "fitted": 49937724937819.16,
          "held": 49937650000127.09,
          "in_range": 49937724937819.16,
          "extrapolation": 0.0,
          "peak_ratio": "12784057584081703/256",
          "vs_baseline": 49937724937819.16,
          "material_pass": false,
          "numeric_pass": false,
          "visual_heuristic_pass": false
        },
        "trace_horner": {
          "fitted": 100000150007.15234,
          "held": 100000100007.09375,
          "in_range": 100000150007.15234,
          "extrapolation": 0.0,
          "peak_ratio": "25600038401831/256",
          "vs_baseline": 100000150007.15234,
          "material_pass": false,
          "numeric_pass": false,
          "visual_heuristic_pass": false
        },
        "expanded17": {
          "fitted": 7.15234375,
          "held": 7.09375,
          "in_range": 7.15234375,
          "extrapolation": 0.0,
          "peak_ratio": "1831/256",
          "vs_baseline": 7.15234375,
          "material_pass": false,
          "numeric_pass": false,
          "visual_heuristic_pass": false
        },
        "centered6": {
          "fitted": 3.400089573224463e-07,
          "held": 2.2427061585617025e-07,
          "in_range": 3.400089573224463e-07,
          "extrapolation": 0.0,
          "peak_ratio": "3062528427/9007199254740992",
          "vs_baseline": 3.400089573224463e-07,
          "material_pass": true,
          "numeric_pass": false,
          "visual_heuristic_pass": true
        },
        "centered17": {
          "fitted": 2.220446049250313e-16,
          "held": 0.0,
          "in_range": 2.220446049250313e-16,
          "extrapolation": 0.0,
          "peak_ratio": "1/4503599627370496",
          "vs_baseline": 0.0,
          "material_pass": true,
          "numeric_pass": true,
          "visual_heuristic_pass": true
        },
        "expanded_exact": {
          "fitted": 2.8205032841097926,
          "held": 2.820501467520159,
          "in_range": 2.8205032841097926,
          "extrapolation": 0.0,
          "peak_ratio": "6503637780128830269/2305843009213693952",
          "vs_baseline": 2.8205032841097926,
          "material_pass": false,
          "numeric_pass": false,
          "visual_heuristic_pass": false
        },
        "display_exact": {
          "fitted": 49937724937812.55,
          "held": 49937650000125.06,
          "in_range": 49937724937812.55,
          "extrapolation": 0.0,
          "peak_ratio": "7990035990050007527/160000",
          "vs_baseline": 49937724937812.55,
          "material_pass": false,
          "numeric_pass": false,
          "visual_heuristic_pass": false
        },
        "trace_exact": {
          "fitted": 100000149999.27188,
          "held": 100000099999.1625,
          "in_range": 100000149999.27188,
          "extrapolation": 0.0,
          "peak_ratio": "32000047999767/320",
          "vs_baseline": 100000149999.27188,
          "material_pass": false,
          "numeric_pass": false,
          "visual_heuristic_pass": false
        }
      },
      "measures": {
        "oracle_sse": 0.0,
        "direct_sse": 4.930380657631324e-32,
        "reported_rse_implied_sse": null,
        "sse_budget": 4.0000000050139055e-06,
        "sse_metric_abs_difference": null,
        "sse_consistency_material_pass": null,
        "direct_r2": 1.0,
        "reported_r2": 1,
        "r2_abs_difference": 2.5141411980899973e-31,
        "reported_residual_se": null,
        "direct_residual_se": null,
        "oracle_residual_se": null,
        "reported_adjusted_r2": null,
        "expected_undefined_residual_se": true,
        "expected_undefined_adjusted_r2": true,
        "centered17_direct_sse": 4.930380657631324e-32
      },
      "equation": "y = \u22120.0312x\u00b3 + 93,750x\u00b2 \u2212 93,750,125,000x + 31,250,062,500,124,976",
      "trace_tokens": [
        "31250100000000000",
        "-93750100000",
        "93750.1",
        "-0.03125"
      ],
      "coefficient_absolute_errors": [
        25.0,
        7.62939453125e-05,
        7.275957614183426e-11,
        2.42861286636753e-17
      ],
      "basis_conversion_vs_baseline": 2.8205032841097926,
      "expanded_horner_vs_exact": 4.331840465890208,
      "display_binary_vs_exact": 6.0312
    },
    {
      "id": "C23",
      "label": "Degree 4 interpolation offset",
      "n": 5,
      "degree": 4,
      "expected_available": true,
      "baseline_available": true,
      "availability_pass": true,
      "x_min": 999998.0,
      "x_max": 1000002.0,
      "units": {
        "x": "mm with 1000000 offset",
        "y": "V"
      },
      "input_max_abs_x_rounding": 0.0,
      "input_max_abs_y_rounding": 0.0,
      "distinct_stored_x": 5,
      "tolerance": 0.0010000000011349684,
      "measurement_tolerance": 0.001,
      "numeric_budget": 1.134968418860808e-12,
      "visual_heuristic_budget": 0.0053906250011349684,
      "response_range": 1.078125,
      "representation_limited": false,
      "input_effect_in_range": 0.0,
      "input_effect_exceeds_tolerance": false,
      "metrics": {
        "internal": {
          "fitted": 4.440892098500626e-16,
          "held": 4.440892098500626e-16,
          "in_range": 4.440892098500626e-16,
          "extrapolation": 0.0,
          "peak_ratio": "1/2251799813685248",
          "vs_baseline": 0.0,
          "material_pass": true,
          "numeric_pass": true,
          "visual_heuristic_pass": true
        },
        "expanded_horner": {
          "fitted": 4194302.765625,
          "held": 4194302.9169921875,
          "in_range": 4194302.9169921875,
          "extrapolation": 0.0,
          "peak_ratio": "4294966187/1024",
          "vs_baseline": 4194302.9169921875,
          "material_pass": false,
          "numeric_pass": false,
          "visual_heuristic_pass": false
        },
        "expanded_sum": {
          "fitted": 12582910.765625,
          "held": 14680063.073242188,
          "in_range": 14680063.073242188,
          "extrapolation": 0.0,
          "peak_ratio": "15032384587/1024",
          "vs_baseline": 14680063.073242188,
          "material_pass": false,
          "numeric_pass": false,
          "visual_heuristic_pass": false
        },
        "display_horner": {
          "fitted": 2.4968949875655836e+19,
          "held": 2.4968899922275336e+19,
          "in_range": 2.4968949875655836e+19,
          "extrapolation": 0.0,
          "peak_ratio": "24968949875655835649",
          "vs_baseline": 2.4968949875655836e+19,
          "material_pass": false,
          "numeric_pass": false,
          "visual_heuristic_pass": false
        },
        "display_sum": {
          "fitted": 2.496894987566842e+19,
          "held": 2.496889992225017e+19,
          "in_range": 2.496894987566842e+19,
          "extrapolation": 0.0,
          "peak_ratio": "24968949875668418561",
          "vs_baseline": 2.496894987566842e+19,
          "material_pass": false,
          "numeric_pass": false,
          "visual_heuristic_pass": false
        },
        "trace_horner": {
          "fitted": 200003289090.0,
          "held": 150002991105.5127,
          "in_range": 200003289090.0,
          "extrapolation": 0.0,
          "peak_ratio": "200003289090",
          "vs_baseline": 200003289090.0,
          "material_pass": false,
          "numeric_pass": false,
          "visual_heuristic_pass": false
        },
        "expanded17": {
          "fitted": 4194302.765625,
          "held": 4194302.9169921875,
          "in_range": 4194302.9169921875,
          "extrapolation": 0.0,
          "peak_ratio": "4294966187/1024",
          "vs_baseline": 4194302.9169921875,
          "material_pass": false,
          "numeric_pass": false,
          "visual_heuristic_pass": false
        },
        "centered6": {
          "fitted": 2.961458323014199e-07,
          "held": 2.6633071370518735e-07,
          "in_range": 2.961458323014199e-07,
          "extrapolation": 0.0,
          "peak_ratio": "333430565/1125899906842624",
          "vs_baseline": 2.961458327455091e-07,
          "material_pass": true,
          "numeric_pass": false,
          "visual_heuristic_pass": true
        },
        "centered17": {
          "fitted": 4.440892098500626e-16,
          "held": 4.440892098500626e-16,
          "in_range": 4.440892098500626e-16,
          "extrapolation": 0.0,
          "peak_ratio": "1/2251799813685248",
          "vs_baseline": 0.0,
          "material_pass": true,
          "numeric_pass": true,
          "visual_heuristic_pass": true
        },
        "expanded_exact": {
          "fitted": 3204242.307232613,
          "held": 3204238.594345312,
          "in_range": 3204242.307232613,
          "extrapolation": 0.0,
          "peak_ratio": "28861248921715149395331/9007199254740992",
          "vs_baseline": 3204242.307232613,
          "material_pass": false,
          "numeric_pass": false,
          "visual_heuristic_pass": false
        },
        "display_exact": {
          "fitted": 2.4968949875659874e+19,
          "held": 2.4968899922272477e+19,
          "in_range": 2.4968949875659874e+19,
          "extrapolation": 0.0,
          "peak_ratio": "15605593672287422475469/625",
          "vs_baseline": 2.4968949875659874e+19,
          "material_pass": false,
          "numeric_pass": false,
          "visual_heuristic_pass": false
        },
        "trace_exact": {
          "fitted": 200000399999.25,
          "held": 150000224999.15234,
          "in_range": 200000399999.25,
          "extrapolation": 0.0,
          "peak_ratio": "800001599997/4",
          "vs_baseline": 200000399999.25,
          "material_pass": false,
          "numeric_pass": false,
          "visual_heuristic_pass": false
        }
      },
      "measures": {
        "oracle_sse": 0.0,
        "direct_sse": 9.860761315262648e-31,
        "reported_rse_implied_sse": null,
        "sse_budget": 5.000000011354125e-06,
        "sse_metric_abs_difference": null,
        "sse_consistency_material_pass": null,
        "direct_r2": 1.0,
        "reported_r2": 1,
        "r2_abs_difference": 1.2424534990561032e-30,
        "reported_residual_se": null,
        "direct_residual_se": null,
        "oracle_residual_se": null,
        "reported_adjusted_r2": null,
        "expected_undefined_residual_se": true,
        "expected_undefined_adjusted_r2": true,
        "centered17_direct_sse": 9.860761315262648e-31
      },
      "equation": "y = 0.0156x\u2074 \u2212 62,500x\u00b3 + 93,750,093,750x\u00b2 \u2212 62,500,093,750,125,080x + 15,625,031,250,062,520,000,000",
      "trace_tokens": [
        "1.5625e+22",
        "-62500100000000000",
        "93750100000",
        "-62500",
        "0.015625"
      ],
      "coefficient_absolute_errors": [
        20227767.0,
        79.875,
        0.0001220703125,
        8.003553375601768e-11,
        2.0816681711721685e-17
      ],
      "basis_conversion_vs_baseline": 3204242.307232613,
      "expanded_horner_vs_exact": 3204243.307232613,
      "display_binary_vs_exact": 7229296.921025
    },
    {
      "id": "C24",
      "label": "Degree 5 interpolation offset",
      "n": 6,
      "degree": 5,
      "expected_available": true,
      "baseline_available": true,
      "availability_pass": true,
      "x_min": 999997.5,
      "x_max": 1000002.5,
      "units": {
        "x": "mm with 1000000 offset",
        "y": "V"
      },
      "input_max_abs_x_rounding": 0.0,
      "input_max_abs_y_rounding": 0.0,
      "distinct_stored_x": 6,
      "tolerance": 0.0010000000032287563,
      "measurement_tolerance": 0.001,
      "numeric_budget": 3.2287561961409495e-12,
      "visual_heuristic_budget": 0.015637207034478757,
      "response_range": 3.12744140625,
      "representation_limited": false,
      "input_effect_in_range": 0.0,
      "input_effect_exceeds_tolerance": false,
      "metrics": {
        "internal": {
          "fitted": 5.551115123125783e-16,
          "held": 5.551115123125783e-16,
          "in_range": 5.551115123125783e-16,
          "extrapolation": 0.0,
          "peak_ratio": "5/9007199254740992",
          "vs_baseline": 0.0,
          "material_pass": true,
          "numeric_pass": true,
          "visual_heuristic_pass": true
        },
        "expanded_horner": {
          "fitted": 21990232555521.082,
          "held": 21990232555521.242,
          "in_range": 21990232555521.242,
          "extrapolation": 0.0,
          "peak_ratio": "2814749767106719/128",
          "vs_baseline": 21990232555521.242,
          "material_pass": false,
          "numeric_pass": false,
          "visual_heuristic_pass": false
        },
        "expanded_sum": {
          "fitted": 27487790694401.082,
          "held": 30786325577729.0,
          "in_range": 30786325577729.0,
          "extrapolation": 0.0,
          "peak_ratio": "30786325577729",
          "vs_baseline": 30786325577729.0,
          "material_pass": false,
          "numeric_pass": false,
          "visual_heuristic_pass": false
        },
        "display_horner": {
          "fitted": 2.9844111252004583e+24,
          "held": 2.9844039063920505e+24,
          "in_range": 2.9844111252004583e+24,
          "extrapolation": 0.0,
          "peak_ratio": "12224147968821077111967054081/4096",
          "vs_baseline": 2.9844111252004583e+24,
          "material_pass": false,
          "numeric_pass": false,
          "visual_heuristic_pass": false
        },
        "display_sum": {
          "fitted": 2.9844111252092544e+24,
          "held": 2.984403906388752e+24,
          "in_range": 2.9844111252092544e+24,
          "extrapolation": 0.0,
          "peak_ratio": "12224147968857105908986018049/4096",
          "vs_baseline": 2.9844111252092544e+24,
          "material_pass": false,
          "numeric_pass": false,
          "visual_heuristic_pass": false
        },
        "trace_horner": {
          "fitted": 8.000050000419448e+22,
          "held": 8.000040000910949e+22,
          "in_range": 8.000050000419448e+22,
          "extrapolation": 0.0,
          "peak_ratio": "327682048017180577316734719/4096",
          "vs_baseline": 8.000050000419448e+22,
          "material_pass": false,
          "numeric_pass": false,
          "visual_heuristic_pass": false
        },
        "expanded17": {
          "fitted": 21990232555521.082,
          "held": 21990232555521.242,
          "in_range": 21990232555521.242,
          "extrapolation": 0.0,
          "peak_ratio": "2814749767106719/128",
          "vs_baseline": 21990232555521.242,
          "material_pass": false,
          "numeric_pass": false,
          "visual_heuristic_pass": false
        },
        "centered6": {
          "fitted": 7.894981055578398e-07,
          "held": 6.601519140225776e-07,
          "in_range": 7.894981055578398e-07,
          "extrapolation": 0.0,
          "peak_ratio": "1777791687/2251799813685248",
          "vs_baseline": 7.894981056688621e-07,
          "material_pass": true,
          "numeric_pass": false,
          "visual_heuristic_pass": true
        },
        "centered17": {
          "fitted": 5.551115123125783e-16,
          "held": 5.551115123125783e-16,
          "in_range": 5.551115123125783e-16,
          "extrapolation": 0.0,
          "peak_ratio": "5/9007199254740992",
          "vs_baseline": 0.0,
          "material_pass": true,
          "numeric_pass": true,
          "visual_heuristic_pass": true
        },
        "expanded_exact": {
          "fitted": 20818715715391.562,
          "held": 20818695279085.414,
          "in_range": 20818715715391.562,
          "extrapolation": 0.0,
          "peak_ratio": "96009380186285795142542448655029/4611686018427387904",
          "vs_baseline": 20818715715391.562,
          "material_pass": false,
          "numeric_pass": false,
          "visual_heuristic_pass": false
        },
        "display_exact": {
          "fitted": 2.984411125201649e+24,
          "held": 2.9844039063888126e+24,
          "in_range": 2.984411125201649e+24,
          "extrapolation": 0.0,
          "peak_ratio": "12224147968825954545603611085/4096",
          "vs_baseline": 2.984411125201649e+24,
          "material_pass": false,
          "numeric_pass": false,
          "visual_heuristic_pass": false
        },
        "trace_exact": {
          "fitted": 8.000050000125e+22,
          "held": 8.00004000008e+22,
          "in_range": 8.000050000125e+22,
          "extrapolation": 0.0,
          "peak_ratio": "81920512001280001600001229/1024",
          "vs_baseline": 8.000050000125e+22,
          "material_pass": false,
          "numeric_pass": false,
          "visual_heuristic_pass": false
        }
      },
      "measures": {
        "oracle_sse": 0.0,
        "direct_sse": 8.258387601532467e-31,
        "reported_rse_implied_sse": null,
        "sse_budget": 6.000000038748849e-06,
        "sse_metric_abs_difference": null,
        "sse_consistency_material_pass": null,
        "direct_r2": 1.0,
        "reported_r2": 1,
        "r2_abs_difference": 1.3260188329658774e-31,
        "reported_residual_se": null,
        "direct_residual_se": null,
        "oracle_residual_se": null,
        "reported_adjusted_r2": null,
        "expected_undefined_residual_se": true,
        "expected_undefined_adjusted_r2": true,
        "centered17_direct_sse": 8.258387601532467e-31
      },
      "equation": "y = \u22120.00781x\u2075 + 39,063x\u2074 \u2212 78,125,062,500x\u00b3 + 78,125,093,750,093,810x\u00b2 \u2212 39,062,562,500,093,790,000,000x + 7,812,515,625,031,257,000,000,000,000",
      "trace_tokens": [
        "7.81252e+27",
        "-3.90626e+22",
        "78125100000000000",
        "-78125100000",
        "39062.5",
        "-0.0078125"
      ],
      "coefficient_absolute_errors": [
        6787297486519.0,
        38690359.875,
        57.9375,
        7.62939453125e-05,
        3.637978807091713e-11,
        6.938893903907228e-18
      ],
      "basis_conversion_vs_baseline": 20818715715391.562,
      "expanded_horner_vs_exact": 3226468362089.2876,
      "display_binary_vs_exact": 8486225070256.753
    },
    {
      "id": "C25",
      "label": "Degree 6 interpolation offset",
      "n": 7,
      "degree": 6,
      "expected_available": true,
      "baseline_available": true,
      "availability_pass": true,
      "x_min": 999997.0,
      "x_max": 1000003.0,
      "units": {
        "x": "mm with 1000000 offset",
        "y": "V"
      },
      "input_max_abs_x_rounding": 0.0,
      "input_max_abs_y_rounding": 0.0,
      "distinct_stored_x": 7,
      "tolerance": 0.0010000000081249111,
      "measurement_tolerance": 0.001,
      "numeric_budget": 8.124911202843123e-12,
      "visual_heuristic_budget": 0.03937500000812491,
      "response_range": 7.875,
      "representation_limited": false,
      "input_effect_in_range": 0.0,
      "input_effect_exceeds_tolerance": false,
      "metrics": {
        "internal": {
          "fitted": 1.7763568394002505e-15,
          "held": 8.881784197001252e-16,
          "in_range": 1.7763568394002505e-15,
          "extrapolation": 0.0,
          "peak_ratio": "1/562949953421312",
          "vs_baseline": 0.0,
          "material_pass": true,
          "numeric_pass": true,
          "visual_heuristic_pass": true
        },
        "expanded_horner": {
          "fitted": 9.223372036854776e+18,
          "held": 1.0952754293765046e+19,
          "in_range": 1.0952754293765046e+19,
          "extrapolation": 0.0,
          "peak_ratio": "179449926349046518135389/16384",
          "vs_baseline": 1.0952754293765046e+19,
          "material_pass": false,
          "numeric_pass": false,
          "visual_heuristic_pass": false
        },
        "expanded_sum": {
          "fitted": 1.4411518807585587e+19,
          "held": 1.2105675798371893e+19,
          "in_range": 1.4411518807585587e+19,
          "extrapolation": 0.0,
          "peak_ratio": "28823037615171174405/2",
          "vs_baseline": 1.4411518807585587e+19,
          "material_pass": false,
          "numeric_pass": false,
          "visual_heuristic_pass": false
        },
        "display_horner": {
          "fitted": 3.25787310194882e+30,
          "held": 3.2578630822734997e+30,
          "in_range": 3.25787310194882e+30,
          "extrapolation": 0.0,
          "peak_ratio": "834015514098897940479296313228657/256",
          "vs_baseline": 3.25787310194882e+30,
          "material_pass": false,
          "numeric_pass": false,
          "visual_heuristic_pass": false
        },
        "display_sum": {
          "fitted": 3.257873101944785e+30,
          "held": 3.257863082289064e+30,
          "in_range": 3.257873101944785e+30,
          "extrapolation": 0.0,
          "peak_ratio": "834015514097864922811168578338161/256",
          "vs_baseline": 3.257873101944785e+30,
          "material_pass": false,
          "numeric_pass": false,
          "visual_heuristic_pass": false
        },
        "trace_horner": {
          "fitted": 1.0000000004168923e+28,
          "held": 1.000000000186308e+28,
          "in_range": 1.0000000004168923e+28,
          "extrapolation": 0.0,
          "peak_ratio": "10000000004168923264158007295",
          "vs_baseline": 1.0000000004168923e+28,
          "material_pass": false,
          "numeric_pass": false,
          "visual_heuristic_pass": false
        },
        "expanded17": {
          "fitted": 9.223372036854776e+18,
          "held": 1.0952754293765046e+19,
          "in_range": 1.0952754293765046e+19,
          "extrapolation": 0.0,
          "peak_ratio": "179449926349046518135389/16384",
          "vs_baseline": 1.0952754293765046e+19,
          "material_pass": false,
          "numeric_pass": false,
          "visual_heuristic_pass": false
        },
        "centered6": {
          "fitted": 0.0,
          "held": 0.0,
          "in_range": 0.0,
          "extrapolation": 0.0,
          "peak_ratio": "0",
          "vs_baseline": 1.7763568394002505e-15,
          "material_pass": true,
          "numeric_pass": true,
          "visual_heuristic_pass": true
        },
        "centered17": {
          "fitted": 1.7763568394002505e-15,
          "held": 8.881784197001252e-16,
          "in_range": 1.7763568394002505e-15,
          "extrapolation": 0.0,
          "peak_ratio": "1/562949953421312",
          "vs_baseline": 0.0,
          "material_pass": true,
          "numeric_pass": true,
          "visual_heuristic_pass": true
        },
        "expanded_exact": {
          "fitted": 6.219254070505384e+18,
          "held": 6.219246637424008e+18,
          "in_range": 6.219254070505384e+18,
          "extrapolation": 0.0,
          "peak_ratio": "7170311760499325378599915581420315103/1152921504606846976",
          "vs_baseline": 6.219254070505384e+18,
          "material_pass": false,
          "numeric_pass": false,
          "visual_heuristic_pass": false
        },
        "display_exact": {
          "fitted": 3.2578731019482667e+30,
          "held": 3.2578630822748946e+30,
          "in_range": 3.2578731019482667e+30,
          "extrapolation": 0.0,
          "peak_ratio": "2606298481558613338613435382103433437/800000",
          "vs_baseline": 3.2578731019482667e+30,
          "material_pass": false,
          "numeric_pass": false,
          "visual_heuristic_pass": false
        },
        "trace_exact": {
          "fitted": 1.0000000000450003e+28,
          "held": 1.00000000003125e+28,
          "in_range": 1.0000000000450003e+28,
          "extrapolation": 0.0,
          "peak_ratio": "1280000000057600345600518400037/128",
          "vs_baseline": 1.0000000000450003e+28,
          "material_pass": false,
          "numeric_pass": false,
          "visual_heuristic_pass": false
        }
      },
      "measures": {
        "oracle_sse": 0.0,
        "direct_sse": 4.585254011597131e-30,
        "reported_rse_implied_sse": null,
        "sse_budget": 7.000000113757195e-06,
        "sse_metric_abs_difference": null,
        "sse_consistency_material_pass": null,
        "direct_r2": 1.0,
        "reported_r2": 1,
        "r2_abs_difference": 9.524433818019883e-32,
        "reported_residual_se": null,
        "direct_residual_se": null,
        "oracle_residual_se": null,
        "reported_adjusted_r2": null,
        "expected_undefined_residual_se": true,
        "expected_undefined_adjusted_r2": true,
        "centered17_direct_sse": 4.585254011597131e-30
      },
      "equation": "y = 0.00391x\u2076 \u2212 23,438x\u2075 + 58,593,789,063x\u2074 \u2212 78,125,078,125,062,660x\u00b3 + 58,593,828,125,093,870,000,000x\u00b2 \u2212 23,437,539,062,562,550,000,000,000,000x + 3,906,257,812,515,633,000,000,000,000,000,000",
      "trace_tokens": [
        "3.90626e+33",
        "-2.34375e+28",
        "5.85938e+22",
        "-78125100000000000",
        "58593800000",
        "-23437.5",
        "0.00390625"
      ],
      "coefficient_absolute_errors": [
        8.133933641671944e+18,
        51583292169783.875,
        118245449.9375,
        155.96875,
        0.00011444091796875,
        4.729372449219227e-11,
        7.806255641895632e-18
      ],
      "basis_conversion_vs_baseline": 6.219254070505384e+18,
      "expanded_horner_vs_exact": 9.677988852056996e+18,
      "display_binary_vs_exact": 9.31710945125596e+18
    },
    {
      "id": "C26",
      "label": "NIST Pontius",
      "n": 40,
      "degree": 2,
      "expected_available": true,
      "baseline_available": true,
      "availability_pass": true,
      "x_min": 150000.0,
      "x_max": 3000000.0,
      "units": {
        "x": "NIST source load units (unspecified)",
        "y": "NIST source deflection units (unspecified)"
      },
      "input_max_abs_x_rounding": 0.0,
      "input_max_abs_y_rounding": 1.7138290786533616e-16,
      "distinct_stored_x": 20,
      "tolerance": 5.000002119880771e-06,
      "measurement_tolerance": 5e-06,
      "numeric_budget": 2.1198807715972654e-12,
      "visual_heuristic_budget": 0.01029125000211988,
      "response_range": 2.05825,
      "representation_limited": false,
      "input_effect_in_range": 1.8620147271095247e-17,
      "input_effect_exceeds_tolerance": false,
      "metrics": {
        "internal": {
          "fitted": 5.93205707840536e-16,
          "held": 4.4289241270145066e-16,
          "in_range": 5.93205707840536e-16,
          "extrapolation": 6.431745974018149e-16,
          "peak_ratio": "89337/150600371539269386240",
          "vs_baseline": 0.0,
          "material_pass": true,
          "numeric_pass": true,
          "visual_heuristic_pass": true
        },
        "expanded_horner": {
          "fitted": 6.601681683278386e-16,
          "held": 6.094258663952241e-16,
          "in_range": 6.601681683278386e-16,
          "extrapolation": 7.264413242487017e-16,
          "peak_ratio": "36629/55484347409204510720",
          "vs_baseline": 2.7755575615628914e-16,
          "material_pass": true,
          "numeric_pass": true,
          "visual_heuristic_pass": true
        },
        "expanded_sum": {
          "fitted": 6.462903805200241e-16,
          "held": 6.371814420108531e-16,
          "in_range": 6.462903805200241e-16,
          "extrapolation": 7.264413242487017e-16,
          "peak_ratio": "35859/55484347409204510720",
          "vs_baseline": 4.440892098500626e-16,
          "material_pass": true,
          "numeric_pass": true,
          "visual_heuristic_pass": true
        },
        "display_horner": {
          "fitted": 0.00016967857142811407,
          "held": 0.00016560535714242578,
          "in_range": 0.00016967857142811407,
          "extrapolation": 0.00017779736842075082,
          "peak_ratio": "9414504805015003/55484347409204510720",
          "vs_baseline": 0.00016967857142846654,
          "material_pass": false,
          "numeric_pass": false,
          "visual_heuristic_pass": true
        },
        "display_sum": {
          "fitted": 0.00016967857142811407,
          "held": 0.00016560535714242578,
          "in_range": 0.00016967857142811407,
          "extrapolation": 0.00017779736842075082,
          "peak_ratio": "9414504805015003/55484347409204510720",
          "vs_baseline": 0.00016967857142846654,
          "material_pass": false,
          "numeric_pass": false,
          "visual_heuristic_pass": true
        },
        "trace_horner": {
          "fitted": 4.925714286258167e-07,
          "held": 4.799696429606188e-07,
          "in_range": 4.925714286258167e-07,
          "extrapolation": 5.178184208416728e-07,
          "peak_ratio": "27330004269723/55484347409204510720",
          "vs_baseline": 4.925714289782945e-07,
          "material_pass": true,
          "numeric_pass": false,
          "visual_heuristic_pass": true
        },
        "expanded17": {
          "fitted": 6.601681683278386e-16,
          "held": 6.094258663952241e-16,
          "in_range": 6.601681683278386e-16,
          "extrapolation": 7.264413242487017e-16,
          "peak_ratio": "36629/55484347409204510720",
          "vs_baseline": 2.7755575615628914e-16,
          "material_pass": true,
          "numeric_pass": true,
          "visual_heuristic_pass": true
        },
        "centered6": {
          "fitted": 4.069670242931571e-06,
          "held": 4.069631207762249e-06,
          "in_range": 4.069670242931571e-06,
          "extrapolation": 4.069635531867425e-06,
          "peak_ratio": "225802997599717/55484347409204510720",
          "vs_baseline": 4.069670242579093e-06,
          "material_pass": true,
          "numeric_pass": false,
          "visual_heuristic_pass": true
        },
        "centered17": {
          "fitted": 5.93205707840536e-16,
          "held": 4.4289241270145066e-16,
          "in_range": 5.93205707840536e-16,
          "extrapolation": 6.431745974018149e-16,
          "peak_ratio": "89337/150600371539269386240",
          "vs_baseline": 0.0,
          "material_pass": true,
          "numeric_pass": true,
          "visual_heuristic_pass": true
        },
        "expanded_exact": {
          "fitted": 6.548890497339586e-16,
          "held": 6.21424437792672e-16,
          "in_range": 6.548890497339586e-16,
          "extrapolation": 7.264413242487017e-16,
          "peak_ratio": "624249299485521/953213830249742811672325652480",
          "vs_baseline": 2.7227663756240913e-16,
          "material_pass": true,
          "numeric_pass": true,
          "visual_heuristic_pass": true
        },
        "display_exact": {
          "fitted": 0.00016967857142855282,
          "held": 0.00016560535714284135,
          "in_range": 0.00016967857142855282,
          "extrapolation": 0.00017779736842102792,
          "peak_ratio": "29420327515747957911/173388585653764096000000",
          "vs_baseline": 0.0001696785714289053,
          "material_pass": false,
          "numeric_pass": false,
          "visual_heuristic_pass": true
        },
        "trace_exact": {
          "fitted": 4.925714285528084e-07,
          "held": 4.799696428413436e-07,
          "in_range": 4.925714285528084e-07,
          "extrapolation": 5.178184210279263e-07,
          "peak_ratio": "10675782916278195643/21673573206720512000000000",
          "vs_baseline": 4.925714289052862e-07,
          "material_pass": true,
          "numeric_pass": false,
          "visual_heuristic_pass": true
        }
      },
      "measures": {
        "oracle_sse": 1.5576176879698784e-06,
        "direct_sse": 1.557617687969993e-06,
        "reported_rse_implied_sse": 1.557617687969993e-06,
        "sse_budget": 6.480021586761794e-08,
        "sse_metric_abs_difference": 2.174628720677202e-23,
        "sse_consistency_material_pass": true,
        "direct_r2": 0.9999999001785371,
        "reported_r2": 0.9999999001785371,
        "r2_abs_difference": 3.2250983171431794e-17,
        "reported_residual_se": 0.0002051774240761891,
        "direct_residual_se": "0.00020517742407618911478572426908284364391895378661470205634708444871008460843904484",
        "oracle_residual_se": "0.00020517742407618156803032185432726423734705768882307633562203791353537378448719213",
        "reported_adjusted_r2": 0.9999998947827824,
        "expected_undefined_residual_se": false,
        "expected_undefined_adjusted_r2": false,
        "rse_abs_difference": "1.478572426908284364391895379E-20",
        "centered17_direct_sse": 1.557617687969993e-06
      },
      "equation": "y = \u22123.16e-15x\u00b2 + 7.32e-7x + 6.74e-4",
      "trace_tokens": [
        "0.000673566",
        "7.32059e-7",
        "-3.16082e-15"
      ],
      "coefficient_absolute_errors": [
        7.264413242487017e-16,
        4.975620551301528e-22,
        1.3697927799021659e-28
      ],
      "basis_conversion_vs_baseline": 2.7227663756240913e-16,
      "expanded_horner_vs_exact": 2.6240299068737073e-16,
      "display_binary_vs_exact": 4.3874592847714664e-16
    }
  ]
}
```

</details>

<details>
<summary>research/observed/independent-audit-results.json</summary>

<!-- R001_FILE: research/observed/independent-audit-results.json SHA256: db7cdc43f96e495d05813aa6b87807f19c133b5c74c40e30530ff5caeaec51dc -->
```json
{
  "audit": "independent closed-form symmetric regression and Cramer 3x3 oracle",
  "cases": {
    "C03": {
      "reference_exactly_matches_frozen": true,
      "max_internal_error": "69504053049209/2251799813685248",
      "max_internal_error_decimal": 0.03086600000000006,
      "max_expanded_exact_error": "69504053049209/4503599627370496",
      "max_expanded_exact_error_decimal": 0.01543300000000003,
      "direct_sse": "33821675257851842484514175967/20282409603651670423947251286016",
      "direct_sse_decimal": 0.0016675373350000064
    },
    "C06": {
      "reference_exactly_matches_frozen": true,
      "max_internal_error": "137/315251973915934720",
      "max_internal_error_decimal": 4.345730124961327e-16,
      "max_expanded_exact_error": "5823100888104562277/1261007895663738880",
      "max_expanded_exact_error_decimal": 4.617814771920631,
      "direct_sse": "887355420159621419819207/1267650600228229401496703205376",
      "direct_sse_decimal": 6.999999999998902e-07
    }
  },
  "NIST": {
    "reference_exactly_matches_frozen": true,
    "coefficient_rationals": [
      "51191/76000000",
      "58418321/79800000000000",
      "-1081/342000000000000000"
    ],
    "certificate_rounding_checks": {
      "B0": {
        "rounded_15_significant_digits": "0.000673565789473684",
        "certificate": "0.673565789473684E-03",
        "pass": true
      },
      "B1": {
        "rounded_15_significant_digits": "7.32059160401003E-7",
        "certificate": "0.732059160401003E-06",
        "pass": true
      },
      "B2": {
        "rounded_15_significant_digits": "-3.16081871345029E-15",
        "certificate": "-0.316081871345029E-14",
        "pass": true
      },
      "SE_B0": {
        "rounded_15_significant_digits": "0.000107938612033077",
        "certificate": "0.107938612033077E-03",
        "pass": true
      },
      "SE_B1": {
        "rounded_15_significant_digits": "1.57817399981659E-10",
        "certificate": "0.157817399981659E-09",
        "pass": true
      },
      "SE_B2": {
        "rounded_15_significant_digits": "4.86652849992036E-17",
        "certificate": "0.486652849992036E-16",
        "pass": true
      },
      "RSE": {
        "rounded_15_significant_digits": "0.000205177424076185",
        "certificate": "0.205177424076185E-03",
        "pass": true
      },
      "R2": {
        "rounded_15_significant_digits": "0.999999900178537",
        "certificate": "0.999999900178537",
        "pass": true
      },
      "Regression_SS": {
        "rounded_15_significant_digits": "15.6040343244198",
        "certificate": "15.6040343244198",
        "pass": true
      },
      "Residual_SS": {
        "rounded_15_significant_digits": "0.00000155761768796992",
        "certificate": "0.155761768796992E-05",
        "pass": true
      },
      "Regression_MS": {
        "rounded_15_significant_digits": "7.80201716220991",
        "certificate": "7.80201716220991",
        "pass": true
      },
      "Residual_MS": {
        "rounded_15_significant_digits": "4.20977753505385E-8",
        "certificate": "0.420977753505385E-07",
        "pass": true
      },
      "F": {
        "rounded_15_significant_digits": "185330865.995752",
        "certificate": "185330865.995752",
        "pass": true
      }
    },
    "all_certificate_rounding_pass": true
  },
  "minimum_rows_controls": {
    "C21": {
      "available": true,
      "residual_se_undefined": true,
      "adjusted_r2_undefined": true
    },
    "C22": {
      "available": true,
      "residual_se_undefined": true,
      "adjusted_r2_undefined": true
    },
    "C23": {
      "available": true,
      "residual_se_undefined": true,
      "adjusted_r2_undefined": true
    },
    "C24": {
      "available": true,
      "residual_se_undefined": true,
      "adjusted_r2_undefined": true
    },
    "C25": {
      "available": true,
      "residual_se_undefined": true,
      "adjusted_r2_undefined": true
    }
  },
  "checksums": {
    "frozen-fixtures.json": "977a61ee606ed9dc0c98fd00fbc406bffe31fe9db02e8e3bd817500a9e9a2c75",
    "executed-results.json": "39382428325ba96a186e427171ba7ef3633328f523abf5d6ab5d67711305329c",
    "analysis-results.json": "ed639bbd251755362c6f179d25c3a8777224d23c2da9e6ac64246f717639e085"
  },
  "adjusted_r2_audit": {
    "cases": 14,
    "maximum_abs_difference": 9.641995160333973e-17,
    "results": [
      {
        "id": "C04",
        "error": 1.5439479490564146e-31
      },
      {
        "id": "C05",
        "error": 6.289378029701139e-17
      },
      {
        "id": "C06",
        "error": 6.289378029701139e-17
      },
      {
        "id": "C07",
        "error": 6.28154501918425e-17
      },
      {
        "id": "C08",
        "error": 2.5077161298289524e-17
      },
      {
        "id": "C09",
        "error": 6.320088414563246e-17
      },
      {
        "id": "C10",
        "error": 9.641995160333973e-17
      },
      {
        "id": "C11",
        "error": 2.9175393664775685e-31
      },
      {
        "id": "C16",
        "error": 1.5777218104420236e-30
      },
      {
        "id": "C17",
        "error": 3.594550661977944e-30
      },
      {
        "id": "C18",
        "error": 2.0838990128202133e-30
      },
      {
        "id": "C19",
        "error": 8.844411045830865e-31
      },
      {
        "id": "C20",
        "error": 3.913468255167094e-30
      },
      {
        "id": "C26",
        "error": 1.5990662943533673e-17
      }
    ],
    "note": "Exact direct-prediction SSE and exact stored-response SST; all discrepancies below 1e-12."
  },
  "independent_literal_source_replay": {
    "cases": [
      "C03",
      "C06"
    ],
    "predictions_and_equations_match_recorded": true,
    "input_source": "Separately typed literal arrays, not frozen JSON generator."
  }
}
```

</details>

<details>
<summary>research/observed/packet-ledger.json</summary>

<!-- R001_FILE: research/observed/packet-ledger.json SHA256: b2d1ef163657fd5ca35a409e614990cfff0ece490bbfbb90c5f98b40f231c85e -->
```json
{
  "repository": "https://github.com/byronwall/explorEDA",
  "baseline": "63dfa75851ef57bb3782e6d7c1ef104784cd4064",
  "packet_sha256": "96a5c73689957c37fba380cf79cec32d60990fb02b645758e549c79130c98a1a",
  "files": [
    {
      "path": "AGENTS.md",
      "kind": "baseline",
      "declared_sha256": "802990c1bacd76b4b867239da78fd011fb32653f891d4a88560e9ee629979a33",
      "extracted_sha256": "802990c1bacd76b4b867239da78fd011fb32653f891d4a88560e9ee629979a33",
      "hash_verified": true,
      "bytes": 4033,
      "packet_start_line": 5,
      "local_path": "/workspace/scratch/12b30e74c9e0/research/snapshot/AGENTS.md"
    },
    {
      "path": "docs/agent-guide.md",
      "kind": "baseline",
      "declared_sha256": "0f7eb4898ca494692c5157b5164d368e4591dc1838513e8ec111a4ae03d7d83f",
      "extracted_sha256": "0f7eb4898ca494692c5157b5164d368e4591dc1838513e8ec111a4ae03d7d83f",
      "hash_verified": true,
      "bytes": 19985,
      "packet_start_line": 47,
      "local_path": "/workspace/scratch/12b30e74c9e0/research/snapshot/docs/agent-guide.md"
    },
    {
      "path": "CODING_STANDARDS.md",
      "kind": "baseline",
      "declared_sha256": "b4358fe75d063d53aea1edbc58d0dc6fd8df6e6165aa5792d8d2aa35eefe7ac5",
      "extracted_sha256": "b4358fe75d063d53aea1edbc58d0dc6fd8df6e6165aa5792d8d2aa35eefe7ac5",
      "hash_verified": true,
      "bytes": 2213,
      "packet_start_line": 200,
      "local_path": "/workspace/scratch/12b30e74c9e0/research/snapshot/CODING_STANDARDS.md"
    },
    {
      "path": "README.md",
      "kind": "baseline",
      "declared_sha256": "1f05b6c4992b07d1fc2b38d7bf9273db9e4a3a0d94513b7265e13b81cd7c5e28",
      "extracted_sha256": "1f05b6c4992b07d1fc2b38d7bf9273db9e4a3a0d94513b7265e13b81cd7c5e28",
      "hash_verified": true,
      "bytes": 10263,
      "packet_start_line": 231,
      "local_path": "/workspace/scratch/12b30e74c9e0/research/snapshot/README.md"
    },
    {
      "path": "package.json",
      "kind": "baseline",
      "declared_sha256": "f9b14daf225872f605d9435ddfb46fdede88b203c87a0e8507fe20743536f6e3",
      "extracted_sha256": "f9b14daf225872f605d9435ddfb46fdede88b203c87a0e8507fe20743536f6e3",
      "hash_verified": true,
      "bytes": 1258,
      "packet_start_line": 456,
      "local_path": "/workspace/scratch/12b30e74c9e0/research/snapshot/package.json"
    },
    {
      "path": "packages/explorEDA/package.json",
      "kind": "baseline",
      "declared_sha256": "17a71fd8852bcfbfb92cf76a9faf03766e934d0a5f0afcdcc9a5d0fd563b452a",
      "extracted_sha256": "17a71fd8852bcfbfb92cf76a9faf03766e934d0a5f0afcdcc9a5d0fd563b452a",
      "hash_verified": true,
      "bytes": 6082,
      "packet_start_line": 492,
      "local_path": "/workspace/scratch/12b30e74c9e0/research/snapshot/packages/explorEDA/package.json"
    },
    {
      "path": "docs/intent/research-ideas-100/README.md",
      "kind": "baseline",
      "declared_sha256": "63ec0d118382fcbe7551e5556f10cd2970e0120414766612fab1e54ca6477512",
      "extracted_sha256": "63ec0d118382fcbe7551e5556f10cd2970e0120414766612fab1e54ca6477512",
      "hash_verified": true,
      "bytes": 6362,
      "packet_start_line": 701,
      "local_path": "/workspace/scratch/12b30e74c9e0/research/snapshot/docs/intent/research-ideas-100/README.md"
    },
    {
      "path": "docs/intent/research-ideas-100/catalogue.md",
      "kind": "baseline",
      "declared_sha256": "b17ba05624aff799b2d998c0b779bfe73c7bcc0ef99ebd5bf93f011585b8f853",
      "extracted_sha256": "b17ba05624aff799b2d998c0b779bfe73c7bcc0ef99ebd5bf93f011585b8f853",
      "hash_verified": true,
      "bytes": 23594,
      "packet_start_line": 775,
      "local_path": "/workspace/scratch/12b30e74c9e0/research/snapshot/docs/intent/research-ideas-100/catalogue.md"
    },
    {
      "path": "docs/intent/research-ideas-100/ideas/R001-regression-conditioning.md",
      "kind": "baseline",
      "declared_sha256": "caed13776289cae6d2530134f8a5735e2c56c303b2b934e125d6f69ccfb25a9b",
      "extracted_sha256": "caed13776289cae6d2530134f8a5735e2c56c303b2b934e125d6f69ccfb25a9b",
      "hash_verified": true,
      "bytes": 3557,
      "packet_start_line": 884,
      "local_path": "/workspace/scratch/12b30e74c9e0/research/snapshot/docs/intent/research-ideas-100/ideas/R001-regression-conditioning.md"
    },
    {
      "path": "docs/intent/scientific-multivariate-analysis/intent-brief.md",
      "kind": "baseline",
      "declared_sha256": "e71f21742a2143011a2e675b79190b9ae873892f3ca22e09b07a3e0d5a3ff841",
      "extracted_sha256": "e71f21742a2143011a2e675b79190b9ae873892f3ca22e09b07a3e0d5a3ff841",
      "hash_verified": true,
      "bytes": 3595,
      "packet_start_line": 914,
      "local_path": "/workspace/scratch/12b30e74c9e0/research/snapshot/docs/intent/scientific-multivariate-analysis/intent-brief.md"
    },
    {
      "path": "docs/intent/current-analysis-trust/intent-brief.md",
      "kind": "baseline",
      "declared_sha256": "d6b2d620753c1ea532fffcb1cb43cc42711e03daa898e989a7f283f475186bd7",
      "extracted_sha256": "d6b2d620753c1ea532fffcb1cb43cc42711e03daa898e989a7f283f475186bd7",
      "hash_verified": true,
      "bytes": 3006,
      "packet_start_line": 968,
      "local_path": "/workspace/scratch/12b30e74c9e0/research/snapshot/docs/intent/current-analysis-trust/intent-brief.md"
    },
    {
      "path": "docs/ui-defaults.md",
      "kind": "baseline",
      "declared_sha256": "93ee25ebd3917a1e56d7db818ff4b6edcfe7e063f390ff9d5e9b83a0cc32f84a",
      "extracted_sha256": "93ee25ebd3917a1e56d7db818ff4b6edcfe7e063f390ff9d5e9b83a0cc32f84a",
      "hash_verified": true,
      "bytes": 19093,
      "packet_start_line": 1020,
      "local_path": "/workspace/scratch/12b30e74c9e0/research/snapshot/docs/ui-defaults.md"
    },
    {
      "path": "packages/explorEDA/src/components/charts/ScatterPlot/regression.ts",
      "kind": "baseline",
      "declared_sha256": "f29ed8bb097eb49f4be4906cbac257b040588f89a51fab41a5353b33b74fda96",
      "extracted_sha256": "f29ed8bb097eb49f4be4906cbac257b040588f89a51fab41a5353b33b74fda96",
      "hash_verified": true,
      "bytes": 15060,
      "packet_start_line": 1162,
      "local_path": "/workspace/scratch/12b30e74c9e0/research/snapshot/packages/explorEDA/src/components/charts/ScatterPlot/regression.ts"
    },
    {
      "path": "packages/explorEDA/src/components/charts/ScatterPlot/regression.test.ts",
      "kind": "baseline",
      "declared_sha256": "966a797b759602e759522b38cf56ca7ec1ce717322a3532d40659cb5ba1cf7ea",
      "extracted_sha256": "966a797b759602e759522b38cf56ca7ec1ce717322a3532d40659cb5ba1cf7ea",
      "hash_verified": true,
      "bytes": 11832,
      "packet_start_line": 1658,
      "local_path": "/workspace/scratch/12b30e74c9e0/research/snapshot/packages/explorEDA/src/components/charts/ScatterPlot/regression.test.ts"
    },
    {
      "path": "packages/explorEDA/src/components/charts/ScatterPlot/fitPlan.ts",
      "kind": "baseline",
      "declared_sha256": "172be90883434fd36451407c0a30f7241ef9fd27f2a2c2d1068529db59e63214",
      "extracted_sha256": "172be90883434fd36451407c0a30f7241ef9fd27f2a2c2d1068529db59e63214",
      "hash_verified": true,
      "bytes": 10164,
      "packet_start_line": 2012,
      "local_path": "/workspace/scratch/12b30e74c9e0/research/snapshot/packages/explorEDA/src/components/charts/ScatterPlot/fitPlan.ts"
    },
    {
      "path": "packages/explorEDA/src/components/charts/ScatterPlot/FitLabels.tsx",
      "kind": "baseline",
      "declared_sha256": "c0330e95267335076afa835e480dc413b4c65b6bfba823e1ca802adf757f9bb4",
      "extracted_sha256": "c0330e95267335076afa835e480dc413b4c65b6bfba823e1ca802adf757f9bb4",
      "hash_verified": true,
      "bytes": 7730,
      "packet_start_line": 2378,
      "local_path": "/workspace/scratch/12b30e74c9e0/research/snapshot/packages/explorEDA/src/components/charts/ScatterPlot/FitLabels.tsx"
    },
    {
      "path": "packages/explorEDA/src/components/charts/ScatterPlot/FitTraceBody.tsx",
      "kind": "baseline",
      "declared_sha256": "873c9069d754b4a93a27f1c56a96e30c5148b3027d151d7e698e282660795d27",
      "extracted_sha256": "873c9069d754b4a93a27f1c56a96e30c5148b3027d151d7e698e282660795d27",
      "hash_verified": true,
      "bytes": 8722,
      "packet_start_line": 2614,
      "local_path": "/workspace/scratch/12b30e74c9e0/research/snapshot/packages/explorEDA/src/components/charts/ScatterPlot/FitTraceBody.tsx"
    },
    {
      "path": "packages/explorEDA/src/components/charts/ScatterPlot/useScatterFits.ts",
      "kind": "baseline",
      "declared_sha256": "7d9a67e6e23d63ff59b2c0f1b47cd5e25e2d6383891478a6d33bc56ff099b725",
      "extracted_sha256": "7d9a67e6e23d63ff59b2c0f1b47cd5e25e2d6383891478a6d33bc56ff099b725",
      "hash_verified": true,
      "bytes": 2870,
      "packet_start_line": 2860,
      "local_path": "/workspace/scratch/12b30e74c9e0/research/snapshot/packages/explorEDA/src/components/charts/ScatterPlot/useScatterFits.ts"
    },
    {
      "path": "packages/explorEDA/src/components/charts/ScatterPlot/definition.ts",
      "kind": "baseline",
      "declared_sha256": "b19d1183b5d2a5e31c3fca27140f25a111e446d8158b2f1573b7f9f9a510172b",
      "extracted_sha256": "b19d1183b5d2a5e31c3fca27140f25a111e446d8158b2f1573b7f9f9a510172b",
      "hash_verified": true,
      "bytes": 3356,
      "packet_start_line": 2959,
      "local_path": "/workspace/scratch/12b30e74c9e0/research/snapshot/packages/explorEDA/src/components/charts/ScatterPlot/definition.ts"
    },
    {
      "path": "apps/demo/src/docs/pages/scatter.mdx",
      "kind": "baseline",
      "declared_sha256": "b0ea4d6b0d0866e18ad5955e3c18f2f0288d4098c12a0aee24947f6f3b06e646",
      "extracted_sha256": "b0ea4d6b0d0866e18ad5955e3c18f2f0288d4098c12a0aee24947f6f3b06e646",
      "hash_verified": true,
      "bytes": 6569,
      "packet_start_line": 3066,
      "local_path": "/workspace/scratch/12b30e74c9e0/research/snapshot/apps/demo/src/docs/pages/scatter.mdx"
    },
    {
      "path": "docs/intent/research-ideas-100/ideas.json [selected IDs]",
      "kind": "parsed baseline projection",
      "declared_sha256": "6115cc6688314c25fa9a251971859e8f4952ea67e50b0438faeb5b9e4c0e30c4",
      "extracted_sha256": "6115cc6688314c25fa9a251971859e8f4952ea67e50b0438faeb5b9e4c0e30c4",
      "hash_verified": true,
      "bytes": 21608,
      "packet_start_line": 3182,
      "local_path": "/workspace/scratch/12b30e74c9e0/research/snapshot/docs/intent/research-ideas-100/ideas.json [selected IDs]"
    },
    {
      "path": "docs/intent/research-ideas-100/review.json [selected IDs]",
      "kind": "parsed baseline projection",
      "declared_sha256": "0b8c6eaf4ed447c5349e0af4de9a46ff1e8d81630ae6e93085241be0acb36ed3",
      "extracted_sha256": "0b8c6eaf4ed447c5349e0af4de9a46ff1e8d81630ae6e93085241be0acb36ed3",
      "hash_verified": true,
      "bytes": 3228,
      "packet_start_line": 3630,
      "local_path": "/workspace/scratch/12b30e74c9e0/research/snapshot/docs/intent/research-ideas-100/review.json [selected IDs]"
    },
    {
      "path": "apps/demo/src/demos/dashboardSettings.ts [lines 1410-1530]",
      "kind": "baseline excerpt",
      "declared_sha256": "24668f06ac58afb60c3437cecb2c3f5beebac3f3235fdffe9cf942f5ed7160f1",
      "extracted_sha256": "24668f06ac58afb60c3437cecb2c3f5beebac3f3235fdffe9cf942f5ed7160f1",
      "hash_verified": true,
      "bytes": 3050,
      "packet_start_line": 3688,
      "local_path": "/workspace/scratch/12b30e74c9e0/research/snapshot/apps/demo/src/demos/dashboardSettings.ts [lines 1410-1530]"
    },
    {
      "path": "apps/demo/src/docs/live/examples.ts [lines 495-548]",
      "kind": "baseline excerpt",
      "declared_sha256": "1fa6ad85aa4694eac583ad5ac4479ebfe2d2e414d79ea296ddc23131241e2eed",
      "extracted_sha256": "1fa6ad85aa4694eac583ad5ac4479ebfe2d2e414d79ea296ddc23131241e2eed",
      "hash_verified": true,
      "bytes": 2044,
      "packet_start_line": 3812,
      "local_path": "/workspace/scratch/12b30e74c9e0/research/snapshot/apps/demo/src/docs/live/examples.ts [lines 495-548]"
    },
    {
      "path": "apps/demo/src/demos/examples.ts [lines 540-562]",
      "kind": "baseline excerpt",
      "declared_sha256": "6e4e479e9089aa968d140e157c283f5e2ac6ce1895919de18ea604c7911a4d28",
      "extracted_sha256": "6e4e479e9089aa968d140e157c283f5e2ac6ce1895919de18ea604c7911a4d28",
      "hash_verified": true,
      "bytes": 1124,
      "packet_start_line": 3869,
      "local_path": "/workspace/scratch/12b30e74c9e0/research/snapshot/apps/demo/src/demos/examples.ts [lines 540-562]"
    },
    {
      "path": "docs/research/regression-conditioning-2026-10-22/pro-prompt.md",
      "kind": "local addition",
      "declared_sha256": "23d2f690545c3659416e004a56e4d833239fca49790a0898ecb494b336c78094",
      "extracted_sha256": "23d2f690545c3659416e004a56e4d833239fca49790a0898ecb494b336c78094",
      "hash_verified": true,
      "bytes": 10087,
      "packet_start_line": 3895,
      "local_path": "/workspace/scratch/12b30e74c9e0/research/snapshot/docs/research/regression-conditioning-2026-10-22/pro-prompt.md"
    },
    {
      "path": "docs/research/regression-conditioning-2026-10-22/research-queue.md",
      "kind": "local addition",
      "declared_sha256": "ea32a4cb0e29c04f1e55b9bdc5b822a90724943f29640dbb460d09eacbdb4f84",
      "extracted_sha256": "ea32a4cb0e29c04f1e55b9bdc5b822a90724943f29640dbb460d09eacbdb4f84",
      "hash_verified": true,
      "bytes": 1535,
      "packet_start_line": 3993,
      "local_path": "/workspace/scratch/12b30e74c9e0/research/snapshot/docs/research/regression-conditioning-2026-10-22/research-queue.md"
    }
  ]
}
```

</details>

<details>
<summary>research/snapshot/packages/explorEDA/src/components/charts/ScatterPlot/regression.ts</summary>

<!-- R001_FILE: research/snapshot/packages/explorEDA/src/components/charts/ScatterPlot/regression.ts SHA256: f29ed8bb097eb49f4be4906cbac257b040588f89a51fab41a5353b33b74fda96 -->
```typescript
/**
 * Least-squares fits for scatter regression. Every function takes paired,
 * finite values and returns either a fit or the reason none exists, so a chart
 * never substitutes another method or invents a number.
 */

export type RegressionMethod = "linear" | "polynomial" | "loess";

export interface FitMeasures {
  /** Rows that entered the fit. */
  n: number;
  /** Share of Y variance the fit explains; undefined when Y is constant. */
  r2?: number;
  /** Residual standard error: √(SSE / (n − parameters)). */
  residualSe?: number;
}

export interface LinearFit extends FitMeasures {
  ok: true;
  method: "linear";
  slope: number;
  intercept: number;
  /** Pearson correlation of the fitted pairs. */
  r?: number;
  slopeSe?: number;
  /** Coefficients in ascending powers of x: [intercept, slope]. */
  coefficients: number[];
  xRange: [number, number];
  predict: (x: number) => number;
}

export interface PolynomialFit extends FitMeasures {
  ok: true;
  method: "polynomial";
  degree: number;
  /** Coefficients in ascending powers of x. */
  coefficients: number[];
  adjustedR2?: number;
  xRange: [number, number];
  predict: (x: number) => number;
}

/**
 * A local fit has no global equation or slope. It reports how closely the
 * smooth follows the points and how many neighbors shape each local line.
 */
export interface LoessFit extends FitMeasures {
  ok: true;
  method: "loess";
  span: number;
  /** Rows in each local fit. */
  neighbors: number;
  /** Root mean square of the residuals. */
  rmse: number;
  /** The curve interpolates exact local fits at evenly spaced X vertices. */
  interpolated: boolean;
  xRange: [number, number];
  predict: (x: number) => number;
}

export type RegressionFit = LinearFit | PolynomialFit | LoessFit;

export interface UnavailableFit {
  ok: false;
  method: RegressionMethod;
  n: number;
  reason: string;
}

export type FitOutcome = RegressionFit | UnavailableFit;

function extent(xs: ArrayLike<number>): [number, number] {
  let min = Infinity;
  let max = -Infinity;
  for (let i = 0; i < xs.length; i++) {
    const x = xs[i]!;
    if (x < min) min = x;
    if (x > max) max = x;
  }
  return [min, max];
}

function mean(values: ArrayLike<number>) {
  let sum = 0;
  for (let i = 0; i < values.length; i++) sum += values[i]!;
  return sum / values.length;
}

/** Ordinary least squares on centered sums, so large offsets keep precision. */
export function fitLinear(
  xs: ArrayLike<number>,
  ys: ArrayLike<number>,
  xLabel = "X"
): LinearFit | UnavailableFit {
  const n = xs.length;
  if (n < 2)
    return {
      ok: false,
      method: "linear",
      n,
      reason: `A line needs at least 2 rows with numeric X and Y. This group has ${n}.`,
    };
  const xRange = extent(xs);
  if (xRange[0] === xRange[1])
    return {
      ok: false,
      method: "linear",
      n,
      reason: `Every ${xLabel} value is ${xRange[0]}, so the slope is undefined.`,
    };
  const mx = mean(xs);
  const my = mean(ys);
  let sxx = 0;
  let sxy = 0;
  let syy = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i]! - mx;
    const dy = ys[i]! - my;
    sxx += dx * dx;
    sxy += dx * dy;
    syy += dy * dy;
  }
  const slope = sxy / sxx;
  const intercept = my - slope * mx;
  const sse = Math.max(0, syy - slope * sxy);
  const residualSe = n > 2 ? Math.sqrt(sse / (n - 2)) : undefined;
  return {
    ok: true,
    method: "linear",
    n,
    slope,
    intercept,
    coefficients: [intercept, slope],
    r2: syy > 0 ? Math.min(1, Math.max(0, 1 - sse / syy)) : undefined,
    r: syy > 0 ? sxy / Math.sqrt(sxx * syy) : undefined,
    residualSe,
    slopeSe: residualSe === undefined ? undefined : residualSe / Math.sqrt(sxx),
    xRange,
    predict: (x) => intercept + slope * x,
  };
}

function distinctCount(xs: ArrayLike<number>, limit: number) {
  const seen = new Set<number>();
  for (let i = 0; i < xs.length && seen.size < limit; i++) seen.add(xs[i]!);
  return seen.size;
}

function binomial(n: number, k: number) {
  let value = 1;
  for (let i = 1; i <= k; i++) value = (value * (n - k + i)) / i;
  return value;
}

/** Least squares by Householder QR; returns undefined for a rank-deficient design. */
function solveLeastSquares(design: number[][], ys: ArrayLike<number>) {
  const rows = design.length;
  const cols = design[0]!.length;
  const a = design.map((row) => row.slice());
  const b = Array.from(ys);
  for (let k = 0; k < cols; k++) {
    let norm = 0;
    for (let i = k; i < rows; i++) norm += a[i]![k]! ** 2;
    norm = Math.sqrt(norm);
    if (norm === 0) return undefined;
    const alpha = a[k]![k]! > 0 ? -norm : norm;
    const v = new Array<number>(rows).fill(0);
    for (let i = k; i < rows; i++) v[i] = a[i]![k]!;
    v[k]! -= alpha;
    let vv = 0;
    for (let i = k; i < rows; i++) vv += v[i]! ** 2;
    if (vv === 0) continue;
    for (let j = k; j < cols; j++) {
      let dot = 0;
      for (let i = k; i < rows; i++) dot += v[i]! * a[i]![j]!;
      const factor = (2 * dot) / vv;
      for (let i = k; i < rows; i++) a[i]![j]! -= factor * v[i]!;
    }
    let dot = 0;
    for (let i = k; i < rows; i++) dot += v[i]! * b[i]!;
    const factor = (2 * dot) / vv;
    for (let i = k; i < rows; i++) b[i]! -= factor * v[i]!;
  }
  // A tiny pivot relative to the largest means the columns are nearly dependent.
  const largest = Math.max(
    ...a.slice(0, cols).map((row, i) => Math.abs(row[i]!))
  );
  const solution = new Array<number>(cols).fill(0);
  for (let k = cols - 1; k >= 0; k--) {
    const pivot = a[k]![k]!;
    if (Math.abs(pivot) <= largest * 1e-10) return undefined;
    let sum = b[k]!;
    for (let j = k + 1; j < cols; j++) sum -= a[k]![j]! * solution[j]!;
    solution[k] = sum / pivot;
  }
  return solution;
}

/**
 * Polynomial least squares on standardized X, so higher powers stay well
 * conditioned. The reported equation converts back to powers of X.
 */
export function fitPolynomial(
  xs: ArrayLike<number>,
  ys: ArrayLike<number>,
  degree: number,
  xLabel = "X"
): PolynomialFit | UnavailableFit {
  const n = xs.length;
  const unavailable = (reason: string): UnavailableFit => ({
    ok: false,
    method: "polynomial",
    n,
    reason,
  });
  const terms = degree + 1;
  if (n < terms)
    return unavailable(
      `A degree ${degree} polynomial needs at least ${terms} rows with numeric X and Y. This group has ${n}.`
    );
  const distinct = distinctCount(xs, terms);
  if (distinct < terms)
    return unavailable(
      `A degree ${degree} polynomial needs at least ${terms} distinct ${xLabel} values. This group has ${distinct}.`
    );
  const mx = mean(xs);
  let ss = 0;
  for (let i = 0; i < n; i++) ss += (xs[i]! - mx) ** 2;
  const sx = Math.sqrt(ss / n);
  const design: number[][] = [];
  for (let i = 0; i < n; i++) {
    const t = (xs[i]! - mx) / sx;
    const row = [1];
    for (let k = 1; k < terms; k++) row.push(row[k - 1]! * t);
    design.push(row);
  }
  const standardized = solveLeastSquares(design, ys);
  if (!standardized)
    return unavailable(
      `The ${xLabel} values cannot separate ${terms} polynomial terms. Choose a lower degree.`
    );
  const predict = (x: number) => {
    const t = (x - mx) / sx;
    let value = 0;
    for (let k = terms - 1; k >= 0; k--) value = value * t + standardized[k]!;
    return value;
  };
  // y = Σ b_k ((x − m) / s)^k, expanded into powers of x.
  const coefficients = new Array<number>(terms).fill(0);
  for (let k = 0; k < terms; k++) {
    const scale = standardized[k]! / sx ** k;
    for (let j = 0; j <= k; j++)
      coefficients[j]! += scale * binomial(k, j) * (-mx) ** (k - j);
  }
  const my = mean(ys);
  let sse = 0;
  let sst = 0;
  for (let i = 0; i < n; i++) {
    sse += (ys[i]! - predict(xs[i]!)) ** 2;
    sst += (ys[i]! - my) ** 2;
  }
  const r2 = sst > 0 ? Math.min(1, Math.max(0, 1 - sse / sst)) : undefined;
  return {
    ok: true,
    method: "polynomial",
    degree,
    n,
    coefficients,
    r2,
    adjustedR2:
      r2 !== undefined && n > terms
        ? 1 - ((1 - r2) * (n - 1)) / (n - terms)
        : undefined,
    residualSe: n > terms ? Math.sqrt(sse / (n - terms)) : undefined,
    xRange: extent(xs),
    predict,
  };
}

/** Smaller groups give unstable local lines, so LOESS says so instead. */
export const LOESS_MIN_ROWS = 8;
export const LOESS_MIN_NEIGHBORS = 5;
/** Groups up to this size get an exact local fit at every row. */
export const LOESS_EXACT_ROWS = 500;
/** Intervals between exact local fits for larger groups. */
export const LOESS_VERTICES = 200;

/**
 * Locally weighted linear regression (LOESS, degree 1, no robustness
 * iterations). Each estimate fits a line to the nearest span × n rows,
 * weighted by the tricube of their distance.
 */
export function fitLoess(
  xs: ArrayLike<number>,
  ys: ArrayLike<number>,
  span: number,
  xLabel = "X"
): LoessFit | UnavailableFit {
  const n = xs.length;
  const unavailable = (reason: string): UnavailableFit => ({
    ok: false,
    method: "loess",
    n,
    reason,
  });
  if (n < LOESS_MIN_ROWS)
    return unavailable(
      `LOESS needs at least ${LOESS_MIN_ROWS} rows with numeric X and Y. This group has ${n}.`
    );
  const distinct = distinctCount(xs, 3);
  if (distinct < 3)
    return unavailable(
      `LOESS needs at least 3 distinct ${xLabel} values. This group has ${distinct}.`
    );
  const order = Array.from({ length: n }, (_, i) => i).sort(
    (a, b) => xs[a]! - xs[b]!
  );
  const sx = Float64Array.from(order, (i) => xs[i]!);
  const sy = Float64Array.from(order, (i) => ys[i]!);
  // Fewer than 5 neighbors leaves a local line on 3 or 4 weighted rows, which swings wildly.
  const k = Math.min(n, Math.max(LOESS_MIN_NEIGHBORS, Math.ceil(span * n)));
  const lowerBound = (x: number) => {
    let lo = 0;
    let hi = n;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (sx[mid]! < x) lo = mid + 1;
      else hi = mid;
    }
    return lo;
  };
  const local = (x0: number, start: number) => {
    let lo = Math.max(0, Math.min(n - k, start));
    // Slide to the k nearest rows.
    while (lo > 0 && x0 - sx[lo - 1]! < sx[lo + k - 1]! - x0) lo--;
    while (lo + k < n && sx[lo + k]! - x0 < x0 - sx[lo]!) lo++;
    const h = Math.max(x0 - sx[lo]!, sx[lo + k - 1]! - x0);
    let sw = 0;
    let swx = 0;
    let swy = 0;
    let swxx = 0;
    let swxy = 0;
    for (let i = lo; i < lo + k; i++) {
      const d = h > 0 ? Math.abs(sx[i]! - x0) / h : 0;
      const t = d >= 1 ? 0 : 1 - d * d * d;
      const w = t * t * t;
      const dx = sx[i]! - x0;
      sw += w;
      swx += w * dx;
      swy += w * sy[i]!;
      swxx += w * dx * dx;
      swxy += w * dx * sy[i]!;
    }
    if (sw === 0) {
      // Every neighbor sits exactly at the bandwidth edge; average them.
      let sum = 0;
      for (let i = lo; i < lo + k; i++) sum += sy[i]!;
      return { value: sum / k, lo };
    }
    const varX = swxx - (swx * swx) / sw;
    // Centered at x0, the local line's intercept is its estimate.
    const value =
      varX > 1e-12 * swxx
        ? (swy - ((swxy - (swx * swy) / sw) / varX) * swx) / sw
        : swy / sw;
    return { value, lo };
  };
  // Large groups fit exactly at evenly spaced vertices and interpolate between
  // them, as R's loess does by default, so cost grows with rows × span only.
  const interpolated = n > LOESS_EXACT_ROWS;
  let predict = (x: number) => local(x, lowerBound(x) - (k >> 1)).value;
  if (interpolated) {
    const x0 = sx[0]!;
    const step = (sx[n - 1]! - x0) / LOESS_VERTICES;
    const values: number[] = [];
    let start = 0;
    for (let i = 0; i <= LOESS_VERTICES; i++) {
      const result = local(x0 + step * i, start);
      start = result.lo;
      values.push(result.value);
    }
    predict = (x) => {
      const position = Math.max(0, Math.min(LOESS_VERTICES, (x - x0) / step));
      const i = Math.min(LOESS_VERTICES - 1, Math.floor(position));
      const f = position - i;
      return values[i]! * (1 - f) + values[i + 1]! * f;
    };
  }
  let sse = 0;
  let sst = 0;
  let lo = 0;
  const my = mean(sy);
  for (let i = 0; i < n; i++) {
    let value: number;
    if (interpolated) value = predict(sx[i]!);
    else {
      const result = local(sx[i]!, lo);
      lo = result.lo;
      value = result.value;
    }
    sse += (sy[i]! - value) ** 2;
    sst += (sy[i]! - my) ** 2;
  }
  return {
    ok: true,
    method: "loess",
    span,
    neighbors: k,
    interpolated,
    n,
    r2: sst > 0 ? Math.min(1, Math.max(0, 1 - sse / sst)) : undefined,
    rmse: Math.sqrt(sse / n),
    xRange: [sx[0]!, sx[n - 1]!],
    predict,
  };
}

export const DEFAULT_DEGREE = 2;
export const DEFAULT_SPAN = 0.75;

/** Fits one group with the chosen method. */
export function fitRegression(
  method: RegressionMethod,
  xs: ArrayLike<number>,
  ys: ArrayLike<number>,
  options: { xLabel?: string; degree?: number; span?: number } = {}
): FitOutcome {
  switch (method) {
    case "linear":
      return fitLinear(xs, ys, options.xLabel);
    case "polynomial":
      return fitPolynomial(
        xs,
        ys,
        options.degree ?? DEFAULT_DEGREE,
        options.xLabel
      );
    case "loess":
      return fitLoess(xs, ys, options.span ?? DEFAULT_SPAN, options.xLabel);
  }
}

const MINUS = "−";

/** A coefficient with about three significant digits and no exponent noise. */
export function formatCoefficient(value: number) {
  const abs = Math.abs(value);
  if (abs === 0) return "0";
  if (abs >= 1000)
    return Math.round(value).toLocaleString("en-US").replace("-", MINUS);
  if (abs < 0.001) {
    const [mantissa, exponent] = value.toExponential(2).split("e");
    return `${Number(mantissa)}e${exponent}`.replace(/^-/, MINUS);
  }
  return String(Number(value.toPrecision(3))).replace("-", MINUS);
}

const SUPERSCRIPT = "⁰¹²³⁴⁵⁶⁷⁸⁹";
const power = (exponent: number) =>
  exponent === 1
    ? "x"
    : `x${String(exponent)
        .split("")
        .map((digit) => SUPERSCRIPT[Number(digit)])
        .join("")}`;

/** "y = 2.1x² − 0.5x + 3", highest power first, from ascending coefficients. */
export function formatPolynomial(coefficients: number[]) {
  const terms: string[] = [];
  for (let i = coefficients.length - 1; i >= 0; i--) {
    const value = coefficients[i]!;
    if (value === 0 && coefficients.length > 1) continue;
    const magnitude = formatCoefficient(Math.abs(value));
    const body =
      i === 0 ? magnitude : `${magnitude === "1" ? "" : magnitude}${power(i)}`;
    terms.push(
      terms.length === 0
        ? `${value < 0 ? MINUS : ""}${body}`
        : `${value < 0 ? MINUS : "+"} ${body}`
    );
  }
  return `y = ${terms.join(" ") || "0"}`;
}

/** The equation a fit can honestly state; LOESS has none. */
export function fitEquation(fit: RegressionFit) {
  return fit.method === "loess"
    ? undefined
    : formatPolynomial(fit.coefficients);
}

export const formatR2 = (value: number | undefined) =>
  value === undefined ? "undefined" : value.toFixed(value >= 0.995 ? 3 : 2);
```

</details>

<details>
<summary>research/snapshot/packages/explorEDA/src/components/charts/ScatterPlot/FitTraceBody.tsx</summary>

<!-- R001_FILE: research/snapshot/packages/explorEDA/src/components/charts/ScatterPlot/FitTraceBody.tsx SHA256: 873c9069d754b4a93a27f1c56a96e30c5148b3027d151d7e698e282660795d27 -->
```tsx
import { TriangleAlert } from "lucide-react";
import { TraceReadout, TraceSection, TraceSwatch } from "../ChartTraceDetails";
import { useChartTrace, useChartTraceApi } from "../trace/ChartTraceScope";
import { PairedSummaryBody } from "./PairedSummaryBody";
import type { PairedSummaryPlan } from "./pairedSummary";
import {
  METHOD_NAMES,
  fitSummary,
  type ScatterFit,
  type ScatterFitPlan,
} from "./fitPlan";
import {
  LOESS_EXACT_ROWS,
  LOESS_VERTICES,
  fitEquation,
  formatR2,
  type RegressionFit,
} from "./regression";

export type FitTrace =
  | {
      kind: "fit" | "fit-results";
      id: string;
      revision: string;
      plan: ScatterFitPlan;
      fit?: ScatterFit;
      xLabel: string;
      yLabel: string;
    }
  | {
      kind: "paired-summary";
      id: string;
      revision: string;
      summary: PairedSummaryPlan;
      xLabel: string;
      yLabel: string;
    };

/** Enough digits to reproduce a coefficient, without float noise. */
const precise = (value: number | undefined) =>
  value === undefined ? "undefined" : String(Number(value.toPrecision(6)));

const METHOD_HELP: Record<ScatterFitPlan["method"], string> = {
  linear:
    "Ordinary least squares: the straight line that minimizes the squared vertical distances to the points. Slope is the change in Y for one unit of X. Offset is the fitted Y at X = 0, which may lie outside the data. R² is the share of Y variance the line explains; it does not show that the relationship is linear or causal.",
  polynomial:
    "Least squares on powers of X up to the chosen degree. Coefficients are listed from the constant term up. Adding terms always raises R², so compare adjusted R², which charges for each term. The curve is drawn only across the observed X range; outside it a polynomial can turn sharply.",
  loess:
    "Locally weighted regression: each point on the curve comes from a straight line fitted to the nearest rows, weighted by distance with a tricube kernel. Span is the share of rows in each local fit; a larger span gives a smoother curve. LOESS has no single equation or slope. Pseudo R² is 1 − residual sum of squares / total sum of squares.",
};

const POWER_NAMES = ["Constant", "x", "x²", "x³", "x⁴", "x⁵", "x⁶"];

function Coefficients({ fit }: { fit: RegressionFit }) {
  if (fit.method === "loess")
    return (
      <>
        <TraceReadout label="Span">
          {fit.span} · {fit.neighbors.toLocaleString()} rows per local fit
        </TraceReadout>
        <TraceReadout label="Pseudo R²">{formatR2(fit.r2)}</TraceReadout>
        <TraceReadout label="Residual RMS">{precise(fit.rmse)}</TraceReadout>
        {fit.interpolated && (
          <p className="text-muted-foreground">
            With more than {LOESS_EXACT_ROWS} rows, local fits run exactly at{" "}
            {LOESS_VERTICES + 1} evenly spaced X values and the curve and
            residuals interpolate between them.
          </p>
        )}
      </>
    );
  if (fit.method === "polynomial")
    return (
      <>
        <TraceReadout label="Degree">{fit.degree}</TraceReadout>
        {fit.coefficients.map((value, power) => (
          <TraceReadout key={power} label={POWER_NAMES[power]!}>
            {precise(value)}
          </TraceReadout>
        ))}
        <TraceReadout label="R²">{formatR2(fit.r2)}</TraceReadout>
        <TraceReadout label="Adjusted R²">
          {fit.adjustedR2 === undefined ? "undefined" : precise(fit.adjustedR2)}
        </TraceReadout>
        <TraceReadout label="Residual SE">
          {precise(fit.residualSe)}
        </TraceReadout>
      </>
    );
  return (
    <>
      <TraceReadout label="Slope">
        {precise(fit.slope)}
        {fit.slopeSe !== undefined && ` ± ${precise(fit.slopeSe)} SE`}
      </TraceReadout>
      <TraceReadout label="Offset">{precise(fit.intercept)}</TraceReadout>
      <TraceReadout label="R²">{formatR2(fit.r2)}</TraceReadout>
      {fit.r !== undefined && (
        <TraceReadout label="Pearson r">{precise(fit.r)}</TraceReadout>
      )}
      <TraceReadout label="Residual SE">{precise(fit.residualSe)}</TraceReadout>
    </>
  );
}

type FitResultTrace = Exclude<FitTrace, { kind: "paired-summary" }>;

function FitDetails({
  trace,
  fit,
}: {
  trace: FitResultTrace;
  fit: ScatterFit;
}) {
  const { plan } = trace;
  const outcome = fit.outcome;
  const used = outcome.ok ? outcome.n : fit.sourceIds.length;
  const scope = [
    fit.kind === "overall" ? "all groups" : `${fit.label}`,
    plan.facet?.label,
  ]
    .filter(Boolean)
    .join(" in ");
  return (
    <div className="space-y-3 text-xs" aria-label="Fit trace">
      <div className="eda-trace-subject">
        <span className="flex items-center gap-1.5 font-semibold">
          <TraceSwatch color={fit.color} />
          {fit.label}
        </span>
        <span className="text-muted-foreground">
          {METHOD_NAMES[plan.method]} fit
        </span>
      </div>
      {outcome.ok ? (
        <TraceSection
          heading={outcome.method === "loess" ? "Local fit" : "Equation"}
        >
          {outcome.method === "loess" ? (
            <p className="text-muted-foreground">
              No single equation: each X gets its own weighted local line.
              {` y is ${trace.yLabel}; x is ${trace.xLabel}.`}
            </p>
          ) : (
            <>
              <p className="font-mono text-sm">{fitEquation(outcome)}</p>
              <p className="text-muted-foreground">
                y is {trace.yLabel}; x is {trace.xLabel}.
              </p>
            </>
          )}
          <Coefficients fit={outcome} />
        </TraceSection>
      ) : (
        <TraceSection heading="Fit unavailable">
          <p className="flex gap-1.5">
            <TriangleAlert
              className="mt-0.5 size-3.5 shrink-0 text-warning"
              aria-hidden="true"
            />
            {outcome.reason}
          </p>
        </TraceSection>
      )}
      <TraceSection heading="Rows in the fit">
        <TraceReadout label="Used">
          {used.toLocaleString()} of {fit.eligible.toLocaleString()}
        </TraceReadout>
        {fit.missingX > 0 && (
          <TraceReadout label={`No numeric ${trace.xLabel}`}>
            {fit.missingX.toLocaleString()}
          </TraceReadout>
        )}
        {fit.missingY > 0 && (
          <TraceReadout label={`No numeric ${trace.yLabel}`}>
            {fit.missingY.toLocaleString()}
          </TraceReadout>
        )}
        <p className="text-muted-foreground">
          Rows from {scope || "this chart"} that pass the other filters.
          Selecting points on this chart dims them but does not refit.
        </p>
      </TraceSection>
      <TraceSection heading="Method" muted>
        <p>{METHOD_HELP[plan.method]}</p>
      </TraceSection>
    </div>
  );
}

function FitResults({ trace }: { trace: FitResultTrace }) {
  const state = useChartTrace();
  const api = useChartTraceApi();
  const { plan } = trace;
  return (
    <div className="space-y-3 text-xs" aria-label="Fit results">
      <TraceSection
        heading={`${METHOD_NAMES[plan.method]} fits${plan.facet ? ` · ${plan.facet.label}` : ""}`}
      >
        {plan.notice && <p>{plan.notice}</p>}
        {plan.groupNote && (
          <p className="text-muted-foreground">{plan.groupNote}</p>
        )}
        <ul className="space-y-1">
          {plan.fits.map((fit) => (
            <li key={fit.id}>
              <button
                type="button"
                className="flex w-full items-start gap-1.5 rounded px-1 py-0.5 text-left hover:bg-muted"
                onClick={() =>
                  state?.selection &&
                  api?.inspect(state.selection.owner, "fit", fit.id)
                }
              >
                <TraceSwatch color={fit.color} />
                <span className="min-w-0">
                  <span className="font-medium">{fit.label}</span>
                  <span className="text-muted-foreground">
                    {" "}
                    · n {fit.outcome.n.toLocaleString()}
                  </span>
                  <span className="block font-mono">
                    {fit.outcome.ok ? fitSummary(fit) : fit.outcome.reason}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </TraceSection>
    </div>
  );
}

export function FitTraceBody({ trace }: { trace: FitTrace }) {
  if (trace.kind === "paired-summary")
    return <PairedSummaryBody trace={trace} />;
  return trace.kind === "fit" && trace.fit ? (
    <FitDetails key={trace.id} trace={trace} fit={trace.fit} />
  ) : (
    <FitResults trace={trace} />
  );
}
```

</details>

<details>
<summary>research/snapshot/packages/explorEDA/package.json</summary>

<!-- R001_FILE: research/snapshot/packages/explorEDA/package.json SHA256: 17a71fd8852bcfbfb92cf76a9faf03766e934d0a5f0afcdcc9a5d0fd563b452a -->
```json
{
  "name": "exploreda",
  "private": false,
  "version": "0.2.0",
  "type": "module",
  "repository": {
    "type": "git",
    "url": "https://github.com/byronwall/explorEDA.git"
  },
  "publishConfig": {
    "access": "public"
  },
  "scripts": {
    "dev": "tsup --watch",
    "build": "tsup && node scripts/build-types.mjs && node scripts/copy-examples.mjs",
    "check-types": "tsc --noEmit",
    "test": "vitest run",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage",
    "verify:lean": "node scripts/verify-lean-bundle.mjs",
    "prettier": "prettier --write ./src",
    "eslint": "eslint . --max-warnings=0"
  },
  "files": [
    "dist/**",
    "!dist/docs-kit.*",
    "README.md"
  ],
  "exports": {
    ".": {
      "types": "./dist/ExplorEda.d.ts",
      "require": "./dist/ExplorEda.cjs",
      "import": "./dist/ExplorEda.js"
    },
    "./core": {
      "types": "./dist/core.d.ts",
      "require": "./dist/core.cjs",
      "import": "./dist/core.js"
    },
    "./charts/*": {
      "types": "./dist/charts/*.d.ts",
      "require": "./dist/charts/*.cjs",
      "import": "./dist/charts/*.js"
    },
    "./dist/ExplorEda.css": "./dist/ExplorEda.css",
    "./calculations": {
      "types": "./dist/calculations.d.ts",
      "require": "./dist/calculations.cjs",
      "import": "./dist/calculations.js"
    },
    "./analysis": {
      "types": "./dist/analysis.d.ts",
      "require": "./dist/analysis.cjs",
      "import": "./dist/analysis.js"
    },
    "./readers": {
      "types": "./dist/readers.d.ts",
      "require": "./dist/readers.cjs",
      "import": "./dist/readers.js"
    }
  },
  "bin": {
    "exploreda": "./dist/cli/exploreda.js",
    "exploreda-dsl": "./dist/cli/exploreda-dsl.js"
  },
  "typesVersions": {
    "*": {
      "analysis": [
        "./dist/analysis.d.ts"
      ],
      "readers": [
        "./dist/readers.d.ts"
      ]
    }
  },
  "main": "./dist/ExplorEda.cjs",
  "module": "./dist/ExplorEda.js",
  "types": "./dist/ExplorEda.d.ts",
  "dependencies": {
    "@dnd-kit/core": "^6.3.1",
    "@dnd-kit/sortable": "^10.0.0",
    "@dnd-kit/utilities": "^3.2.2",
    "@radix-ui/react-alert-dialog": "^1.1.6",
    "@radix-ui/react-dialog": "^1.1.6",
    "@radix-ui/react-dropdown-menu": "^2.1.6",
    "@radix-ui/react-label": "^2.1.2",
    "@radix-ui/react-popover": "^1.1.6",
    "@radix-ui/react-progress": "^1.1.2",
    "@radix-ui/react-scroll-area": "^1.2.3",
    "@radix-ui/react-select": "^2.1.6",
    "@radix-ui/react-slider": "^1.2.3",
    "@radix-ui/react-slot": "^1.1.2",
    "@radix-ui/react-switch": "^1.1.3",
    "@radix-ui/react-tabs": "^1.1.3",
    "@radix-ui/react-toggle": "^1.1.2",
    "@radix-ui/react-toggle-group": "^1.1.2",
    "@radix-ui/react-tooltip": "^1.1.8",
    "@tailwindcss/postcss": "^4.0.14",
    "@tiptap/extension-color": "^2.11.5",
    "@tiptap/extension-list-item": "^2.11.5",
    "@tiptap/extension-placeholder": "^2.11.5",
    "@tiptap/extension-text-style": "^2.11.5",
    "@tiptap/react": "^2.11.5",
    "@tiptap/starter-kit": "^2.11.5",
    "@uwdata/flechette": "^2.7.0",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "cmdk": "1.0.0",
    "crossfilter2": "^1.5.4",
    "d3-array": "^3.2.4",
    "d3-contour": "^4.0.2",
    "d3-geo": "^3.1.1",
    "d3-scale": "^4.0.2",
    "d3-scale-chromatic": "^3.1.0",
    "d3-time-format": "^4.1.0",
    "fzstd": "^0.1.1",
    "hyparquet": "^1.31.3",
    "hyparquet-compressors": "^1.1.2",
    "lucide-react": "^0.475.0",
    "markdown-it": "^14.1.0",
    "natsort": "^2.0.3",
    "next-themes": "^0.4.4",
    "ohm-js": "^17.1.0",
    "papaparse": "^5.5.2",
    "react-colorful": "^5.6.1",
    "react-fast-compare": "^3.2.2",
    "react-grid-layout": "^1.5.0",
    "react-resizable": "^3.0.5",
    "read-excel-file": "^9.3.12",
    "sonner": "^1.7.4",
    "tailwind-merge": "^3.0.1",
    "tailwindcss-animate": "^1.0.7",
    "three": "^0.174.0",
    "topojson-client": "^3.1.0",
    "us-atlas": "^3.0.1",
    "use-custom-compare": "^1.4.0",
    "world-atlas": "^2.0.2",
    "zustand": "^5.0.3"
  },
  "peerDependencies": {
    "maplibre-gl": ">=4.0.0",
    "react": "^18.0.0 || ^19.0.0",
    "react-dom": "^18.0.0 || ^19.0.0"
  },
  "peerDependenciesMeta": {
    "maplibre-gl": {
      "optional": true
    }
  },
  "devDependencies": {
    "@duckdb/node-api": "1.5.6-r.1",
    "@eslint/js": "^9.19.0",
    "@repo/test-config": "workspace:*",
    "@repo/typescript-config": "workspace:*",
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.2.0",
    "@types/d3-array": "^3.2.1",
    "@types/d3-axis": "^3.0.6",
    "@types/d3-contour": "^3.0.6",
    "@types/d3-geo": "^3.1.1",
    "@types/d3-scale": "^4.0.9",
    "@types/d3-scale-chromatic": "^3.1.0",
    "@types/d3-selection": "^3.0.11",
    "@types/d3-shape": "^3.1.7",
    "@types/d3-time-format": "^4.0.3",
    "@types/geojson": "^7946.0.16",
    "@types/jest": "^29.5.14",
    "@types/markdown-it": "^14.1.2",
    "@types/mssql": "^9.1.11",
    "@types/natsort": "^2.0.0",
    "@types/node": "^22.13.4",
    "@types/papaparse": "^5.3.15",
    "@types/pg": "^8.11.10",
    "@types/pg-cursor": "^2.7.2",
    "@types/react": "^19.0.8",
    "@types/react-dom": "^19.0.3",
    "@types/react-grid-layout": "^1.3.5",
    "@types/three": "^0.174.0",
    "@types/topojson-client": "^3.1.5",
    "@types/topojson-specification": "^1.0.5",
    "@vitejs/plugin-react": "^4.3.4",
    "@vitest/coverage-v8": "^3.0.7",
    "d3-shape": "^3.2.0",
    "eslint": "^9.19.0",
    "eslint-plugin-react-hooks": "^5.0.0",
    "eslint-plugin-react-refresh": "^0.4.18",
    "globals": "^15.14.0",
    "jsdom": "^26.0.0",
    "mssql": "^11.0.2",
    "mysql2": "^3.24.5",
    "pg": "^8.13.1",
    "pg-cursor": "^2.12.1",
    "postcss": "^8.5.3",
    "prettier": "^3.5.3",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "rollup": "^4.35.0",
    "rollup-plugin-dts": "^6.5.1",
    "tailwindcss": "^4.0.14",
    "tsup": "^8.4.0",
    "typescript": "~5.4.5",
    "typescript-eslint": "^8.22.0",
    "vite": "^6.1.0",
    "vitest": "^3.0.7"
  }
}
```

</details>

## 11. Access, execution, and handoff record

- **Access status:** GO via the supplied selected packet; all 27 section hashes verified. Exact-ref GitHub access failed, and the authorized packet supplied the needed evidence. NIST raw numerical tokens were retrieved through the official web source and cross-checked; original HTTP bytes remain unavailable.
- **Exact baseline:** `63dfa75851ef57bb3782e6d7c1ef104784cd4064`.
- **Files read:** the attached prompt; all 27 packet sections (20 complete baseline files, two selected JSON projections, three excerpts, two local additions); current primary NIST/NumPy references; frozen fixture/source-run/analysis/audit records. All exact paths and hashes are in the source report and embedded packet ledger.
- **Checks executed:** source hashes; 40/40 NIST row tokens; frozen exact rational references; 26 isolated-source cases with 22 available/four unavailable outcomes; actual equation and trace formatting; five parser controls; exact and binary64 reconstruction; stable-basis candidate evaluation and instrumentation identity; direct residual metrics; independent C03/C06 literal replay/closed forms; 13/13 certified statistics; 14 adjusted-R² cases; minimum-sample metric availability. The delivered replay and archive integrity are validated in the final manifest.
- **Checks unrun:** all checkout commands in §8, final UI/API implementation, browser widths and keyboard/pointer behavior, filter/refit workflows, actual clipboard/calculator reuse, chart/image export, restoration, cross-engine results and continuous-interval proof. No new production residual loop was executed.
- **Artifact links:** [R001-report.md](R001-report.md), [R001-sources.md](R001-sources.md), [R001-decisions.md](R001-decisions.md), [R001-proof-and-docs.md](R001-proof-and-docs.md), [R001-manifest.json](R001-manifest.json), [R001-research.zip](R001-research.zip). Final downloadable links and manifest/ZIP hashes are also supplied outside the archive.
- **Unresolved blockers:** none to this research delivery. A runnable checkout, independent adoption review and focused implementation/product gates remain necessary before a shipped-repair claim. The final reuse surface, public API compatibility and any automatic notice policy remain review choices. No customer demand, solver certification or universal tolerance is invented.
