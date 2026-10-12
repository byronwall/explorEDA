import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useDataLayer } from "@/providers/DataLayerProvider";
import type { BaseChartProps } from "@/types/ChartTypes";
import type { Filter } from "@/types/FilterTypes";
import { Maximize, PencilRuler, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChartDetailsStore } from "../../chartDetailsStore";
import { ChartMessage } from "../ChartMessage";
import { ChartReadout } from "../ChartReadout";
import {
  useChartTraceApi,
  useTraceRevision,
  useTraceSource,
} from "../trace/ChartTraceScope";
import { moveElement, removeElement, updateOverride } from "./compositionEdits";
import { CompositionQuickMenu } from "./CompositionQuickMenu";
import {
  elementOfNode,
  markOfNode,
  quickActions,
  traceIdOf,
  type QuickAction,
  type QuickActionApi,
} from "./quickActions";
import {
  useCompositionEditor,
  useCompositionEditorStore,
} from "./compositionEditorStore";
import { useArtboardZoom } from "./artboardZoom";
import { CompositionSvg } from "./CompositionSvg";
import { registerArtboard } from "./compositionOutput";
import { makeCompositionTraceSource } from "./compositionTrace";
import {
  findOverride,
  normalizeComposition,
  type CompositionDefinition,
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

/** True when an element's position is an offset from an anchor it follows. */
function isAnchored(definition: CompositionDefinition, id: string) {
  const element = definition.elements.find((item) => item.id === id);
  return (
    element?.kind === "guide" ||
    (element?.kind === "annotation" && element.anchor.kind !== "page")
  );
}

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
  const reveal = useCompositionEditorStore((state) => state.reveal);
  const setMode = useCompositionEditorStore((state) => state.setMode);
  const editing = mode === "edit";
  const [drag, setDrag] = useState<Drag>();
  const [menu, setMenu] = useState<{
    x: number;
    y: number;
    node?: SceneNode;
  }>();
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
  // An annotation attached to a frame or a glyph, and a guide's label, sit
  // at an offset from their anchor; dragging one re-resolves with the moved
  // offset, so the ring and leader stay on the anchor instead of floating.
  const anchoredDrag =
    drag &&
    drag.instanceKey === undefined &&
    isAnchored(definition, drag.elementId)
      ? drag
      : undefined;
  const drawn = useMemo(
    () =>
      anchoredDrag
        ? moveElement(
            definition,
            anchoredDrag.elementId,
            anchoredDrag.dx,
            anchoredDrag.dy
          )
        : definition,
    [definition, anchoredDrag]
  );
  const scene = useMemo(
    () => resolveComposition(drawn, measureCompositionText, data),
    [drawn, data]
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
  const zoomer = useArtboardZoom(svgRef, scene.width, scene.height, scale);
  const zoomed = zoomer.view.k !== 1;
  /** Screen pixels per artboard unit, after any zoom. */
  const unitSize = scale * zoomer.view.k;

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
    x: event.clientX / unitSize,
    y: event.clientY / unitSize,
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
    value !== undefined && Math.hypot(value.dx, value.dy) * unitSize > 2;

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
    // + and - zoom about the middle; 0 shows the whole artboard.
    if (!event.metaKey && !event.ctrlKey && !event.altKey) {
      if (event.key === "+" || event.key === "=") {
        event.preventDefault();
        zoomer.zoom(1.5);
        return;
      }
      if (event.key === "-") {
        event.preventDefault();
        zoomer.zoom(1 / 1.5);
        return;
      }
      if (event.key === "0" && zoomed) {
        event.preventDefault();
        zoomer.reset();
        return;
      }
    }
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
    if (zoomer.didPan()) return;
    const node = nodeAt(event);
    const element = definition.elements.find(
      (item) => item.id === node?.elementId
    );
    if (event.altKey) {
      const id = traceIdOf(node, element);
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
    toggleRepeatFilter(field, node.instanceKey);
  };

  /** Adds a repeat to this composition's value filter, or takes it out. */
  const toggleRepeatFilter = (field: string, key: string) => {
    const value = filterValue(key);
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

  // Right-click: a menu of what is under the pointer and where to edit it.
  // The keyboard's menu key lands at (0, 0), so it opens by the selection.
  const onContextMenu = (event: React.MouseEvent) => {
    if (onSettingsChange) return;
    event.preventDefault();
    const node = nodeAt(event);
    const rect = svgRef.current?.getBoundingClientRect();
    const fromKeyboard = event.clientX === 0 && event.clientY === 0;
    setMenu({
      x: fromKeyboard
        ? (rect?.left ?? 0) + (rect?.width ?? 0) / 2
        : event.clientX,
      y: fromKeyboard
        ? (rect?.top ?? 0) + (rect?.height ?? 0) / 2
        : event.clientY,
      node:
        node ??
        (fromKeyboard && selection
          ? scene.nodes.find((item) => item.elementId === selection.elementId)
          : undefined),
    });
  };
  // Opens the editor beside the artboard when none is showing.
  const ensureEditor = () => {
    const state = useCompositionEditorStore.getState().editors[settings.id];
    if (!state?.attached) openDetails(settings.id);
    else if (state.mode !== "edit") setMode(settings.id, "edit");
  };
  const quickApi: QuickActionApi = {
    edit: (elementId, instanceKey) => {
      ensureEditor();
      select(settings.id, { elementId, instanceKey });
    },
    editMark: (elementId, markId) => {
      ensureEditor();
      select(settings.id, { elementId });
      reveal(settings.id, { markId });
    },
    editScale: (scaleId) => {
      ensureEditor();
      reveal(settings.id, { scaleId });
    },
    trace: (id) => traceApi?.inspect(owner, "composition", id),
    filterRepeat: toggleRepeatFilter,
    clearFilters: () => updateChart(settings.id, { filters: [] }),
    remove: (elementId) => {
      select(settings.id, undefined);
      commit(removeElement(definition, elementId));
    },
  };
  const menuElement = menu && elementOfNode(definition, menu.node);
  const menuMark = menu && markOfNode(menuElement, menu.node);
  const menuHeading = menu
    ? [
        menuElement?.name ?? "Artboard",
        menuMark?.name,
        menu.node?.instanceKey !== undefined && menu.node.instanceKey !== "all"
          ? menu.node.instanceKey
          : undefined,
      ]
        .filter(Boolean)
        .join(" · ")
    : "";

  // While dragging, offset the drawing; the move saves on release.
  const offsets =
    drag && drag.instanceKey === undefined && !anchoredDrag
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
    hovered &&
    (hovered.type === "rect" ||
      hovered.type === "circle" ||
      hovered.type === "arc")
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
      onPointerDown={(event) =>
        editing && event.button === 0 && select(settings.id, undefined)
      }
      onContextMenu={onContextMenu}
    >
      {menu && (
        <CompositionQuickMenu
          x={menu.x}
          y={menu.y}
          heading={menuHeading}
          actions={quickActions({
            definition,
            mode,
            node: menu.node,
            hasFilters: settings.filters.length > 0,
          })}
          container={svgRef.current?.closest<HTMLElement>("[role='dialog']")}
          onRun={(action: QuickAction) => action.run(quickApi)}
          onClose={() => setMenu(undefined)}
        />
      )}
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
                  [
                    "Value",
                    glyph.missing ? "none" : readoutNumber(glyph.value),
                  ],
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
        view={zoomer.view}
        data-zoomed={zoomed || undefined}
        label={settings.title || "Composition"}
        className="eda-composition-artboard"
        tabIndex={0}
        aria-description={
          editing
            ? "Click an element to select it. Drag to move it, or use the arrow keys; Shift moves 10 pixels. In a selected chart unit, click a repeat to edit it alone."
            : "Click a repeat to filter by it, or empty space to clear. Alt-click a mark, or press Alt-Enter, to trace it."
        }
        onKeyDown={onKeyDown}
        onPointerDown={(event) => {
          // Viewing a zoomed artboard, a drag pans it.
          if (!editing) zoomer.startPan(event);
        }}
        onPointerMove={(event) => {
          if (!editing && zoomer.movePan(event)) return;
          onPointerMove(event);
          if (!editing) setHovered(nodeAt(event));
        }}
        onPointerLeave={() => setHovered(undefined)}
        onPointerUp={() => {
          endDrag();
          zoomer.endPan();
        }}
        onPointerCancel={() => {
          setDrag(undefined);
          zoomer.endPan();
        }}
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
            scale={unitSize}
          />
        )}
      </CompositionSvg>
      <ZoomControls
        zoomed={zoomed}
        onZoomIn={() => zoomer.zoom(1.5)}
        onZoomOut={() => zoomer.zoom(1 / 1.5)}
        onReset={zoomer.reset}
      />
    </div>
  );
}

/** Zoom buttons over the artboard's corner; they show on hover and while zoomed. */
function ZoomControls({
  zoomed,
  onZoomIn,
  onZoomOut,
  onReset,
}: {
  zoomed: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}) {
  return (
    <div
      className="eda-composition-zoom"
      data-zoomed={zoomed || undefined}
      role="group"
      aria-label="Zoom"
      onPointerDown={(event) => event.stopPropagation()}
    >
      <Button
        variant="ghost"
        size="icon"
        aria-label="Zoom in"
        tooltip="Zoom in on the graphic (+). Ctrl- or Command-scroll zooms at the pointer."
        onClick={onZoomIn}
      >
        <ZoomIn />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Zoom out"
        tooltip="Zoom out (-)"
        disabled={!zoomed}
        onClick={onZoomOut}
      >
        <ZoomOut />
      </Button>
      {zoomed && (
        <Button
          variant="ghost"
          size="icon"
          aria-label="Show the whole graphic"
          tooltip="Show the whole graphic (0). While zoomed, scroll or drag to pan."
          onClick={onReset}
        >
          <Maximize />
        </Button>
      )}
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
