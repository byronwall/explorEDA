import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import type { ChartSettings } from "@/types/ChartTypes";
import type { FacetData } from "./FacetContainer";
import { FacetWrapLayout } from "./FacetWrapLayout";

vi.mock("../ChartRenderer", () => ({ ChartRenderer: () => null }));

beforeAll(() => {
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  );
  Element.prototype.scrollIntoView ??= () => undefined;
});

const makeFacet = (name: string, index = 0): FacetData => ({
  id: JSON.stringify([name, null]),
  rowKey: name,
  columnKey: null,
  rowValue: name,
  columnValue: null,
  rowRawValue: name,
  columnRawValue: null,
  ids: [index],
});
const facet = makeFacet("Online");
const settings = {
  facet: { enabled: true, type: "wrap", rowVariable: "Channel" },
} as ChartSettings;

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
      settings={settings}
      isFacetFiltered={() => true}
      formatFacetValue={(_, value) => String(value)}
      picker={{ options: [], visibleIds: undefined, onChange: vi.fn() }}
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

function PickerHarness({ facets }: { facets: FacetData[] }) {
  const [visibleIds, setVisibleIds] = useState<string[] | undefined>();
  const shown = visibleIds
    ? facets.filter((item) => visibleIds.includes(item.id))
    : facets;
  return (
    <FacetWrapLayout
      width={800}
      height={600}
      columns={2}
      facetData={shown}
      settings={settings}
      onToggleFacet={vi.fn()}
      isFacetFiltered={() => true}
      onFocusFacet={vi.fn()}
      formatFacetValue={(_, value) => String(value)}
      picker={{
        options: facets.map((item) => ({
          id: item.id,
          label: item.rowValue,
        })),
        visibleIds,
        onChange: setVisibleIds,
      }}
    />
  );
}

describe("facet picker", () => {
  it("shrinks the pages and stays available on one page", () => {
    const facets = ["A", "B", "C", "D", "E"].map(makeFacet);
    render(<PickerHarness facets={facets} />);
    expect(screen.getByRole("button", { name: "Next" })).toBeEnabled();

    const trigger = () =>
      screen.getByRole("button", { name: /^Choose visible facets/ });
    fireEvent.click(trigger());
    fireEvent.click(screen.getByRole("option", { name: /^A/ }));
    fireEvent.click(screen.getByRole("option", { name: /^B/ }));

    expect(trigger()).toHaveAccessibleName(
      "Choose visible facets, Facets 1–3 of 3"
    );
    expect(screen.queryByRole("button", { name: "Next" })).toBeNull();
    expect(screen.getByRole("option", { name: /^A/ })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Show all" }));
    expect(trigger()).toHaveAccessibleName(
      "Choose visible facets, Facets 1–4 of 5"
    );
  });
});
