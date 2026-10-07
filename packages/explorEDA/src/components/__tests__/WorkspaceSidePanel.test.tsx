import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { useState } from "react";
import { History } from "lucide-react";
import { registerAllCharts } from "@/charts/registerAllCharts";
import { PlotManager } from "@/components/PlotManager";
import { CalculationEditorProvider } from "@/components/calculations/CalculationEditor";
import { DataLayerProvider } from "@/providers/DataLayerProvider";

const data = [{ region: "North" }, { region: "South" }];

beforeAll(() => {
  registerAllCharts();
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
  Element.prototype.scrollIntoView = vi.fn();
});

function Host({ readOnly = false }: { readOnly?: boolean }) {
  const [open, setOpen] = useState(false);
  const [wide, setWide] = useState(false);
  return (
    <DataLayerProvider data={data} charts={[]}>
      <CalculationEditorProvider>
        <PlotManager
          readOnly={readOnly}
          sidePanels={[
            {
              id: "history-panel",
              label: "History",
              tooltip: "History: every saved change (H)",
              icon: <History />,
              shortcut: "h",
              open,
              onOpenChange: setOpen,
              wide,
              onWideChange: setWide,
              children: <p>Timeline content</p>,
            },
          ]}
        />
      </CalculationEditorProvider>
    </DataLayerProvider>
  );
}

describe("host side panels", () => {
  it("opens from the toolbar, replaces Rows, and returns focus on Escape", () => {
    render(<Host />);
    const toggle = screen.getByRole("button", { name: "History" });

    fireEvent.click(screen.getByRole("button", { name: "Rows" }));
    expect(screen.getByRole("region", { name: "Rows" })).toBeInTheDocument();

    fireEvent.click(toggle);
    const panel = screen.getByRole("complementary", { name: "History" });
    expect(panel).toHaveFocus();
    expect(within(panel).getByText("Timeline content")).toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "Rows" })).toBeNull();
    expect(toggle).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(
      within(panel).getByRole("button", { name: "Expand History" })
    );
    expect(panel).toHaveAttribute("data-wide");

    fireEvent.keyDown(panel, { key: "Escape" });
    expect(screen.queryByRole("complementary", { name: "History" })).toBeNull();
    expect(toggle).toHaveFocus();

    fireEvent.keyDown(document.body, { key: "h" });
    expect(
      screen.getByRole("complementary", { name: "History" })
    ).toBeInTheDocument();
    fireEvent.keyDown(document.body, { key: "r" });
    expect(screen.queryByRole("complementary", { name: "History" })).toBeNull();
    expect(screen.getByRole("region", { name: "Rows" })).toBeInTheDocument();
  });

  it("keeps inspection and History usable while read-only", () => {
    render(<Host readOnly />);
    const rowsToggle = screen.getByRole("button", { name: "Rows" });
    expect(rowsToggle.closest("[inert]")).toBeNull();
    expect(screen.getByRole("button", { name: "Fields" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Add chart" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Calculations" })).toBeDisabled();
    expect(screen.getByRole("main")).toHaveAttribute("inert");
    const toggle = screen.getByRole("button", { name: "History" });
    expect(toggle.closest("[inert]")).toBeNull();

    fireEvent.keyDown(document.body, { key: "r" });
    expect(screen.getByRole("region", { name: "Rows" })).toBeInTheDocument();
    fireEvent.click(toggle);
    expect(
      screen.getByRole("complementary", { name: "History" })
    ).toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "Rows" })).toBeNull();
  });
});
