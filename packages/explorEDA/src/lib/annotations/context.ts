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
}

export function annotationContext(settings: ChartSettings): AnnotationContext {
  if (settings.type === "line") {
    if (settings.time)
      return {
        xField: settings.xField,
        yField: settings.time.measureField,
        measureFields: [],
        xDate: true,
        records: false,
        intervals: false,
        rightAxis: false,
      };
    return {
      xField: settings.xField,
      yField: settings.seriesField[0],
      measureFields: settings.seriesField,
      xDate: false,
      records: true,
      intervals: true,
      rightAxis: settings.seriesField.some(
        (field) => settings.seriesSettings[field]?.useRightAxis
      ),
    };
  }
  if (settings.type === "scatter")
    return {
      xField: settings.xField,
      yField: settings.yField,
      measureFields: [settings.yField],
      xDate: false,
      records: true,
      intervals: false,
      rightAxis: false,
    };
  return {
    measureFields: [],
    xDate: false,
    records: false,
    intervals: false,
    rightAxis: false,
  };
}
