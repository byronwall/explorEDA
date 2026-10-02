---
id: eufr3-5ig1
status: open
deps: []
links: []
created: 2026-10-01T21:13:23Z
type: task
priority: 3
assignee: Byron Wall
tags: [ui, feedback-rnd-2]
---
# Follow up on feedback round 2 drawers, details, and placement

Gaps left after implementing feedback round 2 (placement that moves charts, chart details view, compact confirmation, Rows drawer, workspace settings drawer, header actions).

1. Placement pushes charts straight down and does not close the gaps it leaves. A chart beside the pushed ones stays put, so a row can end up ragged. Decide whether accept should compact the grid.
2. The calculation list is a five-column table. In the narrow settings panel it scrolls sideways, so the panel opens wide when calculations exist. Consider a stacked row layout for the narrow width.
3. Pressing Escape twice quickly in chart details, first on a confirmation and then on details, needs a third press because the confirmation is still animating out.
4. Rows and workspace settings cover an open field list instead of sitting beside it. Check whether the field list should close or move.
5. Browser checks did not cover many-category charts, all-null fields, or empty filter results inside the details view and Rows drawer. Unit tests cover filter scope and cancellation only.
6. Saved-layout reload after an accepted placement is covered by a unit test on the saved structure, not by a browser reload.

## Acceptance Criteria

Each item is either fixed with a test or closed with a recorded decision.

