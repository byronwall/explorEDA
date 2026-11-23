# One dashboard cannot hold group/calc/alias lines for views on two different queries, and no tool shows computed values

- Kind: missing
- Tool: `write_eda`
- Sent: 2026-11-23T02:43:57.108Z

## What happened

1. check on product-mix.eda with `eda query=item-lines`, a view using `group @byCategory sum(items.revenue) by=product.category`, and a second `view "Large orders" query=order-lines { calc large = if ["orders.amount"] > 100 then 1 else 0; group @largeShare sum(large) by=orders.channel denominatorField=one }`. Every group, calc and alias was checked against the other view's query and skipped. The group errors said "needs by=, and a field to measure ... Write it as group @byRegion sum(Revenue) by=Region" (it already was written that way) and "items.revenue is not a field ... Fields: orders.orderId, ..." listing the other view's fields with no word about why. Only the calc message explained the cause ("Calc lines reach every view in the file, so each field they name must be in every view's query"). "Did you mean order.amount?" pointed at the other query's field, which would break the view the line belongs to. I expected definitions inside a view body to apply to that view's query.
2. Aliases inside a view body gave "revenue:num is not a view setting ... Name the view, as in view \"Overview\"", a fix unrelated to the cause (aliases must sit outside views).
3. `calc large = if orders.amount > 100 ...` in an analysis gave "uses orders, which is not a field"; the reference shows the ["orders.amount"] form only under project queries and never says dotted names need brackets or an alias in analysis calcs.
4. No tool returns a computed value (a metric, a group's totals, a finding). To verify that order.amount equals the sum of its items' revenue I had to save a temporary aggregate query into exploreda.eda, read its min/max from fields, and restore the file. I also could not tell what `finding @n count chart=@name` would print, so I left it out.

## Proposed fix

Scope group, calc and alias lines written inside a view body to that view's query (or allow `group ... query=order-lines`). Failing that, give group and alias problems the same explanation the calc problem has, and drop the "Did you mean" that names the other query's field. For an alias inside a view, say "Move alias lines above the views". In the reference, state that a calc names dotted fields as ["orders.amount"] or through an alias. Add a tool (or a describe option) that returns each chart's computed values: metric value, group rows, finding values; and let check accept a draft project query and return its fields without saving.
