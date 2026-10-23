import type { AnalysisSourceRow } from "@/types/AnalysisProject";
import type { Filter } from "@/types/FilterTypes";
import type { SavedDataStructure } from "@/types/SavedDataStructure";
import { DEFAULT_SCATTER_SETTINGS } from "@/utils/defaultSettings";

/**
 * The 12-record ledger from the R077 selection identity research. Keys mix
 * types that print alike (101 and "101", 0 and "0"), so a key compared as text
 * finds the wrong record.
 */
export const selectionIdentityLedger: AnalysisSourceRow[] = [
  { logicalId: "L01", key: 101, name: "Mira", cohort: "keep", measure: 1 },
  { logicalId: "L02", key: "101", name: "Mira", cohort: "keep", measure: 2 },
  { logicalId: "L03", key: 202, name: "Theo", cohort: "other", measure: 4 },
  { logicalId: "L04", key: "k4", name: "Theo", cohort: "keep", measure: 8 },
  { logicalId: "L05", key: true, name: "Sana", cohort: "other", measure: 16 },
  { logicalId: "L06", key: false, name: "Sana", cohort: "keep", measure: 32 },
  { logicalId: "L07", key: 0, name: "Devon", cohort: "other", measure: 64 },
  { logicalId: "L08", key: "0", name: "Devon", cohort: "keep", measure: 128 },
  { logicalId: "L09", key: "k9", name: "Imani", cohort: "other", measure: 256 },
  { logicalId: "L10", key: 303, name: "Imani", cohort: "keep", measure: 512 },
  {
    logicalId: "L11",
    key: "k11",
    name: "Jules",
    cohort: "other",
    measure: 1024,
  },
  { logicalId: "L12", key: 404, name: "Jules", cohort: "keep", measure: 2048 },
];

const byPosition = (values: number[]): Filter => ({
  type: "value",
  field: "__ID",
  values,
});

/** Row-position selections in each filter owner: W is L01, L10, L12. */
export function selectionIdentitySettings(): SavedDataStructure {
  return {
    charts: [
      {
        ...DEFAULT_SCATTER_SETTINGS,
        id: "C",
        filters: [byPosition([1, 4, 9])],
        localFilters: [byPosition([0, 9, 11])],
      },
    ],
    rowsSettings: {
      columns: [],
      sortDirection: "asc",
      globalSearch: "",
      filters: [byPosition([3, 7, 9])],
    },
    workspaceFilters: [byPosition([0, 9, 11])],
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
