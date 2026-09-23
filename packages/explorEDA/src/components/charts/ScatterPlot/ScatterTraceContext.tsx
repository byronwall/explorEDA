import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { ScatterPlan } from "./scatterPlan";
import type { ScatterTrace } from "./scatterTrace";
import type { planNumericalLegend } from "@/lib/colorScaleMath";

export type ScatterSelection = {
  kind:
    | "point"
    | "guide"
    | "legend"
    | "excluded"
    | "facet"
    | "title"
    | "overlay"
    | "badge";
  id: string;
  owner?: string;
  plan?: ScatterPlan;
  trace?: ScatterTrace;
  numericalPlan?: ReturnType<typeof planNumericalLegend>;
  inspect?: (selection: ScatterSelection) => void;
};

const Context = createContext<{
  selection: ScatterSelection | null;
  select: (selection: ScatterSelection | null) => void;
  plan: ScatterPlan | null;
  register: (
    owner: string,
    plan: ScatterPlan,
    inspect: (selection: ScatterSelection) => void
  ) => () => void;
  inspectFirst: (selection: ScatterSelection) => void;
  inspectVisibleRow: (id: number) => boolean;
  inspectRow: (id: number) => boolean;
  registerRowFallback: (find: (id: number) => boolean) => () => void;
} | null>(null);

export function ScatterTraceScope({ children }: { children: ReactNode }) {
  const [selection, select] = useState<ScatterSelection | null>(null);
  const [plan, setPlan] = useState<ScatterPlan | null>(null);
  const charts = useRef(
    new Map<
      string,
      { plan: ScatterPlan; inspect: (selection: ScatterSelection) => void }
    >()
  );
  const rowFallback = useRef<((id: number) => boolean) | null>(null);
  const register = useCallback(
    (
      owner: string,
      nextPlan: ScatterPlan,
      inspect: (selection: ScatterSelection) => void
    ) => {
      charts.current.set(owner, { plan: nextPlan, inspect });
      setPlan(charts.current.values().next().value?.plan ?? null);
      return () => {
        charts.current.delete(owner);
        setPlan(charts.current.values().next().value?.plan ?? null);
      };
    },
    []
  );
  const inspectFirst = useCallback((selection: ScatterSelection) => {
    charts.current.values().next().value?.inspect(selection);
  }, []);
  const inspectVisibleRow = useCallback((id: number) => {
    for (const { plan, inspect } of charts.current.values()) {
      const point = plan.points.find((item) => item.sourceId === id);
      if (point) {
        inspect({ kind: "point", id: point.id });
        return true;
      }
      if (plan.exclusions.some((item) => item.sourceId === id)) {
        inspect({ kind: "excluded", id: String(id) });
        return true;
      }
    }
    return false;
  }, []);
  const inspectRow = useCallback(
    (id: number) => inspectVisibleRow(id) || rowFallback.current?.(id) || false,
    [inspectVisibleRow]
  );
  const registerRowFallback = useCallback((find: (id: number) => boolean) => {
    rowFallback.current = find;
    return () => {
      if (rowFallback.current === find) rowFallback.current = null;
    };
  }, []);
  return (
    <Context.Provider
      value={{
        selection,
        select,
        plan,
        register,
        inspectFirst,
        inspectVisibleRow,
        inspectRow,
        registerRowFallback,
      }}
    >
      {children}
    </Context.Provider>
  );
}

export function useScatterTraceSelection() {
  return useContext(Context);
}
