import { useDataLayer } from "@/providers/DataLayerProvider";
import type { ChartSettings } from "@/types/ChartTypes";
import { getChartFields } from "./charts/chartAccessibility";
import { NullValue } from "./NullValue";
import { isMissingValue } from "@/lib/numeric";

export function ChartDataPreview({
  settings,
  fill = false,
}: {
  settings: ChartSettings;
  /** Fills the height of its container instead of a fixed preview height. */
  fill?: boolean;
}) {
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
  const fields =
    settings.type === "metric-card"
      ? ["__ID", ...getChartFields(settings)]
      : getChartFields(settings);
  const columns = fields.map((field) => getColumnData(field));
  const labels = result
    ? [
        getFieldLabel(result.spec.groupField),
        result.spec.aggregation === "count"
          ? "Count"
          : getFieldLabel(result.spec.measureField ?? "Value"),
        "Source rows",
      ]
    : fields.map((field) =>
        field === "__ID" ? "Source row ID" : getFieldLabel(field)
      );
  const count = result?.rows.length ?? ids.length;
  const rows: React.ReactNode[][] = result
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
    : ids.slice(0, 100).map((id) =>
        fields.map((field, index) => {
          const value = columns[index]?.[id];
          return isMissingValue(value) ? <NullValue /> : format(field, value);
        })
      );

  return (
    <div className={fill ? "flex h-full min-h-0 flex-col gap-3" : "space-y-3"}>
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
        className={`${fill ? "min-h-0 flex-1" : "max-h-72"} overflow-auto overscroll-contain rounded border border-border`}
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
                  <td
                    key={index}
                    className="whitespace-nowrap px-3 py-2"
                    data-null={typeof value === "object" || undefined}
                  >
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
