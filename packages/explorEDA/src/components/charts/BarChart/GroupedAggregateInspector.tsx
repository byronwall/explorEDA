import {
  displayAggregateValue,
  type AggregateResult,
  type AggregateResultRow,
} from "@/lib/aggregates";
import type { datum } from "@/types/ChartTypes";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEffect, useMemo, useState } from "react";

const PAGE_SIZE = 50;

interface AggregateResultTableProps {
  result: AggregateResult;
  selectedRowId?: string;
  onSelect: (row: AggregateResultRow) => void;
  formatValue?: (value: datum) => string;
  getFieldLabel?: (field: string) => string;
  formatGroupValue?: (value: datum) => string;
}

export function AggregateResultTable({
  result,
  selectedRowId,
  onSelect,
  formatValue = displayAggregateValue,
  getFieldLabel = (field) => field,
  formatGroupValue = displayAggregateValue,
}: AggregateResultTableProps) {
  const [page, setPage] = useState(0);
  const pageCount = Math.max(1, Math.ceil(result.rows.length / PAGE_SIZE));
  const visibleRows = result.rows.slice(
    page * PAGE_SIZE,
    page * PAGE_SIZE + PAGE_SIZE
  );

  useEffect(() => {
    setPage(0);
  }, [result]);

  return (
    <div className="space-y-2">
      <div className="max-h-[min(45vh,24rem)] overflow-auto rounded border">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Grouped aggregate result rows</caption>
          <thead className="bg-muted">
            <tr>
              <th className="p-2" scope="col">
                {getFieldLabel(result.spec.groupField)}
              </th>
              <th className="p-2 text-right" scope="col">
                {result.spec.aggregation === "count"
                  ? "Count"
                  : getFieldLabel(result.spec.measureField ?? "Measure")}
              </th>
              <th className="p-2 text-right" scope="col">
                Rows
              </th>
              <th className="p-2" scope="col">
                Source IDs
              </th>
              <th className="p-2" scope="col">
                <span className="sr-only">Inspect</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row) => (
              <tr
                key={row.id}
                className={`border-t ${row.id === selectedRowId ? "bg-muted/60" : ""}`}
              >
                <th className="p-2 font-medium" scope="row">
                  {formatGroupValue(row.groupValue)}
                </th>
                <td className="p-2 text-right tabular-nums">
                  {row.value === undefined
                    ? "No valid numbers"
                    : formatValue(row.value)}
                </td>
                <td className="p-2 text-right tabular-nums">{row.rowCount}</td>
                <td className="p-2">
                  {row.contributors.map((item) => item.sourceId).join(", ")}
                </td>
                <td className="p-2 text-right">
                  <button
                    type="button"
                    className="underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    onClick={() => onSelect(row)}
                  >
                    Inspect
                  </button>
                </td>
              </tr>
            ))}
            {visibleRows.length === 0 && (
              <tr>
                <td colSpan={5} className="p-3 text-muted-foreground">
                  No grouped rows match the current source scope.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Pager
        page={page}
        pageCount={pageCount}
        onPageChange={setPage}
        label="result rows"
      />
    </div>
  );
}

interface PagerProps {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  label: string;
}

function Pager({ page, pageCount, onPageChange, label }: PagerProps) {
  if (pageCount <= 1) {
    return null;
  }
  return (
    <div className="flex items-center justify-between text-xs text-muted-foreground">
      <span>
        Page {page + 1} of {pageCount} · {label} (50 per page)
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

interface AggregateContributorTableProps {
  row: AggregateResultRow;
}

export function AggregateContributorTable({
  row,
}: AggregateContributorTableProps) {
  const [page, setPage] = useState(0);
  const pageCount = Math.max(1, Math.ceil(row.contributors.length / PAGE_SIZE));
  const visibleContributors = row.contributors.slice(
    page * PAGE_SIZE,
    page * PAGE_SIZE + PAGE_SIZE
  );

  useEffect(() => {
    setPage(0);
  }, [row]);

  return (
    <div className="space-y-2">
      <div className="overflow-auto rounded border">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Aggregate source contributors</caption>
          <thead className="bg-muted">
            <tr>
              <th className="p-2" scope="col">
                Source row ID
              </th>
              <th className="p-2" scope="col">
                Input
              </th>
              <th className="p-2" scope="col">
                Raw input
              </th>
              <th className="p-2" scope="col">
                Type
              </th>
              <th className="p-2" scope="col">
                Used
              </th>
            </tr>
          </thead>
          <tbody>
            {visibleContributors.map((contributor) => (
              <tr key={contributor.sourceId} className="border-t">
                <td className="p-2">{contributor.sourceId}</td>
                <td className="p-2">
                  {displayAggregateValue(contributor.input)}
                </td>
                <td className="p-2">
                  {displayAggregateValue(contributor.rawInput)}
                </td>
                <td className="p-2">{typeof contributor.input}</td>
                <td className="p-2">
                  {contributor.included
                    ? "Yes"
                    : contributor.exclusionReason || "No"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pager
        page={page}
        pageCount={pageCount}
        onPageChange={setPage}
        label="contributors"
      />
    </div>
  );
}

interface GroupedAggregateInspectorProps {
  result: AggregateResult;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedRowId?: string;
  scopeDescription: string;
  formatValue?: (value: datum) => string;
  getFieldLabel?: (field: string) => string;
  formatGroupValue?: (value: datum) => string;
}

export function GroupedAggregateInspector({
  result,
  open,
  onOpenChange,
  selectedRowId,
  scopeDescription,
  formatValue,
  getFieldLabel,
  formatGroupValue,
}: GroupedAggregateInspectorProps) {
  const selected = useMemo(
    () => result.rows.find((row) => row.id === selectedRowId) ?? result.rows[0],
    [result.rows, selectedRowId]
  );
  const [selectedId, setSelectedId] = useState(selected?.id);

  useEffect(() => {
    setSelectedId(selected?.id);
  }, [selected?.id]);

  const selectedRow =
    result.rows.find((row) => row.id === selectedId) ?? selected;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Inspect {result.spec.name}</DialogTitle>
          <DialogDescription>
            {scopeDescription}. Grouped by{" "}
            {getFieldLabel?.(result.spec.groupField) ?? result.spec.groupField};
            the result uses {result.spec.aggregation}
            {result.spec.measureField
              ? ` of ${getFieldLabel?.(result.spec.measureField) ?? result.spec.measureField}`
              : ""}
            .
          </DialogDescription>
        </DialogHeader>
        <AggregateResultTable
          result={result}
          selectedRowId={selectedRow?.id}
          onSelect={(row) => setSelectedId(row.id)}
          formatValue={formatValue}
          getFieldLabel={getFieldLabel}
          formatGroupValue={formatGroupValue}
        />
        {selectedRow && (
          <section className="space-y-2">
            <h3 className="text-sm font-semibold">
              {selectedRow.groupLabel} contributors
            </h3>
            <p className="text-xs text-muted-foreground">
              {selectedRow.contributors.filter((item) => item.included).length}{" "}
              of {selectedRow.contributors.length} source rows contribute to the
              result.
            </p>
            <p className="font-mono text-xs">
              Exact result: {displayAggregateValue(selectedRow.value)}
            </p>
            <AggregateContributorTable row={selectedRow} />
          </section>
        )}
      </DialogContent>
    </Dialog>
  );
}
