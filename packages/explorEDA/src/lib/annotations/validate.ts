import type { ChartAnnotation } from "./types";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const optionalString = (value: unknown) =>
  value === undefined || typeof value === "string";

const optionalBoolean = (value: unknown) =>
  value === undefined || typeof value === "boolean";

const isPopulation = (value: unknown) =>
  value === "all" || value === "filtered";

const isStringList = (value: unknown) =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

const isKey = (value: unknown) =>
  Array.isArray(value) &&
  value.every((item) => typeof item === "string" || isFiniteNumber(item));

function isAttachment(value: unknown) {
  if (!isRecord(value)) return false;
  if (value.kind === "coordinate")
    return isFiniteNumber(value.x) && isFiniteNumber(value.y);
  if (value.kind === "query")
    return (
      (value.pick === "max" || value.pick === "min") &&
      optionalString(value.field) &&
      isPopulation(value.population)
    );
  return (
    value.kind === "record" &&
    isStringList(value.keyFields) &&
    isKey(value.key) &&
    optionalString(value.yField)
  );
}

function isCalculated(value: unknown) {
  return (
    value === undefined ||
    (isRecord(value) &&
      ["mean", "median", "min", "max"].includes(value.statistic as string) &&
      isPopulation(value.population))
  );
}

/** Checks one saved annotation, as restore does for every chart setting. */
export function isChartAnnotation(value: unknown): value is ChartAnnotation {
  if (
    !isRecord(value) ||
    typeof value.id !== "string" ||
    !optionalString(value.name) ||
    !optionalString(value.color) ||
    (value.hidden !== undefined && typeof value.hidden !== "boolean") ||
    (value.yAxis !== undefined &&
      value.yAxis !== "left" &&
      value.yAxis !== "right")
  )
    return false;
  if (value.type === "callout")
    return (
      typeof value.text === "string" &&
      isAttachment(value.attach) &&
      isRecord(value.offset) &&
      isFiniteNumber(value.offset.dx) &&
      isFiniteNumber(value.offset.dy) &&
      optionalBoolean(value.leader) &&
      optionalBoolean(value.arrow)
    );
  if (value.type === "reference-line")
    return (
      (value.axis === "x" || value.axis === "y") &&
      isFiniteNumber(value.value) &&
      isCalculated(value.calculated) &&
      optionalString(value.label) &&
      (value.lineStyle === undefined ||
        value.lineStyle === "solid" ||
        value.lineStyle === "dashed")
    );
  if (value.type === "band")
    return (
      (value.axis === "x" || value.axis === "y") &&
      isFiniteNumber(value.from) &&
      isFiniteNumber(value.to) &&
      optionalString(value.label) &&
      (value.display === undefined ||
        value.display === "fill" ||
        value.display === "bracket")
    );
  if (value.type === "interval")
    return (
      typeof value.lowerField === "string" &&
      typeof value.upperField === "string" &&
      typeof value.meaning === "string"
    );
  if (value.type === "region")
    return (
      (value.shape === "rect" || value.shape === "ellipse") &&
      [value.x0, value.x1, value.y0, value.y1].every(isFiniteNumber) &&
      optionalString(value.label)
    );
  if (value.type === "record-set")
    return (
      isStringList(value.keyFields) &&
      Array.isArray(value.keys) &&
      value.keys.every(isKey) &&
      optionalString(value.label) &&
      optionalString(value.yField)
    );
  return false;
}

export function isChartAnnotations(value: unknown) {
  return (
    value === undefined ||
    (Array.isArray(value) && value.every(isChartAnnotation))
  );
}
