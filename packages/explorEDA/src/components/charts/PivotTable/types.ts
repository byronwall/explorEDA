import { datum } from "@/types/FilterTypes";

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
}

export interface PivotCell {
  key: CellKey;
  value: datum;
  rawValue: datum;
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
