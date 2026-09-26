import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LiveOrderBook } from "./LiveOrderBook";

vi.mock("exploreda", () => ({
  ExplorEda: ({
    data,
    savedData,
    onStateChange,
  }: {
    data: unknown[];
    savedData?: { metadata?: { name?: string } };
    onStateChange?: (state: unknown) => void;
  }) => (
    <div
      data-testid="workspace"
      data-rows={data.length}
      data-saved-name={savedData?.metadata?.name}
    >
      <button onClick={() => onStateChange?.({})}>Emit state</button>
    </div>
  ),
}));

describe("LiveOrderBook", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("runs the order book with its saved settings and resets after edits", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve("Channel,Revenue\nWeb,2\nStore,3"),
      })
    );
    const onOpenFull = vi.fn();
    render(<LiveOrderBook onOpenFull={onOpenFull} />);

    const workspace = await screen.findByTestId("workspace");
    expect(workspace).toHaveAttribute("data-rows", "2");
    expect(workspace).toHaveAttribute(
      "data-saved-name",
      "Inside the order book"
    );

    const reset = screen.getByRole("button", { name: "Reset" });
    expect(reset).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Emit state" }));
    expect(reset).toBeEnabled();
    fireEvent.click(reset);
    expect(await screen.findByTestId("workspace")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reset" })).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "Full page" }));
    expect(onOpenFull).toHaveBeenCalled();
  });
});
