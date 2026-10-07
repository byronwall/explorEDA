import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, vi } from "vitest";
import { ChartDocs } from "./ChartDocs";

beforeEach(() => {
  vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
});

afterEach(() => vi.restoreAllMocks());

describe("chart documentation routes", () => {
  it("keeps the first guides linked to their current examples and trace limits", () => {
    const index = render(
      <MemoryRouter initialEntries={["/?view=docs"]}>
        <ChartDocs />
      </MemoryRouter>
    );
    expect(
      screen.getByRole("heading", { name: "Chart guides" })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Scatter plot" })).toHaveAttribute(
      "href",
      "/?view=docs&topic=scatter"
    );
    expect(screen.getByRole("link", { name: "Bar chart" })).toHaveAttribute(
      "href",
      "/?view=docs&topic=bar"
    );
    index.unmount();

    const scatter = render(
      <MemoryRouter initialEntries={["/?view=docs&topic=scatter"]}>
        <ChartDocs />
      </MemoryRouter>
    );
    expect(
      screen.getByRole("link", { name: "Open the scatter trace example" })
    ).toHaveAttribute("href", "/examples/scatter-trace");
    expect(
      screen.getByText(/Mark trace is available for scatter and bar charts/)
    ).toBeInTheDocument();
    scatter.unmount();

    render(
      <MemoryRouter initialEntries={["/?view=docs&topic=bar"]}>
        <ChartDocs />
      </MemoryRouter>
    );
    expect(
      screen.getByRole("link", { name: "Open the order-book example" })
    ).toHaveAttribute("href", "/examples/shop-operations");
    expect(screen.getByText(/globally filtered rows/)).toBeInTheDocument();
    render(
      <MemoryRouter initialEntries={["/?view=docs&topic=rendering"]}>
        <ChartDocs />
      </MemoryRouter>
    );
    expect(screen.getByText(/T-001 has Units 2/)).toBeInTheDocument();
    expect(screen.getByText("Every loaded source row.")).toBeInTheDocument();
    expect(
      screen.getByText(/named grouped summaries use globally filtered rows/i)
    ).toBeInTheDocument();
  });
});

describe("chart documentation focus", () => {
  it("scrolls to and focuses the next guide heading after navigation", () => {
    const scrollTo = vi.mocked(window.scrollTo);
    render(
      <MemoryRouter initialEntries={["/?view=docs&topic=bar"]}>
        <ChartDocs />
      </MemoryRouter>
    );
    scrollTo.mockClear();

    fireEvent.click(
      screen.getByRole("link", {
        name: "Read how rows and chart plans flow through the renderer",
      })
    );

    expect(
      screen.getByRole("heading", { name: "How rendering works" })
    ).toHaveFocus();
    expect(scrollTo).toHaveBeenCalledWith(0, 0);
  });
});
