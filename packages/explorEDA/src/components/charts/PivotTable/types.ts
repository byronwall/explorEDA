import { datum } from "@/types/FilterTypes";

export type PivotSourceId = string | number;

export interface PivotHeader {
  label: string;
  field: string;
  value: datum;
  children?: PivotHeader[];
  span: number;
  depth: number;
}

export interface CellKey {
  columnField: string;
  columnValue: datum;
  valueField?: string;
  isTotal?: boolean;
}

export interface PivotCell {
  key: CellKey;
  value: datum;
  rawValue: datum;
  aggregation: string;
  status: "ok" | "empty" | "invalid" | "error";
  error?: string;
  contributors: PivotContributor[];
  numericExclusions: PivotNumericExclusion[];
}

export interface PivotContributor {
  sourceId: PivotSourceId | undefined;
  groupingKeys: RowKey[];
  input: datum;
  included: boolean;
  exclusionReason?: string;
}

export interface PivotNumericExclusion {
  sourceId: PivotSourceId | undefined;
  value: datum;
  reason: string;
}

export interface RowKey {
  field: string;
  value: datum;
}

export interface PivotRow {
  keys: RowKey[];
  headers: PivotHeader[];
  cells: PivotCell[];
}

export interface PivotTableData {
  headers: PivotHeader[];
  rows: PivotRow[];
}

export interface FilterState {
  field: string;
  values: Set<string | number>;
}
