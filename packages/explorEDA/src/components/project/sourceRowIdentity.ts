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

/** The position a reference names, when it names a row by position. */
function rowPosition(source: SourceDefinition, rowKey: string) {
  // Keyed references read `<source>:<type>:<key>`, and a key's type is never
  // "row", so only an exact `<source>:row:<n>` is a position. A key that
  // ends in ":row:9" is still a key.
  const prefix = `${source.id}:row:`;
  if (!rowKey.startsWith(prefix)) return undefined;
  const rest = rowKey.slice(prefix.length);
  return /^\d+$/.test(rest) ? Number(rest) : undefined;
}

export function resolveSourceRow(
  source: SourceDefinition,
  rows: readonly AnalysisSourceRow[],
  ref: AnalysisSourceReference
): { row?: AnalysisSourceRow; issue?: "ambiguous" | "unresolved" } {
  if (ref.entityKey != null) {
    const matches = rows.filter(
      (row) => row[source.entityKey] === ref.entityKey
    );
    if (matches.length === 1) return { row: matches[0] };
    return { issue: matches.length > 1 ? "ambiguous" : "unresolved" };
  }

  const index = rowPosition(source, ref.rowKey);
  const row = index == null ? undefined : rows[index];
  if (!row) return { issue: "unresolved" };
  // A position stands in for a record only while the record there has no
  // key of its own. A uniquely keyed record at that position now is another
  // record, so the old reference no longer finds anything.
  const key = row[source.entityKey];
  if (
    validKey(key) &&
    rows.filter((other) => other[source.entityKey] === key).length === 1
  )
    return { issue: "unresolved" };
  return { row };
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
