import { registerAllCharts } from "@/charts/registerAllCharts";
import { ChartSettingsContent } from "@/components/ChartSettingsContent";
import { ChartRenderer } from "@/components/charts/ChartRenderer";
import { resolveThemeId } from "@/lib/themes";
import {
  DataLayerProvider,
  type DatumObject,
  useDataLayer,
} from "@/providers/DataLayerProvider";
import type { SavedDataStructure } from "@/types/SavedDataStructure";
import { useEffect, useRef, useState } from "react";

registerAllCharts();

function useWidth() {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) =>
      setWidth(Math.floor(entry?.contentRect.width ?? 0))
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return [ref, width] as const;
}

function Surface({ chartId, height }: { chartId: string; height: number }) {
  const settings = useDataLayer((state) =>
    state.charts.find((chart) => chart.id === chartId)
  );
  const themeId = resolveThemeId(useDataLayer((state) => state.theme));
  const [plotRef, width] = useWidth();
  if (!settings) {
    return null;
  }
  return (
    <div
      className="eda-workspace grid w-full min-w-0 gap-4 md:grid-cols-[minmax(0,1fr)_22rem]"
      data-eda-theme={themeId}
      data-chart-id={chartId}
    >
      <div
        ref={plotRef}
        className="min-w-0 rounded-lg border border-border bg-card p-3"
        data-docs-surface-plot
      >
        <p className="mb-2 font-semibold">{settings.title}</p>
        {width > 0 && (
          <ChartRenderer settings={settings} width={width} height={height} />
        )}
      </div>
      <div
        className="min-w-0 rounded-lg border border-border bg-popover p-3"
        data-docs-surface="settings"
      >
        <ChartSettingsContent settings={settings} />
      </div>
    </div>
  );
}

/**
 * One chart beside its real settings panel, sharing one data layer, so an
 * edit in the panel redraws the chart. For the docs site only.
 */
export function ChartSettingsSurface({
  data,
  savedData,
  chartId,
  height = 280,
}: {
  data: DatumObject[];
  savedData: SavedDataStructure;
  chartId: string;
  height?: number;
}) {
  return (
    <DataLayerProvider data={data} savedData={savedData}>
      <Surface chartId={chartId} height={height} />
    </DataLayerProvider>
  );
}
