import { useContext, useEffect, useId, useMemo, useRef, useState } from "react";
import { chartRegistry, useChartDefinition } from "@/charts/registry";
import { DataLayerContext } from "@/providers/DataLayerProvider";
import type { ChartSettings } from "@/types/ChartTypes";
import { mergeWithDefaultSettings } from "@/utils/defaultSettings";
import { useCreateCharts } from "@/hooks/useCreateCharts";
import { ChartRenderer } from "../charts/ChartRenderer";
import { ChartTraceInspector } from "../PlotChartPanel";
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
  const contentRef = useRef<HTMLDivElement>(null);

  const chartTypes = chartRegistry
    .getAll()
    .sort((a, b) => a.name.localeCompare(b.name));
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
            Choose a chart type and its fields. The preview uses the current
            filters. Nothing is added until you place it on the grid.
          </DialogDescription>
        </header>
        <div className="eda-add-chart-body">
          <div className="eda-add-chart-controls">
            <div
              className="eda-add-chart-types"
              role="group"
              aria-label="Chart type"
            >
              {chartTypes.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.type}
                    type="button"
                    aria-pressed={option.type === settings.type}
                    onClick={() => {
                      if (option.type === settings.type) return;
                      updateDraft(
                        buildChart(option.type, "", draft.target) as Omit<
                          ChartSettings,
                          "id"
                        >
                      );
                    }}
                  >
                    <Icon aria-hidden="true" />
                    <span>{option.name}</span>
                  </button>
                );
              })}
            </div>
            <section
              className="eda-add-chart-fields"
              aria-label={`${definition.name} fields`}
            >
              <h3>Fields</h3>
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
          </div>
          <section
            className="eda-add-chart-preview"
            aria-label={`Preview of the new ${definition.name}`}
          >
            <div ref={previewRef} className="eda-add-chart-canvas relative">
              {previewSize.width > 0 && previewSize.height > 0 && (
                <ChartTraceScope>
                  {settings.type === "metric-card" && (
                    <div className="absolute right-2 top-2 z-10">
                      <ChartTraceInspector type="metric-card" />
                    </div>
                  )}
                  <ChartRenderer
                    settings={preview}
                    width={previewSize.width}
                    height={previewSize.height}
                  />
                </ChartTraceScope>
              )}
            </div>
          </section>
        </div>
        <footer className="eda-add-chart-footer">
          <Button variant="ghost" onClick={api.cancel}>
            Cancel
          </Button>
          <Button onClick={api.startPlacing}>Add to grid</Button>
        </footer>
      </DialogContent>
    </Dialog>
  );
}
