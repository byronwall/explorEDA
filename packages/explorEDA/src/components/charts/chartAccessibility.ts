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

export function getChartTitle(
  settings: ChartSettings,
  getFieldLabel: (field: string) => string = (field) => field
): string {
  const title = settings.title.trim();
  if (
    settings.type === "color-legend" &&
    settings.fields.length === 1 &&
    (!title || settings.title === "Color Legend")
  ) {
    return getFieldLabel(settings.fields[0]!);
  }
  if (title) {
    return title;
  }

  const field =
    settings.type === "bar" ||
    settings.type === "row" ||
    settings.type === "boxplot"
      ? settings.field
      : settings.type === "scatter" || settings.type === "3d-scatter"
        ? settings.yField
        : settings.type === "line" && settings.seriesField.length === 1
          ? settings.seriesField[0]
          : undefined;
  if (!field) {
    return getChartDefinition(settings.type).name;
  }
  const label = field === "__ID" ? "Row sequence" : getFieldLabel(field);
  if (settings.type === "bar") {
    return `Distribution of ${label}`;
  }
  if (settings.type === "row") {
    return `Rows by ${label}`;
  }
  return `${getChartDefinition(settings.type).name} · ${label}`;
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

export function getChartAxisFields(settings: ChartSettings): {
  x?: string;
  y?: string;
} {
  switch (settings.type) {
    case "bar":
      return { x: settings.field };
    case "row":
      return { y: settings.field };
    case "scatter":
      return { x: settings.xField, y: settings.yField };
    case "line":
      return {
        x: settings.xField,
        y:
          settings.seriesField.length === 1
            ? settings.seriesField[0]
            : undefined,
      };
    case "boxplot":
      return { y: settings.field };
    case "3d-scatter":
      return { x: settings.xField, y: settings.yField };
    default:
      return {};
  }
}

export function getChartAxisLabel(
  field: string | undefined,
  local: string,
  getFieldLabel: (field: string) => string = (value) => value
): string {
  return (
    local ||
    (field === "__ID" ? "Row sequence" : field ? getFieldLabel(field) : "")
  );
}

export function getChartSummary(
  settings: ChartSettings,
  getFieldLabel: (field: string) => string = (field) => field
): string {
  const name = chartNames[settings.type] ?? "Chart";
  if (settings.type === "summary") {
    return `${name} of all data columns.`;
  }
  if (settings.type === "markdown") {
    return `${name}.`;
  }
  const fields = getChartFields(settings);
  return fields.length
    ? `${name} showing ${fields.map(getFieldLabel).join(", ")}.`
    : `${name} with no data fields selected.`;
}
