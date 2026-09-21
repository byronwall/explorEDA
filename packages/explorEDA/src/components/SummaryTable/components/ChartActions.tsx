import { Button } from "@/components/ui/button";
import { ActionTooltip } from "@/components/ui/tooltip";
import { BarChart, ScatterChart, Table2 } from "lucide-react";
import { useCreateCharts } from "@/hooks/useCreateCharts";

interface ChartActionsProps {
  columnName: string;
  dataType: "numeric" | "categorical" | "datetime" | "boolean";
}

export function ChartActions({ columnName, dataType }: ChartActionsProps) {
  const { createChart } = useCreateCharts();

  return (
    <div className="flex gap-1">
      {dataType === "categorical" && (
        <ActionTooltip content="Create row chart">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            aria-label={`Create row chart for ${columnName}`}
            onClick={() => createChart("row", columnName)}
          >
            <BarChart className="h-4 w-4 rotate-90" />
          </Button>
        </ActionTooltip>
      )}

      {dataType === "numeric" && (
        <>
          <ActionTooltip content="Create bar chart">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              aria-label={`Create bar chart for ${columnName}`}
              onClick={() => createChart("bar", columnName)}
            >
              <BarChart className="h-4 w-4" />
            </Button>
          </ActionTooltip>

          <ActionTooltip content="Create scatter plot">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              aria-label={`Create scatter chart for ${columnName}`}
              onClick={() => createChart("scatter", columnName)}
            >
              <ScatterChart className="h-4 w-4" />
            </Button>
          </ActionTooltip>
        </>
      )}

      {(dataType === "categorical" || dataType === "datetime") && (
        <ActionTooltip content="Create pivot table">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            aria-label={`Create pivot table for ${columnName}`}
            onClick={() => createChart("pivot", columnName)}
          >
            <Table2 className="h-4 w-4" />
          </Button>
        </ActionTooltip>
      )}
    </div>
  );
}
