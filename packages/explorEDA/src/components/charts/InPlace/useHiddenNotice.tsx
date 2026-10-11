import {
  useEffect,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
  type PointerEvent,
  type RefObject,
} from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@/components/ui/popover";
import type { AxisLimits, ChartSettings } from "@/types/ChartTypes";
import { useChartEdit } from "./useChartEdit";

/** How long a pointer may travel from a marker to its details before they close. */
const CLOSE_DELAY = 200;

type Side = "low" | "high";

interface Notice {
  element: Element;
  axis: "x" | "y";
  side: Side;
  count: number;
  unit: [string, string];
  at: number;
  atLabel: string;
  cut: boolean;
}

const MARKER = "[data-axis-hidden]";

const formatBound = (value: number) =>
  value.toLocaleString(undefined, { maximumSignificantDigits: 4 });

/** Reads a hidden-marks marker drawn by `PlannedAxes`. */
function readMarker(element: Element): Notice | undefined {
  const [axis, side] = (element.getAttribute("data-axis-hidden") ?? "").split(
    ":"
  );
  const count = Number(element.getAttribute("data-hidden-count"));
  const at = Number(element.getAttribute("data-hidden-at"));
  const unit = (element.getAttribute("data-hidden-unit") ?? "row|rows").split(
    "|"
  ) as [string, string];
  if ((axis !== "x" && axis !== "y") || (side !== "low" && side !== "high"))
    return undefined;
  if (!Number.isFinite(count) || !Number.isFinite(at)) return undefined;
  const atLabel =
    element.getAttribute("data-hidden-at-label") || formatBound(at);
  const cut = element.hasAttribute("data-hidden-cut");
  return { element, axis, side, count, unit, at, atLabel, cut };
}

/** The marker an event came from, if any. */
function markerAt(target: EventTarget | null) {
  return target instanceof Element ? target.closest(MARKER) : null;
}

/**
 * Details for the markers an axis draws where a bound hides marks. Hovering
 * or focusing a marker opens a small popover with the count and a reset for
 * that one bound. The reset is one undo step, like any in-place edit.
 */
export function useHiddenNotice(
  settings: ChartSettings,
  panelRef: RefObject<HTMLElement | null>
) {
  const [notice, setNotice] = useState<Notice>();
  const edit = useChartEdit(settings.id);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const contentRef = useRef<HTMLDivElement>(null);

  const keepOpen = () => clearTimeout(closeTimer.current);
  const close = () => {
    keepOpen();
    setNotice(undefined);
  };
  const closeSoon = () => {
    keepOpen();
    closeTimer.current = setTimeout(close, CLOSE_DELAY);
  };
  useEffect(() => () => clearTimeout(closeTimer.current), []);

  const open = (element: Element) => {
    keepOpen();
    if (notice?.element === element) return;
    const next = readMarker(element);
    if (next) setNotice(next);
  };

  // The marker shows that its details are open, and a redrawn chart that
  // drops the marker closes them.
  useEffect(() => {
    if (!notice) return;
    const { element } = notice;
    element.setAttribute("data-open", "");
    element.setAttribute("aria-expanded", "true");
    return () => {
      element.removeAttribute("data-open");
      element.setAttribute("aria-expanded", "false");
    };
  }, [notice]);
  useEffect(() => {
    if (notice && !notice.element.isConnected) setNotice(undefined);
  });

  const handlers = {
    onPointerOver: (event: PointerEvent) => {
      const marker = markerAt(event.target);
      if (marker) open(marker);
    },
    onPointerOut: (event: PointerEvent) => {
      const marker = markerAt(event.target);
      if (!marker || marker.contains(event.relatedTarget as Node | null))
        return;
      closeSoon();
    },
    onFocus: (event: FocusEvent) => {
      const marker = markerAt(event.target);
      if (marker) open(marker);
    },
    onBlur: (event: FocusEvent) => {
      if (!markerAt(event.target)) return;
      const next = event.relatedTarget as Node | null;
      if (next && contentRef.current?.contains(next)) return;
      close();
    },
    /** Enter, Space, or Down on a marker moves focus to its reset. */
    onKeyDown: (event: KeyboardEvent) => {
      const marker = markerAt(event.target);
      if (!marker || !["Enter", " ", "ArrowDown"].includes(event.key)) return;
      event.preventDefault();
      event.stopPropagation();
      open(marker);
      requestAnimationFrame(() =>
        contentRef.current?.querySelector<HTMLElement>("button")?.focus()
      );
    },
  };

  const reset = () => {
    if (!notice) return;
    const key = `${notice.axis}Axis` as const;
    const limits: AxisLimits = { ...settings[key]?.limits };
    delete limits[notice.side === "low" ? "min" : "max"];
    const marker = notice.element;
    edit.apply({
      [key]: {
        ...settings[key],
        limits:
          limits.min === undefined && limits.max === undefined
            ? undefined
            : limits,
      },
    });
    edit.commit();
    close();
    // The marker goes away with its bound; keep focus on the chart.
    if (marker.contains(document.activeElement) || !marker.isConnected)
      panelRef.current?.focus({ preventScroll: true });
  };

  const panel = panelRef.current;
  const name = notice?.axis.toUpperCase();
  const end = notice?.side === "high" ? "maximum" : "minimum";
  const overlay = notice && (
    <Popover
      open
      modal={false}
      onOpenChange={(next) => {
        if (!next) close();
      }}
    >
      <PopoverAnchor virtualRef={{ current: notice.element }} />
      <PopoverContent
        ref={contentRef}
        aria-label={`Hidden past the ${name} ${end}`}
        className="eda-axis-range w-[min(16rem,calc(100vw-1.5rem))] p-2.5 text-xs"
        side={notice.axis === "x" ? "top" : "right"}
        align="center"
        sideOffset={6}
        collisionPadding={12}
        container={panel?.closest<HTMLElement>("[role='dialog']")}
        onOpenAutoFocus={(event) => event.preventDefault()}
        onCloseAutoFocus={(event) => event.preventDefault()}
        onPointerEnter={keepOpen}
        onPointerLeave={closeSoon}
        onBlur={(event) => {
          const next = event.relatedTarget as Node | null;
          if (
            next &&
            (contentRef.current?.contains(next) || next === notice.element)
          )
            return;
          close();
        }}
        // Pressing the marker is not an outside press: it keeps its details.
        onInteractOutside={(event) => {
          if (notice.element.contains(event.target as Node))
            event.preventDefault();
        }}
      >
        <div className="eda-axis-range-head">
          Hidden past the {name} {end}
        </div>
        <p className="mb-2 leading-snug">
          {notice.count.toLocaleString()}{" "}
          {notice.count === 1 ? notice.unit[0] : notice.unit[1]}{" "}
          {notice.side === "high" ? "above" : "below"} {notice.atLabel}{" "}
          {notice.count === 1 ? "is" : "are"}{" "}
          {notice.cut ? "cut off at the edge" : "off the chart"}. They still
          count in totals and filters.
        </p>
        <Button
          size="sm"
          variant="outline"
          className="h-7 gap-1.5 text-xs"
          onClick={reset}
        >
          <RotateCcw aria-hidden="true" className="h-3.5 w-3.5" />
          Reset {end}
        </Button>
      </PopoverContent>
    </Popover>
  );

  return { handlers, overlay };
}
