import type { ChartAnnotation } from "./types";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const optionalString = (value: unknown) =>
  value === undefined || typeof value === "string";

function isAttachment(value: unknown) {
  if (!isRecord(value)) return false;
  if (value.kind === "coordinate")
    return isFiniteNumber(value.x) && isFiniteNumber(value.y);
  return (
    value.kind === "record" &&
    Array.isArray(value.keyFields) &&
    value.keyFields.every((field) => typeof field === "string") &&
    Array.isArray(value.key) &&
    value.key.every((item) => typeof item === "string" || isFiniteNumber(item))
  );
}

/** Checks one saved annotation, as restore does for every chart setting. */
export function isChartAnnotation(value: unknown): value is ChartAnnotation {
  if (
    !isRecord(value) ||
    typeof value.id !== "string" ||
    !optionalString(value.name) ||
    !optionalString(value.color) ||
    (value.hidden !== undefined && typeof value.hidden !== "boolean")
  )
    return false;
  if (value.type === "callout")
    return (
      typeof value.text === "string" &&
      isAttachment(value.attach) &&
      isRecord(value.offset) &&
      isFiniteNumber(value.offset.dx) &&
      isFiniteNumber(value.offset.dy) &&
      (value.leader === undefined || typeof value.leader === "boolean")
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
  return false;
}

export function isChartAnnotations(value: unknown) {
  return (
    value === undefined ||
    (Array.isArray(value) && value.every(isChartAnnotation))
  );
}
