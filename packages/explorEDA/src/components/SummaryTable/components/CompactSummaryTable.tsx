import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowUpDown, AlertCircle } from "lucide-react";
import { DataTypeIcon } from "./DataTypeIcon";
import { StatBadge } from "./StatBadge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ChartActions } from "./ChartActions";
import { DataType } from "../utils/dataTypeDetection";
import { getChartSummary } from "../../charts/chartAccessibility";
import type { SummaryTableSettings } from "../../charts/SummaryTable/definition";

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

interface CompactSummaryTableProps {
  data: ColumnSummary[];
  onSort: (column: keyof ColumnSummary) => void;
  totalRows: number;
  settings: SummaryTableSettings;
}

export function CompactSummaryTable({
  data,
  onSort,
  totalRows,
  settings,
}: CompactSummaryTableProps) {
  return (
    <div className="rounded-md border">
      <div className="flex items-center justify-between border-b px-4 py-2">
        <span className="text-sm text-muted-foreground">
          Rows available: {totalRows.toLocaleString()}
        </span>
      </div>
      <Table>
        <caption className="sr-only">{getChartSummary(settings)}</caption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-24"></TableHead>
            <TableHead>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  onClick={() => onSort("name")}
                  className="h-8 text-left font-medium"
                >
                  Column
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </TableHead>
            <TableHead className="w-16">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <span>Count</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Unique values / Total values</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </TableHead>
            <TableHead>Stats</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((summary) => (
            <TableRow key={summary.name}>
              <TableCell>
                <div className="flex gap-1">
                  <ChartActions
                    columnName={summary.name}
                    dataType={
                      summary.dataType === "unknown"
                        ? "categorical"
                        : summary.dataType
                    }
                  />
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <DataTypeIcon type={summary.dataType} />
                  <span className="font-semibold">{summary.name}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <span>{summary.uniqueCount}</span>
                  {summary.nullCount > 0 && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <AlertCircle className="h-4 w-4 text-yellow-500" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{summary.nullCount} null values</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  {summary.statistics && (
                    <>
                      <StatBadge type="min" value={summary.statistics.min} />
                      <StatBadge type="max" value={summary.statistics.max} />
                    </>
                  )}
                  {summary.categories && summary.categories.topValues[0] && (
                    <StatBadge
                      type="common"
                      value={summary.categories.topValues[0].value}
                      count={summary.categories.topValues[0].count}
                    />
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
