import { fireEvent, render, screen, within } from "@testing-library/react";
import { useEffect } from "react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { ColorScalePanel } from "@/components/ColorScaleManager";
import { DataLayerProvider, useDataLayer } from "@/providers/DataLayerProvider";
import type {
  CategoricalColorScale,
  ColorScaleType,
  NumericalColorScale,
} from "@/types/ColorScaleTypes";

const data = [
  { species: "Adelie", mass: 3700 },
  { species: "Adelie", mass: 3800 },
  { species: "Gentoo", mass: 5100 },
  { species: "Chinstrap", mass: null },
];

let scales: ColorScaleType[] = [];

function Seed() {
  const addColorScale = useDataLayer((state) => state.addColorScale);
  const colorScales = useDataLayer((state) => state.colorScales);
  scales = colorScales;
  useEffect(() => {
    addColorScale({
      name: "mass",
      type: "numerical",
      palette: "Viridis",
      min: 3700,
      max: 5100,
      sourceField: "mass",
    } as Omit<NumericalColorScale, "id">);
    addColorScale({
      name: "species",
      type: "categorical",
      palette: ["#111111", "#222222", "#333333"],
      mapping: new Map([
        ["Adelie", "#111111"],
        ["Gentoo", "#222222"],
        ["Chinstrap", "#333333"],
      ]),
      sourceField: "species",
    } as Omit<CategoricalColorScale, "id">);
  }, [addColorScale]);
  return null;
}

beforeAll(() => {
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
  Element.prototype.scrollIntoView = vi.fn();
});

function renderPanel() {
  return render(
    <DataLayerProvider data={data} charts={[]}>
      <Seed />
      <ColorScalePanel />
    </DataLayerProvider>
  );
}

describe("color scale editor", () => {
  it("applies numerical changes at once and resets them", () => {
    renderPanel();
    fireEvent.click(screen.getByRole("radio", { name: /Cividis/ }));
    fireEvent.click(screen.getByRole("button", { name: "Reverse" }));
    fireEvent.click(screen.getByRole("radio", { name: "5" }));
    expect(scales[0]).toMatchObject({
      palette: "Cividis",
      reverse: true,
      steps: 5,
    });

    fireEvent.click(screen.getByRole("button", { name: "Reset" }));
    expect(scales[0]).toMatchObject({ palette: "Viridis" });
    expect(scales[0]!.type === "numerical" && scales[0]!.reverse).toBeFalsy();
    expect(scales[0]!.type === "numerical" && scales[0]!.steps).toBeFalsy();
  });

  it("rejects a range whose start passes its end", () => {
    renderPanel();
    fireEvent.change(screen.getByLabelText("Start"), {
      target: { value: "6000" },
    });
    expect(screen.getByRole("alert")).toHaveTextContent(
      "The start must be below the end."
    );
    expect(scales[0]).toMatchObject({ min: 3700 });
  });

  it("reassigns category colors from a palette by row count", () => {
    renderPanel();
    fireEvent.click(
      within(screen.getByRole("list", { name: "Color scales" })).getByRole(
        "button",
        { name: /^species/ }
      )
    );
    fireEvent.click(screen.getByRole("radio", { name: /Okabe Ito/ }));
    fireEvent.click(screen.getByRole("radio", { name: "Most rows" }));
    const scale = scales[1]!;
    expect(scale.type).toBe("categorical");
    if (scale.type !== "categorical") return;
    expect(scale.paletteId).toBe("OkabeIto");
    expect([...scale.mapping.keys()][0]).toBe("Adelie");
    expect(scale.mapping.get("Adelie")).toBe("#0072b2");
    expect(
      screen.getByRole("button", { name: "Change the color for Gentoo" })
    ).toBeInTheDocument();
  });

  it("moves a category to take the next palette color", () => {
    renderPanel();
    fireEvent.click(
      within(screen.getByRole("list", { name: "Color scales" })).getByRole(
        "button",
        { name: /^species/ }
      )
    );
    fireEvent.click(screen.getByRole("radio", { name: /Okabe Ito/ }));
    fireEvent.click(screen.getByRole("button", { name: "Move Gentoo up" }));
    const scale = scales[1]!;
    if (scale.type !== "categorical") throw new Error("categorical");
    expect(scale.order).toBe("custom");
    expect([...scale.mapping.keys()].slice(0, 2)).toEqual(["Gentoo", "Adelie"]);
    expect(scale.mapping.get("Gentoo")).toBe("#0072b2");
    expect(screen.getByRole("radio", { name: "Custom" })).toHaveAttribute(
      "aria-checked",
      "true"
    );
  });

  it("offers the theme palette first", () => {
    renderPanel();
    fireEvent.click(
      within(screen.getByRole("list", { name: "Color scales" })).getByRole(
        "button",
        { name: /^species/ }
      )
    );
    fireEvent.click(screen.getByRole("radio", { name: /^Theme/ }));
    const scale = scales[1]!;
    if (scale.type !== "categorical") throw new Error("categorical");
    expect(scale.paletteId).toBe("theme");
  });
});
