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
  sankey: "Sankey diagram",
  "parallel-coordinates": "Parallel coordinates",
  calendar: "Calendar heatmap",
  heatmap: "Heatmap",
  ecdf: "Cumulative distribution",
  "metric-card": "Metric card",
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

  if (settings.type === "line" && settings.time) {
    const metric =
      settings.time.aggregation === "count"
        ? "Rows"
        : `${settings.time.aggregation === "sum" ? "Sum" : "Average"} of ${getFieldLabel(settings.time.measureField ?? "")}`;
    return `${metric} by ${settings.time.interval}`;
  }

  if (settings.type === "metric-card") {
    if (settings.aggregation === "count") return "Matching rows";
    const metric = settings.aggregation === "sum" ? "Sum" : "Average";
    return settings.measureField
      ? `${metric} of ${getFieldLabel(settings.measureField)}`
      : "Metric card";
  }
  if (settings.type === "sankey") {
    const labels = settings.stages.filter(Boolean).map(getFieldLabel);
    return labels.length > 1
      ? `${labels.join(" → ")}`
      : getChartDefinition(settings.type).name;
  }
  if (settings.type === "parallel-coordinates") {
    const labels = settings.axes
      .filter((axis) => axis.field)
      .map((axis) => getFieldLabel(axis.field));
    return labels.length
      ? labels.length > 3
        ? `${labels.slice(0, 3).join(", ")} and ${labels.length - 3} more`
        : labels.join(", ")
      : getChartDefinition(settings.type).name;
  }
  const field =
    settings.type === "bar" ||
    settings.type === "row" ||
    settings.type === "boxplot" ||
    settings.type === "calendar" ||
    settings.type === "heatmap" ||
    settings.type === "ecdf"
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
  if (settings.type === "calendar") {
    return `${label} by day`;
  }
  if (settings.type === "heatmap") {
    return settings.columnField
      ? `${label} by ${getFieldLabel(settings.columnField)}`
      : `Heatmap · ${label}`;
  }
  if (settings.type === "ecdf") {
    return `Cumulative share of ${label}`;
  }
  return `${getChartDefinition(settings.type).name} · ${label}`;
}

export function getChartFields(settings: ChartSettings): string[] {
  const fields = (() => {
    switch (settings.type) {
      case "line":
        return settings.time
          ? [
              settings.xField,
              settings.time.aggregation === "count"
                ? undefined
                : settings.time.measureField,
              settings.time.splitField,
            ]
          : [settings.xField, ...settings.seriesField];
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
      case "sankey":
        return [...settings.stages, settings.measureField];
      case "parallel-coordinates":
        return [
          ...settings.axes.map((axis) => axis.field),
          settings.colorField,
        ];
      case "calendar":
        return [settings.field, settings.measureField];
      case "heatmap":
        return [settings.field, settings.columnField, settings.measureField];
      case "metric-card":
        return settings.aggregation === "count" ? [] : [settings.measureField];
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
        y: settings.time
          ? settings.time.measureField
          : settings.seriesField.length === 1
            ? settings.seriesField[0]
            : undefined,
      };
    case "boxplot":
      return { y: settings.field };
    case "ecdf":
      return { x: settings.field };
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
  if (settings.type === "metric-card") {
    return settings.aggregation === "count"
      ? "Metric card showing the count of rows that match the chart filters."
      : `${getChartTitle({ ...settings, title: "" }, getFieldLabel)} for rows that match the chart filters.`;
  }
  const fields = getChartFields(settings);
  return fields.length
    ? `${name} showing ${fields.map(getFieldLabel).join(", ")}.`
    : `${name} with no data fields selected.`;
}
