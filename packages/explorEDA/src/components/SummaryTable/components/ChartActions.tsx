import { Button } from "@/components/ui/button";
import { ActionTooltip } from "@/components/ui/tooltip";
import { BarChart, ScatterChart, Table2, type LucideIcon } from "lucide-react";
import { useCreateCharts } from "@/hooks/useCreateCharts";
import type { FieldProfile } from "@/lib/fieldProfiles";

export type FieldChartType = "row" | "bar" | "scatter" | "pivot";

export type FieldChartOption = {
  type: FieldChartType;
  /** Menu and tooltip text, such as "Create bar chart". */
  label: string;
  /** Short name of the chart type, such as "Bar chart". */
  name: string;
  icon: LucideIcon;
  iconClassName?: string;
};

const options: Record<FieldChartType, FieldChartOption> = {
  row: {
    type: "row",
    label: "Create row chart",
    name: "Row chart",
    icon: BarChart,
    iconClassName: "rotate-90",
  },
  bar: {
    type: "bar",
    label: "Create bar chart",
    name: "Bar chart",
    icon: BarChart,
  },
  scatter: {
    type: "scatter",
    label: "Create scatter plot",
    name: "Scatter plot",
    icon: ScatterChart,
  },
  pivot: {
    type: "pivot",
    label: "Create pivot table",
    name: "Pivot table",
    icon: Table2,
  },
};

/** The charts a single field can start, in the order they are offered. */
export function chartOptionsForField(
  dataType: FieldProfile["dataType"]
): FieldChartOption[] {
  switch (dataType) {
    case "numeric":
      return [options.bar, options.scatter];
    case "categorical":
      return [options.row, options.pivot];
    case "datetime":
      return [options.pivot];
    case "boolean":
      return [options.row];
  }
}

interface ChartActionsProps {
  columnName: string;
  dataType: FieldProfile["dataType"];
}

export function ChartActions({ columnName, dataType }: ChartActionsProps) {
  const { createChart } = useCreateCharts();

  return (
    <div className="flex gap-1">
      {chartOptionsForField(dataType).map((option) => (
        <ActionTooltip key={option.type} content={option.label}>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            aria-label={`${option.label} for ${columnName}`}
            onClick={() => createChart(option.type, columnName)}
          >
            <option.icon className={`h-4 w-4 ${option.iconClassName ?? ""}`} />
          </Button>
        </ActionTooltip>
      ))}
    </div>
  );
}
