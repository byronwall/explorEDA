# exploreda

## 0.2.0

### Minor Changes

- 6f3851f: Add a Calendar Heatmap chart type that shows a count, sum, or average for each UTC day of a year. Click a day to filter linked views to that date, Alt-click to see its rows, and step between years; narrow panels show one month at a time.
- 6762dfd: Add a field list to the workspace. Press Fields in the toolbar or the F key to search every field, see its range or distinct count for the filtered rows, expand a field for its distribution and the charts that use it, inspect it, add a chart, or put it on a chart axis from a menu or by dragging. Dragging near the top or bottom of the view scrolls the workspace. Expand the list, or press Shift+F, to see every field's distribution at once as a grid of cards.
- b99fa52: Add a Heatmap chart type that compares a count, sum, or average across two category fields. Click a cell to select that exact pair in linked views, Alt-click to see the rows behind it, and cells with no rows or no valid values are drawn distinctly.
- 59dd89c: Add a Parallel Coordinates chart that draws each row as one line across several numeric or category axes. Drag along any axis to select a range, combine ranges across axes, reorder axes by dragging their names, flip an axis, and click a line to trace its row.
- a637688: Add a Sankey chart that follows rows through two to six ordered category fields. Click a node or link to select it in linked views, Shift-click to add more values on a stage, and see the selected rows highlighted along every path; Alt-click a node or link to trace its rows.
- c6aa995: Add an ECDF chart that shows the share of rows at or below (or at or above) every observed value, without bins. Split it by a color field to compare groups fairly, click to select rows past a threshold or drag to select a span, and mark each curve's median and 90th percentile.
- b11c5cc: Add chart now opens a dialog where you pick a chart type and fields with a live preview. Add to grid then lets you choose where the chart goes, and Enter places it. Canceling adds nothing.
- d0530e5: Add metric cards for counts, sums, and averages that follow chart filters. Inspect the source rows and excluded values behind each result.
- 66dc636: Box plots no longer offer a bee swarm overlay. The violin overlay now shows distribution shape, and saved box plots that had bee swarm turned on still load.
- 6a841fb: Chart settings gain a Filters tab with a manual control for every filter a chart sets, replacing the Select tab. The scatter plot shows hovered values in the chart header instead of a box over the plot, and the chart details view uses a larger title.
- e23c148: Click a bar in a Summary Table sparkline to filter to its rows. The filter appears in the filter bar and clears with its × or the chart's clear-filter button; clicking the same bar again removes it.
- e3d7520: Click a filter chip in the filter bar to jump to the chart that set it. Only the chip's × removes the filter, and Rows filters say they apply only to Rows.
- 5977a8e: Clicking a bar in a grouped bar chart (count, sum, or average by group) now selects that group, so other views narrow to its rows. Alt-click still opens the bar's contributors.
- 1a232a5: Column filters for number and date fields show the field's distribution, which filters on click or drag, and number fields add a range slider. Switching between column filters no longer flickers: one popover moves between columns, and popovers close without an exit animation.
- 82cdb5f: Data tables align number headers with their cells, show each column's type icon, and highlight the text a table search matched. The Rows view draws each field's distribution under its column name, and a data table chart can turn that on with the new showDistributions setting.
- c57c6ca: Data tables gain right-click menus on headers and cells (filter, sort, move, hide, copy), and columns drag by name to reorder or, dragged away from the header, to hide. The column picker now shows each field's type, counts, and distribution, and data table settings use the same picker in place of column pills.
- 896cf8f: Drag across a Summary Table or field list sparkline to filter to a range, and click a Missing count or choose Only missing values in a column filter to see rows without a value. The field list now shows distinct and missing counts with a filterable distribution for each field, date distributions bin by whole days, weeks, months, quarters, or years, and tables show a small null marker for missing cells.
- 860a1e1: The field inspector opens on a Values tab with a histogram or category counts that compare rows after chart filters with all rows, and it opens from any chart axis title with Command-click or the context menu. Filter chips, field details, and pivot cells now use each field's label, format, and unit, and pivot counts show plain row counts.
- 36ed832: Pass a ref to `ExplorEda` and call `ref.current.getSettings()` to read the current workspace settings at any time, including right after mount without `savedData`. A new Chart spec tab in workspace settings shows what each chart saves: its fields, place in the grid, filters, settings as a list or copyable JSON, and the calculations, color scales, and grouped summaries it references.
- 9d3a60f: Notes now edit like a block editor: type / to insert headings, lists, quotes, code, or dividers, and select text to format it from a small toolbar. The always-visible control bar is gone.
- 6245226: Press ? in the workspace, or choose Keyboard shortcuts from the workspace menu, to see every keyboard shortcut.
- 15dd22d: Scatter plots now accept categorical fields on either axis: each category gets a band with jittered points, and brushing a band filters by category. A scatter with nothing to draw now says why instead of staying blank.
- bf69f3d: The Rows drawer has a narrow size beside its expanded one. Narrow keeps the charts visible and in use next to the rows, and a click on a chart no longer closes it.
- 7fd14a7: The workspace header is now a single sticky line: icon buttons with tooltips, filter chips that collapse into a "+N more" popover, Rows as a quick peek (press R), and Calculations in a dialog instead of separate tabs.
- 5c92e32: Tooltips open only on hover, so closing Rows does not show hover help when focus returns.

  Placing a new chart on an occupied spot now previews the charts that would move down, and applies the moves only when you accept. A chart's expand action opens a details view with the chart beside its settings and a Chart data tab. View data, Duplicate, and Delete are icons in each chart header, and chart settings hold settings only. Rows opens as a full-height drawer, calculations, colors, and grid share one floating settings panel with tabs, and confirmations are compact.

- b10f562: Use S, D, and X on a hovered chart to open settings, duplicate it, or delete it with confirmation. V shows its data, and C clears its filters.

### Patch Changes

- 08474ef: A chart now shows a ring while its settings are open, and the settings popover uses the same accent, so it is clear which chart you are editing.
- 33b04da: A data table with an active search now shows the search as a chip in its chart header, with a button to clear it.
- c440001: Bar charts of whole-number fields now center each bin on the integers it covers, so bars no longer leave empty gaps between values or sit between axis ticks.
- 167ec9c: Box plot outlier dots no longer draw a blue outline.
- df8efb7: Box plots no longer show a color legend above the chart. Each box is already colored and labeled on the category axis.
- bc088f9: Charts can expand from the right edge even when another chart touches them.
- 3f16a73: Clicking a pivot table value opens its source-row inspector, replacing the repeated Inspect links.
- 6138a4a: Closing the field list no longer pops up the Fields button tooltip.
- eac45b4: Grid lines no longer show a redundant hover readout or turn blue on normal hover. They turn blue when Alt is held for trace on click, and their accessible names identify the field and value.
- cc922b0: Histogram brush filters now snap to bar edges, so a filter never splits a bar and every bar inside it is colored. A range filter moves to the nearest edges when the bin count changes.
- c0dd3ad: Show calculations as compact cards in a narrow settings panel, keep the calculation search icon clear of typed text, and close chart details after dismissing a confirmation.
- 88e80c4: Scatter plot calculated-field badges now sit after the full axis title, so they no longer overlap longer titles such as those ending in "· symlog".
- 8101d1e: Scatter plots now pad symmetric-log axes below the minimum as well as above the maximum, and give a constant field a visible span, so edge points are no longer clipped at the plot border.
- 3ffec8d: The active sort arrow in a data table header stays visible beside the column actions.
- 54c3810: The scatter trace popover now reads top to bottom: filter status, source values, how each visual channel is drawn, and hover text, with scale and canvas details collapsed.
- cff6cc0: The workspace no longer draws a focus ring around the whole chart grid. Tabbing past the view controls now moves straight to the first chart.

## 0.1.0

### Minor Changes

- 9435727: First release since 0.0.6. The package now matches the demo site and README:

  - Open a dataset in a workspace that starts with a summary and rows, then add charts.
  - Summary table with aligned columns, inline distributions, and missing counts.
  - Facet focus controls and a facet picker.
  - Click-to-trace on scatter and bar charts, with a shared trace panel and find-row.
  - Field settings, grouped summaries, and calculation inspection.
  - One numeric rule for blanks and non-finite values across every view.
  - Restorable workspace state and full analysis JSON export.

## 0.0.6

### Patch Changes

- 1a33bdb: Bring back the TipTap editor without the extra cruft
- cbe70b7: Improve styles on components and start to wire up better padding and margins

## 0.0.5

### Patch Changes

- 80fc10a: Change name one last time - drop the @byronwallrus

## 0.0.4

### Patch Changes

- 817ad1b: Force name to be all lowercase

## 0.0.3

### Patch Changes

- be1f29d: Change name and update everywhere

## 0.0.2

### Patch Changes

- 819a7bc: Adding changesets and GH action to publish
