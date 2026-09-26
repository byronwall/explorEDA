import { render } from "@testing-library/react";
import { ResizeHandle } from "../ChartGridLayout";
import { findEmptyPlacement } from "../chartGridPlacement";

describe("ResizeHandle", () => {
  it("marks each side so the grid can resize from it", () => {
    const { container } = render(
      <>
        <ResizeHandle axis="w" />
        <ResizeHandle axis="n" />
        <ResizeHandle axis="se" />
      </>
    );

    expect(container.querySelector(".eda-resize-w")).toHaveAttribute(
      "data-resize-axis",
      "w"
    );
    expect(container.querySelector(".eda-resize-n")).toHaveClass(
      "react-resizable-handle"
    );
    expect(container.querySelector(".eda-resize-se")).toHaveClass("handle-se");
  });
});

describe("findEmptyPlacement", () => {
  const chart = { x: 0, y: 0, w: 6, h: 4 };

  it("places the default chart beside an occupied chart", () => {
    expect(findEmptyPlacement({ x: 7, y: 1 }, [chart], 12)).toEqual({
      x: 6,
      y: 1,
      w: 6,
      h: 4,
    });
  });

  it("anchors the chart at the hovered cell below a chart", () => {
    expect(findEmptyPlacement({ x: 2, y: 4 }, [chart], 12)).toEqual({
      x: 2,
      y: 4,
      w: 6,
      h: 4,
    });
  });

  it("shrinks to fit a tight space without overlapping", () => {
    const left = { x: 0, y: 0, w: 4, h: 4 };
    const right = { x: 8, y: 0, w: 4, h: 4 };
    const placement = findEmptyPlacement({ x: 5, y: 1 }, [left, right], 12);

    expect(placement).toEqual({ x: 4, y: 1, w: 4, h: 4 });
  });

  it("refuses a space too small for any chart", () => {
    const left = { x: 0, y: 0, w: 5, h: 4 };
    const right = { x: 7, y: 0, w: 5, h: 4 };

    expect(findEmptyPlacement({ x: 5, y: 1 }, [left, right], 12)).toBeNull();
    expect(findEmptyPlacement({ x: 1, y: 1 }, [left, right], 12)).toBeNull();
  });
});
