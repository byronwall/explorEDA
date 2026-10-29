# Compare pooled and grouped relationships

Status: proposed. No feature is implemented or approved to ship by this plan.
Baseline: `95832bd473884aeae23453af0888b4ca5187820d`.
[Research and local review](../../research/pooled-group-2026-10-25/README.md).

Build **Compare groups** in Scatter Plot. Choose numeric X/Y and an explicit grouping field G.
Show pooled, group, and common-within slopes and Pearson r beside the original observations.
Then explain the pooled result through within-group and between-group contributions.
Keep selection, exact record inspection, and save/reopen in each milestone.

## Contract

- Persist only `comparison?: { groupField: string }` and ordinary chart filters. Never save computed statistics or trace IDs.
- G is independent of color. Suggest an existing categorical color field without binding subsequent color changes.
- E contains the chart's population after external filters, intersected with this facet.
- P contains E's pair-valid numeric X/Y records. Use `finiteNumber` and independent axis exclusion reasons.
- Own selections change highlighting and linked views, not E/P or comparison values.
- Notebook hosts with local selections keep their current behavior; do not promise peer filtering in that mode.
- Explicit empty facets contain zero rows. Absent facet restriction uses the whole eligible chart population.
- Every P record belongs to one `categoryKey(G)` group. Null/undefined coalesce; blank strings remain distinct.
- Keep all groups, including singletons and eligible groups with zero pairs. No analytic top-K or Other bucket.
- Analyze prepared numeric values at the returned row grain. Do not weight query rows by underlying contributor counts.
- Axis limits, log display, marker size, density cells, and table search do not redefine P.
- Missing fields produce a repair state. A deleted G must not become an all-missing category.
- Plain activation selects. Alt-click/Alt-Enter traces without selection. The header trace menu supports touch.

### Mathematical definitions

For each group's paired means `(mx_g, my_g)`, compute its centered triple `Q_g=(XX,XY,YY)`.
Let `(mx,my)` be the paired grand means and `n_g` the valid-pair count.

```text
T = centered triple over P
W = sum Q_g
B = sum n_g * ((mx_g-mx)^2, (mx_g-mx)*(my_g-my), (my_g-my)^2)
T = W + B

pooled slope = T.xy / T.xx
group slope  = Q_g.xy / Q_g.xx
common within-group slope = W.xy / W.xx
group-means slope, weighted by pair count = B.xy / B.xx
r(S) = S.xy / sqrt(S.xx * S.yy)    // definition; use scaled norms in code
sample covariance = T.xy / (N-1) = W.xy / (N-1) + B.xy / (N-1)
```

Slopes need positive X variation. Correlation needs positive X and Y variation.
Constant Y permits slope zero with undefined r. Singletons contribute zero within moments and retain between contributions.
The common slope weights group slopes by their within-X variation, not group size or equal weights.
The between slope uses pair-count-weighted means. Equal-weight mean regression answers another question.
`W.xy/(N-K)` is a different covariance. Never mix it into the additive N−1 display.
Never average group correlations or state `r_total=r_within+r_between`.

Use descriptive direction counts. Qualify undefined, zero, and numerically unresolved groups.
Do not announce that every group reverses when any eligible group lacks a resolved nonzero slope.
Do not infer causation, confounding, statistical significance, or deletion influence from these quantities.

## Milestone 1 — author, compare, select, inspect, reopen

Outcome: choose X/Y/G, compare pooled/group/common-within values, select a group, inspect records, and reopen the saved chart.

### Implementation

1. Add the optional setting in `ScatterPlot/definition.ts` and author it in `ScatterPlotSettingsPanel.tsx`.
   Use the shared field picker. Comparison works with regression and paired summary disabled.
2. Add a small pure planner, proposed `ScatterPlot/groupComparison.ts`, and a local centered-moment helper if needed.
   Partition E/P once. Keep exact eligible, pair, invalid-X, invalid-Y, and excluded-union memberships.
3. Extend `useScatterData.ts` with a separate comparison group column and schema readiness.
   Its existing `groupData` belongs to connection paths. Do not reuse it for G.
4. Use chart population restrictions from `hooks/CrossfilterWrapper.ts` and `lib/chartPopulation.ts`.
   Start from self-excluded chart rows, then apply the explicit facet intersection.
   Correct the empty-facet seam in `scatterPlan.ts` where this flow depends on it.
5. Add compact comparison content outside the plot, proposed `GroupComparison.tsx`.
   Show X/Y/G, facet, pairs/eligible rows, pooled/common-within coefficients, and expandable group rows.
   Group rows show slope/r, pair/eligible counts, X range, and separate selected counts.
6. Integrate above the `ScatterPlot.tsx` points/density branch or into both renderers.
   Points, hexagons, contours, and rectangular density must share mathematical input and trace meaning.
7. Add a narrow typed-category filter, `{type:"category", field, keys:string[]}`, to the existing Filter union.
   Keys are canonical `categoryKey` strings. Match OR within keys and AND with other filters.
   Validate supported scalar tuples, deduplicate/sort authored keys, and reject noncanonical encodings.
   Use the key directly for matching. Decode only for validated labels or editing.
8. Prepare column lookups and key Sets outside row predicates.
   Cover `applyFilter.ts`, `CrossfilterWrapper.ts`, `getFilterFunction` callers, and chart-local population tests.
   A missing field matches zero rows until repaired, including a selected missing-category key.
9. Keep this filter visible, editable, removable, and restorable wherever the shared Filter union is accepted.
   Cover workspace status, Rows header/editor, Filters settings, clear actions, and serialization.
   Numeric-profile G needs a typed category editor rather than a range-only editor.
10. Reconcile the comparison with `ColorLegend/ChartColorLegend.tsx` when G=color.
    Both controls edit one category predicate. Preserve ranges, text constraints, and unrelated fields.
    Current legend toggles remove every same-field filter; change that path for this feature.
11. Promote a single existing non-null value equality only when its matching semantics are identical.
    Existing value filters containing null also match every blank/whitespace string through `applyFilter`.
    Preserve those broader predicates, and multiple existing equality predicates, as visible intersections.
    Do not silently convert them to exact keys. The user can clear them through existing filter controls.
12. Add native trace targets and dispatch for pooled/group/common-within values and exclusions.
    Bind owner, facet, target, and current revision through `trace/ChartTraceScope.tsx` and `traceTypes.ts`.
    Source replacement or external scope changes invalidate stale traces. Never persist positional trace memberships.
13. Update `saveDataUtils.ts`, `SavedDataStructure.ts`, `dsl/settingKeys.ts`, and real DSL compile/export paths.
    Register `comparison` and filter coverage. Preserve predicates in Dashboard text, including generic JSON records when needed.
    Workspace/Rows text export must not omit or mislabel the new predicate.
14. When comparison and paired summary overlap, share prepared numeric results without duplicate conflicting readouts.
    Keep existing color-group summaries distinct when their grouping differs from G.
    Do not widen `fitInputKey` without adding G and its values to the actual dependencies.

Paths beginning `ScatterPlot/` are under `packages/explorEDA/src/components/charts/`.
Other library paths are under `packages/explorEDA/src/`.
Locate existing filter labels/editors through `ActiveFilterStatus.tsx`, `WorkspaceFilterEditor.tsx`, and `FiltersSettingsTab.tsx`.
Use direct extensions to these seams, not a new filtering or statistics framework.

### Numerical proof inside this milestone

Use shifted/scaled centered sums, compensated accumulation, and normalized coefficient calculations.
Keep independently scaled group moments in common units before adding them.
Do not obtain a small W by subtracting B from T.
Detect constants from prepared input distinctions, not a fixed variance epsilon.
Keep undefined, unresolved precision, and unrepresentable dimensional outputs separate.

Pro's proposed `gamma_(8N+32)` direction guard is an unproved engineering heuristic.
Prototype its actual operation/error accounting against cancellation and scaling fixtures before adopting it.
Do not copy the bound as a correctness guarantee or add a statistical magnitude threshold.
If arithmetic loses required distinctions, report the affected direction as unresolved.
Keep a tiny resolved sign even when a short formatter would round its value to zero.

### Tests, docs, example, and acceptance

Use a few table-driven numerical tests in proposed `ScatterPlot/groupComparison.test.ts`.
Add focused filter/persistence tests to existing shared suites and one mounted flow test.
Use the exact fixtures below, own-selection invariance, empty facets, deleted G, and explicit unsupported-axis states.
Test group identity with null/undefined, empty/space strings, number/text 1, boolean/text true, numeric/text NaN, and infinities.
Round-trip through JSON, Dashboard text, and full-analysis row serialization; assert exact memberships.
Test old broad Missing predicates against future blank values after refresh. Their meaning must remain intact.
Alternate comparison and legend toggles with G=color; range constraints must survive.
Test own group selections across facets while coefficient traces remain local to the clicked facet.

Update `apps/demo/src/docs/pages/scatter.mdx` with Compare groups, selection scope, and save/reopen.
Link from `scatter-matrix.mdx`; do not imply a new matrix transfer action.
Add proposed `apps/demo/src/demos/groupComparisonExample.ts` with the five-row reversal fixture.
Register `scatter-group-comparison` in `examples.ts`, `coverage.ts`, and `docs/live/examples.ts`.
Include setting descriptions and actual formatted values in live steps. Label the data Synthetic.
Keep keyboard/Alt acceptance in a real browser test, not a text-only LiveStep.

Main risk: a new predicate works in scatter but fails in another shared filter or save path.
Release the full visible filter lifecycle with the first feature milestone.

## Milestone 2 — explain within and between contributions

Outcome: expand the comparison and reproduce the pooled covariance from its within/between terms and original records.

Extend the same planner, comparison component, and trace body with:

- `Sample covariance = within contribution + between contribution`, using N−1 throughout.
- Common-within X-variation weights and `Group means, weighted by pair count` slope/r.
- A derived group table with counts, means, X ranges, and signed within/between terms.
- The all-group X-range intersection: interval, touching point, or no shared interval.
- Separate **Term records** and **Reference population** in component traces.

For group B_g, term records are P_g; grand means and the denominator require all P.
For W and common-within slope, inspect all P, including zero-contribution records.
Group means are derived summaries representing original pairs, never synthetic original records in Rows.
Show original-row within products and group-level between products.
Rowwise total products include cross terms; only group sums have the simple two-term identity.

Extend the scatter docs with denominators, group weights, derived summaries, and contribution versus influence.
Extend the example with the nine-row weighting fixture below, registered as `scatter-group-comparison-weights` if separate.
Update docs live steps and coverage in this milestone. Show 3 group summaries representing 9 pairs.
Test each component against its independent expected value; `T≈W+B` alone can conceal cancelling errors.

Main risk: correct arithmetic gets misleading weights, denominators, or contributor labels.

## Exact fixture anchors

Triples below use `(XX,XY,YY)`. Expected numbers were independently checked locally with exact rational normal equations.
They are expected values for future product tests, not proof of an implemented feature.

| ID  | Group | X   | Y   |
| --- | ----- | --- | --- |
| a1  | A     | 0   | 6   |
| a2  | A     | 2   | 8   |
| b1  | B     | 4   | 0   |
| b2  | B     | 5   | 1   |
| b3  | B     | 6   | 2   |

For these five rows:

| Quantity | Triple                 | Slope    | r                |
| -------- | ---------------------- | -------- | ---------------- |
| T        | `(116/5,-124/5,236/5)` | `-31/29` | `-31/sqrt(1711)` |
| W        | `(4,4,4)`              | `1`      | `1`              |
| B        | `(96/5,-144/5,216/5)`  | `-3/2`   | `-1`             |

Each group has local triple `(2,2,2)` and slope/r 1.
Covariance is `-31/5 = 1 - 36/5`. X ranges `[0,2]` and `[4,6]` are disjoint.
A's B term is `(288/25,-432/25,648/25)`, with term IDs `{a1,a2}` and all five reference IDs.
b2 has zero within product and remains a contributor.
a1 total XY is `-221/25`; its within product is 1 and cross terms sum to `-6/5`.
Do not present a false rowwise `total=within+allocated-between` identity.

External removal of b3 yields `T=(59/4,-81/4,179/4)`, `W=(5/2,5/2,5/2)`, and `B=(49/4,-91/4,169/4)`.
Pooled slope becomes `-81/59`; common-within remains 1; between slope becomes `-13/7`.
Own selection of A leaves all five-row statistics unchanged. External A-only scope has T=W and B=0.

Weighting fixture: A=`(-1,-1),(1,1)`; B=`(1,5),(2,4),(3,3)`; C=`(1,-5),(3,-1),(5,3),(7,7)`.
Use IDs a1/a2, b1–b3, c1–c4 in that order.
Local XX weights are `(2,2,20)`; local slopes are `(1,-1,2)`.
T=`(416/9,368/9,968/9)`; W=`(24,40,84)`; B=`(200/9,8/9,212/9)`.
Pooled slope is `23/26`, common-within `5/3`, pair-count-weighted means `1/25`, equal-weight means `1/4`.
The size-average group slope `7/9` and simple average `2/3` are both wrong for common-within.
All X ranges touch at 1; do not call that broad overlap.

Additional compact mutations:

- Set Y=X for a consistent-direction control. Reverse B's Y to `(2,1,0)` for mixed group signs and W.xy=0.
- Add singleton C=`(3,4)`: retain it in P/B and qualify undefined group slope/r.
- Append invalid-X-only, invalid-Y-only, and both-invalid rows. Assert overlapping reasons and deduplicated union.
- For eligible 14/pairs 9, append the raw rows below to the five-row fixture.
  Required counts: invalid-X 4, invalid-Y 3, both 2, excluded union 5; blank and missing G remain distinct groups.
- Constant X gives undefined slope/r. Constant Y with varying X gives slope zero and undefined r.
- Reorder inputs; shift X by `2^40` and Y by `-2^40`; centered results match the five-row fixture.
- Scale both fields by `2^-500`, `2^600`, and `2^-600`; slopes/r stay unchanged where normalized arithmetic resolves them.
  Dimensional products can be unrepresentable; do not label them zero or drop their finite records.
- Use X=`(0,2,4,6)`, Y=`(1+d,3+d,0,2)`, groups A/A/B/B.
  For d=`2^-40`, pooled slope is `-d/5`, r=`-4d/sqrt(20*(5+2d+d*d))`; retain the resolved negative sign.
  For d=0, pooled direction is zero. For stronger cancellation, permit an explicit unresolved precision result.

Counts/keys/memberships compare exactly. Ordinary coefficients/moments use `1e-12*max(1,abs(expected))`; r uses absolute `1e-12`.
Offset tolerances stay relative to centered results. Compare tiny/huge fixtures in normalized units, never against a permissive raw absolute tolerance.
The near-zero coefficient/r tolerance is absolute `5e-16` with a separate sign assertion.

Raw exclusion fixture additions, with no upstream coercion:

| ID  | X         | Y        | G         |
| --- | --------- | -------- | --------- |
| m1  | null      | 9        | `"A"`     |
| m2  | 7         | `"oops"` | `"B"`     |
| m3  | undefined | Infinity | null      |
| m4  | true      | `""`     | `" "`     |
| m5  | `"0x10"`  | 3        | 0         |
| m6  | `"7"`     | `"3"`    | null      |
| m7  | 8         | 4        | undefined |
| m8  | 9         | 5        | `""`      |
| m9  | 10        | 6        | `" "`     |

Pairs are the original five plus m6–m9. Missing-G pairs are m6/m7; m8 and m9 form distinct singleton groups.
The numeric-0 group has eligible m5 but no pairs, so it prevents an unqualified every-group reversal label.

## Browser, checks, and shipment

At 1280, 783, and 390px, author X/Y/G, compare, select, trace, filter externally, save/reopen, and undo.
Check keyboard toggles, Alt-Enter, touch/header trace access, nested Escape, focus return, and no page-wide overflow.
Test comparison-only mode in every scatter renderer, facets, long labels, empty groups, and light/dark themes.
Own selections must not rerun numerical planning solely because selected IDs changed.
Measure actual uncached parsing, grouping, moments, render, selection, external updates, and trace opening before caches or limits.
Use representative N=1k/10k/100k, K=2/20/200/2k, and 1/8 facets; report feasible cases and actual retained memory when available.
Pro's NumPy timing excludes product work and supplies no application throughput claim.

Run targeted numerical/filter/persistence tests and `pnpm --filter exploreda check-types` during work.
Run `pnpm --filter demo exec vitest run src/demos/coverage.test.ts src/dashboardText.test.ts` after example registration.
Run `pnpm --filter demo docs:check`, build, and `docs:verify` for `/docs/scatter`.
Register a proposed `apps/demo/e2e/group-comparison.e2e.ts` through an explicit project in `apps/demo/playwright.config.ts`.
Its current projects match only named suites; a new file alone will not run.
Capture screenshots with `pnpm shot` at all three widths and attach them to each visible implementation PR.
Each implementation milestone needs a minor changeset and one `pnpm check` before its PR, plus `pnpm check:pr`.
This planning PR is docs-only. No product test, browser acceptance, or performance claim is made here.

## Preserved Pro result materials

[Original Pro reports and artifacts for #526](assets/pro-results/pooled-group-2026-10-25/ASSET_INDEX.md)

All extracted result materials are preserved without ZIP containers. Original bytes and attribution are unchanged.
