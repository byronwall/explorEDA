export interface FilterBase {
  type: string;
  field: string;
}

export interface ValueFilter extends FilterBase {
  type: "value";
  values: Array<datum>;
}

export interface RangeFilter extends FilterBase {
  type: "range";
  min?: number;
  max?: number;
}

export interface TextFilter extends FilterBase {
  type: "text";
  operator: "contains" | "equals" | "startsWith" | "endsWith";
  value: string;
}

export type Filter = ValueFilter | RangeFilter | TextFilter;

export interface ChartFilters {
  filters: Filter[];
}

export type datum = string | number | boolean | null | undefined;

// Helper type guards
export const isValueFilter = (filter: Filter): filter is ValueFilter => {
  return filter.type === "value";
};

export const isRangeFilter = (filter: Filter): filter is RangeFilter => {
  return filter.type === "range";
};

export const isTextFilter = (filter: Filter): filter is TextFilter => {
  return filter.type === "text";
};
