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
  /**
   * Leaves out values equal to `min`, as a histogram's upper coverage tail
   * does for the last edge.
   */
  minExclusive?: boolean;
  /**
   * Leaves out values equal to `max`, as a histogram bar does for its upper
   * edge. Typed ranges include both bounds.
   */
  maxExclusive?: boolean;
}

export interface TextFilter extends FilterBase {
  type: "text";
  operator: "contains" | "equals" | "startsWith" | "endsWith";
  value: string;
}

export interface DateRangeFilter extends FilterBase {
  type: "date-range";
  min?: string;
  max?: string;
}

/** Where a measurement sits against a chart's specification limits. */
export type SpecRegion = "below" | "within" | "above" | "outside";

/**
 * Rows whose measurement falls in one region of the specification limits.
 * It saves no limits: it reads the current limits of the histogram that owns
 * it, so moving a limit moves the selection with it.
 */
export interface SpecStatusFilter extends FilterBase {
  type: "spec-status";
  region: SpecRegion;
}

export type Filter =
  | ValueFilter
  | RangeFilter
  | TextFilter
  | DateRangeFilter
  | SpecStatusFilter;

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

export const isDateRangeFilter = (
  filter: Filter
): filter is DateRangeFilter => {
  return filter.type === "date-range";
};
