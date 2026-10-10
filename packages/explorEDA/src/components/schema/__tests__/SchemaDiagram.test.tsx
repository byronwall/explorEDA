import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { createShopFixture } from "@/test/fixtures/shopProject";
import { projectSchemaGraph } from "@/lib/schema/schemaGraph";
import type { AnalysisProject } from "@/types/AnalysisProject";
import type { SavedDataStructure } from "@/types/SavedDataStructure";
import { SchemaDiagram } from "../SchemaDiagram";

beforeAll(() => {
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
});

function renderDiagram(readOnly = false) {
  const { project, sources } = createShopFixture();
  const onChange = vi.fn<(project: AnalysisProject) => void>();
  const onShowChart = vi.fn<(chartId: string) => void>();
  const settings = {
    charts: [
      {
        id: "bar",
        type: "bar",
        title: "By customer",
        field: "customer.name",
        filters: [],
      },
    ],
    calculations: [],
  } as unknown as SavedDataStructure;
  render(
    <SchemaDiagram
      graph={projectSchemaGraph(project, sources, [
        {
          id: "v",
          name: "Orders view",
          queryId: "orders-by-customer",
          settings,
          current: true,
        },
      ])}
      charts={{ nodeId: "view:v", onShowChart }}
      width={1200}
      height={800}
      editing={
        readOnly
          ? undefined
          : { project: { project, tables: sources, onChange } }
      }
    />
  );
  return { onChange, onShowChart };
}

/** Select a field the way a keyboard user does: card, arrows, Enter. */
function selectField(table: string, field: string) {
  const card = screen.getByRole("region", {
    name: new RegExp(`^${table}(,|$)`),
  });
  const fields = within(card).getAllByRole("option");
  const index = fields.findIndex((row) =>
    row.getAttribute("aria-label")!.startsWith(`${field},`)
  );
  card.focus();
  for (let step = 0; step <= index; step += 1) {
    fireEvent.keyDown(document.activeElement!, { key: "ArrowDown" });
  }
  fireEvent.keyDown(document.activeElement!, { key: "Enter" });
  return screen.getByRole("dialog", { name: field });
}

describe("SchemaDiagram editing", () => {
  it("renames a field with one change on Enter", () => {
    const { onChange } = renderDiagram();
    const details = selectField("Customers", "Name");
    const input = within(details).getByRole("textbox", {
      name: "Name of Name",
    });
    fireEvent.change(input, { target: { value: "Customer name" } });
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onChange).toHaveBeenCalledOnce();
    const customers = onChange.mock.calls[0]![0].sources.find(
      (source) => source.id === "customers"
    )!;
    expect(customers.fields.find((field) => field.id === "name")!.name).toBe(
      "Customer name"
    );
  });

  it("removes a relationship after naming the queries that follow it", () => {
    const { onChange } = renderDiagram();
    const details = selectField("Orders", "Customer ID");
    fireEvent.click(
      within(details).getByRole("button", { name: /Customers\.Customer ID/ })
    );
    const relationship = screen.getByRole("dialog", { name: "Relationship" });
    expect(relationship).toHaveTextContent(
      "Followed by Orders by customer, C1 items"
    );
    fireEvent.click(
      within(relationship).getByRole("button", { name: "Remove relationship" })
    );
    fireEvent.click(
      within(relationship).getByRole("button", { name: "Remove" })
    );

    expect(onChange).toHaveBeenCalledOnce();
    expect(
      onChange.mock.calls[0]![0].relationships.map((item) => item.id)
    ).not.toContain("order-customer");
  });

  it("clears the selection on Escape without letting the drawer close", () => {
    renderDiagram();
    selectField("Orders", "Amount");
    const event = fireEvent.keyDown(
      screen.getByRole("dialog", { name: "Amount" }),
      {
        key: "Escape",
      }
    );
    expect(event).toBe(false);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("checks a query calculation before saving it", () => {
    const { onChange } = renderDiagram();
    const details = selectField("Product revenue", "Net revenue");
    const expression = within(details).getByRole("textbox", {
      name: "Expression of Net revenue",
    });
    fireEvent.change(expression, { target: { value: '["nope"] * 2' } });
    fireEvent.keyDown(expression, { key: "Enter" });
    expect(onChange).not.toHaveBeenCalled();
    expect(details).toHaveTextContent("Unknown fields: nope");

    fireEvent.change(expression, {
      target: { value: '["items.revenue"] * 2' },
    });
    fireEvent.keyDown(expression, { key: "Enter" });
    expect(onChange).toHaveBeenCalledOnce();
    const step = onChange.mock.calls[0]![0].queries.find(
      (query) => query.id === "product-revenue"
    )!.steps.find((item) => item.id === "product-calc")!;
    expect(step).toMatchObject({ expression: '["items.revenue"] * 2' });
  });

  it("lists a field's uses and shows the chart that reads it", () => {
    const { onShowChart } = renderDiagram();
    const details = selectField("Customers", "Name");
    expect(details).toHaveTextContent("Used by");
    expect(details).toHaveTextContent("Orders view · By customer · field");
    fireEvent.click(
      within(details).getByRole("button", { name: "Show By customer" })
    );
    expect(onShowChart).toHaveBeenCalledWith("bar");
  });

  it("says when no view reads a field", () => {
    renderDiagram();
    expect(selectField("Customers", "Joined")).toHaveTextContent(
      "Not used by any view."
    );
  });

  it("shows details without edit controls when read-only", () => {
    renderDiagram(true);
    const details = selectField("Customers", "Name");
    expect(within(details).queryByRole("textbox")).toBeNull();
    expect(within(details).queryByRole("button", { name: /key/i })).toBeNull();
  });
});
