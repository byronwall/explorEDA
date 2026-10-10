import {
  isEmptyOverride,
  type CompositionDefinition,
  type CompositionElement,
  type InstanceOverride,
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
