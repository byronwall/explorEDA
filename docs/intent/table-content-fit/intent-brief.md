---
title: "Fit columns to readable cell content"
slug: "table-content-fit"
phase: intent
status: current
last_updated: "2026-10-06"
---

# Fit columns to readable cell content

## My read

Users should make a table readable with one deliberate action when default widths hide important values. The current table already resizes, reorders, hides and recovers columns, clears sort, and resets widths. Since 2026-10-06 every column also starts at a content-fitted width. The remaining fitting gap is an explicit fit for one column when a long value needs more than the default cap.

The durable outcome is quick inspection of long or uneven fields without spending time dragging every divider. Start with an explicit fit action for one column. It should use displayed formatting and bounded available space. A few unusually long values should not make the entire workspace unusable. The underlying source value and copy/export behavior must remain intact.

Table usability is one of Byron’s four first-pass priorities. Content-aware fitting is one proposed slice, not the complete definition of table usability. Use the end user’s numerical inspection workflow to decide which table improvements matter. The suggested first proof is not an implementation plan.

## What matters most

- Fit one column from the values being inspected.
- Preserve manual widths and saved layout unless fit is requested.
- Bound width without losing a route to the full value.

## The intended experience

Open a table with short headers and long values. Fit one column, inspect the full relevant text, then resize it manually. Hide and recover it. Restore the settings and verify its chosen width. Keep existing source-order reset and column controls; only their interaction with fitting needs proof.

## Boundaries

Do not add rich tag, image, history, or record-card rendering to the first width improvement. Decide whether fitting uses visible rows, matching rows, or a bounded sample. Show that scope through behavior or help. Avoid measuring every cell on every scroll. Do not overwrite manual widths after filtering.

## What seems settled

Content fit is a candidate adjacent to the comparison work. The old no-reorder and no-clear-sort claims are stale. Rich cells remain a future possibility, not a fitting prerequisite.

## Current reality that matters

DataTableContextMenu includes Reset width and Clear sort. Header controls support manual widths and column movement. `fitColumnWidth` (`DataTable/columnWidths.ts`, PR #177) sets each default width from the header and the formatted values in the first 200 rows, between 88 and 220 px. Reset width returns to that fit. There is no explicit Fit action, and values past the cap still truncate. Existing virtualization means DOM-visible cells are only part of the loaded table.

## Expansion trigger

Expand to wrapping or persistent record details when width fitting alone cannot support a concrete long-text task. Add rich cell types only with a real dataset.

## Next step after confirmation

Use three formatted fields with one long value. Fit a column and check that it remains within available space. Scroll, filter, and restore. Decide the measurement population before exposing a fit-all action.

See the [reference packet](references/README.md) and [comparison collection](../comparison-opportunities/README.md) for context.
