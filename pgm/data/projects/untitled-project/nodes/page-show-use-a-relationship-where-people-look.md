---
id: page-show-use-a-relationship-where-people-look
label: Show 'Use a relationship' where people look
type: page
status: needs-review
priority: medium
parent: area-combine-tables-without-sql
metadata:
  implementation: "Fixed in https://github.com/byronwall/explorEDA/pull/621 (stack on #609), not merged yet."
  purpose: QueryRelationshipBuilder renders at the bottom of the Query panel (ProjectQueryPanel.tsx:276-286) and only when a relation touches the open query's fields (:56-59). Task 4 saw only 'Read X'.
---
