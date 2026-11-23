# Run 4: run 2's request with every tool (M5, packed command)

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

**Call `read_eda`** `{"path": "orders.eda"}`

Result:

```json
{
  "path": "orders.eda",
  "text": "eda query=order-lines\ndashboard \"Orders\"\n\nview Overview {\n  metric @count count title=Orders\n  metric @revenue sum(orders.amount) title=Revenue\n  metric @average avg(orders.amount) title=\"Average order\"\n  row customer.region title=\"Orders by region\"\n  row orders.channel title=\"Orders by channel\"\n  hist orders.amount title=\"Order size\"\n  table @rows orders.orderId,customer.name,orders.channel,orders.orderedAt,orders.amount {\n    title=Orders\n  }\n  layout {\n    2: count revenue average\n    4: customer.region orders.channel orders.amount\n    5: rows\n  }\n}\n\nview \"Aster in spring\" query=customer-orders bind.customer=C01 bind.from=2025-03-01 bind.until=2025-05-31 {\n  metric @spring-count count title=Orders\n  metric @spring-revenue sum(orders.amount) title=Revenue\n  table @spring-rows orders.orderId,orders.orderedAt,orders.channel,orders.amount {\n    title=\"Aster's spring orders\"\n  }\n  layout {\n    2: spring-count spring-revenue\n    5: spring-rows\n  }\n}\n",
  "version": "fc513f3b96aa"
}
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

**Call `check`** `{"path": "product-mix.eda"}`

```eda
eda query=item-lines
dashboard "Product mix"

view "Product mix" {
  group @byCategory sum(items.revenue) by=product.category
  group @byCustomer sum(items.revenue) by=customer.name
  metric @revenue sum(items.revenue) title="Item revenue"
  row @category product.category group=byCategory title="Revenue by category"
  line @monthly x=order.orderedAt time.interval=month time.aggregation=sum time.measureField=items.revenue time.splitField=product.category time.display=stacked-area {
    title="Revenue per month by category"
  }
  row @customers customer.name group=byCustomer topN=5 title="Top customers by revenue"
  layout {
    2: revenue
    5: category monthly monthly
    5: customers
  }
}

view "Large orders" query=order-lines {
  calc large = if orders.amount > 100 then 1 else 0
  calc one = 1
  group @largeShare sum(large) by=orders.channel denominatorField=one
  metric @orders count title=Orders
  row @large orders.channel group=largeShare valueFormat=percent valueDecimals=0 title="Share of orders over $100 by channel"
  layout {
    2: orders
    5: large
  }
}
```

Result:

```json
{
  "path": "product-mix.eda",
  "complete": false,
  "views": [
    { "name": "Product mix", "query": "item-lines", "charts": 4 },
    { "name": "Large orders", "query": "order-lines", "charts": 2 }
  ],
  "charts": 6,
  "problems": [
    {
      "path": "product-mix.eda",
      "line": 5,
      "column": 3,
      "severity": "error",
      "message": "group @byCategory (line 5) needs by=, and a field to measure unless it counts, so it was skipped.",
      "fix": "Write it as group @byRegion sum(Revenue) by=Region."
    },
    {
      "path": "product-mix.eda",
      "line": 5,
      "column": 21,
      "severity": "warning",
      "message": "items.revenue is not a field, alias, or calculation, so group @byCategory (line 5) has no measure.",
      "fix": "Fields: orders.orderId, orders.customerId, orders.channel, orders.orderedAt, orders.amount, customer.customerId, customer.name, customer.region, customer.joinedAt, large, one."
    },
    {
      "path": "product-mix.eda",
      "line": 5,
      "column": 40,
      "severity": "warning",
      "message": "product.category is not a field, alias, or calculation, so group @byCategory (line 5) has no group field.",
      "fix": "Fields: orders.orderId, orders.customerId, orders.channel, orders.orderedAt, orders.amount, customer.customerId, customer.name, customer.region, customer.joinedAt, large, one."
    },
    {
      "path": "product-mix.eda",
      "line": 6,
      "column": 3,
      "severity": "error",
      "message": "group @byCustomer (line 6) needs by=, and a field to measure unless it counts, so it was skipped.",
      "fix": "Write it as group @byRegion sum(Revenue) by=Region."
    },
    {
      "path": "product-mix.eda",
      "line": 6,
      "column": 21,
      "severity": "warning",
      "message": "items.revenue is not a field, alias, or calculation, so group @byCustomer (line 6) has no measure.",
      "fix": "Fields: orders.orderId, orders.customerId, orders.channel, orders.orderedAt, orders.amount, customer.customerId, customer.name, customer.region, customer.joinedAt, large, one."
    },
    {
      "path": "product-mix.eda",
      "line": 21,
      "column": 16,
      "severity": "error",
      "message": "calc large uses orders, which is not a field, alias, or calculation, so it was skipped.",
      "fix": "Name a source field, an alias, or another calculation."
    },
    {
      "path": "product-mix.eda",
      "line": 23,
      "column": 3,
      "severity": "error",
      "message": "group @largeShare (line 23) needs by=, and a field to measure unless it counts, so it was skipped.",
      "fix": "Write a rate as group @rate sum(Completions) by=Passer denominatorField=Attempts."
    },
    {
      "path": "product-mix.eda",
      "line": 23,
      "column": 21,
      "severity": "warning",
      "message": "calc large was skipped, so group @largeShare (line 23) has no measure.",
      "fix": "Fix calc large first."
    },
    {
      "path": "product-mix.eda",
      "line": 23,
      "column": 32,
      "severity": "warning",
      "message": "orders.channel is not a field, alias, or calculation, so group @largeShare (line 23) has no group field.",
      "fix": "Did you mean order.channel?"
    },
    {
      "path": "product-mix.eda",
      "line": 25,
      "column": 29,
      "severity": "warning",
      "message": "largeShare is not a grouped summary in this text, so row @large (line 25) keeps the default.",
      "fix": "Declare it with group @largeShare."
    }
  ]
}
```

**Call `check`** `{"path": "product-mix.eda"}`

```eda
eda query=item-lines
dashboard "Product mix"

view "Product mix" {
  revenue:num=items.revenue label=Revenue
  category:cat=product.category label=Category
  buyer:cat=customer.name label=Customer
  month:date=order.orderedAt label=Month
  group @byCategory sum(revenue) by=category
  group @byCustomer sum(revenue) by=buyer
  metric @total sum(revenue) title="Item revenue"
  row @categories category group=byCategory title="Revenue by category"
  line @monthly x=month time.interval=month time.aggregation=sum time.measureField=revenue time.splitField=category time.display=stacked-area {
    title="Revenue per month by category"
  }
  row @customers buyer group=byCustomer topN=5 title="Top customers by revenue"
  layout {
    2: total
    5: categories monthly monthly
    5: customers
  }
}

view "Large orders" query=order-lines {
  amount:num=orders.amount label=Amount
  channel:cat=orders.channel label=Channel
  calc large = if amount > 100 then 1 else 0
  calc one = 1
  group @largeShare sum(large) by=channel denominatorField=one
  metric @orders count title=Orders
  row @largeByChannel channel group=largeShare valueFormat=percent valueDecimals=0 title="Share of orders over $100 by channel"
  layout {
    2: orders
    5: largeByChannel
  }
}
```

Result:

```json
{"path":"product-mix.eda","complete":false,"views":[{"name":"Product mix","query":"item-lines","charts":0},{"name":"Large orders","query":"order-lines","charts":1}],"charts":1,"problems":[{"path":"product-mix.eda","line":5,"column":3,"severity":"warning","message":"revenue:num is not a view setting, so it was ignored.","fix":"Name the view, as in view \"Overview\"."},{"path":"product-mix.eda","line":5,"column":29,"severity":"warning","message":"label is not a view setting, so it was ignored.","fix":"Name the view, as in view \"Overview\"."},{"path":"product-mix.eda","line":6,"column":3,"severity":"warning","message":"category:cat is not a view setting, so it was ignored.","fix":"Name the view, as in view \"Overview\"."},{"path":"product-mix.eda","line":6,"column":33,"severity":"warning","message":"label is not a view setting, so it was ignored.","fix":"Name the view, as in view \"Overview\"."},{"path":"product-mix.eda","line":7,"column":3,"severity":"warning","message":"buyer:cat is not a view setting, so it was ignored.","fix":"Name the view, as in view \"Overview\"."},{"path":"product-mix.eda","line":7,"column":27,"severity":"warning","message":"label is not a view setting, so it was ignored.","fix":"Name the view, as in view \"Overview\"."},{"path":"product-mix.eda","line":8,"column":3,"severity":"warning","message":"month:date is not a view setting, so it was ignored.","fix":"Name the view, as in view \"Overview\"."},{"path":"product-mix.eda","line":8,"column":30,"severity":"warning","message":"label is not a view setting, so it was ignored.","fix":"Name the view, as in view \"Overview\"."},{"path":"product-mix.eda","line":9,"column":3,"severity":"error","message":"group @byCategory (line 9) needs by=, and a field to measure unless it counts, so it was skipped.","fix":"Write it as group @byRegion sum(Revenue) by=Region."},{"path":"product-mix.eda","line":9,"column":21,"severity":"warning","message":"revenue is not a field, alias, or calculation, so group @byCategory (line 9) has no measure.","fix":"Did you mean items.revenue?"},{"path":"product-mix.eda","line":9,"column":34,"severity":"warning","message":"category is not a field, alias, or calculation, so group @byCategory (line 9) has no group field.","fix":"Did you mean product.category?"},{"path":"product-mix.eda","line":10,"column":3,"severity":"error","message":"group @byCustomer (line 10) needs by=, and a field to measure unless it counts, so it was skipped.","fix":"Write it as group @byRegion sum(Revenue) by=Region."},{"path":"product-mix.eda","line":10,"column":21,"severity":"warning","message":"revenue is not a field, alias, or calculation, so group @byCustomer (line 10) has no measure.","fix":"Did you mean items.revenue?"},{"path":"product-mix.eda","line":10,"column":34,"severity":"warning","message":"buyer is not a field, alias, or calculation, so group @byCustomer (line 10) has no group field.","fix":"Fields: items.itemId, items.orderId, items.productId, items.quantity, items.revenue, order.orderId, order.customerId, order.channel, order.orderedAt, order.amount, product.productId, product.name, product.category, product.price, customer.customerId, customer.name, customer.region, customer.joinedAt, large, one."},{"path":"product-mix.eda","line":11,"column":17,"severity":"error","message":"revenue is not a field, alias, or calculation, so metric @total (line 11) was skipped.","fix":"Did you mean items.revenue?"},{"path":"product-mix.eda","line":12,"column":19,"severity":"error","message":"category is not a field, alias, or calculation, so row @categories (line 12) was skipped.","fix":"Did you mean product.category?"},{"path":"product-mix.eda","line":13,"column":3,"severity":"error","message":"line @monthly (line 13) is missing a required setting, so it was skipped.","fix":"Write it as line x=<field> y=<field>,<field>."},{"path":"product-mix.eda","line":13,"column":17,"severity":"warning","message":"month is not a field, alias, or calculation, so xField keeps its
… (4451 more characters)
```

**Call `check`** `{"path": "product-mix.eda"}`

```eda
eda query=item-lines
dashboard "Product mix"

revenue:num=items.revenue label=Revenue
category:cat=product.category label=Category
buyer:cat=customer.name label=Customer
month:date=order.orderedAt label=Month
amount:num=orders.amount label=Amount
channel:cat=orders.channel label=Channel
calc large = if amount > 100 then 1 else 0
calc one = 1
group @byCategory sum(revenue) by=category
group @byCustomer sum(revenue) by=buyer
group @largeShare sum(large) by=channel denominatorField=one

view "Product mix" {
  metric @total sum(revenue) title="Item revenue"
  row @categories category group=byCategory title="Revenue by category"
  line @monthly x=month time.interval=month time.aggregation=sum time.measureField=revenue time.splitField=category time.display=stacked-area {
    title="Revenue per month by category"
  }
  row @customers buyer group=byCustomer topN=5 title="Top customers by revenue"
  layout {
    2: total
    5: categories monthly monthly
    5: customers
  }
}

view "Large orders" query=order-lines {
  metric @orders count title=Orders
  row @largeByChannel channel group=largeShare valueFormat=percent valueDecimals=0 title="Share of orders over $100 by channel"
  layout {
    2: orders
    5: largeByChannel
  }
}
```

Result:

```json
{
  "path": "product-mix.eda",
  "complete": false,
  "views": [
    { "name": "Product mix", "query": "item-lines", "charts": 4 },
    { "name": "Large orders", "query": "order-lines", "charts": 2 }
  ],
  "charts": 6,
  "problems": [
    {
      "path": "product-mix.eda",
      "line": 4,
      "column": 1,
      "severity": "error",
      "message": "items.revenue is not a field in the source rows, so revenue is unavailable.",
      "fix": "Fields: orders.orderId, orders.customerId, orders.channel, orders.orderedAt, orders.amount, customer.customerId, customer.name, customer.region, customer.joinedAt."
    },
    {
      "path": "product-mix.eda",
      "line": 5,
      "column": 1,
      "severity": "error",
      "message": "product.category is not a field in the source rows, so category is unavailable.",
      "fix": "Fields: orders.orderId, orders.customerId, orders.channel, orders.orderedAt, orders.amount, customer.customerId, customer.name, customer.region, customer.joinedAt."
    },
    {
      "path": "product-mix.eda",
      "line": 7,
      "column": 1,
      "severity": "error",
      "message": "order.orderedAt is not a field in the source rows, so month is unavailable.",
      "fix": "Did you mean orders.orderedAt?"
    },
    {
      "path": "product-mix.eda",
      "line": 8,
      "column": 1,
      "severity": "error",
      "message": "orders.amount is not a field in the source rows, so amount is unavailable.",
      "fix": "Did you mean order.amount?"
    },
    {
      "path": "product-mix.eda",
      "line": 9,
      "column": 1,
      "severity": "error",
      "message": "orders.channel is not a field in the source rows, so channel is unavailable.",
      "fix": "Did you mean order.channel?"
    },
    {
      "path": "product-mix.eda",
      "line": 10,
      "column": 14,
      "severity": "error",
      "message": "calc large uses amount, whose source field is missing, so it was skipped.",
      "fix": "Did you mean order.amount?"
    },
    {
      "path": "product-mix.eda",
      "line": 12,
      "column": 1,
      "severity": "error",
      "message": "group @byCategory (line 12) needs by=, and a field to measure unless it counts, so it was skipped.",
      "fix": "Write it as group @byRegion sum(Revenue) by=Region."
    },
    {
      "path": "product-mix.eda",
      "line": 12,
      "column": 19,
      "severity": "warning",
      "message": "The source field for revenue is missing, so group @byCategory (line 12) has no measure.",
      "fix": "Fix the revenue alias on line 4."
    },
    {
      "path": "product-mix.eda",
      "line": 12,
      "column": 32,
      "severity": "warning",
      "message": "The source field for category is missing, so group @byCategory (line 12) has no group field.",
      "fix": "Fix the category alias on line 5."
    },
    {
      "path": "product-mix.eda",
      "line": 13,
      "column": 1,
      "severity": "error",
      "message": "group @byCustomer (line 13) needs by=, and a field to measure unless it counts, so it was skipped.",
      "fix": "Write it as group @byRegion sum(Revenue) by=Region."
    },
    {
      "path": "product-mix.eda",
      "line": 13,
      "column": 19,
      "severity": "warning",
      "message": "The source field for revenue is missing, so group @byCustomer (line 13) has no measure.",
      "fix": "Fix the revenue alias on line 4."
    },
    {
      "path": "product-mix.eda",
      "line": 14,
      "column": 1,
      "severity": "error",
      "message": "group @largeShare (line 14) needs by=, and a field to measure unless it counts, so it was skipped.",
      "fix": "Write a rate as group @rate sum(Completions) by=Passer denominatorField=Attempts."
    },
    {
      "path": "product-mix.eda",
      "line": 14,
      "column": 19,
      "severity": "warning",
      "message": "calc large was skipped, so group @largeShare (line 14) has no measure.",
      "fix": "Fix calc large first."
    },
    {
      "path": "product-mix.eda",
      "line": 14,
      "column": 30,
      "severity": "warning",
      "message": "The source field for channel is missing, so group @largeShare (line 14) has no group field.",
      "fix": "Fix the channel alias on line 9."
    }
  ]
}
```

**Call `reference`** `{"topic": "project"}`

Result:

```json
{"text":"Project text: exploreda.eda at the folder's top (or .exploreda/project.eda).\nOne declaration per line; @name gives it an ID, { } holds its body, and a\nvalue with spaces is quoted. Every other .eda file is an analysis, and every\n.eda.md file is a notebook (exploreda-dsl reference notebook).\n\n  project @shop\n\n  connection @shop driver=sqlite path=data/shop.db\n  source @orders key=orderId db=shop table=orders\n  source @returns db=shop sql=\"select r.returnId, o.amount from returns r join orders o using (orderId)\" limit=200000\n  source @customers path=data/customers.csv\n\n  re
… (5275 more characters)
```

**Call `read_eda`** `{"path": "exploreda.eda"}`

Result:

```json
{
  "path": "exploreda.eda",
  "text": "project @shop\n\nsource @customers key=customerId path=data/customers.csv {\n  field customerId string\n  field name string\n  field region string\n  field joinedAt Joined date\n}\n\nsource @orders key=orderId path=data/orders.csv {\n  field orderId string\n  field customerId string\n  field channel string\n  field orderedAt Ordered date\n  field amount number\n}\n\nsource @items key=itemId path=data/items.csv {\n  field itemId string\n  field orderId string\n  field productId string\n  field quantity number\n  field revenue number\n}\n\nsource @products key=productId path=data/products.csv {\n  field productId string\n  field name Product string\n  field category string\n  field price number\n}\n\nrelate @order-customer orders.customerId -> customers.customerId\nrelate @item-order items.orderId -> orders.orderId\nrelate @item-product items.productId -> products.productId\n\nquery @order-lines \"Orders with customers\" glyph=◆ {\n  source orders\n  lookup customer via=order-customer\n}\n\nquery @item-lines \"Items with orders and products\" glyph=◇ {\n  source items\n  lookup order via=item-order\n  lookup product via=item-product\n  lookup customer via=order-customer on=order.customerId\n}\n\nquery @customer-orders \"One customer's orders\" glyph=● {\n  source orders\n  filter @chosen orders.customerId = $customer\n  filter @after orders.orderedAt >= $from\n  filter @before orders.orderedAt <= $until\n}\n\nparam @customer string required pick=customers.name\nparam @from date required\nparam @until date required\n",
  "version": "b3bf13527c0c"
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

**Call `reference`** `{"topic": "bar"}`

Result:

```json
{"text":"Settings for bar:\n  x.title=  X axis title; blank uses the field's label\n  x.scale=linear|log|symlog|time|band  X axis scale\n  x.min=  Lowest value the X axis shows; rows below stay counted\n  x.max=  Highest value the X axis shows\n  x.grid=  Grid lines across the plot from X axis ticks\n  x.ticks=  About how many X axis ticks to show\n  y.title=  Y axis title; blank uses the field's label\n  y.scale=linear|log|symlog|time|band  Y axis scale\n  y.min=  Lowest value the Y axis shows; rows below stay counted\n  y.max=  Highest value the Y axis shows\n  y.grid=  Grid lines across the
… (1212 more characters)
```

**Call `check`** `{"path": "product-mix.eda"}`

```eda
eda query=item-lines
dashboard "Product mix"

view "Product mix" {
  group @byCategory sum(items.revenue) by=product.category
  row @categories product.category group=byCategory title="Revenue by category"
  layout {
    5: categories
  }
}

view "Large orders" query=order-lines {
  calc large = if ["orders.amount"] > 100 then 1 else 0
  calc one = 1
  group @largeShare sum(large) by=orders.channel denominatorField=one
  row @largeByChannel orders.channel group=largeShare valueFormat=percent valueDecimals=0 title="Share of orders over $100 by channel"
  layout {
    5: largeByChannel
  }
}
```

Result:

```json
{
  "path": "product-mix.eda",
  "complete": false,
  "views": [
    { "name": "Product mix", "query": "item-lines", "charts": 1 },
    { "name": "Large orders", "query": "order-lines", "charts": 1 }
  ],
  "charts": 2,
  "problems": [
    {
      "path": "product-mix.eda",
      "line": 5,
      "column": 3,
      "severity": "error",
      "message": "group @byCategory (line 5) needs by=, and a field to measure unless it counts, so it was skipped.",
      "fix": "Write it as group @byRegion sum(Revenue) by=Region."
    },
    {
      "path": "product-mix.eda",
      "line": 5,
      "column": 21,
      "severity": "warning",
      "message": "items.revenue is not a field, alias, or calculation, so group @byCategory (line 5) has no measure.",
      "fix": "Fields: orders.orderId, orders.customerId, orders.channel, orders.orderedAt, orders.amount, customer.customerId, customer.name, customer.region, customer.joinedAt, large, one."
    },
    {
      "path": "product-mix.eda",
      "line": 5,
      "column": 40,
      "severity": "warning",
      "message": "product.category is not a field, alias, or calculation, so group @byCategory (line 5) has no group field.",
      "fix": "Fields: orders.orderId, orders.customerId, orders.channel, orders.orderedAt, orders.amount, customer.customerId, customer.name, customer.region, customer.joinedAt, large, one."
    },
    {
      "path": "product-mix.eda",
      "line": 13,
      "column": 16,
      "severity": "error",
      "message": "The calculations could not run: Unknown field: orders.amount",
      "fix": "Did you mean order.amount? Calc lines reach every view in the file, so each field they name must be in every view's query. Put a calc for one query's fields in a file of its own, or in a notebook block for that query."
    },
    {
      "path": "product-mix.eda",
      "line": 15,
      "column": 3,
      "severity": "error",
      "message": "group @largeShare (line 15) needs by=, and a field to measure unless it counts, so it was skipped.",
      "fix": "Write a rate as group @rate sum(Completions) by=Passer denominatorField=Attempts."
    },
    {
      "path": "product-mix.eda",
      "line": 15,
      "column": 32,
      "severity": "warning",
      "message": "orders.channel is not a field, alias, or calculation, so group @largeShare (line 15) has no group field.",
      "fix": "Did you mean order.channel?"
    }
  ]
}
```

**Call `write_eda`** `{"path": "exploreda.eda", "version": "b3bf13527c0c"}`

```eda
project @shop

source @customers key=customerId path=data/customers.csv {
  field customerId string
  field name string
  field region string
  field joinedAt Joined date
}

source @orders key=orderId path=data/orders.csv {
  field orderId string
  field customerId string
  field channel string
  field orderedAt Ordered date
  field amount number
}

source @items key=itemId path=data/items.csv {
  field itemId string
  field orderId string
  field productId string
  field quantity number
  field revenue number
}

source @products key=productId path=data/products.csv {
  field productId string
  field name Product string
  field category string
  field price number
}

relate @order-customer orders.customerId -> customers.customerId
relate @item-order items.orderId -> orders.orderId
relate @item-product items.productId -> products.productId

query @order-lines "Orders with customers" glyph=◆ {
  source orders
  lookup customer via=order-customer
}

query @item-lines "Items with orders and products" glyph=◇ {
  source items
  lookup order via=item-order
  lookup product via=item-product
  lookup customer via=order-customer on=order.customerId
}

query @customer-orders "One customer's orders" glyph=● {
  source orders
  filter @chosen orders.customerId = $customer
  filter @after orders.orderedAt >= $from
  filter @before orders.orderedAt <= $until
}

query @tmp-order-totals "Temporary check" glyph=▲ {
  source items
  lookup order via=item-order
  aggregate @t by=items.orderId {
    sum @itemTotal items.revenue
    max @orderAmount order.amount
  }
  calc diff = itemTotal - orderAmount
}

param @customer string required pick=customers.name
param @from date required
param @until date required
```

Result:

```json
{
  "saved": "exploreda.eda",
  "version": "9f07bfa6410a",
  "path": "exploreda.eda",
  "complete": true,
  "views": [],
  "charts": 0,
  "problems": []
}
```

**Call `fields`** `{"query": "tmp-order-totals"}`

Result:

```json
{
  "queries": [
    {
      "query": "tmp-order-totals",
      "name": "Temporary check",
      "rows": 80,
      "fields": [
        {
          "name": "items.orderId",
          "type": "cat",
          "missing": 0,
          "sample": "80 distinct: O001, O002, O003, O004, O005, O006, …"
        },
        {
          "name": "itemTotal",
          "type": "num",
          "missing": 0,
          "sample": "7.2 to 528"
        },
        {
          "name": "orderAmount",
          "type": "num",
          "missing": 0,
          "sample": "7.2 to 528"
        },
        {
          "name": "diff",
          "type": "num",
          "missing": 0,
          "sample": "-2.842170943040401e-14 to 5.684341886080802e-14"
        }
      ]
    }
  ],
  "howToUse": "Start an analysis with `eda query=<query>` and name fields as listed, such as orders.amount. Alias one for a short name: amount:num=orders.amount."
}
```

**Call `write_eda`** `{"path": "exploreda.eda", "version": "9f07bfa6410a"}`

```eda
project @shop

source @customers key=customerId path=data/customers.csv {
  field customerId string
  field name string
  field region string
  field joinedAt Joined date
}

source @orders key=orderId path=data/orders.csv {
  field orderId string
  field customerId string
  field channel string
  field orderedAt Ordered date
  field amount number
}

source @items key=itemId path=data/items.csv {
  field itemId string
  field orderId string
  field productId string
  field quantity number
  field revenue number
}

source @products key=productId path=data/products.csv {
  field productId string
  field name Product string
  field category string
  field price number
}

relate @order-customer orders.customerId -> customers.customerId
relate @item-order items.orderId -> orders.orderId
relate @item-product items.productId -> products.productId

query @order-lines "Orders with customers" glyph=◆ {
  source orders
  lookup customer via=order-customer
}

query @item-lines "Items with orders and products" glyph=◇ {
  source items
  lookup order via=item-order
  lookup product via=item-product
  lookup customer via=order-customer on=order.customerId
}

query @customer-orders "One customer's orders" glyph=● {
  source orders
  filter @chosen orders.customerId = $customer
  filter @after orders.orderedAt >= $from
  filter @before orders.orderedAt <= $until
}

param @customer string required pick=customers.name
param @from date required
param @until date required
```

Result:

```json
{
  "saved": "exploreda.eda",
  "version": "b3bf13527c0c",
  "path": "exploreda.eda",
  "complete": true,
  "views": [],
  "charts": 0,
  "problems": []
}
```

**Call `write_eda`** `{"path": "product-mix.eda"}`

```eda
eda query=item-lines
dashboard "Product mix"

revenue:num=items.revenue label=Revenue
category:cat=product.category label=Category
buyer:cat=customer.name label=Customer
month:date=order.orderedAt label=Ordered
amount:num=order.amount label="Order amount"
channel:cat=order.channel label=Channel
calc orderPart = revenue / amount
calc largePart = if amount > 100 then orderPart else 0
group @byCategory sum(revenue) by=category
group @byCustomer sum(revenue) by=buyer
group @largeShare sum(largePart) by=channel denominatorField=orderPart

view "Product mix" {
  metric @total sum(revenue) title="Item revenue"
  row @categories category group=byCategory title="Revenue by category"
  line @monthly x=month time.interval=month time.aggregation=sum time.measureField=revenue time.splitField=category time.display=stacked-area {
    title="Revenue per month by category"
  }
  row @customers buyer group=byCustomer topN=5 title="Top customers by revenue"
  row @largeByChannel channel group=largeShare valueFormat=percent valueDecimals=0 {
    title="Share of orders over $100 by channel"
    note="Each item counts as its fraction of its order, so every order counts once."
  }
  layout {
    2: total
    5: categories:4 monthly:8
    5: customers largeByChannel
  }
}
```

Result:

```json
{
  "saved": "product-mix.eda",
  "version": "6d2f363d27d0",
  "path": "product-mix.eda",
  "complete": true,
  "views": [{ "name": "Product mix", "query": "item-lines", "charts": 5 }],
  "charts": 5,
  "problems": []
}
```

**Call `write_eda`** `{"path": "product-notes.eda.md"}`

````eda
# Product mix notes

The shop's revenue comes from {{lines}} item lines across four product categories: Kitchen, Office, Home, and Travel. The chart below totals item revenue by category, which is the first thing to read before the monthly and customer breakdowns in the product-mix dashboard: it shows which categories carry the business and which are small enough that a month-to-month swing in them matters little.

```eda
eda query=item-lines
revenue:num=items.revenue label=Revenue
category:cat=product.category label=Category
group @byCategory sum(revenue) by=category
row @categories category group=byCategory title="Revenue by category"
finding @lines count chart=@categories
````

````

Result:

```json
{"saved":"product-notes.eda.md","version":"fc365647120b","path":"product-notes.eda.md","complete":true,"views":[],"charts":1,"problems":[]}
````

**Call `describe`** `{}`

Result:

```json
{
  "analyses": [
    {
      "path": "orders.eda",
      "complete": true,
      "views": [
        {
          "name": "Overview",
          "query": "order-lines",
          "rows": 80,
          "charts": [
            { "type": "metric-card", "title": "Orders" },
            { "type": "metric-card", "title": "Revenue" },
            { "type": "metric-card", "title": "Average order" },
            { "type": "row", "title": "Orders by region" },
            { "type": "row", "title": "Orders by channel" },
            { "type": "bar", "title": "Order size" },
            { "type": "data-table", "title": "Orders" }
          ]
        },
        {
          "name": "Aster in spring",
          "query": "customer-orders",
          "rows": 2,
          "charts": [
            { "type": "metric-card", "title": "Orders" },
            { "type": "metric-card", "title": "Revenue" },
            { "type": "data-table", "title": "Aster's spring orders" }
          ]
        }
      ],
      "charts": [
        {
          "name": "metric @count (line 5)",
          "type": "metric-card",
          "line": 5,
          "title": "Orders"
        },
        {
          "name": "metric @revenue (line 6)",
          "type": "metric-card",
          "line": 6,
          "title": "Revenue"
        },
        {
          "name": "metric @average (line 7)",
          "type": "metric-card",
          "line": 7,
          "title": "Average order"
        },
        {
          "name": "row (line 8)",
          "type": "row",
          "line": 8,
          "title": "Orders by region"
        },
        {
          "name": "row (line 9)",
          "type": "row",
          "line": 9,
          "title": "Orders by channel"
        },
        {
          "name": "hist (line 10)",
          "type": "bar",
          "line": 10,
          "title": "Order size"
        },
        {
          "name": "table @rows (line 11)",
          "type": "data-table",
          "line": 11,
          "title": "Orders"
        },
        {
          "name": "metric @spring-count (line 22)",
          "type": "metric-card",
          "line": 22,
          "title": "Orders"
        },
        {
          "name": "metric @spring-revenue (line 23)",
          "type": "metric-card",
          "line": 23,
          "title": "Revenue"
        },
        {
          "name": "table @spring-rows (line 24)",
          "type": "data-table",
          "line": 24,
          "title": "Aster's spring orders"
        }
      ],
      "skipped": [],
      "problems": []
    },
    {
      "path": "product-mix.eda",
      "complete": true,
      "views": [
        {
          "name": "Product mix",
          "query": "item-lines",
          "rows": 200,
          "charts": [
            { "type": "metric-card", "title": "Item revenue" },
            { "type": "row", "title": "Revenue by category" },
            { "type": "line", "title": "Revenue per month by category" },
            { "type": "row", "title": "Top customers by revenue" },
            { "type": "row", "title": "Share of orders over $100 by channel" }
          ]
        }
      ],
      "charts": [
        {
          "name": "metric @total (line 17)",
          "type": "metric-card",
          "line": 17,
          "title": "Item revenue"
        },
        {
          "name": "row @categories (line 18)",
          "type": "row",
          "line": 18,
          "title": "Revenue by category"
        },
        {
          "name": "line @monthly (line 19)",
          "type": "line",
          "line": 19,
          "title": "Revenue per month by category"
        },
        {
          "name": "row @customers (line 22)",
          "type": "row",
          "line": 22,
          "title": "Top customers by revenue"
        },
        {
          "name": "row @largeByChannel (line 23)",
          "type": "row",
          "line": 23,
          "title": "Share of orders over $100 by channel"
        }
      ],
      "skipped": [],
      "problems": []
    },
    {
      "path": "products.eda",
      "complete": true,
      "views": [
        {
          "name": "Products",
          "query": "item-lines",
          "rows": 200,
          "charts": [
            { "type": "metric-card", "title": "Units sold" },
            { "type": "metric-card", "title": "Item revenue" },
            { "type": "row", "title": "Items by product" },
            { "type": "row", "title": "Items by category" },
            { "type": "scatter", "title": "Quantity and revenue" }
          ]
        }
      ],
      "charts": [
        {
          "name": "metric @units (line 5)",
          "type": "metric-card",
          "line": 5,
          "title": "Units sold"
        },
        {
          "name": "metric @item-revenue (line 6)",
          "type": "metric-card",
          "line": 6,
          "title": "Item revenue"
        },
        {
          "name": "row (line 7)",
          "type": "row",
          "line": 7,
          "title": "Items by product"
        },
        {
          "name": "row (line 8)",
          "type": "row",
          "line": 8,
          "title": "Items by category"
        },
        {
          "name": "scatter @quantity-revenue (line 9)",
          "type": "scatter",
          "line": 9,
          "title": "Quantity and revenue"
        }
      ],
      "skipped": [],
      "problems": []
    }
  ],
  "notebooks": [
    {
      "path": "product-notes.eda.md",
      "complete": true,
      "query": "item-lines",
      "rows": 200,
      "blocks": 1,
      "charts": [
        { "name": "row @categories (line 10)", "type": "row", "line": 10 }
      ],
      "problems": []
    }
  ],
  "projectProblems": []
}
```

**Call `write_eda`** `{"path": "product-notes.eda.md", "version": "fc365647120b"}`

````eda
# Product mix notes

The shop's revenue comes from 200 item lines on 80 orders, spread across four product categories: Kitchen, Office, Home, and Travel. The chart below totals item revenue by category, which is the first thing to read before the monthly and customer breakdowns in the product-mix dashboard: it shows which categories carry the business and which are small enough that a month-to-month swing in them matters little.

```eda
eda query=item-lines
revenue:num=items.revenue label=Revenue
category:cat=product.category label=Category
group @byCategory sum(revenue) by=category
row @categories category group=byCategory title="Revenue by category"
````

````

Result:

```json
{"saved":"product-notes.eda.md","version":"de0ef0a083f1","path":"product-notes.eda.md","complete":true,"views":[],"charts":1,"problems":[]}
````

**Call `submit_feedback`** `{"kind": "missing", "tool": "write_eda", "summary": "One dashboard cannot hold group/calc/alias lines for views on two different queries, and no tool shows computed values", "happened": "1) check on product-mix.eda with `eda query=item-lines`, a view using `group @byCategory sum(items.revenue) by=product.category`, and a second `view \"Large orders\" query=order-lines { calc large = if [\"orders.amount\"] > 100 then 1 else 0; group @largeShare sum(large) by=orders.channel denominatorField=one }`. Every group, calc and alias was checked against the other view's query and skipped. The group errors said \"needs by=, and a field to measure ... Write it as group @byRegion sum(Revenue) by=Region\" (it already was written that way) and \"items.revenue is not a field ... Fields: orders.orderId, ...\" listing the other view's fields with no word about why. Only the calc message explained the cause (\"Calc lines reach every view in the file, so each field they name must be in every view's query\"). \"Did you mean order.amount?\" pointed at the other query's field, which would break the view the line belongs to. I expected definitions inside a view body to apply to that view's query.\n2) Aliases inside a view body gave \"revenue:num is not a view setting ... Name the view, as in view \\\"Overview\\\"\", a fix unrelated to the cause (aliases must sit outside views).\n3) `calc large = if orders.amount > 100 ...`in an analysis gave \"uses orders, which is not a field\"; the reference shows the [\"orders.amount\"] form only under project queries and never says dotted names need brackets or an alias in analysis calcs.\n4) No tool returns a computed value (a metric, a group's totals, a finding). To verify that order.amount equals the sum of its items' revenue I had to save a temporary aggregate query into exploreda.eda, read its min/max from fields, and restore the file. I also could not tell what`finding @n count chart=@name`would print, so I left it out.", "proposedFix": "Scope group, calc and alias lines written inside a view body to that view's query (or allow`group ... query=order-lines`). Failing that, give group and alias problems the same explanation the calc problem has, and drop the \"Did you mean\" that names the other query's field. For an alias inside a view, say \"Move alias lines above the views\". In the reference, state that a calc names dotted fields as [\"orders.amount\"] or through an alias. Add a tool (or a describe option) that returns each chart's computed values: metric value, group rows, finding values; and let check accept a draft project query and return its fields without saving."}`

Result:

```json
{
  "saved": ".exploreda/feedback/2026-11-23-02-43-57-one-dashboard-cannot-hold-group-calc-alias-lines.md"
}
```

**Agent:**

Both files are saved and the tools report them complete with no problems. I can't see rendered values through these tools, so the charts are confirmed to build but I haven't looked at the numbers in them.

## What I built

**`product-mix.eda`** is one view on the `item-lines` query with five charts:

- **Item revenue:** a single total metric.
- **Revenue by category:** row chart of summed item revenue per product category.
- **Revenue per month by category:** stacked area, monthly sum split by category.
- **Top customers by revenue:** row chart, top 5 by summed item revenue.
- **Share of orders over $100 by channel:** row chart shown as a percent.

The large-order share is computed from item rows, because a file's calcs and groups can't span two queries. Each item counts as its fraction of its order (`items.revenue / order.amount`), so every order counts once. This is only right if each order's amount equals the sum of its items' revenue, which I confirmed holds for all 80 orders.

**`product-notes.eda.md`** has one paragraph on the four categories (200 item lines, 80 orders) and one revenue-by-category row chart. The paragraph states no revenue figures.

**One thing you didn't ask for:** to run that confirmation I briefly added a temporary query to `exploreda.eda`, then restored the file to its original text (the version hash matches the original).

## Check-and-fix rounds

| File                   | Rounds | Detail                                                                                              |
| ---------------------- | ------ | --------------------------------------------------------------------------------------------------- |
| `product-mix.eda`      | 5      | 4 failed checks, then 1 clean save                                                                  |
| `product-notes.eda.md` | 1      | Clean on first save; I saved once more to replace a live count I couldn't verify with plain numbers |

## Problems whose suggested fix did not help

1. **Group skipped in a two-query file.** The message was "needs by=, and a field to measure", with the fix "Write it as `group @byRegion sum(Revenue) by=Region`". It was already written that way. The real cause is that groups are checked against every view's query.
2. **"`items.revenue` is not a field", followed by a field list.** The list was the other view's query fields, with no explanation of why.
3. **"Did you mean `order.channel`?" / "Did you mean `order.amount`?"** These pointed at the other query's field name; taking the suggestion would break the view the line belongs to.
4. **Alias inside a view.** The message was "`revenue:num` is not a view setting", with the fix "Name the view, as in `view "Overview"`". The actual fix is to move aliases above the views.
5. **"calc large uses orders, which is not a field".** The fix was "Name a source field, an alias, or another calculation". The actual fix is to write the dotted name as `["orders.amount"]` or alias it.

Only the calc message on the fourth check explained the real rule: calc lines reach every view in the file. That is what led me to the single-query design.

I filed one `submit_feedback` report covering these, plus the lack of any tool that returns computed values. It is saved at `.exploreda/feedback/2026-11-23-02-43-57-one-dashboard-cannot-hold-group-calc-alias-lines.md`.

_Run stats: 26 turns, 140 s, $1.21._
