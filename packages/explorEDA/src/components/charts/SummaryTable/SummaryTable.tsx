import { BaseChartProps, datum } from "@/types/ChartTypes";
import { Button } from "@/components/ui/button";
import {
  buildFieldProfile,
  emptyFieldProfile,
  FieldProfile,
} from "@/lib/fieldProfiles";
import { useDataLayer } from "@/providers/DataLayerProvider";
import { Download } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { CompactSummaryTable } from "../../SummaryTable/components/CompactSummaryTable";
import type { SummaryTableSettings } from "./definition";

type SortConfig = {
  column: keyof FieldProfile | null;
  direction: "asc" | "desc";
};

const exportToCSV = (profiles: FieldProfile[]) => {
  const headers = [
    "Column",
    "Type",
    "Total",
    "Unique",
    "Null",
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
      .map((value) => `${value.value}(${value.count})`)
      .join("; ") ?? "",
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
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
}: BaseChartProps<SummaryTableSettings>) {
  const sourceProfiles = useDataLayer((state) => state.fieldProfiles);
  const data = useDataLayer((state) => state.data);
  const calculations = useDataLayer((state) => state.calculations);
  const getColumnData = useDataLayer((state) => state.getColumnData);
  const crossfilterWrapper = useDataLayer((state) => state.crossfilterWrapper);
  const chartState = useDataLayer((state) => state.charts);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    column: null,
    direction: "asc",
  });

  const allProfiles = useMemo(() => {
    const filteredIds = new Set(
      chartState.length
        ? crossfilterWrapper.getFilteredRowIds()
        : data.map((row) => row.__ID)
    );
    const filteredRows = data.filter((row) => filteredIds.has(row.__ID));
    const profileColumn = (name: string) =>
      Object.fromEntries(
        filteredRows.map((row) => [row.__ID, row[name]])
      ) as Record<number, datum>;

    const source = sourceProfiles.map((profile) =>
      filteredRows.length === 0
        ? emptyFieldProfile(profile)
        : buildFieldProfile(profile.name, profileColumn(profile.name))
    );
    const calculated = calculations.map((calculation) => {
      const allColumnData = getColumnData(calculation.resultColumnName);
      const filteredColumnData = Object.fromEntries(
        filteredRows.map((row) => [row.__ID, allColumnData[row.__ID]])
      ) as Record<number, datum>;
      const profile = buildFieldProfile(
        calculation.resultColumnName,
        allColumnData
      );
      return filteredRows.length === 0
        ? emptyFieldProfile(profile)
        : buildFieldProfile(calculation.resultColumnName, filteredColumnData);
    });

    return [...source, ...calculated];
  }, [
    sourceProfiles,
    data,
    calculations,
    getColumnData,
    crossfilterWrapper,
    chartState,
  ]);

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

  const handleSort = (column: keyof FieldProfile) => {
    setSortConfig((current) => ({
      column,
      direction:
        current.column === column && current.direction === "asc"
          ? "desc"
          : "asc",
    }));
  };

  return (
    <div className="space-y-4 overflow-auto" style={{ height }}>
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={() => exportToCSV(sortedProfiles)}
        >
          <Download className="mr-2 h-4 w-4" />
          Export to CSV
        </Button>
      </div>
      <CompactSummaryTable
        data={sortedProfiles}
        onSort={handleSort}
        totalRows={allProfiles[0]?.totalCount ?? 0}
        settings={settings}
      />
    </div>
  );
}
