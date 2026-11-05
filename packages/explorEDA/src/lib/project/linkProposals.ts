/**
 * Drafts relationships between database tables read from one connection,
 * so a user accepts links instead of drawing each one. A link comes from a
 * foreign key the database declares, or, when it declares none, from key
 * names (`ss_item_sk` and `i_item_sk`, `customerId` and customers' `id`)
 * whose snapshot values match.
 */
import type {
  AnalysisProject,
  AnalysisSourceRow,
  RelationshipDefinition,
} from "@/types/AnalysisProject";

/**
 * A one-column foreign key a database declares: `table.column` holds
 * values of `refTable.refColumn`, with table names as `table=` takes them.
 */
export interface ForeignKey {
  table: string;
  column: string;
  refTable: string;
  refColumn: string;
}

export interface LinkProposal {
  /** The ID the relationship gets when accepted. */
  id: string;
  from: { sourceId: string; fieldId: string };
  to: { sourceId: string; fieldId: string };
  cardinality: RelationshipDefinition["cardinality"];
  reason: "foreign-key" | "name";
  /** Rows of the from table whose value finds a row of the other table. */
  matched: number;
  /** Rows of the from table with a value. */
  total: number;
}

/** Share of from values that must find a row, for a link by name. */
export const MATCH_SHARE = 0.9;
/** Share of the other side's values that must be distinct: its key. */
export const UNIQUE_SHARE = 0.98;

const KEY_SUFFIX = /(_sk|_id|_key|_code|_no|Id|ID|Key|Code)$/;
const isKeyName = (name: string) =>
  /^(id|key)$/i.test(name) || KEY_SUFFIX.test(name);

/** `i_item_sk` without its table prefix: `item_sk`. */
function withoutPrefix(name: string) {
  const match = /^[a-z]{1,4}_(.+_.+)$/i.exec(name);
  return match?.[1];
}

/** `customerId`, `customer_id`, `customer_sk` → `customer`. */
const stem = (name: string) =>
  name.replace(KEY_SUFFIX, "").replace(/_$/, "").toLowerCase();

const singular = (name: string) =>
  name
    .toLowerCase()
    .replace(/ies$/, "y")
    .replace(/(s|es)$/, "");

/** Whether a field of one table names the key of another. */
function namesKey(
  field: string,
  target: string,
  targetSource: { id: string; table?: string }
) {
  if (!isKeyName(field) || !isKeyName(target)) return false;
  const lower = field.toLowerCase();
  const targetLower = target.toLowerCase();
  if (lower === targetLower) return !/^(id|key)$/.test(lower);
  const rest = withoutPrefix(targetLower);
  if (rest && (lower === rest || lower.endsWith(`_${rest}`))) return true;
  // orders.customer_id → customers.id
  const entity = stem(field);
  return (
    /^(id|key)$/.test(targetLower) &&
    Boolean(entity) &&
    [targetSource.id, targetSource.table ?? ""].some(
      (name) => name && singular(name) === singular(entity)
    )
  );
}

interface Column {
  values: Set<unknown>;
  count: number;
}

export function proposeLinks({
  project,
  tables,
  databases,
  foreignKeys = {},
}: {
  project: AnalysisProject;
  tables: Record<string, readonly AnalysisSourceRow[]>;
  /** Database sources by ID: their connection and table. */
  databases: Record<string, { connection: string; table?: string }>;
  /** Declared foreign keys, by connection. */
  foreignKeys?: Record<string, ForeignKey[]>;
}): LinkProposal[] {
  const columns = new Map<string, Column>();
  const column = (sourceId: string, fieldId: string): Column => {
    const key = `${sourceId}\u0000${fieldId}`;
    let found = columns.get(key);
    if (!found) {
      const values = new Set<unknown>();
      let count = 0;
      for (const row of tables[sourceId] ?? []) {
        const value = row[fieldId];
        if (value == null || value === "") continue;
        values.add(value);
        count += 1;
      }
      found = { values, count };
      columns.set(key, found);
    }
    return found;
  };
  const unique = (sourceId: string, fieldId: string) => {
    const { values, count } = column(sourceId, fieldId);
    return count > 0 && values.size / count >= UNIQUE_SHARE;
  };
  const matches = (
    from: LinkProposal["from"],
    to: LinkProposal["to"]
  ): { matched: number; total: number } => {
    const target = column(to.sourceId, to.fieldId).values;
    let matched = 0;
    let total = 0;
    for (const row of tables[from.sourceId] ?? []) {
      const value = row[from.fieldId];
      if (value == null || value === "") continue;
      total += 1;
      if (target.has(value)) matched += 1;
    }
    return { matched, total };
  };

  const sources = new Map(project.sources.map((source) => [source.id, source]));
  const hasField = (sourceId: string, fieldId: string) =>
    Boolean(
      sources.get(sourceId)?.fields.some((field) => field.id === fieldId)
    );
  const pair = (a: string, b: string) => [a, b].sort().join("\u0001");
  const taken = new Set(
    project.relationships.map((item) =>
      pair(
        `${item.from.sourceId}\u0000${item.from.fieldId}`,
        `${item.to.sourceId}\u0000${item.to.fieldId}`
      )
    )
  );
  const proposals: LinkProposal[] = [];
  const add = (
    from: LinkProposal["from"],
    to: LinkProposal["to"],
    reason: LinkProposal["reason"],
    counts: { matched: number; total: number }
  ) => {
    const key = pair(
      `${from.sourceId}\u0000${from.fieldId}`,
      `${to.sourceId}\u0000${to.fieldId}`
    );
    if (taken.has(key)) return;
    taken.add(key);
    proposals.push({
      id: `rel-${from.sourceId}-${from.fieldId}-${to.sourceId}-${to.fieldId}`,
      from,
      to,
      // A unique from field in a few rows is often chance, and a lookup
      // reads many-to-one the same way; the user can change it.
      cardinality: "many-to-one",
      reason,
      ...counts,
    });
  };

  // Sources read from the same connection, in project order.
  const groups = new Map<string, string[]>();
  for (const source of project.sources) {
    const database = databases[source.id];
    if (!database) continue;
    groups.set(database.connection, [
      ...(groups.get(database.connection) ?? []),
      source.id,
    ]);
  }

  for (const [connection, ids] of groups) {
    if (ids.length < 2) continue;
    const byTable = new Map<string, string[]>();
    for (const id of ids) {
      const table = databases[id]!.table;
      if (table) byTable.set(table, [...(byTable.get(table) ?? []), id]);
    }
    for (const key of foreignKeys[connection] ?? []) {
      for (const fromId of byTable.get(key.table) ?? []) {
        for (const toId of byTable.get(key.refTable) ?? []) {
          if (fromId === toId) continue;
          if (!hasField(fromId, key.column) || !hasField(toId, key.refColumn))
            continue;
          const from = { sourceId: fromId, fieldId: key.column };
          const to = { sourceId: toId, fieldId: key.refColumn };
          add(from, to, "foreign-key", matches(from, to));
        }
      }
    }

    for (const fromId of ids) {
      for (const field of sources.get(fromId)!.fields) {
        let best:
          | {
              to: LinkProposal["to"];
              counts: { matched: number; total: number };
            }
          | undefined;
        for (const toId of ids) {
          if (toId === fromId) continue;
          for (const target of sources.get(toId)!.fields) {
            if (
              !namesKey(field.id, target.id, {
                id: toId,
                table: databases[toId]!.table,
              }) ||
              !unique(toId, target.id)
            )
              continue;
            const to = { sourceId: toId, fieldId: target.id };
            const counts = matches({ sourceId: fromId, fieldId: field.id }, to);
            if (
              counts.total > 0 &&
              counts.matched / counts.total >= MATCH_SHARE &&
              (!best ||
                counts.matched / counts.total >
                  best.counts.matched / best.counts.total)
            ) {
              best = { to, counts };
            }
          }
        }
        if (best) {
          add(
            { sourceId: fromId, fieldId: field.id },
            best.to,
            "name",
            best.counts
          );
        }
      }
    }
  }
  return proposals;
}

/** The relationship an accepted proposal adds. */
export function proposalRelationship(
  project: AnalysisProject,
  proposal: LinkProposal
): RelationshipDefinition {
  const name = (id: string) =>
    project.sources.find((source) => source.id === id)?.name ?? id;
  return {
    id: proposal.id,
    name: `${name(proposal.from.sourceId)} to ${name(proposal.to.sourceId)}`,
    from: proposal.from,
    to: proposal.to,
    cardinality: proposal.cardinality,
  };
}
