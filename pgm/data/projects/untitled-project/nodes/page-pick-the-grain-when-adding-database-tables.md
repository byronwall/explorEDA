---
id: page-pick-the-grain-when-adding-database-tables
label: Pick the grain when adding database tables
type: page
status: needs-review
parent: area-combine-tables-without-sql
metadata:
  implementation: "Fixed in https://github.com/byronwall/explorEDA/pull/625 (stack on #609), not merged yet."
  purpose: Add database makes one source and one analysis per table (projectActions.ts:99-131). Add several tables at once and ask 'what is one row?' instead. Task 4 got 4 unrelated analyses.
---
