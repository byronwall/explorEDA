import {
  dateBound,
  finiteNumber,
  isMissingValue,
  timestampOf,
} from "@/lib/valueParsing";
import { categoryIncludes } from "@/lib/categories";
import { datum, Filter } from "@/types/FilterTypes";

export function applyFilter(value: datum, filter: Filter): boolean {
  switch (filter.type) {
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
          (filter.min === undefined || number >= filter.min) &&
          (filter.max === undefined || number <= filter.max)
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
