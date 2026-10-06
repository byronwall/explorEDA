import { CalculatedFieldBadge } from "./calculations/CalculatedFieldBadge";
import { isActiveFilter } from "./ActiveFilterStatus";
import {
  LOCAL_FILTER_STRIP_HEIGHT,
  LocalFilterStrip,
} from "./LocalFilterStrip";
import { ChartDataPreview } from "./ChartDataPreview";
import { ActionTooltip } from "./ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { useDataLayer } from "@/providers/DataLayerProvider";
import { ChartSettings } from "@/types/ChartTypes";
import {
  Copy,
  FilterX,
  GripVertical,
  Maximize2,
  Minimize2,
  Search,
  Settings2,
  Table2,
  Trash2,
  X,
} from "lucide-react";
import { ChartRenderer } from "./charts/ChartRenderer";
import { ChartReadoutProvider } from "./charts/ChartReadout";
import { ChartColorLegend } from "./charts/ColorLegend/ChartColorLegend";
import { ChartTraceControl } from "./charts/ChartTraceControl";
import {
  ChartTraceScope,
  useChartTrace,
  useChartTraceApi,
  useTraceSource,
} from "./charts/trace/ChartTraceScope";
import { ChartTracePanel } from "./charts/trace/ChartTracePanel";
import type { TraceSource } from "./charts/trace/traceTypes";
import { FacetContainer } from "./charts/FacetRelated/FacetContainer";
import { useAxisFieldActions } from "./charts/AxisFieldActions";
import { ChartSettingsContent } from "./ChartSettingsContent";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import { useAlertStore } from "@/stores/alertStore";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  getChartFields,
  getChartSummary,
  getChartTitle,
} from "./charts/chartAccessibility";

interface PlotChartPanelProps {
  settings: ChartSettings;
  onDelete: () => void;
  onDuplicate: () => void;
  width: number;
  height: number;
}

const CATEGORY_LABELED_CHART_TYPES = new Set(["row", "boxplot"]);

const TRACE_COPY = {
  row: {
    heading: "Category trace",
    emptyText:
      "Alt-click a bar, including Other categories, to inspect its members and source rows.",
    ariaLabel: "Row chart trace inspector",
  },
  boxplot: {
    heading: "Distribution trace",
    emptyText: "Alt-click a box to inspect its statistics and source rows.",
    ariaLabel: "Distribution trace inspector",
  },
  map: {
    heading: "Map trace",
    emptyText:
      "Alt-click a point or region to see its source records and projection. Alt-click outside the regions to trace joins. You can also find a source row below.",
    ariaLabel: "Map trace inspector",
  },
  line: {
    heading: "Time series trace",
    emptyText:
      "Alt-click a point to inspect its period's calculation and source rows.",
    ariaLabel: "Time series trace inspector",
  },
  "metric-card": {
    heading: "Metric trace",
    emptyText:
      "Alt-click the card to see its calculation and source rows. You can also find a source row below.",
    ariaLabel: "Metric card trace inspector",
  },
  scatter: {
    heading: "Scatter trace",
    emptyText:
      "Alt-click a point, axis object, or color label to trace it. Normal clicks keep chart interactions. You can also find a source row below.",
    ariaLabel: "Scatter trace inspector",
  },
  bar: {
    heading: "Bar trace",
    emptyText:
      "Alt-click a bar, axis object, or zero baseline to trace it. Normal clicks keep chart interactions. You can also find a source row below.",
    ariaLabel: "Bar trace inspector",
  },
  sankey: {
    heading: "Flow trace",
    emptyText:
      "Alt-click a node or link to trace it. Normal clicks keep selecting. You can also find a source row below.",
    ariaLabel: "Sankey trace inspector",
  },
  "parallel-coordinates": {
    heading: "Line trace",
    emptyText:
      "Click a line, or Alt-click an axis name, to trace it. Dragging along an axis still selects. You can also find a source row below.",
    ariaLabel: "Parallel coordinates trace inspector",
  },
  calendar: {
    heading: "Day trace",
    emptyText:
      "Alt-click a day to trace it. Normal clicks keep selecting days. You can also find a source row below.",
    ariaLabel: "Calendar trace inspector",
  },
  heatmap: {
    heading: "Cell trace",
    emptyText:
      "Alt-click a cell to trace it. Normal clicks keep selecting cells. You can also find a source row below.",
    ariaLabel: "Heatmap trace inspector",
  },
  ecdf: {
    heading: "Step trace",
    emptyText:
      "Alt-click a curve to trace the share at that value. Normal clicks keep selecting. You can also find a source row below.",
    ariaLabel: "ECDF trace inspector",
  },
} as const;

function isTraceable(type: string): type is keyof typeof TRACE_COPY {
  return type in TRACE_COPY;
}

export function ChartTraceInspector({
  type,
}: {
  type: keyof typeof TRACE_COPY;
}) {
  const trace = useChartTrace();
  const api = useChartTraceApi();
  if (!trace || !api) return null;
  return (
    <ChartTraceControl
      selection={trace.selection}
      onClear={api.clear}
      {...TRACE_COPY[type]}
    >
      <ChartTracePanel />
    </ChartTraceControl>
  );
}

function TraceTitle({
  id,
  text,
  settings,
}: {
  id: string;
  text: string;
  settings: ChartSettings;
}) {
  const api = useChartTraceApi();
  const owner = useId();
  const source = useMemo(
    (): TraceSource => ({
      role: "title",
      revision: text,
      resolve: (kind) =>
        kind === "title"
          ? {
              kind: "title",
              id: "title",
              revision: text,
              text,
              source: settings.title.trim() ? "chart-setting" : "field-label",
              field: settings.title.trim()
                ? undefined
                : settings.type === "scatter"
                  ? settings.yField
                  : settings.field,
            }
          : undefined,
    }),
    [settings, text]
  );
  useTraceSource(owner, source);
  const inspect = () => api?.inspect(owner, "title", "title");
  return (
    <h3
      id={id}
      className="min-w-0 truncate text-sm font-semibold"
      tabIndex={0}
      aria-description="Alt-click or Alt-Enter to trace title"
      onMouseDownCapture={(event) => {
        if (event.altKey) event.stopPropagation();
      }}
      onMouseUpCapture={(event) => {
        if (event.altKey) {
          event.stopPropagation();
          inspect();
        }
      }}
      onKeyDown={(event) => {
        if (event.altKey && event.key === "Enter") {
          event.preventDefault();
          inspect();
        }
      }}
    >
      {text}
    </h3>
  );
}

/** Layers that own Escape before the details view does. Tooltips do not. */
const NESTED_LAYERS =
  "[data-radix-popper-content-wrapper], [role='listbox'], [role='menu'], [role='alertdialog'], [role='dialog']";

function hasNestedLayer(details: HTMLElement | null) {
  return Array.from(document.querySelectorAll(NESTED_LAYERS)).some(
    (layer) =>
      !layer.matches("[role='alertdialog'][data-state='closed']") &&
      !layer.querySelector("[data-slot='tooltip-content']") &&
      !layer.contains(details) &&
      !details?.contains(layer)
  );
}

function useViewport(active: boolean) {
  const [size, setSize] = useState(() => ({
    width: window.innerWidth,
    height: window.innerHeight,
  }));
  useEffect(() => {
    if (!active) return;
    const update = () =>
      setSize({ width: window.innerWidth, height: window.innerHeight });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [active]);
  return size;
}

/**
 * Sizes the details view: the chart beside its controls, or above them when
 * the viewport is too narrow for both.
 */
function detailsLayout(viewport: { width: number; height: number }) {
  const width = viewport.width - 24;
  const height = viewport.height - 24;
  if (viewport.width < 900) {
    const chartHeight = Math.round(Math.min(420, Math.max(200, height * 0.42)));
    return {
      stacked: true,
      chart: { width, height: chartHeight },
      side: { width, height: height - chartHeight - 8 },
    };
  }
  const sideWidth = Math.round(Math.min(420, Math.max(344, width * 0.3)));
  return {
    stacked: false,
    chart: { width: width - sideWidth - 8, height },
    side: { width: sideWidth, height },
  };
}

export function PlotChartPanel({
  settings,
  onDelete,
  onDuplicate,
  width,
  height,
}: PlotChartPanelProps) {
  const [expanded, setExpandedState] = useState(false);
  const [detailsTab, setDetailsTab] = useState("settings");
  const [dataOpen, setDataOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const detailsRef = useRef<HTMLDivElement>(null);
  const details = detailsLayout(useViewport(expanded));
  const axisFieldActions = useAxisFieldActions();
  const settingsRef = useRef<HTMLButtonElement>(null);
  const settingsAnchor = useRef<HTMLElement | null>(null);
  const expandRef = useRef<HTMLButtonElement>(null);
  const [settingsSide, setSettingsSide] = useState<
    "left" | "right" | "top" | "bottom"
  >("right");
  const [settingsHeight, setSettingsHeight] = useState(460);
  const [settingsOpen, setSettingsOpen] = useState(false);
  // The details view opens on its settings and replaces the grid popovers.
  const setExpanded = (open: boolean) => {
    if (open) {
      setSettingsOpen(false);
      setDataOpen(false);
      setDetailsTab("settings");
    }
    setExpandedState(open);
  };
  const placeSettings = useCallback((open: boolean) => {
    setSettingsOpen(open);
    if (!open || !panelRef.current) return;
    settingsAnchor.current = panelRef.current;
    const rect = panelRef.current.getBoundingClientRect();
    if (window.innerWidth - rect.right >= 300) {
      setSettingsSide("right");
      setSettingsHeight(window.innerHeight - 32);
    } else if (rect.left >= 300) {
      setSettingsSide("left");
      setSettingsHeight(window.innerHeight - 32);
    } else {
      const above = rect.top;
      const below = window.innerHeight - rect.bottom;
      if (Math.max(above, below) >= 260) {
        setSettingsSide(above > below ? "top" : "bottom");
        setSettingsHeight(Math.max(above, below) - 20);
      } else {
        // A full-screen chart leaves no outside space. Keep a usable corner editor.
        settingsAnchor.current = settingsRef.current;
        setSettingsSide("bottom");
        setSettingsHeight(Math.min(420, window.innerHeight - 48));
      }
    }
  }, []);
  useEffect(() => {
    if (!settingsOpen) return;
    const reposition = () => placeSettings(true);
    window.addEventListener("resize", reposition);
    return () => window.removeEventListener("resize", reposition);
  }, [settingsOpen, placeSettings]);
  const [toolbarTarget, setToolbarTarget] = useState<HTMLDivElement | null>(
    null
  );
  const [readoutTarget, setReadoutTarget] = useState<HTMLDivElement | null>(
    null
  );
  // The details view gives the title more room, so the chart starts lower.
  const headerExtra = expanded ? 14 : 0;
  const clearFilter = useDataLayer((state) => state.clearFilter);
  const updateChart = useDataLayer((state) => state.updateChart);
  const getFieldLabel = useDataLayer((state) => state.getFieldLabel);
  const fieldSettings = useDataLayer((state) => state.fieldSettings);
  void fieldSettings;
  const showAlert = useAlertStore((state) => state.showAlert);
  const titleId = useId();
  const descriptionId = useId();
  const chartTitle = getChartTitle(settings, getFieldLabel);
  const chartSummary = getChartSummary(settings, getFieldLabel);
  const aggregateId =
    "aggregateId" in settings ? settings.aggregateId : undefined;
  const aggregate = useDataLayer((state) =>
    aggregateId ? state.getAggregate(aggregateId) : undefined
  );
  const isTableLike = ["data-table", "pivot", "summary"].includes(
    settings.type
  );
  const dataFields = aggregate
    ? Array.from(
        new Set(
          [
            aggregate.groupField,
            aggregate.measureField,
            ...(settings.type === "bar" ? [settings.seriesField] : []),
          ].filter((field): field is string => Boolean(field))
        )
      )
    : getChartFields(settings);
  const calculations = useDataLayer((state) => state.calculations);
  const calculatedFields = ["data-table", "summary"].includes(settings.type)
    ? []
    : dataFields.filter((field) =>
        calculations.some((calc) => calc.resultColumnName === field)
      );
  const localFilters = settings.localFilters ?? [];
  const fieldStripHeight =
    (settings.type !== "scatter" && calculatedFields.length ? 28 : 0) +
    (localFilters.length ? LOCAL_FILTER_STRIP_HEIGHT : 0);
  // Row charts and box plots color marks by their own labeled category, so a
  // legend repeats them.
  const autoLegendHeight =
    settings.colorField &&
    settings.colorScaleId &&
    !(settings.type === "scatter" && settings.display === "density") &&
    !CATEGORY_LABELED_CHART_TYPES.has(settings.type)
      ? 36
      : 0;

  const canViewData =
    !isTableLike && (dataFields.length > 0 || settings.type === "metric-card");
  const tableSearch =
    settings.type === "data-table" ? settings.globalSearch : "";
  const hasFilter = settings.filters.some(isActiveFilter);

  const handleDelete = async () => {
    const confirmed = await showAlert(
      "Delete chart?",
      `“${chartTitle}” will be removed from the workspace.`,
      { confirmLabel: "Delete", destructive: true }
    );
    if (confirmed) {
      onDelete();
    }
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        event.defaultPrevented ||
        event.repeat ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        document.querySelector("[role='menu']") ||
        Array.from(document.querySelectorAll("[role='dialog']")).some(
          (dialog) => !dialog.contains(panelRef.current)
        )
      )
        return;
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          target.closest("input, textarea, select, [role='combobox']"))
      )
        return;
      const hoveredPanel = document.querySelector(
        ".eda-panel[data-shortcut-hovered]"
      );
      const focusedChart = panelRef.current?.closest("[data-chart-id]");
      if (
        hoveredPanel
          ? hoveredPanel !== panelRef.current
          : !focusedChart?.contains(document.activeElement) &&
            !panelRef.current?.contains(document.activeElement)
      )
        return;

      const key = event.key.toLowerCase();
      if (!["s", "d", "x", "v", "c"].includes(key)) return;
      if (key === "v" && !canViewData) return;
      // Duplicating would move focus to the copy behind the details view.
      if (key === "d" && expanded) return;
      event.preventDefault();
      if (key === "s") {
        if (expanded) setDetailsTab("settings");
        else settingsRef.current?.click();
      } else if (key === "d") onDuplicate();
      else if (key === "x") void handleDelete();
      else if (key === "v") {
        if (expanded) setDetailsTab("data");
        else setDataOpen(true);
      } else clearFilter(settings);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  });

  // shrink the panel by 8px on each side to account for the border
  const panelWidth = expanded ? details.chart.width + 12 : width;
  const panelHeight = expanded ? details.chart.height + 12 : height;
  const widthWithPadding = panelWidth - 12;
  const heightWithPadding = panelHeight - 12;

  const panel = (
    <div
      ref={panelRef}
      className={`eda-panel bg-card border rounded-lg flex min-w-0 flex-col overflow-hidden ${expanded ? "eda-panel-expanded" : ""}`}
      // Ring the chart while its settings are open so the editor has a clear owner.
      data-settings-open={(settingsOpen && !expanded) || undefined}
      onPointerEnter={(event) =>
        event.currentTarget.setAttribute("data-shortcut-hovered", "")
      }
      onPointerLeave={(event) =>
        event.currentTarget.removeAttribute("data-shortcut-hovered")
      }
      style={{
        width: widthWithPadding,
        height: heightWithPadding,
        margin: expanded ? 0 : 6,
      }}
      role="region"
      {...axisFieldActions.handlers}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
    >
      <div className="eda-panel-header relative flex min-h-8 items-center justify-between gap-1 select-none py-0.5 pr-1 pl-2.5">
        <div className="drag-handle flex min-w-0 flex-[1_1_35%] cursor-move items-center gap-2">
          <GripVertical
            className="eda-drag absolute top-1/2 left-0 h-3 w-2.5 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          {isTraceable(settings.type) &&
          (settings.type !== "line" || settings.time) ? (
            <TraceTitle id={titleId} text={chartTitle} settings={settings} />
          ) : (
            <h3 id={titleId} className="min-w-0 truncate text-sm font-semibold">
              {chartTitle}
            </h3>
          )}
        </div>
        {/* Values under the pointer, beside the title and off the plot. */}
        <div
          ref={setReadoutTarget}
          className="eda-panel-readout"
          role="status"
        />
        {tableSearch && (
          <div
            className="eda-chart-search"
            role="group"
            aria-label={`Active table search in ${chartTitle}`}
          >
            <Search className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">{tableSearch}</span>
            <ActionTooltip content="Clear this table’s search">
              <button
                type="button"
                aria-label={`Clear search “${tableSearch}” in ${chartTitle}`}
                onClick={() => updateChart(settings.id, { globalSearch: "" })}
              >
                <X className="h-3 w-3" />
              </button>
            </ActionTooltip>
          </div>
        )}
        <div className="eda-panel-actions flex shrink-0 items-center gap-0">
          {isTableLike && <div ref={setToolbarTarget} />}
          {isTraceable(settings.type) &&
            (settings.type !== "line" || settings.time) && (
              <ChartTraceInspector type={settings.type} />
            )}
          {!expanded && canViewData && (
            <Popover open={dataOpen} onOpenChange={setDataOpen}>
              <ActionTooltip content="View data: preview the rows behind this chart (V)">
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`View data for ${chartTitle}`}
                  >
                    <Table2 className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
              </ActionTooltip>
              <PopoverContent
                aria-label={`Data for ${chartTitle}`}
                className="w-[min(36rem,calc(100vw-1.5rem))]"
                align="end"
              >
                <ChartDataPreview settings={settings} />
              </PopoverContent>
            </Popover>
          )}
          {!expanded && (
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Duplicate ${chartTitle}`}
              tooltip="Duplicate chart (D)"
              onClick={onDuplicate}
            >
              <Copy className="h-4 w-4" />
            </Button>
          )}
          <ActionTooltip
            content={
              expanded
                ? "Close details (Esc)"
                : "Open details: the chart beside its settings and data"
            }
          >
            <Button
              ref={expandRef}
              variant="ghost"
              size="icon"
              aria-label={`${expanded ? "Close" : "Open"} details for ${chartTitle}`}
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
          </ActionTooltip>
          {!expanded && (
            <Popover open={settingsOpen} onOpenChange={placeSettings}>
              <PopoverAnchor
                virtualRef={settingsAnchor as React.RefObject<HTMLElement>}
              />
              <ActionTooltip content="Chart settings (S)">
                <PopoverTrigger asChild>
                  <Button
                    ref={settingsRef}
                    variant="ghost"
                    size="icon"
                    aria-label={`Configure ${chartTitle}`}
                  >
                    <Settings2 className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
              </ActionTooltip>
              <PopoverContent
                aria-label={`Settings for ${chartTitle}`}
                className="eda-settings-popover w-[min(21.5rem,calc(100vw-1rem))]"
                style={
                  {
                    maxHeight: settingsHeight,
                    "--eda-settings-height": `${settingsHeight - 18}px`,
                    overflow: "hidden",
                  } as React.CSSProperties
                }
                side={settingsSide}
                sideOffset={
                  settingsSide === "right" || settingsSide === "left" ? -44 : 4
                }
                align="start"
                collisionPadding={12}
              >
                <ChartSettingsContent settings={settings} />
              </PopoverContent>
            </Popover>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="eda-panel-delete"
            aria-label={`Delete ${chartTitle}`}
            tooltip="Delete chart (X)"
            onClick={() => void handleDelete()}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        {hasFilter && (
          <ActionTooltip content="Clear this chart’s filters">
            <Button
              variant="ghost"
              size="icon"
              className="eda-chart-filter is-active"
              aria-label={`Clear filters for ${chartTitle}`}
              onClick={() => clearFilter(settings)}
            >
              <FilterX className="h-4 w-4" />
            </Button>
          </ActionTooltip>
        )}
      </div>
      {settings.type !== "scatter" && calculatedFields.length > 0 && (
        <div
          className="eda-calc-chart-fields"
          aria-label="Calculated chart fields"
        >
          {calculatedFields.map((field) => (
            <CalculatedFieldBadge key={field} field={field} showName />
          ))}
        </div>
      )}
      {localFilters.length > 0 && <LocalFilterStrip filters={localFilters} />}
      <p id={descriptionId} className="sr-only">
        {chartSummary}
      </p>
      {axisFieldActions.overlay}
      <ChartReadoutProvider value={readoutTarget}>
        <div className="eda-chart-content flex min-h-0 flex-1 flex-col">
          {autoLegendHeight > 0 && (
            <ChartColorLegend
              settings={settings}
              width={Math.max(1, panelWidth - 24)}
            />
          )}
          {settings.facet?.enabled &&
          (!aggregate || (settings.type === "bar" && settings.seriesField)) ? (
            <FacetContainer
              settings={settings}
              width={Math.max(1, panelWidth - 24)}
              height={Math.max(
                1,
                panelHeight -
                  58 -
                  headerExtra -
                  fieldStripHeight -
                  autoLegendHeight
              )}
            />
          ) : (
            <ChartRenderer
              settings={settings}
              toolbarTarget={isTableLike ? toolbarTarget : undefined}
              width={Math.max(1, panelWidth - 24)}
              height={Math.max(
                1,
                panelHeight -
                  58 -
                  headerExtra -
                  fieldStripHeight -
                  autoLegendHeight
              )}
            />
          )}
        </div>
      </ChartReadoutProvider>
    </div>
  );
  // Escape closes a nested editor first, and a tooltip must not swallow it.
  useEffect(() => {
    if (!expanded) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !hasNestedLayer(detailsRef.current)) {
        setExpandedState(false);
      }
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [expanded]);

  return (
    <ChartTraceScope>
      <Dialog open={expanded} onOpenChange={setExpanded}>
        {expanded ? (
          <DialogContent
            ref={detailsRef}
            showCloseButton={false}
            className="eda-details max-w-none w-auto border-0 bg-transparent p-0 shadow-none"
            onOpenAutoFocus={(event) => {
              event.preventDefault();
              detailsRef.current
                ?.querySelector<HTMLElement>(
                  ".eda-details-tabs [role='tab'][data-state='active']"
                )
                ?.focus({ preventScroll: true });
            }}
            onCloseAutoFocus={(event) => {
              event.preventDefault();
              requestAnimationFrame(() => expandRef.current?.focus());
            }}
          >
            <DialogTitle className="sr-only">{chartTitle}</DialogTitle>
            <DialogDescription className="sr-only">
              {chartSummary}
            </DialogDescription>
            <div
              className="eda-details-body"
              data-stacked={details.stacked || undefined}
            >
              {panel}
              <aside
                className="eda-details-side"
                aria-label={`Controls for ${chartTitle}`}
                style={details.side}
              >
                <Tabs
                  value={canViewData ? detailsTab : "settings"}
                  onValueChange={setDetailsTab}
                  className="eda-details-tabs"
                >
                  <TabsList className="w-full">
                    <TabsTrigger value="settings" className="flex-1">
                      Settings
                    </TabsTrigger>
                    {canViewData && (
                      <TabsTrigger value="data" className="flex-1">
                        Chart data
                      </TabsTrigger>
                    )}
                  </TabsList>
                  <TabsContent value="settings">
                    <ChartSettingsContent settings={settings} />
                  </TabsContent>
                  {canViewData && (
                    <TabsContent value="data">
                      <ChartDataPreview settings={settings} fill />
                    </TabsContent>
                  )}
                </Tabs>
              </aside>
            </div>
          </DialogContent>
        ) : (
          panel
        )}
      </Dialog>
    </ChartTraceScope>
  );
}
