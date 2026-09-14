import type { SavedDataStructure } from "@/types/SavedDataStructure";

export async function saveToClipboard(data: SavedDataStructure): Promise<void> {
  try {
    const jsonString = JSON.stringify(data);
    await navigator.clipboard.writeText(jsonString);
  } catch {
    throw new Error("Failed to save data to clipboard");
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isExpression(value: unknown): boolean {
  if (!isRecord(value) || typeof value.type !== "string") {
    return false;
  }
  if (
    !Array.isArray(value.dependencies) ||
    !value.dependencies.every((dependency) => typeof dependency === "string")
  ) {
    return false;
  }

  switch (value.type) {
    case "basic":
      return (
        typeof value.operator === "string" &&
        isExpression(value.left) &&
        isExpression(value.right)
      );
    case "function":
      return (
        typeof value.functionName === "string" &&
        Array.isArray(value.arguments) &&
        value.arguments.every(isExpression)
      );
    case "group":
      return (
        Array.isArray(value.groupBy) &&
        value.groupBy.every((field) => typeof field === "string") &&
        typeof value.aggregation === "string"
      );
    case "rank":
      return (
        Array.isArray(value.rankBy) &&
        value.rankBy.every((field) => typeof field === "string") &&
        typeof value.isNormalized === "boolean" &&
        typeof value.isCumulative === "boolean"
      );
    case "advanced":
      return typeof value.algorithm === "string";
    case "ternary":
      return (
        isExpression(value.condition) &&
        isExpression(value.trueBranch) &&
        isExpression(value.falseBranch)
      );
    case "unary":
      return typeof value.operator === "string" && isExpression(value.operand);
    case "literal":
      return true;
    default:
      return false;
  }
}

function isFilter(value: unknown): boolean {
  if (!isRecord(value) || typeof value.type !== "string") {
    return false;
  }
  if (typeof value.field !== "string") {
    return false;
  }
  if (value.type === "value") {
    return Array.isArray(value.values) && value.values.every(isDatum);
  }
  if (value.type === "range") {
    return (
      (value.min === undefined || isFiniteNumber(value.min)) &&
      (value.max === undefined || isFiniteNumber(value.max))
    );
  }
  return (
    value.type === "text" &&
    typeof value.value === "string" &&
    ["contains", "equals", "startsWith", "endsWith"].includes(
      value.operator as string
    )
  );
}

function isDatum(value: unknown): boolean {
  return (
    value === undefined ||
    typeof value === "string" ||
    typeof value === "boolean" ||
    isFiniteNumber(value)
  );
}

function isVector3(value: unknown): boolean {
  return (
    isRecord(value) &&
    isFiniteNumber(value.x) &&
    isFiniteNumber(value.y) &&
    isFiniteNumber(value.z)
  );
}

function isAxis(value: unknown, zoomLevel = false): boolean {
  if (!isRecord(value)) {
    return false;
  }
  return (
    (value.title === undefined || typeof value.title === "string") &&
    (value.scaleType === undefined ||
      ["linear", "log", "time", "band"].includes(value.scaleType as string)) &&
    (value.grid === undefined || typeof value.grid === "boolean") &&
    (value.min === undefined || isFiniteNumber(value.min)) &&
    (value.max === undefined || isFiniteNumber(value.max)) &&
    (!zoomLevel || isFiniteNumber(value.zoomLevel))
  );
}

function isFacet(value: unknown): boolean {
  if (!isRecord(value) || typeof value.enabled !== "boolean") {
    return false;
  }
  if (value.type === "grid") {
    return (
      typeof value.rowVariable === "string" &&
      typeof value.columnVariable === "string"
    );
  }
  return (
    value.type === "wrap" &&
    typeof value.rowVariable === "string" &&
    isFiniteNumber(value.columnCount)
  );
}

function isBaseChart(value: Record<string, unknown>): boolean {
  return (
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    typeof value.field === "string" &&
    isRecord(value.layout) &&
    isFiniteNumber(value.layout.x) &&
    isFiniteNumber(value.layout.y) &&
    isFiniteNumber(value.layout.w) &&
    isFiniteNumber(value.layout.h) &&
    (value.colorScaleId === undefined ||
      typeof value.colorScaleId === "string") &&
    (value.colorField === undefined || typeof value.colorField === "string") &&
    isFacet(value.facet) &&
    isAxis(value.xAxis) &&
    isAxis(value.yAxis) &&
    isRecord(value.margin) &&
    isFiniteNumber(value.margin.top) &&
    isFiniteNumber(value.margin.right) &&
    isFiniteNumber(value.margin.bottom) &&
    isFiniteNumber(value.margin.left) &&
    Array.isArray(value.filters) &&
    value.filters.every(isFilter) &&
    typeof value.xAxisLabel === "string" &&
    typeof value.yAxisLabel === "string" &&
    isFiniteNumber(value.xGridLines) &&
    isFiniteNumber(value.yGridLines)
  );
}

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) && value.every((item) => typeof item === "string")
  );
}

function isSeriesSettings(value: unknown): boolean {
  if (!isRecord(value)) {
    return false;
  }
  return (
    typeof value.showPoints === "boolean" &&
    isFiniteNumber(value.pointSize) &&
    isFiniteNumber(value.pointOpacity) &&
    isFiniteNumber(value.lineWidth) &&
    isFiniteNumber(value.lineOpacity) &&
    (value.lineColor === undefined || typeof value.lineColor === "string") &&
    ["solid", "dashed", "dotted"].includes(value.lineStyle as string) &&
    typeof value.useRightAxis === "boolean"
  );
}

function isChart(value: unknown): boolean {
  if (!isRecord(value)) {
    return false;
  }
  if (!isBaseChart(value)) {
    return false;
  }

  switch (value.type) {
    case "row":
      return (
        isFiniteNumber(value.minRowHeight) && isFiniteNumber(value.maxRowHeight)
      );
    case "bar":
      return (
        (value.binCount === undefined || isFiniteNumber(value.binCount)) &&
        (value.forceString === undefined ||
          typeof value.forceString === "boolean")
      );
    case "scatter":
      return (
        typeof value.xField === "string" && typeof value.yField === "string"
      );
    case "pivot":
      return (
        isStringArray(value.rowFields) &&
        typeof value.columnField === "string" &&
        Array.isArray(value.valueFields) &&
        value.valueFields.every((field) => {
          if (!isRecord(field)) {
            return false;
          }
          return (
            typeof field.field === "string" &&
            [
              "sum",
              "count",
              "avg",
              "min",
              "max",
              "median",
              "mode",
              "stddev",
              "variance",
              "countUnique",
              "singleValue",
            ].includes(field.aggregation as string) &&
            (field.label === undefined || typeof field.label === "string")
          );
        })
      );
    case "data-table":
      return (
        Array.isArray(value.columns) &&
        value.columns.every((column) => {
          if (!isRecord(column)) {
            return false;
          }
          return (
            typeof column.id === "string" &&
            typeof column.field === "string" &&
            (column.width === undefined || isFiniteNumber(column.width))
          );
        }) &&
        isFiniteNumber(value.pageSize) &&
        isFiniteNumber(value.currentPage) &&
        (value.sortBy === undefined || typeof value.sortBy === "string") &&
        ["asc", "desc"].includes(value.sortDirection as string) &&
        typeof value.globalSearch === "string" &&
        isFiniteNumber(value.tableHeight)
      );
    case "summary":
      return true;
    case "markdown":
      return typeof value.content === "string";
    case "boxplot":
      return (
        ["tukey", "minmax", "stdDev"].includes(value.whiskerType as string) &&
        typeof value.showOutliers === "boolean" &&
        typeof value.violinOverlay === "boolean" &&
        typeof value.beeSwarmOverlay === "boolean" &&
        ["median", "label"].includes(value.sortBy as string) &&
        isFiniteNumber(value.violinBandwidth) &&
        typeof value.autoBandwidth === "boolean" &&
        isRecord(value.styles) &&
        typeof value.styles.boxFill === "string" &&
        typeof value.styles.boxStroke === "string" &&
        isFiniteNumber(value.styles.boxStrokeWidth) &&
        typeof value.styles.medianStroke === "string" &&
        isFiniteNumber(value.styles.medianStrokeWidth) &&
        typeof value.styles.whiskerStroke === "string" &&
        isFiniteNumber(value.styles.whiskerStrokeWidth) &&
        isFiniteNumber(value.styles.outlierSize) &&
        typeof value.styles.outlierStroke === "string" &&
        typeof value.styles.outlierFill === "string"
      );
    case "color-legend":
      return (
        isStringArray(value.fields) &&
        isFiniteNumber(value.numericalBreakpoints) &&
        typeof value.wrap === "boolean"
      );
    case "line":
      return (
        typeof value.xField === "string" &&
        isStringArray(value.seriesField) &&
        isRecord(value.seriesSettings) &&
        Object.values(value.seriesSettings).every(isSeriesSettings) &&
        isRecord(value.styles) &&
        ["linear", "monotoneX", "step"].includes(
          value.styles.curveType as string
        ) &&
        typeof value.showXGrid === "boolean" &&
        typeof value.showYGrid === "boolean" &&
        typeof value.showLegend === "boolean" &&
        ["top", "right", "bottom", "left"].includes(
          value.legendPosition as string
        )
      );
    case "3d-scatter":
      return (
        typeof value.xField === "string" &&
        typeof value.yField === "string" &&
        typeof value.zField === "string" &&
        (value.sizeField === undefined ||
          typeof value.sizeField === "string") &&
        isVector3(value.cameraPosition) &&
        isVector3(value.cameraTarget) &&
        isFiniteNumber(value.pointSize) &&
        isFiniteNumber(value.pointOpacity) &&
        typeof value.showGrid === "boolean" &&
        typeof value.showAxes === "boolean" &&
        isAxis(value.xAxis, true) &&
        isAxis(value.yAxis, true) &&
        isAxis(value.zAxis, true)
      );
    default:
      return false;
  }
}

function isColorScale(value: unknown): boolean {
  if (!isRecord(value)) {
    return false;
  }
  if (typeof value.id !== "string" || typeof value.name !== "string") {
    return false;
  }
  if (value.type === "numerical") {
    return (
      typeof value.palette === "string" &&
      isFiniteNumber(value.min) &&
      isFiniteNumber(value.max)
    );
  }
  return (
    value.type === "categorical" &&
    Array.isArray(value.palette) &&
    value.palette.every((color) => typeof color === "string") &&
    Array.isArray(value.mapping) &&
    value.mapping.every(
      (entry) =>
        Array.isArray(entry) &&
        entry.length === 2 &&
        typeof entry[0] === "string" &&
        typeof entry[1] === "string"
    )
  );
}

export function validateSavedData(data: unknown): data is SavedDataStructure {
  if (!isRecord(data)) {
    return false;
  }

  const { charts, calculations, gridSettings, metadata, colorScales } = data;

  if (
    !Array.isArray(charts) ||
    !charts.every(isChart) ||
    !Array.isArray(calculations) ||
    !calculations.every(
      (calculation) =>
        isRecord(calculation) &&
        typeof calculation.resultColumnName === "string" &&
        isExpression(calculation.expression)
    ) ||
    !Array.isArray(colorScales) ||
    !colorScales.every(isColorScale) ||
    !isRecord(metadata) ||
    !isRecord(gridSettings)
  ) {
    return false;
  }

  if (
    typeof metadata.name !== "string" ||
    !isFiniteNumber(metadata.version) ||
    typeof metadata.createdAt !== "string" ||
    typeof metadata.modifiedAt !== "string"
  ) {
    return false;
  }

  if (
    !isFiniteNumber(gridSettings.columnCount) ||
    !isFiniteNumber(gridSettings.rowHeight) ||
    !isFiniteNumber(gridSettings.containerPadding) ||
    typeof gridSettings.showBackgroundMarkers !== "boolean"
  ) {
    return false;
  }

  return true;
}

export function migrateDataVersion(
  data: SavedDataStructure
): SavedDataStructure {
  // Currently we only have version 1, so no migration needed
  // This function will be expanded when we add new versions
  return data;
}

export async function saveRawDataToClipboard(data: unknown): Promise<void> {
  try {
    const jsonString = JSON.stringify(data);
    await navigator.clipboard.writeText(jsonString);
  } catch {
    throw new Error("Failed to save raw data to clipboard");
  }
}
