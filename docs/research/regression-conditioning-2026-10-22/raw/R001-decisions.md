# R001 decisions: predictions and reusable regression equations

**Research date:** 2026-10-22. **Repository:** `https://github.com/byronwall/explorEDA`. **Exact implementation baseline:** `63dfa75851ef57bb3782e6d7c1ef104784cd4064`.

**Access status: GO through the supplied authorized source packet.** Its header identifies the repository and baseline; all 27 supplied sections reproduced their declared SHA256 hashes after extraction. The packet is selected source, not a runnable repository checkout. The complete regression module and the trace formatter were executed in isolation. No application changes, commits, PRs, browser checks, or repository-suite passes are claimed.

## Decision and evidence boundary

The smallest justified proposal is to retain the standardized polynomial solver, repair linear evaluation and its associated residual metrics, and provide a stable representation for reusable equations in the existing trace. A representation failure must not suppress an otherwise valid curve. A new permanent precision control, solver rewrite, or general numerical API is not justified.

The classifications below are recommendations for Codex/Byron review. **FIX does not mean implemented or shipped.** No named customer demand is established. Confidence is high in the bounded reproduced discrepancies and lower in unimplemented UI choices.

| Stable recommendation | Classification and disposition proposed for review |
| --- | --- |
| RC01 | **KEEP** standardized polynomial QR and current valid-fit availability. |
| RC02 | **FIX** linear prediction and metrics so they evaluate the same centered fit. |
| RC03 | **FIX** reusable equations by preserving the stable basis, origin, scale, order and units with sufficient precision. |
| RC04 | **FIX** compact equation and trace honesty; use a sound representation or a representation-specific fallback. |
| RC05 | **FIX** proof coverage with the frozen independent references and ordinary-fit rejection controls. |
| RC06 | **FIX** documentation and a focused runnable example in the same visible milestone. |
| RC07 | **AVOID** solver rewrites, blanket rejection, new controls and expansion of this mission. |
| RC08 | **EXPLORE** the authoritative reuse surface and any automatic warning threshold only with concrete implementation proof. |

### What was executed

The frozen matrix contains 26 cases: 22 expected available fits and four expected unavailable outcomes. Exact rational arithmetic supplied independent least-squares references for both intended decimal inputs and the binary64 values actually passed to JavaScript. The baseline module was loaded without application-source edits under Node `v24.19.0`, V8 `13.6.233.17-node.51`, ICU `78.3`. Its actual equation formatter and the extracted actual six-significant-digit trace formatter were evaluated. Five parser checks exercised Unicode signs and powers, grouping, scientific notation, zero suppression and rounded unit coefficients.

The candidate comparison used the existing polynomial standardized basis, exposed through metadata-only in-memory instrumentation. Assertions required its coefficients, measures and specified-point predictions to be identical to the unmodified baseline. Linear centered evaluation used the same means and slope as the baseline. No alternative solver was introduced.

All 26 availability outcomes matched expectation. Of 22 available cases, internal prediction passed the material envelope in 21, full expanded Horner reconstruction in 15, actual label-equation reconstruction in three, and trace-coefficient reconstruction in 12. Centered coefficients at six digits passed 21; the same representation with round-tripping 17-digit numbers passed 22. These counts describe this deliberately selected matrix, not the frequency of problems in customer data. In the six-digit centered candidate, **origin and scale still retained 17 digits**.

### Meaning of the acceptance envelope

For the synthetic measurement task, the declared reuse tolerance is 0.001 V, scaled to 1 mV when Y is expressed in millivolts. This is an explicit experiment assumption for a voltage measurement, not a discovered customer specification. Coordinate translations do not increase it. Pontius uses a separate `5e-6` source-deflection-unit fidelity budget, half the last supplied Y decimal place; that is not asserted instrument accuracy.

The numerical diagnostic budget is

`B = 128 × 2^-52 × max(|stored Y|, |reference in-range prediction|) + 10^-12 × response range`.

The material comparison uses `T = measurement tolerance + B`. If `B` exceeds one tenth of the measurement tolerance, the task is separately representation-limited rather than silently judged accurate by a relaxed tolerance. No available case reached that condition. The visual heuristic uses `max(measurement tolerance, 0.005 × response range) + B`; it is a heuristic for discussing trend summaries, not measured pixel accuracy. These budgets were fixed before baseline/candidate execution and are not universal floating-point error bounds.

## RC01 — KEEP the standardized polynomial solver and valid-fit availability

**Problem.** Large original-coordinate coefficients can look alarming while the fitted predictor remains accurate. Treating coefficient magnitude or coordinate offset as a global fit-failure rule would remove useful analysis.

**Evidence.** At the exact baseline, `packages/explorEDA/src/components/charts/ScatterPlot/regression.ts`, `fitPolynomial` (lines 203–277), standardizes X, uses `solveLeastSquares` (155–197) with Householder QR, and evaluates the standardized coefficients with Horner's method (242–246). The binomial expansion to original-X coefficients occurs separately (248–254). All included polynomial internal predictions passed the material envelope. C06, a five-row translated quadratic near `10^9 mm`, had maximum in-range prediction error about `4.35e-16 V` while full expanded Horner reconstruction missed by `7.096299 V`. C25, degree six with seven samples near `10^6 mm`, predicted within `1.78e-15 V` despite catastrophic expanded reconstruction. C26 Pontius predicted within `5.94e-16` source deflection units.

**Classification and cost.** **KEEP; low cost.** Retain the existing polynomial solving/evaluation architecture and the distinction between fit availability and representation reliability. Add focused protection tests through RC05.

**Alternatives.** A solver replacement, rank-cutoff change, or rejection based on a large mean-to-spread ratio would add cost without addressing the demonstrated conversion/formatting failure. Retaining the solver does not mean certifying every design: its current relative pivot rule at lines 184–194 is a rank heuristic, not a full condition estimate.

**Confidence.** High for this bounded retention decision; not a universal numerical guarantee.

**Proof gate.** C04/C05/C07/C09/C11, supported degree controls C16–C25, and Pontius C26 retain reference-level in-range agreement. Repeated X with enough distinct values remains available. C12–C15 remain unavailable for their respective insufficient-distinctness, lost-distinguishability, constant-X, and insufficient-row reasons. At `n = degree + 1`, a fit remains available while residual SE and adjusted R² remain undefined.

**Intended local destination.** Retain `regression.ts:fitPolynomial` and `solveLeastSquares`; record the keep decision in `docs/intent/research-ideas-100/ideas/R001-regression-conditioning.md`; add focused tests in the adjacent `regression.test.ts`.

## RC02 — FIX linear prediction and residual metrics together

**Problem.** Linear fitting centers its cross-products but evaluates an expanded intercept plus slope times X. The reported residual metrics can consequently describe a better mathematical line than the returned prediction function evaluates.

**Evidence.** `packages/explorEDA/src/components/charts/ScatterPlot/regression.ts:111–139`, `fitLinear`, calculates centered sums, sets `intercept = my − slope × mx`, derives SSE from `max(0, syy − slope × sxy)`, and returns `predict(x) = intercept + slope × x`.

C03 uses `u = [-2,-1,0,1,2]`, `x = 2^30 + u × 2^-20 seconds`, and `y = 1.234567 + 0.234567u V`, with held-out half-step positions. All X/query values are exactly representable; input rounding is therefore not the explanation. Baseline maximum error is `0.030866 V` on fitted rows and `0.0235335 V` on held-out points, against a roughly `0.001 V` budget. Centered evaluation reaches `1.11e-16 V` maximum error. Independent residual summation from baseline returned predictions yields SSE `0.001667537335 V²`, residual SE approximately `0.02357638 V`, and R² approximately `0.9969693084`; the returned residual SE is zero and R² is one. The metric discrepancy exceeds the predeclared SSE materiality bound.

**Classification and cost.** **FIX proposal; low relative cost.** Evaluate `my + slope × (x − mx)` and calculate residual-based measures from that same returned predictor. This is an evaluation/metric repair, not a new fitting method. A direct residual pass is linear in row count and needs no new persistent user setting.

**Alternatives.** Increasing displayed coefficient digits cannot recover the lost expanded-intercept precision. Recomputing SSE alone would report the discrepancy but leave the inaccurate predictor. Replacing ordinary least squares or introducing higher precision throughout is disproportionate to the reproduced mechanism.

**Confidence.** High that the narrow candidate fixes C03; medium on integration until repository checks run. The existing `regression.test.ts:30–35` large-offset test checks slope/R², not prediction or equation reuse.

**Proof gate.** Reproduce C03 and verify both fitted and held-out predictions, direct residual SE, R² and slope SE. Preserve ordinary line C01, immaterial translated-line C02, unavailable C14, and existing constant-Y/insufficient-row conventions. A small mismatch from subtracting almost equal sums alone is not sufficient defect evidence. The centered candidate and direct residual sum were executed; a production implementation and its returned metric calculations have not been.

**Intended local destination.** `regression.ts:fitLinear`, `regression.test.ts` linear tests, and the R001 intent brief. Any package-visible repair follows the repository's changeset rule. No code change is part of this research delivery.

## RC03 — FIX the representation used for reusable equations

**Problem.** A numerically useful polynomial can lose response-level accuracy when converted to original-coordinate powers. Full precision in the expanded coefficients is not necessarily enough to reproduce its stable predictor.

**Evidence.** `packages/explorEDA/src/components/charts/ScatterPlot/regression.ts:242–254` keeps standardized evaluation inside `predict` but returns only expanded `coefficients`. C06 uses the noisy measurement `y = 1.234567 + 0.234567u + 0.034567u² + residual`, where residuals are `[1,-4,6,-4,1]/10000 V`, then translates X to `10^9 + u mm`. Exact arithmetic on the returned binary64 expanded coefficients still misses the independent reference by `4.617814772 V`; binary64 Horner reconstruction misses by `7.096299 V`. This separates basis-conversion loss from additional evaluation rounding.

Serializing the same expanded coefficients with 17 significant digits changes none of that. Preserving the existing standardized basis with round-tripping origin, scale and coefficients passes all 22 available cases. In C10, Y is shifted by `+1000 V`; six-digit centered coefficients miss by `0.00456724 V`, while full-precision centered values remain within about `9.67e-14 V`. Centering and coefficient precision are separate requirements.

**Classification and cost.** **FIX proposal; small-to-moderate relative cost.** Preserve an authoritative reusable representation consisting of coefficient order, the polynomial in `t`, and explicit `t = (x − origin) / scale`, together with original X units, response units and enough digits to round-trip all stored numbers. The executed candidate uses 17 significant digits; a shorter presentation is acceptable only when its actual serialized values preserve the same contract.

**Alternatives.** More digits in original powers fail C06. Merely displaying six significant digits in a centered basis fails C10. Re-centering Y or adding a universal numerical API is unnecessary for the demonstrated cases. Original-coordinate coefficients may remain for compatibility, but must not be presented as equally authoritative for reproduction when they materially disagree.

**Confidence.** High numerical confidence for the tested representation; medium product/API confidence. The packet establishes module exports, not the complete published entry surface.

**Proof gate.** Parse the final serialized equation, origin and scale independently; compare fitted and held-out queries against both the reference and returned predictor. Preserve the required significant digits in a large origin: the executed six-digit candidate did not round origin or scale to six digits. State coefficient order and units. Do not claim continuous-domain certification from finite probes. Input distinctions already lost in binary64, as in C13, cannot be recovered by a better equation.

**Intended local destination.** `regression.ts` fit representation types and `fitPolynomial`/`fitLinear`, `FitTraceBody.tsx:Coefficients` and `FitDetails`, corresponding tests, and the R001 intent brief. Inspect package entry exports before deciding whether an additive public field is needed.

## RC04 — FIX compact equation and trace honesty

**Problem.** The chart label, trace equation and trace coefficient list have different rounding, yet none currently defines a reliable reuse boundary. A compact expression can cease to resemble the fitted relationship after translation or a response offset.

**Evidence.** `packages/explorEDA/src/components/charts/ScatterPlot/regression.ts:443–490`, `formatCoefficient`, `formatPolynomial`, and `fitEquation`, use approximately three significant digits below 1000, integer rounding and grouping at larger magnitudes, and exponent notation for tiny values. `FitTraceBody.tsx:39–41` uses `String(Number(value.toPrecision(6)))`; its equation at line 146 still calls the compact formatter. `FitLabels.tsx:93–100` chooses between the same equation and summary. `fitPlan.ts:296–342`, `planFitMarks`, evaluates `outcome.predict` instead.

C06 actual label reconstruction misses by approximately `3.30e13 V`; six-digit trace reconstruction misses by `5.841969 V`. C01 is an ordinary-scale negative control for the solver: its internal prediction passes, but the rounded label misses by `0.005433 V`, exceeding the experiment's 1 mV reuse budget. C26 Pontius label reconstruction misses by `0.000169679` source units versus its `0.000005` fidelity budget. Such results do not imply the plotted predictor is wrong.

**Classification and cost.** **FIX proposal; small-to-moderate relative cost.** Distinguish the compact trend summary from the reusable trace expression. Retain short labels where they remain meaningful; for an unreliable expanded expression, display a sound centered summary or a representation-specific fallback while preserving the curve, fit type, existing metrics and existing trace access. No global precision control is needed.

**Alternatives.** An approximation marker is useful for honest modest rounding, but **`≈` alone is insufficient for C06's catastrophic error**. Forcing every 17-digit expression into the plot risks unreadable labels. Hiding the entire curve would discard the accurate predictor. The trace's comment that six digits reproduce a coefficient should be revised if the behavior is retained.

**Confidence.** High that current reuse representations disagree materially; medium on final compact-label design and automatic fallback policy.

**Proof gate.** Test actual output text, not unrounded coefficients. Include Unicode minus/superscripts, grouping commas, exponent signs, exact-zero suppression and a multiplier rounded to one. Verify units, field labels, accessible trace access and readable rendering at 1280, 783 and 390 px. These browser checks remain unrun. A mathematical text parser is not a clipboard or export test. A representation notice must not convert an available fit to unavailable.

**Intended local destination.** `regression.ts` formatting, `fitPlan.ts:fitSummary`, `FitLabels.tsx`, `FitTraceBody.tsx`, and their focused tests. Any automatic threshold remains conditional under RC08.

## RC05 — FIX the bounded numerical proof gates

**Problem.** Existing tests protect useful basic cases but do not establish agreement between internal predictions, expanded coefficients and actual displayed equations under unit/offset changes. Additional safeguards could introduce false failures if proof considers only large coefficients or exact fit rows.

**Evidence.** `packages/explorEDA/src/components/charts/ScatterPlot/regression.test.ts:16–61` covers a noisy line, one offset case and formatter examples; lines 229–263 cover an exact quadratic, an ordinary noisy cubic and insufficient distinct X. The offset test asserts slope/R² only. The executed frozen matrix adds C01–C11 measurement and transformation cases, C12–C15 unavailable controls, C16–C25 supported degrees 2–6 near sample limits, and C26 Pontius. All four expected unavailable outcomes matched. C13's three intended X values near `2^54` collapse to one stored value; that is an input-representation limit, not solver error.

**Classification and cost.** **FIX proposal; low-to-moderate cost.** Integrate the smallest decisive fixtures and their exact recipes into focused tests. Preserve the full research record as evidence rather than building a benchmark platform. Use independent exact references, response-unit errors and explicit tolerance contracts.

**Alternatives.** Coefficient relative error alone is misleading near zero and does not measure reusable prediction error. Comparing two binary64 implementations is weaker than an exact oracle. Raising tolerance in proportion to the large cancelling expanded terms would excuse the failure being investigated. Tests that only mirror implementation formulas cannot distinguish a shared error.

**Confidence.** High in the independent oracle design and reproduced selected cases. Coverage remains deliberately bounded.

**Proof gate.** For each retained fixture check availability, intended-to-stored input effects, fitted and held-out prediction error, exact and binary64 expanded reconstruction, actual label and trace reconstruction, and residual consistency. Compare SSE by independently summing residuals from returned predictions. The materiality bound `2T × Σ|residual| + nT²` distinguishes harmless tiny-SSE relative changes from response-level disagreement. Treat extrapolation separately. Preserve noisy ordinary C05 and Pontius C26, repeated-X C11, and available interpolation cases with undefined residual uncertainty. No safeguard may reject ordinary valid controls merely to eliminate representation failures.

**Intended local destination.** `regression.test.ts`; a small adjacent deterministic fixture/reference helper if justified; the research records under `docs/research/regression-conditioning-2026-10-22/`; and the R001 intent brief. Run targeted tests, typecheck and the repository-required final checks in a runnable checkout.

## RC06 — FIX docs and a focused runnable example in the same visible milestone

**Problem.** Users need to distinguish reading a curve from reusing its equation and know which coordinate definition and units belong to the reusable representation. The existing docs/example teach fitting and grouping but do not establish that boundary.

**Evidence.** `apps/demo/src/docs/pages/scatter.mdx:66–73`, route **`/docs/scatter`**, has a Fits section naming linear/polynomial/LOESS and embeds **`scatter-regression`**. Its existing live entry, `apps/demo/src/docs/live/examples.ts:500–507`, focuses `fit-bill` from `scatterRegressionDashboard` and contains a row-count step for 344 penguins. The supplied dashboard excerpt begins its regression dashboard at `apps/demo/src/demos/dashboardSettings.ts:1432`; the example catalogue entry is at `apps/demo/src/demos/examples.ts:545–554`. Its teaching purpose is grouped-versus-pooled slopes. The packet excerpts do not prove any numeric round-trip UI check.

`AGENTS.md:8` requires docs and examples in each visible milestone. `CODING_STANDARDS.md:20` places internal defects and to-dos in intent docs, not product copy.

**Classification and cost.** **FIX proposal; small-to-moderate cost.** Extend `/docs/scatter` with a concise explanation and add the focused companion **`scatter-regression-units`** using the frozen measurement rows. Preserve the existing penguin example's purpose. The companion should compare local and translated X, keep explicit units, expose a known held-out in-range query and show the authoritative equation in the existing trace. A unit-converted field can demonstrate scaling without a new global unit control.

**Alternatives.** A prose caveat alone cannot make a materially wrong equation reusable. Replacing the existing grouped-regression demonstration would lose a useful lesson. A new numerical notebook or large sample application exceeds scope.

**Confidence.** High on destination and need to explain the demonstrated boundary; medium on final layout and wording until implemented and checked.

**Proof gate.** The visible repair, docs and example ship in one milestone. The example's actual trace text must reproduce the known in-range prediction in its stated units. Verify ordinary own-brush/no-refit and peer-filter/refit behavior, keyboard access, narrow rendering and the relevant export behavior. Before repair, docs must not claim the current six-digit trace is exact. Proposed post-repair wording: “Chart labels summarize the fitted trend. To reuse a fit, use its trace equation with the stated origin, scale and field units. Keep those values and the coefficient digits together.”

**Intended local destination.** `apps/demo/src/docs/pages/scatter.mdx`, `apps/demo/src/demos/dashboardSettings.ts`, `apps/demo/src/demos/examples.ts`, `apps/demo/src/docs/live/examples.ts`, and one small deterministic dataset if needed. Inspect omitted example coverage and round-trip test files before editing them. Update the owning R001 intent brief with numerical boundaries and same-milestone acceptance.

## RC07 — AVOID a solver rewrite, blanket rejection, new controls and mission expansion

**Problem.** A correctness study can accidentally become a new statistics feature, a numerical-platform project, or a set of warnings that removes useful existing fits.

**Evidence.** RC01–RC04 isolate distinct mechanisms: a linear evaluation failure, polynomial basis-conversion loss and display rounding. The stable polynomial predictor passes the selected reference cases. All availability outcomes match their frozen expectations. `docs/intent/research-ideas-100/ideas/R001-regression-conditioning.md:13–19` permits retaining current design and identifies a solver replacement as an expensive fallback. Its selected `review.json` record authorizes investigation, not implementation. The related scientific-analysis intent at lines 21–33 and 43–49 requires a concrete question, named units/population and independent proof before expansion.

**Classification and cost.** **AVOID; saves substantial unnecessary scope.** Do not introduce uncertainty bands, new regressors, hypothesis testing, model selection, notebooks, a universal numerical API, a benchmark service, or a precision/tolerance settings panel for this mission. Keep Mosaic, axes, filter comprehension and autosave studies outside R001.

**Alternatives.** Reconsider a solver only after reproducible material standardized-prediction error survives narrower evaluation/representation remedies. Reconsider a new control only after a concrete user task cannot be supported with the existing trace and a clear reusable representation. No named demand is established here.

**Confidence.** High for this bounded no-expansion decision.

**Proof gate.** Any proposed safeguard must pass ordinary and translated valid controls without hiding their curves. Large offsets, tiny representable spreads, high-degree coefficient magnitudes and repeated X alone are insufficient rejection conditions. Keep input collapse distinct from solver failure. Existing pivot rules should not be loosened merely to force unavailable cases through the solver.

**Intended local destination.** Scope and rejection criteria in the R001 intent brief and `docs/research/regression-conditioning-2026-10-22/` review record; no production code destination unless later evidence changes this decision.

## RC08 — EXPLORE the authoritative reuse surface and warning policy conditionally

**Problem.** The numerical evidence establishes the need for a stable representation, but does not decide whether that should be an internal trace representation, an additive public API member, a copyable expression format, or an automatic warning policy. Choosing those prematurely would turn a narrow repair into a compatibility/control project.

**Evidence.** `regression.ts` exports fit types from its module, while the supplied `packages/explorEDA/package.json` exports package entry points whose implementation sources are omitted. Therefore the published exposure of these helpers is not established by the packet. `FitTraceBody.tsx:135–153` already supplies an equation/coefficients surface with field labels. `FitLabels.tsx:82–115` already supports Alt-click/Alt-Enter trace access. The bounded 17-digit centered candidate passes finite probes; no rendered copy workflow or continuous-domain warning bound was executed.

**Classification and cost.** **EXPLORE; low for an exact entry-surface inspection, potentially moderate or high for a public contract.** Use existing trace capabilities first where compatible. Inspect exact-baseline entry exports and consumers before proposing public members. Evaluate an automatic representation fallback only with a concrete, reviewable implementation and a justified threshold.

**Alternatives.** A trace-only representation can avoid a new control and possibly a public API change. A fixed reusable representation can avoid guessing a universal user tolerance. A sampled comparison may be described as sampled; it must not imply a proven whole-interval guarantee. A formal bound would need separate justification and must earn its cost.

**Confidence.** High that these choices remain unresolved; medium that the existing trace is the least-cost surface. This uncertainty is **not a blocker to proposing the narrow linear repair or documenting the demonstrated boundary**.

**Proof gate.** Identify actual consumers and compatibility requirements; show the exact serialized expression, units and precision; replay it through the intended consumer; preserve current outcome/unavailable conventions and ordinary fits. If adding a warning threshold, show its material failure catches and false-positive controls, and explain where the measurement tolerance comes from. Do not adopt the synthetic 1 mV budget as a universal default.

**Intended local destination.** A small design decision in the R001 intent brief, exact package entry sources after inspection, `regression.ts` representation types only if needed, and `FitTraceBody.tsx`. A future visible choice remains subject to RC06's docs/example gate.

## Provenance and primary references

The independently frozen fixture bytes have SHA256 `977a61ee606ed9dc0c98fd00fbc406bffe31fe9db02e8e3bd817500a9e9a2c75`; the freeze receipt is dated `2026-10-22T13:07:47.415769Z`, before isolated execution at `2026-10-22T13:08:53.125Z`. The packet SHA256 is `96a5c73689957c37fba380cf79cec32d60990fb02b645758e549c79130c98a1a`. The baseline regression source SHA256 is `f29ed8bb097eb49f4be4906cbac257b040588f89a51fab41a5353b33b74fda96`; the trace source SHA256 is `873c9069d754b4a93a27f1c56a96e30c5148b3027d151d7e698e282660795d27`.

Current primary sources retrieved on 2026-10-22 support the reference and representation distinction:

- [NIST Pontius dataset](https://www.itl.nist.gov/div898/strd/lls/data/Pontius.shtml) and [reference data/certificate](https://www.itl.nist.gov/div898/strd/lls/data/LINKS/DATA/Pontius.dat): one quadratic calibration case with 40 observations. Source unit names are unspecified; this report uses source load/deflection units.
- [NIST certification methodology](https://www.itl.nist.gov/div898/strd/lls/data/LINKS/c-Pontius.shtml): calculations used 500-digit accuracy and the reported values are rounded to 15 significant digits. This certifies the reference values, not explorEDA.
- [NIST testing guidance](https://www.itl.nist.gov/div898/strd/general/howto.html): a package's acceptable proximity is not defined by a universal NIST pass threshold.
- [NumPy `Polynomial.fit`](https://numpy.org/doc/stable/reference/generated/numpy.polynomial.polynomial.Polynomial.fit.html) and [NumPy `Polynomial.convert`](https://numpy.org/doc/stable/reference/generated/numpy.polynomial.polynomial.Polynomial.convert.html): fitted domains/scales and conversion to another polynomial representation are distinct; conversion can produce a numerically ill-defined representation. These sources support the conceptual distinction, not a claim that NumPy was executed as a comparator.

Direct raw HTTP download of Pontius was unavailable: the default environment denied network access and the approved retry received HTTP 403. The official web reader provided all numeric tokens; a second retrieval verified all 40 ordered row pairs. The preserved reference is therefore a verified numerical transcription with normalized whitespace, not a byte-identical HTTP download. Its SHA256 is `255dfc23825a7d1ec7e30577344989d0d6dc79cebabb0d7da27db21ff29fcddd`.

## Closing status and handoff

- **Access:** GO via the authorized selected packet. Full application execution remains unavailable from this packet alone.
- **Baseline:** exactly `63dfa75851ef57bb3782e6d7c1ef104784cd4064`. The catalogue brief's older baseline is historical context, not the implementation baseline used here. PR/queue statuses are attributed to the supplied prompt and local additions, not freshly verified GitHub state.
- **Files read:** `AGENTS.md`, `docs/agent-guide.md`, `CODING_STANDARDS.md`, `README.md`, root and library `package.json`, `docs/ui-defaults.md`; catalogue README and selected catalogue records, the complete R001 brief, selected `ideas.json`/`review.json` projections; both `scientific-multivariate-analysis` and `current-analysis-trust` intent briefs; `regression.ts`, `regression.test.ts`, `fitPlan.ts`, `FitLabels.tsx`, `FitTraceBody.tsx`, `useScatterFits.ts`, `definition.ts`; `scatter.mdx`; the three supplied demo/live-example excerpts; supplied local prompt/queue additions; current primary references; frozen fixture and execution/analysis records. Excerpts and projections do not establish omitted capabilities.
- **Checks executed:** all 27 packet-section hash checks; exact intended/stored-input least-squares references; 26 isolated baseline cases; fitted and held-out prediction comparisons; separate extrapolation probes where specified; expanded coefficients under exact arithmetic and binary64 evaluation; actual equation and six-digit trace reconstruction; five formatter/parser checks; stable-basis candidate comparisons with instrumentation identity assertions; independent residual sums and metric comparisons; NIST numerical token verification.
- **Checks unrun/proposed:** repository Vitest, typecheck, build and `pnpm check`; production repair; React rendering; real clipboard/copied-expression interoperability; browser traces and narrow layouts; filter interactions, saved-state restoration and image export; the proposed focused example and its docs gates. Run `pnpm --filter exploreda exec vitest run src/components/charts/ScatterPlot/regression.test.ts`, `pnpm --filter exploreda check-types`, and the required final `pnpm check` in a runnable checkout before a repair review PR.
- **Artifacts:** this standalone decision register is one of four research reports; `R001-report.md` contains the bounded assessment, `R001-sources.md` the full source ledger, and `R001-proof-and-docs.md` the frozen proof and docs recipe. `R001-manifest.json` records report sizes/hashes; `R001-research.zip` contains exactly those reports and that manifest.
- **Unresolved blockers and choices:** no blocker to the bounded research decision. A runnable exact-baseline checkout is required for integration checks. The authoritative public reuse surface, warning threshold and final compact-label presentation remain conditional proposals under RC08; none is silently treated as implemented or required before the narrow correctness repair can be reviewed.
