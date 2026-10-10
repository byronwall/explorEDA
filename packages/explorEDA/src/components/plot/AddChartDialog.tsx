import { useContext, useEffect, useId, useMemo, useRef, useState } from "react";
import { HistogramIcon } from "@/components/charts/icons/ChartTypeIcons";
import { chartRegistry, useChartDefinition } from "@/charts/registry";
import { DataLayerContext, useDataLayer } from "@/providers/DataLayerProvider";
import type { ChartSettings } from "@/types/ChartTypes";
import { mergeWithDefaultSettings } from "@/utils/defaultSettings";
import { useCreateCharts } from "@/hooks/useCreateCharts";
import { ChartRenderer } from "../charts/ChartRenderer";
import { ChartTraceScope } from "../charts/trace/ChartTraceScope";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "../ui/dialog";
import { useChartDraft, type ChartDraftState } from "./ChartDraftContext";

interface PreviewStore {
  getState: () => {
    crossfilterWrapper: {
      charts: Map<string, unknown>;
      updateChart: (chart: ChartSettings) => void;
      removeChart: (chart: ChartSettings) => void;
      getAllData: () => unknown;
    };
  };
  setState: (state: { liveItems: unknown }) => void;
}

/**
 * Registers a temporary chart so the preview sees the current filters. It
 * never joins the chart list, so the saved layout does not change.
 */
function usePreviewChart(settings: Omit<ChartSettings, "id">) {
  const store = useContext(DataLayerContext) as PreviewStore;
  const previewId = `add-chart-preview-${useId()}`;
  const preview = useMemo(
    // The preview never filters other charts.
    () => ({ ...settings, id: previewId, filters: [] }) as ChartSettings,
    [previewId, settings]
  );
  useEffect(() => {
    const { crossfilterWrapper } = store.getState();
    crossfilterWrapper.updateChart(preview);
    store.setState({ liveItems: crossfilterWrapper.getAllData() });
  }, [preview, store]);
  useEffect(
    () => () => {
      const { crossfilterWrapper } = store.getState();
      if (!crossfilterWrapper.charts.has(previewId)) return;
      crossfilterWrapper.removeChart({ id: previewId } as ChartSettings);
      store.setState({ liveItems: crossfilterWrapper.getAllData() });
    },
    [previewId, store]
  );
  return preview;
}

function useElementSize() {
  // The dialog portal mounts after the first render, so observe via a
  // callback ref.
  const [element, setElement] = useState<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      setSize({
        width: Math.floor(entry.contentRect.width),
        height: Math.floor(entry.contentRect.height),
      });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [element]);
  return [setElement, size] as const;
}

/** Chart types grouped by the question they answer, in display order. */
const CHART_GROUPS: Array<{ label: string; keys: string[] }> = [
  { label: "Compare categories", keys: ["row", "bar", "pivot", "heatmap"] },
  { label: "Distribution", keys: ["histogram", "boxplot", "ecdf"] },
  {
    label: "Relationships",
    keys: ["scatter", "scatter-matrix", "3d-scatter", "parallel-coordinates"],
  },
  { label: "Over time", keys: ["line", "calendar"] },
  { label: "Flow and place", keys: ["sankey", "map"] },
  {
    label: "Tables and notes",
    keys: ["data-table", "summary", "metric-card", "markdown", "color-legend"],
  },
  { label: "Report graphics", keys: ["composition"] },
];

function groupChartTypes<T extends { key: string; name: string }>(
  options: T[]
) {
  const grouped = CHART_GROUPS.map(({ label, keys }) => ({
    label,
    options: keys.flatMap((key) =>
      options.filter((option) => option.key === key)
    ),
  }));
  const placed = new Set(CHART_GROUPS.flatMap(({ keys }) => keys));
  const other = options
    .filter((option) => !placed.has(option.key))
    .sort((a, b) => a.name.localeCompare(b.name));
  if (other.length) grouped.push({ label: "Other", options: other });
  return grouped.filter((group) => group.options.length);
}

export function AddChartDialog() {
  const api = useChartDraft();
  if (!api?.draft) return null;
  return <AddChartDialogContent api={api} draft={api.draft} />;
}

function AddChartDialogContent({
  api,
  draft,
}: {
  api: NonNullable<ReturnType<typeof useChartDraft>>;
  draft: ChartDraftState;
}) {
  const { buildChart } = useCreateCharts();
  const { settings } = draft;
  const { updateDraft } = api;
  const definition = useChartDefinition(settings.type);
  const preview = usePreviewChart(settings);
  const [previewRef, previewSize] = useElementSize();
  const [controlsTab, setControlsTab] = useState("types");
  const contentRef = useRef<HTMLDivElement>(null);
  const fieldsStepRef = useRef<HTMLButtonElement>(null);
  const contentId = useId().replace(/:/g, "");

  const chartTypes = chartRegistry.getAll().flatMap((definition) => {
    const option = { ...definition, key: definition.type };
    if (definition.type === "bar")
      return [
        option,
        { ...option, key: "histogram", name: "Histogram", icon: HistogramIcon },
      ];
    if (definition.type === "boxplot")
      return [{ ...option, name: "Distribution" }];
    return [option];
  });
  const chartGroups = groupChartTypes(chartTypes);
  const numericFields = useDataLayer((state) => state.fieldProfiles)
    .filter((field) => field.dataType === "numeric")
    .map((field) => field.name);
  const selectedType =
    preview.type === "bar" &&
    !preview.aggregateId &&
    !preview.seriesField &&
    !preview.forceString &&
    numericFields.includes(settings.field)
      ? "histogram"
      : settings.type;
  const SettingsPanel = definition.settingsPanel;

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) api.cancel();
      }}
    >
      <DialogContent
        ref={contentRef}
        className="eda-add-chart"
        onEscapeKeyDown={(event) => {
          // Escape in a field picker closes the picker, not the draft.
          const content = contentRef.current;
          const target = event.target as Node | null;
          if (content && target && !content.contains(target)) {
            event.preventDefault();
            // Returning focus to the picker's trigger dismisses the picker.
            content
              .querySelector<HTMLElement>('[aria-expanded="true"]')
              ?.focus();
          }
        }}
      >
        <header className="eda-add-chart-header">
          <DialogTitle>Add a chart</DialogTitle>
          <DialogDescription>
            The preview uses the current filters. Nothing is added until you
            place it on the grid.
          </DialogDescription>
        </header>
        <div className="eda-add-chart-body">
          <div className="eda-add-chart-controls">
            <div
              className="eda-add-chart-control-tabs"
              role="group"
              aria-label="Add chart steps"
            >
              <div className="eda-add-chart-control-switch">
                <button
                  type="button"
                  aria-pressed={controlsTab === "types"}
                  onClick={() => setControlsTab("types")}
                >
                  Chart type
                </button>
                <button
                  ref={fieldsStepRef}
                  type="button"
                  aria-pressed={controlsTab === "fields"}
                  onClick={() => setControlsTab("fields")}
                >
                  Fields
                </button>
              </div>
              {controlsTab === "types" && (
                <div className="eda-add-chart-types" aria-label="Chart type">
                  {chartGroups.map((group, index) => (
                    <div
                      key={group.label}
                      className="eda-add-chart-type-group"
                      role="group"
                      aria-labelledby={`${contentId}-group-${index}`}
                    >
                      <h3 id={`${contentId}-group-${index}`}>{group.label}</h3>
                      <div className="eda-add-chart-type-options">
                        {group.options.map((option) => {
                          const Icon = option.icon;
                          return (
                            <button
                              key={option.key}
                              type="button"
                              aria-pressed={option.key === selectedType}
                              disabled={
                                option.key === "histogram" &&
                                !numericFields.length
                              }
                              onClick={() => {
                                if (option.key !== selectedType) {
                                  const next = buildChart(
                                    option.type,
                                    "",
                                    draft.target
                                  );
                                  if (next.type === "bar") {
                                    next.forceString =
                                      option.key !== "histogram";
                                    if (option.key === "histogram")
                                      next.field = numericFields[0]!;
                                  }
                                  updateDraft(next);
                                }
                                setControlsTab("fields");
                                fieldsStepRef.current?.focus();
                              }}
                            >
                              <Icon aria-hidden="true" />
                              <span>{option.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {controlsTab === "fields" && (
                <section
                  className="eda-add-chart-fields"
                  aria-label={`${definition.name} fields`}
                >
                  <h3>{definition.name}</h3>
                  <SettingsPanel
                    settings={preview}
                    onSettingsChange={(updates) =>
                      updateDraft(
                        mergeWithDefaultSettings({
                          ...settings,
                          ...updates,
                          id: preview.id,
                          layout: settings.layout,
                        } as ChartSettings)
                      )
                    }
                  />
                </section>
              )}
            </div>
          </div>
          <section
            className="eda-add-chart-preview"
            aria-label={`Preview of the new ${definition.name}`}
          >
            <div ref={previewRef} className="eda-add-chart-canvas">
              {previewSize.width > 0 && previewSize.height > 0 && (
                // The preview is not on the grid yet, so it has no trace
                // control.
                <ChartTraceScope>
                  <ChartRenderer
                    settings={preview}
                    onSettingsChange={
                      preview.type === "map"
                        ? (updates) =>
                            updateDraft({
                              ...settings,
                              ...updates,
                              layout: settings.layout,
                            } as Omit<ChartSettings, "id">)
                        : undefined
                    }
                    width={previewSize.width}
                    height={previewSize.height}
                  />
                </ChartTraceScope>
              )}
            </div>
          </section>
        </div>
        <footer className="eda-add-chart-footer">
          <p className="eda-add-chart-selected">
            Selected:{" "}
            <b>
              {chartTypes.find((option) => option.key === selectedType)?.name}
            </b>
          </p>
          <Button variant="ghost" onClick={api.cancel}>
            Cancel
          </Button>
          <Button onClick={api.startPlacing}>Add to grid</Button>
        </footer>
      </DialogContent>
    </Dialog>
  );
}
