import { render } from "@testing-library/react";
import { BottomRightHandle } from "../ChartGridLayout";

describe("BottomRightHandle", () => {
  it("does not forward react-resizable's internal axis prop", () => {
    const { container } = render(<BottomRightHandle handleAxis="se" />);

    expect(container.querySelector(".handle-se")).not.toHaveAttribute(
      "handleAxis"
    );
  });
});
