---
id: page-hide-or-isolate-a-series-from-the-legend
label: Hide or isolate a series from the legend
type: page
status: planned
metadata:
  purpose: "Small, self-contained task: legend toggles that hide or isolate line and time-series series without filtering records."
---
Hide a line or show only one line from the chart's legend, without changing which records the chart counts. Split from the **Filter a workspace and control series deliberately** initiative (`docs/intent/filter-and-series-controls/`), which now covers only workspace filters.

## Behavior

- Each series in the legend is a toggle button. Click, Enter, or Space hides or shows that series. Alt-click (or a context-menu item) shows only that series; doing it again shows all series.
- A hidden series stays in the legend, dimmed and struck through, so the user can bring it back. Its tooltip says hiding changes the display only.
- Hiding never adds a filter. Row counts, the active filter bar, linked charts, and the chart trace stay the same.
- The hidden set saves with the chart, so it survives reload and is one undo step per toggle. Hiding every series shows an empty-state note with **Show all**.
- Stacked time series: a hidden series leaves the stack, and the remaining bands restack. The axis label or legend notes that the stack excludes hidden series. Do not change a share-of-total denominator silently.
- Filtering to a series stays a separate, named action (the chart's own selection), never the legend toggle.

## Where it lives

- `components/charts/LineChart/TimeSeriesChart.tsx`: the legend (around line 221) renders static `<span>` labels. The legend is skipped when `colorField === time.splitField` with a shared `colorScaleId`; decide whether that shared legend gets the same toggle or stays as is.
- `components/charts/LineChart/LineChart.tsx`: the raw line legend (`eda-line-legend`, around line 364) has pointer-only hover emphasis. Give it the same toggle and keyboard path.
- `timeSeriesPlan.ts` builds `plan.series` and the stack; apply the hidden set there so restacking and incomplete-period notes stay correct.
- Add the saved setting (for example `hiddenSeries: string[]`) to the line definition, settings compatibility, and DSL export so dashboard text round-trips it.
- Related: `page-edit-legend-and-series-names-in-place` edits names in the same legend. Keep double-click for rename and single click for visibility.

## Done when

- Tests beside `TimeSeriesChart.test.tsx` and `LineChart.test.tsx` cover toggle by click and keyboard, show-only, show all, saved state, unchanged row IDs and filter state, and restacking.
- Browser check with real mouse and keyboard input at 1280, 783, and 390 px, in light and dark.
- `docs/application-feature-inventory.md` lists legend visibility for line and time-series charts.
- Changeset: `minor`, "Hide or show only one series from a line or time-series legend without filtering records."

