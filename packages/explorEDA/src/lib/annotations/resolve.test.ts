import { describe, expect, it } from "vitest";
import type { IdType } from "@/providers/DataLayerProvider";
import type { datum } from "@/types/ChartTypes";
import type { ScaleDescriptor } from "@/components/charts/Axis/axisPlan";
import {
  calculate,
  intervalEvidenceText,
  projectAnnotations,
  resolveRecord,
  uniqueKeyFields,
  type AnnotationFrame,
} from "./resolve";
import { createCallout, createInterval } from "./create";
import { placeLabel } from "./placeLabel";
import { isChartAnnotation } from "./validate";
import type {
  BandAnnotation,
  CalloutAnnotation,
  IntervalAnnotation,
  RecordSetAnnotation,
  ReferenceLineAnnotation,
  RegionAnnotation,
} from "./types";

type Row = Record<string, datum>;

function columns(rows: Row[]) {
  const ids = rows.map((_, index) => index as IdType);
  const getColumn = (field: string) =>
    Object.fromEntries(rows.map((row, index) => [index, row[field]]));
  return { ids, getColumn };
}

const rows: Row[] = [
  { sample_id: "E-15", lot: "A", x: 1, y: 10 },
  { sample_id: "E-16", lot: "A", x: 2, y: 30 },
  { sample_id: "E-17", lot: "B", x: 3, y: 90 },
  { sample_id: "E-18", lot: "B", x: 4, y: 20 },
];

const callout = (key: string): CalloutAnnotation => ({
  id: "c1",
  type: "callout",
  text: "Outlier",
  attach: { kind: "record", keyFields: ["sample_id"], key: [key] },
  offset: { dx: 20, dy: -20 },
});

const linear = (domain: [number, number], range: [number, number]) =>
  ({ type: "linear", domain, range }) satisfies ScaleDescriptor;

function frame(
  data: Row[],
  plotted: AnnotationFrame["plotted"] = (id) => ({
    x: Number(data[id as number]!.x) * 10,
    y: 100 - Number(data[id as number]!.y),
    selected: true,
  })
): AnnotationFrame {
  return {
    ...columns(data),
    xScale: linear([0, 10], [0, 100]),
    yScale: linear([0, 100], [100, 0]),
    plotWidth: 100,
    plotHeight: 100,
    plotted,
  };
}

describe("record attachments", () => {
  it("finds the same record after rows are reordered or replaced", () => {
    const first = columns(rows);
    expect(
      resolveRecord(callout("E-17").attach as never, first.getColumn, first.ids)
    ).toEqual({ status: "found", id: 2 });
    const reordered = columns([...rows].reverse());
    expect(
      resolveRecord(
        callout("E-17").attach as never,
        reordered.getColumn,
        reordered.ids
      )
    ).toEqual({ status: "found", id: 1 });
  });

  it("reports a missing or repeated key instead of using a row position", () => {
    const deleted = columns(rows.filter((row) => row.sample_id !== "E-17"));
    expect(
      resolveRecord(
        callout("E-17").attach as never,
        deleted.getColumn,
        deleted.ids
      )
    ).toEqual({ status: "missing" });
    const duplicated = columns([...rows, { ...rows[2]!, y: 5 }]);
    expect(
      resolveRecord(
        callout("E-17").attach as never,
        duplicated.getColumn,
        duplicated.ids
      )
    ).toEqual({ status: "ambiguous", count: 2 });
  });

  it("matches numeric keys stored as text and supports composite keys", () => {
    const numeric = columns([{ id: 7 }, { id: 8 }]);
    expect(
      resolveRecord(
        { kind: "record", keyFields: ["id"], key: ["8"] },
        numeric.getColumn,
        numeric.ids
      )
    ).toEqual({ status: "found", id: 1 });
    const { ids, getColumn } = columns(rows);
    expect(
      resolveRecord(
        { kind: "record", keyFields: ["lot", "x"], key: ["B", 4] },
        getColumn,
        ids
      )
    ).toEqual({ status: "found", id: 3 });
  });

  it("offers only fields that identify every row", () => {
    const { ids, getColumn } = columns(rows);
    expect(
      uniqueKeyFields(["__ID", "sample_id", "lot", "x"], getColumn, ids)
    ).toEqual(["sample_id", "x"]);
  });
});

describe("projection", () => {
  it("draws a callout at its record and a fixed target at its value", () => {
    const target: ReferenceLineAnnotation = {
      id: "t1",
      type: "reference-line",
      axis: "y",
      value: 50,
    };
    const [note, line] = projectAnnotations(
      [callout("E-17"), target],
      frame(rows)
    );
    expect(note).toMatchObject({ status: "shown", x: 30, y: 10 });
    expect(line).toMatchObject({ status: "shown", position: 50 });
  });

  it("keeps the target value when the record set changes", () => {
    const target: ReferenceLineAnnotation = {
      id: "t1",
      type: "reference-line",
      axis: "y",
      value: 50,
    };
    const fewer = rows.slice(0, 2);
    expect(projectAnnotations([target], frame(fewer))[0]).toMatchObject({
      status: "shown",
      position: 50,
    });
  });

  it("hides a callout whose record is filtered out and says so", () => {
    const projected = projectAnnotations(
      [callout("E-17")],
      frame(rows, (id) => ({ x: 0, y: 0, selected: id !== 2 }))
    );
    expect(projected[0]!.status).toBe("filtered");
    const notPlotted = projectAnnotations(
      [callout("E-17")],
      frame(rows, () => undefined)
    );
    expect(notPlotted[0]!.status).toBe("filtered");
  });

  it("reports offscreen, hidden, and categorical-axis annotations", () => {
    const far: ReferenceLineAnnotation = {
      id: "far",
      type: "reference-line",
      axis: "y",
      value: 500,
    };
    expect(projectAnnotations([far], frame(rows))[0]!.status).toBe("offscreen");
    expect(
      projectAnnotations([{ ...far, hidden: true }], frame(rows))[0]!.status
    ).toBe("hidden");
    expect(
      projectAnnotations([{ ...far, axis: "x", value: 1 }], {
        ...frame(rows),
        xScale: { type: "band", domain: ["a"], range: [0, 100], padding: 0 },
      })[0]!.status
    ).toBe("unsupported");
  });

  it("projects a target through a symlog scale", () => {
    const target: ReferenceLineAnnotation = {
      id: "t",
      type: "reference-line",
      axis: "x",
      value: -10,
    };
    const projected = projectAnnotations([target], {
      ...frame(rows),
      xScale: { type: "symlog", domain: [-100, 100], range: [0, 100] },
    })[0]!;
    expect(projected.status).toBe("shown");
    if (projected.status === "shown" && "position" in projected) {
      expect(projected.position).toBeGreaterThan(0);
      expect(projected.position).toBeLessThan(50);
    }
  });
});

describe("creating and saving", () => {
  it("starts a callout on the record with the largest value", () => {
    const { ids, getColumn } = columns(rows);
    const created = createCallout({
      fields: ["sample_id", "lot", "x", "y"],
      ids,
      getColumn,
      xField: "x",
      yField: "y",
    });
    expect(created.attach).toEqual({
      kind: "record",
      keyFields: ["sample_id"],
      key: ["E-17"],
    });
    expect(isChartAnnotation(created)).toBe(true);
  });

  it("starts at a fixed point when no field identifies a row", () => {
    const { ids, getColumn } = columns(rows.map(({ lot, y }) => ({ lot, y })));
    const created = createCallout({
      fields: ["lot"],
      ids,
      getColumn,
      yField: "y",
    });
    expect(created.attach.kind).toBe("coordinate");
  });

  it("rejects malformed saved annotations", () => {
    expect(isChartAnnotation(callout("E-17"))).toBe(true);
    expect(
      isChartAnnotation({ ...callout("E-17"), offset: { dx: "1", dy: 0 } })
    ).toBe(false);
    expect(
      isChartAnnotation({
        id: "t",
        type: "reference-line",
        axis: "z",
        value: 1,
      })
    ).toBe(false);
  });
});

describe("bands, intervals, and axes", () => {
  it("clamps a band to the plot and accepts reversed ends", () => {
    const band: BandAnnotation = {
      id: "b",
      type: "band",
      axis: "y",
      from: 120,
      to: 40,
    };
    expect(projectAnnotations([band], frame(rows))[0]).toMatchObject({
      status: "shown",
      start: 0,
      end: 60,
    });
    expect(
      projectAnnotations([{ ...band, from: 200, to: 300 }], frame(rows))[0]!
        .status
    ).toBe("offscreen");
  });

  it("draws supplied bounds in x order and counts reversed rows", () => {
    const data: Row[] = [
      { x: 3, lo: 20, hi: 40 },
      { x: 1, lo: 10, hi: 30 },
      { x: 2, lo: 50, hi: 25 },
      { x: 4, lo: null, hi: 10 },
    ];
    const interval: IntervalAnnotation = {
      id: "i",
      type: "interval",
      lowerField: "lo",
      upperField: "hi",
      meaning: "Supplied range",
    };
    const projected = projectAnnotations([interval], {
      ...frame(data),
      xField: "x",
      visibleIds: [0, 1, 2, 3],
    })[0]!;
    expect(projected).toMatchObject({
      status: "shown",
      evidence: { rows: 3, breaks: 0, reversed: 1, duplicates: 0 },
    });
    if (projected.status === "shown" && "runs" in projected)
      expect(projected.runs).toEqual([
        [
          { x: 10, lower: 90, upper: 70 },
          { x: 20, lower: 75, upper: 50 },
          { x: 30, lower: 80, upper: 60 },
        ],
      ]);
    // A chart of grouped values has no rows to draw bounds for.
    expect(projectAnnotations([interval], frame(data))[0]!.status).toBe(
      "unsupported"
    );
  });

  it("splits a ribbon at an interior row without bounds", () => {
    // History rows lead with no bounds; x = 3 is an invalid pair inside.
    const data: Row[] = [
      { x: 0, lo: null, hi: null },
      { x: 1, lo: 10, hi: 30 },
      { x: 2, lo: 12, hi: 34 },
      { x: 3, lo: "n/a", hi: 36 },
      { x: 4, lo: 14, hi: 38 },
      { x: 5, lo: 15, hi: 40 },
    ];
    const interval: IntervalAnnotation = {
      id: "i",
      type: "interval",
      lowerField: "lo",
      upperField: "hi",
      meaning: "Supplied range",
    };
    const projected = projectAnnotations([interval], {
      ...frame(data),
      xField: "x",
      visibleIds: [0, 1, 2, 3, 4, 5],
    })[0]!;
    if (projected.status !== "shown" || !("runs" in projected))
      throw new Error("expected a shown interval");
    expect(projected.runs.map((run) => run.map((point) => point.x))).toEqual([
      [10, 20],
      [40, 50],
    ]);
    expect(projected.evidence).toEqual({
      rows: 4,
      breaks: 1,
      reversed: 0,
      duplicates: 0,
    });
    expect(intervalEvidenceText(projected.evidence, 2)).toBe(
      "4 rows in 2 runs · 1 row without bounds splits it"
    );
  });

  it("takes the outer bounds at a repeated x and reads date x values", () => {
    const data: Row[] = [
      { x: "2025-01-01", lo: 10, hi: 20 },
      { x: "2025-01-01", lo: 5, hi: 15 },
      { x: "2025-01-02", lo: 10, hi: 20 },
    ];
    const day = Date.UTC(2025, 0, 1);
    const interval: IntervalAnnotation = {
      id: "i",
      type: "interval",
      lowerField: "lo",
      upperField: "hi",
      meaning: "Supplied range",
    };
    const projected = projectAnnotations([interval], {
      ...frame(data),
      xScale: linear([day, day + 86_400_000], [0, 100]),
      xField: "x",
      visibleIds: [0, 1, 2],
    })[0]!;
    if (projected.status !== "shown" || !("runs" in projected))
      throw new Error("expected a shown interval");
    expect(projected.evidence.duplicates).toBe(1);
    const [first] = projected.runs[0]!;
    // Outer bounds 5 to 20: the lower pixel of 5, the upper pixel of 20.
    expect(first).toEqual({ x: 0, lower: 95, upper: 80 });
  });

  it("reads a right-axis value on the right scale", () => {
    const target: ReferenceLineAnnotation = {
      id: "t",
      type: "reference-line",
      axis: "y",
      value: 500,
      yAxis: "right",
    };
    expect(
      projectAnnotations([target], {
        ...frame(rows),
        yRightScale: linear([0, 1000], [100, 0]),
      })[0]
    ).toMatchObject({ status: "shown", position: 50 });
  });

  it("can't place a record callout on a chart without records", () => {
    expect(
      projectAnnotations([callout("E-17")], {
        ...frame(rows),
        plotted: undefined,
      })[0]!.status
    ).toBe("unsupported");
  });

  it("guesses interval bounds from field names", () => {
    const { ids, getColumn } = columns([
      { forecast_lower: 1, forecast_upper: 2, name: "a" },
    ]);
    expect(
      createInterval({
        fields: ["name", "forecast_lower", "forecast_upper"],
        ids,
        getColumn,
      })
    ).toMatchObject({
      lowerField: "forecast_lower",
      upperField: "forecast_upper",
    });
  });
});

describe("highlights and calculated references", () => {
  const all = [0, 1, 2, 3];
  const population = { all, filtered: [0, 1, 3] };
  const withRows = (plottedSelected = (id: IdType) => id !== 2) => ({
    ...frame(rows, (id) => ({
      x: Number(rows[id as number]!.x) * 10,
      y: 100 - Number(rows[id as number]!.y),
      selected: plottedSelected(id),
    })),
    xField: "x",
    yField: "y",
    population,
  });

  it("keeps a saved set's members while a region keeps its bounds", () => {
    const set: RecordSetAnnotation = {
      id: "s",
      type: "record-set",
      keyFields: ["sample_id"],
      keys: [["E-15"], ["E-17"], ["E-99"]],
      label: "Odd runs",
    };
    const region: RegionAnnotation = {
      id: "r",
      type: "region",
      shape: "ellipse",
      x0: 2,
      x1: 4,
      y0: 0,
      y1: 40,
    };
    const [saved, area] = projectAnnotations([set, region], withRows());
    // E-17 is filtered out and E-99 no longer exists; E-15 still shows.
    expect(saved).toMatchObject({
      status: "shown",
      points: [{ x: 10, y: 90 }],
      counts: { total: 3, shown: 1, filtered: 1, missing: 1, ambiguous: 0 },
    });
    expect(area).toMatchObject({
      status: "shown",
      left: 20,
      top: 60,
      width: 20,
      height: 40,
    });
    expect(
      projectAnnotations(
        [set],
        withRows(() => false)
      )[0]!.status
    ).toBe("filtered");
  });

  it("calculates a reference from the population it names", () => {
    const mean = (population: "all" | "filtered"): ReferenceLineAnnotation => ({
      id: population,
      type: "reference-line",
      axis: "y",
      value: 0,
      calculated: { statistic: "mean", population },
    });
    const [allRows, filtered] = projectAnnotations(
      [mean("all"), mean("filtered")],
      withRows()
    );
    expect(allRows).toMatchObject({ status: "shown", value: 37.5 });
    expect(filtered).toMatchObject({ status: "shown", value: 20 });
    expect(calculate("median", "y", all, columns(rows).getColumn)).toBe(25);
    expect(
      projectAnnotations([mean("filtered")], {
        ...withRows(),
        population: { all, filtered: [] },
      })[0]!.status
    ).toBe("empty");
  });

  it("lets an extreme callout change subjects with the filters", () => {
    const top: CalloutAnnotation = {
      ...callout("unused"),
      attach: { kind: "query", pick: "max", population: "filtered" },
    };
    expect(projectAnnotations([top], withRows())[0]).toMatchObject({
      status: "shown",
      x: 20,
      y: 70,
    });
    expect(
      projectAnnotations(
        [{ ...top, attach: { ...top.attach, population: "all" } as never }],
        withRows(() => true)
      )[0]
    ).toMatchObject({ status: "shown", x: 30, y: 10 });
  });

  it("validates the new kinds", () => {
    expect(
      isChartAnnotation({
        id: "s",
        type: "record-set",
        keyFields: ["id"],
        keys: [[1], ["a"]],
      })
    ).toBe(true);
    expect(
      isChartAnnotation({
        id: "q",
        type: "callout",
        text: "",
        attach: { kind: "query", pick: "max", population: "some" },
        offset: { dx: 0, dy: 0 },
      })
    ).toBe(false);
  });
});

describe("label placement", () => {
  it("reads a label from its other end at the plot edge and stops it at the top", () => {
    expect(placeLabel(90, 50, "start", 40, 1, 100, 100, 11)).toMatchObject({
      anchor: "end",
      ly: 50,
    });
    expect(placeLabel(10, 50, "end", 40, 1, 100, 100, 11).anchor).toBe("start");
    expect(placeLabel(50, -80, "start", 10, 1, 100, 100, 11).ly).toBe(-6.5);
    expect(placeLabel(50, 50, "start", 10, 1, 100, 100, 11)).toEqual({
      lx: 50,
      ly: 50,
      anchor: "start",
    });
  });
});

describe("charts whose marks summarize rows", () => {
  const mean: ReferenceLineAnnotation = {
    id: "m",
    type: "reference-line",
    axis: "x",
    value: 0,
    calculated: { statistic: "mean", population: "filtered" },
  };

  it("calculates over an axis's own values, such as one per group", () => {
    const projected = projectAnnotations([mean], {
      ...frame(rows),
      plotted: undefined,
      axisValues: { x: { all: [2, 4, 9], filtered: [2, 4] } },
    })[0]!;
    // The filtered groups' mean, 3, at 10 pixels per unit.
    expect(projected).toMatchObject({
      status: "shown",
      value: 3,
      position: 30,
    });
    expect(
      projectAnnotations([mean], {
        ...frame(rows),
        axisValues: { x: { all: [], filtered: [] } },
      })[0]!.status
    ).toBe("empty");
  });

  it("places a record callout on a grid cell by its key values", () => {
    const cellFrame: AnnotationFrame = {
      ...frame(rows),
      plotted: undefined,
      cell: (attach) =>
        attach.keyFields[0] !== "lot"
          ? "unsupported"
          : attach.key[0] === "A"
            ? { x: 25, y: 50, selected: true }
            : "missing",
    };
    const on = (key: string): CalloutAnnotation => ({
      ...callout(key),
      attach: { kind: "record", keyFields: ["lot"], key: [key] },
    });
    // Two rows share lot A; a cell holds them all, so the key is no problem.
    expect(projectAnnotations([on("A")], cellFrame)[0]).toMatchObject({
      status: "shown",
      x: 25,
      y: 50,
    });
    expect(projectAnnotations([on("Z")], cellFrame)[0]!.status).toBe("missing");
    expect(projectAnnotations([callout("E-17")], cellFrame)[0]!.status).toBe(
      "unsupported"
    );
  });
});
