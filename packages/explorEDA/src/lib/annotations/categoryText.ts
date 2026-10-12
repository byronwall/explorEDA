import type { datum } from "@/types/ChartTypes";

/** A category value as annotations store and match it. */
export function categoryText(value: datum) {
  return value == null ? "(missing)" : String(value);
}
