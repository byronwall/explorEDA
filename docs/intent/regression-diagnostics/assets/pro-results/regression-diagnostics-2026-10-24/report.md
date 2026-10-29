Build a fit-attached diagnostics workspace that holds one fitted relationship, plots its residuals, and links every diagnostic mark to its exact source record. Ship residual-versus-fitted and residual-versus-X together, then add bounded sensitivity comparisons, distribution/order/influence views, and saved diagnostic settings. This turns explorEDA’s existing linear, polynomial, and LOESS fits into an investigation workflow while keeping the reference model stable as an analyst selects suspicious observations.

# Regression diagnostics from the fitted population

**Design decision · 24 October 2026 · Baseline: `95832bd473884aeae23453af0888b4ca5187820d`**

Byron’s request establishes demand. This report chooses the workflow; [implementation-plan.md](implementation-plan.md) specifies four shippable milestones, exact fixtures, files, tests, and browser acceptance. New behavior is proposed, not implemented.

## 1. Build on the current product

Code citations below use these exact prefixes: **SP** = `packages/explorEDA/src/components/charts/ScatterPlot/`; **TR** = `packages/explorEDA/src/components/charts/trace/`; **LIB** = `packages/explorEDA/src/`. All refer to the pinned commit, not current `main`.

| Checked source fact | Decisive code |
|---|---|
| Linear, degree 2–6 polynomial, and LOESS fitting already exist. Linear prediction is centered; polynomial prediction uses a standardized basis and Householder QR. | `SP/regression.ts`: `fitLinear`, `fitPolynomial`, `solveLeastSquares`; `SP/RegressionSettings.tsx` |
| Each group/facet fit retains ordered finite-pair IDs and mutually exclusive invalid-pair counts. Its own brush does not determine its training population. | `SP/fitPlan.ts`: `ScatterFit`, `groupScatterRows`, `planScatterFits`, `fitInputKey`; `SP/useScatterFits.ts`: `useScatterFits` |
| Fitting uses raw numeric values. Plot bounds, log visibility, point sizing, and density rendering can hide fitted records without removing them from the fit. | `SP/scatterPlan.ts`: `planScatter`; `SP/fitPlan.ts`: `planScatterFits`, `planFitMarks` |
| The trace already presents centered equations. LOESS has no global equation and uses 201 interpolated vertices above 500 rows. | `SP/regression.ts`: `fitEquationTerms`, `fitLoess`; `SP/FitTraceBody.tsx`: `Coefficients` |
| Ordinary traces resolve against current source revisions and close when stale. Their existing header popover is the practical entry surface. | `TR/ChartTraceScope.tsx`: `ChartTraceScope`; `LIB/components/charts/ChartTraceControl.tsx`; `LIB/components/PlotChartPanel.tsx`: `ChartTraceInspector` |

R001 describes an older numerical baseline; its repaired linear evaluation and equation presentation are not new work here. R002/R003’s earlier demand gates do not apply: `docs/research/DIRECTION.md` supersedes them. Prepared residuals in notebooks are useful prior art, but do not supply native fit membership, selection, or refresh semantics.

## 2. What established workflows earn

| Primary reference | Useful precedent | Choice for explorEDA |
|---|---|---|
| JMP 19.2 [P1–P2] | Fit-specific residual views, linked source rows, optional generated columns. | Attach to one fit; make row inspection central. |
| R `plot.lm` [P3] | Complementary fitted, Q–Q, scale-location, and leverage views. | One readable plot at a time, sharing selection. |
| statsmodels [P4–P5] | Distinct residual/leverage/influence measures and case tables. | Explicit quantities and IDs, without automatic threshold labels. |

NIST supports graphical residual analysis beyond fit scores. These sources motivate the proposal; they do not validate this particular UI. [P6–P7]

### The smallest complete workspace

| View | Question it earns | Stage |
|---|---|---|
| Residual versus fitted | Pattern or changing spread with predicted level? | M1 default, with zero line. |
| Residual versus X | Where along X does structure remain? | M1; necessary when predictions coincide, as in F02. |
| Ordered residuals | Drift with acquisition/time order? | M3; explicit ordering. |
| Normal Q–Q | Tail/asymmetry departures from a normal reference? | M3; raw default, optional OLS standardization. |
| Spread versus fitted | Changing magnitude obscured by signed overlap? | M3; absolute raw residual or OLS scale-location. |
| Standardized residual versus leverage | Unusual response and unusual predictor geometry? | M3, linear/polynomial OLS only. |
| Cook’s distance/deleted residual table | Which records materially move the fit? | M3; sortable values linked to omission comparison. |

Defer histograms and actual-versus-predicted as redundant here. Partial-regression views address a different, multiple-predictor capability. No display proves causality, independence, or model correctness. [P3–P7]

## 3. The author flow

1. **Enter:** use the header trace control or Alt-click/Alt-Enter a fit label, then **Diagnostics**. No plot-level Inspect button.
2. **Choose:** name facet, group/pooled fit, method, fields/units, fitted count, and exclusions. Browse rendered facets; use the existing pager for other pages. Paging preserves the held reference.
3. **Hold:** capture exact inputs, contributor IDs, predictor, and source generation. Expand the existing trace popover; retain ordinary trace freshness rules.
4. **Select:** fitted/X plots share all held rows. Click, rectangle, or checkboxes change local selection only. Empty space clears it; coincident points offer all record IDs.
5. **Read:** show ID, X, observed/predicted Y, residual, and visibility. Expand original fields/parsing/calculations, including rows absent from the chart. Sort ties by captured source order.
6. **Recompute deliberately:** peer changes show **Current filters differ — Recompute**. Recompute or switching fits captures a new reference and clears selection/comparisons; an off-page target waits for its facet to remount.
7. **Return:** Close/Escape restores opening-control focus. Inspection changes no saved setting, filter, layout, or undo history; explicit Apply remains an ordinary edit.

Document inspector-local selection in `docs/ui-defaults.md`. Do not reuse `ScatterPoints.selectPoint`, which writes chart filters. Explicit workspace filtering from diagnostics is deferred.

At **1280 px**, pair plot and rows; at **783/390 px**, use Plot/Rows tabs and contained scrolling. Keep identity/status/actions reachable. The nonmodal popover stays open during peer interaction and is contained by an enclosing details dialog. Add touch and keyboard row/point access; ordinary canvas scatter currently supplies per-point keyboard navigation only for bubbles.

## 4. Population and revision contract

Choose held inspection over live recomputation: peer interaction must not move its reference. The cost is explicit Recompute and invalidation after source changes.

| Population/state | Exact meaning |
|---|---|
| **E — eligible** | Exact group/facet rows before finite-pair validation; excludes the source chart’s own brush from training scope. |
| **F — fitted** | Ordered `ScatterFit.sourceIds`, one per finite pair. |
| **D — displayed** | F when coordinates are defined; otherwise report m of n, retaining undefined rows in the table. |
| **S — selected** | Generation-bound subset of F; never changes the predictor. |

Capture E/exclusions in the same frame as F. Preserve X-first validation: `missingY` counts invalid Y only after valid X. Never reconstruct F from displayed or selected marks.

| Event | Required behavior |
|---|---|
| Own brush, viewport/axis presentation, resize, palette | Hold F and residuals; selection/visibility may change separately. |
| Peer/workspace/local scope or model inputs change | Hold and name the old reference; mark changed scope, including changes only to exclusions. Recompute explicitly. |
| DataLayer global `nonce` changes | Clear S; disable source lookup, comparisons, apply, and export. Retain labeled old numeric results until Recompute/Close. |
| Recompute or close | Recompute atomically captures the chosen current target and clears selection/comparisons. Close disposes of the session. A missing target never substitutes another group. |

`DataLayerProvider.tsx` increments global `nonce` for data, restore, calculations, field configuration, and some aggregate changes. Use it conservatively; say **Data or field configuration changed**. A live chart nonce only triggers comparison of exact populations/semantic inputs. `fitInputKey`’s 32-bit hash is not authoritative identity.

Additional boundaries:

- Pooled means groups within one facet; numeric color remains one fit. Identity uses `fitId` and semantic `facetKey`. Distinguish off-page from removed facets; never represent either by `facetIds=[]`, which current `planScatter` treats as unrestricted.
- Keep duplicate X records separate. Preserve unavailable reasons for nonempty failed groups; empty groups are absent.
- Log axes/clipping do not remove valid fitted pairs. Diagnostics uses raw values and linear axes.
- Record identity is `(captured nonce, sourceId)`, without cross-refresh remapping. Chart deletion closes inspection; undo/restore invalidates it.

## 5. Sensitivity: three fits at most

M2 shows **one held baseline plus at most two alternatives** on the same fields, facet/group, and ordered F. There is no best-model badge.

- Suggest adjacent polynomial degrees (2–6), LOESS spans ±0.10 within 0.2–1, or a linear reference. For a line, offer degree 2 first. Show LOESS’s actual neighbor count; distinct spans can be equivalent.
- **Compare without selected rows** supports linear/polynomial fits: candidate training is F minus S, evaluation remains original F. It neither deletes records nor filters the workspace.

Show baseline plus one active candidate, prediction differences, and source rows. Curves/default delta summaries use shared observed X support with its count; outside-support OLS table values are marked **extrapolated**. Separate training error from original-F evaluation error. F04 gives training SSE 0 versus evaluation SSE 144 after omitting one record.

**Apply to chart — all groups and facets** must name its full effect: regression settings are shared. Permit it only while current source inputs and method/options match the held reference. One `updateChart` creates one undo step; the reference stays held. Failed candidates retain their reason without automatic simplification.

Same-row LOESS comparisons preserve the existing evaluator branch. Label **201-vertex interpolation** separately from span; defer LOESS omission until changes in rows/support and the 500-row threshold can be separated from numerical approximation. R’s interpolation controls support this distinction, but use a different k-d-tree implementation. [P10]

OLS influence follows in M3 for interpretation and rank-edge handling. Cook’s full-fit shortcut avoids n refits; LOESS deletion needs separate mathematics/computation. [P5, P8–P9]

## 6. Mathematical contract

For every captured pair, use **`yHat = outcome.predict(x)` and `e = y - yHat`**. Positive residual means observed Y exceeds predicted Y. Prediction/residual units are Y units; an affine conversion `Y′ = a + bY` gives `e′ = be`. Never compute diagnostics from a rounded equation or expanded coefficients. [P6; `SP/regression.ts`]

For OLS, p includes the intercept: 2 for a line, degree+1 for a polynomial. Distinguish residual RMS `sqrt(SSE/n)` from residual standard error `sqrt(SSE/(n−p))`. Leverage measures predictor geometry; Cook’s D measures single-record fit movement. Use **internal** standardization and existing QR geometry; label undefined values for zero scale, insufficient degrees of freedom, leverage one, or rank failure. LOESS does not inherit OLS influence formulas. [P5, P8–P9, P11]

Raw Q–Q preserves units across methods; optional OLS standardization accounts for leverage-related residual variance. Use midpoint probabilities, source-order ties, and a type-7 quartile line without inferential envelopes. The plan specifies formulas, guards, and exact fixtures, including conversion that catches expanded-equation evaluation. [P3, P12–P13]

## 7. Persistence and reuse

| Approach | Decision and tradeoff |
|---|---|
| Temporary fit-attached workspace | **Build first.** Fits the existing trace shell; exact membership and no incidental saved-state changes. |
| Generated residual fields/table | **Defer.** Requires ownership, refresh, naming, dependency, and multiple-model semantics that inspection does not need. |
| Independently saved diagnostic chart | **Defer.** Would duplicate fit settings and invite a diagnostic chart to filter its own reference. |

M4 explicitly saves view/scale, order field, preferred fit/facet, and two non-exclusion comparison specs. Reopening reconstructs from current data. Save no runtime IDs, results, predictor closures, omissions, or open state. Existing validation and Dashboard text paths suffice.

Export self-describing CSV and snapshot JSON, all fitted rows by default; selected-only output states both selected/fitted counts. These are static outputs, without generated workspace fields.

**Copy predictor** preserves the actual linear/polynomial basis, field/units/range, and round-trip precision. Display equations remain identified as rounded; LOESS has no equation. Save/apply each creates one undo step; inspection creates none. [Code: `SP/regression.ts::FitBasis`; `LIB/utils/saveDataUtils.ts`; `LIB/lib/dsl/{compile,export,settingKeys,normalize,paths}.ts`]

## 8. Stable recommendations

| ID | Disposition | One-line reason |
|---|---|---|
| RD-001 | **Build · M1** | Expand the existing fit trace into a temporary held diagnostics workspace. |
| RD-002 | **Build · M1** | Bind exact eligible/fitted/selected records and source actions to one captured generation. |
| RD-003 | **Build · M1** | Ship fitted/X residual views and source rows together to complete investigation. |
| RD-004 | **Build · M1** | Make scope changes visible and recomputation explicit; preserve ordinary trace freshness. |
| RD-005 | **Build · M2** | Limit sensitivity to baseline plus two same-row alternatives. |
| RD-006 | **Build · M2** | Add explicit selected-row OLS omission with separate training/evaluation roles. |
| RD-007 | **Build · M3** | Add ordered, Q–Q, and spread views for distinct diagnostic questions. |
| RD-008 | **Build · M3** | Add OLS leverage, internal standardization, Cook’s D, and deleted residuals. |
| RD-009 | **Build · M4** | Persist a small fit-attached recipe and export self-describing static results. |
| RD-010 | **Build · M4** | Copy the actual predictor basis at round-trip precision. |
| RD-011 | **Explore** | A bounded direct-versus-interpolated LOESS probe could clarify approximation separately from span. |
| RD-012 | **Defer** | Generated fields, independent saved diagnostic charts, and cross-refresh frozen selections need separate ownership contracts. |
| RD-013 | **Defer** | LOESS omission/influence and externally studentized residuals add method-specific cost and interpretation beyond the staged core. |
| RD-014 | **Avoid** | Automatic deletion, hypothesis badges, best-model labels, and R² ranking encourage unsupported conclusions. |
| RD-015 | **Avoid** | Replacing the solver or deriving residuals from displayed equations discards working numerical foundations. |

## Appendix A — decisive fixture results

The plan supplies every input row and tolerance. These are independent mathematical fixtures, not claims that feature tests have run.

- **F02:** Y=X² at X `[-2,−1,0,1,2]`; a line predicts 2 everywhere, earning the residual-X switch.
- **F04:** final-row Cook’s D `261/20` despite a smaller-than-maximum raw residual, earning influence analysis.
- **F05:** translated/unit-converted F01; centered predictions remain correct while expanded evaluation loses approximately 0.0004 at the first row.

## Primary sources

Accessed 24 October 2026. JMP is cited as documented version 19.2; R-devel and statsmodels stable pages are the consulted documentation snapshots. Product documentation establishes workflow; papers/source establish mathematical meaning. No secondary tutorial is decisive.

- **P1:** [JMP 19.2, Bivariate Fit Options](https://www.jmp.com/support/help/en/19.2/jmp/bivariate-fit-options.shtml).
- **P2:** [JMP 19.2, Select Points in JMP Graphs](https://www.jmp.com/support/help/en/19.2/jmp/select-points-in-jmp-graphs.shtml).
- **P3:** [R, `plot.lm`](https://stat.ethz.ch/R-manual/R-devel/library/stats/html/plot.lm.html).
- **P4:** [statsmodels, Regression Plots](https://www.statsmodels.org/stable/examples/notebooks/generated/regression_plots.html).
- **P5:** [statsmodels, `OLSInfluence`](https://www.statsmodels.org/stable/generated/statsmodels.stats.outliers_influence.OLSInfluence.html).
- **P6:** [NIST, How can I tell if a model fits my data?](https://www.itl.nist.gov/div898/handbook/pmd/section4/pmd44.htm).
- **P7:** [NIST, Are the model residuals well-behaved?](https://www.itl.nist.gov/div898/handbook/pri/section2/pri24.htm), for plot roles; use P6’s explicit observed-minus-predicted definition.
- **P8:** Cook, R. D. (1977), *Detection of Influential Observation in Linear Regression*, Technometrics 19(1), 15–18, §2. [Original paper, accessible scan](https://scispace.com/pdf/detection-of-influential-observation-in-linear-regression-5cad9hrkgo.pdf).
- **P9:** [R, Regression Deletion Diagnostics](https://stat.ethz.ch/R-manual/R-devel/library/stats/html/influence.measures.html).
- **P10:** [R, `loess.control`](https://stat.ethz.ch/R-manual/R-devel/library/stats/html/loess.control.html).
- **P11:** Cleveland, W. S. and Devlin, S. J. (1988), *Locally Weighted Regression: An Approach to Regression Analysis by Local Fitting*, JASA 83(403), 596–610, §4. [Original paper, university-hosted scan](https://sites.stat.washington.edu/courses/stat527/s14/readings/Cleveland_Delvin_JASA_1988.pdf).
- **P12:** [R, `ppoints`](https://stat.ethz.ch/R-manual/R-devel/library/stats/html/ppoints.html).
- **P13:** [R, `qqnorm` and `qqline`](https://stat.ethz.ch/R-manual/R-devel/library/stats/html/qqnorm.html).

## Access and handoff

**Access confirmed:** the complete 38-file packet was read before external research. The packet identifies commit `95832bd473884aeae23453af0888b4ca5187820d`. Seven additional integration files were then fetched and read through connected GitHub at that exact commit. No required design input is missing. This is a scoped source review, not a review of the entire repository.

### Files read

The complete packet’s 38 files, grouped here only for readability:

- Root and policy (8): `AGENTS.md`; `README.md`; `package.json`; `packages/explorEDA/package.json`; `docs/agent-guide.md`; `docs/ui-defaults.md`; `CODING_STANDARDS.md`; `docs/research/DIRECTION.md`.
- Intent/research (4): `docs/intent/scientific-multivariate-analysis/intent-brief.md`; `docs/research/regression-conditioning-2026-10-22/summary.md`; `docs/intent/research-ideas-100/ideas/R002-residual-diagnostics.md`; `docs/intent/research-ideas-100/ideas/R003-fit-sensitivity.md`.
- Under **SP** (15): `regression.ts`; `regression.test.ts`; `fitPlan.ts`; `useScatterFits.ts`; `scatterPlan.ts`; `useScatterData.ts`; `ScatterPlot.tsx`; `ScatterSvg.tsx`; `definition.ts`; `FitTraceBody.tsx`; `FitLabels.tsx`; `RegressionSettings.tsx`; `ScatterTraceBody.tsx`; `scatterTrace.ts`; `scatterPlan.test.ts`.
- Shared state/trace/serialization (7): `TR/traceTypes.ts`; `TR/ChartTraceScope.tsx`; `LIB/providers/DataLayerProvider.tsx`; `LIB/lib/valueParsing.ts`; `LIB/utils/saveDataUtils.ts`; `LIB/lib/dsl/compile.ts`; `LIB/lib/dsl/export.ts`.
- Demo/docs (4): `apps/demo/src/docs/pages/scatter.mdx`; `apps/demo/src/docs/live/examples.ts`; `apps/demo/src/demos/examples.ts`; `apps/demo/src/docs/catalogue.ts`.

Additional complete pinned reads (7): `LIB/components/charts/ChartTraceControl.tsx`; `TR/ChartTracePanel.tsx`; `LIB/components/charts/ChartTraceDetails.tsx`; `LIB/components/PlotChartPanel.tsx`; `LIB/lib/dsl/settingKeys.ts`; `LIB/lib/dsl/normalize.ts`; `LIB/lib/dsl/paths.ts`.

**Checked versus proposed:** existing predictor/population/trace/save behavior is source-backed. Fixture arithmetic was independently checked with exact rational calculations and floating-point probes. All new UI, diagnostic calculations, performance budgets, persisted fields, milestones, tests, and browser acceptance criteria are proposals. No repository files were changed; no commit, push, deployment, executable test harness, source archive, or browser-proof claim was produced.

**Deliverables:** [report.md](report.md) · [implementation-plan.md](implementation-plan.md). The supplied ZIP contains these two documents only.

**Open questions, not prerequisites:** measure the proposed interactive row caps and latency budgets on the project’s normal browser/hardware during M1/M2; decide later whether a concrete export consumer needs durable business-key metadata. Neither blocks the generation-bound first release.
