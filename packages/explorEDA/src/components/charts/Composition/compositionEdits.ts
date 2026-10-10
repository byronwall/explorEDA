import type {
  CompositionDefinition,
  CompositionElement,
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
