import { Button } from "@/components/ui/button";
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
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          aria-label={`Create row chart for ${columnName}`}
          onClick={() => createChart("row", columnName)}
        >
          <BarChart className="h-4 w-4 rotate-90" />
        </Button>
      )}

      {dataType === "numeric" && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            aria-label={`Create bar chart for ${columnName}`}
            onClick={() => createChart("bar", columnName)}
          >
            <BarChart className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            aria-label={`Create scatter chart for ${columnName}`}
            onClick={() => createChart("scatter", columnName)}
          >
            <ScatterChart className="h-4 w-4" />
          </Button>
        </>
      )}

      {(dataType === "categorical" || dataType === "datetime") && (
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          aria-label={`Create pivot table for ${columnName}`}
          onClick={() => createChart("pivot", columnName)}
        >
          <Table2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
