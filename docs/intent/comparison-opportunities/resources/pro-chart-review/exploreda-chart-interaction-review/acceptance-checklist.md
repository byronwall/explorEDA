# Acceptance checklist: analytical completeness

These are proposed release gates. They were not executed during the review.

## 1. End-to-end order exploration

- [ ] Start with raw order records, not a specially pre-aggregated chart dataset.
- [ ] Define revenue by region and channel.
- [ ] Render the result as a horizontal bar and a heatmap without redefining the metric.
- [ ] Select a region/channel pair and verify matching records manually against the predicate.
- [ ] Verify the card, trend, pivot, and distribution use the intended identical population.
- [ ] Inspect both all group members and valid metric contributors; distinguish them.
- [ ] Compute the metric again from exported matching source rows using the same numeric rules.
- [ ] Compare with an explicitly named baseline; verify its denominator.
- [ ] Undo and redo the last selection.
- [ ] Save and restore settings; verify selections, scope, ordering, and formatting.

## 2. Selection semantics

- [ ] Empty selection has one documented meaning across families.
- [ ] Alternatives within a category and intersections across views are consistent.
- [ ] Two selected nonadjacent matrix cells select their union, not the Cartesian product of row and column labels.
- [ ] A selection in a facet includes or excludes facet membership according to explicit behavior.
- [ ] Switching chart presentation preserves meaningful selections or warns before discarding them.
- [ ] Other has exact inspectable membership; resizing cannot redefine a committed filter.
- [ ] Hide-series, inspect-records, zoom, and filter-population are separate concepts.
- [ ] Clear-all and per-filter removal cover all advertised scopes and preserve undo policy.
- [ ] Local table search is visibly local; any promotion is an explicit operation.

## 3. Numeric and grouping fixtures

Use a small deterministic fixture containing zero, negative numbers, null, undefined, empty strings,
whitespace, numeric strings, booleans, nonfinite values, duplicate categories, and all-invalid groups.
The goal is one documented policy, not requiring all inputs to be accepted.

- [ ] Count rows versus count valid values is explicit.
- [ ] No rows, no valid numbers, and a legitimate zero aggregate are distinct.
- [ ] Sum/mean/distinct/median agree across consumers when those reducers are supported.
- [ ] Raw versus effective values and conversion exclusions remain inspectable.
- [ ] Equal display labels do not silently merge distinct canonical category identities.
- [ ] A ratio of sums is not silently replaced with an unweighted average of per-row ratios.
- [ ] Stacking and 100% normalization reject or define negative/nonadditive cases.
- [ ] Top N ranking and Other membership are stable under the documented scope.

## 4. Time-series fixtures

- [ ] Unsorted records and duplicate timestamps behave correctly in raw and aggregate modes.
- [ ] Month/year boundaries and the configured week start are tested.
- [ ] UTC/local policy is explicit; daylight-saving boundaries are tested if local time is supported.
- [ ] Gaps do not become zero unless the metric policy says so.
- [ ] Calendar brush boundaries include the intended records exactly once.
- [ ] Wide measure-column and long-form categorical series are both explicitly supported or rejected.
- [ ] Shared-x tooltip identifies the series and units.
- [ ] Rolling windows state their interval and missing-value handling.

## 5. Distribution and relationship fixtures

- [ ] Histograms used for comparison share edges and label normalization.
- [ ] ECDF ties, empty input, invalid values, and fraction denominator are correct.
- [ ] A sampled observation overlay identifies that sampling; filtering still refers to the intended raw population.
- [ ] Bubble area encodes the intended quantity and has a size legend.
- [ ] Density-bin selection maps to original observations, with explicit edge inclusion.
- [ ] Correlation shows method and valid-pair count, with unavailable results for constant/insufficient inputs.
- [ ] Correlation cell activation opens a field relationship instead of inventing a subset filter.
- [ ] Fitted/reference lines declare their source population; supplied intervals are not mislabeled as inferred confidence bounds.

## 6. Usability, accessibility, and persistence

- [ ] Every new chart has a useful creation preset, not only a renderer.
- [ ] Essential selection and inspection actions have non-pointer paths.
- [ ] Focus stays predictable after filtering and inspection dialogs.
- [ ] Labels, keyboard state, and color are not mutually dependent.
- [ ] Axis lock/reset and true-log nonpositive handling are explicit.
- [ ] Named colors and domain policies stay stable across related views.
- [ ] Saved formats retain backward compatibility or perform documented migrations.
- [ ] Data replacement behavior is defined for filter history and comparison baselines.

## 7. Performance measurement, not assumed performance

- [ ] Record browser, hardware, row count, field cardinalities, chart count, and rendering mode.
- [ ] Separate startup/data preparation from warm filter-to-paint latency.
- [ ] Measure repeated brushing, hover hit testing, data preview, and restored selections.
- [ ] Measure memory after repeated operations and cleanup.
- [ ] Include skewed/high-cardinality and empty-result cases, not only uniform synthetic data.
- [ ] Check that visual simplification or sampling does not alter analytical counts unexpectedly.
- [ ] Publish results only after executing the workload; no speed claim follows from Canvas or Crossfilter alone.
