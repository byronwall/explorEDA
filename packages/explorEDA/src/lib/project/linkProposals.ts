/**
 * Drafts relationships between tables, so a user accepts links instead of
 * drawing each one. Tables group by where they come from: the database
 * tables of one connection, and all file sources (CSV, JSON, Parquet) of
 * the project. Within a group, a link comes from a foreign key the database
 * declares, or from key names (`ss_item_sk` and `i_item_sk`, `customerId`
 * and customers' `id`, `run_id` in two files) whose values match.
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

/** `categories` → category, `boxes` → box, `invoices` → invoice. */
const singular = (name: string) =>
  name
    .toLowerCase()
    .replace(/ies$/, "y")
    .replace(/(s|x|z|ch|sh)es$/, "$1")
    .replace(/([^s])s$/, "$1");

/**
 * Whether a key field names a table: `run_id` and `runs`, `ss_item_sk`
 * and `item`, `run_id` and `ci-runs`.
 */
function namesTable(field: string, table: string) {
  const entities = [field, withoutPrefix(field) ?? ""]
    .map((name) => stem(name.split(".").at(-1)!))
    .filter(Boolean)
    .map(singular);
  const tables = [table, table.split(/[-_.]/).at(-1)!].map(singular);
  return entities.some((entity) => tables.includes(entity));
}

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
  /** Each value and how many rows hold it. */
  values: Map<unknown, number>;
  count: number;
}

/**
 * IDs `relate source.field` reads back: a source ID ends at the first dot,
 * so it has none; a field ID may.
 */
const SOURCE_ID = /^[A-Za-z0-9_][\w-]*$/;
const FIELD_ID = /^[A-Za-z0-9_][\w.-]*$/;

export function proposeLinks({
  project,
  tables,
  databases = {},
  foreignKeys = {},
  dismissed,
}: {
  project: AnalysisProject;
  /** Rows by source ID. Only sources with rows get links. */
  tables: Record<string, readonly AnalysisSourceRow[]>;
  /**
   * Database sources by ID: their connection and table. Any other source
   * with rows is a file source; all of them form one group.
   */
  databases?: Record<string, { connection: string; table?: string }>;
  /** Declared foreign keys, by connection. */
  foreignKeys?: Record<string, ForeignKey[]>;
  /**
   * Proposal IDs the user dismissed. They are left out before shortcuts
   * are pruned, so a dismissed link hides no other.
   */
  dismissed?: ReadonlySet<string>;
}): LinkProposal[] {
  const columns = new Map<string, Column>();
  const column = (sourceId: string, fieldId: string): Column => {
    const key = `${sourceId}\u0000${fieldId}`;
    let found = columns.get(key);
    if (!found) {
      const values = new Map<unknown, number>();
      let count = 0;
      for (const row of tables[sourceId] ?? []) {
        const value = row[fieldId];
        if (value == null || value === "") continue;
        values.set(value, (values.get(value) ?? 0) + 1);
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
      // A lookup finds nothing when the value names two rows.
      if (target.get(value) === 1) matched += 1;
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
  const ids = new Set(project.relationships.map((item) => item.id));
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
    const base = `rel-${from.sourceId}-${from.fieldId}-${to.sourceId}-${to.fieldId}`;
    let id = base;
    for (let n = 2; ids.has(id); n++) id = `${base}-${n}`;
    ids.add(id);
    proposals.push({
      id,
      from,
      to,
      // A unique from field in a few rows is often chance, and a lookup
      // reads many-to-one the same way; the user can change it.
      cardinality: "many-to-one",
      reason,
      ...counts,
    });
  };

  // Sources read from the same connection, and file sources, in project
  // order. The file group's key cannot be a connection name.
  const groups = new Map<string, string[]>();
  for (const source of project.sources) {
    const database = databases[source.id];
    if (!database && !tables[source.id]?.length) continue;
    const group = database ? database.connection : "\u0000files";
    groups.set(group, [...(groups.get(group) ?? []), source.id]);
  }

  for (const [connection, ids] of groups) {
    if (ids.length < 2) continue;
    const byTable = new Map<string, string[]>();
    for (const id of ids) {
      const table = databases[id]?.table;
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

    const files = !databases[ids[0]!];
    for (const fromId of ids) {
      if (!SOURCE_ID.test(fromId)) continue;
      for (const field of sources.get(fromId)!.fields) {
        if (!FIELD_ID.test(field.id)) continue;
        // A file's key that names the file itself (customers.customer_id)
        // is its own; another file with the same values isn't its owner.
        if (files && namesTable(field.id, fromId)) continue;
        let tied = false;
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
              !SOURCE_ID.test(toId) ||
              !FIELD_ID.test(target.id) ||
              !namesKey(field.id, target.id, {
                id: toId,
                table: databases[toId]?.table,
              }) ||
              !unique(toId, target.id)
            )
              continue;
            // Files declare no keys, and two exports often number their
            // rows the same way, so a file link needs the key to name the
            // other file: jobs.run_id finds runs, not another export of
            // run IDs.
            if (files && !namesTable(field.id, toId)) continue;
            const to = { sourceId: toId, fieldId: target.id };
            const counts = matches({ sourceId: fromId, fieldId: field.id }, to);
            if (counts.total === 0) continue;
            const share = counts.matched / counts.total;
            if (share < MATCH_SHARE) continue;
            const bestShare = best
              ? best.counts.matched / best.counts.total
              : -1;
            if (share > bestShare) {
              best = { to, counts };
              tied = false;
            } else if (share === bestShare) {
              tied = true;
            }
          }
        }
        // Two files that both fit, such as crm_customers and
        // billing_customers, leave the owner of the key unknown.
        if (best && !(files && tied)) {
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
  return withoutShortcuts(
    project.relationships,
    proposals.filter((item) => !dismissed?.has(item.id)),
    tables
  );
}

/**
 * Drops a link by name that a lookup through another table already gives:
 * steps.run_id → runs when steps.job_id → jobs and jobs.run_id → runs. A
 * table that copies its parent's keys would otherwise draw a link to every
 * ancestor. Only when the data agrees: a shipment's customer_id may be
 * the recipient while its order's customer_id is the buyer.
 */
function withoutShortcuts(
  accepted: readonly RelationshipDefinition[],
  proposals: LinkProposal[],
  tables: Record<string, readonly AnalysisSourceRow[]>
): LinkProposal[] {
  const kept = [...proposals];
  const edges = () => [...accepted, ...kept];
  // Whether every row's own value of `field` is the one its row of the
  // middle table holds: then both paths reach the same row of the target.
  const agrees = (
    from: string,
    field: string,
    step: {
      from: { fieldId: string };
      to: { sourceId: string; fieldId: string };
    }
  ) => {
    const middle = new Map<unknown, unknown>();
    const twice = new Set<unknown>();
    for (const row of tables[step.to.sourceId] ?? []) {
      const key = row[step.to.fieldId];
      if (middle.has(key)) twice.add(key);
      if (key == null || key === "") continue;
      middle.set(key, row[field]);
    }
    // Every row the direct link reads must reach the same value through
    // one row of the middle table; a missing or doubled middle key keeps
    // the direct link.
    let checked = 0;
    for (const row of tables[from] ?? []) {
      const value = row[field];
      if (value == null || value === "") continue;
      const key = row[step.from.fieldId];
      // A lookup matches no row on an empty key.
      if (
        key == null ||
        key === "" ||
        !middle.has(key) ||
        twice.has(key) ||
        middle.get(key) !== value
      )
        return false;
      checked += 1;
    }
    return checked > 0;
  };
  for (const proposal of proposals) {
    if (proposal.reason !== "name") continue;
    const { from, to } = proposal;
    const implied = edges().some(
      (step) =>
        step !== proposal &&
        step.from.sourceId === from.sourceId &&
        step.from.fieldId !== from.fieldId &&
        step.to.sourceId !== to.sourceId &&
        edges().some(
          (next) =>
            next !== proposal &&
            next.from.sourceId === step.to.sourceId &&
            next.from.fieldId === from.fieldId &&
            next.to.sourceId === to.sourceId &&
            next.to.fieldId === to.fieldId
        ) &&
        agrees(from.sourceId, from.fieldId, step)
    );
    if (implied) kept.splice(kept.indexOf(proposal), 1);
  }
  return kept;
}

/**
 * The project without analyses' own sources: the project text compiles
 * before them, so a relate line can't name one.
 */
export function withoutLocalSources(
  project: AnalysisProject,
  localSources: Record<string, string>
): AnalysisProject {
  return {
    ...project,
    sources: project.sources.filter((source) => !(source.id in localSources)),
  };
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
