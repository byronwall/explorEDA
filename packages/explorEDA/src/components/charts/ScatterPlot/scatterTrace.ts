import { convertFieldValue } from "@/lib/fieldSettings";
import type { FieldProfile } from "@/lib/fieldProfiles";
import type {
  CalculationManager,
  RowCalculationTrace,
} from "@/lib/calculations/CalculationState";
import { categoryKey } from "@/lib/categories";
import type { datum } from "@/types/ChartTypes";
import type { ScatterPlotSettings } from "./definition";
import {
  planScatterOverlay,
  scatterHoverReadout,
  type ScatterPlan,
  type ScatterSnapshot,
} from "./scatterPlan";
import type { ScatterSelection } from "./ScatterTraceContext";
import type { FacetLayoutPlan } from "../FacetRelated/facetLayout";

export interface FieldTrace {
  field: string;
  raw?: datum;
  prepared: datum;
  conversion?: { type: string; error?: string };
  calculation?: RowCalculationTrace;
  sources: {
    field: string;
    raw: datum;
    prepared: datum;
    conversion?: { type: string; error?: string };
  }[];
}

export type ScatterTrace =
  | {
      kind: "point";
      id: string;
      revision: string;
      sourceId: number;
      x: FieldTrace & { pixel: number };
      y: FieldTrace & { pixel: number };
      color?: FieldTrace & { mapped: string; rendered: string };
      facet?: {
        type: "grid" | "wrap";
        row: FieldTrace;
        column?: FieldTrace;
        sourceRows: number;
        chartRows: number;
      };
      radius: number;
      opacity: number;
      passesOwnFilter: boolean;
      passesAllFilters: boolean;
      hover: ReturnType<typeof scatterHoverReadout>;
    }
  | {
      kind: "badge";
      id: string;
      revision: string;
      badge: ScatterPlan["calculatedBadges"][number];
    }
  | {
      kind: "excluded";
      id: string;
      revision: string;
      sourceId: number;
      reason: string;
      x: FieldTrace;
      y: FieldTrace;
    }
  | {
      kind: "guide";
      id: string;
      revision: string;
      detail: ScatterPlan["guideDetails"][string];
      primitive: ScatterPlan["axes"][number];
      field: string;
      scale: ScatterPlan["xScale"];
      sourceBounds: [number, number];
      population: number;
      buffer: number;
      refs: string[];
      policy: ScatterPlan["guidePolicy"];
    }
  | {
      kind: "legend";
      id: string;
      revision: string;
      legend: NonNullable<ScatterPlan["legend"]>;
      item?: NonNullable<ScatterPlan["legend"]>["items"][number];
      rowIds: number[];
      numericalPlan?: NonNullable<ScatterSelection["numericalPlan"]>;
    }
  | {
      kind: "title";
      id: string;
      revision: string;
      text: string;
      source: "chart-setting" | "field-label";
      field?: string;
    }
  | {
      kind: "facet";
      id: string;
      revision: string;
      role: "panel" | "row-heading" | "column-heading";
      row?: {
        field: string;
        value: datum;
        label: string;
        raw?: datum;
        sampleSourceId?: number;
        calculation?: RowCalculationTrace;
      };
      column?: {
        field: string;
        value: datum;
        label: string;
        raw?: datum;
        sampleSourceId?: number;
        calculation?: RowCalculationTrace;
      };
      layout: FacetLayoutPlan;
      sourceIds: number[];
      chartIds: number[];
    }
  | {
      kind: "overlay";
      id: string;
      revision: string;
      primitive: ScatterPlan["axes"][number];
      extent: ScatterPlan["brushExtent"];
      filters: ScatterPlotSettings["filters"];
    };

function sourceFields(trace: RowCalculationTrace): string[] {
  const calculated = new Set(trace.dependencies.map((item) => item.field));
  return [
    ...new Set([
      ...trace.inputs
        .filter((item) => !calculated.has(item.field))
        .map((item) => item.field),
      ...trace.dependencies.flatMap(sourceFields),
    ]),
  ];
}

export function resolveScatterTrace(
  selection: ScatterSelection,
  plan: ScatterPlan,
  snapshot: ScatterSnapshot,
  settings: ScatterPlotSettings,
  rawRows: Record<string, datum>[],
  preparedRows: Record<string, datum>[],
  profiles: FieldProfile[],
  manager: CalculationManager<Record<string, datum>>
): ScatterTrace | undefined {
  if (selection.plan && selection.plan !== plan) return undefined;
  if (selection.kind === "title") {
    return {
      kind: "title",
      id: selection.id,
      revision: plan.revision,
      text: plan.title,
      source: settings.title.trim() ? "chart-setting" : "field-label",
      field: settings.title.trim() ? undefined : settings.yField,
    };
  }
  if (selection.kind === "badge") {
    const badge = plan.calculatedBadges.find(
      (item) => item.id === selection.id
    );
    if (!badge) return undefined;
    return { kind: "badge", id: badge.id, revision: plan.revision, badge };
  }
  if (selection.kind === "facet") return selection.trace;
  if (selection.kind === "overlay") {
    const primitive = planScatterOverlay(
      plan,
      plan.brushExtent,
      null
    ).brush.find((item) => item.id === selection.id);
    if (!primitive) return undefined;
    return {
      kind: "overlay",
      id: selection.id,
      revision: plan.revision,
      primitive,
      extent: plan.brushExtent,
      filters: settings.filters.filter(
        (filter) =>
          filter.type === "range" &&
          (filter.field === settings.xField || filter.field === settings.yField)
      ),
    };
  }
  const conversionFor = (field: string, raw: datum) => {
    const fieldSetting = snapshot.fieldSettings[field] ?? {};
    const applied = Boolean(
      fieldSetting.type ||
        fieldSetting.datePreset ||
        fieldSetting.nullTokens?.length
    );
    const type =
      fieldSetting.type ??
      profiles.find((item) => item.name === field)?.dataType;
    return applied && type
      ? { type, error: convertFieldValue(raw, type, fieldSetting).error }
      : undefined;
  };
  const fieldTrace = (
    field: string,
    value: datum,
    sourceId: number
  ): FieldTrace => {
    const raw = rawRows[sourceId]?.[field];
    const calculation = manager.traceRow(field, sourceId);
    const conversion = calculation ? undefined : conversionFor(field, raw);
    const sources = calculation
      ? sourceFields(calculation).map((name) => ({
          field: name,
          raw: rawRows[sourceId]?.[name],
          prepared: preparedRows[sourceId]?.[name],
          conversion: conversionFor(name, rawRows[sourceId]?.[name]),
        }))
      : [];
    return { field, raw, prepared: value, conversion, calculation, sources };
  };

  if (selection.kind === "point") {
    const point = plan.points.find((item) => item.id === selection.id);
    if (!point) return undefined;
    return {
      kind: "point",
      id: point.id,
      revision: plan.revision,
      sourceId: point.sourceId,
      x: {
        ...fieldTrace(settings.xField, point.xValue, point.sourceId),
        pixel: point.x,
      },
      y: {
        ...fieldTrace(settings.yField, point.yValue, point.sourceId),
        pixel: point.y,
      },
      color: settings.colorField
        ? {
            ...fieldTrace(
              settings.colorField,
              point.colorValue,
              point.sourceId
            ),
            mapped: point.mappedColor,
            rendered: point.color,
          }
        : undefined,
      facet:
        settings.facet.enabled && snapshot.facetIds?.length
          ? {
              type: settings.facet.type,
              row: fieldTrace(
                settings.facet.rowVariable,
                snapshot.facetRowData?.[point.sourceId],
                point.sourceId
              ),
              column:
                settings.facet.type === "grid"
                  ? fieldTrace(
                      settings.facet.columnVariable,
                      snapshot.facetColumnData?.[point.sourceId],
                      point.sourceId
                    )
                  : undefined,
              sourceRows: snapshot.facetIds.length,
              chartRows: plan.populations.facet,
            }
          : undefined,
      radius: point.radius,
      opacity: point.opacity,
      passesOwnFilter: point.passesOwnFilter,
      passesAllFilters: point.passesAllFilters,
      hover: scatterHoverReadout(plan, snapshot, settings, point),
    };
  }
  if (selection.kind === "excluded") {
    const sourceId = Number(selection.id);
    const exclusion = plan.exclusions.find(
      (item) => item.sourceId === sourceId
    );
    if (!exclusion) return undefined;
    return {
      kind: "excluded",
      id: selection.id,
      revision: plan.revision,
      sourceId,
      reason: exclusion.reason,
      x: fieldTrace(settings.xField, snapshot.xData[sourceId], sourceId),
      y: fieldTrace(settings.yField, snapshot.yData[sourceId], sourceId),
    };
  }
  if (selection.kind === "guide") {
    const detail = plan.guideDetails[selection.id];
    const primitive = [...plan.grid, ...plan.axes].find(
      (item) => item.id === selection.id
    );
    if (!detail || !primitive) return undefined;
    const axis = detail.axis;
    return {
      kind: "guide",
      id: selection.id,
      revision: plan.revision,
      detail,
      primitive,
      field: axis === "x" ? settings.xField : settings.yField,
      scale: axis === "x" ? plan.xScale : plan.yScale,
      sourceBounds: plan.domainInputs[axis],
      population: plan.rowSets.all.length,
      buffer: plan.domainInputs.buffer,
      refs: plan.guideRefs[selection.id] ?? [],
      policy: plan.guidePolicy,
    };
  }
  const legend = plan.legend;
  if (!legend) return undefined;
  const item = legend.items.find((entry) => entry.id === selection.id);
  if (selection.id !== "scale" && !item) return undefined;
  const rowIds = item
    ? snapshot.chartIds.filter(
        (id) => categoryKey(snapshot.colorData[id]) === item.id
      )
    : snapshot.chartIds;
  return {
    kind: "legend",
    id: selection.id,
    revision: plan.revision,
    legend,
    item,
    rowIds,
    numericalPlan: selection.numericalPlan,
  };
}
