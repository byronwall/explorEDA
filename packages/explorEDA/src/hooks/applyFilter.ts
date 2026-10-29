import {
  dateBound,
  finiteNumber,
  isMissingValue,
  timestampOf,
} from "@/lib/valueParsing";
import { categoryIncludes } from "@/lib/categories";
import { inSpecRegion, type SpecLimits } from "@/lib/specification";
import { datum, Filter } from "@/types/FilterTypes";

/**
 * Whether a value passes a filter. A spec-status filter reads the limits of
 * the chart that owns it, passed as `spec`; without limits only Within can
 * match.
 */
export function applyFilter(
  value: datum,
  filter: Filter,
  spec?: SpecLimits
): boolean {
  switch (filter.type) {
    case "spec-status":
      return inSpecRegion(value, filter.region, spec);
    case "value":
      // A missing entry matches every missing value, blank text included.
      return (
        categoryIncludes(filter.values, value) ||
        (isMissingValue(value) && filter.values.some((item) => item == null))
      );
    case "range":
      if (
        typeof value === "number" ||
        (typeof value === "string" && value.trim() !== "")
      ) {
        const number = finiteNumber(value);
        if (number === undefined) {
          return false;
        }
        return (
          (filter.min === undefined ||
            (filter.minExclusive
              ? number > filter.min
              : number >= filter.min)) &&
          (filter.max === undefined ||
            (filter.maxExclusive ? number < filter.max : number <= filter.max))
        );
      }
      break;
    case "text":
      if (typeof value === "string") {
        const lower = value.toLowerCase();
        const search = filter.value.toLowerCase();

        switch (filter.operator) {
          case "contains":
            return lower.includes(search);
          case "equals":
            return lower === search;
          case "startsWith":
            return lower.startsWith(search);
          case "endsWith":
            return lower.endsWith(search);
        }
      }
      break;
    case "date-range": {
      const timestamp = timestampOf(value);
      if (timestamp === undefined) {
        return false;
      }

      const min = filter.min === undefined ? undefined : dateBound(filter.min);
      const max =
        filter.max === undefined ? undefined : dateBound(filter.max, true);

      return (
        (min === undefined || (!Number.isNaN(min) && timestamp >= min)) &&
        (max === undefined || (!Number.isNaN(max) && timestamp <= max))
      );
    }
  }

  return false;
}
