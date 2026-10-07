import { useMemo, useState } from "react";
import { ExternalLink } from "lucide-react";
import type {
  AnalysisField,
  AnalysisProject,
  AnalysisResultRow,
  AnalysisSourceReference,
  AnalysisSourceRow,
  AnalysisStage,
  AnalysisView,
} from "@/types/AnalysisProject";
import { Button } from "@/components/ui/button";
import { buildFieldProfiles } from "@/lib/fieldProfiles";
import { FieldMetadata } from "@/components/FieldMetadata";
import { cn } from "@/lib/utils";
import { matchingSourceRows, resolveSourceRow } from "./sourceRowIdentity";
import { rowLabel, sourceView } from "./queryEditing";

type Tables = Record<string, readonly AnalysisSourceRow[]>;
const PAGE = 25;

const PROFILE_TYPES = {
  number: "numeric",
  date: "datetime",
  boolean: "boolean",
  string: "categorical",
} as const;

function Cell({ value, numeric }: { value: unknown; numeric: boolean }) {
  return (
    <td
      className={cn(
        "max-w-36 truncate px-2 py-1.5",
        numeric ? "text-right tabular-nums" : "text-left"
      )}
    >
      {value == null ? (
        <span className="text-muted-foreground">—</span>
      ) : (
        String(value)
      )}
    </td>
  );
}

/**
 * The rows at one step. A chart trace can narrow them to the rows behind one
 * mark; choosing a row shows the source records related to it.
 */
export function QueryStageRows({
  project,
  tables,
  stage,
  focusRowKeys,
  selectedRowKey,
  readOnly,
  onSelectRow,
  onClearFocus,
  onOpenView,
}: {
  project: AnalysisProject;
  tables: Tables;
  stage: AnalysisStage;
  focusRowKeys?: string[];
  selectedRowKey?: string;
  readOnly: boolean;
  onSelectRow: (rowKey: string | undefined) => void;
  onClearFocus: () => void;
  onOpenView?: (
    view: AnalysisView,
    name: string,
    project?: AnalysisProject
  ) => void;
}) {
  const [limit, setLimit] = useState(PAGE);
  const focus = useMemo(
    () => (focusRowKeys ? new Set(focusRowKeys) : undefined),
    [focusRowKeys]
  );
  const rows = focus
    ? stage.rows.filter((row) => focus.has(row.key))
    : stage.rows;
  const profiles = useMemo(
    () =>
      buildFieldProfiles(
        stage.rows.map((row) => row.values),
        Object.fromEntries(
          stage.fields.flatMap((field) =>
            field.type && field.type !== "unknown"
              ? [[field.id, PROFILE_TYPES[field.type]]]
              : []
          )
        ),
        stage.fields.map((field) => field.id)
      ),
    [stage]
  );
  const selectedIndex = stage.rows.findIndex(
    (row) => row.key === selectedRowKey
  );
  const selected = stage.rows[selectedIndex];

  return (
    <section className="space-y-2 border-t border-border pt-4">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="font-medium">Rows at this step</h3>
        <span className="text-xs text-muted-foreground">
          {focus
            ? `${rows.length.toLocaleString()} of ${stage.rows.length.toLocaleString()}`
            : stage.rows.length.toLocaleString()}
        </span>
      </div>
      {focus && (
        <div className="flex items-center justify-between gap-2 rounded-md bg-muted/50 px-2.5 py-1.5 text-xs">
          <span>Rows behind the traced mark</span>
          <Button size="sm" variant="ghost" onClick={onClearFocus}>
            Show all rows
          </Button>
        </div>
      )}
      <div className="overflow-x-auto rounded-md border border-border">
        <table className="min-w-full text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th scope="col" className="px-2 py-1.5 text-left font-normal">
                Row
              </th>
              {stage.fields.map((field) => (
                <th
                  scope="col"
                  key={field.id}
                  className={cn(
                    "max-w-36 px-2 py-1.5 font-normal",
                    field.type === "number" ? "text-right" : "text-left"
                  )}
                >
                  <FieldMetadata
                    label={field.name}
                    profile={profiles.find((item) => item.name === field.id)}
                    compact
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, limit).map((row) => {
              const index = stage.rows.indexOf(row);
              const active = row.key === selectedRowKey;
              return (
                <tr
                  key={row.key}
                  className={cn(
                    "border-b border-border last:border-b-0 hover:bg-muted/50",
                    active && "bg-muted"
                  )}
                >
                  <th scope="row" className="px-2 py-1.5 text-left font-normal">
                    <button
                      type="button"
                      className="max-w-24 truncate underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      aria-pressed={active}
                      aria-label={`Related records for row ${rowLabel(row, index)}`}
                      onClick={() => onSelectRow(active ? undefined : row.key)}
                    >
                      {rowLabel(row, index)}
                    </button>
                  </th>
                  {stage.fields.map((field) => (
                    <Cell
                      key={field.id}
                      value={row.values[field.id]}
                      numeric={field.type === "number"}
                    />
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {rows.length > limit && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => setLimit((current) => current + PAGE * 4)}
        >
          Show more ({(rows.length - limit).toLocaleString()} left)
        </Button>
      )}
      {selected && (
        <RelatedRecords
          project={project}
          tables={tables}
          row={selected}
          label={rowLabel(selected, selectedIndex)}
          readOnly={readOnly}
          onOpenView={onOpenView}
        />
      )}
    </section>
  );
}

/**
 * Source records behind one result row, plus the children of its own record
 * through one-to-many links, two levels deep. Uses scalar tables and row
 * references, never nested objects.
 */
export function relatedRecords(
  project: AnalysisProject,
  tables: Tables,
  row: AnalysisResultRow
) {
  const issues = new Set<string>();
  const found = new Map<string, AnalysisSourceReference & { depth: number }>();
  const start = (
    row.contributors.length ? row.contributors : row.sourceRows
  ).map((ref) => ({ ...ref, depth: 0 }));
  start.forEach((ref) => found.set(`${ref.sourceId}:${ref.rowKey}`, ref));
  // Children come from the row's own record, not from the parents it looked
  // up: an order's items, not its customer's other orders.
  const own = row.sourceRows[0];
  const queue = start.filter(
    (ref) => ref.sourceId === own?.sourceId && ref.rowKey === own.rowKey
  );
  while (queue.length) {
    const current = queue.shift()!;
    const source = project.sources.find((item) => item.id === current.sourceId);
    if (!source) continue;
    const resolved = resolveSourceRow(source, tables[source.id] ?? [], current);
    if (resolved.issue)
      issues.add(`Some ${source.name} records could not be found again.`);
    if (!resolved.row || current.depth >= 2) continue;
    for (const relationship of project.relationships) {
      const forward = relationship.from.sourceId === source.id;
      const reverse = relationship.to.sourceId === source.id;
      const toChildren =
        (relationship.cardinality === "one-to-many" && forward) ||
        (relationship.cardinality === "many-to-one" && reverse);
      if (!toChildren) continue;
      const [here, there] = forward
        ? [relationship.from, relationship.to]
        : [relationship.to, relationship.from];
      const key = resolved.row[here.fieldId];
      const target = project.sources.find((item) => item.id === there.sourceId);
      if (key == null || !target) continue;
      for (const { ref, issue } of matchingSourceRows(
        target,
        tables[target.id] ?? [],
        there.fieldId,
        key
      )) {
        if (issue) issues.add(`${target.name} has missing or repeated keys.`);
        const id = `${ref.sourceId}:${ref.rowKey}`;
        if (found.has(id)) continue;
        const next = { ...ref, depth: current.depth + 1 };
        found.set(id, next);
        queue.push(next);
      }
    }
  }
  return { refs: [...found.values()], issues: [...issues] };
}

function RelatedRecords({
  project,
  tables,
  row,
  label,
  readOnly,
  onOpenView,
}: {
  project: AnalysisProject;
  tables: Tables;
  row: AnalysisResultRow;
  label: string;
  readOnly: boolean;
  onOpenView?: (
    view: AnalysisView,
    name: string,
    project?: AnalysisProject
  ) => void;
}) {
  const related = useMemo(
    () => relatedRecords(project, tables, row),
    [project, tables, row]
  );
  const groups = project.sources.flatMap((source) => {
    const refs = related.refs.filter((ref) => ref.sourceId === source.id);
    const records = refs.flatMap((ref) => {
      const record = resolveSourceRow(source, tables[source.id] ?? [], ref).row;
      return record ? [record] : [];
    });
    return refs.length ? [{ source, records }] : [];
  });

  return (
    <section
      className="space-y-2 rounded-md border border-border p-2.5"
      aria-label={`Records related to row ${label}`}
    >
      <h4 className="font-medium">Records related to {label}</h4>
      {related.issues.map((issue) => (
        <p key={issue} role="status" className="text-xs text-muted-foreground">
          {issue}
        </p>
      ))}
      {!groups.length && (
        <p className="text-xs text-muted-foreground">
          This row has no source records.
        </p>
      )}
      {groups.map(({ source, records }) => (
        <div key={source.id} className="space-y-1">
          <div className="flex items-center justify-between gap-2">
            <h5 className="text-xs font-medium">
              <span aria-hidden="true">{source.glyph} </span>
              {source.name} · {records.length.toLocaleString()}
            </h5>
            {onOpenView && !readOnly && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  const next = sourceView(project, source.id);
                  onOpenView(next.view, next.view.name, next.project);
                }}
              >
                <ExternalLink aria-hidden="true" />
                Open {source.name} as a view
              </Button>
            )}
          </div>
          <SourceTable fields={source.fields} records={records} />
        </div>
      ))}
    </section>
  );
}

function SourceTable({
  fields,
  records,
}: {
  fields: { id: string; name: string; type?: AnalysisField["type"] }[];
  records: AnalysisSourceRow[];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-xs">
        <thead>
          <tr className="border-b border-border">
            {fields.map((field) => (
              <th
                key={field.id}
                scope="col"
                className={cn(
                  "px-2 py-1 font-normal text-muted-foreground",
                  field.type === "number" ? "text-right" : "text-left"
                )}
              >
                {field.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {records.slice(0, PAGE).map((record, index) => (
            <tr key={index} className="border-b border-border last:border-b-0">
              {fields.map((field) => (
                <Cell
                  key={field.id}
                  value={record[field.id]}
                  numeric={field.type === "number"}
                />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {records.length > PAGE && (
        <p className="mt-1 text-xs text-muted-foreground">
          First {PAGE} of {records.length.toLocaleString()}.
        </p>
      )}
    </div>
  );
}
