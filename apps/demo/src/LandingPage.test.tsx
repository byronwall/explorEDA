import {
  createShopFixture,
  stringifyAnalysisProject,
  selectAnalysisProjectView,
} from "exploreda";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { useState } from "react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { examples } from "./demos/examples";
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
      savedData,
      onStateChange,
    }: {
      data: unknown[];
      savedData?: unknown;
      onStateChange?: (state: unknown) => void;
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
          data-has-saved-data={savedData !== undefined}
          data-chart-count={settings?.charts?.length ?? 0}
          data-filter-count={settings?.rowsSettings?.filters?.length ?? 0}
          data-mount={mount}
        >
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
        initialEntries: ["/", "/?example=lorenz-3d"],
        initialIndex: 1,
      }
    );

    render(<RouterProvider router={router} />);
    expect(await screen.findByTestId("workspace")).toBeInTheDocument();

    await act(async () => {
      await router.navigate(-1);
    });

    await waitFor(() =>
      expect(
        screen.getByRole("heading", {
          name: /Embed an interactive analysis workspace/i,
        })
      ).toBeInTheDocument()
    );
    expect(screen.queryByTestId("workspace")).not.toBeInTheDocument();
  });

  it("leads with the featured example before import and restore", () => {
    const router = createMemoryRouter(
      [{ path: "/*", element: <LandingPage /> }],
      { initialEntries: ["/"] }
    );

    render(<RouterProvider router={router} />);
    const featured = screen.getByRole("heading", {
      level: 2,
      name: "Inside the order book",
    });
    const integration = screen.getByRole("heading", {
      name: "Use it in your React app",
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

  it("lists every example with its data, views, and features", () => {
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
      .getByRole("heading", { name: "Examples" })
      .closest("section") as HTMLElement;
    const list = within(section).getByRole("list");
    const items = within(list).getAllByRole("listitem");

    expect(
      within(section).getByRole("link", { name: "Browse chart guides" })
    ).toHaveAttribute("href", "/?view=docs");
    expect(
      within(section).getByRole("link", { name: "How rendering works" })
    ).toHaveAttribute("href", "/?view=docs&topic=rendering");
    expect(items).toHaveLength(examples.length);
    expect(within(section).queryByText("Show all examples")).toBeNull();
    expect(screen.queryByText(/feature coverage/i)).toBeNull();
    const penguins = items.find((item) =>
      within(item).queryByRole("button", { name: "Penguin field notes" })
    ) as HTMLElement;
    expect(penguins).toHaveTextContent("344 penguins");
    expect(penguins).toHaveTextContent("real data");
    expect(penguins).toHaveTextContent("8 views · scatter, row, box plot");
    expect(penguins).toHaveTextContent("Shared color key");

    fireEvent.click(
      within(penguins).getByRole("button", { name: "Penguin field notes" })
    );
    expect(router.state.location.search).toBe("?example=palmer-penguins");
  });

  it("shows the featured guide above the workspace and opens it from the hero", async () => {
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
    expect(router.state.location.search).toBe("?example=shop-operations");
    expect(screen.getByRole("note")).toHaveTextContent(
      "click Web in Sales channels"
    );
    expect(screen.getByRole("note")).toHaveTextContent(
      "Inspect it in Chart spec"
    );
    expect(
      screen.getByRole("link", { name: "React integration guide" })
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

  it("explains when a dropped file is not CSV or JSON", async () => {
    const router = createMemoryRouter(
      [{ path: "/*", element: <LandingPage /> }],
      { initialEntries: ["/"] }
    );
    render(<RouterProvider router={router} />);

    const file = new File(["hi"], "notes.txt", { type: "text/plain" });
    fireEvent.drop(window, {
      dataTransfer: { types: ["Files"], files: [file] },
    });
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "notes.txt is not a CSV or JSON file."
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
        initialEntries: ["/?example=palmer-penguins"],
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
    ]);
    fireEvent.click(screen.getByRole("button", { name: "Emit state" }));
    fireEvent.click(screen.getByRole("button", { name: "New view" }));
    expect(screen.getAllByRole("tab")).toHaveLength(4);
    await waitFor(() =>
      expect(localStorage.getItem("exploreda.saved-views.v1")).not.toBeNull()
    );
    first.unmount();

    render(<RouterProvider router={makeRouter()} />);
    expect(await screen.findByTestId("workspace")).toHaveAttribute(
      "data-rows",
      "1"
    );
    expect(screen.getAllByRole("tab")).toHaveLength(4);
    const restored = JSON.parse(
      localStorage.getItem("exploreda.saved-views.v1") ?? "{}"
    );
    expect(restored.sourceAnalysis).toContain('"x":1');
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
      { initialEntries: ["/"] }
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
      { initialEntries: ["/?example=shop-operations"] }
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

  it("replaces imported projects and restores the selected project after reload", async () => {
    localStorage.clear();
    const fixture = createShopFixture();
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
      [{ path: "/", element: <LandingPage /> }],
      { initialEntries: ["/"] }
    );
    const mounted = render(<RouterProvider router={router} />);
    const drop = (text: string) => {
      const file = new File([text], "project.json", {type:"application/json"});
      // This DOM environment omits File.text; keep the fixture's browser contract.
      Object.defineProperty(file, "text", {value:() => Promise.resolve(text)});
      fireEvent.drop(window, {dataTransfer:{types:["Files"],files:[file]}});
    };
    drop(stringifyAnalysisProject(file));
    await waitFor(() =>
      expect(screen.getByTestId("project-workspace")).toHaveAttribute(
        "data-query",
        "orders-by-customer"
      )
    );
    drop(stringifyAnalysisProject(selectAnalysisProjectView(file, "items")));
    await waitFor(() =>
      expect(screen.getByTestId("project-workspace")).toHaveAttribute(
        "data-query",
        "items-by-order"
      )
    );
    expect(router.state.location.search).toBe("?project=1");
    mounted.unmount();
    const reload = createMemoryRouter(
      [{ path: "/", element: <LandingPage /> }],
      { initialEntries: ["/?project=1"] }
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
