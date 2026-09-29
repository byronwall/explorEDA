import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { buildFieldProfile } from "@/lib/fieldProfiles";
import type { datum } from "@/types/ChartTypes";
import { binValues } from "../utils/statisticsCalculator";
import {
  joinSparkFilters,
  labelBins,
  summarizeField,
} from "./FieldDistribution";

const column = (values: datum[]) =>
  Object.fromEntries(values.map((value, index) => [index, value])) as Record<
    number,
    datum
  >;
const format = (value: unknown) => String(value);

describe("binValues", () => {
  it("gives small integer ranges one bin per value", () => {
    expect(binValues([1, 1, 2, 4], 1, 4)).toEqual([2, 1, 0, 1]);
  });

  it("uses equal-width bins and keeps the maximum in the last bin", () => {
    const bins = binValues([0, 0.5, 1], 0, 1, 4);
    expect(bins).toEqual([1, 0, 1, 1]);
  });

  it("ignores values that cannot be placed", () => {
    expect(binValues([0, Infinity], 0, Infinity)).toEqual([]);
  });
});

describe("labelBins", () => {
  it("names one-value bins by their value and wider bins by their range", () => {
    expect(labelBins([2, 0, 1], 1, 3, String)).toEqual([
      { label: "1", count: 2, range: [1, 1] },
      { label: "2", count: 0, range: [2, 2] },
      { label: "3", count: 1, range: [3, 3] },
    ]);
    const wide = labelBins(new Array(24).fill(1), 0, 24, String);
    expect(wide[0]!.label).toBe("0 – 1");
    expect(wide[23]!.label).toBe("23 – 24");
  });
});

describe("summarizeField", () => {
  it("reads a numeric range with its median", () => {
    const profile = buildFieldProfile("units", column([1, 2, 3, null]));
    expect(summarizeField(profile, format)).toMatchObject({
      low: "1",
      high: "3",
      statLabel: "median",
      stat: "2",
    });
  });

  it("reads a date field as its first and last date", () => {
    const profile = buildFieldProfile(
      "ordered",
      column(["2024-03-01", "2024-01-01", "2024-02-01"]),
      "datetime"
    );
    expect(summarizeField(profile, format)).toMatchObject({
      low: "2024-01-01",
      high: "2024-03-01",
    });
  });

  it("reads a category field as its most common value and share", () => {
    const profile = buildFieldProfile(
      "region",
      column(["North", "North", "South", null])
    );
    expect(summarizeField(profile, format)).toMatchObject({
      label: "North",
      statLabel: "share",
      stat: "67%",
      bars: [
        { label: "North", count: 2 },
        { label: "South", count: 1 },
      ],
    });
  });

  it("says when every value is unique", () => {
    const profile = buildFieldProfile("id", column(["a", "b", "c"]));
    expect(summarizeField(profile, format)?.label).toBe("All values unique");
  });

  it("has no reading when every value is missing", () => {
    const profile = buildFieldProfile(
      "empty",
      column([null, null]),
      "categorical"
    );
    expect(summarizeField(profile, format)).toBeUndefined();
  });
});

describe("sparkline filters", () => {
  it("filters each bin to its half-open range and closes the last bin", () => {
    const values = Array.from({ length: 50 }, (_, index) => index / 2);
    const profile = buildFieldProfile("x", column(values), "numeric");
    const bars = summarizeField(profile, format)!.bars;
    const first = bars[0]!.filter;
    const last = bars.at(-1)!.filter;
    expect(first?.type).toBe("range");
    if (first?.type !== "range" || last?.type !== "range") return;
    expect(first.min).toBe(0);
    // The first bin stops just short of where the second begins.
    const second = bars[1]!.filter;
    expect(second?.type === "range" && first.max < second.min).toBe(true);
    expect(last.max).toBe(24.5);
  });

  it("filters top values but not the remainder", () => {
    const profile = buildFieldProfile(
      "kind",
      column(["a", "a", "b", "c", "d", "e", "f", "g"]),
      "categorical"
    );
    const bars = summarizeField(profile, format)!.bars;
    expect(bars[0]!.filter).toEqual({ type: "value", values: ["a"] });
    expect(bars.at(-1)!.filter).toBeUndefined();
  });
});

describe("sparkline brushing", () => {
  // 0 to 48 in 24 bins two units wide: bin 2 starts at 4, bin 5 ends at 12.
  const values = Array.from({ length: 49 }, (_, index) => index);
  const profile = buildFieldProfile("x", column(values), "numeric");

  it("joins the filters of neighboring bins into one range", () => {
    const bars = summarizeField(profile, format)!.bars;
    expect(joinSparkFilters(bars, 5, 2)).toEqual({
      type: "range",
      min: 4,
      max: (bars[5]!.filter as { max: number }).max,
    });
    expect(joinSparkFilters(bars, 3, 3)).toEqual(bars[3]!.filter);
  });

  it("filters to the dragged range on release", () => {
    // jsdom has no PointerEvent, so pointer coordinates need MouseEvent.
    globalThis.PointerEvent ??= class extends MouseEvent {
      pointerId: number;
      constructor(type: string, init: PointerEventInit = {}) {
        super(type, init);
        this.pointerId = init.pointerId ?? 0;
      }
    } as unknown as typeof PointerEvent;
    const onFilter = vi.fn();
    const summary = summarizeField(profile, format, "x", onFilter)!;
    const { container } = render(<>{summary.graphic}</>);
    const hit = container.querySelector(".eda-summary-spark-hit")!;
    hit.getBoundingClientRect = () =>
      ({ left: 0, width: 240, top: 0, height: 20 }) as DOMRect;
    // 24 bins of 10px: drag from the third bin to the sixth.
    fireEvent.pointerDown(hit, { button: 0, clientX: 25, pointerId: 1 });
    fireEvent.pointerMove(hit, { clientX: 55, pointerId: 1 });
    fireEvent.pointerUp(hit, { clientX: 55, pointerId: 1 });
    expect(onFilter).toHaveBeenCalledTimes(1);
    expect(onFilter.mock.calls[0]![0]).toMatchObject({
      type: "range",
      min: 4,
    });
    expect(onFilter.mock.calls[0]![0].max).toBeLessThan(12);
    expect(onFilter.mock.calls[0]![0].max).toBeGreaterThan(11);
  });

  it("marks the bars the field's filter keeps", () => {
    const bars = summarizeField(profile, format, "x", undefined, {
      type: "range",
      field: "x",
      min: 10,
      max: 19,
    })!.bars;
    expect(bars.filter((bar) => bar.selected)).toHaveLength(5);
    expect(bars[4]!.selected).toBe(false);
    expect(bars[5]!.selected).toBe(true);
  });

  it("filters date bars to whole calendar months", () => {
    const dates = buildFieldProfile(
      "ordered",
      column(["2024-01-05", "2024-02-10", "2024-02-29", "2025-06-01"]),
      "datetime"
    );
    const bars = summarizeField(dates, format, "ordered", vi.fn())!.bars;
    expect(bars[1]).toMatchObject({
      label: "Feb 2024",
      count: 2,
      filter: { type: "date-range", min: "2024-02-01", max: "2024-02-29" },
    });
  });
});
