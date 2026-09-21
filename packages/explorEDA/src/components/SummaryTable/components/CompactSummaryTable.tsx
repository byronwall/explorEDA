import { CalculatedFieldBadge } from "@/components/calculations/CalculatedFieldBadge";
import { categoryLabel } from "@/lib/categories";
import { Button } from "@/components/ui/button";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowUpDown, AlertCircle, Settings2 } from "lucide-react";
import { StatBadge } from "./StatBadge";
import { FieldMetadata } from "@/components/FieldMetadata";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ChartActions } from "./ChartActions";
import { FieldInspector } from "./FieldInspector";
import { useDataLayer } from "@/providers/DataLayerProvider";
import type { FieldProfile } from "@/lib/fieldProfiles";
import { getChartSummary } from "../../charts/chartAccessibility";
import type { SummaryTableSettings } from "../../charts/SummaryTable/definition";

interface CompactSummaryTableProps {
  data: FieldProfile[];
  onSort: (column: keyof FieldProfile) => void;
  settings: SummaryTableSettings;
}

export function CompactSummaryTable({
  data,
  onSort,
  settings,
}: CompactSummaryTableProps) {
  const formatValue = useDataLayer((state) => state.formatFieldValue);
  const getFieldLabel = useDataLayer((state) => state.getFieldLabel);
  const label = getFieldLabel ?? ((field: string) => field);
  return (
    <table className="eda-summary-table w-full border-collapse text-xs">
      <caption className="sr-only">{getChartSummary(settings)}</caption>
      <TableHeader className="[&_tr]:border-border/40">
        <TableRow>
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
          <TableHead className="w-16 text-right">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <span>Distinct</span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Number of distinct values</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </TableHead>
          <TableHead>Stats</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody className="[&_tr]:border-border/30">
        {data.map((summary) => (
          <TableRow key={summary.name}>
            <TableCell className="min-w-0">
              <div className="flex min-w-0 items-center gap-2">
                <FieldMetadata
                  profile={summary}
                  label={label(summary.name)}
                  compact
                  showDetail={false}
                  className="min-w-0 flex-1"
                />
                <CalculatedFieldBadge field={summary.name} />
                {summary.nullCount > 0 && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span
                          className="shrink-0"
                          aria-label={`${summary.name}: ${summary.nullCount} null values`}
                        >
                          <AlertCircle className="h-4 w-4 text-yellow-500" />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{summary.nullCount} null values</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {summary.uniqueCount}
            </TableCell>
            <TableCell className="relative">
              <div className="flex min-w-0 flex-wrap gap-2">
                {summary.statistics && (
                  <>
                    <StatBadge
                      fieldLabel={label(summary.name)}
                      type="min"
                      value={formatValue(summary.name, summary.statistics.min)}
                    />
                    <StatBadge
                      fieldLabel={label(summary.name)}
                      type="max"
                      value={formatValue(summary.name, summary.statistics.max)}
                    />
                  </>
                )}
                {summary.categories && summary.categories.topValues[0] && (
                  <StatBadge
                    fieldLabel={label(summary.name)}
                    type="common"
                    value={categoryLabel(summary.categories.topValues[0].value)}
                    count={summary.categories.topValues[0].count}
                  />
                )}
              </div>
              <div className="eda-summary-actions">
                <FieldInspector field={summary.name}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    aria-label={`Inspect ${summary.name}`}
                  >
                    <Settings2 className="h-4 w-4" />
                  </Button>
                </FieldInspector>
                <ChartActions
                  columnName={summary.name}
                  dataType={summary.dataType}
                />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </table>
  );
}
