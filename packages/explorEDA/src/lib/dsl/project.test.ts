import { describe, expect, it } from "vitest";
import { evaluateAnalysisQuery } from "@/lib/analysis/evaluateProject";
import { memoryProjectFiles } from "@/lib/project/files";
import { readProjectFolder } from "@/lib/project/folder";
import { createShopFixture } from "@/test/fixtures/shopProject";
import type { AnalysisProject } from "@/types/AnalysisProject";
import { formatDsl } from "./format";
import { compileProjectText, exportProjectText, labelFromId } from "./project";

function roundTrip(project: AnalysisProject, paths?: Record<string, string>) {
  const text = exportProjectText(project, { paths });
  const result = compileProjectText(text);
  return { text, ...result };
}

describe("project text", () => {
  it("reads back every query in the shop fixture exactly", () => {
    const { project } = createShopFixture();
    const result = roundTrip(project, { orders: "data/orders.csv" });
    expect(result.diagnostics).toEqual([]);
    expect(result.project).toEqual(project);
    expect(result.paths).toEqual({ orders: "data/orders.csv" });
  });

  it("keeps its text when formatted or exported again", () => {
    const { project } = createShopFixture();
    const { text } = roundTrip(project);
    expect(formatDsl(text)).toBe(text);
    expect(exportProjectText(compileProjectText(text).project)).toBe(text);
  });

  it("writes only what a rule can't supply", () => {
    const text = exportProjectText({
      id: "shop",
      version: 1,
      sources: [
        {
          id: "orders",
          name: "Orders",
          glyph: "O",
          entityKey: "orderId",
          fields: [
            { id: "orderId", name: "Order ID", type: "string" },
            { id: "amount", name: "Amount", type: "number" },
            { id: "orderedAt", name: "Ordered", type: "date" },
          ],
        },
        {
          id: "customers",
          name: "Customers",
          glyph: "C",
          entityKey: "customerId",
          fields: [{ id: "customerId", name: "Customer ID", type: "string" }],
        },
      ],
      relationships: [
        {
          id: "order-customer",
          name: "Order customer",
          from: { sourceId: "orders", fieldId: "customerId" },
          to: { sourceId: "customers", fieldId: "customerId" },
          cardinality: "many-to-one",
        },
      ],
      queries: [
        {
          id: "orders",
          name: "Orders with customers",
          glyph: "◆",
          frameLabel: "orders",
          outputStepId: "big",
          steps: [
            { id: "orders", kind: "source", sourceId: "orders" },
            {
              id: "customer",
              kind: "lookup",
              inputStepId: "orders",
              relationshipId: "order-customer",
              as: "customer",
            },
            {
              id: "big",
              kind: "filter",
              inputStepId: "customer",
              fieldId: "orders.amount",
              operator: "gte",
              value: 40,
            },
          ],
        },
      ],
    });
    expect(text).toBe(`project @shop

source @orders key=orderId {
  field orderId string
  field amount number
  field orderedAt Ordered date
}

source @customers key=customerId {
  field customerId string
}

relate @order-customer orders.customerId -> customers.customerId

query @orders "Orders with customers" glyph=◆ {
  source orders
  lookup customer via=order-customer
  filter @big orders.amount >= 40
}
`);
  });

  it("reads filters however they are spaced", () => {
    const steps = (line: string) =>
      compileProjectText(`project @p
source @t key=id
param @limit number
query @q glyph=Q {
  source t
  ${line}
}`).project.queries[0]!.steps[1];
    expect(steps("filter @f t.a>=$limit")).toMatchObject({
      operator: "gte",
      parameterId: "limit",
    });
    expect(steps('filter @f t.a != "10"')).toMatchObject({
      operator: "neq",
      value: "10",
    });
    expect(steps("filter @f t.a<3")).toMatchObject({
      operator: "lt",
      value: 3,
    });
    expect(steps("filter @f t.a not-null")).toMatchObject({
      operator: "is-not-null",
    });
  });

  it("stacks sources with append and evaluates each row from its source", async () => {
    const text = `project @shop

source @web key=id path=web.csv

source @catalog key=id path=catalog.csv

source @store key=id path=store.csv

query @sales glyph=◆ {
  source web
  append catalog field=channel
  append store field=channel
}
`;
    const result = compileProjectText(text);
    expect(result.diagnostics).toEqual([]);
    expect(result.project.queries[0]!.steps[1]).toEqual({
      id: "catalog",
      kind: "append",
      inputStepId: "web",
      sourceId: "catalog",
      field: "channel",
    });
    expect(formatDsl(text)).toBe(text);
    expect(exportProjectText(result.project, { paths: result.paths })).toBe(
      text
    );
    expect(
      compileProjectText(text.replace(" field=channel", "")).project.queries[0]!
        .steps[1]
    ).toMatchObject({ field: "source" });

    const folder = await readProjectFolder(
      memoryProjectFiles({
        "exploreda.eda": text,
        "web.csv": "id,paid,promo\n1,10,yes\n2,20,no\n",
        "catalog.csv": "id,paid\n1,30\n",
        "store.csv": "id,paid,extra\n9,5,x\n",
      })
    );
    expect(folder.problems).toEqual([]);
    const evaluation = evaluateAnalysisQuery(
      folder.project,
      folder.tables,
      "sales"
    );
    expect(evaluation.rows.map((row) => row.values)).toEqual([
      { "web.id": 1, "web.paid": 10, "web.promo": "yes", channel: "web" },
      { "web.id": 2, "web.paid": 20, "web.promo": "no", channel: "web" },
      {
        "web.id": 1,
        "web.paid": 30,
        "web.promo": undefined,
        channel: "catalog",
      },
      { "web.id": 9, "web.paid": 5, "web.promo": undefined, channel: "store" },
    ]);
    // Each row still traces back to the source row it came from.
    expect(evaluation.rows.map((row) => row.sourceRows[0]!.rowKey)).toEqual([
      "web:number:1",
      "web:number:2",
      "catalog:number:1",
      "store:number:9",
    ]);
  });

  it("lines up prefixed and matched fields on append, so a later lookup reaches every row", async () => {
    const text = `project @shop

source @cs key=cs_id path=cs.csv

source @ws key=ws_id path=ws.csv

source @customer key=c_id path=customer.csv

relate @cs-customer cs.cs_buyer -> customer.c_id

query @sales glyph=◆ {
  source cs
  append ws field=channel match=cs_paid:ws_net
  lookup buyer via=cs-customer
}
`;
    const result = compileProjectText(text);
    expect(result.diagnostics).toEqual([]);
    expect(exportProjectText(result.project, { paths: result.paths })).toBe(
      text
    );
    const folder = await readProjectFolder(
      memoryProjectFiles({
        "exploreda.eda": text,
        "cs.csv": "cs_id,cs_buyer,cs_paid\n1,7,10\n",
        "ws.csv": "ws_id,ws_buyer,ws_net,ws_paid\n2,8,20,99\n",
        "customer.csv": "c_id,c_name\n7,Ann\n8,Bo\n",
      })
    );
    expect(folder.problems).toEqual([]);
    const rows = evaluateAnalysisQuery(
      folder.project,
      folder.tables,
      "sales"
    ).rows.map((row) => [
      row.values.channel,
      row.values["cs.cs_paid"],
      row.values["buyer.c_name"],
    ]);
    expect(rows).toEqual([
      ["cs", 10, "Ann"],
      ["ws", 20, "Bo"],
    ]);
  });

  it("points at references to things the project doesn't declare", () => {
    const { diagnostics } = compileProjectText(`project @p
source @orders key=orderId {
  field orderId string
}
query @q glyph=Q {
  source order
  lookup customer via=order-customer
}`);
    expect(
      diagnostics.map((item) => [item.line, item.message, item.suggestion])
    ).toEqual([
      [6, "No source is named order.", "Use orders."],
      [7, "No relationship is named order-customer.", undefined],
    ]);
  });

  it("makes labels from IDs", () => {
    expect(labelFromId("orderId")).toBe("Order ID");
    expect(labelFromId("order-customer")).toBe("Order customer");
    expect(labelFromId("flight_date")).toBe("Flight date");
  });

  describe("database sources", () => {
    const text = `project @shop

connection @app driver=sqlite path=data/app.db
connection @warehouse driver=postgres host=db.internal database=sales

source @events db=app table=events

source @orders key=order_id db=warehouse table=public.orders limit=250000

source @active db=warehouse sql="select id, region\\nfrom customers where active"
`;

    it("reads connections and the database each source reads", () => {
      const result = compileProjectText(text);
      expect(result.diagnostics).toEqual([]);
      expect(result.connections).toEqual([
        { id: "app", driver: "sqlite", settings: { path: "data/app.db" } },
        {
          id: "warehouse",
          driver: "postgres",
          settings: { host: "db.internal", database: "sales" },
        },
      ]);
      expect(result.databases).toEqual({
        events: { connection: "app", table: "events" },
        orders: {
          connection: "warehouse",
          table: "public.orders",
          limit: 250000,
        },
        active: {
          connection: "warehouse",
          sql: "select id, region\nfrom customers where active",
        },
      });
      expect(result.paths).toEqual({});
    });

    it("writes them back exactly", () => {
      const { project, connections, databases } = compileProjectText(text);
      expect(exportProjectText(project, { connections, databases })).toBe(text);
    });

    it("reads sql=@file as a query kept in a file", () => {
      const withFile = text.replace(
        'sql="select id, region\\nfrom customers where active"',
        "sql=@queries/active.sql"
      );
      const result = compileProjectText(withFile);
      expect(result.diagnostics).toEqual([]);
      expect(result.databases.active).toEqual({
        connection: "warehouse",
        sqlFile: "queries/active.sql",
      });
      // The folder reader fills in sql; the text still names the file.
      const databases = {
        ...result.databases,
        active: { ...result.databases.active!, sql: "select 1" },
      };
      expect(
        exportProjectText(result.project, {
          connections: result.connections,
          databases,
        })
      ).toBe(withFile);
    });

    it("refuses secrets in project text", () => {
      const { connections, diagnostics } = compileProjectText(`project @p
connection @w driver=postgres host=h password=hunter2
`);
      expect(connections[0]!.settings).toEqual({ host: "h" });
      expect(diagnostics.map((item) => [item.line, item.message])).toEqual([
        [2, "password= can hold a secret, so project text doesn't keep it."],
      ]);
    });

    it("points at a database source that can't be read", () => {
      const { diagnostics } = compileProjectText(`project @p
connection @app driver=sqlite path=a.db
source @a db=ap table=t
source @b db=app
source @c db=app table=t sql="select 1"
source @d table=t
source @e db=app table=t limit=lots
`);
      expect(
        diagnostics.map((item) => [item.line, item.message, item.suggestion])
      ).toEqual([
        [
          4,
          "A database source needs table= or sql=.",
          'Write table=orders, or sql="select id, region from customers".',
        ],
        [
          5,
          "A database source reads table= or sql=, not both.",
          'Write table=orders, or sql="select id, region from customers".',
        ],
        [6, "A source needs a name and a key.", expect.any(String)],
        [
          7,
          "limit=lots isn't a whole number of rows.",
          "Write it as limit=250000.",
        ],
        [3, "No connection is named ap.", "Use app."],
      ]);
    });
  });
});
