import { fireEvent, render, screen, within } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import type { AnalysisView } from "@/types/AnalysisProject";
import { evaluateAnalysisQuery } from "@/lib/analysis/evaluateProject";
import { DataLayerProvider } from "@/providers/DataLayerProvider";
import { createShopFixture } from "@/test/fixtures/shopProject";
import { ProjectQueryPanel } from "./ProjectQueryPanel";

function renderPanel(
  props: Partial<Parameters<typeof ProjectQueryPanel>[0]> = {}
) {
  const { project, sources } = createShopFixture();
  const evaluation = evaluateAnalysisQuery(
    project,
    sources,
    "orders-by-customer"
  );
  function Host() {
    const [view, setView] = useState<AnalysisView>({
      id: "v",
      name: "Orders",
      queryId: "orders-by-customer",
    });
    return (
      <ProjectQueryPanel
        project={project}
        view={view}
        tables={sources}
        evaluation={evaluation}
        pending={false}
        incompatibleFields={[]}
        unresolvedRowKeys={0}
        readOnly={false}
        onChange={(_, next) => setView(next)}
        onClearFocus={vi.fn()}
        {...props}
      />
    );
  }
  render(
    <DataLayerProvider data={[]} charts={[]}>
      <Host />
    </DataLayerProvider>
  );
}

describe("ProjectQueryPanel", () => {
  it("describes steps, rows, and data checks in product terms", () => {
    renderPanel();
    fireEvent.click(screen.getByRole("button", { name: "Full" }));
    expect(screen.getByText("Read Orders")).toBeInTheDocument();
    expect(
      screen.getByText("Add fields through Order customer")
    ).toBeInTheDocument();
    expect(
      screen.getByText("1 row without a related record.")
    ).toBeInTheDocument();
    // Rows are labeled by their own key, not an internal row reference.
    const rows = screen.getByRole("table");
    expect(within(rows).getByRole("button", { name: /row O1$/ })).toBeVisible();
    expect(screen.queryByText(/orders:string:/)).toBeNull();
    expect(screen.queryByText(/order-customer-lookup/)).toBeNull();
  });

  it("narrows the output rows to the rows behind a traced mark", () => {
    const onClearFocus = vi.fn();
    renderPanel({
      focusRowKeys: ["orders:string:O1", "orders:string:O2"],
      onClearFocus,
    });
    expect(screen.getByText("Rows behind the traced mark")).toBeVisible();
    expect(screen.getByText("2 of 5")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Show all rows" }));
    expect(onClearFocus).toHaveBeenCalled();
  });

  it("shows source records related to a chosen row", () => {
    renderPanel();
    fireEvent.click(
      screen.getByRole("button", { name: "Related records for row O1" })
    );
    const related = screen.getByRole("region", {
      name: "Records related to row O1",
    });
    expect(
      within(related).getByRole("heading", { name: /Items · 2/ })
    ).toBeVisible();
  });
});
