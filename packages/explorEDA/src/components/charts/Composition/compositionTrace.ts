import type { TraceSource, TraceTarget } from "../trace/traceTypes";
import { describeCalc, type CalcResult } from "./calculations";
import {
  findOverride,
  type CompositionDefinition,
  type InstanceOverride,
  type PositionScale,
  type UnitElement,
  type ValueScale,
} from "./compositionTypes";
import type {
  CircleNode,
  CompositionScene,
  RectNode,
  ResolvedAnchor,
} from "./resolveComposition";
import type { GlyphDatum, ResolvedInstance } from "./resolveUnit";

/** Which template, subset, and override drew an object. */
export interface CompositionTrace {
  kind: "composition";
  id: string;
  revision: string;
  role: "glyph" | "repeat" | "guide" | "annotation";
  elementName: string;
  /** The rows behind the object. */
  rowIds: number[];
  /** The fields worth showing for those rows. */
  fields: string[];
  unit?: {
    name: string;
    repeatField?: string;
    instanceKey: string;
    rowCount: number;
    liveCount: number;
    override?: InstanceOverride;
  };
  glyph?: {
    datum: GlyphDatum;
    markName: string;
    aggregation: string;
    measureField?: string;
    fill: string;
    position?: PositionScale;
    value?: ValueScale;
  };
  labelValue?: CalcResult & { description: string };
  guide?: {
    source: "constant" | "calc";
    constant?: string;
    calcName?: string;
    description?: string;
    values: CalcResult[];
  };
  anchor?: ResolvedAnchor;
}

type Glyph = RectNode | CircleNode;

/** Resolves selections against the drawn scene of one composition. */
export function makeCompositionTraceSource(
  definition: CompositionDefinition,
  scene: CompositionScene,
  revision: string
): TraceSource {
  const glyphs = new Map<string, Glyph>();
  for (const node of scene.nodes)
    if ((node.type === "rect" || node.type === "circle") && node.glyph)
      glyphs.set(node.key, node);
  const units = new Map(
    definition.elements
      .filter((element): element is UnitElement => element.kind === "unit")
      .map((unit) => [unit.id, unit])
  );
  const instanceOf = (unitId: string, key: string) =>
    scene.elements
      .find((element) => element.id === unitId)
      ?.instances?.find((instance) => instance.key === key);

  const unitPart = (unit: UnitElement, instance: ResolvedInstance) => ({
    name: unit.name,
    repeatField: unit.repeat.field,
    instanceKey: instance.key,
    rowCount: instance.rowCount,
    liveCount: instance.liveCount,
    override: findOverride(definition, unit.id, instance.key),
  });
  const fieldsOf = (unit: UnitElement) => {
    const fields = new Set<string>();
    if (unit.repeat.field) fields.add(unit.repeat.field);
    for (const mark of unit.marks) {
      const scale = definition.scales.find(
        (item) => item.id === mark.positionScaleId
      );
      if (scale?.kind === "position") fields.add(scale.field);
      if (mark.measureField) fields.add(mark.measureField);
    }
    return [...fields];
  };

  return {
    role: "chart",
    revision,
    resolve(kind, id): CompositionTrace | undefined {
      if (kind !== "composition") return undefined;
      const [role, ...rest] = id.split(":");
      if (role === "glyph") {
        const node = glyphs.get(rest.join(":"));
        const unit = node && units.get(node.elementId);
        const instance = node && unit && instanceOf(unit.id, node.glyph!.instanceKey);
        if (!node || !unit || !instance) return undefined;
        const mark = unit.marks.find((item) => item.id === node.glyph!.markId);
        const scale = (scaleId?: string) =>
          definition.scales.find((item) => item.id === scaleId);
        return {
          kind,
          id,
          revision,
          role: "glyph",
          elementName: unit.name,
          rowIds: node.glyph!.rowIds,
          fields: fieldsOf(unit),
          unit: unitPart(unit, instance),
          glyph: {
            datum: node.glyph!,
            markName: mark?.name ?? "Mark",
            aggregation: mark?.aggregation ?? "count",
            measureField: mark?.measureField,
            fill: node.fill,
            position: scale(mark?.positionScaleId) as PositionScale | undefined,
            value: scale(mark?.valueScaleId) as ValueScale | undefined,
          },
        };
      }
      if (role === "repeat") {
        const [unitId, ...key] = rest;
        const unit = units.get(unitId!);
        const instance = unit && instanceOf(unit.id, key.join(":"));
        if (!unit || !instance) return undefined;
        const calc = definition.calculations.find(
          (item) => item.id === unit.label.valueCalcId
        );
        return {
          kind,
          id,
          revision,
          role: "repeat",
          elementName: unit.name,
          rowIds: instance.liveIds,
          fields: fieldsOf(unit),
          unit: unitPart(unit, instance),
          labelValue:
            instance.labelValue && calc
              ? { ...instance.labelValue, description: describeCalc(calc) }
              : undefined,
        };
      }
      if (role === "element") {
        const element = definition.elements.find(
          (item) => item.id === rest.join(":")
        );
        const resolved = scene.elements.find(
          (item) => item.id === element?.id
        );
        if (!element || !resolved) return undefined;
        if (element.kind === "guide") {
          const calc =
            element.value.kind === "calc"
              ? definition.calculations.find(
                  (item) =>
                    element.value.kind === "calc" &&
                    item.id === element.value.calcId
                )
              : undefined;
          const values = resolved.anchor?.values ?? [];
          return {
            kind,
            id,
            revision,
            role: "guide",
            elementName: element.name,
            rowIds: [...new Set(values.flatMap((value) => value.rowIds))],
            fields: calc?.field ? [calc.field] : [],
            guide: {
              source: element.value.kind,
              constant:
                element.value.kind === "constant"
                  ? element.value.value
                  : undefined,
              calcName: calc?.name,
              description: calc && describeCalc(calc),
              values,
            },
            anchor: resolved.anchor,
          };
        }
        if (element.kind === "annotation") {
          const glyph = resolved.anchor?.glyph;
          const unit =
            element.anchor.kind === "page"
              ? undefined
              : units.get(element.anchor.unitId);
          return {
            kind,
            id,
            revision,
            role: "annotation",
            elementName: element.name,
            rowIds: glyph?.rowIds ?? [],
            fields: unit ? fieldsOf(unit) : [],
            anchor: resolved.anchor,
          };
        }
      }
      return undefined;
    },
    findRow(sourceId) {
      for (const [key, node] of glyphs)
        if (node.glyph!.rowIds.includes(sourceId))
          return { kind: "composition", id: `glyph:${key}` };
      return undefined;
    },
    targets(): TraceTarget[] {
      const targets: TraceTarget[] = [];
      for (const element of scene.elements) {
        if (element.kind === "unit")
          for (const instance of element.instances ?? [])
            targets.push({
              kind: "composition",
              id: `repeat:${element.id}:${instance.key}`,
              label: instance.label || element.name,
            });
        else if (element.kind === "guide" || element.kind === "annotation")
          targets.push({
            kind: "composition",
            id: `element:${element.id}`,
            label: element.name,
          });
      }
      return targets;
    },
  };
}
