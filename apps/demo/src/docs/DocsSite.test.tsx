import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, vi } from "vitest";
import { catalogue } from "./catalogue";
import { DocsSite } from "./DocsSite";

beforeEach(() => {
  vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
});

afterEach(() => vi.restoreAllMocks());

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <DocsSite />
    </MemoryRouter>
  );
}

describe("docs routes", () => {
  it("lists each guide on the index", () => {
    renderAt("/docs");
    expect(screen.getByRole("heading", { name: "Docs" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Scatter plot" })).toHaveAttribute(
      "href",
      "/docs/scatter"
    );
    expect(screen.getByRole("link", { name: "Bar chart" })).toHaveAttribute(
      "href",
      "/docs/bar"
    );
    expect(
      screen.getByRole("link", { name: "How rendering works" })
    ).toHaveAttribute("href", "/docs/rendering");
  });

  it("renders the scatter guide with its example and trace limits", async () => {
    renderAt("/docs/scatter");
    expect(
      screen.getByRole("heading", { level: 1, name: "Scatter plot" })
    ).toHaveFocus();
    expect(
      await screen.findByText(
        /Trace works on every chart type except 3D scatter plots/
      )
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Open the example" })
    ).toHaveAttribute("href", "/examples/scatter-trace");
    expect(
      screen.getByRole("navigation", { name: "On this page" })
    ).toHaveTextContent("Selection and row scope");
    expect(
      screen.getByRole("heading", { level: 2, name: "Selection and row scope" })
    ).toHaveAttribute("id", "selection-and-row-scope");
  });

  it("renders the bar guide's row scopes", async () => {
    renderAt("/docs/bar");
    expect(
      await screen.findByText(/globally filtered rows/)
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Open the example" })
    ).toHaveAttribute("href", "/examples/shop-operations");
  });

  it("renders the rendering guide's worked order", async () => {
    renderAt("/docs/rendering");
    expect(await screen.findByText(/T-001 has Units 2/)).toBeInTheDocument();
    expect(screen.getByText("Every loaded source row.")).toBeInTheDocument();
    expect(screen.getByText("(75, 30)")).toBeInTheDocument();
  });

  it("offers the index for an unknown page", () => {
    renderAt("/docs/pie");
    expect(
      screen.getByRole("heading", { name: "That page does not exist" })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "docs index" })).toHaveAttribute(
      "href",
      "/docs"
    );
  });

  it.each(catalogue.map((page) => [page.topic]))(
    "renders every section of /docs/%s",
    async (topic) => {
      const { unmount } = renderAt(`/docs/${topic}`);
      const sections = await screen.findAllByRole("heading", { level: 2 });
      expect(sections.length).toBeGreaterThan(0);
      unmount();
    }
  );
});
