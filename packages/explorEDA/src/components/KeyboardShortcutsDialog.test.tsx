import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { registerAllCharts } from "@/charts/registerAllCharts";
import { PlotManager } from "@/components/PlotManager";
import { DataLayerProvider } from "@/providers/DataLayerProvider";

const data = [{ region: "North", revenue: 10 }];

beforeAll(() => {
  registerAllCharts();
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
  Element.prototype.scrollIntoView = vi.fn();
});

describe("KeyboardShortcutsDialog", () => {
  it("opens with ? and lists the workspace shortcuts", () => {
    render(
      <DataLayerProvider data={data} charts={[]}>
        <PlotManager />
      </DataLayerProvider>
    );

    fireEvent.keyDown(document.body, { key: "?", shiftKey: true });

    const dialog = screen.getByRole("dialog", { name: "Keyboard shortcuts" });
    expect(dialog).toHaveTextContent("Open or close the field list");
    expect(dialog).toHaveTextContent("Show every field's distribution");
  });

  it("ignores ? while the user is typing", () => {
    render(
      <DataLayerProvider data={data} charts={[]}>
        <PlotManager />
        <input aria-label="Notes" />
      </DataLayerProvider>
    );

    fireEvent.keyDown(screen.getByRole("textbox", { name: "Notes" }), {
      key: "?",
      shiftKey: true,
    });

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
