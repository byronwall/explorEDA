# Build held-fit residual inspection

Build a temporary workspace attached to one scatter fit, with residual-versus-fitted/X plots and exact source records.
Keep selection local and the reference fixed until explicit Recompute.
Then add bounded comparisons, diagnostic views, saved recipes, and static exports.
The [implementation plan](../../intent/regression-diagnostics/implementation-plan.md) starts with a complete inspection flow.

Topic score: **18/20**. Mode: Design.
[Pro conversation](https://chatgpt.com/c/6adc5ba0-17dc-83e9-a735-6e4f5ba38f23), completed after 24m44s.
Both reports were collected and read. No follow-up was needed.
Source baseline and refreshed main remain `95832bd473884aeae23453af0888b4ca5187820d`.
No feature code changed in this review.

## What decides the plan

- `ScatterPlot/fitPlan.ts` already retains exact fitted IDs, exclusions, and group/facet models.
- `useScatterFits.ts` excludes the chart's own brush from refitting. Other filters change its training rows.
- `regression.ts` already uses centered linear prediction and standardized polynomial QR. Older R001 defects are repaired.
- `trace/ChartTraceScope.tsx` closes ordinary traces when revisions change. Held inspection needs separate session state.
- `DataLayerProvider.tsx` changes global nonce for data and field configuration. Guard record actions with that generation.
- `ChartTraceControl.tsx` supplies a compact popover. It needs diagnostic sizing, peer-interaction behavior, and dialog-container support.
- `saveDataUtils.ts` and DSL paths support later recipe integration. New nested field aliases still need explicit tests.

These files are under `packages/explorEDA/src/`, except the ScatterPlot prefix, under `components/charts/`.
Local source review checked those seams, facet visibility, fit traces, parsing, settings, save validation, and browser configuration.

Residual plots reveal structure that a fit score can miss. Residuals mean observed minus predicted response.
[NIST](https://www.itl.nist.gov/div898/handbook/pmd/section4/pmd44.htm) supports both points.
[JMP's fit-specific options](https://www.jmp.com/support/help/en/19.2/jmp/bivariate-fit-options.shtml) support fit-attached entry and residual-X inspection.
[R's diagnostic views](https://stat.ethz.ch/R-manual/R-devel/library/stats/html/plot.lm.html) support staging distinct questions rather than one score.
These sources support design choices; they do not validate the proposed interface.

Keep internal OLS standardization separate from deleted-fit studentization, and LOESS separate from OLS influence.
[R deletion diagnostics](https://stat.ethz.ch/R-manual/R-devel/library/stats/html/influence.measures.html) and
[statsmodels OLSInfluence](https://www.statsmodels.org/stable/generated/statsmodels.stats.outliers_influence.OLSInfluence.html) were checked.
[R LOESS controls](https://stat.ethz.ch/R-manual/R-devel/library/stats/html/loess.control.html) distinguish interpolation from direct evaluation.
Its implementation is not the repository's 201-vertex evaluator.

## Local dispositions

Build means planned, not approved to ship. IDs map to Pro's recommendations.

| IDs    | Disposition | Reason                                                                                                |
| ------ | ----------- | ----------------------------------------------------------------------------------------------------- |
| RD-001 | Build M1    | Extend the existing trace surface for one held fit.                                                   |
| RD-002 | Build M1    | Bind results and record actions to exact captured IDs and generation.                                 |
| RD-003 | Build M1    | Ship residual-X, residual-fitted, local selection, and source rows together.                          |
| RD-004 | Build M1    | Name scope changes and require explicit recomputation.                                                |
| RD-005 | Build M2    | Bound comparison to one baseline and two same-row alternatives.                                       |
| RD-006 | Build M2    | Support explicit OLS omission with separate training/evaluation rows.                                 |
| RD-007 | Build M3    | Add order, Q–Q, and spread for distinct questions.                                                    |
| RD-008 | Build M3    | Add descriptive OLS leverage/influence with defined unavailable cases.                                |
| RD-009 | Build M4    | Save recipes and export static results without another source pipeline.                               |
| RD-010 | Build M4    | Copy the actual predictor basis at round-trip precision.                                              |
| RD-011 | Explore     | Measure direct/interpolated LOESS differences separately from span sensitivity.                       |
| RD-012 | Defer       | Generated fields, standalone diagnostic charts, and cross-refresh selections need separate ownership. |
| RD-013 | Defer       | LOESS omission/influence and external studentization need additional method contracts.                |
| RD-014 | Avoid       | Automatic deletion, model winners, and hypothesis badges overstate the evidence.                      |
| RD-015 | Avoid       | Keep the working solver; never derive residuals from display equations.                               |

Local review keeps four milestones and their docs/examples.
It makes Pro's capacity/latency budgets provisional and requires measurement before worker machinery.
It also requires translation tests before adopting the proposed near-zero-scale guard.
A response-magnitude guard can change under a large additive response offset.
The plan corrects browser discovery to `.e2e.ts` plus an explicit project and avoids a guessed screenshot entry sequence.

## Evidence and limits

Two existing library test files pass all 42 tests.
A local scratch check uses current predictors for 1,079 numeric assertions.
It checks noisy line, curvature, spread, influence arithmetic, omission error, coordinate/unit transforms,
pooled prediction, LOESS span probes, and the 500/501-row evaluator boundary.
This confirms arithmetic and existing predictors, not the proposed diagnostics implementation.
It does not prove new UI selection, source refresh actions, polynomial leverage, Q–Q code, saved recipes, or performance.
Original reports, ZIP, and scratch evidence remain under ignored `tmp/pro-regression-diagnostics-2026-10-24/`.

Open questions are implementation measurements: supported row capacity, interaction latency, and numerical guards.
Durable business-key export metadata can wait for a concrete consumer.
No demand study, solver replacement, or new modeling service blocks M1.

## Preserved Pro result materials

[Complete original Pro artifacts](../../intent/regression-diagnostics/assets/pro-results/regression-diagnostics-2026-10-24/ASSET_INDEX.md) are preserved under the intent entry. ZIP containers remain local.
