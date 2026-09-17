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

export function ChartCreationButtons() {
  const { createChart } = useCreateCharts();
  const chartDefinitions = chartRegistry
    .getAll()
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add chart
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {chartDefinitions.map((chartDef) => {
          const Icon = chartDef.icon;
          return (
            <DropdownMenuItem
              key={chartDef.type}
              onClick={() => createChart(chartDef.type, "")}
              className="flex items-center gap-2"
            >
              <Icon className="h-4 w-4" />
              {chartDef.name}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
