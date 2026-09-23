import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ColorScale } from "./ColorScale";
import { planNumericalLegend } from "@/lib/colorScaleMath";

describe("ColorScale modifier interaction", () => {
  it("filters by default and traces only with Alt", () => {
    const onToggle = vi.fn();
    const onTrace = vi.fn();
    const props = {
      scale: {
        id: "colors",
        name: "Channel",
        type: "categorical" as const,
        sourceField: "Channel",
        mapping: new Map([["Online", "#123456"]]),
        palette: ["#123456"],
      },
      width: 240,
      wrap: true,
      numericalBreakpoints: 5,
      getColorForValue: () => "#123456",
      counts: new Map([["s:Online", 2]]),
      countWidth: 1,
      categories: ["Online"],
      selected: [],
      onToggle,
    };
    const view = render(<ColorScale {...props} />);
    fireEvent.click(
      screen.getByRole("button", { name: /Filter Channel by Online/ })
    );
    expect(onToggle).toHaveBeenCalledWith("Online");

    view.rerender(<ColorScale {...props} onTrace={onTrace} />);
    fireEvent.click(
      screen.getByRole("button", { name: /Filter Channel by Online/ })
    );
    expect(onToggle).toHaveBeenCalledTimes(2);
    expect(onTrace).not.toHaveBeenCalled();
    fireEvent.click(
      screen.getByRole("button", { name: /Filter Channel by Online/ }),
      { altKey: true }
    );
    expect(onTrace).toHaveBeenCalledWith("Online");
    expect(onToggle).toHaveBeenCalledTimes(2);
    expect(screen.queryByText("Inspect")).toBeNull();
  });
});

it("renders the same numeric stops that the scatter trace receives", () => {
  const scale = {
    id: "numeric",
    name: "Amount",
    type: "numerical" as const,
    sourceField: "Amount",
    min: 0,
    max: 100,
    palette: "Viridis",
  };
  const plan = planNumericalLegend(
    scale,
    120,
    4,
    (value) => `${value}%`,
    (value) => `rgb(${value} 0 0)`
  );
  expect(plan.stops.map((stop) => stop.value)).toEqual([0, 100]);
  render(
    <ColorScale
      scale={scale}
      width={120}
      wrap
      numericalBreakpoints={4}
      getColorForValue={() => "wrong"}
      counts={new Map()}
      countWidth={1}
      categories={[]}
      selected={[]}
      onToggle={() => {}}
      numericalPlan={plan}
    />
  );
  expect(screen.getByText("0%")).toBeInTheDocument();
  expect(screen.getByText("100%")).toBeInTheDocument();
  expect(screen.getByRole("img")).toHaveStyle({ background: plan.background });
});
