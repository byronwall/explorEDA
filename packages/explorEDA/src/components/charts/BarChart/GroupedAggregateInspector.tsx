import type { AggregateResultRow } from "@/lib/aggregates";
import { displayAggregateValue } from "@/lib/aggregates";
import { useEffect, useState } from "react";

const PAGE_SIZE = 50;

function Pager({
  page,
  pageCount,
  onPageChange,
}: {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
}) {
  if (pageCount <= 1) return null;
  return (
    <div className="flex items-center justify-between text-xs text-muted-foreground">
      <span>
        Page {page + 1} of {pageCount} · 50 per page
      </span>
      <span className="flex gap-2">
        <button
          type="button"
          disabled={page === 0}
          onClick={() => onPageChange(page - 1)}
          className="underline-offset-2 hover:underline disabled:opacity-50"
        >
          Previous
        </button>
        <button
          type="button"
          disabled={page === pageCount - 1}
          onClick={() => onPageChange(page + 1)}
          className="underline-offset-2 hover:underline disabled:opacity-50"
        >
          Next
        </button>
      </span>
    </div>
  );
}

export function AggregateContributorTable({
  row,
  showInputs = true,
  compact = false,
}: {
  row: AggregateResultRow;
  showInputs?: boolean;
  compact?: boolean;
}) {
  const [page, setPage] = useState(0);
  const showRaw =
    !compact || row.contributors.some((item) => item.input !== item.rawInput);
  const cellClass = compact ? "px-2 py-1" : "p-2";
  const numberClass = compact ? `${cellClass} text-right tabular-nums` : cellClass;
  const pageCount = Math.max(1, Math.ceil(row.contributors.length / PAGE_SIZE));
  const visibleContributors = row.contributors.slice(
    page * PAGE_SIZE,
    page * PAGE_SIZE + PAGE_SIZE
  );
  useEffect(() => setPage(0), [row]);
  return (
    <div className="space-y-2">
      <div className="overflow-auto rounded border border-border">
        <table
          className={`w-full text-left ${compact ? "text-xs" : "text-sm"}`}
        >
          <caption className="sr-only">Aggregate source contributors</caption>
          <thead className="bg-muted">
            <tr>
              <th className={numberClass} scope="col">
                {compact ? "Row ID" : "Source row ID"}
              </th>
              {showInputs && (
                <>
                  <th className={numberClass} scope="col">
                    Input
                  </th>
                  {showRaw && (
                    <th className={numberClass} scope="col">
                      Raw input
                    </th>
                  )}
                  {!compact && (
                    <th className={cellClass} scope="col">
                      Type
                    </th>
                  )}
                </>
              )}
              <th className={cellClass} scope="col">
                Used
              </th>
            </tr>
          </thead>
          <tbody>
            {visibleContributors.map((contributor) => (
              <tr key={contributor.sourceId} className="border-t border-border">
                <td className={numberClass}>{contributor.sourceId}</td>
                {showInputs && (
                  <>
                    <td className={numberClass}>
                      {displayAggregateValue(contributor.input)}
                    </td>
                    {showRaw && (
                      <td className={numberClass}>
                        {displayAggregateValue(contributor.rawInput)}
                      </td>
                    )}
                    {!compact && (
                      <td className={cellClass}>{typeof contributor.input}</td>
                    )}
                  </>
                )}
                <td className={cellClass}>
                  {contributor.included
                    ? "Yes"
                    : contributor.exclusionReason || "No"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pager page={page} pageCount={pageCount} onPageChange={setPage} />
    </div>
  );
}
