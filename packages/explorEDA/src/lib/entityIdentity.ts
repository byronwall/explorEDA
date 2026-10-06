import { categoryKey } from "@/lib/categories";
import type { datum } from "@/types/ChartTypes";

export interface EntityIdentityIssue {
  entityKey?: datum;
  sourceIds: number[];
  reason: "missing-id" | "conflicting-values";
}

/** Keep one row per entity only when every displayed value agrees. */
export function collapseEntityRows(
  ids: number[],
  entityData: Record<number, datum>,
  displayedData: Record<number, datum>[]
) {
  const groups = new Map<string, { entityKey: datum; ids: number[] }>();
  const issues: EntityIdentityIssue[] = [];
  for (const id of ids) {
    const entityKey = entityData[id];
    if (entityKey === undefined || entityKey === null) {
      issues.push({ sourceIds: [id], reason: "missing-id" });
      continue;
    }
    const key = categoryKey(entityKey);
    const group = groups.get(key);
    if (group) group.ids.push(id);
    else groups.set(key, { entityKey, ids: [id] });
  }

  const representatives: number[] = [];
  const sourceIdsByRepresentative = new Map<number, number[]>();
  for (const group of groups.values()) {
    const first = group.ids[0]!;
    const agrees = group.ids.every((id) =>
      displayedData.every((data) => Object.is(data[id], data[first]))
    );
    if (!agrees) {
      issues.push({
        entityKey: group.entityKey,
        sourceIds: group.ids,
        reason: "conflicting-values",
      });
      continue;
    }
    representatives.push(first);
    sourceIdsByRepresentative.set(first, group.ids);
  }
  return { representatives, sourceIdsByRepresentative, issues };
}
