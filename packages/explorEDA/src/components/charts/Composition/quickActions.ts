import {
  markScaleIds,
  type CompositionDefinition,
  type CompositionElement,
  type MarkDefinition,
  type UnitElement,
} from "./compositionTypes";
import type { CompositionMode } from "./compositionEditorStore";
import { describeMark } from "./markSummary";
import type { SceneNode } from "./resolveComposition";

/** What a quick action can do; the chart wires these to its stores. */
export interface QuickActionApi {
  /** Selects an element, or one repeat of a unit, and shows its properties. */
  edit: (elementId: string, instanceKey?: string) => void;
  /** Selects the unit and scrolls its editor to this mark. */
  editMark: (elementId: string, markId: string) => void;
  /** Opens this scale's settings. */
  editScale: (scaleId: string) => void;
  trace: (id: string) => void;
  filterRepeat: (field: string, key: string) => void;
  clearFilters: () => void;
  remove: (elementId: string) => void;
}

export interface QuickAction {
  id: string;
  label: string;
  /** A second line that says what the action reaches. */
  detail?: string;
  destructive?: boolean;
  run: (api: QuickActionApi) => void;
}

export interface QuickActionContext {
  definition: CompositionDefinition;
  mode: CompositionMode;
  /** The drawn object under the pointer, when there is one. */
  node?: SceneNode;
  /** Whether this composition filters the workspace by a repeat now. */
  hasFilters: boolean;
}

/** The element a drawn node belongs to. */
export function elementOfNode(
  definition: CompositionDefinition,
  node: SceneNode | undefined
): CompositionElement | undefined {
  return definition.elements.find((element) => element.id === node?.elementId);
}

/** The mark behind a drawn node, when it is a unit's mark. */
export function markOfNode(
  element: CompositionElement | undefined,
  node: SceneNode | undefined
): MarkDefinition | undefined {
  if (element?.kind !== "unit" || !node) return undefined;
  const markId =
    (node.type === "rect" || node.type === "circle") && node.glyph
      ? node.glyph.markId
      : node.type === "path"
        ? node.path.markId
        : node.type === "area"
          ? node.band.markId
          : node.key.split(":")[2];
  return element.marks.find((mark) => mark.id === markId);
}

/** The trace id of a drawn node, the same one Alt-click opens. */
export function traceIdOf(
  node: SceneNode | undefined,
  element: CompositionElement | undefined
): string | undefined {
  if (!node) return undefined;
  if ((node.type === "rect" || node.type === "circle") && node.glyph)
    return `glyph:${node.key}`;
  if (node.type === "path") return `path:${node.key}`;
  if (node.type === "area") return `band:${node.key}`;
  if (element?.kind === "unit" && node.instanceKey !== undefined)
    return `repeat:${element.id}:${node.instanceKey}`;
  if (element?.kind === "guide" || element?.kind === "annotation")
    return `element:${element.id}`;
  return undefined;
}

/**
 * The actions a right-click on the artboard offers, most specific first:
 * the mark under the pointer, its scales, the repeat, the element, then the
 * composition. Every action names what it reaches, so a menu reads as a
 * map of the object.
 */
export function quickActions(context: QuickActionContext): QuickAction[] {
  const { definition, node, mode, hasFilters } = context;
  const element = elementOfNode(definition, node);
  const mark = markOfNode(element, node);
  const unit = element?.kind === "unit" ? (element as UnitElement) : undefined;
  const actions: QuickAction[] = [];
  const instanceKey = node?.instanceKey;
  const repeatLabel =
    unit && instanceKey !== undefined && instanceKey !== "all"
      ? `${unit.repeat.field ?? "repeat"} = ${instanceKey}`
      : undefined;

  if (unit && mark) {
    actions.push({
      id: `mark:${mark.id}`,
      label: `Edit mark: ${mark.name}`,
      detail: describeMark(mark, definition),
      run: (api) => api.editMark(unit.id, mark.id),
    });
    for (const scaleId of markScaleIds(mark)) {
      const scale = definition.scales.find((item) => item.id === scaleId);
      if (!scale) continue;
      actions.push({
        id: `scale:${scale.id}`,
        label: `Edit scale: ${scale.name}`,
        detail:
          scale.kind === "numeric"
            ? `Numeric · ${scale.field} · ${scale.domain}`
            : scale.kind === "position"
              ? `Position · ${scale.field}`
              : `Colors · ${scale.colors.length} stops`,
        run: (api) => api.editScale(scale.id),
      });
    }
  }
  if (unit) {
    actions.push({
      id: `unit:${unit.id}`,
      label: `Edit unit: ${unit.name}`,
      detail: unit.repeat.field
        ? `Repeats by ${unit.repeat.field} · ${unit.marks.length} ${
            unit.marks.length === 1 ? "mark" : "marks"
          }`
        : `${unit.marks.length} ${unit.marks.length === 1 ? "mark" : "marks"}`,
      run: (api) => api.edit(unit.id),
    });
    if (repeatLabel)
      actions.push({
        id: `repeat:${unit.id}:${instanceKey}`,
        label: `Edit this repeat alone: ${instanceKey}`,
        detail: "Move or accent it apart from the template",
        run: (api) => api.edit(unit.id, instanceKey),
      });
  } else if (element) {
    const kind = element.kind[0]!.toUpperCase() + element.kind.slice(1);
    actions.push({
      id: `element:${element.id}`,
      label: `Edit ${element.kind}: ${element.name}`,
      detail: kind,
      run: (api) => api.edit(element.id),
    });
  }
  const traceId = traceIdOf(node, element);
  if (traceId)
    actions.push({
      id: `trace:${traceId}`,
      label: "Trace: how this is drawn from the data",
      detail: "The rows, scales, and calculations behind it",
      run: (api) => api.trace(traceId),
    });
  if (mode === "view" && unit?.repeat.field && repeatLabel)
    actions.push({
      id: `filter:${instanceKey}`,
      label: `Filter the workspace: ${repeatLabel}`,
      run: (api) => api.filterRepeat(unit.repeat.field!, instanceKey!),
    });
  if (mode === "view" && hasFilters)
    actions.push({
      id: "clear-filters",
      label: "Clear this composition's filters",
      run: (api) => api.clearFilters(),
    });
  if (element && mode === "edit")
    actions.push({
      id: `remove:${element.id}`,
      label: `Remove ${element.kind}: ${element.name}`,
      destructive: true,
      run: (api) => api.remove(element.id),
    });
  return actions;
}
