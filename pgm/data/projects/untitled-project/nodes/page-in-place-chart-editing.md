---
id: page-in-place-chart-editing
label: In-place chart editing
type: page
status: planned
metadata:
  purpose: "Remaining work after the in-place editing stack (#203–#206): edit chart features where they are drawn."
---
Follow-up work for the **Edit chart features in place** initiative (`docs/intent/in-place-chart-editing/`).

Shipped in the stacked PRs byronwall/explorEDA#203 (title), #204 (axis limits), #205 (axis range and title editors), and #206 (axis drag). Each in-place editor writes through `updateChart` and wraps its edit in `useChartEdit`, so the chart updates live and the host sees one `onStateChange`, which is one undo step. Code: `packages/explorEDA/src/components/charts/InPlace/`.

The children below are what remains: more editable features, more chart families, gaps in input and accessibility, verification not yet done, and cleanup. The plan's cut line is in `implementation-plan.md`.

