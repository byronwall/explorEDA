import { chartRegistry } from "@/charts/registry";
import { registerHint } from "./imports";
import { allRegistered, typeLoading, typeStatus } from "./typeLoading";
import { ChartEditableContext } from "@/components/charts/chartEditable";
import { getChartFields } from "@/components/charts/chartAccessibility";
import {
  DataLayerProvider,
  type DatumObject,
} from "@/providers/DataLayerProvider";
import type { ChartSettings } from "@/types/ChartTypes";
import type { SavedDataStructure } from "@/types/SavedDataStructure";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  shortConfig,
  sortedText,
  textToSavedData,
  toSavedData,
  type ChartConfig,
} from "./config";

export interface StandaloneProps {
  /** The rows to draw, one object per row. */
  data: DatumObject[];
  /**
   * The chart type and any settings that differ from its defaults, or one
   * chart's Dashboard text, such as `"scatter x=Price y=Rating"`.
   */
  config: ChartConfig | string;
  /**
   * Called with the short config after each edit: the type, its main field,
   * and the settings that differ from defaults. Passing it turns editing
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

/** When a person last clicked, typed, or changed a control on the page. */
let lastInput = -Infinity;
if (typeof window !== "undefined") {
  for (const type of ["pointerdown", "click", "keydown", "input", "change"]) {
    window.addEventListener(type, () => (lastInput = performance.now()), {
      capture: true,
      passive: true,
    });
  }
}

/**
 * An edit follows a person's input. A change with no input just before it
 * is the chart settling, such as a default it fills in after mounting.
 */
function recentInput() {
  return performance.now() - lastInput < 1500;
}

/** What to add when a page draws a type it never registered. */
function unregistered(type: string): ReactNode {
  const hint = registerHint(type);
  return hint ? (
    <>
      The {type} chart isn&apos;t registered. Add:
      <code className="eda-standalone-error-code">{hint}</code>
    </>
  ) : (
    `"${type}" isn't a chart type.`
  );
}

/**
 * Loads the chart types a config needs, when `exploreda/chart` loads them on
 * demand: its own type, or every type for Dashboard text, which can name
 * any. False until they arrive.
 */
function useTypesReady(config: ChartConfig | string) {
  const need =
    typeof config === "string"
      ? typeLoading.loadAll && !allRegistered()
        ? "all"
        : undefined
      : typeStatus(config.type) === "loading"
        ? config.type
        : undefined;
  const [, setArrived] = useState(0);
  useEffect(() => {
    if (!need) return;
    let live = true;
    const done = () => live && setArrived((count) => count + 1);
    const loading =
      need === "all" ? typeLoading.loadAll!() : typeLoading.load!(need);
    loading.then(done, done);
    return () => {
      live = false;
    };
  }, [need]);
  return !need;
}

/** Rows with only the offered fields and the fields the chart uses. */
function useOfferedRows(
  data: DatumObject[],
  chart: ChartSettings | undefined,
  fields: string[] | undefined
) {
  const used = chart ? getChartFields(chart) : [];
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
  fallback = null,
  children,
}: StandaloneProps & {
  chartId: string;
  /** Shown while this config's chart types load. */
  fallback?: ReactNode;
  children: ReactNode;
}) {
  const ready = useTypesReady(config);
  // A restore from `config` happens when it changes, or when the host
  // declines an edit by not passing it back.
  const [declined, setDeclined] = useState(0);
  const { savedData, error } = useMemo(
    () =>
      typeof config === "string"
        ? textToSavedData(config, data, chartId)
        : chartRegistry.has(config.type)
          ? { savedData: toSavedData(config, chartId), error: undefined }
          : {
              savedData: { ...toSavedData(config, chartId), charts: [] },
              error: unregistered(config.type),
            },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      config,
      chartId,
      declined,
      ready,
      typeof config === "string" ? data : undefined,
    ]
  );
  const shown = savedData.charts[0] as ChartSettings | undefined;
  const rows = useOfferedRows(data, shown, fields);

  // The config the chart shows, as text. Read in render so an edit's echo
  // is recognized as soon as the host passes it back.
  const current = useRef("");
  current.current = shown ? sortedText(shortConfig(shown)) : "";
  // States the chart reached on its own for this config, such as a line
  // chart filling in its series colors. They are not edits.
  const settled = useRef({ config: "", states: new Set<string>() });
  if (settled.current.config !== current.current) {
    settled.current = { config: current.current, states: new Set() };
  }
  const onChange = useRef(onConfigChange);
  onChange.current = onConfigChange;

  const onStateChange = (state: SavedDataStructure) => {
    const chart = state.charts[0];
    if (!chart || !onChange.current) return;
    const next = shortConfig(chart as ChartSettings);
    const text = sortedText(next);
    if (text === current.current || settled.current.states.has(text)) return;
    if (!recentInput()) {
      settled.current.states.add(text);
      return;
    }
    onChange.current(next);
    // Controlled: unless the host passed the edit back, show `config`.
    setTimeout(() => {
      if (current.current !== text) setDeclined((n) => n + 1);
    });
  };

  if (!ready) return fallback;
  if (error) {
    return (
      <div className="eda-standalone eda-standalone-error" role="alert">
        {error}
      </div>
    );
  }

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
