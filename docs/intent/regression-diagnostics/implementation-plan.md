# Regression diagnostics from one held fit

Build a temporary workspace for one fit, with residual plots and exact source records.
Hold the reference while the analyst selects rows or changes peer filters.
Add bounded comparisons, then more diagnostic views, saved settings, and static exports.

Status: proposed implementation, not shipped. Source baseline: `95832bd473884aeae23453af0888b4ca5187820d`.
See the [review summary](../../research/regression-diagnostics-2026-10-24/README.md) and [Pro conversation](https://chatgpt.com/c/6adc5ba0-17dc-83e9-a735-6e4f5ba38f23).
Build dispositions put work in this plan. They do not authorize a release.

## Ownership and data contract

Use the existing React trace shell and estimators. Keep the additions private to scatter diagnostics.
Start with `packages/explorEDA/src/components/charts/ScatterPlot/fitDiagnostics.ts` and a small session hook.
The model needs a target, captured inputs/results, selected IDs, view, and freshness status.
Do not create a model registry or another execution platform.

| Item            | Contract                                                                                                   |
| --------------- | ---------------------------------------------------------------------------------------------------------- |
| Target          | Chart ID, semantic facet key, and existing group/overall fit ID. Labels and mount owners are not identity. |
| Eligible rows E | Group/facet rows before finite-pair validation, from the same frame as the fit.                            |
| Fitted rows F   | Ordered `ScatterFit.sourceIds`, with duplicate X values retained as separate records.                      |
| Selected rows S | Inspector-local subset of F. Selection does not change chart or workspace filters.                         |
| Result          | Captured X/Y, `outcome.predict(x)`, residual, source order, and unavailable reasons per source ID.         |
| Provenance      | Source nonce, field/unit labels, method/options, partition, applicable filters, and exclusions.            |

Use `residual = observedY - prediction`. Its units are Y units.
Never use a rounded equation or expanded coefficients to calculate residuals.
Keep X-first exclusion accounting: invalid Y counts only after valid X.
Rows hidden by log axes or viewport bounds remain fitted rows.
Diagnostic axes use raw values on linear scales.
Undefined predictions stay in F and the table, with a reason.
Complete-vector error statistics are unavailable if any required residual is non-finite.

Capture values, model, IDs, and nonce atomically from one planning frame.
Copy numeric values; do not keep getters that later read changed columns.
Before each source-record action, compare the current global nonce with the captured nonce.
Do not intersect record inspection with current chart filters.
Reuse source-field and calculation-step presentation, not a resolver limited to currently drawn points.

## Session changes

| Event                                                                | Result                                                                                            |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Own brush, view switch, selection, table sort, resize                | Preserve F and the model. Only local display or selection changes.                                |
| Peer filters, local scope, method, partition, or model inputs change | Hold the reference and show a changed-scope notice. Offer Recompute.                              |
| Global nonce changes                                                 | Clear S; disable source lookup, comparisons, apply, and export. Keep labeled old numeric results. |
| Recompute or explicit target switch                                  | Atomically capture the selected current target; clear selection and comparison results.           |
| Facet goes off-page                                                  | Keep the held reference. Wait for that semantic facet before recompute or apply.                  |
| Group/facet disappears                                               | Show unavailable. Never substitute another group or treat an empty facet list as all rows.        |
| Close, chart deletion, or chart type replacement                     | Dispose of the session and restore opening-control focus.                                         |

The global nonce covers field configuration, calculations, restore, and some aggregate edits, as well as source data.
Use a notice that names data or field configuration. Conservative invalidation is acceptable.
Compare exact populations and structured inputs, including excluded rows; `fitInputKey` hashes are not authoritative identity.
Axis presentation changes alone do not change the held fit.
Keep ordinary trace revision invalidation unchanged. The held session needs its own state branch.
Do not persist session results, runtime row IDs, selection, open state, or predictor closures.

## M1: inspect residuals and exact records

Ship residual-versus-fitted and residual-versus-X together. A constant prediction can hide curvature in the first view.
Use one plot at a time, a zero line, local selection, and an All/Selected records table.
Show fit, group, facet, fields, fitted count, exclusions, selected count, and reference status.
Offer click, rectangle, and checkbox selection. Coincident marks must expose every source ID.
Empty diagnostic space clears local selection. Closing inspection changes no saved state or undo history.

Enter through the header trace control or a fit trace's Diagnostics action.
Do not add a plot-level Inspect button.
Expand the existing nonmodal trace surface; keep it open during peer-chart interaction.
Inside chart details, pass the enclosing dialog container to the popover.
At 1280 px, show plot and rows together. At 783/390 px, use Plot/Rows tabs with contained scrolling.
Keep Close and Recompute reachable. Provide touch and keyboard alternatives to Alt-click and dragging.

Implementation files:

- Add `fitDiagnostics.ts`, `useFitDiagnostics.ts`, and `FitDiagnosticsWorkspace.tsx` under `ScatterPlot/`.
- Integrate `fitPlan.ts`, `useScatterFits.ts`, `ScatterPlot.tsx`, and `FitTraceBody.tsx` there.
- Extend internal `traceTypes.ts` and `ChartTraceScope.tsx` with a narrow optional capture capability.
- Gather diagnostic targets across registered facets; the ordinary target list currently keeps only the first chart source.
- Adapt `ChartTraceControl.tsx`, `trace/ChartTracePanel.tsx`, and `PlotChartPanel.tsx::ChartTraceInspector`.
- Document the local-selection exception in `docs/ui-defaults.md` and `CODING_STANDARDS.md`.

Prove the fixtures below with pure capture tests and a focused mounted session test.
Assert that selection, sorting, opening, and closing leave `saveToStructure()` unchanged.
Test peer-filter hold/recompute, same-ID data replacement, hidden points, duplicate coordinates, and off-page/removed facets.
Do not reuse `ScatterPoints.selectPoint`: it writes chart filters.

Docs and example ship here: add Diagnose a fit, Fitted rows, and When filters change to `/docs/scatter`.
Add `apps/demo/src/demos/scatterDiagnostics.ts`, deterministic CSV data, and `/examples/scatter-diagnostics`.
Register its live example in `apps/demo/src/docs/live/examples.ts`, plus catalogue/coverage entries as needed.
Use the five-row curvature fixture, a peer filter, and a source table.
Risk: local selection can look like dashboard filtering. Label its scope and prove unchanged analysis state.

Measure opening and selection before adding async machinery.
Pro suggested 50,000 inspection rows, 100-row table pages, and 150/100 ms opening/selection targets.
These are provisional budgets. Record hardware, row shape, and latency before choosing a capacity boundary.
Reuse the fitted predictor; do not refit on opening. Avoid one DOM node per large-data mark.
If a measured limit is necessary, show it explicitly. Never silently sample F.

## M2: compare nearby fits on fixed rows

Keep one held baseline and at most two alternatives. Show one active alternative alongside the baseline.
Ordinary comparisons use identical ordered F. Use existing degree 2–6 and span .2–1 ranges.
Suggest adjacent degrees, span ±.10, or a linear reference. Deduplicate boundary suggestions.
Show actual LOESS neighbor counts; different spans can produce the same neighborhood.
Do not rank models by R² or choose a winner automatically.

Add `fitSensitivity.ts` and its small UI under `ScatterPlot/`; reuse `fitRegression`.
Compute on explicit Run. Do not refit during hover or selection.
Cache only when repeated work is measured, using held-session identity and the candidate specification.
Pro's proposed 10,000-row comparison cap and one-second latency target need local measurement.
Add a worker only if measured blocking requires it.

An explicit OLS omission scenario trains on F minus S but evaluates on original F.
Mark excluded training rows, training error, evaluation error, and support counts separately.
Overlay curves only on shared observed X support. Mark outside-support OLS table predictions as extrapolated.
Changing S makes the omission result pending until Run. It never deletes or filters source records.
Defer LOESS omission: membership changes can also cross its 500-row evaluator boundary.
Ordinary LOESS span comparisons retain the same evaluator policy and rows.

Apply is available only when current fields, partition, scope, generation, and model options match the reference.
Name it Apply to chart — all groups and facets. One `updateChart` changes their shared regression settings.
It creates one undo step. Keep the held reference until explicit Recompute.
Omission scenarios have no Apply or delete action.

Prove curvature, omission arithmetic, LOESS neighbor/threshold cases, failed candidates, and one-step apply/undo.
Docs and example: Compare nearby fits and Compare without selected records on `/docs/scatter`;
add `/examples/scatter-fit-sensitivity` and its live example using the curvature and influence fixtures.
Risk: changed training rows can look like improved predictive performance. Separate denominators and support explicitly.

## M3: order, spread, distribution, and OLS influence

Add `olsDiagnostics.ts` and view support under `ScatterPlot/`.
For polynomial leverage, expose the small R factor from the existing standardized Householder QR.
Keep its solver, rank criterion, and predictor unchanged. Do not form an n-by-n hat matrix.

For a line, `h = 1/n + (x-meanX)^2/Sxx`.
For polynomial row a, solve `Rᵀz=a`; then `h=sum(z²)`.
With p including the intercept, use `s²=SSE/(n-p)` only when n>p.
Internal standardized residual is `e/[s sqrt(1-h)]`.
Cook's D is `e²h/[p s²(1-h)²]`; deleted residual is `e/(1-h)` when deletion retains rank.
These are different from externally studentized residuals. LOESS gets no OLS influence formulas.
Use explicit undefined reasons for insufficient degrees of freedom, zero/unresolved scale, rank loss, and leverage one.
Keep raw residuals unchanged.

Choose numerical guards from independent perfect-fit, near-rank, translation, and unit-conversion fixtures.
Pro proposed `1e-12` leverage tolerances and a `64*EPSILON*max(abs(Y),abs(prediction))` scale guard.
Do not adopt those constants as a statistical boundary. Large response offsets can change that guard's outcome.
Prove or revise them before release, including nonzero residuals under a large response translation.

Views:

- Order: explicit numeric/date field through shared parsers, then captured source order for ties. Missing order stays table-visible.
- Q–Q: raw residuals by default; optional internal OLS standardization. Sort ties by source order and retain IDs.
- Use midpoint normal probabilities `(i-.5)/m` and a type-7 quartile reference line, with at least three defined values.
- Spread: `abs(e)` in Y units; optional `sqrt(abs(standardizedResidual))` with a dimensionless label.
- Influence: standardized residual versus leverage, with sortable h, Cook, and deleted-residual columns.

Show m of n when a view lacks coordinates. Never change F to match a view.
Use no normality badge, automatic deletion, or influence cutoff.
Reuse or add one attributed inverse-normal routine; check its supported probability range against an independent reference.
Test tied Q–Q record identity, missing order, perfect fits, n=p, constant Y, rank failures, and influence arithmetic.
Docs/example: Read residual patterns and Leverage is not influence on `/docs/scatter`;
add `/examples/scatter-diagnostic-patterns` and its live example with changing spread and influential observations.
Risk: descriptive measures can imply a stronger statistical conclusion. Teach each view's limits in the same release.

## M4: save the setup and export static results

Add optional `diagnostics` settings to `ScatterPlot/definition.ts` and explicit save validation in `utils/saveDataUtils.ts`.
Allow view, residual scale, order field, preferred semantic target, and two ordinary comparison specifications.
Keep the default absent. Opening a fit explicitly takes precedence over a saved target.
Missing fields/targets are unavailable, not silently remapped.
Save no results, row IDs, omissions, source generation, or open state.
Reopening captures current data: the recipe is not a historical model.

Update DSL `settingKeys.ts`, existing normalization/path handling, and round-trip tests.
Check indexed arrays, aliases in nested field references, quoted target keys, candidate order, and `diagnostics=unset`.
Validate field names, enums, finite spans .2–1, integer degrees 2–6, and two candidates maximum.
Do not assume that generic nested settings automatically remap newly introduced field references.

Add `ScatterPlot/diagnosticExport.ts` for CSV and structured snapshot JSON.
Export all F by default; selected-only is explicit and states both counts.
Include fields/units, fit/facet, method/options, generation, selection/training roles, and unavailable reasons.
Runtime source IDs are not durable business keys. Source-invalid sessions cannot export current rows under old residuals.
Copy predictor emits the actual linear/polynomial basis at round-trip precision, with range and field/unit labels.
Keep rounded display-equation copying separate. LOESS has no single equation.
Save/apply uses one update and one undo step; transient inspection uses none.

Test save validation, export values/counts, DSL/history restore, copied predictions, and stale source actions.
Docs/example: Keep diagnostic settings, Export diagnostic rows, and Copy a predictor on `/docs/scatter`;
add `/examples/scatter-diagnostics-saved` and its live example with the translated fixture.
Update applicable setting descriptions. Risk: users may mistake a saved recipe for a frozen historical fit.

## Exact acceptance fixtures

IDs follow each array's order. Check memberships exactly; small predictions/residuals use absolute tolerance `1e-10`.
Use `1e-9` for the stated LOESS probes and `1e-8` for its threshold-line fixture.
These tolerances apply to these fixtures, not every possible dataset.

| Fixture         | Inputs and expected values                                                                                                                                                                            |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Noisy line      | X `[-2,-1,0,1,2]`, Y `[-2,-2,1,2,6]`; predictions `[-3,-1,1,3,5]`, residuals `[1,-1,0,-1,1]`, SSE4, s²4/3, R²10/11. Positive-residual selection is IDs `[0,4]`.                                       |
| Curvature       | Same X, Y `[4,1,0,1,4]`; line predicts 2, residuals `[2,-1,-2,-1,2]`, SSE14. Degree two predicts Y with zero residuals.                                                                               |
| Spread          | X `[0,0,1,1,2,2,3,3]`, Y `[1,3,3,7,5,11,7,15]`; predictions `[2,2,5,5,8,8,11,11]`, residuals `[-1,1,-2,2,-3,3,-4,4]`, SSE60, s²10.                                                                    |
| Influence       | X `[0,1,2,3,8]`, Y `[0,1,2,3,20]`; predictions `[-204,49,302,555,1820]/97`. Last-row leverage87/97, Cook261/20, deleted residual12. ID3 has the largest absolute residual.                            |
| Omission        | Remove last influence row from training only. Predictions on original F are `[0,1,2,3,8]`; training SSE0, original-F SSE144. Last prediction is outside training support `[0,3]`.                     |
| Units/offset    | Transform noisy line with T=`2^30+X/1024`, Z=`32+1.8Y`. Predictions `[26.6,30.2,33.8,37.4,41]`, residuals `[1.8,-1.8,0,-1.8,1.8]`, SSE12.96. Use the centered predictor.                              |
| LOESS line      | X0..7, Y=`1+2X`; spans .5/.75/1 give neighbors5/6/8 and zero residuals. At n500/501 the line remains correct; interpolation is false/true.                                                            |
| LOESS curvature | X0..7, Y=X²; at X2..5, span .5 prediction is X²+343/599; span .75 is X²+30008/22851.                                                                                                                  |
| Q–Q/order       | Noisy-line residual sort gives IDs `[1,3,2,0,4]`. Midpoint quantiles approximately `[-1.2815515655,-.5244005127,0,.5244005127,1.2815515655]`. Order values `[30,10,null,10,20]` give IDs `[1,3,4,0]`. |

Noisy-line leverage is `[3/5,3/10,1/5,3/10,3/5]`.
Cook values are `[45/32,45/196,0,45/196,45/32]`.
Quadratic curvature leverage is `[31/35,13/35,17/35,13/35,31/35]`; normalized zero-scale statistics are unavailable.

For membership, use facet N/group A rows `(id,x,y)`:
`(0,-1,-1),(1,0,1),(2,1,3),(3,1,3),(4,null,5),(5,2,null),(6,null,null)`.
Expect E0..6, F`[0,1,2,3]`, invalid X`[4,6]`, invalid Y`[5]`.
Add group B `(7,0,10),(8,1,12)` and invalid group C `(11,null,1)` in N.
Pooled N has F`[0,1,2,3,7,8]` and predicts `.8,3.7,6.6,6.6,3.7,6.6` in that order.
A peer Group=A filter holds six fitted rows until Recompute gives four.
Add facet S rows `(9,0,100),(10,1,102)` to prove separation.
Own brush ID2 and log/bounds hiding IDs0/1 must not remove them from F.

## Verification and PRs

Run targeted library tests, `pnpm --filter exploreda check-types`, demo coverage/dashboard-text tests, and `pnpm --filter demo docs:check`.
Add browser cases with `.e2e.ts` names and an explicit Playwright project; new names are not discovered automatically.
At 1280, 783, and 390 px, prove entry, selection, exact record access, peer hold/recompute, Close, and focus return.
Repeat inside chart details; test touch, keyboard, long names, nulls, unavailable fits, and light/dark layout.
Later milestones add comparison/apply/undo and actual parsed export assertions.
Use `pnpm dev:agent` and its printed URL. Stop the server after verification.
Use `pnpm shot` for PR screenshots; a header trace click alone does not choose a fit.
Resolve the actual target controls before scripting screenshots.
Run `pnpm check` once before each feature PR and add its required changeset.
No browser, saved-state, performance, or new diagnostic feature acceptance is claimed by this planning PR.
