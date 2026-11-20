import { ChartEditableContext } from "@/components/charts/chartEditable";
import { getChartFields } from "@/components/charts/chartAccessibility";
import {
  DataLayerProvider,
  type DatumObject,
} from "@/providers/DataLayerProvider";
import type { ChartSettings } from "@/types/ChartTypes";
import type { SavedDataStructure } from "@/types/SavedDataStructure";
import { useMemo, useRef, useState, type ReactNode } from "react";
import {
  toChartConfig,
  toChartSettings,
  toSavedData,
  type ChartConfig,
} from "./config";

export interface StandaloneProps {
  /** The rows to draw, one object per row. */
  data: DatumObject[];
  /** The chart type and any settings that differ from its defaults. */
  config: ChartConfig;
  /**
   * Called with the whole config after each edit. Passing it turns editing
   * on. The chart is controlled: an edit shows only once the host passes the
   * new config back as `config`.
   */
  onConfigChange?: (config: ChartConfig) => void;
  /**
   * The fields that settings offer. Fields the config already uses stay
   * available. Without it, settings offer every field in `data`.
   */
  fields?: string[];
}

/** The settings the host sees: the chart's, without what `Chart` manages. */
function hostConfig(chart: ChartSettings): ChartConfig {
  const { colorScaleId: _scale, ...config } = toChartConfig(chart) as {
    colorScaleId?: string;
  } & ChartConfig;
  return config as ChartConfig;
}

/** JSON with object keys sorted, so equal settings give equal text. */
function sortedText(value: unknown) {
  return JSON.stringify(value, (_key, item: unknown) =>
    item && typeof item === "object" && !Array.isArray(item)
      ? Object.fromEntries(
          Object.entries(item).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
        )
      : item
  );
}

/** Rows with only the offered fields and the fields the chart uses. */
function useOfferedRows(
  data: DatumObject[],
  config: ChartConfig,
  fields: string[] | undefined
) {
  const used = getChartFields(toChartSettings(config, "fields"));
  const keep = fields ? [...new Set([...fields, ...used])] : undefined;
  // Field lists arrive as new arrays on each render; key on their content.
  const key = keep?.join("\u0000");
  return useMemo(
    () =>
      key === undefined
        ? data
        : data.map((row) =>
            Object.fromEntries(key.split("\u0000").map((f) => [f, row[f]]))
          ),
    [data, key]
  );
}

/**
 * One chart's own data layer, kept in step with a controlled config. Each
 * standalone chart and settings panel has one, so nothing filters across
 * charts and clicks select nothing.
 */
export function StandaloneProvider({
  data,
  config,
  onConfigChange,
  fields,
  chartId,
  children,
}: StandaloneProps & { chartId: string; children: ReactNode }) {
  // A restore from `config` happens when it changes, or when the host
  // declines an edit by not passing it back.
  const [declined, setDeclined] = useState(0);
  const savedData = useMemo(
    () => toSavedData(config, chartId),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [config, chartId, declined]
  );
  const rows = useOfferedRows(data, config, fields);

  // The config the chart shows, as text. Read in render so an edit's echo
  // is recognized as soon as the host passes it back.
  const current = useRef("");
  current.current = sortedText(
    hostConfig(savedData.charts[0] as ChartSettings)
  );
  const onChange = useRef(onConfigChange);
  onChange.current = onConfigChange;

  const onStateChange = (state: SavedDataStructure) => {
    const chart = state.charts[0];
    if (!chart || !onChange.current) return;
    const next = hostConfig(chart as ChartSettings);
    const text = sortedText(next);
    // Picking a color scale or filling defaults is not an edit.
    if (text === current.current) return;
    onChange.current(next);
    // Controlled: unless the host passed the edit back, show `config`.
    setTimeout(() => {
      if (current.current !== text) setDeclined((n) => n + 1);
    });
  };

  return (
    <DataLayerProvider
      data={rows}
      savedData={savedData}
      selections={false}
      onStateChange={onConfigChange ? onStateChange : undefined}
    >
      <ChartEditableContext.Provider value={Boolean(onConfigChange)}>
        {children}
      </ChartEditableContext.Provider>
    </DataLayerProvider>
  );
}
