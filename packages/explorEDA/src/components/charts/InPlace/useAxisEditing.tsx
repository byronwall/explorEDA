import {
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { MoveHorizontal, Pencil, RotateCcw } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@/components/ui/popover";
import { resolveFieldProfile } from "@/components/FieldMetadata";
import { useDataLayer } from "@/providers/DataLayerProvider";
import type { AxisLimits, ChartSettings } from "@/types/ChartTypes";
import { numericAxes } from "../Axis/axisBounds";
import { AxisLimitFields } from "./AxisLimitFields";
import { InlineTextEditor } from "./InlineTextEditor";
import { useChartEdit } from "./useChartEdit";

export type AxisName = "x" | "y";
type Target = { axis: AxisName; kind: "range" | "title"; element: Element };

const AXIS_WORD = { x: "Horizontal", y: "Vertical" } as const;

/** The axis band that edits a range, from any element on that axis. */
function stripFor(element: Element, axis: AxisName) {
  const strip = element.closest("[data-axis-edit]");
  if (strip) return strip;
  const svg = element instanceof SVGElement ? element.ownerSVGElement : null;
  return svg?.querySelector(`[data-axis-edit="${axis}"]`) ?? undefined;
}

/**
 * What an event on a chart's axes would edit: the range of a numeric axis,
 * from its band, rule, or tick labels, or the axis title.
 */
export function axisEditTarget(target: EventTarget | null): Target | undefined {
  if (!(target instanceof Element)) return undefined;
  const strip = target.closest("[data-axis-edit]");
  if (strip) {
    const axis = strip.getAttribute("data-axis-edit") as AxisName;
    return { axis, kind: "range", element: strip };
  }
  const guide = target.closest(".chart-guide[data-plan-id]");
  const match = /^(x|y):(rule|tick|label)/.exec(
    guide?.getAttribute("data-plan-id") ?? ""
  );
  if (!guide || !match) return undefined;
  const axis = match[1] as AxisName;
  if (match[2] === "label") return { axis, kind: "title", element: guide };
  const element = stripFor(guide, axis);
  return element ? { axis, kind: "range", element } : undefined;
}

const formatBound = (value: number) =>
  value.toLocaleString(undefined, { maximumSignificantDigits: 4 });

/** The domain an axis band draws, as written on it. */
export function stripDomain(element: Element): [number, number] | undefined {
  const [low, high] = (element.getAttribute("data-domain") ?? "")
    .split(",")
    .map(Number);
  return Number.isFinite(low) && Number.isFinite(high)
    ? [low!, high!]
    : undefined;
}

/**
 * Lets a chart's axes be edited where they are drawn. Double-clicking a
 * numeric axis opens its range beside it; double-clicking an axis title, or
 * Enter on it, edits the title in place. `menuItems` adds the same actions
 * to the axis context menu. Each edit is one undo step.
 */
export function useAxisEditing(
  settings: ChartSettings,
  panelRef: RefObject<HTMLElement | null>
) {
  const [range, setRange] = useState<{ axis: AxisName; element: Element }>();
  const [title, setTitle] = useState<{
    axis: AxisName;
    element: Element;
    initial: string;
    inherited: string;
  }>();
  const fieldProfiles = useDataLayer((state) => state.fieldProfiles);
  const getColumnData = useDataLayer((state) => state.getColumnData);
  const getFieldLabel = useDataLayer((state) => state.getFieldLabel);
  const edit = useChartEdit(settings.id);
  const ranged = numericAxes(
    settings,
    (field) =>
      resolveFieldProfile(field, fieldProfiles ?? [], getColumnData)
        ?.dataType === "numeric"
  );

  const canEdit = (target?: Target): target is Target =>
    Boolean(target && (target.kind === "title" || ranged[target.axis]));

  const openRange = (axis: AxisName, element: Element) => {
    setTitle(undefined);
    edit.begin();
    setRange({ axis, element });
  };
  const closeRange = () => {
    edit.commit();
    setRange(undefined);
  };

  const openTitle = (axis: AxisName, element: Element) => {
    setRange(undefined);
    const key = `${axis}AxisLabel` as const;
    const field = element.getAttribute("data-field") ?? undefined;
    const inherited =
      field === "__ID" ? "Row sequence" : field ? getFieldLabel(field) : "";
    const shown =
      element.querySelector("text")?.getAttribute("aria-label") ?? inherited;
    // The drawn title hides under its editor, so the two never overlap.
    element.setAttribute("data-inplace-editing", "");
    setTitle({
      axis,
      element,
      // The drawn title can carry a scale note, such as " · symlog".
      initial: settings[key] || shown.replace(/ · symlog$/, ""),
      inherited,
    });
  };

  const closeTitle = () => {
    title?.element.removeAttribute("data-inplace-editing");
    setTitle(undefined);
  };

  const open = (target: Target) =>
    target.kind === "range"
      ? openRange(target.axis, target.element)
      : openTitle(target.axis, target.element);

  const handlers = {
    onDoubleClick: (event: MouseEvent) => {
      if (event.altKey || event.metaKey || event.ctrlKey) return;
      const target = axisEditTarget(event.target);
      if (!canEdit(target)) return;
      event.preventDefault();
      event.stopPropagation();
      open(target);
    },
    onKeyDown: (event: KeyboardEvent) => {
      if (event.altKey || event.metaKey || event.ctrlKey || event.shiftKey)
        return;
      if (event.key !== "Enter" && event.key !== "F2") return;
      const target = axisEditTarget(event.target);
      // Keys act on the focused axis title only.
      if (target?.kind !== "title" || event.target !== target.element) return;
      event.preventDefault();
      event.stopPropagation();
      open(target);
    },
  };

  /** Extra context-menu actions for the axis under an event target. */
  const menuItems = (element: Element): ReactNode => {
    const target = axisEditTarget(element);
    if (!target) return null;
    const { axis } = target;
    const name = axis.toUpperCase();
    const strip = ranged[axis] ? stripFor(target.element, axis) : undefined;
    const limits = settings[`${axis}Axis`]?.limits;
    const titleGuide =
      target.kind === "title"
        ? target.element
        : target.element
            .closest("svg")
            ?.querySelector(`.chart-guide[data-plan-id="${axis}:label"]`);
    return (
      <>
        {strip && (
          <DropdownMenuItem onSelect={() => openRange(axis, strip)}>
            <MoveHorizontal
              aria-hidden="true"
              className={axis === "y" ? "rotate-90" : undefined}
            />
            Set {name} range…
          </DropdownMenuItem>
        )}
        {strip && (limits?.min !== undefined || limits?.max !== undefined) && (
          <DropdownMenuItem
            onSelect={() => {
              edit.apply({
                [`${axis}Axis`]: {
                  ...settings[`${axis}Axis`],
                  limits: undefined,
                },
              });
              edit.commit();
            }}
          >
            <RotateCcw aria-hidden="true" />
            Fit {name} to the data
          </DropdownMenuItem>
        )}
        {titleGuide && (
          <DropdownMenuItem onSelect={() => openTitle(axis, titleGuide)}>
            <Pencil aria-hidden="true" />
            Edit {name} axis title
          </DropdownMenuItem>
        )}
      </>
    );
  };

  const panel = panelRef.current;
  const titleBox =
    title && panel && placeTitle(title.element, panel, title.axis);
  const domain = range && stripDomain(range.element);
  const overlay = (
    <>
      {range && (
        <Popover
          open
          modal={false}
          onOpenChange={(next) => {
            if (!next) closeRange();
          }}
        >
          <PopoverAnchor virtualRef={{ current: range.element }} />
          <PopoverContent
            aria-label={`${AXIS_WORD[range.axis]} axis range`}
            className="eda-axis-range w-[min(17rem,calc(100vw-1.5rem))] p-2.5"
            side={range.axis === "x" ? "bottom" : "left"}
            align="center"
            sideOffset={6}
            collisionPadding={12}
            container={panel?.closest<HTMLElement>("[role='dialog']")}
            onOpenAutoFocus={(event) => event.preventDefault()}
            onCloseAutoFocus={(event) => event.preventDefault()}
          >
            <div className="eda-axis-range-head">
              {AXIS_WORD[range.axis]} axis range
            </div>
            <AxisLimitFields
              autoFocus
              axisName={range.axis.toUpperCase()}
              limits={settings[`${range.axis}Axis`]?.limits}
              placeholders={
                domain
                  ? [formatBound(domain[0]), formatBound(domain[1])]
                  : undefined
              }
              onChange={(limits?: AxisLimits) =>
                edit.apply({
                  [`${range.axis}Axis`]: {
                    ...settings[`${range.axis}Axis`],
                    limits,
                  },
                })
              }
              onSubmit={closeRange}
            />
          </PopoverContent>
        </Popover>
      )}
      {title &&
        panel &&
        titleBox &&
        createPortal(
          <div className="eda-axis-title-editor" style={titleBox}>
            <InlineTextEditor
              initialValue={title.initial}
              placeholder={title.inherited || "Axis title"}
              ariaLabel={`${AXIS_WORD[title.axis]} axis title`}
              onChange={(text) =>
                edit.apply({
                  [`${title.axis}AxisLabel`]:
                    text.trim() === title.inherited ? "" : text,
                })
              }
              onCommit={() => {
                edit.commit();
                closeTitle();
              }}
              onCancel={() => {
                edit.cancel();
                closeTitle();
              }}
            />
          </div>,
          panel
        )}
    </>
  );

  return { handlers, menuItems, overlay, editing: Boolean(range || title) };
}

/**
 * Places a title editor over the drawn title, in panel coordinates. An X
 * title stays centered where it was. A vertical Y title is edited level,
 * starting at the panel's left edge, so the field never leaves the panel.
 */
function placeTitle(element: Element, panel: HTMLElement, axis: AxisName) {
  const text = element.querySelector("text") ?? element;
  const box = text.getBoundingClientRect();
  const frame = panel.getBoundingClientRect();
  const fontSize = Number(text.getAttribute("font-size")) || 11;
  const centerX = box.left + box.width / 2 - frame.left;
  const top = box.top + box.height / 2 - frame.top;
  if (axis === "y") {
    return { left: 4, width: frame.width - 8, top, fontSize };
  }
  const half = Math.max(40, Math.min(centerX - 4, frame.width - centerX - 4));
  return {
    left: centerX - half,
    width: half * 2,
    top,
    fontSize,
    justifyContent: "center",
  };
}
