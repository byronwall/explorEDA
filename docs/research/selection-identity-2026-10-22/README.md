# R077: selection identity after source replacement

Keep positional selections within one source snapshot. Use existing project keys only when their meaning stays trustworthy.
Defer a new plain-row key API. First review the smaller mapping, restore, and source-reference boundaries.

Four local research probes confirm narrow failures and useful controls at `f4cacdde`:

- Project chart and Rows filters preserve their logical records after reversal. Workspace and chart-local filters retain old positions.
- A mounted plain provider restores the same positional save onto different records after reversal. Removing the save resets all filters.
- A unique key ending in `:row:9` resolves to position9 instead of its keyed record. Ordinary keyed reversal resolves correctly.
- Two distinct expanded rows can share one output key when their source keys contain delimiters. Their source references remain distinct.

These checks support bounded repair proposals. They do not establish browser behavior, customer demand, or a complete replacement contract.
No application repair, new API, published lesson, or runnable demo was implemented.

Read the [eight decisions](decisions.md), [checked evidence](evidence.md), [local results](evidence/local-results.json),
[continuing catalogue queue](research-queue.md), and [run record](run.md).
The four Pro reports (decision, source audit, proof proposal, and integration proposal) remain in the [Pro conversation](https://chatgpt.com/c/6ad9b651-6728-83e9-88d4-6279b7905715).
The [run record](run.md) records checks and limits.

R026/PR465 and R043/PR466 remain complete. R008/PR464 and R011/PR461 are not repeated.
R001 is next, then R051. Local repair proofs inform the queue without replacing catalogue discovery.

R077 synthesis is complete in verified open [PR484](https://github.com/byronwall/explorEDA/pull/484).
