# Coverage matrix review: growth, blind spots and proof debt

**Read-only audit · October 5, 2026 · byronwall/explorEDA**  
**Revision:** `362db58082df9c1b57c2305a49823a1dae385081`  
**Fresh application browser tests:** 0 completed; navigation blocked by administrator policy.

## What the matrix actually measures

The current matrix is a **selected implementation-and-example catalogue**, not a transcript requirements matrix. Its 52 rows cover 18 registered view types, six modes and 28 cross-cutting features. Every row is marked required; 51 are declared supported and only true log is not supported. All supported rows have at least one declared example. This is useful catalogue hygiene, but the row set omits important product outcomes. [COV] [REG]

Its three concepts are explicitly separate: implementation status, example usage (shown/reviewed/not used), and feature review (at least one reviewed assignment). The UI explains these definitions. Blank example cells mean no recorded usage, not necessarily a missing capability or a failed test. Do not demand that every one of the 19 examples show every feature; most such combinations would be irrelevant. [COV] [COVUI]

The matrix is development-only: LandingPage conditionally imports it under `import.meta.env.DEV`. The deployed Pages build therefore cannot be used as a current matrix route even if its application were reachable. Provide a development review artifact or generated static coverage page rather than misdiagnosing production omission as a routing failure. [HOST]

## Recomputed catalogue snapshot

| Indicator | Value |
| --- | ---: |
| Feature rows | 52 |
| Examples | 19 |
| Declared implemented | 51 |
| Features with declared example usage | 51 |
| Features with at least one historical reviewed assignment | 30 |
| Needs attention under the current source predicate | 22 |
| Feature/example declarations | 182 |
| Reviewed feature/example assignments | 37 |
| Examples with any review record | 7 |
| Explicit gap strings | 0 |

These values are calculated from the included source-transcribed JSON. They are not a browser observation or a fresh test result. “Needs attention” is the source predicate: an explicit gap, unsupported/not-checked implementation, no example, or no review. Here it consists of 21 supported-but-unreviewed features plus unsupported log. The 182 declarations include the 37 reviewed assignments, not 182 additional shown-only assignments. [COV] [COVUI]

## What is growing

**Implementation breadth is growing faster than recorded visual proof.** All seven added view types and all six chart-mode rows are shown but have no reviewed assignment in the manifest. The newer time-scale row is also supported/shown without a review. Older chart-wide rows can inherit a historical reviewed status from one old example even when a newer mode needs different tests. The reviewed numeric-day line does not certify calendar areas; reviewed scatter does not certify density membership or bubble-area semantics. [COV] [REVIEW] [CHART]

**Everyday interaction support is undercounted.** Header distributions, drag reorder, table context menus and filter-owner navigation now exist, yet the row set has no direct outcome-specific credit for most of them. Those capabilities disappear inside broad table/filter labels. The same problem affects calculations: `calculated-orders` has fourteen recorded calculations, but its only reviewed assignment is invalid state. That does not measure a valid formula, dependency chain, edit propagation or calculation provenance. [TABLE] [THDR] [TMENU] [FILTER] [COV] [REVIEW]

**Traceability is particularly invisible in the matrix.** The `scatter-trace` example declares charts, guides, colors and interactions but has no traceability feature to declare. The chart guide describes many contributor/geometry trace contracts, yet the matrix cannot say which family can explain which step. Add explicit source-membership, exclusion, intermediate-result and property-origin outcomes rather than a single oversized “traceability supported” flag. [COV] [CHART]

## What is lacking in the model

The data model lacks partial support, planned-only status and a scope description for exceptions. “Map” combines point and region joins; “area” combines simple and stacked bands; “stacked bars” combines absolute and percentage semantics. Conversely, `scale:time` has an appropriately narrow description tied to calendar Line Charts. Use that style of bounded contract more consistently. [COV]

The review model stores a date, a repository report string and prose evidence per reviewed assignment. It does not store the reviewed commit, data hash, browser/version, viewport, action/result identifiers, test runner or artifact digest. Source changes cannot automatically make a review stale. Feature-level reviewed is computed by any reviewed assignment, not by whether the current relevant modes were exercised. [COV]

Neither the feature detail nor the example usage view renders the stored review date, report link or evidence sentence. They link to the example and show checked status, so readers cannot follow the proof directly from the visible coverage claim. Expose those fields and their freshness next to the assignment, with a clear distinction between opening the example and opening its proof. [COVUI]

`getOpenGapCount()` sums optional gap strings. With no gap arrays, the result is zero even though log is unsupported and most transcript gaps are not represented. That API is not a count of unresolved product needs. The current summary uses “Needs attention,” which is better; retain its distinct definition and avoid publishing a misleading “zero product gaps” claim. [COV] [COVTEST] [COVUI]

## Safeguards already present — retain them

The coverage tests compare the exact example ID list with the example catalogue and compare declared chart types with the active registry. The validator also detects unknown IDs, missing reviewed dates, missing evidence sentences and evidence attached to unreviewed assignments. These are real existing safeguards; they should not be proposed as though absent. They were inspected in source but not rerun here. [COVTEST] [COV]

The missing checks are different: real calendar-date validity rather than only a date-shaped string; existing report files and anchors rather than a path prefix; actual artifact resolution; revision/data freshness; semantic assertion coverage; and bounded implementation exceptions. Duplicate IDs and changed proof dependencies can also be tested explicitly. The existing equality checks protect the current example catalogue, but do not establish that each claimed feature is actually exercised by its saved example. [COV] [COVTEST]

## Historical review is useful but not current proof

The 37 reviewed assignments all point to the October 2 report. That report documents seven examples, principally at 1280 CSS pixels; shop was also checked at 1024, with selected narrow flows at 783/390. It explicitly does not cover virtual scrolling and does not expand the supported desktop minimum below 1024. It was correct at its date to distinguish numeric study days from a time scale. New UTC calendar support should not retroactively change the historical report; it should add a new proof record. [REVIEW] [CHART]

The report's screenshot links resolve to files such as `tmp/shop-operations-1280.png`. At the pinned revision the tmp directory listing contains only `evals/`, so those linked screenshots are not retained at their stated repository locations. This does not prove the historical browser work never happened. It means this audit cannot inspect those screenshots from the cited paths and the proof chain is not reproducible from the report alone. [REVIEW] [TMP]

## Row-by-row commentary

Counts below are manifest declarations and historical assignments. “Reviewed 0” is not a runtime failure; it identifies missing recorded review for that row. Every row's fresh browser status in this audit is not tested.

### chart:map · Map

**Declared implementation:** supported. **Examples:** 2. **Historically reviewed examples:** 0.

Point and region modes are delivered; split their different coordinate, join, omission, and geometry-restore contracts in the matrix. [COV]

### chart:metric-card · Metric Card

**Declared implementation:** supported. **Examples:** 10. **Historically reviewed examples:** 0.

A filtered versus all-source metric is useful growth; it is not a frozen comparison cohort. Check count versus eligible numeric contributors. [COV]

### chart:row · Row Chart

**Declared implementation:** supported. **Examples:** 13. **Historically reviewed examples:** 0.

Ranked counts now include searchable Other members. A generic row-chart row does not prove exact member identity after resize or restore. [COV]

### chart:bar · Bar Chart

**Declared implementation:** supported. **Examples:** 11. **Historically reviewed examples:** 0.

Histogram, counts, grouped measures and multiple series modes coexist. Separate bin-boundary, selection, and denominator proof. [COV]

### chart:scatter · Scatter Plot

**Declared implementation:** supported. **Examples:** 11. **Historically reviewed examples:** 2.

An older scatter example is reviewed, but that cannot certify newly added bubble, density, or mark-trace behavior. [COV]

### chart:3d-scatter · 3D Scatter

**Declared implementation:** supported. **Examples:** 1. **Historically reviewed examples:** 1.

Historical Lorenz checks support receiving linked filters and visible color. They do not prove point picking or a full accessible selection path. [COV]

### chart:pivot · Pivot Table

**Declared implementation:** supported. **Examples:** 4. **Historically reviewed examples:** 1.

Position summaries are historically reviewed; arbitrary aggregate error handling, contributor inspection and output reuse need separate rows. [COV]

### chart:data-table · Data Table

**Declared implementation:** supported. **Examples:** 17. **Historically reviewed examples:** 1.

Listing records is reviewed. New header distributions, dragging, context menus, calculated cells and export roundtrips deserve independent proof. [COV]

### chart:summary · Summary

**Declared implementation:** supported. **Examples:** 2. **Historically reviewed examples:** 1.

Historical field counts are credited; inference corrections, blank/nonfinite policies and filtered distributions require explicit scenarios. [COV]

### chart:markdown · Markdown / explanation

**Declared implementation:** supported. **Examples:** 3. **Historically reviewed examples:** 0.

Static rich explanation is shown. It is not data-bound narrative or the newly planned compact authoring DSL. [COV]

### chart:boxplot · Distribution / Box Plot

**Declared implementation:** supported. **Examples:** 6. **Historically reviewed examples:** 0.

Box, violin, observations and beeswarm are materially different modes; contributor, density and geometry claims should not hide behind one cell. [COV]

### chart:color-legend · Color Legend view

**Declared implementation:** supported. **Examples:** 2. **Historically reviewed examples:** 0.

A dedicated legend view is distinct from automatic chart legends. Continuous-range interaction is not established by displaying a palette. [COV]

### chart:line · Line Chart

**Declared implementation:** supported. **Examples:** 5. **Historically reviewed examples:** 1.

The reviewed numeric-day line is not proof of new UTC rollups, long-format category series, area bands or missing-period policy. [COV]

### chart:sankey · Sankey

**Declared implementation:** supported. **Examples:** 1. **Historically reviewed examples:** 0.

Ordered-stage flows are delivered; an edge-list network is not. Check adjacent-stage pairs, stage identity, weight exclusions and Other nodes. [COV]

### chart:parallel-coordinates · Parallel Coordinates

**Declared implementation:** supported. **Examples:** 1. **Historically reviewed examples:** 0.

This closes the earlier parallel-coordinate example gap. Reorder, inversion, brush intersection and complete-row exclusions need browser proof. [COV]

### chart:calendar · Calendar

**Declared implementation:** supported. **Examples:** 3. **Historically reviewed examples:** 0.

UTC day/month presentation is delivered. This does not close relative periods, quarter controls or period stepping in generic field filters. [COV]

### chart:heatmap · Heatmap

**Declared implementation:** supported. **Examples:** 1. **Historically reviewed examples:** 0.

Two-category aggregates are delivered. Correlation and missingness semantics are not supplied merely by a grid of colored cells. [COV]

### chart:ecdf · ECDF

**Declared implementation:** supported. **Examples:** 1. **Historically reviewed examples:** 0.

Distribution thresholds add analytical depth. Check ties, denominator eligibility, both directions and grouped versus overall curves. [COV]

### mode:scatter-density · Scatter density

**Declared implementation:** supported. **Examples:** 1. **Historically reviewed examples:** 0.

Rectangular count bins are delivered. They are not hexagonal bins or two-dimensional KDE contours; those are newly planned scatter scope. [COV]

### mode:bubble-scatter · Bubble scatter

**Declared implementation:** supported. **Examples:** 1. **Historically reviewed examples:** 0.

Numeric size uses an area contract. Check zero, negative/invalid values, full-source stability and source-row selection under overlap. [COV]

### mode:area · Area and stacked area

**Declared implementation:** supported. **Examples:** 1. **Historically reviewed examples:** 0.

A combined row hides two geometries. Check missing periods and cumulative bounds; stack averages must remain disallowed. [COV]

### mode:stacked-bars · Stacked and percentage bars

**Declared implementation:** supported. **Examples:** 1. **Historically reviewed examples:** 0.

A combined row hides absolute and normalized denominators. Show zero/no rows/no valid measurements separately. [COV]

### mode:grouped-bars · Grouped bars

**Declared implementation:** supported. **Examples:** 1. **Historically reviewed examples:** 0.

An exact category-series pair is supported. Arbitrary unions of pairs cannot be represented by independent field value sets. [COV]

### mode:calendar-series · Calendar series

**Declared implementation:** supported. **Examples:** 2. **Historically reviewed examples:** 0.

Day/week/month grouping, week start, category series and source IDs are a genuine partial closure of line and date intent. [COV]

### labels:meaningful-title · Meaningful titles

**Declared implementation:** supported. **Examples:** 6. **Historically reviewed examples:** 1.

Historical examples have useful questions. No guarantee that every newly created chart or changed metric retains a truthful title. [COV]

### labels:axes · Axis labels

**Declared implementation:** supported. **Examples:** 6. **Historically reviewed examples:** 1.

Historical units and names are credited. Add generated-versus-overridden labels and derived units to acceptance criteria. [COV]

### guides:ticks · Ticks

**Declared implementation:** supported. **Examples:** 6. **Historically reviewed examples:** 1.

Reviewed at selected widths; test long labels, date boundaries and facet crowding rather than treating one readable axis as universal. [COV]

### guides:grids · Grid lines

**Declared implementation:** supported. **Examples:** 1. **Historically reviewed examples:** 0.

Shown in scatter-trace but not reviewed. Test whether guides aid comparison without covering points or conflicting with facet scale policy. [COV]

### scale:linear · Linear scale

**Declared implementation:** supported. **Examples:** 2. **Historically reviewed examples:** 1.

Numeric-day historical proof is appropriately narrow. Include constant, empty and all-invalid domains in a separate robustness dimension. [COV]

### scale:log · Log scale

**Declared implementation:** not-supported. **Examples:** 0. **Historically reviewed examples:** 0.

Correctly not supported. Symlog is not log. Zero explicit gap strings is not evidence that this unsupported capability is complete. [COV]

### scale:time · Time scale

**Declared implementation:** supported. **Examples:** 1. **Historically reviewed examples:** 0.

New supported contract is specifically UTC Line Chart calendar summaries, not universal time axes across all chart modes. [COV]

### scale:band · Band scale

**Declared implementation:** supported. **Examples:** 1. **Historically reviewed examples:** 1.

Historical categorical positions are credited. Typed equal-looking values, ordering and omitted categories still need targeted checks. [COV]

### scale:symlog · Symmetric log scale

**Declared implementation:** supported. **Examples:** 2. **Historically reviewed examples:** 1.

Correctly separated from log. Preserve that distinction in chart copy, exported settings and axis inspection. [COV]

### color:categorical · Categorical color

**Declared implementation:** supported. **Examples:** 5. **Historically reviewed examples:** 2.

Shared categorical colors have historical proof. Add typed keys, missing groups, source-field binding and rename consistency. [COV]

### color:numerical · Numerical color

**Declared implementation:** supported. **Examples:** 2. **Historically reviewed examples:** 1.

Historical Lorenz visibility is evidence for that palette and background, not for all domains or accessible continuous legends. [COV]

### color:legend · Legends

**Declared implementation:** supported. **Examples:** 5. **Historically reviewed examples:** 2.

Historical categories are named. The description every non-obvious encoding is broader than the finite set of reviewed examples. [COV]

### facet:wrap · Wrap facets

**Declared implementation:** supported. **Examples:** 3. **Historically reviewed examples:** 1.

Historical Lorenz layout is credited. Add ordered visibility, paging, focus and keyboard header actions; do not require all 18 types to facet. [COV]

### facet:grid · Grid facets

**Declared implementation:** supported. **Examples:** 1. **Historically reviewed examples:** 1.

Historical material-by-size layout is credited. Add empty cells, typed tuples, field changes and interaction scope. [COV]

### facet:shared-scales · Shared scales

**Declared implementation:** supported. **Examples:** 1. **Historically reviewed examples:** 1.

One matching-tick comparison does not establish all field/type/scale combinations. Include position, color and size contracts. [COV]

### interaction:brushing · Brushing

**Declared implementation:** supported. **Examples:** 4. **Historically reviewed examples:** 1.

A historical range brush is checked. New density, parallel, time and stacked modes need their own filter-semantic checks. [COV]

### interaction:cross-filter · Cross-chart filtering

**Declared implementation:** supported. **Examples:** 13. **Historically reviewed examples:** 2.

Web 167/500 and Lorenz historical counts are valuable oracles. Waived new cross-view comparisons remain unverified. [COV]

### interaction:active-filter · Active filter display

**Declared implementation:** supported. **Examples:** 1. **Historically reviewed examples:** 1.

Owner navigation and highlighting are now active source behavior; the old reviewed Sports chip alone does not prove the new focus path. [COV]

### interaction:saved-filter-state · Saved filter state

**Declared implementation:** supported. **Examples:** 1. **Historically reviewed examples:** 1.

The declared intent is opening a preset example. Rename or split it so it cannot be mistaken for edited-state export and restore. [COV]

### table:sorting · Table sorting

**Declared implementation:** supported. **Examples:** 2. **Historically reviewed examples:** 1.

Clear sort now exists in the context menu. Header clicks still toggle asc/desc; record outcome support separately from a preferred three-state gesture. [COV]

### table:filtering · Table filtering

**Declared implementation:** supported. **Examples:** 1. **Historically reviewed examples:** 1.

Text search and a reversible empty result have historical proof. Add typed cell filters and local Rows versus chart-owned scopes. [COV]

### table:virtualization · Virtual table scrolling

**Declared implementation:** supported. **Examples:** 2. **Historically reviewed examples:** 0.

Explicitly not covered by the October 2 table review. A shown 10,000-row example is not scroll, memory or screen-reader proof. [COV]

### table:formatting · Table formatting

**Declared implementation:** supported. **Examples:** 1. **Historically reviewed examples:** 1.

Historical grouped PTS values are narrower than the broad label. Add precision, currency, count units, aliases and exact-bound disclosure. [COV]

### layout:dashboard · Dashboard layout

**Declared implementation:** supported. **Examples:** 5. **Historically reviewed examples:** 1.

Readability is historically checked; duplicate filter ownership, resize persistence and focused-view restoration are separate outcomes. [COV]

### state:empty · Empty state

**Declared implementation:** supported. **Examples:** 1. **Historically reviewed examples:** 1.

One unmatched search is reviewed. Add empty chart inputs, zero-valued groups, invalid measures, absent dates and unmatched map regions. [COV]

### state:invalid · Invalid state

**Declared implementation:** supported. **Examples:** 1. **Historically reviewed examples:** 1.

Invalid formula syntax is reviewed. It does not prove transactional rejection of malformed full-analysis imports or every new chart setting. [COV]

### accessibility:naming · Accessibility naming

**Declared implementation:** supported. **Examples:** 6. **Historically reviewed examples:** 4.

Keep the narrow label. Useful names do not establish keyboard equivalence, screen-reader semantics or accessible Canvas/WebGL marks. [COV]

### responsive:desktop-resize · Desktop resize

**Declared implementation:** supported. **Examples:** 1. **Historically reviewed examples:** 1.

Historical 1280/1024 checks support selected layouts. Narrow checks do not change the declared 1024 CSS-pixel workspace minimum. [COV]

## Example-level review distribution

| Example | Declared pairs | Reviewed pairs | Interpretation |
| --- | ---: | ---: | --- |
| distribution-discovery | 6 | 0 | Shown declarations only; no review record |
| region-map | 5 | 0 | Shown declarations only; no review record |
| point-map | 5 | 0 | Shown declarations only; no review record |
| scatter-density | 6 | 0 | Shown declarations only; no review record |
| bubble-scatter | 6 | 0 | Shown declarations only; no review record |
| area-charts | 8 | 0 | Shown declarations only; no review record |
| stacked-bars | 6 | 0 | Shown declarations only; no review record |
| grouped-bars | 6 | 0 | Shown declarations only; no review record |
| calendar-series | 8 | 0 | Shown declarations only; no review record |
| shop-operations | 18 | 11 | October 2 report; only listed assignments |
| palmer-penguins | 10 | 0 | Shown declarations only; no review record |
| nba-stats | 14 | 8 | October 2 report; only listed assignments |
| categorical-charts | 14 | 6 | October 2 report; only listed assignments |
| box-plot | 8 | 0 | Shown declarations only; no review record |
| product-activity | 13 | 2 | October 2 report; only listed assignments |
| scatter-trace | 10 | 0 | Shown declarations only; no review record |
| calculated-orders | 9 | 1 | October 2 report; only listed assignments |
| shop-10000 | 16 | 1 | October 2 report; only listed assignments |
| lorenz-3d | 14 | 8 | October 2 report; only listed assignments |


The absence of a review on newly added modes is more important than filling every blank square. Prioritize distinct semantics: pair selection, percentage denominators, date boundaries, missing measurements, trace identity and restore. Avoid spending effort declaring the same easy title/legend property in more examples while core workflows remain unrepresented. [COV] [CHART]

## Proposed extension: outcome coverage alongside the catalogue

Keep the existing chart/example catalogue. Add a linked outcome layer with stable requirement IDs, scope, implementation evidence and verification records. Do not overload one boolean status to mean designed, coded, demonstrated, reviewed and accepted. The proposed dimensions in the data folder are recommendations only; no repository file has been modified.

### outcome:field-inspection

**Assessment:** Partial / growing. **Transcript ledger:** DATA-02 DATA-03.

Contract: Inline distributions, missing/excluded counts, type preview and raw/effective distinction. Decisive proof: BT01 BT02.

### outcome:column-operations

**Assessment:** Implemented slice / unverified here. **Transcript ledger:** TABLE-01 TABLE-02 TABLE-03.

Contract: Drag, hide/recover, width reset, keyboard resize and Clear sort; separate auto-fit absence. Decisive proof: BT12 BT22.

### outcome:filter-population

**Assessment:** Partial / growing. **Transcript ledger:** FILT-01 FILT-02.

Contract: Full, peer and global/local population semantics with exact source IDs. Decisive proof: BT03 BT07.

### outcome:filter-owner-navigation

**Assessment:** Implemented slice / unverified here. **Transcript ledger:** FILT-03.

Contract: Label focus/jump versus X removal, including overflow and Rows. Decisive proof: BT11.

### outcome:reset-all

**Assessment:** Implemented slice / unverified here. **Transcript ledger:** FILT-04.

Contract: Reset chart filters, table searches and Rows-local controls together. Decisive proof: BT03 BT11.

### outcome:exact-range

**Assessment:** Partial. **Transcript ledger:** FILT-06 FILT-07.

Contract: Manual bound precision, one-sided intervals and data-replacement semantics. Decisive proof: BT04.

### outcome:typed-other-members

**Assessment:** Implemented slice / unverified here. **Transcript ledger:** FILT-08.

Contract: Typed identity, rare-member selection and resize/restore stability. Decisive proof: BT05.

### outcome:calculation-authoring

**Assessment:** Implemented slice / historical proof. **Transcript ledger:** CALC-01 CALC-02 CALC-03.

Contract: Valid formulas, invalid drafts, dependency errors and row-level explanations. Decisive proof: BT18.

### outcome:calculation-dependent-edit

**Assessment:** Implemented slice / needs current integration proof. **Transcript ledger:** CALC-05 CALC-06.

Contract: Recompute every affected chart/table/filter while preserving thresholds. Decisive proof: BT18 BT22.

### outcome:aggregate-contributors

**Assessment:** Partial / growing. **Transcript ledger:** TRACE-01 CALC-08.

Contract: Exact source members versus eligible measurements and exclusions per family. Decisive proof: BT07 BT15 BT16.

### outcome:property-provenance

**Assessment:** Partial / growing. **Transcript ledger:** TRACE-03.

Contract: Transforms, scales, defaults, stack bounds, date intervals and denominators. Decisive proof: BT10 BT14 BT24.

### outcome:intermediate-reuse

**Assessment:** Partial. **Transcript ledger:** DATA-08 TRACE-02.

Contract: Named grouped outputs versus chart-local arrays; one concrete downstream consumer. Decisive proof: BT19 BT26.

### outcome:settings-roundtrip

**Assessment:** Implemented slice / fresh proof missing. **Transcript ledger:** DASH-03 DASH-04.

Contract: Edited settings remount against supplied host data. Decisive proof: BT22.

### outcome:full-analysis-roundtrip

**Assessment:** Implemented slice / fresh proof missing. **Transcript ledger:** DASH-03 DASH-04.

Contract: Rows, special values, calculations, new chart settings and geometry assets. Decisive proof: BT22 BT29.

### outcome:invalid-restore-atomicity

**Assessment:** Implemented slice / needs proof. **Transcript ledger:** DASH-04 CALC-02.

Contract: Invalid JSON/dependencies cannot destroy the current analysis. Decisive proof: BT22.

### outcome:durable-named-analysis

**Assessment:** Not established in current host. **Transcript ledger:** DASH-02 DASH-05.

Contract: Storage, ownership, dirty state, reopening and source binding. Decisive proof: BT22 BT23.

### outcome:filter-free-template

**Assessment:** Not established. **Transcript ledger:** DASH-06.

Contract: Layout/configuration separated from a temporary selection. Decisive proof: BT33.

### outcome:stable-source-identity

**Assessment:** Not established. **Transcript ledger:** DATA-04 TRACE-05.

Contract: Key and source fingerprint survive reorder/replacement without silent remapping. Decisive proof: BT23.

### outcome:calendar-relative-period

**Assessment:** Not established beyond fixed rollups. **Transcript ledger:** FILT-11.

Contract: Rolling versus completed periods, step windows, explicit saved reference time. Decisive proof: BT08 BT09.

### outcome:rich-cell-reading

**Assessment:** Not established in scalar model. **Transcript ledger:** TABLE-06 TABLE-07.

Contract: Long text and structured objects retain readable semantic context. Decisive proof: BT13.

### outcome:keyboard-workflow

**Assessment:** Partial / unverified. **Transcript ledger:** UX-03.

Contract: Task completion, mark selection alternatives, focus and Escape, not names alone. Decisive proof: BT12 BT24.

### outcome:screen-reader-workflow

**Assessment:** Unverified. **Transcript ledger:** UX-03.

Contract: Real assistive technology reads table/trace/selection context accurately. Decisive proof: BT24 BT34.

### outcome:measured-performance

**Assessment:** Unverified. **Transcript ledger:** PERF-01 PERF-05.

Contract: Load/filter/Apply/scroll/heap with device, shape and latency distributions. Decisive proof: BT34.

### planned:advanced-scatter

**Assessment:** Planned only. **Transcript ledger:** CALC-09 CHART-02.

Contract: Regression, LOESS, marginals, hexagons and 2D contours; own versus peer filter scope. Decisive proof: BT27.

### planned:compact-authoring

**Assessment:** Planned only. **Transcript ledger:** TRACE-04 TRACE-06.

Contract: Complete document authoring, warnings, expanded settings and export equivalence. Decisive proof: BT27.

## Suggested orthogonal schema

An outcome record should contain: requirement IDs and transcript anchors; a narrowly stated contract and exceptions; implementation status and source revision; example/test IDs; and independent verification records. A verification record should carry result (`pass`, `fail`, `blocked`, `not-run`, `waived`, or explicitly historical), browser/version/viewport, dataset hash, tested commit, steps, expected/observed source keys and values, and artifact links/digests.

A review remains a historical fact after code changes. Its applicability to the current build is a separate freshness decision. Use either a conservative commit-based expiry or dependency fingerprints for changed reducers, providers, source fixtures and renderers. A passed screenshot from an old commit must not silently become evidence for a new denominator or selection mode.

Generate the matrix, transcript crosswalk and summary from the same structured records. Link each checked assignment to its proof and display a filter for unverified current implementations, waived acceptance checks, planned-only work and unrepresented transcript outcomes. Name the current “With evidence” tile “With declared example usage” or keep its explanatory qualifier equally prominent.

The first useful new proof batch is BT02/03/07/08/11/12/18/21/22/24: numeric eligibility, filter scope, cross-view arithmetic, UTC, owner navigation, table controls, calculation edits, CSV, restore and trace/keyboard behavior. That improves trust more than indiscriminately increasing the number of shown cells.

---

Source labels link to the identified repository files or PR/run records. Full source locators and reading scope are in Report 06.

[CHART]: https://github.com/byronwall/explorEDA/blob/362db58082df9c1b57c2305a49823a1dae385081/docs/analytical-chart-coverage.md "Current chart contracts, boundaries, and verification waiver"
[COV]: https://github.com/byronwall/explorEDA/blob/362db58082df9c1b57c2305a49823a1dae385081/apps/demo/src/demos/coverage.ts "Complete feature and example coverage manifest; four source ranges reviewed"
[COVTEST]: https://github.com/byronwall/explorEDA/blob/362db58082df9c1b57c2305a49823a1dae385081/apps/demo/src/demos/coverage.test.ts "Registry and example equality checks, evidence validation tests"
[COVUI]: https://github.com/byronwall/explorEDA/blob/362db58082df9c1b57c2305a49823a1dae385081/apps/demo/src/CoverageMatrix.tsx "Coverage summary, attention predicate, matrix and example UI"
[FILTER]: https://github.com/byronwall/explorEDA/blob/362db58082df9c1b57c2305a49823a1dae385081/packages/explorEDA/src/components/ActiveFilterStatus.tsx "Owner navigation, highlight, formatting, local scope and reset"
[HOST]: https://github.com/byronwall/explorEDA/blob/362db58082df9c1b57c2305a49823a1dae385081/apps/demo/src/LandingPage.tsx "Development-only matrix gate; host import, restore, state capture"
[REG]: https://github.com/byronwall/explorEDA/blob/362db58082df9c1b57c2305a49823a1dae385081/packages/explorEDA/src/charts/registerAllCharts.ts "18 explicit active chart registrations"
[REVIEW]: https://github.com/byronwall/explorEDA/blob/362db58082df9c1b57c2305a49823a1dae385081/docs/reviews/2026-10-02-example-coverage.md "Repository-authored historical browser review of 37 assignments in 7 examples"
[TABLE]: https://github.com/byronwall/explorEDA/blob/362db58082df9c1b57c2305a49823a1dae385081/packages/explorEDA/src/components/charts/DataTable/DataTable.tsx "Active table wiring: distributions, context menu, derived values and virtual body"
[THDR]: https://github.com/byronwall/explorEDA/blob/362db58082df9c1b57c2305a49823a1dae385081/packages/explorEDA/src/components/charts/DataTable/DataTableHeader.tsx "Header dragging, typed filters, two-state header sort and keyboard width control; main implementation read"
[TMENU]: https://github.com/byronwall/explorEDA/blob/362db58082df9c1b57c2305a49823a1dae385081/packages/explorEDA/src/components/charts/DataTable/DataTableContextMenu.tsx "Clear sort, hide/recover/move columns, reset width, copy and cell filters"
[TMP]: https://github.com/byronwall/explorEDA/tree/362db58082df9c1b57c2305a49823a1dae385081/tmp "Pinned directory listing contains only evals/; October 2 report screenshots at tmp root absent"
