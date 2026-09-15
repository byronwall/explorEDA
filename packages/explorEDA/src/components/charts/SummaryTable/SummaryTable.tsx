import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useDataLayer } from "@/providers/DataLayerProvider";
import { Download, Loader2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { detectColumnType } from "../../SummaryTable/utils/dataTypeDetection";
import {
  estimateStatisticalSignificance,
  sampleData,
} from "../../SummaryTable/utils/samplingStrategy";
import { calculateColumnStatistics } from "../../SummaryTable/utils/statisticsCalculator";

import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { DataType } from "../../SummaryTable/utils/dataTypeDetection";
import { CompactSummaryTable } from "../../SummaryTable/components/CompactSummaryTable";
import { BaseChartProps } from "@/types/ChartTypes";
import type { SummaryTableSettings } from "./definition";

interface ColumnSummary {
  name: string;
  dataType: DataType | "unknown";
  totalCount: number;
  uniqueCount: number;
  nullCount: number;
  statistics?: NumericStatistics;
  categories?: CategoryStatistics;
}

interface NumericStatistics {
  min: number;
  max: number;
  mean: number;
  median: number;
  stdDev: number;
}

interface CategoryStatistics {
  topValues: Array<{ value: string; count: number }>;
  distribution: Record<string, number>;
}

type SortConfig = {
  column: keyof ColumnSummary | null;
  direction: "asc" | "desc";
};

// Add this function before the SummaryTable component
const exportToCSV = (summaries: ColumnSummary[]) => {
  // Create CSV header
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

  // Convert summaries to CSV rows
  const rows = summaries.map((summary) => {
    const stats = summary.statistics || ({} as NumericStatistics);
    const categories = summary.categories || ({} as CategoryStatistics);

    return [
      summary.name,
      summary.dataType,
      summary.totalCount,
      summary.uniqueCount,
      summary.nullCount,
      stats.min !== undefined ? stats.min.toFixed(2) : "",
      stats.max !== undefined ? stats.max.toFixed(2) : "",
      stats.mean !== undefined ? stats.mean.toFixed(2) : "",
      stats.median !== undefined ? stats.median.toFixed(2) : "",
      stats.stdDev !== undefined ? stats.stdDev.toFixed(2) : "",
      categories.topValues
        ? categories.topValues.map((v) => `${v.value}(${v.count})`).join("; ")
        : "",
    ];
  });

  // Combine headers and rows
  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
  ].join("\n");

  // Create and trigger download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", "summary_table.csv");
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
  const getColumnData = useDataLayer((state) => state.getColumnData);
  const getColumnNames = useDataLayer((state) => state.getColumnNames);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    column: null,
    direction: "asc",
  });
  const [useSampling, setUseSampling] = useState(true);
  const [sampleSize, setSampleSize] = useState(1000);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);

  // Progressive loading state
  const [processedColumns, setProcessedColumns] = useState<Set<string>>(
    new Set()
  );
  const [processingQueue, setProcessingQueue] = useState<string[]>([]);
  const [columnSummaryData, setColumnSummaryData] = useState<
    Record<string, ColumnSummary>
  >({});

  // Get total row count
  const totalRowCount = useCallback(() => {
    const firstColumn = getColumnNames()[0];
    return firstColumn ? Object.keys(getColumnData(firstColumn)).length : 0;
  }, [getColumnNames, getColumnData]);

  // Determine if sampling should be available
  const samplingAvailable = totalRowCount() > sampleSize;

  // Ensure sampling is disabled when not available
  useEffect(() => {
    if (!samplingAvailable && useSampling) {
      setUseSampling(false);
    }
  }, [samplingAvailable, useSampling]);

  const columnSummaries = useCallback(() => {
    const columnNames = getColumnNames();

    // Initialize processing queue if empty
    if (processingQueue.length === 0 && processedColumns.size === 0) {
      setProcessingQueue(columnNames);
    }

    return columnNames.map((columnName) => {
      // Return cached data if already processed
      const summary = columnSummaryData[columnName];
      if (summary) {
        return summary;
      }

      // Return placeholder data for unprocessed columns
      return {
        name: columnName,
        dataType: "unknown" as const,
        totalCount: 0,
        uniqueCount: 0,
        nullCount: 0,
      };
    });
  }, [getColumnNames, processingQueue, processedColumns, columnSummaryData]);

  // Process columns progressively
  const processNextColumn = useCallback(async () => {
    if (processingQueue.length === 0 || isProcessing) {
      return;
    }

    setIsProcessing(true);
    const columnName = processingQueue[0];
    if (!columnName) {
      return;
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 100));

      const columnData = getColumnData(columnName);
      const shouldUseSampling = useSampling && samplingAvailable;
      const sampledData = shouldUseSampling
        ? sampleData(columnData, { method: "random", sampleSize })
        : columnData;

      const dataType = detectColumnType(sampledData);
      const statistics = calculateColumnStatistics(sampledData, dataType);

      setColumnSummaryData((prev) => ({
        ...prev,
        [columnName]: {
          name: columnName,
          ...statistics,
        },
      }));

      setProcessedColumns((prev) => new Set([...prev, columnName]));
      setProcessingQueue((prev) => prev.slice(1));

      const progress =
        ((processedColumns.size + 1) /
          (processedColumns.size + processingQueue.length)) *
        100;
      setProcessingProgress(progress);

      if (processingQueue.length === 1) {
        toast.success("Processing Complete");
      }
    } catch {
      toast.error(`Error processing column ${columnName}`);
    } finally {
      setIsProcessing(false);
    }
  }, [
    processingQueue,
    isProcessing,
    processedColumns,
    getColumnData,
    useSampling,
    sampleSize,
    samplingAvailable,
  ]);

  // Process columns when queue changes
  useEffect(() => {
    if (processingQueue.length > 0) {
      processNextColumn();
    }
  }, [processingQueue, processNextColumn]);

  const handleSampleSizeChange = useCallback(
    (value: number[]) => {
      const nextSampleSize = value[0];
      if (nextSampleSize === undefined) {
        return;
      }
      setSampleSize(nextSampleSize);
      // Reset processing state to reanalyze with new sample size
      setProcessedColumns(new Set());
      setProcessingQueue(getColumnNames());
      setColumnSummaryData({});
      setProcessingProgress(0);
    },
    [getColumnNames]
  );

  const significance = useMemo(() => {
    if (!useSampling) {
      return null;
    }
    return estimateStatisticalSignificance(sampleSize, totalRowCount());
  }, [useSampling, sampleSize, totalRowCount]);

  const sortedSummaries = useMemo(() => {
    const summaries = columnSummaries();
    if (!sortConfig.column) {
      return summaries;
    }

    return [...summaries].sort((a, b) => {
      const column = sortConfig.column;
      if (!column) {
        return 0;
      }
      const aValue = a[column];
      const bValue = b[column];

      if (aValue === bValue) {
        return 0;
      }
      if (aValue == null) {
        return 1;
      }
      if (bValue == null) {
        return -1;
      }

      // Handle different types of values
      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortConfig.direction === "asc"
          ? aValue - bValue
          : bValue - aValue;
      }

      // Convert to strings for comparison
      const aStr = String(aValue);
      const bStr = String(bValue);
      return sortConfig.direction === "asc"
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });
  }, [columnSummaries, sortConfig]);

  const handleSort = (column: keyof ColumnSummary) => {
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
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              {samplingAvailable && (
                <Badge variant={useSampling ? "default" : "outline"}>
                  {useSampling ? "Sampling Enabled" : "Full Dataset"}
                </Badge>
              )}
              {!samplingAvailable && (
                <Badge variant="secondary">
                  Using Full Dataset ({totalRowCount()} rows)
                </Badge>
              )}

              {samplingAvailable && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setUseSampling(!useSampling);
                    setProcessedColumns(new Set());
                    setProcessingQueue(getColumnNames());
                    setProcessingProgress(0);
                  }}
                >
                  Toggle Sampling
                </Button>
              )}
            </div>

            {useSampling && (
              <div className="min-w-[16rem] flex-1 space-y-1.5">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                  <span className="text-sm text-muted-foreground">
                    Sample Size: {sampleSize}
                  </span>
                  {significance && (
                    <span className="text-sm text-muted-foreground">
                      Margin of Error:{" "}
                      {(significance.marginOfError * 100).toFixed(2)}%
                    </span>
                  )}
                </div>
                <Slider
                  value={[sampleSize]}
                  min={100}
                  max={10000}
                  step={100}
                  onValueChange={handleSampleSizeChange}
                />
              </div>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            className="shrink-0 border-border/60 text-muted-foreground hover:text-foreground"
            onClick={() => exportToCSV(sortedSummaries)}
            disabled={isProcessing || processingQueue.length > 0}
          >
            <Download className="mr-2 h-4 w-4" />
            Export to CSV
          </Button>
        </div>

        {(isProcessing || processingQueue.length > 0) && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-muted-foreground">
                Processing columns... {processedColumns.size} of{" "}
                {processedColumns.size + processingQueue.length}
              </span>
            </div>
            <Progress value={processingProgress} />
          </div>
        )}
      </div>

      <CompactSummaryTable
        data={sortedSummaries}
        onSort={handleSort}
        totalRows={totalRowCount()}
        settings={settings}
      />
    </div>
  );
}
