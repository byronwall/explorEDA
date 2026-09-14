import { act, render, screen, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LandingPage } from "./LandingPage";

vi.mock("exploreda", () => ({
  ExplorEda: ({ data }: { data: unknown[] }) => (
    <div data-testid="workspace">Rows: {data.length}</div>
  ),
}));

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
});
