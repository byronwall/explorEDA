---
id: page-edit-the-subtitle-in-place
label: Edit the subtitle in place
type: page
status: planned
priority: high
archived: true
parent: page-more-editable-features
metadata:
  purpose: "Rename the subtitle where it is drawn, once #192 adds it."
---
The editorial stack adds a `subtitle` chart setting (byronwall/explorEDA#192, Newsprint header). Once it merges, double-click, Enter/F2, or the context menu should edit it in place, as with the title.

- Reuse `InlineTextEditor` and `useChartEdit` (`components/charts/InPlace/`).
- Blank removes the subtitle.
- Escape restores; one undo step per edit.
- The subtitle line also holds the filter control and table search under headline themes. Editing must not hide an active filter.

