import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it } from "vitest";
import { registerAllCharts } from "@/charts/registerAllCharts";
import { compileDocument } from "@/lib/dsl/compile";
import { exportDocument } from "@/lib/dsl/export";
import { DataLayerProvider, useDataLayer } from "@/providers/DataLayerProvider";
import { stringifySavedData, validateSavedData } from "@/utils/saveDataUtils";
import { ChartTraceScope } from "../trace/ChartTraceScope";
import { ChartTracePanel } from "../trace/ChartTracePanel";
import { Timeline } from "./Timeline";
import { timelineDefinition, type TimelineSettings } from "./definition";

beforeAll(() => {
  registerAllCharts();
  window.PointerEvent = MouseEvent as typeof PointerEvent;
});

const at = (hour: number) =>
  `2025-03-03T${String(hour).padStart(2, "0")}:00:00Z`;
const rows = [
  { room: "A", start: at(9), end: at(10) },
  { room: "A", start: at(11), end: at(13) },
  { room: "B", start: at(8), end: at(12) },
  { room: "B", start: at(14), end: null },
  { room: "C", start: at(15), end: at(16) },
];

const settings: TimelineSettings = {
  ...timelineDefinition.createDefaultSettings(
    { x: 0, y: 0, w: 12, h: 4 },
    "room"
  ),
  id: "timeline",
  startField: "start",
  endField: "end",
};

function Harness() {
  const chart = useDataLayer((state) => state.charts[0]);
  const save = useDataLayer((state) => state.saveToStructure);
  const store = useDataLayer((state) => state.crossfilterWrapper);
  return (
    <>
      <output aria-label="Saved settings">{stringifySavedData(save())}</output>
      <output aria-label="Matching IDs">
        {store.getFilteredRowIds().join(",")}
      </output>
      <ChartTraceScope>
        {chart?.type === "timeline" && (
          <Timeline settings={chart} width={600} height={240} />
        )}
        <ChartTracePanel />
      </ChartTraceScope>
    </>
  );
}

function renderTimeline(chart: TimelineSettings = settings) {
  return render(
    <DataLayerProvider charts={[chart]} data={rows}>
      <Harness />
    </DataLayerProvider>
  );
}

// 600px wide: lanes take 112px on the left and the plot 474px for 08:00 to
// 16:00, the end of the open booking's range.
const xFor = (hour: number) => 112 + ((hour - 8) / 8) * 474;

describe("Timeline", () => {
  it("draws one bar per row in its lane, open ends to the range's end", () => {
    const { container } = renderTimeline();
    expect(
      [...container.querySelectorAll("[data-interval]")].map((item) =>
        item.getAttribute("aria-label")
      )
    ).toEqual([
      "A: Mar 3, 9:00 AM to Mar 3, 10:00 AM",
      "A: Mar 3, 11:00 AM to Mar 3, 1:00 PM",
      "B: Mar 3, 8:00 AM to Mar 3, 12:00 PM",
      "B: Mar 3, 2:00 PM to no end",
      "C: Mar 3, 3:00 PM to Mar 3, 4:00 PM",
    ]);
    expect(container.querySelector(".eda-chart-status")).toHaveTextContent(
      "5 rows in 3 lanes · 1 with no end"
    );
  });

  it("brushes a window that keeps every overlapping row, open ends too", () => {
    const { container } = renderTimeline();
    const svg = container.querySelector("svg[aria-label='room timeline']")!;
    fireEvent.pointerDown(svg, { clientX: xFor(12), clientY: 60, button: 0 });
    fireEvent.pointerMove(svg, { clientX: xFor(13.5), clientY: 60 });
    fireEvent.pointerMove(svg, { clientX: xFor(15), clientY: 60 });
    fireEvent.pointerUp(svg, { clientX: xFor(15), clientY: 60 });
    expect(screen.getByLabelText("Matching IDs")).toHaveTextContent(
      /^1,2,3,4$/
    );
    expect(container.querySelector(".eda-chart-status")).toHaveTextContent(
      "4 of 5 rows selected · Mar 3, 12:00 PM to Mar 3, 3:00 PM"
    );
  });

  it("selects one row on a bar click and traces it", () => {
    const { container } = renderTimeline();
    const open = container.querySelector("[data-interval='3']")!;
    fireEvent.click(open);
    expect(screen.getByLabelText("Matching IDs")).toHaveTextContent(/^3$/);
    fireEvent.click(open, { altKey: true });
    expect(screen.getByLabelText("Timeline trace")).toHaveTextContent(
      "No end: end is blank"
    );
  });

  it("saves and restores a window through saved data and dashboard text", () => {
    renderTimeline({
      ...settings,
      filters: [
        { type: "date-range", field: "start", max: "2025-03-03T15:00:00.000Z" },
        { type: "date-range", field: "end", min: "2025-03-03T12:00:00.000Z" },
      ],
    });
    expect(screen.getByLabelText("Matching IDs")).toHaveTextContent(
      /^1,2,3,4$/
    );
    const saved = JSON.parse(
      screen.getByLabelText("Saved settings").textContent!
    );
    expect(validateSavedData(saved)).toBe(true);
    const { text, omitted } = exportDocument(saved, { rows });
    expect(omitted).toEqual([]);
    const compiled = compileDocument(text, { rows });
    expect(compiled.diagnostics).toEqual([]);
    expect(compiled.settings.charts[0]).toMatchObject({
      type: "timeline",
      field: "room",
      startField: "start",
      endField: "end",
    });
    expect(compiled.settings.charts[0]!.filters).toHaveLength(2);
  });
});
