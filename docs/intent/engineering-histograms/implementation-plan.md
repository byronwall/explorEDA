# Engineering histograms

Extend the Bar chart with saved boundaries, specification compliance, numeric groups, and exact contributing records.
Ship four increments. Each includes its docs and runnable example.
This is a proposed plan. No feature code or browser acceptance has run.

[Research and local decisions](../../research/engineering-histograms-2026-10-23/README.md).
Reviewed against main `95832bd4`; Pro used `6d9130ba`.

## Contracts

- Keep bins, specification limits, and axis bounds independent. Axis bounds only clip the view.
- Keep Auto's existing integer-centered bin algorithm. Explicit `histogram` settings establish numeric intent despite invalid values.
- Store width/origin and first/last grid indices, or a complete edge list. Filtering and refresh preserve authored coverage.
- Intervals include their lower edge. Only the final interval includes its upper edge. Coverage tails use strict comparisons.
- Specification limits include equality. Below uses `x < lower`; Above uses `x > upper`; Outside joins those tails.
- Use `finiteNumber` and `numericExclusionReason`. Show missing and invalid records separately. Numeric text follows existing parsing.
- Allow one-sided limits and deliberate equal limits. Equal means Exact value. No limits means no compliance report.
- Let source S contain every source row. Use S for initial/Fit edges and source group identities.
- Context C starts with `useGetLiveIds(settings, facetIds)`, including peer/workspace, local, and facet restrictions.
- Then apply unrelated own predicates to C. Exclude only the measurement/group selection slots from the context calculation.
- Let n count finite measurements in C, including coverage tails. Selected rows intersect C with the measurement/group predicates.
- Own selection changes selected contributions. It keeps context n fixed. A peer or local filter can change n.
- For each group, divide by its own valid n. Pool counts before dividing. For n=0, shares are unavailable.
- Keep exact contributor IDs transient. Marks, summaries, traces, and exact Records use the same computed result.

The current numeric bar route uses all-source measurement values for edges.
Its aggregate domain and annotation paths separately use chart-population IDs. Keep those paths explicit.
For ungrouped facets, use common source edges and panel context counts.

## Proposed saved shape and selection

Add an optional `histogram` object to `BarChartSettings`:

```ts
interface HistogramSettings {
  binning:
    | { mode: "auto" }
    | {
        mode: "width";
        width: number;
        origin: number;
        firstIndex: number;
        lastIndex: number;
      }
    | { mode: "edges"; edges: number[] };
  spec?: { lower?: number; upper?: number };
  groupField?: string;
  height?: "count" | "percent" | "density";
  visibleGroups?: Array<string | number | boolean | null>;
}
```

Retain `binCount` for Auto. Keep `seriesField` on its current categorical route.
Reject conflicting aggregate/category/series settings and simultaneous numeric groups/generic facets.
Use one common specification pair. Keep engineering axes linear.

Add `RangeFilter.minExclusive` for the strict upper coverage tail.
Add one `spec-status` filter with field, region, and optional lower/upper snapshot bounds.
Regions are Below, Within, Above, and Outside. Validate required bounds and finite ordered limits.
A single Outside atom evaluates the union. The surrounding `Filter[]` remains an intersection.
The numeric route must read every active filter column once and AND every predicate.

For explicit engineering histograms, snap a gesture once and save its numeric predicate.
Later bin/limit edits keep that selection fixed. Show earlier-limit state with an explicit Update selection action.
Toggle equality compares the effective predicate, endpoint flags, and typed group scope.
Normal actions replace measurement/group slots and retain unrelated predicates.
Chart-wide Clear removes linked filters and retains local population settings.

**Local scope decision:** preserve ordinary histograms' current re-snapping behavior.
Remove re-snapping only for charts with explicit `histogram` settings. Enabling that mode preserves the current predicate.
This narrows Pro's proposed change to all Auto histograms and keeps the feature boundary small.
Partial selected contributions are required when a saved predicate cuts through new bins.

Use the controlled data-plus-savedData restore path for source replacement with continuity.
Bare `setData` resets chart state. Do not promise it preserves authored settings.
If a source field disappears, retain settings and show Unavailable field; do not report zero or perfect compliance.

## M1 — Authored width and origin

**Outcome:** choose repeatable intervals, see exact coverage tails, inspect records, and save the analysis.

- Extend `BarChart/{definition.ts,BarChart.tsx,BarChartSettingsPanel.tsx,barPlan.ts}` under `packages/explorEDA/src/components/charts/`.
- Add focused `histogramBins.ts` and `histogramPlan.ts` there. Resolve one edge array and one contributor result.
- Store positive finite width, finite origin, and safe integer edge indices. Permit 1–512 bins; retain empty bins.
- Generate `origin + index × width` from canonical decimal coefficients using a small private BigInt helper.
- Convert each edge once. Never round measurements or use epsilon membership. Reject collapsed/nonfinite edges, span, or geometry.
- Fit uses exact decimal floor/ceil against S, with a one-bin minimum. Check converted endpoints against actual extrema.
- A valid empty source starts at indices 0…1. Width/origin edits retain indices. Fit/coverage edits change them explicitly.
- Add strict lower range support to `types/FilterTypes.ts`, `hooks/applyFilter.ts`, filter labels, editors, and saved validation.
- Extend `barTrace.ts`, `BarTraceBody.tsx`, and `trace/{traceTypes.ts,ChartTracePanel.tsx,traceRows.ts}` for bin/tail/exclusion evidence.
- Extend `components/ChartDataPreview.tsx` with transient exact IDs, scope, revision, all-field access, and complete pagination.
- Keep chart-local Records separate from global Rows. Do not silently add global Rows search or filters to exact IDs.
- Update `utils/saveDataUtils.ts` and `lib/dsl/{settingKeys.ts,schema.ts,compile.ts,export.ts}` in this milestone.
- Proposed interval text: `[0..2)` and `(12..)`. Keep inclusive `0..2`. Support chart/local/workspace/Rows filter contexts.
- Replace complete nested settings through `updateChart`. Use existing edit holds: live values, one undo step, Escape/Reset restoration.
- A measurement-field change clears old measurement selection, unit-dependent bins/specs, and axis limits atomically.
- Clear conflicting grouping when the new measurement equals the group field. Keep unrelated/local predicates.
- Close exact Records on source, population, or geometry changes. Extend the trace revision key if existing nonces miss a relevant change.

**Checks:** fixture A bins/tails, fixture C decimal neighbors, fixture D replacement/Fit, strict endpoints, JSON/text, and one-edit undo.
Check 121 exact records through the last page. Test collapse, the bin cap, and valid large-magnitude Fit below.
Retain existing endpoint and integer tests. Verify ordinary histogram re-snapping still works.

**Docs/example:** add Authored boundaries, Coverage and exact edges, and Saved selections sections to `apps/demo/src/docs/pages/bar.mdx`.
Add `apps/demo/src/demos/engineeringHistograms.ts` and `/examples/engineering-histograms`, with a small labeled measurement dataset.
Register `engineering-width` in docs live examples, complete examples, settings descriptions, and demo coverage.

**Risk:** edge construction and frozen selection disagree. Exit when the same exact keys survive text/save/refresh and partial-bin highlighting.

## M2 — Specification compliance

**Outcome:** exact below/within/above counts, shares, both-tail selection, and their scoped records.

- Add `lib/specification.ts`, shared by filtering and planning. Add `HistogramSummary.tsx` and compact live limit controls.
- Add the focused filter atom across types, application, validation, labels, editors, and text export/compile.
- Proposed text: `select."Measurement".spec=outside:2..6`; use the same shared decoder in all four filter contexts.
- Preserve both snapshot bounds. Keep `.spec` atoms out of `getAxisFilter` and `useFilterExtent` brush assumptions.
- Derive neutral guides from spec settings. Existing annotation projection can draw guides; do not save duplicate annotations.
- Keep bin/group hue. Report mixed-bin statuses as exact counts. A whole-bin failure color would misstate individual membership.
- Status buttons select; Alt-click/Alt-Enter traces. Use existing chart-header trace access. Add no Inspect button to the plot.
- Show scope, context n, selected counts, exclusions, and coverage separately. One-sided limits omit the absent status.
- Clearing limits retains an old valid selection until replacement/clear. Update selection explicitly captures the new limits.

**Checks:** A gives n=15 and statuses 3/9/3. Equal limits give 3/3/9; one-sided limits give twelve accepted.
Changing upper 6→7 yields 3/10/2; old Outside still contains six until Update selection.
A local Group=A chart opens exactly `{a0,a1,a6}`, even when global Outside matches six.
Assert count = trace IDs = Records IDs, including exclusions and zero bins.

**Docs/example:** add Specification limits and exact records to `bar.mdx`; clarify strict spec tails in `ecdf.mdx`.
Expand the same example with `engineering-specs`, including mixed bins, earlier limits, and local/global scope.
Update settings descriptions and coverage with the feature.

**Risk:** a click changes its denominator or loses scope. Exit with exact identities and lossless filters in all four text contexts.

## M3 — Numeric groups and normalized heights

**Outcome:** compare measurements and compliance across one group field on shared bins and axes.

- Add `groupField`, `height`, `visibleGroups`, and a focused `GroupedHistogramChart.tsx`. Keep categorical series independent.
- Include group dependencies in `chartAccessibility.ts`; update numeric annotation capabilities in `lib/annotations/context.ts`.
- Reuse typed category keys. Combine null/undefined/blank as Missing. Report unsupported nonfinite group keys without dropping pooled measurements.
- Save two default visible groups when installing grouping; permit six panels and explicit `[]` for table-only.
- Show a searchable, paged table for every group. Hidden panels never remove rows from totals. Preserve choices on refresh.
- A group action sets its typed group ValueFilter plus measurement predicate. A pooled action clears only the histogram group slot.
- Count is c; Percent is `100*c/n`; Density is `(c/n)/width`. Selected height uses the same context n.
- Use shared X and Y. Source reference heights set the Y floor; filtered normalized heights can expand it.
- Use sparse group/bin contributors and synthesize empty bins for visible panels. Avoid a dense groups×512 allocation.

**Checks:** A group valid counts are 7,6,2,0; accepted counts are 4,3,2,0; pooled accepted share is 9/15.
Test typed/Missing values, hidden groups, group switching, zero n, local/peer scope, and refresh adding C.
Use keyboard bin traversal, status buttons, focus return, and real pointer input at 1280, 783, and 390 px.

**Docs/example:** add Compare numeric groups and height/denominator sections to `bar.mdx`.
Expand the same example with `engineering-groups`, complete group coverage, and unequal sample sizes.

**Risk:** categorical geometry or a selected-only denominator leaks into numeric groups. Exit with common edges and exact group records.

## M4 — Complete explicit edges

**Outcome:** author short irregular intervals with correct density geometry and exact records.

- Accept 2–65 finite, strictly increasing edges. Reject duplicate/descending/collapsed values; never sort or deduplicate silently.
- Store complete coverage. Provide no automatic Fit for explicit edges.
- Detect equal spacing through canonical decimal differences. Unequal intervals require Density.
- Apply a live change to Density atomically. Reject an explicitly incompatible restored height; omitted height resolves to Density.
- Keep counts, percentages, exact bounds, widths, and records in readouts.
- Include coverage tails in n. Thus finite bar area equals covered share, potentially less than one.

**Checks:** B counts `[1,5,2,4,1]`; densities `[1/15,1/9,1/15,2/15,1/60]`; area 13/15.
Spec statuses remain 3/9/3. Check last-edge closure, group densities, frozen selections, zero n, and invalid geometry.

**Docs/example:** add Unequal intervals and density to `bar.mdx`; expand the same example with `engineering-edges`.
Explain the all-valid denominator and uncovered mass. Update live examples, settings descriptions, and coverage together.

**Risk:** irregular widths imply false mass. Exit with conserved area plus tails and unchanged compliance identities.

## Exact acceptance fixtures

A uses width2/origin0, edges `[0,2,4,6,8,10,12]`, and inclusive limits 2…6.
`null`, whitespace, `NaN`, and `Infinity` below are typed unit-fixture values.

| Group   | Record keys and measurements                                  |
| ------- | ------------------------------------------------------------- |
| A       | a0=-1, a1=0, a2=2, a3=2, a4=4, a5=6, a6=13, a7=null, a8="bad" |
| B       | b0=1, b1=2, b2=4, b3="6", b4=7, b5=12, b6=" ", b7=Infinity    |
| Missing | c0=3, c1=6, c2=NaN                                            |
| E       | e0=null                                                       |

A: bins `[2,4,2,4,0,1]`; coverage tails `{a0}`/`{a6}`; n=15 of 21.
Missing `{a7,b6,e0}`; invalid `{a8,b7,c2}`.
Below `{a0,a1,b0}`; Above `{a6,b4,b5}`; remaining nine valid records pass.
The `[6,8)` bin has three accepted measurements and b4 above spec.

B uses A with edges `[0,1,4,6,8,12]`. Counts/densities/area appear in M4.
Group density areas are A=5/7, B=1, Missing=1; E is unavailable.

C uses decimal edges `[0.1,0.2,0.3,0.4,0.5]` and limits 0.2…0.3.
Values d0…d8 are `.1,.2,.3,.30000000000000004,.4,.5,.29999999999999993,.5000000000000001,.09999999999999999`.
Bins are `{d0}`,`{d1,d6}`,`{d2,d3}`,`{d4,d5}`; tails are d8/d7.
Within is `{d1,d2,d6}`; d3 fails above despite rounded labels.
Large Fit: source `[8e307,9e307]`, origin `-1e308`, width `1e307` resolves indices 18…19.
Reject collapsed adjacent edges at origin `1e16`, width0.1.

D first reverses A, preserving key sets. Then change a6 to5 and append B:b8=14 and C:r0=4.
Saved edges remain fixed; n=17; bins `[2,4,4,4,0,1]`; statuses 3/11/3.
Outside is `{a0,a1,b0,b4,b5,b8}`.
Fit gives edges `[-2,0,2,4,6,8,10,12,14]`, counts `[1,2,4,4,4,0,0,2]`, and no tails.
The saved inclusive `[10,12]` still selects only b5, now part of `[12,14]`.

## Verification and delivery

Use focused planner/filter/text tests and mounted flows for important boundaries above.
Do not add per-control snapshots. Use `@repo/test-config` time limits.
Run library targeted tests/types, demo coverage/dashboard text tests, docs checks, and the focused browser flow.
Use a dedicated `apps/demo/e2e/engineering-histograms.spec.ts` for typing, refresh, keyboard, and exact key sets.
The current docs live-step schema cannot express every acceptance operation.

Run `pnpm check` once before each package-changing PR. Add a minor changeset for each feature increment.
Use `pnpm shot` and attach screenshots with `gh --attach`; keep evidence under ignored tmp/.
At 390 px retain compact label/control rows, stack panels, and bound table overflow to its region.
Check image export includes limits, group labels, and scope. Ship no migration or generic filter framework.
