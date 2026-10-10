import { describe, expect, it } from "vitest";
import { planPanelBody } from "./panelBody";

describe("planPanelBody", () => {
  it("keeps today's plot height for a one-line header", () => {
    expect(planPanelBody({ panelHeight: 380, headerHeight: 30 })).toBe(322);
    expect(planPanelBody({ panelHeight: 380, headerHeight: 32 })).toBe(322);
    expect(planPanelBody({ panelHeight: 380 })).toBe(322);
  });

  it("takes a taller headline's growth from the plot", () => {
    // Two-line title plus subtitle line.
    expect(planPanelBody({ panelHeight: 380, headerHeight: 92 })).toBe(262);
  });

  it("subtracts the note, strips, and legend", () => {
    expect(
      planPanelBody({
        panelHeight: 380,
        headerHeight: 32,
        noteHeight: 20,
        stripHeight: 28,
        legendHeight: 36,
      })
    ).toBe(238);
  });

  it("measures the details view against its own header", () => {
    expect(
      planPanelBody({ panelHeight: 600, headerHeight: 54, expanded: true })
    ).toBe(528);
    expect(
      planPanelBody({ panelHeight: 600, headerHeight: 110, expanded: true })
    ).toBe(472);
  });

  it("never returns less than one pixel", () => {
    expect(planPanelBody({ panelHeight: 80, headerHeight: 120 })).toBe(1);
  });
});
