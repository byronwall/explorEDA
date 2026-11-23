# An analysis with views on two queries cannot use any alias, calc, or group; they are validated against every view's query

- Kind: missing
- Tool: `check`
- Sent: 2026-11-23T01:35:25.519Z

## What happened

product-mix.eda: `eda query=item-lines` plus `view "Large orders" query=order-lines { calc large = if ["orders.amount"] > 100 then 1 else 0 / calc one = 1 / group @largeShare sum(large) by=orders.channel denominatorField=one / bar ... group=largeShare }`, and groups on items.revenue for the item-lines view. check returned errors both ways: "items.revenue is not a field ... Fields: orders.orderId, ..." (validated against order-lines) and "orders.channel is not a field ... Did you mean order.channel?" (validated against item-lines), plus "The calculations could not run: Unknown field: orders.amount" at line 1 col 1 with no fix. Same result with definitions at top level, inside the view, or with the queries swapped. The fixes ("Did you mean order.channel?", "Write it as group @byRegion sum(Revenue) by=Region") point at the wrong query and cannot help: fixing for one query breaks the other. Net effect: a per-channel rate of large orders (needs a calc on order-lines) cannot sit in the same .eda as item-level revenue charts. I fell back to compositions/pivot-free chart-local settings and count bars + ECDF instead of a rate bar. Notebooks already scope these per query and the same lines worked there first time.

## Proposed fix

Scope aliases, calc, and group lines written inside a view body (or all of them) to that view's query, as notebooks do per block query; or allow `calc`/`group` with query=<id>. Until then, make the message say so: "calc large reads orders.amount, which view 'Product mix' (query item-lines) lacks; definitions are shared by every view, so a file whose views use different queries can't define it" and give the real line instead of 1:1. Also say in the reference text that shared definitions must resolve in every view's query.
