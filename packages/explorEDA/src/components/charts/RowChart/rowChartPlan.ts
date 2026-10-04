import { categoryKey, categoryLabel, categoryValue } from "@/lib/categories";
import type { datum } from "@/types/ChartTypes";

export interface RowCategory {
  key: string;
  value: datum;
  label: string;
  total: number;
  sourceIds: number[];
}
export function planRowCategories(
  column: Record<number, datum>,
  liveIds: number[],
  maxRows: number
) {
  const categories = new Map<string, RowCategory>();
  Object.values(column).forEach((input) => {
    const value = categoryValue(input);
    const key = categoryKey(value);
    const category = categories.get(key) ?? {
      key,
      value,
      label: categoryLabel(value),
      total: 0,
      sourceIds: [],
    };
    category.total++;
    categories.set(key, category);
  });
  liveIds.forEach((id) =>
    categories.get(categoryKey(column[id]))?.sourceIds.push(id)
  );
  const sorted = [...categories.values()].sort((a, b) => b.total - a.total);
  const other = sorted.length > maxRows ? sorted.slice(maxRows - 1) : [];
  return {
    categories: sorted,
    visible: other.length ? sorted.slice(0, maxRows - 1) : sorted,
    other,
  };
}
