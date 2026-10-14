import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it } from "vitest";
import { registerAllCharts } from "@/charts/registerAllCharts";
import { compileDocument } from "@/lib/dsl/compile";
import { exportDocument } from "@/lib/dsl/export";
import { DataLayerProvider, useDataLayer } from "@/providers/DataLayerProvider";
import { stringifySavedData, validateSavedData } from "@/utils/saveDataUtils";
import { ChartTraceScope } from "../trace/ChartTraceScope";
import { ChartTracePanel } from "../trace/ChartTracePanel";
import { Retention } from "./Retention";
import { retentionDefinition, type RetentionSettings } from "./definition";

beforeAll(registerAllCharts);

// The plan test's fixture: weeks from Monday 2025-01-06 to Wednesday 01-29.
const rows = [
  { user: "a", event: "signup", at: "2025-01-06T09:00:00Z" },
  { user: "a", event: "session", at: "2025-01-14T09:00:00Z" },
  { user: "a", event: "session", at: "2025-01-28T09:00:00Z" },
  { user: "b", event: "signup", at: "2025-01-08T09:00:00Z" },
  { user: "b", event: "session", at: "2025-01-09T09:00:00Z" },
  { user: "b", event: "session", at: "2025-01-15T09:00:00Z" },
  { user: "b", event: "session", at: "2025-01-16T09:00:00Z" },
  { user: "c", event: "signup", at: "2025-01-14T09:00:00Z" },
  { user: "c", event: "session", at: "2025-01-22T09:00:00Z" },
  { user: "d", event: "visit", at: "2025-01-29T09:00:00Z" },
];

const settings: RetentionSettings = {
  ...retentionDefinition.createDefaultSettings(
    { x: 0, y: 0, w: 7, h: 6 },
    "event"
  ),
  id: "retention",
  entityField: "user",
  timeField: "at",
  entryEvent: "signup",
  activityEvents: ["session"],
  periods: 4,
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
        {chart?.type === "retention" && (
          <Retention settings={chart} width={560} height={300} />
        )}
        <ChartTracePanel />
      </ChartTraceScope>
    </>
  );
}

function renderRetention(chart: RetentionSettings = settings) {
  return render(
    <DataLayerProvider charts={[chart]} data={rows}>
      <Harness />
    </DataLayerProvider>
  );
}

const cells = (container: HTMLElement) =>
  [...container.querySelectorAll("svg [role='button']")].map((item) =>
    item.getAttribute("aria-label")
  );

describe("Retention", () => {
  it("draws each cohort's share active by week, blank past the data", () => {
    const { container } = renderRetention();
    expect(cells(container)).toEqual([
      "Jan 6 cohort, Week 0: 50%, 1 of 2",
      "Jan 6 cohort, Week 1: 100%, 2 of 2",
      "Jan 6 cohort, Week 2: 0%, 0 of 2",
      "Jan 6 cohort, Week 3: 50%, 1 of 2, partial period",
      "Jan 13 cohort, Week 0: 0%, 0 of 1",
      "Jan 13 cohort, Week 1: 100%, 1 of 1",
      "Jan 13 cohort, Week 2: 0%, 0 of 1, partial period",
    ]);
    expect(container.querySelector(".eda-chart-status")).toHaveTextContent(
      "3 entered in 2 cohorts · 1 without the entry event"
    );
  });

  it("selects every event of the entities active in a cell", () => {
    const { container } = renderRetention();
    fireEvent.click(
      screen.getByRole("button", { name: /^Jan 6 cohort, Week 3/ })
    );
    // Only a was active in week 3.
    expect(screen.getByLabelText("Matching IDs")).toHaveTextContent(/^0,1,2$/);
    expect(
      screen.getByRole("button", { name: /^Jan 6 cohort, Week 3/ })
    ).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(container.querySelector("svg")!);
    expect(screen.getByLabelText("Matching IDs")).toHaveTextContent(
      /^0,1,2,3,4,5,6,7,8,9$/
    );
  });

  it("traces a cell to its cohort, rule, and the partial period", () => {
    renderRetention();
    fireEvent.click(
      screen.getByRole("button", { name: /^Jan 6 cohort, Week 3/ }),
      { altKey: true }
    );
    const trace = screen.getByLabelText("Retention trace");
    expect(trace).toHaveTextContent("50% = 1 ÷ 2");
    expect(trace).toHaveTextContent("first signup event");
    expect(trace).toHaveTextContent("The data ends on 2025-01-29");
  });

  it("saves and restores through saved data and dashboard text", () => {
    renderRetention({
      ...settings,
      selectedCell: "2025-01-06:3",
      filters: [{ type: "value", field: "user", values: ["a"] }],
    });
    const saved = JSON.parse(
      screen.getByLabelText("Saved settings").textContent!
    );
    expect(validateSavedData(saved)).toBe(true);
    const { text, omitted } = exportDocument(saved, { rows });
    expect(omitted).toEqual([]);
    const compiled = compileDocument(text, { rows });
    expect(compiled.diagnostics).toEqual([]);
    expect(compiled.settings.charts[0]).toMatchObject({
      type: "retention",
      field: "event",
      entityField: "user",
      timeField: "at",
      entryEvent: "signup",
      activityEvents: ["session"],
      period: "week",
      periods: 4,
      selectedCell: "2025-01-06:3",
    });
  });
});
