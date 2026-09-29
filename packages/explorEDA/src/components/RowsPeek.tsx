import { useLayoutEffect, useRef, useState, type RefObject } from "react";
import { X } from "lucide-react";
import { Button } from "./ui/button";
import { RowsView } from "./RowsView";

/** Popper, menu, and dialog layers that portal out of the peek's DOM. */
const layerSelector =
  "[data-radix-popper-content-wrapper], [role='dialog'], [role='menu'], [role='alertdialog']";

/**
 * A quick look at the rows that pass every chart filter. It floats below the
 * workspace controls over the charts and closes with R, Escape, the close
 * button, or a click on the charts.
 */
export function RowsPeek({
  id,
  width,
  containerRef,
  onClose,
}: {
  id: string;
  width: number;
  /** The sticky controls; clicks there keep the peek open. */
  containerRef: RefObject<HTMLElement | null>;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [toolbarTarget, setToolbarTarget] = useState<HTMLDivElement | null>(
    null
  );
  const [tableHeight, setTableHeight] = useState(360);

  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    panel.focus({ preventScroll: true });
    const measure = () => {
      const top = panel.getBoundingClientRect().top;
      const header = panel.querySelector(".eda-rows-peek-header");
      const headerHeight = header?.getBoundingClientRect().height ?? 40;
      setTableHeight(
        Math.max(240, window.innerHeight - top - headerHeight - 18)
      );
    };
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, { passive: true });
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure);
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
        <p>Live rows after chart filters</p>
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
      <RowsView
        width={Math.max(0, width - 2)}
        height={tableHeight}
        toolbarTarget={toolbarTarget}
      />
    </div>
  );
}
