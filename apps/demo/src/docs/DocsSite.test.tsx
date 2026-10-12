import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, vi } from "vitest";
import { catalogue } from "./catalogue";
import { DocsSite } from "./DocsSite";

beforeEach(() => {
  vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
  // jsdom lays nothing out, so it has no scrollIntoView.
  Element.prototype.scrollIntoView = vi.fn();
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
    expect(
      screen.getByRole("heading", { level: 1, name: "explorEDA docs" })
    ).toBeInTheDocument();
    const main = within(screen.getByRole("main"));
    expect(main.getByRole("link", { name: "Scatter plot" })).toHaveAttribute(
      "href",
      "/docs/scatter"
    );
    // The chooser recommends it too.
    for (const link of main.getAllByRole("link", { name: "Bar chart" })) {
      expect(link).toHaveAttribute("href", "/docs/bar");
    }
    expect(
      main.getByRole("link", { name: "How rendering works" })
    ).toHaveAttribute("href", "/docs/rendering");
  });

  it("shows the charts that answer the question picked", async () => {
    renderAt("/docs");
    const panel = () => within(screen.getByRole("tabpanel"));
    expect(
      panel().getByRole("link", { name: "Bar chart" })
    ).toBeInTheDocument();
    screen.getByRole("tab", { name: "How does it change over time?" }).click();
    expect(
      await panel().findByRole("link", { name: "Line chart" })
    ).toHaveAttribute("href", "/docs/line");
    expect(panel().queryByRole("link", { name: "Bar chart" })).toBeNull();
  });

  it("opens search with the keyboard and goes to a setting", async () => {
    renderAt("/docs/scatter");
    fireEvent.keyDown(document, { key: "k", metaKey: true });
    const input = screen.getByRole("combobox", {
      name: "Search pages, sections, and settings",
    });
    fireEvent.change(input, { target: { value: "binCount" } });
    const option = await screen.findByRole("option", { name: /binCount/ });
    expect(option).toHaveAttribute("aria-selected", "true");
    fireEvent.keyDown(input, { key: "Enter" });
    expect(
      await screen.findByRole("heading", { level: 1, name: "Bar chart" })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("dialog", { name: "Search the docs" })
    ).toBeNull();
  });

  it("puts the group with the best search hit first", async () => {
    renderAt("/docs/scatter");
    fireEvent.click(
      screen.getAllByRole("button", { name: "Search the docs" })[0]!
    );
    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "opacity" },
    });
    const first = (await screen.findAllByRole("option"))[0];
    expect(first).toHaveTextContent(/pointOpacity/);
    expect(first).toHaveAttribute("aria-selected", "true");
  });

  it("lists every page in the sidebar, marking the current one", () => {
    renderAt("/docs/bar");
    const nav = within(screen.getByRole("navigation", { name: "Docs pages" }));
    expect(nav.getAllByRole("link")).toHaveLength(catalogue.length);
    expect(nav.getByRole("link", { name: "Bar chart" })).toHaveAttribute(
      "aria-current",
      "page"
    );
  });

  it("links to the previous and next pages", () => {
    renderAt("/docs/bar");
    const pager = within(
      screen.getByRole("navigation", { name: "Previous and next pages" })
    );
    expect(pager.getByRole("link", { name: /Scatter plot/ })).toHaveAttribute(
      "href",
      "/docs/scatter"
    );
    expect(pager.getByRole("link", { name: /Row chart/ })).toHaveAttribute(
      "href",
      "/docs/row"
    );
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
      screen.getByRole("link", { name: "Trace a scatter point" })
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
      screen.getByRole("link", { name: "Inside the order book" })
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
