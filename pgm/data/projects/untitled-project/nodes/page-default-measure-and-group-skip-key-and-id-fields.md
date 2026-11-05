---
id: page-default-measure-and-group-skip-key-and-id-fields
label: Default measure and group skip key and ID fields
type: page
status: needs-review
priority: medium
parent: area-defaults-for-warehouse-tables
metadata:
  implementation: "Fixed in https://github.com/byronwall/explorEDA/pull/627 (stack on #609), not merged yet."
  purpose: useCreateCharts.ts:37-52 and measureFields[0] (RowChartSettingsPanel.tsx:57) pick ss_ticket_number and Customer sk. Prefer money/quantity measures and low-cardinality labels. Tasks 4, 6.
---
