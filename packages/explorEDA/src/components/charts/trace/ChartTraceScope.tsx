import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useDataLayer } from "@/providers/DataLayerProvider";
import type { ChartSettings } from "@/types/ChartTypes";
import type {
  ChartTrace,
  TraceSelection,
  TraceSource,
  TraceTarget,
} from "./traceTypes";

interface TraceApi {
  register: (owner: string, source: TraceSource) => () => void;
  inspect: (owner: string, kind: string, id: string) => boolean;
  inspectChart: (kind: string, id: string) => boolean;
  findVisibleRow: (id: number) => boolean;
  findRow: (id: number) => boolean;
  clear: () => void;
}

interface TraceState {
  selection: TraceSelection | null;
  trace: ChartTrace | undefined;
  targets: (TraceTarget & { owner: string })[];
  legendItems: TraceSource["legendItems"];
  version: number;
}

const ApiContext = createContext<TraceApi | null>(null);
const StateContext = createContext<TraceState | null>(null);

/**
 * One inspector for a chart panel. The chart, its facets, its legend and its
 * title register as sources. A selection keeps only an owner, a kind, an id
 * and the revision it was made under; its trace is resolved from the owner's
 * current plan on every render.
 */
export function ChartTraceScope({ children }: { children: ReactNode }) {
  const sources = useRef(new Map<string, TraceSource>());
  const [version, setVersion] = useState(0);
  const [selection, setSelection] = useState<TraceSelection | null>(null);

  const register = useCallback((owner: string, source: TraceSource) => {
    sources.current.set(owner, source);
    setVersion((value) => value + 1);
    return () => {
      if (sources.current.get(owner) !== source) return;
      sources.current.delete(owner);
      setVersion((value) => value + 1);
    };
  }, []);

  const inspect = useCallback((owner: string, kind: string, id: string) => {
    const source = sources.current.get(owner);
    if (!source?.resolve(kind, id)) return false;
    setSelection({ owner, kind, id, revision: source.revision });
    return true;
  }, []);

  const chartOwner = () =>
    [...sources.current].find(([, source]) => source.role === "chart")?.[0];

  const inspectChart = useCallback((kind: string, id: string) => {
    const owner = chartOwner();
    return owner ? inspect(owner, kind, id) : false;
  }, [inspect]);

  const findVisibleRow = useCallback(
    (id: number) => {
      for (const [owner, source] of sources.current) {
        if (source.role !== "chart") continue;
        const found = source.findRow?.(id);
        if (found && found !== "pending" && inspect(owner, found.kind, found.id))
          return true;
      }
      return false;
    },
    [inspect]
  );

  const findRow = useCallback(
    (id: number) => {
      if (findVisibleRow(id)) return true;
      for (const source of sources.current.values()) {
        if (source.role !== "chart" && source.findRow?.(id) === "pending")
          return true;
      }
      return false;
    },
    [findVisibleRow]
  );

  const clear = useCallback(() => setSelection(null), []);

  const api = useMemo(
    () => ({ register, inspect, inspectChart, findVisibleRow, findRow, clear }),
    [register, inspect, inspectChart, findVisibleRow, findRow, clear]
  );

  const owner = selection && sources.current.get(selection.owner);
  const trace =
    selection && owner && owner.revision === selection.revision
      ? owner.resolve(selection.kind, selection.id)
      : undefined;
  const stale = Boolean(selection && !trace);
  useEffect(() => {
    // One rule for every chart: a selection whose revision changed, or whose
    // object is no longer drawn, closes rather than showing an old trace.
    if (stale) setSelection(null);
  }, [stale, version]);

  const chart = [...sources.current.values()].find(
    (source) => source.role === "chart"
  );
  const state = useMemo(
    () => ({
      selection: stale ? null : selection,
      trace,
      targets: [...sources.current]
        .filter(([, source], index, all) =>
          source.role === "chart"
            ? all.findIndex(([, item]) => item.role === "chart") === index
            : true
        )
        .flatMap(([owner, source]) =>
          (source.targets?.() ?? []).map((target) => ({ ...target, owner }))
        ),
      legendItems: chart?.legendItems,
      version,
    }),
    // The source map is a ref; version records each change to it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selection, stale, trace, version]
  );

  return (
    <ApiContext.Provider value={api}>
      <StateContext.Provider value={state}>{children}</StateContext.Provider>
    </ApiContext.Provider>
  );
}

export function useChartTraceApi() {
  return useContext(ApiContext);
}

export function useChartTrace() {
  return useContext(StateContext);
}

/** Registers a trace source while the component is mounted. */
export function useTraceSource(owner: string, source: TraceSource | null) {
  const api = useChartTraceApi();
  const register = api?.register;
  useEffect(() => {
    if (!source) return;
    return register?.(owner, source);
  }, [owner, register, source]);
}

/** The data revision every trace source uses: data edits and this chart's rows. */
export function useTraceRevision(settings: ChartSettings) {
  const nonce = useDataLayer((state) => state.nonce);
  const liveNonce = useDataLayer(
    (state) => state.liveItems[settings.id]?.nonce ?? 0
  );
  return `${nonce}:${liveNonce}`;
}
