---
title: "Interactive EDA workspace — implementation plan"
slug: "interactive-eda-workspace"
phase: plan
status: current
last_updated: "2026-09-15"
---

# Interactive EDA workspace — implementation plan

## Plan at a glance

Build one complete source-inspection path before adding more chart features. A user should load rows and get a useful workspace without configuration. The first view should show field profiles and source rows. This proves the public package boundary and gives every later filter a clear home.

Next, use the same field profile to choose table filter controls. Keep filters in the existing chart settings and `CrossfilterWrapper`. Do not add a second global filter store. Show all active filters above the workspace by deriving them from current chart state.

Last, add one public state-change callback. The demo will capture that state and restore it after a remount. The package will not own storage. This proves a usable consumer API without adding accounts, projects, or a persistence system.

The current 3D WebGL repairs are not part of this path. None of these milestones need the `ThreeDScatter` files.

## Implementation strategy

- **First proof:** Load Palmer Penguins through `ExplorEda` with no saved state. See a field summary and data table at once.
- **Primary seam:** `ExplorEda` accepts rows and optional saved state. It emits serializable workspace state through one callback.
- **Fast local loop:** Run `pnpm --filter exploreda test` and `pnpm --filter demo build`. Use the demo for the visible check.
- **Local dependencies:** Static CSV files and one fixed-seed synthetic fixture. No network is required.
- **Live confirmation:** None. This slice has no external service.
- **Rollout and rollback:** Each milestone changes the default package path. Revert the milestone commit if its proof fails.

Use existing chart definitions, filter types, and package exports. Add no table engine, data adapter, worker, or persistence dependency.

## Milestone 1: Loaded rows become an inspection workspace

This milestone fixes the empty first-use state. It also creates one shared source of field facts. It excludes filter redesign and durable host state.

- **Change — Add purposeful fixtures to the demo.**
  - Keep Palmer Penguins and UCI red wine quality in `apps/demo/public/datasets`.
  - Extend the current sample generator with one fixed-seed shop operations dataset.
  - Generate about 500 rows. Include dates, categories, booleans, nulls, skew, seasonality, and clear outliers.
  - Add Palmer Penguins and shop operations to `apps/demo/src/demos/examples.ts`.
  - Do not add a dataset catalog or download system.
  - Verify that `parseCsvData` loads each file with the expected row and field counts.

- **Change — Create one pure field-profile function.**
  - Reuse the current type detection and statistics logic from `components/SummaryTable/utils`.
  - Return the field name, type, row count, null count, distinct count, numeric range, and small category summary.
  - Allow `null` at the source-data boundary because parsed CSV fields can contain it.
  - Compute profiles when source rows change. Make them available through `DataLayerProvider`.
  - Replace the summary chart's private profile types and progressive timer queue.
  - Scan the full fixture first. Measure the FIFA sample before adding sampling or background work.
  - Add focused tests for mixed values, null-only fields, numeric strings, ISO dates, booleans, and empty rows.

- **Change — Use one default workspace builder.**
  - Use the existing summary and data-table chart definitions.
  - Create a summary chart and a table when rows exist and `savedData` is absent.
  - Give the table one column for each source field.
  - Use the same builder during initial store creation and `setData`.
  - Do not add defaults when saved state exists.
  - Test initial load, data replacement, empty rows, and saved-state precedence.

### Desired end state

- Palmer Penguins and shop operations open through the public package entry point.
- A loaded or uploaded file shows field facts and source rows without user setup.
- Summary and table field names come from the same field profiles.
- `pnpm --filter exploreda test` and `pnpm --filter demo build` pass.

## Milestone 2: Table filters match each field

This milestone proves the main analysis loop. It keeps the current filter model and crossfilter behavior. It excludes a universal query model and advanced table features.

- **Change — Replace the text-only table filter control.**
  - Read the field profile for each table column.
  - Use the existing `RangeFilter` for numeric minimum and maximum values.
  - Use the existing `ValueFilter` for categories and booleans.
  - Keep `TextFilter` for high-cardinality text.
  - Add a small date-range filter with ISO string bounds. Extend `applyFilter` and saved-state validation for this one type.
  - Keep controls inside the current column filter surface.
  - Add one test for each filter type and one combined-filter test.

- **Change — Show active filter state once.**
  - Derive active filters from current chart settings.
  - Show the remaining row count, original row count, and compact filter labels near the workspace toolbar.
  - Let users clear one filter or all filters.
  - Update the owning chart when one filter is cleared. Keep `clearAllFilters` for the global reset.
  - Do not move filters into a new global store.

- **Change — Verify connected behavior.**
  - Use shop operations for numeric and date ranges.
  - Use Palmer Penguins for species, island, and missing-value behavior.
  - Confirm that the summary, table, and one existing chart show the same remaining rows.
  - Confirm that clearing filters restores every view.

### Desired end state

- Each common scalar field gets a suitable filter control.
- Active filters and row counts remain visible outside chart panels.
- Table filters update other views through the existing crossfilter path.
- Focused filter tests and a desktop browser pass succeed.

## Milestone 3: A host can save and restore the workspace

This milestone proves the consumer boundary. It does not add a controlled component mode or package-owned persistence.

- **Change — Add one public state callback.**
  - Add `onStateChange?: (state: SavedDataStructure) => void` to `ExplorEda`.
  - Subscribe to meaningful store changes inside `DataLayerProvider`.
  - Emit charts, calculations, grid settings, metadata, and color scales.
  - Do not emit for derived caches, live-item nonces, or profile calculation.
  - Keep `savedData` as initial or replacement input. Do not add two-way controlled state.
  - Test one chart edit, one filter edit, and callback silence for derived changes.

- **Change — Prove restoration in the demo.**
  - Capture emitted state in the demo host.
  - Remount `ExplorEda` with the same rows and captured state.
  - Confirm charts, layout, filters, calculations, and color scales restore.
  - Keep the proof in demo memory or test storage. Do not add project management.

- **Change — Document the public path.**
  - Update the package README with the minimal rows, saved-state, callback, and CSS example.
  - Use only exports from `exploreda` in the demo.
  - Run the package build, type check, tests, lean-bundle check, and demo build.

### Desired end state

- A React host mounts the complete workspace with rows and optional saved state.
- The host receives serializable changes without importing package internals.
- A remount restores the same visible analysis.
- The package README describes the verified API.

## Cross-cutting verification

- Run `pnpm check` after each milestone when the 3D repair task has a clean worktree.
- Test the demo at 1280 by 720 pixels after each visible milestone.
- Test the final inspection and filter flow at 390 by 844 pixels.
- Keep one manual check for keyboard access to table filter controls.
- Do not use the large FIFA dataset as the normal development loop. Use it only for the field-profile timing check.

## Open decisions and spikes

- **Date inference threshold**
  - Decision output: the exact rule that marks a string field as a date.
  - Evidence: Palmer, shop operations, World Bank, and numeric-string fixtures.
  - Fallback: require all non-null sampled strings to parse as ISO-like dates.

- **Field-profile cost**
  - Decision output: full scan or deterministic sample for large sources.
  - Evidence: measured profile time for FIFA and World Bank in the browser.
  - Fallback: use the current deterministic sampling helper for type and distribution estimates.

## Below the cut line

- Multiple sources, joins, relationships, and source adapters.
- A general visualization grammar or traceability graph.
- Grouping, row selection, rich cells, column reordering, and virtual scrolling.
- Server loading, accounts, projects, and remote persistence.
- A dataset catalog, remote dataset downloads, or a generator framework.
- New WebGL or 3D chart behavior.
