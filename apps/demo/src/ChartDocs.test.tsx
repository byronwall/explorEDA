import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ChartDocs } from "./ChartDocs";

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
    ).toHaveAttribute("href", "/?example=scatter-trace");
    expect(
      screen.getByText(/mark trace is implemented for scatter and bar/)
    ).toBeInTheDocument();
    scatter.unmount();

    render(
      <MemoryRouter initialEntries={["/?view=docs&topic=bar"]}>
        <ChartDocs />
      </MemoryRouter>
    );
    expect(
      screen.getByRole("link", { name: "Open the order-book example" })
    ).toHaveAttribute("href", "/?example=shop-operations");
    expect(screen.getByText(/globally filtered rows/)).toBeInTheDocument();
    render(
      <MemoryRouter initialEntries={["/?view=docs&topic=rendering"]}>
        <ChartDocs />
      </MemoryRouter>
    );
    expect(screen.getByText(/T-001 has Units 2/)).toBeInTheDocument();
    expect(
      screen.getByText(/full scope is every loaded source row/)
    ).toBeInTheDocument();
  });
});
