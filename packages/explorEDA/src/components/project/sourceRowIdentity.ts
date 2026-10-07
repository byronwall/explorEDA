import type {
  AnalysisSourceReference,
  AnalysisSourceRow,
  SourceDefinition,
} from "@/types/AnalysisProject";

export interface SourceRowIdentity {
  ref: AnalysisSourceReference;
  issue?: "duplicate-key" | "missing-key";
}

function validKey(value: unknown): value is string | number | boolean {
  return (
    value != null &&
    (typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean")
  );
}

export function sourceRowIdentities(
  source: SourceDefinition,
  rows: readonly AnalysisSourceRow[]
): SourceRowIdentity[] {
  const counts = new Map<string, number>();
  const keys = rows.map((row) => row[source.entityKey]);
  for (const key of keys) {
    if (!validKey(key)) continue;
    const token = `${typeof key}:${String(key)}`;
    counts.set(token, (counts.get(token) ?? 0) + 1);
  }

  return keys.map((key, index) => {
    const duplicate =
      validKey(key) && counts.get(`${typeof key}:${String(key)}`)! > 1;
    const rowKey =
      validKey(key) && !duplicate
        ? `${source.id}:${typeof key}:${String(key)}`
        : `${source.id}:row:${index}`;
    return {
      ref: {
        sourceId: source.id,
        rowKey,
        ...(!duplicate && validKey(key) ? { entityKey: key } : {}),
      },
      issue: duplicate
        ? "duplicate-key"
        : !validKey(key)
          ? "missing-key"
          : undefined,
    };
  });
}

export function resolveSourceRow(
  source: SourceDefinition,
  rows: readonly AnalysisSourceRow[],
  ref: AnalysisSourceReference
): { row?: AnalysisSourceRow; issue?: "ambiguous" | "unresolved" } {
  const indexMatch = ref.rowKey.match(/:row:(\d+)$/);
  if (ref.rowKey.startsWith(`${source.id}:`) && indexMatch) {
    const row = rows[Number(indexMatch[1])];
    return row ? { row } : { issue: "unresolved" };
  }

  if (ref.entityKey == null) return { issue: "unresolved" };
  const matches = rows.filter((row) => row[source.entityKey] === ref.entityKey);
  if (matches.length === 1) return { row: matches[0] };
  return { issue: matches.length > 1 ? "ambiguous" : "unresolved" };
}

export function matchingSourceRows(
  source: SourceDefinition,
  rows: readonly AnalysisSourceRow[],
  fieldId: string,
  value: unknown
) {
  return sourceRowIdentities(source, rows).flatMap(({ ref, issue }, index) =>
    rows[index]?.[fieldId] === value ? [{ ref, row: rows[index]!, issue }] : []
  );
}
