# Weighted distributions — implementation plan

**Build a complete native weighted ECDF, then configurable quantiles, then weighted boxes.** Each milestone below can ship without the later milestones. Keep React, TypeScript, pnpm, the existing source-row identity, and shared filtering/settings/trace contracts.

- **Target integration path:** `docs/intent/weighted-distributions/implementation-plan.md`.
- **Baseline:** `6d9130ba1c5242c15bbbeb9b20b7fd0707d0aa0e`, from the complete 28-file source packet.
- **Methods report:** [report.md](report.md), including primary-source comparisons and stable `WD-01` through `WD-15` recommendations.
- **Status:** worker-ready proposal; no repository code, tests, or browser behavior have been changed or executed by this mission.
- **Authority:** this mission and `docs/research/DIRECTION.md` supersede the older outside-demand gates. No analyst recruitment, study, manifest, or integrity receipt is required.
- **Ownership:** Codex reviews decisive claims, implements, verifies, commits, and opens the PR. This plan is not a claim that implementation acceptance has passed.

## 1. Fixed decisions for every milestone

### Method and eligibility

For current curve source scope `S`, eligible rows have finite parsed x and finite parsed weight `w≥0`. Positive contributors have `w>0`. Zero-weight rows remain eligible and inspectable.

With `W=Σw>0`:

- Lower share: `F(t)=Σw·1[x≤t]/W`.
- Inclusive upper share: `U(t)=Σw·1[x≥t]/W`.
- Inclusive interval: `Σw·1[a≤x≤b]/W`.
- Quantile: the smallest **positive-support** x whose lower cumulative mass reaches `pW`.
- At `p=0` choose minimum positive-support x; at `p=1` choose maximum positive-support x.
- Exact cumulative boundary chooses the lower support value; no interpolation or midpoint.
- Empty, wholly ineligible, and all-zero distributions are distinct unavailable states.
- Negative weights are excluded, never canceled or converted to absolute values.
- One primary exclusion per row: x validation first, then weight validation.
- No sample size, confidence, survey validity, or precision is inferred from total weight.

Use `valueParsing.ts`, retaining its numeric-string, missing, blank, boolean, radix-text, and nonfinite rules. Meaning and unit are labels only; they never invert or rescale a column.

### Selection, scope, and compatibility

- Keep the current unweighted ECDF path, including its existing directional marks.
- Keep `BoxPlot/getQuartile` interpolation at `(n−1)p` for unweighted boxes.
- Keep source records unique. Do not replicate, deduplicate ties, or substitute weighted totals for row counts.
- Keep current inclusive numeric x `RangeFilter` selection.
- A zero- or invalid-weight record with valid x can still match a linked range.
- Do not add hidden weight-eligibility or nearest-curve category filters.
- The ECDF’s own selection does not rebase its reference denominator. External peers, local scope, workspace filters, and facets apply according to the existing chart scope contracts.
- Keep the all-source x domain and the current log-unavailable/linear-fallback policy.
- In weighted mode, sort live groups by raw total weight; keep ten named groups plus pooled Other. Unweighted ranking remains by valid-x row count.
- Other and overall are recomputed from original source rows, never from averaged percentages.
- Do not add an Other filter control in M1. Trace its actual categories; real-category controls retain their existing semantics.
- Weighted p50/p90 are lower-inverse percentiles in either direction. Their y coordinate is the actual lower/upper share at the selected x.

### Source boundaries workers must inspect

These are implementation integration checks, not missing research prerequisites.

The packet includes the entire ECDF implementation and tests, box calculations/tests, parsing, aggregates, Composition types, DSL key catalog, chart types, docs, and demo registries. It identifies but does not include:

- Shared `useGetLiveIds` / `useGetAllIds` hook implementations and the filter/store plumbing.
- `src/utils/saveDataUtils.ts` saved-data validation.
- `src/lib/dsl/compile.ts` and `export.ts` implementation.
- `src/lib/annotations/` resolution/status implementation.
- Shared trace dispatch/types beyond the ECDF adapter.
- CSV import implementation.
- The box renderer/settings implementations imported by `BoxPlot/definition.ts`.

Read the relevant files in the full checkout before editing those seams. Do not invent current signatures or duplicate the shared machinery.

## 2. Milestones and stopping points

| Milestone | Independently shippable result |
| --- | --- |
| **M1 — Native weighted ECDF** | Weight field, meaningful labels, both inclusive tails, group/Other/overall totals, fixed correct Q50/Q90 marks, all evidence scopes, numerical states, annotation protection, persistence, docs, and a runnable example. |
| **M2 — Configurable quantile readouts** | A bounded set of requested percentiles, stable direction-independent values, and compact jump/attained-share evidence using M1’s method. |
| **M3 — Weighted boxes** | Weighted inverse quartiles, min/max or Tukey whiskers, original outlier IDs, and shared narrow distribution math, with docs and an example. |

M1 must not ship a curve whose tracing, exclusions, selection explanation, default marks, or restoration are deferred to M2.

Stop after a milestone’s required acceptance is satisfied. Histogram weighting, broad annotation statistics, inference, and universal reducers are not additional gates.

## 3. M1 — Native weighted ECDF

**Recommendations:** WD-01, WD-02, WD-03, WD-04, WD-05, the fixed-mark portion of WD-06, WD-08.  
**Main risk:** displaying a plausible percentage while source scope, selected rows, or denominator records refer to different populations.

### 3.1 Files and modules

Under `packages/explorEDA/src/components/charts/Ecdf/`:

- **`definition.ts`:** add the optional settings, read-time defaults, descriptions, and validation. Preserve `getFilterFunction` and its prefetch-before-row-test pattern.
- **New `weightedDistribution.ts`:** a focused pure helper for classification, ties, stable mass, inclusive queries, inverse quantiles, and source membership. These proposed helper names are not current symbols:
  - `classifyWeightedRows`.
  - `buildWeightedDistribution`.
  - `weightedShareAt`.
  - `weightedMassInRange`.
  - `weightedQuantile`.
- **New `weightedDistribution.test.ts`:** mathematical fixtures and numeric-state checks below.
- **`ecdfPlan.ts`:** resolve row or weight basis, retain current unweighted paths, build weighted curve plans, group ranking, Other/overall evidence, and fixed quantile marks.
- **`ecdfPlan.test.ts`:** plan-level shares, source counts, grouping, stable x domain, log behavior, and unweighted preservation.
- **`EcdfChart.tsx`:** resolve the weight column once, include it in snapshots and memo dependencies, render weighted readouts, status/empty states, and accessible fixed marks.
- **`EcdfSettingsPanel.tsx`:** Weight by, meaning, unit, explanatory tooltips, and weighted mark wording.
- **`ecdfTrace.ts` / `EcdfTraceBody.tsx`:** paired x/weight evidence, numerator and denominator views, zero/exclusion views, curve-level empty targets, and quantile evidence.
- **`EcdfChart.test.tsx`:** store-backed peers/selection and keyboard/trace integration.

Other existing locations:

- `packages/explorEDA/src/lib/valueParsing.ts`: consume existing helpers; change them only if a concrete shared requirement is found. Do not create a chart-specific coercion policy.
- `packages/explorEDA/src/lib/dsl/settingKeys.ts`: register all new saved keys in `CHART_SETTING_KEYS.ecdf`.
- `packages/explorEDA/src/types/ChartTypes.ts`: verify union propagation; do not add observation weights to every chart’s base settings.
- `packages/explorEDA/src/utils/saveDataUtils.ts`: inspect and extend saved-data validation where required.
- `packages/explorEDA/src/lib/dsl/compile.ts` / `export.ts`: reuse existing field/string/setting encoding and add focused round-trip tests.
- `packages/explorEDA/src/lib/annotations/`: inspect the current resolve/status seam for the narrow guard below.
- `packages/explorEDA/src/components/charts/trace/` and shared trace presentation: extend only the dispatch/targets needed by ECDF.
- Docs-kit setting descriptions identified in `docs/agent-guide.md`: describe every new setting in the same PR.

The filenames for new helper/test modules are proposals. Existing files above are grounded either in the packet or explicitly in its agent guide.

### 3.2 Saved API

Add only to `EcdfSettings`:

```ts
weightField?: string;
weightMeaning?: "mass" | "frequency" | "sampling" | "reliability" | "exposure";
weightUnit?: string;
```

Behavior:

- No `weightField` means existing unweighted behavior.
- UI clear stores `undefined`. Normalize an empty field selection at the input boundary.
- Omitted meaning is read as `"mass"` without injecting defaults into every old save.
- Meaning/unit do not change membership, arithmetic, or the quantile method.
- A present field name must resolve; missing fields produce an actionable chart state.
- Fractional frequency values remain valid mass but cannot claim literal represented counts.
- Changing/clearing the weight field preserves the x-range filter and existing saved annotations.
- New optional settings round-trip through JSON and Dashboard text. Invalid enum/type values use existing validation errors.
- Save settings, not computed cumulative tables or contributor arrays.

A complete existing-default chart with these overrides is the canonical save case:

```ts
{
  type: "ecdf",
  field: "Value",
  colorField: "Group",
  weightField: "Weight",
  weightMeaning: "mass",
  weightUnit: "units",
  direction: "above",
  showOverall: true,
  showQuantiles: true,
  logX: false,
  filters: [{ type: "range", field: "Value", min: 2, max: 4 }]
}
```

This is an **override object**, not the complete saved chart schema; generate the rest through `ecdfDefinition.createDefaultSettings`.

### 3.3 Numerical implementation contract

Use binary64 with bounded, inspectable limitations:

1. Parse/classify scoped rows once and retain raw values plus source IDs.
2. Sort by x then source ID; pool exact numeric ties only.
3. For each independent denominator choose `M=max positive weight`, scale `u=w/M`, and accumulate with a local Neumaier helper.
4. Retain compensation across tie boundaries. If merging a two-part tie sum, add both components to the next accumulator.
5. Build forward inclusive cumulative masses and independent reverse inclusive masses. The final forward sum is canonical `T`.
6. Use `mass/T` for both directions. For intervals, locate boundaries and sum selected contributors directly when queried.
7. Compare quantile cumulative mass to `p*T` without display rounding or a fixed epsilon. Define endpoints from positive input support.
8. Store raw total only if `M*T` is finite; otherwise retain `M,T` and overflow status.
9. Detect positive input weights that scale to zero. Keep them positive in counts/IDs, mark that curve approximate, and return unavailable for all `0<p<1` quantiles of that curve. Endpoints remain available.
10. Detect rounded positive increments for precision diagnostics. Interior quantiles remain queryable, but every result from that affected curve carries an approximate/precision-warning status; never present it as numerically exact. This differs from scaled underflow in step 9. Do not claim universal breakpoint accuracy or bitwise arbitrary-decimal scale invariance.
11. Set only the mathematically known outer tails:
    - `F(t)=0` below minimum positive support; `F(t)=1` at/above maximum.
    - `U(t)=1` at/below minimum positive support; `U(t)=0` strictly above maximum.
    - `F(min)` and `U(max)` retain their actual endpoint mass.
12. Clamp only final last-bit excursions outside `[0,1]`; do not modify mass to conceal underflow.

A proposed runtime amount shape is:

```ts
type WeightTotal = {
  scale: number;        // Maximum positive input weight, or 0 for no mass.
  scaled: number;       // Canonical compensated total in this scale.
  raw?: number;         // Present only if finite.
  rawOverflow: boolean;
};
```

Keep numeric statuses distinct from data exclusions. Their exact TypeScript shape can follow current plan conventions; the semantic distinction is mandatory.

For mass ranking, compare group totals using their `(M,T)` representations in a pairwise common scale. Put true zero groups after positive ones, including extremely small positive groups. Never rank by independently normalized totals.

No copied cumulative ID arrays: retain tie membership, prefix/suffix numbers, source indexes, and lazy record enumeration. Expected costs are `O(n log n)` planning time, `O(n)` space, `O(log m)` scalar queries, and `O(k)` materialized membership or selected-interval accumulation.

### 3.4 Curves, groups, and evidence

Keep count and weight fields distinct:

- `sourceCount` is the current scoped original-row count.
- `eligibleCount` includes zero weights.
- `positiveCount` excludes true zeros.
- `zeroCount` and `excludedCount` reconcile.
- `totalWeight` is an amount, never a renamed `count`.
- `allSourceCount`, if shown, means all source rows before peers.

Retain original records and group identity before numeric eligibility so wholly invalid or all-zero groups remain inspectable.

Weighted curve behavior:

- Rank descending live mass; tie-break by category label then typed key.
- Show ten named groups and then Other.
- Other includes the union of all remaining original group records, including zero/ineligible rows in evidence.
- Overall uses all scoped source records exactly once.
- Keep the existing categorical color contract.
- Changing peers may change Other membership; expose its current constituents.
- Weight changes do not move the x domain.
- Selection anchors may include every finite live x, including zero/invalid weights, so flat segments can still be selected. Quantile support is separately positive-weight x.

Required evidence views, using existing trace access:

- **Numerator:** threshold/range, raw/scaled weight, eligible/positive IDs.
- **Denominator:** scope, total, all eligible IDs, positive IDs, zero IDs.
- **At this value:** parsed x, tie weight with precision status, all eligible and positive tie IDs.
- **Excluded:** original x/weight values, source IDs, one primary reason per row.
- **Curve:** source/eligible/positive/zero/excluded counts; group and Other membership; unavailable/precision states.
- **Quantile:** p, chosen x, `F(x−)`, `F(x)`, actual ordinate, method, tie IDs.

Use a curve-level trace target for all-zero/invalid groups and a quantile target keyed by curve identity and requested p. A step ID alone cannot distinguish p50 and p90 when both land at x=10. Exact target discriminants should follow shared trace conventions; do not build a separate inspector framework.

At a weighted p50/p90 collision, one visual marker can show both labels. Both requested values and their evidence must remain accessible. Fixed marks ship with complete trace evidence in M1.

### 3.5 Filtering and annotation protection

Keep `EcdfChart.commit` as an x-range operation; nearest-curve tracing does not become implicit group filtering.

Tests must distinguish:

- The curve’s weighted contribution set.
- Original records selected by the chart’s saved range.
- The chart’s peer/local/facet denominator.

Verify the actual hook/store interaction. A planner test with hand-supplied `liveIds` is insufficient to prove self-filter exclusion.

For annotations:

- Preserve every saved annotation object and Notes entry.
- Mark statistic-dependent annotations unavailable while `weightField` is active.
- Suppress only those resolved marks; do not remove `annotationFrame` or `annotationSlot` wholesale.
- Keep fixed numeric rules/bands/regions and record callouts.
- Inspect all statistical operands, including band/region bounds.
- A mixed constant/statistic band is unavailable as a whole.
- Use the existing visible status path with “Statistic unavailable with Weight by” and a fixed-value/weighted-quantile action.
- Clearing Weight by restores ordinary resolution.

The exact annotation discriminants and status enum are worker-inspection items because they are outside the packet.

### 3.6 Documentation and runnable example — part of M1

Update `apps/demo/src/docs/pages/ecdf.mdx` with these sections:

1. **Weight by:** field, declared meaning/unit, neutral default.
2. **What a share means:** finite x/weight eligibility, group denominator, pooled overall.
3. **Selected records and contributors:** numeric range selection versus weighted numerator.
4. **Zero and excluded weights:** missing/negative/nonfinite rules and all-zero states.
5. **Quantile marks:** inverse method, ties, direction-independent p50/p90, difference from ordinary boxes.
6. **Numerical limits:** raw overflow and precision status in plain user-facing language.
7. **Annotations:** fixed values/callouts and the statistical-annotation guard.

Add the runnable route **`/examples/weighted-distributions`**:

- New `apps/demo/public/datasets/weighted-distributions.csv` containing Fixture A below.
- New `apps/demo/src/demos/weightedDistributionsDashboard.ts` using the existing saved-settings contract.
- Register in `apps/demo/src/demos/examples.ts` with `data: "/datasets/weighted-distributions.csv"`.
- Include an unweighted ECDF, a weighted grouped ECDF with overall, a peer filter for `PeerKeep`, and a source table with `Record`, `Group`, `Value`, `Weight`.
- Metadata says **16 source records**, not 24 observations.
- Add `chart:ecdf` plus the actual peer/table chart capabilities to `coverage.ts`. Add a specific weighted capability entry and docs coverage target if using one.
- Use `"shown"`, not `"reviewed"`, until the repository’s dated review evidence exists.
- Add a `liveExamples` entry in `apps/demo/src/docs/live/examples.ts` using the same CSV URL and the dashboard’s actual saved settings. Reuse `focus` for layout.
- Existing `LiveStep` supports brush/rows/chip/select/mark/click/text/choose. Keyboard, Alt-click, trace, and restoration checks belong in dedicated browser/integration tests; do not invent current live-step fields.

Use a stable visible `Record` column for browser assertions. A CSV record column is not automatically the provider’s numeric `sourceId`.

### 3.7 M1 acceptance

Pass all Fixture A, B, C, numeric, persistence, trace, and responsive checks below that are marked M1. Preserve the existing unweighted tests unchanged unless an assertion requires an additional explicit branch for weighted behavior.

**Ship gate:** a reviewer can select `[2,4]`, see seven original rows, inspect four positive contributors totaling six, inspect a denominator of 24, apply the peer filter to obtain denominator seven, and restore the saved state without changing those meanings.

## 4. M2 — Configurable quantile readouts

**Recommendations:** remaining WD-06; preserve WD-02/WD-03/WD-04.  
**Main risk:** labeling a tail crossing or interpolated statistic as an inverse percentile, especially at ties and exact mass boundaries.

### 4.1 Capability and modules

Extend the M1 weighted chart with:

```ts
quantileLevels?: number[]; // Weighted mode only; default [0.5, 0.9].
```

- Accept one through seven unique finite values in `[0,1]`.
- The UI edits percentages; storage uses probabilities.
- Canonicalize user edits to sorted unique values; reject out-of-range/nonfinite drafts without applying them.
- Saved validation checks the canonical shape. No formula grammar or arbitrary statistical method picker.
- `showQuantiles` controls drawing; requested levels remain saved when hidden.
- Keep levels inactive when weighting is cleared, preserving current unweighted marks.
- Add a compact readout in the chart’s existing data/trace surface: percentile, value, lower jump interval, attained directional share, method.
- Do not introduce a new table chart or global summary reducer.
- Reuse M1’s numeric/unavailable statuses and source trace.

Touch `definition.ts`, `EcdfSettingsPanel.tsx`, `ecdfPlan.ts`, `EcdfChart.tsx`, `ecdfTrace.ts`, `EcdfTraceBody.tsx`, their tests, DSL keys, saved validation, and docs-kit descriptions. Retain M1’s local helper.

### 4.2 Exact tests

For Fixture A, `quantileLevels=[0,.25,.5,.75,.9,1]`:

- Full overall values: `[1,3,10,10,10,10]`.
- Peer overall values: `[1,2,2,3,3,3]`.
- Full A values: `[1,10,10,10,10,10]`.
- Full B values: `[2,2,3,3,8,8]`.
- All-zero C: unavailable at every p.

Direction does not change x:

- Full overall Q50 = `10`.
  - Lower ordinate `F(10)=1`.
  - Upper ordinate `U(10)=2/3`.
  - Jump evidence `F(10−)=1/3` and `F(10)=1`.
  - Positive tie ID `[4]`.
- Peer overall Q50 = `2`.
  - Lower ordinate `5/7`.
  - Upper ordinate `6/7`.
  - Jump evidence `1/7 < 1/2 ≤ 5/7`.
  - Positive tie IDs `[1,2,8]` and eligible tie IDs `[1,2,8,12]`.
- Full B Q25 = `2` and Q75 = `3`, exercising exact binary quarter boundaries.
- For `x=[0,10],w=[1,1]`:
  - Q50 = `0` in either direction.
  - Upper ordinate at that x is `1`, not `0.5`.
  - An input probability immediately above `0.5` returns `10`; immediately below returns `0`.
  - Build neighboring binary64 probabilities in a test helper, not by an arbitrary decimal epsilon.

Validate `−.1`, `1.1`, NaN, Infinity, empty arrays, too many levels, and malformed saved arrays. Valid edits do not create extra undo states beyond the existing settings contract.

### 4.3 Docs and example in M2

- Extend `ecdf.mdx`, **Quantiles**, with exact boundary choice, jump intervals, endpoints, and upper-mode interpretation.
- Add a quantile-focused live example ID, such as `weighted-quantiles`, backed by the same fixture/dashboard.
- Add a runnable saved view at the existing `/examples/weighted-distributions` route showing A/B/overall quantile comparisons.
- Update demo coverage and setting descriptions.
- Verify level edits, collision labels, trace, save/restore, and narrow layouts.

**Ship gate:** every displayed weighted percentile identifies its method, returns the stated support value, and remains the same x under a direction switch.

## 5. M3 — Weighted box summaries

**Recommendations:** WD-07, WD-09; preserve WD-08.  
**Main risk:** mixing weighted quartiles with unweighted density/dispersion or silently changing the existing box convention.

### 5.1 Capability and modules

Promote the tested helper to:

- `packages/explorEDA/src/lib/weightedDistribution.ts`.
- `packages/explorEDA/src/lib/weightedDistribution.test.ts`.

Move the narrow functions and their tests, adjusting ECDF imports. Do not introduce a registry of reducers or change `aggregates.ts` / Composition’s `SummaryMark` to accommodate them.

Add a separate weighted path beside the existing functions:

- `BoxPlot/boxPlotCalculations.ts`, or a focused sibling `weightedBoxPlotCalculations.ts`.
- `BoxPlot/boxPlotCalculations.test.ts` plus weighted tests.
- `BoxPlot/definition.ts` and the renderer/settings modules it references; inspect their actual filenames in the checkout.
- Box trace and annotation integration.
- DSL setting keys, saved validation, docs-kit descriptions.

Add the same optional weight field/meaning/unit semantics to **BoxPlotSettings**, without extending all charts’ base settings.

Weighted box rules:

- Quartiles use inverse `Q(.25), Q(.5), Q(.75)`.
- `minmax` uses positive-support extrema.
- `tukey` computes `IQR=Q3−Q1` and observed positive-support whisker endpoints inside `Q1−1.5IQR .. Q3+1.5IQR`.
- Outlier membership retains original positive-contributor IDs, including separate equal-valued source rows.
- Zero-weight records remain in evidence, not quartile/whisker/outlier determination.
- Ordinary observation glyphs are one per original positive record, within the existing visibly disclosed cap; no weighted replication.
- Preserve source/eligible/positive counts and weight totals.
- No weighted standard-deviation whiskers, violin density, notches, or confidence intervals.
- Existing unsupported saved options are preserved and visibly unavailable in weighted mode until the user chooses a supported option; do not silently substitute methods.
- Reuse M1’s statistical-annotation protection for weighted boxes where necessary.

For finite x values whose Tukey fence arithmetic overflows, retain valid quartiles but mark the Tukey whisker calculation unavailable; do not render Infinity or silently switch to min/max. The user can explicitly choose min/max. This is a narrow calculation status, not a new arbitrary-precision engine.

### 5.2 Exact tests

Fixture A, full scope:

| Curve | Expected weighted box |
| --- | --- |
| A | Q1=10, median=10, Q3=10, IQR=0; Tukey fences/whiskers 10..10; outlier IDs `[0,1,2]`; min/max 1..10. |
| B | Q1=2, median=3, Q3=3, IQR=1; fences 0.5..4.5; whiskers 2..3; outlier ID `[10]`; min/max 2..8. |
| Overall | Q1=3, median=10, Q3=10, IQR=7; fences −7.5..20.5; whiskers 1..10; no outliers. |
| C | No weighted box; eligible/zero IDs remain inspectable. |

With `PeerKeep=true`:

- A: `Q1=1,Q2=2,Q3=2,IQR=1`, Tukey whiskers `1..2`, no outliers.
- B: `Q1=2,Q2=3,Q3=3,IQR=1`, Tukey whiskers `2..3`, no outliers.
- Overall: `Q1=2,Q2=2,Q3=3,IQR=1`, fences `0.5..4.5`, whiskers `1..3`, no outliers.
- Zero x=4 does not extend a weighted whisker.

Convention witness `x=[0,10],w=[1,3]`:

- Weighted box: `Q1=0,median=10,Q3=10`.
- Existing unweighted box on the two source rows: `Q1=2.5,median=5,Q3=7.5`.
- Type-7 replication quartile at p=.25 would be `7.5`; it is not the new weighted Q1.

Retain the existing `[1,2,3,4,100]` unweighted test: `Q1=2,median=3,Q3=4,IQR=2`, observed Tukey whiskers `1..4`, outlier `100`.

Test an extreme finite support whose `Q3−Q1` overflows: weighted quartiles remain support values, Tukey state is unavailable, min/max is available only when explicitly selected.

### 5.3 Docs and example in M3

- Extend `apps/demo/src/docs/pages/boxplot.mdx` with **Weight by**, **Quantile method**, **Whiskers and outliers**, **Zero/excluded records**, and **Observations**.
- Explain that the weighted inverse quartile may differ from the existing unweighted interpolation even with equal weights.
- Link from `ecdf.mdx` to the matching box summary.
- Add a **Weighted boxes** view to `/examples/weighted-distributions` and a live docs example such as `weighted-boxplot`.
- Show A’s degenerate dominant-weight box beside its ECDF and source table.
- Register actual capabilities and verify export/recompile of the example.

**Ship gate:** the box, ECDF quantile readout, and source trace agree for the same group/scope/weight settings, while unweighted results remain unchanged.

## 6. Fixture A — exact source and peer contract

Use these programmatic rows for planner/kernel tests. `id` below is the controlled numeric snapshot ID. For the CSV/browser fixture use a visible `Record` column `r00` through `r15` and map its values in assertions instead of assuming provider IDs.

```ts
// [snapshotId, Group, Value, Weight, PeerKeep]
const rows = [
  [0,  "A", 1,     1,          true],
  [1,  "A", 2,     2,          true],
  [2,  "A", 2,     1,          true],
  [3,  "A", 4,     0,          true],
  [4,  "A", 10,    16,         false],
  [5,  "A", 3,     -1,         true],
  [6,  "A", null,  5,          true],
  [7,  "A", 5,     null,       true],
  [8,  "B", 2,     1,          true],
  [9,  "B", 3,     2,          true],
  [10, "B", 8,     1,          false],
  [11, "B", 9,     "bad",      true],
  [12, "C", 2,     0,          true],
  [13, "C", 6,     0,          false],
  [14, "A", 7,     "Infinity", true],
  [15, "A", "bad", -2,         true],
] as const;
```

Also test literal `Infinity` programmatically. Use the string `"Infinity"` in JSON fixtures so JSON serialization does not turn it into null.

The public CSV can be authored exactly as:

```csv
Record,Group,Value,Weight,PeerKeep
r00,A,1,1,true
r01,A,2,2,true
r02,A,2,1,true
r03,A,4,0,true
r04,A,10,16,false
r05,A,3,-1,true
r06,A,,5,true
r07,A,5,,true
r08,B,2,1,true
r09,B,3,2,true
r10,B,8,1,false
r11,B,9,bad,true
r12,C,2,0,true
r13,C,6,0,false
r14,A,7,Infinity,true
r15,A,bad,-2,true
```

Verify the importer’s blank and boolean handling with the actual demo ingestion path. Missing x/weight must remain missing, not numeric zero.

### 6.1 Counts and totals — M1

| Scope | Source / eligible / positive / zero / excluded; weight |
| --- | --- |
| Full overall | `16 / 10 / 7 / 3 / 6; W=24` |
| Full A | `10 / 5 / 4 / 1 / 5; W=20` |
| Full B | `4 / 3 / 3 / 0 / 1; W=4` |
| Full C | `2 / 2 / 0 / 2 / 0; W=0` |
| Peer overall | `13 / 7 / 5 / 2 / 6; W=7` |
| Peer A | `9 / 4 / 3 / 1 / 5; W=4` |
| Peer B | `3 / 2 / 2 / 0 / 1; W=3` |
| Peer C | `1 / 1 / 0 / 1 / 0; W=0` |

Full denominator membership:

- Eligible: `[0,1,2,3,4,8,9,10,12,13]`.
- Positive: `[0,1,2,4,8,9,10]`.
- Zero: `[3,12,13]`.
- Excluded: `[5,6,7,11,14,15]`.

The peer filter removes `[4,10,13]` **before** eligibility:

- Eligible: `[0,1,2,3,8,9,12]`.
- Positive: `[0,1,2,8,9]`.
- Zero: `[3,12]`.
- Exclusions remain `[5,6,7,11,14,15]`.

### 6.2 Disjoint exclusion assertions — M1

| Primary reason | IDs / count |
| --- | --- |
| Value: Missing value | `[6] / 1` |
| Value: Not a finite number | `[15] / 1` |
| Weight: Missing value | `[7] / 1` |
| Weight: Negative weight | `[5] / 1` |
| Weight: Not a finite number | `[11,14] / 2` |

ID15’s negative weight must not create a seventh primary exclusion. The trace can still display its original weight.

### 6.3 Full shares — M1

Positive support `[1,2,3,8,10]` has masses `[1,4,2,1,16]`.

| Threshold x | Lower F(x) / inclusive upper U(x) |
| --- | --- |
| 0 | `0 / 1` |
| 1 | `1/24 / 1` |
| 2 | `5/24 / 23/24` |
| 2.5 | `5/24 / 19/24` |
| 3 | `7/24 / 19/24` |
| 4 | `7/24 / 17/24` |
| 6 | `7/24 / 17/24` |
| 8 | `1/3 / 17/24` |
| 10 | `1 / 2/3` |
| 11 | `1 / 0` |

At x=2:

- Positive tie IDs `[1,2,8]`; eligible tie IDs `[1,2,8,12]`.
- Tie weight `4`.
- `F(2)+U(2)=7/6=1+4/24`.
- Do not force these two inclusive shares to sum to one.

Group checks:

- A: `F(2)=1/5`; `U(2)=19/20`.
- B: `F(2)=1/4`; `U(2)=1`; `F(3)=U(3)=3/4`.
- C: shares unavailable.

### 6.4 Peer shares — M1

Positive support `[1,2,3]` has masses `[1,4,2]`.

| Threshold x | Lower F(x) / inclusive upper U(x) |
| --- | --- |
| 1 | `1/7 / 1` |
| 2 | `5/7 / 6/7` |
| 3 | `1 / 2/7` |
| 4 | `1 / 0` |

At x=2, `F+U=11/7=1+4/7`. Peer filtering does not change the all-source x domain.

### 6.5 Exact selection versus contribution — M1

Full scope:

- **x≤2**
  - Saved filter: `{type:"range",field:"Value",max:2}`.
  - Linked selected IDs: `[0,1,2,8,12]`.
  - Positive numerator IDs: `[0,1,2,8]`.
  - Eligible numerator IDs: `[0,1,2,8,12]`.
  - Numerator weight `5`; denominator `24`.
- **x≥2**
  - Saved filter: `{type:"range",field:"Value",min:2}`.
  - Linked selected IDs: `[1,2,3,4,5,7,8,9,10,11,12,13,14]`.
  - Positive numerator IDs: `[1,2,4,8,9,10]`.
  - Numerator weight `23`; denominator `24`.
- **2≤x≤4**
  - Saved filter: `{type:"range",field:"Value",min:2,max:4}`.
  - Linked selected IDs: `[1,2,3,5,8,9,12]`.
  - Eligible numerator IDs: `[1,2,3,8,9,12]`.
  - Positive numerator IDs: `[1,2,8,9]`.
  - Numerator weight `6`; denominator `24`; share `1/4`.

Under `PeerKeep=true`:

- x≥2 linked IDs: `[1,2,3,5,7,8,9,11,12,14]`.
- x≥2 positive numerator: `[1,2,8,9]`; mass `6`; denominator `7`.
- [2,4] linked/eligible/positive numerator sets are unchanged from full [2,4].
- [2,4] share is `6/7`.
- Applying the ECDF’s own range leaves the ECDF denominator at `7`.
- Clearing the peer while retaining the range restores denominator `24` and share `1/4`.
- Clearing the range does not clear the independent peer filter.
- Switching direction preserves bounded [2,4]; preserve the current behavior that clears a one-sided range on direction change.

Clicking while tracing A does not implicitly add a Group=A filter. With an explicitly active Group=A selection, [2,4] linked IDs become `[1,2,3,5]`, while A’s positive numerator is `[1,2]` with weight `3`.

### 6.6 Quantiles — kernel/M1 fixed marks, M2 configurable UI

Probability order is `[0,.25,.5,.75,.9,1]`:

| Scope | Expected values |
| --- | --- |
| Full overall | `[1,3,10,10,10,10]` |
| Full A | `[1,10,10,10,10,10]` |
| Full B | `[2,2,3,3,8,8]` |
| Peer overall | `[1,2,2,3,3,3]` |
| Peer A | `[1,1,2,2,2,2]` |
| Peer B | `[2,2,3,3,3,3]` |
| C | Unavailable for every level. |

Quarter-boundary assertions are exact. Treat nonbinary probabilities such as `1/5` using the documented binary64 comparison contract, rather than silently importing another package’s fuzz rule.

## 7. Fixture B — group cap and pooled Other, M1

For `i=1..12` create:

- Source ID `100+i`.
- Group `g01` through `g12`.
- x `i`.
- Weight `i`.

Add:

- ID113: group `gz`, x `0`, weight `0`.
- ID114: group `gz`, x `1`, weight `0`.

Every row is eligible. The zero-weight x=0 still makes requested log unavailable under the preserved full-source rule.

| Scope | Expected grouping and totals |
| --- | --- |
| Full | Show `g12,g11,g10,g09,g08,g07,g06,g05,g04,g03`. Other is `g02,g01,gz`, with IDs `[101,102,113,114]`, source/eligible 4, positive 2, zero 2, weight 3. Overall source/eligible 14, positive 12, zero 2, weight 78. |
| Peer removes ID112/g12 | Show `g11,g10,g09,g08,g07,g06,g05,g04,g03,g02`. Other is `g01,gz`, IDs `[101,113,114]`, source/eligible 3, positive 1, zero 2, weight 1. Overall source/eligible 13, positive 11, zero 2, weight 66. |

Full Other:

- `F(0)=0,U(0)=1`.
- `F(1)=1/3,U(1)=1`.
- `F(2)=1,U(2)=2/3`.
- Q50=`2`.
- Other remains last even though its pooled weight `3` equals g03’s weight.

Peer Other:

- `F(1)=U(1)=1`.
- `F(2)=1,U(2)=0`.
- Every quantile including endpoints is `1`.

Overall Q0/Q25/Q50/Q75/Q90/Q100:

- Full: `[1,6,9,11,12,12]`.
- Peer: `[1,6,8,10,11,11]`.

Assertions must catch double-counting Other in overall and averaging group-normalized shares.

## 8. Fixture C — convention and scale proofs, M1 kernel

### 8.1 Three-way convention discriminator

`x=[0,10],w=[1,3]`:

| Method | p=1/4 |
| --- | --- |
| Selected weighted inverse | `0` |
| Existing type 7 on original two rows | `2.5` |
| Type 7 on replicated `[0,10,10,10]` | `7.5` |

An additional scale counterexample at p=.2:

- Inverse with weights `[1,3]`: `0`.
- Type 7 on the original source rows: `2`.
- Type 7 on replication with counts `[1,3]`: `6`.
- Type 7 on replication with counts `[2,6]`: `4`.
- Inverse remains `0` after this uniform doubling.

For a binary-exact incompatibility proof, use `x=[0,10],p=.25`:

- Replicated type 7 for `w=[1,1]` is `2.5`.
- Replicated type 7 for `w=[2,2]` is `0`.
- Selected inverse is `0` for both.

Use a tiny replicated array **only inside the test oracle**. Production and demo data are never expanded.

### 8.2 Scale invariance

Multiply every finite numeric weight in Fixture A by:

- `2`.
- `2^500`.
- `2^-500`.
- `3`.
- Optional ordinary-range decimal scale `1e-200` and `1e200` to exercise the same observable contract away from boundary ambiguity.

Keep missing/invalid/nonfinite tokens unchanged. Negatives remain negative; genuine zeros stay zero.

Expected:

- Same eligibility, positive/zero/excluded IDs, curve ordering, and linked selection.
- Same mathematical shares and listed quantile support values.
- Raw totals multiply: overall `24c`, A `20c`, B `4c`; peer overall `7c`.
- For exactly representable power-of-two scaling, normalized inputs follow the same computation.
- Compare ordinary fixture shares within `1e-14` absolute tolerance, while asserting IDs and selected quantile x exactly.
- Do not promise all arbitrary rescalings preserve a breakpoint result bit for bit.
- Scaling by zero is not invariance: it creates an all-zero denominator.

## 9. Parser and numeric acceptance matrix — M1

Use separate focused tests rather than bloating the main fixture.

### 9.1 Parser classes

With a valid x:

- `"2.5"` → eligible positive weight `2.5`.
- `"0"` and numeric `−0` → eligible zero.
- `null`, `undefined`, `""` → missing.
- Whitespace-only string → blank.
- Boolean `true` → invalid numeric input.
- `"0x10"` → invalid.
- `"bad"`, NaN, ±Infinity, `"Infinity"` → invalid/nonfinite.
- `−1` → negative-weight exclusion.
- Invalid x plus zero weight → x exclusion.
- Invalid x plus negative weight → one x-first primary exclusion.
- `"1e-400"` → shared parser’s zero; `"1e400"` → nonfinite exclusion.

Do not add a stricter chart-only numeric-text parser or alter existing ingestion rules.

### 9.2 Numerical cases

| Input | Required result |
| --- | --- |
| `x=[1,2],w=[0,0]` | eligible2, positive0, zero2, total0; shares/quantiles unavailable. |
| `x=[1,2],w=[0,5]` | eligible2, positive1; Q0=Q50=Q100=2; zero row retained. |
| `x=[1,2],w=[MAX_VALUE,MAX_VALUE]` | both weights eligible; raw-total overflow; F(1)=U(2)=1/2; Q50=1, Q100=2; finite curve coordinates. |
| `x=[1,2],w=[MIN_VALUE,MIN_VALUE]` | scaled weights [1,1]; halves; raw total `2·MIN_VALUE`; no scaled-underflow flag. |
| `x=[1,2],w=[MIN_VALUE,MAX_VALUE]` | positive2, zero0; first scaled weight underflows; approximate curve/status; interior quantiles unavailable; Q0=1 and Q100=2. |
| `x=[1,2],w=[1e16,1]` | direct U(2) stays positive, approximately `1e-16`; do not compute it as `1−F(1)`; Q100=2. |
| `x=[1,1,2],w=[1,2,1]` | tie mass3, F(1)=3/4, U(1)=1, U(2)=1/4; tie IDs retained in source-ID order. |
| One positive observation | Lower/upper at its value both1; every quantile equals its x. |
| Empty scoped array | No source rows state, not all-zero state. |
| Only invalid pairs | Source/exclusion counts preserved; no eligible rows state. |
| Very small group beside enormous group | The small group’s own conditional curve remains valid under its own scale, even if overall has an underflow status. |

Use `Number.MAX_VALUE` and `Number.MIN_VALUE` in actual TypeScript. For the tail case use a relative tolerance appropriate to `1e-16` and assert it is greater than zero; an absolute `1e-14` tolerance alone would wrongly accept zero.

Add zero-weight x=0 to an otherwise positive-x fixture:

- Requested log becomes unavailable and the existing linear fallback applies.
- Remove it only through the data source, not by pretending it has no x because weight is zero.
- Applying a peer that hides that row still does not shrink the all-source domain or make the source-based log rule change.

## 10. Persistence, DSL, and trace acceptance

### 10.1 JSON and Dashboard-text round trips

Use the existing exporter/compiler test harness and syntax. The packet provides the key catalog, not the full grammar; extend existing setting tokens rather than inventing a second serialization format.

For the M1 canonical override object in Section 3.2:

1. Create from existing defaults, export JSON, restore, and assert exact field/direction/filter/meaning/unit/overall/mark settings.
2. Export Dashboard text, compile it, and assert the same effective settings and Fixture A outcomes.
3. Export the recompiled chart again and assert semantic stability under the existing canonicalization rules.
4. Repeat with a weight field containing spaces, punctuation, and quotes, such as `Population weight "A"`. Field references must round-trip through existing escaping.
5. Restore a pre-feature saved ECDF with no weight settings. It remains unweighted with the existing output.
6. Restore `weightField="Removed weight"`. Show a missing-field state; do not silently count rows.
7. Change Weight by and unit while [2,4] is active. Range filter and linked IDs remain identical.
8. Clear Weight by: old row-count behavior and existing annotation definitions recover.
9. An unknown meaning enum or non-string unit produces a validation error, not fallback reinterpretation.
10. Do not serialize raw Infinity or a computed prefix array into settings.

M2 adds:

- `quantileLevels=[.25,.5,.75]` round-trips in canonical order.
- `showQuantiles=false` hides marks but retains levels.
- Clearing weighting leaves stored levels inactive and old unweighted behavior unchanged.

M3 repeats round trips for weighted box settings and verifies that the absence of a weight field still invokes the old type-7 calculation.

### 10.2 Exact trace acceptance

In the full Fixture A overall trace for [2,4], require:

- Label identifies Value, Weight, current scope, and inclusive bounds.
- Share `25%`, numerator weight `6`, denominator `24`.
- Source/eligible/positive/zero/excluded counts `16/10/7/3/6`.
- Numerator positive IDs `[1,2,8,9]`.
- Numerator eligible IDs `[1,2,3,8,9,12]`.
- Denominator eligible IDs `[0,1,2,3,4,8,9,10,12,13]`.
- Denominator positive IDs `[0,1,2,4,8,9,10]`.
- Zero IDs `[3,12,13]`.
- Excluded IDs `[5,6,7,11,14,15]` with original values and the specified reasons.
- Linked selected record count `7` is not mislabeled as contributor count `4`.
- A curve A trace reports A’s five exclusions; a B trace reports B’s one, not the global six under a group heading.
- C is reachable from the trace inventory despite having no positive curve.
- The raw total `24` is never labeled sample size.

At x=2 require tie mass `4`, eligible tie IDs `[1,2,8,12]`, positive tie IDs `[1,2,8]`, lower/upper values `5/24` and `23/24`.

Apply the peer and verify denominator/evidence revision updates to `7` with the stated IDs. Change a calculated weight field or a weight input and verify all dependent evidence refreshes; no stale trace can retain the old denominator.

Overflow and underflow traces must explain their numeric state without showing `Infinity/Infinity`, NaN, or an unqualified zero for unresolved positive mass.

## 11. Browser acceptance at 1280, 783, and 390 pixels

These are required future implementation checks, not checks performed during the Methods mission. Use real pointer and keyboard input. The repository’s responsive layout below 960px is a view-only grid flow; verify available chart/trace interactions through its supported surfaces rather than treating narrow mode as a desktop layout editor.

| Width | Required emphasis |
| --- | --- |
| **1280px** | Side-by-side unweighted/weighted comparisons, settings with chart visible, full numerator/denominator tracing, peer and span interaction. |
| **783px** | Intermediate grid/detail layout, settings and trace bounded by viewport, labels/readouts do not cover titles, primary actions remain reachable. |
| **390px** | Single-column flow; long field/meaning labels readable; trace/table scroll contained; all-zero/precision status and close/back controls reachable without page overflow. |

Run this scenario at every width where the action is exposed:

1. Open the fresh weighted-distributions example. Assert **16 source records**, weights A20/B4/C0 and overall24.
2. Select [2,4]. Assert records `r01,r02,r03,r05,r08,r09,r12` and weighted share25%.
3. Open the trace with Alt-click or the header control; switch numerator/denominator/zero/excluded evidence.
4. Use keyboard threshold navigation, Home/End, Enter/Space selection, Alt-Enter trace, and the existing clear gesture.
5. Restore [2,4] if the keyboard/clear checks changed it, then apply PeerKeep=true while keeping [2,4] active. Assert that the trace reports **13 source rows in the curve scope**, the workspace still shows **seven linked-selected records**, denominator weight is **7**, and [2,4] share is `6/7`; the x domain stays fixed.
6. Clear the peer while leaving the span, then clear only the span. Verify independent filter ownership.
7. Switch lower/upper direction:
   - Fixed weighted quantile x values stay the same.
   - A bounded span remains.
   - A one-sided filter follows the current clearing behavior.
8. Inspect all-zero C and excluded records without requiring a curve mark.
9. Use a long weight field name; verify labels, accessible names, focus, and real tooltips.
10. Save, reload, and export/recompile the example. Check the same settings and outcomes.
11. Enable a statistic annotation, enable weighting, and verify visible unavailable status with saved definition preserved. Constant y=.5 and fixed bands/callouts remain.
12. Clear weighting and verify the saved statistic annotation and unweighted behavior return.
13. M2: change percentile levels, inspect a collision and an exact boundary, and reload.
14. M3: compare weighted box to ECDF, inspect A’s outliers and B’s single outlier, and verify unavailable violin/standard-deviation combinations.

Check light mode by default and inspect borders/focus in both themes under repository UI rules. No native title tooltips, prohibited Inspect buttons, clipping, background-scroll leaks, or unnecessary layout changes.

Use `pnpm shot` for the three standard widths. Screenshots support review; they do not substitute for numeric/record assertions.

## 12. Worker run sheet

Run commands from the full repository checkout after implementing the relevant milestone. This is a consolidated run sheet, not an assertion these commands ran during research. New test filenames below are the proposed files in this plan.

```bash
# M1/M2: focused library math, planner, interaction, and trace tests.
pnpm --filter exploreda exec vitest run \
  src/components/charts/Ecdf/weightedDistribution.test.ts \
  src/components/charts/Ecdf/ecdfPlan.test.ts \
  src/components/charts/Ecdf/EcdfChart.test.tsx
pnpm --filter exploreda check-types

# M3: after moving the helper, use its shared test path plus box tests.
pnpm --filter exploreda exec vitest run \
  src/lib/weightedDistribution.test.ts \
  src/components/charts/Ecdf/ecdfPlan.test.ts \
  src/components/charts/BoxPlot/boxPlotCalculations.test.ts

# Add saved validation / DSL / annotation tests in their existing suites
# after locating the actual owning files; run those focused files too.

# Every new/updated runnable example must pass coverage and text round trips.
pnpm --filter demo exec vitest run \
  src/demos/coverage.test.ts \
  src/dashboardText.test.ts

# Library type changes require fresh declarations and docs-kit before demo checks.
# Dev and demo tests otherwise consume source; do not build just to see a UI edit.
pnpm --filter exploreda build

# Docs gates and live examples.
pnpm --filter demo docs:check
pnpm --filter demo build
pnpm --filter demo docs:verify
pnpm --filter demo exec tsc

# Start this checkout's server; use its printed URL for actual input checks.
pnpm dev:agent

# Capture 1280 / 783 / 390px using the repository's screenshot tooling.
pnpm shot /examples/weighted-distributions --name weighted-distributions

# Add one minor changeset for each independently shipped package feature PR.
# If several milestones share a PR, keep one accurate changeset for that PR.
pnpm changeset:add minor "Add weighted ECDF shares and inspectable weight contributions"

# Final required broad gate: run once before the PR, from one worktree at a time.
pnpm check
pnpm check:pr

# Stop the server started for this checkout when verification finishes.
pnpm dev:agent --stop
```

Adjust the changeset summary to the actual shipped milestone. Use the repository’s shared test timeouts. Do not run concurrent broad builds from multiple worktrees.

PR descriptions should state the capability, method, evidence contract, verification, and material numerical limits. Attach required UI screenshots from `tmp/`. Codex owns commits and the PR. Do not commit the original Pro downloads or ZIP; integrate the implementation plan and a short research summary per `DIRECTION.md`.

## 13. Deferred and explored boundaries

| WD disposition | Worker boundary |
| --- | --- |
| WD-10 Explore | Weighted histograms get a separate capability plan using existing repaired bins. Specify weight mass, normalized share, or density explicitly; do not audit or redo merged edge/identity repairs. |
| WD-11 Explore | A prepared cumulative-table recipe may document external-method interoperability; it does not block native support. An explicit frequency/type-7 method remains optional and separate. |
| WD-12 Defer | No automatic weighted annotation statistics, weighted violin bandwidths, or standard-deviation whiskers in these milestones. |
| WD-13 Defer | No survey design, confidence intervals, effective-sample-size estimates, or claims of population validity from total weight. |
| WD-14 Avoid | No row expansion, signed-weight cancellation, probability-field inversion, or hidden contribution filters. |
| WD-15 Avoid | No universal reducer/expression layer, server engine, backward-version coexistence scheme, or all-chart weighting sweep. |

## 14. Evidence, access, and remaining questions

- **Access:** complete attached packet read, including all five specifically required files and all 28 scoped files. Exact-ref public GitHub retrieval was unavailable; the packet supplied the baseline.
- **Checked:** current source contracts, primary method documentation/implementations, and independently calculated rational fixture expectations.
- **Proposed:** every new setting, helper, numerical state, weighted rendering/trace behavior, milestone, and acceptance test.
- **Not performed:** repository edits, package tests, browser checks, commits, or a PR.
- **Primary method references:** [NumPy weighted quantile](https://numpy.org/doc/stable/reference/generated/numpy.quantile.html), [R quantile types](https://stat.ethz.ch/R-manual/R-patched/library/stats/html/quantile.html), [R survey mathematical inverse](https://cran.r-project.org/web/packages/survey/vignettes/qrule.pdf), and the report’s full primary-source list.
- **Implementation questions:** confirm actual hook scope, shared annotation status/trace dispatch, validation/compiler seams, and CSV parsing in the checkout. No statistical-method or outside-demand question blocks M1.
- **Later product question:** whether Byron wants an explicitly different frequency/type-7 option or general weighted annotations after these native capabilities are useful. Neither is an implicit implementation requirement.

