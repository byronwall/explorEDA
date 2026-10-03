import { getChartDefinition } from "@/charts/registry";
import { useDataLayer } from "@/providers/DataLayerProvider";
import { ChartLayout, ChartType } from "@/types/ChartTypes";

export function useCreateCharts() {
  const profiles = useDataLayer((s) => s.fieldProfiles);
  const charts = useDataLayer((s) => s.charts);
  const addChart = useDataLayer((s) => s.addChart);

  /** Default settings for a new chart, without adding it to the grid. */
  const buildChart = (
    type: ChartType,
    field: string,
    initialLayout?: ChartLayout
  ) => {
    const layout = initialLayout ?? {
      x: 0,
      y: Math.max(0, ...charts.map((chart) => chart.layout.y + chart.layout.h)),
      w: type === "metric-card" ? 4 : 6,
      h: type === "metric-card" ? 3 : 4,
    };

    const definition = getChartDefinition(type);
    if (!definition) {
      throw new Error(`Chart type ${type} not registered`);
    }

    const numeric = profiles
      .filter((profile) => profile.dataType === "numeric")
      .map((profile) => profile.name);
    const categories = profiles
      .filter((profile) => profile.dataType !== "numeric")
      .map((profile) => profile.name);
    const selectedField =
      field ||
      (type === "row" || type === "heatmap" ? categories[0] : numeric[0]) ||
      profiles[0]?.name ||
      "";
    const settings = definition.createDefaultSettings(layout, selectedField);
    if (settings.type === "scatter" || settings.type === "3d-scatter") {
      settings.xField = numeric[0] || "__ID";
      settings.yField = field || numeric[1] || numeric[0] || "__ID";
      settings.xAxisLabel = "";
      settings.yAxisLabel = "";
      if (settings.type === "3d-scatter")
        settings.zField = numeric[2] || numeric[0] || "__ID";
    }
    if (settings.type === "line") {
      settings.xField = "__ID";
      settings.seriesField = selectedField ? [selectedField] : [];
      settings.xAxisLabel = "";
      settings.yAxisLabel = "";
    }
    if (settings.type === "data-table")
      settings.columns = profiles
        .slice(0, 8)
        .map((profile) => ({ id: profile.name, field: profile.name }));
    if (settings.type === "pivot") {
      settings.rowFields = categories.slice(0, 1);
      settings.columnField = categories[1] || "";
      settings.valueFields = selectedField
        ? [{ field: selectedField, aggregation: "count" }]
        : [];
    }
    if (settings.type === "color-legend")
      settings.fields = categories.slice(0, 1);
    if (settings.type === "bar" || settings.type === "row") {
      settings.xAxisLabel = settings.type === "row" ? "Records" : "";
      settings.yAxisLabel = settings.type === "bar" ? "Records" : "";
    }
    if (settings.type === "boxplot") settings.yAxisLabel = "";
    if (settings.type === "sankey") {
      // Few-valued categories make readable stages.
      const stages = profiles
        .filter((profile) => profile.dataType !== "numeric" && profile.uniqueCount <= 12)
        .map((profile) => profile.name);
      const start = stages.includes(selectedField) ? [selectedField] : [];
      settings.stages = [...new Set([...start, ...stages])].slice(0, 3);
    }
    if (settings.type === "parallel-coordinates") {
      const start = numeric.includes(selectedField) ? [selectedField] : [];
      settings.axes = [...new Set([...start, ...numeric])]
        .slice(0, 5)
        .map((name) => ({ field: name, inverted: false }));
    }
    if (settings.type === "calendar" && !field)
      settings.field =
        profiles.find((profile) => profile.dataType === "datetime")?.name ??
        settings.field;
    if (settings.type === "heatmap")
      settings.columnField =
        categories.find((name) => name !== settings.field) ?? "";
    if (settings.type === "ecdf" && !numeric.includes(settings.field))
      settings.field = numeric[0] ?? settings.field;
    settings.title = "";
    return settings;
  };

  const createChart = (
    type: ChartType,
    field: string,
    initialLayout?: ChartLayout
  ) => {
    addChart(buildChart(type, field, initialLayout));
  };

  return { buildChart, createChart };
}
