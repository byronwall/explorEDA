import {
  ensureNumericScale,
  isEmptyOverride,
  newScaleId,
  type BandMark,
  type CompositionDefinition,
  type CompositionElement,
  type DensityMark,
  type FieldChoice,
  type InstanceOverride,
  type MarkDefinition,
  type MarkType,
  type NumericScale,
  type PathMark,
  type PointMark,
  type PositionScale,
  isXyMark,
  type StackMark,
  type WaffleMark,
  type BarMark,
  type SummaryMark,
  STACK_COLORS,
  type UnitElement,
  type ValueScale,
} from "./compositionTypes";

export function updateElement<T extends CompositionElement>(
  definition: CompositionDefinition,
  id: string,
  patch: Partial<T>
): CompositionDefinition {
  return {
    ...definition,
    elements: definition.elements.map((element) =>
      element.id === id ? ({ ...element, ...patch } as T) : element
    ),
  };
}

export function removeElement(
  definition: CompositionDefinition,
  id: string
): CompositionDefinition {
  return {
    ...definition,
    elements: definition.elements.filter((element) => element.id !== id),
    // A unit's overrides go with it.
    overrides: definition.overrides.filter((item) => item.unitId !== id),
  };
}

/** Moves an element one step toward the front (+1) or back (-1) of the drawing order. */
export function reorderElement(
  definition: CompositionDefinition,
  id: string,
  step: 1 | -1
): CompositionDefinition {
  const index = definition.elements.findIndex((element) => element.id === id);
  const target = index + step;
  if (index < 0 || target < 0 || target >= definition.elements.length)
    return definition;
  const elements = [...definition.elements];
  [elements[index], elements[target]] = [elements[target]!, elements[index]!];
  return { ...definition, elements };
}

export function moveElement(
  definition: CompositionDefinition,
  id: string,
  dx: number,
  dy: number
): CompositionDefinition {
  const element = definition.elements.find((item) => item.id === id);
  if (!element) return definition;
  return updateElement(definition, id, {
    x: Math.round(element.x + dx),
    y: Math.round(element.y + dy),
  });
}

/** Merges a change into one repeat's override, dropping it once it is empty. */
export function updateOverride(
  definition: CompositionDefinition,
  unitId: string,
  instanceKey: string,
  patch: Partial<InstanceOverride>
): CompositionDefinition {
  const current = definition.overrides.find(
    (item) => item.unitId === unitId && item.instanceKey === instanceKey
  ) ?? { unitId, instanceKey, dx: 0, dy: 0 };
  const next = { ...current, ...patch };
  const others = definition.overrides.filter((item) => item !== current);
  return {
    ...definition,
    overrides: isEmptyOverride(next) ? others : [...others, next],
  };
}

/** Removes one repeat's override, so it follows the template again. */
export function resetOverride(
  definition: CompositionDefinition,
  unitId: string,
  instanceKey: string
): CompositionDefinition {
  return {
    ...definition,
    overrides: definition.overrides.filter(
      (item) => !(item.unitId === unitId && item.instanceKey === instanceKey)
    ),
  };
}

/** The one color a mark carries over when it changes type. */
function markColor(mark: MarkDefinition) {
  if (mark.type === "path") return mark.stroke;
  if (mark.type === "stack" || mark.type === "waffle" || mark.type === "bar")
    return mark.colors[0] ?? "#1f2328";
  if (mark.type === "density") return mark.fill;
  return mark.fill;
}

/**
 * Changes a mark to another type, keeping its name and ID. The new type
 * needs scales of its own kind, so missing ones are added: numeric scales for
 * the first two numeric fields, or a position and value scale for strips.
 */
export function convertMark(
  definition: CompositionDefinition,
  unit: UnitElement,
  markId: string,
  type: MarkType,
  fields: FieldChoice[]
): CompositionDefinition {
  const mark = unit.marks.find((item) => item.id === markId);
  if (!mark || mark.type === type) return definition;
  let next = definition;
  let replacement: MarkDefinition;
  if (type === "density") {
    const numeric = fields.filter((item) => item.dataType === "numeric");
    const field =
      next.scales.find(
        (scale): scale is NumericScale => scale.kind === "numeric"
      )?.field ?? numeric[0]?.name;
    if (!field) return definition;
    const withX = ensureNumericScale(next, field);
    const density: DensityMark = {
      type: "density",
      id: mark.id,
      name: mark.name,
      xScaleId: withX.scale.id,
      height: "shared",
      fill: markColor(mark),
      opacity: 0.8,
      stroke: "#1f2328",
    };
    return updateElement<UnitElement>(withX.definition, unit.id, {
      marks: unit.marks.map((item) => (item.id === markId ? density : item)),
    });
  }
  if (type === "stack") {
    const categoryField =
      fields.find(
        (item) =>
          item.dataType !== "numeric" &&
          item.uniqueCount >= 2 &&
          item.uniqueCount <= 30
      )?.name ?? fields[0]?.name;
    if (!categoryField) return definition;
    const measure = fields.find(
      (item) => item.dataType === "numeric" && item.name !== categoryField
    )?.name;
    const stack: StackMark = {
      type: "stack",
      id: mark.id,
      name: mark.name,
      categoryField,
      aggregation: measure ? "sum" : "count",
      measureField: measure,
      normalize: true,
      order: "total",
      colors: STACK_COLORS,
      labelMinHeight: 14,
      inset: 1,
    };
    return updateElement<UnitElement>(definition, unit.id, {
      marks: unit.marks.map((item) => (item.id === markId ? stack : item)),
    });
  }
  if (type === "bar") {
    const measure = fields.find((item) => item.dataType === "numeric")?.name;
    const categoryField = fields.find(
      (item) =>
        item.dataType !== "numeric" &&
        item.uniqueCount >= 2 &&
        item.uniqueCount <= 6
    )?.name;
    const bar: BarMark = {
      type: "bar",
      id: mark.id,
      name: mark.name,
      aggregation: measure ? "sum" : "count",
      measureField: measure,
      categoryField,
      order: "label",
      colors: categoryField ? STACK_COLORS : [markColor(mark)],
      inset: 1,
      labelMinWidth: 24,
    };
    return updateElement<UnitElement>(definition, unit.id, {
      marks: unit.marks.map((item) => (item.id === markId ? bar : item)),
    });
  }
  if (type === "waffle") {
    const categoryField =
      fields.find(
        (item) =>
          item.dataType !== "numeric" &&
          item.uniqueCount >= 2 &&
          item.uniqueCount <= 12
      )?.name ?? fields[0]?.name;
    if (!categoryField) return definition;
    const waffle: WaffleMark = {
      type: "waffle",
      id: mark.id,
      name: mark.name,
      categoryField,
      each: 1,
      normalize: false,
      columns: 10,
      gap: 2,
      from: "top",
      order: "total",
      colors: STACK_COLORS,
    };
    return updateElement<UnitElement>(definition, unit.id, {
      marks: unit.marks.map((item) => (item.id === markId ? waffle : item)),
    });
  }
  if (type === "summary") {
    const numeric = fields.filter((item) => item.dataType === "numeric");
    const groupField =
      fields.find(
        (item) =>
          item.dataType !== "numeric" &&
          item.uniqueCount >= 2 &&
          item.uniqueCount <= 6
      )?.name ??
      fields.find((item) => item.uniqueCount >= 2 && item.uniqueCount <= 6)
        ?.name ??
      fields[0]?.name;
    const measureField =
      numeric.find((item) => item.name !== groupField)?.name ??
      numeric[0]?.name;
    if (!groupField || !measureField) return definition;
    const withY = ensureNumericScale(next, measureField);
    next = withY.definition;
    const summary: SummaryMark = {
      type: "summary",
      id: mark.id,
      name: mark.name,
      groupField,
      measureField,
      yScaleId: withY.scale.id,
      fill: markColor(mark),
      opacity: 0.3,
    };
    return updateElement<UnitElement>(next, unit.id, {
      marks: unit.marks.map((item) => (item.id === markId ? summary : item)),
    });
  }
  if (type === "strip") {
    let position = next.scales.find(
      (scale): scale is PositionScale => scale.kind === "position"
    );
    if (!position) {
      const field =
        fields.find((item) => item.dataType === "datetime") ??
        fields.find((item) => item.uniqueCount <= 60) ??
        fields[0];
      if (!field) return definition;
      position = {
        id: newScaleId(next, "x"),
        kind: "position",
        name: field.name,
        field: field.name,
        interval: field.dataType === "datetime" ? "month" : undefined,
        domain: "shared",
      };
      next = { ...next, scales: [...next.scales, position] };
    }
    let value = next.scales.find(
      (scale): scale is ValueScale => scale.kind === "value"
    );
    if (!value) {
      value = {
        id: newScaleId(next, "value"),
        kind: "value",
        name: "Rows",
        domain: "shared",
        transform: "linear",
        colors: ["#e8eef6", "#1f4e8c"],
      };
      next = { ...next, scales: [...next.scales, value] };
    }
    replacement = {
      type: "strip",
      id: mark.id,
      name: mark.name,
      shape: "rect",
      positionScaleId: position.id,
      valueScaleId: value.id,
      aggregation: "count",
      encoding: "color",
      fill: markColor(mark),
      inset: 1,
    };
  } else {
    // A sibling x–y mark already names the scales; otherwise take the data's.
    const sibling = unit.marks.find(
      (item): item is PointMark | PathMark | BandMark =>
        isXyMark(item) && item.id !== markId
    );
    let xScaleId = sibling?.xScaleId;
    let yScaleId = sibling?.yScaleId;
    let orderField = sibling?.orderField;
    if (!xScaleId || !yScaleId) {
      const numeric = fields.filter((item) => item.dataType === "numeric");
      const existing = next.scales.filter(
        (scale): scale is NumericScale => scale.kind === "numeric"
      );
      const xField = existing[0]?.field ?? numeric[0]?.name;
      const yField =
        existing[1]?.field ??
        numeric.find((item) => item.name !== xField)?.name ??
        xField;
      if (!xField || !yField) return definition;
      const withX = ensureNumericScale(next, xField);
      const withY = ensureNumericScale(withX.definition, yField);
      next = withY.definition;
      xScaleId = withX.scale.id;
      yScaleId = withY.scale.id;
    }
    orderField ??=
      fields.find(
        (item) =>
          item.dataType === "numeric" &&
          /year|date|time|index|order|seq/i.test(item.name)
      )?.name ??
      fields.find((item) => item.dataType === "datetime")?.name ??
      fields.find((item) => item.dataType === "numeric")?.name ??
      "";
    const color = markColor(mark);
    const numericNames = fields
      .filter((item) => item.dataType === "numeric")
      .map((item) => item.name);
    const yField = next.scales.find(
      (scale): scale is NumericScale => scale.id === yScaleId
    )?.field;
    replacement =
      type === "band"
        ? {
            type: "band",
            id: mark.id,
            name: mark.name,
            xScaleId,
            yScaleId,
            orderField,
            // The y field stands in for both bounds until the author picks them.
            lowerField:
              numericNames.find((name) => /low|min|p10|lower/i.test(name)) ??
              yField ??
              numericNames[0] ??
              "",
            upperField:
              numericNames.find((name) => /high|max|p90|upper/i.test(name)) ??
              yField ??
              numericNames[0] ??
              "",
            fill: color,
            opacity: 0.25,
          }
        : type === "path"
          ? {
              type: "path",
              id: mark.id,
              name: mark.name,
              xScaleId,
              yScaleId,
              orderField,
              stroke: color,
              strokeWidth: 1.5,
              colorField: mark.type === "point" ? mark.colorField : undefined,
            }
          : {
              type: "point",
              id: mark.id,
              name: mark.name,
              xScaleId,
              yScaleId,
              orderField: orderField || undefined,
              radius: 3.5,
              fill: color,
              labelEvery: 0,
              colorField: mark.type === "path" ? mark.colorField : undefined,
            };
  }
  return updateElement<UnitElement>(next, unit.id, {
    marks: unit.marks.map((item) => (item.id === markId ? replacement : item)),
  });
}
