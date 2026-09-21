import { render } from "@testing-library/react";
import { numericScale } from "./numericScale";
import { expect, it } from "vitest";
import { XAxis, YAxis } from "./Axis";

it("keeps tick labels apart when a symlog scale crowds large values", () => {
  const scale = numericScale({ scaleType: "symlog" })
    .domain([1, 25000])
    .range([0, 600]);
  const { container } = render(
    <svg>
      <XAxis
        scale={scale}
        transform=""
        tickFormatter={(value) => Number(value).toLocaleString("en-US")}
      />
      <YAxis scale={scale} transform="" />
    </svg>
  );
  const positions = Array.from(
    container.querySelectorAll('g[transform^="translate"]')
  ).map((node) =>
    Number(node.getAttribute("transform")?.match(/translate\(([^,]+)/)?.[1])
  );
  expect(positions.length).toBeGreaterThan(1);
  expect(
    positions.every(
      (position, index) => !index || position - positions[index - 1]! >= 41
    )
  ).toBe(true);
  const yPositions = Array.from(
    container.querySelectorAll('text[y][x="-9"]')
  ).map((node) => Number(node.getAttribute("y")));
  expect(
    yPositions.every(
      (position, index) => !index || position - yPositions[index - 1]! >= 20
    )
  ).toBe(true);
});
