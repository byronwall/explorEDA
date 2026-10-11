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
    "Small multiples by one field (wrap) or two (grid), on chart types that offer facets.",
  filters: "The chart's selection. It filters every other chart.",
  localFilters:
    "Limits the rows this chart draws. Unlike its selection, it never filters other charts.",
  margin: "Space around the plot, in pixels, on charts that draw a plot.",
  xAxis:
    "X axis scale type, tick and label sizes, grid, and range limits, on charts with an X axis.",
  yAxis:
    "Y axis scale type, tick and label sizes, grid, and range limits, on charts with a Y axis.",
  xAxisLabel:
    "X axis title, on charts with an X axis. Blank uses the field's label.",
  yAxisLabel:
    "Y axis title, on charts with a Y axis. Blank uses the field's label.",
  xGridLines:
    "About how many tick values the X axis shows, from 2 to 12, on charts with numeric ticks.",
  yGridLines:
    "About how many tick values the Y axis shows, from 2 to 12, on charts with numeric ticks.",
  colorField:
    "Field that colors the marks, on charts that color by a field. Charts that color by the same field share its colors.",
  colorScaleId:
    "The color scale for the color field, shared by name across charts.",
  annotations:
    "Saved callouts, lines, bands, regions, saved records, and supplied intervals, on charts that draw annotations. A callout on a record finds it by key field values, never by row position. Date values are UTC timestamps in milliseconds.",
};

/** Settings described for one chart type. */
export const CHART_SETTINGS: Readonly<
  Record<string, Readonly<Record<string, string>>>
> = {
  row: {
    field: "Category field; each value gets its own row.",
    minRowHeight:
      "Smallest row height in pixels. When rows would be shorter, the chart shows fewer categories.",
    maxRowHeight: "Largest row height in pixels, so a few rows stay compact.",
    aggregateId:
      "A named grouped summary to rank, which counts, sums, or averages a measure per category.",
    topN: "Shows this many categories and gathers the rest in Other. Unset fits the chart's height.",
  },
  line: {
    field: "Not read by this chart type.",
    xField: "Field on the X axis: a date or a number.",
    seriesField: "Fields drawn as lines, one line each.",
    seriesSettings:
      "Per-line style by field: points, line width and opacity, color, dash, and the right axis.",
    styles: "Line shape between points: straight, smooth (monotone), or steps.",
    time: "Date summary: line, area, or stacked area; the interval and week start; the metric and measure; a split field; and whether missing periods leave a gap or draw zero.",
    showLegend: "Shows the legend.",
    legendPosition: "Where the legend sits: top, right, bottom, or left.",
    showXGrid:
      "Older grid switch. When yAxis.grid is unset, it decides the Y axis grid.",
    showYGrid:
      "Older grid switch. When xAxis.grid is unset, it decides the X axis grid.",
  },
  boxplot: {
    field: "Numeric field each box summarizes.",
    colorField:
      "Field that groups the rows into one box per value, each in its own color.",
    whiskerType:
      "How far whiskers reach: 1.5 times the interquartile range (Tukey), the minimum and maximum, or standard deviations.",
    showOutliers: "Shows values beyond the whiskers as separate points.",
    showObservations:
      "Shows individual values over each box: the first 300 valid rows per group.",
    violinOverlay: "Adds a density shape around each box.",
    violinBandwidth:
      "Density smoothing for the violin, when it is not automatic.",
    autoBandwidth:
      "Chooses violin smoothing from each group's spread and row count.",
    sortBy: "Box order: by label, or by median.",
    styles:
      "Box, median, whisker, and outlier colors and stroke widths, and the outlier size.",
  },
  "3d-scatter": {
    field: "Not read by this chart type.",
    xField: "Field on the X axis.",
    yField: "Field on the Y axis.",
    zField: "Field on the Z axis.",
    sizeField: "Field that sizes each point.",
    pointSize: "Point size, from 0.01 to 10.",
    pointOpacity: "Point opacity, from 0 to 1.",
    showGrid: "Draws grid planes.",
    showAxes: "Draws the three axes.",
    cameraPosition: "Where the camera sits. Saved as you orbit the view.",
    cameraTarget: "The point the camera looks at.",
    zAxis: "Z axis scale and grid settings.",
  },
  pivot: {
    field: "Not read by this chart type.",
    rowFields: "Fields that group the rows, outermost first.",
    columnField: "Field whose values become columns.",
    valueFields:
      "Measures, each a field with an aggregation (sum, count, average, minimum, maximum, median, mode, standard deviation, variance, unique count, or single value) and an optional label.",
    showTotals:
      "Adds a Total row, and a Total column when a column field is set. On unless false.",
    shadeCells:
      "Tints each value cell by its size within its measure. On unless false.",
  },
  "data-table": {
    field: "Not read by this chart type.",
    columns: "Columns in order, each a field with an optional width.",
    sortBy: "Field the rows are sorted by.",
    sortDirection: "Sort direction: ascending or descending.",
    globalSearch: "Text that limits the rows shown to those that contain it.",
    showDistributions:
      "Draws each field's distribution under its column name. On unless false.",
  },
  summary: {
    field: "Not read by this chart type.",
  },
  "color-legend": {
    field: "Not read by this chart type.",
    fields: "Fields whose color scales the legend shows.",
    numericalBreakpoints: "How many labels a numeric color scale shows.",
    wrap: "Wraps category swatches onto more lines instead of one row.",
  },
  markdown: {
    field: "Not read by this chart type.",
    content: "The text, written in Markdown.",
  },
  hierarchy: {
    field: "Not read by this chart type.",
    levels:
      "Category fields from outermost in, one to three. Each row is one path through them.",
    aggregation: "Node size: a count of rows, or a sum of the measure.",
    measureField:
      "Field summed for node size. Negative and missing values are left out.",
    missingLevels:
      "Leaves out rows with a missing level, or shows missing as its own node.",
    colorBy:
      "Colors nodes by their first-level branch, by level, or in one color.",
    arrangement: "Draws the hierarchy as a treemap, an icicle, or a sunburst.",
    focus:
      "The zoomed branch, as values along the levels. Empty shows the whole.",
  },
  sankey: {
    field: "Not read by this chart type.",
    stages: "Category fields in order. Each row is one path through them.",
    aggregation: "Flow width: a count of rows, or a sum of the measure.",
    measureField:
      "Field summed for flow width. Negative and missing values are left out.",
    missingStages:
      "Leaves out rows with a missing stage, or shows missing as its own node.",
    maxNodesPerStage:
      "Most values each stage shows, ranked by rows. The rest join one Other node.",
    nodeOrder: "Node order in each stage: by value, or by label.",
    flowColor:
      "Colors flows by their first-stage value, by each link's source, or in one color.",
  },
  "parallel-coordinates": {
    field: "Not read by this chart type.",
    axes: "Axes in order, left to right, each a field that can be drawn high-to-low.",
    lineOpacity: "Line opacity, from 0 to 1.",
    lineWidth: "Line width in pixels.",
  },
  "scatter-matrix": {
    field: "Not read by this chart type.",
    fields: "Fields in order, left to right and top to bottom.",
    lower:
      "Below the diagonal, by field types: numeric pairs as points, correlation, or blank; numeric against category as points, box, or blank; category pairs as points, tiles, shares, or blank.",
    upper: "Above the diagonal, with the same choices as below it.",
    diagonal:
      "On the diagonal: numeric fields as density, histogram, or label; category fields as bars or label.",
    pointSize: "Point size. Absent, it shrinks as rows grow.",
    pointOpacity: "Point opacity, from 0 to 1.",
    jitter:
      "How much of a category's band jittered points spread across, from 0 to 1. Default 0.8.",
  },
  calendar: {
    field: "Date field. Each day's cell summarizes its rows.",
    aggregation:
      "What each day shows: a count of rows, or a summary of the measure.",
    measureField: "Field the metric summarizes, when it is not a count.",
    weekStart: "First day of each week column: Sunday or Monday.",
    year: "Year on show. Absent, the latest year with dates.",
  },
  heatmap: {
    field: "Field whose values become rows.",
    columnField: "Field whose values become columns.",
    aggregation:
      "What each cell shows: a count of rows, or a summary of the measure.",
    measureField: "Field the metric summarizes, when it is not a count.",
    maxCategories:
      "Most values on each axis, ranked by rows. Rows with other values are left out and counted below the chart.",
    sortBy: "Axis order: by row count, or by label.",
    showValues: "Prints each value in its cell when the text fits.",
  },
  ecdf: {
    field: "Numeric field the curve accumulates.",
    colorField:
      "Field that draws one curve per value. Each curve uses its own rows as 100%.",
    direction:
      "Share of values at or below each x, or at or above it, for questions about how many exceed a value.",
    logX: "Plots x on a log scale when every value is positive.",
    showQuantiles: "Marks where each curve crosses 50% and 90%.",
    showOverall:
      "Draws a dashed curve for all rows together when curves are split by color.",
  },
  "metric-card": {
    field: "Not read by this chart type.",
    aggregation: "The metric: a count of rows, or a summary of the measure.",
    measureField: "Field the metric summarizes, when it is not a count.",
    entityField:
      "Counts each value of this field once, so repeated result rows don't inflate the metric.",
  },
  map: {
    field: "Not read by this chart type.",
    mode: "Points from each row's coordinates, or regions joined to row keys.",
    latitudeField: "Latitude field, in degrees, for points.",
    longitudeField: "Longitude field, in degrees, for points.",
    labelField: "Field shown as each point's label.",
    sizeField: "Field that sizes points by value.",
    pointRadius:
      "Point radius in pixels, from 2 to 32. With a size field, the largest point's radius.",
    pointOpacity: "Point opacity, from 0.1 to 1.",
    geometryAssetId: "The region geometry, for region maps.",
    regionField: "Field holding each row's region key.",
    featureKey:
      "GeoJSON property or feature ID matched to the region key. Values and types must match exactly.",
    aggregation:
      "Region value: a count of rows, or a sum or average of the measure.",
    measureField: "Field summed or averaged for each region.",
    showRegionLabels: "Shows each visible region's key at its center.",
    outlineWidth: "Region outline width in pixels.",
    projection:
      "Equal Earth keeps relative areas; equirectangular draws longitude and latitude as straight, even lines.",
    view: "The saved center and zoom. It refits when the chart is resized.",
  },
  composition: {
    field: "Not read by this chart type.",
    composition:
      "The artboard, the elements placed on it (text, guides, and chart units that can repeat per value), shared scales, computed values, and saved changes to single repeats.",
  },
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
