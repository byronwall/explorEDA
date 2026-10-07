import {
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { Maximize2, Minimize2, X } from "lucide-react";
import { Button } from "./ui/button";
import { RowsView } from "./RowsView";
import { useEscapeOutside } from "@/hooks/useEscapeOutside";

/** Popper, menu, and dialog layers that portal out of the drawer's DOM. */
const layerSelector =
  "[data-radix-popper-content-wrapper], [role='dialog'], [role='menu'], [role='alertdialog']";

/**
 * The rows that pass every chart filter, in a drawer over the right of the
 * viewport. Expanded, it leaves a strip of charts and a click there closes
 * it. Narrow, it sits beside the charts, which stay in use while it is open.
 * R, Escape, and the close button close either size.
 */
export function RowsPeek({
  id,
  scope,
  containerRef,
  narrow,
  onNarrowChange,
  onClose,
  readOnly = false,
}: {
  id: string;
  /** The row count and active filters, which the drawer covers in the toolbar. */
  scope?: ReactNode;
  /** The sticky controls; clicks there keep the drawer open. */
  containerRef: RefObject<HTMLElement | null>;
  /** The narrow size keeps the charts visible and in use beside the rows. */
  narrow: boolean;
  onNarrowChange: (narrow: boolean) => void;
  onClose: () => void;
  /** Keep table edits local while inspecting a read-only preview. */
  readOnly?: boolean;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  // Charts stay in use beside the narrow drawer, so Escape works from them too.
  useEscapeOutside(panelRef, onClose);
  const bodyRef = useRef<HTMLDivElement>(null);
  const [toolbarTarget, setToolbarTarget] = useState<HTMLDivElement | null>(
    null
  );
  const [size, setSize] = useState({ width: 0, height: 360 });

  useLayoutEffect(() => {
    panelRef.current?.focus({ preventScroll: true });
    const body = bodyRef.current;
    if (!body) return;
    const measure = () => {
      const rect = body.getBoundingClientRect();
      setSize({
        width: Math.floor(rect.width),
        height: Math.max(240, Math.floor(rect.height)),
      });
    };
    measure();
    window.addEventListener("resize", measure);
    const observer =
      typeof ResizeObserver === "undefined"
        ? undefined
        : new ResizeObserver(measure);
    observer?.observe(body);
    return () => {
      window.removeEventListener("resize", measure);
      observer?.disconnect();
    };
  }, []);

  useLayoutEffect(() => {
    // Beside the narrow drawer, a click on a chart filters; it must not close.
    if (narrow) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (containerRef.current?.contains(target)) return;
      if (target.closest(layerSelector)) return;
      onClose();
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [containerRef, onClose, narrow]);

  return (
    <div
      ref={panelRef}
      id={id}
      role="region"
      aria-label="Rows"
      tabIndex={-1}
      className="eda-rows-peek"
      data-narrow={narrow || undefined}
      onKeyDown={(event) => {
        // Escape inside a column filter or menu closes that layer first.
        if (
          event.key !== "Escape" ||
          event.defaultPrevented ||
          !(event.target instanceof Node) ||
          !panelRef.current?.contains(event.target)
        ) {
          return;
        }
        event.preventDefault();
        onClose();
      }}
    >
      <div className="eda-rows-peek-header">
        <h2>Rows</h2>
        <div className="eda-rows-peek-scope eda-workspace-toolbar">{scope}</div>
        <div ref={setToolbarTarget} className="eda-rows-peek-tools" />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="eda-rows-peek-size"
          aria-label={narrow ? "Expand the rows" : "Narrow the rows"}
          aria-pressed={!narrow}
          tooltip={
            narrow
              ? "Expand the rows across the workspace"
              : "Narrow the rows to keep the charts in use beside them"
          }
          onClick={() => onNarrowChange(!narrow)}
        >
          {narrow ? (
            <Maximize2 aria-hidden="true" />
          ) : (
            <Minimize2 aria-hidden="true" />
          )}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Close rows"
          tooltip="Close rows (R or Esc)"
          onClick={onClose}
        >
          <X aria-hidden="true" />
        </Button>
      </div>
      <div ref={bodyRef} className="eda-rows-peek-body">
        <RowsView
          width={size.width}
          height={size.height}
          toolbarTarget={toolbarTarget}
          readOnly={readOnly}
        />
      </div>
    </div>
  );
}
