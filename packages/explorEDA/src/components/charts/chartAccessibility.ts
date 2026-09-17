import { ChartSettings } from "@/types/ChartTypes";
import { getChartDefinition } from "@/charts/registry";

const chartNames: Record<string, string> = {
  row: "Row chart",
  bar: "Bar chart",
  scatter: "Scatter plot",
  line: "Line chart",
  boxplot: "Box plot",
  "3d-scatter": "3D scatter plot",
  pivot: "Pivot table",
  "data-table": "Data table",
  summary: "Summary table",
  "color-legend": "Color legend",
  markdown: "Markdown note",
};

export function getChartTitle(settings: ChartSettings): string {
  if (
    settings.type === "color-legend" &&
    settings.fields.length === 1 &&
    (!settings.title.trim() || settings.title === "Color Legend")
  ) {
    return settings.fields[0]!;
  }
  return settings.title.trim() || getChartDefinition(settings.type).name;
}

export function getChartFields(settings: ChartSettings): string[] {
  const fields = (() => {
    switch (settings.type) {
      case "line":
        return [settings.xField, ...settings.seriesField];
      case "scatter":
        return [settings.xField, settings.yField, settings.colorField];
      case "3d-scatter":
        return [
          settings.xField,
          settings.yField,
          settings.zField,
          settings.colorField,
          settings.sizeField,
        ];
      case "pivot":
        return [
          ...settings.rowFields,
          settings.columnField,
          ...settings.valueFields.map((field) => field.field),
        ];
      case "data-table":
        return settings.columns.map((column) => column.field);
      case "color-legend":
        return settings.fields;
      default:
        return [settings.field, settings.colorField];
    }
  })();

  return Array.from(
    new Set(fields.filter((field): field is string => Boolean(field)))
  );
}

export function getChartSummary(settings: ChartSettings): string {
  const name = chartNames[settings.type] ?? "Chart";
  if (settings.type === "summary") {
    return `${name} of all data columns.`;
  }
  if (settings.type === "markdown") {
    return `${name}.`;
  }
  const fields = getChartFields(settings);
  return fields.length
    ? `${name} showing ${fields.join(", ")}.`
    : `${name} with no data fields selected.`;
}
