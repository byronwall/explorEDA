import { fireEvent, render } from "@testing-library/react";
import { useRef, useState } from "react";
import { expect, it, vi } from "vitest";
import { useBrush } from "./useBrush";

type Extent = [[number, number], [number, number]];
it("preserves a drag, moves and resizes the saved selection, and clears without echoing external state", () => {
  window.PointerEvent = MouseEvent as typeof PointerEvent;
  const change = vi.fn();
  function Harness() {
    const ref = useRef<SVGSVGElement>(null);
    const [extent, setExtent] = useState<Extent | null>(null);
    const brush = useBrush({
      svgRef: ref,
      marginLeft: 0,
      marginTop: 0,
      innerWidth: 200,
      innerHeight: 100,
      mode: "2d",
      defaultExtent: extent,
      onBrushChange: (value) => {
        change(value);
        setExtent(value);
      },
    });
    return (
      <svg
        ref={ref}
        onPointerDown={brush.handlePointerDown}
        onPointerMove={brush.handlePointerMove}
        onPointerUp={brush.handlePointerUp}
        onPointerCancel={brush.cancel}
        onKeyDown={(event) => {
          if (event.key === "Escape") brush.clear();
        }}
      >
        {brush.renderBrush}
      </svg>
    );
  }
  const { container } = render(<Harness />);
  const svg = container.querySelector("svg")!;
  const drag = (from: number[], to: number[]) => {
    fireEvent.pointerDown(svg, {
      clientX: from[0],
      clientY: from[1],
      button: 0,
    });
    fireEvent.pointerMove(svg, { clientX: to[0], clientY: to[1], buttons: 1 });
    fireEvent.pointerUp(svg, { clientX: to[0], clientY: to[1] });
  };
  drag([20, 10], [80, 70]);
  expect(change).toHaveBeenLastCalledWith([
    [20, 10],
    [80, 70],
  ]);
  drag([50, 40], [90, 50]);
  expect(change).toHaveBeenLastCalledWith([
    [60, 20],
    [120, 80],
  ]);
  drag([120, 50], [160, 50]);
  expect(change).toHaveBeenLastCalledWith([
    [60, 20],
    [160, 80],
  ]);
  expect(change).toHaveBeenCalledTimes(3);
  fireEvent.keyDown(svg, { key: "Escape" });
  expect(change).toHaveBeenLastCalledWith(null);
  expect(container.querySelector(".eda-brush")).toBeNull();
});
