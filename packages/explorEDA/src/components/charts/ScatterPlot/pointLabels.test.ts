import { describe, expect, it } from "vitest";
import { placePointLabels } from "./pointLabels";

const measure = (text: string) => text.length * 6;

describe("placePointLabels", () => {
  it("moves a label aside, and leaves out one with no free spot", () => {
    // Four points on one spot: right, left, above, then no room, since the
    // side labels reach into the spot below.
    const labels = placePointLabels(
      ["a", "b", "c", "d"].map((id) => ({
        id,
        x: 50,
        y: 50,
        r: 3,
        text: id.repeat(3),
      })),
      measure,
      200,
      200
    );
    expect(labels.map((label) => [label.id, label.anchor])).toEqual([
      ["a", "start"],
      ["b", "end"],
      ["c", "middle"],
    ]);
  });

  it("keeps labels inside the plot", () => {
    const [label] = placePointLabels(
      [{ id: "edge", x: 195, y: 100, r: 3, text: "Edge" }],
      measure,
      200,
      200
    );
    expect(label?.anchor).toBe("end");
  });
});
