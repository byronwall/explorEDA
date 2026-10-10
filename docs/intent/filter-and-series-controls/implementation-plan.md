---
title: "Filter a workspace without a chart — implementation plan"
slug: "filter-and-series-controls"
phase: plan
status: draft
last_updated: "2026-10-10"
---

# Filter a workspace without a chart — implementation plan

## Plan at a glance

Build in three steps, each leaving a working product:

1. **Workspace filters work end to end, plainly.** The data layer gets a workspace filter owner. The active filter bar gets a basic **Add filter** popover and a chip. Saves keep the filter. This answers the main question: does a workspace filter narrow every view exactly like a chart's linked filter?
2. **The filter bar feels good.** Keyboard flow, focus, live preview with one undo step, the field's full distribution while editing, narrow layouts, and copy that stops saying "chart filters" where it now means all linked filters.
3. **Dashboard text and release.** A `filter` line, so applying text keeps the filter, plus docs and a changeset.

One change from the shape: each filtered field gets **its own crossfilter dimension** (`workspace:<field>`), not one shared dimension. Crossfilter already ignores a dimension's own filter when it reports counts, which is how charts keep their full shape. Per-field dimensions give the editor the same thing for free: while you edit Region, the Region control still shows every region, narrowed only by the *other* filters. This also fits one filter per field.

The work has no external dependency. Everything runs in Vitest and the demo dev server.

## Implementation strategy

- **First proof:** A Region filter added from the filter bar narrows every chart and the row count exactly as a chart's `select.Region` filter on the same values, and it survives a reload.
- **Primary seam:** `CrossfilterWrapper.setWorkspaceFilters(filters)`, with a matching `setWorkspaceFilter(field, filter?)` action in the data layer. Charts, the registry, and chart definitions do not change.
- **Fast local loop:** `pnpm --filter exploreda exec vitest run src/hooks/CrossfilterWrapper.test.ts src/test/providers/DataLayerProvider.test.tsx src/components/ActiveFilterStatus.test.tsx`, then `pnpm --filter exploreda check-types`. Browser checks use `pnpm --filter demo dev` with a demo dataset that has a categorical field and a date field.
- **Rollout and rollback:** Everything is additive. `workspaceFilters` is optional in the save format, so older saves load with none. Removing the **Add filter** button turns off the entry point; a saved filter would still apply and can still be cleared from its chip or with Clear all.

## Milestone 1: A workspace filter narrows every view

This is the smallest slice that proves the model. The UI is deliberately plain; milestone 2 polishes it.

- **Change — Workspace dimensions in `hooks/CrossfilterWrapper.ts`**
  - Keep a map from field to dimension, separate from `charts`. `setWorkspaceFilters` adds, updates, and disposes dimensions to match the list.
  - The predicate is `applyFilter(values[id], filter)`, with `values = fieldGetter(field)` looked up once per update, not once per row.
  - `getAllData`, `getFilteredRowIds`, and `getFilteredRowCount` include these dimensions automatically, because crossfilter applies every dimension.
  - Tests in `CrossfilterWrapper.test.ts`: the filtered IDs match a chart-owned value filter on the same field. Removing the filter restores every row. Value, number range, and date range filters work. It still works with more than 32 dimensions in total.
- **Change — State and save format in `providers/DataLayerProvider.tsx` and `types/SavedDataStructure.ts`**
  - Add `workspaceFilters: Filter[]` to the store and `workspaceFilters?: Filter[]` to `SavedDataStructure`. Load and restore treat a missing list as `[]`. `saveToStructure` writes the list only when it has filters, so existing fingerprints and saves don't change. `validateSavedData` in `utils/saveDataUtils.ts` checks the list.
  - `setWorkspaceFilter(field, filter?)` replaces that field's filter or removes it. There is never more than one per field.
  - `clearAllFilters` empties the list. A new import resets it. Removing a field drops its workspace filter, as the Rows filters are dropped now.
  - Tests in `DataLayerProvider.test.tsx`: save and restore, an older save without the field, Clear all, field removal, and a workspace with no charts, where the row count and Rows still narrow. `useFilteredFieldProfiles` takes a shortcut when there are no charts (`hasCharts`), so it must count workspace filters too.
- **Change — Plain entry and chip in `components/ActiveFilterStatus.tsx`**
  - Add an **Add filter** button after the row count. It shows even when no filters are active. It opens a popover with `FieldSelector` and then an embedded `ColumnFilter`, the same pairing as `ChartRowsFilters` in `FiltersSettingsTab.tsx`.
  - Workspace chips come first and read `Workspace · <filter label>`. Clicking a chip reopens its control; × calls `setWorkspaceFilter(field)`.
  - Tests in `ActiveFilterStatus.test.tsx`: add, edit, and remove; the chip label; Clear all.

### Desired end state

- In the demo, with no new chart, Region = West narrows every chart and the row count. The numbers match a bar chart's `select.Region=West`.
- The chip names the workspace. Both × and Clear all restore every row. A reload keeps the filter.
- Older saves and the demo's saved layouts load unchanged.

## Milestone 2: The filter bar feels right

This is where the bar has to feel good, so the browser is the main check here, not unit tests.

- **Change — The add flow**
  - **Add filter** has visible text at wide widths. At narrow widths it is an icon with a tooltip. It never moves into the "+N more" overflow.
  - Opening the popover focuses the field search. Typing filters the list, arrows move, and Enter picks. Fields show `FieldMetadata`. A field that already has a workspace filter is marked, and picking it opens that filter: one filter per field, edited in place.
  - Escape or a click outside closes the popover. Focus goes back to **Add filter**, or to the chip for an edit.
- **Change — Live edits, one undo step**
  - Charts and the row count update while the control changes. `holdStateChanges` holds the change while the popover is open and releases it on close, so the host sees one `onStateChange` per edit.
  - A filter left empty when the popover closes is removed rather than saved as an inactive chip.
- **Change — The field's full distribution while editing**
  - Extend `useFilteredFieldProfiles` so it can leave out a workspace field's own dimension, the way it leaves out a chart's own filters. The Region control then lists every region the other filters allow, not only the ones already chosen.
- **Change — Copy that matches the new scope**
  - In the filter bar, the section label "Active chart filters", the row count tooltip "Rows that pass every chart filter", and the Clear all tooltip should say "filters", and name the workspace where it helps.
  - Trace and plan text that says "after other charts' filters" should say "after other filters". This appears in `barPlan`, `ecdfPlan`, `sankeyPlan`, `matrixPlan`, `hexPlan`, `MatrixTraceBody`, and `useCompositionData`. Chart trace details should name the workspace filters that excluded a mark.
- **Change — Layouts and themes**
  - Check at 1280, 783, and 390 px; in light and dark; and in Compact, Newsprint, and Report. Check the status bar and the Rows drawer's copy of the bar. In a read-only preview, the status bar is inert, so **Add filter** cannot be used. Confirm that.

### Desired end state

- With the keyboard only, Byron can add a Region filter, add a date range, edit the first filter, and remove both, without the popover hiding the charts that change.
- One edit session reaches the host as one undo step.
- At 390 px, the bar keeps **Add filter**, the row count, and Clear all visible, and the other chips go to the overflow popover.

## Milestone 3: Dashboard text, docs, and release

Dashboard text replaces the whole dashboard. Until it can express workspace filters, applying edited text drops them, so this milestone ships with the feature, not after it.

- **Change — A `filter` line in `lib/dsl/`**
  - The text form is one line per field, written the way the filter reads: `filter Region=West,East`, `filter "Order Date"=2024-01-01..2024-03-31`, `filter Notes.contains=late`. Values use the same forms as `where.`.
  - `compile.ts` adds `filter` to `DSL_OTHER_KEYWORDS`. It belongs to a view, not to `SHARED_KEYWORDS`. Its pairs go straight to the existing `buildFilter`, which already takes a bare field path. A second `filter` line for the same field replaces the first and reports a warning, matching one filter per field.
  - `export.ts` writes one `filter` line per workspace filter, through a version of `filterPairs` that leaves off the prefix. `describe.ts` lists `filter <field>=...` under Filters as "narrows every chart, owned by no chart". `views.ts` keeps the line with its view.
  - Tests in `compile.test.tsx` and `export.test.ts`: round trips for value, range, date, and text filters; a field name with spaces; the duplicate-field warning. Text without a `filter` line clears workspace filters, the same rule as other omitted settings.
- **Change — Docs and changeset**
  - Add workspace filters to `docs/application-feature-inventory.md`, and the filter bar entry to `docs/ui-defaults.md` if that page covers the bar.
  - Run `pnpm changeset:add minor "Add a workspace filter from the active filter bar: narrow every chart by a field without creating a chart. Filters save with the view and appear in dashboard text as filter <field>=…"`.
  - Run `pnpm check:ui`, then run `pnpm check` once before the PR. Include screenshots at each width.

### Desired end state

- Exporting a workspace with a workspace filter, then applying the text unchanged, keeps the filter and leaves the counts the same.
- The changeset and feature inventory describe the feature, and `pnpm check` passes.

## Below the cut line

- "Filter workspace by this field" in the field list and column header menus, after the bar has been used for a while.
- Moving a chart filter or a Rows search into the workspace.
- Named segments, or filters that apply across saved views.
- Turning a workspace filter off without removing it.
- Several filters on one field, or combining filters with OR.
