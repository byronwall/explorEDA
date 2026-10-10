import {
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { BarChart, Copy, Settings2 } from "lucide-react";
import { resolveFieldProfile } from "@/components/FieldMetadata";
import { FieldInspector } from "@/components/SummaryTable/components/FieldInspector";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCreateCharts } from "@/hooks/useCreateCharts";
import { useDataLayer } from "@/providers/DataLayerProvider";

type Target = { field: string; element: Element };
/** A menu opens on a field label, or on an axis band that has no field. */
type Menu = { field?: string; element: Element; x: number; y: number };

/** The axis title or tick label under an event, with the field it shows. */
export function axisFieldTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) return undefined;
  const element = target.closest("[data-field]");
  const field = element?.getAttribute("data-field");
  return element && field ? { field, element } : undefined;
}

const isShortcut = (event: MouseEvent | KeyboardEvent) =>
  event.metaKey || event.ctrlKey;

/**
 * Lets a chart's axis titles and tick labels open the field inspector:
 * Command-click (Ctrl-click elsewhere) inspects directly, and the context
 * menu offers inspection beside other field actions. Spread `handlers` on
 * the chart panel and render `overlay` anywhere inside it.
 */
export function useAxisFieldActions(
  /** More actions for the axis under the menu, such as editing its range. */
  axisItems?: (element: Element) => ReactNode
) {
  const [inspected, setInspected] = useState<Target>();
  const [menu, setMenu] = useState<Menu>();
  const getFieldLabel = useDataLayer((state) => state.getFieldLabel);
  const fieldProfiles = useDataLayer((state) => state.fieldProfiles);
  const getColumnData = useDataLayer((state) => state.getColumnData);
  const { createChart } = useCreateCharts();
  const inspecting = useRef(false);

  const openMenu = (target: Omit<Menu, "x" | "y">, x: number, y: number) => {
    setInspected(undefined);
    setMenu({ ...target, x, y });
  };

  const handlers = {
    onClickCapture: (event: MouseEvent) => {
      const target = isShortcut(event) && axisFieldTarget(event.target);
      if (!target) return;
      event.preventDefault();
      event.stopPropagation();
      setMenu(undefined);
      setInspected(target);
    },
    onContextMenu: (event: MouseEvent) => {
      const strip =
        axisItems && event.target instanceof Element
          ? event.target.closest("[data-axis-edit]")
          : null;
      const target =
        axisFieldTarget(event.target) ?? (strip ? { element: strip } : null);
      if (!target) return;
      event.preventDefault();
      // A keyboard-opened menu has no pointer position; use the label's.
      const box = target.element.getBoundingClientRect();
      const fromKeyboard = event.clientX === 0 && event.clientY === 0;
      openMenu(
        target,
        fromKeyboard ? box.left : event.clientX,
        fromKeyboard ? box.bottom : event.clientY
      );
    },
    onKeyDownCapture: (event: KeyboardEvent) => {
      const target = axisFieldTarget(event.target);
      if (!target || event.target !== target.element) return;
      if (event.key === "Enter" && isShortcut(event)) {
        event.preventDefault();
        event.stopPropagation();
        setInspected(target);
      }
    },
  };

  const label = menu?.field ? getFieldLabel(menu.field) : "";
  const dataType = menu?.field
    ? resolveFieldProfile(menu.field, fieldProfiles ?? [], getColumnData)
        ?.dataType
    : undefined;
  const chartType =
    dataType === "numeric"
      ? "bar"
      : dataType === "categorical" || dataType === "boolean"
        ? "row"
        : undefined;
  const focusLabel = (element: Element) => {
    if (element instanceof HTMLElement || element instanceof SVGElement) {
      element.focus({ preventScroll: true });
    }
  };

  const overlay: ReactNode = (
    <>
      {menu &&
        createPortal(
          <DropdownMenu
            open
            modal={false}
            onOpenChange={(open) => {
              if (!open) setMenu(undefined);
            }}
          >
            <DropdownMenuTrigger asChild>
              <span
                aria-hidden="true"
                className="pointer-events-none fixed h-0 w-0"
                style={{ left: menu.x, top: menu.y }}
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              collisionPadding={12}
              aria-label={label ? `Actions for ${label}` : "Axis actions"}
              className="max-w-[min(280px,calc(100vw-24px))]"
              onCloseAutoFocus={(event) => {
                event.preventDefault();
                // The inspector, or an axis editor the menu opened, takes
                // focus; otherwise return it to the label.
                const element = menu.element;
                if (!inspecting.current)
                  requestAnimationFrame(() => {
                    const active = document.activeElement;
                    if (!active || active === document.body)
                      focusLabel(element);
                  });
                inspecting.current = false;
              }}
            >
              {axisItems?.(menu.element)}
              {menu.field && axisItems && <DropdownMenuSeparator />}
              {menu.field && (
                <DropdownMenuItem
                  onSelect={() => {
                    inspecting.current = true;
                    setInspected({ field: menu.field!, element: menu.element });
                  }}
                >
                  <Settings2 aria-hidden="true" />
                  <span className="truncate">Inspect {label}</span>
                </DropdownMenuItem>
              )}
              {menu.field && chartType && (
                <DropdownMenuItem
                  onSelect={() => createChart(chartType, menu.field!)}
                >
                  <BarChart
                    aria-hidden="true"
                    className={chartType === "row" ? "rotate-90" : undefined}
                  />
                  <span className="truncate">New chart of {label}</span>
                </DropdownMenuItem>
              )}
              {menu.field && (
                <DropdownMenuItem
                  onSelect={() => {
                    void navigator.clipboard?.writeText(menu.field!);
                  }}
                >
                  <Copy aria-hidden="true" />
                  Copy field name
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>,
          document.body
        )}
      {inspected && (
        <FieldInspector
          field={inspected.field}
          anchor={inspected.element}
          open
          onOpenChange={(open) => {
            if (!open) setInspected(undefined);
          }}
        />
      )}
    </>
  );

  return { handlers, overlay };
}
