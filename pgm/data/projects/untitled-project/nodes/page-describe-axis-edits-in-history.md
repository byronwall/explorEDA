---
id: page-describe-axis-edits-in-history
label: Describe axis edits in History
type: page
status: planned
priority: low
parent: page-input-and-accessibility-gaps
metadata:
  purpose: Name axis range and title changes in the History timeline.
---
`apps/demo/src/savedViewsHistory.ts` (`describeChartChanges`) reports axis limit or axis title changes only as "Edited …". Name them instead, such as "Set X range to 0–3,000 on …" or "Renamed the Y axis of …".

