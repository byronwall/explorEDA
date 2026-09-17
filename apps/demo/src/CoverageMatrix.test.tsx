import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { CoverageMatrix } from "./CoverageMatrix";
import { coverageFeatures, getOpenGapCount } from "./demos/coverage";
import { examples } from "./demos/examples";

describe("CoverageMatrix", () => {
  it("defaults to an attention queue with exact gaps and explicit review terms", () => {
    render(
      <MemoryRouter initialEntries={["/?view=coverage"]}>
        <CoverageMatrix />
      </MemoryRouter>
    );

    expect(
      screen.getByRole("heading", { name: "Needs attention" })
    ).toBeInTheDocument();
    expect(
      screen.getByText(`${getOpenGapCount()} open gaps`)
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "No example is the declared reference for question-led titles."
      )
    ).toBeInTheDocument();
    expect(screen.getAllByText("Implemented").length).toBeGreaterThan(0);
    expect(
      screen.getAllByText("Feature review pending").length
    ).toBeGreaterThan(0);
    expect(screen.getAllByText("Example check pending").length).toBeGreaterThan(
      0
    );
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    const featureSummary = screen.getByText("Meaningful titles");
    expect(featureSummary.closest("details")).not.toHaveAttribute("open");
    fireEvent.click(featureSummary);
    expect(
      screen.getByText("State the question or finding that a view answers.")
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Example usage" })).toHaveAttribute(
      "href",
      "/?view=coverage&coverage=examples"
    );
  });

  it("reveals row detail on demand and provides a positive-only example view", () => {
    render(
      <MemoryRouter initialEntries={["/?view=coverage&coverage=examples"]}>
        <CoverageMatrix />
      </MemoryRouter>
    );

    expect(
      screen.getByRole("heading", { name: "Example usage" })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Positive coverage only: examples that show or check a feature. Empty cells are omitted."
      )
    ).toBeInTheDocument();
    expect(screen.queryByText("Not used")).not.toBeInTheDocument();

    const advanced = screen.getByText("Advanced: full example matrix");
    fireEvent.click(advanced);
    const table = screen.getByRole("table", {
      name: "Full example usage matrix",
    });
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
      screen.getAllByText("How quickly do nearby Lorenz runs diverge?")
    ).not.toHaveLength(0);

    const attentionLink = screen.getByRole("link", { name: "Needs attention" });
    expect(attentionLink).toHaveAttribute("href", "/?view=coverage");
  });
});
