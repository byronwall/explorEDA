---
id: page-stop-writing-deprecated-axis-min-max-into-dashboard-text
label: Stop writing deprecated axis min/max into dashboard text
type: page
status: planned
parent: area-defaults-for-warehouse-tables
metadata:
  purpose: mergeWithDefaultSettings spreads DEFAULT_AXIS_SETTINGS min:0 max:100 (defaultSettings.ts:106-115); export diffs against definition defaults without them, so 'xAxis.min=0 xAxis.max=100' lands in .eda files. runs/t4/sales-joined.eda.
---
