import {
  createContext,
  useContext,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  useDraggable,
  useSensor,
  useSensors,
  type DragMoveEvent,
} from "@dnd-kit/core";
import { typeIcons } from "@/components/FieldMetadata";
import { getChartTitle } from "@/components/charts/chartAccessibility";
import { useDataLayer } from "@/providers/DataLayerProvider";
import {
  axisRefusal,
  axisTargets,
  type AxisTarget,
  type FieldFacts,
} from "./fieldAxis";
import { useApplyAxisField, useFieldFacts } from "./useAxisField";

/** One axis band on screen that a dragged field can drop on. */
type DropZone = {
  key: string;
  target: AxisTarget;
  rect: { left: number; top: number; width: number; height: number };
  refusal?: string;
};

const PAD = 8;

function unionRect(rects: DOMRect[]) {
  const left = Math.min(...rects.map((rect) => rect.left)) - PAD;
  const top = Math.min(...rects.map((rect) => rect.top)) - PAD;
  const right = Math.max(...rects.map((rect) => rect.right)) + PAD;
  const bottom = Math.max(...rects.map((rect) => rect.bottom)) + PAD;
  return { left, top, width: right - left, height: bottom - top };
}

/**
 * Finds each axis band on screen. A faceted chart draws one band per panel,
 * so guides are grouped by the SVG that holds them.
 */
function findZones(
  workspace: HTMLElement | null,
  targets: AxisTarget[],
  facts: FieldFacts
): DropZone[] {
  const charts = new Map(
    Array.from(
      workspace?.querySelectorAll<HTMLElement>("[data-chart-id]") ?? []
    ).map((element) => [element.dataset.chartId, element])
  );
  return targets.flatMap((target) => {
    const chart = charts.get(target.chart.id);
    if (!chart) return [];
    const bySvg = new Map<Element, DOMRect[]>();
    chart.querySelectorAll(`[data-axis="${target.axis}"]`).forEach((guide) => {
      const svg = guide.closest("svg") ?? chart;
      const rect = guide.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) return;
      bySvg.set(svg, [...(bySvg.get(svg) ?? []), rect]);
    });
    const refusal = axisRefusal(target, facts);
    return Array.from(bySvg.values()).map((rects, index) => ({
      key: `${target.chart.id}:${target.axis}:${index}`,
      target,
      rect: unionRect(rects),
      refusal,
    }));
  });
}

type DragState = {
  facts: FieldFacts;
  zones: DropZone[];
  active?: DropZone;
};

const DragContext = createContext<{
  dragging?: string;
  suppressClick: RefObject<boolean>;
}>({
  suppressClick: { current: false },
});

/** Drag handle props for a field row. Only a mouse drags; touch uses menus. */
export function useFieldDrag(field: string) {
  const { dragging, suppressClick } = useContext(DragContext);
  const { listeners, setNodeRef } = useDraggable({ id: field });
  return {
    dragging: dragging === field,
    handleProps: {
      ref: setNodeRef,
      ...listeners,
      onClickCapture: (event: React.MouseEvent) => {
        // The click that ends a drag should not also expand the row.
        if (suppressClick.current) {
          event.preventDefault();
          event.stopPropagation();
          suppressClick.current = false;
        }
      },
    },
  };
}

/**
 * Lets field rows be dragged onto chart axes. Every drop does what the
 * row's "Use on chart" menu does, which is the keyboard and touch path.
 */
export function FieldDragProvider({
  workspaceRef,
  children,
}: {
  workspaceRef: RefObject<HTMLElement | null>;
  children: ReactNode;
}) {
  const charts = useDataLayer((state) => state.charts);
  const getFieldLabel = useDataLayer((state) => state.getFieldLabel);
  const getFacts = useFieldFacts();
  const apply = useApplyAxisField();
  const [drag, setDrag] = useState<DragState>();
  const suppressClick = useRef(false);
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } })
  );

  const pointer = (event: DragMoveEvent) => {
    const start = event.activatorEvent as MouseEvent;
    return {
      x: start.clientX + event.delta.x,
      y: start.clientY + event.delta.y,
    };
  };
  const zoneAt = (zones: DropZone[], x: number, y: number) => {
    // Axes hidden under the field list are not targets.
    const panel = document
      .querySelector(".eda-field-list")
      ?.getBoundingClientRect();
    if (
      panel &&
      x >= panel.left &&
      x <= panel.right &&
      y >= panel.top &&
      y <= panel.bottom
    ) {
      return undefined;
    }
    return zones.find(
      ({ rect }) =>
        x >= rect.left &&
        x <= rect.left + rect.width &&
        y >= rect.top &&
        y <= rect.top + rect.height
    );
  };

  const TypeIcon = drag ? typeIcons[drag.facts.dataType] : undefined;

  return (
    <DragContext.Provider
      value={{ dragging: drag?.facts.field, suppressClick }}
    >
      <DndContext
        sensors={sensors}
        autoScroll={false}
        onDragStart={(event) => {
          const facts = getFacts(String(event.active.id));
          if (!facts) return;
          suppressClick.current = true;
          setDrag({
            facts,
            zones: findZones(workspaceRef.current, axisTargets(charts), facts),
          });
        }}
        onDragMove={(event) => {
          const { x, y } = pointer(event);
          setDrag((current) => {
            if (!current) return current;
            const active = zoneAt(current.zones, x, y);
            return active?.key === current.active?.key
              ? current
              : { ...current, active };
          });
        }}
        onDragEnd={() => {
          if (drag?.active) apply(drag.active.target, drag.facts);
          setDrag(undefined);
          // A drag that ends outside the row fires no click to clear this.
          setTimeout(() => (suppressClick.current = false));
        }}
        onDragCancel={() => {
          setDrag(undefined);
          setTimeout(() => (suppressClick.current = false));
        }}
      >
        {children}
        {createPortal(
          <>
            {drag?.zones.map((zone) => (
              <div
                key={zone.key}
                className="eda-field-drop"
                data-state={zone.refusal ? "refused" : "ready"}
                data-active={zone.key === drag.active?.key || undefined}
                style={zone.rect}
                aria-hidden="true"
              />
            ))}
            <DragOverlay dropAnimation={null}>
              {drag && TypeIcon && (
                <div
                  className="eda-field-drag-chip"
                  data-state={
                    drag.active
                      ? drag.active.refusal
                        ? "refused"
                        : "ready"
                      : undefined
                  }
                >
                  <span className="eda-field-drag-name">
                    <TypeIcon aria-hidden="true" />
                    <span>{drag.facts.label}</span>
                  </span>
                  {drag.active && (
                    <span className="eda-field-drag-hint">
                      {drag.active.refusal ??
                        `Use as ${drag.active.target.axis.toUpperCase()} axis of ${getChartTitle(drag.active.target.chart, getFieldLabel)}`}
                    </span>
                  )}
                </div>
              )}
            </DragOverlay>
          </>,
          document.body
        )}
      </DndContext>
    </DragContext.Provider>
  );
}
