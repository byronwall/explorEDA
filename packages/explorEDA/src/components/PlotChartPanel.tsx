import { CalculatedFieldBadge } from "./calculations/CalculatedFieldBadge";
import { isActiveFilter } from "./ActiveFilterStatus";
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
  MoreHorizontal,
  Maximize2,
  Minimize2,
  Settings2,
  Table2,
  X,
} from "lucide-react";
import { ChartRenderer } from "./charts/ChartRenderer";
import { ChartColorLegend } from "./charts/ColorLegend/ChartColorLegend";
import { ChartTraceControl } from "./charts/ChartTraceControl";
import {
  ScatterTraceScope,
  useScatterTraceSelection,
} from "./charts/ScatterPlot/ScatterTraceContext";
import { ScatterTracePanel } from "./charts/ScatterPlot/ScatterTracePanel";
import { BarTracePanel } from "./charts/BarChart/BarTracePanel";
import {
  BarTraceScope,
  useBarTraceSelection,
} from "./charts/BarChart/BarTraceContext";
import { FacetContainer } from "./charts/FacetRelated/FacetContainer";
import { ChartSettingsContent } from "./ChartSettingsContent";
import { Button } from "./ui/button";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import { useAlertStore } from "@/stores/alertStore";
import { useEffect, useId, useRef, useState } from "react";
import {
  getChartFields,
  getChartSummary,
  getChartTitle,
} from "./charts/chartAccessibility";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface PlotChartPanelProps {
  settings: ChartSettings;
  onDelete: () => void;
  onDuplicate: () => void;
  width: number;
  height: number;
}

function ScatterTraceControl() {
  const trace = useScatterTraceSelection();
  useEffect(() => {
    if (
      trace?.selection?.kind === "facet" &&
      trace.selection.plan !== trace.plan
    ) {
      trace.select(null);
    }
  }, [trace?.selection, trace?.plan, trace?.select]);
  if (!trace) return null;
  return (
    <ChartTraceControl
      selection={trace.selection}
      onClear={() => trace.select(null)}
      heading="Scatter trace"
      emptyText="Alt-click a point, axis object, or color label to trace it. Normal clicks keep chart interactions. You can also find a source row below."
      ariaLabel="Scatter trace inspector"
    >
      <ScatterTracePanel
        plan={trace?.selection?.plan ?? trace?.plan ?? undefined}
        trace={trace?.selection?.trace}
        onFindRow={trace?.inspectRow}
        onSelect={(selection) => {
          if (trace?.selection?.inspect) trace.selection.inspect(selection);
          else trace?.inspectFirst(selection);
        }}
      />
    </ChartTraceControl>
  );
}

function ScatterTraceTitle({ id, text }: { id: string; text: string }) {
  const trace = useScatterTraceSelection();
  const inspect = () => trace?.inspectFirst({ kind: "title", id: "title" });
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

function BarTraceControl() {
  const trace = useBarTraceSelection();
  if (!trace) return null;
  return (
    <ChartTraceControl
      selection={trace.selection}
      onClear={() => trace.select(null)}
      heading="Bar trace"
      emptyText="Alt-click a bar, axis object, or zero baseline to trace it. Normal clicks keep chart interactions. You can also find a source row below."
      ariaLabel="Bar trace inspector"
    >
      <BarTracePanel
        selection={trace.selection}
        onFindRow={trace.inspectRow}
        guides={trace.guides}
        onSelect={(selection) =>
          trace.select({ ...selection, owner: trace.selection?.owner })
        }
      />
    </ChartTraceControl>
  );
}

function BarTraceTitle({ id, text }: { id: string; text: string }) {
  const trace = useBarTraceSelection();
  const inspect = () => trace?.inspectTitle();
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

export function PlotChartPanel({
  settings,
  onDelete,
  onDuplicate,
  width,
  height,
}: PlotChartPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const [dataOpen, setDataOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLButtonElement>(null);
  const settingsAnchor = useRef<HTMLElement | null>(null);
  const actionsRef = useRef<HTMLButtonElement>(null);
  const previewAfterMenu = useRef(false);
  const expandRef = useRef<HTMLButtonElement>(null);
  const [settingsSide, setSettingsSide] = useState<
    "left" | "right" | "top" | "bottom"
  >("right");
  const [settingsHeight, setSettingsHeight] = useState(460);
  const placeSettings = (open: boolean) => {
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
  };
  const [toolbarTarget, setToolbarTarget] = useState<HTMLDivElement | null>(
    null
  );
  const clearFilter = useDataLayer((state) => state.clearFilter);
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
          [aggregate.groupField, aggregate.measureField].filter(
            (field): field is string => Boolean(field)
          )
        )
      )
    : getChartFields(settings);
  const calculations = useDataLayer((state) => state.calculations);
  const calculatedFields = ["data-table", "summary"].includes(settings.type)
    ? []
    : dataFields.filter((field) =>
        calculations.some((calc) => calc.resultColumnName === field)
      );
  const fieldStripHeight =
    settings.type !== "scatter" && calculatedFields.length ? 28 : 0;
  const autoLegendHeight =
    settings.colorField && settings.colorScaleId ? 36 : 0;

  const handleDelete = async () => {
    const confirmed = await showAlert(
      "Delete Chart",
      "Are you sure you want to delete this chart? This action cannot be undone."
    );
    if (confirmed) {
      onDelete();
    }
  };

  // shrink the panel by 8px on each side to account for the border
  const panelWidth = expanded ? window.innerWidth - 40 : width;
  const panelHeight = expanded ? window.innerHeight - 40 : height;
  const widthWithPadding = panelWidth - 12;
  const heightWithPadding = panelHeight - 12;

  const panel = (
    <div
      ref={panelRef}
      className={`eda-panel bg-card border rounded-lg flex min-w-0 flex-col overflow-hidden ${expanded ? "eda-panel-expanded" : ""}`}
      style={{
        width: widthWithPadding,
        height: heightWithPadding,
        margin: expanded ? 0 : 6,
      }}
      role="region"
      onKeyDown={(event) => {
        // A tooltip can consume Escape. Nested portalled editors close first.
        if (
          expanded &&
          event.key === "Escape" &&
          event.currentTarget.contains(event.target as Node)
        ) {
          setExpanded(false);
        }
      }}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
    >
      <div className="eda-panel-header flex min-h-10 items-center justify-between gap-1 select-none px-3 py-1">
        <div className="drag-handle flex min-w-0 flex-1 cursor-move items-center gap-2">
          <GripVertical
            className="eda-drag h-3 w-3 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
          {settings.type === "scatter" ? (
            <ScatterTraceTitle id={titleId} text={chartTitle} />
          ) : settings.type === "bar" ? (
            <BarTraceTitle id={titleId} text={chartTitle} />
          ) : (
            <h3 id={titleId} className="min-w-0 truncate text-sm font-semibold">
              {chartTitle}
            </h3>
          )}
        </div>
        {settings.filters.some(isActiveFilter) && (
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
        <div className="eda-panel-actions flex shrink-0 items-center gap-0">
          {isTableLike && <div ref={setToolbarTarget} />}
          {settings.type === "scatter" && <ScatterTraceControl />}
          {settings.type === "bar" && <BarTraceControl />}
          <ActionTooltip
            content={expanded ? "Close expanded chart" : "Expand chart"}
          >
            <Button
              ref={expandRef}
              variant="ghost"
              size="icon"
              aria-label={`${expanded ? "Restore" : "Expand"} ${chartTitle}`}
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
          </ActionTooltip>
          <Popover open={dataOpen} onOpenChange={setDataOpen}>
            <DropdownMenu modal={false}>
              <PopoverAnchor asChild>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    ref={actionsRef}
                    aria-label={`More actions for ${chartTitle}`}
                    tooltip="More chart actions"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
              </PopoverAnchor>
              <DropdownMenuContent
                align="end"
                onCloseAutoFocus={(event) => {
                  if (previewAfterMenu.current) {
                    event.preventDefault();
                    previewAfterMenu.current = false;
                    setDataOpen(true);
                  }
                }}
              >
                <DropdownMenuItem
                  onSelect={handleDelete}
                  className="text-destructive"
                >
                  <X />
                  Delete chart
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={onDuplicate}
                  aria-label={`Duplicate ${chartTitle}`}
                >
                  <Copy />
                  Duplicate chart
                </DropdownMenuItem>
                {!isTableLike && dataFields.length > 0 && (
                  <DropdownMenuItem
                    onSelect={() => {
                      previewAfterMenu.current = true;
                    }}
                    aria-label={`View data for ${chartTitle}`}
                  >
                    <Table2 />
                    View chart data
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onSelect={() => clearFilter(settings)}
                  aria-label={`Clear filters for ${chartTitle}`}
                >
                  <FilterX />
                  Clear chart filters
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <PopoverContent
              onCloseAutoFocus={(event) => {
                event.preventDefault();
                actionsRef.current?.focus();
              }}
              aria-label={`Data for ${chartTitle}`}
              className="w-[min(36rem,calc(100vw-1.5rem))]"
              align="end"
            >
              <ChartDataPreview settings={settings} />
            </PopoverContent>
          </Popover>
          <Popover onOpenChange={placeSettings}>
            <PopoverAnchor
              virtualRef={settingsAnchor as React.RefObject<HTMLElement>}
            />
            <ActionTooltip content="Chart settings">
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
              className="eda-settings-popover w-[min(21rem,calc(100vw-1.5rem))]"
              style={
                {
                  maxHeight: settingsHeight,
                  "--eda-settings-height": `${settingsHeight - 26}px`,
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
        </div>
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
      <p id={descriptionId} className="sr-only">
        {chartSummary}
      </p>
      <div className="eda-chart-content flex min-h-0 flex-1 flex-col">
        {autoLegendHeight > 0 && (
          <ChartColorLegend
            settings={settings}
            width={Math.max(1, panelWidth - 24)}
          />
        )}
        {settings.facet?.enabled && !aggregate ? (
          <FacetContainer
            settings={settings}
            width={Math.max(1, panelWidth - 24)}
            height={Math.max(
              1,
              panelHeight - 58 - fieldStripHeight - autoLegendHeight
            )}
          />
        ) : (
          <ChartRenderer
            settings={settings}
            toolbarTarget={isTableLike ? toolbarTarget : undefined}
            width={Math.max(1, panelWidth - 24)}
            height={Math.max(
              1,
              panelHeight - 58 - fieldStripHeight - autoLegendHeight
            )}
          />
        )}
      </div>
    </div>
  );
  return (
    <ScatterTraceScope>
      <BarTraceScope>
      <Dialog open={expanded} onOpenChange={setExpanded}>
        {expanded ? (
          <DialogContent
            showCloseButton={false}
            className="max-w-none w-auto border-0 bg-transparent p-0 shadow-none"
            onCloseAutoFocus={(event) => {
              event.preventDefault();
              requestAnimationFrame(() => expandRef.current?.focus());
            }}
          >
            <DialogTitle className="sr-only">{chartTitle}</DialogTitle>
            <DialogDescription className="sr-only">
              {chartSummary}
            </DialogDescription>
            {panel}
          </DialogContent>
        ) : (
          panel
        )}
      </Dialog>
      </BarTraceScope>
    </ScatterTraceScope>
  );
}
