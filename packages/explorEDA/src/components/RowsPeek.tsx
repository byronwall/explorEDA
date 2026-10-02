import {
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { X } from "lucide-react";
import { Button } from "./ui/button";
import { RowsView } from "./RowsView";

/** Popper, menu, and dialog layers that portal out of the drawer's DOM. */
const layerSelector =
  "[data-radix-popper-content-wrapper], [role='dialog'], [role='menu'], [role='alertdialog']";

/**
 * The rows that pass every chart filter, in a drawer over the right of the
 * viewport. A strip of charts stays visible beside it. It closes with R,
 * Escape, the close button, or a click on the charts.
 */
export function RowsPeek({
  id,
  scope,
  containerRef,
  onClose,
}: {
  id: string;
  /** The row count and active filters, which the drawer covers in the toolbar. */
  scope?: ReactNode;
  /** The sticky controls; clicks there keep the drawer open. */
  containerRef: RefObject<HTMLElement | null>;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
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
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (containerRef.current?.contains(target)) return;
      if (target.closest(layerSelector)) return;
      onClose();
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [containerRef, onClose]);

  return (
    <div
      ref={panelRef}
      id={id}
      role="region"
      aria-label="Rows"
      tabIndex={-1}
      className="eda-rows-peek"
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
        />
      </div>
    </div>
  );
}
