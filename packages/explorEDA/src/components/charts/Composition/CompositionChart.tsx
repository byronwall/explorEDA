import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useDataLayer } from "@/providers/DataLayerProvider";
import type { BaseChartProps } from "@/types/ChartTypes";
import type { Filter } from "@/types/FilterTypes";
import { PencilRuler } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChartDetailsStore } from "../../chartDetailsStore";
import { ChartMessage } from "../ChartMessage";
import { ChartReadout } from "../ChartReadout";
import {
  useChartTraceApi,
  useTraceRevision,
  useTraceSource,
} from "../trace/ChartTraceScope";
import { moveElement, updateOverride } from "./compositionEdits";
import {
  useCompositionEditor,
  useCompositionEditorStore,
} from "./compositionEditorStore";
import { CompositionSvg } from "./CompositionSvg";
import { registerArtboard } from "./compositionOutput";
import { makeCompositionTraceSource } from "./compositionTrace";
import {
  findOverride,
  normalizeComposition,
  type UnitElement,
} from "./compositionTypes";
import type { CompositionSettings } from "./definition";
import { measureCompositionText } from "./measureText";
import {
  resolveComposition,
  type Bounds,
  type ResolvedElement,
  type SceneNode,
} from "./resolveComposition";
import { useCompositionData } from "./useCompositionData";

interface Drag {
  elementId: string;
  /** Set when the drag moves one repeat instead of its whole unit. */
  instanceKey?: string;
  startX: number;
  startY: number;
  dx: number;
  dy: number;
}

type ValueFilter = Extract<Filter, { type: "value" }>;

/** The repeat value a filter stores: missing values filter as null. */
const filterValue = (key: string) => (key === "Missing" ? null : key);

export function CompositionChart({
  settings,
  width,
  height,
  onSettingsChange,
}: BaseChartProps<CompositionSettings>) {
  const owner = useId();
  const definition = useMemo(
    () => normalizeComposition(settings.composition),
    [settings.composition]
  );
  const updateChart = useDataLayer((state) => state.updateChart);
  const openDetails = useChartDetailsStore((state) => state.open);
  const { mode, selection } = useCompositionEditor(settings.id);
  const select = useCompositionEditorStore((state) => state.select);
  const editing = mode === "edit";
  const [drag, setDrag] = useState<Drag>();
  const [hovered, setHovered] = useState<SceneNode>();
  const svgRef = useRef<SVGSVGElement>(null);
  const traceApi = useChartTraceApi();
  const revision = useTraceRevision(settings);

  const rows = useCompositionData(settings);
  const repeatFields = useMemo(
    () =>
      new Set(
        definition.elements.flatMap((element) =>
          element.kind === "unit" && element.repeat.field
            ? [element.repeat.field]
            : []
        )
      ),
    [definition.elements]
  );
  // The composition's own repeat filters fade the other repeats.
  const data = useMemo(() => {
    const filter = settings.filters.find(
      (item): item is ValueFilter =>
        item.type === "value" && repeatFields.has(item.field)
    );
    return filter
      ? {
          ...rows,
          selection: {
            field: filter.field,
            keys: new Set(
              filter.values.map((value) =>
                value === null || value === undefined
                  ? "Missing"
                  : String(value)
              )
            ),
          },
        }
      : rows;
  }, [rows, settings.filters, repeatFields]);
  const scene = useMemo(
    () => resolveComposition(definition, measureCompositionText, data),
    [definition, data]
  );
  // Output copies the drawn artboard, so it matches what is on screen.
  useEffect(
    () => registerArtboard(settings.id, svgRef.current),
    [settings.id, scene]
  );
  const source = useMemo(
    () => makeCompositionTraceSource(definition, scene, revision, data),
    [definition, scene, revision, data]
  );
  useTraceSource(owner, source);

  const commit = (composition: CompositionSettings["composition"]) => {
    if (onSettingsChange) onSettingsChange({ composition });
    else updateChart(settings.id, { composition });
  };

  // Fit the artboard; never enlarge it past twice its size.
  const pad = editing ? 16 : 0;
  const scale = Math.max(
    0.05,
    Math.min(
      (width - pad * 2) / scene.width,
      (height - pad * 2) / scene.height,
      2
    )
  );

  if (!editing && definition.elements.length === 0) {
    return (
      <ChartMessage width={width} height={height}>
        <span className="flex flex-col items-center gap-3">
          <span>Compose a graphic from text, chart units, and guides.</span>
          {/* A draft preview has no details view to open. */}
          {!onSettingsChange && (
            <Button
              size="sm"
              tooltip="Open the editor: the artboard beside its layers, scales, and calculations"
              onClick={() => openDetails(settings.id)}
            >
              <PencilRuler className="h-4 w-4" aria-hidden="true" />
              Open editor
            </Button>
          )}
        </span>
      </ChartMessage>
    );
  }

  const toArtboard = (event: React.PointerEvent) => ({
    x: event.clientX / scale,
    y: event.clientY / scale,
  });

  const startDrag = (
    event: React.PointerEvent,
    elementId: string,
    instanceKey?: string
  ) => {
    if (event.button !== 0) return;
    event.stopPropagation();
    const point = toArtboard(event);
    (event.currentTarget as Element).setPointerCapture?.(event.pointerId);
    setDrag({
      elementId,
      instanceKey,
      startX: point.x,
      startY: point.y,
      dx: 0,
      dy: 0,
    });
  };

  const onPointerMove = (event: React.PointerEvent) => {
    if (!drag) return;
    const point = toArtboard(event);
    setDrag({ ...drag, dx: point.x - drag.startX, dy: point.y - drag.startY });
  };

  const dragged = (value: Drag | undefined) =>
    value !== undefined && Math.hypot(value.dx, value.dy) * scale > 2;

  const endDrag = () => {
    if (!drag) return;
    if (dragged(drag) && drag.instanceKey !== undefined) {
      const current = findOverride(
        definition,
        drag.elementId,
        drag.instanceKey
      );
      commit(
        updateOverride(definition, drag.elementId, drag.instanceKey, {
          dx: Math.round((current?.dx ?? 0) + drag.dx),
          dy: Math.round((current?.dy ?? 0) + drag.dy),
        })
      );
    } else if (dragged(drag)) {
      commit(moveElement(definition, drag.elementId, drag.dx, drag.dy));
    }
    setDrag(undefined);
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (!editing) {
      // Alt-Enter traces the first selected repeat, or the first repeat.
      if (event.altKey && event.key === "Enter") {
        event.preventDefault();
        const unit = scene.elements.find((element) => element.kind === "unit");
        const instance =
          unit?.instances?.find((item) => data.selection?.keys.has(item.key)) ??
          unit?.instances?.[0];
        if (unit && instance)
          traceApi?.inspect(
            owner,
            "composition",
            `repeat:${unit.id}:${instance.key}`
          );
      }
      return;
    }
    if (!selection) return;
    const step = event.shiftKey ? 10 : 1;
    const delta = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    }[event.key];
    if (!delta) return;
    event.preventDefault();
    event.stopPropagation();
    if (selection.instanceKey !== undefined) {
      const current = findOverride(
        definition,
        selection.elementId,
        selection.instanceKey
      );
      commit(
        updateOverride(definition, selection.elementId, selection.instanceKey, {
          dx: (current?.dx ?? 0) + delta[0]!,
          dy: (current?.dy ?? 0) + delta[1]!,
        })
      );
    } else {
      commit(
        moveElement(definition, selection.elementId, delta[0]!, delta[1]!)
      );
    }
  };

  /** The scene node under a pointer event, from the drawn node's key. */
  const nodeAt = (event: React.MouseEvent) => {
    const key = (event.target as Element)
      .closest?.("[data-node]")
      ?.getAttribute("data-node");
    return key ? scene.nodes.find((node) => node.key === key) : undefined;
  };

  // Viewing: a click on a repeat selects it everywhere; Alt-click traces.
  const onViewClick = (event: React.MouseEvent) => {
    const node = nodeAt(event);
    const element = definition.elements.find(
      (item) => item.id === node?.elementId
    );
    if (event.altKey) {
      if (!node) return;
      const id =
        (node.type === "rect" || node.type === "circle") && node.glyph
          ? `glyph:${node.key}`
          : node.type === "path"
            ? `path:${node.key}`
            : node.type === "area"
              ? `band:${node.key}`
              : element?.kind === "unit" && node.instanceKey !== undefined
                ? `repeat:${element.id}:${node.instanceKey}`
                : element?.kind === "guide" || element?.kind === "annotation"
                  ? `element:${element.id}`
                  : undefined;
      if (id) traceApi?.inspect(owner, "composition", id);
      return;
    }
    const field =
      element?.kind === "unit"
        ? (element as UnitElement).repeat.field
        : undefined;
    if (!node || node.instanceKey === undefined || !field) {
      // Empty space clears this composition's filters.
      if (settings.filters.length) updateChart(settings.id, { filters: [] });
      return;
    }
    const value = filterValue(node.instanceKey);
    const current = settings.filters.find(
      (item): item is ValueFilter =>
        item.type === "value" && item.field === field
    );
    const values = current?.values ?? [];
    const nextValues = values.includes(value)
      ? values.filter((item) => item !== value)
      : [...values, value];
    updateChart(settings.id, {
      filters: [
        ...settings.filters.filter((item) => item !== current),
        ...(nextValues.length
          ? [{ type: "value" as const, field, values: nextValues }]
          : []),
      ],
    });
  };

  // While dragging, offset the drawing; the move saves on release.
  const offsets =
    drag && drag.instanceKey === undefined
      ? { [drag.elementId]: { dx: drag.dx, dy: drag.dy } }
      : undefined;
  const instanceOffset =
    drag && drag.instanceKey !== undefined
      ? {
          elementId: drag.elementId,
          instanceKey: drag.instanceKey,
          dx: drag.dx,
          dy: drag.dy,
        }
      : undefined;
  const shift = (bounds: Bounds, elementId: string, instanceKey?: string) => {
    const offset =
      offsets?.[elementId] ??
      (instanceOffset?.elementId === elementId &&
      instanceOffset.instanceKey === instanceKey
        ? instanceOffset
        : undefined);
    return offset
      ? { ...bounds, x: bounds.x + offset.dx, y: bounds.y + offset.dy }
      : bounds;
  };

  const selected = scene.elements.find(
    (element) => element.id === selection?.elementId
  );
  const selectedInstance =
    selection?.instanceKey !== undefined
      ? selected?.instances?.find((item) => item.key === selection.instanceKey)
      : undefined;

  const hit = (element: ResolvedElement) => {
    const bounds = shift(element.bounds, element.id);
    const isSelected = element.id === selection?.elementId;
    return (
      <rect
        key={element.id}
        className="eda-composition-hit"
        data-kind={element.kind}
        data-selected={(isSelected && !selectedInstance) || undefined}
        x={bounds.x - 3}
        y={bounds.y - 3}
        width={bounds.width + 6}
        height={bounds.height + 6}
        aria-label={`Select ${element.name}`}
        onPointerDown={(event) => {
          if (!isSelected) select(settings.id, { elementId: element.id });
          startDrag(event, element.id);
        }}
      />
    );
  };

  // A selected unit shows its repeats: click one to edit it alone, then drag
  // it to nudge it. Dragging a repeat that is not selected moves the unit.
  const instanceHits =
    selected?.kind === "unit"
      ? (selected.instances ?? []).map((instance) => {
          const isSelected = instance.key === selection?.instanceKey;
          const bounds = shift(instance.bounds, selected.id, instance.key);
          return (
            <rect
              key={`${selected.id}:${instance.key}`}
              className="eda-composition-instance"
              data-selected={isSelected || undefined}
              data-overridden={
                findOverride(definition, selected.id, instance.key)
                  ? ""
                  : undefined
              }
              x={bounds.x - 2}
              y={bounds.y - 1}
              width={bounds.width + 4}
              height={bounds.height + 2}
              aria-label={`Select repeat ${instance.label || instance.key}`}
              onPointerDown={(event) =>
                startDrag(
                  event,
                  selected.id,
                  isSelected ? instance.key : undefined
                )
              }
              onClick={() => {
                if (!dragged(drag))
                  select(settings.id, {
                    elementId: selected.id,
                    instanceKey: instance.key,
                  });
              }}
            />
          );
        })
      : null;

  const glyph =
    hovered && (hovered.type === "rect" || hovered.type === "circle")
      ? hovered.glyph
      : undefined;
  const hoveredField = definition.elements.find(
    (element): element is UnitElement =>
      element.kind === "unit" && element.id === hovered?.elementId
  )?.repeat.field;

  return (
    <div
      className="eda-composition"
      data-mode={mode}
      style={{ width, height }}
      onPointerDown={() => editing && select(settings.id, undefined)}
    >
      {!editing && glyph && (
        <ChartReadout fallbackClassName="eda-chart-readout-inline">
          {[
            ...(hoveredField ? [[hoveredField, glyph.instanceKey]] : []),
            ...(glyph.point
              ? [
                  [glyph.point.xField, readoutNumber(glyph.point.x)],
                  [glyph.point.yField, readoutNumber(glyph.point.y)],
                  ["Order", glyph.bin.label],
                ]
              : [
                  ["Bin", glyph.bin.label],
                  ["Value", readoutNumber(glyph.value)],
                ]),
            ["Rows", glyph.rowIds.length.toLocaleString()],
          ].map(([name, value]) => (
            <span key={name} className="eda-readout-item">
              <span>{name}</span>
              <b>{value}</b>
            </span>
          ))}
        </ChartReadout>
      )}
      <CompositionSvg
        svgRef={svgRef}
        scene={scene}
        offsets={offsets}
        instanceOffset={instanceOffset}
        scale={scale}
        label={settings.title || "Composition"}
        className="eda-composition-artboard"
        tabIndex={0}
        aria-description={
          editing
            ? "Click an element to select it. Drag to move it, or use the arrow keys; Shift moves 10 pixels. In a selected chart unit, click a repeat to edit it alone."
            : "Click a repeat to filter by it, or empty space to clear. Alt-click a mark, or press Alt-Enter, to trace it."
        }
        onKeyDown={onKeyDown}
        onPointerMove={(event) => {
          onPointerMove(event);
          if (!editing) setHovered(nodeAt(event));
        }}
        onPointerLeave={() => setHovered(undefined)}
        onPointerUp={endDrag}
        onPointerCancel={() => setDrag(undefined)}
        onClick={editing ? undefined : onViewClick}
      >
        {editing && scene.elements.map(hit)}
        {editing && instanceHits}
        {editing && selected && (
          <SelectionTag
            name={
              selectedInstance
                ? `${selected.name} · ${selectedInstance.label || selectedInstance.key}`
                : selected.name
            }
            bounds={shift(
              selectedInstance?.bounds ?? selected.bounds,
              selected.id,
              selectedInstance?.key
            )}
            scale={scale}
          />
        )}
      </CompositionSvg>
    </div>
  );
}

const readoutNumber = (value: number) =>
  value.toLocaleString("en-US", { maximumFractionDigits: 2 });

/** Names the selection above its box, at a constant screen size. */
function SelectionTag({
  name,
  bounds,
  scale,
}: {
  name: string;
  bounds: Bounds;
  scale: number;
}) {
  const fontSize = 11 / scale;
  const y = Math.max(fontSize + 2 / scale, bounds.y - 6 / scale);
  return (
    <text
      className="eda-composition-tag"
      x={bounds.x - 3}
      y={y}
      fontSize={fontSize}
    >
      {name}
    </text>
  );
}
