import { describe, expect, it } from "vitest";
import { formatDsl } from "./format";
import { parseDocument } from "./parse";

describe("formatDsl", () => {
  it("indents by brace depth and keeps comments and formulas", () => {
    const messy = `dashboard   "Sales"


calc  margin = (Revenue - Cost)/Revenue   # share
view Overview {
        # the main view
row Region   color=Region {
title="By region"     # short
      }
  layout { 5: Region }
    }
`;
    expect(formatDsl(messy)).toBe(`dashboard "Sales"

calc  margin = (Revenue - Cost)/Revenue   # share
view Overview {
  # the main view
  row Region color=Region {
    title="By region" # short
  }
  layout { 5: Region }
}
`);
  });

  it("never changes what the text means, and settles in one pass", () => {
    const text = `view A {\nrow X {\n title="a  b"\n}\n}\n`;
    const once = formatDsl(text);
    expect(formatDsl(once)).toBe(once);
    const shape = (value: string) =>
      parseDocument(value).declarations.map((item) =>
        item.pairs.map((pair) => pair.value.items[0]!.text)
      );
    expect(shape(once)).toEqual(shape(text));
  });
});
