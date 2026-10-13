import { beforeAll, describe, expect, it } from "vitest";
import { registerAllCharts } from "@/charts/registerAllCharts";
import type { CompositionDefinition } from "@/components/charts/Composition/compositionTypes";
import { compileDocument } from "./compile";
import { exportDocument } from "./export";

beforeAll(() => registerAllCharts());

const rows = [
  { Group: "A", Year: 1980, Jobs: 10, Occupation: "x", Order: 1 },
  { Group: "A", Year: 2012, Jobs: 12, Occupation: "x", Order: 1 },
  { Group: "B", Year: 1980, Jobs: 5, Occupation: "y", Order: 2 },
  { Group: "B", Year: 2012, Jobs: 4, Occupation: "y", Order: 2 },
];

const TEXT = `composition @jobs height=640 {
  scale numeric Year ticks=ends nice=false
  scale numeric Jobs zero=true
  measure max(Order) name="Group order"
  title "Jobs by group" at=32,24
  subtitle "Two years, two groups" at=32,56
  unit Groups at=56,120 size=120x180 {
    repeat Group arrangement=grid columns=2 gap=40 order=value orderBy="Group order"
    label fontSize=11
    path Occupations x=Year y=Jobs orderField=Year seriesField=Occupation
    point Ends x=Year y=Jobs orderField=Year radius=2.5 show=last
  }
  legend Key at=620,120 unit=Groups mark=Occupations
  note "Biggest drop" at=-30,-40 on=Groups[A] point=0.5,0.7
  rule "1990" at=4,0 unit=Groups value.value="1990"
  footnote "Illustrative" at=32,610
}`;

function composition(text: string) {
  const result = compileDocument(text, { rows });
  const chart = result.settings.charts[0] as unknown as {
    composition: CompositionDefinition;
  };
  return { result, definition: chart?.composition };
}

describe("composition text", () => {
  it("builds named parts with their kind's defaults", () => {
    const { result, definition } = composition(TEXT);
    expect(result.diagnostics).toEqual([]);
    expect(definition.artboard).toEqual({
      width: 960,
      height: 640,
      background: "#ffffff",
    });
    expect(definition.scales).toMatchObject([
      { id: "n-1", kind: "numeric", field: "Year", name: "Year", nice: false },
      { id: "n-2", kind: "numeric", field: "Jobs", zero: true, nice: true },
    ]);
    expect(definition.calculations).toEqual([
      {
        id: "calc-1",
        name: "Group order",
        aggregation: "max",
        field: "Order",
        population: "repeat",
        filters: "follow",
      },
    ]);
    const [title, , unit, legend, note, rule, footnote] = definition.elements;
    expect(title).toEqual({
      id: "title-1",
      kind: "text",
      role: "title",
      name: "Title",
      text: "Jobs by group",
      x: 32,
      y: 24,
      width: 896,
      fontSize: 24,
      fontWeight: 700,
      color: "#1f2328",
    });
    expect(unit).toMatchObject({
      id: "unit-1",
      name: "Groups",
      frame: { width: 120, height: 180 },
      label: { show: true, width: 0, fontSize: 11 },
      repeat: {
        field: "Group",
        arrangement: "grid",
        columns: 2,
        orderCalcId: "calc-1",
      },
      marks: [
        { id: "mark-1", type: "path", xScaleId: "n-1", yScaleId: "n-2" },
        { id: "mark-2", type: "point", radius: 2.5, show: "last" },
      ],
    });
    expect(legend).toMatchObject({ unitId: "unit-1", markId: "mark-1" });
    expect(note).toMatchObject({
      id: "note-1",
      anchor: {
        kind: "frame",
        unitId: "unit-1",
        instanceKey: "A",
        fx: 0.5,
        fy: 0.7,
      },
    });
    expect(rule).toMatchObject({
      kind: "guide",
      name: "1990",
      label: "1990",
      value: { kind: "constant", value: "1990" },
    });
    expect(footnote).toMatchObject({ id: "note-2", role: "note" });
  });

  it("writes back the text it was built from", () => {
    const { result } = composition(TEXT);
    const { text } = exportDocument(result.settings, { rows });
    const again = composition(text);
    expect(again.result.diagnostics).toEqual([]);
    expect(again.definition).toEqual(composition(TEXT).definition);
    expect(text).not.toMatch(/composition\.|Id=|\[\]=/);
    expect(text).toContain("unit Groups at=56,120 size=120x180 {");
  });

  it("writes waterfall states and donuts as settings", () => {
    const { result, definition } = composition(`composition {
  unit Groups at=0,0 size=150x150 {
    repeat Group
    waterfall Bridge mode=bridge measureField=Jobs stepField=Occupation {
      states[]= states.0.label=Before states.0.filters[]=
      states.1.label=After states.1.filters[]=
      states.1.filters.0.type=value states.1.filters.0.field=Year
      states.1.filters.0.values[]=2012
    }
    donut Share categoryField=Occupation hole=0.5
  }
  legend Key at=200,0 unit=Groups mark=Share
}`);
    expect(result.diagnostics).toEqual([]);
    const unit = definition.elements[0] as unknown as {
      marks: Record<string, unknown>[];
    };
    expect(unit.marks).toMatchObject([
      {
        type: "waterfall",
        mode: "bridge",
        aggregation: "sum",
        states: [
          { label: "Before", filters: [] },
          {
            label: "After",
            filters: [{ type: "value", field: "Year", values: [2012] }],
          },
        ],
        labelWidth: 90,
      },
      { type: "donut", aggregation: "count", hole: 0.5, showTotal: true },
    ]);
    const { text } = exportDocument(result.settings, { rows });
    expect(composition(text).definition).toEqual(definition);
  });

  it("names a link it can't find and builds the rest", () => {
    const { result, definition } = composition(`composition {
  unit Groups at=0,0 size=10x10 {
    path P x=Nope y=Nope orderField=Year
  }
  legend at=0,0 unit=Missing mark=P
}`);
    expect(result.diagnostics.map((item) => item.message)).toEqual([
      'Nope is not a scale in this composition, so path "P" was left out.',
      'Nope is not a scale in this composition, so path "P" was left out.',
      "Missing is not a unit in this composition, so that legend was left out.",
      "P is not a mark in this composition, so that legend was left out.",
    ]);
    // The unit stays, without the mark whose scales are missing.
    expect(definition.elements).toMatchObject([{ kind: "unit", marks: [] }]);
  });
});

describe("checking composition parts", () => {
  it("names a setting a part doesn't take, and one it needs", () => {
    const { result, definition } = composition(`composition {
  scale numeric Year
  unit Groups at=0,0 size=10x10 {
    path P x=Year shade=after
    band B x=Year y=Year orderField=Year lowerField=P10
  }
  note "No place"
  rule "2020" at=4,0 unit=Groups value=2020
}`);
    expect(result.diagnostics.map((item) => item.message)).toEqual([
      'path "P" needs orderField=, so it was left out.',
      "shade is not a path setting, so it was ignored.",
      'band "B" needs upperField=, so it was left out.',
      'annotation "No place" needs at=, so it was left out.',
    ]);
    expect(definition.elements).toMatchObject([
      { kind: "unit", marks: [] },
      { kind: "guide", value: { kind: "constant", value: "2020" } },
    ]);
  });
});

describe("checking composition values", () => {
  it("names a value that doesn't fit and keeps the rest of the graphic", () => {
    const { result, definition } = composition(`composition {
  scale numeric Year ticks=2
  scale value Gap colors=#a,#b center=#c
  legend Key at=0,0 unit=Groups mark=P direction=horizontal
  unit Groups at=0,0 size=10x10 {
    label valueSigns.positive.prefix="+"
    path P x=Year orderField=Year
  }
}`);
    expect(result.diagnostics.map((item) => item.message)).toEqual([
      "ticks=2 doesn't fit numeric, so it was ignored.",
      "direction=horizontal doesn't fit legend, so it was ignored.",
    ]);
    const unit = definition.elements.find((part) => part.kind === "unit") as {
      label: { valueSigns: unknown };
    };
    // One sign setting is enough; the rest of the record fills in.
    expect(unit.label.valueSigns).toEqual({
      positive: { prefix: "+", suffix: "", color: "#1f2328" },
      negative: { prefix: "", suffix: "", color: "#1f2328" },
    });
  });
});
