import { ArrowUpRight } from "lucide-react";
import { CommandGroup, CommandItem } from "@/components/ui/command";
import { ActionTooltip } from "@/components/ui/tooltip";
import { useAnalysisChartContext } from "./AnalysisChartContext";
import { typeIcons } from "./FieldMetadata";

const TYPES = {
  number: "numeric",
  string: "categorical",
  boolean: "boolean",
  date: "datetime",
} as const;

/**
 * Fields of tables the view's query can look up, grouped by table, for a
 * field picker's list. Picking one adds the lookup to the query and, once
 * the query has run, chooses the new field. Links that would multiply the
 * rows are offered as a new view instead. Outside a project, nothing shows.
 */
export function RelatedFieldGroups({
  onChoose,
  onSelect,
  type,
}: {
  onChoose: (fieldId: string) => void;
  /** Runs as soon as an item is picked, such as to close the picker. */
  onSelect?: () => void;
  /** Only fields of this type, for a picker that takes dates or numbers. */
  type?: "number" | "date";
}) {
  const related = useAnalysisChartContext()?.related;
  if (!related) return null;
  const { addField, openExpanded } = related;
  const lookups = related.lookups
    .map((table) => ({
      ...table,
      fields: type
        ? table.fields.filter((field) => field.type === type)
        : table.fields,
    }))
    .filter((table) => table.fields.length);
  // A typed picker chooses a field; opening a view is the full list's job.
  const expands = openExpanded && !type ? related.expands : [];
  return (
    <>
      {lookups.map((table) => (
        <CommandGroup key={table.relationshipId} heading={table.label}>
          {table.fields.map((field) => {
            const label = `${table.label} › ${field.name}`;
            const Icon =
              field.type && field.type !== "unknown"
                ? typeIcons[TYPES[field.type]]
                : undefined;
            return (
              <CommandItem
                key={field.id}
                value={label}
                aria-label={label}
                onSelect={() => {
                  onSelect?.();
                  void addField(table.relationshipId, field.id).then(
                    (id) => id && onChoose(id)
                  );
                }}
              >
                <span className="flex min-w-0 items-center gap-1 pl-6">
                  {Icon && (
                    <Icon
                      className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
                      aria-hidden="true"
                    />
                  )}
                  <span className="min-w-0 truncate">{field.name}</span>
                </span>
              </CommandItem>
            );
          })}
        </CommandGroup>
      ))}
      {expands.length > 0 && (
        <CommandGroup heading="Rows multiply">
          {expands.map((table) => (
            <ActionTooltip
              key={table.relationshipId}
              side="left"
              content={`Each row can match several ${table.label} records. A new view gets one row per ${table.label} record, so rows multiply; this view keeps its rows.`}
            >
              <CommandItem
                value={`More in ${table.label}`}
                onSelect={() => {
                  onSelect?.();
                  openExpanded?.(table.relationshipId);
                }}
              >
                <span className="flex min-w-0 items-center gap-1 pl-6 text-muted-foreground">
                  <span className="min-w-0 truncate">
                    More in {table.label}: opens a new view
                  </span>
                  <ArrowUpRight
                    className="h-3.5 w-3.5 shrink-0"
                    aria-hidden="true"
                  />
                </span>
              </CommandItem>
            </ActionTooltip>
          ))}
        </CommandGroup>
      )}
    </>
  );
}
