/**
 * One line for each saved chart setting, shown in each chart page's settings
 * reference. Keys come from the library, so the docs gate fails when a
 * documented chart type gains a setting with no line here, or keeps a line
 * for a setting it no longer has.
 */

/** Settings every chart type shares. A chart type may describe one its own way. */
export const COMMON_SETTINGS: Readonly<Record<string, string>> = {
  title: "Title in the chart header.",
  subtitle: "Line under the title that says what the chart shows.",
  note: "Source or note line under the plot.",
  style: "Title and subtitle type that differs from the workspace theme.",
  layout: "Position and size on the dashboard grid, in grid columns and rows.",
  facet:
    "Splits the chart into small multiples by one field (wrap) or two (grid).",
  filters: "The chart's selection. It filters every other chart.",
  localFilters:
    "Limits the rows this chart draws. Unlike its selection, it never filters other charts.",
  margin: "Space around the plot, in pixels.",
  xAxis: "X axis scale type, tick and label sizes, grid, and range limits.",
  yAxis: "Y axis scale type, tick and label sizes, grid, and range limits.",
  xAxisLabel: "X axis title. Blank uses the field's label.",
  yAxisLabel: "Y axis title. Blank uses the field's label.",
  xGridLines: "About how many tick values the X axis shows, from 2 to 12.",
  yGridLines: "About how many tick values the Y axis shows, from 2 to 12.",
  colorField:
    "Field the marks are colored by. Charts that color by the same field share its colors.",
  colorScaleId:
    "The color scale for the color field, shared by name across charts.",
};

/** Settings described for one chart type. */
export const CHART_SETTINGS: Readonly<
  Record<string, Readonly<Record<string, string>>>
> = {
  scatter: {
    xField: "Field on the X axis.",
    yField: "Field on the Y axis.",
    field: "Not read by scatter plots; the axes use xField and yField.",
    display:
      "Points, rectangular density bins, hexagon bins, or smoothed density contours.",
    density:
      "Rectangular bin options: bins on each axis and the count at the top of the color scale.",
    hexbin:
      "Hexagon options: columns across the plot, the count at the top of the color scale, and whether points show underneath.",
    contour:
      "Smoothed density options: bandwidth (0.25 to 4 times Scott's rule), levels, fill, lines, and points.",
    pointSize:
      "Point radius in pixels, from 1 to 12. Empty is automatic: 3 px, or smaller above 1,000 rows.",
    pointOpacity: "Point opacity, from 0.1 to 1.",
    sizeField:
      "Numeric field that sizes each point as a bubble, with area proportional to value.",
    maxBubbleRadius: "Radius in pixels of the largest bubble, from 6 to 32.",
    regression:
      "A fit per color group in each facet: linear, polynomial (degree 2 to 6), or LOESS (span 0.2 to 1), with an optional overall fit. Absent when off.",
    summary: "Shows the paired summary line: correlation and pair count.",
    marginals:
      "X and Y histograms beside the plot, with their bin count. Absent when off.",
  },
  bar: {
    field: "Field to count by category, or to bin when it is numeric.",
    binCount: "Number of bins when the field is binned, from 2 to 50.",
    forceString:
      "Counts each distinct value as its own bar, even for a numeric field.",
    categoryOrder:
      "Category bars in data order, or sorted by label from A to Z.",
    aggregateId:
      "A named grouped summary to draw, which counts, sums, or averages a measure per group.",
    seriesField: "A second field that splits each bar into series.",
    seriesLayout:
      "How series bars sit: grouped side by side, stacked, or as 100% shares of each category.",
    colorField:
      "Field the bars are colored by: the bar's own field or its series field. Charts that color by the same field share its colors.",
  },
};

/** A setting's line for a chart type, or undefined when it has none. */
export function describeSetting(type: string, key: string) {
  return CHART_SETTINGS[type]?.[key] ?? COMMON_SETTINGS[key];
}
