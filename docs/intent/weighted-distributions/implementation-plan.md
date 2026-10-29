# Weighted distributions

Build native weighted ECDFs first. Add configurable percentiles, then weighted boxes.
Keep each source record once. Show weight totals beside source counts and expose the records behind each share.

Status: reviewed Methods proposal, October 23, 2026. No feature has been implemented.
The [research summary](../../research/weighted-distributions-2026-10-23/README.md) records the sources and local dispositions.
The [Pro conversation](https://chatgpt.com/c/6adb07af-a2d0-83e9-82d2-1c0cd65863bc) holds the full method comparison.
Baseline: `6d9130ba1c5242c15bbbeb9b20b7fd0707d0aa0e`.

## Method and scope

For each curve, start from its current peer, local, workspace, and facet population.
Eligible rows have finite x and finite nonnegative weight. Positive contributors have weight greater than zero.
Zero-weight rows remain eligible and inspectable. Missing, invalid, nonfinite, and negative weights are excluded.
Use `numericExclusionReason`, `parseNumber`, and `finiteNumber` from `src/lib/valueParsing.ts`.
Assign one primary exclusion per row: validate x first, then weight.

For eligible total weight W greater than zero:

- Lower share F(t) is the weight at x ≤ t, divided by W.
- Inclusive upper share U(t) is the weight at x ≥ t, divided by W.
- Inclusive interval share uses all eligible weight at a ≤ x ≤ b, divided by W.
- Q(p) is the first positive-support value whose cumulative weight reaches pW.
- Exact cumulative boundaries choose the lower value. Q(0) and Q(1) use positive-support extrema.

Both directions include ties. Thus F(t) + U(t) equals one plus the mass at t.
Compute upper mass directly; `1 - F(t)` excludes the tie and can erase small tails.
Weighted percentiles use the same x in either direction. Place markers at the actual attained directional share.
Label the method **inverse ECDF**. Keep current unweighted crossings and interpolated box quartiles.

This method is scale invariant in exact arithmetic and agrees with integer replication using type 1 quantiles.
It does not generally agree with type 7 interpolation, including the current unweighted box calculation.
For x=[0,10], w=[1,3], Q(.25)=0. Original-row interpolation gives 2.5; replicated type 7 gives 7.5.
Do not silently change methods based on a weight label.

## M1 — Complete weighted ECDF

Users choose **Weight by**, compare grouped weighted shares, select ranges, and inspect numerator and denominator records.
Ship fixed weighted Q50/Q90 markers with the curve. Existing defaults already enable these marks.

### Files and API

Paths below start at `packages/explorEDA/`, unless stated otherwise.

- Add `weightField?: string` and `weightUnit?: string` to `src/components/charts/Ecdf/definition.ts`.
  No field means existing row counts. A missing configured field shows an error and retains its saved name.
  The unit changes labels only. Default copy says **Weighted share** and shows the weight field.
- Add a focused `weightedDistribution.ts` beside `ecdfPlan.ts` with classification, ties, cumulative mass, queries, and IDs.
  Keep it local until a second consumer exists. Do not extend `BaseChartSettings` or all aggregate reducers.
- Extend `ecdfPlan.ts`, `EcdfChart.tsx`, and `EcdfSettingsPanel.tsx` for the weight column, memo inputs, states, and labels.
- Extend `ecdfTrace.ts` and `EcdfTraceBody.tsx` for weighted evidence and curve-level targets without positive marks.
  Distinguish requested percentiles when Q50 and Q90 share one x. Reuse shared trace dispatch and header access.
- Register settings in `src/lib/dsl/settingKeys.ts`; validate them in `src/utils/saveDataUtils.ts`.
  Use existing `src/lib/dsl/compile.ts` and `export.ts` paths for round trips and escaping.
- Update docs-kit setting descriptions. Reuse field pickers, real tooltips, and compact settings controls.

The Pro meaning selector becomes **Defer** locally. A field name and optional unit suffice for the first release.
Never infer people, sampling validity, precision, or sample size from total weight.
Do not invert inclusion probabilities automatically. Frequency, reliability, and exposure require different interpretations.

### Numerical contract

Sort by x and source ID. Pool exact x ties, retaining every source ID.
Scale each independent denominator by its maximum positive weight M, then use Neumaier compensated accumulation.
Keep correction across tie boundaries. Use the forward endpoint as the canonical scaled total T.
Build inclusive suffixes separately. Divide masses by T, not by a raw total that can overflow.
For an interval query, sum its selected weights directly after locating its bounds.
Compare quantiles with pT without display rounding or an arbitrary epsilon.

Keep M, T, and the raw total when finite. Raw overflow does not invalidate normalized shares.
Distinguish numerical limits from exclusions. A positive input that scales to zero remains a positive contributor.
For that affected curve, mark normalized results unavailable and retain its records and reason.
This local choice replaces Pro's approximate-curve mode and partial quantile availability with one clear state.
Rounded cumulative plateaus receive a precision warning; do not promise exact real-number breakpoints.
Keep tiny nonzero tail values visible in traces with suitable formatting.
No decimal engine, new dependency, arbitrary-precision fallback, or row replication is needed.

Expected cost: O(n log n) planning, O(n) storage, binary-search scalar queries, and lazy O(k) record enumeration.
Do not copy cumulative ID arrays at every knot.

### Groups, scope, selection, and evidence

Rank weighted groups by total mass, then label and typed category key.
Compare scaled total representations in a common scale, keeping positive groups ahead of true zeros.
Keep ten named groups plus pooled Other. Recompute Other and overall from original rows, never averaged percentages.
Keep all-zero and wholly invalid groups in the trace inventory.
Keep existing category colors and all-source x-domain behavior, including local population restriction.
A nonpositive x still prevents log x even when its weight is zero.

Keep inclusive x `RangeFilter` selection. Do not add hidden weight eligibility or nearest-curve group filters.
A valid-x record with zero or invalid weight can still be linked-selected.
The chart's own interactive selection does not rebase its curve denominator; peers and its local population do apply.
Verify this with a mounted provider. Hand-supplied planner IDs cannot prove filter ownership.

Each trace must expose:

- Curve identity, scope, revision, x field, weight field, optional unit, method, and Other constituents.
- Source, eligible, positive, zero, and excluded counts. Preserve both count reconciliation identities.
- Numerator and denominator weight, normalized share, bounds, and numerical status.
- Eligible and positive numerator IDs; denominator eligible, positive, and zero IDs; tie IDs and mass.
- Excluded IDs with original x/weight values and one primary reason.
- Quantile p, chosen x, F(x−), F(x), and actual directional ordinate.

Use existing Alt-click, Alt-Enter, and header trace access. Keep linked selection counts separate from contributor counts.
Data, calculation, weight, or scope changes must invalidate resolved evidence.

### Annotations

Guard calculated reference lines while weighting is active. Preserve their saved definitions and show an unsupported status with a reason.
Use the current resolution and Notes status paths in `src/lib/annotations/resolve.ts` and chart annotation components.
Keep fixed rules, bands, and regions. Preserve each chart's existing callout support; do not add record callouts to ECDF.
Clearing Weight by restores ordinary calculated-line resolution.

Local source narrows Pro's broader guard: only reference lines currently have `calculated` operands.
Bands and regions have numeric bounds. Do not build a speculative recursive operand scanner.
Do not remove the full annotation frame or suppress fixed y=.5 rules.

### Tests, docs, example, and risk

Use the exact fixture below for the helper and planner. Add mounted-provider tests for peers and self-filter exclusion.
Add focused trace, missing-field, saved-validation, DSL, and annotation checks in their existing suites.
Preserve unweighted `ecdfPlan.test.ts` and `BoxPlot/boxPlotCalculations.test.ts` results.

Update `apps/demo/src/docs/pages/ecdf.mdx`: **Weight by**, **What a share means**, **Selected records and contributors**,
**Quantile marks**, **Zero and excluded weights**, and **Annotations**.
Add `apps/demo/src/demos/weightedDistributionsDashboard.ts` and `apps/demo/public/datasets/weighted-distributions.csv`.
Register `/examples/weighted-distributions` in `demos/examples.ts` and its capabilities in `demos/coverage.ts`.
Add a live docs example in `docs/live/examples.ts` using the same data and actual saved settings.
Show unweighted and weighted ECDFs, grouped overall, a PeerKeep filter, and a record table.
Use visible r00–r15 labels in browser checks; imported labels are not provider numeric IDs.

Risk: a plausible percentage can describe a different population from its trace or linked records.
Ship gate: select [2,4], see seven records and four positive contributors totaling 6/24; apply the peer and obtain 6/7.
Save and restore that state with the same field, filter, method, and evidence.

## M2 — Configurable percentiles

Add `quantileLevels?: number[]`, defaulting to [.5,.9] in weighted mode.
Accept one to seven unique finite probabilities in [0,1]. Sort user edits; validate saved arrays.
Keep `showQuantiles` as the visibility control. Levels remain saved when hidden or weighting is cleared.
Extend the same ECDF plan, settings, renderer, trace, DSL, and saved-validation files from M1.
Show requested percentile, value, attained share, jump interval, and method through existing surfaces.

Tests: use the quantile vectors below. For full Q50=10, lower ordinate=1 and upper ordinate=2/3.
After the peer, Q50=2, lower ordinate=5/7 and upper ordinate=6/7.
At x=[0,10], w=[1,1], Q50=0; adjacent binary64 probabilities around .5 choose 0 then 10.
Test colliding marks, invalid drafts, saved round trips, and existing undo grouping.

Update **Quantile marks** in `ecdf.mdx` and add a quantile-focused live view to the weighted-distributions example.
Risk: confusing a requested percentile with a directional tail crossing or an attained percentage.
Ship gate: percentile x values stay fixed when the chart direction changes.

## M3 — Weighted boxes

Move the tested helper to `src/lib/weightedDistribution.ts` when boxes become its second consumer.
Add a weighted path beside `BoxPlot/boxPlotCalculations.ts`; extend its definition, renderer, settings, trace, DSL, and validation.
Add the same weight field and unit to box settings. Preserve ordinary unweighted interpolation.

Use inverse Q1/Q2/Q3. Min/max uses positive-support extrema.
Tukey fences use Q1−1.5IQR and Q3+1.5IQR; whiskers use observed positive-support values within them.
Outliers retain original positive-contributor IDs. Zero-weight records stay inspectable but do not set the box or whiskers.
Draw one observation glyph per positive source row under existing caps. Never replicate glyphs by weight.
Keep weighted violin, standard-deviation whiskers, and inference unavailable. Preserve incompatible settings with an explanation.
If fence arithmetic overflows, make Tukey whiskers unavailable; allow min/max only by explicit choice.

Tests: full A has Q1=Q2=Q3=10, whiskers 10..10, outlier IDs [0,1,2].
Full B has quartiles [2,3,3], whiskers 2..3, outlier ID 10.
Overall has quartiles [3,10,10], whiskers 1..10, no outliers.
After the peer, A=[1,2,2], B=[2,3,3], overall=[2,2,3], all without outliers.
Keep the unweighted [1,2,3,4,100] result: quartiles [2,3,4], whiskers 1..4, outlier 100.

Update `boxplot.mdx`: **Weight by**, **Quantile method**, **Whiskers and outliers**, and **Observations**.
Add weighted boxes beside their ECDFs in the same runnable example and live docs registry.
Risk: mixing weighted quartiles with unweighted density or dispersion under one label.
Ship gate: box, ECDF quantiles, and traces agree for the same scope while unweighted outputs stay unchanged.

## Exact fixture and expected values

Rows are [controlled snapshot ID, group, x, weight, PeerKeep].
For CSV, use r00–r15 as a visible Record column. Preserve blanks as missing during actual ingestion.

```text
0   A  1     1          true
1   A  2     2          true
2   A  2     1          true
3   A  4     0          true
4   A  10    16         false
5   A  3     -1         true
6   A  null  5          true
7   A  5     null       true
8   B  2     1          true
9   B  3     2          true
10  B  8     1          false
11  B  9     "bad"      true
12  C  2     0          true
13  C  6     0          false
14  A  7     "Infinity" true
15  A  "bad" -2         true
```

| Scope        | Source / eligible / positive / zero / excluded | Weight | Q0,Q25,Q50,Q75,Q90,Q100 |
| ------------ | ---------------------------------------------- | ------ | ----------------------- |
| Full overall | 16 / 10 / 7 / 3 / 6                            | 24     | 1,3,10,10,10,10         |
| Full A       | 10 / 5 / 4 / 1 / 5                             | 20     | 1,10,10,10,10,10        |
| Full B       | 4 / 3 / 3 / 0 / 1                              | 4      | 2,2,3,3,8,8             |
| Full C       | 2 / 2 / 0 / 2 / 0                              | 0      | unavailable             |
| Peer overall | 13 / 7 / 5 / 2 / 6                             | 7      | 1,2,2,3,3,3             |
| Peer A       | 9 / 4 / 3 / 1 / 5                              | 4      | 1,1,2,2,2,2             |
| Peer B       | 3 / 2 / 2 / 0 / 1                              | 3      | 2,2,3,3,3,3             |
| Peer C       | 1 / 1 / 0 / 1 / 0                              | 0      | unavailable             |

Full eligible IDs: [0,1,2,3,4,8,9,10,12,13]; positive: [0,1,2,4,8,9,10]; zero: [3,12,13].
Excluded IDs: [5,6,7,11,14,15]. ID15 contributes only an x exclusion, not another negative-weight exclusion.
The peer removes IDs [4,10,13].

At x=2, full F=5/24 and U=23/24; peer F=5/7 and U=6/7.
The tie has weight 4, eligible IDs [1,2,8,12], and positive IDs [1,2,8].
In [2,4], linked-selected IDs are [1,2,3,5,8,9,12], eligible IDs [1,2,3,8,9,12], positive IDs [1,2,8,9].
The numerator is 6. The full share is 1/4; peer share is 6/7. Linked-selected IDs stay the same.
For x≤2, selected IDs are [0,1,2,8,12]. For x≥2, selected IDs are [1,2,3,4,5,7,8,9,10,11,12,13,14].

Additional focused checks:

- Group cap: twelve groups g01–g12 with x=weight=1..12, plus two zero rows in gz.
  Show g12 through g03, then Other=(g02,g01,gz), weight 3. Overall weight=78 and Q50=9.
  Remove g12: show g11 through g02, Other weight=1; overall weight=66 and Q50=8.
- Scale all finite fixture weights by 2, 2^500, and 2^-500. IDs and quantiles stay exact; shares agree within 1e-14.
  Check an ordinary decimal rescaling away from jump ambiguity. Do not promise bitwise arbitrary-rescaling equivalence.
- MAX_VALUE weights at x=[1,2]: raw total overflows, F(1)=U(2)=.5, Q50=1.
  MIN_VALUE weights at both x values still give halves. MIN_VALUE/MAX_VALUE together trigger the unavailable precision state.
- Weights [1e16,1] retain a positive direct upper tail at x=2, about 1e-16. Use relative tolerance and assert greater than zero.
- All-zero, empty, invalid-only, one positive observation, missing field, parser classes, zero-weight log failure, and tie ordering.
- JSON and DSL round trips retain weight, unit, direction, span, levels, overall, and mark settings.
  Include a weight field with spaces and quotes. Clearing weight restores current unweighted behavior.

## Implementation verification

At each milestone, run focused helper, planner, trace, provider, validation, DSL, and annotation suites for its changed behavior.
Run `pnpm --filter exploreda check-types`. For examples, run demo coverage and dashboard-text tests immediately.
Run demo docs checks and live example verification. Build declarations before demo type checks after public type changes.
Run `pnpm check` once before each implementation PR and add a minor changeset for its package feature.

Use real input at 1280, 783, and 390 pixels. Open the fresh example, select [2,4], inspect evidence, apply the peer, and restore.
Check keyboard selection and trace access, independent clearing, fixed domain, direction changes, and zero-group access.
Keep settings, labels, status, and trace tables within the viewport. Use `pnpm shot` for PR screenshots.
The planning PR runs doc and format checks only. These future acceptance checks have not passed for unbuilt behavior.

## Preserved Pro result materials

[Original Pro reports and artifacts for #514](assets/pro-results/weighted-distributions-2026-10-23/ASSET_INDEX.md)

All extracted result materials are preserved without ZIP containers. Original bytes and attribution are unchanged.
