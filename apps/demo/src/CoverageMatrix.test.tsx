import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { CoverageMatrix } from "./CoverageMatrix";
import { coverageFeatures } from "./demos/coverage";
import { examples } from "./demos/examples";

function renderAt(url: string) {
  return render(
    <MemoryRouter initialEntries={[url]}>
      <CoverageMatrix />
    </MemoryRouter>
  );
}

describe("CoverageMatrix", () => {
  it("defaults to an attention queue with a summary and review terms", () => {
    renderAt("/?view=coverage");

    expect(
      screen.getByRole("heading", { name: "Needs attention" })
    ).toBeInTheDocument();
    const summary = screen.getByRole("region", { name: "Coverage summary" });
    expect(within(summary).getByText("Implemented")).toBeInTheDocument();
    expect(within(summary).getByText("Reviewed")).toBeInTheDocument();
    expect(
      screen.getByText(/A feature counts as reviewed once any example checks it\./)
    ).toBeInTheDocument();
    expect(screen.getAllByText("Review pending").length).toBeGreaterThan(0);
    expect(screen.queryByRole("table")).not.toBeInTheDocument();

    const featureSummary = screen.getByText("Row chart");
    expect(featureSummary.closest("details")).not.toHaveAttribute("open");
    fireEvent.click(featureSummary);
    expect(featureSummary.closest("details")).toHaveAttribute("open");
    expect(
      screen.getByText("Compare category counts in horizontal rows.")
    ).toBeInTheDocument();

    const views = screen.getByRole("navigation", { name: "Coverage views" });
    expect(
      within(views).getByRole("link", { name: "Needs attention" })
    ).toHaveAttribute("aria-current", "page");
    expect(
      within(views).getByRole("link", { name: "Example usage" })
    ).toHaveAttribute("href", "/?view=coverage&coverage=examples");
    expect(
      within(views).getByRole("link", { name: "Example matrix" })
    ).toHaveAttribute("href", "/?view=coverage&coverage=matrix");
  });

  it("lists only positive usage per example", () => {
    renderAt("/?view=coverage&coverage=examples");

    expect(
      screen.getByRole("heading", { name: "Example usage" })
    ).toBeInTheDocument();
    expect(screen.queryByText("Not recorded")).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", {
        name: "How quickly do nearby Lorenz runs diverge?",
      })
    ).toHaveAttribute("href", "/examples/lorenz-3d");
  });

  it("shows a scrollable matrix with sticky headers and linked marks", () => {
    renderAt("/?view=coverage&coverage=matrix");

    const table = screen.getByRole("table", {
      name: "Full example usage matrix",
    });
    expect(
      screen.getByRole("region", { name: "Scrollable example usage matrix" })
    ).toHaveAttribute("tabindex", "0");
    const feature = coverageFeatures[0];
    const example = examples[0]!;

    expect(
      within(table).queryByRole("link", {
        name: `${example.title}: ${feature.label} — No recorded usage`,
      })
    ).not.toBeInTheDocument();
    expect(
      within(table).getByRole("columnheader", { name: example.title })
    ).toHaveClass("sticky", "top-0");
    expect(
      within(table).getByRole("link", {
        name: "How quickly do nearby Lorenz runs diverge?: Dashboard layout — Example shown",
      })
    ).toHaveAttribute("href", "/examples/lorenz-3d");
    expect(
      within(table).getByRole("rowheader", { name: /Log scale/ })
    ).toHaveTextContent("Not implemented");

    expect(
      screen.getByRole("link", { name: "Needs attention" })
    ).toHaveAttribute("href", "/?view=coverage");
  });
});
