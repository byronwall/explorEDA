---
id: page-add-database-notice-keeps-the-read-error-s-fix
label: Add-database notice keeps the read error's fix
type: page
status: needs-review
priority: medium
parent: area-errors-and-reads
metadata:
  implementation: "Fixed in https://github.com/byronwall/explorEDA/pull/614 (stack on #609), not merged yet."
  purpose: "App.tsx:438 builds 'Added X, but it couldn't be read: ...' from error.message only, dropping 'Read fewer columns or rows with sql='. The Read button path keeps it (DatabaseSourceViews.tsx:178). Task 3."
---
