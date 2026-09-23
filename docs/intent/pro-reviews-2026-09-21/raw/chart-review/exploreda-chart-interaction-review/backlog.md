# Prioritized implementation backlog

Reviewed commit: `593ca2e1f9210d5bc66985437afc37fcfcd8a56a`.

This is a proposed roadmap, not an inventory of tested features. Relative effort describes scope, not delivery time. Dependencies are incremental; do not wait for a universal query engine.

## C01 — Expose Histogram and Distribution presets

**Phase:** 1 · **Effort:** Tiny–Small

**Current state:** Numeric histogram is inside Bar Chart. Violin and beeswarm settings exist inside Box Plot.

**Outcome:** Users find the capability by the analytical name they expect without duplicate renderers.

**Dependencies:** None required.

**Acceptance criteria:**

- [ ] Histogram is a discoverable creation option for numeric fields.
- [ ] Distribution presents box, violin overlay, and observation-overlay options.
- [ ] Existing saved type identifiers remain compatible.
- [ ] Defaults produce useful plots without requiring all settings to be filled.

**Evidence:** [Source 1](https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/charts/BarChart/BarChart.tsx) · [Source 2](https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/charts/BoxPlot/definition.ts)

## C02 — Make Other inspectable and selection-safe

**Phase:** 1 · **Effort:** Small–Medium

**Current state:** Row chart creates a height-dependent Other categories bucket and disables its selection.

**Outcome:** High-cardinality data remains explorable instead of being hidden behind a terminal bucket.

**Dependencies:** None required.

**Acceptance criteria:**

- [ ] Other opens an explicit member list or drill view.
- [ ] Member categories can be selected.
- [ ] A selection is tied to category membership, not the label Other.
- [ ] Resizing does not silently change the membership of a committed filter.
- [ ] Active categories remain visible or clearly represented when outside the displayed top set.

**Evidence:** [Source 1](https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/charts/RowChart/RowChart.tsx) · [Source 2](https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/charts/RowChart/RowChart.tsx)

## C03 — Unify basic grouped metrics and source provenance

**Phase:** 1 · **Effort:** Medium

**Current state:** Named grouped results support one group field and count/sum/average; pivot has richer reducers.

**Outcome:** The same metric has the same meaning in bars, cards, tables, and future heatmaps.

**Dependencies:** None required.

**Acceptance criteria:**

- [ ] Count, sum, and mean agree across the first consumers.
- [ ] Define row count versus valid-value count and behavior when there are no valid values.
- [ ] Separate complete group membership from included numeric contributors.
- [ ] Support zero, one, and eventually two grouping keys through incremental adapters.
- [ ] Keep existing saved configurations readable; avoid a big-bang rewrite.

**Evidence:** [Source 1](https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/lib/aggregates.ts) · [Source 2](https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/charts/PivotTable/definition.ts)

## C04 — Make grouped bars participate in linked filtering

**Phase:** 1 · **Effort:** Medium

**Current state:** Aggregate bar click opens contributor inspection instead of a filter.

**Outcome:** Revenue by region filters the workspace as naturally as count by region.

**Dependencies:** C03

**Acceptance criteria:**

- [ ] A mark can select its source group.
- [ ] An explicit separate action retains value/contributor inspection.
- [ ] Selecting and clearing groups updates all linked views correctly.
- [ ] Invalid metric contributors do not disappear from group membership without an explicit rule.
- [ ] Keyboard selection and restored selection match pointer behavior.

**Evidence:** [Source 1](https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/charts/BarChart/BarChart.tsx) · [Source 2](https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/lib/aggregates.ts)

## C05 — Add basic metric cards

**Phase:** 1 · **Effort:** Small

**Current state:** Filtered-row status exists but no registered arbitrary metric-card type.

**Outcome:** The selected population has a visible count and metric summary.

**Dependencies:** C03

**Acceptance criteria:**

- [ ] Count, sum, and mean are available through shared reducers.
- [ ] Units and formatting use field metadata.
- [ ] Population scope is named.
- [ ] Empty/invalid and zero results are visually distinct.
- [ ] Inspect action explains contributors without changing selection.

**Evidence:** [Source 1](https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/charts/registerAllCharts.ts) · [Source 2](https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/ActiveFilterStatus.tsx)

## C06 — Generalize metric bars across orientations and series

**Phase:** 2 · **Effort:** Medium–Large, staged

**Current state:** Horizontal chart is count-oriented; bar settings lack first-class grouped/stacked series.

**Outcome:** A category/metric/series configuration can change presentation without losing analysis state.

**Dependencies:** C02, C03, C04

**Acceptance criteria:**

- [ ] Horizontal and vertical bars accept the same metric.
- [ ] Grouped and additive stacked modes share categories, colors, and source membership.
- [ ] 100% stacks state the normalization denominator.
- [ ] Negative and nonadditive metrics are rejected or handled explicitly.
- [ ] Metric sort and explicit Top N coexist with stable selections.

**Evidence:** [Source 1](https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/types/ChartTypes.ts) · [Source 2](https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/charts/BarChart/BarChart.tsx) · [Source 3](https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/charts/RowChart/RowChart.tsx)

## C07 — Add categorical heatmap with exact cell inspection

**Phase:** 2 · **Effort:** Medium

**Current state:** Pivot exists; no heatmap is registered.

**Outcome:** Two categorical dimensions can be compared visually using a shared metric.

**Dependencies:** C03, C04

**Acceptance criteria:**

- [ ] Two grouping fields and one metric drive cells.
- [ ] Zero, absent group, and invalid metric results differ.
- [ ] Color domain and legend have explicit semantics.
- [ ] Single-cell selection maps to the corresponding raw group.
- [ ] Cell inspection reports exact value and contributors.
- [ ] Keyboard access, ordering, and high-cardinality overflow are defined.

**Evidence:** [Source 1](https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/charts/registerAllCharts.ts) · [Source 2](https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/charts/PivotTable/definition.ts) · [Source 3](https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/lib/aggregates.ts)

## C08 — Add tuple-aware selection for nonrectangular multicell choices

**Phase:** 2 · **Effort:** Medium

**Current state:** Current filter types are field-based values/ranges/text/date-ranges.

**Outcome:** Selecting two region/channel pairs selects exactly those pairs.

**Dependencies:** C07

**Acceptance criteria:**

- [ ] (North, Web) OR (South, Retail) excludes the two unselected cross combinations.
- [ ] Interactions within one selection and intersections across views are specified.
- [ ] Selection survives serialization and data replacement according to a documented rule.
- [ ] Facet membership is included when the intended selection is local to a facet.
- [ ] Visual filtering and record inspection use the identical predicate.

**Evidence:** [Source 1](https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/types/FilterTypes.ts)

## C09 — Add long-form series and calendar aggregation

**Phase:** 2 · **Effort:** Medium core; Large full scope

**Current state:** Line connects values from multiple measure columns and uses numeric axes, not calendar rollups.

**Outcome:** Raw orders/events become date-bucketed series without external reshaping.

**Dependencies:** C03

**Acceptance criteria:**

- [ ] Date field, interval, metric, and optional categorical series field are first-class.
- [ ] Day/week/month boundaries and time-zone policy are explicit.
- [ ] Duplicate timestamps are aggregated in rollup mode; raw-observation mode remains available.
- [ ] Missing periods have metric-appropriate, explicit zero/gap behavior.
- [ ] Calendar-aware ticks and brush bounds agree with the source interval.
- [ ] Series values match an independent grouping of the same source rows.

**Evidence:** [Source 1](https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/charts/LineChart/definition.ts) · [Source 2](https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/charts/LineChart/LineChart.tsx) · [Source 3](https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/charts/Axis/numericScale.ts)

## C10 — Add area and stacked-area presentations

**Phase:** 2 · **Effort:** Small–Medium after prerequisites

**Current state:** Line rendering includes paths and points, not filled/stacked area modes.

**Outcome:** Time series can show totals and composition through shared grouped data.

**Dependencies:** C09, C06

**Acceptance criteria:**

- [ ] Line and area use identical metric results.
- [ ] Stack ordering, missing buckets, and negative-value behavior are explicit.
- [ ] Changing mode preserves group identity and filter state.
- [ ] A rolling window, when added, identifies its size and missing-value policy.

**Evidence:** [Source 1](https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/charts/LineChart/LineChart.tsx)

## C11 — Clarify filter scope and inline legend behavior

**Phase:** 1 · **Effort:** Small–Medium, staged

**Current state:** Standalone legend filters; line legend is static. Table/Rows search and filtering have different scopes.

**Outcome:** Users can distinguish visual hiding, local search, and global filtering.

**Dependencies:** None required.

**Acceptance criteria:**

- [ ] Line legend supports hide/isolate with visible state.
- [ ] Hiding a series is not silently treated as filtering source rows.
- [ ] Global/local scope is labeled where controls are used.
- [ ] Promoting a local predicate to the workspace is an explicit action when supported.
- [ ] Standalone categorical/date filter controls reuse existing predicates.

**Evidence:** [Source 1](https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/charts/LineChart/LineChart.tsx) · [Source 2](https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/charts/ColorLegend/ColorLegendChart.tsx) · [Source 3](https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/charts/DataTable/README.md)

## C12 — Add reference rules, intervals, and annotations

**Phase:** 3 · **Effort:** Small rule; Medium reusable system

**Current state:** BaseChart offers an overlay slot but shared saved settings have no annotation model.

**Outcome:** Existing charts express targets, events, and supplied bounds without custom renderer forks.

**Dependencies:** None required.

**Acceptance criteria:**

- [ ] Fixed horizontal/vertical rule with label works first.
- [ ] Fixed, whole-population, and selected-population reference scopes are distinguished.
- [ ] Bands and supplied lower/upper bounds are persisted.
- [ ] Labels do not cover essential marks at supported desktop sizes.
- [ ] No inferential confidence claim is made for an unlabeled input interval.

**Evidence:** [Source 1](https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/charts/BaseChart.tsx) · [Source 2](https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/types/ChartTypes.ts)

## C13 — Add size encoding and identifiable scatter observations

**Phase:** 3 · **Effort:** Small–Medium

**Current state:** Scatter has uniform pointSize, color, Canvas, brush, and a coordinate readout.

**Outcome:** Users recognize large/unusual entities and inspect them directly.

**Dependencies:** None required.

**Acceptance criteria:**

- [ ] A size field maps nonnegative values to proportional area.
- [ ] Size legend and missing/negative policies are explicit.
- [ ] Identity and chosen fields appear in an inspectable tooltip.
- [ ] Pointer and non-pointer inspection paths exist.
- [ ] Brushing still resolves to original observations.

**Evidence:** [Source 1](https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/charts/ScatterPlot/ScatterPlot.tsx)

## C14 — Add binned density mode

**Phase:** 3 · **Effort:** Medium

**Current state:** Inspected scatter implementation has no density mode.

**Outcome:** Overlapping observations become readable without losing raw-row filtering.

**Dependencies:** C07

**Acceptance criteria:**

- [ ] Rectangular 2D bins are a valid first implementation.
- [ ] Bin boundaries and color quantity are explicit.
- [ ] Selections resolve to raw observations using documented boundary inclusion.
- [ ] Binning for display does not silently sample away selected records.
- [ ] Filtering, hover, and redraw are benchmarked on named workloads.

**Evidence:** [Source 1](https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/charts/ScatterPlot/ScatterPlot.tsx)

## C15 — Add correlation matrix to scatter exploration

**Phase:** 3 · **Effort:** Medium

**Current state:** No correlation-matrix family is registered; scatter requires choosing a pair directly.

**Outcome:** Users discover relationships across several numeric fields and immediately inspect a pair.

**Dependencies:** C07

**Acceptance criteria:**

- [ ] Method, population, and valid-pair count are visible.
- [ ] Constant and insufficient-data fields produce unavailable results, not zero correlation.
- [ ] Missing-value policy is explicit and tested.
- [ ] Cell activation opens the corresponding scatter configuration rather than inventing a record filter.
- [ ] Large field lists have a bounded, usable selection workflow.

**Evidence:** [Source 1](https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/charts/registerAllCharts.ts) · [Source 2](https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/charts/ScatterPlot/ScatterPlot.tsx)

## C16 — Add ECDF and comparable distributions

**Phase:** 3 · **Effort:** Medium

**Current state:** Histogram and box/violin/beeswarm are present; no cumulative distribution family is registered.

**Outcome:** Users answer threshold/percentile questions and compare groups without export.

**Dependencies:** C03, C18

**Acceptance criteria:**

- [ ] ECDF reports fraction of valid observations at or below a value.
- [ ] Ties, invalid values, and empty selections are tested.
- [ ] Comparison histograms share bin edges.
- [ ] Count versus within-group percentage is explicit.
- [ ] Baseline scope is named and persists as configured.

**Evidence:** [Source 1](https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/charts/registerAllCharts.ts) · [Source 2](https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/charts/BoxPlot/definition.ts)

## C17 — Introduce selection-only undo and redo

**Phase:** 1 · **Effort:** Medium

**Current state:** Clear-all, removable filter chips, precise ranges, and brush clearing exist; recommendation extends these.

**Outcome:** Exploration is reversible without requiring universal application undo.

**Dependencies:** None required.

**Acceptance criteria:**

- [ ] One completed gesture creates one history step.
- [ ] Undo/redo restores complete filter state across linked views.
- [ ] Clear-all itself can be undone.
- [ ] Data replacement resets or rebases history by an explicit policy.
- [ ] History is bounded; no raw dataset copies per brush update.

**Evidence:** [Source 1](https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/ActiveFilterStatus.tsx) · [Source 2](https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/settings/SelectionSettingsTab.tsx) · [Source 3](https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/charts/BaseChart.tsx)

## C18 — Add named baseline/selection comparison

**Phase:** 3 · **Effort:** Medium

**Current state:** Existing shared filters and saved settings provide a starting point, not a complete comparison feature.

**Outcome:** Users compare the current population with a precisely defined reference selection.

**Dependencies:** C03, C17

**Acceptance criteria:**

- [ ] All data, pre-selection population, and saved predicate are different named choices.
- [ ] Raw snapshot versus reevaluated predicate behavior is explicit on data changes.
- [ ] Comparison marks use compatible scales and metric definitions.
- [ ] Population count and valid-value denominator are available.
- [ ] Cards, distributions, and references consume the same scope definition.

**Evidence:** [Source 1](https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/README.md) · [Source 2](https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/ActiveFilterStatus.tsx)

## C19 — Complete axis-domain controls

**Phase:** 3 · **Effort:** Small–Medium

**Current state:** Numeric-scale helper/UI implement linear and symlog; calendar-specific support is separate work.

**Outcome:** Users can control view domains without accidentally changing record selection.

**Dependencies:** None required.

**Acceptance criteria:**

- [ ] Explicit bounds and reset/lock behavior are specified.
- [ ] A true logarithmic option explicitly handles nonpositive values.
- [ ] Zoom and filter actions are distinguishable.
- [ ] Brush pixels invert to raw numeric values correctly under every supported scale.
- [ ] Saved settings restore domains and selection consistently.

**Evidence:** [Source 1](https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/charts/Axis/numericScale.ts) · [Source 2](https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/settings/AxisSettingsTab.tsx)

## C20 — Optional geographic views

**Phase:** Conditional · **Effort:** Medium–Large

**Current state:** No geographic chart is registered.

**Outcome:** Geographic users see spatial patterns without expanding the core into a mapping platform.

**Dependencies:** C03, C04

**Acceptance criteria:**

- [ ] Prioritize only with evidence of geographic user workflows.
- [ ] Start with points or caller-supplied GeoJSON and explicit record joins.
- [ ] Unknown/unmatched regions are reported.
- [ ] Selections map to source records consistently.
- [ ] Projection/data/basemap requirements are documented; avoid implied geocoding support.

**Evidence:** [Source 1](https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/charts/registerAllCharts.ts)

## C21 — Familiar composition and contribution presets

**Phase:** Later · **Effort:** Small–Medium after shared primitives

**Current state:** No pie/donut or waterfall family is registered.

**Outcome:** Close recognizable presentation gaps after the main analytical contracts are complete.

**Dependencies:** C03, C04, C06

**Acceptance criteria:**

- [ ] Donut uses a bounded set of nonnegative categories with readable labels and totals.
- [ ] Donut selection reuses category membership.
- [ ] Waterfall has explicit start/end and subtotal semantics.
- [ ] No new reducer implementation is hidden in the renderer.

**Evidence:** [Source 1](https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/charts/registerAllCharts.ts)
