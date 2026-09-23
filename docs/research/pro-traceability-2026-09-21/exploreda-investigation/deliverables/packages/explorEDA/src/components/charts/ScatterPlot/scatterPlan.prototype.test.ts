// EXPERIMENTAL. Repository integration tests; run with pnpm/Vitest after applying the patch.
import { beforeAll, describe, expect, it } from "vitest";
import { registerAllCharts } from "@/charts/registerAllCharts";
import { CrossfilterWrapper } from "@/hooks/CrossfilterWrapper";
import { scatterPlotDefinition } from "./definition";
import { dataTableDefinition } from "../DataTable/definition";
import { captureScatterProbe, planScatterProbe, traceScatterProbe, type ProbeSettings } from "./scatterPlan.prototype";
import { drawScatterProbe, scatterProbeSvg } from "./scatterPlan.prototypeAdapters";

const settings: ProbeSettings = {
  chartId: "probe", xField: "x", yField: "y", width: 400, height: 300,
  margin: { left: 40, right: 20, top: 20, bottom: 40 },
  xKind: "linear", yKind: "linear", radius: 3, opacity: 0.7, fill: "#3479a8",
};
const revision = { dataset: "test/source-1", values: 1, filters: 1 };
function snapshot(facetIds?: number[]) {
  return captureScatterProbe({ revision, allIds: [0, 1, 2, 3],
    otherFilterEntries: [{ key: 0, value: 1 }, { key: 1, value: 1 }, { key: 2, value: 0 }, { key: 3, value: 1 }],
    allPassIds: [1, 3], facetIds,
    columns: { x: { 0: 1, 1: 2, 2: 100, 3: 3 }, y: { 0: 5, 1: 6, 2: 9, 3: undefined } },
  });
}

describe("experimental deterministic scatter boundary", () => {
  beforeAll(registerAllCharts);
  it("separates value contributors, shared domains and exclusion stages", () => {
    const plan = planScatterProbe(snapshot(), settings);
    expect(plan.marks.map((mark) => [mark.rowId, mark.ownFilterPass])).toEqual([[0, false], [1, true]]);
    expect(plan.exclusions.map((row) => [row.rowId, row.stage])).toEqual([[2, "other-filters"], [3, "coordinates"]]);
    expect(plan.scales[0].domain[1]).toBeGreaterThan(100);
    const mark = plan.marks[0]!;
    expect(traceScatterProbe(plan, mark.id).value.rowId).toBe(0);
    expect(traceScatterProbe(plan, mark.id).controls[0]?.rowSetRef).toBe("all");
    expect(plan.marks.some((point) => !Number.isFinite(point.x))).toBe(false);
  });
  it("uses one deterministic plan in SVG and recording adapters", () => {
    const plan = planScatterProbe(snapshot(), settings);
    expect(JSON.stringify(plan)).toBe(JSON.stringify(planScatterProbe(snapshot(), settings)));
    const ids: string[] = [];
    drawScatterProbe(plan, { begin() {}, end() {}, point(id) { ids.push(id); } });
    expect(ids).toEqual(plan.marks.map((mark) => mark.id));
    expect(scatterProbeSvg(plan).match(/<circle /g)).toHaveLength(2);
    expect(planScatterProbe(snapshot([]), settings).marks).toHaveLength(0);
  });
  it("does not keep aliases to mutable Crossfilter group entries or prepared columns", () => {
    const entries = [{ key: 0, value: 1 }];
    const columns = { x: { 0: 1 }, y: { 0: 2 } };
    const captured = captureScatterProbe({ revision, allIds: [0], allPassIds: [0], otherFilterEntries: entries, columns });
    entries[0]!.value = 0;
    columns.x[0] = 999;
    expect(captured.scopes.othersPass).toEqual([0]);
    expect(captured.columns.x?.[0]).toBe(1);
  });
  it("captures the real wrapper's own-dimension exemption without re-evaluating filters", () => {
    const rows = [{ __ID: 0, x: 1, y: 2, category: "a" }, { __ID: 1, x: 2, y: 4, category: "a" }, { __ID: 2, x: 3, y: 6, category: "b" }];
    const columns = Object.fromEntries(["x", "y", "category"].map((field) => [field, Object.fromEntries(rows.map((row) => [row.__ID, row[field as keyof typeof row]]))]));
    const wrapper = new CrossfilterWrapper(rows, (row) => row.__ID);
    wrapper.setFieldGetter((field) => columns[field] ?? {});
    const chart = { ...scatterPlotDefinition.createDefaultSettings({ x: 0, y: 0, w: 4, h: 4 }), id: "probe", xField: "x", yField: "y", filters: [{ type: "range" as const, field: "x", min: 2 }] };
    const other = { ...dataTableDefinition.createDefaultSettings({ x: 4, y: 0, w: 4, h: 4 }), id: "other", columns: [{ id: "c", field: "category" }], filters: [{ type: "value" as const, field: "category", values: ["a"] }] };
    wrapper.addChart(chart);
    wrapper.addChart(other);
    const live = wrapper.getAllData()[chart.id];
    expect(live).toBeDefined();
    const captured = captureScatterProbe({ revision, allIds: rows.map((row) => row.__ID), otherFilterEntries: live!.items, allPassIds: wrapper.getFilteredRowIds(), columns });
    expect(captured.scopes.othersPass).toEqual([0, 1]);
    expect(captured.scopes.allPass).toEqual([1]);
    const plan = planScatterProbe(captured, settings);
    expect(plan.marks.map((mark) => [mark.rowId, mark.opacity])).toEqual([[0, 0.15], [1, 0.7]]);
    // Change another chart after capture: the old snapshot must stay immutable.
    wrapper.updateChart({ ...other, filters: [] });
    expect(captured.scopes.othersPass).toEqual([0, 1]);
  });
});
