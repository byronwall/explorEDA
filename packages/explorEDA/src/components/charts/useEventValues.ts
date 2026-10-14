import { useMemo } from "react";
import { categoryKey, categoryLabel, categoryValue } from "@/lib/categories";
import { isMissingValue } from "@/lib/valueParsing";
import { useDataLayer } from "@/providers/DataLayerProvider";
import type { datum } from "@/types/ChartTypes";

export interface EventValue {
  key: string;
  value: datum;
  label: string;
  count: number;
}

/** A field's values, most frequent first, for choosing events in settings. */
export function useEventValues(field: string | undefined) {
  const getColumnData = useDataLayer((state) => state.getColumnData);
  const nonce = useDataLayer((state) => state.nonce);
  return useMemo(() => {
    void nonce;
    if (!field) return [];
    const counts = new Map<string, { value: datum; count: number }>();
    for (const raw of Object.values(getColumnData(field))) {
      if (isMissingValue(raw)) continue;
      const value = categoryValue(raw);
      const key = categoryKey(value);
      const item = counts.get(key);
      if (item) item.count += 1;
      else counts.set(key, { value, count: 1 });
    }
    return [...counts]
      .map(
        ([key, item]): EventValue => ({
          key,
          ...item,
          label: categoryLabel(item.value),
        })
      )
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
  }, [field, getColumnData, nonce]);
}
