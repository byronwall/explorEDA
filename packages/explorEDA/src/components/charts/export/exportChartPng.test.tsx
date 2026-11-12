import { afterEach, describe, expect, it, vi } from "vitest";
import type { ChartSettings } from "@/types/ChartTypes";

const capture = vi.hoisted(() => vi.fn());
vi.mock("./chartImage", async (load) => ({
  ...(await load<typeof import("./chartImage")>()),
  captureChartPanel: capture,
}));

const { exportWorkspaceChartPng } = await import("./exportChartPng");

const chart = { id: "c1", type: "bar" } as ChartSettings;

function workspaceWith(id: string) {
  const root = document.createElement("div");
  root.innerHTML = `<div data-chart-id="${id}"><div class="eda-panel" data-chart-panel="${id}"></div></div>`;
  document.body.appendChild(root);
  return root;
}

afterEach(() => {
  capture.mockReset();
  document.body.innerHTML = "";
});

describe("exportWorkspaceChartPng", () => {
  it("names an unknown chart id", async () => {
    await expect(
      exportWorkspaceChartPng(document.body, [chart], "missing")
    ).rejects.toThrow('No chart with id "missing".');
  });

  it("rejects a chart that is not rendered, with no fallback", async () => {
    await expect(
      exportWorkspaceChartPng(workspaceWith("other"), [chart], "c1")
    ).rejects.toThrow("Chart is not rendered.");
    expect(capture).not.toHaveBeenCalled();
  });

  it("captures the panel in its own workspace when two share an id", async () => {
    workspaceWith("c1");
    const second = workspaceWith("c1");
    capture.mockResolvedValue({ blob: new Blob(), width: 2, height: 2 });
    await exportWorkspaceChartPng(second, [chart], "c1", { pixelRatio: 3 });
    expect(capture).toHaveBeenCalledWith(
      second.querySelector(".eda-panel"),
      chart,
      { pixelRatio: 3 }
    );
  });

  it("finds a chart open in its details view", async () => {
    const root = workspaceWith("other");
    const dialog = document.createElement("div");
    dialog.setAttribute("role", "dialog");
    dialog.innerHTML = `<div class="eda-panel" data-chart-panel="c1"></div>`;
    document.body.appendChild(dialog);
    capture.mockResolvedValue({ blob: new Blob(), width: 2, height: 2 });
    await exportWorkspaceChartPng(root, [chart], "c1");
    expect(capture).toHaveBeenCalledWith(
      dialog.firstElementChild,
      chart,
      undefined
    );
  });
});
