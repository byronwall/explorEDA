import {
  stringifyAnalysisProject,
  selectAnalysisProjectView,
} from "exploreda/analysis";
import { shopProject } from "./demos/multiSourceShop";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { readFileSync } from "node:fs";
import { useState } from "react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { catalogue, examples } from "./demos/examples";
import { compositionExamples, exampleGroups } from "./demos/exampleIndex";
import { LandingPage } from "./LandingPage";

// The hero's live embed has its own test; keep these tests to one workspace.
vi.mock("./landing/LiveOrderBook", () => ({
  LiveOrderBook: () => <div data-testid="live-order-book" />,
}));

vi.mock("exploreda", async () => {
  let workspaceMounts = 0;
  const actual = await vi.importActual<typeof import("exploreda")>("exploreda");

  return {
    ...actual,
    ExplorEda: ({
      data,
      fieldTypes,
      savedData,
      onStateChange,
      toolbarStart,
      toolbarEnd,
    }: {
      data: unknown[];
      fieldTypes?: Record<string, string>;
      savedData?: unknown;
      onStateChange?: (state: unknown) => void;
      toolbarStart?: React.ReactNode;
      toolbarEnd?: React.ReactNode;
    }) => {
      const [mount] = useState(() => ++workspaceMounts);
      const settings = savedData as
        | { charts?: unknown[]; rowsSettings?: { filters?: unknown[] } }
        | undefined;
      const capturedState = {
        charts: [],
        calculations: [],
        gridSettings: {
          columnCount: 12,
          rowHeight: 100,
          containerPadding: 10,
          showBackgroundMarkers: true,
        },
        metadata: {
          name: "Captured",
          version: 1,
          createdAt: "2026-01-01T00:00:00.000Z",
          modifiedAt: "2026-01-01T00:00:00.000Z",
        },
        colorScales: [],
      };

      return (
        <div
          data-testid="workspace"
          data-rows={data.length}
          data-first-row={JSON.stringify(data[0] ?? null)}
          data-field-types={JSON.stringify(fieldTypes ?? null)}
          data-has-saved-data={savedData !== undefined}
          data-chart-count={settings?.charts?.length ?? 0}
          data-filter-count={settings?.rowsSettings?.filters?.length ?? 0}
          data-mount={mount}
        >
          {toolbarStart}
          {toolbarEnd}
          <button onClick={() => onStateChange?.(capturedState)}>
            Emit state
          </button>
        </div>
      );
    },
    ExplorEdaProject: ({ view }: { view: { queryId: string } }) => (
      <div data-testid="project-workspace" data-query={view.queryId} />
    ),
    parseSavedAnalysis: (text: string) => JSON.parse(text),
    validateSavedAnalysisForData: (analysis: {
      settings: { calculations: { expression: string }[] };
    }) =>
      analysis.settings.calculations.every(
        ({ expression }) => !expression.includes("UnknownField")
      ),
  };
});

describe("LandingPage routing", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it("returns to the example selector when browser history clears the example", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve("x,y\n1,2"),
      })
    );
    const router = createMemoryRouter(
      [{ path: "/*", element: <LandingPage /> }],
      {
        initialEntries: ["/", "/examples/lorenz-3d"],
        initialIndex: 1,
      }
    );

    render(<RouterProvider router={router} />);
    // The example loads lazily; under a full test run it can take over 1 s.
    expect(
      await screen.findByTestId("workspace", {}, { timeout: 5000 })
    ).toBeInTheDocument();

    await act(async () => {
      await router.navigate(-1);
    });

    await waitFor(() =>
      expect(
        screen.getByRole("heading", {
          name: /Explore data with charts that filter each other/i,
        })
      ).toBeInTheDocument()
    );
    expect(screen.queryByTestId("workspace")).not.toBeInTheDocument();
  });

  it("routes each way to run explorEDA to its docs", () => {
    const router = createMemoryRouter(
      [{ path: "/*", element: <LandingPage /> }],
      { initialEntries: ["/"] }
    );

    render(<RouterProvider router={router} />);
    const [heroCopy] = screen.getAllByRole("button", { name: "Copy command" });
    expect(heroCopy!.closest("header")).not.toBeNull();
    const section = screen
      .getByRole("heading", { name: "Run it where your data lives" })
      .closest("section") as HTMLElement;
    const routes = within(section)
      .getAllByRole("link")
      .map((link) => [link.textContent, link.getAttribute("href")]);
    expect(routes).toEqual([
      ["Work in a project folder", "/docs/project-folders"],
      ["Read from a database", "/docs/database-sources"],
      ["Write a notebook", "/docs/notebooks"],
      ["Run a team server", "/docs/team-server"],
      ["Embed it in React", "/docs/developers#quick-start"],
    ]);
  });

  it("leads with the featured analysis before import and restore", () => {
    const router = createMemoryRouter(
      [{ path: "/*", element: <LandingPage /> }],
      { initialEntries: ["/"] }
    );

    render(<RouterProvider router={router} />);
    const featured = screen.getByRole("heading", {
      level: 2,
      name: "Where January's flights lost time",
    });
    const featuredSection = featured.closest("section") as HTMLElement;
    expect(
      within(featuredSection).getByRole("button", {
        name: /Weather at the scheduled hour/,
      })
    ).toBeInTheDocument();
    const integration = screen.getByRole("heading", {
      name: "Embed it in a React app",
    });
    const importHeading = screen.getByRole("heading", {
      name: "Import your data",
    });
    const follows = (a: Element, b: Element) =>
      Boolean(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);
    expect(follows(featured, integration)).toBe(true);
    expect(follows(integration, importHeading)).toBe(true);
    expect(
      screen.getByRole("textbox", { name: "Full analysis JSON" })
    ).toBeInTheDocument();
  });

  it("previews report graphics and links to the index of every example", () => {
    const router = createMemoryRouter(
      [{ path: "/*", element: <LandingPage /> }],
      { initialEntries: ["/"] }
    );

    render(<RouterProvider router={router} />);
    const section = screen
      .getByRole("heading", { name: "Report graphics" })
      .closest("section") as HTMLElement;
    const newest = compositionExamples[0]!;
    expect(
      within(section).getByRole("link", { name: newest.title })
    ).toHaveAttribute("href", `/examples/${newest.id}`);
    expect(
      within(section).getByRole("link", {
        name: `All ${compositionExamples.length} report graphics`,
      })
    ).toHaveAttribute("href", "/examples#report-graphics");
    expect(
      screen.getByRole("link", {
        name: `Browse all ${examples.length} examples`,
      })
    ).toHaveAttribute("href", "/examples");
  });

  it("lists every example once on the examples page", () => {
    const router = createMemoryRouter(
      [{ path: "/*", element: <LandingPage /> }],
      { initialEntries: ["/examples"] }
    );

    render(<RouterProvider router={router} />);
    expect(
      screen.getByRole("heading", { level: 1, name: "All examples" })
    ).toBeInTheDocument();
    for (const example of examples) {
      expect(screen.getByRole("link", { name: example.title })).toHaveAttribute(
        "href",
        `/examples/${example.id}`
      );
    }
    expect(
      exampleGroups.reduce((total, group) => total + group.examples.length, 0)
    ).toBe(examples.length);
    expect(screen.queryByTestId("workspace")).not.toBeInTheDocument();
  });

  it("lists the catalogue, narrows it by capability, and opens a tab", () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve("species\nAdelie"),
      })
    );
    const router = createMemoryRouter(
      [{ path: "/*", element: <LandingPage /> }],
      { initialEntries: ["/"] }
    );

    render(<RouterProvider router={router} />);
    const section = screen
      .getByRole("heading", { name: "Example analyses" })
      .closest("section") as HTMLElement;
    const list = within(section).getByRole("list");
    const items = () => within(list).getAllByRole("listitem");

    expect(
      screen.getByRole("link", { name: "How rendering works" })
    ).toHaveAttribute("href", "/docs/rendering");
    expect(screen.getByRole("link", { name: "Bar chart" })).toHaveAttribute(
      "href",
      "/docs/bar"
    );
    expect(items()).toHaveLength(catalogue.length);
    expect(screen.queryByText(/feature coverage/i)).toBeNull();
    const wine = items().find(
      (item) =>
        within(item).queryAllByRole("button", {
          name: "What separates a good red wine",
        }).length > 0
    ) as HTMLElement;
    expect(wine).toHaveTextContent("1,599 wines");
    expect(wine).toHaveTextContent("real data");
    expect(wine).toHaveTextContent("Acidity and balance");

    fireEvent.click(within(section).getByRole("button", { name: "Maps" }));
    expect(
      within(section).getByRole("button", { name: "Maps" })
    ).toHaveAttribute("aria-pressed", "true");
    expect(
      items().map((item) => within(item).getAllByRole("button")[0]!.textContent)
    ).toEqual([
      "Income, longevity, and power across 217 economies",
      "Every strong earthquake of 2023",
    ]);

    fireEvent.click(
      within(section).getByRole("button", { name: "Where they struck" })
    );
    expect(router.state.location.pathname).toBe("/examples/earthquakes-2023");
    expect(router.state.location.search).toBe("?tab=Where+they+struck");
  });

  it("opens the order book from the hero with no guide above it", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve("Channel,Revenue\nWeb,2"),
      })
    );
    const router = createMemoryRouter(
      [{ path: "/*", element: <LandingPage /> }],
      { initialEntries: ["/"] }
    );

    render(<RouterProvider router={router} />);
    fireEvent.click(
      screen.getByRole("button", { name: "Explore the order book" })
    );

    expect(await screen.findByTestId("workspace")).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/examples/shop-operations");
    expect(screen.queryByRole("note")).toBeNull();
    expect(
      screen.getByRole("link", {
        name: /Embed this workspace in your React app/,
      })
    ).toHaveAttribute("href", "/#integration");
  });

  it("opens bundled sample data as a new import", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve("species,mass\nAdelie,3750\nGentoo,5000"),
    });
    vi.stubGlobal("fetch", fetchMock);
    const router = createMemoryRouter(
      [{ path: "/*", element: <LandingPage /> }],
      { initialEntries: ["/"] }
    );

    render(<RouterProvider router={router} />);
    fireEvent.click(screen.getByRole("button", { name: /Palmer penguins/ }));

    const workspace = await screen.findByTestId("workspace");
    expect(fetchMock).toHaveBeenCalledWith("/datasets/palmer-penguins.csv");
    expect(workspace).toHaveAttribute("data-rows", "2");
    expect(workspace).toHaveAttribute("data-has-saved-data", "false");
  });

  it("opens a CSV dropped anywhere on the page in the workspace", async () => {
    const router = createMemoryRouter(
      [{ path: "/*", element: <LandingPage /> }],
      { initialEntries: ["/"] }
    );
    render(<RouterProvider router={router} />);

    const file = new File(
      ["species,mass\nAdelie,3750\nGentoo,5000"],
      "penguins.csv",
      {
        type: "text/csv",
      }
    );
    const dataTransfer = { types: ["Files"], files: [file] };
    fireEvent.dragEnter(window, { dataTransfer });
    expect(
      await screen.findByText("Drop to explore your data")
    ).toBeInTheDocument();

    fireEvent.drop(window, { dataTransfer });
    const workspace = await screen.findByTestId("workspace");
    expect(workspace).toHaveAttribute("data-rows", "2");
    expect(workspace).toHaveAttribute("data-has-saved-data", "false");
    expect(screen.queryByText("Drop to explore your data")).toBeNull();
  });

  it("opens a dropped TSV with its identifier text and field types", async () => {
    const router = createMemoryRouter(
      [{ path: "/*", element: <LandingPage /> }],
      { initialEntries: ["/"] }
    );
    render(<RouterProvider router={router} />);

    const file = new File(
      ["order_id\tamount\n0012\t4.5\n0040\t\n"],
      "orders.tsv",
      { type: "text/tab-separated-values" }
    );
    fireEvent.drop(window, {
      dataTransfer: { types: ["Files"], files: [file] },
    });
    const workspace = await screen.findByTestId("workspace");
    expect(workspace).toHaveAttribute("data-rows", "2");
    expect(JSON.parse(workspace.dataset.firstRow!)).toEqual({
      order_id: "0012",
      amount: 4.5,
    });
    expect(JSON.parse(workspace.dataset.fieldTypes!)).toEqual({
      order_id: "string",
      amount: "number",
    });
  });

  it("asks which sheet to open from a dropped workbook", async () => {
    const router = createMemoryRouter(
      [{ path: "/*", element: <LandingPage /> }],
      { initialEntries: ["/"] }
    );
    render(<RouterProvider router={router} />);

    const bytes = readFileSync(
      "../../packages/explorEDA/src/lib/readers/fixtures/orders.xlsx"
    );
    const file = new File([bytes], "orders.xlsx");
    fireEvent.drop(window, {
      dataTransfer: { types: ["Files"], files: [file] },
    });
    const picker = await screen.findByRole("group", {
      name: "Choose a sheet from orders.xlsx",
    });
    expect(
      within(picker).getByRole("button", { name: /Orders/ })
    ).toHaveTextContent("Largest");
    expect(screen.queryByTestId("workspace")).toBeNull();
    fireEvent.click(within(picker).getByRole("button", { name: /Returns/ }));
    const workspace = await screen.findByTestId("workspace");
    expect(workspace).toHaveAttribute("data-rows", "10");
    expect(JSON.parse(workspace.dataset.firstRow!)).toEqual({
      order_id: "00003",
      reason: "late",
      refund: 4.5,
    });
  });

  it("explains when a dropped file is not a readable format", async () => {
    const router = createMemoryRouter(
      [{ path: "/*", element: <LandingPage /> }],
      { initialEntries: ["/"] }
    );
    render(<RouterProvider router={router} />);

    const file = new File(["%PDF"], "slides.pdf", {
      type: "application/pdf",
    });
    fireEvent.drop(window, {
      dataTransfer: { types: ["Files"], files: [file] },
    });
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "slides.pdf is not a CSV, TSV, JSON, JSON Lines, Excel, Parquet, or Arrow file."
    );
    expect(screen.queryByTestId("workspace")).toBeNull();
  });

  it("saves named views and restores them after a reload", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve("x,y\n1,2"),
      })
    );
    const makeRouter = () =>
      createMemoryRouter([{ path: "/*", element: <LandingPage /> }], {
        initialEntries: ["/examples/palmer-penguins"],
      });

    const first = render(<RouterProvider router={makeRouter()} />);
    expect(await screen.findByTestId("workspace")).toHaveAttribute(
      "data-rows",
      "1"
    );
    // The example opens with its saved views as tabs.
    expect(screen.getAllByRole("tab").map((tab) => tab.textContent)).toEqual([
      "Penguin field notes",
      "Gentoo on Biscoe",
      "Bill shape",
      "Field report",
    ]);
    fireEvent.click(screen.getByRole("button", { name: "Emit state" }));
    fireEvent.click(screen.getByRole("button", { name: "New view" }));
    expect(screen.getAllByRole("tab")).toHaveLength(5);
    await waitFor(() =>
      expect(localStorage.getItem("exploreda.saved-views.v1")).not.toBeNull()
    );
    first.unmount();

    render(<RouterProvider router={makeRouter()} />);
    expect(await screen.findByTestId("workspace")).toHaveAttribute(
      "data-rows",
      "1"
    );
    expect(screen.getAllByRole("tab")).toHaveLength(5);
    const restored = JSON.parse(
      localStorage.getItem("exploreda.saved-views.v1") ?? "{}"
    );
    // The rows are saved once, apart from the session that changes per edit.
    expect(restored.sourceAnalysis).toBeUndefined();
    expect(localStorage.getItem("exploreda.saved-views.v1.source")).toContain(
      '"x":1'
    );
    expect(
      restored.history.every(
        (entry: { tabs: unknown[] }) => !("sourceAnalysis" in entry)
      )
    ).toBe(true);
  });

  it("reports a failed saved-session restore and keeps it until a new source is chosen", async () => {
    const unreadable = "{not valid json";
    localStorage.setItem("exploreda.saved-views.v1", unreadable);
    const router = createMemoryRouter(
      [{ path: "/*", element: <LandingPage /> }],
      { initialEntries: ["/viewer"] }
    );

    render(<RouterProvider router={router} />);
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Saved data could not be restored"
    );
    expect(localStorage.getItem("exploreda.saved-views.v1")).toBe(unreadable);

    fireEvent.click(screen.getByRole("button", { name: "Retry restore" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Saved data could not be restored"
    );
    expect(localStorage.getItem("exploreda.saved-views.v1")).toBe(unreadable);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Clear saved data and start with new data",
      })
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(localStorage.getItem("exploreda.saved-views.v1")).toBeNull();
    expect(
      screen.getByRole("heading", { name: "Import your data" })
    ).toBeInTheDocument();
  });

  it("restores the saved session when its example URL is still present", async () => {
    const savedSettings = {
      charts: [{ id: "saved-chart", filters: [] }],
      calculations: [],
      gridSettings: {
        columnCount: 12,
        rowHeight: 100,
        containerPadding: 10,
        showBackgroundMarkers: true,
      },
      metadata: {
        name: "Returns",
        version: 1,
        createdAt: "2026-01-01T00:00:00.000Z",
        modifiedAt: "2026-01-01T00:00:00.000Z",
      },
      colorScales: [],
      rowsSettings: {
        columns: [],
        sortDirection: "asc",
        filters: [
          {
            type: "text",
            field: "channel",
            operator: "equals",
            value: "Store",
          },
        ],
        globalSearch: "",
      },
    };
    const tabs = [
      { id: "sales", name: "Sales", settings: savedSettings },
      { id: "returns", name: "Returns", settings: savedSettings },
    ];
    const savedRows = [{ channel: "Web" }, { channel: "Store" }];
    const storedSession = {
      version: 1,
      exampleId: "shop-operations",
      sourceAnalysis: JSON.stringify({
        format: "exploreda-analysis",
        version: 1,
        data: savedRows,
        settings: savedSettings,
      }),
      tabs,
      activeTabId: "returns",
      history: [{ at: "2026-01-01T00:00:00.000Z", label: "Filter", tabs }],
      path: [0],
      cursor: 0,
    };
    localStorage.setItem(
      "exploreda.saved-views.v1",
      JSON.stringify(storedSession)
    );
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve("channel\nInside example"),
    });
    vi.stubGlobal("fetch", fetchMock);
    const router = createMemoryRouter(
      [{ path: "/*", element: <LandingPage /> }],
      { initialEntries: ["/examples/shop-operations"] }
    );

    render(<RouterProvider router={router} />);
    const workspace = await screen.findByTestId("workspace");
    expect(workspace).toHaveAttribute("data-rows", "2");
    expect(workspace).toHaveAttribute("data-chart-count", "1");
    expect(workspace).toHaveAttribute("data-filter-count", "1");
    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.getByRole("tab", { name: "Sales" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Returns" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
  });

  it("shows full-analysis validation errors and accepts a valid followup", async () => {
    const router = createMemoryRouter(
      [{ path: "/*", element: <LandingPage /> }],
      { initialEntries: ["/"] }
    );

    render(<RouterProvider router={router} />);
    const input = screen.getByRole("textbox", { name: "Full analysis JSON" });
    const base = {
      format: "exploreda-analysis",
      version: 1,
      data: [{ value: 2 }],
      settings: {
        charts: [],
        calculations: [],
        gridSettings: {
          columnCount: 12,
          rowHeight: 100,
          containerPadding: 10,
          showBackgroundMarkers: true,
        },
        metadata: {
          name: "Test",
          version: 1,
          createdAt: "2026-01-01T00:00:00.000Z",
          modifiedAt: "2026-01-01T00:00:00.000Z",
        },
        colorScales: [],
      },
    };

    fireEvent.change(input, {
      target: {
        value: JSON.stringify({
          ...base,
          settings: {
            ...base.settings,
            calculations: [
              { resultColumnName: "double", expression: "UnknownField * 2" },
            ],
          },
        }),
      },
    });
    fireEvent.click(screen.getByRole("button", { name: "Open analysis JSON" }));
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Analysis formulas do not match the saved source rows"
    );
    expect(screen.queryByTestId("workspace")).not.toBeInTheDocument();

    fireEvent.change(input, { target: { value: JSON.stringify(base) } });
    fireEvent.click(screen.getByRole("button", { name: "Open analysis JSON" }));
    expect(await screen.findByTestId("workspace")).toHaveAttribute(
      "data-rows",
      "1"
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
  describe("dedicated URLs", () => {
    const settings = {
      charts: [],
      calculations: [],
      gridSettings: {
        columnCount: 12,
        rowHeight: 100,
        containerPadding: 10,
        showBackgroundMarkers: true,
      },
      metadata: {
        name: "Saved",
        version: 1,
        createdAt: "2026-01-01T00:00:00.000Z",
        modifiedAt: "2026-01-01T00:00:00.000Z",
      },
      colorScales: [],
    };
    const storeSession = (exampleId?: string) => {
      const tabs = [{ id: "saved", name: "Saved view", settings }];
      localStorage.setItem(
        "exploreda.saved-views.v1",
        JSON.stringify({
          version: 1,
          ...(exampleId ? { exampleId } : {}),
          sourceAnalysis: JSON.stringify({
            format: "exploreda-analysis",
            version: 1,
            data: [{ a: 1 }, { a: 2 }, { a: 3 }],
            settings,
          }),
          tabs,
          activeTabId: "saved",
          history: [{ at: "2026-01-01T00:00:00.000Z", label: "View", tabs }],
          path: [0],
          cursor: 0,
        })
      );
    };
    const renderAt = (path: string) => {
      const router = createMemoryRouter(
        [{ path: "/*", element: <LandingPage /> }],
        { initialEntries: [path] }
      );
      render(<RouterProvider router={router} />);
      return router;
    };

    it("always shows the home page at / and reopens the saved analysis from /viewer", async () => {
      storeSession("palmer-penguins");
      const router = renderAt("/");

      expect(
        screen.getByRole("heading", {
          name: /Explore data with charts that filter each other/i,
        })
      ).toBeInTheDocument();
      expect(screen.queryByTestId("workspace")).toBeNull();

      fireEvent.click(
        screen.getByRole("link", { name: "or reopen your last analysis" })
      );
      expect(router.state.location.pathname).toBe("/viewer");
      expect(await screen.findByTestId("workspace")).toHaveAttribute(
        "data-rows",
        "3"
      );
      expect(screen.getByRole("tab", { name: "Saved view" })).toBeVisible();
      // The session keeps its example's title in the viewer.
      expect(
        screen.getByRole("heading", { name: "Penguin field notes" })
      ).toBeInTheDocument();
    });

    it("keeps the saved analysis when Back returns home", async () => {
      storeSession();
      const router = renderAt("/viewer");
      expect(await screen.findByTestId("workspace")).toBeInTheDocument();

      fireEvent.click(screen.getByRole("button", { name: "Back to examples" }));
      expect(router.state.location.pathname).toBe("/");
      await waitFor(() => expect(screen.queryByTestId("workspace")).toBeNull());
      expect(localStorage.getItem("exploreda.saved-views.v1")).not.toBeNull();
    });

    it("opens an example fresh when the saved analysis came from another source", async () => {
      storeSession();
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve("x,y\n1,2"),
      });
      vi.stubGlobal("fetch", fetchMock);
      renderAt("/examples/lorenz-3d");

      expect(await screen.findByTestId("workspace")).toHaveAttribute(
        "data-rows",
        "1"
      );
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it("sends the viewer home when nothing is saved", async () => {
      const router = renderAt("/viewer");
      await waitFor(() => expect(router.state.location.pathname).toBe("/"));
      expect(screen.queryByTestId("workspace")).toBeNull();
      expect(
        screen.queryByRole("link", { name: "or reopen your last analysis" })
      ).toBeNull();
    });

    it("moves links from the old example query to the example URL", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: true,
          text: () => Promise.resolve("x,y\n1,2"),
        })
      );
      const router = renderAt("/?example=lorenz-3d");
      await waitFor(() =>
        expect(router.state.location.pathname).toBe("/examples/lorenz-3d")
      );
      expect(router.state.location.search).toBe("");
      expect(await screen.findByTestId("workspace")).toBeInTheDocument();
    });
  });

  it("opens a dropped project view and restores it after reload", async () => {
    localStorage.clear();
    const fixture = structuredClone(shopProject);
    const file = {
      format: "exploreda-project" as const,
      version: 1 as const,
      project: fixture.project,
      tables: fixture.sources,
      views: [
        { id: "orders", name: "Orders", queryId: "orders-by-customer" },
        { id: "items", name: "Items", queryId: "items-by-order" },
      ],
      activeViewId: "orders",
    };
    const router = createMemoryRouter(
      [{ path: "/*", element: <LandingPage /> }],
      { initialEntries: ["/"] }
    );
    const mounted = render(<RouterProvider router={router} />);
    const drop = (text: string) => {
      const file = new File([text], "project.json", {
        type: "application/json",
      });
      // This DOM environment omits File.text; keep the fixture's browser contract.
      Object.defineProperty(file, "text", {
        value: () => Promise.resolve(text),
      });
      fireEvent.drop(window, {
        dataTransfer: { types: ["Files"], files: [file] },
      });
    };
    drop(stringifyAnalysisProject(selectAnalysisProjectView(file, "items")));
    await waitFor(() =>
      expect(screen.getByTestId("project-workspace")).toHaveAttribute(
        "data-query",
        "items-by-order"
      )
    );
    expect(router.state.location.pathname).toBe("/viewer");
    expect(router.state.location.search).toBe("?project=1");
    mounted.unmount();
    const reload = createMemoryRouter(
      [{ path: "/*", element: <LandingPage /> }],
      { initialEntries: ["/viewer?project=1"] }
    );
    render(<RouterProvider router={reload} />);
    await waitFor(() =>
      expect(screen.getByTestId("project-workspace")).toHaveAttribute(
        "data-query",
        "items-by-order"
      )
    );
  });
});
