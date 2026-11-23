# Run 2: product mix and a notebook

Prompt:

> An explorEDA project is open, and you are connected to it through the exploreda MCP server. You know nothing else about explorEDA; learn it from the tools.
>
> Build a product dashboard and save it as product-mix.eda: revenue by product category, revenue per month split by category, the top customers by revenue, and what share of orders are "large" (over $100) in each sales channel. Add a notebook, product-notes.eda.md, with a short paragraph and one chart that supports it. Keep going until the tools say both are complete. If a tool result was confusing, a fix did not help, or you needed something the tools lack, report it with submit_feedback before you finish. Then tell me what you built, how many check-and-fix rounds each file took, and every problem whose suggested fix did not help.

**Call `fields`** `{}`

Result:

```json
{"queries":[{"query":"order-lines","name":"Orders with customers","rows":80,"fields":[{"name":"orders.orderId","type":"cat","missing":0,"sample":"80 distinct: O001, O002, O003, O004, O005, O006, …"},{"name":"orders.customerId","type":"cat","missing":0,"sample":"10 distinct: C10, C02, C09, C06, C08, C07, …"},{"name":"orders.channel","type":"cat","missing":0,"sample":"3 distinct: Web, Store, Phone"},{"name":"orders.orderedAt","type":"date","missing":0,"sample":"69 distinct: 2025-02-15, 2025-04-03, 2025-09-08, 2025-02-25, 2025-05-21, 2025-08-06, …"},{"name":"orders.amount","type":"num","missing":
… (4837 more characters)
```

**Call `reference`** `{}`

Result:

```json
{"text":"Dashboard text: one declaration per line. A line ending in { opens a body\nthat } closes; in a body, a key=value line adds settings to the declaration,\nand a line starting with a word is a child. Spaces never change meaning;\nexploreda-dsl fmt indents by brace depth. Quote values with spaces or commas.\n\n  dashboard \"Sales\"                   view name\n  grid columns=12 rowHeight=100       grid settings (also padding=, markers=)\n  theme newsprint                     workspace theme\n  revenue:num=Revenue label=\"Rev ($)\" alias a field; :num|:cat|:date|:bool checks\n
… (10700 more characters)
```

**Call `reference`** `{"topic": "notebook"}`

Result:

````json
{"text":"Notebook: <name>.eda.md in a project folder. Markdown prose, with fenced\neda blocks of dashboard text (exploreda-dsl reference). Each block's charts\nappear where the block sits.\n\n  # Did demand run off forecast?\n\n  Prose in Markdown.\n\n  ```eda\n  eda query=demand\n  time:date=demand.time label=Hour\n  actual:num=demand.actual\n  forecast:num=demand.forecast\n  calc delta = actual - forecast\n  ```\n\n  ```eda\n  line @delta x=time y=delta title=\"Actual minus forecast\" {\n    rule y=0 \"On forecast\"\n  }\n  ```\n\n- eda query=<id> picks the query a block charts (a project qu
… (1050 more characters)
````

**Call `reference`** `{"topic": "composition"}`

Result:

```json
{"text":"Composition parts and their settings:\nText:\n  title \"text\"  at= (required) name= width= fontSize= fontWeight=400|600|700 color=\n  subtitle \"text\"  at= (required) name= width= fontSize= fontWeight=400|600|700 color=\n  footnote \"text\"  at= (required) name= width= fontSize= fontWeight=400|600|700 color=\nParts:\n  unit \"name\"  at= (required) size= (required) axis=true|false axisTitles.x= axisTitles.y=\n  legend \"name\"  at= (required) unit= (required) mark= (required) scale= direction=row|column fontSize= color= width=\n  rule \"label\"  at= (required) unit= (required) name=
… (3788 more characters)
```

**Call `reference`** `{"topic": "bar"}`

Result:

```json
{"text":"Settings for bar:\n  x.title=  X axis title; blank uses the field's label\n  x.scale=linear|log|symlog|time|band  X axis scale\n  x.min=  Lowest value the X axis shows; rows below stay counted\n  x.max=  Highest value the X axis shows\n  x.grid=  Grid lines across the plot from X axis ticks\n  x.ticks=  About how many X axis ticks to show\n  y.title=  Y axis title; blank uses the field's label\n  y.scale=linear|log|symlog|time|band  Y axis scale\n  y.min=  Lowest value the Y axis shows; rows below stay counted\n  y.max=  Highest value the Y axis shows\n  y.grid=  Grid lines across the
… (1151 more characters)
```

**Call `reference`** `{"topic": "row"}`

Result:

```json
{"text":"Settings for row:\n  x.title=  X axis title; blank uses the field's label\n  x.scale=linear|log|symlog|time|band  X axis scale\n  x.min=  Lowest value the X axis shows; rows below stay counted\n  x.max=  Highest value the X axis shows\n  x.grid=  Grid lines across the plot from X axis ticks\n  x.ticks=  About how many X axis ticks to show\n  y.title=  Y axis title; blank uses the field's label\n  y.scale=linear|log|symlog|time|band  Y axis scale\n  y.min=  Lowest value the Y axis shows; rows below stay counted\n  y.max=  Highest value the Y axis shows\n  y.grid=  Grid lines across the
… (647 more characters)
```

**Call `reference`** `{"topic": "line"}`

Result:

```json
{"text":"Settings for line:\n  x.title=  X axis title; blank uses the field's label\n  x.scale=linear|log|symlog|time|band  X axis scale\n  x.min=  Lowest value the X axis shows; rows below stay counted\n  x.max=  Highest value the X axis shows\n  x.grid=  Grid lines across the plot from X axis ticks\n  x.ticks=  About how many X axis ticks to show\n  y.title=  Y axis title; blank uses the field's label\n  y.scale=linear|log|symlog|time|band  Y axis scale\n  y.min=  Lowest value the Y axis shows; rows below stay counted\n  y.max=  Highest value the Y axis shows\n  y.grid=  Grid lines across th
… (957 more characters)
```

**Call `reference`** `{"topic": "project"}`

Result:

```json
{"text":"Project text: exploreda.eda at the folder's top (or .exploreda/project.eda).\nOne declaration per line; @name gives it an ID, { } holds its body, and a\nvalue with spaces is quoted. Every other .eda file is an analysis, and every\n.eda.md file is a notebook (exploreda-dsl reference notebook).\n\n  project @shop\n\n  connection @shop driver=sqlite path=data/shop.db\n  source @orders key=orderId db=shop table=orders\n  source @returns db=shop sql=\"select r.returnId, o.amount from returns r join orders o using (orderId)\" limit=200000\n  source @customers path=data/customers.csv\n\n  re
… (5275 more characters)
```

**Call `check`** `{"path": "product-mix.eda"}`

```eda
eda query=item-lines
revenue:num=items.revenue label="Revenue ($)"
category:cat=product.category label=Category
customer:cat=customer.name label=Customer
orderedAt:date=order.orderedAt label="Order date"
amount:num=orders.amount label="Order amount ($)"
channel:cat=orders.channel label=Channel
calc large = if amount > 100 then 1 else 0
calc one = 1

group @byCategory sum(revenue) by=category
group @byCustomer sum(revenue) by=customer
group @largeShare sum(large) by=channel denominatorField=one

view "Product mix" {
  bar @catRevenue category group=byCategory title="Revenue by category"
  line @monthly x=orderedAt time.interval=month time.aggregation=sum time.measureField=revenue time.splitField=category time.display=stacked-area title="Monthly revenue by category"
  row @topCustomers customer group=byCustomer topN=5 title="Top customers by revenue"
  layout {
    4: catRevenue:5 monthly:7
    4: topCustomers
  }
}

view "Large orders" query=order-lines {
  bar @largeByChannel channel group=largeShare valueFormat=percent valueDecimals=0 title="Share of orders over $100 by channel"
  metric count title="Orders"
  layout {
    4: largeByChannel:9 count:3
  }
}
```

Result:

```json
{
  "path": "product-mix.eda",
  "complete": false,
  "views": [
    { "name": "Product mix", "query": "item-lines", "charts": 3 },
    { "name": "Large orders", "query": "order-lines", "charts": 2 }
  ],
  "charts": 5,
  "problems": [
    {
      "path": "product-mix.eda",
      "line": 2,
      "column": 1,
      "severity": "error",
      "message": "items.revenue is not a field in the source rows, so revenue is unavailable.",
      "fix": "Fields: orders.orderId, orders.customerId, orders.channel, orders.orderedAt, orders.amount, customer.customerId, customer.name, customer.region, customer.joinedAt."
    },
    {
      "path": "product-mix.eda",
      "line": 3,
      "column": 1,
      "severity": "error",
      "message": "product.category is not a field in the source rows, so category is unavailable.",
      "fix": "Fields: orders.orderId, orders.customerId, orders.channel, orders.orderedAt, orders.amount, customer.customerId, customer.name, customer.region, customer.joinedAt."
    },
    {
      "path": "product-mix.eda",
      "line": 5,
      "column": 1,
      "severity": "error",
      "message": "order.orderedAt is not a field in the source rows, so orderedAt is unavailable.",
      "fix": "Did you mean orders.orderedAt?"
    },
    {
      "path": "product-mix.eda",
      "line": 6,
      "column": 1,
      "severity": "error",
      "message": "orders.amount is not a field in the source rows, so amount is unavailable.",
      "fix": "Did you mean order.amount?"
    },
    {
      "path": "product-mix.eda",
      "line": 7,
      "column": 1,
      "severity": "error",
      "message": "orders.channel is not a field in the source rows, so channel is unavailable.",
      "fix": "Did you mean order.channel?"
    },
    {
      "path": "product-mix.eda",
      "line": 8,
      "column": 14,
      "severity": "error",
      "message": "calc large uses amount, whose source field is missing, so it was skipped.",
      "fix": "Did you mean order.amount?"
    },
    {
      "path": "product-mix.eda",
      "line": 11,
      "column": 1,
      "severity": "error",
      "message": "group @byCategory (line 11) needs by=, and a field to measure unless it counts, so it was skipped.",
      "fix": "Write it as group @byRegion sum(Revenue) by=Region."
    },
    {
      "path": "product-mix.eda",
      "line": 11,
      "column": 19,
      "severity": "warning",
      "message": "The source field for revenue is missing, so group @byCategory (line 11) has no measure.",
      "fix": "Fix the revenue alias on line 2."
    },
    {
      "path": "product-mix.eda",
      "line": 11,
      "column": 32,
      "severity": "warning",
      "message": "The source field for category is missing, so group @byCategory (line 11) has no group field.",
      "fix": "Fix the category alias on line 3."
    },
    {
      "path": "product-mix.eda",
      "line": 12,
      "column": 1,
      "severity": "error",
      "message": "group @byCustomer (line 12) needs by=, and a field to measure unless it counts, so it was skipped.",
      "fix": "Write it as group @byRegion sum(Revenue) by=Region."
    },
    {
      "path": "product-mix.eda",
      "line": 12,
      "column": 19,
      "severity": "warning",
      "message": "The source field for revenue is missing, so group @byCustomer (line 12) has no measure.",
      "fix": "Fix the revenue alias on line 2."
    },
    {
      "path": "product-mix.eda",
      "line": 13,
      "column": 1,
      "severity": "error",
      "message": "group @largeShare (line 13) needs by=, and a field to measure unless it counts, so it was skipped.",
      "fix": "Write a rate as group @rate sum(Completions) by=Passer denominatorField=Attempts."
    },
    {
      "path": "product-mix.eda",
      "line": 13,
      "column": 19,
      "severity": "warning",
      "message": "calc large was skipped, so group @largeShare (line 13) has no measure.",
      "fix": "Fix calc large first."
    },
    {
      "path": "product-mix.eda",
      "line": 13,
      "column": 30,
      "severity": "warning",
      "message": "The source field for channel is missing, so group @largeShare (line 13) has no group field.",
      "fix": "Fix the channel alias on line 7."
    },
    {
      "path": "product-mix.eda",
      "line": 27,
      "column": 3,
      "severity": "warning",
      "message": "metric (line 27) isn't in the layout, so it takes the first free space.",
      "fix": "Add it to the layout block, or give it at=."
    },
    {
      "path": "product-mix.eda",
      "line": 29,
      "column": 25,
      "severity": "warning",
      "message": "count is not a chart in this view, so the layout skipped it.",
      "fix": "Name a chart with @name or by its field."
    }
  ]
}
```

**Call `check`** `{"path": "product-mix.eda"}`

```eda
eda query=item-lines

view "Product mix" {
  group @byCategory sum(items.revenue) by=product.category
  group @byCustomer sum(items.revenue) by=customer.name
  bar @catRevenue product.category group=byCategory title="Revenue by category"
  line @monthly x=order.orderedAt time.interval=month time.aggregation=sum time.measureField=items.revenue time.splitField=product.category time.display=stacked-area title="Monthly revenue by category"
  row @topCustomers customer.name group=byCustomer topN=5 title="Top customers by revenue"
  layout {
    4: catRevenue:5 monthly:7
    4: topCustomers
  }
}

view "Large orders" query=order-lines {
  calc large = if ["orders.amount"] > 100 then 1 else 0
  calc one = 1
  group @largeShare sum(large) by=orders.channel denominatorField=one
  bar @largeByChannel orders.channel group=largeShare valueFormat=percent valueDecimals=0 title="Share of orders over $100 by channel"
  metric @orderCount count title="Orders"
  layout {
    4: largeByChannel:9 orderCount:3
  }
}
```

Result:

```json
{
  "path": "product-mix.eda",
  "complete": false,
  "views": [
    { "name": "Product mix", "query": "item-lines", "charts": 3 },
    { "name": "Large orders", "query": "order-lines", "charts": 2 }
  ],
  "charts": 5,
  "problems": [
    {
      "path": "product-mix.eda",
      "line": 1,
      "column": 1,
      "severity": "error",
      "message": "The calculations could not run: Unknown field: orders.amount"
    },
    {
      "path": "product-mix.eda",
      "line": 4,
      "column": 3,
      "severity": "error",
      "message": "group @byCategory (line 4) needs by=, and a field to measure unless it counts, so it was skipped.",
      "fix": "Write it as group @byRegion sum(Revenue) by=Region."
    },
    {
      "path": "product-mix.eda",
      "line": 4,
      "column": 21,
      "severity": "warning",
      "message": "items.revenue is not a field, alias, or calculation, so group @byCategory (line 4) has no measure.",
      "fix": "Fields: orders.orderId, orders.customerId, orders.channel, orders.orderedAt, orders.amount, customer.customerId, customer.name, customer.region, customer.joinedAt, large, one."
    },
    {
      "path": "product-mix.eda",
      "line": 4,
      "column": 40,
      "severity": "warning",
      "message": "product.category is not a field, alias, or calculation, so group @byCategory (line 4) has no group field.",
      "fix": "Fields: orders.orderId, orders.customerId, orders.channel, orders.orderedAt, orders.amount, customer.customerId, customer.name, customer.region, customer.joinedAt, large, one."
    },
    {
      "path": "product-mix.eda",
      "line": 5,
      "column": 3,
      "severity": "error",
      "message": "group @byCustomer (line 5) needs by=, and a field to measure unless it counts, so it was skipped.",
      "fix": "Write it as group @byRegion sum(Revenue) by=Region."
    },
    {
      "path": "product-mix.eda",
      "line": 5,
      "column": 21,
      "severity": "warning",
      "message": "items.revenue is not a field, alias, or calculation, so group @byCustomer (line 5) has no measure.",
      "fix": "Fields: orders.orderId, orders.customerId, orders.channel, orders.orderedAt, orders.amount, customer.customerId, customer.name, customer.region, customer.joinedAt, large, one."
    },
    {
      "path": "product-mix.eda",
      "line": 18,
      "column": 3,
      "severity": "error",
      "message": "group @largeShare (line 18) needs by=, and a field to measure unless it counts, so it was skipped.",
      "fix": "Write a rate as group @rate sum(Completions) by=Passer denominatorField=Attempts."
    },
    {
      "path": "product-mix.eda",
      "line": 18,
      "column": 32,
      "severity": "warning",
      "message": "orders.channel is not a field, alias, or calculation, so group @largeShare (line 18) has no group field.",
      "fix": "Did you mean order.channel?"
    }
  ]
}
```

**Call `reference`** `{"topic": "pivot"}`

Result:

```json
{"text":"Settings for pivot:\n  x.title=  X axis title; blank uses the field's label\n  x.scale=linear|log|symlog|time|band  X axis scale\n  x.min=  Lowest value the X axis shows; rows below stay counted\n  x.max=  Highest value the X axis shows\n  x.grid=  Grid lines across the plot from X axis ticks\n  x.ticks=  About how many X axis ticks to show\n  y.title=  Y axis title; blank uses the field's label\n  y.scale=linear|log|symlog|time|band  Y axis scale\n  y.min=  Lowest value the Y axis shows; rows below stay counted\n  y.max=  Highest value the Y axis shows\n  y.grid=  Grid lines across t
… (677 more characters)
```

**Call `reference`** `{"topic": "metric"}`

Result:

```json
{"text":"Settings for metric:\n  x.title=  X axis title; blank uses the field's label\n  x.scale=linear|log|symlog|time|band  X axis scale\n  x.min=  Lowest value the X axis shows; rows below stay counted\n  x.max=  Highest value the X axis shows\n  x.grid=  Grid lines across the plot from X axis ticks\n  x.ticks=  About how many X axis ticks to show\n  y.title=  Y axis title; blank uses the field's label\n  y.scale=linear|log|symlog|time|band  Y axis scale\n  y.min=  Lowest value the Y axis shows; rows below stay counted\n  y.max=  Highest value the Y axis shows\n  y.grid=  Grid lines across
… (589 more characters)
```

**Call `check`** `{"path": "product-mix.eda"}`

```eda
eda query=item-lines

view "Product mix" {
  line @monthly x=order.orderedAt time.interval=month time.aggregation=sum time.measureField=items.revenue time.splitField=product.category time.display=stacked-area title="Monthly revenue by category"
  pivot @catRevenue rows=product.category title="Revenue by category" {
    value sum(items.revenue) label="Revenue"
  }
  layout {
    4: catRevenue:5 monthly:7
  }
}

view "Large orders" query=order-lines {
  hist @largeByChannel orders.amount spec.upper=100 facet.enabled=true facet.rowVariable=orders.channel facet.columnCount=3 title="Share of orders over $100 by channel"
  pivot @largePivot rows=orders.channel {
    value count label="Orders"
  }
  layout {
    4: largeByChannel:8 largePivot:4
  }
}
```

Result:

```json
{
  "path": "product-mix.eda",
  "complete": false,
  "views": [
    { "name": "Product mix", "query": "item-lines", "charts": 2 },
    { "name": "Large orders", "query": "order-lines", "charts": 1 }
  ],
  "charts": 3,
  "problems": [
    {
      "path": "product-mix.eda",
      "line": 14,
      "column": 38,
      "severity": "warning",
      "message": "spec.upper=100 doesn't fit histogram, so hist @largeByChannel (line 14) keeps the default histogram."
    },
    {
      "path": "product-mix.eda",
      "line": 15,
      "column": 3,
      "severity": "error",
      "message": "pivot @largePivot (line 15) is missing a required setting, so it was skipped."
    },
    {
      "path": "product-mix.eda",
      "line": 19,
      "column": 25,
      "severity": "warning",
      "message": "largePivot is not a chart in this view, so the layout skipped it.",
      "fix": "Name a chart with @name or by its field."
    }
  ]
}
```

**Call `check`** `{"path": "product-mix.eda"}`

```eda
eda query=order-lines
calc large = if ["orders.amount"] > 100 then 1 else 0
calc one = 1
group @largeShare sum(large) by=orders.channel denominatorField=one

view "Large orders" {
  bar @largeByChannel orders.channel group=largeShare valueFormat=percent valueDecimals=0 title="Share of orders over $100 by channel"
  layout {
    4: largeByChannel
  }
}

view "Product mix" query=item-lines {
  line @monthly x=order.orderedAt time.interval=month time.aggregation=sum time.measureField=items.revenue time.splitField=product.category time.display=stacked-area title="Monthly revenue by category"
  pivot @catRevenue rows=product.category title="Revenue by category" {
    value sum(items.revenue) label="Revenue"
  }
  pivot @topCustomers rows=customer.name topN=5 title="Top customers by revenue" {
    value sum(items.revenue) label="Revenue"
  }
  layout {
    4: catRevenue:5 monthly:7
    4: topCustomers
  }
}
```

Result:

```json
{
  "path": "product-mix.eda",
  "complete": false,
  "views": [
    { "name": "Large orders", "query": "order-lines", "charts": 1 },
    { "name": "Product mix", "query": "item-lines", "charts": 3 }
  ],
  "charts": 4,
  "problems": [
    {
      "path": "product-mix.eda",
      "line": 1,
      "column": 1,
      "severity": "error",
      "message": "The calculations could not run: Unknown field: orders.amount"
    },
    {
      "path": "product-mix.eda",
      "line": 4,
      "column": 1,
      "severity": "error",
      "message": "group @largeShare (line 4) needs by=, and a field to measure unless it counts, so it was skipped.",
      "fix": "Write a rate as group @rate sum(Completions) by=Passer denominatorField=Attempts."
    },
    {
      "path": "product-mix.eda",
      "line": 4,
      "column": 30,
      "severity": "warning",
      "message": "orders.channel is not a field, alias, or calculation, so group @largeShare (line 4) has no group field.",
      "fix": "Did you mean order.channel?"
    }
  ]
}
```

**Call `reference`** `{"topic": "ecdf"}`

Result:

```json
{"text":"Settings for ecdf:\n  x.title=  X axis title; blank uses the field's label\n  x.scale=linear|log|symlog|time|band  X axis scale\n  x.min=  Lowest value the X axis shows; rows below stay counted\n  x.max=  Highest value the X axis shows\n  x.grid=  Grid lines across the plot from X axis ticks\n  x.ticks=  About how many X axis ticks to show\n  y.title=  Y axis title; blank uses the field's label\n  y.scale=linear|log|symlog|time|band  Y axis scale\n  y.min=  Lowest value the Y axis shows; rows below stay counted\n  y.max=  Highest value the Y axis shows\n  y.grid=  Grid lines across th
… (577 more characters)
```

**Call `check`** `{"path": "product-mix.eda"}`

```eda
eda query=item-lines

view "Product mix" {
  composition @catRevenue height=320 {
    title "Revenue by category" at=24,16
    unit Categories at=24,60 size=420x220 {
      bar Revenue aggregation=sum measureField=items.revenue categoryField=product.category order=total
    }
  }
  composition @topCustomers height=320 {
    title "Top customers by revenue" at=24,16
    unit Customers at=24,60 size=420x220 {
      bar Revenue aggregation=sum measureField=items.revenue categoryField=customer.name order=total
    }
  }
  line @monthly x=order.orderedAt time.interval=month time.aggregation=sum time.measureField=items.revenue time.splitField=product.category time.display=stacked-area title="Monthly revenue by category"
  layout {
    4: catRevenue:5 monthly:7
    4: topCustomers
  }
}

view "Large orders" query=order-lines {
  bar @largeByChannel orders.amount spec.upper=100 bins.mode=width bins.width=100 bins.origin=0 facet.enabled=true facet.rowVariable=orders.channel facet.columnCount=3 title="Orders over $100 by channel"
  ecdf @amountEcdf orders.amount title="Order amount distribution" {
    rule x=100 "$100"
  }
  layout {
    4: largeByChannel:7 amountEcdf:5
  }
}
```

Result:

```json
{
  "path": "product-mix.eda",
  "complete": false,
  "views": [
    { "name": "Product mix", "query": "item-lines", "charts": 3 },
    { "name": "Large orders", "query": "order-lines", "charts": 2 }
  ],
  "charts": 5,
  "problems": [
    {
      "path": "product-mix.eda",
      "line": 24,
      "column": 37,
      "severity": "warning",
      "message": "spec.upper=100 bins.mode=width bins.width=100 bins.origin=0 doesn't fit histogram, so bar @largeByChannel (line 24) keeps the default histogram."
    }
  ]
}
```

**Call `check`** `{"path": "product-mix.eda"}`

```eda
eda query=order-lines
view "Large orders" {
  ecdf @largeByChannel orders.amount direction=zzz showQuantiles=zzz showOverall=zzz facet.enabled=true facet.rowVariable=orders.channel facet.columnCount=3 title="Order amount distribution" {
    rule x=100 "$100"
  }
  bar @b orders.channel where.orders.amount=100.. share=zzz scaleTo=zzz seriesField=zzz seriesLayout=zzz
}
```

Result:

```json
{
  "path": "product-mix.eda",
  "complete": false,
  "views": [{ "name": "Large orders", "query": "order-lines", "charts": 2 }],
  "charts": 2,
  "problems": [
    {
      "path": "product-mix.eda",
      "line": 3,
      "column": 38,
      "severity": "warning",
      "message": "direction=zzz doesn't fit direction, so ecdf @largeByChannel (line 3) keeps the default direction."
    },
    {
      "path": "product-mix.eda",
      "line": 3,
      "column": 52,
      "severity": "warning",
      "message": "showQuantiles=zzz doesn't fit showQuantiles, so ecdf @largeByChannel (line 3) keeps the default showQuantiles."
    },
    {
      "path": "product-mix.eda",
      "line": 3,
      "column": 70,
      "severity": "warning",
      "message": "showOverall=zzz doesn't fit showOverall, so ecdf @largeByChannel (line 3) keeps the default showOverall."
    },
    {
      "path": "product-mix.eda",
      "line": 6,
      "column": 51,
      "severity": "warning",
      "message": "share=zzz doesn't fit share, so bar @b (line 6) keeps the default share."
    },
    {
      "path": "product-mix.eda",
      "line": 6,
      "column": 61,
      "severity": "warning",
      "message": "scaleTo=zzz doesn't fit scaleTo, so bar @b (line 6) keeps the default scaleTo."
    },
    {
      "path": "product-mix.eda",
      "line": 6,
      "column": 73,
      "severity": "warning",
      "message": "zzz is not a field, alias, or calculation, so seriesField keeps its default.",
      "fix": "Fields: orders.orderId, orders.customerId, orders.channel, orders.orderedAt, orders.amount, customer.customerId, customer.name, customer.region, customer.joinedAt."
    },
    {
      "path": "product-mix.eda",
      "line": 6,
      "column": 89,
      "severity": "warning",
      "message": "seriesLayout=zzz doesn't fit seriesLayout, so bar @b (line 6) keeps the default seriesLayout."
    }
  ]
}
```

**Call `write_eda`** `{"path": "product-mix.eda"}`

```eda
eda query=item-lines

view "Product mix" {
  composition @catRevenue height=320 {
    title "Revenue by category" at=24,16
    unit Categories at=24,60 size=420x220 {
      bar Revenue aggregation=sum measureField=items.revenue categoryField=product.category order=total
    }
  }
  line @monthly x=order.orderedAt time.interval=month time.aggregation=sum time.measureField=items.revenue time.splitField=product.category time.display=stacked-area title="Monthly revenue by category"
  composition @topCustomers height=420 {
    title "Top customers by revenue" at=24,16
    unit Customers at=24,60 size=760x320 {
      bar Revenue aggregation=sum measureField=items.revenue categoryField=customer.name order=total
    }
  }
  layout {
    4: catRevenue:5 monthly:7
    5: topCustomers
  }
}

view "Large orders" query=order-lines {
  bar @largeCount orders.channel where.orders.amount=100.. title="Orders over $100 by channel" y.title="Large orders"
  bar @allCount orders.channel title="All orders by channel" y.title="Orders"
  ecdf @amountEcdf orders.amount facet.enabled=true facet.rowVariable=orders.channel facet.columnCount=3 title="Cumulative share of orders by amount, per channel" subtitle="The share above the $100 line is the large-order share" {
    rule x=100 "$100"
  }
  layout {
    4: largeCount allCount
    4: amountEcdf
  }
}
```

Result:

```json
{
  "saved": "product-mix.eda",
  "path": "product-mix.eda",
  "complete": true,
  "views": [
    { "name": "Product mix", "query": "item-lines", "charts": 3 },
    { "name": "Large orders", "query": "order-lines", "charts": 3 }
  ],
  "charts": 6,
  "problems": []
}
```

**Call `write_eda`** `{"path": "product-notes.eda.md"}`

````eda
# Large orders by channel

An order counts as "large" when its amount is over $100. Of the {{orders}} orders in the data, {{largeOrders}} clear that bar. The chart below shows the share of each sales channel's orders that are large, so channels can be compared regardless of how many orders each one takes; it supports the Large orders view of the product-mix dashboard, which shows the same split as counts.

```eda
eda query=order-lines
amount:num=orders.amount label="Order amount ($)"
channel:cat=orders.channel label=Channel
calc large = if amount > 100 then 1 else 0
calc one = 1
group @largeShare sum(large) by=channel denominatorField=one
bar @largeByChannel channel group=largeShare valueFormat=percent valueDecimals=0 title="Share of orders over $100 by channel"
metric @allOrders count title="Orders"
metric @bigOrders count where.amount=100.. title="Orders over $100"
finding @orders count chart=@allOrders
finding @largeOrders count chart=@bigOrders
````

````

Result:

```json
{"saved":"product-notes.eda.md","path":"product-notes.eda.md","complete":true,"views":[],"charts":3,"problems":[]}
````

**Call `write_eda`** `{"path": "product-notes.eda.md"}`

````eda
# Large orders by channel

An order counts as "large" when its amount is over $100. The chart below shows the share of each sales channel's orders that are large, so channels can be compared regardless of how many orders each one takes. It supports the Large orders view of the product-mix dashboard, which shows the same split as counts and as a cumulative distribution.

```eda
eda query=order-lines
amount:num=orders.amount label="Order amount ($)"
channel:cat=orders.channel label=Channel
calc large = if amount > 100 then 1 else 0
calc one = 1
group @largeShare sum(large) by=channel denominatorField=one
bar @largeByChannel channel group=largeShare valueFormat=percent valueDecimals=0 title="Share of orders over $100 by channel"
````

````

Result:

```json
{"saved":"product-notes.eda.md","path":"product-notes.eda.md","complete":true,"views":[],"charts":1,"problems":[]}
````

**Call `submit_feedback`** `{"kind": "missing", "tool": "check", "summary": "An analysis with views on two queries cannot use any alias, calc, or group; they are validated against every view's query", "happened": "product-mix.eda: `eda query=item-lines`plus`view \"Large orders\" query=order-lines { calc large = if [\"orders.amount\"] > 100 then 1 else 0 / calc one = 1 / group @largeShare sum(large) by=orders.channel denominatorField=one / bar ... group=largeShare }`, and groups on items.revenue for the item-lines view. check returned errors both ways: \"items.revenue is not a field ... Fields: orders.orderId, ...\" (validated against order-lines) and \"orders.channel is not a field ... Did you mean order.channel?\" (validated against item-lines), plus \"The calculations could not run: Unknown field: orders.amount\" at line 1 col 1 with no fix. Same result with definitions at top level, inside the view, or with the queries swapped. The fixes (\"Did you mean order.channel?\", \"Write it as group @byRegion sum(Revenue) by=Region\") point at the wrong query and cannot help: fixing for one query breaks the other. Net effect: a per-channel rate of large orders (needs a calc on order-lines) cannot sit in the same .eda as item-level revenue charts. I fell back to compositions/pivot-free chart-local settings and count bars + ECDF instead of a rate bar. Notebooks already scope these per query and the same lines worked there first time.", "proposedFix": "Scope aliases, calc, and group lines written inside a view body (or all of them) to that view's query, as notebooks do per block query; or allow `calc`/`group` with query=<id>. Until then, make the message say so: \"calc large reads orders.amount, which view 'Product mix' (query item-lines) lacks; definitions are shared by every view, so a file whose views use different queries can't define it\" and give the real line instead of 1:1. Also say in the reference text that shared definitions must resolve in every view's query."}`

Result:

```json
{
  "saved": ".exploreda/feedback/2026-11-23-01-35-25-an-analysis-with-views-on-two-queries-cannot-use.md"
}
```

**Call `submit_feedback`** `{"kind": "confusing", "tool": "check", "summary": "\"doesn't fit\" warnings give no fix or allowed values; listed bar settings (spec.upper, bins.*) are rejected as not fitting \"histogram\"", "happened": "1) `bar @x orders.amount spec.upper=100 bins.mode=width bins.width=100 bins.origin=0 facet...`returned one warning: \"spec.upper=100 bins.mode=width bins.width=100 bins.origin=0 doesn't fit histogram, so bar keeps the default histogram.\" with no fix. reference bar lists all four settings with those exact forms, so I can't tell which is wrong or why. Same for`hist ... spec.upper=100`. 2) Settings listed with no description or values in reference (share=, scaleTo=, seriesLayout=, direction=, showQuantiles=, showOverall=, topN=, valueFormat= on the per-type page) \u2014 trying a bad value gives \"direction=zzz doesn't fit direction\" with no fix and no list of accepted values, so they cannot be discovered. 3) `pivot @p rows=orders.channel { value count label=\"Orders\" }` gave \"is missing a required setting, so it was skipped\" without naming the setting.", "proposedFix": "Give every \"doesn't fit\" warning a fix naming the accepted values or shape (e.g. \"direction takes above|below\"), report each rejected setting separately, and name the missing required setting for pivot. In reference <type>, add a description and values for every listed setting, and explain what spec.lower/upper draw and which bins.* must be combined."}`

Result:

```json
{
  "saved": ".exploreda/feedback/2026-11-23-01-35-31-doesn-t-fit-warnings-give-no-fix-or-allowed-valu.md"
}
```

**Call `submit_feedback`** `{"kind": "missing", "tool": "check", "summary": "No way to see the numbers a chart or finding produces, so prose and derived measures can't be verified", "happened": "check/write_eda return only views, chart count, and problems. Writing the notebook paragraph, I could not state which channel has the highest large-order share, nor confirm that the rate group (sum(large)/sum(one)) computes what I intended, nor test whether order.amount equals the sum of items.revenue (which would have allowed an order-level rate on item-lines). fields gives ranges only.", "proposedFix": "Have check return a small data preview per chart (e.g. the first ~10 group rows/values of each group, metric, and finding), or add a tool that evaluates a group/metric against a query and returns the rows."}`

Result:

```json
{
  "saved": ".exploreda/feedback/2026-11-23-01-35-34-no-way-to-see-the-numbers-a-chart-or-finding-pro.md"
}
```

**Agent:**

Both files are saved and the tools report them complete with no problems, but the dashboard does not show the large-order share as a single percentage per channel. The notebook does.

## What I built

**`product-mix.eda`** has two views and six charts:

- **Product mix** (item-level data):
  - Revenue by category, as bars sorted by total.
  - Monthly revenue split by category, as a stacked area.
  - Customers by revenue, as bars sorted by total. It shows all 10 customers ranked rather than cutting to a top N, because the chart type I had to use has no limit setting.
- **Large orders** (order-level data):
  - Count of orders over $100 per channel, next to a count of all orders per channel.
  - Cumulative distribution of order amount per channel, with a line at $100. The share above the line is the large-order share.
  - The count chart's filter is `100..`, which I believe includes orders of exactly $100, so it may differ slightly from a strict "over $100".

**`product-notes.eda.md`** has a short paragraph on large orders by channel and one chart: a bar of the percentage of each channel's orders over $100. The paragraph names no figures or leading channel, because the tools never return the computed values.

## Check-and-fix rounds

| File                   | Rounds | Detail                                                                                                |
| ---------------------- | ------ | ----------------------------------------------------------------------------------------------------- |
| `product-mix.eda`      | 6      | 5 unsaved checks that changed the design, then 1 save that came back complete                         |
| `product-notes.eda.md` | 2      | Both saves came back complete; I rewrote it once to cut it from three charts to the one you asked for |

## Problems whose suggested fix did not help

1. **Fields "not a field in the source rows" when views use two queries.** The fixes were "Did you mean `order.channel`?" and a list of the other query's fields. Aliases, calculations and groups are checked against every view's query, so fixing one view breaks the other. This is why the dashboard has no percentage bar: it needs a calculation on order data, which cannot sit in the same file as the item-level revenue charts.
2. **"group needs by=, and a field to measure… Write it as `group @byRegion sum(Revenue) by=Region`."** The group was already written that way; the real cause was problem 1.
3. **"The calculations could not run: Unknown field: orders.amount."** It was reported at line 1, column 1, with no fix.
4. **"`spec.upper=100 bins.mode=width bins.width=100 bins.origin=0` doesn't fit histogram."** No fix was given, and the reference lists all four settings for bar charts. I dropped that approach.
5. **"pivot is missing a required setting."** It did not say which setting, and gave no fix. I dropped the pivot.

I filed three feedback reports under `.exploreda/feedback/`:

- **Two-query scoping:** covers problems 1–3.
- **Warnings without fixes or allowed values:** covers problems 4–5, and settings such as `direction=` and `share=` whose accepted values are documented nowhere.
- **No computed values:** no tool returns the numbers a chart produces, so I could not verify results or cite them in the prose.

_Run stats: 24 turns, 144 s, $1.14._
