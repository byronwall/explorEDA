---
id: page-rows-tooltip-appears-after-closing
label: Rows tooltip appears after closing
type: page
status: implemented
archived: true
parent: page-feedback-rnd-2
metadata:
  implementation: Shared tooltips now open on pointer hover only. Closing Rows with Escape restores focus without showing a tooltip. Regression test and pnpm check passed on Node 24. Browser verified at 1280, 783, and 390 pixels. Changes remain local on main.
images:
  - id: 287e7458-f396-45b7-bef9-32b0ed51b2f2
    src: /api/projects/untitled-project/images/page-rows-tooltip-appears-after-closing/287e7458-f396-45b7-bef9-32b0ed51b2f2.png
    filename: 287e7458-f396-45b7-bef9-32b0ed51b2f2.png
    originalName: image.png
    mimeType: image/png
    size: 43986
    createdAt: 2026-10-01T02:11:33.536Z
---
Open rows, hit ESC, the tooltip appears.

We basically never want tooltips to appear unless mouse over.
