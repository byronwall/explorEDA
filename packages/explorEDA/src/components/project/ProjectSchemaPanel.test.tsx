import { fireEvent, render, screen, within } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { evaluateAnalysisQuery } from "@/lib/analysis/evaluateProject";
import { createShopFixture } from "@/lib/analysis/shopFixture";
import { DataLayerProvider } from "@/providers/DataLayerProvider";
import type { AnalysisProject, AnalysisView } from "@/types/AnalysisProject";
import { ProjectSchemaPanel } from "./ProjectSchemaPanel";

function RelationshipHost() {
  const [fixture] = useState(() => {
    const value = structuredClone(createShopFixture("duplicate-customer-key"));
    value.project.sources
      .find((source) => source.id === "customers")!
      .fields.push({ id: "customerKey", name: "Customer key", type: "string" });
    return value;
  });
  const [project, setProject] = useState(fixture.project);
  const tables = {
    ...fixture.sources,
    customers: fixture.sources.customers!.map((row, index) => ({
      ...row,
      customerKey: `C${index + 1}`,
    })),
  };
  const relationship = project.relationships.find(
    (item) => item.id === "order-customer"
  );
  const lookup = project.queries
    .find((item) => item.id === "orders-by-customer")!
    .steps.find((step) => step.id === "order-customer-lookup")!;
  const evaluation = evaluateAnalysisQuery(
    project,
    tables,
    "orders-by-customer"
  );

  return (
    <>
      <DataLayerProvider data={fixture.sources.orders!} charts={[]}>
        <ProjectSchemaPanel
          project={project}
          queryId="orders-by-customer"
          tables={tables}
          readOnly={false}
          onProjectChange={setProject}
        />
        <output aria-label="Saved relationship">
          {JSON.stringify(relationship)}
        </output>
        <output aria-label="Saved query step">{JSON.stringify(lookup)}</output>
        <output aria-label="Evaluation">
          {JSON.stringify({
            count: evaluation.rows.length,
            total: evaluation.rows.reduce(
              (sum, row) => sum + Number(row.values["orders.amount"] ?? 0),
              0
            ),
            firstCustomer: evaluation.rows[0]?.values["customer.name"],
            ambiguous: evaluation.diagnostics.some(
              (item) => item.code === "ambiguous-lookup"
            ),
          })}
        </output>
      </DataLayerProvider>
    </>
  );
}

describe("ProjectSchemaPanel", () => {
  it("repairs an ambiguous relationship and keeps its query reference", () => {
    const fixture = structuredClone(
      createShopFixture("duplicate-customer-key")
    );
    fixture.project.sources
      .find((source) => source.id === "customers")!
      .fields.push({ id: "customerKey", name: "Customer key", type: "string" });
    const customers = fixture.sources.customers!.map((row, index) => ({
      ...row,
      customerKey: `C${index + 1}`,
    }));
    const initial = evaluateAnalysisQuery(
      fixture.project,
      {
        ...fixture.sources,
        customers,
      },
      "orders-by-customer"
    );
    expect(initial.rows[0]!.values["customer.name"]).toBeUndefined();

    render(<RelationshipHost />);
    const relationship = screen.getByText("Order customer").closest("li")!;
    fireEvent.click(
      within(relationship).getByRole("button", {
        name: "Edit relationship Order customer",
      })
    );

    expect(
      screen.getByRole("region", { name: "Edit relationship" })
    ).toHaveFocus();
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(
      screen.queryByRole("region", { name: "Edit relationship" })
    ).toBeNull();
    expect(
      JSON.parse(screen.getByLabelText("Saved relationship").textContent!)
    ).toMatchObject({
      from: { fieldId: "customerId" },
      to: { fieldId: "customerId" },
    });
    fireEvent.click(
      within(screen.getByText("Order customer").closest("li")!).getByRole(
        "button",
        { name: "Edit relationship Order customer" }
      )
    );
    fireEvent.click(screen.getByRole("button", { name: "Preview link" }));
    fireEvent.click(screen.getByRole("combobox", { name: "Matches field" }));
    fireEvent.click(screen.getByRole("option", { name: "Customer key" }));
    expect(screen.queryByText("Ambiguous keys")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Preview link" }));

    expect(screen.getByText("Ambiguous keys").parentElement).toHaveTextContent(
      "0"
    );
    expect(screen.getByText("Matched rows").parentElement).toHaveTextContent(
      "4"
    );
    fireEvent.click(screen.getByRole("button", { name: "Apply relationship" }));

    const relationshipAfterEdit = JSON.parse(
      screen.getByLabelText("Saved relationship").textContent!
    );
    expect(relationshipAfterEdit).toMatchObject({
      id: "order-customer",
      name: "Order customer",
      from: { sourceId: "orders", fieldId: "customerId" },
      to: { sourceId: "customers", fieldId: "customerKey" },
    });
    expect(
      JSON.parse(screen.getByLabelText("Saved query step").textContent!)
    ).toMatchObject({
      id: "order-customer-lookup",
      kind: "lookup",
      relationshipId: "order-customer",
      as: "customer",
    });
    expect(
      JSON.parse(screen.getByLabelText("Evaluation").textContent!)
    ).toEqual({
      count: 5,
      total: 150,
      firstCustomer: "Aster",
      ambiguous: false,
    });
  });

  it("uses a unique suffixed glyph for a source view after palette exhaustion", () => {
    const fixture = createShopFixture();
    const glyphs = ["◆", "◇", "●", "▦", "◈", "⬡", "▣", "◉"];
    fixture.project.queries = [...glyphs, "◆2"].map((glyph, index) => ({
      id: `query-${index}`,
      name: `Query ${index}`,
      glyph,
      frameLabel: "Rows",
      steps: [{ id: `source-${index}`, kind: "source", sourceId: "orders" }],
      outputStepId: `source-${index}`,
    }));
    let openedProject: AnalysisProject | undefined;
    const onOpenView = (
      _view: AnalysisView,
      _name: string,
      nextProject?: AnalysisProject
    ) => {
      openedProject = nextProject;
    };

    render(
      <DataLayerProvider data={fixture.sources.orders!} charts={[]}>
        <ProjectSchemaPanel
          project={fixture.project}
          queryId="query-0"
          tables={fixture.sources}
          readOnly={false}
          onProjectChange={vi.fn()}
          onOpenView={onOpenView}
        />
      </DataLayerProvider>
    );

    fireEvent.click(
      screen.getAllByRole("button", { name: "Open as view" })[0]!
    );
    const nextProject = openedProject!;
    const created = nextProject.queries.at(-1)!;
    expect(created.glyph).toBe("◆3");
    expect(new Set(nextProject.queries.map((query) => query.glyph)).size).toBe(
      nextProject.queries.length
    );
  });
});
