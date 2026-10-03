import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { highlightMatches } from "../highlightMatches";

const marks = (text: string, search: string, raw?: string) => {
  const { container } = render(<p>{highlightMatches(text, search, raw)}</p>);
  return {
    text: container.textContent,
    marked: Array.from(container.querySelectorAll("mark")).map(
      (mark) => mark.textContent
    ),
  };
};

describe("highlightMatches", () => {
  it("marks every match and keeps the cell text", () => {
    expect(marks("Outdoors and outdoor gear", "outdoor")).toEqual({
      text: "Outdoors and outdoor gear",
      marked: ["Outdoor", "outdoor"],
    });
  });

  it("leaves text alone without a search or a match", () => {
    expect(marks("Kitchen", "").marked).toEqual([]);
    expect(marks("Kitchen", "outdoor").marked).toEqual([]);
  });

  it("marks the whole cell when formatting hides the raw match", () => {
    expect(marks("$1,234.50", "1234", "1234.5").marked).toEqual(["$1,234.50"]);
  });
});
