import type { ChartSettings } from "@/types/ChartTypes";

/** What a chart's annotations can attach to, for the editor's choices. */
export interface AnnotationContext {
  xField?: string;
  /** The measure new annotations start from. */
  yField?: string;
  /** Measures a record callout can sit on, such as a line chart's series. */
  measureFields: string[];
  /** X values are dates, stored as timestamps. */
  xDate: boolean;
  /** Marks are rows, so a callout can follow one record. */
  records: boolean;
  /** Rows can carry supplied lower and upper bounds. */
  intervals: boolean;
  rightAxis: boolean;
  /** Both axes are numeric, so a region has a place. */
  plane: boolean;
  /** The axis that carries values; the other names categories. */
  valueAxis: "x" | "y";
  /** Aggregate marks a callout can attach to, by this field's values. */
  categoryField?: string;
  /**
   * On a chart drawn as a grid of cells, the fields that place a cell: a
   * heatmap's row and column, or a calendar's date. A callout attaches to a
   * cell by their values; the grid has no axis for lines or bands.
   */
  cellFields?: string[];
}

const BASE = {
  measureFields: [],
  xDate: false,
  records: false,
  intervals: false,
  rightAxis: false,
  plane: false,
  valueAxis: "y" as const,
};

export function annotationContext(settings: ChartSettings): AnnotationContext {
  switch (settings.type) {
    case "line":
      if (settings.time)
        return {
          ...BASE,
          xField: settings.xField,
          yField: settings.time.measureField,
          xDate: true,
          plane: true,
        };
      return {
        ...BASE,
        xField: settings.xField,
        yField: settings.seriesField[0],
        measureFields: settings.seriesField,
        records: true,
        intervals: true,
        plane: true,
        rightAxis: settings.seriesField.some(
          (field) => settings.seriesSettings[field]?.useRightAxis
        ),
      };
    case "scatter":
      return {
        ...BASE,
        xField: settings.xField,
        yField: settings.yField,
        measureFields: [settings.yField],
        records: true,
        plane: true,
      };
    case "bar":
      return {
        ...BASE,
        // Series bars group their marks, so a note can't name one bar.
        categoryField: settings.seriesField ? undefined : settings.field,
      };
    case "row":
      return { ...BASE, valueAxis: "x", categoryField: settings.field };
    case "boxplot":
      return { ...BASE, yField: settings.field };
    case "ecdf":
      // Values on x, the share of rows on y.
      return { ...BASE, xField: settings.field, valueAxis: "x", plane: true };
    case "heatmap":
      return { ...BASE, cellFields: [settings.field, settings.columnField] };
    case "calendar":
      return { ...BASE, cellFields: [settings.field] };
    default:
      return BASE;
  }
}
