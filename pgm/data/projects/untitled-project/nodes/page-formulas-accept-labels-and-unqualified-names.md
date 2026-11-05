---
id: page-formulas-accept-labels-and-unqualified-names
label: Formulas accept labels and unqualified names
type: page
status: needs-review
priority: medium
parent: area-defaults-for-warehouse-tables
metadata:
  implementation: "Fixed in https://github.com/byronwall/explorEDA/pull/627 (stack on #609), not merged yet."
  purpose: "Calculator.ts:25-31 matches qualified ids only; the UI shows labels. ['Sack'] gives 'Unknown field: Sack'. Resolve labels and unique short names. Tasks 1, 3, 7, 8."
---
