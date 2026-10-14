import { describe, expect, it } from "vitest";
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
