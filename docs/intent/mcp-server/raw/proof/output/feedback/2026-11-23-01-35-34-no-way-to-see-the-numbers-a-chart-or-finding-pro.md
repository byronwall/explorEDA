# No way to see the numbers a chart or finding produces, so prose and derived measures can't be verified

- Kind: missing
- Tool: `check`
- Sent: 2026-11-23T01:35:34.155Z

## What happened

check/write_eda return only views, chart count, and problems. Writing the notebook paragraph, I could not state which channel has the highest large-order share, nor confirm that the rate group (sum(large)/sum(one)) computes what I intended, nor test whether order.amount equals the sum of items.revenue (which would have allowed an order-level rate on item-lines). fields gives ranges only.

## Proposed fix

Have check return a small data preview per chart (e.g. the first ~10 group rows/values of each group, metric, and finding), or add a tool that evaluates a group/metric against a query and returns the rows.
