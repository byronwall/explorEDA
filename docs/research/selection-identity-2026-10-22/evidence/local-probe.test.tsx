import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { render, waitFor } from "@testing-library/react";
import { beforeAll, expect, it } from "vitest";
import { registerAllCharts } from "@/charts/registerAllCharts";
import {
  encodeAnalysisRowKeys,
  decodeAnalysisRowKeys,
  unresolvedAnalysisRowKeys,
} from "@/components/project/analysisRowKeys";
import {
  sourceRowIdentities,
  resolveSourceRow,
} from "@/components/project/sourceRowIdentity";
import { incompatibleSettingsFields } from "@/components/project/settingsCompatibility";
import { DataLayerProvider, useDataLayer } from "@/providers/DataLayerProvider";
import { initializeData } from "@/providers/lib/dataLayerState";
import { applyFilter } from "@/hooks/applyFilter";
import { evaluateAnalysisQuery } from "@/lib/analysis/evaluateProject";
import { DEFAULT_SCATTER_SETTINGS } from "@/utils/defaultSettings";
import type { SavedDataStructure } from "@/types/SavedDataStructure";
import type {
  AnalysisProject,
  AnalysisSourceRow,
  SourceDefinition,
} from "@/types/AnalysisProject";
import type { Filter } from "@/types/FilterTypes";

// Locally authored observation probes. Assertions record current behavior, not the proposed repaired contract.
const frozen = JSON.parse(
  readFileSync(
    resolve(
      process.cwd(),
      "../../docs/research/selection-identity-2026-10-22/evidence/frozen-oracle.json"
    ),
    "utf8"
  )
);
const rows: AnalysisSourceRow[] = frozen.ledger;
const source: SourceDefinition = {
  id: "records",
  name: "Records",
  glyph: "R",
  entityKey: "key",
  fields: [],
};
const id = (values: (string | number)[]): Filter => ({
  type: "value",
  field: "__ID",
  values,
});
function settings(): SavedDataStructure {
  return {
    charts: [
      {
        ...DEFAULT_SCATTER_SETTINGS,
        id: "C",
        filters: [id([1, 4, 9])],
        localFilters: [id([0, 9, 11])],
      },
    ],
    rowsSettings: {
      columns: [],
      sortDirection: "asc",
      globalSearch: "",
      filters: [id([3, 7, 9])],
    },
    workspaceFilters: [id([0, 9, 11])],
    calculations: [],
    colorScales: [],
    gridSettings: {
      columnCount: 12,
      rowHeight: 100,
      containerPadding: 10,
      showBackgroundMarkers: false,
    },
    metadata: {
      name: "R077",
      version: 1,
      createdAt: "2026-10-22",
      modifiedAt: "2026-10-22",
    },
  };
}
function members(data: AnalysisSourceRow[], filter: Filter) {
  return initializeData(data)
    .dataWithIds.filter((row) => applyFilter(row.__ID, filter))
    .map((row) => row.logicalId);
}
beforeAll(() => registerAllCharts());

it("records reverse mapping by owner and preserves the chart/Rows controls", () => {
  const refs = sourceRowIdentities(source, rows);
  expect(new Set(refs.map((x) => x.ref.rowKey)).size).toBe(12);
  const encoded = encodeAnalysisRowKeys(
    settings(),
    new Map(refs.map((x, i) => [i, x.ref.rowKey]))
  );
  const reversed = [...rows].reverse();
  const decoded = decodeAnalysisRowKeys(
    encoded,
    new Map(
      sourceRowIdentities(source, reversed).map((x, i) => [x.ref.rowKey, i])
    )
  );
  const chart = members(reversed, decoded.charts[0]!.filters[0]!);
  const table = members(reversed, decoded.rowsSettings!.filters[0]!);
  const workspace = members(reversed, decoded.workspaceFilters![0]!);
  const local = members(reversed, decoded.charts[0]!.localFilters![0]!);
  expect(chart).toEqual(["L10", "L05", "L02"]);
  expect(table).toEqual(["L10", "L08", "L04"]);
  expect(workspace).toEqual(["L12", "L03", "L01"]);
  expect(local).toEqual(workspace);
  const missing = decodeAnalysisRowKeys(encoded, new Map());
  expect(unresolvedAnalysisRowKeys(missing)).toHaveLength(6);
  expect(missing.workspaceFilters).toEqual(encoded.workspaceFilters);
  expect(members(reversed, missing.charts[0]!.filters[0]!)).toEqual([]);
  const schema = settings();
  schema.charts = [];
  schema.rowsSettings = undefined;
  schema.workspaceFilters = [
    { type: "value", field: "cohort", values: ["keep"] },
  ];
  expect(incompatibleSettingsFields(schema, new Set(["key"]))).toEqual([]);
  console.info(
    "R077 owner mapping",
    JSON.stringify({
      chart,
      table,
      workspace,
      local,
      unresolvedCollector: 6,
      workspaceMissingFieldDetected: false,
    })
  );
});

it("observes plain provider reset and supplied positional restore after replacement", async () => {
  let snapshot = {
    members: [] as unknown[],
    count: 0,
    filters: [] as Filter[],
  };
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
  const saved = settings();
  saved.charts = [];
  saved.rowsSettings = undefined;
  const first = render(
    <DataLayerProvider data={rows} savedData={saved}>
      <Probe />
    </DataLayerProvider>
  );
  await waitFor(() => expect(snapshot.members).toEqual(["L01", "L10", "L12"]));
  first.rerender(
    <DataLayerProvider data={[...rows].reverse()} savedData={saved}>
      <Probe />
    </DataLayerProvider>
  );
  await waitFor(() => expect(snapshot.members).toEqual(["L12", "L03", "L01"]));
  const restored = [...snapshot.members];
  first.unmount();
  const reset = render(
    <DataLayerProvider data={rows} savedData={saved}>
      <Probe />
    </DataLayerProvider>
  );
  reset.rerender(
    <DataLayerProvider data={[...rows].reverse()}>
      <Probe />
    </DataLayerProvider>
  );
  await waitFor(() => expect(snapshot.members).toHaveLength(12));
  expect(snapshot.filters).toEqual([]);
  reset.unmount();
  console.info(
    "R077 plain provider",
    JSON.stringify({ restored, deliberateNoSaveResetCount: 12 })
  );
});

it("observes source-reference suffix and duplicate-position reuse with keyed controls", () => {
  const regular = sourceRowIdentities(source, rows)[1]!.ref;
  expect(
    resolveSourceRow(source, [...rows].reverse(), regular).row?.logicalId
  ).toBe("L02");
  const special = rows.map((row, i) =>
    i === 1 ? { ...row, key: "tag:row:9" } : row
  );
  const ref = sourceRowIdentities(source, special)[1]!.ref;
  expect(ref.rowKey).toBe("records:string:tag:row:9");
  expect(resolveSourceRow(source, special, ref).row?.logicalId).toBe("L10");
  const duplicate = rows.map((row, i) =>
    i === 8 ? { ...row, key: 303 } : row
  );
  const positional = sourceRowIdentities(source, duplicate)[9]!.ref;
  expect(resolveSourceRow(source, duplicate, positional).row?.logicalId).toBe(
    "L10"
  );
  const swapped = [...duplicate];
  [swapped[8], swapped[9]] = [swapped[9]!, swapped[8]!];
  expect(resolveSourceRow(source, swapped, positional).row?.logicalId).toBe(
    "L09"
  );
  console.info(
    "R077 source references",
    JSON.stringify({
      suffixIntended: "L02",
      suffixActual: "L10",
      occurrenceBefore: "L10",
      occurrenceAfterSwap: "L09",
      keyedReverseControl: "L02",
    })
  );
});

it("observes two distinct expansion rows sharing one output key", () => {
  const project: AnalysisProject = {
    id: "r077",
    version: 1,
    sources: [
      {
        ...source,
        fields: [
          { id: "key", name: "Key" },
          { id: "join", name: "Join" },
        ],
      },
      {
        id: "children",
        name: "Children",
        glyph: "C",
        entityKey: "key",
        fields: [
          { id: "key", name: "Key" },
          { id: "join", name: "Join" },
        ],
      },
    ],
    relationships: [
      {
        id: "r",
        name: "Match",
        from: { sourceId: "records", fieldId: "join" },
        to: { sourceId: "children", fieldId: "join" },
        cardinality: "one-to-many",
      },
    ],
    queries: [
      {
        id: "q",
        name: "Expansion",
        glyph: "E",
        frameLabel: "Rows",
        steps: [
          { id: "s", kind: "source", sourceId: "records" },
          {
            id: "e",
            kind: "expand",
            inputStepId: "s",
            relationshipId: "r",
            as: "child",
          },
        ],
        outputStepId: "e",
      },
    ],
  };
  const result = evaluateAnalysisQuery(
    project,
    {
      records: [
        { key: "x", join: "a" },
        { key: "x:children:string:y", join: "b" },
      ],
      children: [
        { key: "y:children:string:z", join: "a" },
        { key: "z", join: "b" },
      ],
    },
    "q"
  );
  expect(result.rows).toHaveLength(2);
  expect(result.rows.map((row) => row.data["records.join"])).toEqual([
    "a",
    "b",
  ]);
  expect(new Set(result.rows.map((row) => row.key)).size).toBe(1);
  expect(result.rows[0]!.sourceRows).not.toEqual(result.rows[1]!.sourceRows);
  console.info(
    "R077 expansion",
    JSON.stringify({
      keys: result.rows.map((row) => row.key),
      contributorKeys: result.rows.map((row) =>
        row.sourceRows.map((ref) => ref.rowKey)
      ),
    })
  );
});
