import {
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { Maximize2, Minimize2, X } from "lucide-react";
import { Button } from "./ui/button";
import { useEscapeOutside } from "@/hooks/useEscapeOutside";

/** Popper, menu, and dialog layers that portal out of the drawer's DOM. */
const layerSelector =
  "[data-radix-popper-content-wrapper], [role='dialog'], [role='menu'], [role='alertdialog']";

export interface WorkspaceDrawerSize {
  width: number;
  height: number;
}

/**
 * A drawer over the right of the viewport, for content that needs the room:
 * Rows and the schema diagram. Expanded, it leaves a strip of charts and a
 * click there closes it. Narrow, it sits beside the charts, which stay in
 * use. Escape and the close button close either size.
 */
export function WorkspaceDrawer({
  id,
  heading,
  scope,
  containerRef,
  narrow = false,
  sizeLabels,
  onNarrowChange,
  closeLabel,
  closeTooltip,
  onClose,
  className,
  children,
}: {
  id: string;
  /** The heading, which also names the region. */
  heading: string;
  /** Facts beside the heading, such as the row count and filters. */
  scope?: ReactNode;
  /** The sticky controls; clicks there keep the drawer open. */
  containerRef: RefObject<HTMLElement | null>;
  narrow?: boolean;
  /** Names for the size toggle. Omit them, or `onNarrowChange`, for one size. */
  sizeLabels?: {
    expand: string;
    expandTooltip: string;
    narrow: string;
    narrowTooltip: string;
  };
  onNarrowChange?: (narrow: boolean) => void;
  closeLabel: string;
  closeTooltip: string;
  onClose: () => void;
  className?: string;
  /** The body, given its measured size and a target for toolbar controls. */
  children: (
    size: WorkspaceDrawerSize,
    toolbarTarget: HTMLDivElement | null
  ) => ReactNode;
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
      aria-label={heading}
      tabIndex={-1}
      className={className ? `eda-drawer ${className}` : "eda-drawer"}
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
      <div className="eda-drawer-header">
        <h2>{heading}</h2>
        <div className="eda-drawer-scope eda-workspace-toolbar">{scope}</div>
        <div ref={setToolbarTarget} className="eda-drawer-tools" />
        {sizeLabels && onNarrowChange && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="eda-drawer-size"
            aria-label={narrow ? sizeLabels.expand : sizeLabels.narrow}
            aria-pressed={!narrow}
            tooltip={
              narrow ? sizeLabels.expandTooltip : sizeLabels.narrowTooltip
            }
            onClick={() => onNarrowChange(!narrow)}
          >
            {narrow ? (
              <Maximize2 aria-hidden="true" />
            ) : (
              <Minimize2 aria-hidden="true" />
            )}
          </Button>
        )}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={closeLabel}
          tooltip={closeTooltip}
          onClick={onClose}
        >
          <X aria-hidden="true" />
        </Button>
      </div>
      <div ref={bodyRef} className="eda-drawer-body">
        {children(size, toolbarTarget)}
      </div>
    </div>
  );
}
