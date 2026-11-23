# Run 5: run 2's request after the agent-loop pass (summarize, title notes, brief reference, rules up front)

Prompt:

> An explorEDA project is open, and you are connected to it through the exploreda MCP server. You know nothing else about explorEDA; learn it from the tools.
>
> Build a product dashboard and save it as product-mix.eda: revenue by product category, revenue per month split by category, the top customers by revenue, and what share of orders are "large" (over $100) in each sales channel. Add a notebook, product-notes.eda.md, with a short paragraph and one chart that supports it. Keep going until the tools say both are complete. If a tool result was confusing, a fix did not help, or you needed something the tools lack, report it with submit_feedback before you finish. Then tell me what you built, how many check-and-fix rounds each file took, and every problem whose suggested fix did not help.

**Call `project`** `{}`

Result:

```json
{"layout":"visible","projectPath":"exploreda.eda","sources":[{"id":"customers","from":"data/customers.csv","rows":10},{"id":"orders","from":"data/orders.csv","rows":80},{"id":"items","from":"data/items.csv","rows":200},{"id":"products","from":"data/products.csv","rows":7}],"queries":[{"id":"order-lines","name":"Orders with customers"},{"id":"item-lines","name":"Items with orders and products"},{"id":"customer-orders","name":"One customer's orders"},{"id":"customers","name":"Customers"},{"id":"orders","name":"Orders"},{"id":"items","name":"Items"},{"id":"products","name":"Products"}],"analyses"
… (236 more characters)
```

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

**Call `read_eda`** `{"path": "products.eda"}`

Result:

```json
{
  "path": "products.eda",
  "text": "eda query=item-lines\ndashboard \"Products\"\n\nview Products {\n  metric @units sum(items.quantity) title=\"Units sold\"\n  metric @item-revenue sum(items.revenue) title=\"Item revenue\"\n  row product.name title=\"Items by product\"\n  row product.category title=\"Items by category\"\n  scatter @quantity-revenue x=items.quantity y=items.revenue title=\"Quantity and revenue\"\n  layout {\n    2: units item-revenue\n    5: product.name product.category quantity-revenue\n  }\n}\n",
  "version": "782a33fa6036"
}
```

**Call `read_eda`** `{"path": "orders.eda"}`

Result:

```json
{
  "path": "orders.eda",
  "text": "eda query=order-lines\ndashboard \"Orders\"\n\nview Overview {\n  metric @count count title=Orders\n  metric @revenue sum(orders.amount) title=Revenue\n  metric @average avg(orders.amount) title=\"Average order\"\n  row customer.region title=\"Orders by region\"\n  row orders.channel title=\"Orders by channel\"\n  hist orders.amount title=\"Order size\"\n  table @rows orders.orderId,customer.name,orders.channel,orders.orderedAt,orders.amount {\n    title=Orders\n  }\n  layout {\n    2: count revenue average\n    4: customer.region orders.channel orders.amount\n    5: rows\n  }\n}\n\nview \"Aster in spring\" query=customer-orders bind.customer=C01 bind.from=2025-03-01 bind.until=2025-05-31 {\n  metric @spring-count count title=Orders\n  metric @spring-revenue sum(orders.amount) title=Revenue\n  table @spring-rows orders.orderId,orders.orderedAt,orders.channel,orders.amount {\n    title=\"Aster's spring orders\"\n  }\n  layout {\n    2: spring-count spring-revenue\n    5: spring-rows\n  }\n}\n",
  "version": "fc513f3b96aa"
}
```

**Call `reference`** `{"topic": "row"}`

Result:

```json
{"text":"Settings for row:\n  group=  Grouped summary to rank by\n  annotations=\n  facet.enabled=true|false\n  facet.type=wrap|grid\n  facet.rowVariable=<field>\n  facet.columnVariable=<field>  grid only\n  facet.columnCount=  wrap only\n  field=\n  scaleTo=\n  margin.top=16\n  margin.right=24\n  margin.bottom=44\n  margin.left=62\n  maxRowHeight=\n  minRowHeight=\n  note=\n  share=\n  style.titleSize=\n  style.titleWeight=\n  style.subtitleSize=\n  subtitle=\n  title=\n  topN=\n  valueDecimals=\n  valueFormat=\n  xAxis=\n  yAxis=\n  Every chart also takes x.title= x.scale= x.min= x.max= x.gr
… (99 more characters)
```

**Call `reference`** `{"topic": "line"}`

Result:

```json
{"text":"Settings for line:\n  x=  Field on the X axis: a date or a number\n  y=  Fields drawn as lines, one line each\n  annotations=\n  facet.enabled=true|false\n  facet.type=wrap|grid\n  facet.rowVariable=<field>\n  facet.columnVariable=<field>  grid only\n  facet.columnCount=  wrap only\n  field=\n  legendPosition=\n  scaleTo=\n  margin.top=16\n  margin.right=24\n  margin.bottom=44\n  margin.left=62\n  showLegend=\n  showXGrid=\n  showYGrid=\n  styles.curveType=linear\n  time.interval=day|week|month|year\n  time.aggregation=count|sum|average\n  time.measureField=<field>\n  time.splitField=
… (409 more characters)
```

**Call `check`** `{"path": "product-mix.eda"}`

```eda
eda query=item-lines
dashboard "Product mix"

group @categoryRevenue sum(items.revenue) by=product.category
group @customerRevenue sum(items.revenue) by=customer.name
calc isLarge = orders.amount > 100 ? 1 : 0
calc isOrder = 1
group @largeShare sum(isLarge) by=orders.channel denominatorField=isOrder

view "Product mix" {
  metric @revenue sum(items.revenue) title="Item revenue"
  row @by-category product.category group=categoryRevenue title="Revenue by category"
  line @monthly x=order.orderedAt time.interval=month time.aggregation=sum time.measureField=items.revenue time.splitField=product.category time.display=stacked-area {
    title="Monthly revenue by category"
  }
  row @top-customers customer.name group=customerRevenue topN=5 title="Top customers by revenue"
  layout {
    2: revenue
    5: by-category monthly monthly
    5: top-customers
  }
}

view "Large orders" query=orders {
  metric @orders count title=Orders
  row @large-share orders.channel group=largeShare valueFormat=percent valueDecimals=0 title="Share of orders over $100 by channel"
  layout {
    2: orders
    5: large-share
  }
}
```

Result:

```json
{"path":"product-mix.eda","complete":false,"views":[{"name":"Product mix","query":"item-lines","charts":4},{"name":"Large orders","query":"orders","charts":2}],"charts":6,"problems":[{"path":"product-mix.eda","line":4,"column":1,"severity":"error","message":"group @categoryRevenue (line 4) needs by=, and a field to measure unless it counts, so it was skipped.","fix":"This file's views chart item-lines and orders. Alias, calc, and group lines reach every view, so each must name fields that every one of those queries has. Put views on another query in a file of their own."},{"path":"product-mix.eda","line":4,"column":24,"severity":"warning","message":"items.revenue is not a field, alias, or calculation, so group @categoryRevenue (line 4) has no measure.","fix":"This file's views chart item-lines and orders. Alias, calc, and group lines reach every view, so each must name fields that every one of those queries has. Put views on another query in a file of their own."},{"path":"product-mix.eda","line":4,"column":43,"severity":"warning","message":"product.category is not a field, alias, or calculation, so group @categoryRevenue (line 4) has no group field.","fix":"This file's views chart item-lines and orders. Alias, calc, and group lines reach every view, so each must name fields that every one of those queries has. Put views on another query in a file of their own."},{"path":"product-mix.eda","line":5,"column":1,"severity":"error","message":"group @customerRevenue (line 5) needs by=, and a field to measure unless it counts, so it was skipped.","fix":"This file's views chart item-lines and orders. Alias, calc, and group lines reach every view, so each must name fields that every one of those queries has. Put views on another query in a file of their own."},{"path":"product-mix.eda","line":5,"column":24,"severity":"warning","message":"items.revenue is not a field, alias, or calculation, so group @customerRevenue (line 5) has no measure.","fix":"This file's views chart item-lines and orders. Alias, calc, and group lines reach every view, so each must name fields that every one of those queries has. Put views on another query in a file of their own."},{"path":"product-mix.eda","line":5,"column":43,"severity":"warning","message":"customer.name is not a field, alias, or calculation, so group @customerRevenue (line 5) has no group field.","fix":"This file's views chart item-lines and orders. Alias, calc, and group lines reach every view, so each must name fields that every one of those queries has. Put views on another query in a file of their own."},{"path":"product-mix.eda","line":6,"column":16,"severity":"error","message":"calc isLarge uses orders, which is not a field, alias, or calculation, so it was skipped.","fix":"This file's views chart item-lines and orders. Alias, calc, and group lines reach every view, so each must name fields that every one of those queries has. Put views on another query in a file of their own."},{"path":"product-mix.eda","line":8,"column":1,"severity":"error","message":"group @largeShare (line 8) needs by=, and a field to measure unless it counts, so it was skipped.","fix":"This file's views chart item-lines and orders. Alias, calc, and group lines reach every view, so each must name fields that every one of those queries has. Put views on another query in a file of their own."},{"path":"product-mix.eda","line":8,"column":19,"severity":"warning","message":"calc isLarge was skipped, so group @largeShare (line 8) has no measure.","fix":"Fix calc isLarge first."},{"path":"product-mix.eda","line":8,"column":32,"severity":"warning","message":"orders.channel is not a field, alias, or calculation, so group @largeShare (line 8) has no group field.","fix":"This file's views chart item-lines and orders. Alias, calc, and group lines reach every view, so each must name fields that every one of those queries has. Put views on another query in a file of their own."},{"path":"product-mix.eda","line":26,"column":35,"sever
… (171 more characters)
```

**Call `summarize`** `{"query": "item-lines", "by": "product.category", "measure": "items.revenue"}`

Result:

```json
{
  "query": "item-lines",
  "measured": "sum(items.revenue)",
  "rows": 200,
  "groups": [
    { "product.category": "Home", "value": 5862, "rows": 61 },
    { "product.category": "Travel", "value": 3218.4, "rows": 25 },
    { "product.category": "Kitchen", "value": 2281.4, "rows": 58 },
    { "product.category": "Office", "value": 1283.4, "rows": 56 }
  ]
}
```

**Call `summarize`** `{"query": "item-lines", "by": "customer.name", "measure": "items.revenue"}`

Result:

```json
{
  "query": "item-lines",
  "measured": "sum(items.revenue)",
  "rows": 200,
  "groups": [
    { "customer.name": "Hazel", "value": 2138.1, "rows": 25 },
    { "customer.name": "Fir", "value": 1738.7, "rows": 25 },
    { "customer.name": "Birch", "value": 1714, "rows": 32 },
    { "customer.name": "Ivy", "value": 1343.1, "rows": 29 },
    { "customer.name": "Ginkgo", "value": 1286.6, "rows": 21 },
    { "customer.name": "Juniper", "value": 1170.6, "rows": 16 },
    { "customer.name": "Cedar", "value": 1137.1, "rows": 22 },
    { "customer.name": "Elm", "value": 834.4, "rows": 14 },
    { "customer.name": "Aster", "value": 765, "rows": 9 },
    { "customer.name": "Dogwood", "value": 517.6, "rows": 7 }
  ]
}
```

**Call `summarize`** `{"query": "orders", "by": "orders.channel"}`

Result:

```json
{
  "query": "orders",
  "measured": "count",
  "rows": 80,
  "groups": [
    { "orders.channel": "Web", "value": 41, "rows": 41 },
    { "orders.channel": "Store", "value": 20, "rows": 20 },
    { "orders.channel": "Phone", "value": 19, "rows": 19 }
  ]
}
```

**Call `summarize`** `{"query": "orders", "by": "orders.channel", "where": "orders.amount > 100"}`

Result:

```json
{
  "query": "orders",
  "measured": "count",
  "where": "orders.amount > 100",
  "rows": 57,
  "groups": [
    { "orders.channel": "Web", "value": 32, "rows": 32 },
    { "orders.channel": "Store", "value": 13, "rows": 13 },
    { "orders.channel": "Phone", "value": 12, "rows": 12 }
  ]
}
```

**Call `summarize`** `{"query": "orders", "measure": "orders.amount"}`

Result:

```json
{
  "query": "orders",
  "measured": "sum(orders.amount)",
  "rows": 80,
  "groups": [{ "group": "all rows", "value": 12645.2, "rows": 80 }]
}
```

**Call `check`** `{"path": "product-mix.eda"}`

```eda
eda query=item-lines
dashboard "Product mix"

group @categoryRevenue sum(items.revenue) by=product.category
group @customerRevenue sum(items.revenue) by=customer.name
calc orderWeight = items.revenue / order.amount
calc largeWeight = order.amount > 100 ? orderWeight : 0
group @largeShare sum(largeWeight) by=order.channel denominatorField=orderWeight

view "Product mix" {
  metric @revenue sum(items.revenue) title="Item revenue"
  row @by-category product.category group=categoryRevenue title="Revenue by category"
  line @monthly x=order.orderedAt time.interval=month time.aggregation=sum time.measureField=items.revenue time.splitField=product.category time.display=stacked-area {
    title="Monthly revenue by category"
  }
  row @top-customers customer.name group=customerRevenue topN=5 title="Top customers by revenue"
  row @large-share order.channel group=largeShare valueFormat=percent valueDecimals=0 title="Share of orders over $100 by channel"
  layout {
    2: revenue
    5: by-category monthly monthly
    5: top-customers large-share
  }
}
```

Result:

```json
{
  "path": "product-mix.eda",
  "complete": false,
  "views": [{ "name": "Product mix", "query": "item-lines", "charts": 5 }],
  "charts": 5,
  "problems": [
    {
      "path": "product-mix.eda",
      "line": 6,
      "column": 20,
      "severity": "error",
      "message": "calc orderWeight uses items, which is not a field, alias, or calculation, so it was skipped.",
      "fix": "Did you mean items.itemId?"
    },
    {
      "path": "product-mix.eda",
      "line": 6,
      "column": 20,
      "severity": "error",
      "message": "calc orderWeight uses order, which is not a field, alias, or calculation, so it was skipped.",
      "fix": "Did you mean items.orderId?"
    },
    {
      "path": "product-mix.eda",
      "line": 7,
      "column": 20,
      "severity": "error",
      "message": "calc largeWeight uses order, which is not a field, alias, or calculation, so it was skipped.",
      "fix": "Did you mean items.orderId?"
    },
    {
      "path": "product-mix.eda",
      "line": 8,
      "column": 1,
      "severity": "error",
      "message": "group @largeShare (line 8) needs by=, and a field to measure unless it counts, so it was skipped.",
      "fix": "Write it as group @byRegion sum(Revenue) by=Region."
    },
    {
      "path": "product-mix.eda",
      "line": 8,
      "column": 19,
      "severity": "warning",
      "message": "calc largeWeight was skipped, so group @largeShare (line 8) has no measure.",
      "fix": "Fix calc largeWeight first."
    },
    {
      "path": "product-mix.eda",
      "line": 8,
      "column": 53,
      "severity": "warning",
      "message": "calc orderWeight was skipped, so denominatorField keeps its default.",
      "fix": "Fix calc orderWeight first."
    },
    {
      "path": "product-mix.eda",
      "line": 17,
      "column": 34,
      "severity": "warning",
      "message": "largeShare is not a grouped summary in this text, so row @large-share (line 17) keeps the default.",
      "fix": "Declare it with group @largeShare."
    }
  ]
}
```

**Call `check`** `{"path": "scratch.eda"}`

```eda
eda query=item-lines
dashboard "Product mix"

view "Product mix" {
  group @categoryRevenue sum(items.revenue) by=product.category
  row @by-category product.category group=categoryRevenue title="Revenue by category"
}

view "Large orders" query=orders {
  calc isLarge = orders.amount > 100 ? 1 : 0
  calc isOrder = 1
  group @largeShare sum(isLarge) by=orders.channel denominatorField=isOrder
  row @large-share orders.channel group=largeShare valueFormat=percent valueDecimals=0 title="Share of orders over $100 by channel"
}
```

Result:

```json
{
  "path": "scratch.eda",
  "complete": false,
  "views": [
    { "name": "Product mix", "query": "item-lines", "charts": 1 },
    { "name": "Large orders", "query": "orders", "charts": 1 }
  ],
  "charts": 2,
  "problems": [
    {
      "path": "scratch.eda",
      "line": 5,
      "column": 3,
      "severity": "error",
      "message": "group @categoryRevenue (line 5) needs by=, and a field to measure unless it counts, so it was skipped.",
      "fix": "This file's views chart item-lines and orders. Alias, calc, and group lines reach every view, so each must name fields that every one of those queries has. Put views on another query in a file of their own."
    },
    {
      "path": "scratch.eda",
      "line": 5,
      "column": 26,
      "severity": "warning",
      "message": "items.revenue is not a field, alias, or calculation, so group @categoryRevenue (line 5) has no measure.",
      "fix": "This file's views chart item-lines and orders. Alias, calc, and group lines reach every view, so each must name fields that every one of those queries has. Put views on another query in a file of their own."
    },
    {
      "path": "scratch.eda",
      "line": 5,
      "column": 45,
      "severity": "warning",
      "message": "product.category is not a field, alias, or calculation, so group @categoryRevenue (line 5) has no group field.",
      "fix": "This file's views chart item-lines and orders. Alias, calc, and group lines reach every view, so each must name fields that every one of those queries has. Put views on another query in a file of their own."
    },
    {
      "path": "scratch.eda",
      "line": 10,
      "column": 18,
      "severity": "error",
      "message": "calc isLarge uses orders, which is not a field, alias, or calculation, so it was skipped.",
      "fix": "This file's views chart item-lines and orders. Alias, calc, and group lines reach every view, so each must name fields that every one of those queries has. Put views on another query in a file of their own."
    },
    {
      "path": "scratch.eda",
      "line": 12,
      "column": 3,
      "severity": "error",
      "message": "group @largeShare (line 12) needs by=, and a field to measure unless it counts, so it was skipped.",
      "fix": "This file's views chart item-lines and orders. Alias, calc, and group lines reach every view, so each must name fields that every one of those queries has. Put views on another query in a file of their own."
    },
    {
      "path": "scratch.eda",
      "line": 12,
      "column": 21,
      "severity": "warning",
      "message": "calc isLarge was skipped, so group @largeShare (line 12) has no measure.",
      "fix": "Fix calc isLarge first."
    },
    {
      "path": "scratch.eda",
      "line": 12,
      "column": 34,
      "severity": "warning",
      "message": "orders.channel is not a field, alias, or calculation, so group @largeShare (line 12) has no group field.",
      "fix": "This file's views chart item-lines and orders. Alias, calc, and group lines reach every view, so each must name fields that every one of those queries has. Put views on another query in a file of their own."
    },
    {
      "path": "scratch.eda",
      "line": 13,
      "column": 35,
      "severity": "warning",
      "message": "largeShare is not a grouped summary in this text, so row @large-share (line 13) keeps the default.",
      "fix": "Declare it with group @largeShare."
    }
  ]
}
```

**Call `summarize`** `{"query": "item-lines", "by": "items.orderId", "measure": "items.revenue", "limit": 80}`

Result:

```json
{
  "query": "item-lines",
  "measured": "sum(items.revenue)",
  "rows": 200,
  "groups": [
    { "items.orderId": "O029", "value": 528, "rows": 4 },
    { "items.orderId": "O025", "value": 480.4, "rows": 4 },
    { "items.orderId": "O056", "value": 436.5, "rows": 4 },
    { "items.orderId": "O067", "value": 372.6, "rows": 4 },
    { "items.orderId": "O044", "value": 300, "rows": 3 },
    { "items.orderId": "O018", "value": 296.3, "rows": 4 },
    { "items.orderId": "O080", "value": 292, "rows": 4 },
    { "items.orderId": "O014", "value": 271.2, "rows": 2 },
    { "items.orderId": "O052", "value": 270.6, "rows": 4 },
    { "items.orderId": "O060", "value": 270, "rows": 2 },
    { "items.orderId": "O024", "value": 265, "rows": 4 },
    { "items.orderId": "O072", "value": 259.2, "rows": 3 },
    { "items.orderId": "O065", "value": 257.9, "rows": 4 },
    { "items.orderId": "O008", "value": 241.2, "rows": 4 },
    { "items.orderId": "O011", "value": 237.6, "rows": 2 },
    { "items.orderId": "O063", "value": 225.5, "rows": 4 },
    { "items.orderId": "O057", "value": 220, "rows": 2 },
    { "items.orderId": "O068", "value": 219, "rows": 4 },
    { "items.orderId": "O026", "value": 212, "rows": 4 },
    { "items.orderId": "O073", "value": 206.4, "rows": 4 },
    { "items.orderId": "O043", "value": 201, "rows": 4 },
    { "items.orderId": "O041", "value": 195.4, "rows": 3 },
    { "items.orderId": "O042", "value": 195, "rows": 3 },
    { "items.orderId": "O007", "value": 194.4, "rows": 1 },
    { "items.orderId": "O078", "value": 193.8, "rows": 4 },
    { "items.orderId": "O059", "value": 190.5, "rows": 3 },
    { "items.orderId": "O006", "value": 189, "rows": 3 },
    { "items.orderId": "O075", "value": 180.8, "rows": 2 },
    { "items.orderId": "O045", "value": 180, "rows": 1 },
    { "items.orderId": "O034", "value": 174.4, "rows": 2 },
    { "items.orderId": "O038", "value": 173.7, "rows": 3 },
    { "items.orderId": "O030", "value": 173.5, "rows": 4 },
    { "items.orderId": "O016", "value": 173, "rows": 2 },
    { "items.orderId": "O046", "value": 170.8, "rows": 4 },
    { "items.orderId": "O070", "value": 166.8, "rows": 4 },
    { "items.orderId": "O053", "value": 163.8, "rows": 2 },
    { "items.orderId": "O022", "value": 163.2, "rows": 2 },
    { "items.orderId": "O028", "value": 159, "rows": 2 },
    { "items.orderId": "O035", "value": 158, "rows": 2 },
    { "items.orderId": "O005", "value": 156, "rows": 4 },
    { "items.orderId": "O037", "value": 156, "rows": 2 },
    { "items.orderId": "O009", "value": 153.6, "rows": 3 },
    { "items.orderId": "O048", "value": 153.5, "rows": 4 },
    { "items.orderId": "O071", "value": 147.2, "rows": 3 },
    { "items.orderId": "O069", "value": 145.3, "rows": 4 },
    { "items.orderId": "O017", "value": 135, "rows": 1 },
    { "items.orderId": "O033", "value": 132, "rows": 2 },
    { "items.orderId": "O021", "value": 124.5, "rows": 3 },
    { "items.orderId": "O077", "value": 117.6, "rows": 3 },
    { "items.orderId": "O023", "value": 115.2, "rows": 1 },
    { "items.orderId": "O051", "value": 114.6, "rows": 4 },
    { "items.orderId": "O074", "value": 113.4, "rows": 4 },
    { "items.orderId": "O002", "value": 108, "rows": 4 },
    { "items.orderId": "O066", "value": 108, "rows": 1 },
    { "items.orderId": "O013", "value": 104.4, "rows": 2 },
    { "items.orderId": "O003", "value": 104, "rows": 3 },
    { "items.orderId": "O079", "value": 102.6, "rows": 1 },
    { "items.orderId": "O010", "value": 94.4, "rows": 3 },
    { "items.orderId": "O015", "value": 91.2, "rows": 1 },
    { "items.orderId": "O062", "value": 90, "rows": 1 },
    { "items.orderId": "O027", "value": 81, "rows": 3 },
    { "items.orderId": "O049", "value": 81, "rows": 1 },
    { "items.orderId": "O064", "value": 72.8, "rows": 2 },
    { "items.orderId": "O047", "value": 72, "rows": 1 },
    { "items.orderId": "O076", "value": 72, "rows": 1 },
    { "items.orderId": "O040", "value": 64.8, "rows": 1 },
    { "items.orderId": "O036", "value": 60, "rows": 2 },
    { "items.orderId": "O055", "value": 60, "rows": 1 },
    { "items.orderId": "O058", "value": 45, "rows": 1 },
    { "items.orderId": "O050", "value": 40.5, "rows": 1 },
    { "items.orderId": "O054", "value": 33.6, "rows": 2 },
    { "items.orderId": "O032", "value": 30, "rows": 1 },
    { "items.orderId": "O020", "value": 21.6, "rows": 1 },
    { "items.orderId": "O001", "value": 19.2, "rows": 1 },
    { "items.orderId": "O031", "value": 15, "rows": 1 },
    { "items.orderId": "O061", "value": 13.5, "rows": 1 },
    { "items.orderId": "O004", "value": 12, "rows": 1 },
    { "items.orderId": "O039", "value": 12, "rows": 1 },
    { "items.orderId": "O012", "value": 8, "rows": 1 },
    { "items.orderId": "O019", "value": 7.2, "rows": 1 }
  ]
}
```

**Call `summarize`** `{"query": "item-lines", "by": "items.orderId", "measure": "order.amount", "aggregation": "max", "limit": 80}`

Result:

```json
{
  "query": "item-lines",
  "measured": "max(order.amount)",
  "rows": 200,
  "groups": [
    { "items.orderId": "O029", "value": 528, "rows": 4 },
    { "items.orderId": "O025", "value": 480.4, "rows": 4 },
    { "items.orderId": "O056", "value": 436.5, "rows": 4 },
    { "items.orderId": "O067", "value": 372.6, "rows": 4 },
    { "items.orderId": "O044", "value": 300, "rows": 3 },
    { "items.orderId": "O018", "value": 296.3, "rows": 4 },
    { "items.orderId": "O080", "value": 292, "rows": 4 },
    { "items.orderId": "O014", "value": 271.2, "rows": 2 },
    { "items.orderId": "O052", "value": 270.6, "rows": 4 },
    { "items.orderId": "O060", "value": 270, "rows": 2 },
    { "items.orderId": "O024", "value": 265, "rows": 4 },
    { "items.orderId": "O072", "value": 259.2, "rows": 3 },
    { "items.orderId": "O065", "value": 257.9, "rows": 4 },
    { "items.orderId": "O008", "value": 241.2, "rows": 4 },
    { "items.orderId": "O011", "value": 237.6, "rows": 2 },
    { "items.orderId": "O063", "value": 225.5, "rows": 4 },
    { "items.orderId": "O057", "value": 220, "rows": 2 },
    { "items.orderId": "O068", "value": 219, "rows": 4 },
    { "items.orderId": "O026", "value": 212, "rows": 4 },
    { "items.orderId": "O073", "value": 206.4, "rows": 4 },
    { "items.orderId": "O043", "value": 201, "rows": 4 },
    { "items.orderId": "O041", "value": 195.4, "rows": 3 },
    { "items.orderId": "O042", "value": 195, "rows": 3 },
    { "items.orderId": "O007", "value": 194.4, "rows": 1 },
    { "items.orderId": "O078", "value": 193.8, "rows": 4 },
    { "items.orderId": "O059", "value": 190.5, "rows": 3 },
    { "items.orderId": "O006", "value": 189, "rows": 3 },
    { "items.orderId": "O075", "value": 180.8, "rows": 2 },
    { "items.orderId": "O045", "value": 180, "rows": 1 },
    { "items.orderId": "O034", "value": 174.4, "rows": 2 },
    { "items.orderId": "O038", "value": 173.7, "rows": 3 },
    { "items.orderId": "O030", "value": 173.5, "rows": 4 },
    { "items.orderId": "O016", "value": 173, "rows": 2 },
    { "items.orderId": "O046", "value": 170.8, "rows": 4 },
    { "items.orderId": "O070", "value": 166.8, "rows": 4 },
    { "items.orderId": "O053", "value": 163.8, "rows": 2 },
    { "items.orderId": "O022", "value": 163.2, "rows": 2 },
    { "items.orderId": "O028", "value": 159, "rows": 2 },
    { "items.orderId": "O035", "value": 158, "rows": 2 },
    { "items.orderId": "O005", "value": 156, "rows": 4 },
    { "items.orderId": "O037", "value": 156, "rows": 2 },
    { "items.orderId": "O009", "value": 153.6, "rows": 3 },
    { "items.orderId": "O048", "value": 153.5, "rows": 4 },
    { "items.orderId": "O071", "value": 147.2, "rows": 3 },
    { "items.orderId": "O069", "value": 145.3, "rows": 4 },
    { "items.orderId": "O017", "value": 135, "rows": 1 },
    { "items.orderId": "O033", "value": 132, "rows": 2 },
    { "items.orderId": "O021", "value": 124.5, "rows": 3 },
    { "items.orderId": "O077", "value": 117.6, "rows": 3 },
    { "items.orderId": "O023", "value": 115.2, "rows": 1 },
    { "items.orderId": "O051", "value": 114.6, "rows": 4 },
    { "items.orderId": "O074", "value": 113.4, "rows": 4 },
    { "items.orderId": "O002", "value": 108, "rows": 4 },
    { "items.orderId": "O066", "value": 108, "rows": 1 },
    { "items.orderId": "O013", "value": 104.4, "rows": 2 },
    { "items.orderId": "O003", "value": 104, "rows": 3 },
    { "items.orderId": "O079", "value": 102.6, "rows": 1 },
    { "items.orderId": "O010", "value": 94.4, "rows": 3 },
    { "items.orderId": "O015", "value": 91.2, "rows": 1 },
    { "items.orderId": "O062", "value": 90, "rows": 1 },
    { "items.orderId": "O027", "value": 81, "rows": 3 },
    { "items.orderId": "O049", "value": 81, "rows": 1 },
    { "items.orderId": "O064", "value": 72.8, "rows": 2 },
    { "items.orderId": "O047", "value": 72, "rows": 1 },
    { "items.orderId": "O076", "value": 72, "rows": 1 },
    { "items.orderId": "O040", "value": 64.8, "rows": 1 },
    { "items.orderId": "O036", "value": 60, "rows": 2 },
    { "items.orderId": "O055", "value": 60, "rows": 1 },
    { "items.orderId": "O058", "value": 45, "rows": 1 },
    { "items.orderId": "O050", "value": 40.5, "rows": 1 },
    { "items.orderId": "O054", "value": 33.6, "rows": 2 },
    { "items.orderId": "O032", "value": 30, "rows": 1 },
    { "items.orderId": "O020", "value": 21.6, "rows": 1 },
    { "items.orderId": "O001", "value": 19.2, "rows": 1 },
    { "items.orderId": "O031", "value": 15, "rows": 1 },
    { "items.orderId": "O061", "value": 13.5, "rows": 1 },
    { "items.orderId": "O004", "value": 12, "rows": 1 },
    { "items.orderId": "O039", "value": 12, "rows": 1 },
    { "items.orderId": "O012", "value": 8, "rows": 1 },
    { "items.orderId": "O019", "value": 7.2, "rows": 1 }
  ]
}
```

**Call `check`** `{"path": "product-mix.eda"}`

```eda
eda query=item-lines
dashboard "Product mix"

revenue:num=items.revenue label=Revenue
orderAmount:num=order.amount label="Order amount"
category:cat=product.category label=Category
customer:cat=customer.name label=Customer
channel:cat=order.channel label=Channel
orderedAt:date=order.orderedAt label=Ordered

group @categoryRevenue sum(revenue) by=category
group @customerRevenue sum(revenue) by=customer
calc orderWeight = revenue / orderAmount
calc largeWeight = orderAmount > 100 ? orderWeight : 0
group @largeShare sum(largeWeight) by=channel denominatorField=orderWeight

view "Product mix" {
  metric @total sum(revenue) title="Item revenue"
  row @by-category category group=categoryRevenue title="Revenue by category"
  line @monthly x=orderedAt time.interval=month time.aggregation=sum time.measureField=revenue time.splitField=category time.display=stacked-area {
    title="Monthly revenue by category"
  }
  row @top-customers customer group=customerRevenue topN=5 title="Top customers by revenue"
  row @large-share channel group=largeShare valueFormat=percent valueDecimals=0 {
    title="Share of orders over $100 by channel"
    note="Each item row is weighted by its share of the order's amount, so every order counts once."
  }
  layout {
    2: total
    5: by-category monthly monthly
    5: top-customers large-share
  }
}
```

Result:

```json
{
  "path": "product-mix.eda",
  "complete": true,
  "views": [{ "name": "Product mix", "query": "item-lines", "charts": 5 }],
  "charts": 5,
  "problems": []
}
```

**Call `write_eda`** `{"path": "product-mix.eda"}`

```eda
eda query=item-lines
dashboard "Product mix"

revenue:num=items.revenue label=Revenue
orderAmount:num=order.amount label="Order amount"
category:cat=product.category label=Category
customer:cat=customer.name label=Customer
channel:cat=order.channel label=Channel
orderedAt:date=order.orderedAt label=Ordered

group @categoryRevenue sum(revenue) by=category
group @customerRevenue sum(revenue) by=customer
calc orderWeight = revenue / orderAmount
calc largeWeight = orderAmount > 100 ? orderWeight : 0
group @largeShare sum(largeWeight) by=channel denominatorField=orderWeight

view "Product mix" {
  metric @total sum(revenue) title="Item revenue"
  row @by-category category group=categoryRevenue title="Revenue by category"
  line @monthly x=orderedAt time.interval=month time.aggregation=sum time.measureField=revenue time.splitField=category time.display=stacked-area {
    title="Monthly revenue by category"
  }
  row @top-customers customer group=customerRevenue topN=5 title="Top customers by revenue"
  row @large-share channel group=largeShare valueFormat=percent valueDecimals=0 {
    title="Share of orders over $100 by channel"
    note="Each item row is weighted by its share of the order's amount, so every order counts once."
  }
  layout {
    2: total
    5: by-category monthly monthly
    5: top-customers large-share
  }
}
```

Result:

```json
{
  "saved": "product-mix.eda",
  "version": "3d2bf495b270",
  "path": "product-mix.eda",
  "complete": true,
  "views": [{ "name": "Product mix", "query": "item-lines", "charts": 5 }],
  "charts": 5,
  "problems": []
}
```

**Call `check`** `{"path": "product-notes.eda.md"}`

````eda
# Home carries the product mix

Home products bring in $5,862 of the $12,645 in item revenue, about 46%, from 61 of the 200 item lines. Travel is second at $3,218 from only 25 lines, while Kitchen ($2,281) and Office ($1,283) sell nearly as often as Home but earn far less per line.

```eda
eda query=item-lines
revenue:num=items.revenue label=Revenue
category:cat=product.category label=Category
group @categoryRevenue sum(revenue) by=category
row @by-category category group=categoryRevenue title="Revenue by category"
````

````

Result:

```json
{"path":"product-notes.eda.md","complete":true,"views":[],"charts":1,"problems":[]}
````

**Call `write_eda`** `{"path": "product-notes.eda.md"}`

````eda
# Home carries the product mix

Home products bring in $5,862 of the $12,645 in item revenue, about 46%, from 61 of the 200 item lines. Travel is second at $3,218 from only 25 lines, while Kitchen ($2,281) and Office ($1,283) sell nearly as often as Home but earn far less per line.

```eda
eda query=item-lines
revenue:num=items.revenue label=Revenue
category:cat=product.category label=Category
group @categoryRevenue sum(revenue) by=category
row @by-category category group=categoryRevenue title="Revenue by category"
````

````

Result:

```json
{"saved":"product-notes.eda.md","version":"253bb7a7626e","path":"product-notes.eda.md","complete":true,"views":[],"charts":1,"problems":[]}
````

**Call `describe`** `{"path": "product-mix.eda"}`

Result:

```json
{
  "analyses": [
    {
      "path": "product-mix.eda",
      "complete": true,
      "views": [
        {
          "name": "Product mix",
          "query": "item-lines",
          "rows": 200,
          "charts": [
            "Item revenue",
            "Revenue by category",
            "Monthly revenue by category",
            "Top customers by revenue",
            "Share of orders over $100 by channel"
          ]
        }
      ],
      "charts": [
        {
          "name": "metric @total (line 18)",
          "word": "metric",
          "line": 18,
          "title": "Item revenue"
        },
        {
          "name": "row @by-category (line 19)",
          "word": "row",
          "line": 19,
          "title": "Revenue by category"
        },
        {
          "name": "line @monthly (line 20)",
          "word": "line",
          "line": 20,
          "title": "Monthly revenue by category"
        },
        {
          "name": "row @top-customers (line 23)",
          "word": "row",
          "line": 23,
          "title": "Top customers by revenue"
        },
        {
          "name": "row @large-share (line 24)",
          "word": "row",
          "line": 24,
          "title": "Share of orders over $100 by channel"
        }
      ],
      "skipped": [],
      "problems": []
    }
  ],
  "notebooks": []
}
```

**Call `submit_feedback`** `{"kind": "confusing", "tool": "check", "summary": "calc with a dotted field name (items.revenue) gets a wrong \"Did you mean items.itemId?\" fix; also no way to verify a calc/group's numbers or chart two queries in one file", "happened": "1) check on an item-lines analysis with `calc orderWeight = items.revenue / order.amount` returned \"calc orderWeight uses items, which is not a field, alias, or calculation\" with fix \"Did you mean items.itemId?\" and \"uses order ... Did you mean items.orderId?\". The formula parser splits at the dot, and the suggested fix would fail the same way. group lines accept sum(items.revenue) directly, so the difference is surprising. What worked: aliasing first (revenue:num=items.revenue) and using the alias. The reference does mention [\"Unit Price\"] for names with symbols but never says dotted query fields need it.\n2) The dashboard needed item-level charts (item-lines) and an order-level rate (share of orders over $100 by channel, query orders). A second view with query=orders made every group/calc line an error, in or out of the view body; the fix said to use another file, but the request was one dashboard. I had to weight item rows by revenue/order.amount to get an order-level rate inside item-lines.\n3) summarize cannot read calc or group lines, so I could not confirm the percentages the rate chart displays; I verified the inputs by hand (two 80-group summarize calls) instead.", "proposedFix": "1) Let calc formulas read dotted field names as group lines do, or make the fix say: \"Write [\"items.revenue\"], or alias it first: revenue:num=items.revenue\". 2) Scope calc/group lines written inside a view body to that view's query, or add a distinct-count rate (e.g. group @r countDistinct(order.orderId) where=... denominator=countDistinct). 3) Let summarize take an analysis path and a group @name (or chart @name) and return the values the chart draws."}`

Result:

```json
{
  "saved": ".exploreda/feedback/2026-11-23-02-56-31-calc-with-a-dotted-field-name-items-revenue-gets.md"
}
```

**Agent:**

Both files are saved and the tools report them complete with no problems.

## What I built

**`product-mix.eda`** is one view, "Product mix", on the `item-lines` query with five charts:

- **Item revenue**: a total metric ($12,645.20).
- **Revenue by category**: Home $5,862, Travel $3,218, Kitchen $2,281, Office $1,283.
- **Monthly revenue by category**: a stacked area, one band per category.
- **Top customers by revenue**: the top 5, which should be Hazel, Fir, Birch, Ivy and Ginkgo.
- **Share of orders over $100 by channel**: the rate per channel, which should read about Web 78% (32 of 41), Store 65% (13 of 20) and Phone 63% (12 of 19).

The large-order chart is computed indirectly. The file charts item rows, so each item is weighted by its share of its order's amount, which makes every order count once. I confirmed that item revenue adds up to the order amount for all 80 orders, so the weighting is exact. I could not read back the percentages the chart draws; the figures above come from counting orders directly.

**`product-notes.eda.md`** has a short paragraph on Home carrying about 46% of revenue, with the "Revenue by category" chart beneath it.

## Check-and-fix rounds

| File                   | Checks                                                                   | Rounds that needed a fix |
| ---------------------- | ------------------------------------------------------------------------ | ------------------------ |
| `product-mix.eda`      | 4 checks (one a side experiment under a scratch path), then a clean save | 2                        |
| `product-notes.eda.md` | 1 check, then a clean save                                               | 0                        |

## Problems whose suggested fix did not help

1. **Calc lines using dotted field names.** `calc orderWeight = items.revenue / order.amount` was rejected with "uses items, which is not a field" and the fix "Did you mean items.itemId?" (likewise "Did you mean items.orderId?" for `order`). That suggestion would fail the same way. What worked was aliasing the fields first and using the aliases in the formula.
2. **A second view on another query.** Adding a view with `query=orders` turned every group and calc line into an error, wherever I put them. The fix was "Put views on another query in a file of their own", which is accurate but conflicts with wanting one dashboard file. I used the weighting approach instead.

I filed one feedback report covering both, plus the gap that `summarize` cannot read calc or group lines.

_Run stats: 26 turns, 67 s, $0.87._
