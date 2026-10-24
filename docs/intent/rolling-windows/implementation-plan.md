# Rolling calendar summaries

Status: proposed. No rolling feature, browser proof, or performance result exists yet.
Build a calendar-chart overlay first. Add equal-period means in a second release.
See the [Methods summary](../../research/rolling-windows-2026-10-24/README.md) for decisions, sources, and local review.
Baseline: `95832bd473884aeae23453af0888b4ca5187820d`.

## Contract

- Add optional `time.rolling` to `LineChart/definition.ts::TimeSeriesSettings`. Absence means off.
- Start with `{ method: "pooled", periods: 3, edge: "full-span", minContributors: 1 }`.
  Do not add an independent version or timezone field. The method defines UTC, trailing, half-open windows.
- Inherit interval, week start, aggregation, measure, series, and facet from the parent chart.
- Support count, sum, and average in Calendar summaries, Line display. Require an explicit edit for unsupported combinations.
- A labeled period includes itself and the preceding K−1 calendar periods. Include empty slots when counting K.
  Use actual day/week/month/year boundaries and `[start,end)` membership. Default K=3; proposed limit K≤366.
- Count uses every dated member. Sum and mean use finite numeric inputs. Mean divides by valid input count.
- Full-span suppresses the first K−1 anchors. Partial start uses the available calendar intersection and states its size.
- Minimum support counts members for count, valid numeric inputs otherwise. Empty windows have no plotted value at minimum one.
- Keep absent periods, all-invalid periods, and observed zero distinct. Base gap-to-zero display never feeds rolling arithmetic.
- A complete calendar span does not establish collection coverage. Show coverage as unknown.
- Reference calendar and domain use chart-local population and facet before peer filters. Peer filters change current values.
  Own selection follows evaluation. Display bounds clip drawing, not window input rows.
- Select exact window-member IDs; trace also offers used and excluded subsets. These are snapshot selections.
  A record can belong to several windows. Track a directly chosen output separately from shared membership.

Keep this in the existing React/TypeScript library. Use pnpm and existing parsers, reducers, filters, and trace owners.
Do not add a service, formula language, or reusable query stage for M1.

## M1: pooled overlay, exact records, and authoring

Ship these steps together as one useful feature. Internal kernel work is not a separate public release.
Paths below are under `packages/explorEDA/src/` unless stated otherwise. New filenames are proposals.

1. **Calendar kernel.** Add `lib/rollingCalendar.ts` and a focused test. Extend `lib/dailyRollup.ts` for shared bucket state.
   Reuse `valueParsing.ts`, `aggregates.ts` eligibility, and typed category identity.
   Partition once, order by timestamp then ID, and retain each bucket's members once.
   Store valid count and compensated sum components. Freshly merge both components for every window.
   Resolve contributors only for evidence, selection, or export; do not copy all members into every output.
   Base and rolling calendar layers must share the same numerical state. K=1 must agree for supported present buckets.
   Keep any wider `reduceNumbers` change separately justified and tested; do not require a global aggregation rewrite.
   Compensated arithmetic is approximate. Mark nonfinite intermediate/final accumulation unavailable; never clamp it to zero.
2. **Planner and controls.** Extend `LineChart/{definition,timeSeriesPlan,TimeSeriesChart,TimeSeriesSettingsPanel}`.
   Extract `rollingTimeSeriesPlan.ts` only if it keeps the existing planner clear.
   Draw a distinguishable rolling line over the visible base line. Use the same series colors and compatible units.
   Include both layers in reference domains; current values may expand them. Unavailable results break the path.
   Show period count, full-span/partial-start, and minimum rows/valid rows in compact setting rows.
   Use `useChartEdit` for one undo step per continuous edit. Off removes the optional object.
   Changing interval or method invalidates old evidence and the active output.
3. **Exact selection and trace.** Extend `timeSeriesTrace`, `trace/traceTypes`, and `trace/TraceBodies.tsx`.
   Add `RollingTimeSeriesTraceBody.tsx` and a rolling trace source if needed.
   Show output period, requested/effective window, result, numerator, denominator, support, scope, and raw/effective inputs.
   Keep a paged exact record list. Disable empty subset actions.
   Rolling click/Enter replaces the owner's filters with an exact `__ID` value filter.
   Compile its ID Set once in `LineChart/definition.ts::getFilterFunction`, outside the per-row predicate.
   Preserve chart-local population and other filter owners. A later base click removes the prior ID filter first.
   Same target/set toggles off. Empty-plot/header clear removes the owned selection.
   Trace opens through Alt-click/Alt-Enter or the header picker, including unavailable outputs.
   `ChartTraceScope.targets` currently keeps only the first chart-role source. Add explicit facet routing for new targets.
   Normal row lookup still locates the base bucket. A bounded related-window list must not choose one overlap arbitrarily.
   Existing nonce changes close stale traces, including after own selection. Announce the result and restore focus.
   The owning chart's numerical value must still remain unchanged by its selection.
4. **Save and refresh.** Extend `utils/saveDataUtils.ts`, DSL compile/export, and the relevant restore entry points.
   Validate method, finite integer bounds, measure, display, aggregation, and support together.
   The DSL already permits the top-level `time` object; test new nested fields rather than assuming a new allowlist is needed.
   Save method settings and deliberate filters. Do not save cached windows or per-output contributor arrays.
   Keep same-data undo and host echo stable. Keep full-analysis restoration with its accompanying rows.
   On verified data refresh, reuse `carryRowSelections` where old/new rows exist. Do not expand a prior selection on append.
   A settings import onto unrelated rows cannot establish ID identity. Clear unbound chart-owned IDs at that explicit load boundary.
   Do not put blanket ID clearing in common `restoreFromStructure`; it also serves same-data undo and host updates.
   Check initial mount and simultaneous data/settings changes. Equal row counts do not prove a binding.
5. **Export and docs.** Reuse `charts/export/useChartImageExport.ts` for the chart image and method label.
   Keep `ChartDataPreview.tsx` labeled as source records; it currently shows at most 100 rows, not rolling outputs.
   Provide a small rolling-output download from the rolling trace: one row per output with bounds, support, and method.
   A window evidence download carries exact member/used/excluded IDs and inputs. Both downloads are snapshots.
   Do not replace the general Chart data surface or add a reusable export platform.

Docs and runnable example ship in M1:

- `apps/demo/src/docs/pages/line.mdx`: Rolling summaries; Gaps and support; Select a rolling window; Save and export.
- `calculated-fields.mdx`: link row-local average to the cross-row calendar feature.
- Register `rolling-calendar` in `demos/examples.ts`, `dashboardSettings.ts`, `coverage.ts`, and live docs examples.
  Use the fixture below with a Channel filter, source table, base/rolling mean, and separate count chart.
  Add setting descriptions in `apps/demo/src/docs/reference/settingDescriptions.ts`.

Prove pointer, keyboard, and touch access at 1280, 783, and 390 pixels.
Keep charts visible during settings edits; use details for narrow editing and a bounded header picker for evidence.
At 390px, reach an unavailable output in a non-first facet without precise mark targeting.
Prove Enter selection, Alt-Enter trace, arrow navigation, Escape order, focus return, toggle, clear, and base-after-rolling selection.
Create `.e2e.ts` evidence tests and register an explicit project in `apps/demo/playwright.config.ts`; arbitrary files are not discovered.

Main risk: selected records differ from the population that produced the displayed value.
Other release risks: positional restore, misleading coverage labels, and repeated contributor allocation.

## Exact acceptance fixture

Pure tests use these fixed source IDs. The demo exposes Record ID and resolves it to current provider positions.
All dates are UTC in 2024. All records have Region North unless stated otherwise.

| IDs  | Group | Date               | Values     | Channels  |
| ---- | ----- | ------------------ | ---------- | --------- |
| 1,2  | A     | Feb27 00:00        | 10,20      | Web,Store |
| 3    | A     | Feb28 23:59:59.999 | 90         | Web       |
| 4,5  | A     | Mar1 00:00         | null,"bad" | Web,Store |
| 6    | A     | Mar2 00:00         | 0          | Web       |
| 7    | A     | Mar3 00:00         | 30         | Store     |
| 8    | B     | Feb27 12:00        | 100        | Web       |
| 9,10 | B     | Feb28 12:00        | 200,400    | Web,Store |
| 11   | B     | Feb29 00:00        | 5          | Web       |
| 12   | B     | Mar1 00:00         | 50         | Store     |
| 13   | B     | Mar3 00:00         | 300        | Web       |
| 14   | A     | "bad-date"         | 999        | Web       |

For K=3 days, reference calendar is `[Feb27,Mar4)`:

| Output  | Window members → numeric used | Count; sum; pooled mean |
| ------- | ----------------------------- | ----------------------- |
| A/Feb29 | {1,2,3} → same                | 3;120;40                |
| A/Mar1  | {3,4,5} → {3}                 | 3;90;90                 |
| A/Mar2  | {4,5,6} → {6}                 | 3;0;0                   |
| A/Mar3  | {4,5,6,7} → {6,7}             | 4;30;15                 |
| B/Feb29 | {8,9,10,11} → same            | 4;705;176.25            |
| B/Mar1  | {9,10,11,12} → same           | 4;655;163.75            |

Additional failure-point checks:

- Feb28 has only 2/3 requested slots: full-span suppresses; Partial start gives A mean 40.
- A/Feb29 has no target-day rows but selects {1,2,3}. ID14 is a date omission, never a numeric exclusion.
- K=1: A/Feb29 is empty, A/Mar1 has count 2 but unavailable numeric result, A/Mar2 is observed zero.
- Minimum numeric support 2 suppresses A/Mar1 and A/Mar2; A/Mar3 remains 15.
- Peer Channel Web gives Feb29 A=50 and B=305/3. Own selection leaves its reference values unchanged.
- Own A/Mar1 member/used/excluded subsets are {3,4,5}, {3}, {4,5}. Do not directly highlight every overlapping window.
- Add ID15, A/Feb27 noon, value900, Region South. North local/facet scope must exclude it from value and selection.
- Append ID16, A/Feb28 noon, value30. A/Feb29 becomes 150/4=37.5; prior snapshot selection remains three records.
- Display clipping to Feb29 retains IDs1–3. A peer analysis filter starting Feb29 removes them.
- February `[Feb1,Mar1)` contains values4,6: mean5. Add Jan31 23:59:59.999 value2: a 30-day frame gives mean4.
- Test both week starts, year edges, offset-equivalent timestamps, leap day, ties, shuffled/interleaved input, and all-empty data.
- Transform valid inputs by `x'=1.8x+32`: A/Feb29 sum312, mean104; invalid inputs remain invalid.
- `[1e16,1,-1e16]` gives sum1 and mean1/3. Retain the correction across `[1e16,1]` and `[-1e16]` buckets.
  K=1 over the small bucket after `1e16` must give1; prefix subtraction can lose it.
- Assert membership, boundaries, counts, support, and small integer sums exactly.
  Use `1e-12 × max(1,abs(expected))` only for these small approximate arithmetic fixtures, not as a universal guarantee.

## M2: equal-period means

Add a distinct `period-mean` method for Average. Each valid calendar period supplies one mean.
Default requires every available frame slot to have a valid mean. Available periods is an explicit alternative.
Its minimum support counts periods, separately from M1's numeric-row threshold. Do not zero-fill missing means.
Trace period terms, denominator r, and each source row's weight `1/(r*n_period)`.
Extend the same settings, validation, DSL, trace, exports, and tests.

Fixture: A/Feb29 is unavailable under all-period support; available-period mean is 52.5 with weights 1/4,1/4,1/2.
B/Feb29 equal-period mean is 135, compared with pooled 176.25. Verify affine unit conversion and one-step undo.
Ship `line.mdx` sections Average observations or periods? and Available-period denominators, plus registered `rolling-weighting` example.
Main risk: users mistake equal-period weighting for the mean observation or a duration-weighted process mean.

## Limits and checks

Expected work is `O(N log N + N + F*B*K)` and storage `O(N+F*B)`.
F counts series/facet partitions; B counts calendar slots. Enumerating m exact records costs at least `O(m)`.
Measure 100,000 records, four series, 1,460 days, K=30, with absent/invalid inputs.
Record cold time, 30 warmed peer updates, memory, first trace page, and a 20,000-record selection.
Stress larger K, groups, and facets separately. Pro's timing and 60,000-cell limits are proposals, not accepted guarantees.
Start with existing calendar limits. Add a new bound or worker only after a measured failure justifies it.

Run targeted kernel/calendar/chart and restore/DSL tests during implementation, plus library types.
Run demo coverage and dashboard-text tests immediately after adding examples, then docs checks.
Run `pnpm check` once before each implementation PR, add a minor changeset, and capture UI evidence with `pnpm shot`.
Verify real image/data downloads; screenshots do not prove IDs, focus, or arithmetic.

Explore coverage/exposure rates and reusable outputs later. Defer elapsed/local-time, last-N-row, centered, and observed-bucket windows.
Keep lag/difference preparation separate. Avoid silent mean-of-means, synthetic observations, and general window expressions.
