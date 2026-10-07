# UI defaults

The workspace helps users inspect data while keeping the current scope clear. Controls must support that task without covering it.

## Density

Spend space on data, not chrome. Every surface shares one compact scale:

- Controls are 32 px tall by default and 28 px inside settings, popovers, and side panels. Small buttons are 28 px.
- A setting is one row: its label in a 100 px column beside its control (`eda-setting-grid`). Do not stack a label above a control in settings.
- Options of one choice sit in one segmented row. Shorten their visible labels and explain each in its tooltip.
- Group related settings under a small heading divided by a rule (`eda-setting-section`), not inside nested bordered boxes.
- Put a panel's actions in its first line. Do not open a panel or popover with a paragraph that explains it; put the explanation in the tooltip of the control it explains.
- Lay out tabs in one row that scrolls sideways when it must; never wrap them.
- Let editors fill the space their panel gives them. A table sizes each column to its name, distribution, and values, leaves spare width empty at the right instead of spreading the columns apart, and scrolls only when its columns need more room.
- Line up a chart's title, plot, and content with the panel's left padding. Hidden header controls take no room.
- Below 960 px the grid shows a view-only flow of the saved layout: two charts to a row from 640 px, and one below that. Charts wider than half the grid take the whole row.

## Borders and focus

Use these tokens:

| Purpose                                   | Token                        |
| ----------------------------------------- | ---------------------------- |
| Neutral panel, table, divider, or popover | `--border` / `border-border` |
| Input boundary                            | `--input` / `border-input`   |
| Keyboard focus                            | `--ring`                     |
| Invalid input or error                    | `--destructive`              |
| Conversion warning                        | `--warning`                  |

Keep default borders soft in both themes. Do not use literal colors or Tailwind palette colors for borders.
The base rule must also cover portals and survive a host application's Tailwind reset.
Run `pnpm check:ui` to reject native title attributes, SVG `<title>` elements, and raw border colors.

## Tooltips and field details

- Give each icon button an accessible action name.
- Use `ActionTooltip` or `Button tooltip` for important icon actions. The shared delay is 140 ms.
- Open tooltips on pointer hover only. Focus return must not open them. Keep accessible names and keyboard focus indicators.
- Omit hover text that only repeats visible text.
- Explain toggles, abbreviated options, and settings that differ subtly with a real tooltip that says what each choice does and why it differs. Never use a `title` attribute.
- Identify a statistic by field and meaning. Never show an unexplained duplicate number.
- Use `FieldMetadata` for type, range or sample, distinct values, and null counts.
- Keep field metadata based on the correct data scope. A filtered summary must describe filtered rows.
- Keep field controls on one line. Put the type icon before the name and move details into the tooltip.
- Keep table header names on one line. Show actions beside the name without moving it. Keep active filters visible.
- Align a column's header with its cells: numbers right, everything else left. A number column shows its hover actions on the left.
- Show each column's type with the type icon before its name.
- The Rows view draws each field's distribution under its column name, from the rows that pass the chart filters. A click or drag on it filters that column. A data table chart offers the same as a setting.
- A column header has one tooltip, shown above the header so it never covers other headers or rows, and hidden when there is no room above. Hovering the name shows the field summary; hovering a distribution mark adds that mark's value, rows, and share.
- Mark the text a table search matched in every cell that matched.
- A number or date column filter shows the field's distribution above its bounds. A click or drag on it sets the range, and a number field adds a range slider under it. A thumb at the end of the track leaves that side open.
- One filter popover serves a table's columns. Opening another column's filter moves it; it never shows two at once. Popovers close without an exit animation.
- Show a missing table cell as a small, centered monospace `null`, never a dash or a blank.
- Let every filter reach missing values: a Missing count filters to its rows, and column filters offer Only missing values.
- Keep row actions horizontal. Show them on hover and keyboard focus, and keep them available on touch screens.

## Popovers and dialogs

Use compact, nonmodal popovers for local work: field details, filters, chart data, and one chart's settings.
Anchor them to the control or relevant panel. Bound their width and height to the viewport.
Use short tabs when one editor has several distinct tasks. Keep primary actions reachable while content scrolls.
Use a labeled search field and bounded lists for many fields or categories.

Chart settings must keep the chart visible. Prefer space beside the panel, then space above or below it.
When no outside space remains, use a compact corner editor with scrollable controls.
Apply valid chart settings immediately so users can compare the result. Keep a reset action for the current edit session.
Do not add a persistent sidebar for temporary inspection.
The plot area holds the chart only. Usage hints, such as "Click a cell to select", join the status line only while the pointer or focus is on the chart. Optional actions on the plot, such as Fit view, appear the same way. Never show an "Inspect" button on a chart or card. Alt-click or Alt-Enter on a mark opens its trace.
A click on a mark always filters: a bar, box, or category toggles its value, and a histogram bin sets the range to its bounds.
A plain click on empty plot space, away from every mark, clears that chart's filters, as its clear-filter action does. This covers the space above and between bars and a marginal band outside its bins. A drag or brush is never a dead click, and Alt-click stays inspection.
Every part of a chart uses the encoding and treatment of its main marks. Marginals, legends, and overlays stack or color by the same field with the same palette, and dim unselected rows the same way.
Keep a chart's actions in its header: View data, Duplicate, details, settings, and Delete, each an icon with a tooltip. Clear filters stays visible there while the chart filters. Chart settings hold settings only.
Hidden header actions take no room, so the chart name keeps the full header until the pointer or focus reaches it.
The field list is the one workspace tool that stays open. It floats over the right edge from the top of the viewport, never resizes the chart grid, and becomes a bottom sheet on narrow screens. Controls it covers move beside it. Fields in the toolbar and the F key open it, and Shift+F opens every field's distribution in a full view.

Workspace settings (calculations, colors, and grid) share one panel that floats over the right edge in the field list's place. Each toolbar button opens its tab and closes the panel when pressed again. Every tab stays mounted, so unsaved edits survive a switch. The panel has a narrow and a wide width, and becomes a full sheet on narrow screens. Escape closes it and returns focus to its toolbar button.
The right edge shows one panel at a time. Rows, workspace settings, and host panels replace each other. They cover the field list, which returns when they close.
A host panel, such as the demo's History, gets an icon button beside Fields and Rows, an optional letter shortcut, and the settings panel's narrow and wide sizes. Its wide size shows more detail, not just more room.
While the workspace is read-only, such as during a history preview, the charts and editing tools take no input. The filter scope stays visible and host panels stay usable.

Use a modal only when focus must be protected, such as chart details or a destructive confirmation.
Chart details fill the viewport with the chart on the left and its controls on the right, with Settings open first and Chart data in a second tab. Below 900 px the chart sits above the controls. The grid shows no second copy of the chart, and settings stay live with the same reset action.
Chart details must close with Escape or the close action, lock background scrolling, and restore focus.
Chart spec is read-only. Read its chart inventory, saved layout, and referenced definitions from current workspace state. Keep edits in Chart details.
Escape closes an active nested editor before it closes chart details. A hover tooltip must not swallow it.
Keep a confirmation small and centered: a short question, one sentence that names what is affected, Cancel, and a confirm button that names the action.

## Scope and layout

- Keep view controls and active filter scope together in one sticky line. Filter scope leads on the left. Add chart, then inspection tools (Fields, Rows), then configuration (Calculations, colors, grid, workspace actions) sit on the right, as icon buttons with tooltips. Beside an open panel, Add chart shows only its icon.
- Keep filter chips on that line. Show the ones that fit, then a "+N more" popover that lists every filter, beside the row count and clear action.
- Rows is a drawer over the right of the viewport at full height, not a separate view. It has two sizes, switched from its header. Expanded leaves a strip of charts visible on the left, and a click there dismisses it. Narrow sits beside the charts, which stay in use, so a click on them does not dismiss it. R and Escape dismiss either size. It takes the full width on narrow screens and must not resize the chart grid.
- The expanded Rows drawer covers the toolbar, so its header carries the row count and active filters. Beside the narrow drawer the toolbar keeps its own, and the controls it would cover move beside it. Table tools and the close action stay in the drawer header while rows scroll.
- Give every side inspector a narrow and a wide size: the field list and its full view, workspace settings, and Rows.
- Label local Rows filters and table searches separately from chart filters.
- Keep a clear-filter control visible on every chart with an active filter.
- Chart settings have a Filters tab with a manual control for every filter the chart sets: the fields its marks select, then any other filtered field. Each control matches the field's type and shows its distribution. A selection on the chart and the control stay in step.
- Show the values under the pointer in the chart panel header, beside the title, in one line. A crosshair or highlight marks the point. Do not float a readout over the plot.
- The chart details view enlarges the chart title with the chart.
- Label filter bounds with their meaning and state where the filter applies.
- Pair a filter's bounds side by side in one row, such as At least and At most, under its distribution.
- Start new source imports with summary and data tables. Let users choose their first chart.
- Preserve the order and layout in saved analyses.
- “View chart data” opens a temporary preview. It must not add a chart or move existing charts.
- Charts rise to fill empty rows above them, so the grid never leaves gaps at the top. A resize changes only the edge the user drags; the chart keeps its place among its neighbors.
- A new chart starts in the rows the user can see, never scrolling the page. Free space in view comes first, then the first chart edge in view.
- Placing a new chart on an occupied spot proposes moving the charts in its way down. Show them at their proposed positions before the user accepts. Apply the new chart and the moves together on accept. Back and Cancel leave every chart where it was.
- Preview limits must be visible, such as “first 100 shown.”
- Use a compact Columns trigger. Show selected columns inside a searchable popover, not a shelf of pills.
- Pick sets of fields with the shared `FieldPicker`. It shows the field list's rows (type, name, distinct, missing, and distribution) with a checkbox, and drops readings in narrow containers.
- Drag a column by its name: sideways to reorder it, or away from the header to hide it. A line marks the drop position and a chip names the column. The column menu offers the same moves for keyboard and touch.
- Right-click a table header or cell for its menu. A header offers filter, sort, move, hide, and copy name. A cell offers copy, filters built from its value, sort, and hide. Shift+right-click keeps the browser menu.

## Verification

Build the package with `pnpm --filter exploreda build` before browser checks. The demo uses built package exports.
Use a frozen production preview during concurrent source edits. Vite can reload the page when test files change.

Check changed flows at 1280 px, 783 px, and 390 px widths. Use real pointer and keyboard input.
Check long field names, null values, active filters, many categories, and empty results.
Check that popovers remain within the viewport and leave primary actions reachable.
Confirm that header actions do not cover names and field details add useful information.
Check light and dark borders, quick tooltips, focus return, and background scroll locking.
Run `pnpm check` before delivery. Tests protect data scope, temporary previews, and dismissal behavior.
