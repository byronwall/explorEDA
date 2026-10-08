import type { CompositionDefinition } from "./compositionTypes";

type Value = Record<string, unknown>;

const isRecord = (value: unknown): value is Value =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const isNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);
const isString = (value: unknown): value is string => typeof value === "string";

function isPlaced(value: Value) {
  return (
    isString(value.id) &&
    value.id.length > 0 &&
    isString(value.name) &&
    isNumber(value.x) &&
    isNumber(value.y)
  );
}

function isTextElement(value: Value) {
  return (
    ["title", "subtitle", "note"].includes(value.role as string) &&
    isString(value.text) &&
    isNumber(value.width) &&
    value.width > 0 &&
    isNumber(value.fontSize) &&
    value.fontSize > 0 &&
    [400, 600, 700].includes(value.fontWeight as number) &&
    isString(value.color)
  );
}

function isElement(value: unknown) {
  if (!isRecord(value) || !isPlaced(value)) return false;
  switch (value.kind) {
    case "text":
      return isTextElement(value);
    default:
      return false;
  }
}

/** Checks a saved composition before it restores. */
export function isCompositionDefinition(
  value: unknown
): value is CompositionDefinition {
  if (!isRecord(value) || !isRecord(value.artboard)) return false;
  const { artboard, elements } = value;
  return (
    isNumber(artboard.width) &&
    artboard.width > 0 &&
    isNumber(artboard.height) &&
    artboard.height > 0 &&
    isString(artboard.background) &&
    Array.isArray(elements) &&
    elements.every(isElement) &&
    new Set(elements.map((element) => (element as Value).id)).size ===
      elements.length
  );
}
