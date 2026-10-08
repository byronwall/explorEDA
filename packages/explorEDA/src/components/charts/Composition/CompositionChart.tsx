import { useMemo, useRef, useState } from "react";
import { useDataLayer } from "@/providers/DataLayerProvider";
import type { BaseChartProps } from "@/types/ChartTypes";
import { ChartMessage } from "../ChartMessage";
import { useGetAllIds, useGetLiveIds } from "../useGetLiveData";
import { moveElement } from "./compositionEdits";
import {
  useCompositionEditor,
  useCompositionEditorStore,
} from "./compositionEditorStore";
import { CompositionSvg } from "./CompositionSvg";
import { normalizeComposition } from "./compositionTypes";
import type { CompositionSettings } from "./definition";
import { measureCompositionText } from "./measureText";
import {
  resolveComposition,
  type Bounds,
  type ResolvedElement,
} from "./resolveComposition";

interface Drag {
  elementId: string;
  startX: number;
  startY: number;
  dx: number;
  dy: number;
}

export function CompositionChart({
  settings,
  width,
  height,
  onSettingsChange,
}: BaseChartProps<CompositionSettings>) {
  const definition = useMemo(
    () => normalizeComposition(settings.composition),
    [settings.composition]
  );
  const updateChart = useDataLayer((state) => state.updateChart);
  const { mode, selection } = useCompositionEditor(settings.id);
  const select = useCompositionEditorStore((state) => state.select);
  const editing = mode === "edit";
  const [drag, setDrag] = useState<Drag>();
  const svgRef = useRef<SVGSVGElement>(null);

  const liveIds = useGetLiveIds(settings);
  const allIds = useGetAllIds(settings);
  const getColumnData = useDataLayer((state) => state.getColumnData);
  const nonce = useDataLayer((state) => state.nonce);
  const data = useMemo(
    () => ({ allIds, liveIds, column: getColumnData }),
    // Calculated columns change with the nonce.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allIds, liveIds, getColumnData, nonce]
  );
  const scene = useMemo(
    () => resolveComposition(definition, measureCompositionText, data),
    [definition, data]
  );

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
        Open details to compose a graphic from text, chart units, and guides.
      </ChartMessage>
    );
  }

  const toArtboard = (event: React.PointerEvent) => ({
    x: event.clientX / scale,
    y: event.clientY / scale,
  });

  const startDrag = (event: React.PointerEvent, element: ResolvedElement) => {
    if (event.button !== 0) return;
    event.stopPropagation();
    select(settings.id, { elementId: element.id });
    const point = toArtboard(event);
    (event.currentTarget as Element).setPointerCapture?.(event.pointerId);
    setDrag({
      elementId: element.id,
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

  const endDrag = () => {
    if (!drag) return;
    // A press without movement only selects.
    if (Math.hypot(drag.dx, drag.dy) * scale > 2)
      commit(moveElement(definition, drag.elementId, drag.dx, drag.dy));
    setDrag(undefined);
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (!editing || !selection) return;
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
    commit(moveElement(definition, selection.elementId, delta[0]!, delta[1]!));
  };

  // While dragging, offset the element's drawing; the move saves on release.
  const offsets = drag && { [drag.elementId]: { dx: drag.dx, dy: drag.dy } };
  const offsetBounds = (element: ResolvedElement) => {
    const offset = offsets?.[element.id];
    return offset
      ? {
          ...element.bounds,
          x: element.bounds.x + offset.dx,
          y: element.bounds.y + offset.dy,
        }
      : element.bounds;
  };

  const selected = scene.elements.find(
    (element) => element.id === selection?.elementId
  );

  return (
    <div
      className="eda-composition"
      data-mode={mode}
      style={{ width, height }}
      onPointerDown={() => editing && select(settings.id, undefined)}
    >
      <CompositionSvg
        svgRef={svgRef}
        scene={scene}
        offsets={offsets}
        scale={scale}
        label={settings.title || "Composition"}
        className="eda-composition-artboard"
        tabIndex={editing ? 0 : undefined}
        aria-description={
          editing
            ? "Click an element to select it. Drag to move it, or use the arrow keys. Shift moves 10 pixels."
            : undefined
        }
        onKeyDown={onKeyDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={() => setDrag(undefined)}
      >
        {editing &&
          scene.elements.map((element) => {
            const bounds = offsetBounds(element);
            return (
              <rect
                key={element.id}
                className="eda-composition-hit"
                data-kind={element.kind}
                data-selected={
                  element.id === selection?.elementId || undefined
                }
                x={bounds.x - 3}
                y={bounds.y - 3}
                width={bounds.width + 6}
                height={bounds.height + 6}
                aria-label={`Select ${element.name}`}
                onPointerDown={(event) => startDrag(event, element)}
              />
            );
          })}
        {editing && selected && (
          <SelectionTag
            name={selected.name}
            bounds={offsetBounds(selected)}
            scale={scale}
          />
        )}
      </CompositionSvg>
    </div>
  );
}

/** Names the selected element above its box, at a constant screen size. */
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
