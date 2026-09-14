import { useDataLayer } from "@/providers/DataLayerProvider";
import { FacetAxisProvider } from "@/providers/FacetAxisProvider";
import { ChartSettings } from "@/types/ChartTypes";
import {
  Copy,
  FilterX,
  GripVertical,
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
import { useId } from "react";
import { getChartFields, getChartSummary } from "./charts/chartAccessibility";
import { dataTableDefinition } from "./charts/DataTable/definition";

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
  const clearFilter = useDataLayer((state) => state.clearFilter);
  const addChart = useDataLayer((state) => state.addChart);
  const showAlert = useAlertStore((state) => state.showAlert);
  const titleId = useId();
  const descriptionId = useId();
  const chartSummary = getChartSummary(settings);
  const isGraphical = ![
    "data-table",
    "pivot",
    "summary",
    "markdown",
    "color-legend",
  ].includes(settings.type);
  const isTableLike = ["data-table", "pivot", "summary"].includes(
    settings.type
  );
  const dataFields = getChartFields(settings);

  const handleViewData = () => {
    if (dataFields.length === 0) {
      return;
    }
    const dataTable = dataTableDefinition.createDefaultSettings({
      ...settings.layout,
      y: settings.layout.y + settings.layout.h,
    });
    dataTable.title = `${settings.title} data`;
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
  const widthWithPadding = width - 8;
  const heightWithPadding = height - 8;

  return (
    <div
      className="bg-card border rounded-lg m-1 flex min-w-0 flex-col overflow-hidden"
      style={{ width: widthWithPadding, height: heightWithPadding }}
      role="region"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
    >
      <div className="flex min-h-9 items-center justify-between gap-1 select-none px-2 py-1">
        <div className="drag-handle flex min-w-0 flex-1 cursor-move items-center gap-2">
          <GripVertical
            className="h-4 w-4 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
          <h3
            id={titleId}
            className="min-w-0 truncate font-medium"
            title={settings.title}
          >
            {settings.title}
          </h3>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onDuplicate}
            aria-label={`Duplicate ${settings.title}`}
            title="Duplicate chart"
          >
            <Copy className="h-4 w-4" />
          </Button>
          {!isTableLike && dataFields.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleViewData}
              aria-label={`View data for ${settings.title}`}
              title="View chart data"
            >
              <Table2 className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => clearFilter(settings)}
            aria-label={`Clear filters for ${settings.title}`}
            title="Clear chart filters"
          >
            <FilterX className="h-4 w-4" />
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Configure ${settings.title}`}
                title="Chart settings"
              >
                <Settings2 className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="min-w-120" side="left" align="start">
              <ChartSettingsContent settings={settings} />
            </PopoverContent>
          </Popover>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            aria-label={`Delete ${settings.title}`}
            title="Delete chart"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <p id={descriptionId} className="sr-only">
        {chartSummary}
      </p>
      <div
        className="min-h-0 flex-1"
        aria-hidden={isGraphical ? true : undefined}
      >
        <FacetAxisProvider>
          {settings.facet?.enabled ? (
            <FacetContainer
              settings={settings}
              width={width - 32}
              height={height - 48}
            />
          ) : (
            <ChartRenderer
              settings={settings}
              width={width - 32}
              height={height - 48}
            />
          )}
        </FacetAxisProvider>
      </div>
    </div>
  );
}
