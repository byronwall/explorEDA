---
id: page-several-queries-in-one-notebook
label: Several queries in one notebook
type: page
status: needs-review
priority: medium
parent: area-text-and-cli-parity
metadata:
  implementation: "Fixed in https://github.com/byronwall/explorEDA/pull/626 (stack on #609), not merged yet."
  purpose: A notebook charts one query; a second 'eda query=' block is ignored and the hint 'Use query=returns, query=cat_rate.' misleads. Per-block query=. Tasks 5, 8 (task 8 built a UNION to work around it).
---
