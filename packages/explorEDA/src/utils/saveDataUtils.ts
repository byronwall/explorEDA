import { SavedDataStructure } from "@/types/SavedDataStructure";

export async function saveToClipboard(data: SavedDataStructure): Promise<void> {
  try {
    const jsonString = JSON.stringify(data);
    await navigator.clipboard.writeText(jsonString);
  } catch (error) {
    console.error("Error saving to clipboard:", error);
    throw new Error("Failed to save data to clipboard");
  }
}

export async function loadFromClipboard(): Promise<SavedDataStructure | null> {
  try {
    const text = await navigator.clipboard.readText();
    const data = JSON.parse(text);
    if (validateSavedData(data)) {
      return migrateDataVersion(data);
    }
    return null;
  } catch (error) {
    console.error("Error loading from clipboard:", error);
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isExpression(value: unknown): boolean {
  if (!isRecord(value) || typeof value.type !== "string") return false;
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
  if (!isRecord(value) || typeof value.type !== "string") return false;
  if (typeof value.field !== "string") return false;
  if (value.type === "value") {
    return Array.isArray(value.values);
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

function isVector3(value: unknown): boolean {
  return (
    isRecord(value) &&
    isFiniteNumber(value.x) &&
    isFiniteNumber(value.y) &&
    isFiniteNumber(value.z)
  );
}

function isChart(value: unknown): boolean {
  if (!isRecord(value)) return false;
  const layout = value.layout;
  const facet = value.facet;
  return (
    typeof value.id === "string" &&
    typeof value.type === "string" &&
    typeof value.title === "string" &&
    typeof value.field === "string" &&
    isRecord(layout) &&
    isFiniteNumber(layout.x) &&
    isFiniteNumber(layout.y) &&
    isFiniteNumber(layout.w) &&
    isFiniteNumber(layout.h) &&
    isRecord(facet) &&
    typeof facet.enabled === "boolean" &&
    (facet.type === "grid" || facet.type === "wrap") &&
    Array.isArray(value.filters) &&
    value.filters.every(isFilter) &&
    (value.type !== "3d-scatter" ||
      (isVector3(value.cameraPosition) && isVector3(value.cameraTarget)))
  );
}

function isColorScale(value: unknown): boolean {
  if (!isRecord(value)) return false;
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

  const { charts, calculations, gridSettings, metadata, colorScales } =
    data;

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
  } catch (error) {
    console.error("Error saving raw data to clipboard:", error);
    throw new Error("Failed to save raw data to clipboard");
  }
}
