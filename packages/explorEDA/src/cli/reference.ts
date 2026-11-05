/**
 * `exploreda-dsl reference project` and `reference notebook`: the project
 * text and notebook layout an agent writes, condensed from the docs pages
 * database-sources.mdx, project-folders.mdx, and notebooks.mdx in
 * apps/demo/src/docs/pages. Change them together.
 */

export const PROJECT_REFERENCE = `Project text: exploreda.eda at the folder's top (or .exploreda/project.eda).
One declaration per line; @name gives it an ID, { } holds its body, and a
value with spaces is quoted. Every other .eda file is an analysis, and every
.eda.md file is a notebook (exploreda-dsl reference notebook).

  project @shop

  connection @shop driver=sqlite path=data/shop.db
  source @orders key=orderId db=shop table=orders
  source @returns db=shop sql="select r.returnId, o.amount from returns r join orders o using (orderId)" limit=200000
  source @customers path=data/customers.csv

  relate @order-customer orders.customerId -> customers.customerId

  query @order-lines "Orders with customers" glyph=◆ {
    source orders
    lookup customer via=order-customer
    calc big "Large order" = ["orders.amount"] >= 40
    filter @recent orders.orderedAt >= 2025-01-01
  }

Connections (project text never holds a password):
  connection @id driver=sqlite path=<file>      also driver=duckdb; path= is
                                                relative to the folder
  connection @id driver=postgres|mysql|sqlserver host=<server> database=<db>
       user=<user> [port=<n>] [ssl=require|verify-full|disable]
  The password comes from EXPLOREDA_<ID>_PASSWORD (the ID in capitals) or
  one saved in the app. DuckDB needs npm install @duckdb/node-api in the folder.

Sources:
  source @id ["Name"] [key=field] path=<file.csv|file.json> { field lines }
  source @id [key=field] db=<connection> table=<name> [limit=rows]
  source @id [key=field] db=<connection> sql="select …" [limit=rows]
  source @id [key=field] db=<connection> sql=@queries/orders.sql
  table= takes schema.table outside the default schema. sql= is any query
  that returns rows; write a newline as \\n, or keep a longer query in a .sql
  file in the folder and name it with sql=@<path>. A read keeps at most 100,000
  rows unless limit= raises it. Fields and types come from the data, so
  field lines are optional: field <id> ["Label"] [string|number|boolean|date].
  A database source has no rows until it is read:
    exploreda read <folder> [source...]     read sources into snapshots
    exploreda schema <folder> [connection] [table...]   tables and columns
  Change table=, sql=, or limit= and read the source again.

Relationships and queries:
  relate @id source.field -> source.field [many-to-one|one-to-one|one-to-many|many-to-many]
  query @id ["Name"] glyph=X [frame=label] [output=step] { steps }
  glyph= is required: one character, such as ◆ or ▲.
  Each step reads the step before it; from=step reads another.
    source orders                     rows of orders, fields named orders.amount
    lookup customer via=order-customer [on=field]
                                      the related row, fields named customer.name
    expand item via=item-order [keep-unmatched]   one row per related row
    calc fieldId ["Label"] = formula  formula refers to fields as ["orders.amount"]
    filter @id field op value         =, !=, >, >=, <, <=, is-null, not-null;
                                      $param reads a parameter
    aggregate @id [by=field,field] {  one row per group; a measure per line:
      sum @total orders.amount        also average, max, min, count @n [field]
    }
    append catalog [field=channel]    another source's rows under these; its
                                      fields fill the first source's fields of
                                      the same name (web.paid), and field=
                                      (default source) holds each row's source
  param @id ["Name"] type [required] [pick=source[.labelField]]
  Every source can be charted on its own: it gets a query of its name.

Fields in analyses and notebooks are named <step>.<field>: orders.amount,
customer.region. Alias one for short names and a type check, on its own
line outside any view:
  amount:num=orders.amount            :num|:cat|:date|:bool
An analysis (any other .eda file) names its query on its first line:
  eda query=order-lines
  amount:num=orders.amount
  view Overview {
    row customer.region
    hist amount
  }

Check it: exploreda-dsl project <folder> lists every source, view, and
problem with a fix.`;

export const NOTEBOOK_REFERENCE = `Notebook: <name>.eda.md in a project folder. Markdown prose, with fenced
eda blocks of dashboard text (exploreda-dsl reference). Each block's charts
appear where the block sits.

  # Did demand run off forecast?

  Prose in Markdown.

  \`\`\`eda
  eda query=demand
  time:date=demand.time label=Hour
  actual:num=demand.actual
  forecast:num=demand.forecast
  calc delta = actual - forecast
  \`\`\`

  \`\`\`eda
  line @delta x=time y=delta title="Actual minus forecast" {
    rule y=0 "On forecast"
  }
  \`\`\`

- eda query=<id> picks the query a block charts (a project query or a
  source's own). The first one is the notebook's query: blocks without their
  own eda query= chart it. Without one, the notebook charts the project's
  first query.
- A block can name another query to chart its rows:
    \`\`\`eda
    eda query=regions
    row regions.region
    \`\`\`
  Each query's blocks work apart: aliases, calc, filter, and finding lines
  reach only blocks of the same query, and charts of different queries never
  share a selection. Prose can show any finding.
- Fields are named <step>.<field>, as demand.actual; alias them for short
  names. Aliases and calc lines in any block reach every block of its query.
- A block can hold several charts; a block of only definitions shows them.
- Two or more # headings split the notebook into sheets, one per heading.
- finding @n count chart=@name, then {{n}} in prose, writes a live value.

Check it: exploreda-dsl check <name>.eda.md reads the project's data and
lists each problem with a fix. Read database sources first with
exploreda read <folder>.`;
