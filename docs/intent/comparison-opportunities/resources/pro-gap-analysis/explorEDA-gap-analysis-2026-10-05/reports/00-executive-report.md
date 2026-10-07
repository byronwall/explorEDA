# Executive report: support has grown; proof and reuse lag

**Read-only audit · October 5, 2026 · byronwall/explorEDA**  
**Revision:** `362db58082df9c1b57c2305a49823a1dae385081`  
**Fresh application browser tests:** 0 completed; navigation blocked by administrator policy.

## Verdict

The previous gap analysis is no longer a reliable current backlog. The repository has materially expanded beyond its September eleven-view baseline, and several ordinary table/filter gaps were closed as well. The right next step is **reconciliation and trust verification**, not reimplementing old missing features or treating every transcript example as an approved chart request. The active registry contains 18 view types; the coverage manifest adds six mode rows and still describes only a selected feature catalogue, not the full transcript requirement space. [BASE] [REG] [COV]

**This deliverable does not satisfy the requested fresh application-browser verification.** Real Chromium navigation was attempted against the deployed URL, a local server serving the exact downloaded deployment artifact, and a local file. All were stopped before application execution by `net::ERR_BLOCKED_BY_ADMINISTRATOR`. Three screenshots and structured logs are included. No interaction, rendering, accessibility, restore or performance result is represented as a fresh pass. The browser report provides the actual failures, independent data checks and 35 unexecuted acceptance scenarios. The tooling report distinguishes environmental restrictions from repository improvements.

## What changed enough to invalidate the old backlog

**Analytical breadth now has deeper semantics.** New registered types include Map, Metric Card, Sankey, Parallel Coordinates, Calendar, Heatmap and ECDF. Existing types gained grouped/stacked/percentage bars, calendar line series, area/stacked area, bubble size and rectangular scatter density. The current chart guide documents typed selections, exact contributors, stack denominators, time bounds, exclusions and geometry contracts. These are more meaningful gains than merely adding renderer names. They are repository-reported contracts with active registrations; this audit did not independently execute all their implementations. [REG] [CHART]

**Several small usability goals were also delivered.** Direct source review finds inline table distributions, header dragging, context-menu move/hide/recover controls, Reset width and Clear sort. The table actually mounts these components. Filter-chip labels now navigate to their owning chart and highlight it on hover/focus; PlotManager supplies the callbacks. These should be removed from a missing-feature backlog and put into current browser regression coverage instead. [TABLE] [THDR] [TMENU] [FILTER] [PLOT]

**Calendar and trace coverage need narrower new boundaries.** It is no longer correct to say that time scales, histogram/box contributors, grouped series or parallel coordinates are categorically absent. UTC day/week/month rollups are implemented through a shared reducer; the current guide extends traces to many chart families. Remaining gaps concern relative-period controls, uniform trace depth, persistent source identity, reusable intermediate outputs and renderer-independent reproduction. A trace dialog is not automatically a reusable transform node. [ROLL] [CHART] [INV]

**Planning has grown without runtime support.** PR136 merged advanced scatter and compact dashboard-authoring plans, including regression, LOESS, hexagonal counts, marginals and two-dimensional contours. Its description explicitly says there are no application changes. Those capabilities must remain planned-only; neither a merged planning PR nor a large supporting document is implementation evidence. [PLAN]

## Coverage matrix: the defensible numbers

The following are computed from a transcription of the pinned manifest, not observed from the blocked browser. The transcription and recount script are included. IDs, statuses and assignments follow the source; some display labels are shortened for this audit. [COV] [COVUI]

| Measure | Count | Correct interpretation |
| --- | ---: | --- |
| Feature rows | 52 | 18 view types, 6 modes, 28 cross-cutting rows |
| Declared implemented | 51 | Only true log is explicitly not supported |
| Features with a declared example | 51 | A declaration is not a successful interaction |
| Features with any historical reviewed assignment | 30 | At least one example/feature pair, not all combinations |
| Needs attention under existing UI logic | 22 | 21 supported but unreviewed rows, plus unsupported log |
| Declared feature/example assignments | 182 | Across 19 examples |
| Historically reviewed assignments | 37 | All dated October 2, across 7 examples |
| Explicit gap strings | 0 | Does not include unsupported features or transcript gaps |
| Fresh application browser checks completed here | 0 | Environment blocked all three navigation targets |

The matrix has a useful foundation: implementation, usage and review are separated, empty cells mean no recorded usage, and tests enforce both registry coverage and equality between the example catalogue and coverage entries. Preserve those safeguards. The central limitations are missing transcript-outcome dimensions, no partial implementation state, no revision-bound proof freshness, and no rendered access to the stored review report/date/evidence text. [COV] [COVTEST] [COVUI]

The development-only matrix is intentionally removed from production. A production Pages artifact is therefore not the correct target for a matrix walkthrough, even in an unrestricted browser. This is a documented boundary in code, not an application-route defect. [HOST]

## Highest-value remaining gaps

**Trust verification across existing features comes first.** Reconcile source member counts, numeric contributor counts, metric values, displayed units, selections and saved states across current chart types. The October 4 retirement explicitly waived remaining cross-view comparisons and browser restores; closure records acceptance of that scope decision, not a test pass. The repository's reported 530 library and 21 demo tests are useful evidence of its own validation, but this audit did not rerun them. [CHART] [CLOSE]

**The broader traceability goal is still partial.** The transcripts ask how every mark was produced, including transformation inputs, exclusions, filter scope, scale/default choices and reusable outputs. New chart-specific traces answer more of that question. Persistent source versions, stable row keys, general intermediate-table reuse and a renderer-neutral reproduction contract are not established in the reviewed product boundary. Prioritize one real reuse task before choosing a universal graph architecture. [T11] [T15] [T16] [T17] [INV] [CHART]

**Saving applied state is stronger than saving an ongoing body of work.** Settings and full-analysis bundles exist, with host validation before replacement. Durable named analyses, filter-free view templates, checkpoints/undo, frozen cohorts and source-bound identity remain separate product needs. Keep storage ownership in the host unless a new decision changes that boundary. [T08] [T12] [HOST] [INV]

**Remaining table/date polish should be accurately scoped.** Content-aware auto-fit is not the same as Reset width. A third header-click reset differs from the now-present Clear sort outcome. Relative calendar windows and stepping differ from Calendar charts and UTC rollups. Rich tag/image/history cells differ from flattening JSON into scalar fields. Avoid reclassifying delivered controls as missing while preserving these narrower differences. [T02] [T04] [T05] [T07] [T09] [THDR] [TMENU] [ROLL] [INV]

## Recommended order and ownership

**P0 — repair the evidence chain.** Create a single dated audit snapshot, link its claims to sources and proof, preserve waived/not-run states, and publish a development review target plus retained test artifacts. A repository change cannot override this session's browser administrator policy. Use an authorized CI/browser environment rather than weakening controls.

**P1 — prove current trust-critical workflows.** Run the included exact-contributor, cross-view, typed-category, UTC, calculation-edit, export/restore, focus and desktop scenarios. Capture actual source keys and canonical state, not screenshots alone. This is a proposed new verification batch, not an unauthorized reopening of the retired initiative.

**P2 — choose bounded product improvements.** Likely candidates are content auto-fit, relative calendar controls with explicit reference time, a clearer save/template workflow, source binding, and one reusable intermediate output. Execute the already shaped scatter/DSL work only through its own approved prioritization; this audit is not approval to build it.

**P3 — keep broader architecture and content-specific features parked until needed.** Multi-source analytics, server projection, rich cells, hierarchy layouts and renderer-neutral scenes have real transcript support, but the transcripts mix long-term goals with examples. They should not share an undifferentiated completion denominator with a broken current filter.

## Reading the package

Read this executive report first. Report 01 reconstructs all 20 memos. Report 02 retains all 92 original gap IDs and replaces stale assessments. Report 03 comments on every one of the 52 coverage rows and all 19 examples. Report 04 records browser limitations, historical proof and the 35-scenario acceptance plan. Report 05 documents tool failures and concrete repository-readiness improvements. JSON/CSV ledgers, synthetic fixtures, screenshots, provenance and utility scripts accompany the reports.

The narrow conclusion is strong: **support has grown substantially, but current proof coverage and durable analytical reuse have not caught up.** No single percentage can faithfully describe completion of these transcripts.

---

Source labels link to the identified repository files or PR/run records. Full source locators and reading scope are in Report 06.

[BASE]: https://github.com/byronwall/explorEDA/blob/362db58082df9c1b57c2305a49823a1dae385081/docs/transcript-gap-analysis.md "Original transcript reconciliation; mixed-age September baseline with later edits"
[CHART]: https://github.com/byronwall/explorEDA/blob/362db58082df9c1b57c2305a49823a1dae385081/docs/analytical-chart-coverage.md "Current chart contracts, boundaries, and verification waiver"
[CLOSE]: https://github.com/byronwall/explorEDA/pull/135 "Merged documentation-only closure; waived cross-view comparisons and browser restores; metadata read"
[COV]: https://github.com/byronwall/explorEDA/blob/362db58082df9c1b57c2305a49823a1dae385081/apps/demo/src/demos/coverage.ts "Complete feature and example coverage manifest; four source ranges reviewed"
[COVTEST]: https://github.com/byronwall/explorEDA/blob/362db58082df9c1b57c2305a49823a1dae385081/apps/demo/src/demos/coverage.test.ts "Registry and example equality checks, evidence validation tests"
[COVUI]: https://github.com/byronwall/explorEDA/blob/362db58082df9c1b57c2305a49823a1dae385081/apps/demo/src/CoverageMatrix.tsx "Coverage summary, attention predicate, matrix and example UI"
[FILTER]: https://github.com/byronwall/explorEDA/blob/362db58082df9c1b57c2305a49823a1dae385081/packages/explorEDA/src/components/ActiveFilterStatus.tsx "Owner navigation, highlight, formatting, local scope and reset"
[HOST]: https://github.com/byronwall/explorEDA/blob/362db58082df9c1b57c2305a49823a1dae385081/apps/demo/src/LandingPage.tsx "Development-only matrix gate; host import, restore, state capture"
[INV]: https://github.com/byronwall/explorEDA/blob/362db58082df9c1b57c2305a49823a1dae385081/docs/application-feature-inventory.md "Feature inventory selectively updated October 4; explicitly not a full re-audit"
[PLAN]: https://github.com/byronwall/explorEDA/pull/136 "Merged advanced scatter and compact DSL plans; explicitly no application changes; metadata read"
[PLOT]: https://github.com/byronwall/explorEDA/blob/362db58082df9c1b57c2305a49823a1dae385081/packages/explorEDA/src/components/PlotManager.tsx "Targeted search confirms onShowChart wiring in Charts and Rows; not full-file review"
[REG]: https://github.com/byronwall/explorEDA/blob/362db58082df9c1b57c2305a49823a1dae385081/packages/explorEDA/src/charts/registerAllCharts.ts "18 explicit active chart registrations"
[ROLL]: https://github.com/byronwall/explorEDA/blob/362db58082df9c1b57c2305a49823a1dae385081/packages/explorEDA/src/lib/dailyRollup.ts "UTC period boundaries, grouped reduction, source contributor retention"
[T02]: https://github.com/byronwall/explorEDA/blob/362db58082df9c1b57c2305a49823a1dae385081/docs/transcripts/2026-06-25-table-column-controls.txt "Complete original transcript read; date is filename date, not an invented internal timestamp"
[T04]: https://github.com/byronwall/explorEDA/blob/362db58082df9c1b57c2305a49823a1dae385081/docs/transcripts/2026-06-26-interactive-data-table-rows.txt "Complete original transcript read; date is filename date, not an invented internal timestamp"
[T05]: https://github.com/byronwall/explorEDA/blob/362db58082df9c1b57c2305a49823a1dae385081/docs/transcripts/2026-06-26-rich-data-inside-table-cells.txt "Complete original transcript read; date is filename date, not an invented internal timestamp"
[T07]: https://github.com/byronwall/explorEDA/blob/362db58082df9c1b57c2305a49823a1dae385081/docs/transcripts/2026-06-29-date-filtering-patterns.txt "Complete original transcript read; date is filename date, not an invented internal timestamp"
[T08]: https://github.com/byronwall/explorEDA/blob/362db58082df9c1b57c2305a49823a1dae385081/docs/transcripts/2026-06-29-saved-table-views-and-formatting.txt "Complete original transcript read; date is filename date, not an invented internal timestamp"
[T09]: https://github.com/byronwall/explorEDA/blob/362db58082df9c1b57c2305a49823a1dae385081/docs/transcripts/2026-06-29-data-table-defaults-and-schemas.txt "Complete original transcript read; date is filename date, not an invented internal timestamp"
[T11]: https://github.com/byronwall/explorEDA/blob/362db58082df9c1b57c2305a49823a1dae385081/docs/transcripts/2026-07-26-data-visualization-system-design.txt "Complete original transcript read; date is filename date, not an invented internal timestamp"
[T12]: https://github.com/byronwall/explorEDA/blob/362db58082df9c1b57c2305a49823a1dae385081/docs/transcripts/2026-07-28-dashboarding-filtering-and-chart-defaults.txt "Complete original transcript read; date is filename date, not an invented internal timestamp"
[T15]: https://github.com/byronwall/explorEDA/blob/362db58082df9c1b57c2305a49823a1dae385081/docs/transcripts/2026-08-02-visualization-traceability-and-dataflow.txt "Complete original transcript read; date is filename date, not an invented internal timestamp"
[T16]: https://github.com/byronwall/explorEDA/blob/362db58082df9c1b57c2305a49823a1dae385081/docs/transcripts/2026-08-03-spec-driven-interactive-visualization.txt "Complete original transcript read; date is filename date, not an invented internal timestamp"
[T17]: https://github.com/byronwall/explorEDA/blob/362db58082df9c1b57c2305a49823a1dae385081/docs/transcripts/2026-08-04-chart-specs-grouping-and-derived-layers.txt "Complete original transcript read; date is filename date, not an invented internal timestamp"
[TABLE]: https://github.com/byronwall/explorEDA/blob/362db58082df9c1b57c2305a49823a1dae385081/packages/explorEDA/src/components/charts/DataTable/DataTable.tsx "Active table wiring: distributions, context menu, derived values and virtual body"
[THDR]: https://github.com/byronwall/explorEDA/blob/362db58082df9c1b57c2305a49823a1dae385081/packages/explorEDA/src/components/charts/DataTable/DataTableHeader.tsx "Header dragging, typed filters, two-state header sort and keyboard width control; main implementation read"
[TMENU]: https://github.com/byronwall/explorEDA/blob/362db58082df9c1b57c2305a49823a1dae385081/packages/explorEDA/src/components/charts/DataTable/DataTableContextMenu.tsx "Clear sort, hide/recover/move columns, reset width, copy and cell filters"
