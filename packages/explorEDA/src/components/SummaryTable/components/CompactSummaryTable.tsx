import { CalculatedFieldBadge } from "@/components/calculations/CalculatedFieldBadge";
import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowUp, ArrowUpDown, Settings2 } from "lucide-react";
import { FieldMetadata } from "@/components/FieldMetadata";
import { ChartActions } from "./ChartActions";
import { FieldInspector } from "./FieldInspector";
import { summarizeField } from "./FieldDistribution";
import { useDataLayer } from "@/providers/DataLayerProvider";
import type { FieldProfile } from "@/lib/fieldProfiles";
import type { datum } from "@/types/ChartTypes";
import { cn } from "@/lib/utils";
import { getChartSummary } from "../../charts/chartAccessibility";
import type { SummaryTableSettings } from "../../charts/SummaryTable/definition";

export type SummarySortColumn = "name" | "uniqueCount" | "nullCount";
export type SummarySort = {
  column: SummarySortColumn | null;
  direction: "asc" | "desc";
};

interface CompactSummaryTableProps {
  data: FieldProfile[];
  onSort: (column: SummarySortColumn) => void;
  sort?: SummarySort;
  settings: SummaryTableSettings;
}

function SortHeader({
  column,
  label,
  sort,
  onSort,
  className,
}: {
  column: SummarySortColumn;
  label: string;
  sort?: SummarySort;
  onSort: (column: SummarySortColumn) => void;
  className?: string;
}) {
  const active = sort?.column === column;
  const Icon = !active
    ? ArrowUpDown
    : sort.direction === "asc"
      ? ArrowUp
      : ArrowDown;
  return (
    <th
      scope="col"
      className={className}
      aria-sort={
        active
          ? sort.direction === "asc"
            ? "ascending"
            : "descending"
          : "none"
      }
    >
      <button
        type="button"
        className="eda-summary-sort"
        data-active={active || undefined}
        onClick={() => onSort(column)}
      >
        <span>{label}</span>
        <Icon aria-hidden="true" />
      </button>
    </th>
  );
}

export function CompactSummaryTable({
  data,
  onSort,
  sort,
  settings,
}: CompactSummaryTableProps) {
  const formatValue = useDataLayer((state) => state.formatFieldValue);
  const getFieldLabel = useDataLayer((state) => state.getFieldLabel);
  const label = getFieldLabel ?? ((field: string) => field);
  return (
    <table className="eda-summary-table">
      <caption className="sr-only">{getChartSummary(settings)}</caption>
      <colgroup>
        <col className="eda-summary-col-field" />
        <col className="eda-summary-col-count" />
        <col className="eda-summary-col-count" />
        <col />
        <col className="eda-summary-col-actions" />
      </colgroup>
      <thead>
        <tr>
          <SortHeader column="name" label="Field" sort={sort} onSort={onSort} />
          <SortHeader
            column="uniqueCount"
            label="Distinct"
            sort={sort}
            onSort={onSort}
            className="eda-summary-num"
          />
          <SortHeader
            column="nullCount"
            label="Missing"
            sort={sort}
            onSort={onSort}
            className="eda-summary-num"
          />
          <th scope="col">Values</th>
          <th scope="col">
            <span className="sr-only">Actions</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {data.map((profile) => {
          const fieldLabel = label(profile.name);
          const summary = summarizeField(profile, (value) =>
            formatValue(profile.name, value as datum)
          );
          const missingShare =
            profile.totalCount > 0 ? profile.nullCount / profile.totalCount : 0;
          return (
            <tr key={profile.name}>
              <th scope="row" className="eda-summary-field">
                <span className="flex min-w-0 items-center gap-1.5">
                  <FieldMetadata
                    profile={profile}
                    label={fieldLabel}
                    compact
                    showDetail={false}
                    className="min-w-0"
                  />
                  <CalculatedFieldBadge field={profile.name} />
                </span>
              </th>
              <td className="eda-summary-num">
                {profile.uniqueCount.toLocaleString()}
              </td>
              <td
                className={cn(
                  "eda-summary-num",
                  profile.nullCount > 0 && "eda-summary-missing"
                )}
              >
                {profile.nullCount > 0 ? (
                  <>
                    {profile.nullCount.toLocaleString()}
                    <span className="eda-summary-share-label">
                      {missingShare < 0.01
                        ? "<1%"
                        : `${Math.round(missingShare * 100)}%`}
                    </span>
                  </>
                ) : (
                  <>
                    <span aria-hidden="true" className="text-muted-foreground">
                      –
                    </span>
                    <span className="sr-only">None</span>
                  </>
                )}
              </td>
              <td className="eda-summary-values">
                {summary ? (
                  <div className="eda-summary-profile">
                    {summary.graphic}
                    <span className="eda-summary-reading">
                      <span className="sr-only">{summary.description}</span>
                      <span aria-hidden="true" className="eda-summary-primary">
                        {summary.primary}
                      </span>
                      {summary.secondary && (
                        <span
                          aria-hidden="true"
                          className="eda-summary-secondary"
                        >
                          {summary.secondary}
                        </span>
                      )}
                    </span>
                  </div>
                ) : (
                  <span className="text-muted-foreground">
                    {profile.totalCount === 0
                      ? "No rows in the current filter"
                      : "No values"}
                  </span>
                )}
              </td>
              <td className="eda-summary-actions-cell">
                <div className="eda-summary-actions">
                  <FieldInspector field={profile.name}>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Inspect ${fieldLabel}`}
                    >
                      <Settings2 />
                    </Button>
                  </FieldInspector>
                  <ChartActions
                    columnName={profile.name}
                    dataType={profile.dataType}
                  />
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
