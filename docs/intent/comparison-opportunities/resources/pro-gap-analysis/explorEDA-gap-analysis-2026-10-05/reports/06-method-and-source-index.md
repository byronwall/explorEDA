# Method, provenance and source index

**Read-only audit · October 5, 2026 · byronwall/explorEDA**  
**Revision:** `362db58082df9c1b57c2305a49823a1dae385081`  
**Fresh application browser tests:** 0 completed; navigation blocked by administrator policy.

## Evidence classes and reading limits

This audit used five different kinds of evidence and does not collapse them. Direct source reads establish implementation structure; repository documents describe claimed behavior; repository-authored browser reports supply historical claims; independent Python comparisons establish data oracles; actual browser probes establish only environment blocking. No class substitutes for current application-browser proof.

Pinned links below refer to the reviewed commit unless a PR or Actions URL is naturally a separate resource. Sources with partial reads or targeted searches explicitly say so. Every transcript was read in full. Not every implementation file or test in the repository was reviewed, and no full-source local build was performed.

## Sources

### BASE

**Locator:** `docs/transcript-gap-analysis.md`.

Original transcript reconciliation; mixed-age September baseline with later edits.

[Open source](https://github.com/byronwall/explorEDA/blob/362db58082df9c1b57c2305a49823a1dae385081/docs/transcript-gap-analysis.md).

### INV

**Locator:** `docs/application-feature-inventory.md`.

Feature inventory selectively updated October 4; explicitly not a full re-audit.

[Open source](https://github.com/byronwall/explorEDA/blob/362db58082df9c1b57c2305a49823a1dae385081/docs/application-feature-inventory.md).

### CHART

**Locator:** `docs/analytical-chart-coverage.md`.

Current chart contracts, boundaries, and verification waiver.

[Open source](https://github.com/byronwall/explorEDA/blob/362db58082df9c1b57c2305a49823a1dae385081/docs/analytical-chart-coverage.md).

### COV

**Locator:** `apps/demo/src/demos/coverage.ts`.

Complete feature and example coverage manifest; four source ranges reviewed.

[Open source](https://github.com/byronwall/explorEDA/blob/362db58082df9c1b57c2305a49823a1dae385081/apps/demo/src/demos/coverage.ts).

### COVTEST

**Locator:** `apps/demo/src/demos/coverage.test.ts`.

Registry and example equality checks, evidence validation tests.

[Open source](https://github.com/byronwall/explorEDA/blob/362db58082df9c1b57c2305a49823a1dae385081/apps/demo/src/demos/coverage.test.ts).

### COVUI

**Locator:** `apps/demo/src/CoverageMatrix.tsx`.

Coverage summary, attention predicate, matrix and example UI.

[Open source](https://github.com/byronwall/explorEDA/blob/362db58082df9c1b57c2305a49823a1dae385081/apps/demo/src/CoverageMatrix.tsx).

### HOST

**Locator:** `apps/demo/src/LandingPage.tsx`.

Development-only matrix gate; host import, restore, state capture.

[Open source](https://github.com/byronwall/explorEDA/blob/362db58082df9c1b57c2305a49823a1dae385081/apps/demo/src/LandingPage.tsx).

### REG

**Locator:** `packages/explorEDA/src/charts/registerAllCharts.ts`.

18 explicit active chart registrations.

[Open source](https://github.com/byronwall/explorEDA/blob/362db58082df9c1b57c2305a49823a1dae385081/packages/explorEDA/src/charts/registerAllCharts.ts).

### NUM

**Locator:** `packages/explorEDA/src/lib/numeric.ts`.

Missing-value and finite-numeric eligibility rules.

[Open source](https://github.com/byronwall/explorEDA/blob/362db58082df9c1b57c2305a49823a1dae385081/packages/explorEDA/src/lib/numeric.ts).

### FILTER

**Locator:** `packages/explorEDA/src/components/ActiveFilterStatus.tsx`.

Owner navigation, highlight, formatting, local scope and reset.

[Open source](https://github.com/byronwall/explorEDA/blob/362db58082df9c1b57c2305a49823a1dae385081/packages/explorEDA/src/components/ActiveFilterStatus.tsx).

### PLOT

**Locator:** `packages/explorEDA/src/components/PlotManager.tsx`.

Targeted search confirms onShowChart wiring in Charts and Rows; not full-file review.

[Open source](https://github.com/byronwall/explorEDA/blob/362db58082df9c1b57c2305a49823a1dae385081/packages/explorEDA/src/components/PlotManager.tsx).

### ROLL

**Locator:** `packages/explorEDA/src/lib/dailyRollup.ts`.

UTC period boundaries, grouped reduction, source contributor retention.

[Open source](https://github.com/byronwall/explorEDA/blob/362db58082df9c1b57c2305a49823a1dae385081/packages/explorEDA/src/lib/dailyRollup.ts).

### TABLE

**Locator:** `packages/explorEDA/src/components/charts/DataTable/DataTable.tsx`.

Active table wiring: distributions, context menu, derived values and virtual body.

[Open source](https://github.com/byronwall/explorEDA/blob/362db58082df9c1b57c2305a49823a1dae385081/packages/explorEDA/src/components/charts/DataTable/DataTable.tsx).

### THDR

**Locator:** `packages/explorEDA/src/components/charts/DataTable/DataTableHeader.tsx`.

Header dragging, typed filters, two-state header sort and keyboard width control; main implementation read.

[Open source](https://github.com/byronwall/explorEDA/blob/362db58082df9c1b57c2305a49823a1dae385081/packages/explorEDA/src/components/charts/DataTable/DataTableHeader.tsx).

### TMENU

**Locator:** `packages/explorEDA/src/components/charts/DataTable/DataTableContextMenu.tsx`.

Clear sort, hide/recover/move columns, reset width, copy and cell filters.

[Open source](https://github.com/byronwall/explorEDA/blob/362db58082df9c1b57c2305a49823a1dae385081/packages/explorEDA/src/components/charts/DataTable/DataTableContextMenu.tsx).

### REVIEW

**Locator:** `docs/reviews/2026-10-02-example-coverage.md`.

Repository-authored historical browser review of 37 assignments in 7 examples.

[Open source](https://github.com/byronwall/explorEDA/blob/362db58082df9c1b57c2305a49823a1dae385081/docs/reviews/2026-10-02-example-coverage.md).

### PKG

**Locator:** `packages/explorEDA/package.json`.

Library scripts and exports; lines 1–130 inspected.

[Open source](https://github.com/byronwall/explorEDA/blob/362db58082df9c1b57c2305a49823a1dae385081/packages/explorEDA/package.json).

### README

**Locator:** `README.md`.

Public integration, current chart contracts and desktop scope.

[Open source](https://github.com/byronwall/explorEDA/blob/362db58082df9c1b57c2305a49823a1dae385081/README.md).

### ARCHIVE

**Locator:** `docs/transcripts/README.md`.

20 copied voice memos, provenance and excluded non-requirement recordings.

[Open source](https://github.com/byronwall/explorEDA/blob/362db58082df9c1b57c2305a49823a1dae385081/docs/transcripts/README.md).

### T01

**Locator:** `docs/transcripts/2026-06-25-interactive-data-table-explorer.txt`.

Complete original transcript read; date is filename date, not an invented internal timestamp.

[Open source](https://github.com/byronwall/explorEDA/blob/362db58082df9c1b57c2305a49823a1dae385081/docs/transcripts/2026-06-25-interactive-data-table-explorer.txt).

### T02

**Locator:** `docs/transcripts/2026-06-25-table-column-controls.txt`.

Complete original transcript read; date is filename date, not an invented internal timestamp.

[Open source](https://github.com/byronwall/explorEDA/blob/362db58082df9c1b57c2305a49823a1dae385081/docs/transcripts/2026-06-25-table-column-controls.txt).

### T03

**Locator:** `docs/transcripts/2026-06-25-interactive-data-table-controls.txt`.

Complete original transcript read; date is filename date, not an invented internal timestamp.

[Open source](https://github.com/byronwall/explorEDA/blob/362db58082df9c1b57c2305a49823a1dae385081/docs/transcripts/2026-06-25-interactive-data-table-controls.txt).

### T04

**Locator:** `docs/transcripts/2026-06-26-interactive-data-table-rows.txt`.

Complete original transcript read; date is filename date, not an invented internal timestamp.

[Open source](https://github.com/byronwall/explorEDA/blob/362db58082df9c1b57c2305a49823a1dae385081/docs/transcripts/2026-06-26-interactive-data-table-rows.txt).

### T05

**Locator:** `docs/transcripts/2026-06-26-rich-data-inside-table-cells.txt`.

Complete original transcript read; date is filename date, not an invented internal timestamp.

[Open source](https://github.com/byronwall/explorEDA/blob/362db58082df9c1b57c2305a49823a1dae385081/docs/transcripts/2026-06-26-rich-data-inside-table-cells.txt).

### T06

**Locator:** `docs/transcripts/2026-06-28-table-filtering-and-distributions.txt`.

Complete original transcript read; date is filename date, not an invented internal timestamp.

[Open source](https://github.com/byronwall/explorEDA/blob/362db58082df9c1b57c2305a49823a1dae385081/docs/transcripts/2026-06-28-table-filtering-and-distributions.txt).

### T07

**Locator:** `docs/transcripts/2026-06-29-date-filtering-patterns.txt`.

Complete original transcript read; date is filename date, not an invented internal timestamp.

[Open source](https://github.com/byronwall/explorEDA/blob/362db58082df9c1b57c2305a49823a1dae385081/docs/transcripts/2026-06-29-date-filtering-patterns.txt).

### T08

**Locator:** `docs/transcripts/2026-06-29-saved-table-views-and-formatting.txt`.

Complete original transcript read; date is filename date, not an invented internal timestamp.

[Open source](https://github.com/byronwall/explorEDA/blob/362db58082df9c1b57c2305a49823a1dae385081/docs/transcripts/2026-06-29-saved-table-views-and-formatting.txt).

### T09

**Locator:** `docs/transcripts/2026-06-29-data-table-defaults-and-schemas.txt`.

Complete original transcript read; date is filename date, not an invented internal timestamp.

[Open source](https://github.com/byronwall/explorEDA/blob/362db58082df9c1b57c2305a49823a1dae385081/docs/transcripts/2026-06-29-data-table-defaults-and-schemas.txt).

### T10

**Locator:** `docs/transcripts/2026-07-13-reusable-interactive-component-requirements.txt`.

Complete original transcript read; date is filename date, not an invented internal timestamp.

[Open source](https://github.com/byronwall/explorEDA/blob/362db58082df9c1b57c2305a49823a1dae385081/docs/transcripts/2026-07-13-reusable-interactive-component-requirements.txt).

### T11

**Locator:** `docs/transcripts/2026-07-26-data-visualization-system-design.txt`.

Complete original transcript read; date is filename date, not an invented internal timestamp.

[Open source](https://github.com/byronwall/explorEDA/blob/362db58082df9c1b57c2305a49823a1dae385081/docs/transcripts/2026-07-26-data-visualization-system-design.txt).

### T12

**Locator:** `docs/transcripts/2026-07-28-dashboarding-filtering-and-chart-defaults.txt`.

Complete original transcript read; date is filename date, not an invented internal timestamp.

[Open source](https://github.com/byronwall/explorEDA/blob/362db58082df9c1b57c2305a49823a1dae385081/docs/transcripts/2026-07-28-dashboarding-filtering-and-chart-defaults.txt).

### T13

**Locator:** `docs/transcripts/2026-07-28-data-transforms-loading-and-source-tables.txt`.

Complete original transcript read; date is filename date, not an invented internal timestamp.

[Open source](https://github.com/byronwall/explorEDA/blob/362db58082df9c1b57c2305a49823a1dae385081/docs/transcripts/2026-07-28-data-transforms-loading-and-source-tables.txt).

### T14

**Locator:** `docs/transcripts/2026-07-29-faceting-and-shared-scales.txt`.

Complete original transcript read; date is filename date, not an invented internal timestamp.

[Open source](https://github.com/byronwall/explorEDA/blob/362db58082df9c1b57c2305a49823a1dae385081/docs/transcripts/2026-07-29-faceting-and-shared-scales.txt).

### T15

**Locator:** `docs/transcripts/2026-08-02-visualization-traceability-and-dataflow.txt`.

Complete original transcript read; date is filename date, not an invented internal timestamp.

[Open source](https://github.com/byronwall/explorEDA/blob/362db58082df9c1b57c2305a49823a1dae385081/docs/transcripts/2026-08-02-visualization-traceability-and-dataflow.txt).

### T16

**Locator:** `docs/transcripts/2026-08-03-spec-driven-interactive-visualization.txt`.

Complete original transcript read; date is filename date, not an invented internal timestamp.

[Open source](https://github.com/byronwall/explorEDA/blob/362db58082df9c1b57c2305a49823a1dae385081/docs/transcripts/2026-08-03-spec-driven-interactive-visualization.txt).

### T17

**Locator:** `docs/transcripts/2026-08-04-chart-specs-grouping-and-derived-layers.txt`.

Complete original transcript read; date is filename date, not an invented internal timestamp.

[Open source](https://github.com/byronwall/explorEDA/blob/362db58082df9c1b57c2305a49823a1dae385081/docs/transcripts/2026-08-04-chart-specs-grouping-and-derived-layers.txt).

### T18

**Locator:** `docs/transcripts/2026-08-04-advanced-chart-specs-and-transforms.txt`.

Complete original transcript read; date is filename date, not an invented internal timestamp.

[Open source](https://github.com/byronwall/explorEDA/blob/362db58082df9c1b57c2305a49823a1dae385081/docs/transcripts/2026-08-04-advanced-chart-specs-and-transforms.txt).

### T19

**Locator:** `docs/transcripts/2026-08-25-deterministic-ui-templating.txt`.

Complete original transcript read; date is filename date, not an invented internal timestamp.

[Open source](https://github.com/byronwall/explorEDA/blob/362db58082df9c1b57c2305a49823a1dae385081/docs/transcripts/2026-08-25-deterministic-ui-templating.txt).

### T20

**Locator:** `docs/transcripts/2026-08-27-ui-complexity-and-component-boundaries.txt`.

Complete original transcript read; date is filename date, not an invented internal timestamp.

[Open source](https://github.com/byronwall/explorEDA/blob/362db58082df9c1b57c2305a49823a1dae385081/docs/transcripts/2026-08-27-ui-complexity-and-component-boundaries.txt).

### CLOSE

**Locator:** `pull/135`.

Merged documentation-only closure; waived cross-view comparisons and browser restores; metadata read.

[Open source](https://github.com/byronwall/explorEDA/pull/135).

### PLAN

**Locator:** `pull/136`.

Merged advanced scatter and compact DSL plans; explicitly no application changes; metadata read.

[Open source](https://github.com/byronwall/explorEDA/pull/136).

### TMP

**Locator:** `tmp/`.

Pinned directory listing contains only evals/; October 2 report screenshots at tmp root absent.

[Open source](https://github.com/byronwall/explorEDA/tree/362db58082df9c1b57c2305a49823a1dae385081/tmp).

### DEPLOY

**Locator:** `actions/runs/37259962552`.

Successful deploy and downloadable github-pages artifact 11324128490; metadata and archive inspected.

[Open source](https://github.com/byronwall/explorEDA/actions/runs/37259962552).

## Local evidence files

`evidence/browser-navigation-results.json` and B01–B03 screenshots are actual browser outputs. `evidence/artifact-provenance.json` records the downloaded build's identity and hashes; `evidence/deployment-build.zip` preserves that exact download. `data/independent-data-oracles.json` records independent CSV counts and source positions. `fixtures/` contains newly authored synthetic acceptance inputs. `data/coverage-*.json` is a transcription/recount of the reviewed manifest, not an app-generated state export.

The utilities in `browser/` and `data/` support reproduction but do not constitute completed exploratory application testing. Their output/result labels preserve that distinction.

---

Source labels link to the identified repository files or PR/run records. Full source locators and reading scope are in Report 06.


