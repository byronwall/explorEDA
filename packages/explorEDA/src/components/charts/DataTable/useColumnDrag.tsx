import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { EyeOff, GripVertical } from "lucide-react";
import type { DataTableSettings } from "./definition";
import { hideColumn, moveColumn } from "./columnOps";

type Column = DataTableSettings["columns"][number];

/** Pointer travel before a press on a column name becomes a drag. */
const DRAG_THRESHOLD = 6;
/** Distance above or below the header at which a drop hides the column. */
const REMOVE_DISTANCE = 44;

type DragState = {
  id: string;
  x: number;
  y: number;
  /** Insertion index, or undefined while the drop would hide the column. */
  index: number | undefined;
  /** Viewport position of the insertion line. */
  line?: { left: number; top: number; height: number };
};

/**
 * Drag a column by its name: sideways to reorder it, or away from the header
 * to hide it. A press that never travels stays a click, so sorting works.
 */
export function useColumnDrag({
  columns,
  label,
  onChange,
}: {
  columns: Column[];
  label: (field: string) => string;
  onChange: (columns: Column[]) => void;
}) {
  const [drag, setDrag] = useState<DragState>();
  const cleanup = useRef<(() => void) | null>(null);
  // A drag ends with a click on the name; that click must not sort.
  const suppressClick = useRef(false);
  const latest = useRef({ columns, onChange });
  latest.current = { columns, onChange };

  useEffect(() => () => cleanup.current?.(), []);

  const start = (event: React.PointerEvent<HTMLElement>, id: string) => {
    // Touch drags scroll the table. Column menus cover reorder and hide.
    if (event.button !== 0 || event.pointerType === "touch") return;
    const row = event.currentTarget.closest("tr");
    if (!row) return;
    const origin = { x: event.clientX, y: event.clientY };
    let state: DragState | undefined;

    const locate = (x: number, y: number): DragState => {
      const cells = Array.from(row.children) as HTMLElement[];
      const band = row.getBoundingClientRect();
      const scroller = row.closest(".eda-table-scroll");
      const view = scroller?.getBoundingClientRect() ?? band;
      const removing =
        latest.current.columns.length > 1 &&
        (y < band.top - REMOVE_DISTANCE || y > band.bottom + REMOVE_DISTANCE);
      if (removing) return { id, x, y, index: undefined };
      let index = cells.findIndex((cell) => {
        const rect = cell.getBoundingClientRect();
        return x < rect.left + rect.width / 2;
      });
      if (index < 0) index = cells.length;
      const before = cells[index]?.getBoundingClientRect();
      const edge = before
        ? before.left
        : (cells[cells.length - 1]?.getBoundingClientRect().right ?? 0);
      return {
        id,
        x,
        y,
        index,
        line: {
          left: Math.min(view.right - 2, Math.max(view.left, edge - 1)),
          top: band.top,
          height: Math.max(band.height, view.bottom - band.top),
        },
      };
    };

    const onMove = (move: PointerEvent) => {
      if (
        !state &&
        Math.hypot(move.clientX - origin.x, move.clientY - origin.y) <
          DRAG_THRESHOLD
      ) {
        return;
      }
      // Bring columns past the edge into reach while dragging.
      const scroller = row.closest(".eda-table-scroll");
      if (scroller) {
        const view = scroller.getBoundingClientRect();
        if (move.clientX > view.right - 36) scroller.scrollLeft += 14;
        else if (move.clientX < view.left + 36) scroller.scrollLeft -= 14;
      }
      state = locate(move.clientX, move.clientY);
      setDrag(state);
    };
    const end = (commit: boolean) => {
      cleanup.current?.();
      if (!state) return;
      suppressClick.current = true;
      // The click that ends the drag fires right after pointerup.
      setTimeout(() => {
        suppressClick.current = false;
      });
      if (!commit) return;
      const { columns: current, onChange: change } = latest.current;
      const next =
        state.index === undefined
          ? hideColumn(current, id)
          : moveColumn(current, id, state.index);
      if (next !== current) change(next);
    };
    const onUp = () => end(true);
    const onCancel = () => end(false);
    const onKey = (key: KeyboardEvent) => {
      if (key.key !== "Escape") return;
      key.preventDefault();
      key.stopPropagation();
      end(false);
    };

    cleanup.current?.();
    cleanup.current = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onCancel);
      window.removeEventListener("keydown", onKey, true);
      cleanup.current = null;
      setDrag(undefined);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onCancel);
    window.addEventListener("keydown", onKey, true);
  };

  const dragged = drag && columns.find((column) => column.id === drag.id);
  const overlay =
    drag && dragged
      ? createPortal(
          <>
            {drag.line && (
              <div
                className="eda-column-drop"
                style={drag.line}
                aria-hidden="true"
              />
            )}
            <div
              className="eda-column-drag-chip"
              data-remove={drag.index === undefined || undefined}
              style={{ left: drag.x + 12, top: drag.y + 14 }}
              role="status"
            >
              {drag.index === undefined ? (
                <>
                  <EyeOff aria-hidden="true" />
                  Release to hide {label(dragged.field)}
                </>
              ) : (
                <>
                  <GripVertical aria-hidden="true" />
                  {label(dragged.field)}
                </>
              )}
            </div>
          </>,
          document.body
        )
      : null;

  return {
    /** The id of the column being dragged, if any. */
    draggingId: drag?.id,
    /** Spread on the column's name button. */
    handleProps: (id: string) => ({
      onPointerDown: (event: React.PointerEvent<HTMLElement>) =>
        start(event, id),
    }),
    /** True for the click that ends a drag. */
    consumeClick: () => suppressClick.current,
    overlay,
  };
}
