import { dateTimestamp } from "@/lib/dateTime";
import { categoryIncludes } from "@/lib/categories";
import { datum, Filter } from "@/types/FilterTypes";

export function applyFilter(value: datum, filter: Filter): boolean {
  switch (filter.type) {
    case "value":
      return categoryIncludes(filter.values, value);
    case "range":
      if (
        typeof value === "number" ||
        (typeof value === "string" && value.trim() !== "")
      ) {
        const number = Number(value);
        if (!Number.isFinite(number)) {
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
      if (typeof value !== "string") {
        return false;
      }

      const timestamp = dateTimestamp(value);
      if (Number.isNaN(timestamp)) {
        return false;
      }

      const min =
        filter.min === undefined ? undefined : dateTimestamp(filter.min);
      const max =
        filter.max === undefined
          ? undefined
          : filter.max.length === 10
            ? dateTimestamp(`${filter.max}T23:59:59.999Z`)
            : dateTimestamp(filter.max);

      return (
        (min === undefined || (!Number.isNaN(min) && timestamp >= min)) &&
        (max === undefined || (!Number.isNaN(max) && timestamp <= max))
      );
    }
  }

  return false;
}
