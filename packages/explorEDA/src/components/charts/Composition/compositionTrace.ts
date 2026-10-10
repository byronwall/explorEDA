import type { TraceSource, TraceTarget } from "../trace/traceTypes";
import { describeCalc, type CalcResult } from "./calculations";
import {
  findOverride,
  markFields,
  type CompositionDefinition,
  type InstanceOverride,
  type NumericScale,
  type PositionScale,
  type UnitElement,
  type ValueScale,
  isXyMark,
} from "./compositionTypes";
import type {
  AreaNode,
  CircleNode,
  CompositionScene,
  PathNode,
  RectNode,
  ResolvedAnchor,
} from "./resolveComposition";
import type {
  BandDatum,
  CompositionData,
  GlyphDatum,
  PathDatum,
  ResolvedInstance,
} from "./resolveUnit";

/** Which template, subset, and override drew an object. */
export interface CompositionTrace {
  kind: "composition";
  id: string;
  revision: string;
  role: "glyph" | "path" | "band" | "repeat" | "guide" | "annotation";
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
    /** The numeric scales of a point mark. */
    x?: NumericScale;
    y?: NumericScale;
  };
  path?: {
    datum: PathDatum;
    markName: string;
    stroke: string;
    x?: NumericScale;
    y?: NumericScale;
    /** Each vertex in path order, with its coordinates. */
    vertices: { rowId: number; x: number; y: number }[];
  };
  band?: {
    datum: BandDatum;
    markName: string;
    fill: string;
    x?: NumericScale;
    y?: NumericScale;
    vertices: { rowId: number; lower: number; upper: number }[];
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
  revision: string,
  /** The rows behind the scene, so a band can show its bound values. */
  data?: Pick<CompositionData, "column">
): TraceSource {
  const glyphs = new Map<string, Glyph>();
  const paths = new Map<string, PathNode>();
  const areas = new Map<string, AreaNode>();
  for (const node of scene.nodes) {
    if ((node.type === "rect" || node.type === "circle") && node.glyph)
      glyphs.set(node.key, node);
    if (node.type === "path") paths.set(node.key, node);
    if (node.type === "area") areas.set(node.key, node);
  }
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
  const scale = (scaleId?: string) =>
    definition.scales.find((item) => item.id === scaleId);
  const fieldsOf = (unit: UnitElement) => {
    const fields = new Set<string>();
    if (unit.repeat.field) fields.add(unit.repeat.field);
    for (const mark of unit.marks) {
      if (mark.type === "strip") {
        const position = scale(mark.positionScaleId);
        if (position?.kind === "position") fields.add(position.field);
      } else if (isXyMark(mark)) {
        for (const id of [mark.xScaleId, mark.yScaleId]) {
          const axis = scale(id);
          if (axis?.kind === "numeric") fields.add(axis.field);
        }
      }
      for (const field of markFields(mark)) fields.add(field);
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
        const instance =
          node && unit && instanceOf(unit.id, node.glyph!.instanceKey);
        if (!node || !unit || !instance) return undefined;
        const mark = unit.marks.find((item) => item.id === node.glyph!.markId);
        const strip = mark?.type === "strip" ? mark : undefined;
        const point = mark?.type === "point" ? mark : undefined;
        const bar = mark?.type === "bar" ? mark : undefined;
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
            aggregation:
              strip?.aggregation ??
              bar?.aggregation ??
              (point ? "row" : "count"),
            measureField: strip?.measureField ?? bar?.measureField,
            fill: node.fill,
            position: scale(strip?.positionScaleId) as
              | PositionScale
              | undefined,
            value: scale(strip?.valueScaleId) as ValueScale | undefined,
            x: scale(point?.xScaleId) as NumericScale | undefined,
            y: scale(point?.yScaleId) as NumericScale | undefined,
          },
        };
      }
      if (role === "path") {
        const node = paths.get(rest.join(":"));
        const unit = node && units.get(node.elementId);
        const instance =
          node && unit && instanceOf(unit.id, node.path.instanceKey);
        if (!node || !unit || !instance) return undefined;
        const mark = unit.marks.find((item) => item.id === node.path.markId);
        const xy = mark?.type === "path" ? mark : undefined;
        const x = scale(xy?.xScaleId) as NumericScale | undefined;
        const y = scale(xy?.yScaleId) as NumericScale | undefined;
        // Coordinates come from the glyphs when a point mark shares the scales;
        // otherwise the path's own vertices, which lose their raw values.
        return {
          kind,
          id,
          revision,
          role: "path",
          elementName: unit.name,
          rowIds: node.path.rowIds,
          fields: fieldsOf(unit),
          unit: unitPart(unit, instance),
          path: {
            datum: node.path,
            markName: mark?.name ?? "Path",
            stroke: node.stroke,
            x,
            y,
            vertices: node.segments.flatMap((run) =>
              run.map((vertex) => ({
                rowId: vertex.rowId,
                x: vertex.x,
                y: vertex.y,
              }))
            ),
          },
        };
      }
      if (role === "band") {
        const node = areas.get(rest.join(":"));
        const unit = node && units.get(node.elementId);
        const instance =
          node && unit && instanceOf(unit.id, node.band.instanceKey);
        if (!node || !unit || !instance) return undefined;
        const mark = unit.marks.find((item) => item.id === node.band.markId);
        const band = mark?.type === "band" ? mark : undefined;
        const lowers = data?.column(node.band.lowerField) ?? {};
        const uppers = data?.column(node.band.upperField) ?? {};
        return {
          kind,
          id,
          revision,
          role: "band",
          elementName: unit.name,
          rowIds: node.band.rowIds,
          fields: fieldsOf(unit),
          unit: unitPart(unit, instance),
          band: {
            datum: node.band,
            markName: mark?.name ?? "Band",
            fill: node.fill,
            x: scale(band?.xScaleId) as NumericScale | undefined,
            y: scale(band?.yScaleId) as NumericScale | undefined,
            vertices: node.segments.flatMap((run) =>
              run.map((vertex) => ({
                rowId: vertex.rowId,
                lower: Number(lowers[vertex.rowId]),
                upper: Number(uppers[vertex.rowId]),
              }))
            ),
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
        const resolved = scene.elements.find((item) => item.id === element?.id);
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
      for (const [key, node] of paths)
        if (node.path.rowIds.includes(sourceId))
          return { kind: "composition", id: `path:${key}` };
      for (const [key, node] of areas)
        if (node.band.rowIds.includes(sourceId))
          return { kind: "composition", id: `band:${key}` };
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
