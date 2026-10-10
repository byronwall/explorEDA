# exploreda

## 0.2.0

### Minor Changes

- 6f3851f: Add a Calendar Heatmap chart type that shows a count, sum, or average for each UTC day of a year. Click a day to filter linked views to that date, Alt-click to see its rows, and step between years; narrow panels show one month at a time.
- c615165: Add a Composition chart type: a blank artboard where you place and style title, subtitle, and note text, switch between edit and view modes, and save the layout with the workspace.
- 3f3c746: Add a density display to Scatter Plot. Count rows in fixed numeric bins, select their exact source records, and trace bin boundaries, exclusions, and colors.
- 6762dfd: Add a field list to the workspace. Press Fields in the toolbar or the F key to search every field, see its range or distinct count for the filtered rows, expand a field for its distribution and the charts that use it, inspect it, add a chart, or put it on a chart axis from a menu or by dragging. Dragging near the top or bottom of the view scrolls the workspace. Expand the list, or press Shift+F, to see every field's distribution at once as a grid of cards.
- b99fa52: Add a Heatmap chart type that compares a count, sum, or average across two category fields. Click a cell to select that exact pair in linked views, Alt-click to see the rows behind it, and cells with no rows or no valid values are drawn distinctly.
- 59dd89c: Add a Parallel Coordinates chart that draws each row as one line across several numeric or category axes. Drag along any axis to select a range, combine ranges across axes, reorder axes by dragging their names, flip an axis, and click a line to trace its row.
- a637688: Add a Sankey chart that follows rows through two to six ordered category fields. Click a node or link to select it in linked views, Shift-click to add more values on a stage, and see the selected rows highlighted along every path; Alt-click a node or link to trace its rows.
- 8c47788: Add a Schema diagram: a wide drawer that shows every table, field, and relationship as cards and lines, laid out to fit the screen. Single-table workspaces show their fields and calculated fields; ExplorEdaProject shows the project's sources and relationships, and its Schema panel can open the diagram.
- 8cdf475: Add a workspace filter from the active filter bar: choose a field and its values to narrow every chart, the row count, and Rows without creating a chart. Workspace filters save with the view.
- c6aa995: Add an ECDF chart that shows the share of rows at or below (or at or above) every observed value, without bins. Split it by a color field to compare groups fairly, click to select rows past a threshold or drag to select a span, and mark each curve's median and 90th percentile.
- bff8fb4: Add bubble sizing to Scatter Plot. Select and trace source rows, with proportional areas and a size scale that stays fixed during filtering.
- b11c5cc: Add chart now opens a dialog where you pick a chart type and fields with a live preview. Add to grid then lets you choose where the chart goes, and Enter places it. Canceling adds nothing.
- 0588bae: Add `compileDocument`, which builds a complete dashboard from compact text: field aliases and type checks, calculations, one chart per line with chart-local `where.` filters, and layout. Usable charts are built even when others fail, and every skipped or changed effect comes back as a located diagnostic with a suggested fix.
- 28864ed: Add exploreda/analysis: project definitions for related tables, a pure query evaluator that reports per-step counts and never guesses among ambiguous matches, and a validated project file format.
- 7cc13cc: Add ExplorEdaProject, a chart workspace over one query of a multi-table project. Its Schema panel previews and edits links between tables; its Query panel follows links without silently changing what a row means, sets parameter inputs, and walks every step down to the source records.
- 65d0717: Add `exportDocument`, which writes the current dashboard as dashboard text that rebuilds it. Any chart type and setting can now be written as a flat path such as `xAxis.scaleType=log` or `columns.0.width=140`, with no JSON, and `chart <type>` builds every registered chart type.
- d857537: Add highlightDsl, which splits dashboard text into colored tokens for an editor, and accept the row sequence field \_\_ID in dashboard text, so a new scatter and its point selections rebuild from text.
- a329b2d: Add host side panels and a read-only mode. `sidePanels` puts your own panels on the workspace's right edge with a toolbar button, and `readOnly` shows the charts without accepting edits.
- d0530e5: Add metric cards for counts, sums, and averages that follow chart filters. Inspect the source rows and excluded values behind each result.
- 4812185: Add point maps with latitude and longitude fields, saved geographic views, exact row selection, and coordinate tracing.
- 41b8e13: Add region maps with shared GeoJSON geometry, typed joins, counts, sums, averages, and source tracing.
- 4111cd9: Add source from the Schema diagram: ExplorEda and ExplorEdaProject take onAddSource, and exploreda/analysis adds addSourceFromRows, sourceFromRows, and singleTableProject, which turns a single-table workspace into a project whose view keeps the same charts, filters, layout, and row selections. ExplorEdaProject's schemaFocus opens the diagram on a table.
- 7eb313c: Add the `exploreda-dsl` command and `formatDslDiagnostics`, `describeDslSource`, and `DSL_REFERENCE`, so agents and scripts can list fields, check dashboard text, and read every problem with its fix without a browser.
- 001c3ff: Add the Report theme: a clean sans headline, generous space, quiet rules, and one restrained accent. Row, line, box plot, and ECDF charts now follow the theme's axis text sizes too, and row charts and time series measure their axis labels so larger type claims room. Row charts no longer draw the axis title over their Other categories status line.
- feb4554: Add workspace themes. A new Theme tab picks Compact (the default) or Newsprint, which gives every chart a large serif headline that wraps to two lines, a subtitle, and a source note. Charts gain optional `subtitle` and `note` settings, saved analyses gain an optional `theme`, and dashboard text reads `theme name=`.
- fd59496: Adds a Scatter Matrix view. Pick several fields of any type to see every pair side by side, with each field's density, histogram, or category bars on the diagonal. Number pairs show points or Pearson correlations, number and category pairs show jittered points or box plots, and category pairs show count tiles or share bars; choose each in settings. A color field colors points, distributions, and per-group correlations. Brushing any cell highlights the same rows in every cell and filters linked charts; Escape clears it. Alt-click a point to trace its row through every field, or a cell to see the rows it uses. On large data, a drag previews its selection inside the matrix and filters linked charts when you release it.
- 1f926ee: Bar charts take a categoryOrder setting: keep categories in data order or sort them A to Z, with numbers in numeric order. In ExplorEdaProject, a saved display setting for a field, such as its precision, no longer drops the field's declared name.
- 66dc636: Box plots no longer offer a bee swarm overlay. The violin overlay now shows distribution shape, and saved box plots that had bee swarm turned on still load.
- 05f84f3: Box plots, scatter plots, and 3D scatter plots read hovered values in the panel header and show a status line with the selection and usage hints. Box plots draw the violin behind a slimmer box and select groups by clicking the column or its label (Shift-click adds). 3D scatter plots fit points into a labeled cube with tick values, follow light and dark themes, read the point under the pointer, and add a Fit view button. Saved camera positions now apply to the fitted cube, so an older saved view may sit closer or farther than before; Fit view resets it. Dense scatter plots draw smaller, lighter points by default.
- 4ccb04c: Brush scatter marginal distributions, clear hexagon selections from empty space, and read bubble charts with clearer layers and labels.
- 6a841fb: Chart settings gain a Filters tab with a manual control for every filter a chart sets, replacing the Select tab. The scatter plot shows hovered values in the chart header instead of a box over the plot, and the chart details view uses a larger title.
- aacb681: Charts can limit the rows they draw with `localFilters`. These chart-local filters never filter other charts, show as an "Only" strip on the chart, and are edited under Chart rows in the Filters tab, which every data chart now has.
- 1ce8237: Charts now fill empty rows above them, resizing keeps a chart in place, and a new chart starts in the visible rows without scrolling. A click on a histogram bin filters to its bounds, box plot clicks select several groups, and 3D scatter axes accept text and category fields. Usage hints and optional plot actions appear only on hover, standing Inspect buttons are gone (Alt-click a mark instead), the toolbar puts filters on the left with Add chart, Fields, and Rows on the right, and chart type icons match their charts.
- e23c148: Click a bar in a Summary Table sparkline to filter to its rows. The filter appears in the filter bar and clears with its × or the chart's clear-filter button; clicking the same bar again removes it.
- e3d7520: Click a filter chip in the filter bar to jump to the chart that set it. Only the chip's × removes the filter, and Rows filters say they apply only to Rows.
- 5977a8e: Clicking a bar in a grouped bar chart (count, sum, or average by group) now selects that group, so other views narrow to its rows. Alt-click still opens the bar's contributors.
- 1aa9dfe: Color scales get a new editor and many more palettes: 25 sequential and diverging ramps, 9 categorical sets, reverse, steps, log and square-root spacing, a movable diverging midpoint, and a color-blind preview. Chart settings open the editor in place, and new categorical scales give the largest groups the most distinct colors.
- 70b4847: Colors follow the workspace theme. New categorical scales use a Theme palette that changes with Compact, Newsprint (new palette), or Report (new palette), and each category keeps its place. Palette colors gain lighter steps in dark mode. Hand-picked colors and fixed palettes stay as chosen and appear in the Theme tab's overrides list with a reset. Saved scales on the default palette adopt the Theme palette without changing any visible color. Line series, uncolored marks, region maps, and scatter density now follow the theme too, and the scale editor can move categories to choose which takes which color.
- 1a232a5: Column filters for number and date fields show the field's distribution, which filters on click or drag, and number fields add a range slider. Switching between column filters no longer flickers: one popover moves between columns, and popovers close without an exit animation.
- e17c89d: Compare series side by side in Bar Chart. Select a category and series together, and inspect the source records behind each bar.
- 129c525: Compositions can now compute values from the data, each scoped to one repeat or the whole graphic and set to follow or ignore filters. Show them beside repeat labels, in text as {Name}, or as guide rules, and attach annotations to the page, a frame, or a data mark that they follow as filters change.
- b5028b0: Compositions can now hold chart units: a frame of rectangle or circle marks bound to named position and value scales, repeated for each value of a field as rows, columns, or a grid on shared scales.
- 947a29b: Compositions now have a Copy PNG action that copies the finished graphic to the clipboard at twice its artboard size, without selection boxes, for pasting into reports and slides.
- 33fb313: Dashboard text now carries shared definitions: `scale`, `group`, and `rows` lines write color scales, grouped summaries, and the Rows view, and region maps refer to host-supplied `geometryAssets`. `exportDocument` omits nothing, so an exported dashboard rebuilds exactly.
- 82cdb5f: Data tables align number headers with their cells, show each column's type icon, and highlight the text a table search matched. The Rows view draws each field's distribution under its column name, and a data table chart can turn that on with the new showDistributions setting.
- c57c6ca: Data tables gain right-click menus on headers and cells (filter, sort, move, hide, copy), and columns drag by name to reorder or, dragged away from the header, to hide. The column picker now shows each field's type, counts, and distribution, and data table settings use the same picker in place of column pills.
- 8fa8a41: Date column filters offer quick ranges that fit the field, such as the latest 30 days, quarters, and months. Add chart groups chart types by purpose. Data tables show distributions in headers by default, and the toggle sits above the column list. Charts and metric cards no longer show Inspect buttons: Alt-click a mark or card to trace it. Escape now closes workspace settings and the narrow Rows drawer after a click on a chart.
- 7f84917: Describe several saved views in one dashboard text. `exportViews` writes shared definitions once and a `view "Name"` section per view, and `compileViews` rebuilds every view from that text.
- f5c42cf: Drag a numeric axis to change its range: drag along it to pan, or drag an end grip to stretch that end. The chart follows the pointer, Escape restores the range, and the drag reaches `onStateChange` as one change.
- 896cf8f: Drag across a Summary Table or field list sparkline to filter to a range, and click a Missing count or choose Only missing values in a column filter to see rows without a value. The field list now shows distinct and missing counts with a filterable distribution for each field, date distributions bin by whole days, weeks, months, quarters, or years, and tables show a small null marker for missing cells.
- b4bfec2: Edit a chart's axes where they are drawn. Double-click a numeric axis to set its range in a popover beside it, or double-click an axis title (or press Enter on it) to rename it in place. The axis context menu adds Set range, Fit to the data, and Edit axis title. `PopoverContent` accepts a `container` so popovers inside a modal dialog can take focus.
- 45beae9: Edit a chart's title where it is drawn. Double-click it, press Enter or F2 on it, or pick Edit title from its context menu. The chart updates as you type, Escape restores the old title, and a host's `onStateChange` hears about the edit once, when it ends, so one rename is one undo step.
- 00612fc: Edit query steps from the Schema diagram: add a step that follows a relationship, calculates a field, or keeps matching rows; change a step's relationship, filter, calculation, or summary; remove a step after seeing which fields and views it breaks; and start a new query from a table.
- e8ca35c: Edit the model from the Schema diagram: select a table, field, or relationship to see its details beside it, drag one field onto another table's field to create a relationship with match counts, change cardinality, remove relationships, set key fields, and rename fields. Single-table workspaces edit field labels, units, and types there.
- 15e57e7: ExplorEdaProject can run its queries in a worker: pass createWorker={createAnalysisWorker} from exploreda/analysis. Charts keep the last finished result while the next one runs, and late results are dropped.
- 879b1f8: ExplorEdaProject takes an optional views prop with every saved view. The Schema diagram then shows each view, folded to one row per chart until opened, so removing a step names every view it breaks and a field lists its uses across views.
- 860a1e1: The field inspector opens on a Values tab with a histogram or category counts that compare rows after chart filters with all rows, and it opens from any chart axis title with Command-click or the context menu. Filter chips, field details, and pivot cells now use each field's label, format, and unit, and pivot counts show plain row counts.
- 2545e8f: Find Histogram and Distribution when adding charts. Inspect and select exact Other categories, and trace distribution statistics and individual observations.
- 63b40dc: Grouped summaries and metric cards can count or measure each ID once with a new Once per field, so repeated parent rows (such as an order's amount on each of its items) no longer inflate totals. Values that differ within one ID show as unavailable instead of picking one.
- d373f1c: Individual repeats in a composition can now carry saved overrides (nudge, accent color, opacity, bold label) that stay with their subset when the order or filters change. In view mode, clicking a repeat filters the workspace by it, and Alt-click traces a mark to its template, subset, override, and source rows.
- 36ed832: Pass a ref to `ExplorEda` and call `ref.current.getSettings()` to read the current workspace settings at any time, including right after mount without `savedData`. A new Chart spec tab in workspace settings shows what each chart saves: its fields, place in the grid, filters, settings as a list or copyable JSON, and the calculations, color scales, and grouped summaries it references.
- 326c7a1: Move the row count and active filters to a status bar that stays at the bottom of the workspace, and add `toolbarStart` and `toolbarEnd` props to `ExplorEda` and `ExplorEdaProject` so hosts can put view tabs and their own actions on the workspace's single toolbar line.
- 3fac1b0: Newsprint now sizes axis text on scatter and bar charts, and axis layout measures text so larger or wider type claims room instead of overlapping. Charts gain an optional `style` setting for title size, title weight, and subtitle size, axis text sizes offer a Theme option, and the Theme tab lists every chart that overrides the theme with a reset for each. Axis text now follows the theme's foreground color, so it stays readable in dark mode.
- 9d3a60f: Notes now edit like a block editor: type / to insert headings, lists, quotes, code, or dividers, and select text to format it from a small toolbar. The always-visible control bar is gone.
- a2e6789: Pivot tables sort their groups, print each outer group value once, name the column field above its values, and add Total rows and columns that recompute each aggregate; new `showTotals` and `shadeCells` settings turn totals and value shading off. A standalone color legend lists each value with its share when the panel has room, summary and data table headers keep their names whole in narrow columns, and markdown notes keep a reading width.
- 6245226: Press ? in the workspace, or choose Keyboard shortcuts from the workspace menu, to see every keyboard shortcut.
- 6b4fc4f: Scatter plots add two density displays: hexagonal bins, where a click selects a hexagon's exact source rows, and smoothed density, which draws filled regions and contour lines in rows per X×Y unit with bandwidth and level controls. Both keep group-colored point overlays and regression fits, and Alt-click traces each hexagon or level.
- 298ad78: Scatter plots can draw linear regression fits. Each color group in each facet gets its own line with its equation and R² on the chart, an optional overall fit, and an Alt-click trace with slope, offset, and the rows used. Fits refit when other charts filter, not when you brush the scatter itself.
- 9e4c7e9: Scatter plots can show a paired summary (Pearson r and pair count on the chart, with means, standard deviations, the sample covariance matrix, and per-group results in its trace) and marginal X and Y histograms. Click a histogram bar to filter to its range; the chart's own selection reads as a darker share.
- 15dd22d: Scatter plots now accept categorical fields on either axis: each category gets a band with jittered points, and brushing a band filters by category. A scatter with nothing to draw now says why instead of staying blank.
- 476180a: Scatter points drawn over hexagon and density surfaces now use the chart's point size, which defaults larger than before, and a Point size setting controls it. Faceted charts show the facet pager on the legend's line instead of in a row of its own, wrapping below the legend when the panel is narrow.
- 405aba8: Scatter regression adds polynomial fits with a shared degree and LOESS smoothing with a shared span. Polynomial labels show the equation and R²; LOESS labels show the span and a pseudo R², and its trace explains why it has no single equation. Fits that cannot run say why instead of switching methods.
- 13d7f05: Selecting a field in the Schema diagram now traces its whole lineage: where it comes from, every calculation and view that reads it, and a Show action that jumps to the chart. Fields no view reads say so.
- a24d1d5: Set an exact range on a chart's numeric axes. The Axes settings gain Min and Max fields for scatter, bar, histogram, line, row, and box charts, saved as `xAxis.limits` and `yAxis.limits` and read from dashboard text as `x.min`, `x.max`, `y.min`, and `y.max`. A range zooms the view without filtering rows.
- ba2ab9c: Set axis text sizes and use visible scatter display choices with a separate Fit tab. Keep chart settings and their controls reachable on narrow screens.
- 42c598a: Show calendar summaries as areas or stacked areas. Inspect each band, its source records, and the series that establish its baseline.
- 93c0df9: Stack counts or sums by series in Bar Chart, or compare nonnegative totals as percentages. Inspect each segment and the source records behind its category denominator.
- 3037956: Summarize dated rows by day, week, or month in Line Chart. Select calendar periods and inspect their source records, numeric exclusions, and date boundaries.
- bf69f3d: The Rows drawer has a narrow size beside its expanded one. Narrow keeps the charts visible and in use next to the rows, and a click on a chart no longer closes it.
- 8fceda2: The Schema diagram now draws each query's steps and calculated fields and each view's charts, with lines from every field back to the table it comes from. Select a field to see the views that read it. Query calculations edit in place, and workspace calculations open the calculation editor from the diagram.
- 7fd14a7: The workspace header is now a single sticky line: icon buttons with tooltips, filter chips that collapse into a "+N more" popover, Rows as a quick peek (press R), and Calculations in a dialog instead of separate tabs.
- fb206f4: Time-series lines take a year interval, for annual data such as country indicators. Ticks and point labels show the year.
- 5c92e32: Tooltips open only on hover, so closing Rows does not show hover help when focus returns.

  Placing a new chart on an occupied spot now previews the charts that would move down, and applies the moves only when you accept. A chart's expand action opens a details view with the chart beside its settings and a Chart data tab. View data, Duplicate, and Delete are icons in each chart header, and chart settings hold settings only. Rows opens as a full-height drawer, calculations, colors, and grid share one floating settings panel with tabs, and confirmations are compact.

- b10f562: Use S, D, and X on a hovered chart to open settings, duplicate it, or delete it with confirmation. V shows its data, and C clears its filters.
- 9397f15: Workspace controls, chart settings, dialogs, and side panels use one compact scale: shorter controls, one-row setting labels, single-row tabs, side-by-side filter bounds, and no introductory paragraphs. Data tables fill their chart, row charts keep their axis under the bars, and between 640 and 960 px charts flow two to a row instead of one.
- 9e4a081: Write workspace filters in dashboard text as filter lines, one per field, such as `filter Region=West,East`. Exported text includes them, so applying it keeps the filters.

### Patch Changes

- 46cf230: A blank composition now shows an Open editor button, a new composition opens in its editor, and the settings popover links to the full editor. Edits to a chart's title, subtitle, note, style, or composition no longer redraw the other charts, and time series and calendar charts recompute faster when filters change.
- 08474ef: A chart now shows a ring while its settings are open, and the settings popover uses the same accent, so it is clear which chart you are editing.
- 2fde409: A click on empty space in a bar, row, box, Sankey, or scatter chart (including a scatter's marginal histograms) now clears that chart's filters. Scatter marginal histograms now stack by the points' color categories in the same palette.
- 33b04da: A data table with an active search now shows the search as a chip in its chart header, with a button to clear it.
- c440001: Bar charts of whole-number fields now center each bin on the integers it covers, so bars no longer leave empty gaps between values or sit between axis ticks.
- d43de65: Bar, row, and line charts now show hovered values in the panel header, outline the hovered bar, and add a status line with the selection's row count. Counts filtered by other charts keep a faint bar for every row behind them, line charts read every series at the hovered x, and row chart labels select their category.
- 167ec9c: Box plot outlier dots no longer draw a blue outline.
- df8efb7: Box plots no longer show a color legend above the chart. Each box is already colored and labeled on the category axis.
- bc088f9: Charts can expand from the right edge even when another chart touches them.
- 8a042c4: Charts on large data spend less time grouping rows by category: category keys for numbers and booleans are built directly, and string keys are reused instead of serialized for every row.
- b1650a5: Choose a chart type and configure its fields in separate panels.
- 3f16a73: Clicking a pivot table value opens its source-row inspector, replacing the repeated Inspect links.
- 6138a4a: Closing the field list no longer pops up the Fields button tooltip.
- d90daed: Data table columns fit their names and values again and leave spare width empty instead of spreading across the chart. Column headers show one compact tooltip above the header, with the field summary and the hovered distribution bar, so it no longer covers other headers or rows.
- 8a737f0: ECDF hover values now read in the panel header and beside each curve, with the hovered value on the x axis, medians and selection in a status line, and quantile names in a gutter. Filtered metric cards compare against every row: a share of the total for counts and sums, and the difference from the overall average.
- 4042d68: Edit calculations in a denser layout with clearer dependency and result previews.
- abc5752: Every chart now shows the same centered message when it has nothing to draw, and the ECDF, parallel coordinates and Sankey status lines match the other charts, including hiding usage hints in facets. Heatmaps and calendar heatmaps gain the same status line, with the selected row count and a usage hint.
- e0acb14: Export the `WorkspaceTheme`, `WorkspaceThemeId`, and `ChartStyleOverrides` types, and document the theme CSS variables hosts can set to brand the editorial themes.
- 42f6612: Filter changes on large data spend much less time recomputing field statistics. Data tables profile only their own columns, and numeric statistics read each value once.
- 63519c5: Filtering is much faster in workspaces whose host passes `onStateChange` snapshots back as `savedData`, such as `ExplorEdaProject`: the echoed snapshot no longer rebuilds every chart. Date filters on line charts no longer slow down with the square of the row count.
- eac45b4: Grid lines no longer show a redundant hover readout or turn blue on normal hover. They turn blue when Alt is held for trace on click, and their accessible names identify the field and value.
- 7feb670: Heatmap and calendar heatmap polish: the legend names the metric in the field's format, hovered values read in the panel header, colors suit dark themes, and the heatmap titles its row and column fields. Click a heatmap row or column label to select it, and in the calendar Shift-click to select a run of days or click a month or the period to select it.
- cc922b0: Histogram brush filters now snap to bar edges, so a filter never splits a bar and every bar inside it is colored. A range filter moves to the nearest edges when the bin count changes.
- c0dd3ad: Show calculations as compact cards in a narrow settings panel, keep the calculation search icon clear of typed text, and close chart details after dismissing a confirmation.
- dcddfea: Parallel coordinates and Sankey charts show hovered values in the chart header instead of a box over the plot. Parallel coordinates label the hovered line's value on each axis and select a category when you click it on its axis; Sankey node labels select their node, and flows keep their color in dark mode.
- dfb70d9: Adding the first chart to an empty grid now places it directly. The chart no longer waits for an unavailable placement target.
- c216544: Polish workspace filters: editing one is a single undo step, its control shows every value the other filters allow, the field list marks fields that already have one, and chart traces name them. Chart notes and traces now say "other filters" instead of "other chart filters", because workspace filters narrow charts too.
- 88e80c4: Scatter plot calculated-field badges now sit after the full axis title, so they no longer overlap longer titles such as those ending in "· symlog".
- 8101d1e: Scatter plots now pad symmetric-log axes below the minimum as well as above the maximum, and give a constant field a visible span, so edge points are no longer clipped at the plot border.
- 13f1fc5: Scatter smoothed density draws opaque, theme-aware bands with thin contour lines instead of stacked gray layers, and hexagons use a count color that reads in light and dark themes. Fit labels state LOESS settings once, keep equations whole in small facets, and the paired summary marks each group's r with its color.
- 3d526c6: Fields are typed more reliably. Labels with a trailing number, such as "Depot 2" or "Route 7", and hex-style codes such as "0x1A" now stay categorical instead of reading as dates or numbers. Impossible dates such as 2025-02-30 are no longer accepted, and "TRUE"/"FALSE" columns are detected as boolean. Dates without a time zone, including slash dates like 1/15/2025 and month-name dates like "Jan 15 2025", now read as UTC everywhere, so field details, filters, and daily bins agree in every time zone.
- 3ffec8d: The active sort arrow in a data table header stays visible beside the column actions.
- a3d7f8c: The Add chart dialog fits every chart type on shorter and narrower screens and no longer shows a trace control on its preview. The calculated field hover card is denser, with a compact formula, label and value rows, and a small Inspect chain & edit action.
- a5c424d: The dashboard text reference (`exploreda-dsl reference`) now explains that `x.min` and `x.max` set the axis range shown, and its path example uses `xAxis.scaleType=symlog`, a scale the charts draw.
- 54c3810: The scatter trace popover now reads top to bottom: filter status, source values, how each visual channel is drawn, and hover text, with scale and canvas details collapsed.
- cff6cc0: The workspace no longer draws a focus ring around the whole chart grid. Tabbing past the view controls now moves straight to the first chart.
- 3082094: Use compact table columns and scroll only when the columns need more room.

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
