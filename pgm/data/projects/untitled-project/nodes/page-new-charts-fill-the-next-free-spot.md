---
id: page-new-charts-fill-the-next-free-spot
label: New charts fill the next free spot
type: page
status: needs-review
priority: medium
parent: area-defaults-for-warehouse-tables
metadata:
  implementation: "Fixed in https://github.com/byronwall/explorEDA/pull/627 (stack on #609), not merged yet."
  purpose: New charts are w:6 at x:0 (useCreateCharts.ts:22-30); on an empty or narrow grid Add to grid skips placement (ChartDraftContext.tsx:80-97), so dashboards stack in the left half. Every screenshot.
---
