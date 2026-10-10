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

const oneOf = (value: unknown, options: readonly unknown[]) =>
  options.includes(value);

function isFocus(value: unknown) {
  if (value === undefined) return true;
  if (!isRecord(value)) return false;
  return (
    value.kind === "repeat" ||
    (value.kind === "values" && isString(value.values))
  );
}

function isMark(value: unknown) {
  if (!isRecord(value) || !isString(value.id) || !isString(value.name))
    return false;
  if (value.type === "point")
    return (
      isString(value.xScaleId) &&
      (value.yScaleId === undefined || isString(value.yScaleId)) &&
      (value.colorField === undefined || isString(value.colorField)) &&
      (value.colors === undefined ||
        (Array.isArray(value.colors) && value.colors.every(isString))) &&
      (value.orderField === undefined || isString(value.orderField)) &&
      isNumber(value.radius) &&
      value.radius > 0 &&
      isString(value.fill) &&
      (value.labelField === undefined || isString(value.labelField)) &&
      isNumber(value.labelEvery) &&
      value.labelEvery >= 0 &&
      (value.labelValues === undefined || isString(value.labelValues)) &&
      (value.sizeField === undefined || isString(value.sizeField)) &&
      (value.show === undefined ||
        oneOf(value.show, ["all", "first", "last", "min", "max"])) &&
      (value.seriesField === undefined || isString(value.seriesField)) &&
      isFocus(value.focus) &&
      (value.mutedFill === undefined || isString(value.mutedFill)) &&
      (value.population === undefined ||
        oneOf(value.population, ["repeat", "composition"]))
    );
  if (value.type === "stack")
    return (
      isString(value.categoryField) &&
      oneOf(value.aggregation, ["count", "sum"]) &&
      (value.aggregation === "count" || isString(value.measureField)) &&
      typeof value.normalize === "boolean" &&
      oneOf(value.order, ["label", "total"]) &&
      Array.isArray(value.colors) &&
      value.colors.length > 0 &&
      value.colors.every(isString) &&
      isNumber(value.labelMinHeight) &&
      isNumber(value.inset) &&
      (value.xScaleId === undefined || isString(value.xScaleId))
    );
  if (value.type === "summary")
    return (
      isString(value.groupField) &&
      isString(value.measureField) &&
      isString(value.yScaleId) &&
      (value.valueScaleId === undefined || isString(value.valueScaleId)) &&
      isString(value.fill) &&
      isNumber(value.opacity) &&
      value.opacity > 0 &&
      value.opacity <= 1
    );
  if (value.type === "band")
    return (
      isString(value.xScaleId) &&
      isString(value.yScaleId) &&
      isString(value.orderField) &&
      isString(value.lowerField) &&
      isString(value.upperField) &&
      isString(value.fill) &&
      isNumber(value.opacity) &&
      value.opacity > 0 &&
      value.opacity <= 1
    );
  if (value.type === "path")
    return (
      isString(value.xScaleId) &&
      (value.yScaleId === undefined || isString(value.yScaleId)) &&
      isString(value.orderField) &&
      isString(value.stroke) &&
      isNumber(value.strokeWidth) &&
      value.strokeWidth > 0 &&
      (value.seriesField === undefined || isString(value.seriesField)) &&
      isFocus(value.focus) &&
      (value.mutedStroke === undefined || isString(value.mutedStroke)) &&
      (value.population === undefined ||
        oneOf(value.population, ["repeat", "composition"]))
    );
  // Marks saved before mark types existed have none; they are strips.
  return (
    (value.type === undefined || value.type === "strip") &&
    oneOf(value.shape, ["rect", "circle"]) &&
    isString(value.positionScaleId) &&
    isString(value.valueScaleId) &&
    oneOf(value.aggregation, ["count", "sum", "average"]) &&
    (value.aggregation === "count" || isString(value.measureField)) &&
    oneOf(value.encoding, ["color", "size", "height"]) &&
    isString(value.fill) &&
    isNumber(value.inset) &&
    (value.missing === undefined || isString(value.missing))
  );
}

function isUnitElement(value: Value) {
  const { frame, label, repeat, marks } = value;
  return (
    isRecord(frame) &&
    isNumber(frame.width) &&
    frame.width > 0 &&
    isNumber(frame.height) &&
    frame.height > 0 &&
    isRecord(label) &&
    typeof label.show === "boolean" &&
    isNumber(label.width) &&
    isNumber(label.fontSize) &&
    (label.valueCalcId === undefined || isString(label.valueCalcId)) &&
    typeof value.axis === "boolean" &&
    Array.isArray(marks) &&
    marks.every(isMark) &&
    isRecord(repeat) &&
    (repeat.field === undefined || isString(repeat.field)) &&
    oneOf(repeat.arrangement, ["rows", "columns", "grid", "tiles"]) &&
    (repeat.tileField === undefined || isString(repeat.tileField)) &&
    isNumber(repeat.columns) &&
    repeat.columns >= 1 &&
    isNumber(repeat.gap) &&
    oneOf(repeat.order, ["count", "label", "value"]) &&
    (repeat.orderCalcId === undefined || isString(repeat.orderCalcId)) &&
    (repeat.direction === undefined ||
      oneOf(repeat.direction, ["asc", "desc"])) &&
    isNumber(repeat.limit) &&
    repeat.limit >= 1
  );
}

function isScale(value: unknown) {
  if (!isRecord(value) || !isString(value.id) || !isString(value.name))
    return false;
  if (!oneOf(value.domain, ["shared", "instance"])) return false;
  if (value.kind === "position")
    return (
      isString(value.field) &&
      (value.interval === undefined ||
        oneOf(value.interval, ["day", "week", "month", "year"]))
    );
  if (value.kind === "numeric")
    return (
      isString(value.field) &&
      typeof value.zero === "boolean" &&
      typeof value.nice === "boolean" &&
      (value.min === undefined || isNumber(value.min)) &&
      (value.max === undefined || isNumber(value.max)) &&
      (value.transform === undefined ||
        oneOf(value.transform, ["linear", "log"]))
    );
  return (
    value.kind === "value" &&
    oneOf(value.transform, ["linear", "sqrt", "log"]) &&
    Array.isArray(value.colors) &&
    value.colors.length >= 2 &&
    value.colors.every(isString) &&
    (value.stops === undefined ||
      (Array.isArray(value.stops) &&
        value.stops.length === value.colors.length &&
        value.stops.every(
          (stop: unknown) => isNumber(stop) && stop >= 0 && stop <= 1
        ))) &&
    (value.center === undefined || isString(value.center))
  );
}

function isOverride(value: unknown) {
  return (
    isRecord(value) &&
    isString(value.unitId) &&
    isString(value.instanceKey) &&
    isNumber(value.dx) &&
    isNumber(value.dy) &&
    (value.accent === undefined || isString(value.accent)) &&
    (value.opacity === undefined ||
      (isNumber(value.opacity) &&
        value.opacity >= 0.1 &&
        value.opacity <= 1)) &&
    (value.emphasize === undefined || typeof value.emphasize === "boolean")
  );
}

function isCalculation(value: unknown) {
  return (
    isRecord(value) &&
    isString(value.id) &&
    isString(value.name) &&
    oneOf(value.aggregation, [
      "count",
      "sum",
      "average",
      "min",
      "max",
      "first",
      "last",
      "change",
      "difference",
    ]) &&
    (value.field === undefined || isString(value.field)) &&
    (value.orderField === undefined || isString(value.orderField)) &&
    oneOf(value.population, ["repeat", "composition"]) &&
    oneOf(value.filters, ["follow", "ignore"])
  );
}

function isGuideElement(value: Value) {
  const guide = value.value;
  return (
    isString(value.unitId) &&
    isString(value.label) &&
    isString(value.color) &&
    (value.axis === undefined || oneOf(value.axis, ["x", "y"])) &&
    (value.shade === undefined ||
      oneOf(value.shade, ["none", "after", "before"])) &&
    isRecord(guide) &&
    ((guide.kind === "constant" && isString(guide.value)) ||
      (guide.kind === "calc" && isString(guide.calcId)))
  );
}

function isAnchor(value: unknown) {
  if (!isRecord(value)) return false;
  switch (value.kind) {
    case "page":
      return true;
    case "frame":
      return (
        isString(value.unitId) &&
        isString(value.instanceKey) &&
        isNumber(value.fx) &&
        isNumber(value.fy)
      );
    case "data":
      return (
        isString(value.unitId) &&
        isString(value.instanceKey) &&
        isString(value.markId) &&
        oneOf(value.pick, ["max", "min", "first", "last", "at"]) &&
        (value.at === undefined || isString(value.at))
      );
    default:
      return false;
  }
}

function isAnnotationElement(value: Value) {
  return (
    isString(value.text) &&
    isAnchor(value.anchor) &&
    isNumber(value.fontSize) &&
    value.fontSize > 0 &&
    isString(value.color) &&
    typeof value.leader === "boolean"
  );
}

function isElement(value: unknown) {
  if (!isRecord(value) || !isPlaced(value)) return false;
  switch (value.kind) {
    case "text":
      return isTextElement(value);
    case "unit":
      return isUnitElement(value);
    case "guide":
      return isGuideElement(value);
    case "annotation":
      return isAnnotationElement(value);
    case "legend":
      return (
        isString(value.unitId) &&
        isString(value.markId) &&
        oneOf(value.direction, ["row", "column"]) &&
        isNumber(value.fontSize) &&
        value.fontSize > 0 &&
        isString(value.color) &&
        (value.width === undefined ||
          (isNumber(value.width) && value.width > 0))
      );
    default:
      return false;
  }
}

/** Checks a saved composition before it restores. */
export function isCompositionDefinition(
  value: unknown
): value is CompositionDefinition {
  if (!isRecord(value) || !isRecord(value.artboard)) return false;
  const {
    artboard,
    elements,
    scales = [],
    calculations = [],
    overrides = [],
  } = value;
  // Every mark must point at a scale of the right kind.
  const kinds = new Map(
    Array.isArray(scales)
      ? scales.map((scale) => [(scale as Value).id, (scale as Value).kind])
      : []
  );
  const marksResolve =
    Array.isArray(elements) &&
    elements.every(
      (element) =>
        !isRecord(element) ||
        element.kind !== "unit" ||
        !Array.isArray(element.marks) ||
        element.marks.every(
          (mark) =>
            isRecord(mark) &&
            (mark.type === "stack"
              ? mark.xScaleId === undefined ||
                kinds.get(mark.xScaleId) === "numeric"
              : mark.type === "summary"
                ? kinds.get(mark.yScaleId) === "numeric" &&
                  (mark.valueScaleId === undefined ||
                    kinds.get(mark.valueScaleId) === "value")
                : mark.type === "point" || mark.type === "path"
                  ? kinds.get(mark.xScaleId) === "numeric" &&
                    (mark.yScaleId === undefined ||
                      kinds.get(mark.yScaleId) === "numeric")
                  : mark.type === "band"
                    ? kinds.get(mark.xScaleId) === "numeric" &&
                      kinds.get(mark.yScaleId) === "numeric"
                    : kinds.get(mark.positionScaleId) === "position" &&
                      kinds.get(mark.valueScaleId) === "value")
        )
    );
  return (
    Array.isArray(overrides) &&
    overrides.every(isOverride) &&
    Array.isArray(calculations) &&
    calculations.every(isCalculation) &&
    Array.isArray(scales) &&
    scales.every(isScale) &&
    new Set(scales.map((scale) => (scale as Value).id)).size ===
      scales.length &&
    marksResolve &&
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
