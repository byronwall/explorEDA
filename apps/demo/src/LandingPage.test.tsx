import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { useState } from "react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LandingPage } from "./LandingPage";

// The hero's live embed has its own test; keep these tests to one workspace.
vi.mock("./landing/LiveOrderBook", () => ({
  LiveOrderBook: () => <div data-testid="live-order-book" />,
}));

vi.mock("exploreda", () => {
  let workspaceMounts = 0;

  return {
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
          data-mount={mount}
        >
          <button onClick={() => onStateChange?.(capturedState)}>
            Emit state
          </button>
        </div>
      );
    },
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
  afterEach(() => vi.restoreAllMocks());

  it("returns to the example selector when browser history clears the example", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve("x,y\n1,2"),
      })
    );
    const router = createMemoryRouter(
      [{ path: "/explorEDA/*", element: <LandingPage /> }],
      {
        initialEntries: ["/explorEDA/", "/explorEDA/?example=lorenz-3d"],
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
      [{ path: "/explorEDA/*", element: <LandingPage /> }],
      { initialEntries: ["/explorEDA/"] }
    );

    render(<RouterProvider router={router} />);
    const featured = screen.getByRole("heading", {
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

  it("shows the featured guide above the workspace and opens it from the hero", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve("Channel,Revenue\nWeb,2"),
      })
    );
    const router = createMemoryRouter(
      [{ path: "/explorEDA/*", element: <LandingPage /> }],
      { initialEntries: ["/explorEDA/"] }
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
  });

  it("opens bundled sample data as a new import", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve("species,mass\nAdelie,3750\nGentoo,5000"),
    });
    vi.stubGlobal("fetch", fetchMock);
    const router = createMemoryRouter(
      [{ path: "/explorEDA/*", element: <LandingPage /> }],
      { initialEntries: ["/explorEDA/"] }
    );

    render(<RouterProvider router={router} />);
    fireEvent.click(screen.getByRole("button", { name: /Palmer penguins/ }));

    const workspace = await screen.findByTestId("workspace");
    expect(fetchMock).toHaveBeenCalledWith(
      "/explorEDA/datasets/palmer-penguins.csv"
    );
    expect(workspace).toHaveAttribute("data-rows", "2");
    expect(workspace).toHaveAttribute("data-has-saved-data", "false");
  });

  it("captures state without controlling the workspace and restores it on remount", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve("x,y\n1,2"),
      })
    );
    const router = createMemoryRouter(
      [{ path: "/explorEDA/*", element: <LandingPage /> }],
      { initialEntries: ["/explorEDA/?example=palmer-penguins"] }
    );

    render(<RouterProvider router={router} />);
    const workspace = await screen.findByTestId("workspace");
    expect(workspace).toHaveAttribute("data-rows", "1");
    expect(workspace).toHaveAttribute("data-has-saved-data", "true");
    const initialMount = workspace.getAttribute("data-mount");

    fireEvent.click(screen.getByRole("button", { name: "Emit state" }));
    expect(screen.getByTestId("workspace")).toHaveAttribute(
      "data-has-saved-data",
      "true"
    );

    fireEvent.click(screen.getByRole("button", { name: "Reset workspace" }));

    await waitFor(() => {
      const restoredWorkspace = screen.getByTestId("workspace");
      expect(restoredWorkspace).toHaveAttribute("data-rows", "1");
      expect(restoredWorkspace).toHaveAttribute("data-has-saved-data", "true");
      expect(restoredWorkspace.getAttribute("data-mount")).not.toBe(
        initialMount
      );
    });
  });

  it("shows full-analysis validation errors and accepts a valid followup", async () => {
    const router = createMemoryRouter(
      [{ path: "/explorEDA/*", element: <LandingPage /> }],
      { initialEntries: ["/explorEDA/"] }
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
});
