import { useMemo, useRef, useState } from "react";
import { useDataLayer } from "@/providers/DataLayerProvider";
import type { BaseChartProps } from "@/types/ChartTypes";
import { ChartMessage } from "../ChartMessage";
import { moveElement } from "./compositionEdits";
import {
  useCompositionEditor,
  useCompositionEditorStore,
} from "./compositionEditorStore";
import { CompositionSvg } from "./CompositionSvg";
import type { CompositionSettings } from "./definition";
import { measureCompositionText } from "./measureText";
import {
  resolveComposition,
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
  const definition = settings.composition;
  const updateChart = useDataLayer((state) => state.updateChart);
  const { mode, selection } = useCompositionEditor(settings.id);
  const select = useCompositionEditorStore((state) => state.select);
  const editing = mode === "edit";
  const [drag, setDrag] = useState<Drag>();
  const svgRef = useRef<SVGSVGElement>(null);

  const scene = useMemo(
    () => resolveComposition(definition, measureCompositionText),
    [definition]
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

  // While dragging, draw the moved definition so the result shows live.
  const shownScene =
    drag && (drag.dx || drag.dy)
      ? resolveComposition(
          moveElement(definition, drag.elementId, drag.dx, drag.dy),
          measureCompositionText
        )
      : scene;

  const selected = shownScene.elements.find(
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
        scene={shownScene}
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
          shownScene.elements.map((element) => (
            <rect
              key={element.id}
              className="eda-composition-hit"
              data-selected={element.id === selection?.elementId || undefined}
              x={element.bounds.x - 3}
              y={element.bounds.y - 3}
              width={element.bounds.width + 6}
              height={element.bounds.height + 6}
              aria-label={`Select ${element.name}`}
              onPointerDown={(event) => startDrag(event, element)}
            />
          ))}
        {editing && selected && (
          <SelectionTag element={selected} scale={scale} />
        )}
      </CompositionSvg>
    </div>
  );
}

/** Names the selected element above its box, at a constant screen size. */
function SelectionTag({
  element,
  scale,
}: {
  element: ResolvedElement;
  scale: number;
}) {
  const fontSize = 11 / scale;
  const y = Math.max(fontSize + 2 / scale, element.bounds.y - 6 / scale);
  return (
    <text
      className="eda-composition-tag"
      x={element.bounds.x - 3}
      y={y}
      fontSize={fontSize}
    >
      {element.name}
    </text>
  );
}
