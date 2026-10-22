import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { AnalysisStage } from "@/types/AnalysisProject";
import { DataLayerProvider } from "@/providers/DataLayerProvider";
import { QueryStageRows } from "./QueryStageRows";

const stage: AnalysisStage = {
  stepId: "s",
  kind: "source",
  inputCount: 1,
  outputCount: 1,
  excludedCount: 0,
  rowUnit: "orders",
  fields: [
    { id: "region", name: "region", type: "string", origin: { stepId: "s" } },
    { id: "total", name: "total", type: "number", origin: { stepId: "s" } },
  ],
  rows: [
    {
      key: "r1",
      values: { region: null, total: null },
      data: {},
      sourceRows: [],
      contributors: [],
    },
  ],
};

describe("QueryStageRows", () => {
  it("shows a missing cell as a centered null, not a dash", () => {
    render(
      <DataLayerProvider>
        <QueryStageRows
          project={{
            id: "p",
            version: 1,
            sources: [],
            relationships: [],
            queries: [],
          }}
          tables={{}}
          stage={stage}
          readOnly
          onSelectRow={vi.fn()}
          onClearFocus={vi.fn()}
        />
      </DataLayerProvider>
    );
    const cells = screen
      .getAllByText("Missing")
      .map((label) => label.closest("td"));
    expect(cells).toHaveLength(2);
    for (const cell of cells) {
      expect(cell).toHaveAttribute("data-null");
      expect(cell).toHaveClass("text-center");
      expect(cell).not.toHaveTextContent("—");
    }
  });
});
