import type {
  SavedAnalysisStructure,
  SavedDataStructure,
  SavedRow,
  SavedSpecialValue,
} from "@/types/SavedDataStructure";
import { CalculationManager } from "@/lib/calculations/CalculationState";
import { parseExpression } from "@/lib/calculations/parser/semantics";
import { initializeData } from "@/providers/lib/dataLayerState";

export async function saveToClipboard(data: SavedDataStructure): Promise<void> {
  try {
    const jsonString = stringifySavedData(data);
    await navigator.clipboard.writeText(jsonString);
  } catch {
    throw new Error("Failed to save data to clipboard");
  }
}

export function stringifySavedData(data: SavedDataStructure): string {
  if (!validateSavedData(data)) {
    throw new Error("Cannot serialize invalid ExploreEDA settings");
  }
  return JSON.stringify(data);
}

export function parseSavedData(text: string): SavedDataStructure {
  const value = JSON.parse(text) as unknown;
  if (!validateSavedData(value))
    throw new Error("Invalid ExploreEDA settings JSON");
  return value;
}

export function stringifySavedAnalysis(data: SavedAnalysisStructure): string {
  if (!validateSavedData(data.settings)) {
    throw new Error("Cannot serialize invalid ExploreEDA settings");
  }
  const specialValues: Record<string, SavedSpecialValue> = {};
  const rows = data.data.map((row, rowIndex) => {
    const cleanRow = Object.create(null) as SavedRow;
    Object.entries(row).forEach(([field, value]) => {
      const key = JSON.stringify([rowIndex, field]);
      if (value === undefined) {
        specialValues[key] = "undefined";
      } else if (typeof value === "number" && !Number.isFinite(value)) {
        specialValues[key] = Number.isNaN(value)
          ? "NaN"
          : value === Infinity
            ? "Infinity"
            : "-Infinity";
      } else {
        cleanRow[field] = value;
      }
    });
    return cleanRow;
  });
  return JSON.stringify({
    ...data,
    data: rows,
    specialValues: Object.keys(specialValues).length
      ? specialValues
      : undefined,
  });
}

export function parseSavedAnalysis(text: string): SavedAnalysisStructure {
  const value = JSON.parse(text) as unknown;
  if (
    isRecord(value) &&
    Array.isArray(value.data) &&
    isRecord(value.specialValues)
  ) {
    const rows = value.data as unknown[];
    Object.entries(value.specialValues).forEach(([encodedKey, tag]) => {
      if (
        !["undefined", "NaN", "Infinity", "-Infinity"].includes(tag as string)
      ) {
        return;
      }
      let path: unknown;
      try {
        path = JSON.parse(encodedKey);
      } catch {
        return;
      }
      if (
        !Array.isArray(path) ||
        path.length !== 2 ||
        typeof path[0] !== "number" ||
        typeof path[1] !== "string" ||
        !isRecord(rows[path[0]])
      ) {
        return;
      }
      const row = rows[path[0]] as Record<string, unknown>;
      Object.defineProperty(row, path[1], {
        value:
          tag === "undefined"
            ? undefined
            : tag === "NaN"
              ? NaN
              : tag === "Infinity"
                ? Infinity
                : -Infinity,
        enumerable: true,
        configurable: true,
        writable: true,
      });
    });
  }
  if (!validateSavedAnalysis(value)) {
    throw new Error("Invalid ExploreEDA analysis JSON");
  }
  return value;
}

export async function saveAnalysisToClipboard(
  data: SavedAnalysisStructure
): Promise<void> {
  try {
    await navigator.clipboard.writeText(stringifySavedAnalysis(data));
  } catch {
    throw new Error("Failed to save analysis to clipboard");
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
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
  if (value.type === "date-range") {
    const isIsoDate = (date: unknown) =>
      typeof date === "string" &&
      /^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(date) &&
      !Number.isNaN(Date.parse(date));

    return (
      (value.min === undefined || isIsoDate(value.min)) &&
      (value.max === undefined || isIsoDate(value.max))
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
    value === null ||
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
      ["linear", "log", "symlog", "time", "band"].includes(
        value.scaleType as string
      )) &&
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
        (value.sortBy === undefined || typeof value.sortBy === "string") &&
        ["asc", "desc"].includes(value.sortDirection as string) &&
        typeof value.globalSearch === "string"
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
        typeof calculation.expression === "string"
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

  if (data.rowsSettings !== undefined) {
    const rowsSettings = data.rowsSettings;
    if (
      !isRecord(rowsSettings) ||
      !Array.isArray(rowsSettings.columns) ||
      !rowsSettings.columns.every((column) => {
        if (!isRecord(column)) return false;
        return (
          typeof column.id === "string" &&
          typeof column.field === "string" &&
          (column.width === undefined || isFiniteNumber(column.width))
        );
      }) ||
      (rowsSettings.sortBy !== undefined &&
        typeof rowsSettings.sortBy !== "string") ||
      !["asc", "desc"].includes(rowsSettings.sortDirection as string) ||
      !Array.isArray(rowsSettings.filters) ||
      !rowsSettings.filters.every(isFilter) ||
      typeof rowsSettings.globalSearch !== "string"
    ) {
      return false;
    }
  }

  return true;
}

function isSavedRow(value: unknown): value is SavedRow {
  return (
    isRecord(value) &&
    Object.values(value).every(
      (item) =>
        item === null ||
        item === undefined ||
        typeof item === "string" ||
        typeof item === "boolean" ||
        typeof item === "number"
    )
  );
}

export function validateSavedAnalysis(
  data: unknown
): data is SavedAnalysisStructure {
  const specialValuesValid =
    isRecord(data) &&
    (data.specialValues === undefined ||
      (isRecord(data.specialValues) &&
        Object.entries(data.specialValues).every(([key, value]) => {
          if (
            !["undefined", "NaN", "Infinity", "-Infinity"].includes(
              value as string
            )
          ) {
            return false;
          }
          try {
            const path = JSON.parse(key) as unknown;
            return (
              Array.isArray(path) &&
              path.length === 2 &&
              Number.isInteger(path[0]) &&
              (path[0] as number) >= 0 &&
              Array.isArray(data.data) &&
              (path[0] as number) < data.data.length &&
              typeof path[1] === "string"
            );
          } catch {
            return false;
          }
        })));
  return (
    isRecord(data) &&
    data.format === "exploreda-analysis" &&
    data.version === 1 &&
    Array.isArray(data.data) &&
    data.data.every(isSavedRow) &&
    specialValuesValid &&
    validateSavedData(data.settings)
  );
}

export function validateSavedAnalysisForData(
  analysis: SavedAnalysisStructure
): boolean {
  try {
    const { dataWithIds } = initializeData(analysis.data);
    new CalculationManager(
      dataWithIds,
      analysis.settings.calculations.map(
        ({ resultColumnName, expression }) => ({
          resultColumnName,
          expression: parseExpression(expression),
        })
      )
    );
    return true;
  } catch {
    return false;
  }
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
