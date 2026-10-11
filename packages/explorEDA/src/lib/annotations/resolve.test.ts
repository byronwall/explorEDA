import { describe, expect, it } from "vitest";
import type { IdType } from "@/providers/DataLayerProvider";
import type { datum } from "@/types/ChartTypes";
import type { ScaleDescriptor } from "@/components/charts/Axis/axisPlan";
import {
  projectAnnotations,
  resolveRecord,
  uniqueKeyFields,
  type AnnotationFrame,
} from "./resolve";
import { createCallout } from "./create";
import { isChartAnnotation } from "./validate";
import type { CalloutAnnotation, ReferenceLineAnnotation } from "./types";

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
