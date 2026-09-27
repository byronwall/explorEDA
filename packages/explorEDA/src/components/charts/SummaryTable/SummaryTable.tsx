import { categoryLabel } from "@/lib/categories";
import type { BaseChartProps } from "@/types/ChartTypes";
import { Button } from "@/components/ui/button";
import { ActionTooltip } from "@/components/ui/tooltip";
import type { FieldProfile } from "@/lib/fieldProfiles";
import { useFilteredFieldProfiles } from "@/hooks/useFilteredFieldProfiles";
import { Download } from "lucide-react";
import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import {
  CompactSummaryTable,
  type SummarySort,
  type SummarySortColumn,
} from "../../SummaryTable/components/CompactSummaryTable";
import type { SummaryTableSettings } from "./definition";

const exportToCSV = (profiles: FieldProfile[]) => {
  const headers = [
    "Column",
    "Type",
    "Total",
    "Unique",
    "Missing",
    "Min",
    "Max",
    "Mean",
    "Median",
    "StdDev",
    "Top Values",
  ];
  const rows = profiles.map((profile) => [
    profile.name,
    profile.dataType,
    profile.totalCount,
    profile.uniqueCount,
    profile.nullCount,
    profile.statistics?.min ?? "",
    profile.statistics?.max ?? "",
    profile.statistics?.mean ?? "",
    profile.statistics?.median ?? "",
    profile.statistics?.stdDev ?? "",
    profile.categories?.topValues
      .map((value) => `${categoryLabel(value.value)}(${value.count})`)
      .join("; ") ?? "",
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
    ),
  ].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = "summary_table.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  toast.success("Summary table exported to CSV");
};

export function SummaryTable({
  height,
  settings,
  toolbarTarget,
}: BaseChartProps<SummaryTableSettings>) {
  const [sortConfig, setSortConfig] = useState<SummarySort>({
    column: null,
    direction: "asc",
  });

  const allProfiles = useFilteredFieldProfiles();

  const sortedProfiles = useMemo(() => {
    if (!sortConfig.column) {
      return allProfiles;
    }

    return [...allProfiles].sort((a, b) => {
      const aValue = a[sortConfig.column!];
      const bValue = b[sortConfig.column!];
      if (aValue === bValue) {
        return 0;
      }
      if (aValue == null) {
        return 1;
      }
      if (bValue == null) {
        return -1;
      }
      const result =
        typeof aValue === "number" && typeof bValue === "number"
          ? aValue - bValue
          : String(aValue).localeCompare(String(bValue));
      return sortConfig.direction === "asc" ? result : -result;
    });
  }, [allProfiles, sortConfig]);

  // Ascending, then descending, then back to source order.
  const handleSort = (column: SummarySortColumn) => {
    setSortConfig((current) => {
      if (current.column !== column) return { column, direction: "asc" };
      if (current.direction === "asc") return { column, direction: "desc" };
      return { column: null, direction: "asc" };
    });
  };

  const toolbar = (
    <div className="eda-table-toolbar-compact">
      <span className="text-muted-foreground tabular-nums">
        {(allProfiles[0]?.totalCount ?? 0).toLocaleString()} rows
      </span>
      <ActionTooltip content="Export summary as CSV">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Export summary as CSV"
          onClick={() => exportToCSV(sortedProfiles)}
        >
          <Download className="h-3.5 w-3.5" />
        </Button>
      </ActionTooltip>
    </div>
  );

  return (
    <div className="eda-summary-view overflow-auto" style={{ height }}>
      {toolbarTarget === undefined
        ? toolbar
        : toolbarTarget && createPortal(toolbar, toolbarTarget)}
      <CompactSummaryTable
        data={sortedProfiles}
        onSort={handleSort}
        sort={sortConfig}
        settings={settings}
      />
    </div>
  );
}
