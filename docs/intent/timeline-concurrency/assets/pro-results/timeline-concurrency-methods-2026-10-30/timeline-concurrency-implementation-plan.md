# Timeline concurrency — buildable implementation plan

Build a saved, finite-window concurrency mode inside the existing React Timeline, using a pure grouped-endpoint sweep and lazy exact contributor queries. Ship the strip, source-record trace, semantic selection, and persistence as one usable increment; then add lane summaries and occupied-lane views; then add explicit notebook interval findings. This plan fixes the method contract and acceptance values so Codex can implement against the pinned source without depending on unbuilt temporal-preparation work.

**Baseline:** [ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6](https://github.com/byronwall/explorEDA/tree/ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6) in byronwall/explorEDA.  
**Date:** October 30, 2026.  
**Status:** Proposed implementation. No repository changes or application tests were performed.  
**Method report:** [timeline-concurrency-report.md](timeline-concurrency-report.md).  
**Planning dispositions:** Build means recommended scope, not approval to implement.

## 1. Scope and recommendation ownership

The report is the authoritative reasoning and source bibliography. This plan is the worker handoff and uses its stable recommendation IDs.

| Disposition | IDs | Implementation consequence |
| --- | --- | --- |
| **Build** | TC01–TC18 | Implement in the three independently shippable milestones below, with docs, examples, and acceptance checks in the same increment. |
| **Explore** | TC19–TC20 | Run measured performance work or a provenance-bearing segment-snapshot experiment only after the relevant concrete need appears. |
| **Defer** | TC21–TC23 | Do not block the first release on live derived-dataset linkage, scheduling/capacity features, a global analysis registry, or advanced notebook scopes/comparisons. |
| **Avoid** | TC24–TC26 | Do not use pair enumeration as the primary engine, store every segment's contributor array, clamp answers, infer status rules, or persist a moving “now.” |

There is no demand gate. The capability is requested. There is also no requirement to migrate the React implementation to Solid or another framework.

### Fixed decisions

- Occupancy is [start,end), with a fixed [A,B) analytical window.
- Threshold K is a nonnegative safe integer; “above” means strictly greater.
- Missing end is open. Invalid present end and reversed end are excluded.
- Missing lane or unreadable start is excluded from every analytical measure.
- Duplicate source rows count separately. Zero-length events have zero occupancy.
- Population filters are independent of analytical clipping.
- The owning Timeline's output selection does not narrow its own calculation.
- Exact segment records are resolved on demand from current normalized intervals.
- Existing inclusive brush semantics remain separate.
- New findings use an interval-specific evaluator, not a row aggregation alias.
- No result depends on viewport width or rendering resolution.

## 2. Baseline integration map

### Existing files to edit

All paths below are repository-relative. Symbols refer to the named baseline.

| Existing file or group | Concrete integration |
| --- | --- |
| packages/explorEDA/src/components/charts/Timeline/definition.ts | Extend TimelineSettings; validate settings; compile the new multi-field contributor predicate while preserving legacy brush behavior. |
| Timeline/Timeline.tsx | Resolve population, call the pure core, fit the active analytical window, render strip, dispatch selection and trace, and update settings atomically. |
| Timeline/TimelineSettingsPanel.tsx | Compact enable/window/threshold/scope controls; precise UTC editing; use one accepted settings transaction. |
| Timeline/TimelineTraceBody.tsx | Keep existing single-interval trace and add/route analytical clipping explanations where applicable. |
| Timeline/timelinePlan.ts | Reuse baseline parsing and typed-lane semantics; extract a shared reader only if it avoids divergence without changing legacy behavior. |
| Timeline/timelinePlan.test.ts and Timeline.test.tsx | Preserve legacy tests and add finite-window, source selection, exact trace, and persistence regression cases. |
| components/charts/useGetLiveData.tsx | Distinguish undefined facet IDs from an empty array; verify that an explicit empty facet does not become all rows. |
| hooks/CrossfilterWrapper.ts and lib/chartPopulation.ts | Reuse existing own-dimension exclusion and local-population behavior; no blanket crossfilter redesign. |
| providers/DataLayerProvider.tsx | Ensure settings/filters survive save and restore; group callbacks; invalidate derived caches on source/preparation changes; retain existing refresh behavior. |
| types/FilterTypes.ts | Add the explicit Timeline-owned interval-contributors discriminant. |
| types/ChartTypes.ts and types/SavedDataStructure.ts | Carry updated chart/filter/finding types; do not add derived segments or resolved source-ID arrays to saved state. |
| utils/saveDataUtils.ts | Validate the complete new settings and filter contract, placement, required fields, and notebook finding shape. |
| lib/dsl/settingKeys.ts | Register concurrency under Timeline's allowed keys; document findings' existing Dashboard-export exclusion. |
| lib/dsl/compile.ts and export.ts | Compile/validate/export the settings and new predicate explicitly; add notebook finding production later. |
| components/charts/trace/traceTypes.ts | Add concurrency segment/summary trace union members. |
| components/charts/trace/ChartTracePanel.tsx | Add TraceBody dispatch and integrate exact contributing source rows. |
| components/charts/trace/traceRows.ts | Add traceRowIds support for concurrency traces, enabling existing project query-flow navigation. |
| components/charts/trace/ChartTraceScope.tsx | Reuse stale revision closure and verify the new plan revision includes semantic settings. |
| lib/notebook/findings.ts and findings.test.ts | Add explicit interval finding dispatch, typed result, scope, exact calculation, and static evaluation tests. |
| components/notebook/NotebookFindings.tsx | Add interval records rendering instead of treating the new plan as MetricCardPlan. |
| lib/notebook/compileNotebook.ts, readNotebook.ts, writeBack.ts | Compile the new declaration and persist analytical settings while retaining transient click semantics. |
| lib/project/analysisText.ts, writeFolder.ts, folder.ts | Prove full analysis text export and reopen without losing the predicate or analytical window. |
| apps/app/src/ProjectWorkspace.tsx and saver.ts | Verify save queue/flush/reopen behavior through the existing FolderSaver route. |

The packet contains the central Timeline, provider, settings, DSL, findings, tests, and demo files. The crossfilter, trace dispatch, notebook UI/writeback, and folder route were additionally inspected at the exact commit. Some large supplemental host files were read only in the relevant regions. Codex should read their complete local versions before editing them.

Filter chips, the Filters-tab manual editor, field dependency collection, and chart-accessibility helpers are additional mandatory integration points. Their exact current implementations should be located by searching the existing Filter discriminants and getChartFields, not guessed from component names. A new multi-field filter must declare lane/start/end/facet dependencies; a field-type edit must not leave a stale end-field reference merely because filter.field stores the lane.

### Proposed new files

Names are proposed modules, not existing APIs.

~~~text
packages/explorEDA/src/lib/timelineConcurrency/
  types.ts
  validate.ts
  normalize.ts
  sweep.ts
  contributors.ts
  population.ts
  format.ts
  timelineConcurrency.test.ts
  contributors.test.ts
  fixtures/
    timeline-concurrency-fixture.json
    timeline-concurrency-expected.json

packages/explorEDA/src/components/charts/Timeline/
  TimelineConcurrencyStrip.tsx
  TimelineConcurrencyTraceBody.tsx
  timelineConcurrencyAdapter.ts
  TimelineConcurrency.test.tsx

# Milestone 2
  TimelineLaneSummary.tsx

# Milestone 3
packages/explorEDA/src/lib/notebook/
  timelineFinding.ts
  timelineFinding.test.ts
~~~

The fixture JSON is an acceptance format, not a new saved analysis format. Test adapters should translate rows[].data to ordinary source rows and compare the plan to the expected mathematical result.

## 3. Pure computational contract

### 3.1 Input and result responsibilities

The numerical core receives:

- An explicit current population of unique source IDs.
- Parsed/mapped lane, start, and end values or immutable column references.
- The saved finite window and threshold.
- Typed scope and a population revision.
- The stable lane universe if zero lanes should remain represented.

It returns:

- Positive clipped intervals, retaining current source IDs and original parsed endpoints.
- Zero-duration events, invalid reasons, and out-of-window classifications.
- Sorted endpoint boundaries and compact scalar segment values.
- Per-lane summaries plus global row, occupied-lane, and any-lane-conflict summaries.
- Exactness/error status.
- Enough normalized interval data to answer contributor queries without copying every active set.

It does not read React state, mutate a filter, call Date.now, infer a status filter, or resolve a business identifier. Parsing must call the current valueParsing helpers. A raw field read belongs in the adapter/normalizer, not repeatedly inside a per-row filter closure.

### 3.2 Proposed types

These definitions fix the planned public meaning; exact exported names can remain internal until the feature's package API is settled.

~~~ts
type FiniteWindow = {
  startMs: number;
  endMs: number;
};

type TimelineConcurrencySettings = {
  version: 1;
  enabled: boolean;
  window: FiniteWindow;
  threshold: number;
  measure: "rows" | "occupied-lanes";
  scope:
    | { kind: "all" }
    | { kind: "lane"; value: string | number | boolean };
};

type IntervalContributorsBase = {
  type: "interval-contributors";
  version: 1;
  field: string;       // Owner's lane field.
  startField: string;
  endField: string;
  window: FiniteWindow;
  laneValue?: string | number | boolean;
  facets: Array<{
    field: string;
    value: string | number | boolean | null;
  }>;
};

type IntervalContributorsFilter =
  | (IntervalContributorsBase & {
      relation: "active-at";
      atMs: number;
      range?: never;
    })
  | (IntervalContributorsBase & {
      relation: "overlaps";
      range: FiniteWindow;
      atMs?: never;
    });
~~~

Absent concurrency means legacy Timeline behavior. A retained object with enabled=false preserves the user's accepted window and threshold for later re-enable. Disabled mode may not retain an active interval-contributors output filter. The type above describes the complete staged design: Milestone 1 accepts only measure=rows and rejects an imported unsupported measure; Milestone 2 enables occupied-lanes in validation, rendering, and controls together. No release may accept and silently ignore a declared measure.

Version 1 accepts ordinary JSON scalar lane/facet selectors with finite numeric values; null is permitted only for missing facet categories, never for a missing lane. The analytical all-lane population still uses the baseline typed category keys. If a source has a non-finite numeric category, preserve it in the all-lane calculation and trace, but do not serialize it as null or silently retarget it: the first scalar selector editor must report that this category cannot be saved as a lane/facet selector until an explicit tagged-category encoding is added. This is a serialization boundary, not a reason to drop the row from all-lane totals.

For regular categories, compare with categoryKey/categoryEqual, preserving numeric 1 versus string "1". Canonicalize missing facet values to null for persistence and use the same facet identity semantics as rendering.

### 3.3 Validation rules

Validate settings at every entry point: interactive commit, saved JSON, Dashboard compilation, notebook compilation, and folder reload.

- Mapped fields exist in the current column-name set before computation. Present-but-invalid values become exclusions; an absent field makes the analysis unavailable.
- All supplied timestamp bounds and active-at instants are safe integers within ±8.64e15 ms.
- A<B and the window width is a safe integer.
- K is finite, nonnegative, and a safe integer.
- version=1, enabled is boolean, measure is known, and scope is complete.
- occupied-lanes is valid only with all-lane scope.
- Source timestamp numbers must satisfy the exact millisecond method's range/precision rule after timestampOf. Do not change the parser globally.
- A contributor filter is permitted only under a Timeline's filters.
- Its field/startField/endField match the owner, and its window matches the owner's accepted analytical window.
- Its atMs is in [A,B), or its positive overlap range is contained in [A,B).
- Its lane restriction is compatible with the owner's scope.
- Facet predicates have known fields, valid typed values, and no duplicate contradictory field restrictions.
- Exactly one relation-specific payload is present. Reject malformed combinations rather than filling defaults.
- New selection cannot coexist with stale owner __ID or brush selections unless the UI has explicitly authored an intersection. First release uses one output selection mode.
- Reject a special filter in scalar-only workspace, Rows, or local population filter slots.
- Reject invalid JSON state and produce actionable DSL diagnostics; never fall back to an automatic horizon.

Negative thresholds, fractional numeric timestamps, zero-width or reversed windows, nonfinite values, out-of-Date-range values, missing keys, and mismatched-owner cases each need a targeted test. Negative epoch timestamps are valid when the other requirements hold. A large valid K above the maximum count is legal and yields zero time/excess above K.

### 3.4 Exact arithmetic and representation

Use integer milliseconds for the proposed method. Textual sub-millisecond rounding remains the baseline parser's behavior and must be visible in raw/parsed trace values. Numeric fractional timestamps are explicitly unsupported for this exact millisecond analysis.

Clip before calculating the analytical duration. A very long source interval may have a safe clipped duration even when its original end−start is unsafe. Treat an unavailable original duration separately from the valid clipped contribution.

For first implementation, checked Number arithmetic is sufficient:

- Before publishing an arithmetic result, require Number.isSafeInteger.
- Check individual differences, products, and running sums.
- Track overflow per metric, so a peak can remain useful while an integral is unavailable.
- Do not let a rounded unsafe number enter a notebook finding or JSON result labeled exact.
- Do not persist BigInt values in existing settings serialization.

Keep display formatting separate. Existing timelineTime omits seconds/milliseconds, and timelineDuration rounds short spans to minutes. Add format.ts for exact ISO UTC bounds, millisecond values, and readable sub-second/second/minute durations. The trace always exposes exact integer milliseconds, even when the headline says “4 min.”

### 3.5 Algorithm sketch and data bounds

Normalize positive intervals into two events each. Sort once; group equal timestamps. Integrate the previous state to the group time, update every touched lane, then expose the next state. Never observe an intermediate within-group peak.

Per-lane accumulators record lastChangedAt and prior count. Update only touched lanes, then finish each lane at B. Maintain global row count, occupied-lane count, and number of over-threshold lanes incrementally.

A segment stores scalar counts and bounds, not an ID array. Global atoms are O(n); per-lane minimal streams are O(n+g) in total. A selected lane can be projected onto the global common refinement for aligned inspection, but do not store all lanes at every global boundary. The numerical structure is O(n+m+g), where n counts positive intervals; retaining classifications or IDs for all N input rows changes the complete retained bound to O(N+m+g). Alternatively retain diagnostic counts and query their records lazily from the unchanged source population.

On-demand contributor predicates:

~~~ts
// A valid clipped positive interval.
type Interval = {
  sourceId: number;
  laneKey: string;
  startMs: number;
  endMs: number;
};

const activeAt = (row: Interval, atMs: number) =>
  row.startMs <= atMs && atMs < row.endMs;

const overlapsPositive = (row: Interval, range: FiniteWindow) =>
  row.startMs < range.endMs && row.endMs > range.startMs;
~~~

For an exact atomic segment, activeAt at its start yields its simultaneous set. For a selected arbitrary range, overlapsPositive yields all involved rows, not one simultaneous set.

Query the exact contributors only for committed selection or trace. Hover uses endpoint binary search. If a span is visually coalesced, retain its atomic partition and resolve the pointer to one cell before tracing.

For summaries, define witnesses by metric:

- Total interval duration: all positive clipped rows; each row's clipped duration is additive.
- Busy duration or global duration above K: rows active in the qualifying time segments.
- Per-lane duration above K: rows in that lane active in its qualifying segments.
- Any-lane conflict duration: rows in lanes actually above K at that instant; do not list innocent rows from other lanes as causing that conflict.
- Occupied-lane summaries: active lane identities and the source rows establishing them.
- Peak: the union over all tied peak segments, labeled as a union over time.

Union busy time, excess, and peak are not additive per-row allocations. Explain them through segments.

For a summary over r disjoint qualifying runs, merge and sort the runs once. For each interval, binary-search the first run ending after the interval starts and test whether its start precedes the interval end. Return each involved row once in O(n log r+k), using that row's own lane runs for any-lane-conflict witnesses. Do not perform an interval-by-run Cartesian scan.

## 4. Population, gestures, and trace contract

### 4.1 Population adapter

The Timeline adapter uses the baseline pre-own-selection live group, intersects its local population, and then applies facet constraints. It must not use global getFilteredRowIds as a substitute for the strip's population, because that includes the owner's selected output.

Build or reuse an explicit resolver with these inputs:

1. All source IDs with owner localFilters.
2. Other chart/workspace filters, honoring linked or notebook-local mode.
3. Optional facet ID set; undefined and [] are distinct.
4. Source and preparation revision.

Use the same resolved population for summary values and trace queries. Include it in cache invalidation along with W, K, field mappings, lane scope, facet scope, and relevant prepared-column revision. Do not use only interval count as a revision: edited endpoints can change duration with unchanged count.

Cache a separate full-P₀ reference peak for the same W, measure, and scope to keep strip heights stable through external filtering and facets. Use a nonzero drawing range when every count is zero. A threshold setting may explicitly expand the visual reference to show its line. Building that reference is an additional sweep over its own input size; include it in measurements and invalidate it on source/preparation/local-population/window changes, not every hover or own selection.

The owner filter predicate must include getPopulationTest(owner, fieldGetter) for new contributor selections, so linked targets cannot gain records excluded by the owner's localFilters. Capture clicked facet equality predicates in the filter.

### 4.2 Atomic interaction updates

A strip click:

- Locates the exact atomic cell.
- Uses atMs=clamp(floor(invertedPointerTime), cell.startMs, cell.endMs−1); keyboard uses cell.startMs.
- Constructs the semantic active-at filter.
- Replaces prior row/brush/contributor output selection in one updateChart call.
- Preserves local population and analytical settings.

At exactly B there is no cell. Do not manufacture a zero-width cell or look one millisecond beyond the horizon.

A positive-overlap query uses an explicit exact-range control in the existing temporary trace/chart-data surface. It is labeled “Intervals involved over this range.” It does not change the legacy brush to half-open semantics.

Gesture requirements:

- Plain source-bar click selects that row, replacing the contributor selection.
- Plain strip-mark click filters exact current contributors.
- Alt-click and Alt-Enter trace without changing filters.
- Enter/Space on a focused strip mark selects it.
- True empty plot space clears the owner's output filters.
- Count-zero spans have no filled occupancy mark: a plain click clears; an Alt inspection or explicit keyboard/table target can still explain the idle cell.
- Clearing leaves W, K, scope, and localFilters intact.
- Pointer selection never starts an unwanted brush/drag.
- Controls in chart headers follow current drag-cancel and tooltip conventions.
- Window editing is precise and separate from the existing hour-snapping brush.

When W, mapped fields, scope, facet configuration, or localFilters change, remove incompatible contributor selection in the same transaction. A threshold-only change may retain active-at. A data refresh retains the point/range predicate but recomputes its current membership.

### 4.3 Trace payload and integration

Use an explicit trace result, conceptually:

~~~ts
type ConcurrencyTraceTarget =
  | { kind: "segment"; startMs: number; endMs: number; anchorMs: number }
  | {
      kind: "summary";
      metric: string;
      qualifyingRanges: FiniteWindow[];
    };

type TimelineConcurrencyTrace = {
  kind: "timeline-concurrency";
  id: string;
  revision: string;
  target: ConcurrencyTraceTarget;
  methodVersion: 1;
  bounds: "[)";
  window: FiniteWindow;
  threshold: number;
  scopeDescription: string;
  populationDescription: string;
  rowCount?: number;
  occupiedLaneCount?: number;
  sourceIds: number[]; // Materialized for this opened trace only.
};
~~~

The actual trace can retain a compact query descriptor instead of every qualifying range if the descriptor resolves against the same immutable plan revision. sourceIds are runtime output, never persistent identity.

Add dispatch in all three routes: ChartTrace union, ChartTracePanel.TraceBody, and traceRows.traceRowIds. Verify QueryRowsLink receives the current contributing source IDs and maps them through the current project's result rows.

The record table shows original input, parsed instant, clipped interval, duration, open-end/clipping flags, lane, and source row. Summary records distinguish “involved over time” from “active together.” Invalid/zero/outside populations have separate reachable explanations.

Preserve existing trace invalidation. On source/window/filter revision change, close the stale inspection or resolve a new trace visibly. Do not silently retain a former segment's 60000 ms duration after a new endpoint splits it into 30000 ms cells.

## 5. Saved JSON, Dashboard text, callbacks, and folder reopen

### 5.1 Concrete companions

These are complete proposed acceptance artifacts:

- [timeline-concurrency-saved-settings.json](timeline-concurrency-saved-settings.json)
- [timeline-concurrency-dashboard.eda](timeline-concurrency-dashboard.eda)
- [timeline-concurrency-notebook.eda.md](timeline-concurrency-notebook.eda.md)

They are not claimed to compile or restore at the baseline. New concurrency settings, the new filter, and the new finding production must be implemented first. The saved settings JSON includes the full required SavedDataStructure fields with baseline defaults. The test data are rows[].data in the fixture input.

Their shared analytical payload is:

~~~json
{
  "version": 1,
  "enabled": true,
  "window": {
    "startMs": 1768467600000,
    "endMs": 1768468320000
  },
  "threshold": 1,
  "measure": "rows",
  "scope": {
    "kind": "lane",
    "value": "A"
  }
}
~~~

The saved owner selection is:

~~~json
{
  "type": "interval-contributors",
  "version": 1,
  "field": "lane",
  "startField": "start",
  "endField": "end",
  "window": {
    "startMs": 1768467600000,
    "endMs": 1768468320000
  },
  "relation": "active-at",
  "atMs": 1768467840000,
  "laneValue": "A",
  "facets": []
}
~~~

This is not a snapshot of rows 1,2,3. It is an active-at query that currently resolves those positions. The fixed source-population predicate included=true is carried separately in owner localFilters.

### 5.2 Dashboard text implementation

Use the existing generic head, not an invented baseline shorthand:

~~~text
chart timeline @bookings field=lane startField=start endField=end {
  where.included=true
  concurrency.version=1
  concurrency.enabled=true
  concurrency.window.startMs=1768467600000
  concurrency.window.endMs=1768468320000
  concurrency.threshold=1
  concurrency.measure=rows
  concurrency.scope.kind=lane
  concurrency.scope.value="A"
}
~~~

The companion also uses an explicit filters=[{...}] JSON array to preserve the multi-field predicate. Treat that as the chosen proposed export route and prove or implement its parser support. Do not convert the predicate to select.Start date-range syntax: the current compiler does not preserve exclusive datetime bounds that way.

Specific work:

- Add concurrency to CHART_SETTING_KEYS.timeline.
- Preserve nested scalar settings through applyPath and explicit complete-object validation.
- Add explicit new-filter handling to export.filterPairs or a deliberately selected full filters-array fallback.
- If any filter in an owner requires the full-array form, export the whole owner filters array once. Do not also emit duplicate select tokens for some filters or drop the unknown kind.
- Compile the entire filter object through the same owner-aware validator.
- Require export → compile → export to preserve semantic settings with no supported-field omissions.
- Include localFilters, facet state, layout, disabled mode, and both contributor relations.
- Keep metadata timestamp differences out of semantic equality assertions.
- Old saves without concurrency continue to round-trip as legacy Timelines.

### 5.3 Host callback contract

Baseline updateChart is the central write path. holdStateChanges and saved-state fingerprints govern onStateChange. Maintain those mechanisms.

| Action | Expected callback behavior |
| --- | --- |
| One accepted window edit | One onStateChange after the edit transaction, with matching cleared/replaced selection. |
| Invalid draft or Escape | No committed saved-state callback; prior valid settings remain. |
| One threshold change | One callback; retained active-at predicate stays valid. |
| One strip click/toggle | One callback in dashboard/JSON settings mode. |
| Hover, trace open/close, contributor lookup | No settings callback. |
| Source refresh | Recompute derived results; preserve W; follow existing onSavedDataApplied/restore behavior without creating spurious user edits. |
| Host echoes identical saved settings | No full rebuild caused by unstable serialization or default insertion. |

Do not add concurrency to DISPLAY_ONLY_KEYS merely because it is under a chart setting. Enabled state, scope, mappings, and window can affect selection validity and row predicates. Optimize only narrowly proven presentation keys.

Keep the save fingerprint stable through normalization. Do not alternately omit and insert empty arrays/default objects on every save/restore.

### 5.4 Real folder route and acceptance

Exact-reference supplemental source confirms:

- lib/project/folder.ts reads .eda analyses and .eda.md notebooks.
- analysisText.ts delegates analysis text to compileViews/exportViews.
- writeFolder.ts::analysisFileText calls exportAnalysisText.
- ProjectWorkspace queues analysis and notebook writes.
- FolderSaver serializes writes and exposes flush.

analysisFileText currently discards the export omitted list. The concurrency path must either propagate a meaningful failure/diagnostic for unsupported content or establish omitted=[] through the supported roundtrip. Silent loss is not acceptable.

Each milestone's folder test must:

1. Create a temporary project fixture with a source data file and the corresponding .eda or .eda.md text.
2. Open through readProjectFolder, using the actual host query/bind format after inspecting its local implementation.
3. Edit a supported analytical setting and save through the existing text route.
4. Flush pending saves.
5. Dispose the current in-memory analysis and read the folder again.
6. Assert fixed W, K, lane scope, local population, layout/order, and supported selection semantics.
7. Recompute numbers from the newly read source rather than trusting a cached result.
8. Repeat with reordered/changed source and check active-at semantics.

The standalone Dashboard companion is a document fragment for the library compiler; it does not claim to contain every folder source declaration/query binding. Assemble the native folder wrapper using existing project fixture patterns.

## 6. Milestone 1 — exact Timeline measurement, contributors, and durable settings

**Disposition:** Build.  
**IDs:** TC01–TC06, TC08–TC12, TC14–TC15, TC18.  
**Independent user outcome:** An analyst can enable a finite-window strip, measure one lane or all-row concurrency, select/trace the exact active intervals, and reopen the same analytical intent.

### Implementation

- Add the pure core, normalizer, exact arithmetic status, contributor scanner, and precision-aware formatter.
- Add optional versioned concurrency settings to Timeline.
- Ship row-concurrency display for all lanes or a selected lane; default K=1.
- Fit the concurrency plot to W and clip original bars consistently, including open intervals.
- Provide summary values for the displayed row-count scope: busy, total interval duration, time above K, excess, peak.
- Add the semantic contributor filter and both active-at/positive-overlap query paths.
- Implement own-selection exclusion, local population inclusion, and facet capture.
- Add trace union/body/row routing and temporary exact record access.
- Add JSON validation, explicit Dashboard predicate export, host callback handling, and folder-analysis reopen.
- Add the narrow notebook writeback cleanup for authored contributor filters invalidated by structural settings edits; Timeline already appears in notebooks even before new interval findings ship.
- Leave the existing inclusive brush behavior intact as the separate record-overlap operation.

### Files

Modify Timeline definition/renderer/settings/tests, useGetLiveData, FilterTypes, saveDataUtils, DSL compile/export/settingKeys, traceTypes/ChartTracePanel/traceRows, notebook writeBack.ts and its structural-cleanup tests, and callback/dependency collection routes as needed. Add types/validate/normalize/sweep/contributors/population/format and TimelineConcurrencyStrip/TraceBody/adapter.

Read the actual Filters-tab and filter-chip implementation before editing. Every new filter state needs a visible owner, a meaningful label, a clear action, and an editable query control; invisible saved semantic filters are not acceptable.

### Exact tests

1. Load the fixture base population.
   - All-row busy=660000 ms.
   - Total=1440000 interval-ms.
   - D above 1=480000 ms.
   - Excess=780000 interval-ms.
   - Peak=4 for 120000 ms.
2. Set lane A scope.
   - Busy=600000.
   - Total=960000.
   - D above 1=240000.
   - Excess=360000.
   - Peak=3.
3. Compare every base atomic common-refinement cell to expected JSON, including idle 09:09–09:10.
4. Verify equal count with changed contributors at 09:02,09:04, and lane-A 09:06.
5. Verify A3/A4 both count and remain separately inspectable.
6. Verify all five invalid rows are excluded with reconciling reasons; Z1 has zero occupancy; open A7 reaches saved B.
7. Verify status=cancelled is included without an explicit status filter.
8. Click global cell 09:04–09:05: linked rows are A2,A3,A4,B2; the owner still calculates the base population.
9. Restrict the semantic selection to lane A: exact rows A2,A3,A4.
10. Query positive-overlap 09:03–09:07: seven involved rows, peak four.
11. Keep owner localFilters included=true; an overlapping included=false row must never leak into linked selection.
12. Apply external status=confirmed: total 1260000; owner selection still omitted from computation.
13. Facet A totals match expected; explicit empty facet gives zero.
14. Legacy brush touching endpoints and open ends preserve existing tests, including raw-filter versus drawable-row distinction.
15. Restore the complete companion JSON through the actual validator/provider after implementation.
16. Export and compile Dashboard text with both new relations; omitted=[]; semantic state equal.
17. Refresh source: active-at 09:04 resolves A2,A3,A4 at new positions; containing global cell shrinks 60000→30000; stale trace closes.
18. Invalid precision/range/threshold/field/window states fail explicitly.
19. Typed lanes 1 and "1" remain distinct; missing lane remains excluded.
20. Verify callback counts, same-state echo stability, and native .eda folder reopen.
21. In an existing notebook with an authored contributor predicate, edit W or mappings and verify that the incompatible predicate is removed from text in the same writeback; ordinary clicks stay transient and unrelated prose survives.

The fixture's abstract restored_base scenario is not a substitute for test 15 or 20.

### Docs and runnable example

- Extend apps/demo/src/docs/pages/timeline.mdx with “Measure concurrency,” “Analytical window,” “Above a threshold,” and “Exact contributors.”
- Update docs/catalogue.ts descriptions under the existing chart:timeline coverage. No new chart type/page is necessary.
- Add a focused timeline-concurrency live example in apps/demo/src/docs/live/examples.ts.
- Add an exact small dataset fixture in apps/demo/public/datasets/timeline-concurrency.json or CSV, derived from rows[].data, preserving duplicate A3/A4.
- Extend apps/demo/src/demos/journeyDashboards.ts with the new view while preserving the original room-bookings row-click example.
- Ensure example registration/coverage and Dashboard-export tests include the new example.
- Use precise analytical controls for the minute-level example, not the old hour-snapping brush.
- Add modifier/key support to the live-example runner if appropriate after inspecting it, or place Alt-click/Alt-Enter in dedicated existing browser-test infrastructure.

### UI and release gate

Verify real input at 1280, 783, and 390 px, light/dark themes, long lane names, empty results, exact millisecond readouts, trace focus return, filters, and image export at rest. Keep compact controls and saved layout. Add a minor changeset for the new package capability, following AGENTS.md.

**Main risk:** confusing output selection with population, or representing a half-open contributor query through inclusive scalar date filters. The exact linked-filter and refresh tests are release blockers.

## 7. Milestone 2 — occupied lanes, lane summaries, and conflict discovery

**Disposition:** Build.  
**IDs:** TC07, TC13, plus TC08–TC15 and TC18.  
**Dependency:** Milestone 1 only.  
**Independent user outcome:** An analyst can distinguish global activity from resource conflicts, identify affected lanes, and compare time and excess across lanes without building a new prepared dataset.

### Implementation

- Expose occupied-lanes mode for all-lane scope.
- Expose the per-lane summary table in existing temporary chart-data/trace surfaces.
- Add any-lane-above-K wall-clock duration and summed lane-conflict duration with different labels/units.
- Add same-lane conflict borders/underlays to source lanes, preserving their status color encoding.
- Let a lane-summary action set analytical lane scope explicitly; do not disguise a scope edit as an unrelated linked selection.
- Keep double-booking wording specific to per-lane K=1.
- Add exact all-lane trace grouping by occupied lane.
- Preserve endpoint membership boundaries beneath visually coalesced steps.
- Provide accessible idle/peak/conflict segment navigation and bounded record previews.

### Files

Extend the core result presentation and TimelineConcurrencyStrip/TraceBody; add TimelineLaneSummary.tsx. Update settings validation for occupied-lanes/all-scope compatibility, DSL metadata/settings descriptions, and the existing Timeline docs/examples.

Avoid a dense g×m result matrix. Use the already computed lazy lane summaries and query only the selected lane's detailed stream.

### Exact tests

- Occupied-lane integral=1080000 lane-ms.
- Occupied-lane D above 1=420000 ms; excess 420000 lane-ms; peak 2.
- Sum lane busy=600000+480000=1080000.
- Any-lane conflict=240000 ms.
- Lane-B global activity does not acquire a double-booking label when c_B=1.
- Sum lane excess=360000 equals 1440000−1080000.
- Any-lane conflict trace includes A2,A3,A4,A5,A6 and excludes nonconflicting B rows as causal witnesses.
- Add a small supplementary case with two lanes conflicting simultaneously: in W=[0,3) ms, lane A has two rows [0,2) and lane B has two rows [1,3). At K=1, any-lane conflict is 3 ms while summed lane-conflict duration is 4 lane-ms. These are proposed exact test values, not an additional executed fixture scenario.
- Occupied-lane trace reports both distinct lane count and source interval count.
- Measure/scope edit cannot leave an invalid occupied-lanes/single-lane combination.
- Zero-count span plain click clears, while explicit idle inspection still reports its exact bounds.
- Per-lane contributor coalescing is permitted only when that lane's set is unchanged.
- JSON/Dashboard/folder roundtrips preserve new measure/scope settings; callbacks remain one per accepted edit.

### Docs and runnable example

- Add “Intervals versus occupied lanes” and “Find a lane conflict” sections to timeline.mdx.
- Add a room-bookings-concurrency view over the existing 673-row dataset with an explicitly authored window, such as March 3 through March 31,2025 UTC. The window is part of the example settings, not inferred from current time.
- Show both all-status and explicitly filtered variants; explain that removing Cancelled is a user-authored population choice.
- Update docs/live/examples.ts with the lane-summary→scope→trace journey, and extend the example coverage/roundtrip checks.
- Use existing examples registered in catalogue.ts and inspect their host registration paths before adding a new slug.

### Performance proof

Record normalized row count, unique endpoints, lane count, maximum overlap, parse/sort/sweep/render/lookup timings, and retained bytes for 1k/10k/100k synthetic inputs on a named machine.

A p95 compute slice above 50 ms triggers the TC19 worker experiment; p95 committed lookup above 100 ms triggers the centered-index experiment. These are optimization triggers, not row rejection limits. Avoid repeated optional benchmarking once the concrete risk is resolved.

**Main risk:** presenting a global count as a lane conflict, or introducing O(gm) work while building the summary UI.

## 8. Milestone 3 — notebook findings and complete notebook reopen

**Disposition:** Build.  
**IDs:** TC16–TC18, relying on TC01–TC15.  
**Dependency:** Milestone 1; Milestone 2 is only needed for occupied-lane-specific UI.  
**Independent user outcome:** A notebook can state an exact finite-window conflict duration, total interval duration, or peak and open the interval evidence behind that value.

### Definition and scope

Proposed finding:

~~~ts
type TimelineFinding = {
  id: string;
  kind: "timeline-concurrency";
  chart: string;
  target: "analysis";
  metric:
    | "busy-duration"
    | "total-interval-duration"
    | "duration-above-threshold"
    | "excess-occupancy"
    | "peak";
  facetPredicates?: Array<{
    field: string;
    value: string | number | boolean | null;
  }>;
};
~~~

The owning chart supplies W, K, method version, row/occupied-lane measure, and scope. For occupied-lanes measure, use a separately named occupied-lane-time metric or reject total-interval-duration as incompatible; do not reuse its label for lane-ms. First authored notebook companion uses rows/laneA only.

The finding's target=analysis means the whole analytical window over notebook eligible rows, ignoring its owner's output selection and other notebook chart selections. Workspace and local population filters apply; facet constraints are explicit finding data, not whichever visual facet happened to be clicked.

Do not offer a “pin this displayed dashboard number” action that silently drops external chart selections. First workflow authors an explicit notebook analysis. Matching a live dashboard's transient linked scope is deferred TC23.

### Compiler and evaluator integration

- Extend FindingDefinition with a new discriminant.
- Replace truthy-kind dispatch in evaluateFindings with explicit cases: metric, timeline-concurrency, share, difference.
- Add compile.ts parsing and validation for the proposed declaration.
- Add a typed result carrying metric unit, exact numeric value/status, interval plan/query, revision, and source witnesses.
- Update NotebookFindings.OperandRecords to dispatch interval trace bodies.
- Ensure source IDs and the value derive from the same immutable plan revision.
- Preserve existing metric findings, comparisons, and their tests.
- Reject duration operands in current count-share comparison rules.
- Preserve zero versus unavailable: empty valid analysis→0, missing field or unsupported static input→unavailable, overflow→unavailable.

New proposed notebook text:

~~~text
finding @conflict_ms timeline chart=@bookings metric=duration-above-threshold target=analysis
finding @interval_ms timeline chart=@bookings metric=total-interval-duration target=analysis
finding @peak_rows timeline chart=@bookings metric=peak target=analysis
~~~

The exact companion embeds these in an eda fence and references them through prose interpolations and finding-record links.

### Static and mounted parity

Baseline evaluateNotebookFindings directly reads source rows and does not execute the preparation/calculation pipeline. Choose the first supported scope explicitly:

- Raw source lane/start/end and raw population/facet fields.
- Baseline timestampOf semantics.
- No calculated field or conversion setting that changes the required values without a shared preparation adapter.
- Non-value-changing labels/formatting may remain supported.
- If unsupported preparation affects any referenced population/facet/mapping field, return an unavailable state in both initial and mounted new finding evaluation. Do not let only the mounted version produce a number.

This restriction does not require changing existing metric findings. A later shared prepared-row adapter is possible, but it is not an assumed dependency on unbuilt temporal-preparation research.

### Notebook settings writeback

Existing writeback intentionally omits interaction filters and layout changes from notebook text updates. Keep that behavior:

- Horizon, threshold, enabled state, and analytical scope edits persist.
- Ordinary clicks and brushes remain transient.
- Authored filter text can restore an initial selection.
- A structural edit that invalidates an authored interval-contributors predicate must remove it from source in the same writeback. Otherwise old-window selection text would make the next compilation invalid.
- Implement this as a narrow structural-cleanup rule; do not start saving every click.
- Preserve comments, prose, unrelated blocks, and authored layout conventions.

Dashboard export intentionally excludes findings. The .eda.md source carries them. Do not mark a dashboard export “complete notebook export” without an explicit new exporter contract.

### Exact tests

- Companion notebook gives conflict_ms=240000, interval_ms=960000, peak_rows=3.
- Authored active-at 09:04 highlights A2,A3,A4 but does not change those target=analysis findings.
- Finding conflict records are union A2,A3,A4,A5,A6, not a claim of five simultaneous intervals.
- Initial evaluation and mounted evaluation match on the supported raw source fixture.
- Workspace/local population edits change both consistently.
- Other notebook chart clicks do not change findings.
- An explicit facetA yields its correct eligible population; an empty matching facet gives zero.
- Unknown chart, missing field, invalid/disabled concurrency settings, overflow, and unsupported prepared fields yield clear unavailable states.
- Duration share/difference is rejected rather than reusing row-count rules.
- Value and record view invalidate together on data change.
- Authored active-at predicate survives ordinary transient clicks in source, but a structural window edit removes its incompatible authored version.
- Full .eda.md folder close/flush/reopen preserves horizon, threshold, findings, prose, and expected recomputed results.

### Files, docs, and example

Modify findings.ts/findings.test.ts, add timelineFinding.ts/tests, update compiler and saved-data validator, NotebookFindings.tsx, and extend the notebook writeback tests added in Milestone 1. Inspect current notebook compiler/reader and host paths locally before editing.

- Extend apps/demo/src/docs/pages/notebooks.mdx (confirm its catalogue route) with “Interval findings.”
- Add a linked section to timeline.mdx.
- Add a runnable lane-occupancy notebook example based on the delivered companion.
- Register it in docs/live/examples.ts and the actual notebook-example source/coverage path.
- Test interpolation, record link, a workspace filter, analytical setting writeback, and reopen.

**Main risk:** computing a duration from selected rows across the whole window instead of the declared eligible population, or showing a static number that changes merely when the notebook mounts.

## 9. Optional explorations and explicitly deferred work

### TC19 — measured acceleration

**Explore, independently optional.** If the measured triggers are crossed, prototype:

- A centered interval index for exact point/range reporting.
- Worker execution for sort/sweep.
- Cancellation and stale-result rejection keyed to the full plan revision.
- Conservative pixel aggregation preserving peaks and exact hit-test lookup.

Keep the reference oracle and user semantics unchanged. Benchmark the prototype against the scan on the named input families. Do not allocate full active-ID sets at every endpoint or claim O(log n+k) for an unproven generic tree.

### TC20 — prepared segment snapshots

**Explore, independently optional.** After core/trace semantics are established, offer explicit snapshot export of:

- Segment start/end, integer duration, count, measure/scope, method version, W, K, population description, and source revision description.
- An exact contributor query descriptor or a separate selected-scope relation.
- Original source identity caveats.

Ordinary charts can then compare duration weighted distributions or summarize segment statistics. A plain average of segment counts is incorrect because subdividing a segment changes its weight; use sum(count×duration)/sum(duration).

The export has a new segment row grain. Importing it into an ordinary dashboard does not automatically retain a live link back to the original source rows. Do not promise that generic CSV/JSON/analysis exports preserve this new semantic type. An integrated live derived dataset is TC21, deferred.

If shipped, add an “Export analytical segments” section to timeline.mdx, a runnable prepared-snapshot example, explicit export-format tests, and source/query provenance validation. The main risk is falsely implying that segment rows are original booking records.

### TC21–TC23 — deferred scope

- Global reusable analysis registry and live derived-table linkage.
- Interval-pair explorer or arbitrary temporal joins.
- Recurrence, bookings editing, availability calendars, capacity optimization.
- Utilization percentages without an explicit availability denominator.
- Weighted demand/resource capacity models.
- Selected-segment notebook findings, interval ratios/differences, and implicit capture of external dashboard selections.
- A temporal parser/preparation project as a prerequisite.

## 10. Proof package and exact acceptance matrix

### Delivered input and expected values

[Fixture](timeline-concurrency-fixture.json) and [expected results](timeline-concurrency-expected.json) contain:

- 20 source envelopes, including exact duplicate data.
- 12 base global atomic cells, each 60000 ms.
- Every source contributor label/current source ID on every cell.
- Global row, occupied-lane, and per-lane summaries.
- Eight scenarios plus a subwindow and selection probes.
- Fixed UTC timestamps and integer millisecond expectations.
- Changed-source definitions and expected identity remapping.

The base analytical window is 1768467600000..1768468320000, threshold 1.

| Measure | All rows | Lane A |
| --- | ---: | ---: |
| Busy ms |660000|600000|
| Total interval-ms |1440000|960000|
| Duration above 1 ms |480000|240000|
| Excess interval-ms |780000|360000|
| Peak |4|3|

Occupied-lane integral=1080000 lane-ms; occupied-lane peak=2; any-lane conflict=240000 ms.

### Critical boundaries to translate into Vitest

| Boundary | Expected behavior |
| --- | --- |
| A1 ends and A2 starts 09:02 | No extra simultaneous count; contributors change. |
| B1 ends and B2 starts 09:04 | Global count remains 4, exact set changes. |
| A2 ends and A6 starts 09:06 | Lane-A count remains 2, exact set changes. |
| Zero event Z1 at 09:04 | No positive occupancy; not in active-at contributors. |
| Open A7 | Counts 09:10 through saved 09:12, excluding 09:12. |
| Cancelled B4 | Counts unless explicitly filtered. |
| OUT2 begins exactly atB | Outside analytical occupancy. |
| Empty facet array | Zero population, never unrestricted. |
| Positive-overlap09:03–09:07 | Seven involved rows; peak four. |
| Active-at 09:04 after refresh | A2,A3,A4; new numeric positions; segment duration may shrink. |
| Old-range overlap after refresh | Includes new A8; different query from active-at. |
| Viewport-only change | No metric changes. |
| Analytical subwindow 09:03–09:07 | Busy 240000, total 780000, D 240000, excess 540000, peak 4. |
| Spring or autumn offset example |3600000 elapsed ms in each case. |

Add the small simultaneous-two-conflicting-lanes case in Milestone 2 and typed/nonfinite category serialization cases where the new selector supports them. The provided reference verifier does not implement all production validators or UI states.

### Independent oracle

The delivered Python script reads JSON expectations and checks them. It uses:

1. A grouped endpoint sweep.
2. A separate interval-against-each-cell scan.
3. Small integer-time enumeration for randomized count/duration/excess/peak checks.

It also checks permutation, partition, interval sum, lane reconciliation, and invalid windows. Seed 20261030 and 500 random cases are reproducible. Do not port the fixture's exhaustive per-cell contributor arrays into production.

### Run sheet

The first command is runnable against the delivered files now. The repository commands are proposed worker checks and require a complete dependency-installed checkout after implementation.

~~~bash
# Research acceptance oracle: run beside the delivered files.
python3 verify-timeline-concurrency.py

# Repository work: use pnpm and the shared @repo/test-config limits.
# After Milestone 1, target the core and Timeline integration.
pnpm --filter exploreda exec vitest run \
  src/lib/timelineConcurrency \
  src/components/charts/Timeline
pnpm --filter exploreda check-types

# Verify the actual existing/new saved-data and DSL test files located locally.
# Run those targeted paths after changing validation or export/compile.
# Do not invent a per-test timeout to make a slow case pass.

# New examples need demo coverage and Dashboard-text round trips.
pnpm --filter demo exec vitest run \
  src/demos/coverage.test.ts \
  src/dashboardText.test.ts
pnpm --filter demo docs:check

# After Milestone 3, run notebook interval and existing findings regressions.
pnpm --filter exploreda exec vitest run \
  src/lib/notebook/findings.test.ts \
  src/lib/notebook/timelineFinding.test.ts

# Run repository-native folder reader/writer and saver tests after extending them.
# Inspect their existing filenames before invoking the targeted test command.

# Start the demo using the repository helper and use the printed URL.
pnpm dev:agent

# Capture/inspect the concrete new example at repository-standard widths.
# This proposed slug must be registered by the implementation milestone.
pnpm shot /examples/timeline-concurrency --name timeline-concurrency

# Verify docs through the existing build and browser-test pipeline.
pnpm --filter demo build
pnpm --filter demo docs:verify

# Final broad gate once, after targeted checks; no parallel builds/worktrees.
pnpm check

# Stop this task's demo server when verification is complete.
pnpm dev:agent --stop
~~~

If adding a library type requires checking demo TypeScript before the broad gate, build the package once first as the agent guide specifies. New tests take limits from @repo/test-config. No worktrees, services, installs outside the ordinary repository workflow, or speculative compatibility layer are required.

## 11. Acceptance risks and dispositions

| Risk | Required resolution |
| --- | --- |
| Self-filter feedback | Use the owner-excluded live population; demonstrate an active selection leaves the strip unchanged. |
| Local population leak | Compile owner localFilters into the new emitted contributor predicate. |
| Boundary convention conflation | Preserve inclusive brush tests and independently test half-open analytical membership. |
| Equal-count contributor loss | Retain atomic endpoints; hit-test exact cells below coalesced painting. |
| Quadratic memory | No production contributor array per segment; query on demand. |
| Many-lane quadratic work | Integrate touched lanes lazily; no dense lane-by-global-cell structure. |
| Numeric precision/formatting | Safe integer/range checks; explicit overflow; ISO/ms trace and sub-second display. |
| Positional identity on refresh | Persist active-at/range intent; recompute current IDs and invalidate traces. |
| New filter silently omitted in export | Explicit compiler/export branch and omitted=[] roundtrip tests. |
| Notebook source keeps stale authored filter | Structural writeback removes incompatible predicate atomically. |
| Static notebook differs from mounted view | Shared supported scope or explicit unavailable status in both paths. |
| Generic exports imply source lineage | Label segment snapshots and their new grain; no claim of live original-row linkage. |

These are concrete risks introduced by the new method or integration. They are not a general robustness audit of the old Timeline.

## 12. Access, checks, deliverables, and open questions

**Access:** attached complete-file baseline confirmed; all 36 files read across the research team. Exact-reference supplemental source resolved the key ownership, trace, notebook, identity, and folder paths. No decisive method input is missing. Retired intent references are not prerequisites.

**Files read:** the report's source map names all packet files and the supplemental exact-ref paths. Core coverage includes all seven Timeline files, live-ID/filter/provider code, complete parser/categories, complete saved validation and DSL files, complete findings/types/tests, instructions, complete demo/docs/catalogue, and the full CSV.

**Executed checks:** the delivered oracle passed eight exact scenarios, subwindow/selection/brush/refresh/DST checks, and 500 seeded random cases; saved JSON and embedded filter JSON were parsed; Dashboard/notebook semantic payloads were cross-checked without invoking their application parsers. CSV data checks and static source analysis were executed. No application compiler, validator, tests, browser, callbacks, or folder reopen was run.

**Deliverables:**

- [Methods report](timeline-concurrency-report.md)
- [Fixture input](timeline-concurrency-fixture.json)
- [Exact expected results](timeline-concurrency-expected.json)
- [Independent verifier](verify-timeline-concurrency.py)
- [Proposed saved settings](timeline-concurrency-saved-settings.json)
- [Proposed Dashboard text](timeline-concurrency-dashboard.eda)
- [Proposed notebook text](timeline-concurrency-notebook.eda.md)

**Open questions:** measured optimization thresholds on the target machine; whether later users need a richer persistent category/business-key identity contract; and whether segment snapshots should become live linked datasets. These do not prevent Milestone 1. The method, first surface, persistence intent, and first notebook scope are specified.

