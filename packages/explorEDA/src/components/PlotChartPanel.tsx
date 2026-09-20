import { CalculatedFieldBadge } from "./calculations/CalculatedFieldBadge";
import { createPortal } from "react-dom";
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
import { FacetContainer } from "./charts/FacetRelated/FacetContainer";
import { ChartSettingsContent } from "./ChartSettingsContent";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { useAlertStore } from "@/stores/alertStore";
import { useId, useState } from "react";
import {
  getChartFields,
  getChartSummary,
  getChartTitle,
} from "./charts/chartAccessibility";
import { dataTableDefinition } from "./charts/DataTable/definition";
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

export function PlotChartPanel({
  settings,
  onDelete,
  onDuplicate,
  width,
  height,
}: PlotChartPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const [toolbarTarget, setToolbarTarget] = useState<HTMLDivElement | null>(
    null
  );
  const clearFilter = useDataLayer((state) => state.clearFilter);
  const addChart = useDataLayer((state) => state.addChart);
  const showAlert = useAlertStore((state) => state.showAlert);
  const titleId = useId();
  const descriptionId = useId();
  const chartTitle = getChartTitle(settings);
  const chartSummary = getChartSummary(settings);
  const isTableLike = ["data-table", "pivot", "summary"].includes(
    settings.type
  );
  const dataFields = getChartFields(settings);
  const calculations = useDataLayer((state) => state.calculations);
  const calculatedFields = ["data-table", "summary"].includes(settings.type)
    ? []
    : dataFields.filter((field) =>
        calculations.some((calc) => calc.resultColumnName === field)
      );
  const fieldStripHeight = calculatedFields.length ? 28 : 0;

  const handleViewData = () => {
    if (dataFields.length === 0) {
      return;
    }
    const dataTable = dataTableDefinition.createDefaultSettings({
      ...settings.layout,
      y: settings.layout.y + settings.layout.h,
    });
    dataTable.title = `${chartTitle} data`;
    dataTable.columns = dataFields.map((field) => ({ id: field, field }));
    dataTable.filters = settings.filters.filter((filter) =>
      dataFields.includes(filter.field)
    );
    addChart(dataTable);
  };

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
      className={`eda-panel bg-card border rounded-lg flex min-w-0 flex-col overflow-hidden ${expanded ? "eda-panel-expanded" : ""}`}
      style={{
        width: widthWithPadding,
        height: heightWithPadding,
        margin: expanded ? 0 : 6,
      }}
      onKeyDown={(event) => {
        if (
          event.key === "Escape" &&
          expanded &&
          !event.defaultPrevented &&
          event.currentTarget.contains(event.target as Node)
        ) {
          setExpanded(false);
        }
      }}
      role="region"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
    >
      <div className="eda-panel-header flex min-h-10 items-center justify-between gap-1 select-none px-3 py-1">
        <div className="drag-handle flex min-w-0 flex-1 cursor-move items-center gap-2">
          <GripVertical
            className="eda-drag h-3 w-3 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
          <h3
            id={titleId}
            className="min-w-0 truncate text-sm font-semibold"
            title={chartTitle}
          >
            {chartTitle}
          </h3>
        </div>
        <div className="eda-panel-actions flex shrink-0 items-center gap-0">
          {isTableLike && <div ref={setToolbarTarget} />}
          <Button
            variant="ghost"
            size="icon"
            aria-label={`${expanded ? "Restore" : "Expand"} ${chartTitle}`}
            title={expanded ? "Restore size" : "Expand chart"}
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`More actions for ${chartTitle}`}
                title="More chart actions"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
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
                  onSelect={handleViewData}
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
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Configure ${chartTitle}`}
                title="Chart settings"
              >
                <Settings2 className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="eda-settings-popover w-[min(30rem,calc(100vw-1rem))] max-w-[calc(100vw-1rem)]"
              style={{
                maxHeight: "var(--radix-popover-content-available-height)",
                overflow: "hidden",
              }}
              side="bottom"
              align="end"
              collisionPadding={8}
            >
              <ChartSettingsContent settings={settings} />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      {calculatedFields.length > 0 && (
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
      <div className="eda-chart-content min-h-0 flex-1">
        {settings.facet?.enabled ? (
          <FacetContainer
            settings={settings}
            width={Math.max(1, panelWidth - 24)}
            height={Math.max(1, panelHeight - 58 - fieldStripHeight)}
          />
        ) : (
          <ChartRenderer
            settings={settings}
            toolbarTarget={isTableLike ? toolbarTarget : undefined}
            width={Math.max(1, panelWidth - 24)}
            height={Math.max(1, panelHeight - 58 - fieldStripHeight)}
          />
        )}
      </div>
    </div>
  );
  return expanded ? createPortal(panel, document.body) : panel;
}
