import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ActionTooltip } from "@/components/ui/tooltip";
import {
  REVIEW_LIMIT,
  type ConversionExample,
  type ConversionPreview,
  type ReviewKind,
} from "@/lib/fieldSettings";
import { cn } from "@/lib/utils";

export type ReviewFilter = "failed" | ReviewKind;

const FILTERS: Array<{ id: ReviewFilter; label: string; tooltip: string }> = [
  {
    id: "failed",
    label: "Failed",
    tooltip: "Values this setting cannot read. They become missing.",
  },
  {
    id: "ambiguous",
    label: "Ambiguous",
    tooltip:
      "Text another number input reads as a different number, such as 1.400: 1400 or 1.4.",
  },
  {
    id: "changed",
    label: "Changed",
    tooltip:
      "Text whose value is written differently once read, such as 1.234,50 as 1234.5.",
  },
  {
    id: "unchanged",
    label: "Same",
    tooltip: "Values that read exactly as they are written.",
  },
];

const countOf = (preview: ConversionPreview, filter: ReviewFilter) =>
  filter === "failed"
    ? preview.failedCount
    : filter === "ambiguous"
      ? preview.ambiguousCount
      : filter === "changed"
        ? preview.changedCount
        : preview.unchangedCount;

/** The first filter with rows, so the review opens on what needs a look. */
export function firstReviewFilter(preview: ConversionPreview): ReviewFilter {
  return (
    FILTERS.find((filter) => countOf(preview, filter.id) > 0)?.id ?? "failed"
  );
}

type Row = ConversionExample & { reason?: string };

/**
 * Every row a field's draft conversion affects, by kind: failed values with
 * their reason, values another number input reads differently, reformatted
 * text, and values read as written.
 */
export function ConversionReview({
  preview,
  filter,
  onFilterChange,
}: {
  preview: ConversionPreview;
  filter: ReviewFilter;
  onFilterChange: (filter: ReviewFilter) => void;
}) {
  const rows: Row[] =
    filter === "failed"
      ? preview.failures.slice(0, REVIEW_LIMIT).map((failure) => ({
          row: failure.row,
          raw: failure.raw,
          value: undefined,
          reason: failure.reason,
        }))
      : preview.review[filter];
  const total = countOf(preview, filter);
  const note =
    filter === "failed" ? "Reason" : filter === "ambiguous" ? "Also reads" : "";

  return (
    <section
      aria-label="Conversion review"
      className="flex min-h-0 flex-col gap-2"
    >
      <ToggleGroup
        type="single"
        variant="outline"
        size="sm"
        aria-label="Rows to review"
        value={filter}
        onValueChange={(value) => {
          if (value) onFilterChange(value as ReviewFilter);
        }}
        className="eda-review-filters w-full"
      >
        {FILTERS.map((item) => {
          const count = countOf(preview, item.id);
          return (
            <ActionTooltip key={item.id} content={item.tooltip}>
              <ToggleGroupItem
                value={item.id}
                aria-label={`${item.label}: ${count}`}
                className="min-w-0 flex-auto gap-1 px-1.5 text-xs aria-checked:bg-primary/10 aria-checked:font-semibold aria-checked:text-primary"
              >
                <span className="truncate">{item.label}</span>
                <span
                  className={cn(
                    "tabular-nums",
                    count === 0
                      ? "text-muted-foreground"
                      : item.id === "failed"
                        ? "text-destructive"
                        : item.id === "ambiguous"
                          ? "text-warning"
                          : ""
                  )}
                >
                  {count.toLocaleString()}
                </span>
              </ToggleGroupItem>
            </ActionTooltip>
          );
        })}
      </ToggleGroup>
      {rows.length === 0 ? (
        <p className="py-6 text-center text-xs text-muted-foreground">
          {filter === "failed"
            ? "Every value reads with this setting."
            : "No values of this kind."}
        </p>
      ) : (
        <div className="min-h-0 flex-1 overflow-auto rounded-md border">
          {/* Columns size to their values; spare width stays at the right. */}
          <table className="text-xs">
            <thead className="sticky top-0 bg-popover">
              <tr className="border-b text-left text-muted-foreground">
                <th className="px-2 py-1.5 text-right font-medium">Row</th>
                <th className="px-2 py-1.5 font-medium">Written</th>
                {(filter === "ambiguous" || filter === "changed") && (
                  <th className="px-2 py-1.5 text-right font-medium">
                    Reads as
                  </th>
                )}
                {note && <th className="px-2 py-1.5 font-medium">{note}</th>}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.row}
                  className="border-b transition-colors duration-150 last:border-0 hover:bg-muted/40"
                >
                  <td className="px-2 py-1 text-right text-muted-foreground tabular-nums">
                    {row.row + 1}
                  </td>
                  <td className="px-2 py-1 font-mono whitespace-pre">
                    {String(row.raw)}
                  </td>
                  {(filter === "ambiguous" || filter === "changed") && (
                    <td className="px-2 py-1 text-right font-mono tabular-nums">
                      {String(row.value)}
                    </td>
                  )}
                  {note && (
                    <td
                      className={cn(
                        "px-2 py-1",
                        filter === "failed"
                          ? "text-destructive"
                          : "text-warning"
                      )}
                    >
                      {row.reason ?? row.alternate}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {rows.length < total && (
        <p className="text-xs text-muted-foreground">
          First {rows.length.toLocaleString()} of {total.toLocaleString()}.
        </p>
      )}
    </section>
  );
}
