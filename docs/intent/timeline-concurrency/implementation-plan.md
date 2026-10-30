# Exact Timeline concurrency

Build an opt-in concurrency strip inside Timeline. Use a saved finite analysis window and a grouped endpoint sweep.
Start with counts, durations, exact source records, and durable settings. Then add lane comparisons and notebook findings.

Status: planned; no feature implementation is approved by this document.
Baseline: `ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6`, unchanged on refreshed origin/main during review.
Read the [local evidence and dispositions](../../research/timeline-concurrency-methods-2026-10-30/evidence.md) before implementation.
The [eight original artifacts](assets/pro-results/timeline-concurrency-methods-2026-10-30/README.md) include the full report, plan, fixtures, and companions.

## Fixed analytical contract

- Occupancy uses `[start,end)` within a finite saved `[A,B)` window. Adjacent intervals do not overlap.
- Use `valueParsing.ts` for raw values. Missing end means open; an invalid present end is excluded.
- Missing lane/start and reversed ends are excluded. Zero-duration events remain reachable but add no occupancy.
- Duplicate rows count separately. Typed categories remain distinct; status has no automatic exclusion rule.
- Require safe integer milliseconds within the Date range. Clip before arithmetic; report metric overflow without clamping.
- A valid empty population returns zero duration and peak. A missing field returns unavailable.
- Population filters choose rows. The analysis window clips contributions. The viewport changes geometry only.
- Compute after external selections, workspace filters, owner `localFilters`, and facets, before the owner's output selection.
- An undefined facet is unrestricted. An explicitly empty facet is empty, including in record queries.
- Use all owner-population rows for stable reference lanes and count-axis bounds under the accepted window and scope.

For count `c(t)`, integrate each exact segment of duration `d`:

| Quantity                | Calculation                                  | Unit        |
| ----------------------- | -------------------------------------------- | ----------- |
| Busy duration           | Sum `d` where `c > 0`                        | ms          |
| Total interval duration | Sum `c × d`                                  | interval-ms |
| Duration above K        | Sum `d` where `c > K`                        | ms          |
| Excess above K          | Sum `max(c − K, 0) × d`                      | interval-ms |
| Peak                    | Maximum count on a positive-duration segment | intervals   |

Global row concurrency counts intervals. Occupied-lane count counts distinct active lanes.
Any-lane conflict duration measures time when at least one lane exceeds K.
Summed lane conflict duration is lane-time; it can exceed the elapsed any-lane duration.
Do not call any of these utilization without an availability denominator.

Keep every positive interval endpoint, even when the total count does not change.
Sort grouped events once. Integrate touched lanes lazily; avoid a lane-by-global-segment matrix.
Retain compact counts and boundaries. Fetch contributor IDs only for a committed selection or open trace.
Expected cost is `O(N + n log n)` time and linear retained state, including diagnostics for N input rows.
Start with a scan for point/range contributors. For disjoint qualifying runs, use sorted runs and binary search per interval.
Do not copy a contributor array into every production segment.

## Milestone 1 — measure, select, trace, and reopen

Outcome: measure one lane or all active intervals, inspect exact records, and reopen the same analysis.
No dependency on pending preparation or selection-identity research is required.

Implement the following as one usable increment:

1. Add the pure normalizer, sweep, contributors, checked arithmetic, and precise formatting.
2. Add optional versioned `concurrency` settings in `Timeline/definition.ts` and compact exact UTC controls in `TimelineSettingsPanel.tsx`.
3. Fit the concurrency view to the accepted window; clip bars consistently and show raw versus effective endpoints in traces.
4. Add the strip, selected-lane scope, row-count summaries, and exact atomic-cell navigation in `Timeline.tsx` and small child components.
5. Add a Timeline-owned `interval-contributors` filter with `active-at` or positive `overlaps` semantics.
6. Compile that predicate once per update, with all mapped columns, owner population, and captured typed facet predicates.
7. Integrate saved validation, Dashboard text, filter editing/labels, callbacks, notebook structural cleanup, and folder reopen.

Start the pure core near `Timeline/timelinePlan.ts` or in one `lib/timelineConcurrency.ts` module.
Split modules when they gain separate responsibilities. Pro's seven-file core layout is a suggestion, not a required abstraction layer.
Keep the existing parser and legacy Timeline mode. Do not change global facet behavior without checking its other callers.
The analytical adapter must handle an explicitly empty facet correctly from its first release.

Saved selection stores its semantic query: mapped fields, finite window, an exact instant or range, lane restriction, and facet predicates.
It does not store a segment ordinal or resolved row positions.
A strip click records a visible exact instant inside the cell; keyboard activation uses the cell start.
A range query returns rows involved anywhere in that range. Its trace must not call them simultaneously active.

Replace the prior bar/brush/contributor output selection in one `updateChart` call.
Plain bar click and legacy brush replace the contributor query in return. A repeated identical query toggles off.
Clear preserves analysis settings and population. Alt-click/Alt-Enter opens a trace without a settings update.
Idle space remains empty-space clear; explicit keyboard or table targets can inspect idle cells.

Clear an incompatible authored contributor query when mappings, window, scope, facets, or population change.
A threshold edit may retain an active-at query. Disable removes the output query while retaining the accepted settings.
Refresh preserves the instant/range and recomputes membership. Close stale traces when their complete input revision changes.

Mandatory integration paths:

| Path under `packages/explorEDA/src/`                                                                                                   | Required behavior                                                                                 |
| -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `components/charts/Timeline/`                                                                                                          | Core adapter, rendering, controls, trace, filter definition, and tests                            |
| `components/charts/useGetLiveData.tsx`, `hooks/CrossfilterWrapper.ts`, `lib/chartPopulation.ts`                                        | Owner-excluded calculation, local population, and exact facet intersection                        |
| `types/FilterTypes.ts`, `utils/saveDataUtils.ts`                                                                                       | Owner-aware validation; reject the special filter in scalar-only slots                            |
| `lib/dsl/compile.ts`, `export.ts`, `settingKeys.ts`                                                                                    | Complete settings and filter roundtrip; no silently dropped predicate                             |
| `components/settings/FiltersSettingsTab.tsx`, `components/charts/chartAccessibility.ts`, `components/project/settingsCompatibility.ts` | Visible query control and complete multi-field dependencies                                       |
| `components/charts/trace/traceTypes.ts`, `ChartTracePanel.tsx`, `traceRows.ts`                                                         | Aggregate trace dispatch and exact current output-record routing                                  |
| `providers/DataLayerProvider.tsx`                                                                                                      | One accepted edit/callback; stable host echo and cache invalidation                               |
| `lib/notebook/writeBack.ts`                                                                                                            | Remove incompatible authored selection during structural edits; preserve transient click behavior |
| `lib/project/analysisText.ts`, `writeFolder.ts`, `folder.ts`                                                                           | Supported text export and actual folder reopen                                                    |

Also use the existing app `ProjectWorkspace.tsx` and `saver.ts` route for flush/reopen tests.
The saver already orders writes. Reuse it; do not create another queue.
`traceRowIds` supplies current output records. Project query navigation performs any further source mapping.
Do not claim a grouped or joined output row is already an original source row.

Export the complete `filters` array once if the special predicate needs that form.
Do not also emit duplicate `select.` tokens. Pro's companion JSON-array syntax is proposed acceptance input.
Validate export → compile → export through actual code, with no supported omissions.
Check notebook `textPart` and `skippedKey`: a new `filters=[...]` fallback must not start saving every click.
Structural cleanup must also work when an incompatible authored filter is absent from current transient runtime filters.

Important acceptance values from the supplied fixture:

| Measure                              | All rows | Lane A |
| ------------------------------------ | -------: | -----: |
| Busy duration, ms                    |   660000 | 600000 |
| Total interval duration, interval-ms |  1440000 | 960000 |
| Duration above 1, ms                 |   480000 | 240000 |
| Excess, interval-ms                  |   780000 | 360000 |
| Peak intervals                       |        4 |      3 |

Window: `1768467600000..1768468320000`, January 15, 2026, 09:00–09:12 UTC; population `included=true`.
Compare every atomic cell and contributor set to the [expected JSON](assets/pro-results/timeline-concurrency-methods-2026-10-30/timeline-concurrency-expected.json).
At 09:04 the global set is A2,A3,A4,B2; lane A has A2,A3,A4. Both duplicate rows count.
The range 09:03–09:07 involves seven rows, with peak four.
After refresh, active-at retains A2,A3,A4 at new positions; its containing global cell shrinks from 60000 to 30000 ms.
Overlap with the former minute additionally includes new A8.

Test the actual new implementation for empty facets, zero events, exact bounds, invalid precision, overflow, and typed categories.
Prove owner selection leaves its measurement unchanged and local-population rows cannot leak into linked targets.
Preserve existing inclusive-brush tests. Test invalid drafts/Escape, one callback per accepted edit, no callbacks for hover/trace, and stable host echoes.
Validate JSON and both query relations through text and actual `.eda` folder close/flush/reopen.
Test structural notebook cleanup, transient click behavior, and preservation of unrelated prose.

Docs and example in this milestone: extend `apps/demo/src/docs/pages/timeline.mdx` with measurement, window, threshold, and records sections.
Register a focused `timeline-concurrency` example in `docs/live/examples.ts`, `demos/examples.ts`, and `demos/coverage.ts` as appropriate.
Use a small exact fixture, retaining duplicates, plus a dashboard in `demos/journeyDashboards.ts`.
Add docs-kit setting descriptions for each supported control. Verify the docs gate and example text roundtrip.
Test real input at 1280, 783, and 390 px, exact readouts, long lanes, keyboard focus, empty state, and image export.

Main risk: confusing output selection, population, and time clipping; or losing a multi-field query in export/writeback.

## Milestone 2 — occupied lanes and conflict discovery

Outcome: find affected lanes and distinguish activity from same-lane conflicts. Depends on milestone 1.
Expose occupied-lane count, lane summaries, any-lane conflict duration, and conflict highlighting.
Retain status colors. Use another mark treatment for conflicts and clear labels for counts, ms, interval-ms, and lane-ms.
Keep full exact records reachable when a preview is bounded.

Extend the strip, trace, settings/validation, and temporary chart-data surface. Add a lane-summary component only as needed.
Do not create a dense lane-by-segment matrix. Query detailed streams only for the chosen lane.
Occupied-lanes mode requires all-lane scope; release validation and rendering together.

Proof: occupied-lane integral is 1080000 lane-ms; peak is two lanes; duration above one is 420000 ms.
Any-lane conflict is 240000 ms, and its witnesses are A2,A3,A4,A5,A6. B rows are not conflict witnesses.
For two A intervals `[0,2)` and two B intervals `[1,3)`, any-lane conflict is 3 ms; summed lane-conflict time is 4 lane-ms.
Prove JSON/text/folder roundtrips and one callback per accepted edit.

Docs and example: add interval-versus-lane and conflict-discovery sections to `timeline.mdx`.
Add a room-bookings view with a fixed March 2025 window extending past the last hold.
Show all-status and explicitly filtered populations. Add a lane-summary → scope → trace journey and example coverage.

Measure parsing, sorting, sweep, drawing, lookup, and retained bytes on a named machine when addressing performance.
Use 1k/10k/100k inputs with nesting, many lanes, equal endpoints, and duplicates.
Pro's 50 ms compute and 100 ms lookup triggers are hypotheses, not validated product budgets or hard row limits.
Choose acceleration from measured interaction cost; indexes and workers remain Explore.

Main risk: labeling global activity as double booking or adding quadratic lane work.

## Milestone 3 — typed notebook interval findings

Outcome: notebook prose reports exact duration or peak and opens its interval evidence. Depends on milestone 1.
Occupied-lane findings also require milestone 2's supported measure contract.

Add an explicit finding kind and dispatch in `lib/notebook/findings.ts`, `lib/dsl/compile.ts`, and saved validation.
Add a small interval evaluator and typed result. Dispatch its records in `components/notebook/NotebookFindings.tsx`.
Do not force a duration into `MetricCardPlan` or the row-count share/difference rules.

First scope: the declared owner's fixed window, threshold, lane, workspace/local population, and explicit facets.
Ignore owner output selection and other notebook chart clicks. Label this eligible analysis scope.
Support raw source fields in both initial and mounted evaluation first.
If calculation or conversion changes any required field, return unsupported in both paths until a shared adapter exists.
Value and records must share the same immutable result revision. Empty valid analysis is zero; missing fields and overflow are unavailable.

Persist accepted analysis settings through current writeback. Ordinary clicks remain transient.
Authored selection can restore, but structural edits remove incompatible authored selection atomically.
Dashboard export excludes findings today; `.eda.md` source carries them.

Proof: conflict=240000 ms, total interval duration=960000 interval-ms, peak=3 for lane A.
Conflict records are the five-row union over time, not five simultaneous records.
Initial/mounted values agree, other notebook clicks do not alter the eligible findings, and supported population edits alter both.
Test unsupported preparation, unknown chart/fields, revision changes, source refresh, and actual `.eda.md` close/flush/reopen.

Docs and example: add “Interval findings” to `apps/demo/src/docs/pages/notebooks.mdx` and cross-link `timeline.mdx`.
Register a runnable notebook from the original companion, with interpolation, record link, settings edit, and reopen steps.
Update relevant docs/examples coverage in the same increment.

Main risk: static/mounted disagreement or silently reading a different population than the prose claims.

## Optional and excluded work

Explore centered interval indexes, workers, and segment snapshots only after a measured or concrete need.
A segment snapshot has a new row grain; it does not gain live source lineage through generic export.
Defer live derived datasets, arbitrary temporal joins, capacity calendars, recurrence, scheduling edits, utilization, and advanced notebook comparisons.
Avoid sampled occupancy as an exact answer, pair enumeration as the core, quadratic contributor arrays, silent status rules, and clock-relative horizons.

During implementation, run targeted core/Timeline, filter/persistence, notebook, and folder tests.
Use the shared test limits and pnpm. Run `pnpm check` once before each implementation PR and include the required changeset.
Research-only checks and Pro's verifier do not prove the new runtime, browser, callback, or persistence behavior.
