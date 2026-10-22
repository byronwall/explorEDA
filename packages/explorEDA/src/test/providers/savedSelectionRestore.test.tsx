import { render, waitFor } from "@testing-library/react";
import { beforeAll, describe, expect, it } from "vitest";
import { registerAllCharts } from "@/charts/registerAllCharts";
import { DataLayerProvider, useDataLayer } from "@/providers/DataLayerProvider";
import type { AnalysisSourceRow } from "@/types/AnalysisProject";
import type { Filter } from "@/types/FilterTypes";
import type { SavedDataStructure } from "@/types/SavedDataStructure";
import {
  selectionIdentityLedger as rows,
  selectionIdentitySettings,
} from "../lib/analysis/selectionIdentityFixture";

// R077 SI02 (byronwall/explorEDA#484): a saved selection picks rows by
// position, and must keep its records when the same save meets new rows.
let snapshot = { members: [] as unknown[], count: 0, filters: [] as Filter[] };
function Probe() {
  const state = useDataLayer((state) => state);
  const ids = state.crossfilterWrapper.getFilteredRowIds();
  snapshot = {
    members: state.data
      .filter((row) => ids.includes(row.__ID))
      .map((row) => row.logicalId),
    count: state.data.length,
    filters: state.workspaceFilters,
  };
  return null;
}

function workspaceOnly() {
  const saved = selectionIdentitySettings();
  saved.charts = [];
  saved.rowsSettings = undefined;
  return saved;
}

function mount(data: AnalysisSourceRow[], saved = workspaceOnly()) {
  const view = render(
    <DataLayerProvider data={data} savedData={saved}>
      <Probe />
    </DataLayerProvider>
  );
  return {
    saved,
    replace: (
      next: AnalysisSourceRow[],
      ...nextSaved: [SavedDataStructure | undefined] | []
    ) =>
      view.rerender(
        <DataLayerProvider
          data={next}
          savedData={nextSaved.length ? nextSaved[0] : saved}
        >
          <Probe />
        </DataLayerProvider>
      ),
    unmount: view.unmount,
  };
}

beforeAll(() => registerAllCharts());

describe("a saved selection over new rows", () => {
  it("keeps its records when the rows are reversed", async () => {
    const view = mount(rows);
    await waitFor(() =>
      expect(snapshot.members).toEqual(["L01", "L10", "L12"])
    );
    view.replace([...rows].reverse());
    await waitFor(() => expect(snapshot.count).toBe(12));
    expect([...snapshot.members].sort()).toEqual(["L01", "L10", "L12"]);
    view.unmount();
  });

  it("follows the original rows across more than one replacement", async () => {
    const view = mount(rows);
    view.replace([...rows].reverse());
    const extra = { ...rows[0]!, logicalId: "L13", name: "New" };
    view.replace([extra, ...rows]);
    await waitFor(() => expect(snapshot.count).toBe(13));
    expect(snapshot.members).toEqual(["L01", "L10", "L12"]);
    view.unmount();
  });

  it("keeps a selection when equal rows arrive as a new array", async () => {
    const view = mount(rows);
    view.replace(rows.map((row) => ({ ...row })));
    await waitFor(() =>
      expect(snapshot.members).toEqual(["L01", "L10", "L12"])
    );
    view.unmount();
  });

  it("drops a selection whose record is gone instead of picking another", async () => {
    const view = mount(rows);
    view.replace(rows.filter((row) => row.logicalId !== "L10").reverse());
    await waitFor(() => expect(snapshot.count).toBe(11));
    expect(snapshot.filters).toEqual([]);
    expect(snapshot.members).toHaveLength(11);
    view.unmount();
  });

  it("drops a selection whose record now has a twin", async () => {
    const view = mount(rows);
    view.replace([...rows, { ...rows[0]! }].reverse());
    await waitFor(() => expect(snapshot.count).toBe(13));
    expect(snapshot.filters).toEqual([]);
    view.unmount();
  });

  it("trusts new settings that arrive with the new rows", async () => {
    const view = mount(rows);
    view.replace([...rows].reverse(), workspaceOnly());
    await waitFor(() =>
      expect(snapshot.members).toEqual(["L12", "L03", "L01"])
    );
    view.unmount();
  });

  it("resets when the new rows come without settings", async () => {
    const view = mount(rows);
    view.replace([...rows].reverse(), undefined);
    await waitFor(() => expect(snapshot.count).toBe(12));
    expect(snapshot.filters).toEqual([]);
    expect(snapshot.members).toHaveLength(12);
    view.unmount();
  });
});
