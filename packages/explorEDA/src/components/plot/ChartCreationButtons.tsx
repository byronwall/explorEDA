import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus } from "lucide-react";
import { useCreateCharts } from "@/hooks/useCreateCharts";
import { chartRegistry } from "@/charts/registry";
import type { ChartType } from "@/types/ChartTypes";
import { useChartDraft } from "./ChartDraftContext";

/** The chart type choices shared by the toolbar and the grid's add control. */
export function ChartTypeMenuItems({
  onSelect,
}: {
  onSelect: (type: ChartType) => void;
}) {
  const chartDefinitions = chartRegistry
    .getAll()
    .sort((a, b) => a.name.localeCompare(b.name));

  return chartDefinitions.map((chartDef) => {
    const Icon = chartDef.icon;
    return (
      <DropdownMenuItem
        key={chartDef.type}
        onClick={() => onSelect(chartDef.type)}
        className="flex items-center gap-2"
      >
        <Icon className="h-4 w-4" />
        {chartDef.name}
      </DropdownMenuItem>
    );
  });
}

export function ChartCreationButtons() {
  const { createChart } = useCreateCharts();
  const chartDraft = useChartDraft();
  // Inside a workspace, Add chart opens a dialog that previews the chart
  // before the user places it.
  if (chartDraft) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="eda-toolbar-add flex items-center gap-2"
        aria-label="Add chart"
        aria-haspopup="dialog"
        tooltip="Add chart: pick a type and fields, preview it, then place it on the grid"
        onClick={() => chartDraft.openDraft()}
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
        <span className="eda-toolbar-add-label">Add chart</span>
      </Button>
    );
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add chart
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <ChartTypeMenuItems onSelect={(type) => createChart(type, "")} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
