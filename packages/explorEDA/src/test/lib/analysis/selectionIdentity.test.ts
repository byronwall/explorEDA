import { beforeAll, describe, expect, it } from "vitest";
import { registerAllCharts } from "@/charts/registerAllCharts";
import {
  decodeAnalysisRowKeys,
  encodeAnalysisRowKeys,
  unresolvedAnalysisRowKeys,
} from "@/components/project/analysisRowKeys";
import {
  resolveSourceRow,
  sourceRowIdentities,
} from "@/components/project/sourceRowIdentity";
import { incompatibleSettingsFields } from "@/components/project/settingsCompatibility";
import { applyFilter } from "@/hooks/applyFilter";
import { evaluateAnalysisQuery } from "@/lib/analysis/evaluateProject";
import { initializeData } from "@/providers/lib/dataLayerState";
import type {
  AnalysisProject,
  AnalysisSourceRow,
  SourceDefinition,
} from "@/types/AnalysisProject";
import type { Filter } from "@/types/FilterTypes";
import { DEFAULT_SCATTER_SETTINGS } from "@/utils/defaultSettings";
import {
  selectionIdentityLedger,
  selectionIdentitySettings,
} from "./selectionIdentityFixture";

// Cases from the R077 selection identity research (byronwall/explorEDA#484).
// Every record carries a logicalId so membership is checked exactly.
const rows = selectionIdentityLedger;
const source: SourceDefinition = {
  id: "records",
  name: "Records",
  glyph: "R",
  entityKey: "key",
  fields: [],
};

function members(data: AnalysisSourceRow[], filter: Filter) {
  return initializeData(data)
    .dataWithIds.filter((row) => applyFilter(row.__ID, filter))
    .map((row) => row.logicalId);
}

beforeAll(() => registerAllCharts());

describe("project row keys for every filter owner", () => {
  const refs = sourceRowIdentities(source, rows);
  const encoded = encodeAnalysisRowKeys(
    selectionIdentitySettings(),
    new Map(refs.map((item, index) => [index, item.ref.rowKey]))
  );
  const reversed = [...rows].reverse();
  const decoded = decodeAnalysisRowKeys(
    encoded,
    new Map(
      sourceRowIdentities(source, reversed).map((item, index) => [
        item.ref.rowKey,
        index,
      ])
    )
  );

  it("keeps chart and Rows filters on their records after reversal", () => {
    expect(members(reversed, decoded.charts[0]!.filters[0]!)).toEqual([
      "L10",
      "L05",
      "L02",
    ]);
    expect(members(reversed, decoded.rowsSettings!.filters[0]!)).toEqual([
      "L10",
      "L08",
      "L04",
    ]);
  });

  it("keeps workspace and chart-local filters on their records after reversal", () => {
    expect(members(reversed, decoded.workspaceFilters![0]!)).toEqual([
      "L12",
      "L10",
      "L01",
    ]);
    expect(members(reversed, decoded.charts[0]!.localFilters![0]!)).toEqual([
      "L12",
      "L10",
      "L01",
    ]);
  });

  it("reports unresolved keys from every owner", () => {
    const missing = decodeAnalysisRowKeys(encoded, new Map());
    expect(unresolvedAnalysisRowKeys(missing)).toHaveLength(12);
    expect(members(reversed, missing.workspaceFilters![0]!)).toEqual([]);
  });

  it("leaves value filters on other fields alone", () => {
    const settings = selectionIdentitySettings();
    settings.workspaceFilters = [
      { type: "value", field: "cohort", values: ["keep"] },
    ];
    const round = decodeAnalysisRowKeys(
      encodeAnalysisRowKeys(settings, new Map()),
      new Map()
    );
    expect(round.workspaceFilters).toEqual(settings.workspaceFilters);
  });
});

describe("settings fields a query result lacks", () => {
  it("names a field only a workspace filter reads", () => {
    const settings = selectionIdentitySettings();
    settings.charts = [];
    settings.rowsSettings = undefined;
    settings.workspaceFilters = [
      { type: "value", field: "cohort", values: ["keep"] },
    ];
    expect(incompatibleSettingsFields(settings, new Set(["key"]))).toEqual([
      "cohort",
    ]);
  });

  it("does not count the row-position field", () => {
    const settings = selectionIdentitySettings();
    settings.charts = [{ ...DEFAULT_SCATTER_SETTINGS, id: "C", filters: [] }];
    expect(incompatibleSettingsFields(settings, new Set(["key"]))).toEqual([]);
  });
});

describe("source references", () => {
  it("finds a keyed record again after reversal", () => {
    const ref = sourceRowIdentities(source, rows)[1]!.ref;
    expect(resolveSourceRow(source, [...rows].reverse(), ref).row).toBe(
      rows[1]
    );
  });

  it("reads a key ending in :row:N as a key, not a position", () => {
    const special = rows.map((row, index) =>
      index === 1 ? { ...row, key: "tag:row:9" } : row
    );
    const ref = sourceRowIdentities(source, special)[1]!.ref;
    expect(ref.rowKey).toBe("records:string:tag:row:9");
    expect(resolveSourceRow(source, special, ref).row?.logicalId).toBe("L02");
    expect(
      resolveSourceRow(source, [...special].reverse(), ref).row?.logicalId
    ).toBe("L02");
  });

  it("does not hand a duplicate's position to a keyed record", () => {
    const duplicate = rows.map((row, index) =>
      index === 8 ? { ...row, key: 303 } : row
    );
    const ref = sourceRowIdentities(source, duplicate)[9]!.ref;
    expect(ref.rowKey).toBe("records:row:9");
    expect(resolveSourceRow(source, duplicate, ref).row?.logicalId).toBe("L10");
    // Reversed, position 9 holds L03, whose key is unique.
    expect(resolveSourceRow(source, [...duplicate].reverse(), ref)).toEqual({
      issue: "unresolved",
    });
  });

  it("does not read a position from another source's reference", () => {
    expect(
      resolveSourceRow(source, rows, {
        sourceId: "records",
        rowKey: "other:row:1",
      })
    ).toEqual({ issue: "unresolved" });
  });
});

describe("expansion output keys", () => {
  it("gives distinct parent and child pairs distinct keys", () => {
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
    expect(new Set(result.rows.map((row) => row.key)).size).toBe(2);
  });
});
