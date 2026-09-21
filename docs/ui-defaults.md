# UI defaults

The workspace helps users inspect data while keeping the current scope clear. Controls must support that task without covering it.

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
Run `pnpm check:ui` to reject native title attributes and raw border colors.

## Tooltips and field details

- Give each icon button an accessible action name.
- Use `ActionTooltip` or `Button tooltip` for important icon actions. The shared delay is 140 ms.
- Omit hover text that only repeats visible text.
- Identify a statistic by field and meaning. Never show an unexplained duplicate number.
- Use `FieldMetadata` for type, range or sample, distinct values, and null counts.
- Keep field metadata based on the correct data scope. A filtered summary must describe filtered rows.
- Put the field name first. Optional controls must not shorten or cover it.
- Put table header actions on a second line. Keep active filter controls visible without hover.
- Keep row actions horizontal. Show them on hover and keyboard focus, and keep them available on touch screens.

## Popovers and dialogs

Use compact, nonmodal popovers for field details, filters, chart data, colors, and grid settings.
Anchor them to the control or relevant panel. Bound their width and height to the viewport.
Use short tabs when one editor has several distinct tasks. Keep primary actions reachable while content scrolls.
Use a labeled search field and bounded lists for many fields or categories.

Chart settings must keep the chart visible. Prefer space beside the panel, then space above or below it.
When no outside space remains, use a compact corner editor with scrollable controls.
Apply valid chart settings immediately so users can compare the result. Keep a reset action for the current edit session.
Do not add a persistent sidebar for temporary inspection.

Use a modal only when focus must be protected, such as an expanded chart or a destructive confirmation.
Expanded charts must close with Escape or an outside click, lock background scrolling, and restore focus.
Escape closes an active nested editor before it closes the expanded chart.

## Scope and layout

- Keep view controls and active filter scope together in one sticky area.
- Let filter chips wrap without hiding the row count or clear action.
- Label local Rows filters and table searches separately from chart filters.
- Keep a clear-filter control visible on every chart with an active filter.
- Label filter bounds with their meaning and state where the filter applies.
- Use stacked filter controls at narrow widths. State when changes apply.
- Start new source imports with summary and data tables. Let users choose their first chart.
- Preserve the order and layout in saved analyses.
- “View chart data” opens a temporary preview. It must not add a chart or move existing charts.
- Preview limits must be visible, such as “first 100 shown.”
- Use a compact Columns trigger. Show selected columns inside a searchable popover, not a shelf of pills.

## Verification

Check changed flows at 1280 px, 783 px, and 390 px widths. Use real pointer and keyboard input.
Check long field names, null values, active filters, many categories, and empty results.
Check that popovers remain within the viewport and leave primary actions reachable.
Confirm that header actions do not cover names and field details add useful information.
Check light and dark borders, quick tooltips, focus return, and background scroll locking.
Run `pnpm check` before delivery. Tests protect data scope, temporary previews, and dismissal behavior.
