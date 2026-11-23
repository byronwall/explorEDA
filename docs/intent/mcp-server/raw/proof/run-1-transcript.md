# Run 1: orders overview

Prompt:

> An explorEDA project is open, and you are connected to it through the exploreda MCP server. You know nothing else about explorEDA; learn it from the tools.
>
> Build a dashboard on the shop's orders: revenue by sales channel and by customer region, orders over time, and the spread of order sizes. Save it as orders-overview.eda in the project. Keep going until the tools say it is complete. Then tell me what you built, how many check-and-fix rounds it took, and any problem whose suggested fix did not help.

**Call `fields`** `{}`

**Call `reference`** `{}`

Result:

```json
{"text":"Dashboard text: one declaration per line. A line ending in { opens a body\nthat } closes; in a body, a key=value line adds settings to the declaration,\nand a line starting with a word is a child. Spaces never change meaning;\nexploreda-dsl fmt indents by brace depth. Quote values with spaces or commas.\n\n  dashboard \"Sales\"                   view name\n  grid columns=12 rowHeight=100       grid settings (also padding=, markers=)\n  theme newsprint                     workspace theme\n  revenue:num=Revenue label=\"Rev ($)\" alias a field; :num|:cat|:date|:bool checks\n
… (10700 more characters)
```

Result:

```json
{"queries":[{"query":"order-lines","name":"Orders with customers","rows":80,"fields":[{"name":"orders.orderId","type":"cat","missing":0,"sample":"80 distinct: O001, O002, O003, O004, O005, O006, …"},{"name":"orders.customerId","type":"cat","missing":0,"sample":"10 distinct: C10, C02, C09, C06, C08, C07, …"},{"name":"orders.channel","type":"cat","missing":0,"sample":"3 distinct: Web, Store, Phone"},{"name":"orders.orderedAt","type":"date","missing":0,"sample":"69 distinct: 2025-02-15, 2025-04-03, 2025-09-08, 2025-02-25, 2025-05-21, 2025-08-06, …"},{"name":"orders.amount","type":"num","missing":
… (4837 more characters)
```

**Call `write_eda`** `{"path": "orders-overview.eda"}`

```eda
eda query=order-lines
dashboard "Orders overview"
grid columns=12 rowHeight=100

amount:num=orders.amount label="Order amount ($)"
channel:cat=orders.channel label=Channel
region:cat=customer.region label=Region
orderedAt:date=orders.orderedAt label="Ordered"

group @byChannel sum(amount) by=channel
group @byRegion sum(amount) by=region

metric @orders count title="Orders"
metric @revenue sum(amount) title="Total revenue"
metric @avgOrder avg(amount) title="Average order"

row @channelRevenue channel group=@byChannel title="Revenue by sales channel"
row @regionRevenue region group=@byRegion title="Revenue by customer region"

line @ordersOverTime x=orderedAt {
  title="Orders over time"
  subtitle="Orders per month"
  time.interval=month
  time.aggregation=count
}

hist @orderSize amount bins=20 {
  title="Spread of order sizes"
  rule x=median "Median"
}

boxplot @sizeByChannel amount color=channel title="Order size by channel"

layout {
  1: orders revenue avgOrder
  4: channelRevenue regionRevenue
  4: ordersOverTime
  4: orderSize:7 sizeByChannel:5
}
```

Result:

```json
{
  "saved": "orders-overview.eda",
  "path": "orders-overview.eda",
  "complete": true,
  "views": [{ "name": "Orders overview", "query": "order-lines", "charts": 8 }],
  "charts": 8,
  "problems": []
}
```

**Agent:**

`orders-overview.eda` is saved in the project, and the tools report it complete: one view, 8 charts, no problems.

**What's in it** (built on the `order-lines` query, which joins orders to customers so region is available):

- **Headline metrics:** order count, total revenue and average order amount.
- **Revenue by sales channel:** horizontal bars of summed order amount per channel (Web, Store, Phone).
- **Revenue by customer region:** the same for the four regions.
- **Orders over time:** a line of order counts per month.
- **Spread of order sizes:** a 20-bin histogram of order amount with a median rule.
- **Order size by channel:** a boxplot of order amount, one box per channel — an extra I added alongside the histogram.

**Check-and-fix rounds:** none. The first save came back complete with an empty problem list, so there were no suggested fixes to judge, helpful or otherwise.

The tools only confirm the text builds cleanly against the data; I haven't seen the rendered dashboard, so it's worth a glance in the app to confirm the layout and the monthly interval read the way you want.

_Run stats: 4 turns, 13 s, $0.25._
