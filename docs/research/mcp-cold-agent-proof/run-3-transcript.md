# Run 3: start an empty folder from a CSV address (M5, packed command)

Prompt:

> You are connected to an explorEDA project through the exploreda MCP server. You know nothing else about explorEDA; learn it from the tools. The project folder is empty.
>
> Start the project from this CSV of shop orders: https://raw.githubusercontent.com/byronwall/explorEDA/main/packages/explorEDA/examples/shop/data/orders.csv
>
> Then build an orders dashboard in orders.eda: revenue by channel, orders per month, and the spread of order amounts. Keep going until the tools say it is complete. Tell me what you built, how many check-and-fix rounds it took, and any problem whose fix did not help. Report tool problems with submit_feedback.

**Call `add_data`** `{"path": "data/orders.csv", "url": "https://raw.githubusercontent.com/byronwall/explorEDA/main/packages/explorEDA/examples/shop/data/orders.csv"}`

**Call `reference`** `{}`

Result:

```json
{
  "saved": "data/orders.csv",
  "source": "orders",
  "projectPath": "exploreda.eda",
  "rows": 80,
  "fields": [
    {
      "name": "orders.orderId",
      "type": "cat",
      "missing": 0,
      "sample": "80 distinct: O001, O002, O003, O004, O005, O006, …"
    },
    {
      "name": "orders.customerId",
      "type": "cat",
      "missing": 0,
      "sample": "10 distinct: C10, C02, C09, C06, C08, C07, …"
    },
    {
      "name": "orders.channel",
      "type": "cat",
      "missing": 0,
      "sample": "3 distinct: Web, Store, Phone"
    },
    {
      "name": "orders.orderedAt",
      "type": "date",
      "missing": 0,
      "sample": "69 distinct: 2025-02-15, 2025-04-03, 2025-09-08, 2025-02-25, 2025-05-21, 2025-08-06, …"
    },
    {
      "name": "orders.amount",
      "type": "num",
      "missing": 0,
      "sample": "7.2 to 528"
    }
  ],
  "howToUse": "Chart it in an analysis that starts with eda query=orders; its fields are named orders.<field>."
}
```

Result:

```json
{"text":"Dashboard text: one declaration per line. A line ending in { opens a body\nthat } closes; in a body, a key=value line adds settings to the declaration,\nand a line starting with a word is a child. Spaces never change meaning;\nexploreda-dsl fmt indents by brace depth. Quote values with spaces or commas.\n\n  dashboard \"Sales\"                   view name\n  grid columns=12 rowHeight=100       grid settings (also padding=, markers=)\n  theme newsprint                     workspace theme\n  revenue:num=Revenue label=\"Rev ($)\" alias a field; :num|:cat|:date|:bool checks\n
… (10700 more characters)
```

**Call `reference`** `{"topic": "line"}`

Result:

```json
{"text":"Settings for line:\n  x.title=  X axis title; blank uses the field's label\n  x.scale=linear|log|symlog|time|band  X axis scale\n  x.min=  Lowest value the X axis shows; rows below stay counted\n  x.max=  Highest value the X axis shows\n  x.grid=  Grid lines across the plot from X axis ticks\n  x.ticks=  About how many X axis ticks to show\n  y.title=  Y axis title; blank uses the field's label\n  y.scale=linear|log|symlog|time|band  Y axis scale\n  y.min=  Lowest value the Y axis shows; rows below stay counted\n  y.max=  Highest value the Y axis shows\n  y.grid=  Grid lines across th
… (957 more characters)
```

**Call `reference`** `{"topic": "row"}`

Result:

```json
{"text":"Settings for row:\n  x.title=  X axis title; blank uses the field's label\n  x.scale=linear|log|symlog|time|band  X axis scale\n  x.min=  Lowest value the X axis shows; rows below stay counted\n  x.max=  Highest value the X axis shows\n  x.grid=  Grid lines across the plot from X axis ticks\n  x.ticks=  About how many X axis ticks to show\n  y.title=  Y axis title; blank uses the field's label\n  y.scale=linear|log|symlog|time|band  Y axis scale\n  y.min=  Lowest value the Y axis shows; rows below stay counted\n  y.max=  Highest value the Y axis shows\n  y.grid=  Grid lines across the
… (647 more characters)
```

**Call `write_eda`** `{"path": "orders.eda"}`

```eda
eda query=orders
dashboard "Orders"
grid columns=12 rowHeight=100

group @revenueByChannel sum(orders.amount) by=orders.channel

metric @revenue sum(orders.amount) title="Total revenue"
metric @orderCount count title="Orders"
row @byChannel orders.channel group=revenueByChannel title="Revenue by channel"
line @perMonth x=orders.orderedAt {
  title="Orders per month"
  time.interval=month
  time.aggregation=count
  y.title="Orders"
}
hist @amounts orders.amount bins=20 title="Spread of order amounts"
boxplot @amountBox orders.amount title="Order amount range"

layout {
  1: revenue orderCount
  4: byChannel perMonth
  4: amounts:8 amountBox:4
}
```

Result:

```json
{
  "saved": "orders.eda",
  "version": "9d42e36ccacd",
  "path": "orders.eda",
  "complete": true,
  "views": [{ "name": "Orders", "query": "orders", "charts": 6 }],
  "charts": 6,
  "problems": []
}
```

**Call `describe`** `{"path": "orders.eda"}`

Result:

```json
{
  "analyses": [
    {
      "path": "orders.eda",
      "complete": true,
      "views": [
        {
          "name": "Orders",
          "query": "orders",
          "rows": 80,
          "charts": [
            { "type": "metric-card", "title": "Total revenue" },
            { "type": "metric-card", "title": "Orders" },
            { "type": "row", "title": "Revenue by channel" },
            { "type": "line", "title": "Orders per month" },
            { "type": "bar", "title": "Spread of order amounts" },
            { "type": "boxplot", "title": "Order amount range" }
          ]
        }
      ],
      "charts": [
        {
          "name": "metric @revenue (line 7)",
          "type": "metric-card",
          "line": 7,
          "title": "Total revenue"
        },
        {
          "name": "metric @orderCount (line 8)",
          "type": "metric-card",
          "line": 8,
          "title": "Orders"
        },
        {
          "name": "row @byChannel (line 9)",
          "type": "row",
          "line": 9,
          "title": "Revenue by channel"
        },
        {
          "name": "line @perMonth (line 10)",
          "type": "line",
          "line": 10,
          "title": "Orders per month"
        },
        {
          "name": "hist @amounts (line 16)",
          "type": "bar",
          "line": 16,
          "title": "Spread of order amounts"
        },
        {
          "name": "boxplot @amountBox (line 17)",
          "type": "boxplot",
          "line": 17,
          "title": "Order amount range"
        }
      ],
      "skipped": [],
      "problems": []
    }
  ],
  "notebooks": []
}
```

**Agent:**

The project is set up and `orders.eda` is complete: the first save came back `complete: true` with no problems, and `describe` confirms all six charts built with none skipped.

**What I built**

- **Data:** the CSV was fetched to `data/orders.csv` as source `orders` (80 rows, with order ID, customer ID, channel, order date and amount).
- **Dashboard "Orders"** in `orders.eda`, on the `orders` query:
  - **Total revenue** and **Orders**: two metric cards across the top (sum of amount, and row count).
  - **Revenue by channel**: horizontal bars ranked by summed amount per channel (Web, Store, Phone).
  - **Orders per month**: a line of order counts by month of order date.
  - **Spread of order amounts**: a 20-bin histogram of amount.
  - **Order amount range**: a boxplot of amount beside the histogram.

The two metric cards and the boxplot are additions beyond the three charts you asked for.

**Check-and-fix rounds:** zero. There was one write and no fixes were needed.

**Problems whose fix did not help:** none, since no problems were reported.

**Tool feedback:** I did not file any with `submit_feedback`, because nothing failed or was confusing. One small thing I noticed: `describe` reports the `hist` chart as type `bar` and `metric` as `metric-card`, which differs from the names you write in the text. I can file that if you want it logged.

_Run stats: 7 turns, 15 s, $0.19._
