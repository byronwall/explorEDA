Build the complete pooled UTC calendar overlay first, including exact window-record selection and evidence, so an analyst can compare a moving summary with its underlying periods and account for every number. Keep the implementation inside the existing React/TypeScript library and demo, use pnpm, and reuse the established calendar, parsing, filtering, and trace primitives. Add equal-period means only as a separately named second method.

# Implementation plan: rolling calendar summaries

**Baseline:** `95832bd473884aeae23453af0888b4ca5187820d`  
**Status:** proposed handoff to Codex; no implementation or product tests run.  
**Methods authority:** [report.md](report.md), recommendations RW-01 through RW-12 and exact Appendix A fixtures. This plan supplies ordering, owners, acceptance criteria, and default decisions. No demand study is a prerequisite.

## 1. Bounded first release

M1 supports one rolling layer per Calendar summaries chart, with the chart’s count, sum, or average, its day/week/month/year interval, its Monday/Sunday week start, its measure, and its series/facet partition. It uses current-plus-previous-K−1 periods, UTC `[start,end)`, K=1…366, default K=3, full-span default, opt-in partial start, and an integer minimum contributing-record count of at least 1.

- Count uses every dated member; sum/mean use finite numeric inputs. No observations produces no plotted result under minimum-one support; the trace still reports loaded count 0. Invalid values are never synthetic zeroes.
- M1 rolling is available in **Line** display. Keep existing Area and Stacked area behavior; authoring must ask the analyst to choose Line before enabling rolling. Do not quietly change chart settings on restore.
- Keep the base period layer visible. Its existing missing-period display setting does not feed the rolling reducer.
- Reference calendar and Y-domain use the pre-peer chart/facet population; live values use peer/workspace filters. Current live values may expand the reference Y-domain as existing calendar values do. Explicit display bounds clip geometry only.
- No duration, last-N-record, centered, local-timezone, entity-deduplicated, weighted-kernel, confidence-band, or forecast modes. No generic expression engine, new backend, or paid package.
- The current interval and aggregation own the units. A summed observation window is a rolling total; a record count is not an average daily event count.

All new behavior is **proposed**. Existing seams are cited by repository path/symbol below; paths marked “new” are proposed files.

## 2. Read the remaining integration owners, then implement in this order

The mission prompt and all 30 packet files have already been read completely. Seven additional complete pinned GitHub files establish row-ID filtering and refresh behavior; the report records them. Before editing, Codex should inspect these remaining owners at its working revision:

- `packages/explorEDA/src/utils/saveDataUtils.ts`, `types/SavedDataTypes.ts`, and `types/ChartTypes.ts`: validation and persistence of nested settings and ID filters.
- `packages/explorEDA/src/lib/dsl/compile.ts`, `export.ts`, and `settingKeys.ts`: exact dotted-key syntax and round-trip behavior.
- `packages/explorEDA/src/components/charts/trace/ChartTracePanel.tsx`, its trace-body dispatch, and `components/PlotChartPanel.tsx`: header target picker, dismissal/focus, and data/image export ownership.
- `packages/explorEDA/src/components/charts/InPlace/` and `useChartEdit`: one edit/one undo integration.
- `apps/demo/src/docs/live/examples.ts`, `reference/settingDescriptions.ts`, `demos/dashboardSettings.ts`, `demos/coverage.ts`, and relevant tests: registration conventions and required coverage.

This is a short implementation read, not another research or demand gate. The packet’s agent guide identifies these owners, but their precise implementations were not supplied or fully inspected in this mission. Do not assume a new property automatically survives every path.

### Proposed type seam

Extend `LineChart/definition.ts::TimeSeriesSettings` with an optional `rolling` value. Absence means off. Inherited `time.interval`, `time.weekStart`, `time.aggregation`, and `time.measureField` remain single sources of truth.

```ts
// Proposed types, not an executable implementation.
interface RollingCalendarSettings {
  version: 1;                 // UTC; trailing; [start,end); input-row weighting
  method: "pooled";
  periods: number;            // integer 1..366
  edge: "full-span" | "partial-start";
  minContributors: number;    // integer >= 1; rows for count, valid rows otherwise
}

interface RollingPoint {
  id: string;
  revision: string;
  seriesKey: string;
  facetKey?: string;
  outputPeriod: { start: number; end: number };
  requestedWindow: { start: number; end: number };
  effectiveWindow: { start: number; end: number };
  bucketRange: { first: number; endExclusive: number };
  value?: number;
  numerator?: number;
  denominator?: number;       // numeric mean only; no divisor for count/sum
  memberCount: number;
  usedCount: number;
  support: {
    requestedPeriods: number;
    availablePeriods: number;
    observedPeriods: number;
    validMeasurePeriods?: number;
    collectionCoverage: "unknown";
  };
  unavailableReasons: Array<
    "partial-span" | "no-records" | "no-valid-values" |
    "below-minimum" | "numerical-overflow"
  >;
}
```

`effectiveWindow` is the requested frame intersected with the analysis calendar, not inferred collection coverage. Other Chart rows predicates remain separately visible in scope. Keep support facts orthogonal; a display priority must not erase concurrent reasons. Do not overload the existing `TimePoint.start/end` with both output and rolling bounds.

The full plan owns per-partition bucket contributor storage. `RollingPoint` stores a range into it, not a copied contributor array. Derive stable target IDs from layer, typed series/facet keys, and output-period start; use revision/configuration separately to invalidate changed evidence.

## 3. M1 — Ship a useful pooled rolling overlay

**Recommendations:** RW-01 through RW-07. This is the first public milestone and can ship without M2. Its internal steps follow, but none is a separate user-facing release.

### Step 1: pure calendar method and evidence index

**Files:** new `packages/explorEDA/src/lib/rollingCalendar.ts` and `rollingCalendar.test.ts`; extend `lib/dailyRollup.ts` for shared bucket statistics and a small UTC period step if needed. Reuse `lib/valueParsing.ts` and the contributor/eligibility contract in `lib/aggregates.ts`; extract a small compensated accumulator used by its sum/average reducer and calendar preparation.

- Introduce a pure `planRollingCalendar` and an evidence accessor such as `getRollingContributors(plan, point, subset, page)`. Take explicit all/live populations and partition keys; avoid reading application state inside the kernel.
- Construct the chart/facet calendar from all eligible source dates before peer filtering. Reuse that calendar for every series in the facet, including empty slots. Keep invalid-date omissions separately.
- Group in one pass and sort once per partition by effective timestamp then ID. Current calendar `utcPeriod` accepts strings; preserve this eligibility contract. Do not introduce a second date parser.
- Reuse shared numeric inclusion rules, raw/effective inputs, and conversion reasons. Do not infer n from `rowCount`, count invalid values as valid measurements, or recover sums from displayed averages.
- Bucket state holds member count, valid count, and the two components of a compensated sum. For each window, freshly merge both components of its K buckets. Materialize exact IDs only for requested evidence/selection/export.
- Base calendar and rolling outputs consume the **same** bucket state/count in deterministic order. Supported present K=1 results must match, including `[10^16,1,−10^16] → sum 1, mean 1/3`. Route shared `reduceNumbers` sum/average through the compensated primitive; count/min/max remain unchanged. Add focused aggregate/calendar/project regressions for improved cancellation and unavailable overflow. Sharing only a helper while reducing in different orders is insufficient for this parity requirement.
- Keep a small direct raw-member reduction as a test oracle. It must independently enumerate membership; a test that simply calls the production range helper is insufficient for boundary correctness.

**Compensated update specification:** for accumulator `(s,c)` and finite x, set `t=s+x`; add `(s−t)+x` to c when `|s|≥|x|`, otherwise `(x−t)+s`; set `s=t`. The result is `s+c`. Bucket merging feeds both bucket components into a fresh accumulator. Check all intermediate and final values for finiteness. This is a floating approximation, not an exact or associative sum. [Higham](https://nhigham.com/wp-content/uploads/2023/10/high93s.pdf) and the [pandas precision note](https://pandas.pydata.org/docs/user_guide/window.html) explain why numerical accuracy must remain a tested limit.

**Acceptance:** report A1–A3 and A5; K=1, K larger than the available grid, no readable dates, no live records, supported zero, all-invalid measures, all four intervals, both week starts, duplicate timestamps, shuffled/interleaved IDs, and stable membership under display sorting. For count, Used=all members and Excluded is empty even if a measure column happens to contain invalid values.

### Step 2: planner, rendering, and minimum-support workflow

**Files:** `LineChart/definition.ts`, `timeSeriesPlan.ts`, `TimeSeriesChart.tsx`, `TimeSeriesSettingsPanel.tsx`, and `TimeSeriesChart.test.tsx`; new `LineChart/rollingTimeSeriesPlan.ts` if separation keeps existing code readable.

- Extend the calendar plan with base and rolling layers without mutating base bucket values. Reuse typed category identity and facet partitions.
- Include base and rolling reference values in the full-population domain; live values may expand it. Keep both layers on compatible units. A later available-period mean is never stacked as though it were a total.
- Draw at the labeled period midpoint. Use a thin base and stronger rolling line with distinct line treatment, shared series color, and clear legend labels. Unavailable results break the rolling path; do not place a fake result at y=0.
- The header trace picker includes unavailable output targets even where no mark can be drawn. For dense plots, keep accessible hit/focus targets without forcing a visible dot at every point.
- Controls show rolling off/on, period count, full-span/partial-start, and minimum rows or minimum valid rows. The label changes with aggregation. Keep unknown collection coverage out of any misleading “complete” badge.
- The rolling description states current-plus-previous-K−1 periods, UTC, weighting, and operation. Default K remains 3 when the interval changes; the visible unit changes with it. Apply the interval change as one edit and invalidate old rolling evidence/active target.
- Turning rolling off removes the optional object. Switching to Raw observations follows the existing removal of `time`; undo restores it. Switching aggregation/display to an unsupported combination must be an explicit authoring action and must not leave an active, silently misinterpreted method.

**Acceptance:** A/Feb29 draws rolling 40 over an empty base day; A/Mar2 draws an observed rolling zero; partial-start values differ visibly from full-span suppression. Changing base Missing periods to Zero changes no rolling value, numerator, denominator, or contributor list. Resize at all three widths without changing data values. Test the evaluation/visible-output boundary directly; adding a new time-axis zoom feature is not a prerequisite.

### Step 3: exact selections and trace

**Files:** new `LineChart/rollingTimeSeriesTrace.ts` and `RollingTimeSeriesTraceBody.tsx`; existing `timeSeriesTrace.ts`, `TimeSeriesTraceBody.tsx`, `TimeSeriesChart.tsx`, `definition.ts::getFilterFunction`, `timeSeriesPlan.ts::timePointFilters`, `trace/traceTypes.ts`, `trace/ChartTraceScope.tsx`, and the observed trace-body dispatcher.

- Add a `rolling-window` trace kind. Show requested/effective bounds, output period, operation, weight rule, numerator, denominator, all support counts, raw/effective fields, exact IDs, and exclusion reasons. Paginate at 25 rows using bucket offsets; do not truncate the promised population.
- Add facet identity to header target routing. The existing scope's target enumeration retains only the first chart-role source; a facet chooser/reveal or explicit owner routing must make other facets' targets reachable, including unavailable outputs. Do not infer this capability from the existing header control alone.
- Rolling click/Enter selects exact member IDs. Trace actions select exact member/used/excluded IDs. Use `{type:"value", field:"__ID", values:[...]}`; `lib/rowIdFilters.ts` already recognizes it. Compile a numeric Set once outside the per-record predicate in Line Chart’s filter function.
- Replace the owner’s previous selection filters as one update. Do not append an exact set to previous owned date/measure filters. Preserve Chart rows/localFilters, workspace filters, and other charts’ filters.
- On a subsequent base-point selection, remove the previous owned ID filter before applying the existing period/series predicate. Same rolling target/set toggles off; empty-plot/header-clear removes owned selection. Empty subset buttons are disabled.
- Own selection must never join the input population of its own window. Exact ID selection prevents leakage from chart-local restrictions or facets that a date-only predicate would omit.
- Track direct output emphasis with transient `{outputId, methodKey, selectedIdSetSignature}` plus population/data invalidation. Retain through its originating own-filter update; do not key it solely on the shared trace revision. Clear when input population/method changes or another filter replaces the set. A restored ID selection may highlight records without claiming one unique selected output.
- Keep normal row-to-mark lookup pointed at the base bucket; add an ordered “Used by rolling windows” list in M1, listing supported results that use the record. Avoid returning the first overlapping window arbitrarily.
- Preserve shared close-on-stale behavior. Own selection advances the common live nonce and closes trace at this baseline. Announce selected count, restore focus, and let Rows show the selected records.

**Acceptance:** report A4 including exact sets {3,4,5}, {3}, and {4,5}; peer Web results 50 and 305/3; the local/facet South-record exclusion; selected output versus overlapping windows; toggling, clearing, and raw-after-rolling selection; `localSelections=true` host behavior. Assert selected raw IDs as well as rendered text.

### Step 4: persistence, exports, and refresh

**Files:** `utils/saveDataUtils.ts`, `types/SavedDataTypes.ts` if required, `lib/dsl/{compile,export,settingKeys}.ts`, applicable persistence tests, and the identified export owner. Verify `DataLayerProvider` and `providers/lib/carryRowSelections.ts` integration before changing them.

- Validate finite positive integers, enum/version values, required measure, and supported display/aggregation combinations. Invalid imported combinations need a specific error, not quiet fallback to a different method.
- Old saved data with no `time.rolling` restores unchanged. Persist complete method parameters; do not persist a plan or contributor arrays per output. Existing deliberate record selections remain filters, not cached results.
- Use `updateChart` and `useChartEdit`/`holdStateChanges` for a continuous numeric edit: preview valid drafts, commit once, cancel without a checkpoint. Reset restores the settings-popover opening state. Test host echo so a canonical round trip does not trigger a full rebuild.
- Exact record selections are snapshots. After append, recalculate windows and close stale traces; do not expand saved selected IDs. Use existing unique-content remapping only where old/new records are available. On an **unverified settings-only restore, clear every chart-owned `__ID` filter on a rolling chart**, retaining method configuration and localFilters. This intentionally avoids needing an origin marker that was never persisted. Preserve same-data undo and full-analysis-with-rows restoration. Thread the initiating action's restore context through the relevant entry points; equal row counts or matching positions are not proof of binding, and unknown context defaults to clearing this chart-owned selection.
- **Image:** base and rolling lines and resting method label, no editor controls (`data-export="omit"`). **Rolling output data:** one row per output/series/facet with bounds, result/status, numerator/denominator, support, method, and scope/revision metadata. **Window evidence:** normalized exact member mapping with eligibility/weight and original values. **Source records:** original selected records, not rolling rows masquerading as raw data.
- A computed output export is a snapshot. Saved settings recompute on current data. A full analysis bundle contains rows plus settings. These three meanings must be explicit in docs and export labels.

The following is the proposed Dashboard text round-trip fixture; its keys become runnable with M1. It is not a claim that the baseline compiler accepts them:

```text
line x=Date time.interval=day time.weekStart=monday time.aggregation=average time.measureField=Value time.splitField=Group time.rolling.version=1 time.rolling.method=pooled time.rolling.periods=3 time.rolling.edge=full-span time.rolling.minContributors=1
```

The resulting method object has no independent timezone, endpoint, or aggregation toggle: version 1 fixes UTC/trailing/half-open semantics, and the parent owns metric/interval. Export all nondefault values and verify export → compile → save → restore equality.

### Step 5: docs, runnable example, and actual interaction proof

**Docs in this same milestone:**

- `apps/demo/src/docs/pages/line.mdx`: **Rolling summaries**, **Window and source records**, **Gaps and minimum support**, **Select a period or a rolling window**, **Save and export moving summaries**.
- `apps/demo/src/docs/pages/calculated-fields.mdx`: clarify that scalar average is within-row; link to Rolling summaries for ordered cross-row work. Explain effective calculated inputs in traces.
- Add setting descriptions in the existing reference catalogue, and register live docs examples/steps in `apps/demo/src/docs/live/examples.ts`.

**Runnable example:** add `rolling-calendar` to `apps/demo/src/demos/examples.ts`, its dashboard definition, `coverage.ts`, and relevant coverage expectations. Add a small local dataset such as `apps/demo/public/datasets/rolling-calendar.csv` containing report A1’s records, `Record ID`, and Region. Give it a daily base-plus-rolling mean, a channel filter, a record table, and a separate count view. The scripted example selects Web, restores it, traces A/Feb29, selects its three earlier records, and traces A/Mar1’s excluded inputs. Reuse one fixture definition for expected records in unit/integration/demo tests; do not infer the expected arithmetic from the production kernel.

| Width | Authoring / evidence access | Required proof |
| --- | --- | --- |
| 1280 px | Compact nonmodal settings beside chart; header trace control. | Chart visible during edit; raw/rolling identity, exact IDs, reset, one-step undo. |
| 783 px | Existing view-only grid; chart details for editing, chart above controls. | No grid-resize dependency, overflowing labels avoided, tabs remain one scrollable row. |
| 390 px | One-column chart flow; viewport-bounded header picker and details. | Touch picks layer/series/date without a modifier or tiny-dot precision; persistent close/action row. |

At every width: roving focus with arrows/Home/End, Enter selects, Alt-Enter traces; header target picker is the alternative for touch and unavailable points. Accessible names identify facet, layer, group, period, value/support. At 390 px, prove that touch and keyboard can open an unavailable rolling output in a **non-first facet** without selecting a plotted mark. Escape dismisses the innermost editor/trace before details and returns focus. Verify real pointer, keyboard, and touch input. No plot-level Inspect buttons, native `title` tooltips, or hover-only evidence. Respect the shared compact setting rows, semantic borders, and viewport rules. The general product remains desktop-oriented; these are specific new-flow acceptance tests.

**Main M1 risk:** exact selection population diverges from the rows used in the displayed result. Secondary risks are unbound positional restoration, large-frame trace cost, and dishonest completeness labels. Do not ship a numerically plausible curve without these end-to-end proofs.

## 4. M2 — Equal-period means, separately named

**Recommendation:** RW-08. Depends on M1 and ships independently of later preparation work.

- Extend the bounded method union with `period-mean`, for a base **Average** metric. Each valid period supplies its own mean; the output averages those means. Do not reinterpret Count/Sum as this method.
- Default support requires every available calendar slot in the effective frame to have a valid period mean. In full-span mode this means K slots; in explicitly partial-start mode it means the disclosed shorter span.
- An explicit **Available periods** option skips absent/all-invalid period means and divides by r, with a separately named minimum-valid-period count. Do not reuse M1’s minimum-record threshold to mean periods. Fixed per-period eligibility requires at least one valid measure. No zero-filled period means.
- Trace period-level numerator terms and the denominator r, plus each row’s effective weight `1/(r n_b)`. It must still enumerate and select every original window member, used input, and excluded input.
- Reuse `rollingCalendar.ts`; extend settings, labels, trace, validation, DSL, and export method identifiers. Add `rollingPeriodMean.test.ts` only if it materially isolates the second method’s tests.

**Exact acceptance:** A/Feb29 is unavailable under all-period support; Available periods yields 52.5, with weights 1/4,1/4,1/2. B/Feb29 yields 135 under either policy, against pooled 176.25. Unit transformation preserves affine mean behavior. Editing weighting creates one undo step and invalidates old trace.

**Docs/example in M2:** `line.mdx` sections **Average observations or average periods?** and **Available-period denominators**; proposed `rolling-weighting` example with side-by-side pooled/equal-period charts using the same A1 data, registered in examples, dashboard, coverage, and live docs. Show both numeric difference and record weights.

**Main risk:** a period-weighted result is mistaken for a mean observation or a duration-weighted process mean. The method name and trace must prevent that interpretation.

## 5. Later extensions with bounded contracts

These are deliberately outside the first release. No external-demand gate is attached; each can be pursued as a separate capability with its own proof.

| Order / disposition | Concrete extension | Required docs, example, and main risk |
| --- | --- | --- |
| E1 · Explore, RW-09 | Declared collection/exposure intervals; explicit zero-event assumption; average daily counts/totals with denominator in periods or elapsed exposure. | `line.mdx`: **Coverage and zero events**; proposed `rolling-event-coverage`. Risk: a missing measurement or invalid period becomes a false zero. |
| E2 · Defer, RW-10 | Separate `elapsed` method anchored at declared output instants with a fixed duration and explicit closure; use report A3’s month comparisons as non-equivalence tests. | **Elapsed windows and calendar windows**; proposed `rolling-irregular-readings`. Risk: conflating last-N observations, time-weighted signals, and calendar windows. |
| E3 · Explore, RW-11 | A reusable table over the same kernel, with one row per partition/output and normalized contributor links. Then a dedicated `RollingStep` in `AnalysisProject.ts`/`evaluateProject.ts` if preparation is chosen. | Preparation docs: input grain, filter-before versus filter-after, refresh, lineage; proposed `rolling-output-table`. Risk: downstream filters silently refit an upstream result or discard source provenance. |

The project evaluator’s existing stages and `AnalysisSourceReference`/`measureContributors` are useful later seams. A reused window over already-aggregated inputs must carry sufficient sums/counts to claim original-observation pooling. Keep ordered lag/difference separate; sharing a sort/partition helper is worthwhile only when both actual implementations need it. Do not build a generalized expression platform in anticipation.

## 6. Verification and measured budgets

### Essential fixture ledger

The complete datasets, windows, IDs, numerators, denominators, and rational expectations are in [report Appendix A](report.md#appendix-a-exact-acceptance-fixtures). This is the minimum acceptance map:

| Case | Exact expected result | Protects |
| --- | --- | --- |
| Unequal daily populations, A/Feb29 | Pooled 120/3=40; period mean 105/2=52.5 | Weighting. |
| All-present unequal populations, B/Feb29 | Pooled 705/4=176.25; period mean 135 | Weighting independent of gaps. |
| A/Mar1 vs A/Mar2 | Used {3} → 90; used {6} → 0 | Invalid values versus observed zero. |
| Partial-start A/Feb28 | Candidate 120/3=40, but full-span suppresses 2/3 slots | Structural edges. |
| A/Feb29 selection | Exact {1,2,3}, despite no target-day rows | Window provenance. |
| Web peer filter | A=50; B=305/3; same calendar | Filter ordering. |
| Own A/Mar1 selection | Result stays 90 for member/used/excluded selections | No feedback. |
| Local/facet South variant | Excludes ID15 from result and selected set | Population leakage. |
| February versus 30 days | 10/2=5 versus 12/3=4 | Calendar duration. |
| Affine conversion, A/Feb29 | Sum 312; mean 104; n=3 | Correct offset handling. |
| Cross-bucket cancellation | Sum 1; mean 1/3 | Preserve compensation components. |
| Append ID16 | New mean 37.5; old selected records stay three | Refresh and snapshot semantics. |

Assert exact membership, statuses, safe integer sums/counts, and interval boundaries. Use the stated `1e−12 × max(1, |expected|)` absolute tolerance only for the small non-binary arithmetic fixtures. No timing number has been measured in this mission.

For N source records, F series/facet partitions, B calendar slots, and K window periods, target `O(N log N + N + FBK)` build work and `O(N+FB)` storage. Exact m-record selection/export necessarily costs at least O(m). Reuse the full-population plan across peer filters where practical; do not recursively redo sorting, conversions, and provenance allocation simply to obtain axis bounds.

Measure 100,000 records / four series / 1,460 days / K=30 with 10% absent cells and 5% invalid measures. Record hardware, browser, build mode, cold time, 30 warmed updates and p95, peak memory, first trace page, and a 20,000-record selection. Proposed review targets: warmed kernel 100 ms, painted update 200 ms, first trace page 50 ms. Stress 500,000 / 30 / 2,000 / K=366 and facets separately; if targets fail, first remove repeated scans/allocations or reduce a clearly documented supported bound. Do not silently sample records or substitute approximate contributors. Existing 2,000-period/30-live-series limits remain; the proposed overall output-cell ceiling is 60,000 across facets.

### Codex run sheet

Commands below are for the future implementation checkout, after the named tests/example exist. They were not run against the source packet. Use existing workspace dependencies, repository test time limits, and Node 24 for release-related checks. The repository owns changesets and PR evidence; this research run creates neither.

```bash
# Focused mathematical and chart tests during M1 development.
pnpm --filter exploreda exec vitest run src/lib/dailyRollup.test.ts src/lib/rollingCalendar.test.ts src/components/charts/LineChart
pnpm --filter exploreda check-types

# Example registration and Dashboard text round trips.
pnpm --filter demo exec vitest run src/demos/coverage.test.ts src/dashboardText.test.ts
pnpm --filter demo docs:check

# Start this checkout's source-backed demo; use the printed URL for real input checks.
pnpm dev:agent
pnpm shot /examples/rolling-calendar --name rolling-calendar

# Record the user-visible package addition once for the implementation PR.
pnpm changeset:add minor "Compare calendar summaries with rolling counts, totals, and averages, and select the exact records behind each window."

# One broad check, from one worktree, before review.
pnpm check
pnpm --filter demo build
pnpm --filter demo docs:verify

# Stop this checkout's server when verification is done.
pnpm dev:agent --stop
```

The screenshot helper covers 1280/783/390 px; add trace/settings interaction steps after confirming actual selectors. Screenshots alone do not prove keyboard, touch, focus, or arithmetic. Verify actual image/download contents as well. Add targeted persistence/refresh tests at the discovered owners rather than guessing their paths here. Do not broaden test work once the concrete gates are satisfied.

## 7. Ready-to-start handoff

**Start here:** inspect the remaining save/DSL/export owners, add the optional type, and implement the pure kernel against report A1–A5. Then complete the M1 interaction and persistence slice with its docs and runnable example. The first releasable result is the entire useful M1 workflow.

**Access status:** full mission prompt and all 30 complete packet files read before external research. Their exact inventory and seven additional complete pinned GitHub reads are in [report Appendix B](report.md#appendix-b-evidence-and-access); provider/test excerpts are separately identified. No required source is missing for the Methods decision. **Checked facts:** calendar reducers/trace/scopes, row-local calculation registry, explicit project stages, current exact-ID filtering and nonce/refresh behavior. **Proposals:** types, algorithms, new UI/exports, budgets, and every implementation milestone. No repository changes, commits, pushes, deployment, or product tests occurred.

**Open integration questions:** identify the concrete export dispatch; verify fresh-data versus same-data/full-analysis restoration so positional selections are cleared when unbound; measure the bounded workload. Defaults above make M1 startable without waiting for later coverage metadata, axis research, or reusable query outputs.

**Deliverables:** [report.md](report.md) and [implementation-plan.md](implementation-plan.md), with both files in `rolling-window-methods.zip`.
