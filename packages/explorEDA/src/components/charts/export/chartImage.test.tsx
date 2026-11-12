import { afterEach, describe, expect, it, vi } from "vitest";
import {
  chartImageFileName,
  chartImageUnsupportedReason,
  copyChartImage,
} from "./chartImage";

afterEach(() => vi.unstubAllGlobals());

describe("chartImageFileName", () => {
  const day = new Date(2026, 9, 12);
  it("slugs the title and adds the date", () => {
    expect(chartImageFileName("Price vs. carat (USD)", day)).toBe(
      "price-vs-carat-usd-2026-10-12.png"
    );
  });
  it("drops accents and keeps a name for a symbol-only title", () => {
    expect(chartImageFileName("Café · résumé", day)).toBe(
      "cafe-resume-2026-10-12.png"
    );
    expect(chartImageFileName("→ ★", day)).toBe("chart-2026-10-12.png");
  });
  it("caps long titles without a trailing dash", () => {
    const name = chartImageFileName("word ".repeat(40), day);
    expect(name.length).toBeLessThanOrEqual(60 + "-2026-10-12.png".length);
    expect(name).not.toMatch(/--/);
  });
});

describe("support", () => {
  it("exports every chart type, 3D included", () => {
    for (const type of ["scatter", "3d-scatter", "composition"] as const) {
      expect(chartImageUnsupportedReason(type)).toBeUndefined();
    }
  });
});

describe("copyChartImage", () => {
  it("offers download when the clipboard cannot take images", async () => {
    vi.stubGlobal("ClipboardItem", undefined);
    await expect(
      copyChartImage(Promise.resolve({ blob: new Blob(), width: 1, height: 1 }))
    ).rejects.toThrow(/Download the image instead/);
  });

  it("writes a pending PNG inside the gesture", async () => {
    const write = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { clipboard: { write } });
    vi.stubGlobal(
      "ClipboardItem",
      class {
        constructor(public items: Record<string, Promise<Blob>>) {}
      }
    );
    const blob = new Blob(["png"], { type: "image/png" });
    await copyChartImage(Promise.resolve({ blob, width: 2, height: 2 }));
    const item = write.mock.calls[0]?.[0]?.[0] as {
      items: Record<string, Promise<Blob>>;
    };
    expect(await item.items["image/png"]).toBe(blob);
  });
});

describe("captureChartPanel", () => {
  it("exports a composition's artboard, and says when it is not open", async () => {
    const { captureChartPanel, ChartExportError } = await import(
      "./chartImage"
    );
    await expect(
      captureChartPanel(document.createElement("div"), {
        id: "not-mounted",
        type: "composition",
      })
    ).rejects.toEqual(
      new ChartExportError("Open the composition to export it.")
    );
  });
});
