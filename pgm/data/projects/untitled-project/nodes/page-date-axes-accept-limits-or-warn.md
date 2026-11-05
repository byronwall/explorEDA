---
id: page-date-axes-accept-limits-or-warn
label: Date axes accept limits or warn
type: page
status: needs-review
parent: area-filter-scope-versus-stable-context
metadata:
  implementation: "Fixed in https://github.com/byronwall/explorEDA/pull/628 (stack on #609), not merged yet."
  purpose: numericAxes returns line x false for time (axisBounds.ts:171-199), but compile.ts accepts x.min/x.max and drops them silently. Task 7.
---
