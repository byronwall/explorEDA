import type { ChartAnnotation } from "./types";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const optionalString = (value: unknown) =>
  value === undefined || typeof value === "string";

const optionalBoolean = (value: unknown) =>
  value === undefined || typeof value === "boolean";

function isAttachment(value: unknown) {
  if (!isRecord(value)) return false;
  if (value.kind === "coordinate")
    return isFiniteNumber(value.x) && isFiniteNumber(value.y);
  return (
    value.kind === "record" &&
    Array.isArray(value.keyFields) &&
    value.keyFields.every((field) => typeof field === "string") &&
    Array.isArray(value.key) &&
    value.key.every(
      (item) => typeof item === "string" || isFiniteNumber(item)
    ) &&
    optionalString(value.yField)
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
  return false;
}

export function isChartAnnotations(value: unknown) {
  return (
    value === undefined ||
    (Array.isArray(value) && value.every(isChartAnnotation))
  );
}
