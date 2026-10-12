import { describe, expect, it } from "vitest";
import { parseDocument, parseValue } from "./parse";

describe("quoted values", () => {
  it("reads the JSON escapes that export writes", () => {
    expect(parseValue('"first line\\nsecond\\tcol"').items[0]!.text).toBe(
      "first line\nsecond\tcol"
    );
    expect(parseValue('"say \\"hi\\" \\\\ done"').items[0]!.text).toBe(
      'say "hi" \\ done'
    );
    expect(parseValue('"caf\\u00e9"').items[0]!.text).toBe("café");
  });
});

describe("bodies", () => {
  it("adds key= lines in a body to the declaration they belong to", () => {
    const { declarations, problems } = parseDocument(`scatter @a x=X y=Y {
  title="Big" x.scale=log
    margin.left=70
}`);
    expect(problems).toEqual([]);
    expect(declarations).toHaveLength(1);
    expect(declarations[0]!.pairs.map((pair) => pair.key)).toEqual([
      "x",
      "y",
      "title",
      "x.scale",
      "margin.left",
    ]);
    expect(declarations[0]!.endLine).toBe(4);
  });

  it("reads the same however the text is indented", () => {
    const tidy = parseDocument(`view A {\n  row Region {\n    title=T\n  }\n}`);
    const pasted = parseDocument(
      `view A {\n        row Region {\ntitle=T\n   }\n      }`
    );
    const shape = (result: ReturnType<typeof parseDocument>) =>
      result.declarations.map((item) => ({
        keyword: item.keyword,
        view: item.view,
        pairs: item.pairs.map((pair) => `${pair.key}=${pair.value.raw}`),
      }));
    expect(pasted.problems).toEqual([]);
    expect(shape(pasted)).toEqual(shape(tidy));
  });

  it("opens and closes a body on one line", () => {
    const { declarations, problems } = parseDocument(
      "layout { 5: a b }\nrow Region"
    );
    expect(problems).toEqual([]);
    expect(declarations.map((item) => item.keyword)).toEqual(["layout", "row"]);
    expect(declarations[0]!.children.map((child) => child.keyword)).toEqual([
      "5:",
    ]);
  });

  it("puts a view's lines in text order, tagged with the view", () => {
    const { declarations } = parseDocument(
      `calc a=1\nview One {\n  row X\n}\nview Two {\n  row Y\n}\nfield a label=A`
    );
    expect(declarations.map((item) => [item.keyword, item.view])).toEqual([
      ["calc", undefined],
      ["view", 0],
      ["row", 0],
      ["view", 1],
      ["row", 1],
      ["field", undefined],
    ]);
  });

  it("ends a body without a } at the next top-level word, and says where", () => {
    const { declarations, problems } = parseDocument(
      `view A {\n  row Region\n  hist Revenue\nview B {\n  row Channel\n}`
    );
    expect(declarations.map((item) => [item.keyword, item.view])).toEqual([
      ["view", 0],
      ["row", 0],
      ["hist", 0],
      ["view", 1],
      ["row", 1],
    ]);
    expect(problems).toMatchObject([
      {
        span: { line: 1 },
        message: expect.stringContaining("no closing }"),
        suggestion: "Add } after line 3.",
      },
    ]);
  });

  it("reports a stray }, a + line, and settings outside a body", () => {
    const { problems } = parseDocument(`}\nrow X\n+ title=T\nx.scale=log`);
    expect(problems.map((problem) => problem.span.line)).toEqual([1, 3, 4]);
  });
});
