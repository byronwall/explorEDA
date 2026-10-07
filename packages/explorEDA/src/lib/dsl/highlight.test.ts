import { describe, expect, it } from "vitest";
import { DSL_REFERENCE } from "./describe";
import { highlightDsl, type DslToken, type DslTokenKind } from "./highlight";

/** The line's tokens without spaces, as `kind:text` for short expectations. */
function kinds(line: string): string[] {
  return highlightDsl(line)[0]!
    .filter((token) => token.kind !== "space")
    .map((token) => `${token.kind}:${token.text}`);
}

function kindOf(tokens: DslToken[], text: string): DslTokenKind | undefined {
  return tokens.find((token) => token.text === text)?.kind;
}

describe("highlightDsl", () => {
  it("colors a chart line by what each piece means", () => {
    expect(
      kinds(
        'scatter @fit x=Revenue y="Unit price" opacity=0.5 regression=unset'
      )
    ).toEqual([
      "keyword:scatter",
      "reference:@fit",
      "key:x",
      "operator:=",
      "text:Revenue",
      "key:y",
      "operator:=",
      'string:"Unit price"',
      "key:opacity",
      "operator:=",
      "number:0.5",
      "key:regression",
      "operator:=",
      "constant:unset",
    ]);
  });

  it("colors continuations, lists, ranges, references, and comments", () => {
    expect(
      kinds(
        '+ where.Units=2.. mapping.0[]=Web,"#000000" colorScaleId=@channels show=true # note'
      )
    ).toEqual([
      "continuation:+",
      "key:where.Units",
      "operator:=",
      "number:2",
      "operator:..",
      "key:mapping.0[]",
      "operator:=",
      "text:Web",
      "operator:,",
      'string:"#000000"',
      "key:colorScaleId",
      "operator:=",
      "reference:@channels",
      "key:show",
      "operator:=",
      "constant:true",
      "comment:# note",
    ]);
    expect(kinds("  # a whole-line comment")).toEqual([
      "comment:# a whole-line comment",
    ]);
  });

  it("colors calculations, aliases, and chart types", () => {
    expect(kinds("calc margin=(Revenue-Cost)/Revenue*100 # pct")).toEqual([
      "keyword:calc",
      "key:margin",
      "operator:=(",
      "text:Revenue",
      "operator:-",
      "text:Cost",
      "operator:)/",
      "text:Revenue",
      "operator:*",
      "number:100",
      "comment:# pct",
    ]);
    expect(kinds('calc "Net sales"=gross - "a b"')).toEqual([
      "keyword:calc",
      'string:"Net sales"',
      "operator:=",
      "text:gross",
      "operator:-",
      'string:"a b"',
    ]);
    expect(kinds("rev:num=Revenue label=Rev")).toEqual([
      "key:rev",
      "type::num",
      "operator:=",
      "text:Revenue",
      "key:label",
      "operator:=",
      "text:Rev",
    ]);
    expect(kinds("chart boxplot field=Revenue")).toEqual([
      "keyword:chart",
      "type:boxplot",
      "key:field",
      "operator:=",
      "text:Revenue",
    ]);
    // An unknown first word is not a keyword; the compiler reports it.
    expect(kinds("scater x=a")[0]).toBe("text:scater");
  });

  it("colors a value whose quote never closes as a string", () => {
    expect(kinds('row Channel title="Open quote')).toEqual([
      "keyword:row",
      "text:Channel",
      "key:title",
      "operator:=",
      'string:"Open quote',
    ]);
  });

  it("gives back every line exactly, so an overlay stays aligned", () => {
    const samples = [
      DSL_REFERENCE,
      'dashboard name="Orders"\n\n  grid rowHeight=80\n\tscatter x=a y=b  \n+\n+ ',
      'calc x=\ncalc =1\ncalc "unclosed=1\nfield "a \\" b" label=x',
      'table "a,b",c,,d where.x=..5 where.y=1..2 select.z.contains="q"',
      "x=1 =2 == @ + # +x",
    ];
    for (const sample of samples) {
      const lines = highlightDsl(sample);
      expect(lines).toHaveLength(sample.split("\n").length);
      expect(
        lines
          .map((tokens) => tokens.map((token) => token.text).join(""))
          .join("\n")
      ).toBe(sample);
      for (const tokens of lines) {
        expect(tokens.every((token) => token.text.length > 0)).toBe(true);
      }
    }
  });

  it("marks shared definitions and the Rows view as keywords", () => {
    const [scale, group, rows, view] = highlightDsl(
      'scale @c field=Channel\ngroup @g groupField=Region\nrows sortBy=Revenue\nview "Overview"'
    );
    expect(kindOf(scale!, "scale")).toBe("keyword");
    expect(kindOf(scale!, "@c")).toBe("reference");
    expect(kindOf(group!, "group")).toBe("keyword");
    expect(kindOf(rows!, "rows")).toBe("keyword");
    expect(kindOf(view!, "view")).toBe("keyword");
    expect(kindOf(view!, '"Overview"')).toBe("string");
  });
});
