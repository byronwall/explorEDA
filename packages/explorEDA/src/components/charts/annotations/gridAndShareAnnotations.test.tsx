import { fireEvent, render, screen } from "@testing-library/react";
import type { ComponentType } from "react";
import { beforeAll, expect, it, vi } from "vitest";
import { registerAllCharts } from "@/charts/registerAllCharts";
import { compileDocument } from "@/lib/dsl/compile";
import { DataLayerProvider, useDataLayer } from "@/providers/DataLayerProvider";
import type { SavedDataStructure } from "@/types/SavedDataStructure";
import type { ChartSettings, datum } from "@/types/ChartTypes";
import { BarChart } from "../BarChart/BarChart";
import { CalendarHeatmap } from "../Calendar/CalendarHeatmap";
import { EcdfChart } from "../Ecdf/EcdfChart";
import { Heatmap } from "../Heatmap/Heatmap";
import { RowChart } from "../RowChart/RowChart";

beforeAll(() => {
  registerAllCharts();
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  );
});

const strikes = [5, 10, 12, 20, 27, 30, 45, 60, 90, 216].map(
  (duration, index) => ({ id: index + 1, duration })
);

/** Compiles one chart from dashboard text, with no diagnostics, and draws it. */
function draw(
  text: string,
  rows: Record<string, datum>[],
  Chart: ComponentType<{ settings: never; width: number; height: number }>
) {
  const { settings, diagnostics } = compileDocument(text, { rows });
  expect(diagnostics).toEqual([]);
  const chart = settings.charts.at(-1)! as ChartSettings;
  const { container } = render(
    <DataLayerProvider data={rows} savedData={settings}>
      <Chart settings={chart as never} width={600} height={320} />
    </DataLayerProvider>
  );
  const at = (id: string, attribute: string) => {
    const node = container.querySelector(`[data-annotation-id="${id}"]`);
    const mark =
      node?.tagName === "g" ? node.querySelector("circle, line") : node;
    return mark ? Number(mark.getAttribute(attribute)) : undefined;
  };
  return { container, at };
}

it("draws value rules, share rules, and bands on an ECDF", () => {
  const { at } = draw(
    `ecdf duration direction=below {
  rule @two x=60 "Two months"
  rule @half y=0.5 "Half"
  rule @median x=median
  band @month x=10..30 "First month"
}`,
    strikes,
    EcdfChart
  );
  const two = at("two", "x1")!;
  const median = at("median", "x1")!;
  // The median of ten durations is 28.5, short of two months.
  expect(median).toBeGreaterThan(0);
  expect(two).toBeGreaterThan(median);
  // A share of one half sits in the middle of the plot's height.
  const half = at("half", "y1")!;
  expect(half).toBeGreaterThan(0);
  expect(at("month", "x")).toBeLessThan(median);
});

it("computes statistic rules over a histogram's rows", () => {
  const { at } = draw(
    `hist duration bins=8 {
  rule @mean x=mean
  rule @median x=median
  rule @max x=max
  rule @fixed x=28.5
}`,
    strikes,
    BarChart
  );
  const median = at("median", "x1")!;
  // The median, 28.5, draws where a typed 28.5 does.
  expect(median).toBeCloseTo(at("fixed", "x1")!);
  // A long tail pulls the mean, 51.5, past the median.
  expect(at("mean", "x1")).toBeGreaterThan(median);
  expect(at("max", "x1")).toBeGreaterThan(at("mean", "x1")!);
});

it("computes statistic rules over a grouped row chart's groups", () => {
  const rows = [
    { team: "A", score: 9 },
    { team: "A", score: 3 },
    { team: "B", score: 4 },
    { team: "C", score: 1 },
  ];
  const { at } = draw(
    `group @byTeam sum(score) by=team
row team group=byTeam {
  rule @top x=max
  rule @low x=min
  rule @fixed x=12
}`,
    rows,
    RowChart
  );
  // Team totals are 12, 4, and 1: max is the longest bar.
  expect(at("top", "x1")).toBeCloseTo(at("fixed", "x1")!);
  expect(at("low", "x1")).toBeLessThan(at("top", "x1")!);
});

it("puts a heatmap callout at the center of its cell", () => {
  const rows = [
    { day: "Mon", hour: "am", n: 1 },
    { day: "Mon", hour: "pm", n: 2 },
    { day: "Tue", hour: "am", n: 3 },
    { day: "Tue", hour: "pm", n: 4 },
  ];
  const { container, at } = draw(
    `heatmap day columnField=hour {
  callout @byCategory "Busy" category=Tue,pm
  callout @byKey "Quiet" on=day:Mon,hour:am
}`,
    rows,
    Heatmap
  );
  const cell = (label: string) => {
    const rect = container.querySelector(`rect[aria-label^="${label}"]`);
    if (!rect)
      throw new Error(
        [...container.querySelectorAll("rect[aria-label]")]
          .map((node) => node.getAttribute("aria-label"))
          .join(" | ")
      );
    return {
      x:
        Number(rect.getAttribute("x")) + Number(rect.getAttribute("width")) / 2,
      y:
        Number(rect.getAttribute("y")) +
        Number(rect.getAttribute("height")) / 2,
    };
  };
  const busy = cell("Tue, pm");
  expect(at("byCategory", "cx")).toBeCloseTo(busy.x, 0);
  expect(at("byCategory", "cy")).toBeCloseTo(busy.y, 0);
  const quiet = cell("Mon, am");
  expect(at("byKey", "cx")).toBeCloseTo(quiet.x, 0);
  expect(at("byKey", "cy")).toBeCloseTo(quiet.y, 0);
});

it("puts a calendar callout on its day, whatever rows the day holds", () => {
  const rows = ["2016-12-15", "2016-12-16", "2016-12-16", "2016-12-17"].map(
    (date, index) => ({ date, station: index })
  );
  const { container, at } = draw(
    `calendar date {
  callout @alert "Red alert" on=date:2016-12-16
  callout @next "Next day" category=2016-12-17
}`,
    rows,
    CalendarHeatmap
  );
  const day = container.querySelector('[data-plan-id="day:2016-12-16"]')!;
  const size = Number(day.getAttribute("width"));
  expect(at("alert", "cx")).toBeCloseTo(
    Number(day.getAttribute("x")) + size / 2,
    0
  );
  expect(at("next", "cy")).toBeGreaterThan(at("alert", "cy")!);
});

it("adds a cell callout, and no line or band, from a heatmap's Notes tab", async () => {
  const { ChartSettingsContent } = await import("../../ChartSettingsContent");
  const rows = [
    { day: "Mon", hour: "am" },
    { day: "Tue", hour: "pm" },
  ];
  const { settings } = compileDocument("heatmap day columnField=hour", {
    rows,
  });
  const onStateChange = vi.fn<(state: SavedDataStructure) => void>();
  function Settings() {
    const charts = useDataLayer((s) => s.charts);
    return <ChartSettingsContent settings={charts[0]!} />;
  }
  render(
    <DataLayerProvider
      data={rows}
      savedData={settings}
      onStateChange={onStateChange}
    >
      <Settings />
    </DataLayerProvider>
  );
  const notes = screen.getByRole("tab", { name: "Notes" });
  fireEvent.mouseDown(notes);
  fireEvent.click(notes);
  fireEvent.click(await screen.findByRole("button", { name: "Callout" }));
  expect(screen.queryByRole("button", { name: "Line" })).toBeNull();
  expect(screen.queryByRole("button", { name: "Band" })).toBeNull();
  const saved = onStateChange.mock.calls.at(-1)![0].charts[0]!.annotations!;
  expect(saved[0]).toMatchObject({
    attach: { kind: "category", value: "Mon,am" },
  });
});
