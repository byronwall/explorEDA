# Engineering histograms — implementation plan

**Build the existing Bar chart into an engineering histogram with authored boundaries, observed specification compliance, shared numeric groups, and exact records.** Ship four useful increments. Keep React/TypeScript and pnpm; assume one developer and one deployed version. Do not add migrations, a general Boolean filter framework, or capability statistics.

- **Design baseline:** [`6d9130ba1c5242c15bbbeb9b20b7fd0707d0aa0e`](https://github.com/byronwall/explorEDA/tree/6d9130ba1c5242c15bbbeb9b20b7fd0707d0aa0e).
- **Detailed contract and evidence:** [report.md](report.md), especially §§4–7. Recommendation IDs below are stable across both documents.
- **Status:** proposed implementation work; no repository code, tests, builds, browser sessions, or commits were executed for this Design mission.

## Contracts to preserve throughout

1. **Bins, specifications, and view bounds are independent.** Interiors are `[a,b)`; the final bin is `[a,b]`; coverage tails are `< first` and `> last`. Specification equality passes. Use finite parsed measurements only, with missing/invalid counts separately visible.
2. **Authored coverage stays saved through filtering and refresh.** Width/origin edits retain grid indices; coverage edits and Fit change them explicitly. Fit uses exact decimal floor/ceil with a one-bin minimum. Compare measurements directly to resolved Numbers. No epsilon membership, cumulative addition, silent widening, or dropped overflow.
3. **A summary describes context; a selection highlights it.** Context includes peer/workspace filters, independent chart-local predicates, and unrelated own field predicates, but excludes the chart’s measurement/group selection slots. Denominators include finite coverage tails; selected overlays use the same context ng. ng=0 has undefined compliance.
4. **A saved selection is a numeric predicate.** Snap bin gestures when created; do not re-snap later. Specification edits update guides/counts while an older selection stays fixed until Update selection. Toggle equality includes typed group scope. Ordinary actions retain unrelated predicates; chart-wide Clear removes all linked filters and preserves local population. No persisted row IDs or duplicate selected-status state.
5. **One plan supplies marks and records.** A count’s trace and exact Records view use the same contributor IDs and scope. Global Rows can have a different population; label that distinction.
6. **Docs, examples, validation, and text round trips ship with the feature.** Retain Auto and its integer-centered bins, the repaired `maxExclusive` behavior, existing categorical series, and local predicates. [Baseline sources](report.md#2-what-the-baseline-already-provides)

## M1 — Authored regular bins and exact coverage records

**Outcome:** an engineer can choose width/origin, preserve finite coverage, inspect empty bins and both coverage tails, and save the analysis. This is independently useful. **EH-01, EH-04, EH-07.**

- **Implementation:** under `packages/explorEDA/src/components/charts/BarChart/`, extend `definition.ts`, `BarChart.tsx`, `BarChartSettingsPanel.tsx`, and `barPlan.ts`; add focused `histogramBins.ts` and `histogramPlan.ts`. Start with `histogram.binning` Auto/Width modes; retain `binCount`. Explicit histogram settings establish numeric intent even with invalid values. Persist `{width,origin,firstIndex,lastIndex}` and validate 1–512 intervals. Fit against all-source finite values; with no valid measurements use one typed origin/width interval.
- **Selection and records:** add `RangeFilter.minExclusive` in `types/FilterTypes.ts` and `hooks/applyFilter.ts`; support strict labels/editing in `ActiveFilterStatus.tsx`, `FiltersSettingsTab.tsx`, and `DataTable/components/ColumnFilter.tsx`. The numeric filter route must AND all active predicates. Remove render-time range re-snapping, including Auto, and render partial selected contributions. Extend `barTrace.ts`, `BarTraceBody.tsx`, `trace/{traceTypes.ts,ChartTracePanel.tsx,traceRows.ts}`. Extend `ChartDataPreview.tsx` with transient exact IDs/scope/revision, source/calculated columns, and complete pagination.
- **Persistence/editing:** update `utils/saveDataUtils.ts` and `lib/dsl/{settingKeys.ts,schema.ts,compile.ts,export.ts}`. Support strict interval values such as `[0..2)` and `(12..)`, with inclusive `0..2` unchanged. Use full nested settings replacement and the existing held edit transaction. Measurement-field changes atomically reset unit-dependent bins/specifications and old axis limits. Engineering mode uses linear axes. Existing annotations receive the numeric frame; no saved duplicate guides.
- **Meaningful checks:** add `histogramBins.test.ts`, `histogramPlan.test.ts`, `BarChart.histogram.test.tsx`, and a focused `lib/dsl/histogramRoundTrip.test.ts`. Use report Fixtures A/C/D for bins, tails, decimals, saved inclusive last-bin selection after Fit, reorder, and controlled replacement. Check collapse, cap, finite-span failures and valid large-magnitude Fit. Preserve existing endpoint/integer tests. Verify Records beyond 100 rows and chart-local/global scope. Test measurement-field reset, old-axis-limit clearing, one-edit undo, Escape, Reset, JSON and every range-filter text context.
- **Docs and runnable example:** add `bar.mdx` sections **Authored boundaries**, **Coverage and exact edges**, and **Saved selections and refresh**. Create `/examples/engineering-histograms` using proposed `apps/demo/src/demos/engineeringHistograms.ts`, a labelled `public/datasets/engineering-measurements.csv`, and `demos/examples.ts`. Add live example `engineering-width`, setting descriptions, and matching coverage entries. State CSV/runtime-type differences; do not alter ingestion globally.
- **Main risk / exit:** grid precision and the changed selection contract. Exit when bins `[2,4,2,4,0,1]`, the final-edge record, and both exact tails survive save/recompile/refresh, and a saved `[10,12]` still selects b5 after Fit makes 12 interior. Capture the authored workflow at 1280/783/390 px.

## M2 — Specifications, both-tail selection, and scoped compliance

**Outcome:** inclusive one/two-sided limits yield exact observed counts, shares, and records; Outside selects both tails without changing its denominator. **EH-02, EH-03, EH-04, EH-07.**

- **Implementation:** add `lib/specification.ts` for bound validation/classification, reused by `histogramPlan.ts` and `applyFilter.ts`. Extend the histogram settings with `spec`; add `SpecStatusFilter {type:"spec-status",field,region,lower?,upper?}` to `FilterTypes.ts`. Add `HistogramSummary.tsx`, live limit controls, neutral guides, status/exclusion traces, and accessible status buttons. A mixed bin keeps its chart hue and reports exact status composition.
- **Filter integration:** update the M1 label/editor/validation/trace consumers for the focused atom. `getAxisFilter.ts` and `useFilterExtent.ts` must not turn Outside into one brush extent. Add lossless `.spec=outside:2..6` and other regions through `compile.ts: buildFilter` and `export.ts: filterPairs`; support chart, local `where.`, workspace, and Rows contexts. Preserve both optional snapshot bounds, including an unused opposite bound. Add a field/type guard as needed; no general OR AST.
- **Live state:** label old-selection/new-limit mismatches and implement explicit Update selection. Keep local predicates independent. Clearing limits does not silently erase an old valid filter. Close stale trace/Records on the existing revision mechanism. Deliberate equal limits mean Exact value; absent specifications mean no compliance report.
- **Meaningful checks:** add `specification.test.ts`; extend the histogram/DSL tests. Fixture A must give `3/9/3` with n=15, including both-limit ties, numeric text, exclusions, lower-only/upper-only limits, and equal limits. U=7 gives Within10/15 while frozen Outside2…6 remains six until updated. Local Group=A has three exact Outside records even though the global numeric predicate matches six. Own selections retain context n; unrelated own predicates still apply.
- **Docs and runnable example:** add `bar.mdx` **Specification limits and exact records**; add a short `ecdf.mdx` **How it reads** note distinguishing inclusive ECDF at-or-above from strict above-spec failure. Expand the same complete example with `engineering-specs`, status selection, Update selection, and exact scoped Records; update setting descriptions/coverage in this milestone.
- **Main risk / exit:** divergent summary/filter scope. Exit when every displayed status count opens the identical key set and every new atom round-trips in all four filter contexts. Verify keyboard activation, focus return, mixed-bin selected contribution, and one-sided labels at all three widths.

## M3 — Numeric group comparison and normalized heights

**Outcome:** compare measurement distributions and observed compliance by one grouping field on common bins/scales. **EH-05, EH-06, EH-07.**

- **Implementation:** add `histogram.groupField`, `height`, and `visibleGroups`; extend the planner and a proposed `GroupedHistogramChart.tsx`. Keep `seriesField` on its existing categorical route and `group=` as the existing aggregate DSL alias. Reuse typed category identity; normalize blank/null/undefined into Missing. Unsupported nonfinite numeric group keys show a grouping error with pooled compliance retained. Reject measurement=group and simultaneous generic facets/grouping in V1. Add the dependency to `chartAccessibility.ts: getChartFields` and numeric annotation capabilities to `annotations/context.ts`.
- **UI/state:** two default panels, up to six, and a searchable/paged table covering every group. Hidden panels never remove rows from totals. Normalize absent visible-group choices once when installing configuration with data; persist identities, never default in render; explicit `[]` means table-only. Group bin/status/brush/tail actions set a group ValueFilter plus the measurement atom; pooled actions clear the group slot. Count/Percent/Density use group ng including coverage tails; pooled share uses pooled counts. Shared Y has a source floor and can expand for filtered normalized heights. Avoid a dense groups×512 allocation.
- **Meaningful checks:** Fixture A group denominators `7,6,2,0`, Within counts `4,3,2,0`, and undefined E share; Fixture D’s refresh; typed/Missing click agreement; empty/hidden groups; peer B n=6 with Outside `{b0,b4,b5}`. Switching the same status from A to B must replace the group, not toggle off. Test measurement/group field changes and collisions, atomic reset of conflicting grouping/old axis limits, Reset/undo, source/own/local separation, and text restore of visible choices.
- **Docs and runnable example:** add `bar.mdx` **Compare numeric groups** and normalized-height explanations. Expand `/examples/engineering-histograms` with `engineering-groups`, unequal sample sizes, Missing/E groups, pooled counts, and Show groups. Update live examples, settings descriptions, and coverage together.
- **Main risk / exit:** wrong denominators or accidentally using categorical series geometry. Exit when the same exact edges appear in all panels, `9/15` is the pooled accepted share, and group filtering/records/refresh agree. Verify the complete table and stacked panel layout at 390 px.

## M4 — Short explicit edges and density geometry

**Outcome:** complete the promised V1 with an inspectable, finite irregular-edge histogram. **EH-01, EH-06, EH-07.**

- **Implementation:** extend `HistogramBinning` and the bin helper with `{mode:"edges",edges:number[]}`; extend settings, validation, text, and traces. Accept 2–65 strictly increasing finite edges. Do not sort/deduplicate or auto-fit. Classify equal spacing using canonical decimal differences. Unequal widths require Density; a live change switches height atomically, while an explicitly incompatible restored configuration fails clearly. Keep counts/percentages and exact widths in readouts.
- **Meaningful checks:** Fixture B counts `[1,5,2,4,1]`, density `[1/15,1/9,1/15,2/15,1/60]`, area13/15, and unchanged specification `3/9/3`. Check group density denominators, zero n, terminal closure, invalid/collapsed edges, 66-edge rejection, nonfinite density, and frozen selections across grid/edge switches. Confirm authored boundaries survive controlled replacement.
- **Docs and runnable example:** add `bar.mdx` **Unequal intervals and density**, explaining all-valid versus covered-only normalization. Add `engineering-edges` to the complete demo and live examples; update setting descriptions/coverage in the same change.
- **Main risk / exit:** heights implying the wrong mass. Exit when area equals covered share, tails account for the remainder, and exact record sets match the equal-width chart. Run the full proposed browser acceptance flow and chart-image export check at 1280/783/390 px.

## Worker verification and release

Use the existing commands documented in [`AGENTS.md`](https://github.com/byronwall/explorEDA/blob/6d9130ba1c5242c15bbbeb9b20b7fd0707d0aa0e/AGENTS.md) and [`docs/agent-guide.md`](https://github.com/byronwall/explorEDA/blob/6d9130ba1c5242c15bbbeb9b20b7fd0707d0aa0e/docs/agent-guide.md). The test files below are proposed targets; run each after its milestone introduces it.

```bash
pnpm --filter exploreda exec vitest run src/components/charts/BarChart src/lib/specification.test.ts src/lib/dsl/histogramRoundTrip.test.ts
pnpm --filter exploreda check-types
pnpm --filter demo exec vitest run src/demos/coverage.test.ts src/dashboardText.test.ts
pnpm --filter demo docs:check
pnpm --filter demo build
pnpm --filter demo docs:verify -g "/docs/bar$|/docs/ecdf$|engineering histograms"
pnpm shot /examples/engineering-histograms --name engineering-histograms
```

Add focused browser cases in proposed `apps/demo/e2e/engineering-histograms.spec.ts`, with test titles matching the command’s selection. Existing live-example steps cannot express all typing, keyboard, refresh, and exact-ID checks. Use `@repo/test-config` time limits. Test meaningful record identities and scope, not only screenshots or total row counts.

For each package-changing PR, include one minor changeset describing the user-visible gain and any intentional selection change. Run `pnpm check` once before the PR, from one worktree at a time. Use `pnpm shot` screenshots in the PR; do not commit them. Do not version, publish, or deploy as part of implementation verification.

## Boundaries and handoff status

- **Explore:** EH-08 status segments and alternate group layouts after V1 evidence.
- **Defer:** EH-09 capability/control charts, fitted predictions, weights, per-group limits, unit conversion, and population baselines. Do not expand PR514 or PR507.
- **Avoid:** EH-10/EH-11 epsilon rules, silent rebins, frozen row IDs, general OR syntax, duplicate spec annotations, frameworks, and migrations.
- **Access/files read:** all 40 packet files plus decisive exact-baseline supplements were available; the full inventory and primary sources are in [report.md §9](report.md#9-access-evidence-deliverables-and-open-questions).
- **Checked versus proposed:** source/evidence and fixture arithmetic were checked; all implementation/tests/browser outcomes above are proposed gates, not completed checks.
- **Deliverables:** [report.md](report.md), [implementation-plan.md](implementation-plan.md), and [engineering-histograms.zip](engineering-histograms.zip), containing only these Markdown files.
- **Open questions:** caps and visible-panel limits can be revised after concrete implementation evidence; status segmentation and richer grouping remain follow-ups. No missing input blocks M1.
