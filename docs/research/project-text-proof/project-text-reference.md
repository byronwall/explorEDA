# Project text reference (draft for the first proof)

Project text describes the data an explorEDA project reads: its sources, how they relate, and the queries that join them into one table for charts. It uses the dashboard-text syntax. A declaration's head sits on one line, `@name` gives it an ID, and `{ }` holds its body. Quote any value that has spaces. Leave out anything shown as a default.

```text
project @shop

source @orders key=orderId path=data/orders.csv {
  field orderId string
  field amount number
  field orderedAt Ordered date
}

relate @order-customer orders.customerId -> customers.customerId

query @order-lines "Orders with customers" glyph=◆ {
  source orders
  lookup customer via=order-customer
  calc big "Large order" = ["orders.amount"] >= 40
  filter @recent orders.orderedAt >= $from
}

param @from "From date" date required
```

## Declarations

| Declaration | Form | Defaults |
| --- | --- | --- |
| `project` | `project @id` | First line. |
| `source` | `source @id ["Name"] [glyph=X] key=entityField [path=file] { fields }` | Name from the ID (`customers` → Customers); glyph is the name's first letter. |
| `field` | `field id ["Label"] [string\|number\|boolean\|date]` | Label from the ID (`orderId` → Order ID, `flight_date` → Flight date). |
| `relate` | `relate @id source.field -> source.field [cardinality] ["Name"]` | `many-to-one`; others are `one-to-one`, `one-to-many`, `many-to-many`. Name from the ID. |
| `query` | `query @id ["Name"] glyph=X [frame=label] [output=step] { steps }` | Frame is the first source's ID; output is the last step. |
| `param` | `param @id ["Name"] type [required] [pick=source[.labelField]]` | `pick=` offers the source's keys, labeled by a field. |

## Query steps

Each step reads the step before it. Use `from=step` to read another one. A step's ID is the word noted below; add `@id` to name it differently.

| Step | Form | ID |
| --- | --- | --- |
| `source` | `source sourceId` | the source |
| `lookup` | `lookup name via=relationship [on=field]` — adds the one related row's fields as `name.field` | the name |
| `expand` | `expand name via=relationship [keep-unmatched]` — one row per related row | the name |
| `calc` | `calc fieldId ["Label"] = formula` — the formula runs to the end of the line | the field |
| `filter` | `filter @id field op value` with `=`, `!=`, `>`, `>=`, `<`, `<=`, or `field is-null` / `not-null`; `$param` reads a parameter | needs `@id` |
| `aggregate` | `aggregate @id [by=field,field] { measures }` | needs `@id` |

Measures: `sum @id field`, `average @id field`, `count @id [field]`, each with optional `label="…"` and `per=entityField` (count each entity's value once).

After a lookup, fields are named `source.field` for the query's own source and `name.field` for the looked-up rows, such as `orders.amount` and `customer.name`. Formulas refer to fields as `["orders.amount"]`.
