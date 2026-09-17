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
          name: /Explore data by connecting charts and filters/i,
        })
      ).toBeInTheDocument()
    );
    expect(screen.queryByTestId("workspace")).not.toBeInTheDocument();
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
});
