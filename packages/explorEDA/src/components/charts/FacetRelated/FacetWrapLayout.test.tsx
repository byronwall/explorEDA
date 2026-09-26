import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { ChartSettings } from "@/types/ChartTypes";
import type { FacetData } from "./FacetContainer";
import { FacetWrapLayout } from "./FacetWrapLayout";

vi.mock("../ChartRenderer", () => ({ ChartRenderer: () => null }));

const facet: FacetData = {
  id: '["Online",null]',
  rowKey: "Online",
  columnKey: null,
  rowValue: "Online",
  columnValue: null,
  rowRawValue: "Online",
  columnRawValue: null,
  ids: [1, 2],
};

function renderWrap() {
  const handlers = {
    onToggleFacet: vi.fn(),
    onFocusFacet: vi.fn(),
    onTraceFacet: vi.fn(),
  };
  render(
    <FacetWrapLayout
      width={800}
      height={600}
      columns={2}
      facetData={[facet]}
      settings={
        {
          facet: { enabled: true, type: "wrap", rowVariable: "Channel" },
        } as ChartSettings
      }
      isFacetFiltered={() => true}
      formatFacetValue={(_, value) => String(value)}
      {...handlers}
    />
  );
  return handlers;
}

describe("FacetWrapLayout", () => {
  it("keeps name click for filtering and the icon for focus", () => {
    const handlers = renderWrap();

    fireEvent.click(screen.getByRole("button", { name: "Online" }));
    expect(handlers.onToggleFacet).toHaveBeenCalledWith("Channel", "Online");
    expect(handlers.onFocusFacet).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Focus Online facet" }));
    expect(handlers.onFocusFacet).toHaveBeenCalledWith(facet.id);
    expect(handlers.onToggleFacet).toHaveBeenCalledTimes(1);
  });

  it("traces instead of focusing on Alt-Enter", () => {
    const handlers = renderWrap();

    fireEvent.keyDown(
      screen.getByRole("button", { name: "Focus Online facet" }),
      { key: "Enter", altKey: true }
    );
    expect(handlers.onTraceFacet).toHaveBeenCalledWith(
      "panel",
      [facet],
      expect.objectContaining({ mode: "wrap" })
    );
    expect(handlers.onFocusFacet).not.toHaveBeenCalled();
  });
});
