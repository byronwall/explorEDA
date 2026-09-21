import { useDataLayer } from "@/providers/DataLayerProvider";
import type { ChartSettings } from "@/types/ChartTypes";
import { getChartFields } from "./charts/chartAccessibility";

export function ChartDataPreview({ settings }: { settings: ChartSettings }) {
  const crossfilter = useDataLayer((s) => s.crossfilterWrapper);
  useDataLayer((s) => s.liveItems);
  const ids = crossfilter.getFilteredRowIds();
  const getColumnData = useDataLayer((s) => s.getColumnData);
  const getFieldLabel = useDataLayer((s) => s.getFieldLabel);
  const format = useDataLayer((s) => s.formatFieldValue);
  const getAggregateResult = useDataLayer((s) => s.getAggregateResult);
  const result =
    "aggregateId" in settings && settings.aggregateId
      ? getAggregateResult(settings.aggregateId)
      : undefined;
  const fields = getChartFields(settings);
  const columns = fields.map((field) => getColumnData(field));
  const labels = result
    ? [
        getFieldLabel(result.spec.groupField),
        result.spec.aggregation === "count"
          ? "Count"
          : getFieldLabel(result.spec.measureField ?? "Value"),
        "Source rows",
      ]
    : fields.map(getFieldLabel);
  const count = result?.rows.length ?? ids.length;
  const rows = result
    ? result.rows
        .slice(0, 100)
        .map((row) => [
          format(result.spec.groupField, row.groupValue),
          result.spec.aggregation === "count"
            ? String(row.value)
            : format(
                result.spec.measureField ?? result.spec.groupField,
                row.value
              ),
          String(row.rowCount),
        ])
    : ids
        .slice(0, 100)
        .map((id) =>
          fields.map((field, index) => format(field, columns[index]?.[id]))
        );

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold">Chart data</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          {count.toLocaleString()} {result ? "groups" : "source rows"} · current
          chart filters
          {count > 100 && " · first 100 shown"}
        </p>
      </div>
      <div
        tabIndex={0}
        aria-label="Chart data rows"
        className="max-h-72 overflow-auto overscroll-contain rounded border border-border"
      >
        <table className="w-full text-left text-xs tabular-nums">
          <thead className="sticky top-0 bg-muted">
            <tr>
              {labels.map((label, index) => (
                <th
                  key={index}
                  className="whitespace-nowrap px-3 py-2 font-medium"
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index} className="border-t border-border">
                {row.map((value, index) => (
                  <td key={index} className="whitespace-nowrap px-3 py-2">
                    {value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length && (
          <p className="p-4 text-muted-foreground">
            No rows match the current filters.
          </p>
        )}
      </div>
    </div>
  );
}
